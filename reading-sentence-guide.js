(function(root){
 'use strict';
 const roles={subject:'주어',verb:'동사',object:'목적어',complement:'보어',modifier:'수식어',connector:'연결어',clause:'절'};
 const el=(tag,className,text)=>{const n=root.document.createElement(tag);if(className)n.className=className;if(text!=null)n.textContent=text;return n;};
 // Local vector drawings stay sharp at any screen size; sentence text remains plain text.
 function icon(kind){
  const doc=root.document;if(!doc.createElementNS)return null;
  const paths={book:'M4 5h6a4 4 0 0 1 4 3v14a5 5 0 0 0-4-2H4zM24 5h-6a4 4 0 0 0-4 3v14a5 5 0 0 1 4-2h6z',
   subject:'M14 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10M5 25v-3a9 9 0 0 1 18 0v3',
   verb:'M16 3 6 16h7l-1 10 11-14h-8z',object:'M25 14a11 11 0 1 1-22 0 11 11 0 0 1 22 0M19 14a5 5 0 1 1-10 0 5 5 0 0 1 10 0',
   complement:'M5 8h7v12H5zM18 8h7v12h-7zM12 14h6',modifier:'M4 8h20M4 20h20M10 4v8M19 16v8',
   connector:'m12 17 5-5M10 19l-2 2a5 5 0 0 1-7-7l5-5a5 5 0 0 1 7 0M18 9l2-2a5 5 0 0 1 7 7l-5 5a5 5 0 0 1-7 0',
   clause:'M8 4H4v20h4M20 4h4v20h-4M10 10h8M10 17h8',grammar:'M4 6h20v16H4zM9 11h10M9 17h6',vocab:'M5 4h18v20H5zM9 10h10M9 15h10M9 20h6',translation:'M4 7h20v14H12l-6 4v-4H4zM9 12h10M9 16h6'};
  const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 30 30');svg.setAttribute('class','sentence-guide-icon');svg.setAttribute('aria-hidden','true');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.6');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');
  const path=doc.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',paths[kind]||paths.clause);svg.append(path);return svg;
 }
 function valid(row,sentence){
  return row?.sentence===sentence&&Array.isArray(row.chunks)&&row.chunks.length>0&&row.chunks.every(c=>typeof c.text==='string'&&roles[c.role]&&typeof c.label==='string')&&row.chunks.map(c=>c.text).join('')===sentence
   &&row.grammar?.length>0&&row.grammar.every(g=>g.title&&g.explanation)&&row.vocabulary?.length>0&&row.vocabulary.every(v=>v.word&&v.meaning&&v.pos);
 }
 function mount(host,passage,options={}){
  if(!host)return;host.replaceChildren();
  const rows=root.EnglishReadingSentenceNotes?.[passage.id]||[];
  const shell=el('details','sentence-guide'),summary=el('summary','sentence-guide-title');const book=icon('book');if(book)summary.append(book);summary.append(el('span','','문장별 독해 해설지'),el('span','sentence-guide-count',`${passage.sentences.length}문장`));shell.append(summary);
  const intro=el('p','sentence-guide-intro','문장을 먼저 읽고, 궁금한 문장을 펼쳐 보세요.');
  const toolbar=el('div','sentence-guide-toolbar'),expand=el('button','sentence-guide-expand','모든 문장 펼치기');expand.type='button';toolbar.append(expand);const tools=el('div','sentence-guide-tools');tools.append(intro,toolbar);shell.append(tools);
  const items=[];
  const opened=()=>options.onOpen?.();
  shell.addEventListener('toggle',()=>{if(shell.open)opened();});
  passage.sentences.forEach((sentence,index)=>{
   const detail=el('details','sentence-guide-item');detail.dataset.sentence=String(index+1);
   const heading=el('summary','sentence-guide-heading');heading.append(el('span','sentence-guide-number',String(index+1).padStart(2,'0')),el('span','sentence-guide-original',sentence));detail.append(heading);
   const body=el('div','sentence-guide-body'),row=rows[index];
   const section=(title)=>{const kind=({'①':'structure','②':'grammar','③':'vocab','④':'translation'})[title[0]],box=el('section','sentence-guide-section section-'+kind),label=el('h4','',title),art=icon(kind==='structure'?'clause':kind);if(art)label.append(art);box.append(label);body.append(box);return box;};
   if(valid(row,sentence)){
    const structure=section('① 구조'),diagram=el('div','sentence-guide-structure');diagram.setAttribute('aria-label','문장 성분 분석');
    row.chunks.forEach((chunk,i)=>{if(!chunk.text.trim()){diagram.append(root.document.createTextNode(chunk.text));return;}if(i)diagram.append(el('span','sentence-guide-arrow','→'));
     const part=el('span','sentence-guide-chunk role-'+chunk.role),art=icon(chunk.role);if(art)part.append(art);part.append(el('small','sentence-guide-role',chunk.label||roles[chunk.role]),el('span','sentence-guide-phrase',chunk.text));diagram.append(part);
    });structure.append(diagram);
    const grammar=section('② 핵심 문법');row.grammar.forEach(g=>{const note=el('article','sentence-guide-grammar-note');note.append(el('strong','',g.title),el('p','',g.explanation));grammar.append(note);});
    const vocab=section('③ 어휘'),list=el('dl','sentence-guide-vocabulary');row.vocabulary.forEach(v=>{const card=el('div','sentence-guide-word'),term=el('dt','');term.append(el('span','sentence-guide-word-text',v.word),el('span','sentence-guide-pos',v.pos));card.append(term,el('dd','',v.meaning));list.append(card);});vocab.append(list);
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
