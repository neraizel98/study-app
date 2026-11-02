/* Authored supplemental diagrams. No quiz, progress, or vocabulary-pool writes. */
(function (root) {
    'use strict';
    const themes = [
        { id: 'plant', title: 'Parts of a Plant · 식물의 부분', triggers: ['plant','flower','leaf','stem','root','petal'],
          words: [['flower','꽃',245,72],['leaf','잎',305,158],['stem','줄기',245,220],['root','뿌리',250,317],['petal','꽃잎',210,62]],
          example: ['Roots take in water from the soil.', '뿌리는 흙에서 물을 흡수한다.'],
          drawing: '<path d="M95 270H395" stroke="#cbbd9f"/><path d="M245 270V105"/><path d="M245 185Q275 123 326 141Q311 189 245 185Z" fill="#dcebdc"/><path d="M245 222Q180 219 164 178Q221 166 245 222Z" fill="#dcebdc"/><path d="M245 270V343M245 290L210 323M245 309L279 341M245 274L275 300M245 303L223 350"/><g fill="#f2e4c8"><ellipse cx="245" cy="56" rx="17" ry="28"/><ellipse cx="217" cy="75" rx="28" ry="17"/><ellipse cx="272" cy="75" rx="28" ry="17"/><ellipse cx="245" cy="97" rx="17" ry="25"/></g><circle cx="245" cy="76" r="14" fill="#d9bc77"/>' },
        { id: 'body', title: 'Parts of the Body · 몸의 부분', triggers: ['body','head','arm','hand','leg','foot'],
          words: [['head','머리',245,60],['arm','팔',300,153],['hand','손',330,204],['leg','다리',270,278],['foot','발',213,343]],
          example: ['The thumb is part of the hand.', '엄지는 손의 일부다.'],
          drawing: '<circle cx="245" cy="62" r="32" fill="#f2e4c8"/><path d="M221 99H269L290 209H200Z" fill="#dcebdc"/><path d="M215 112L181 195L174 215M275 112L317 190L330 207M220 211L213 327L199 343H225M268 211L277 328L291 343H266" stroke-width="15" stroke-linecap="round"/><ellipse cx="330" cy="211" rx="9" ry="12" fill="#f2e4c8"/><ellipse cx="174" cy="219" rx="9" ry="12" fill="#f2e4c8"/>' },
        { id: 'face', title: 'Parts of the Face · 얼굴의 부분', triggers: ['face','eye','ear','nose','mouth','hair'],
          words: [['eye','눈',211,147],['ear','귀',326,173],['nose','코',245,187],['mouth','입',245,237],['hair','머리카락',245,68]],
          example: ['We use our ears to hear sounds.', '우리는 귀로 소리를 듣는다.'],
          drawing: '<ellipse cx="160" cy="178" rx="17" ry="30" fill="#f2e4c8"/><ellipse cx="329" cy="178" rx="17" ry="30" fill="#f2e4c8"/><ellipse cx="245" cy="184" rx="80" ry="113" fill="#fbf4e5"/><path d="M165 139Q151 37 246 50Q340 42 324 139L299 103L262 117L217 99Z" fill="#52685f"/><path d="M198 146Q211 134 225 146M265 146Q279 134 292 146M245 163L237 196H251M217 235Q244 253 272 235" stroke-linecap="round"/>' },
        { id: 'house', title: 'Parts of a House · 집의 부분', triggers: ['house','roof','window','door','wall','chimney'],
          words: [['roof','지붕',245,108],['window','창문',196,222],['door','문',275,281],['wall','벽',327,263],['chimney','굴뚝',293,75]],
          example: ['A chimney carries smoke out of a building.', '굴뚝은 건물 밖으로 연기를 내보낸다.'],
          drawing: '<path d="M280 113V55H307V132" fill="#f2e4c8"/><path d="M153 159H338V331H153Z" fill="#fbf4e5"/><path d="M125 161L245 63L367 161Z" fill="#dcebdc"/><path d="M174 192H220V245H174Z" fill="#dcebdc"/><path d="M197 192V245M174 219H220"/><path d="M251 249H300V331H251Z" fill="#f2e4c8"/><circle cx="288" cy="292" r="3"/>' },
        { id: 'bicycle', title: 'Parts of a Bicycle · 자전거의 부분', triggers: ['bicycle','bike','wheel','pedal','saddle','handlebar','handlebars','chain'],
          words: [['wheel','바퀴',147,266],['pedal','페달',241,279],['saddle','안장',214,141],['handlebar','핸들',307,116],['chain','체인',200,268]],
          example: ['A bicycle usually has two wheels.', '자전거에는 보통 바퀴가 두 개 있다.'],
          drawing: '<circle cx="145" cy="254" r="64" fill="#fbf4e5"/><circle cx="345" cy="254" r="64" fill="#fbf4e5"/><path d="M145 254L207 178L235 254H145L198 158M207 178H308L235 254M345 254L300 137L310 116H333M198 142H231" stroke-width="6"/><path d="M198 142H231" stroke-width="13" stroke-linecap="round"/><circle cx="235" cy="254" r="18" fill="#dcebdc"/><path d="M235 254L246 280H260M235 254L224 229H211M145 263L231 273M145 244L231 235"/>' }
    ];
    function find(word) { const key = String(word || '').trim().toLowerCase(); return themes.find(t => t.triggers.includes(key)) || null; }
    function node(tag, cls, value) { const el = document.createElement(tag); if (cls) el.className = cls; if (value !== undefined) el.textContent = value; return el; }
    function render(host, word) {
        if (!host) return;
        host.replaceChildren(); const theme = find(word); host.hidden = !theme;
        if (!theme) return;
        const heading = node('h3', 'vocab-visual-title', theme.title); host.append(heading);
        const layout = node('div', 'vocab-visual-layout');
        const figure = node('div', 'vocab-visual-figure');
        // SVG markup is exclusively static authored data, never vocabulary or user input.
        const labels = ({plant:[[390,42],[398,136],[75,214],[394,339],[70,62]],body:[[385,40],[390,135],[392,218],[382,288],[80,344]],face:[[75,132],[402,174],[74,206],[395,266],[75,45]],house:[[80,80],[75,210],[390,315],[398,250],[398,50]],bicycle:[[60,340],[285,350],[78,85],[405,75],[80,200]]})[theme.id];
        const marks = theme.words.map((w,i) => { const [x,y] = labels[i]; return `<path d="M${x} ${y}L${w[2]} ${w[3]}" stroke-width="1.8"/><circle cx="${w[2]}" cy="${w[3]}" r="3" fill="#247957"/><circle cx="${x}" cy="${y}" r="16" fill="#fff"/><text x="${x}" y="${y+5}" text-anchor="middle" fill="#193b30" stroke="none" font-size="16" font-weight="700">${i+1}</text>`; }).join('');
        figure.innerHTML = `<svg viewBox="0 0 480 380" role="img" aria-label="${theme.title}"><g fill="none" stroke="#426858" stroke-width="3" stroke-linejoin="round">${theme.drawing}${marks}</g></svg>`;
        const list = node('ol','vocab-visual-legend'); list.setAttribute('aria-label','번호별 영어 단어와 뜻');
        theme.words.forEach(([en,ko],i) => { const item = node('li', 'vocab-visual-word');
            item.append(node('span','vocab-visual-number',String(i+1)));
            const text = node('div'); text.append(node('strong','',en),node('span','vocab-visual-meaning',ko)); item.append(text);
            const button = node('button','vocab-visual-speak'); button.type='button'; button.setAttribute('aria-label',`${en} 미국 영어 발음 듣기`); button.title='발음 듣기';
            button.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9Zm12-2q5 5 0 10m0-7q2 2 0 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            button.addEventListener('click',()=>root.EnglishSpeech?.speak(en,'us')); item.append(button); list.append(item);
        });
        layout.append(figure,list); host.append(layout);
        const activity=node('div','vocab-visual-activity'); activity.append(node('strong','', '[활용]'),node('p','vocab-visual-example',theme.example[0]),node('p','vocab-visual-translation',theme.example[1])); host.append(activity);
    }
    root.VocabularyVisual = Object.freeze({ find, render });
})(window);
