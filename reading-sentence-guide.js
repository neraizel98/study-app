(function(root){
 'use strict';
 const roles={subject:'주어',verb:'동사',object:'목적어',complement:'보어',modifier:'수식어',connector:'연결어',clause:'절'};
 const el=(tag,className,text)=>{const n=root.document.createElement(tag);if(className)n.className=className;if(text!=null)n.textContent=text;return n;};
 function valid(row,sentence){
  return row?.sentence===sentence&&Array.isArray(row.chunks)&&row.chunks.length>0&&row.chunks.every(c=>typeof c.text==='string'&&roles[c.role]&&typeof c.label==='string')&&row.chunks.map(c=>c.text).join('')===sentence
   &&row.grammar?.length>0&&row.grammar.every(g=>g.title&&g.explanation)&&row.vocabulary?.length>0&&row.vocabulary.every(v=>v.word&&v.meaning&&v.pos);
 }
 function mount(host,passage,options={}){
  if(!host)return;host.replaceChildren();
  const rows=root.EnglishReadingSentenceNotes?.[passage.id]||[];
  const shell=el('details','sentence-guide'),summary=el('summary','sentence-guide-title','문장별 독해 해설지');shell.append(summary);
  const intro=el('p','sentence-guide-intro','문장을 먼저 읽고, 궁금한 문장을 펼쳐 보세요.');shell.append(intro);
  const toolbar=el('div','sentence-guide-toolbar'),expand=el('button','sentence-guide-expand','모든 문장 펼치기');expand.type='button';toolbar.append(expand);shell.append(toolbar);
  const items=[];
  const opened=()=>options.onOpen?.();
  shell.addEventListener('toggle',()=>{if(shell.open)opened();});
  passage.sentences.forEach((sentence,index)=>{
   const detail=el('details','sentence-guide-item');detail.dataset.sentence=String(index+1);
   const heading=el('summary','sentence-guide-heading');heading.append(el('span','sentence-guide-number',String(index+1)),el('span','sentence-guide-original',sentence));detail.append(heading);
   const body=el('div','sentence-guide-body'),row=rows[index];
   const section=(title)=>{const box=el('section','sentence-guide-section');box.append(el('h4','',title));body.append(box);return box;};
   if(valid(row,sentence)){
    const structure=section('① 구조'),diagram=el('div','sentence-guide-structure');diagram.setAttribute('aria-label','문장 성분 분석');
    row.chunks.forEach((chunk,i)=>{if(!chunk.text.trim()){diagram.append(root.document.createTextNode(chunk.text));return;}if(i)diagram.append(el('span','sentence-guide-arrow','→'));
     const part=el('span','sentence-guide-chunk role-'+chunk.role);part.append(el('small','sentence-guide-role',chunk.label||roles[chunk.role]),el('span','sentence-guide-phrase',chunk.text));diagram.append(part);
    });structure.append(diagram);
    const grammar=section('② 핵심 문법');row.grammar.forEach(g=>{const p=el('p','');p.append(el('strong','',g.title+' · '),root.document.createTextNode(g.explanation));grammar.append(p);});
    const vocab=section('③ 어휘'),list=el('dl','sentence-guide-vocabulary');row.vocabulary.forEach(v=>{list.append(el('dt','',v.word+' · '+v.pos),el('dd','',v.meaning));});vocab.append(list);
   }else{
    const pending=el('p','sentence-guide-unavailable','이 문장의 구조·문법·어휘 해설을 불러오지 못했어요. 새로고침해 주세요.');body.append(pending);
   }
   const translation=section('④ 기존 해석');translation.append(el('p','sentence-guide-translation',passage.translations?.[index]||''));
   detail.append(body);detail.addEventListener('toggle',()=>{if(detail.open)opened();refresh();});shell.append(detail);items.push(detail);
  });
  function refresh(){const all=items.length>0&&items.every(item=>item.open);expand.textContent=all?'모든 문장 접기':'모든 문장 펼치기';expand.setAttribute('aria-expanded',String(all));}
  expand.onclick=()=>{const open=!items.every(item=>item.open);items.forEach(item=>{item.open=open;});if(open)opened();refresh();};
  refresh();host.append(shell);
 }
 root.ReadingSentenceGuide={mount,valid,roles};
})(typeof window!=='undefined'?window:globalThis);
