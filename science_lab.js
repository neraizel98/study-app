(function (root) {
    'use strict';

    const SPECIFIC_HEAT = 4200;
    function heatWater({ massKg, powerW = 1000, seconds = 60, initialC = 20 }) {
        if (![massKg, powerW, seconds, initialC].every(Number.isFinite)
            || massKg <= 0 || powerW <= 0 || seconds < 0 || initialC < 0 || initialC >= 100) {
            throw new RangeError('모형의 질량·전력·시간·처음 온도를 확인해 주세요.');
        }
        const joules = powerW * seconds;
        const riseC = joules / (massKg * SPECIFIC_HEAT);
        if (initialC + riseC >= 100) throw new RangeError('이 모형은 끓는점 미만의 물만 다룹니다.');
        return { joules, riseC, temperatureC: initialC + riseC };
    }
    const api = { heatWater, SPECIFIC_HEAT };
    root.ScienceHeatModel = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (!root.document) return;

    const $ = id => document.getElementById(id);
    const duration = 60;
    const captions = [
        '처음 온도와 히터는 같아요. 물의 양을 비교해 보세요.',
        '같은 모양의 비커예요. 눈금과 물높이를 보면 물의 양이 달라요.',
        '옆면을 열어 입자와 히터를 살펴봐요. 같은 크기의 점은 입자 운동을 설명하는 정성 모형이에요.',
        '주황색 화살표를 따라가 보세요. 두 비커에 같은 에너지가 들어가요.',
        '물의 양만 바꿔 다시 예상하고 실험해 보세요.'
    ];
    const questions = [
        {
            prompt: '같은 히터로 같은 시간 가열할 때, 물 0.5kg과 1kg 중 온도가 더 많이 오르는 쪽은?',
            choices: ['0.5kg', '1kg', '둘 다 같다'], answer: 0,
            explanation: '받는 에너지가 같으면 물의 양이 적을수록 온도 변화가 커요.'
        },
        {
            prompt: '물의 양만 비교하려면 어느 조건을 같게 해야 할까?',
            choices: ['히터의 전력, 가열 시간, 처음 온도', '최종 온도만', '물의 양까지 모두'], answer: 0,
            explanation: '비교할 조건은 물의 양이에요. 전력·시간·처음 온도를 같게 해야 물의 양에 따른 차이를 볼 수 있어요.'
        },
        {
            prompt: '같은 양의 물을 같은 히터로 30초 대신 60초 가열하면, 온도 변화는? 이 모형의 끓는점 미만에서 생각해 봐.',
            choices: ['절반', '2배', '최종 온도가 무조건 2배'], answer: 1,
            explanation: '시간이 2배면 전달한 에너지도 2배예요. 처음 온도에서 올라간 온도가 2배이며, 최종 온도 전체가 2배인 것은 아니에요.'
        },
        {
            prompt: '그림에서 물의 온도가 오를 때 나타낸 입자 모형으로 알맞은 설명은?',
            choices: ['입자의 크기가 커진다', '입자 수가 저절로 늘어난다', '입자의 평균 운동이 더 활발해진다'], answer: 2,
            explanation: '같은 물을 가열한다고 입자 수나 입자 자체의 크기가 늘어나지는 않아요. 움직임은 온도에 따른 평균 운동의 정성 표현이에요.'
        }
    ];
    let prediction = null;
    let elapsed = 0;
    let running = false;
    let completed = false;
    let lastFrame = null;
    let animationFrame = null;
    let lastPaint = 0;
    let stage = 0;
    let still = root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const masses = () => [Number($('massA').value), Number($('massB').value)];
    const round = value => value.toFixed(1);
    const expected = () => {
        const [a, b] = masses();
        return a === b ? 'same' : a < b ? 'a' : 'b';
    };

    function cupDrawing(id, mass) {
        const top = 180 - mass / 2 * 120;
        const particles = Array.from({ length: Math.round(mass * 12) }, (_, index) => {
            const columns = 6, x = 65 + index % columns * 17;
            const rows = Math.ceil(mass * 12 / columns);
            const y = top + 14 + Math.floor(index / columns) * Math.min(23, (172 - top) / rows);
            return `<circle class="molecule" cx="${x}" cy="${y}" r="3.2" style="--delay:-${index * .21}s"/>`;
        }).join('');
        return `<svg viewBox="0 0 240 250" role="img" aria-labelledby="title-${id} desc-${id}">
            <title id="title-${id}">${id}의 ${mass}kg 물과 히터</title>
            <desc id="desc-${id}">같은 크기 비커의 물높이로 양을 비교합니다. 단면 단계에서 입자 모형과 아래 히터를 볼 수 있습니다.</desc>
            <defs><clipPath id="clip-${id}"><path d="M52 51L56 178Q58 193 116 195Q174 194 177 178L181 51Z"/></clipPath>
            <marker id="arrow-${id}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="3" markerHeight="3" orient="auto"><path d="M0 0L9 5L0 10" fill="none" stroke="#d37836" stroke-width="2"/></marker></defs>
            <ellipse cx="118" cy="222" rx="83" ry="9" fill="#bdbba4" opacity=".2"/>
            <path class="ink-line" d="M182 70C229 56 230 153 180 150M183 83C210 75 210 137 181 136"/>
            <path class="glass ink-line" d="M52 51L56 178Q58 195 116 195Q174 194 177 178L181 51"/>
            <g clip-path="url(#clip-${id})"><rect class="water" x="51" y="${top}" width="132" height="${196 - top}"/>
            <ellipse class="water-surface" cx="117" cy="${top}" rx="66" ry="11"/>
            <g class="particles">${particles}</g></g>
            <ellipse class="ink-line back-rim" cx="116.5" cy="51" rx="65" ry="15"/>
            <path class="ink-line" d="M52 51L36 39L31 48L53 68M66 84h10M66 108h10M66 132h10M66 156h10" opacity=".8"/>
            <g class="scale-label"><text x="82" y="87">2kg</text><text x="82" y="135">1kg</text></g>
            <path class="heater" d="M51 204Q117 217 182 204L181 217Q117 231 53 217Z"/>
            <g class="cutaway"><path class="coil" d="M63 211L72 206L83 214L94 208L105 216L116 209L127 216L138 208L149 214L160 206L171 211"/>
            <path class="ink-line" d="M181 214L204 222L225 220"/></g>
            <g class="heat-flow"><path class="heat-arrow" d="M95 207L95 150" marker-end="url(#arrow-${id})"/><path class="heat-arrow" d="M139 207L139 150" marker-end="url(#arrow-${id})"/></g>
            <text x="117" y="244" text-anchor="middle" fill="#526653" font-size="12">히터 1000W</text>
        </svg>`;
    }

    function setStage(value) {
        stage = value;
        $('scene').dataset.stage = String(stage);
        $('stageCaption').textContent = captions[stage];
        $('conditions').hidden = stage !== 4;
        document.querySelectorAll('[data-stage]').forEach(button => {
            if (button.tagName === 'BUTTON') button.setAttribute('aria-pressed', String(Number(button.dataset.stage) === stage));
        });
    }

    function paint() {
        const [a, b] = masses();
        const values = [a, b].map(massKg => heatWater({ massKg, seconds: elapsed }));
        values.forEach((value, index) => {
            const letter = index === 0 ? 'A' : 'B';
            $('temperature' + letter).innerHTML = round(value.temperatureC) + '<span>℃</span>';
            $('delta' + letter).textContent = elapsed ? '+' + round(value.riseC) + '℃ 상승' : '처음 온도';
            $('cup' + letter).style.setProperty('--speed', (2.5 - value.riseC / 45).toFixed(2) + 's');
            $('cup' + letter).querySelector('.water').style.fill = `hsl(${180 - value.riseC * 1.1} 28% 78%)`;
        });
        $('timeSlider').value = String(elapsed);
        $('timeLabel').textContent = round(elapsed) + ' / 60초';
        $('energyLabel').textContent = round(values[0].joules / 1000) + ' kJ';
        $('play').disabled = !prediction || running || completed;
        $('play').textContent = elapsed > 0 && !completed ? '이어 재생' : '실험 재생';
        $('pause').disabled = !running;
        $('timeSlider').disabled = !prediction;
        $('scene').classList.toggle('playing', running);
        $('scene').classList.toggle('still', still);
        $('textEquivalent').textContent = `가열 ${round(elapsed)}초. 각 비커에 ${round(values[0].joules / 1000)}kJ를 전달했어요. A ${a}kg은 ${round(values[0].temperatureC)}℃, B ${b}kg은 ${round(values[1].temperatureC)}℃예요.`;
    }

    function pause(message) {
        running = false;
        lastFrame = null;
        if (animationFrame !== null) root.cancelAnimationFrame(animationFrame);
        animationFrame = null;
        if (message) $('playStatus').textContent = message;
        paint();
    }

    function finish() {
        pause('실험이 끝났어요. 예측과 결과를 비교하고 설명을 열어 보세요.');
        completed = true;
        $('openReason').disabled = false;
        $('openReason').textContent = '왜 그럴까? 설명 열기';
        $('checkLock').hidden = true;
        $('checkForm').hidden = false;
        const verdict = expected() === prediction ? '예측과 결과가 같아요.' : '예측과 다른 결과가 나왔어요.';
        $('predictionStatus').textContent = verdict;
        const [a, b] = masses();
        $('conclusion').textContent = a === b
            ? '물의 양과 받은 에너지가 모두 같아서 두 비커의 온도 변화도 같아요.'
            : `${a < b ? 'A' : 'B'}의 물이 더 적어서 온도가 더 많이 올랐어요. 각 비커이 받은 에너지는 같아요.`;
        paint();
    }

    function frame(now) {
        if (!running) return;
        if (lastFrame !== null) elapsed = Math.min(duration, elapsed + (now - lastFrame) / 1000 * 7.5);
        lastFrame = now;
        if (elapsed >= duration) { finish(); return; }
        if (now - lastPaint > 100) { paint(); lastPaint = now; }
        animationFrame = root.requestAnimationFrame(frame);
    }

    function reset() {
        pause();
        elapsed = 0;
        completed = false;
        prediction = null;
        $('predictionStatus').textContent = '예상을 고르면 실험을 시작할 수 있어요.';
        document.querySelectorAll('[data-predict]').forEach(button => {
            button.setAttribute('aria-pressed', String(button.dataset.predict === prediction));
            button.disabled = false;
        });
        $('openReason').disabled = true;
        $('openReason').textContent = '실험을 마치면 설명 열기';
        $('openReason').setAttribute('aria-expanded', 'false');
        $('reasonBody').hidden = true;
        $('checkForm').hidden = true;
        $('checkForm').reset();
        $('checkResult').textContent = '';
        $('checkLock').hidden = false;
        document.querySelectorAll('.answer-feedback').forEach(element => element.textContent = '');
        $('playStatus').textContent = still ? '정지 그림 모드예요. 시간 막대를 옮겨 각 시점을 비교할 수 있어요.' : '실제 60초의 가열을 약 8초에 보여 줘요.';
        paint();
    }

    $('checkForm').innerHTML = questions.map((question, index) => `<fieldset class="question"><legend>${index + 1}. ${question.prompt}</legend>${question.choices.map((choice, choiceIndex) =>
        `<label class="answer-option"><input type="radio" name="q${index}" value="${choiceIndex}" required>${choice}</label>`).join('')}<p class="answer-feedback" id="feedback${index}"></p></fieldset>`).join('') + '<button type="submit" class="primary">4문항 확인하기</button>';
    $('checkForm').addEventListener('submit', event => {
        event.preventDefault();
        if (!completed || !$('checkForm').reportValidity()) return;
        const answers = new FormData($('checkForm'));
        let correct = 0;
        questions.forEach((question, index) => {
            const match = Number(answers.get('q' + index)) === question.answer;
            if (match) correct++;
            $('feedback' + index).textContent = (match ? '맞았어요. ' : '다시 생각해 봐요. ') + question.explanation;
        });
        $('checkResult').textContent = `4문항 중 ${correct}문항을 맞혔어요. 설명을 읽고 다시 확인할 수 있어요.`;
    });
    $('predictions').addEventListener('click', event => {
        const button = event.target.closest('[data-predict]');
        if (!button || elapsed > 0 || running) return;
        prediction = button.dataset.predict;
        document.querySelectorAll('[data-predict]').forEach(element => element.setAttribute('aria-pressed', String(element === button)));
        $('predictionStatus').textContent = '예상을 기록했어요. 실험을 재생하거나 시간 막대를 옮겨 보세요.';
        paint();
    });
    document.querySelector('.stages').addEventListener('click', event => {
        const button = event.target.closest('[data-stage]');
        if (button) setStage(Number(button.dataset.stage));
    });
    $('play').addEventListener('click', () => {
        if (!prediction || running || completed) return;
        running = true;
        lastFrame = null;
        if (stage < 3) setStage(3);
        $('playStatus').textContent = '가열 과정을 빠르게 보고 있어요. 언제든 멈춰 관찰할 수 있어요.';
        document.querySelectorAll('[data-predict]').forEach(button => button.disabled = true);
        paint();
        animationFrame = root.requestAnimationFrame(frame);
    });
    $('pause').addEventListener('click', () => pause('잠시 멈췄어요. 시간 막대와 수치를 비교해 보세요.'));
    $('reset').addEventListener('click', () => reset());
    $('timeSlider').addEventListener('input', event => {
        if (!prediction) return;
        const seconds = Number(event.target.value);
        pause();
        elapsed = seconds;
        if (elapsed >= duration) finish();
        else {
            completed = false;
            $('openReason').disabled = true;
            $('reasonBody').hidden = true;
            $('openReason').setAttribute('aria-expanded', 'false');
            $('checkForm').hidden = true;
            $('checkResult').textContent = '';
            $('checkLock').hidden = false;
        }
        document.querySelectorAll('[data-predict]').forEach(button => button.disabled = elapsed > 0);
        paint();
    });
    function changeMasses() {
        const [a, b] = masses();
        $('conditionSummary').textContent = `A ${a}kg · B ${b}kg`;
        ['A', 'B'].forEach((letter, index) => {
            const mass = index === 0 ? a : b;
            $('massLabel' + letter).textContent = mass + 'kg의 물';
            $('cup' + letter).innerHTML = cupDrawing(letter, mass);
        });
        reset();
    }
    ['massA', 'massB'].forEach(id => $(id).addEventListener('change', changeMasses));
    $('stillMode').checked = still;
    $('stillMode').addEventListener('change', event => {
        still = event.target.checked;
        pause(still ? '정지 그림 모드예요. 시간 막대로 시점을 직접 골라 볼 수 있어요.' : '움직임을 켰어요. 재생을 눌러 이어 볼 수 있어요.');
    });
    root.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => {
        if (event.matches) { still = true; $('stillMode').checked = true; pause('동작 줄이기 설정에 따라 정지 그림으로 바꿨어요.'); }
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden && running) pause('다른 화면을 보는 동안 실험을 멈췄어요. 재생을 누르면 이어집니다.'); });
    root.addEventListener('pagehide', () => pause());
    setStage(0);
    changeMasses();
})(typeof window !== 'undefined' ? window : globalThis);
