const MathFormulaApp = (() => {
    let formulaNumber = 1;
    let mode = 'study';
    let questions = [];
    let answers = {};
    let submitted = false;
    const allLevels = ['초6', '중1', '중2', '중3', '고1', '고2', '고3'];
    let selectedLevels = new Set(allLevels);
    let mobileMenuOpen = true;
    let mobileFilterOpen = false;
    const openGroups = new Set();

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
    const isMobile = () => Boolean(window.matchMedia?.('(max-width: 850px)').matches);
    const activeGroup = () => MATH_FORMULA_GROUPS.find(group => group.items.includes(formulaNumber));
    const saveFilterPreference = () => {
        try { localStorage.setItem('MathFormula_SelectedLevels', JSON.stringify([...selectedLevels])); } catch {}
    };
    const scrollToContent = () => requestAnimationFrame(() =>
        $('content').scrollIntoView({ behavior: 'smooth', block: 'start' }));

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
            return `<svg ${common}><path d="M70 230 L450 230 L260 40 Z" fill="#4facfe12" stroke="#77d9ff" stroke-width="4"/>
                <circle cx="260" cy="151.3" r="78.7" fill="#f472b618" stroke="#f9a8d4" stroke-width="3"/>
                <circle cx="260" cy="151.3" r="5" fill="#ffd166"/><line x1="260" y1="151.3" x2="260" y2="230" stroke="#ffd166" stroke-width="3"/>
                <path d="M260 218h-12v12" fill="none" stroke="#ffd166" stroke-width="2.5"/>
                ${label(279,193,'r','#ffd166')}${label(260,256,'a')}${label(150,126,'c')}${label(370,126,'b')}</svg>`;
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
                <path d="M132 220 A42 42 0 0 0 116 187" fill="none" stroke="#f9a8d4" stroke-width="4"/>
                ${label(264,249,'c')}${label(140,123,'b')}${label(118,210,'A','#f9a8d4')}${label(239,140,'h = b sin A','#ffd166')}</svg>`;
        }
        if (type === 'square' || type === 'rectangle' || type === 'rectangle-diagonal') {
            const x = type === 'square' ? 145 : 105;
            const width = type === 'square' ? 230 : 310;
            return `<svg ${common}><rect x="${x}" y="42" width="${width}" height="185" rx="3" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
                ${type === 'rectangle-diagonal' ? `<line x1="${x}" y1="227" x2="${x + width}" y2="42" stroke="#f9a8d4" stroke-width="4"/>${label(270,120,'d','#f9a8d4')}` : ''}
                ${label(260,252,'a')}${label(x + width + 28,140,type === 'square' ? 'a' : 'b')}</svg>`;
        }
        if (type === 'rhombus' || type === 'quadrilateral') {
            const shape = type === 'rhombus' ? 'M260 30 L450 140 L260 250 L70 140 Z' : 'M70 150 L270 35 L455 135 L245 238 Z';
            const diagonal1 = type === 'rhombus'
                ? '<line x1="70" y1="140" x2="450" y2="140" stroke="#f9a8d4" stroke-width="3"/>'
                : '<line x1="70" y1="150" x2="455" y2="135" stroke="#f9a8d4" stroke-width="3"/>';
            const diagonal2 = type === 'rhombus'
                ? '<line x1="260" y1="30" x2="260" y2="250" stroke="#34d399" stroke-width="3"/><path d="M260 140h13v13" fill="none" stroke="#ffd166" stroke-width="2.5"/>'
                : '<line x1="270" y1="35" x2="245" y2="238" stroke="#34d399" stroke-width="3"/>';
            return `<svg ${common}><path d="${shape}" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
                ${diagonal1}${diagonal2}
                ${label(365,125,'d₁','#f9a8d4')}${label(282,75,'d₂','#34d399')}${type === 'quadrilateral' ? label(280,145,'θ','#ffd166') : ''}</svg>`;
        }
        if (type === 'parallelogram' || type === 'trapezoid') {
            const path = type === 'trapezoid' ? 'M90 225 L430 225 L350 65 L165 65 Z' : 'M80 225 L395 225 L455 65 L140 65 Z';
            return `<svg ${common}><path d="${path}" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
                <line x1="${type === 'trapezoid' ? 165 : 140}" y1="65" x2="${type === 'trapezoid' ? 165 : 140}" y2="225" stroke="#ffd166" stroke-width="3" stroke-dasharray="7 6"/>
                ${label(260,252,type === 'trapezoid' ? 'b' : 'a')}${label(177,150,'h','#ffd166')}${type === 'trapezoid' ? label(258,52,'a') : ''}</svg>`;
        }
        if (['pentagon','pentagon-height','pentagon-diagonal','hexagon','regular-polygon','polygon-diagonals','polygon-angles'].includes(type)) {
            const sides = type === 'hexagon' ? 6 : type.startsWith('pentagon') ? 5 : 8;
            const vertices = Array.from({length:sides}, (_, i) => {
                const angle = -Math.PI / 2 + i * Math.PI * 2 / sides;
                return { x: 260 + 170 * Math.cos(angle), y: 137 + 100 * Math.sin(angle) };
            });
            const points = vertices.map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
            const line = (from, to, color = '#f9a8d4', width = 3) =>
                `<line x1="${from.x.toFixed(1)}" y1="${from.y.toFixed(1)}" x2="${to.x.toFixed(1)}" y2="${to.y.toFixed(1)}" stroke="${color}" stroke-width="${width}"/>`;
            let extras = '';
            if (type === 'pentagon-height') {
                const oppositeMidpoint = { x: (vertices[2].x + vertices[3].x) / 2, y: (vertices[2].y + vertices[3].y) / 2 };
                extras = `${line(vertices[0], oppositeMidpoint, '#ffd166')}<path d="M252 ${oppositeMidpoint.y.toFixed(1)}v-8h8" fill="none" stroke="#ffd166" stroke-width="2"/>${label(278,145,'h','#ffd166')}`;
            } else if (type === 'pentagon-diagonal') {
                extras = vertices.map((point, index) => line(point, vertices[(index + 2) % sides])).join('');
            } else if (type === 'polygon-diagonals' || type === 'polygon-angles') {
                extras = vertices.slice(2, -1).map(point => line(vertices[0], point, type === 'polygon-angles' ? '#ffd166' : '#f9a8d4', 2)).join('');
            } else if (type === 'regular-polygon') {
                extras = vertices.map(point => line({ x: 260, y: 137 }, point, '#34d399', 1.6)).join('');
            } else if (type === 'hexagon') {
                extras = vertices.map(point => line({ x: 260, y: 137 }, point, '#34d399', 1.8)).join('');
            }
            return `<svg ${common}><polygon points="${points}" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>${extras}${label(260,260,'정다각형')}</svg>`;
        }
        if (type === 'vector' || type === 'coordinates' || type === 'centroid' || type === 'median') {
            if (type === 'vector') {
                return `<svg ${common}><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#34d399"/></marker></defs>
                    <path d="M95 225 L430 225 L275 45 Z" fill="#4facfe18" stroke="#77d9ff" stroke-width="3"/>
                    <line x1="95" y1="225" x2="430" y2="225" stroke="#34d399" stroke-width="5" marker-end="url(#arrow)"/>
                    <line x1="95" y1="225" x2="275" y2="45" stroke="#34d399" stroke-width="5" marker-end="url(#arrow)"/>
                    ${label(260,250,'벡터 a','#34d399')}${label(155,120,'벡터 b','#34d399')}</svg>`;
            }
            if (type === 'coordinates') {
                return `<svg ${common}><path d="M60 225 H470 M90 255 V25" stroke="#70839f" stroke-width="2"/>
                    <path d="M90 225 L430 225 L220 55 Z" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
                    <circle cx="90" cy="225" r="5" fill="#ffd166"/><circle cx="430" cy="225" r="5" fill="#ffd166"/><circle cx="220" cy="55" r="5" fill="#ffd166"/>
                    ${label(75,245,'A')}${label(445,245,'B')}${label(220,42,'C')}</svg>`;
            }
            const A = { x: 260, y: 38 }, B = { x: 75, y: 225 }, C = { x: 445, y: 225 };
            const Mbc = { x: 260, y: 225 }, Mac = { x: 352.5, y: 131.5 }, Mab = { x: 167.5, y: 131.5 };
            const medianLines = type === 'centroid'
                ? `<line x1="${A.x}" y1="${A.y}" x2="${Mbc.x}" y2="${Mbc.y}" stroke="#ffd166" stroke-width="2.5"/>
                   <line x1="${B.x}" y1="${B.y}" x2="${Mac.x}" y2="${Mac.y}" stroke="#ffd166" stroke-width="2.5"/>
                   <line x1="${C.x}" y1="${C.y}" x2="${Mab.x}" y2="${Mab.y}" stroke="#ffd166" stroke-width="2.5"/>
                   <circle cx="260" cy="162.7" r="6" fill="#f9a8d4"/>${label(282,160,'G','#f9a8d4')}`
                : `<line x1="${A.x}" y1="${A.y}" x2="${Mbc.x}" y2="${Mbc.y}" stroke="#ffd166" stroke-width="3"/>
                   <circle cx="${Mbc.x}" cy="${Mbc.y}" r="5" fill="#f9a8d4"/>${label(280,215,'M','#f9a8d4')}`;
            return `<svg ${common}><path d="M${A.x} ${A.y} L${B.x} ${B.y} L${C.x} ${C.y} Z" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
                ${medianLines}${label(A.x,A.y-10,'A')}${label(B.x-12,B.y+20,'B')}${label(C.x+12,C.y+20,'C')}</svg>`;
        }
        if (type === 'isosceles' || type === 'heron') {
            return `<svg ${common}><path d="M80 225 L440 225 L260 48 Z" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
                <line x1="260" y1="48" x2="260" y2="225" stroke="#ffd166" stroke-width="3" stroke-dasharray="7 6"/>
                <path d="M260 209h16v16" fill="none" stroke="#ffd166" stroke-width="2"/>
                ${label(260,252,type==='heron'?'c':'a')}${label(154,128,type==='heron'?'b':'b')}${label(367,128,type==='heron'?'a':'b')}${label(279,143,'h','#ffd166')}</svg>`;
        }
        if (['circle','circle-coordinate','circle-angle','secant','tangent-chord','pi-series','sector'].includes(type)) {
            if (type === 'sector') return `<svg ${common}><path d="M170 220 L170 55 A165 165 0 0 1 335 220 Z" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
                <path d="M170 180 A40 40 0 0 1 210 220" fill="none" stroke="#f9a8d4" stroke-width="4"/>
                ${label(218,205,'θ','#f9a8d4')}${label(151,139,'r')}${label(253,246,'r')}${label(285,94,'ℓ','#34d399')}</svg>`;
            if (type === 'pi-series') return `<svg ${common}><circle cx="260" cy="137" r="105" fill="#4facfe10" stroke="#77d9ff" stroke-width="4"/>
                <line x1="155" y1="137" x2="365" y2="137" stroke="#ffd166" stroke-width="3"/>
                ${label(260,126,'d','#ffd166')}${label(260,258,'π = 둘레 ÷ 지름','#34d399')}</svg>`;
            const extras = type === 'circle-coordinate'
                ? `<path d="M35 220 H480 M90 260 V20" stroke="#718096" stroke-width="2"/><circle cx="280" cy="120" r="6" fill="#ffd166"/>${label(306,110,'P(x,y)')}${label(245,166,'C(a,b)')}`
                : type === 'circle-angle'
                    ? `<path d="M260 137 L355 80 M170 198 L355 80 L208 46" fill="none" stroke="#f9a8d4" stroke-width="3"/>${label(295,112,'α','#ffd166')}${label(185,72,'β','#f9a8d4')}`
                    : type === 'secant'
                        ? `<path d="M60 225 L445 70 M60 225 L435 200" stroke="#f9a8d4" stroke-width="3"/>${label(58,248,'P','#ffd166')}`
                        : type === 'tangent-chord'
                            ? `<line x1="55" y1="235" x2="465" y2="235" stroke="#34d399" stroke-width="4"/><path d="M260 235 L390 105 L175 100" fill="none" stroke="#f9a8d4" stroke-width="3"/>${label(292,218,'α','#ffd166')}`
                            : `<line x1="260" y1="137" x2="365" y2="137" stroke="#ffd166" stroke-width="3"/>${label(313,125,'r','#ffd166')}`;
            return `<svg ${common}><circle cx="260" cy="137" r="105" fill="#4facfe10" stroke="#77d9ff" stroke-width="4"/>${extras}</svg>`;
        }
        if (type === 'ellipse' || type === 'ellipse-coordinate') {
            return `<svg ${common}><path d="M45 137 H475 M260 255 V18" stroke="#718096" stroke-width="2"/>
                <ellipse cx="260" cy="137" rx="175" ry="88" fill="#4facfe14" stroke="#77d9ff" stroke-width="4"/>
                <line x1="260" y1="137" x2="435" y2="137" stroke="#ffd166" stroke-width="3"/>
                <line x1="260" y1="137" x2="260" y2="49" stroke="#34d399" stroke-width="3"/>
                ${label(350,126,'a','#ffd166')}${label(278,90,'b','#34d399')}</svg>`;
        }
        if (['sphere','cylinder','cylinder-net','cone','cone-net'].includes(type)) {
            if (type === 'sphere') return `<svg ${common}><circle cx="260" cy="137" r="105" fill="#4facfe14" stroke="#77d9ff" stroke-width="4"/>
                <ellipse cx="260" cy="137" rx="105" ry="30" fill="none" stroke="#34d399" stroke-width="2" stroke-dasharray="7 6"/>
                <line x1="260" y1="137" x2="365" y2="137" stroke="#ffd166" stroke-width="3"/>${label(316,126,'r','#ffd166')}</svg>`;
            if (type.startsWith('cylinder')) return `<svg ${common}><ellipse cx="260" cy="55" rx="115" ry="32" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
                <path d="M145 55 V215 M375 55 V215" stroke="#77d9ff" stroke-width="4"/>
                <ellipse cx="260" cy="215" rx="115" ry="32" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
                <line x1="260" y1="55" x2="260" y2="215" stroke="#ffd166" stroke-width="3" stroke-dasharray="7 6"/>
                <line x1="260" y1="215" x2="375" y2="215" stroke="#34d399" stroke-width="3"/>${label(278,140,'h','#ffd166')}${label(320,204,'r','#34d399')}</svg>`;
            return `<svg ${common}><path d="M260 30 L110 220 M260 30 L410 220" stroke="#77d9ff" stroke-width="4"/>
                <ellipse cx="260" cy="220" rx="150" ry="38" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
                <line x1="260" y1="30" x2="260" y2="220" stroke="#ffd166" stroke-width="3" stroke-dasharray="7 6"/>
                <line x1="260" y1="220" x2="410" y2="220" stroke="#34d399" stroke-width="3"/>
                ${label(278,130,'h','#ffd166')}${label(337,210,'r','#34d399')}${type==='cone-net'?label(350,112,'ℓ','#f9a8d4'):''}</svg>`;
        }
        if (['pyramid','square-pyramid','square-pyramid-height','tetrahedron','tetrahedron-height','cube','cube-net','cuboid'].includes(type)) {
            if (type === 'cube' || type === 'cube-net' || type === 'cuboid') {
                const w=type==='cuboid'?250:180,h=145,x=135,y=85,dx=65,dy=-45;
                return `<svg ${common}><path d="M${x} ${y} h${w} v${h} h-${w} Z M${x} ${y} l${dx} ${dy} h${w} l-${dx} ${-dy} M${x+w} ${y} l${dx} ${dy} v${h} l-${dx} ${-dy}" fill="#4facfe12" stroke="#77d9ff" stroke-width="4"/>
                    ${label(x+w/2,y+h+26,'a')}${label(x+w+dx+18,y+h/2,'c')}${type==='cuboid'?label(x+w+30,y-10,'b'):''}</svg>`;
            }
            const tetra=type.startsWith('tetrahedron');
            const base=tetra?'M115 220 L405 220 L330 120 Z':'M115 220 L405 220 L350 145 L170 145 Z';
            return `<svg ${common}><path d="${base} M260 30 L115 220 M260 30 L405 220 M260 30 L${tetra?'330 120':'350 145'} M260 30 L${tetra?'':'170 145'}" fill="#4facfe14" stroke="#77d9ff" stroke-width="4"/>
                <line x1="260" y1="30" x2="260" y2="180" stroke="#ffd166" stroke-width="3" stroke-dasharray="7 6"/>
                ${label(278,112,'h','#ffd166')}${label(260,250,'a')}</svg>`;
        }
        const isHeight = type === 'equilateral-height';
        const isGeneral = type === 'triangle-area';
        return `<svg ${common}><path d="M140 235 L380 235 L260 27 Z" fill="#4facfe18" stroke="#77d9ff" stroke-width="4"/>
            <line x1="260" y1="27" x2="260" y2="235" stroke="#ffd166" stroke-width="3" ${isGeneral ? 'stroke-dasharray="7 6"' : ''}/>
            <path d="M260 219h16v16" fill="none" stroke="#ffd166" stroke-width="2"/>
            ${label(260,260,isGeneral?'b':'a')}${label(184,130,isGeneral?'':'a')}${label(337,130,isGeneral?'':'a')}${label(280,143,'h','#ffd166')}
            ${isHeight ? label(363,72,'h = (√3/2)a','#34d399') : ''}</svg>`;
    }

    function renderFilter() {
        $('formulaFilter').classList.toggle('open', !isMobile() || mobileFilterOpen);
        $('formulaFilter').innerHTML = `
            <section class="level-filter" aria-label="교과 수준 필터">
                <div class="filter-heading">
                    <div class="filter-heading-main">
                        <strong>교과 수준 필터</strong>
                        <button class="mobile-filter-toggle" type="button" id="mobileFilterToggle">${[...selectedLevels].join(' · ')} ${mobileFilterOpen ? '▲' : '▼'}</button>
                    </div>
                    <button type="button" id="toggleAllLevels">전체 ${selectedLevels.size === allLevels.length ? '해제' : '선택'}</button>
                </div>
                <div class="level-filter-options">${allLevels.map(level => `
                    <label><input type="checkbox" value="${level}" ${selectedLevels.has(level) ? 'checked' : ''}><span>${level}</span></label>
                `).join('')}</div>
                <p>${selectedLevels.size ? `선택한 ${selectedLevels.size}개 수준의 공식만 표시합니다.` : '한 개 이상의 수준을 선택해 주세요.'}</p>
            </section>
        `;
        $('mobileFilterToggle').addEventListener('click', () => {
            mobileFilterOpen = !mobileFilterOpen;
            renderFilter();
        });
        document.querySelectorAll('#formulaFilter .level-filter input').forEach(input => input.addEventListener('change', () => {
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
            saveFilterPreference();
            openGroups.add(activeGroup()?.id);
            render();
        }));
        $('toggleAllLevels').addEventListener('click', () => {
            selectedLevels = selectedLevels.size === allLevels.length ? new Set([formula().level]) : new Set(allLevels);
            saveFilterPreference();
            render();
        });
    }

    function renderNavigation() {
        $('formulaGroups').innerHTML = MATH_FORMULA_GROUPS.map(group => {
            const visibleItems = group.items.filter(number => selectedLevels.has(MATH_FORMULAS.find(item => item.number === number)?.level));
            if (!visibleItems.length) return '';
            const collapsed = isMobile() && !openGroups.has(group.id);
            return `
            <section class="formula-group ${collapsed ? 'mobile-collapsed' : ''}">
                <div class="group-heading">
                    <button class="group-toggle" type="button" data-group-toggle="${group.id}" aria-expanded="${!collapsed}">
                        <strong>${group.title}</strong>
                        <span>${group.range} <b class="group-toggle-icon">${collapsed ? '▼' : '▲'}</b></span>
                    </button>
                </div>
                <div class="formula-menu group-items">${visibleItems.map(number => {
                    const item = MATH_FORMULAS.find(entry => entry.number === number);
                    return `<button class="formula-menu-btn ${number === formulaNumber ? 'active' : ''}" data-formula="${number}">
                        <span class="formula-number">${String(number).padStart(3, '0')}</span>
                        <span class="formula-title">${item.title}</span>
                        <span class="level-badge level-${item.level}">${item.level}</span>
                    </button>`;
                }).join('')}</div>
            </section>`;
        }).join('');
        document.querySelectorAll('[data-group-toggle]').forEach(button => button.addEventListener('click', () => {
            const groupId = button.dataset.groupToggle;
            if (openGroups.has(groupId)) openGroups.delete(groupId);
            else openGroups.add(groupId);
            renderNavigation();
        }));
        document.querySelectorAll('[data-formula]').forEach(button => {
            button.addEventListener('click', () => {
                formulaNumber = Number(button.dataset.formula);
                submitted = false;
                answers = {};
                setUrl();
                openGroups.add(activeGroup()?.id);
                if (isMobile()) mobileMenuOpen = false;
                render();
                if (isMobile()) scrollToContent();
                else window.scrollTo({ top: 0, behavior: 'smooth' });
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
            questions = createCalculationQuestions(formulaNumber).map(q => ({ ...q, formulaNumber }));
            answers = {};
            submitted = false;
        }
        const item = formula();
        const quizLabels = ['원리 이해', '기호·조건', '계산 적용'];
        $('content').innerHTML = `
            <article class="lesson-card">
                <div class="lesson-kicker">FORMULA ${String(item.number).padStart(3, '0')} · RANDOM QUIZ</div>
                <h2>${item.title} 퀴즈</h2>
                <p class="lesson-summary">공식을 직접 대입하고 계산하는 객관식 문제 3개가 매번 새로운 수치로 출제됩니다.</p>
                <div class="quiz-list">${questions.map((q, qi) => {
                    const result = submitted ? window.MathFormulaQuiz.isCorrect(q, answers[qi]) : null;
                    return `<section class="quiz-card ${submitted ? (result ? 'correct' : 'wrong') : ''}">
                        <div class="quiz-label">${quizLabels[qi]} ${qi + 1}</div>
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

    function createLegacyCalculationQuestions(number) {
        const result = [];
        const seen = new Set();
        for (let attempt = 0; attempt < 40 && result.length < 3; attempt += 1) {
            window.MathFormulaQuiz.create(number)
                .filter(question => question.kind === 'choice')
                .forEach(question => {
                    const key = `${question.prompt}|${question.answer}`;
                    if (result.length < 3 && !seen.has(key)) {
                        seen.add(key);
                        result.push({ ...question, level: '계산 연습' });
                    }
                });
        }
        if (result.length < 3 && result.length) {
            while (result.length < 3) {
                const source = result[result.length % result.length];
                result.push({ ...source, prompt: `한 번 더 정확히 계산해 보세요. ${source.prompt}` });
            }
        }
        return result;
    }

    function createCalculationQuestions(number) {
        const item = MATH_FORMULAS.find(entry => entry.number === number);
        const legacyLevel = createLegacyCalculationQuestions(number)[0]?.level || '';
        const group = MATH_FORMULA_GROUPS.find(entry => entry.items.includes(number));
        const related = (group?.items || [])
            .map(value => MATH_FORMULAS.find(entry => entry.number === value))
            .filter(entry => entry && entry.number !== number);
        const shuffle = values => [...values].sort(() => Math.random() - .5);
        const uniqueChoices = (answer, distractors) => {
            const values = [answer, ...shuffle(distractors)].filter(value => value && value !== answer);
            const unique = [...new Set(values)];
            [
                '공식에 나오는 모든 수를 조건과 관계없이 더합니다.',
                '도형의 크기와 상관없이 언제나 같은 값이 나옵니다.',
                '길이와 넓이의 단위를 구분하지 않고 계산합니다.'
            ].forEach(value => { if (unique.length < 4 && !unique.includes(value)) unique.push(value); });
            return shuffle(unique.slice(0, 4));
        };

        const principleIndex = Math.floor(Math.random() * item.steps.length);
        const principleAnswer = item.steps[principleIndex];
        const principleQuestion = {
            level: legacyLevel,
            kind: 'choice',
            prompt: `${item.title}이 만들어지는 과정과 직접 연결되는 설명은?`,
            answer: principleAnswer,
            choices: uniqueChoices(principleAnswer, related.map(entry =>
                entry.steps[principleIndex % entry.steps.length])),
            solution: item.steps.map((step, index) => `${index + 1}. ${step}`).join(' ')
        };

        const symbolIndex = Math.floor(Math.random() * item.symbols.length);
        const [symbol, symbolAnswer] = item.symbols[symbolIndex];
        const symbolQuestion = {
            level: legacyLevel,
            kind: 'choice',
            prompt: `${item.title}의 ${symbol} 기호가 나타내는 뜻은?`,
            answer: symbolAnswer,
            choices: uniqueChoices(symbolAnswer, [
                ...item.symbols.filter((_, index) => index !== symbolIndex).map(([, description]) => description),
                ...related.flatMap(entry => entry.symbols.map(([, description]) => description))
            ]),
            solution: `${symbol}는 ${symbolAnswer} 계산 전에 기호가 어떤 길이·각·넓이를 뜻하는지 먼저 확인합니다.`
        };

        const calculationPool = [];
        const seen = new Set();
        for (let attempt = 0; attempt < 12 && calculationPool.length < 6; attempt += 1) {
            window.MathFormulaQuiz.create(number)
                .filter(question => question.kind === 'choice')
                .forEach(question => {
                    const key = `${question.prompt}|${question.answer}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        calculationPool.push({ ...question, level: legacyLevel });
                    }
                });
        }
        const calculationQuestion = calculationPool[Math.floor(Math.random() * calculationPool.length)];
        return [principleQuestion, symbolQuestion, calculationQuestion].filter(Boolean);
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
        $('mobileFormulaTitle').textContent = `${String(item.number).padStart(3, '0')} · ${item.title}`;
        $('mobileFormulaMeta').textContent = `${item.level} · ${mode === 'quiz' ? '랜덤 퀴즈' : '원리 학습'}`;
        $('mobileListToggle').textContent = mobileMenuOpen ? '목록 닫기 ✕' : '📚 다른 공식 선택';
        $('formulaGroups').classList.toggle('mobile-collapsed', isMobile() && !mobileMenuOpen);
        renderFilter();
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
        try {
            const savedLevels = JSON.parse(localStorage.getItem('MathFormula_SelectedLevels') || '[]');
            const validLevels = savedLevels.filter(level => allLevels.includes(level));
            if (validLevels.length) selectedLevels = new Set(validLevels);
        } catch {}
        if (!selectedLevels.has(formula().level)) selectedLevels.add(formula().level);
        openGroups.add(activeGroup()?.id);
        $('mobileListToggle').addEventListener('click', () => {
            mobileMenuOpen = !mobileMenuOpen;
            render();
            if (!mobileMenuOpen) scrollToContent();
        });
        $('studyModeBtn').addEventListener('click', () => {
            mode = 'study'; setUrl(); render();
            if (isMobile()) scrollToContent();
        });
        $('quizModeBtn').addEventListener('click', () => {
            mode = 'quiz'; questions = []; setUrl(); render();
            if (isMobile()) scrollToContent();
        });
        $('prevBtn').addEventListener('click', () => {
            const visible = visibleFormulaNumbers();
            const index = visible.indexOf(formulaNumber);
            if (index > 0) {
                formulaNumber = visible[index - 1]; questions = []; setUrl(); openGroups.add(activeGroup()?.id); render();
                if (isMobile()) scrollToContent(); else window.scrollTo(0, 0);
            }
        });
        $('nextBtn').addEventListener('click', () => {
            const visible = visibleFormulaNumbers();
            const index = visible.indexOf(formulaNumber);
            if (index >= 0 && index < visible.length - 1) {
                formulaNumber = visible[index + 1]; questions = []; setUrl(); openGroups.add(activeGroup()?.id); render();
                if (isMobile()) scrollToContent(); else window.scrollTo(0, 0);
            }
        });
        render();
    }

    return { init, createCalculationQuestions };
})();

window.addEventListener('DOMContentLoaded', MathFormulaApp.init);
