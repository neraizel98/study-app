(function(root){
 'use strict';
 // Parent-side OMR scoring of a printed round: photo -> OmrReader -> parent confirms the marks ->
 // MockExam.paperResult (the online submission shape) -> MockPublication.savePaperResult.
 // The confirmation is a transcription step only: no correct answer or correctness is shown.
 const app=root.SmartStudy=root.SmartStudy||{},MAX_SIDE=2000,MARKS=['①','②','③','④','⑤','⑥','⑦','⑧'];
 const REASONS={blank:'표시 없음',multiple:'두 개 이상 표시',faint:'흐리게 표시'};
 const el=(tag,className,text)=>{const node=root.document.createElement(tag);if(className)node.className=className;if(text!=null)node.textContent=text;return node;};
 const button=(text,className)=>{const b=el('button',className,text);b.type='button';return b;};
 function message(code,attemptNo){
  if(code==='no-card')return '답안지 네 모서리의 검은 사각형이 모두 보이게 다시 찍어 주세요';
  if(code==='blurry')return '사진이 흐려요. 밝은 곳에서 흔들리지 않게 다시 찍어 주세요';
  if(code==='wrong-card')return `다른 회차(또는 다른 주)의 답안지예요. ${attemptNo}회차 답안지를 찍어 주세요`;
  if(code==='no-reader')return '답안지 판독 기능을 불러오지 못했어요. 새로고침한 뒤 다시 시도해 주세요';
  if(code==='image')return '사진을 열지 못했어요. 다른 사진으로 다시 시도해 주세요';
  return '답안지를 읽지 못했어요. 답안지 전체가 보이게 다시 찍어 주세요';
 }
 // Printed numbering from mock-paper.js (the layout the card was printed and is read with).
 function numbering(items){
  return root.MockPaper.areas(items||[]).flatMap(area=>area.questions.map(q=>({area:area.id,number:q.no,itemIndex:(items||[]).indexOf(q.item)})));
 }
 // EXIF orientation is applied by createImageBitmap; the <img> fallback applies it in current browsers too.
 async function loadImage(file){
  let source=null;
  try{if(root.createImageBitmap)source=await root.createImageBitmap(file,{imageOrientation:'from-image'});}catch(_){source=null;}
  if(!source)source=await new Promise((resolve,reject)=>{const url=root.URL.createObjectURL(file),img=new root.Image();
   img.onload=()=>{root.URL.revokeObjectURL(url);resolve(img);};img.onerror=()=>{root.URL.revokeObjectURL(url);reject(new Error('image'));};img.src=url;});
  const width=source.naturalWidth||source.width,height=source.naturalHeight||source.height;if(!width||!height)throw new Error('image');
  const scale=Math.min(1,MAX_SIDE/Math.max(width,height)),w=Math.max(1,Math.round(width*scale)),h=Math.max(1,Math.round(height*scale));
  const canvas=root.document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(source,0,0,w,h);try{source.close?.();}catch(_){/* An <img> has nothing to release. */}
  const pixels=ctx.getImageData(0,0,w,h);return {width:w,height:h,data:pixels.data};
 }
 async function read(image,set){
  if(!root.OmrReader?.read)return {ok:false,error:'no-reader'};
  let result;try{result=await root.OmrReader.read(image,set,{});}catch(_){return {ok:false,error:'unreadable'};}
  if(!result?.ok)return {ok:false,error:result?.error||'unreadable'};
  if(result.attemptNo!=null&&Number(result.attemptNo)!==Number(set.attemptNo))return {ok:false,error:'wrong-card'};
  return result;
 }
 // One row per printed item. A choice read cleanly starts selected; anything else waits for the parent.
 function rowsFor(set,result){
  const answers=new Map((result?.answers||[]).map(a=>[Number(a.itemIndex),a])),crops=new Map((result?.writtenCrops||[]).map(c=>[Number(c.itemIndex),c]));
  return numbering(set.items).map(place=>{
   const item=set.items[place.itemIndex],read=answers.get(place.itemIndex),written=item.kind==='written',count=(item.choices||[]).length;
   const n=Number(read?.choice),clean=!written&&read?.status==='ok'&&Number.isInteger(n)&&n>=1&&n<=count;
   return {...place,area:read?.area||place.area,number:Number(read?.number)||place.number,item,written,status:read?.status||'blank',crop:crops.get(place.itemIndex)?.rgba||null,
    value:clean?String(item.choices[n-1]):undefined,resolved:clean,uncertain:!written&&!clean};
  });
 }
 function cropCanvas(rgba){
  const canvas=el('canvas','omr-crop');canvas.width=rgba.width;canvas.height=rgba.height;canvas.setAttribute('aria-label','아이가 쓴 답 사진');
  try{const ctx=canvas.getContext('2d'),img=ctx.createImageData(rgba.width,rgba.height);img.data.set(rgba.data);ctx.putImageData(img,0,0);}catch(_){/* The typed answer still works without the picture. */}
  return canvas;
 }
 function mount(user,payload,options={}){
  const panel=el('div','omr-review'),trigger=button('OMR 사진으로 채점','mock-publish omr-trigger'),input=el('input','omr-file');
  input.type='file';input.accept='image/*';input.setAttribute('capture','environment');input.hidden=true;
  const set=app.MockPaperAdmin.paperSet(payload),n=set.attemptNo;let busy=false;
  const say=(text,error)=>{const p=el('p',`omr-message${error?' mock-admin-error':''}`,text);return p;};
  function retake(){input.value='';input.click?.();}
  function fail(code){const retry=button('다시 찍기','omr-retake');retry.onclick=retake;panel.replaceChildren(say(message(code,n),true),retry);}
  input.onchange=async()=>{
   const file=input.files?.[0];if(!file||busy)return;busy=true;trigger.disabled=true;panel.replaceChildren(say('답안지를 읽는 중이에요...'));
   let result;try{result=await read(await loadImage(file),set);}catch(_){result={ok:false,error:'image'};}
   busy=false;trigger.disabled=false;
   if(result.ok)review(rowsFor(set,result));else fail(result.error);
  };
  function review(rows){
   const pending=el('p','omr-pending'),save=button('채점하고 저장','mock-publish omr-save'),again=button('다시 찍기','omr-retake'),note=el('p','omr-message');
   const refresh=()=>{const left=rows.filter(r=>!r.resolved).length;pending.textContent=left?`노란 칸 ${left}문항을 확인해 주세요.`:'모든 문항을 확인했어요.';save.disabled=busy||left>0;};
   panel.replaceChildren(el('h4','omr-title',`${n}회차 답안 확인`),el('p','omr-sub','사진에서 읽은 답이에요. 노란 칸은 직접 골라 주세요. 단답형은 아이가 쓴 그대로 적어 주세요.'),pending);
   for(const area of root.MockPaper.AREAS){const own=rows.filter(r=>r.area===area.id);if(!own.length)continue;
    const box=el('section','omr-area'),grid=el('div','omr-grid');box.append(el('h5',null,`${area.period}교시 ${area.name} · ${own.length}문항`),grid);
    for(const row of own){
     const line=el('div',`omr-item${row.written?' is-written':''}${row.resolved?'':' is-uncertain'}`),head=el('div','omr-item-head');line.setAttribute('data-item',String(row.itemIndex));head.append(el('strong','omr-no',String(row.number)));
     if(!row.resolved&&!row.written)head.append(el('small','omr-reason',REASONS[row.status]||'확인 필요'));line.append(head);
     const mark=()=>{line.className=`omr-item${row.written?' is-written':''}${row.resolved?'':' is-uncertain'}${row.uncertain?' was-uncertain':''}`;};mark();
     if(row.written){
      if(row.crop)line.append(cropCanvas(row.crop));
      const text=el('input','omr-text'),none=button('무응답','omr-none');text.type='text';text.maxLength=2000;text.autocomplete='off';text.placeholder='아이가 쓴 답';text.setAttribute('aria-label',`${area.name} ${row.number}번 단답형 답`);
      none.setAttribute('aria-pressed','false');
      let blank=false;
      text.oninput=()=>{row.value=String(text.value||'').trim();if(row.value)blank=false;none.setAttribute('aria-pressed',String(blank));row.resolved=row.value!==''||blank;mark();refresh();};
      none.onclick=()=>{blank=true;text.value='';row.value='';row.resolved=true;none.setAttribute('aria-pressed','true');mark();refresh();};
      const field=el('div','omr-write');field.append(text,none);line.append(field);
     }else{
      const marks=el('div','omr-marks'),choices=[...row.item.choices.map((c,i)=>[MARKS[i]||String(i+1),String(c)]),['무응답','']];
      const buttons=choices.map(([label,value])=>{const b=button(label,value===''?'omr-none':'omr-mark');b.setAttribute('aria-pressed',String(row.resolved&&row.value===value));
       b.setAttribute('aria-label',`${area.name} ${row.number}번 ${label}`);b.onclick=()=>{row.value=value;row.resolved=true;for(const x of buttons)x.setAttribute('aria-pressed',String(x===b));mark();refresh();};return b;});
      marks.append(...buttons);line.append(marks);
     }
     grid.append(line);
    }
    panel.append(box);
   }
   again.onclick=retake;
   save.onclick=async()=>{
    if(busy||rows.some(r=>!r.resolved))return;busy=true;refresh();again.disabled=true;note.className='omr-message';note.textContent='채점해서 저장하는 중이에요...';
    try{
     const responses=Object.fromEntries(rows.map(r=>[r.item.id,r.value||'']));
     const result=app.MockExam.paperResult(payload,responses,Date.now());
     await app.MockPublication.savePaperResult(user,result);
     const notice=`${n}회차 종이 시험을 채점해 저장했습니다. 결과를 확인한 뒤 학습자에게 공개해 주세요.`;
     if(options.onSaved)await options.onSaved(notice);else{panel.replaceChildren(say(notice));}
    }catch(error){busy=false;again.disabled=false;note.className='omr-message mock-admin-error';note.textContent=app.MockPaperAdmin?.errorText?.(error)||error?.message||String(error);refresh();}
   };
   const actions=el('div','omr-actions');actions.append(again,save);panel.append(actions,note);refresh();
  }
  trigger.onclick=()=>{if(!busy)retake();};
  return {trigger,input,panel};
 }
 app.MockPaperOmr={mount,loadImage,read,rowsFor,numbering,message,MAX_SIDE};
})(typeof window!=='undefined'?window:globalThis);
