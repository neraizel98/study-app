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
        ,{ id:'weather', title:'Weather · 날씨', triggers:['weather','sun','sunny','cloud','cloudy','rain','rainy','wind','windy','snow','snowy'],
          words:[['sun','태양',109,102],['cloud','구름',242,113],['rain','비',371,140],['wind','바람',159,237],['snow','눈',344,273]],
          example:['Wind is moving air.','바람은 움직이는 공기다.'],asset:'assets/vocabulary/weather-v1.webp' },
        { id:'watercycle', title:'The Water Cycle · 물의 순환', triggers:['water cycle','water','evaporation','evaporate','condensation','condense','precipitation','runoff','cloud','lake'],
          words:[['evaporation','증발',123,179],['condensation','응결',316,88],['precipitation','강수',352,143],['runoff','지표 유출',366,221],['lake','호수',137,276]],
          example:['Water vapor can condense into liquid droplets.','수증기는 응결하여 작은 물방울이 될 수 있다.'],note:'수증기는 눈에 보이지 않아요. 위로 향하는 선은 증발을 나타내는 기호예요.',asset:'assets/vocabulary/watercycle-v1.webp' },
        { id:'space', title:'Space · 우주', triggers:['space','solar system','sun','star','Earth','earth','moon','Mars','mars','Jupiter','jupiter','planet'],
          words:[['Sun','태양',109,105],['Earth','지구',250,107],['Moon','달',385,113],['Mars','화성',157,248],['Jupiter','목성',325,245]],
          example:['The Sun is a star.','태양은 별이다.'],note:'각 천체를 따로 보여주는 그림이에요. 실제 크기·거리 비율이나 배치는 아니에요.',asset:'assets/vocabulary/space-v1.webp' },
        { id:'landscape', title:'Landforms · 지형과 자연', triggers:['landscape','nature','mountain','river','valley','forest','lake'],
          words:[['mountain','산',358,85],['river','강',297,210],['valley','계곡',266,157],['forest','숲',104,165],['lake','호수',344,265]],
          example:['Rivers can flow into lakes.','강은 호수로 흘러들 수 있다.'],asset:'assets/vocabulary/landscape-v1.webp' },
        { id:'fruit', title:'Fruit · 과일', triggers:['fruit','apple','banana','grape','grapes','orange','lemon'],
          words:[['apple','사과',112,118],['banana','바나나',261,157],['grape','포도 한 알',385,118],['orange','오렌지',162,248],['lemon','레몬',327,251]],
          example:['Grapes grow in bunches.','포도는 송이로 자란다.'],note:'grape는 포도 한 알, a bunch of grapes는 포도 한 송이예요.',asset:'assets/vocabulary/fruit-v1.webp' },
        { id:'kitchen', title:'Kitchen Tools · 주방 도구', triggers:['kitchen','pot','pan','plate','cup','spoon'],
          words:[['pot','냄비',109,113],['pan','프라이팬',242,121],['plate','접시',377,121],['cup','컵',162,245],['spoon','숟가락',355,210]],
          example:['You can stir soup with a spoon.','숟가락으로 수프를 저을 수 있다.'],asset:'assets/vocabulary/kitchen-v1.webp' }
    ];
    function findAll(input) {
        const entry = input && typeof input === 'object' ? input : null;
        const key = String(entry ? entry.word : input || '').trim().toLowerCase();
        // Ambiguous words only show the diagram for the matching taught sense.
        const senses = {head:'머리',root:'뿌리',face:'얼굴',wind:'바람',orange:'오렌지',space:'우주',star:'별'};
        if (entry && senses[key] && !String(entry.meaning || '').includes(senses[key])) return [];
        return themes.filter(t => t.triggers.some(trigger => trigger.toLowerCase() === key));
    }
    function find(word) { return findAll(word)[0] || null; }
    function node(tag, cls, value) { const el = document.createElement(tag); if (cls) el.className = cls; if (value !== undefined) el.textContent = value; return el; }
    function render(host, word, selectedId) {
        if (!host) return;
        host.replaceChildren(); const matches = findAll(word); const theme = matches.find(t => t.id === selectedId) || matches[0]; host.hidden = !theme;
        if (!theme) return;
        const heading = node('h3', 'vocab-visual-title', theme.title); host.append(heading);
        if (matches.length > 1) {
            const choices = node('div','vocab-visual-topics'); choices.setAttribute('aria-label','관련 시각 시트 선택');
            matches.forEach(t => { const button = node('button','',t.title.split(' · ')[1]); button.type='button'; button.setAttribute('aria-pressed',String(t.id === theme.id)); button.addEventListener('click',()=>{ render(host,word,t.id); const selected=host.querySelector('[aria-pressed="true"]'); selected?.focus({preventScroll:true}); }); choices.append(button); }); host.append(choices);
        }
        const layout = node('div', 'vocab-visual-layout');
        const figure = node('div', 'vocab-visual-figure');
        // Generated illustration is a local optimized asset; labels stay crisp and editable.
        const labels = ({
            plant:[[385,45],[398,150],[75,200],[394,310],[90,55]],
            body:[[360,50],[365,140],[375,215],[365,280],[100,325]],
            face:[[75,125],[402,180],[74,200],[395,260],[75,55]],
            house:[[80,75],[65,210],[405,285],[80,290],[408,50]],
            bicycle:[[25,200],[290,345],[100,45],[400,45],[80,320]],
            weather:[[60,45],[240,40],[420,65],[45,305],[425,325]],
            watercycle:[[65,100],[280,25],[435,110],[440,285],[65,340]],
            space:[[60,40],[240,35],[430,45],[65,325],[430,325]],
            landscape:[[420,40],[440,210],[240,65],[55,250],[415,335]],
            fruit:[[60,40],[240,35],[430,45],[65,325],[430,325]],
            kitchen:[[65,45],[240,35],[435,45],[65,325],[430,325]]
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
        layout.append(figure,list); host.append(layout); if(theme.note) host.append(node('p','vocab-visual-note',theme.note));
        const activity=node('div','vocab-visual-activity'); activity.append(node('strong','', '[활용]'),node('p','vocab-visual-example',theme.example[0]),node('p','vocab-visual-translation',theme.example[1])); host.append(activity);
    }
    root.VocabularyVisual = Object.freeze({ find, findAll, render, topics: Object.freeze(themes) });
})(window);
