const MathFormulaApp = (() => {
    let formulaNumber = 1;
    let mode = 'study';
    let questions = [];
    let answers = {};
    let submitted = false;
    const allLevels = ['초6', '중1', '중2', '중3', '고1', '고2', '고3'];
    let selectedLevels = new Set(allLevels);

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
    const visibleFormulaNumbers = () => MATH_FORMULAS
        .filter(item => selectedLevels.has(item.level))
        .map(item => item.number);

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
            return `<svg ${common}><path d="M220 180 L320 180 L320 105 Z" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
                <path d="M220 180 L320 180 L320 280 L220 280 Z" fill="#4facfe28" stroke="#4facfe" stroke-width="2"/>
                <path d="M320 180 L395 180 L395 105 L320 105 Z" fill="#34d39928" stroke="#34d399" stroke-width="2"/>
                <path d="M220 180 L320 105 L245 5 L145 80 Z" fill="#f472b628" stroke="#f472b6" stroke-width="2"/>
                <path d="M302 180v-18h18" fill="none" stroke="#ffd166" stroke-width="3"/>
                ${label(270,242,'a²')}${label(360,149,'b²')}${label(215,78,'c²','#f9a8d4')}</svg>`;
        }
        if (type === 'incircle') {
            return `<svg ${common}><path d="M75 225 L445 225 L285 42 Z" fill="#4facfe12" stroke="#77d9ff" stroke-width="4"/>
                <circle cx="276" cy="161" r="64" fill="#f472b618" stroke="#f9a8d4" stroke-width="3"/>
                <circle cx="276" cy="161" r="5" fill="#ffd166"/><line x1="276" y1="161" x2="276" y2="225" stroke="#ffd166" stroke-width="3"/>
                <path d="M270 219h12v-12" fill="none" stroke="#ffd166" stroke-width="2"/>
                ${label(300,197,'r','#ffd166')}${label(260,252,'a')}${label(160,125,'c')}${label(385,126,'b')}</svg>`;
        }
        if (type === 'circumcircle') {
            return `<svg ${common}><circle cx="260" cy="140" r="110" fill="#4facfe0d" stroke="#60a5fa" stroke-width="3"/>
                <path d="M165 85 L355 85 L260 250 Z" fill="#f472b618" stroke="#f9a8d4" stroke-width="4"/>
                <circle cx="260" cy="140" r="5" fill="#ffd166"/><line x1="260" y1="140" x2="355" y2="85" stroke="#ffd166" stroke-width="3"/>
                ${label(315,105,'R','#ffd166')}${label(260,75,'c')}${label(327,178,'a')}${label(194,178,'b')}</svg>`;
        }
        if (type === 'angle-area') {
            return `<svg ${common}><path d="M90 220 L438 220 L220 52 Z" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
                <line x1="220" y1="52" x2="220" y2="220" stroke="#ffd166" stroke-width="3" stroke-dasharray="7 6"/>
                <path d="M120 220 A38 38 0 0 1 139 188" fill="none" stroke="#f9a8d4" stroke-width="4"/>
                ${label(264,249,'c')}${label(140,123,'b')}${label(123,205,'A','#f9a8d4')}${label(239,140,'h = b sin A','#ffd166')}</svg>`;
        }
        if (type === 'square' || type === 'rectangle' || type === 'rectangle-diagonal') {
            const x = type === 'square' ? 145 : 105;
            const width = type === 'square' ? 230 : 310;
            return `<svg ${common}><rect x="${x}" y="42" width="${width}" height="185" rx="3" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
                ${type === 'rectangle-diagonal' ? `<line x1="${x}" y1="227" x2="${x + width}" y2="42" stroke="#f9a8d4" stroke-width="4"/>${label(270,120,'d','#f9a8d4')}` : ''}
                ${label(260,252,'a')}${label(x + width + 28,140,type === 'square' ? 'a' : 'b')}</svg>`;
        }
        if (type === 'rhombus' || type === 'quadrilateral') {
            return `<svg ${common}><path d="M70 150 L270 35 L455 135 L245 238 Z" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
                <line x1="70" y1="150" x2="455" y2="135" stroke="#f9a8d4" stroke-width="3"/>
                <line x1="270" y1="35" x2="245" y2="238" stroke="#34d399" stroke-width="3"/>
                ${label(365,120,'d₁','#f9a8d4')}${label(285,78,'d₂','#34d399')}${type === 'quadrilateral' ? label(280,145,'θ','#ffd166') : ''}</svg>`;
        }
        if (type === 'parallelogram' || type === 'trapezoid') {
            const path = type === 'trapezoid' ? 'M90 225 L430 225 L350 65 L165 65 Z' : 'M80 225 L395 225 L455 65 L140 65 Z';
            return `<svg ${common}><path d="${path}" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
                <line x1="${type === 'trapezoid' ? 165 : 140}" y1="65" x2="${type === 'trapezoid' ? 165 : 140}" y2="225" stroke="#ffd166" stroke-width="3" stroke-dasharray="7 6"/>
                ${label(260,252,type === 'trapezoid' ? 'b' : 'a')}${label(177,150,'h','#ffd166')}${type === 'trapezoid' ? label(258,52,'a') : ''}</svg>`;
        }
        if (['pentagon','pentagon-height','pentagon-diagonal','hexagon','regular-polygon','polygon-diagonals','polygon-angles'].includes(type)) {
            const sides = type === 'hexagon' ? 6 : type.startsWith('pentagon') ? 5 : 8;
            const points = Array.from({length:sides}, (_, i) => {
                const angle = -Math.PI / 2 + i * Math.PI * 2 / sides;
                return `${260 + 170 * Math.cos(angle)},${140 + 105 * Math.sin(angle)}`;
            }).join(' ');
            const extras = type === 'pentagon-height' ? '<line x1="260" y1="35" x2="260" y2="225" stroke="#ffd166" stroke-width="3"/>' :
                type === 'pentagon-diagonal' || type === 'polygon-diagonals' ? '<path d="M260 35 L422 108 L360 225 L160 225 L98 108 L360 225 L260 35" fill="none" stroke="#f9a8d4" stroke-width="3"/>' :
                type === 'polygon-angles' ? '<line x1="260" y1="35" x2="422" y2="108" stroke="#ffd166" stroke-width="2"/><line x1="260" y1="35" x2="380" y2="214" stroke="#ffd166" stroke-width="2"/>' : '';
            return `<svg ${common}><polygon points="${points}" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>${extras}${label(260,260,'정다각형')}</svg>`;
        }
        if (type === 'vector' || type === 'coordinates' || type === 'centroid' || type === 'median') {
            return `<svg ${common}><path d="M95 225 L430 225 L275 42 Z" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
                ${type === 'centroid' || type === 'median' ? '<line x1="275" y1="42" x2="262" y2="225" stroke="#ffd166" stroke-width="3"/><circle cx="267" cy="164" r="6" fill="#f9a8d4"/>' : ''}
                ${type === 'vector' ? '<path d="M95 225 L430 225 M95 225 L275 42" stroke="#34d399" stroke-width="6"/>' : ''}
                ${type === 'coordinates' ? '<path d="M60 235 H465 M75 255 V25" stroke="#70839f" stroke-width="2"/>' : ''}
                ${label(275,252,'B-C')}${label(292,150,type === 'centroid' ? 'G' : type === 'median' ? 'M' : '')}</svg>`;
        }
        if (type === 'isosceles' || type === 'heron') {
            return `<svg ${common}><path d="M80 225 L440 225 L260 48 Z" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
                <line x1="260" y1="48" x2="260" y2="225" stroke="#ffd166" stroke-width="3" stroke-dasharray="7 6"/>
                <path d="M260 209h16v16" fill="none" stroke="#ffd166" stroke-width="2"/>
                ${label(260,252,type==='heron'?'c':'a')}${label(154,128,type==='heron'?'b':'b')}${label(367,128,type==='heron'?'a':'b')}${label(279,143,'h','#ffd166')}</svg>`;
        }
        const isHeight = type === 'equilateral-height';
        const isGeneral = type === 'triangle-area';
        return `<svg ${common}><path d="M140 235 L380 235 L260 27 Z" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
            <line x1="260" y1="27" x2="260" y2="235" stroke="#ffd166" stroke-width="3" ${isGeneral ? 'stroke-dasharray="7 6"' : ''}/>
            <path d="M260 219h16v16" fill="none" stroke="#ffd166" stroke-width="2"/>
            ${label(260,260,isGeneral?'b':'a')}${label(184,130,isGeneral?'':'a')}${label(337,130,isGeneral?'':'a')}${label(280,143,'h','#ffd166')}
            ${isHeight ? label(363,72,'h = (√3/2)a','#34d399') : ''}</svg>`;
    }

    function renderNavigation() {
        $('formulaGroups').innerHTML = `
            <section class="level-filter" aria-label="교과 수준 필터">
                <div class="filter-heading"><strong>교과 수준 필터</strong><button type="button" id="toggleAllLevels">전체 ${selectedLevels.size === allLevels.length ? '해제' : '선택'}</button></div>
                <div class="level-filter-options">${allLevels.map(level => `
                    <label><input type="checkbox" value="${level}" ${selectedLevels.has(level) ? 'checked' : ''}><span>${level}</span></label>
                `).join('')}</div>
                <p>${selectedLevels.size ? `선택한 ${selectedLevels.size}개 수준의 공식만 표시합니다.` : '한 개 이상의 수준을 선택해 주세요.'}</p>
            </section>
        ` + MATH_FORMULA_GROUPS.map(group => {
            const visibleItems = group.items.filter(number => selectedLevels.has(MATH_FORMULAS.find(item => item.number === number)?.level));
            if (!visibleItems.length) return '';
            return `
            <section class="formula-group">
                <div class="group-heading"><strong>${group.title}</strong><span>${group.range}</span></div>
                <div class="formula-menu">${visibleItems.map(number => {
                    const item = MATH_FORMULAS.find(entry => entry.number === number);
                    return `<button class="formula-menu-btn ${number === formulaNumber ? 'active' : ''}" data-formula="${number}">
                        <span class="formula-number">${String(number).padStart(3, '0')}</span>
                        <span class="formula-title">${item.title}</span>
                        <span class="level-badge level-${item.level}">${item.level}</span>
                    </button>`;
                }).join('')}</div>
            </section>`;
        }).join('');
        document.querySelectorAll('.level-filter input').forEach(input => input.addEventListener('change', () => {
            if (input.checked) selectedLevels.add(input.value);
            else selectedLevels.delete(input.value);
            if (!selectedLevels.size) {
                selectedLevels.add(input.value);
                input.checked = true;
                return;
            }
            const visible = visibleFormulaNumbers();
            if (!visible.includes(formulaNumber)) {
                formulaNumber = visible[0];
                questions = [];
                submitted = false;
                setUrl();
            }
            render();
        }));
        $('toggleAllLevels').addEventListener('click', () => {
            selectedLevels = selectedLevels.size === allLevels.length ? new Set([formula().level]) : new Set(allLevels);
            render();
        });
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
        const refs = MATH_PREREQUISITE_REFS[item.number] || [];
        const guideIds = [...new Set(refs.filter(ref => ref?.guide).map(ref => ref.guide))];
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
                    <ul class="knowledge-list">${item.prerequisites.map((text, index) => {
                        const ref = refs[index];
                        let action = '';
                        if (ref?.formula && ref.formula !== item.number) {
                            const linked = MATH_FORMULAS.find(entry => entry.number === ref.formula);
                            action = `<a class="knowledge-link" href="?formula=${ref.formula}&mode=study">공식 ${String(ref.formula).padStart(3, '0')} · ${linked.title} →</a>`;
                        } else if (ref?.guide) {
                            action = `<a class="knowledge-link guide-link" href="#guide-${ref.guide}">쉬운 개념 설명 ↓</a>`;
                        }
                        return `<li><span>${text}</span>${action}</li>`;
                    }).join('')}</ul>
                </section>

                ${guideIds.length ? `<section class="content-section foundation-section">
                    <h3>🌱 초6을 위한 기초 개념 교실</h3>
                    <p class="foundation-intro">낯선 기호가 나와도 괜찮습니다. 아래 설명을 먼저 읽고 공식으로 돌아오세요.</p>
                    <div class="foundation-list">${guideIds.map(id => {
                        const guide = MATH_FOUNDATION_GUIDES[id];
                        return `<details class="foundation-card" id="guide-${id}" open>
                            <summary><span>${guide.title}</span><small>${guide.curriculum}</small></summary>
                            <div class="foundation-body">
                                <p class="foundation-lead">${guide.intro}</p>
                                <ol>${guide.points.map(point => `<li>${point}</li>`).join('')}</ol>
                                <div class="foundation-example"><strong>예시</strong><p>${guide.example}</p></div>
                                <div class="foundation-caution"><strong>주의</strong><p>${guide.caution}</p></div>
                            </div>
                        </details>`;
                    }).join('')}</div>
                </section>` : ''}

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
            questions = window.MathFormulaQuiz.create(formulaNumber).map(q => ({ ...q, formulaNumber }));
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
                    const result = submitted ? window.MathFormulaQuiz.isCorrect(q, answers[qi]) : null;
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
                ${submitted ? `<div class="score-box">${questions.filter((q, i) => window.MathFormulaQuiz.isCorrect(q, answers[i])).length} / ${questions.length} 정답</div>` : ''}
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
        const visible = visibleFormulaNumbers();
        const visibleIndex = visible.indexOf(formulaNumber);
        $('prevBtn').disabled = visibleIndex <= 0;
        $('nextBtn').disabled = visibleIndex < 0 || visibleIndex === visible.length - 1;
    }

    function init() {
        const params = new URLSearchParams(location.search);
        formulaNumber = Math.min(MATH_FORMULAS.length, Math.max(1, Number(params.get('formula')) || 1));
        mode = params.get('mode') === 'quiz' ? 'quiz' : 'study';
        $('studyModeBtn').addEventListener('click', () => { mode = 'study'; setUrl(); render(); });
        $('quizModeBtn').addEventListener('click', () => { mode = 'quiz'; questions = []; setUrl(); render(); });
        $('prevBtn').addEventListener('click', () => {
            const visible = visibleFormulaNumbers();
            const index = visible.indexOf(formulaNumber);
            if (index > 0) { formulaNumber = visible[index - 1]; questions = []; setUrl(); render(); window.scrollTo(0, 0); }
        });
        $('nextBtn').addEventListener('click', () => {
            const visible = visibleFormulaNumbers();
            const index = visible.indexOf(formulaNumber);
            if (index >= 0 && index < visible.length - 1) { formulaNumber = visible[index + 1]; questions = []; setUrl(); render(); window.scrollTo(0, 0); }
        });
        render();
    }

    return { init };
})();

window.addEventListener('DOMContentLoaded', MathFormulaApp.init);
