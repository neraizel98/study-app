/* Authored supplemental diagrams. No quiz, progress, or vocabulary-pool writes. */
(function (root) {
    'use strict';
    const themes = [
        { id: 'plant', title: 'Parts of a Plant · 식물의 부분', triggers: ['plant','flower','leaf','stem','root','petal'],
          words: [['flower','꽃',235,78],['leaf','잎',289,157],['stem','줄기',236,176],['root','뿌리',242,259],['petal','꽃잎',213,66]],
          example: ['Roots take in water from the soil.', '뿌리는 흙에서 물을 흡수한다.'],
          asset: 'assets/vocabulary/plant-v1.webp' },
        { id: 'body', title: 'Parts of the Body · 몸의 부분', triggers: ['body','head','arm','hand','leg','foot'],
          words: [['head','머리',240,69],['arm','팔',286,160],['hand','손',297,193],['leg','다리',261,257],['foot','발',213,306]],
          example: ['The thumb is part of the hand.', '엄지는 손의 일부다.'],
          asset: 'assets/vocabulary/body-v1.webp' },
        { id: 'face', title: 'Parts of the Face · 얼굴의 부분', triggers: ['face','eye','ear','nose','mouth','hair'],
          words: [['eye','눈',211,154],['ear','귀',311,174],['nose','코',239,183],['mouth','입',239,205],['hair','머리카락',225,82]],
          example: ['We use our ears to hear sounds.', '우리는 귀로 소리를 듣는다.'],
          asset: 'assets/vocabulary/face-v1.webp' },
        { id: 'house', title: 'Parts of a House · 집의 부분', triggers: ['house','roof','window','door','wall','chimney'],
          words: [['roof','지붕',233,127],['window','창문',179,214],['door','문',300,234],['wall','벽',239,233],['chimney','굴뚝',333,80]],
          example: ['A chimney carries smoke out of a building.', '굴뚝은 건물 밖으로 연기를 내보낸다.'],
          asset: 'assets/vocabulary/house-v1.webp' },
        { id: 'bicycle', title: 'Parts of a Bicycle · 자전거의 부분', triggers: ['bicycle','bike','wheel','pedal','saddle','handlebar','handlebars','chain'],
          words: [['wheel','바퀴',81,152],['pedal','페달',264,241],['saddle','안장',173,89],['handlebar','핸들',296,69],['chain','체인',162,204]],
          example: ['A bicycle usually has two wheels.', '자전거에는 보통 바퀴가 두 개 있다.'],
          asset: 'assets/vocabulary/bicycle-v1.webp' }
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
        // Generated illustration is a local optimized asset; labels stay crisp and editable.
        const labels = ({
            plant:[[385,45],[398,150],[75,200],[394,310],[90,55]],
            body:[[360,50],[365,140],[375,215],[365,280],[100,325]],
            face:[[75,125],[402,180],[74,200],[395,260],[75,55]],
            house:[[80,75],[65,210],[405,285],[80,290],[408,50]],
            bicycle:[[25,200],[290,345],[100,45],[400,45],[80,320]]
        })[theme.id];
        const marks = theme.words.map((w,i) => {
            const [x,y] = labels[i];
            return `<path d="M${x} ${y}L${w[2]} ${w[3]}" stroke="#fffdf8" stroke-width="5"/><path d="M${x} ${y}L${w[2]} ${w[3]}" stroke="#426858" stroke-width="1.8"/><circle cx="${w[2]}" cy="${w[3]}" r="3" fill="#247957"/><circle cx="${x}" cy="${y}" r="18" fill="#fffdf8" stroke="#426858" stroke-width="1.8"/><text x="${x}" y="${y+6}" text-anchor="middle" fill="#193b30" font-size="20" font-weight="700">${i+1}</text>`;
        }).join('');
        // All interpolated markup below is trusted authored topic data, never user input.
        figure.innerHTML = `<svg viewBox="0 0 480 380" role="img" aria-label="${theme.title}"><image href="${theme.asset}" x="40" y="30" width="400" height="300"/><g aria-hidden="true">${marks}</g></svg>`;
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
