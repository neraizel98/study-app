/* Display-only lexical supplement; deliberately independent from grading. */
(function(root){
    'use strict';
    function node(tag,cls,value){const el=document.createElement(tag);if(cls)el.className=cls;if(value!==undefined)el.textContent=value;return el;}
    function speaker(text){const b=node('button','vocab-visual-speak');b.type='button';b.title='발음 듣기';b.setAttribute('aria-label',text+' 미국 영어 발음 듣기');b.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9Zm12-2q5 5 0 10m0-7q2 2 0 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';b.addEventListener('click',()=>root.EnglishSpeech?.speak(text,'us'));return b;}
    function render(host,entry){
        if(!host)return;host.replaceChildren();const row=root.VocabularyRelations?.get(entry);host.hidden=!row;if(!row)return;
        const existing=new Set((entry.phrasalVerbs||[]).map(v=>v.phrase.trim().toLowerCase()));
        const expressions=row.expressions.filter(v=>!existing.has(v.phrase.trim().toLowerCase()));
        if(!row.synonyms.length&&!row.antonyms.length&&!expressions.length){host.hidden=true;return;}
        host.append(node('h3','','함께 익히는 단어·표현'));
        if(row.synonyms.length||row.antonyms.length){
            host.append(node('p','vocab-connections-note','뜻과 문맥에 따라 쓰임이 달라요. 항상 바꾸어 쓸 수 있는 것은 아니에요.'));
            const grid=node('div','vocab-connections-grid');
            for(const [key,title] of [['synonyms','유의어'],['antonyms','반의어']]){
                if(!row[key].length)continue;const section=node('section','vocab-relation-group '+key);section.append(node('h4','',title));const list=node('ul');
                row[key].forEach(v=>{const item=node('li','vocab-relation-item');const content=node('div');content.append(node('strong','',v.word),node('span','vocab-relation-meaning',v.meaning));if(v.note)content.append(node('p','vocab-relation-note',v.note));item.append(content,speaker(v.word));list.append(item);});section.append(list);grid.append(section);
            }host.append(grid);
        }
        if(expressions.length){
            const details=node('details','vocab-expression-list');details.append(node('summary','',`관용구·숙어 ${expressions.length}개`));
            const labels={'idiom':'관용구','phrasal verb':'구동사','fixed phrase':'고정 표현','collocation':'자주 쓰는 조합'};
            expressions.forEach(v=>{const card=node('article','vocab-expression');const heading=node('div','vocab-expression-heading');heading.append(node('span','vocab-expression-kind',labels[v.kind]||v.kind),speaker(v.phrase));card.append(heading,node('h4','',v.phrase),node('p','vocab-expression-meaning',v.meaning));if(v.note)card.append(node('p','vocab-relation-note',v.note));const example=node('div','vocab-expression-example');const line=node('div');line.append(node('p','',v.ex),speaker(v.ex));example.append(line,node('p','vocab-relation-note',v.exKo));card.append(example);details.append(card);});host.append(details);
        }
    }
    root.VocabularyConnections=Object.freeze({render});
})(window);
