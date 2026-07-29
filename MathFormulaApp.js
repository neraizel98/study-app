const MathFormulaApp = (() => {
    let formulaNumber = 1;
    let mode = 'study';
    let questions = [];
    let answers = {};
    let submitted = false;

    const $ = id => document.getElementById(id);
    const formula = () => MATH_FORMULAS.find(item => item.number === formulaNumber);
    const math = tex => {
        try {
            return katex.renderToString(tex, { throwOnError: false, displayMode: true });
        } catch {
            return tex;
        }
    };
    const inlineMath = tex => {
        try {
            return katex.renderToString(tex, { throwOnError: false });
        } catch {
            return tex;
        }
    };
    const setUrl = () => history.replaceState(null, '', `?formula=${formulaNumber}&mode=${mode}`);

    function diagramSvg(type) {
        const common = 'viewBox="0 0 520 270" role="img" aria-label="공식 원리 도형"';
        const label = (x, y, text, color = '#dce8ff') =>
            `<text x="${x}" y="${y}" fill="${color}" font-size="18" font-weight="700" text-anchor="middle">${text}</text>`;
        if (type === 'right-triangle') {
            return `<svg ${common}><path d="M90 220 L410 220 L410 55 Z" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
                <path d="M390 220v-20h20" fill="none" stroke="#ffd166" stroke-width="3"/>
                ${label(250,248,'b')}${label(434,145,'a')}${label(245,125,'c')}${label(112,210,'A','#ffd166')}</svg>`;
        }
        if (type === 'pythagorean') {
            return `<svg ${common}><path d="M175 205 L335 205 L335 70 Z" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
                <rect x="185" y="205" width="140" height="52" fill="#4facfe28" stroke="#4facfe"/>
                <rect x="335" y="85" width="52" height="110" fill="#34d39928" stroke="#34d399"/>
                <path d="M156 181 L307 2 L347 36 L196 216 Z" fill="#f472b628" stroke="#f472b6"/>
                ${label(255,245,'a²')}${label(363,148,'b²')}${label(235,70,'c²','#f9a8d4')}</svg>`;
        }
        if (type === 'incircle') {
            return `<svg ${common}><path d="M75 225 L445 225 L285 42 Z" fill="#4facfe12" stroke="#77d9ff" stroke-width="4"/>
                <circle cx="276" cy="161" r="64" fill="#f472b618" stroke="#f9a8d4" stroke-width="3"/>
                <circle cx="276" cy="161" r="5" fill="#ffd166"/><line x1="276" y1="161" x2="276" y2="225" stroke="#ffd166" stroke-width="3"/>
                <path d="M270 219h12v-12" fill="none" stroke="#ffd166" stroke-width="2"/>
                ${label(300,197,'r','#ffd166')}${label(260,252,'a')}${label(160,125,'c')}${label(385,126,'b')}</svg>`;
        }
        if (type === 'circumcircle') {
            return `<svg ${common}><circle cx="260" cy="138" r="112" fill="#4facfe0d" stroke="#60a5fa" stroke-width="3"/>
                <path d="M156 96 L354 66 L317 225 Z" fill="#f472b618" stroke="#f9a8d4" stroke-width="4"/>
                <circle cx="260" cy="138" r="5" fill="#ffd166"/><line x1="260" y1="138" x2="354" y2="66" stroke="#ffd166" stroke-width="3"/>
                ${label(314,95,'R','#ffd166')}${label(254,69,'c')}${label(352,157,'a')}${label(226,178,'b')}</svg>`;
        }
        if (type === 'angle-area') {
            return `<svg ${common}><path d="M90 220 L438 220 L220 52 Z" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
                <line x1="220" y1="52" x2="220" y2="220" stroke="#ffd166" stroke-width="3" stroke-dasharray="7 6"/>
                <path d="M120 220 A38 38 0 0 1 139 188" fill="none" stroke="#f9a8d4" stroke-width="4"/>
                ${label(264,249,'c')}${label(140,123,'b')}${label(123,205,'A','#f9a8d4')}${label(239,140,'h = b sin A','#ffd166')}</svg>`;
        }
        if (type === 'isosceles' || type === 'heron') {
            return `<svg ${common}><path d="M80 225 L440 225 L260 48 Z" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
                <line x1="260" y1="48" x2="260" y2="225" stroke="#ffd166" stroke-width="3" stroke-dasharray="7 6"/>
                <path d="M260 209h16v16" fill="none" stroke="#ffd166" stroke-width="2"/>
                ${label(260,252,type==='heron'?'c':'a')}${label(154,128,type==='heron'?'b':'b')}${label(367,128,type==='heron'?'a':'b')}${label(279,143,'h','#ffd166')}</svg>`;
        }
        const isHeight = type === 'equilateral-height';
        const isGeneral = type === 'triangle-area';
        return `<svg ${common}><path d="M85 225 L435 225 L260 48 Z" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
            <line x1="260" y1="48" x2="260" y2="225" stroke="#ffd166" stroke-width="3" ${isGeneral ? 'stroke-dasharray="7 6"' : ''}/>
            <path d="M260 209h16v16" fill="none" stroke="#ffd166" stroke-width="2"/>
            ${label(260,252,isGeneral?'b':'a')}${label(156,130,isGeneral?'':'a')}${label(365,130,isGeneral?'':'a')}${label(280,143,'h','#ffd166')}
            ${isHeight ? label(345,85,'h = (√3/2)a','#34d399') : ''}</svg>`;
    }

    function renderNavigation() {
        $('formulaGroups').innerHTML = MATH_FORMULA_GROUPS.map(group => `
            <section class="formula-group">
                <div class="group-heading"><strong>${group.title}</strong><span>${group.range}</span></div>
                <div class="formula-menu">${group.items.map(number => {
                    const item = MATH_FORMULAS[number - 1];
                    return `<button class="formula-menu-btn ${number === formulaNumber ? 'active' : ''}" data-formula="${number}">
                        <span>${String(number).padStart(3, '0')}</span>${item.title}
                    </button>`;
                }).join('')}</div>
            </section>`).join('');
        document.querySelectorAll('[data-formula]').forEach(button => {
            button.addEventListener('click', () => {
                formulaNumber = Number(button.dataset.formula);
                submitted = false;
                answers = {};
                setUrl();
                render();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    function renderStudy() {
        const item = formula();
        $('content').innerHTML = `
            <article class="lesson-card">
                <div class="lesson-kicker">FORMULA ${String(item.number).padStart(3, '0')}</div>
                <h2>${item.title}</h2>
                <div class="curriculum-row">${item.curriculum.map(tag => `<span>${tag}</span>`).join('')}</div>
                <p class="lesson-summary">${item.summary}</p>
                <div class="formula-display">${math(item.formula)}</div>
                <div class="diagram-box">${diagramSvg(item.diagram)}</div>

                <section class="content-section">
                    <h3>🔤 기호부터 천천히 읽기</h3>
                    <div class="symbol-grid">${item.symbols.map(([symbol, description]) => `
                        <div class="symbol-item"><div class="symbol">${inlineMath(symbol)}</div><p>${description}</p></div>`).join('')}</div>
                </section>

                <section class="content-section">
                    <h3>🧱 먼저 알고 있으면 좋은 내용</h3>
                    <ul class="knowledge-list">${item.prerequisites.map(text => `<li>${text}</li>`).join('')}</ul>
                </section>

                <section class="content-section">
                    <h3>💡 공식이 만들어지는 원리</h3>
                    <ol class="principle-steps">${item.steps.map((text, index) => `
                        <li><span class="step-number">${index + 1}</span><p>${text}</p></li>`).join('')}</ol>
                </section>

                <section class="content-section example-section">
                    <h3>✏️ 실전 예제</h3>
                    <strong>${item.example.question}</strong>
                    <div class="work-steps">${item.example.work.map((text, index) => `<p><span>${index + 1}</span>${text}</p>`).join('')}</div>
                </section>

                <div class="tip-box">⚠️ <strong>꼭 기억하기</strong><p>${item.tip}</p></div>
                <a class="video-link" href="https://www.youtube.com/results?search_query=${encodeURIComponent(item.videoQuery)}" target="_blank" rel="noopener noreferrer">
                    ▶ 깨봉수학에서 관련 영상 찾아보기 <small>(${item.videoQuery})</small>
                </a>
                <div class="source-note">공식 번호와 기본 식 출처: 대한수학회 「중고등 수학 공식 포스터」</div>
            </article>`;
    }

    function renderQuiz() {
        if (!questions.length || questions[0].formulaNumber !== formulaNumber) {
            questions = MathFormulaQuiz.create(formulaNumber).map(q => ({ ...q, formulaNumber }));
            answers = {};
            submitted = false;
        }
        const item = formula();
        $('content').innerHTML = `
            <article class="lesson-card">
                <div class="lesson-kicker">FORMULA ${String(item.number).padStart(3, '0')} · RANDOM QUIZ</div>
                <h2>${item.title} 퀴즈</h2>
                <p class="lesson-summary">기본 연산, 심화 연산, 서술형 문제가 매번 새로운 수치로 출제됩니다.</p>
                <div class="quiz-list">${questions.map((q, qi) => {
                    const result = submitted ? MathFormulaQuiz.isCorrect(q, answers[qi]) : null;
                    return `<section class="quiz-card ${submitted ? (result ? 'correct' : 'wrong') : ''}">
                        <div class="quiz-label">${qi + 1}. ${q.level}</div>
                        <h3>${q.prompt}</h3>
                        ${q.kind === 'choice'
                            ? `<div class="choice-grid">${q.choices.map(choice => `<button class="choice-btn ${String(answers[qi]) === choice ? 'selected' : ''}" data-question="${qi}" data-answer="${choice}" ${submitted ? 'disabled' : ''}>${choice}${q.unit ? ` ${q.unit}` : ''}</button>`).join('')}</div>`
                            : `<textarea class="written-answer" data-written="${qi}" placeholder="풀이를 적고 마지막에 답을 숫자로 입력하세요." ${submitted ? 'disabled' : ''}>${answers[qi] || ''}</textarea>`}
                        ${submitted ? `<div class="solution ${result ? 'ok' : 'no'}">
                            <strong>${result ? '✅ 정답입니다.' : `❌ 다시 확인해 보세요. 정답: ${q.answer}${q.unit ? ` ${q.unit}` : ''}`}</strong>
                            <p>${q.solution}</p>
                        </div>` : ''}
                    </section>`;
                }).join('')}</div>
                <div class="quiz-actions">
                    <button id="newQuizBtn" class="secondary-btn">🔄 다른 문제</button>
                    <button id="submitQuizBtn" class="primary-btn">${submitted ? '다시 채점하기' : '채점하기'}</button>
                </div>
                ${submitted ? `<div class="score-box">${questions.filter((q, i) => MathFormulaQuiz.isCorrect(q, answers[i])).length} / ${questions.length} 정답</div>` : ''}
            </article>`;
        bindQuiz();
    }

    function bindQuiz() {
        document.querySelectorAll('[data-question]').forEach(button => button.addEventListener('click', () => {
            answers[Number(button.dataset.question)] = button.dataset.answer;
            renderQuiz();
        }));
        document.querySelectorAll('[data-written]').forEach(area => {
            area.addEventListener('input', () => { answers[Number(area.dataset.written)] = area.value; });
        });
        $('newQuizBtn').addEventListener('click', () => {
            questions = [];
            answers = {};
            submitted = false;
            renderQuiz();
        });
        $('submitQuizBtn').addEventListener('click', () => {
            document.querySelectorAll('[data-written]').forEach(area => {
                answers[Number(area.dataset.written)] = area.value;
            });
            submitted = true;
            renderQuiz();
        });
    }

    function render() {
        const item = formula();
        $('heroSubtitle').textContent = `공식 ${String(item.number).padStart(3, '0')} · ${item.title}`;
        $('studyModeBtn').classList.toggle('active', mode === 'study');
        $('quizModeBtn').classList.toggle('active', mode === 'quiz');
        renderNavigation();
        if (mode === 'quiz') renderQuiz();
        else renderStudy();
        $('prevBtn').disabled = formulaNumber === 1;
        $('nextBtn').disabled = formulaNumber === 10;
    }

    function init() {
        const params = new URLSearchParams(location.search);
        formulaNumber = Math.min(10, Math.max(1, Number(params.get('formula')) || 1));
        mode = params.get('mode') === 'quiz' ? 'quiz' : 'study';
        $('studyModeBtn').addEventListener('click', () => { mode = 'study'; setUrl(); render(); });
        $('quizModeBtn').addEventListener('click', () => { mode = 'quiz'; questions = []; setUrl(); render(); });
        $('prevBtn').addEventListener('click', () => {
            if (formulaNumber > 1) { formulaNumber -= 1; questions = []; setUrl(); render(); window.scrollTo(0, 0); }
        });
        $('nextBtn').addEventListener('click', () => {
            if (formulaNumber < 10) { formulaNumber += 1; questions = []; setUrl(); render(); window.scrollTo(0, 0); }
        });
        render();
    }

    return { init };
})();

window.addEventListener('DOMContentLoaded', MathFormulaApp.init);
