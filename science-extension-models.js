(function(root){'use strict';
const ids=new Set(['animal-adaptation','animal-lifecycle','plant-lifecycle','flower-seed','body-systems','classification','magnets','sound','optics','electricity','energy-transfer','force-graph','materials','solutions','gases','indicators','combustion','particle-model','erosion','strata','earth-interior','weather-climate','moon-seasons','fair-test','star-sky']);
const text=(x,y,s,extra='')=>`<text x="${x}" y="${y}" class="${extra}${String(s).length<=5?' essential':''}">${s}</text>`,p=(d,color='#0e7490',width=3)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`,circle=(x,y,r,color)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`,rect=(x,y,w,h,color,rx=8)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${color}"/>`,arrow=(d,color='#0e7490')=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="4" marker-end="url(#ex-arrow)"/>`;
const vessel=(x,y,w,h,fill='url(#ex-liquid)')=>`<g filter="url(#ex-shadow)"><path d="M${x} ${y}V${y+h}Q${x+w/2} ${y+h+22} ${x+w} ${y+h}V${y}" fill="${fill}" stroke="#6c8e99" stroke-width="3"/><ellipse cx="${x+w/2}" cy="${y}" rx="${w/2}" ry="9" fill="#eaf4f7" stroke="#87aab3" stroke-width="2"/><path d="M${x+8} ${y+15}V${y+h-10}" stroke="#ffffff99" stroke-width="3" stroke-linecap="round"/></g>`;
const bodyOutline=`<g filter="url(#ex-shadow)"><path d="M275 115Q245 125 235 175L218 270Q228 286 240 263L258 205V310L245 410H290L320 320L345 410H390L375 310V205L395 263Q408 286 419 270L402 175Q392 125 365 115Z" fill="#ede1d1" stroke="#b49f89" stroke-width="3"/><circle cx="320" cy="65" r="48" fill="#ede1d1" stroke="#b49f89" stroke-width="3"/></g>`;

function render(kind,state={}){
if(!ids.has(kind))return null;
const c=Number(state.condition)||0,t=Number(state.time)||0,phase=t%1,step=Number(state.step)||0;
let body='',detail='',caption='',controls=[],title='',customLegends=null,customSteps=null;

if(kind==='animal-adaptation'){
 controls=['연못의 오리','사막의 낙타','극지의 펭귄'];
 customSteps = ['동작 주기 관찰', '원리 비교 단면'];
 customLegends = c === 0 ? ['연못의 오리', '추진 스트로크 (물 젓기)', '회수 스트로크 (발 모으기)', '물갈퀴 전진 추력 (+18.5 N)', '유체 저항 최소화 (1.1 N)'] : c === 1 ? ['사막의 낙타', '접지 단계 (하중 전달)', '패드 팽창 및 압력 분산', '모래 반작용 안정 지지', '압력 P = F / A (2.4 N/cm²)', '모래 전단 침하 방지'] : ['극지의 펭귄', '유선형 항력 최소화 (Cd ≈ 0.03)', '방수 깃털 외피', '정체 공기 단열층 (k = 0.024)', '열전도 88% 차단', '심부 체온 (+38.5℃)'];

 if(c===0){
  const isPower = phase < 0.55;
  const kickP = isPower ? (phase / 0.55) : ((phase - 0.55) / 0.45);
  const thrustW = isPower ? (30 + kickP * 35) : 18;

  body = `<g>
<image href="assets/science/duck-pond.webp" x="14" y="14" width="612" height="412" preserveAspectRatio="xMidYMid slice" rx="14" style="border-radius:14px"/>

<!-- Waterline interface & dynamic wake ripples -->
<path d="M25 338Q170 ${336 + (isPower ? Math.sin(kickP * Math.PI) * 2.5 : 0)} 310 338T615 334" fill="none" stroke="#2a92b0" stroke-width="2" stroke-dasharray="10 6" opacity="0.75"/>
<path d="M220 348Q280 344 350 350" fill="none" stroke="#7acde2" stroke-width="1.2" opacity="0.6"/>

<!-- Fluid dynamics: Water acceleration & Forward reaction vectors -->
<g>
${isPower ? `
<!-- Power stroke: Expelling water backward in vortex stream -->
<path d="M295 338Q${255 - kickP * 30} ${352 + kickP * 12} ${205 - kickP * 35} ${362 + kickP * 18}" fill="none" stroke="#1b9cb8" stroke-width="2.2" stroke-dasharray="6 4" stroke-linecap="round" opacity="0.9"/>
<path d="M330 342Q${285 - kickP * 28} ${358 + kickP * 10} ${235 - kickP * 30} ${368 + kickP * 15}" fill="none" stroke="#3db6d1" stroke-width="1.6" stroke-dasharray="5 4" opacity="0.75"/>
<!-- Karman vortex wake rings -->
<path d="M${240 - kickP * 25} ${350 + kickP * 8}A8 8 0 0 1 ${226 - kickP * 25} ${360 + kickP * 8}" fill="none" stroke="#1b9cb8" stroke-width="1.5" stroke-linecap="round" opacity="0.85"/>
<path d="M${270 - kickP * 20} ${355 + kickP * 6}A9 9 0 0 1 ${254 - kickP * 20} ${366 + kickP * 6}" fill="none" stroke="#48c3dd" stroke-width="1.3" opacity="0.7"/>

<!-- Backward action vector marker -->
<path d="M280 345L${220 - kickP * 30} ${360 + kickP * 12}" fill="none" stroke="#1b9cb8" stroke-width="1.8" stroke-linecap="round" marker-end="url(#ex-arrow-aqua)"/>
<text x="${220 - kickP * 25}" y="${380 + kickP * 10}" style="font-size:10px;font-weight:700;fill:#156b7d">후방 배수 (작용)</text>

<!-- Chest forward thrust vector & dimension bracket -->
<path d="M435 205H${435 + thrustW}" fill="none" stroke="#0e7490" stroke-width="2.6" stroke-linecap="round" marker-end="url(#ex-arrow)"/>
<line x1="435" y1="198" x2="435" y2="212" stroke="#0e7490" stroke-width="1.2"/>
` : `
<!-- Recovery stroke: Laminar boundary streamlines with minimal drag -->
<path d="M280 338Q295 344 315 342" fill="none" stroke="#7acde2" stroke-width="1.4" stroke-dasharray="4 3" opacity="0.8"/>
<path d="M435 205H455" fill="none" stroke="#7acde2" stroke-width="1.8" stroke-linecap="round" opacity="0.8"/>
<text x="462" y="209" style="font-size:10px;font-weight:600;fill:#356673">유체 저항 1.1 N (최소)</text>
`}
</g>

<!-- Top-Left Compact Frosted Badge -->
<rect x="25" y="24" width="320" height="34" rx="8" fill="#ffffffd9" stroke="#9bc5d0" stroke-width="1.2"/>
<circle cx="42" cy="41" r="5" fill="#0e7490"/>
<text x="56" y="46" style="font-size:13px;font-weight:700;fill:#1a4d5c">${isPower ? '1단계: 추진 스트로크 (물갈퀴 전개 · 후방 배수)' : '2단계: 회수 스트로크 (물갈퀴 접힘 · 유체 저항 최소화)'}</text>

<!-- Forward Thrust / Drag Telemetry Badge -->
<rect x="440" y="152" width="160" height="28" rx="6" fill="#ffffffd9" stroke="#9bc5d0" stroke-width="1.2"/>
<text x="520" y="171" style="font-size:11px;font-weight:700;fill:#0e7490;text-anchor:middle">${isPower ? '추진력 +18.5 N (가속 전진)' : '유체 저항 1.1 N (93% 감소)'}</text>

<!-- Bottom Technical Principle Ribbon -->
<rect x="90" y="388" width="460" height="28" rx="7" fill="#ffffffeb" stroke="#b2d4de" stroke-width="1.2"/>
<text x="320" y="406" style="font-size:12px;font-weight:600;fill:#244b56;text-anchor:middle">뉴턴 제3법칙(작용·반작용): 물갈퀴로 물을 밀어내며 그 반작용(+18.5 N)으로 전진해요</text>
</g>`;

  detail = `<g filter="url(#ex-shadow)">
<rect x="14" y="14" width="612" height="412" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
<text x="320" y="48" style="font-size:15px;font-weight:700;fill:#23424b;text-anchor:middle">물갈퀴 개폐 메커니즘과 유체역학(작용·반작용) 단면 분석</text>

<!-- Left Card: Power Stroke -->
<g transform="translate(25, 68)">
  <rect x="0" y="0" width="285" height="275" rx="12" fill="#f5fafe" stroke="#9bc7d6" stroke-width="1.2"/>
  <rect x="15" y="14" width="150" height="24" rx="6" fill="#0e7490"/>
  <text x="90" y="30" style="font-size:12px;font-weight:700;fill:#ffffff;text-anchor:middle">1. 물갈퀴 펼침 (추진 단계)</text>

  <!-- Extended Webbed Foot Technical Diagram -->
  <!-- Phalanges bones -->
  <path d="M142 55L142 175M142 100L85 165M142 100L200 165" stroke="#8a6138" stroke-width="3" stroke-linecap="round"/>
  <!-- Stretched Elastic Webbing with delicate shading -->
  <path d="M85 165Q113 155 142 175Q171 155 200 165L200 120Q142 90 85 120Z" fill="rgba(244, 185, 85, 0.45)" stroke="#c28830" stroke-width="1.5"/>
  <path d="M85 165Q113 155 142 175Q171 155 200 165" stroke="#9e661b" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Stagnation dynamic pressure isobars -->
  <path d="M70 180Q142 165 215 180" fill="none" stroke="#e07a38" stroke-width="1.2" stroke-dasharray="3 2"/>
  <path d="M60 195Q142 178 225 195" fill="none" stroke="#e89458" stroke-width="1.0" stroke-dasharray="4 3" opacity="0.8"/>
  <text x="142" y="192" style="font-size:10px;font-weight:700;fill:#b85516;text-anchor:middle">동압 정체면 (고압 형성)</text>

  <!-- Backward water momentum vectors -->
  <path d="M95 195V225M142 200V232M190 195V225" stroke="#1b9cb8" stroke-width="2" marker-end="url(#ex-arrow-aqua)"/>
  <text x="142" y="244" style="font-size:10px;font-weight:700;fill:#126374;text-anchor:middle">후방 배수 운동량: -Δp</text>

  <!-- Forward reaction arrow -->
  <path d="M142 85V48" stroke="#0e7490" stroke-width="2.5" marker-end="url(#ex-arrow)"/>
  <text x="180" y="65" style="font-size:11px;font-weight:700;fill:#0e7490">반작용 추력</text>

  <rect x="15" y="248" width="255" height="22" rx="5" fill="#0e7490"/>
  <text x="142" y="263" style="font-size:11px;font-weight:700;fill:#ffffff;text-anchor:middle">면적 65cm² → 추진력 +18.5 N (최대 추력)</text>
</g>

<!-- Right Card: Recovery Stroke -->
<g transform="translate(330, 68)">
  <rect x="0" y="0" width="285" height="275" rx="12" fill="#fffcf6" stroke="#dcd0b8" stroke-width="1.2"/>
  <rect x="15" y="14" width="150" height="24" rx="6" fill="#6c5744"/>
  <text x="90" y="30" style="font-size:12px;font-weight:700;fill:#ffffff;text-anchor:middle">2. 물갈퀴 접힘 (회수 단계)</text>

  <!-- Folded Webbed Foot Technical Diagram -->
  <path d="M142 55L142 175M142 100L134 165M142 100L150 165" stroke="#8a6138" stroke-width="3" stroke-linecap="round"/>
  <path d="M134 165L142 175L150 165L146 115L138 115Z" fill="rgba(244, 185, 85, 0.45)" stroke="#c28830" stroke-width="1.5"/>

  <!-- Laminar streamlines wrapping around folded profile -->
  <path d="M105 85Q125 125 105 165" fill="none" stroke="#7acde2" stroke-width="1.4" stroke-dasharray="4 3"/>
  <path d="M180 85Q160 125 180 165" fill="none" stroke="#7acde2" stroke-width="1.4" stroke-dasharray="4 3"/>
  <path d="M90 100Q115 130 90 185" fill="none" stroke="#9fd9e6" stroke-width="1.0" stroke-dasharray="5 4"/>
  <path d="M195 100Q170 130 195 185" fill="none" stroke="#9fd9e6" stroke-width="1.0" stroke-dasharray="5 4"/>

  <text x="142" y="205" style="font-size:10px;font-weight:700;fill:#4a6c78;text-anchor:middle">유선형 층류 통과 (와류 박리 없음)</text>
  <text x="142" y="222" style="font-size:10px;font-weight:600;fill:#6b5847;text-anchor:middle">전면 투영 면적 78% 감소</text>

  <rect x="15" y="248" width="255" height="22" rx="5" fill="#6c5744"/>
  <text x="142" y="263" style="font-size:11px;font-weight:700;fill:#ffffff;text-anchor:middle">면적 14cm² → 저항 1.1 N (93% 저항 감쇄)</text>
</g>

<!-- Bottom Principle Card -->
<rect x="22" y="358" width="596" height="52" rx="8" fill="#ffffffeb" stroke="#cddadc" stroke-width="1.2"/>
<text x="320" y="380" style="font-size:12px;font-weight:700;fill:#203e48;text-anchor:middle">비대칭 유체 저항: 물을 밀 때는 펼쳐 최대 추력을 얻고, 당길 때는 접어 저항을 93% 줄여요</text>
<text x="320" y="398" style="font-size:11px;font-weight:600;fill:#48636c;text-anchor:middle">물갈퀴의 개폐 구조는 물의 점성 저항을 능동적으로 제어하는 고효율 생체 적응이에요</text>
</g>`;

  caption = step === 1 ? '물갈퀴를 펼치면 전면 면적이 65cm²로 넓어져 추진력이 극대화되고, 접으면 14cm²로 줄어 저항을 93% 차단해요.' : (isPower ? '1단계 [추진 스트로크]: 물갈퀴를 펼쳐 대량의 물을 후방으로 밀어내며 반작용(+18.5 N)으로 전진해요.' : '2단계 [회수 스트로크]: 발가락을 오므려 유선형으로 저항(1.1 N)을 최소화하며 다음 젓기를 준비해요.');

 }else if(c===1){
  let stageText = '', areaVal = 280, pVal = '3.9';
  let padW = 28, padH = 8, toeGap = 3, s = 0;

  if(phase < 0.35){
   const p = phase / 0.35;
   stageText = '1단계: 발바닥 접지 · 하중 전달 시작';
   padW = 28 + Math.round(p * 4);
   padH = 8;
   toeGap = 2 + Math.round(p * 2);
   areaVal = 280 + Math.round(p * 40);
   pVal = (1100 / areaVal).toFixed(1);
  }else if(phase < 0.75){
   const p = (phase - 0.35) / 0.40;
   s = Math.sin(p * Math.PI);
   stageText = '2단계: 2엽 탄성 패드 횡팽창 · 면적 420 cm² (압력 2.4 N/cm² 분산)';
   padW = Math.round(32 + s * 9);
   padH = Math.round(8 - s * 1.5);
   toeGap = Math.round(4 + s * 4.5);
   areaVal = Math.round(320 + s * 100);
   pVal = (1100 / areaVal).toFixed(1);
  }else{
   stageText = '3단계: 모래 전단 파괴 방지 · 침하 0.8 cm 안정 보행';
   padW = 32;
   padH = 8;
   toeGap = 4;
   areaVal = 350;
   pVal = '3.1';
  }

  const footGraphic = (cx, cy, w, gap, h) => {
    const lcx = cx - gap * 0.9;
    const rcx = cx + gap * 0.9;
    const lobeW = w * 0.46;
    const lobeH = h;
    return `
    <!-- High-Contrast Sand Compression Berms (모래 융기 파동) -->
    <path d="M ${cx - w - 10} ${cy + 1} Q ${cx - w - 5} ${cy - 2.5} ${cx - w} ${cy + 1}" fill="none" stroke="#d4a359" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M ${cx + w} ${cy + 1} Q ${cx + w + 5} ${cy - 2.5} ${cx + w + 10} ${cy + 1}" fill="none" stroke="#d4a359" stroke-width="1.8" stroke-linecap="round"/>

    <!-- High-Contrast Luminous Boussinesq Pressure Isobars in Sand -->
    <g>
      <!-- Isobar 3: Deep 20% stress boundary -->
      <path d="M ${cx - w * 1.55} ${cy} Q ${cx} ${cy + 34 + s * 9} ${cx + w * 1.55} ${cy}" fill="none" stroke="#0284c7" stroke-width="1.3" stroke-dasharray="4 3" opacity="0.8"/>
      <!-- Isobar 2: Mid 50% stress boundary -->
      <path d="M ${cx - w * 1.15} ${cy + 1} Q ${cx} ${cy + 22 + s * 6} ${cx + w * 1.15} ${cy + 1}" fill="none" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="3 2" opacity="0.9"/>
      <!-- Isobar 1: Core 80% stress bulb -->
      <path d="M ${cx - w * 0.75} ${cy + 2} Q ${cx} ${cy + 12 + s * 4} ${cx + w * 0.75} ${cy + 2}" fill="none" stroke="#38bdf8" stroke-width="2.0" opacity="0.95"/>

      <!-- Radial stress dissipation arrows into sand -->
      <path d="M ${cx - w * 0.65} ${cy + 3} L ${cx - w * 1.05} ${cy + 15 + s * 4} M ${cx - w * 0.3} ${cy + 4} L ${cx - w * 0.45} ${cy + 18 + s * 5} M ${cx} ${cy + 4.5} L ${cx} ${cy + 20 + s * 6} M ${cx + w * 0.3} ${cy + 4} L ${cx + w * 0.45} ${cy + 18 + s * 5} M ${cx + w * 0.65} ${cy + 3} L ${cx + w * 1.05} ${cy + 15 + s * 4}" stroke="#0284c7" stroke-width="1.3" stroke-linecap="round"/>
    </g>

    <!-- Posterior Fibro-Elastic Cushion Heel Pad (후방 탄성 완충 쿠션) -->
    <ellipse cx="${cx}" cy="${cy + 2}" rx="${w * 0.75}" ry="${lobeH * 0.95}" fill="rgba(8, 145, 178, 0.35)" stroke="#0284c7" stroke-width="1.6"/>

    <!-- Left Articulated Digital Toe Pad (좌측 발가락 패드) -->
    <path d="M ${lcx - lobeW} ${cy - 1} Q ${lcx - lobeW * 0.55} ${cy - lobeH - 2} ${lcx} ${cy - lobeH} Q ${lcx + lobeW * 0.25} ${cy - lobeH * 0.4} ${lcx} ${cy + 3} Q ${lcx - lobeW * 0.5} ${cy + lobeH * 0.8} ${lcx - lobeW} ${cy - 1} Z" fill="rgba(6, 182, 212, 0.55)" stroke="#0e7490" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M ${lcx - lobeW * 0.6} ${cy - lobeH - 1.5} Q ${lcx - lobeW * 0.4} ${cy - lobeH - 4.5} ${lcx - lobeW * 0.15} ${cy - lobeH - 1}" fill="#1e293b" stroke="#0f172a" stroke-width="0.8"/>

    <!-- Right Articulated Digital Toe Pad (우측 발가락 패드) -->
    <path d="M ${rcx + lobeW} ${cy - 1} Q ${rcx + lobeW * 0.55} ${cy - lobeH - 2} ${rcx} ${cy - lobeH} Q ${rcx - lobeW * 0.25} ${cy - lobeH * 0.4} ${rcx} ${cy + 3} Q ${rcx + lobeW * 0.5} ${cy + lobeH * 0.8} ${rcx + lobeW} ${cy - 1} Z" fill="rgba(6, 182, 212, 0.55)" stroke="#0e7490" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M ${rcx + lobeW * 0.6} ${cy - lobeH - 1.5} Q ${rcx + lobeW * 0.4} ${cy - lobeH - 4.5} ${rcx + lobeW * 0.15} ${cy - lobeH - 1}" fill="#1e293b" stroke="#0f172a" stroke-width="0.8"/>

    <!-- Central Fibrous Webbing Strain Line (발가락 사이 인장 결) -->
    <line x1="${lcx}" y1="${cy}" x2="${rcx}" y2="${cy}" stroke="#0284c7" stroke-width="1.2" stroke-dasharray="2 1.5"/>
    `;
  };

  body = `<g>
<image href="assets/science/camel-desert.webp" x="14" y="14" width="612" height="412" preserveAspectRatio="xMidYMid slice" rx="14" style="border-radius:14px"/>

<!-- Architectural Center of Gravity symbol ⊕ & Slender Downward Vector -->
<g transform="translate(325, 230)">
  <circle cx="0" cy="0" r="7" fill="none" stroke="#7c5532" stroke-width="1.2" stroke-dasharray="2 2"/>
  <line x1="-9" y1="0" x2="9" y2="0" stroke="#7c5532" stroke-width="1"/>
  <line x1="0" y1="-9" x2="0" y2="9" stroke="#7c5532" stroke-width="1"/>
  <path d="M0 7V${32 + s * 8}" stroke="#6e4624" stroke-width="1.6" stroke-linecap="round" marker-end="url(#ex-arrow-draft)"/>
  <text x="12" y="22" style="font-size:11px;font-weight:700;fill:#5c3818">W = mg (640 N)</text>
</g>

<!-- Front Foot (x=232, y=370): Dual-Lobe Anatomical Cushion & Luminous Isobars -->
${footGraphic(232, 370, padW, toeGap, padH)}

<!-- Hind Foot (x=438, y=372): Dual-Lobe Anatomical Cushion & Luminous Isobars -->
${footGraphic(438, 372, padW, toeGap, padH)}

<!-- Architectural Dimension Line for Front Foot -->
<line x1="${232 - padW}" y1="395" x2="${232 + padW}" y2="395" stroke="#0e7490" stroke-width="1.2"/>
<line x1="${232 - padW}" y1="391" x2="${232 - padW}" y2="399" stroke="#0e7490" stroke-width="1.2"/>
<line x1="${232 + padW}" y1="391" x2="${232 + padW}" y2="399" stroke="#0e7490" stroke-width="1.2"/>
<text x="232" y="407" style="font-size:10px;font-weight:700;fill:#0891b2;text-anchor:middle">접촉 폭 ${(padW * 2 / 3.4).toFixed(0)}cm (면적 ${areaVal} cm²)</text>

<!-- Top-Left Compact Frosted Badge -->
<rect x="25" y="24" width="320" height="34" rx="8" fill="#ffffffd9" stroke="#9bc5d0" stroke-width="1.2"/>
<circle cx="42" cy="41" r="5" fill="#0891b2"/>
<text x="56" y="46" style="font-size:12px;font-weight:700;fill:#164e63">${stageText}</text>

<!-- Real-time Pressure Telemetry Badge -->
<rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffd9" stroke="#9bc5d0" stroke-width="1.2"/>
<text x="517" y="46" style="font-size:12px;font-weight:700;fill:#0891b2;text-anchor:middle">지면 압력: ${pVal} N/cm² (안전)</text>

<!-- Bottom Technical Principle Ribbon -->
<rect x="90" y="388" width="460" height="28" rx="7" fill="#ffffffeb" stroke="#b2d4de" stroke-width="1.2"/>
<text x="320" y="406" style="font-size:12px;font-weight:600;fill:#164e63;text-anchor:middle">압력 P = F / A : 넓은 2엽 탄성 발바닥(420 cm²)으로 지면 압력을 낮춰 모래 위를 걸어요</text>
</g>`;

  const s1 = Math.sin(phase * Math.PI);
  const sinkL = (s1 * 15.0).toFixed(1);
  const sinkR = (s1 * 1.2).toFixed(1);
  const hoofY = 155 + s1 * 38;
  const camelY = 175 + s1 * 4;
  const padW1 = Math.round(96 + s1 * 36);

  detail = `<g filter="url(#ex-shadow)">
<rect x="14" y="14" width="612" height="412" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
<text x="320" y="46" style="font-size:14px;font-weight:700;fill:#2b3a42;text-anchor:middle">접촉 면적(A)과 지면 압력(P = F/A)에 따른 토양 침하역학 비교</text>

<!-- Left Card: Narrow Hoof -->
<g transform="translate(25, 64)">
  <rect x="0" y="0" width="285" height="280" rx="12" fill="#fdf9f7" stroke="#e2b8b0" stroke-width="1.2"/>
  <rect x="15" y="14" width="150" height="24" rx="6" fill="#b83828"/>
  <text x="90" y="30" style="font-size:12px;font-weight:700;fill:#ffffff;text-anchor:middle">1. 좁은 발 (말굽 구조)</text>

  <!-- Sand Bed Profile with Depth Scale -->
  <path d="M15 175H105L120 ${175 + s1 * 38}H165L180 175H270V236H15Z" fill="#ebd6a9"/>
  <line x1="15" y1="175" x2="270" y2="175" stroke="#cbb082" stroke-width="1.5"/>

  <!-- Depth ruler on left -->
  <line x1="28" y1="175" x2="28" y2="230" stroke="#8a7052" stroke-width="1"/>
  <line x1="24" y1="175" x2="28" y2="175" stroke="#8a7052" stroke-width="1"/>
  <text x="32" y="178" style="font-size:8px;font-weight:600;fill:#735c42">0</text>
  <line x1="24" y1="202" x2="28" y2="202" stroke="#8a7052" stroke-width="1"/>
  <text x="32" y="205" style="font-size:8px;font-weight:600;fill:#735c42">-10cm</text>
  <line x1="24" y1="225" x2="28" y2="225" stroke="#8a7052" stroke-width="1"/>
  <text x="32" y="228" style="font-size:8px;font-weight:600;fill:#735c42">-15cm</text>

  <!-- Narrow Leg & Hoof -->
  <rect x="127" y="${hoofY - 65}" width="30" height="65" rx="2" fill="#6d5543" stroke="#483628" stroke-width="1.5"/>
  <path d="M127 ${hoofY}L130 ${hoofY - 10}H154L157 ${hoofY}Z" fill="#382a20"/>

  <!-- Coulomb shear failure slip lines in sand -->
  <path d="M120 ${175 + s1 * 38}Q95 190 80 175M165 ${175 + s1 * 38}Q190 190 205 175" fill="none" stroke="#c94a38" stroke-width="1.2" stroke-dasharray="3 3"/>
  <text x="142" y="${hoofY + 20}" style="font-size:9px;font-weight:700;fill:#b83828;text-anchor:middle">모래 전단 파열 (Slip)</text>

  <!-- Downward concentrated force arrow -->
  <path d="M142 ${hoofY - 82}V${hoofY - 55}" stroke="#b83828" stroke-width="2.5" marker-end="url(#ex-arrow-crimson)"/>

  <rect x="15" y="250" width="255" height="22" rx="5" fill="#b83828"/>
  <text x="142" y="265" style="font-size:11px;font-weight:700;fill:#ffffff;text-anchor:middle">면적 60cm² → 침하 ${sinkL}cm (과부하 파괴)</text>
</g>

<!-- Right Card: Camel Cushion Foot -->
<g transform="translate(330, 64)">
  <rect x="0" y="0" width="285" height="280" rx="12" fill="#f0fdf4" stroke="#86efac" stroke-width="1.2"/>
  <rect x="15" y="14" width="150" height="24" rx="6" fill="#15803d"/>
  <text x="90" y="30" style="font-size:12px;font-weight:700;fill:#ffffff;text-anchor:middle">2. 낙타의 2엽 탄성 쿠션 발</text>

  <!-- Sand Bed Profile -->
  <path d="M15 175H270V236H15Z" fill="#ebd6a9"/>
  <line x1="15" y1="175" x2="270" y2="175" stroke="#cbb082" stroke-width="1.5"/>

  <!-- Anatomical Leg Bones & Digital Cushion -->
  <rect x="129" y="${camelY - 65}" width="26" height="65" rx="2" fill="#a4815b" stroke="#6b5034" stroke-width="1.5"/>

  <!-- High-Contrast Dual-Lobe Digital Cushion Pad (대용량 지방 완충 패드) -->
  <ellipse cx="142" cy="${camelY + 2}" rx="${padW1 / 2}" ry="11" fill="rgba(8, 145, 178, 0.35)" stroke="#0284c7" stroke-width="1.8"/>
  <!-- Left Toe Lobe & Right Toe Lobe in Cross-Section -->
  <ellipse cx="${142 - padW1 * 0.22}" cy="${camelY}" rx="${padW1 * 0.22}" ry="8" fill="rgba(6, 182, 212, 0.55)" stroke="#0e7490" stroke-width="1.5"/>
  <ellipse cx="${142 + padW1 * 0.22}" cy="${camelY}" rx="${padW1 * 0.22}" ry="8" fill="rgba(6, 182, 212, 0.55)" stroke="#0e7490" stroke-width="1.5"/>

  <!-- High-Contrast Luminous Boussinesq stress isobars radiating into sand -->
  <path d="M${142 - padW1 * 0.45} ${camelY + 8}Q142 ${camelY + 22} ${142 + padW1 * 0.45} ${camelY + 8}" fill="none" stroke="#0284c7" stroke-width="1.4" stroke-dasharray="3 2"/>
  <path d="M${142 - padW1 * 0.7} ${camelY + 6}Q142 ${camelY + 36} ${142 + padW1 * 0.7} ${camelY + 6}" fill="none" stroke="#0ea5e9" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.85"/>
  <text x="142" y="${camelY + 30}" style="font-size:9px;font-weight:700;fill:#0369a1;text-anchor:middle">광폭 Boussinesq 등응력선 분산</text>

  <!-- Dimension line for contact width -->
  <line x1="${142 - padW1 / 2}" y1="${camelY + 44}" x2="${142 + padW1 / 2}" y2="${camelY + 44}" stroke="#0369a1" stroke-width="1.2"/>
  <line x1="${142 - padW1 / 2}" y1="${camelY + 40}" x2="${142 - padW1 / 2}" y2="${camelY + 48}" stroke="#0369a1" stroke-width="1.2"/>
  <line x1="${142 + padW1 / 2}" y1="${camelY + 40}" x2="${142 + padW1 / 2}" y2="${camelY + 48}" stroke="#0369a1" stroke-width="1.2"/>

  <rect x="15" y="250" width="255" height="22" rx="5" fill="#15803d"/>
  <text x="142" y="265" style="font-size:11px;font-weight:700;fill:#ffffff;text-anchor:middle">면적 420cm² → 침하 ${sinkR}cm (표면 안정 지탱)</text>
</g>

<!-- Bottom Principle Card -->
<rect x="22" y="356" width="596" height="52" rx="8" fill="#ffffffeb" stroke="#cddadc" stroke-width="1.2"/>
<text x="320" y="378" style="font-size:12px;font-weight:700;fill:#164e63;text-anchor:middle">압력 공식 P = F / A : 동일 하중(1,100 N) 기준, 면적이 7배 넓어 압력이 86% 감소해요</text>
<text x="320" y="396" style="font-size:11px;font-weight:600;fill:#48636c;text-anchor:middle">낙타 발바닥의 2엽 탄성 완충 쿠션은 모래의 한계 지지력 이하로 응력을 고르게 분산시켜요</text>
</g>`;

  caption = step === 1 ? '좁은 발은 압력이 집중되어 15cm 침하하지만, 낙타의 넓은 2엽 쿠션 발은 압력을 86% 분산시켜 모래 위를 1.2cm 미세 침하로 안정 지탱해요.' : (phase < 0.35 ? '1단계 [접지]: 발이 모래 표면에 닿으며 체중이 전달되기 시작해요.' : (phase < 0.75 ? '2단계 [패드 횡팽창]: 체중이 실리자 2엽 탄성 패드가 옆으로 벌어지며 면적을 넓혀 압력(P=F/A)을 대폭 낮춰요.' : '3단계 [지지]: 압력이 모래 한계 지지력을 넘지 않아 푹 빠지지 않고 전진해요.'));
}else{
  const flowOffset = Math.round(phase * 80);
  const pulse = 0.7 + 0.3 * Math.sin(phase * Math.PI * 2);

  body = `<g>
<image href="assets/science/penguin-polar.webp" x="14" y="14" width="612" height="412" preserveAspectRatio="xMidYMid slice" rx="14" style="border-radius:14px"/>

<!-- Hydrodynamic Streamlines along fusiform body -->
<g>
<path d="M50 175Q220 125 360 150T590 162" fill="none" stroke="#68c4db" stroke-width="1.6" stroke-dasharray="14 10" stroke-dashoffset="${flowOffset}" opacity="0.85"/>
<path d="M40 225Q230 185 370 210T600 225" fill="none" stroke="#82d3e5" stroke-width="1.4" stroke-dasharray="12 8" stroke-dashoffset="${flowOffset}" opacity="0.9"/>
<path d="M60 275Q230 245 380 260T610 280" fill="none" stroke="#5cb8cf" stroke-width="1.5" stroke-dasharray="15 10" stroke-dashoffset="${flowOffset}" opacity="0.85"/>
</g>

<!-- Thermal Insulation Boundary Envelope (trapped micro-air down layer) -->
<path d="M295 155Q270 200 272 260Q275 320 330 345" fill="none" stroke="#e09d38" stroke-width="2.2" stroke-linecap="round" opacity="${0.75 + pulse * 0.25}"/>
<path d="M305 162Q282 205 284 258Q286 312 334 338" fill="none" stroke="#f5be58" stroke-width="1.2" stroke-linecap="round" opacity="${0.6 + pulse * 0.3}"/>

<!-- Top-Left Compact Frosted Badge -->
<rect x="25" y="24" width="310" height="34" rx="8" fill="#ffffffd9" stroke="#9bbdc8" stroke-width="1.2"/>
<circle cx="42" cy="41" r="5" fill="#1b6e82"/>
<text x="56" y="46" style="font-size:13px;font-weight:700;fill:#164654">유선형 항력 최소화 (Cd ≈ 0.03) &amp; 4중 단열층</text>

<!-- Telemetry Pill at right -->
<rect x="390" y="24" width="225" height="34" rx="8" fill="#ffffffd9" stroke="#9bbdc8" stroke-width="1.2"/>
<text x="502" y="46" style="font-size:11px;font-weight:700;fill:#1a5262;text-anchor:middle">외기 -30℃ ~ -1.8℃ ──> 심부 +38.5℃ (88% 보존)</text>

<!-- Bottom Principle Ribbon -->
<rect x="90" y="388" width="460" height="28" rx="7" fill="#ffffffeb" stroke="#b2cad2" stroke-width="1.2"/>
<text x="320" y="406" style="font-size:12px;font-weight:600;fill:#203c46;text-anchor:middle">깃털 속 빽빽한 공기층이 대류를 막고, 지방층이 열전도를 차단해 체온을 지켜요</text>
</g>`;

  detail = `<g filter="url(#ex-shadow)">
<rect x="14" y="14" width="612" height="412" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
<text x="320" y="48" style="font-size:15px;font-weight:700;fill:#203e48;text-anchor:middle">펭귄 4중 단열 구조와 열역학적 온도 구배(Temperature Gradient) 단면</text>

<rect x="35" y="68" width="570" height="275" rx="12" fill="#f4f8fa" stroke="#a9c9d4" stroke-width="1.2"/>

<!-- 4 Layer Architecture -->
<path d="M100 95H170V270H100Z" fill="#2d3f4b"/>
<path d="M170 95H310V270H170Z" fill="#d8e8f0"/>
<path d="M310 95H415V270H310Z" fill="#f3dfca"/>
<path d="M415 95H540V270H415Z" fill="#de7d70"/>

<text x="135" y="125" style="font-size:11px;font-weight:700;fill:#ffffff;text-anchor:middle">1. 방수 외피</text>
<text x="135" y="145" style="font-size:10px;font-weight:600;fill:#d8e8f0;text-anchor:middle">미세 깃털</text>
<text x="135" y="160" style="font-size:9px;font-weight:500;fill:#b0c8d4;text-anchor:middle">100개/cm² 방수</text>

<text x="240" y="125" style="font-size:11px;font-weight:700;fill:#1b4f60;text-anchor:middle">2. 정체 공기층</text>
<text x="240" y="145" style="font-size:10px;font-weight:600;fill:#265e70;text-anchor:middle">솜털 공기 포켓</text>
<text x="240" y="160" style="font-size:9px;font-weight:600;fill:#1b4f60;text-anchor:middle">k = 0.024 W/mK</text>
<text x="240" y="175" style="font-size:9px;font-weight:700;fill:#0d6980;text-anchor:middle">(열전도 85% 차단)</text>

<text x="362" y="125" style="font-size:11px;font-weight:700;fill:#5c3e24;text-anchor:middle">3. 피하지방층</text>
<text x="362" y="145" style="font-size:10px;font-weight:600;fill:#6e4b2d;text-anchor:middle">블러버 (두께 2.5cm)</text>
<text x="362" y="160" style="font-size:9px;font-weight:500;fill:#7a583a;text-anchor:middle">열전도 지연재</text>

<text x="477" y="125" style="font-size:11px;font-weight:700;fill:#ffffff;text-anchor:middle">4. 심부 체온</text>
<text x="477" y="145" style="font-size:13px;font-weight:800;fill:#ffffff;text-anchor:middle">+38.5 ℃</text>
<text x="477" y="162" style="font-size:9px;font-weight:500;fill:#ffe5e2;text-anchor:middle">근육·내장 항온</text>

<!-- Temperature Gradient Curve Overlay -->
<line x1="60" y1="240" x2="540" y2="240" stroke="#b2cad2" stroke-width="0.8" stroke-dasharray="3 3"/>
<line x1="60" y1="180" x2="540" y2="180" stroke="#b2cad2" stroke-width="0.8" stroke-dasharray="3 3"/>
<line x1="60" y1="102" x2="540" y2="102" stroke="#b2cad2" stroke-width="0.8" stroke-dasharray="3 3"/>

<path d="M55 240L100 240L170 230L310 135L415 106L540 102" fill="none" stroke="#d43828" stroke-width="2.8" stroke-linecap="round"/>
<circle cx="100" cy="240" r="4.5" fill="#1b9cb8"/>
<text x="75" y="244" style="font-size:10px;font-weight:700;fill:#106b80">-30℃</text>
<circle cx="310" cy="135" r="4.5" fill="#e89838"/>
<text x="310" y="122" style="font-size:10px;font-weight:700;fill:#a85a12;text-anchor:middle">+18℃</text>
<circle cx="540" cy="102" r="4.5" fill="#d43828"/>
<text x="565" y="106" style="font-size:10px;font-weight:700;fill:#b82818">+38.5℃</text>

<path d="M50 180H90" stroke="#1b9cb8" stroke-width="2" marker-end="url(#ex-arrow-aqua)"/>
<text x="70" y="172" style="font-size:10px;font-weight:700;fill:#14697d;text-anchor:middle">극지 혹한</text>
<text x="70" y="196" style="font-size:9px;font-weight:600;fill:#14697d;text-anchor:middle">(-30℃ 침투)</text>

<!-- Bottom Principle Card -->
<rect x="22" y="358" width="596" height="52" rx="8" fill="#ffffffeb" stroke="#cddadc" stroke-width="1.2"/>
<text x="320" y="380" style="font-size:12px;font-weight:700;fill:#203e48;text-anchor:middle">정체 공기층의 열전도 차단: 공기는 열전도율(k=0.024)이 가장 낮아 체온을 효과적으로 지켜요</text>
<text x="320" y="398" style="font-size:11px;font-weight:600;fill:#48636c;text-anchor:middle">빽빽한 방수 깃털이 대류를 막고, 갇힌 공기층과 피하지방층이 전도 열 손실의 88%를 보존해요</text>
</g>`;

  caption = step === 1 ? '공기는 최고의 단열재예요. 빽빽한 방수 깃털로 대류를 차단하고 갇힌 공기층과 피하지방으로 전도 열 손실을 88% 이상 막아요.' : '유선형 체형으로 유체 저항을 최소화(Cd≈0.03)하고 깃털 속 공기층으로 혹한(-30℃) 속에서도 심부 체온(+38.5℃)을 유지해요.';
 }
}else if(kind==='animal-lifecycle'){
 controls=['나비의 한살이','메뚜기의 한살이','개구리의 한살이'];
 const stages=c===0?['알','애벌레','번데기','성충']:c===1?['알','어린 메뚜기','자란 어린 개체','성충']:['알','올챙이','다리 난 올챙이','개구리'];
 const icon=(x,i)=>{
  if(i===0)return Array.from({length:7},(_,j)=>circle(x-20+j*7,210+(j%2)*12,7,'#dfd9b3')).join('');
  if(c===0&&i===1)return Array.from({length:5},(_,j)=>circle(x-34+j*16,225+Math.sin(j)*5,13,'#8ca762')).join('');
  if(c===0&&i===2)return `<path d="M${x-20} 175Q${x+37} 205 ${x} 267Q${x-36} 232 ${x-20} 175Z" fill="#9d8455" stroke="#715d38" stroke-width="2"/>`;
  if(c===0)return `<ellipse cx="${x-25}" cy="205" rx="30" ry="38" fill="#c49366" stroke="#926842" stroke-width="1.5"/><ellipse cx="${x+25}" cy="205" rx="30" ry="38" fill="#dcb878" stroke="#926842" stroke-width="1.5"/>${p(`M${x} 182V255`,'#3f5145',8)}`;
  if(c===2&&i<3)return `${circle(x,210,20,'#6d8f7b')}${p(`M${x-12} 222Q${x+60} 245 ${x+38} 270`,'#6d8f7b',7)}${i===2?p(`M${x-5} 220L${x-34} 247M${x+7} 223L${x+22} 247`,'#507060',4):''}`;
  return `<ellipse cx="${x}" cy="218" rx="${c===1?16+i*7:32}" ry="${c===1?10+i*3:18}" fill="#81995e"/>${c===1&&i===3?`<ellipse cx="${x+4}" cy="205" rx="32" ry="10" fill="#b1bc89"/>`:''}${p(`M${x-15} 230L${x-35} 252L${x-12} 248M${x+15} 230L${x+36} 252L${x+12} 248`,'#527452',5)}`;
 };
 body=stages.map((s,i)=>`<g opacity="${Math.floor(phase*4)===i?1:.7}" filter="url(#ex-shadow)">${circle(90+i*150,218,57,'#e9f1e4')}${icon(90+i*150,i)}<rect x="${55+i*150}" y="302" width="70" height="24" rx="6" fill="#ffffffdf" stroke="#b8d4bb"/>${text(90+i*150,319,s,'center')}${i<3?arrow(`M${151+i*150} 218H${176+i*150}`):''}</g>`).join('');
 detail=`<g filter="url(#ex-shadow)">${icon(205,c===1?1:1)}${icon(435,3)}<rect x="155" y="320" width="100" height="26" rx="6" fill="#ffffffdf" stroke="#a5c4b1"/>${text(205,338,'어린 단계','center')}<rect x="385" y="320" width="100" height="26" rx="6" fill="#ffffffdf" stroke="#a5c4b1"/>${text(435,338,'자란 단계','center')}</g>`;
 caption=c===0?'나비는 알·애벌레·번데기·성충 단계를 거쳐요. 어린 모습과 성충의 모습을 비교해요.':c===1?'메뚜기는 번데기 단계를 거치지 않아요. 어린 개체가 자라는 과정과 나비의 한살이를 구분해요.':'올챙이는 자라면서 다리가 나타나고 꼬리가 줄어들어요. 한살이의 단계와 몸의 변화를 연결해요.';
}else if(kind==='plant-lifecycle'){
 controls=['물·공기·적절한 온도','물이 부족한 조건','발아 뒤 빛이 부족'];
 const growth=c===1?.05:Math.min(1,.3+phase*.7),h=c===2?175:120;
 body=`<g filter="url(#ex-shadow)"><path d="M30 285Q320 260 610 285V420H30" fill="url(#ex-sand)"/><ellipse cx="320" cy="280" rx="24" ry="16" fill="#aa8657" stroke="#82623a" stroke-width="2"/>${p(`M320 290Q302 ${315+growth*45} 318 ${325+growth*55}`,'#94764b',6)}${p(`M320 277Q315 ${260-growth*h/2} 322 ${275-growth*h}`,c===2?'#b9b466':'#6c9356',9)}${growth>.2?`<path d="M320 ${280-growth*h}Q257 ${260-growth*h} 262 ${225-growth*h}Q313 ${220-growth*h} 320 ${280-growth*h}M322 ${280-growth*h}Q372 ${240-growth*h} 389 ${240-growth*h}Q384 ${284-growth*h} 322 ${280-growth*h}" fill="${c===2?'#c8c480':'#7fa564'}"/>`:''}${c!==1?circle(220,325,8,'#6cb4d5'):''}<rect x="200" y="377" width="240" height="26" rx="6" fill="#ffffffdf" stroke="#c0a57e"/>${text(320,395,c===1?'물이 부족하면 발아가 어려워요':'씨에서 뿌리·줄기·잎이 자라요','center')}</g>`;
 detail=`<g filter="url(#ex-shadow)"><ellipse cx="320" cy="200" rx="130" ry="85" fill="#ba925d" stroke="#8c6a3b" stroke-width="3"/><path d="M315 120Q240 200 320 280Q405 200 325 120" fill="#ede1be"/>${p('M320 190Q340 220 317 265','#77925a',13)}<rect x="180" y="335" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#bca07c"/>${text(320,353,'씨 속의 어린 식물 (배) 단면 모형','center')}</g>`;
 caption=c===1?'발아에는 물과 공기, 적절한 온도 등의 조건이 필요해요. 조건을 하나씩 달리해 비교해요.':c===2?'발아 이후의 생장에는 빛이 중요해요. 발아 조건과 계속 자라는 조건을 구분해요.':'씨가 물을 흡수한 뒤 뿌리와 줄기 등이 자라요. 모형의 성장 속도는 실제 날짜나 키를 예측하지 않아요.';
}else if(kind==='flower-seed'){
 controls=['꽃가루가 암술머리로','열매와 씨가 생기는 곳','씨가 퍼지는 모습'];
 if(c<2){
  body=p('M320 390V255','#6b9158',10)+Array.from({length:5},(_,i)=>`<ellipse cx="${320+70*Math.cos(i*1.257)}" cy="${195+65*Math.sin(i*1.257)}" rx="55" ry="35" transform="rotate(${i*72} ${320+70*Math.cos(i*1.257)} ${195+65*Math.sin(i*1.257)})" fill="#ddb1a2" stroke="#b28479" stroke-width="2"/>`).join('')+`<ellipse cx="320" cy="245" rx="38" ry="47" fill="${c===1?'#cfa767':'#96a966'}"/>${p('M320 230V130','#7d8f52',8)}${circle(320,129,15,'#a4b375')}${p('M272 224V170M365 223V169','#b39e5b',5)}${circle(272,165,12,'#dbbe6d')}${circle(365,165,12,'#dbbe6d')}${c===0?circle(272+48*phase,165-36*phase,6.5,'#d9ad4b'):Array.from({length:5},(_,i)=>circle(306+i%2*24,225+Math.floor(i/2)*15,6,'#6e5d3c')).join('')}<rect x="125" y="125" width="50" height="24" rx="6" fill="#ffffffdf" stroke="#c0a96a"/>${text(150,142,'수술')}<rect x="385" y="125" width="50" height="24" rx="6" fill="#ffffffdf" stroke="#8fa463"/>${text(410,142,'암술')}<rect x="210" y="377" width="220" height="26" rx="6" fill="#ffffffdf" stroke="#b59a68"/>${text(320,395,c===0?'꽃가루의 이동: 수분':'꽃의 일부가 열매와 씨로 연결돼요','center')}`;
  detail=`<g filter="url(#ex-shadow)"><path d="M230 110Q320 65 410 110V290Q320 345 230 290Z" fill="#d8c284" stroke="#ab9556" stroke-width="3"/><ellipse cx="320" cy="220" rx="67" ry="82" fill="#f4e8bd"/>`+Array.from({length:6},(_,i)=>circle(294+i%2*50,170+Math.floor(i/2)*45,10,'#7d6e46')).join('')+`<rect x="220" y="367" width="200" height="26" rx="6" fill="#ffffffdf" stroke="#bfa86b"/>${text(320,385,'열매 속 씨의 위치','center')}</g>`;
 }else{
  body=Array.from({length:5},(_,i)=>{const x=100+i*105,y=145+(i%2)*85;return `${p(`M${x} ${y}V${y+65}`,'#95926e',2)}${Array.from({length:7},(_,j)=>p(`M${x} ${y}L${x-28+j*9} ${y-35}`,'#b8c2b3',1.8)).join('')}${circle(x,y+68,5.5,'#87724f')}`;}).join('')+arrow('M70 350Q300 300 570 350')+`<rect x="170" y="377" width="300" height="26" rx="6" fill="#ffffffdf" stroke="#9bb1a8"/>${text(320,395,'바람을 이용하는 씨 · 퍼지는 방법은 다양해요','center')}`;
  detail=body;
 }
 caption=c===0?'꽃가루가 암술머리에 옮겨지는 수분 과정을 살펴봐요. 열매와 씨가 만들어지는 과정과 연결돼요.':c===1?'꽃의 부분 가운데 씨와 열매로 연결되는 위치를 단면으로 관찰해요. 모든 꽃의 모양이 같은 것은 아니에요.':'씨는 바람·물·동물 등 여러 방법으로 퍼질 수 있어요. 이 장면은 바람을 이용하는 한 예예요.';
}else if(kind==='body-systems'){
 controls=['음식의 이동 · 소화','공기의 이동 · 호흡','혈액의 이동 · 순환'];
 body=bodyOutline;
 if(c===0){
  const route=[[320,95],[320,165],[352,202],[329,230],[300,260],[342,280],[282,308],[275,250],[370,250],[370,310],[338,355]],v=phase*(route.length-1),j=Math.min(route.length-2,Math.floor(v)),f=v-j,px=route[j][0]+(route[j+1][0]-route[j][0])*f,py=route[j][1]+(route[j+1][1]-route[j][1])*f;
  body+=`${p('M307 91Q320 98 333 91','#9a6d62',5)}${p('M320 98V170Q320 182 330 190','#ba856e',9)}<path d="M328 178C360 163 390 190 380 218C370 246 339 240 330 224C313 216 317 192 328 178Z" fill="#cf9983" stroke="#93685c" stroke-width="3"/>${p('M330 229Q298 231 295 252Q355 247 355 266Q290 259 290 280Q352 276 349 295Q308 311 281 308','#dbae83',9)}${p('M281 309L275 313V246Q320 231 370 246V306Q371 322 350 331L338 340V365','#a8816c',13)}${circle(px,py,6,'#f2c86b')}${arrow('M301 119V155')}${arrow('M383 263V298')}<rect x="420" y="86" width="40" height="22" rx="5" fill="#fff" stroke="#91a7a5"/>${text(435,98,'입')}${p('M349 92H420','#91a7a5',2)}<rect x="420" y="143" width="40" height="22" rx="5" fill="#fff" stroke="#91a7a5"/>${text(435,155,'식도')}${p('M328 146H420','#91a7a5',2)}<rect x="420" y="202" width="40" height="22" rx="5" fill="#fff" stroke="#91a7a5"/>${text(435,214,'위')}${p('M383 206H420','#91a7a5',2)}<rect x="65" y="271" width="60" height="22" rx="5" fill="#fff" stroke="#91a7a5"/>${text(85,283,'작은창자')}${p('M125 275H279','#91a7a5',2)}<rect x="420" y="278" width="50" height="22" rx="5" fill="#fff" stroke="#91a7a5"/>${text(435,290,'큰창자')}${p('M381 282H420','#91a7a5',2)}`;
  detail=`<g filter="url(#ex-shadow)"><path d="M70 180V340H570V180Q540 90 515 180Q490 90 465 180Q440 90 415 180Q390 90 365 180Q340 90 315 180Q290 90 265 180Q240 90 215 180Q190 90 165 180Q140 90 115 180Q90 90 70 180Z" fill="#d9ae8e" stroke="#ad8269" stroke-width="3"/>${p('M100 300Q120 145 140 300Q170 145 190 300Q220 145 240 300Q270 145 290 300Q320 145 340 300Q370 145 390 300Q420 145 440 300Q470 145 490 300Q520 145 540 300','#b46f64',5)}${p('M95 322H545','#608ea0',8)}${Array.from({length:8},(_,i)=>circle(120+i*55,65+i%2*27,5.5,'#e2c275')).join('')}${arrow('M237 85V180')}<rect x="235" y="35" width="170" height="24" rx="6" fill="#fff" stroke="#b28c74"/>${text(320,49,'잘게 나뉜 영양 성분','center')}<rect x="180" y="398" width="280" height="24" rx="6" fill="#fff" stroke="#608ea0"/>${text(320,414,'일부 영양 성분이 흡수되어 혈액으로 이동해요','center')}</g>`;
 }else if(c===1){
  body+=p('M320 85V175M320 166L273 209M320 166L367 209','#9b796e',9)+`<path d="M300 165Q248 160 248 260Q290 287 309 254V185Z" fill="#c9988e"/><path d="M340 165Q393 160 392 260Q351 287 331 254V185Z" fill="#c9988e"/>${p('M270 210L290 242M370 210L350 242','#9c6b63',3)}${circle(320,100+phase*70,5.5,'#76a9be')}<rect x="420" y="86" width="50" height="22" rx="5" fill="#fff" stroke="#96aaa9"/>${text(435,98,'코·입')}${p('M345 93H420','#96aaa9',2)}<rect x="420" y="139" width="40" height="22" rx="5" fill="#fff" stroke="#96aaa9"/>${text(435,151,'기관')}${p('M328 143H420','#96aaa9',2)}<rect x="420" y="187" width="50" height="22" rx="5" fill="#fff" stroke="#96aaa9"/>${text(435,199,'기관지')}${p('M362 187H420','#96aaa9',2)}<rect x="420" y="242" width="30" height="22" rx="5" fill="#fff" stroke="#96aaa9"/>${text(435,254,'폐')}${p('M393 246H420','#96aaa9',2)}`;
  detail=`<g filter="url(#ex-shadow)"><ellipse cx="320" cy="150" rx="115" ry="80" fill="#dcada2" stroke="#b18276" stroke-width="3"/>${p('M320 35V75','#a3776b',14)}${p('M95 285Q320 350 545 285','#b56c5e',12)}${p('M95 311Q320 375 545 311','#618fa2',9)}${arrow('M240 210V280','#ad7d5e')}${arrow('M400 280V210','#618fa2')}<rect x="230" y="121" width="180" height="24" rx="6" fill="#fff" stroke="#b18276"/>${text(320,135,'폐의 작은 공기주머니 (폐포)','center')}<rect x="110" y="228" width="50" height="22" rx="5" fill="#fff" stroke="#b56c5e"/>${text(135,240,'산소')}<rect x="415" y="228" width="70" height="22" rx="5" fill="#fff" stroke="#618fa2"/>${text(445,240,'이산화탄소')}<rect x="195" y="392" width="250" height="24" rx="6" fill="#fff" stroke="#96aaa9"/>${text(320,406,'혈관 색은 경로를 구분하는 모형 표시','center')}</g>`;
 }else{
  body+=`<path d="M320 185C280 140 260 185 290 220L320 249L350 220C380 183 359 145 320 185Z" fill="#b15e58"/>${p('M320 238L372 270L367 347L350 365','#b5645b',7)}${p('M350 365H288L272 347L268 270L301 225','#578394',7)}${p('M301 182L268 166V128L300 112','#578394',6)}${p('M300 112H345L370 130V167L339 185','#b5645b',6)}${circle(320,120+phase*60,5.5,'#cd665b')}<rect x="410" y="205" width="40" height="22" rx="5" fill="#fff" stroke="#b15e58"/>${text(425,217,'심장')}`;
  detail=`<g filter="url(#ex-shadow)">${circle(320,205,85,'#d0aba0')}${arrow('M130 140H235','#578394')}${arrow('M405 265H515','#b5645b')}<rect x="190" y="362" width="260" height="24" rx="6" fill="#fff" stroke="#b15e58"/>${text(320,376,'심장의 펌프 작용과 이어진 혈관 순환','center')}</g>`;
 }
 body+=`<rect x="180" y="407" width="280" height="24" rx="6" fill="#ffffffdf" stroke="#b8a18c"/>${text(320,421,'기관의 위치와 크기를 단순화한 몸속 모형','center')}`;
 caption=c===0?'음식은 소화 기관을 따라 이동하고 잘게 나뉘어 필요한 성분이 흡수돼요. 공기가 이동하는 길과 구분해요.':c===1?'공기는 호흡 기관으로 들어가요. 폐에서 혈액과 산소·이산화탄소를 주고받는 과정과 연결돼요.':'심장과 혈관을 통해 혈액이 순환해요. 소화·호흡·순환 기관은 서로 협력해 몸의 활동을 도와요.';
}else if(kind==='classification'){
 controls=['현미경으로 세포 관찰','동물·식물 세포 비교','관찰 특징으로 분류'];
 const cell=(x,plant)=>`${plant?rect(x-95,105,190,210,'#c8dcb1',16):`<ellipse cx="${x}" cy="210" rx="95" ry="106" fill="#dfcbba" stroke="#ad8874" stroke-width="4"/>`}${circle(x+15,210,30,plant?'#8aa86f':'#b9888b')}${plant?Array.from({length:7},(_,i)=>`<ellipse cx="${x-63+i*19}" cy="${135+i%2*135}" rx="10" ry="5.5" fill="#6c945e"/>`).join(''):''}<rect x="${x-65}" y="347" width="130" height="24" rx="6" fill="#ffffffdf" stroke="#a0b8a4"/>${text(x,361,plant?'식물 세포 모형':'동물 세포 모형','center')}`;
 body=c===0?`<g filter="url(#ex-shadow)">${p('M150 350H280M210 345V270L165 220M174 170L220 115L252 142L207 198','#5b858f',18)}${rect(152,255,110,12,'#709aa1')}${circle(435,210,105,'#d6e4cb')}${circle(451,205,33,'#869c73')}<rect x="210" y="392" width="220" height="24" rx="6" fill="#ffffffdf" stroke="#8fa9b0"/>${text(320,406,'확대해 보면 세포의 구조가 보여요','center')}</g>`:c===1?cell(175,false)+cell(465,true):`<g filter="url(#ex-shadow)">${rect(70,90,500,235,'#f7f6ec')}${text(110,140,'관찰 기준')}${text(300,140,'표본 A')}${text(455,140,'표본 B')}${p('M80 160H560M80 225H560M80 290H560','#bbd0cc',2)}${text(110,205,'세포벽')}${text(315,205,'있음')}${text(470,205,'없음')}${text(110,270,'엽록체')}${text(315,270,'관찰')}${text(470,270,'미관찰')}<rect x="180" y="367" width="280" height="24" rx="6" fill="#ffffffdf" stroke="#bbd0cc"/>${text(320,381,'한 가지 겉모습보다 여러 관찰 근거','center')}</g>`;
 detail=cell(320,c!==1);
 caption=c===0?'작은 생물의 구조를 확대해 살펴봐요. 현미경 모형은 확대의 관계를 보여 주며 실제 사진은 아니에요.':c===1?'대표적인 동물·식물 세포의 공통점과 차이를 비교해요. 모든 세포가 이 그림과 똑같은 모양이라는 뜻은 아니에요.':'분류 기준을 먼저 정하고 같은 기준으로 표본을 비교해요. 겉모습이 비슷하다는 이유 하나로 같은 무리라고 확정하지 않아요.';
}else if(kind==='magnets'){
 controls=['다른 극을 마주 보기','같은 극을 마주 보기','자석 사이를 멀리','나침반과 가까운 자석'];
 const left=c===2?95:155,right=c===2?420:365,same=c===1;
 body=`<g filter="url(#ex-shadow)">${rect(left,180,120,65,'url(#ex-mag-n)',5)}${rect(left+60,180,60,65,'url(#ex-mag-s)',3)}${rect(right,180,120,65,same?'url(#ex-mag-s)':'url(#ex-mag-n)',5)}${rect(right+60,180,60,65,same?'url(#ex-mag-n)':'url(#ex-mag-s)',3)}${text(left+30,222,'N','center white')}${text(left+90,222,'S','center white')}${text(right+30,222,same?'S':'N','center white')}${text(right+90,222,same?'N':'S','center white')}${same?arrow(`M${left+120} 295H${left+65}`)+arrow(`M${right} 295H${right+60}`):arrow(`M${left+120} 295H${left+165}`)+arrow(`M${right} 295H${right-45}`)}${p(`M${left+20} 174Q320 35 ${right+105} 174M${left+20} 251Q320 375 ${right+105} 251`,'#afbdad',2)}<rect x="200" y="377" width="240" height="26" rx="6" fill="#ffffffdf" stroke="#b0c4ba"/>${text(320,395,same?'같은 극: 서로 밀어내는 방향':'다른 극: 서로 끌어당기는 방향','center')}</g>`;
 detail=`<g filter="url(#ex-shadow)">${rect(90,180,180,70,'url(#ex-mag-n)')}${rect(370,180,180,70,'url(#ex-mag-s)')}${Array.from({length:9},(_,i)=>p(`M${285+i*8} ${105+i%3*35}l9 5`,'#5c7771',2)).join('')}<rect x="200" y="347" width="240" height="26" rx="6" fill="#ffffffdf" stroke="#8fa9a3"/>${text(320,362,'가까운 공간의 자석 작용을 확대','center')}</g>`;
 if(c===3){
  body=`<g filter="url(#ex-shadow)">${circle(300,215,110,'#d3dfdc')}${circle(300,215,93,'#f3f5eb')}${text(300,91,'북 N','center')}${text(300,363,'남 S','center')}<g transform="rotate(${25+Math.sin(t*4)*8} 300 215)"><path d="M300 126L282 215L318 215Z" fill="#c65546"/><path d="M300 304L282 215L318 215Z" fill="#3f7f96"/></g>${circle(300,215,8,'#4a686e')}${rect(465,155,90,50,'url(#ex-mag-n)')}${rect(510,155,45,50,'url(#ex-mag-s)')}${text(486,189,'N','center white')}${text(532,189,'S','center white')}<rect x="170" y="402" width="300" height="26" rx="6" fill="#ffffffdf" stroke="#a4bec4"/>${text(320,417,'가까운 자석이 나침반 방향에 영향을 줄 수 있어요','center')}</g>`;
  detail=body;
 }
 caption=c===3?'나침반 바늘은 자석이에요. 주변에 다른 자석이 가까이 있을 때의 영향을 관찰해요. 표시된 방향은 단순화한 관계이며 실제 각도 측정값은 아니에요.':c===2?'극의 조건을 같게 두고 거리를 달리해 작용을 비교해요. 선은 자기장의 관계를 나타내는 모형이며 실제 실이 아니에요.':same?'같은 극끼리는 서로 밀어내요. 화살표는 두 자석에 작용하는 힘의 방향을 나타내요.':'다른 극끼리는 서로 끌어당겨요. 한쪽만 움직이는 그림과 두 물체에 작용하는 힘을 구분해요.';
}else if(kind==='sound'){
 controls=['작은 진폭 · 같은 빠르기','큰 진폭 · 같은 빠르기','같은 진폭 · 더 빠른 진동'];
 const amp=c===1?58:26,freq=c===2?11:6;let d='';
 for(let x=95;x<=560;x+=3)d+=(x===95?'M':'L')+x+' '+(210+Math.sin((x-95)/465*Math.PI*freq+t*18)*amp);
 body=`<g filter="url(#ex-shadow)">${rect(60,135,38,150,'#a3865c',4)}${rect(560,135,20,150,'#a3865c',4)}${p(d,'#508395',5)}${p('M85 210H575','#b3c7c4',1.5)}<rect x="200" y="87" width="240" height="24" rx="6" fill="#ffffffdf" stroke="#a3bcc0"/>${text(320,102,'실제 줄의 진동을 단순화한 모형','center')}<rect x="180" y="332" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#8fa9b0"/>${text(320,348,c===1?'진폭이 큼 · 더 큰 소리와 연결':c===2?'진동이 빠름 · 더 높은 소리와 연결':'진폭이 작음 · 더 작은 소리와 연결','center')}</g>`;
 detail=`<g filter="url(#ex-shadow)"><path d="M120 130H165L235 90V325L165 285H120Z" fill="#7fa4a6"/>${Array.from({length:5},(_,i)=>p(`M${285+i*48} 130Q${325+i*48+Math.sin(t*8)*5} 210 ${285+i*48} 290`,'#9cb3b7',3.5)).join('')}<rect x="200" y="367" width="240" height="26" rx="6" fill="#ffffffdf" stroke="#9bb1b5"/>${text(320,382,'주변 공기의 진동이 퍼지는 관계','center')}</g>`;
 caption=c===1?'진동의 폭인 진폭을 크게 바꾸었어요. 진동의 빠르기를 같게 두어 소리 크기와 연결해 살펴봐요.':c===2?'같은 시간 동안 더 많이 진동하는 조건이에요. 진폭을 같게 두고 소리 높이와 연결해 비교해요.':'소리는 물체의 진동과 연결돼요. 줄의 움직임과 소리가 생기는 원인을 함께 관찰해요.';
}else if(kind==='optics'){
 controls=['빛과 그림자','거울에서 빛의 반사','볼록렌즈에서 빛의 굴절'];
 if(c===0){
  const shadow=(zoom)=>`<g filter="url(#ex-shadow)">${circle(100,210,zoom?18:25,'#fcd36c')}<path d="M310 145L540 74V346L310 275Z" fill="#3e5663" opacity=".22"/>${rect(540,55,16,310,'#bfd4d4')}${p('M548 74V346','#3b5463',16)}${p('M100 210L310 145L540 74M100 210L310 275L540 346','#dfb958',3.5)}${arrow('M125 210H300','#c99e3a')}${rect(310,145,30,130,'#55707a')}<rect x="75" y="287" width="50" height="22" rx="5" fill="#fff" stroke="#d5b868"/>${text(100,301,'광원','center essential')}<rect x="300" y="307" width="50" height="22" rx="5" fill="#fff" stroke="#55707a"/>${text(325,321,'물체','center essential')}<rect x="505" y="392" width="50" height="22" rx="5" fill="#fff" stroke="#3b5463"/>${text(530,406,'그림자','center essential')}</g>`;
  body=shadow(false);
  detail=shadow(true)+`<rect x="160" y="432" width="320" height="24" rx="6" fill="#ffffffdf" stroke="#b6cbce"/>${text(320,447,'가운데 빛은 차단되고 가장자리 빛은 곧게 진행해요','center')}`;
  caption='빛은 같은 물질 안에서 곧게 진행해요. 물체를 통과하지 못한 빛 때문에 뒤쪽 스크린에 어두운 그림자가 생겨요.';
 }else if(c===1){
  body=`<g filter="url(#ex-shadow)">${p('M345 80V350','#7ea0aa',14)}${p('M345 80L365 90M345 120L365 130M345 160L365 170M345 200L365 210M345 240L365 250M345 280L365 290M345 320L365 330','#b0c5c8',3)}${arrow('M100 100L340 215','#d8af4b')}${arrow('M340 215L100 330','#d8af4b')}${p('M130 215H360','#a5bcc0',2)}<rect x="105" y="235" width="60" height="22" rx="5" fill="#fff" stroke="#a5bcc0"/>${text(135,249,'기준선','essential')}<rect x="180" y="377" width="200" height="26" rx="6" fill="#ffffffdf" stroke="#d8af4b"/>${text(270,393,'들어오는 빛과 반사된 빛','center')}</g>`;
  detail=`<g filter="url(#ex-shadow)">${p('M320 90V340','#7ea0aa',10)}${p('M110 100L320 215L110 330','#d8af4b',5)}${p('M130 215H380','#b0c5c8',2)}<rect x="180" y="377" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#7ea0aa"/>${text(320,393,'거울 면과 수직인 기준선으로 각도 비교','center')}</g>`;
  caption='거울에 도달한 빛은 반사돼요. 기준선에 대한 들어오는 방향과 반사되는 방향의 관계를 관찰해요.';
 }else{
  body=`<g filter="url(#ex-shadow)"><path d="M320 80Q260 210 320 340Q380 210 320 80Z" fill="url(#ex-glass)" stroke="#6d949f" stroke-width="3"/>${p('M70 145H302L490 210M70 210H540M70 275H302L490 210','#d8af4b',3.5)}${circle(490,210,6,'#c49733')}<rect x="170" y="377" width="300" height="26" rx="6" fill="#ffffffdf" stroke="#6d949f"/>${text(320,395,'물질의 경계에서 진행 방향이 달라져요','center')}</g>`;
  detail=`<g filter="url(#ex-shadow)">${rect(180,110,280,200,'#c0dde0')}${p('M90 70L180 150L460 298L530 360','#d8af4b',5)}${p('M125 150H240M405 298H525','#9bb2b9',2)}<rect x="170" y="377" width="300" height="26" rx="6" fill="#ffffffdf" stroke="#9bb2b9"/>${text(320,395,'매질 경계에서 굴절 · 법선은 경계면에 수직','center')}</g>`;
  caption='볼록렌즈는 빛이 물질의 경계를 지날 때 굴절하는 성질을 이용해요. 이 광선 그림은 렌즈의 원리를 단순화했어요.';
 }
}else if(kind==='electricity'){
 controls=['닫힌 회로 · 전구 켜짐','열린 회로 · 전구 꺼짐','전자석 · 전류 있음','전자석 · 전류 없음'];
 const closed=c===0||c===2,magnet=c>=2;
 body=`<g filter="url(#ex-shadow)">${rect(92,205,110,62,'#7c999c')}${text(118,245,'+','center')}${text(177,245,'−','center')}${p('M95 210V110H485V180M485 280V340H145V267','#6e8484',5.5)}${p(closed?'M265 110H330':'M265 110L325 70','#bf9b62',7)}${circle(265,110,5.5,'#516c6f')}${circle(330,110,5.5,'#516c6f')}`;
 if(!magnet)body+=`<path d="M457 262Q420 225 440 186Q485 140 528 186Q550 225 511 262V286H457Z" fill="${closed?'#fae7a0':'#d8e4e2'}" stroke="#719097" stroke-width="3"/>${p('M470 253L480 218L491 238L503 216L509 253','#a98e54',3)}<rect x="445" y="370" width="80" height="24" rx="6" fill="#ffffffdf" stroke="#719097"/>${text(485,385,closed?'전구 켜짐':'전구 꺼짐','center')}`;
 else body+=`${p('M430 222H560','#7c8b91',20)}${Array.from({length:9},(_,i)=>`<ellipse cx="${438+i*12}" cy="${222}" rx="12" ry="35" fill="none" stroke="#ab8348" stroke-width="4"/>`).join('')}${Array.from({length:3},(_,i)=>p(`M${450+i*35} ${closed?281:320}q-10 15 0 20q10 5 10-10`,'#728389',3.5)).join('')}<rect x="360" y="370" width="250" height="24" rx="6" fill="#ffffffdf" stroke="#7c8b91"/>${text(485,385,closed?'철심 가까이 철 물체가 끌려요':'전류를 끄면 작용이 달라져요','center')}`;
 if(closed)body+=circle(145+phase*280,110,5.5,'#d6b461');
 body+=`</g>`;
 detail=`<g filter="url(#ex-shadow)">${p('M100 210H245M395 210H540','#769496',7.5)}${closed?p('M245 210H395','#ba9656',8.5):p('M245 210L375 125','#ba9656',8.5)}${circle(245,210,10,'#506e75')}${circle(395,210,10,'#506e75')}<rect x="200" y="335" width="240" height="26" rx="6" fill="#ffffffdf" stroke="#ba9656"/>${text(320,351,closed?'이어진 경로 · 닫힌 스위치':'끊긴 경로 · 열린 스위치','center')}</g>`;
 caption=magnet?'코일에 전류가 흐르는 조건과 끊는 조건을 비교해요. 전자석의 작용은 회로 연결 상태에 따라 달라져요.':'전구가 켜지려면 전지와 전구 등이 끊기지 않은 회로로 연결돼야 해요. 전류가 전구에서 전부 없어지는 모형은 아니에요.';
}else if(kind==='energy-transfer'){
 controls=['손 발전기 → 전구','전지 → 모터','태양 전지 → 모터'];
 const sourceTitle=c===0?'손 발전기 (운동 에너지)':c===1?'화학 전지 (화학 에너지)':'태양 전지판 (빛 에너지)';
 const targetTitle=c===0?'전구 (빛 + 열 에너지)':'모터 (운동 + 열 에너지)';
 const flowX=195+(phase*245);
 body=`<g filter="url(#ex-shadow)">
<rect x="25" y="20" width="245" height="34" rx="8" fill="#1b2a38cc" stroke="#377363" stroke-width="1.5"/>
${text(38,42,'Every Joule 에너지 전환 시뮬레이션','white')}
<g transform="translate(45, 100)">
  <rect x="0" y="0" width="150" height="175" rx="12" fill="#f4f1e6" stroke="#90a7aa" stroke-width="2"/>
  <rect x="15" y="15" width="120" height="26" rx="6" fill="#00b4d822" stroke="#00b4d8"/>
  <text x="75" y="32" class="center" font-size="12" font-weight="700" fill="#0b6375">에너지 공급원</text>
  ${c===0?`<g transform="translate(75, 105)"><circle r="36" fill="#d2dedd" stroke="#6f8f94" stroke-width="2"/><circle r="12" fill="#9dbbbe"/><path d="M0 0L${30*Math.cos(t*8)} ${30*Math.sin(t*8)}" stroke="#e09d3b" stroke-width="5" stroke-linecap="round"/><circle cx="${30*Math.cos(t*8)}" cy="${30*Math.sin(t*8)}" r="7" fill="#b96a20"/></g>`:c===1?`<g transform="translate(75, 105)"><rect x="-40" y="-30" width="80" height="60" rx="8" fill="#8ca6a2" stroke="#5f7e7a" stroke-width="2"/><text x="-20" y="7" font-size="18" font-weight="700" fill="#fff">+</text><text x="15" y="7" font-size="18" font-weight="700" fill="#fff">−</text></g>`:`<g transform="translate(75, 105)"><rect x="-45" y="-35" width="90" height="70" rx="6" fill="#4a6e87" stroke="#314e63" stroke-width="2"/><path d="M-45 -12H45M-45 12H45M-15 -35V35M15 -35V35" stroke="#7aa4c0" stroke-width="1.5"/><circle cx="0" cy="-60" r="14" fill="#f8cc66" filter="url(#ex-glow-amber)"/><path d="M0 -42V-35" stroke="#e29b28" stroke-width="2.5" marker-end="url(#ex-arrow-amber)"/></g>`}
  <text x="75" y="160" class="center" font-size="12" font-weight="700" fill="#304f56">${sourceTitle.split(' ')[0]}</text>
</g>
<g filter="url(#ex-glow-cyan)">
  <path d="M195 195H445" fill="none" stroke="#00d0ea" stroke-width="6" stroke-linecap="round"/>
  <circle cx="${flowX}" cy="195" r="7" fill="#ffffff" filter="url(#ex-glow-cyan)"/>
  <path d="M425 195L445 195" fill="none" stroke="#00d0ea" stroke-width="6" stroke-linecap="round" marker-end="url(#ex-arrow-cyan)"/>
</g>
<text x="320" y="180" class="center" font-size="12" font-weight="700" fill="#008fa3">전기 에너지 전달 (흐름)</text>
<g transform="translate(445, 100)">
  <rect x="0" y="0" width="150" height="175" rx="12" fill="#f4f1e6" stroke="#90a7aa" stroke-width="2"/>
  <rect x="15" y="15" width="120" height="26" rx="6" fill="#f5ab3522" stroke="#f5ab35"/>
  <text x="75" y="32" class="center" font-size="12" font-weight="700" fill="#996213">에너지 변환 장치</text>
  ${c===0?`<g transform="translate(75, 100)" filter="url(#ex-glow-amber)"><ellipse cx="0" cy="-5" rx="30" ry="34" fill="#fff7d6" stroke="#d4ab48" stroke-width="2"/><path d="M-8 10L-12 25H12L8 10Z" fill="#a4a49c"/><path d="M-10 0Q0 -22 10 0" fill="none" stroke="#f5ab35" stroke-width="3"/></g>`:`<g transform="translate(75, 100)"><circle r="36" fill="#6f9098" stroke="#486870" stroke-width="2"/><path d="M0 0L${32*Math.cos(t*14)} ${32*Math.sin(t*14)}" stroke="#00d0ea" stroke-width="5" stroke-linecap="round" filter="url(#ex-glow-cyan)"/><circle r="8" fill="#dce6e7"/></g>`}
  <text x="75" y="160" class="center" font-size="12" font-weight="700" fill="#304f56">${targetTitle.split(' ')[0]}</text>
</g>
<g filter="url(#ex-glow-amber)" transform="translate(320, 235)">
  <path d="M0 0V55" fill="none" stroke="#f5ab35" stroke-width="3.5" stroke-dasharray="5 3" marker-end="url(#ex-arrow-amber)"/>
  <rect x="-85" y="65" width="170" height="26" rx="6" fill="#f5ab3525" stroke="#f5ab35"/>
  <text x="0" y="82" class="center" font-size="11" font-weight="700" fill="#996213">방출되는 열에너지 (손실)</text>
</g>
<rect x="140" y="386" width="360" height="30" rx="8" fill="#ffffffea" stroke="#b0c8ce" stroke-width="1.5"/>
${text(320, 406, `${sourceTitle} → 전기 전달 → ${targetTitle}`, 'center')}
</g>`;
detail=`<g filter="url(#ex-shadow)">
<rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
<text x="320" y="55" class="center" font-size="18" font-weight="700" fill="#203d47">에너지 보존 법칙 (Every Joule 에너지 흐름도)</text>
<g transform="translate(50, 90)">
  <rect x="0" y="35" width="130" height="155" rx="10" fill="#e2edf0" stroke="#7ba5ad" stroke-width="2"/>
  <text x="65" y="105" class="center" font-size="14" font-weight="700" fill="#1b4d57">입력 에너지</text>
  <text x="65" y="130" class="center" font-size="12" fill="#3b656e">100 Joule</text>
  <path d="M130 65H320Q360 65 360 40H490" fill="none" stroke="#00b4d8" stroke-width="22" filter="url(#ex-glow-cyan)" stroke-linecap="round"/>
  <text x="420" y="28" class="center" font-size="12" font-weight="700" fill="#008fa3">유용한 에너지 변환 (빛/운동)</text>
  <path d="M130 160H260Q320 160 320 200H490" fill="none" stroke="#f5ab35" stroke-width="14" filter="url(#ex-glow-amber)" stroke-linecap="round"/>
  <text x="420" y="190" class="center" font-size="12" font-weight="700" fill="#a46d1e">주변으로 흩어지는 열에너지</text>
  <rect x="100" y="240" width="340" height="32" rx="8" fill="#183642" stroke="#2c5b6e"/>
  <text x="270" y="261" class="center white" font-size="13" font-weight="700">총 에너지 보존: E(입력) = E(유용) + E(열손실)</text>
</g>
<rect x="130" y="375" width="380" height="30" rx="8" fill="#ffffffea" stroke="#b0c8ce" stroke-width="1.5"/>
${text(320, 395, '장치에서 에너지가 새로 생기거나 사라지지 않고 형태만 바뀌어요', 'center')}
</g>`;
caption='에너지가 장치를 거치며 빛·운동·열 등으로 전환돼요. 전체 에너지의 총합은 항상 보존돼요.';
}else if(kind==='force-graph'){
 controls=['추 1개','추 2개','추 3개'];
 const n=Math.min(3,c+1),len=90+n*27;let spring='M165 80';
 for(let i=0;i<12;i++)spring+=`L${i%2?175:155} ${85+i*len/12}`;
 body=`<g filter="url(#ex-shadow)">${p('M85 60H240','#6d8d8e',9)}${p(spring,'#698b94',4.5)}${p(`M165 ${85+len}V${110+len}`,'#698b94',4.5)}${rect(133,105+len,65,n*20,'#a89063')}<rect x="115" y="347" width="100" height="24" rx="6" fill="#ffffffdf" stroke="#a89063"/>${text(165,361,'같은 용수철','center')}${p('M315 320H585M335 340V95','#6e8783',3.5)}${p('M335 320L405 270L475 220L545 170','#6a95a3',3.5)}${[0,1,2].map(i=>circle(405+i*70,270-i*50,i===c?9:5.5,i===c?'#c99d4a':'#6b95a3')).join('')}<rect x="370" y="367" width="180" height="24" rx="6" fill="#ffffffdf" stroke="#6a95a3"/>${text(460,381,'추의 수와 늘어난 길이','center')}${text(346,75,'늘어난 길이')}</g>`;
 detail=`<g filter="url(#ex-shadow)">${p('M180 90V290M380 90V345','#aac0be',3)}${p('M180 90H225M380 90H425','#819d9d',4)}${rect(155,290,50,25,'#b1945d')}${rect(355,345,50,55,'#b1945d')}<rect x="200" y="185" width="240" height="26" rx="6" fill="#ffffffdf" stroke="#819d9d"/>${text(320,202,'처음 길이와 나중 길이의 차이','center')}</g>`;
 caption='같은 용수철에 추를 더하는 조건과 늘어난 길이를 연결해요. 그래프의 선은 물체가 실제로 이동한 길이 아니며, 관찰한 범위의 관계를 나타내요.';
}else if(kind==='materials'){
 controls=['철 막대','마른 나무 조각','투명 플라스틱 판','고무 띠'];
 const color=['#93a5a9','#b89869','#b1d6dd','#b89b77'][c]||'#93a5a9';
 body=`<g filter="url(#ex-shadow)"><path d="M130 155L470 110L535 190L195 235Z" fill="${color}" opacity="${c===2?.45:1}" stroke="#6e8c93" stroke-width="3"/><path d="M195 235L535 190V225L195 270Z" fill="${color}" opacity=".7"/>${c===1?Array.from({length:7},(_,i)=>p(`M${175+i*43} 157L${210+i*43} 205`,'#886c47',1.8)).join(''):''}${c===2?`${p('M245 75V320M375 55V300','#d6b55e',4)}<rect x="200" y="355" width="240" height="26" rx="6" fill="#ffffffdf" stroke="#6e8c93"/>${text(320,372,'뒤의 모양이 비쳐 보여요','center')}`:c===3?`${arrow('M140 310H70')}${arrow('M470 280H560')}<rect x="180" y="355" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#6e8c93"/>${text(320,372,'힘을 주었다 놓을 때의 변형 관찰','center')}`:`<rect x="200" y="350" width="240" height="26" rx="6" fill="#ffffffdf" stroke="#6e8c93"/>${text(320,367,c===0?'재료 표본의 광택과 단단함':'결과 성질을 가진 재료 표본','center')}`}</g>`;
 detail=c===3?`<g filter="url(#ex-shadow)"><path d="M150 210Q320 80 490 210Q320 340 150 210Z" fill="none" stroke="#b49467" stroke-width="28"/>${arrow('M135 210H55')}${arrow('M505 210H585')}<rect x="180" y="360" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#b49467"/>${text(320,377,'같은 띠를 늘렸다 놓아 비교해요','center')}</g>`:`<g filter="url(#ex-shadow)">${rect(80,100,480,220,'#f2f2e5')}${text(120,150,'관찰 항목')}${text(350,150,'이 표본의 특징')}${p('M90 170H550M90 235H550','#b8cdcd',2)}${text(120,210,'빛 통과')}${text(350,210,c===2?'통과해 보임':'잘 통과하지 않음')}${text(120,280,'용도 선택')}${text(350,280,'여러 성질을 함께 비교')}</g>`;
 caption='같은 모양의 표본이라도 재료에 따라 성질이 달라요. 여기서 관찰한 표본의 성질을 그 재료의 모든 종류에 그대로 일반화하지 않아요.';
}else if(kind==='solutions'){
 controls=['적은 설탕 · 충분히 젓기','많은 설탕 · 일부 남음','같은 많은 양 · 따뜻한 물'];
 const remain=c===1?12:c===2?4:0;
 body=vessel(190,130,260,190)+Array.from({length:18},(_,i)=>circle(217+i*53%205,175+i*37%120,4.5,'#e3ece6')).join('')+Array.from({length:remain},(_,i)=>`<rect x="${245+i*17%150}" y="${290+i%2*13}" width="9" height="9" fill="#e2d6b3" stroke="#a69975"/>`).join('')+p(`M390 70L${360+Math.sin(t*8)*20} 260`,'#9e8c67',8)+`<rect x="170" y="365" width="300" height="26" rx="6" fill="#ffffffdf" stroke="#87aab3"/>`+text(320,382,remain?'바닥에 남은 설탕과 녹은 설탕을 구분':'눈에 안 보여도 물질은 남아 있어요','center');
 detail=`<g filter="url(#ex-shadow)">${rect(90,100,460,230,'#cee5e8')}${Array.from({length:24},(_,i)=>circle(115+i*47%400,125+i*29%180,5.5,i%3?'#83b7c5':'#cfb47c')).join('')}<rect x="180" y="370" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#83b7c5"/>${text(320,387,'물과 녹은 설탕을 다르게 표시한 확대 모형','center')}</g>`;
 caption=c===2?'같은 물질의 양을 넣고 물 온도 조건을 바꾸어 비교해요. 모형의 점과 남은 양은 정성적인 설명이며 실제 용해도 수치가 아니에요.':c===1?'설탕을 계속 더하면 같은 물에서 모두 녹지 못하고 일부가 남을 수 있어요. 젓기와 넣은 양을 구분해 살펴요.':'설탕이 녹아 보이지 않아도 물질이 없어진 것은 아니에요. 용액 전체에 퍼져 있는 관계를 확대 모형으로 살펴요.';
}else if(kind==='gases'){
 controls=['닫힌 주사기 · 큰 부피','닫힌 주사기 · 압축','산소와 이산화탄소 성질'];
 if(c<2){
  const end=c===1?365:520;
  body=`<g filter="url(#ex-shadow)">${rect(105,135,440,145,'#d6e9ea',12)}${rect(end,135,18,145,'#72919a',4)}${p(`M${end+18} 208H590`,'#6f8c95',14)}${rect(585,166,12,84,'#6f8c95',4)}${p('M105 190H65V224H105','#6f8c95',5)}${rect(52,180,14,55,'#ab966d',4)}${Array.from({length:12},(_,i)=>circle(130+(i*47%(end-155))+Math.sin(t*6+i)*3,165+i*29%84,7.5,'#68a1b6')).join('')}<rect x="180" y="330" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#72919a"/>${text(320,348,'입자 수·입자 크기 동일 / 간격 변화','center')}<rect x="45" y="285" width="50" height="22" rx="5" fill="#fff" stroke="#ab966d"/>${text(70,299,'막힘','center')}</g>`;
  detail=`<g filter="url(#ex-shadow)">${rect(110,105,c===1?260:420,220,'#d0e4e6')}${Array.from({length:12},(_,i)=>circle(140+i*(c===1?17:29)%((c===1?260:420)-55),140+i*37%155,9.5,'#68a1b6')).join('')}<rect x="180" y="375" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#68a1b6"/>${text(320,392,'기체도 공간을 차지하고 압축될 수 있어요','center')}</g>`;
 }else{
  body=[175,465].map((x,i)=>`${vessel(x-80,110,160,210,'#dce8e5')}${p(`M${x} 235V300`,'#9e8f69',14)}${i===0?`<path d="M${x} 170Q${x-30} 210 ${x} 235Q${x+30} 210 ${x} 170Z" fill="#e5bb5d"/>`:''}<rect x="${x-75}" y="355" width="150" height="24" rx="6" fill="#ffffffdf" stroke="#9e8f69"/>${text(x,370,i===0?'산소가 있는 조건':'이산화탄소가 많은 조건','center')}`).join('');
  detail=`<g filter="url(#ex-shadow)"><rect x="180" y="115" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#72919a"/>${text(320,132,'같은 가상 장치에서 반응을 비교','center')}${rect(120,180,400,110,'#e8eee0')}${text(320,225,'산소: 연소를 도울 수 있음','center')}${text(320,265,'이산화탄소: 성질이 다름','center')}</g>`;
 }
 caption=c<2?'주사기 입구를 막은 채 부피를 줄이면 같은 기체가 더 좁은 공간을 차지해요. 기체 입자 자체를 작게 그리지 않아요.':'기체마다 성질이 달라요. 이 장면은 가상 비교이며 산소 자체가 연료처럼 타는 물질이라는 뜻은 아니에요.';
}else if(kind==='indicators'){
 controls=['산성 용액 · BTB','중성 용액 · BTB','염기성 용액 · BTB','같은 염기성 · 다른 지시약'];
 const color=['#dec75b','#7bb883','#6da3c2','#8ba973'][c]||'#7bb883';
 body=`<g filter="url(#ex-shadow)">${p('M180 100V300Q180 342 220 342Q260 342 260 300V100','#7e9da4',5.5)}<path d="M185 200V300Q185 335 220 335Q255 335 255 300V200Z" fill="${color}"/><ellipse cx="220" cy="200" rx="35" ry="8" fill="${color}"/>${rect(380,120,170,170,'#f3f1e5')}${text(465,159,'관찰 색 표','center')}${[0,1,2].map((i)=>rect(400,185+i*29,35,18,['#dec75b','#7bb883','#6da3c2'][i],4)+text(450,199+i*29,['산성','중성','염기성'][i])).join('')}${circle(220,80+phase*90,7.5,color)}<rect x="180" y="375" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#7e9da4"/>${text(320,392,'색 변화는 지시약과 용액을 함께 확인','center')}</g>`;
 detail=`${vessel(120,145,155,170,'#6da3c2')}${vessel(365,145,155,170,'#8ba973')}<rect x="150" y="345" width="95" height="24" rx="6" fill="#fff" stroke="#6da3c2"/>${text(198,360,'BTB','center')}<rect x="365" y="345" width="155" height="24" rx="6" fill="#fff" stroke="#8ba973"/>${text(442,360,'적양배추 지시약 모형','center')}`;
 caption=c===3?'같은 염기성 용액도 지시약이 다르면 관찰 색이 달라요. 모든 지시약이 같은 색 규칙을 가진 것은 아니에요.':'가상 용액에 BTB 지시약을 넣었을 때의 색을 표와 비교해 분류해요. 용액 이름이나 투명한 겉모습만으로 판단하지 않아요.';
}else if(kind==='combustion'){
 controls=['산소 공급 · 연소 지속','산소 공급이 부족','냉각하는 소화 원리'];
 const active=c===0;
 body=`<g filter="url(#ex-shadow)">${rect(280,235,80,125,'#d6c49e',6)}${p('M320 235V206','#765f46',6)}${active?`<path d="M320 120Q270 184 320 218Q370 185 320 120Z" fill="#e59f42"/><path d="M320 160Q298 194 320 218Q341 193 320 160Z" fill="#f8e08d"/>`:circle(320,212,5.5,'#948f80')}${c===1?`<path d="M200 350V100Q320 40 440 100V350" fill="url(#ex-glass)" stroke="#5f8894" stroke-width="5"/>`:c===2?`${arrow('M490 135L370 220','#6ea5ba')}${Array.from({length:8},(_,i)=>circle(390+i*14,180+i%3*13,4.5,'#8ec0ce')).join('')}`:`${arrow('M120 190H255','#76a2ad')}${arrow('M515 190H385','#76a2ad')}`}<rect x="180" y="382" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#5f8894"/>${text(320,400,'가상 모형으로 연소와 소화의 조건 관찰','center')}</g>`;
 detail=`<g filter="url(#ex-shadow)">${rect(90,130,460,185,'#edf1e1')}${text(320,175,'연료 + 산소 공급 + 발화 조건','center')}${p('M170 220H470','#adc0aa',3)}${text(320,275,c===1?'산소 공급을 줄이는 관계':c===2?'온도를 낮추는 관계':'필요 조건을 함께 살펴요','center')}</g>`;
 caption=c===0?'연소에는 연료와 산소 공급, 알맞은 발화 조건 등이 필요해요. 산소와 연료의 역할을 구분해요.':c===1?'산소 공급이 부족해지는 조건에서는 연소가 유지되기 어려워요. 모형의 덮개는 원리를 설명하는 가상 장치예요.':'냉각해 연소 조건을 바꾸는 소화 원리를 살펴봐요. 이 장면은 가상 모형이며 실제 화재의 모든 소화 방법을 정하는 안내는 아니에요.';
}else if(kind==='particle-model'){
 controls=['고체의 배열','액체의 배열과 움직임','기체의 간격과 움직임','기체를 압축'];
 const gas=c>=2,w=c===3?250:430;
 body=`<g filter="url(#ex-shadow)">`+rect(100,95,w,250,'url(#ex-glass)')+Array.from({length:20},(_,i)=>{
  let x=135+(i%5)*(gas?(w-65)/4:45),y=gas?130+Math.floor(i/5)*55:240+Math.floor(i/5)*25;
  if(c!==0){x+=Math.sin(t*(gas?8:4)+i)*(gas?10:4);y+=Math.cos(t*(gas?6:3)+i)*(gas?9:4);}
  return circle(x,y,8.5,'#5a93a8');
 }).join('')+`<rect x="160" y="377" width="320" height="26" rx="6" fill="#ffffffdf" stroke="#5a93a8"/>${text(320,395,'같은 입자 크기·개수 / 배열·간격·운동 비교','center')}</g>`;
 detail=`<g filter="url(#ex-shadow)">${circle(220,210,33,'#6da1b3')}${circle(420,210,33,'#6da1b3')}${p('M270 210H370','#9bb4b2',3.5)}<rect x="160" y="335" width="320" height="26" rx="6" fill="#ffffffdf" stroke="#6da1b3"/>${text(320,352,'점은 입자 자체의 사진이나 실제 크기가 아니에요','center')}</g>`;
 caption=c===3?'같은 수의 기체 입자가 더 좁은 공간에 있도록 나타냈어요. 압축했다고 입자 자체의 크기를 줄이지 않아요.':'입자 모형으로 상태의 배열·간격·운동 차이를 설명해요. 색 구슬을 실제 물질 속에서 보이는 알갱이와 혼동하지 않아요.';
}else if(kind==='erosion'){
 controls=['완만한 흐름','빠르고 강한 흐름','파도가 바꾸는 해안'];
 if(c<2){
  body=`<g filter="url(#ex-shadow)"><path d="M45 160L210 100L600 230V370L350 405L45 280Z" fill="#c3aa80" stroke="#938062" stroke-width="3"/><path d="M45 160L210 100L600 230L350 290Z" fill="#d9ce9e"/><path d="M180 120Q230 220 350 235Q430 250 485 300L535 274Q450 222 355 215Q250 205 220 109Z" fill="${c?'#65a3bf':'#8fc3d3'}"/>${Array.from({length:c?15:6},(_,i)=>circle(260+((phase+i*.08)%1)*240,205+((phase+i*.08)%1)*75,3.5+i%2,'#988052')).join('')}<path d="M470 282L585 290L540 335L480 320Z" fill="#bfae7b"/><rect x="70" y="315" width="40" height="22" rx="5" fill="#fff" stroke="#938062"/>${text(90,329,'깎임')}<rect x="330" y="175" width="40" height="22" rx="5" fill="#fff" stroke="#65a3bf"/>${text(350,189,'운반')}<rect x="525" y="355" width="40" height="22" rx="5" fill="#fff" stroke="#bfae7b"/>${text(545,369,'쌓임')}</g>`;
  detail=`<g filter="url(#ex-shadow)"><path d="M80 130H560V320H80Z" fill="#d6be94"/><path d="M80 130H220Q290 250 355 155L560 130V95H80Z" fill="#a6ccd2"/>${arrow('M200 210Q340 260 480 210')}<rect x="180" y="372" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#938062"/>${text(320,390,'흐르는 물이 알갱이를 옮기는 단면','center')}</g>`;
 }else{
  body=`<g filter="url(#ex-shadow)"><path d="M70 130L325 105L420 185V360L70 330Z" fill="#c4ab82"/><path d="M325 105L420 185L395 315L300 290Z" fill="#9f8865"/><path d="M370 285Q440 245 640 260V420H330Z" fill="#81b8cc"/>${Array.from({length:4},(_,i)=>p(`M${380+i*55} ${290+i*16}q35 -30 65 0`,'#cce1e3',4.5)).join('')}<rect x="150" y="365" width="140" height="24" rx="6" fill="#ffffffdf" stroke="#81b8cc"/>${text(220,381,'바닷물과 해안의 변화','center')}</g>`;
  detail=`<g filter="url(#ex-shadow)"><path d="M95 95H365V215L330 280H95Z" fill="#c3aa7e"/>${p('M350 260Q430 220 550 260','#6aa3bd',18)}${circle(365,300,15,'#b19770')}${circle(400,320,12,'#b19770')}<rect x="180" y="372" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#6aa3bd"/>${text(320,390,'파도와 해안 암석의 관계를 단순화','center')}</g>`;
 }
 caption=c===2?'파도는 해안을 깎거나 물질을 옮겨 쌓을 수 있어요. 이 모형만으로 실제 해안의 형성 시간과 원인을 모두 설명하지 않아요.':'물의 흐름이 지표의 물질을 깎고 운반하고 쌓는 관계를 관찰해요. 경사와 흐름의 조건을 달리한 정성 모형이에요.';
}else if(kind==='strata'){
 controls=['퇴적층이 쌓이는 순서','지층 단면과 화석','암석 표본 비교'];
 if(c<2){
  const colors=['#9f8a65','#af9b78','#c9b990','#d9ca9e'];
  body=`<g filter="url(#ex-shadow)"><path d="M85 100L235 50L550 150L400 200Z" fill="#dbd1a8"/>`+colors.map((col,i)=>`<path d="M85 ${120+i*53}Q240 ${135+i*53} 400 ${200+i*35}L550 ${150+i*35}V${185+i*35}L400 ${235+i*35}Q240 ${180+i*53} 85 ${170+i*53}Z" fill="${col}" stroke="#938062" stroke-width="1.5"/>`).join('')+`${p('M240 230Q260 198 280 230Q260 250 240 230','#70694e',3)}${p('M255 210V240M245 216L271 233M270 216L247 234','#70694e',2)}<rect x="170" y="372" width="300" height="26" rx="6" fill="#ffffffdf" stroke="#938062"/>${text(320,390,c===0?'흐트러지지 않은 층 · 아래쪽부터 비교':'지층 속 화석의 위치를 단서로 관찰','center')}</g>`;
  detail=`<g filter="url(#ex-shadow)">${rect(110,95,420,55,'#d9ca9e')}${rect(110,150,420,55,'#c9b990')}${rect(110,205,420,55,'#af9b78')}${rect(110,260,420,55,'#9f8a65')}${p('M230 220Q275 185 320 220Q275 250 230 220','#68634b',4)}<rect x="180" y="365" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#68634b"/>${text(320,382,'층과 포함된 흔적을 함께 기록해요','center')}</g>`;
 }else{
  body=`<g filter="url(#ex-shadow)">`+[['퇴적암','#c4af83'],['화성암','#818b8c'],['변성암','#a1958b']].map(([s,col],i)=>`<path d="M${75+i*190} 180L${135+i*190} 130L${205+i*190} 190L${185+i*190} 280L${100+i*190} 285Z" fill="${col}" stroke="#6e7a73" stroke-width="3"/>${i===0?p(`M${92+i*190} 215H${194+i*190}M${100+i*190} 245H${187+i*190}`,'#937f60',3):i===1?Array.from({length:20},(_,j)=>circle(290+j*19%85,177+j*23%80,2.5,'#516c6c')).join(''):p('M470 190L555 225M465 210L550 245M475 245L540 270','#756b63',4.5)}<rect x="${105+i*190}" y="333" width="80" height="24" rx="6" fill="#ffffffdf" stroke="#6e7a73"/>${text(145+i*190,348,s,'center')}`).join('')+`</g>`;
  detail=body;
 }
 caption=c===2?'암석 표본의 알갱이와 무늬를 비교해요. 모든 암석에 화석이 들어 있는 것은 아니며 한 특징만으로 이름을 확정하지 않아요.':'지층의 겹침과 화석 같은 흔적을 함께 살펴 과거 환경의 단서를 찾아요. 아래가 오래되었다는 해석은 뒤집히지 않은 단순한 층을 가정해요.';
}else if(kind==='earth-interior'){
 controls=['화산의 내부','단층에서 생기는 지진','판 경계의 움직임'];
 if(c===0){
  body=`<g filter="url(#ex-shadow)"><path d="M35 340L250 160L290 115L345 125L395 170L610 340Z" fill="#a59473" stroke="#776c54" stroke-width="3"/><path d="M150 340L285 180L315 160L348 190L470 340Z" fill="#c7b38b"/><ellipse cx="320" cy="337" rx="95" ry="35" fill="#bd7c55"/>${p('M320 325V180L300 135','#bd7c55',28)}${p('M320 260L380 230','#b27a55',12)}${circle(320,310-phase*120,7.5,'#db9d6a')}<rect x="460" y="340" width="50" height="22" rx="5" fill="#fff" stroke="#bd7c55"/>${text(485,354,'마그마')}<rect x="180" y="385" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#776c54"/>${text(320,402,'지하의 물질이 올라오는 경로 · 단면','center')}</g>`;
  detail=`<g filter="url(#ex-shadow)">${rect(100,105,440,235,'#c3af8c')}${p('M275 340V230L320 175L340 100','#b47855',30)}${arrow('M285 280L320 200','#bc875b')}<rect x="180" y="377" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#776c54"/>${text(320,395,'화산 분출과 지하 통로를 연결해요','center')}</g>`;
 }else{
  const shift=c===2?18:8+phase*15;
  body=`<g filter="url(#ex-shadow)"><path d="M60 140L260 90L320 155L130 215Z" fill="#d5c095"/><path d="M60 140L130 215V350L60 280Z" fill="#a48c68"/><path d="M130 215L320 155V290L130 350Z" fill="#bfa57d"/><g transform="translate(${shift} ${-shift})"><path d="M345 155L520 100L590 160L410 220Z" fill="#d5c095"/><path d="M345 155L410 220V355L345 290Z" fill="#9e8564"/><path d="M410 220L590 160V295L410 355Z" fill="#bfa57d"/></g>${arrow('M220 290L270 250')}${arrow('M450 270L400 310')}${circle(326,300,13,'#be9167')}<rect x="170" y="390" width="300" height="26" rx="6" fill="#ffffffdf" stroke="#a48c68"/>${text(320,407,c===1?'끊어진 면에서 땅이 갑자기 움직이는 관계':'판의 경계와 여러 지표 변화','center')}</g>`;
  detail=`<g filter="url(#ex-shadow)">${p('M90 150H295L350 285H550','#ad916b',35)}${p('M90 240H265L320 375H550','#ccb88f',35)}${p('M280 70L390 390','#748580',4.5)}<rect x="180" y="405" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#748580"/>${text(320,422,'지층과 단층의 상대 위치를 비교','center')}</g>`;
 }
 caption=c===0?'화산은 지하의 마그마 등이 지표로 나오는 과정과 연결돼요. 지하 통로와 분출 위치를 단면으로 살펴봐요.':'단층과 판 경계의 움직임이 땅의 흔들림과 연결될 수 있어요. 모든 지진이 화산 폭발 때문에 생긴다고 설명하지 않아요.';
}else if(kind==='weather-climate'){
 controls=['낮 · 해풍','밤 · 육풍','짧은 기간 날씨 자료','긴 기간 기후 자료'];
 if(c<2){
  const day=c===0;
  body=`<g filter="url(#ex-shadow)">${rect(20,285,300,145,'url(#ex-water)')}${rect(320,285,300,145,'url(#ex-sand)')}${circle(105,95,day?29:22,day?'#e0b75e':'#b8c3c7')}<rect x="135" y="353" width="60" height="24" rx="5" fill="#fff" stroke="#68a5bc"/>${text(165,368,'바다','center')}<rect x="440" y="353" width="60" height="24" rx="5" fill="#fff" stroke="#bda57b"/>${text(470,368,'육지','center')}<rect x="95" y="253" width="140" height="24" rx="5" fill="#fff" stroke="#68a5bc"/>${text(165,268,day?'상대적으로 차가움':'상대적으로 따뜻함','center')}<rect x="400" y="253" width="140" height="24" rx="5" fill="#fff" stroke="#bda57b"/>${text(470,268,day?'상대적으로 따뜻함':'상대적으로 차가움','center')}${arrow(day?'M175 235H455':'M455 235H175')}${arrow(day?'M470 210V130':'M170 210V130')}${arrow(day?'M450 110H195':'M195 110H450')}${circle(day?175+phase*280:455-phase*280,235,5.5,'#8ab1c2')}</g>`;
  detail=`<g filter="url(#ex-shadow)">${rect(70,250,500,60,'#c4ae87')}${arrow('M320 235V100')}${arrow('M160 160Q210 200 280 220')}${arrow('M480 160Q430 200 360 220')}<rect x="180" y="355" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#c4ae87"/>${text(320,372,'지표의 가열 차이와 공기 흐름을 연결','center')}</g>`;
 }else{
  const data=c===2?[175,220,155,245,190,230]:[235,225,215,195,175,155];
  body=`<g filter="url(#ex-shadow)">${rect(65,65,510,300,'#eff1e7')}${p('M110 315H555M110 330V100','#81958d',3.5)}${data.map((y,i)=>circle(145+i*72,y,6.5,'#66919d')).join('')}${p(data.map((y,i)=>(i?'L':'M')+(145+i*72)+' '+y).join(''),'#66919d',3.5)}<rect x="220" y="380" width="230" height="26" rx="6" fill="#ffffffdf" stroke="#81958d"/>${text(335,398,c===2?'며칠 동안의 관찰 예시':'장기간 평균의 변화 예시','center')}${text(130,85,'온도')}</g>`;
  detail=`<g filter="url(#ex-shadow)">${text(320,120,'자료를 비교할 때의 질문','center')}${text(320,190,'관찰 기간은 충분히 긴가요?','center')}${text(320,250,'같은 기준으로 평균을 냈나요?','center')}${text(320,310,'하루의 변화와 긴 추세를 구분했나요?','center')}</g>`;
 }
 caption=c===0?'낮에 육지가 더 따뜻해지는 조건에서는 지표 부근에 바다에서 육지 쪽으로 부는 바람을 살펴볼 수 있어요.':c===1?'밤에 육지가 더 빠르게 식는 조건의 바람 방향을 비교해요. 실제 바람에는 여러 조건이 함께 작용해요.':c===2?'짧은 기간의 날씨는 오르내릴 수 있어요. 이 예시만으로 긴 기간 기후 추세를 확정하지 않아요.':'기후 변화를 살피려면 긴 기간과 일관된 관측 기준이 필요해요. 이 선은 실제 관측 보고서가 아닌 설명용 자료예요.';
}else if(kind==='moon-seasons'){
 controls=['달의 위치와 모양','기울어진 자전축과 계절','높은 태양 · 짧은 그림자','낮은 태양 · 긴 그림자'];
 if(c===0){
  const a=phase*Math.PI*2,mx=320+165*Math.cos(a),my=205+80*Math.sin(a),fraction=(1+Math.cos(a))/2,k=Math.cos(a),rx=Math.max(.01,Math.abs(k)*34),phaseShape=`<g transform="translate(500 368) scale(${Math.sin(a)>=0?1:-1} 1)"><path d="M0 -34A34 34 0 0 1 0 34A${rx} 34 0 0 ${k>=0?1:0} 0 -34Z" fill="#e8eae0"/></g>`;
  body=`<g filter="url(#ex-shadow)"><circle cx="70" cy="190" r="32" fill="#fcd266" stroke="#e0ad3d" stroke-width="2"/>${arrow('M110 130H200','#d0b05b')}${arrow('M110 220H200','#d0b05b')}<ellipse cx="320" cy="205" rx="165" ry="80" fill="none" stroke="#a1bdc4" stroke-width="1.8" stroke-dasharray="5 6"/><circle cx="320" cy="205" r="45" fill="url(#planet)"/>${text(70,253,'태양','center essential')}${text(320,275,'지구','center essential')}${text(550,85,'달','center essential')}${p(`M540 95L${mx} ${my-25}`,'#9eb3b7',1.8)}${circle(mx,my,23,'#dbe1d6')}<path d="M${mx} ${my-23}A23 23 0 0 1 ${mx} ${my+23}Z" fill="#394c56"/><rect x="398" y="297" width="213" height="134" rx="14" fill="#e1ebeb" stroke="#84a4ac" stroke-width="2"/>${text(505,321,'지구에서 본 달','center essential')}${circle(500,368,34,'#283e4d')}${phaseShape}${p('M352 238Q390 270 412 343','#9eb3b7',1.8)}</g>`;
  detail=`<g filter="url(#ex-shadow)">${circle(230,210,90,'#dce2d0')}${circle(410,210,90,'#2c414d')}${arrow('M70 95H535','#cfae5a')}<rect x="180" y="347" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#cfae5a"/>${text(320,365,'태양빛을 받은 면과 보는 방향을 구분해요','center')}</g>`;
  caption='달은 태양빛을 받은 면의 일부를 지구에서 보게 돼요. 위치와 보는 방향이 달라지며 위상이 바뀌는 것이고, 보통 지구 그림자가 가려서 생기는 변화가 아니에요.';
 }else if(c===1){
  const x=320+205*Math.cos(phase*Math.PI*2),y=205+75*Math.sin(phase*Math.PI*2);
  body=`<g filter="url(#ex-shadow)"><ellipse cx="320" cy="205" rx="205" ry="75" fill="none" stroke="#9bb7c0" stroke-width="2" stroke-dasharray="6 6"/><circle cx="320" cy="205" r="38" fill="#fbd366" stroke="#e0ad3d" stroke-width="2"/><g transform="translate(${x} ${y})"><circle cx="0" cy="0" r="42" fill="url(#planet)"/>${p('M-25 -62L25 62','#baa16c',4.5)}</g><rect x="180" y="55" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#9bb7c0"/>${text(320,72,'공전 중에도 자전축의 방향을 유지','center')}<rect x="180" y="360" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#9bb7c0"/>${text(320,378,'반구별 햇빛의 비춤 조건을 비교해요','center')}</g>`;
  detail=`<g filter="url(#ex-shadow)">${circle(320,220,115,'url(#planet)')}${p('M268 80L375 365','#baa16c',4.5)}${arrow('M80 145H220','#d0b05b')}${arrow('M80 250H220','#d0b05b')}<rect x="170" y="398" width="300" height="26" rx="6" fill="#ffffffdf" stroke="#baa16c"/>${text(320,416,'태양과 거리 하나로 계절을 설명하지 않아요','center')}</g>`;
  caption='기울어진 자전축의 방향이 유지된 채 공전하면 반구별 햇빛을 받는 조건이 달라져요. 계절을 태양과의 거리 하나로 설명하지 않아요.';
 }else{
  const low=c===3,sx=low?120:150,sy=low?140:40,end=320+(320-sx)*80/(220-sy);
  body=`<g filter="url(#ex-shadow)">${rect(50,300,540,28,'#c7b68a')}${circle(sx,sy,28,'#fcd366',2)}${p('M320 220V300','#627c7d',9.5)}${p(`M${sx} ${sy}L320 220L${end} 300`,'#cca952',4)}${p(`M320 306H${end}`,'#4d646e',13)}<rect x="180" y="372" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#627c7d"/>${text(320,390,low?'태양 고도가 낮으면 그림자가 길어져요':'태양 고도가 높으면 그림자가 짧아져요','center')}</g>`;
  detail=body;
  caption='같은 막대와 같은 바닥에서 태양의 높이 조건을 비교해요. 광원과 막대 꼭대기를 잇는 빛의 진행을 연장해 그림자 길이와 연결해요.';
 }
}else if(kind==='fair-test'){
 controls=['한 조건만 달리 비교','여러 조건을 함께 변경','같은 조건으로 반복 측정'];
 body=`<g filter="url(#ex-shadow)">`+[165,465].map((x,i)=>`${vessel(x-70,135,140,i===0?105:170,'url(#ex-liquid)')}${rect(x-75,345,150,12,c===1&&i?'#c2975e':'#7b9598')}${arrow(`M${x} 335V295`,'#b78f5e')}<rect x="${x-45}" y="380" width="90" height="24" rx="5" fill="#fff" stroke="#7b9598"/>${text(x,395,i?'B 조건':'A 조건','center')}`).join('')+`<rect x="180" y="65" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#7b9598"/>${text(320,82,c===0?'달리한 조건: 물의 양만':c===1?'달리한 조건: 물의 양 + 가열 조건':'같은 비교를 여러 번 기록','center')}</g>`;
 detail=`<g filter="url(#ex-shadow)">${rect(65,85,510,260,'#eff2e6')}${text(110,130,'비교할 조건')}${text(360,130,c===1?'둘 이상 달라짐':'하나만 달라짐')}${p('M80 155H560M80 230H560','#bfd1cb',2)}${text(110,200,'같게 둘 조건')}${text(360,200,'물질·처음 온도·장치')}${text(110,285,'관찰 결과')}${text(360,285,c===2?'반복한 기록을 비교':'근거를 남겨 설명')}</g>`;
 caption=c===1?'물의 양과 가열 조건을 함께 바꾸면 온도 변화의 원인을 하나로 가리기 어려워요.':c===2?'같은 방법으로 반복해 관찰하면 결과가 일관되는지 살펴볼 수 있어요. 한 번의 결과를 그대로 일반화하지 않아요.':'알아볼 조건 하나를 달리하고 다른 조건은 같게 두어야 원인과 결과를 비교하기 쉬워요.';
}else if(kind==='star-sky'){
 controls=['같은 밤 · 시간 경과','다른 계절의 관찰','도시 불빛이 강한 조건'];
 const a=t*.8,points=[[225,100],[250,130],[295,135],[340,120],[375,150],[410,165],[430,195]];
 body=`<g filter="url(#ex-shadow)"><path d="M10 335Q140 290 270 335T630 320V430H10Z" fill="#5f7b83"/><path d="M20 340H620V410H20Z" fill="#203f54"/>`+Array.from({length:c===2?18:65},(_,i)=>circle(35+i*89%570,40+i*47%250,1.5+i%3*.4,'#e6e4cb')).join('')+`<g transform="rotate(${c===1?40:a*30} 320 120)">${p(points.map(([x,y],i)=>(i?'L':'M')+x+' '+y).join(''),'#9ec0cc',2.5)}${points.map(([x,y])=>circle(x,y,4.5,'#eee9cf')).join('')}</g><rect x="180" y="367" width="280" height="26" rx="6" fill="#1b364bd5" stroke="#9ec0cc"/>${text(320,385,'같은 장소·관찰 방향을 정해 비교','center white')}</g>`;
 detail=`<g filter="url(#ex-shadow)">${rect(75,95,490,240,'#1f364a')}${p('M130 160L205 195L270 185L345 215L430 185L510 240','#89adc0',3.5)}<rect x="180" y="372" width="280" height="26" rx="6" fill="#1b364bd5" stroke="#89adc0"/>${text(320,390,'별의 상대적 배열을 이어 관찰한 모형','center white')}</g>`;
 caption=c===1?'다른 계절에 같은 시각과 방향에서 보이는 별자리를 비교해요. 실제 별자리 배열은 별도 관측 자료와 연결해야 하며 이 그림은 설명용 모형이에요.':c===2?'주변 불빛이 강하면 희미한 별을 보기 어려워질 수 있어요. 별이 안 보인다고 별 자체가 사라진 것은 아니에요.':'같은 밤에도 시간이 지나면 별이 보이는 위치가 달라져요. 관찰 장소와 방향을 정해 상대적 배열과 위치를 비교해요.';
}

if(kind==='electricity'){
 controls.push('전구 2개 · 직렬 연결','전구 2개 · 병렬 연결');
 if(c>=4){
  const lamp=(x,y)=>`<g filter="url(#ex-shadow)">${circle(x,y,28,'#f2de9b',3)}${p(`M${x-15} ${y}l10 -10 10 20 10 -10`,'#a68c5b',3)}</g>`;
  body=`<g filter="url(#ex-shadow)">${rect(85,180,70,80,'#8ca6a9',4)}${text(105,208,'+','essential')}${text(105,248,'−','essential')}${p('M120 180V100H535V330H120V260','#6f8b92',5.5)}`;
  body+=c===4?`${lamp(290,100)}${lamp(440,100)}<rect x="220" y="372" width="200" height="26" rx="6" fill="#ffffffdf" stroke="#6f8b92"/>${text(320,390,'갈라지지 않은 한 경로','center')}`:`${p('M200 100V230H475V100','#6f8b92',5.5)}${lamp(340,100)}${lamp(340,230)}${circle(200,100,6.5,'#49717c')}${circle(475,100,6.5,'#49717c')}<rect x="220" y="372" width="200" height="26" rx="6" fill="#ffffffdf" stroke="#6f8b92"/>${text(320,390,'분기점 사이 두 경로','center')}`;
  body+=circle(165+phase*330,100,5.5,'#d6b461')+`</g>`;
  detail=body;
  caption='전구 2개의 연결 경로를 비교해요. 직렬은 한 경로, 병렬은 갈라졌다 만나는 경로예요. 밝기는 전지와 전구 조건에 따라 달라 이 모형에서 수치로 비교하지 않아요.';
 }
}

if(kind==='materials'){
 controls.push('물 흡수 · 천과 플라스틱 비교');
 if(c===4){
  body=`<g filter="url(#ex-shadow)">${rect(65,235,220,80,'#beae88',4)}`+Array.from({length:12},(_,i)=>p(`M${80+i*17} 237V313`,'#9f906b',2)).join('')+`${rect(355,235,220,18,'#90b3be',3)}`+Array.from({length:6},(_,i)=>circle(95+i*31,255+phase*35,5,'#6da1b4')).join('')+Array.from({length:6},(_,i)=>circle(385+i*30,228,6,'#6da1b4')).join('')+`${arrow('M175 100V220','#6da1b4')}${arrow('M465 100V215','#6da1b4')}<rect x="150" y="347" width="50" height="24" rx="5" fill="#fff" stroke="#beae88"/>${text(175,362,'천','center essential')}<rect x="430" y="347" width="70" height="24" rx="5" fill="#fff" stroke="#90b3be"/>${text(465,362,'플라스틱','center essential')}</g>`;
  detail=body;
  caption='같은 양의 물을 떨어뜨린 표본을 비교해요. 천 표본에는 물이 스며들고 플라스틱 표본에는 물방울이 남아요. 재료·표면 처리에 따라 결과가 달라질 수 있어요.';
 }
}

if(kind==='indicators'){
 controls.push('혼합 후 성질 · 지시약으로 확인');
 if(c===4){
  body=`<g filter="url(#ex-shadow)">${vessel(70,90,150,140,'#dec75b')}${vessel(420,90,150,140,'#6da3c2')}${arrow('M185 240L280 285')}${arrow('M455 240L365 285')}${vessel(250,285,140,95,'#cfdedc')}<rect x="120" y="52" width="50" height="22" rx="5" fill="#fff" stroke="#dec75b"/>${text(145,66,'산성','center essential')}<rect x="470" y="52" width="50" height="22" rx="5" fill="#fff" stroke="#6da3c2"/>${text(495,66,'염기성','center essential')}${text(320,333,'?','center essential')}<rect x="180" y="397" width="280" height="26" rx="6" fill="#ffffffdf" stroke="#7e9da4"/>${text(320,415,'혼합 뒤 지시약으로 확인','center')}</g>`;
  detail=body;
  caption='산성과 염기성 용액을 섞었다고 항상 중성이 되는 것은 아니에요. 종류·농도·양에 따라 달라지므로 혼합 뒤 지시약 색 등 관찰 근거로 판단해요. 가운데 색은 판정 전 표시예요.';
 }
}

if(!controls.length)return null;
if(c<0||c>=controls.length)return {sceneTitle:'지원하지 않는 관찰 조건',caption:'조건을 다시 선택해 주세요.',controls,steps:['전체 관찰'],legends:[],svg:'<svg viewBox="0 0 640 430" role="img" aria-label="지원하지 않는 조건"><text x="320" y="210" text-anchor="middle">지원하지 않는 관찰 조건이에요.</text></svg>'};

const useDetail=step===1&&detail;
const displayed=useDetail?detail:body;
const legends=[...new Set([controls[c],...[...displayed.matchAll(/<text[^>]*>([^<]+)<\/text>/g)].map(m=>m[1]).filter(s=>s.length>5)])];

const defsEx=`<defs>
<marker id="ex-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#0e7490"/></marker>
<marker id="ex-arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#00b4d8"/></marker>
<marker id="ex-arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#f5ab35"/></marker>
<marker id="ex-arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#e04e38"/></marker>
<marker id="ex-arrow-draft" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 2L7 5L0 8Z" fill="#78502d"/></marker>
<marker id="ex-arrow-sand" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 2L7 5L0 8Z" fill="#a88054"/></marker>
<marker id="ex-arrow-aqua" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 2L7 5L0 8Z" fill="#199bbd"/></marker>
<marker id="ex-arrow-crimson" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 2L7 5L0 8Z" fill="#b83828"/></marker>
<linearGradient id="ex-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fdfcf8"/><stop offset="100%" stop-color="#f1ede3"/></linearGradient>
<linearGradient id="ex-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a4dbec"/><stop offset="100%" stop-color="#69b5cb"/></linearGradient>
<linearGradient id="ex-sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ebdcb5"/><stop offset="100%" stop-color="#cfb989"/></linearGradient>
<linearGradient id="ex-liquid" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#bfe4ed"/><stop offset="100%" stop-color="#80c1d1"/></linearGradient>
<linearGradient id="ex-glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#ebf5f7" stop-opacity=".85"/><stop offset=".25%" stop-color="#f8fcfe" stop-opacity=".4"/><stop offset="1" stop-color="#d3ecf2" stop-opacity=".8"/></linearGradient>
<linearGradient id="ex-mag-n" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d95e4e"/><stop offset="100%" stop-color="#af382a"/></linearGradient>
<linearGradient id="ex-mag-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4e9ab4"/><stop offset="100%" stop-color="#2a667d"/></linearGradient>
<filter id="ex-shadow" x="-8%" y="-8%" width="116%" height="116%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#1b363d" flood-opacity=".12"/></filter>
<filter id="ex-glow-cyan" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="ex-glow-amber" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>`;

return {
 sceneTitle:controls[c],
 caption,
 controls,
 steps: customSteps || (detail===body?['전체 관찰']:['전체 관찰','확대·단면']),
 legends: customLegends || legends,
 svg:`<svg viewBox="0 0 640 440" role="img" aria-label="${controls[c]} 관찰 모형">${defsEx}<rect x="8" y="8" width="624" height="424" rx="18" fill="url(#ex-paper)" stroke="#cddadc" stroke-width="1.5"/>${displayed}</svg>`
};
}
root.ScienceExtensionModels={render,kinds:[...ids]};
})(window);
