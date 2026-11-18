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
  const thrustW = isPower ? (35 + kickP * 35) : 18;

  body = `<g>
<image href="assets/science/duck-pond.webp" x="14" y="14" width="612" height="412" preserveAspectRatio="xMidYMid slice" rx="14" style="border-radius:14px"/>

<!-- Luminous White Waterline Ripples at duck waterline (y ≈ 215) contrasting with pond water -->
<path d="M 35 215 Q 140 210 220 215 T 440 213 T 605 215" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-dasharray="10 5" opacity="0.85"/>
<path d="M 120 222 Q 180 218 240 222" fill="none" stroke="#e0f2fe" stroke-width="1.4" opacity="0.75"/>

<!-- High-Contrast Fluid Dynamics: Thrust (Coral Red) & Water Expulsion (Solar Amber) -->
<g>
${isPower ? `
<!-- Power Stroke: Forward Thrust Vector (Coral Red #dc2626) pointing LEFT (opposite to water) -->
<path d="M 200 205 L ${200 - thrustW} 205" fill="none" stroke="#dc2626" stroke-width="3.2" stroke-linecap="round" marker-end="url(#ex-arrow-coral)"/>
<line x1="200" y1="195" x2="200" y2="215" stroke="#dc2626" stroke-width="1.6"/>
<text x="${200 - thrustW / 2}" y="192" style="font-size:11px;font-weight:800;fill:#dc2626;text-anchor:middle">추진력 +18.5 N (전진)</text>

<!-- Power Stroke: Water Expelled Backward (Solar Amber #f59e0b) to the RIGHT (x≈315, y≈280) -->
<path d="M 325 285 L ${370 + kickP * 35} ${288 + kickP * 12}" fill="none" stroke="#f59e0b" stroke-width="2.8" stroke-linecap="round" marker-end="url(#ex-arrow-amber)"/>
<text x="${365 + kickP * 25}" y="${312 + kickP * 8}" style="font-size:11px;font-weight:800;fill:#b45309">후방 배수: -Δp (작용)</text>

<!-- Swirling Solar Amber Karman Vortex Wake Rings rolling backward to the right -->
<path d="M ${345 + kickP * 25} 275 A 10 10 0 0 1 ${355 + kickP * 25} 295" fill="none" stroke="#f59e0b" stroke-width="2.2" opacity="1"/>
<path d="M ${375 + kickP * 20} 270 A 12 12 0 0 1 ${388 + kickP * 20} 298" fill="none" stroke="#fbbf24" stroke-width="1.8" opacity="0.9"/>

<!-- Foot Webbing Status Pill near paddling foot (High-Contrast Coral Red Border) -->
<rect x="230" y="338" width="170" height="26" rx="6" fill="#ffffff" stroke="#dc2626" stroke-width="1.8"/>
<text x="315" y="355" style="font-size:11px;font-weight:800;fill:#dc2626;text-anchor:middle">물갈퀴 전개 (면적 65 cm²)</text>
` : `
<!-- Recovery Stroke: Low drag at breast (Slate #475569) -->
<path d="M 200 205 L 225 205" fill="none" stroke="#475569" stroke-width="1.8" stroke-linecap="round"/>
<text x="212" y="192" style="font-size:10px;font-weight:700;fill:#334155;text-anchor:middle">유체 저항 1.1 N (최소)</text>

<!-- Luminous White/Silver streamlines gliding smoothly around folded feet -->
<path d="M 270 278 Q 350 268 440 282" fill="none" stroke="#ffffff" stroke-width="2.0" stroke-dasharray="6 3" opacity="0.9"/>
<path d="M 285 292 Q 360 282 450 296" fill="none" stroke="#f1f5f9" stroke-width="1.6" stroke-dasharray="5 3" opacity="0.8"/>

<!-- Foot Webbing Status Pill near folded foot (Slate Border) -->
<rect x="220" y="338" width="190" height="26" rx="6" fill="#ffffff" stroke="#475569" stroke-width="1.6"/>
<text x="315" y="355" style="font-size:11px;font-weight:800;fill:#334155;text-anchor:middle">물갈퀴 접힘 (면적 14 cm² · 78%↓)</text>
`}
</g>

<!-- Top-Left Compact Frosted Badge in Sky -->
<rect x="25" y="24" width="330" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
<circle cx="42" cy="41" r="5" fill="#dc2626"/>
<text x="56" y="46" style="font-size:12px;font-weight:700;fill:#0f172a">${isPower ? '1단계: 추진 스트로크 (물갈퀴 전개 · 후방 배수)' : '2단계: 회수 스트로크 (물갈퀴 접힘 · 유체 저항 최소화)'}</text>

<!-- Top-Right Real-time Telemetry Pill in Background Foliage -->
<rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#dc2626" stroke-width="1.5"/>
<text x="517" y="46" style="font-size:12px;font-weight:800;fill:#dc2626;text-anchor:middle">${isPower ? '추진력: +18.5 N (가속)' : '유체 저항: 1.1 N (93%↓)'}</text>

<!-- Bottom Technical Principle Ribbon -->
<rect x="65" y="388" width="510" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
<text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">${isPower ? '뉴턴 제3법칙(작용·반작용): 물갈퀴로 물을 뒤로 밀고(작용), 그 반작용(+18.5 N)으로 전진해요' : '형상 제어 적응: 발을 당길 때는 물갈퀴를 접어 전면 면적을 78% 줄이고 저항(1.1 N)을 최소화해요'}</text>
</g>`;

  detail = `<g filter="url(#ex-shadow)">
<rect x="14" y="14" width="612" height="412" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
<text x="320" y="46" style="font-size:14px;font-weight:700;fill:#23424b;text-anchor:middle">물갈퀴 개폐 메커니즘과 유체역학(작용·반작용) 단면 분석</text>

<!-- Left Card: Power Stroke -->
<g transform="translate(25, 64)">
  <rect x="0" y="0" width="285" height="280" rx="12" fill="#fff5f5" stroke="#fca5a5" stroke-width="1.5"/>
  <rect x="15" y="14" width="150" height="24" rx="6" fill="#dc2626"/>
  <text x="90" y="30" style="font-size:12px;font-weight:700;fill:#ffffff;text-anchor:middle">1. 물갈퀴 펼침 (추진 단계)</text>

  <!-- Extended Webbed Foot Technical Diagram -->
  <path d="M142 55L142 175M142 100L85 165M142 100L200 165" stroke="#8a6138" stroke-width="3" stroke-linecap="round"/>
  <path d="M85 165Q113 155 142 175Q171 155 200 165L200 120Q142 90 85 120Z" fill="rgba(244, 185, 85, 0.45)" stroke="#c28830" stroke-width="1.5"/>
  <path d="M85 165Q113 155 142 175Q171 155 200 165" stroke="#9e661b" stroke-width="2.5" stroke-linecap="round"/>

  <!-- High-Contrast Dynamic pressure isobars -->
  <path d="M70 180Q142 165 215 180" fill="none" stroke="#ea580c" stroke-width="1.6" stroke-dasharray="3 2"/>
  <path d="M60 195Q142 178 225 195" fill="none" stroke="#f97316" stroke-width="1.4" stroke-dasharray="4 3" opacity="0.9"/>
  <text x="142" y="192" style="font-size:10px;font-weight:800;fill:#c2410c;text-anchor:middle">동압 정체면 (고압 형성)</text>

  <!-- Backward water momentum vectors (Solar Amber) -->
  <path d="M95 195V225M142 200V232M190 195V225" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#ex-arrow-amber)"/>
  <text x="142" y="244" style="font-size:10px;font-weight:800;fill:#b45309;text-anchor:middle">후방 배수 운동량: -Δp</text>

  <!-- Forward reaction arrow (Coral Red) -->
  <path d="M142 85V48" stroke="#dc2626" stroke-width="2.8" marker-end="url(#ex-arrow-coral)"/>
  <text x="180" y="65" style="font-size:11px;font-weight:800;fill:#dc2626">반작용 추력</text>

  <rect x="15" y="250" width="255" height="22" rx="5" fill="#dc2626"/>
  <text x="142" y="265" style="font-size:11px;font-weight:700;fill:#ffffff;text-anchor:middle">면적 65cm² → 추진력 +18.5 N (최대 추력)</text>
</g>

<!-- Right Card: Recovery Stroke -->
<g transform="translate(330, 64)">
  <rect x="0" y="0" width="285" height="280" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <rect x="15" y="14" width="150" height="24" rx="6" fill="#475569"/>
  <text x="90" y="30" style="font-size:12px;font-weight:700;fill:#ffffff;text-anchor:middle">2. 물갈퀴 접힘 (회수 단계)</text>

  <!-- Folded Webbed Foot Technical Diagram -->
  <path d="M142 55L142 175M142 100L134 165M142 100L150 165" stroke="#8a6138" stroke-width="3" stroke-linecap="round"/>
  <path d="M134 165L142 175L150 165L146 115L138 115Z" fill="rgba(244, 185, 85, 0.45)" stroke="#c28830" stroke-width="1.5"/>

  <!-- Laminar streamlines wrapping around folded profile -->
  <path d="M105 85Q125 125 105 165" fill="none" stroke="#64748b" stroke-width="1.6" stroke-dasharray="4 3"/>
  <path d="M180 85Q160 125 180 165" fill="none" stroke="#64748b" stroke-width="1.6" stroke-dasharray="4 3"/>
  <path d="M90 100Q115 130 90 185" fill="none" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="5 4"/>
  <path d="M195 100Q170 130 195 185" fill="none" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="5 4"/>

  <text x="142" y="205" style="font-size:10px;font-weight:800;fill:#334155;text-anchor:middle">유선형 층류 통과 (와류 박리 없음)</text>
  <text x="142" y="222" style="font-size:10px;font-weight:600;fill:#475569;text-anchor:middle">전면 투영 면적 78% 감소</text>

  <rect x="15" y="250" width="255" height="22" rx="5" fill="#475569"/>
  <text x="142" y="265" style="font-size:11px;font-weight:700;fill:#ffffff;text-anchor:middle">면적 14cm² → 저항 1.1 N (93% 저항 감쇄)</text>
</g>

<!-- Bottom Principle Card -->
<rect x="22" y="356" width="596" height="52" rx="8" fill="#ffffffeb" stroke="#cddadc" stroke-width="1.2"/>
<text x="320" y="378" style="font-size:12px;font-weight:700;fill:#203e48;text-anchor:middle">비대칭 유체 저항: 물을 밀 때는 펼쳐 최대 추력을 얻고, 당길 때는 접어 저항을 93% 줄여요</text>
<text x="320" y="396" style="font-size:11px;font-weight:600;fill:#48636c;text-anchor:middle">물갈퀴의 개폐 구조는 물의 점성 저항을 능동적으로 제어하는 고효율 생체 적응이에요</text>
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

  // Exact coordinates matching camel-desert.webp: Front foot sole (272, 354), Hind foot sole (463, 350)
  // High-contrast Deep Cobalt Blue (#1d4ed8) against warm yellow desert sand
  const footGraphic = (cx, cy, w, gap, h) => {
    const lcx = cx - gap * 0.9;
    const rcx = cx + gap * 0.9;
    const lobeW = w * 0.46;
    const lobeH = h;
    return `
    <!-- Deep Umber Sand Compression Berms (모래 융기 파동) -->
    <path d="M ${cx - w - 10} ${cy + 1} Q ${cx - w - 5} ${cy - 2.5} ${cx - w} ${cy + 1}" fill="none" stroke="#78350f" stroke-width="2.0" stroke-linecap="round"/>
    <path d="M ${cx + w} ${cy + 1} Q ${cx + w + 5} ${cy - 2.5} ${cx + w + 10} ${cy + 1}" fill="none" stroke="#78350f" stroke-width="2.0" stroke-linecap="round"/>

    <!-- High-Contrast Royal Cobalt Boussinesq Pressure Isobars in Sand -->
    <g>
      <!-- Isobar 3: Deep 20% stress boundary -->
      <path d="M ${cx - w * 1.55} ${cy} Q ${cx} ${cy + 34 + s * 9} ${cx + w * 1.55} ${cy}" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.85"/>
      <!-- Isobar 2: Mid 50% stress boundary -->
      <path d="M ${cx - w * 1.15} ${cy + 1} Q ${cx} ${cy + 22 + s * 6} ${cx + w * 1.15} ${cy + 1}" fill="none" stroke="#2563eb" stroke-width="1.8" stroke-dasharray="4 2" opacity="0.95"/>
      <!-- Isobar 1: Core 80% stress bulb -->
      <path d="M ${cx - w * 0.75} ${cy + 2} Q ${cx} ${cy + 12 + s * 4} ${cx + w * 0.75} ${cy + 2}" fill="none" stroke="#1d4ed8" stroke-width="2.2" opacity="1"/>

      <!-- Radial stress dissipation arrows into sand (Deep Cobalt) -->
      <path d="M ${cx - w * 0.65} ${cy + 3} L ${cx - w * 1.05} ${cy + 15 + s * 4} M ${cx - w * 0.3} ${cy + 4} L ${cx - w * 0.45} ${cy + 18 + s * 5} M ${cx} ${cy + 4.5} L ${cx} ${cy + 20 + s * 6} M ${cx + w * 0.3} ${cy + 4} L ${cx + w * 0.45} ${cy + 18 + s * 5} M ${cx + w * 0.65} ${cy + 3} L ${cx + w * 1.05} ${cy + 15 + s * 4}" stroke="#1d4ed8" stroke-width="1.5" stroke-linecap="round"/>
    </g>

    <!-- Posterior Fibro-Elastic Cushion Heel Pad (Deep Cobalt Blue) -->
    <ellipse cx="${cx}" cy="${cy + 2}" rx="${w * 0.75}" ry="${lobeH * 0.95}" fill="rgba(37, 99, 235, 0.35)" stroke="#1d4ed8" stroke-width="1.8"/>

    <!-- Left Articulated Digital Toe Pad (Deep Cobalt Blue) -->
    <path d="M ${lcx - lobeW} ${cy - 1} Q ${lcx - lobeW * 0.55} ${cy - lobeH - 2} ${lcx} ${cy - lobeH} Q ${lcx + lobeW * 0.25} ${cy - lobeH * 0.4} ${lcx} ${cy + 3} Q ${lcx - lobeW * 0.5} ${cy + lobeH * 0.8} ${lcx - lobeW} ${cy - 1} Z" fill="rgba(29, 78, 216, 0.45)" stroke="#1d4ed8" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M ${lcx - lobeW * 0.6} ${cy - lobeH - 1.5} Q ${lcx - lobeW * 0.4} ${cy - lobeH - 4.5} ${lcx - lobeW * 0.15} ${cy - lobeH - 1}" fill="#0f172a" stroke="#020617" stroke-width="1"/>

    <!-- Right Articulated Digital Toe Pad (Deep Cobalt Blue) -->
    <path d="M ${rcx + lobeW} ${cy - 1} Q ${rcx + lobeW * 0.55} ${cy - lobeH - 2} ${rcx} ${cy - lobeH} Q ${rcx - lobeW * 0.25} ${cy - lobeH * 0.4} ${rcx} ${cy + 3} Q ${rcx + lobeW * 0.5} ${cy + lobeH * 0.8} ${rcx + lobeW} ${cy - 1} Z" fill="rgba(29, 78, 216, 0.45)" stroke="#1d4ed8" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M ${rcx + lobeW * 0.6} ${cy - lobeH - 1.5} Q ${rcx + lobeW * 0.4} ${cy - lobeH - 4.5} ${rcx + lobeW * 0.15} ${cy - lobeH - 1}" fill="#0f172a" stroke="#020617" stroke-width="1"/>

    <!-- Central Fibrous Webbing Strain Line -->
    <line x1="${lcx}" y1="${cy}" x2="${rcx}" y2="${cy}" stroke="#1d4ed8" stroke-width="1.4" stroke-dasharray="2 1.5"/>
    `;
  };

  body = `<g>
<image href="assets/science/camel-desert.webp" x="14" y="14" width="612" height="412" preserveAspectRatio="xMidYMid slice" rx="14" style="border-radius:14px"/>

<!-- Gravity Symbol ⊕ & Downward Vector (Crimson #dc2626) at camel torso center (367, 222) -->
<g transform="translate(367, 222)">
  <circle cx="0" cy="0" r="7" fill="none" stroke="#dc2626" stroke-width="1.4" stroke-dasharray="2 2"/>
  <line x1="-9" y1="0" x2="9" y2="0" stroke="#dc2626" stroke-width="1.2"/>
  <line x1="0" y1="-9" x2="0" y2="9" stroke="#dc2626" stroke-width="1.2"/>
  <path d="M0 7V${32 + s * 8}" stroke="#dc2626" stroke-width="2.0" stroke-linecap="round" marker-end="url(#ex-arrow-coral)"/>
  <text x="12" y="22" style="font-size:11px;font-weight:800;fill:#dc2626">W = mg (640 N)</text>
</g>

<!-- Front Foot (x=272, y=354): Dual-Lobe Anatomical Cushion & Cobalt Isobars -->
${footGraphic(272, 354, padW, toeGap, padH)}

<!-- Hind Foot (x=463, y=350): Dual-Lobe Anatomical Cushion & Cobalt Isobars -->
${footGraphic(463, 350, padW, toeGap, padH)}

<!-- Architectural Dimension Line for Front Foot (Deep Cobalt) -->
<line x1="${272 - padW}" y1="380" x2="${272 + padW}" y2="380" stroke="#1d4ed8" stroke-width="1.5"/>
<line x1="${272 - padW}" y1="376" x2="${272 - padW}" y2="384" stroke="#1d4ed8" stroke-width="1.5"/>
<line x1="${272 + padW}" y1="376" x2="${272 + padW}" y2="384" stroke="#1d4ed8" stroke-width="1.5"/>
<text x="272" y="394" style="font-size:11px;font-weight:800;fill:#1e40af;text-anchor:middle">접촉 폭 ${(padW * 2 / 3.4).toFixed(0)}cm (면적 ${areaVal} cm²)</text>

<!-- Top-Left Compact Frosted Badge in Sky -->
<rect x="25" y="24" width="320" height="34" rx="8" fill="#ffffffea" stroke="#1d4ed8" stroke-width="1.5"/>
<circle cx="42" cy="41" r="5" fill="#1d4ed8"/>
<text x="56" y="46" style="font-size:12px;font-weight:700;fill:#0f172a">${stageText}</text>

<!-- Real-time Pressure Telemetry Badge in Sky -->
<rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#1d4ed8" stroke-width="1.5"/>
<text x="517" y="46" style="font-size:12px;font-weight:800;fill:#1d4ed8;text-anchor:middle">지면 압력: ${pVal} N/cm² (안전)</text>

<!-- Bottom Technical Principle Ribbon -->
<rect x="75" y="398" width="490" height="28" rx="7" fill="#fffffffa" stroke="#1d4ed8" stroke-width="1.5"/>
<text x="320" y="416" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">압력 P = F / A : 넓은 2엽 탄성 발바닥(420 cm²)으로 지면 압력을 낮춰 모래 위를 걸어요</text>
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

<!-- Right Card: Camel Cushion Foot (Deep Cobalt Blue) -->
<g transform="translate(330, 64)">
  <rect x="0" y="0" width="285" height="280" rx="12" fill="#eff6ff" stroke="#93c5fd" stroke-width="1.5"/>
  <rect x="15" y="14" width="150" height="24" rx="6" fill="#1d4ed8"/>
  <text x="90" y="30" style="font-size:12px;font-weight:700;fill:#ffffff;text-anchor:middle">2. 낙타의 2엽 탄성 쿠션 발</text>

  <!-- Sand Bed Profile -->
  <path d="M15 175H270V236H15Z" fill="#ebd6a9"/>
  <line x1="15" y1="175" x2="270" y2="175" stroke="#cbb082" stroke-width="1.5"/>

  <!-- Anatomical Leg Bones & Digital Cushion -->
  <rect x="129" y="${camelY - 65}" width="26" height="65" rx="2" fill="#a4815b" stroke="#6b5034" stroke-width="1.5"/>

  <!-- High-Contrast Dual-Lobe Digital Cushion Pad (Cobalt Blue) -->
  <ellipse cx="142" cy="${camelY + 2}" rx="${padW1 / 2}" ry="11" fill="rgba(37, 99, 235, 0.35)" stroke="#1d4ed8" stroke-width="2.2"/>
  <!-- Left Toe Lobe & Right Toe Lobe in Cross-Section -->
  <ellipse cx="${142 - padW1 * 0.22}" cy="${camelY}" rx="${padW1 * 0.22}" ry="8" fill="rgba(29, 78, 216, 0.45)" stroke="#1d4ed8" stroke-width="1.8"/>
  <ellipse cx="${142 + padW1 * 0.22}" cy="${camelY}" rx="${padW1 * 0.22}" ry="8" fill="rgba(29, 78, 216, 0.45)" stroke="#1d4ed8" stroke-width="1.8"/>

  <!-- High-Contrast Cobalt Boussinesq stress isobars radiating into sand -->
  <path d="M${142 - padW1 * 0.45} ${camelY + 8}Q142 ${camelY + 22} ${142 + padW1 * 0.45} ${camelY + 8}" fill="none" stroke="#1d4ed8" stroke-width="1.8" stroke-dasharray="3 2"/>
  <path d="M${142 - padW1 * 0.7} ${camelY + 6}Q142 ${camelY + 36} ${142 + padW1 * 0.7} ${camelY + 6}" fill="none" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.9"/>
  <text x="142" y="${camelY + 30}" style="font-size:9px;font-weight:800;fill:#1e40af;text-anchor:middle">광폭 Boussinesq 등응력선 분산</text>

  <!-- Dimension line for contact width -->
  <line x1="${142 - padW1 / 2}" y1="${camelY + 44}" x2="${142 + padW1 / 2}" y2="${camelY + 44}" stroke="#1d4ed8" stroke-width="1.5"/>
  <line x1="${142 - padW1 / 2}" y1="${camelY + 40}" x2="${142 - padW1 / 2}" y2="${camelY + 48}" stroke="#1d4ed8" stroke-width="1.5"/>
  <line x1="${142 + padW1 / 2}" y1="${camelY + 40}" x2="${142 + padW1 / 2}" y2="${camelY + 48}" stroke="#1d4ed8" stroke-width="1.5"/>

  <rect x="15" y="250" width="255" height="22" rx="5" fill="#1d4ed8"/>
  <text x="142" y="265" style="font-size:11px;font-weight:700;fill:#ffffff;text-anchor:middle">면적 420cm² → 침하 ${sinkR}cm (표면 안정 지탱)</text>
</g>

<!-- Bottom Principle Card -->
<rect x="22" y="356" width="596" height="52" rx="8" fill="#ffffffeb" stroke="#cddadc" stroke-width="1.2"/>
<text x="320" y="378" style="font-size:12px;font-weight:700;fill:#1e40af;text-anchor:middle">압력 공식 P = F / A : 동일 하중(1,100 N) 기준, 면적이 7배 넓어 압력이 86% 감소해요</text>
<text x="320" y="396" style="font-size:11px;font-weight:600;fill:#48636c;text-anchor:middle">낙타 발바닥의 2엽 탄성 완충 쿠션은 모래의 한계 지지력 이하로 응력을 고르게 분산시켜요</text>
</g>`;

  caption = step === 1 ? '좁은 발은 압력이 집중되어 15cm 침하하지만, 낙타의 넓은 2엽 쿠션 발은 압력을 86% 분산시켜 모래 위를 1.2cm 미세 침하로 안정 지탱해요.' : (phase < 0.35 ? '1단계 [접지]: 발이 모래 표면에 닿으며 체중이 전달되기 시작해요.' : (phase < 0.75 ? '2단계 [패드 횡팽창]: 체중이 실리자 2엽 탄성 패드가 옆으로 벌어지며 면적을 넓혀 압력(P=F/A)을 대폭 낮춰요.' : '3단계 [지지]: 압력이 모래 한계 지지력을 넘지 않아 푹 빠지지 않고 전진해요.'));

 }else{
  const flowOffset = Math.round(phase * 80);
  const pulse = 0.7 + 0.3 * Math.sin(phase * Math.PI * 2);

  body = `<g>
<image href="assets/science/penguin-polar.webp" x="14" y="14" width="612" height="412" preserveAspectRatio="xMidYMid slice" rx="14" style="border-radius:14px"/>

<!-- High-Contrast Luminous Solar Gold (#fde047 / #ffffff) Streamlines against deep polar water -->
<g>
<path d="M50 175Q220 125 360 150T590 162" fill="none" stroke="#fde047" stroke-width="2.2" stroke-dasharray="14 8" stroke-dashoffset="${flowOffset}" opacity="1"/>
<path d="M40 225Q230 185 370 210T600 225" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-dasharray="12 8" stroke-dashoffset="${flowOffset}" opacity="0.9"/>
<path d="M60 275Q230 245 380 260T610 280" fill="none" stroke="#facc15" stroke-width="2.0" stroke-dasharray="15 8" stroke-dashoffset="${flowOffset}" opacity="0.95"/>
</g>

<!-- High-Contrast Radiant Solar Amber (#f59e0b) & Crimson (#dc2626) Thermal Envelope -->
<path d="M295 155Q270 200 272 260Q275 320 330 345" fill="none" stroke="#f59e0b" stroke-width="3.2" stroke-linecap="round" opacity="1"/>
<path d="M305 162Q282 205 284 258Q286 312 334 338" fill="none" stroke="#dc2626" stroke-width="2.0" stroke-linecap="round" opacity="0.9"/>

<!-- Top-Left Compact Frosted Badge -->
<rect x="25" y="24" width="310" height="34" rx="8" fill="#ffffffea" stroke="#f59e0b" stroke-width="1.5"/>
<circle cx="42" cy="41" r="5" fill="#dc2626"/>
<text x="56" y="46" style="font-size:12px;font-weight:700;fill:#0f172a">유선형 항력 최소화 (Cd ≈ 0.03) &amp; 4중 단열층</text>

<!-- Telemetry Pill at right (Vibrant Solar Amber/Crimson) -->
<rect x="390" y="24" width="225" height="34" rx="8" fill="#ffffffea" stroke="#dc2626" stroke-width="1.5"/>
<text x="502" y="46" style="font-size:11px;font-weight:800;fill:#dc2626;text-anchor:middle">외기 -30℃ ~ -1.8℃ ──> 심부 +38.5℃ (88% 보존)</text>

<!-- Bottom Principle Ribbon -->
<rect x="75" y="388" width="490" height="28" rx="7" fill="#fffffffa" stroke="#f59e0b" stroke-width="1.5"/>
<text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">깃털 속 빽빽한 공기층이 대류를 막고, 지방층이 열전도를 차단해 체온을 지켜요</text>
</g>`;

  detail = `<g filter="url(#ex-shadow)">
<rect x="14" y="14" width="612" height="412" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
<text x="320" y="46" style="font-size:14px;font-weight:700;fill:#203e48;text-anchor:middle">펭귄 4중 단열 구조와 열역학적 온도 구배(Temperature Gradient) 단면</text>

<rect x="35" y="64" width="570" height="280" rx="12" fill="#f4f8fa" stroke="#a9c9d4" stroke-width="1.2"/>

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
<rect x="22" y="356" width="596" height="52" rx="8" fill="#ffffffeb" stroke="#cddadc" stroke-width="1.2"/>
<text x="320" y="378" style="font-size:12px;font-weight:700;fill:#203e48;text-anchor:middle">정체 공기층의 열전도 차단: 공기는 열전도율(k=0.024)이 가장 낮아 체온을 효과적으로 지켜요</text>
<text x="320" y="396" style="font-size:11px;font-weight:600;fill:#48636c;text-anchor:middle">빽빽한 방수 깃털이 대류를 막고, 갇힌 공기층과 피하지방층이 전도 열 손실의 88%를 보존해요</text>
</g>`;

  caption = step === 1 ? '공기는 최고의 단열재예요. 빽빽한 방수 깃털로 대류를 차단하고 갇힌 공기층과 피하지방으로 전도 열 손실을 88% 이상 막아요.' : '유선형 체형으로 유체 저항을 최소화(Cd≈0.03)하고 깃털 속 공기층으로 혹한(-30℃) 속에서도 심부 체온(+38.5℃)을 유지해요.';
 }
}else if (kind === 'animal-lifecycle') {
    controls = ['나비의 한살이', '메뚜기의 한살이', '개구리의 한살이'];
    customSteps = ['동작 주기 관찰', '원리 비교 단면'];
    const curStage = Math.floor(phase * 4);

    if (c === 0) {
      customLegends = ['나비의 한살이 (완전탈바꿈)', '1. 알 (잎 뒷면 단독 산란)', '2. 애벌레 (배추벌레 1~5령)', '3. 번데기 (고치실 고정 변태)', '4. 성충 (배추흰나비 완성)'];
      const stages = [
        { name: '알', x: 110, note: '지름 1mm · 옥수수 모양' },
        { name: '애벌레', x: 250, note: '5령 배추벌레 · 왕성한 섭식' },
        { name: '번데기', x: 390, note: '움직이지 않고 조직 재편' },
        { name: '성충', x: 530, note: '날개돋이 · 꿀 섭취·산란' }
      ];

      body = `<g filter="url(#ex-shadow)">
      ${stages.map((st, i) => {
        const active = curStage === i;
        return `<g transform="translate(${st.x - 60}, 110)">
          <rect x="0" y="0" width="120" height="190" rx="12" fill="${active ? '#f0fdf4' : '#ffffff'}" stroke="${active ? '#16a34a' : '#cbd5e1'}" stroke-width="${active ? 2.5 : 1.5}"/>
          <rect x="15" y="10" width="90" height="22" rx="6" fill="${active ? '#16a34a' : '#e2e8f0'}"/>
          <text x="60" y="25" style="font-size:11px;font-weight:800;fill:${active ? '#ffffff' : '#475569'};text-anchor:middle">${i + 1}. ${st.name}</text>
          <circle cx="60" cy="85" r="42" fill="${active ? '#dcfce7' : '#f8fafc'}" stroke="${active ? '#86efac' : '#e2e8f0'}" stroke-width="1.5"/>
          ${i === 0 ? `
            <path d="M30 100Q60 70 90 100" fill="none" stroke="#22c55e" stroke-width="4"/>
            <ellipse cx="60" cy="80" rx="10" ry="15" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
            <path d="M56 70V90M60 68V92M64 70V90" stroke="#a16207" stroke-width="0.8"/>
          ` : i === 1 ? `
            <path d="M32 92Q50 78 68 90T92 84" fill="none" stroke="#15803d" stroke-width="11" stroke-linecap="round"/>
            <circle cx="30" cy="92" r="5" fill="#14532d"/>
            <circle cx="28" cy="91" r="1.5" fill="#ffffff"/>
            ${[42, 54, 66, 78].map(cx => `<line x1="${cx}" y1="94" x2="${cx}" y2="99" stroke="#166534" stroke-width="2"/>`).join('')}
          ` : i === 2 ? `
            <line x1="20" y1="55" x2="100" y2="70" stroke="#78350f" stroke-width="3"/>
            <line x1="60" y1="63" x2="60" y2="73" stroke="#e2e8f0" stroke-width="1.5"/>
            <path d="M50 73L70 73L74 95L60 115L46 95Z" fill="#84cc16" stroke="#4d7c0f" stroke-width="2"/>
            <path d="M52 85L68 85" stroke="#365314" stroke-width="1"/>
          ` : `
            <ellipse cx="60" cy="85" rx="5" ry="18" fill="#1e293b"/>
            <path d="M57 78C35 50 20 65 32 85C20 95 32 108 57 90Z" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.5"/>
            <path d="M63 78C85 50 100 65 88 85C100 95 88 108 63 90Z" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.5"/>
            <circle cx="42" cy="78" r="3" fill="#1e293b"/>
            <circle cx="78" cy="78" r="3" fill="#1e293b"/>
            <path d="M58 68Q52 58 48 56M62 68Q68 58 72 56" stroke="#1e293b" stroke-width="1.2"/>
          `}
          <text x="60" y="152" style="font-size:9.5px;font-weight:700;fill:#334155;text-anchor:middle">${st.note}</text>
          <rect x="15" y="162" width="90" height="18" rx="4" fill="${active ? '#dcfce7' : '#f1f5f9'}"/>
          <text x="60" y="174" style="font-size:9px;font-weight:700;fill:${active ? '#15803d' : '#64748b'};text-anchor:middle">${active ? '▶ 현재 관찰' : '대기 단계'}</text>
        </g>`;
      }).join('')}
      ${[0, 1, 2].map(i => `<g transform="translate(${175 + i * 140}, 195)">
        <line x1="0" y1="0" x2="30" y2="0" stroke="#0284c7" stroke-width="2.5" marker-end="url(#ex-arrow-cyan)"/>
      </g>`).join('')}
      <path d="M530 310Q320 370 110 310" fill="none" stroke="#16a34a" stroke-width="2.2" stroke-dasharray="6 3" marker-end="url(#ex-arrow)"/>
      <rect x="250" y="342" width="140" height="22" rx="6" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="357" style="font-size:11px;font-weight:800;fill:#15803d;text-anchor:middle">산란을 통한 생명의 순환</text>
      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">완전탈바꿈: 알 → 애벌레 → 번데기 → 성충 (4단계)</text>
      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">번데기 단계 존재 (조직 완전 재편)</text>
      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">배추흰나비는 번데기 과정을 거쳐 몸 형태와 먹이가 완전히 바뀌는 완전탈바꿈을 해요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">번데기 속 변태(Metamorphosis) 메커니즘 단면 분석</text>
      <g transform="translate(60, 85)">
        <rect x="0" y="0" width="220" height="240" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="110" y="28" style="font-size:13px;font-weight:800;fill:#15803d;text-anchor:middle">번데기 외형 (단단한 큐티클)</text>
        <path d="M70 60L150 60L160 110L110 200L60 110Z" fill="#84cc16" stroke="#4d7c0f" stroke-width="3"/>
        <line x1="110" y1="40" x2="110" y2="60" stroke="#78350f" stroke-width="3"/>
        <text x="110" y="222" style="font-size:11px;font-weight:700;fill:#334155;text-anchor:middle">보호막 형성 · 외부 충격 방어</text>
      </g>
      <g transform="translate(340, 85)">
        <rect x="0" y="0" width="240" height="240" rx="10" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5"/>
        <text x="120" y="28" style="font-size:13px;font-weight:800;fill:#15803d;text-anchor:middle">내부 조직 재편 (성충판 형성)</text>
        <path d="M80 60L160 60L170 110L120 200L70 110Z" fill="#dcfce7" stroke="#16a34a" stroke-width="2.5" stroke-dasharray="5 3"/>
        <ellipse cx="95" cy="100" rx="15" ry="25" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
        <ellipse cx="145" cy="100" rx="15" ry="25" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
        <text x="120" y="105" style="font-size:10px;font-weight:800;fill:#854d0e;text-anchor:middle">날개 성충판</text>
        <path d="M100 135L90 170M140 135L150 170" stroke="#0284c7" stroke-width="2"/>
        <text x="120" y="160" style="font-size:10px;font-weight:800;fill:#0369a1;text-anchor:middle">다리·더듬이 분화</text>
        <text x="120" y="222" style="font-size:11px;font-weight:700;fill:#15803d;text-anchor:middle">애벌레 조직 분해 → 성충 기관 재조립</text>
      </g>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="366" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">번데기 속에서는 애벌레의 씹는 입과 기는 다리가 녹아 분해(조직 붕괴)되고,</text>
      <text x="320" y="382" style="font-size:11px;font-weight:600;fill:#475569;text-anchor:middle">잠재되어 있던 성충판(Imaginal disc)이 활성화되어 날개와 긴 빨대 주둥이가 새로 자라나요</text>
      </g>`;
    } else if (c === 1) {
      customLegends = ['메뚜기의 한살이 (불완전탈바꿈)', '1. 알 (땅속 산란)', '2. 어린 약충 (날개 없음)', '3. 자란 약충 (날개 싹 돋음)', '4. 성충 (뜀다리·날개 완성)'];
      const stages = [
        { name: '알', x: 110, note: '땅속 알주머니' },
        { name: '어린 약충', x: 250, note: '성충 축소형 · 날개 없음' },
        { name: '자란 약충', x: 390, note: '탈피 반복 · 날개 싹' },
        { name: '성충', x: 530, note: '완전한 날개 · 번데기 생략' }
      ];

      body = `<g filter="url(#ex-shadow)">
      ${stages.map((st, i) => {
        const active = curStage === i;
        return `<g transform="translate(${st.x - 60}, 110)">
          <rect x="0" y="0" width="120" height="190" rx="12" fill="${active ? '#fefce8' : '#ffffff'}" stroke="${active ? '#ca8a04' : '#cbd5e1'}" stroke-width="${active ? 2.5 : 1.5}"/>
          <rect x="15" y="10" width="90" height="22" rx="6" fill="${active ? '#ca8a04' : '#e2e8f0'}"/>
          <text x="60" y="25" style="font-size:11px;font-weight:800;fill:${active ? '#ffffff' : '#475569'};text-anchor:middle">${i + 1}. ${st.name}</text>
          <circle cx="60" cy="85" r="42" fill="${active ? '#fef08a' : '#f8fafc'}" stroke="${active ? '#fde047' : '#e2e8f0'}" stroke-width="1.5"/>
          ${i === 0 ? `
            <rect x="25" y="70" width="70" height="30" rx="10" fill="#d97706" opacity="0.4"/>
            ${[38, 48, 58, 68, 78].map(cx => `<ellipse cx="${cx}" cy="${85}" rx="4" ry="8" fill="#fef08a" stroke="#b45309" stroke-width="1"/>`).join('')}
          ` : i === 1 ? `
            <ellipse cx="60" cy="85" rx="16" ry="9" fill="#84cc16"/>
            <circle cx="48" cy="83" r="6" fill="#65a30d"/>
            <path d="M68 85L80 72L84 92" stroke="#4d7c0f" stroke-width="2.5" fill="none"/>
          ` : i === 2 ? `
            <ellipse cx="60" cy="85" rx="22" ry="11" fill="#65a30d"/>
            <circle cx="44" cy="82" r="7" fill="#4d7c0f"/>
            <rect x="52" y="76" width="14" height="6" rx="2" fill="#a3e635" stroke="#365314" stroke-width="1"/>
            <path d="M72 85L88 68L92 95" stroke="#365314" stroke-width="3" fill="none"/>
          ` : `
            <ellipse cx="60" cy="85" rx="28" ry="12" fill="#4d7c0f"/>
            <circle cx="40" cy="81" r="8" fill="#365314"/>
            <path d="M48 78L88 84" stroke="#84cc16" stroke-width="4"/>
            <path d="M74 85L94 62L98 98" stroke="#14532d" stroke-width="3.5" fill="none"/>
          `}
          <text x="60" y="152" style="font-size:9.5px;font-weight:700;fill:#334155;text-anchor:middle">${st.note}</text>
          <rect x="15" y="162" width="90" height="18" rx="4" fill="${active ? '#fef08a' : '#f1f5f9'}"/>
          <text x="60" y="174" style="font-size:9px;font-weight:700;fill:${active ? '#a16207' : '#64748b'};text-anchor:middle">${active ? '▶ 현재 관찰' : '대기 단계'}</text>
        </g>`;
      }).join('')}
      ${[0, 1, 2].map(i => `<g transform="translate(${175 + i * 140}, 195)">
        <line x1="0" y1="0" x2="30" y2="0" stroke="#ca8a04" stroke-width="2.5" marker-end="url(#ex-arrow-amber)"/>
      </g>`).join('')}
      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#ca8a04" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#ca8a04"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">불완전탈바꿈: 알 → 약충(어린벌레) → 성충 (3단계)</text>
      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#dc2626" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#dc2626;text-anchor:middle">번데기 단계 없음 (X)</text>
      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#ca8a04" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">메뚜기는 번데기를 거치지 않고, 허물을 벗으며(탈피) 점차 성충의 모습으로 자라나요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">탈피(Molting)와 외골격 성장의 원리</text>
      <rect x="50" y="85" width="240" height="240" rx="10" fill="#fefce8" stroke="#fde047" stroke-width="1.5"/>
      <text x="170" y="115" style="font-size:13px;font-weight:800;fill:#854d0e;text-anchor:middle">1. 약충 단계 (날개 싹)</text>
      <ellipse cx="170" cy="180" rx="45" ry="25" fill="#a3e635"/>
      <text x="170" y="235" style="font-size:11px;font-weight:700;fill:#4d7c0f;text-anchor:middle">키틴질 단단한 껍질</text>
      <text x="170" y="255" style="font-size:10px;fill:#64748b;text-anchor:middle">몸이 자라려면 허물을 벗어야 함</text>
      <rect x="350" y="85" width="240" height="240" rx="10" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5"/>
      <text x="470" y="115" style="font-size:13px;font-weight:800;fill:#15803d;text-anchor:middle">2. 성충 단계 (완전한 날개)</text>
      <ellipse cx="470" cy="180" rx="65" ry="30" fill="#4d7c0f"/>
      <path d="M440 160L525 175" stroke="#84cc16" stroke-width="6"/>
      <text x="470" y="235" style="font-size:11px;font-weight:700;fill:#15803d;text-anchor:middle">비행 가능한 큰 날개 완성</text>
      <text x="470" y="255" style="font-size:10px;fill:#64748b;text-anchor:middle">최종 탈피 후 더 이상 허물 벗지 않음</text>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#ca8a04" stroke-width="1.5"/>
      <text x="320" y="373" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">불완전탈바꿈은 번데기 없이 탈피를 거치며 날개 싹이 점차 커져 성충이 돼요</text>
      </g>`;
    } else {
      customLegends = ['개구리의 한살이 (양서류)', '1. 알 (우무질 알덩이)', '2. 올챙이 (아가미·꼬리)', '3. 뒷다리 올챙이 (다리 형성)', '4. 개구리 (폐호흡·물갈퀴)'];
      const stages = [
        { name: '알', x: 110, note: '물속 우무질 보호막' },
        { name: '올챙이', x: 250, note: '아가미 호흡 · 지느러미 수영' },
        { name: '뒷다리 올챙이', x: 390, note: '뒷다리 돌출 · 꼬리 축소' },
        { name: '개구리', x: 530, note: '폐·피부 호흡 · 양서 생활' }
      ];

      body = `<g filter="url(#ex-shadow)">
      ${stages.map((st, i) => {
        const active = curStage === i;
        return `<g transform="translate(${st.x - 60}, 110)">
          <rect x="0" y="0" width="120" height="190" rx="12" fill="${active ? '#ecfeff' : '#ffffff'}" stroke="${active ? '#0891b2' : '#cbd5e1'}" stroke-width="${active ? 2.5 : 1.5}"/>
          <rect x="15" y="10" width="90" height="22" rx="6" fill="${active ? '#0891b2' : '#e2e8f0'}"/>
          <text x="60" y="25" style="font-size:11px;font-weight:800;fill:${active ? '#ffffff' : '#475569'};text-anchor:middle">${i + 1}. ${st.name}</text>
          <circle cx="60" cy="85" r="42" fill="${active ? '#cffafe' : '#f8fafc'}" stroke="${active ? '#a5f3fc' : '#e2e8f0'}" stroke-width="1.5"/>
          ${i === 0 ? `
            <circle cx="60" cy="85" r="28" fill="#e0f2fe" opacity="0.6"/>
            ${[50, 65, 55, 68].map((cx, j) => `<circle cx="${cx}" cy="${75 + j * 6}" r="5" fill="#0f172a"/>`).join('')}
          ` : i === 1 ? `
            <ellipse cx="48" cy="85" rx="14" ry="10" fill="#334155"/>
            <path d="M58 85Q75 75 92 88" fill="none" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
            <circle cx="44" cy="82" r="2" fill="#ffffff"/>
          ` : i === 2 ? `
            <ellipse cx="48" cy="85" rx="15" ry="11" fill="#334155"/>
            <path d="M60 85Q75 80 88 86" fill="none" stroke="#64748b" stroke-width="3" stroke-linecap="round"/>
            <path d="M52 92L58 102L65 102" fill="none" stroke="#0f172a" stroke-width="2"/>
          ` : `
            <ellipse cx="60" cy="85" rx="20" ry="16" fill="#15803d"/>
            <circle cx="50" cy="73" r="6" fill="#166534"/>
            <circle cx="70" cy="73" r="6" fill="#166534"/>
            <circle cx="50" cy="73" r="2.5" fill="#fef08a"/>
            <circle cx="70" cy="73" r="2.5" fill="#fef08a"/>
            <path d="M42 95L30 102M78 95L90 102" stroke="#14532d" stroke-width="3.5"/>
          `}
          <text x="60" y="152" style="font-size:9.5px;font-weight:700;fill:#334155;text-anchor:middle">${st.note}</text>
          <rect x="15" y="162" width="90" height="18" rx="4" fill="${active ? '#cffafe' : '#f1f5f9'}"/>
          <text x="60" y="174" style="font-size:9px;font-weight:700;fill:${active ? '#0e7490' : '#64748b'};text-anchor:middle">${active ? '▶ 현재 관찰' : '대기 단계'}</text>
        </g>`;
      }).join('')}
      ${[0, 1, 2].map(i => `<g transform="translate(${175 + i * 140}, 195)">
        <line x1="0" y1="0" x2="30" y2="0" stroke="#0891b2" stroke-width="2.5" marker-end="url(#ex-arrow-cyan)"/>
      </g>`).join('')}
      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#0891b2" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#0891b2"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">양서류 변태: 수중 생활(아가미) → 육상 생활(폐·피부 호흡)</text>
      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">호흡계·운동계 완전 전환</text>
      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#0891b2" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">올챙이는 자라면서 뒷다리가 먼저 나오고 앞다리가 나온 뒤 꼬리가 흡수되며 개구리가 돼요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">올챙이에서 개구리로의 호흡계·소화계 변태 단면</text>
      <rect x="50" y="85" width="240" height="240" rx="10" fill="#ecfeff" stroke="#a5f3fc" stroke-width="1.5"/>
      <text x="170" y="115" style="font-size:13px;font-weight:800;fill:#0e7490;text-anchor:middle">올챙이: 아가미 호흡 (수중)</text>
      <circle cx="170" cy="180" r="40" fill="#67e8f9" opacity="0.4"/>
      <text x="170" y="235" style="font-size:11px;font-weight:700;fill:#0891b2;text-anchor:middle">물속 산소 아가미로 흡수</text>
      <text x="170" y="255" style="font-size:10px;fill:#64748b;text-anchor:middle">식물성 먹이 (긴 나선형 장)</text>
      <rect x="350" y="85" width="240" height="240" rx="10" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5"/>
      <text x="470" y="115" style="font-size:13px;font-weight:800;fill:#15803d;text-anchor:middle">개구리: 폐와 피부 호흡 (육상)</text>
      <ellipse cx="470" cy="180" rx="45" ry="30" fill="#86efac" opacity="0.4"/>
      <text x="470" y="235" style="font-size:11px;font-weight:700;fill:#15803d;text-anchor:middle">공기 중 산소 흡수</text>
      <text x="470" y="255" style="font-size:10px;fill:#64748b;text-anchor:middle">동물성 먹이 곤충 포식 (짧은 장)</text>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#0891b2" stroke-width="1.5"/>
      <text x="320" y="373" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">개구리는 호흡 기관뿐 아니라 장의 길이도 초식성에서 육식성으로 짧아지는 극적인 변태를 거쳐요</text>
      </g>`;
    }
    caption = c === 0 ? '나비는 알·애벌레·번데기·성충의 4단계를 모두 거치는 완전탈바꿈을 해요.' : c === 1 ? '메뚜기는 번데기 단계를 거치지 않고 자라는 불완전탈바꿈을 해요.' : '개구리는 물속 아가미 호흡에서 육상 폐호흡으로 전환되는 양서류 변태를 해요.';
  }

  else if (kind === 'plant-lifecycle') {
    controls = ['물·공기·적절한 온도', '물이 부족한 조건', '발아 뒤 빛이 부족'];
    customSteps = ['생장 과정 관찰', '씨앗 내부 구조 단면'];
    const growth = c === 1 ? 0.05 : Math.min(1, 0.35 + phase * 0.65);
    const stemH = c === 2 ? 180 : 125;
    const stemColor = c === 2 ? '#ca8a04' : '#16a34a';
    const leafColor = c === 2 ? '#fef08a' : '#22c55e';

    body = `<g filter="url(#ex-shadow)">
    <path d="M30 270Q320 255 610 270V410H30Z" fill="#78350f" opacity="0.85"/>
    <line x1="30" y1="270" x2="610" y2="270" stroke="#451a03" stroke-width="2.5"/>
    ${[60, 140, 220, 420, 500, 560].map((sx, j) => `<ellipse cx="${sx}" cy="${295 + j % 3 * 25}" rx="${12 + j % 2 * 6}" ry="${6 + j % 2 * 3}" fill="#451a03" opacity="0.6"/>`).join('')}
    
    ${c === 1 ? `
      <path d="M280 270L300 295M340 270L325 305" stroke="#451a03" stroke-width="2"/>
      <ellipse cx="320" cy="275" rx="26" ry="18" fill="#a16207" stroke="#78350f" stroke-width="2.5"/>
      <path d="M305 272Q320 282 335 272" stroke="#451a03" stroke-width="1.5" fill="none"/>
      <rect x="200" y="170" width="240" height="42" rx="8" fill="#fff1f2" stroke="#f43f5e" stroke-width="1.5"/>
      <text x="320" y="192" style="font-size:12px;font-weight:800;fill:#e11d48;text-anchor:middle">수분 결핍: 세포 팽압 형성 불가</text>
      <text x="320" y="205" style="font-size:10.5px;fill:#475569;text-anchor:middle">씨앗 껍질을 뚫지 못하고 발아 정지</text>
    ` : `
      <ellipse cx="320" cy="272" rx="26" ry="18" fill="#854d0e" stroke="#583101" stroke-width="2"/>
      <path d="M320 285Q305 ${310 + growth * 45} 320 ${325 + growth * 60}" fill="none" stroke="#d97706" stroke-width="5" stroke-linecap="round"/>
      ${growth > 0.4 ? `
        <line x1="312" y1="${310 + growth * 20}" x2="295" y2="${315 + growth * 20}" stroke="#d97706" stroke-width="1.5"/>
        <line x1="325" y1="${320 + growth * 25}" x2="340" y2="${324 + growth * 25}" stroke="#d97706" stroke-width="1.5"/>
      ` : ''}
      <path d="M320 265Q${c === 2 ? 305 : 315} ${250 - growth * stemH / 2} 320 ${265 - growth * stemH}" fill="none" stroke="${stemColor}" stroke-width="${c === 2 ? 4.5 : 8}" stroke-linecap="round"/>
      ${growth > 0.25 ? `
        <path d="M320 ${265 - growth * stemH}Q260 ${245 - growth * stemH} 265 ${215 - growth * stemH}Q315 ${210 - growth * stemH} 320 ${265 - growth * stemH}" fill="${leafColor}" stroke="${c === 2 ? '#a16207' : '#15803d'}" stroke-width="1.5"/>
        <path d="M320 ${265 - growth * stemH}Q380 ${245 - growth * stemH} 375 ${215 - growth * stemH}Q325 ${210 - growth * stemH} 320 ${265 - growth * stemH}" fill="${leafColor}" stroke="${c === 2 ? '#a16207' : '#15803d'}" stroke-width="1.5"/>
      ` : ''}
      ${c === 0 ? `
        <circle cx="270" cy="${250 + (phase * 60) % 60}" r="4.5" fill="#0284c7"/>
        <circle cx="370" cy="${245 + ((phase + 0.5) * 60) % 60}" r="4.5" fill="#0284c7"/>
      ` : ''}
    `}

    <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="${c === 1 ? '#e11d48' : c === 2 ? '#ca8a04' : '#16a34a'}" stroke-width="1.5"/>
    <circle cx="42" cy="41" r="5" fill="${c === 1 ? '#e11d48' : c === 2 ? '#ca8a04' : '#16a34a'}"/>
    <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">${c === 0 ? '발아 3요소 충족: 수분 흡수 → 유근·유아 신장' : c === 1 ? '수분 결핍: 씨앗 껍질을 뚫지 못하고 발아 정지' : '빛 결핍 (웃자람): 엽록소 결핍 · 줄기만 비정상 신장'}</text>

    <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
    <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">${c === 0 ? '정상 엽록소 형성 (녹색)' : c === 1 ? '발아율 0% (휴면 지속)' : '웃자람(황화 현상 발생)'}</text>

    <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
    <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">${c === 0 ? '씨앗은 물과 산소, 알맞은 온도가 주어지면 영양분을 분해해 싹을 틔워요' : c === 1 ? '물이 없으면 효소가 활성화되지 않아 씨앗 내부 영양분을 분해할 수 없어요' : '빛이 부족하면 식물은 빛을 찾기 위해 줄기만 길게 늘이고 엽록소를 만들지 못해요'}</text>
    </g>`;

    detail = `<g filter="url(#ex-shadow)">
    <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
    <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">강낭콩 씨앗의 내부 해부 구조(Embryo Architecture) 단면</text>
    
    <g transform="translate(180, 85)">
      <path d="M140 0C60 0 0 50 0 120C0 190 60 240 140 240C220 240 280 190 280 120C280 50 220 0 140 0Z" fill="#a16207" stroke="#78350f" stroke-width="4"/>
      <path d="M136 10C65 10 14 55 14 120C14 185 65 230 136 230C207 230 258 185 258 120C258 55 207 10 136 10Z" fill="#fef08a"/>
      <path d="M60 110Q85 90 100 115Q85 105 60 110" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
      <path d="M65 118Q90 100 105 125Q90 115 65 118" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
      <path d="M95 120Q110 145 105 175" fill="none" stroke="#ca8a04" stroke-width="7" stroke-linecap="round"/>
    </g>

    <rect x="40" y="115" width="120" height="26" rx="6" fill="#fffffffa" stroke="#15803d" stroke-width="1.5"/>
    <text x="100" y="132" style="font-size:11px;font-weight:800;fill:#15803d;text-anchor:middle">어린잎 (본잎 싹)</text>
    <line x1="160" y1="128" x2="250" y2="185" stroke="#15803d" stroke-width="1.5" stroke-dasharray="3 2"/>

    <rect x="40" y="195" width="120" height="26" rx="6" fill="#fffffffa" stroke="#ca8a04" stroke-width="1.5"/>
    <text x="100" y="212" style="font-size:11px;font-weight:800;fill:#ca8a04;text-anchor:middle">어린뿌리 (유근)</text>
    <line x1="160" y1="208" x2="275" y2="235" stroke="#ca8a04" stroke-width="1.5" stroke-dasharray="3 2"/>

    <rect x="480" y="135" width="120" height="26" rx="6" fill="#fffffffa" stroke="#a16207" stroke-width="1.5"/>
    <text x="540" y="152" style="font-size:11px;font-weight:800;fill:#a16207;text-anchor:middle">떡잎 (양분 저장고)</text>
    <line x1="480" y1="148" x2="380" y2="175" stroke="#a16207" stroke-width="1.5" stroke-dasharray="3 2"/>

    <rect x="480" y="215" width="120" height="26" rx="6" fill="#fffffffa" stroke="#78350f" stroke-width="1.5"/>
    <text x="540" y="232" style="font-size:11px;font-weight:800;fill:#78350f;text-anchor:middle">씨껍질 (보호막)</text>
    <line x1="480" y1="228" x2="435" y2="215" stroke="#78350f" stroke-width="1.5" stroke-dasharray="3 2"/>

    <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
    <text x="320" y="366" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">씨앗 속의 어린 식물(배)은 떡잎에 저장된 녹말을 양분 삼아 자라며,</text>
    <text x="320" y="382" style="font-size:11px;font-weight:600;fill:#475569;text-anchor:middle">본잎이 나와 광합성을 시작할 때까지 물과 산소, 적절한 온도를 이용해 스스로 발아해요</text>
    </g>`;

    caption = c === 1 ? '발아에는 물과 공기, 적절한 온도 등의 조건이 필요해요. 수분이 부족하면 세포가 팽창하지 못해 싹을 틔울 수 없어요.' : c === 2 ? '발아 이후의 생장에는 빛이 필수적이에요. 빛이 없으면 엽록소를 만들지 못하고 키만 웃자라요.' : '씨가 물을 흡수하면 어린뿌리가 먼저 아래로 자라고, 이어서 줄기와 떡잎이 위로 자라요.';
  }

  else if (kind === 'flower-seed') {
    controls = ['꽃가루가 암술머리로', '열매와 씨가 생기는 곳', '씨가 퍼지는 모습'];
    customSteps = ['구조와 과정 관찰', '생식 기관 단면 분석'];

    if (c === 0) {
      body = `<g filter="url(#ex-shadow)">
      <path d="M320 390V250" stroke="#15803d" stroke-width="14" stroke-linecap="round"/>
      <path d="M260 270Q320 300 380 270Q320 250 260 270Z" fill="#16a34a" stroke="#14532d" stroke-width="2"/>
      
      ${[0, 1, 2, 3, 4].map(i => {
        const ang = (i * 72 - 90) * Math.PI / 180;
        const px = 320 + 95 * Math.cos(ang);
        const py = 200 + 75 * Math.sin(ang);
        return `<ellipse cx="${px}" cy="${py}" rx="55" ry="38" transform="rotate(${i * 72 - 90} ${px} ${py})" fill="#fda4af" stroke="#f43f5e" stroke-width="2" opacity="0.9"/>`;
      }).join('')}

      <ellipse cx="320" cy="245" rx="38" ry="46" fill="#86efac" stroke="#15803d" stroke-width="2.5"/>
      <ellipse cx="310" cy="245" rx="7" ry="11" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
      <ellipse cx="330" cy="245" rx="7" ry="11" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
      <path d="M320 205V125" stroke="#22c55e" stroke-width="10" stroke-linecap="round"/>
      <circle cx="320" cy="122" r="16" fill="#15803d" stroke="#14532d" stroke-width="2"/>
      <path d="M312 118Q320 110 328 118" stroke="#86efac" stroke-width="2" fill="none"/>

      <path d="M280 235Q250 190 260 145" fill="none" stroke="#ca8a04" stroke-width="4"/>
      <ellipse cx="260" cy="140" rx="14" ry="9" fill="#fde047" stroke="#a16207" stroke-width="1.8"/>
      <path d="M360 235Q390 190 380 145" fill="none" stroke="#ca8a04" stroke-width="4"/>
      <ellipse cx="380" cy="140" rx="14" ry="9" fill="#fde047" stroke="#a16207" stroke-width="1.8"/>

      <circle cx="${260 + 60 * phase}" cy="${140 - 18 * Math.sin(phase * Math.PI)}" r="5.5" fill="#eab308" stroke="#854d0e" stroke-width="1.2"/>
      <circle cx="${270 + 50 * phase}" cy="${145 - 12 * Math.sin(phase * Math.PI)}" r="4.5" fill="#facc15"/>
      <path d="M320 135V${135 + phase * 65}" stroke="#eab308" stroke-width="3.5" stroke-dasharray="4 2"/>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#15803d" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#15803d"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">수분(Pollination): 꽃가루가 암술머리에 붙는 현상</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">화분관 발아 및 밑씨 도달</text>

      <rect x="195" y="130" width="48" height="22" rx="4" fill="#fffffffa" stroke="#a16207"/>
      <text x="219" y="145" style="font-size:10px;font-weight:800;fill:#a16207;text-anchor:middle">수술</text>
      <rect x="395" y="112" width="48" height="22" rx="4" fill="#fffffffa" stroke="#15803d"/>
      <text x="419" y="127" style="font-size:10px;font-weight:800;fill:#15803d;text-anchor:middle">암술</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#15803d" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">수술의 꽃밥에서 나온 꽃가루가 곤충이나 바람을 통해 암술머리에 옮겨붙는 것이 수분이에요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">암술 내부 구조와 수정(Fertilization) 경로 단면</text>
      <g transform="translate(190, 80)">
        <ellipse cx="130" cy="180" rx="85" ry="95" fill="#dcfce7" stroke="#16a34a" stroke-width="3"/>
        <path d="M130 90V0" stroke="#22c55e" stroke-width="22" stroke-linecap="round"/>
        <circle cx="130" cy="-6" r="24" fill="#15803d"/>
        <ellipse cx="130" cy="180" rx="42" ry="50" fill="#fef08a" stroke="#ca8a04" stroke-width="2.5"/>
        <circle cx="130" cy="180" r="12" fill="#fde047" stroke="#854d0e" stroke-width="1.5"/>
        <path d="M130 -6V170" fill="none" stroke="#dc2626" stroke-width="4" stroke-dasharray="6 3"/>
        <circle cx="130" cy="170" r="4.5" fill="#dc2626"/>
      </g>
      <rect x="50" y="110" width="130" height="26" rx="6" fill="#fffffffa" stroke="#15803d" stroke-width="1.5"/>
      <text x="115" y="127" style="font-size:11px;font-weight:800;fill:#15803d;text-anchor:middle">암술머리 (수분)</text>
      <rect x="50" y="235" width="130" height="26" rx="6" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="115" y="252" style="font-size:11px;font-weight:800;fill:#16a34a;text-anchor:middle">씨방 (→ 열매 과육)</text>
      <rect x="460" y="235" width="130" height="26" rx="6" fill="#fffffffa" stroke="#ca8a04" stroke-width="1.5"/>
      <text x="525" y="252" style="font-size:11px;font-weight:800;fill:#ca8a04;text-anchor:middle">밑씨 (→ 씨앗)</text>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="366" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">화분관을 통해 정핵이 밑씨의 난세포와 만나면 수정이 완료되고,</text>
      <text x="320" y="382" style="font-size:11px;font-weight:600;fill:#475569;text-anchor:middle">씨방은 비대해져 과육(열매)이 되고, 밑씨는 단단한 껍질을 가진 씨(종자)가 돼요</text>
      </g>`;
    } else if (c === 1) {
      body = `<g filter="url(#ex-shadow)">
      <rect x="40" y="85" width="260" height="280" rx="14" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5"/>
      <text x="170" y="115" style="font-size:14px;font-weight:800;fill:#15803d;text-anchor:middle">1. 꽃 시절 (씨방과 밑씨)</text>
      <ellipse cx="170" cy="220" rx="55" ry="65" fill="#bbf7d0" stroke="#16a34a" stroke-width="2.5"/>
      <ellipse cx="170" cy="220" rx="20" ry="25" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
      <text x="170" y="224" style="font-size:11px;font-weight:800;fill:#854d0e;text-anchor:middle">밑씨</text>
      <text x="170" y="325" style="font-size:11.5px;font-weight:700;fill:#166534;text-anchor:middle">씨방 (Ovary)</text>

      <path d="M315 220H345" stroke="#0284c7" stroke-width="3" marker-end="url(#ex-arrow-cyan)"/>

      <rect x="360" y="85" width="260" height="280" rx="14" fill="#fefce8" stroke="#fde047" stroke-width="1.5"/>
      <text x="490" y="115" style="font-size:14px;font-weight:800;fill:#854d0e;text-anchor:middle">2. 결실 후 (열매와 씨)</text>
      <circle cx="490" cy="220" r="75" fill="#fda4af" stroke="#e11d48" stroke-width="3"/>
      <circle cx="490" cy="220" r="28" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
      <ellipse cx="490" cy="220" rx="12" ry="16" fill="#78350f"/>
      <text x="490" y="224" style="font-size:11px;font-weight:800;fill:#ffffff;text-anchor:middle">씨</text>
      <text x="490" y="325" style="font-size:11.5px;font-weight:700;fill:#be123c;text-anchor:middle">열매 과육 (Fruit)</text>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">수정 후 변화: 씨방 → 열매, 밑씨 → 씨앗</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">형태 및 기관 전환 확인</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">수정이 끝나면 꽃잎은 시들어 떨어지고, 영양분이 집중되어 씨방이 열매로 부풀어요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">사과 열매와 씨의 내부 단면(Fruit Pericarp Architecture)</text>
      <g transform="translate(180, 85)">
        <ellipse cx="120" cy="120" rx="110" ry="115" fill="#fee2e2" stroke="#ef4444" stroke-width="4"/>
        <ellipse cx="120" cy="120" rx="45" ry="50" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
        <ellipse cx="105" cy="115" rx="8" ry="14" fill="#78350f"/>
        <ellipse cx="135" cy="115" rx="8" ry="14" fill="#78350f"/>
        <path d="M120 5V-25" stroke="#78350f" stroke-width="6" stroke-linecap="round"/>
      </g>
      <rect x="50" y="140" width="120" height="26" rx="6" fill="#fffffffa" stroke="#ef4444" stroke-width="1.5"/>
      <text x="110" y="157" style="font-size:11px;font-weight:800;fill:#ef4444;text-anchor:middle">과육 (씨방 비대)</text>
      <rect x="470" y="140" width="120" height="26" rx="6" fill="#fffffffa" stroke="#78350f" stroke-width="1.5"/>
      <text x="530" y="157" style="font-size:11px;font-weight:800;fill:#78350f;text-anchor:middle">씨앗 (밑씨 성숙)</text>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="366" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">꽃의 씨방 벽이 두꺼워져 과육이 되고, 밑씨는 단단한 껍질을 갖춘 종자로 성숙해요</text>
      </g>`;
    } else {
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(60, 95)">
        <rect x="0" y="0" width="240" height="260" rx="12" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1.5"/>
        <text x="120" y="28" style="font-size:13px;font-weight:800;fill:#0369a1;text-anchor:middle">바람에 날리는 씨 (민들레)</text>
        <path d="M20 70Q120 50 220 75M20 120Q120 100 220 125" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6 3"/>
        <g transform="translate(${100 + phase * 40}, ${140 - phase * 30})">
          <ellipse cx="0" cy="40" rx="5" ry="12" fill="#78350f"/>
          <line x1="0" y1="40" x2="0" y2="0" stroke="#a16207" stroke-width="2"/>
          ${[-30, -15, 0, 15, 30].map(deg => `<line x1="0" y1="0" x2="${Math.sin(deg * Math.PI / 180) * 35}" y2="${-Math.cos(deg * Math.PI / 180) * 25}" stroke="#cbd5e1" stroke-width="1.5"/>`).join('')}
        </g>
        <text x="120" y="240" style="font-size:11px;font-weight:700;fill:#0369a1;text-anchor:middle">가벼운 깃털 갓모양 털 (공기 저항)</text>
      </g>

      <g transform="translate(340, 95)">
        <rect x="0" y="0" width="240" height="260" rx="12" fill="#fefce8" stroke="#fef08a" stroke-width="1.5"/>
        <text x="120" y="28" style="font-size:13px;font-weight:800;fill:#854d0e;text-anchor:middle">튕겨 나가는 씨 (봉선화)</text>
        <path d="M80 150Q120 100 160 150" fill="none" stroke="#65a30d" stroke-width="5"/>
        <path d="M90 145Q120 180 150 145" fill="none" stroke="#65a30d" stroke-width="4"/>
        ${[[-35, -45], [0, -60], [35, -45], [-20, -20], [20, -20]].map(([dx, dy]) => {
          const sx = 120 + dx * phase * 1.5;
          const sy = 145 + dy * phase * 1.5 + phase * phase * 35;
          return `<circle cx="${sx}" cy="${sy}" r="4.5" fill="#78350f" stroke="#451a03" stroke-width="1"/>`;
        }).join('')}
        <text x="120" y="240" style="font-size:11px;font-weight:700;fill:#854d0e;text-anchor:middle">열매 껍질 탄성 장력으로 발사</text>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#0284c7"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">씨의 산포 적응: 바람, 껍질 탄성, 동물 등</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#15803d" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#15803d;text-anchor:middle">서식지 확장 생존 전략</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">씨는 어미 식물과 경쟁하지 않고 멀리 퍼지기 위해 바람, 튕김, 동물 털 등 다양한 방법을 써요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">민들레 갓털(Pappus)의 공기역학적 와류 형성 단면</text>
      <g transform="translate(160, 85)">
        <rect x="0" y="0" width="280" height="240" rx="12" fill="#f0f9ff" stroke="#38bdf8" stroke-width="1.5"/>
        <ellipse cx="140" cy="180" rx="12" ry="30" fill="#78350f"/>
        <line x1="140" y1="150" x2="140" y2="70" stroke="#a16207" stroke-width="3"/>
        <path d="M100 45Q140 10 180 45" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="5 3"/>
        <text x="140" y="35" style="font-size:11px;font-weight:800;fill:#0284c7;text-anchor:middle">분리된 와류 링 (안정적 부력 생성)</text>
      </g>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="366" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">민들레 갓털 사이의 미세 틈은 공기가 통과하며 상부에 안정적인 소용돌이 고리를 만들어</text>
      <text x="320" y="382" style="font-size:11px;font-weight:600;fill:#475569;text-anchor:middle">일반 낙하산보다 4배 높은 효율로 바람을 타고 수 킬로미터를 날아갈 수 있어요</text>
      </g>`;
    }
    caption = c === 0 ? '꽃가루가 암술머리에 옮겨지는 수분 과정을 살펴봐요. 화분관이 자라 밑씨와 결합해 수정돼요.' : c === 1 ? '수정이 끝나면 씨방은 자라 열매가 되고, 밑씨는 단단한 씨가 돼요.' : '씨는 바람, 탄성 파열, 동물 등 다양한 방법으로 멀리 퍼져 서식지를 넓혀요.';
  }

  else if (kind === 'body-systems') {
    controls = ['음식의 이동 · 소화', '공기의 이동 · 호흡', '혈액의 이동 · 순환'];
    customSteps = ['기관계 전신 경로', '핵심 장기 미세 단면'];

    const torso = `
    <path d="M260 90Q240 100 230 145L220 220Q230 250 240 230L255 180V310L245 405H285L320 325L355 405H395L385 310V180L400 230Q410 250 420 220L410 145Q400 100 380 90Z" fill="#fdfcf8" stroke="#94a3b8" stroke-width="2.5"/>
    <circle cx="320" cy="55" r="38" fill="#fdfcf8" stroke="#94a3b8" stroke-width="2.5"/>
    `;

    if (c === 0) {
      const route = [
        [320, 55], [320, 115], [320, 175], [350, 195], [330, 220],
        [290, 245], [350, 260], [285, 280], [355, 295],
        [275, 235], [365, 235], [365, 320], [325, 355]
      ];
      const rIdx = Math.floor(phase * (route.length - 1));
      const rNext = Math.min(route.length - 1, rIdx + 1);
      const rf = (phase * (route.length - 1)) - rIdx;
      const bx = route[rIdx][0] + (route[rNext][0] - route[rIdx][0]) * rf;
      const by = route[rIdx][1] + (route[rNext][1] - route[rIdx][1]) * rf;

      body = `<g filter="url(#ex-shadow)">
      ${torso}
      <path d="M320 60V165" stroke="#f97316" stroke-width="9" stroke-linecap="round"/>
      <path d="M320 165C355 155 385 180 375 210C365 240 335 235 325 218C312 210 315 185 320 165Z" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
      <path d="M325 220Q290 225 290 245Q350 240 350 260Q285 255 285 275Q350 270 345 290Q305 305 280 300" fill="none" stroke="#fde047" stroke-width="10" stroke-linecap="round"/>
      <path d="M280 300L275 305V235Q320 220 365 235V310Q365 325 345 335L325 345V365" fill="none" stroke="#ca8a04" stroke-width="14" stroke-linecap="round"/>
      <circle cx="${bx}" cy="${by}" r="7.5" fill="#dc2626" stroke="#ffffff" stroke-width="2"/>

      <rect x="420" y="50" width="55" height="24" rx="5" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="447" y="66" style="font-size:11px;font-weight:800;fill:#0284c7;text-anchor:middle">1. 입</text>
      <rect x="420" y="115" width="55" height="24" rx="5" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="447" y="131" style="font-size:11px;font-weight:800;fill:#0284c7;text-anchor:middle">2. 식도</text>
      <rect x="420" y="180" width="55" height="24" rx="5" fill="#fffffffa" stroke="#ea580c" stroke-width="1.5"/>
      <text x="447" y="196" style="font-size:11px;font-weight:800;fill:#ea580c;text-anchor:middle">3. 위</text>
      <rect x="65" y="255" width="85" height="24" rx="5" fill="#fffffffa" stroke="#ca8a04" stroke-width="1.5"/>
      <text x="107" y="271" style="font-size:11px;font-weight:800;fill:#ca8a04;text-anchor:middle">4. 작은창자</text>
      <rect x="420" y="275" width="85" height="24" rx="5" fill="#fffffffa" stroke="#b45309" stroke-width="1.5"/>
      <text x="462" y="291" style="font-size:11px;font-weight:800;fill:#b45309;text-anchor:middle">5. 큰창자</text>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#ea580c" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#ea580c"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">소화계: 입 → 식도 → 위 → 작은창자 → 큰창자</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">영양소 분해 및 흡수 이동</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#ea580c" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">위에서 단백질을 1차 분해하고, 작은창자에서 대부분의 영양소를 최종 흡수해요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">작은창자 융모(Villi)의 영양소 흡수 단면 분석</text>
      <path d="M60 280C90 100 130 100 160 280C190 100 230 100 260 280C290 100 330 100 360 280C390 100 430 100 460 280C490 100 530 100 560 280" fill="#fef3c7" stroke="#d97706" stroke-width="3"/>
      <path d="M190 280C205 130 220 130 230 280" fill="none" stroke="#dc2626" stroke-width="5"/>
      <path d="M220 280C225 150 235 150 240 280" fill="none" stroke="#2563eb" stroke-width="4"/>
      <line x1="210" y1="280" x2="210" y2="160" stroke="#ca8a04" stroke-width="7" stroke-linecap="round"/>

      <rect x="60" y="80" width="160" height="26" rx="6" fill="#fffffffa" stroke="#ca8a04" stroke-width="1.5"/>
      <text x="140" y="97" style="font-size:11px;font-weight:800;fill:#854d0e;text-anchor:middle">암죽관 (지방산 흡수)</text>
      <rect x="380" y="80" width="180" height="26" rx="6" fill="#fffffffa" stroke="#dc2626" stroke-width="1.5"/>
      <text x="470" y="97" style="font-size:11px;font-weight:800;fill:#dc2626;text-anchor:middle">모세혈관망 (포도당·아미노산)</text>

      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#ea580c" stroke-width="1.5"/>
      <text x="320" y="366" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">수많은 주름과 융모는 표면적을 테니스 코트 크기로 넓혀</text>
      <text x="320" y="382" style="font-size:11px;font-weight:600;fill:#475569;text-anchor:middle">음식물 속 수용성·지용성 영양소를 매우 빠르고 완벽하게 흡수할 수 있게 해줘요</text>
      </g>`;
    } else if (c === 1) {
      const lungExpand = 1 + 0.1 * Math.sin(phase * Math.PI * 2);

      body = `<g filter="url(#ex-shadow)">
      ${torso}
      <path d="M320 60V160" stroke="#64748b" stroke-width="11" stroke-linecap="round"/>
      ${[75, 95, 115, 135, 150].map(y => `<line x1="314" y1="${y}" x2="326" y2="${y}" stroke="#38bdf8" stroke-width="2"/>`).join('')}
      <path d="M320 160L280 195M320 160L360 195" stroke="#64748b" stroke-width="7" stroke-linecap="round"/>
      <g transform="translate(320, 205) scale(${lungExpand}) translate(-320, -205)">
        <path d="M300 165Q245 160 245 255Q285 285 305 255V180Z" fill="#fda4af" stroke="#f43f5e" stroke-width="2.5"/>
        <path d="M340 165Q395 160 395 255Q355 285 335 255V180Z" fill="#fda4af" stroke="#f43f5e" stroke-width="2.5"/>
      </g>
      <circle cx="320" cy="${60 + phase * 100}" r="5.5" fill="#0284c7" stroke="#ffffff" stroke-width="1.5"/>

      <path d="M245 ${275 + Math.sin(phase * Math.PI * 2) * 10}Q320 ${290 + Math.sin(phase * Math.PI * 2) * 10} 395 ${275 + Math.sin(phase * Math.PI * 2) * 10}" fill="none" stroke="#be123c" stroke-width="4"/>

      <rect x="420" y="55" width="65" height="24" rx="5" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="452" y="71" style="font-size:11px;font-weight:800;fill:#0284c7;text-anchor:middle">코·기관</text>
      <rect x="420" y="160" width="65" height="24" rx="5" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="452" y="176" style="font-size:11px;font-weight:800;fill:#0284c7;text-anchor:middle">기관지</text>
      <rect x="420" y="225" width="55" height="24" rx="5" fill="#fffffffa" stroke="#f43f5e" stroke-width="1.5"/>
      <text x="447" y="241" style="font-size:11px;font-weight:800;fill:#f43f5e;text-anchor:middle">폐 (Lungs)</text>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#0284c7"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">호흡계: 코 → 기관 → 기관지 → 폐 (폐포 가스 교환)</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#f43f5e" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#f43f5e;text-anchor:middle">산소(O₂) 흡수 · 이산화탄소(CO₂) 배출</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">가슴 내부의 압력 변화로 공기를 들이마시고 내쉬며, 폐포에서 기체 교환이 일어나요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">폐포(Alveolus)와 모세혈관의 가스 교환 메커니즘 단면</text>
      <circle cx="240" cy="190" r="85" fill="#fce7f3" stroke="#f43f5e" stroke-width="3"/>
      <path d="M120 280Q240 320 360 280Q360 100 240 80Q120 100 120 280" fill="none" stroke="#dc2626" stroke-width="16" opacity="0.45"/>
      <path d="M240 160L290 130" stroke="#0284c7" stroke-width="4" marker-end="url(#ex-arrow-cyan)"/>
      <text x="275" y="115" style="font-size:12px;font-weight:800;fill:#0284c7">O₂ 산소 확산</text>
      <path d="M290 230L240 210" stroke="#475569" stroke-width="4" marker-end="url(#ex-arrow)"/>
      <text x="305" y="250" style="font-size:12px;font-weight:800;fill:#475569">CO₂ 배출</text>

      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="366" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">폐포의 얇은 막을 사이에 두고 농도 차이에 의한 기체 확산이 일어나</text>
      <text x="320" y="382" style="font-size:11px;font-weight:600;fill:#475569;text-anchor:middle">산소는 모세혈관 속 적혈구로 들어가고, 세포 호흡 찌꺼기인 이산화탄소는 밖으로 나가요</text>
      </g>`;
    } else {
      const heartPulse = 1 + 0.12 * Math.sin(phase * Math.PI * 4);

      body = `<g filter="url(#ex-shadow)">
      ${torso}
      <path d="M320 190V100M320 190V340M320 120H250M320 120H390" stroke="#dc2626" stroke-width="6"/>
      <path d="M305 190V100M305 190V340M305 130H240M305 130H380" stroke="#2563eb" stroke-width="5"/>
      
      <g transform="translate(320, 190) scale(${heartPulse}) translate(-320, -190)">
        <path d="M320 170C300 135 270 170 300 205L320 225L340 205C370 170 340 135 320 170Z" fill="#dc2626" stroke="#991b1b" stroke-width="2.5"/>
        <circle cx="310" cy="185" r="5" fill="#2563eb"/>
        <circle cx="330" cy="185" r="5" fill="#ef4444"/>
      </g>

      <circle cx="320" cy="${190 - phase * 70}" r="4.5" fill="#ffffff" stroke="#dc2626" stroke-width="1.5"/>
      <circle cx="305" cy="${340 - phase * 140}" r="4.5" fill="#ffffff" stroke="#2563eb" stroke-width="1.5"/>

      <rect x="420" y="175" width="75" height="24" rx="5" fill="#fffffffa" stroke="#dc2626" stroke-width="1.5"/>
      <text x="457" y="191" style="font-size:11px;font-weight:800;fill:#dc2626;text-anchor:middle">심장 (펌프)</text>
      <rect x="65" y="115" width="85" height="24" rx="5" fill="#fffffffa" stroke="#dc2626" stroke-width="1.5"/>
      <text x="107" y="131" style="font-size:11px;font-weight:800;fill:#dc2626;text-anchor:middle">동맥 (산소 풍부)</text>
      <rect x="65" y="150" width="85" height="24" rx="5" fill="#fffffffa" stroke="#2563eb" stroke-width="1.5"/>
      <text x="107" y="166" style="font-size:11px;font-weight:800;fill:#2563eb;text-anchor:middle">정맥 (노폐물 수송)</text>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#dc2626" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#dc2626"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">순환계: 심장 펌프 작용 → 온몸 혈관 순환</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#dc2626" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#dc2626;text-anchor:middle">온몸 순환 &amp; 폐순환 2중 루프</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#dc2626" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">심장은 1분에 약 70회 규칙적으로 수축하여 혈액을 온몸 구석구석으로 보내요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">심장의 4개 방(2심방 2심실)과 판막 구조 단면</text>
      <g transform="translate(190, 85)">
        <rect x="0" y="0" width="220" height="230" rx="20" fill="#fee2e2" stroke="#dc2626" stroke-width="3"/>
        <line x1="110" y1="0" x2="110" y2="230" stroke="#991b1b" stroke-width="4"/>
        <line x1="0" y1="105" x2="220" y2="105" stroke="#991b1b" stroke-width="3"/>
        <rect x="5" y="5" width="100" height="95" rx="15" fill="#dbeafe"/>
        <text x="55" y="55" style="font-size:12px;font-weight:800;fill:#1d4ed8;text-anchor:middle">우심방</text>
        <rect x="5" y="110" width="100" height="115" rx="15" fill="#bfdbfe"/>
        <text x="55" y="170" style="font-size:12px;font-weight:800;fill:#1d4ed8;text-anchor:middle">우심실</text>
        <rect x="115" y="5" width="100" height="95" rx="15" fill="#fecaca"/>
        <text x="165" y="55" style="font-size:12px;font-weight:800;fill:#dc2626;text-anchor:middle">좌심방</text>
        <rect x="115" y="110" width="100" height="115" rx="15" fill="#fca5a5"/>
        <text x="165" y="170" style="font-size:12px;font-weight:800;fill:#dc2626;text-anchor:middle">좌심실</text>
      </g>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#dc2626" stroke-width="1.5"/>
      <text x="320" y="366" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">좌심실은 가장 두꺼운 근육벽으로 온몸에 강한 압력으로 피를 뿜어내며,</text>
      <text x="320" y="382" style="font-size:11px;font-weight:600;fill:#475569;text-anchor:middle">판막은 피가 거꾸로 흐르지 않고 한쪽 방향으로만 흐르도록 역류를 막아줘요</text>
      </g>`;
    }
    caption = c === 0 ? '음식은 소화 기관을 따라 이동하며 잘게 분해되고 영양소가 흡수돼요.' : c === 1 ? '공기는 호흡 기관으로 들어가 폐포에서 산소와 이산화탄소를 교환해요.' : '심장은 펌프 작용으로 혈액을 순환시켜 온몸에 산소와 영양소를 공급해요.';
  }

  else if (kind === 'classification') {
    controls = ['현미경으로 세포 관찰', '동물·식물 세포 비교', '관찰 특징으로 분류'];
    customSteps = ['분류 모형 관찰', '세포 내부 초미세 단면'];

    if (c === 0) {
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(60, 85)">
        <path d="M120 270H220M170 270V210L140 170" stroke="#334155" stroke-width="16" stroke-linecap="round"/>
        <path d="M140 170L190 80L215 95L165 185Z" fill="#64748b" stroke="#334155" stroke-width="2"/>
        <rect x="180" y="60" width="25" height="40" rx="4" fill="#0f172a"/>
        <rect x="145" y="180" width="22" height="35" rx="3" fill="#0284c7"/>
        <line x1="90" y1="210" x2="200" y2="210" stroke="#0f172a" stroke-width="6"/>
      </g>

      <g transform="translate(420, 215)">
        <circle cx="0" cy="0" r="115" fill="#0f172a"/>
        <circle cx="0" cy="0" r="105" fill="#f0fdf4" stroke="#86efac" stroke-width="2.5"/>
        ${[-60, -20, 20, 60].map(y => `<line x1="-90" y1="${y}" x2="90" y2="${y}" stroke="#15803d" stroke-width="1.8"/>`).join('')}
        ${[-60, -10, 40].map(x => `<line x1="${x}" y1="-90" x2="${x}" y2="90" stroke="#15803d" stroke-width="1.8"/>`).join('')}
        ${[[-35, -40], [15, -40], [65, -40], [-35, 0], [15, 0], [65, 0], [-35, 40], [15, 40]].map(([nx, ny]) => `<ellipse cx="${nx}" cy="${ny}" rx="6" ry="8" fill="#ca8a04" stroke="#854d0e" stroke-width="1"/>`).join('')}
        <text x="0" y="80" style="font-size:11px;font-weight:800;fill:#15803d;text-anchor:middle">400x 배율 관찰 상</text>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#0284c7"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">광학 현미경: 세포벽과 핵의 미세 구조 확인</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#15803d" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#15803d;text-anchor:middle">규칙적 세포벽 격자 배열</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">현미경으로 관찰하면 육안으로 보이지 않는 세포벽과 둥근 핵을 뚜렷이 볼 수 있어요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">현미경 관찰 시 아세트산카민 염색 메커니즘</text>
      <rect x="80" y="90" width="480" height="240" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="320" y="125" style="font-size:13px;font-weight:800;fill:#b91c1c;text-anchor:middle">붉은색 아세트산카민 용액 염색</text>
      <ellipse cx="260" cy="200" rx="85" ry="50" fill="#fef2f2" stroke="#ef4444" stroke-width="2"/>
      <circle cx="260" cy="200" r="18" fill="#b91c1c"/>
      <text x="260" y="204" style="font-size:11px;font-weight:800;fill:#ffffff;text-anchor:middle">핵 (DNA)</text>
      <text x="420" y="195" style="font-size:11px;font-weight:700;fill:#475569">염기성 염색약이</text>
      <text x="420" y="215" style="font-size:11px;font-weight:700;fill:#b91c1c">산성인 핵을 붉게 염색</text>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="373" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">무색투명한 세포 소기관을 구별하기 위해 특수 염색약을 사용하여 핵을 명확히 관찰해요</text>
      </g>`;
    } else if (c === 1) {
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(60, 85)">
        <rect x="0" y="0" width="240" height="270" rx="16" fill="#f0fdf4" stroke="#16a34a" stroke-width="4"/>
        <rect x="8" y="8" width="224" height="254" rx="10" fill="#dcfce7" stroke="#86efac" stroke-width="2"/>
        <text x="120" y="32" style="font-size:13px;font-weight:800;fill:#15803d;text-anchor:middle">식물 세포 (Plant Cell)</text>
        ${[[40, 70], [180, 70], [40, 200], [180, 200]].map(([cx, cy]) => `<ellipse cx="${cx}" cy="${cy}" rx="16" ry="10" fill="#15803d" stroke="#14532d" stroke-width="1.5"/>`).join('')}
        <ellipse cx="140" cy="140" rx="45" ry="35" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="140" y="144" style="font-size:10px;font-weight:800;fill:#0369a1;text-anchor:middle">액포</text>
        <circle cx="65" cy="135" r="18" fill="#ca8a04" stroke="#854d0e" stroke-width="1.5"/>
        <text x="65" y="139" style="font-size:10px;font-weight:800;fill:#ffffff;text-anchor:middle">핵</text>
        <text x="120" y="245" style="font-size:10.5px;font-weight:800;fill:#15803d;text-anchor:middle">세포벽 + 엽록체 + 큰 액포</text>
      </g>

      <g transform="translate(340, 85)">
        <ellipse cx="120" cy="135" rx="105" ry="115" fill="#fef2f2" stroke="#ef4444" stroke-width="3"/>
        <text x="120" y="32" style="font-size:13px;font-weight:800;fill:#b91c1c;text-anchor:middle">동물 세포 (Animal Cell)</text>
        <circle cx="120" cy="135" r="24" fill="#ca8a04" stroke="#854d0e" stroke-width="2"/>
        <text x="120" y="139" style="font-size:11px;font-weight:800;fill:#ffffff;text-anchor:middle">핵</text>
        ${[[60, 80], [175, 85], [70, 195], [170, 190]].map(([mx, my]) => `<ellipse cx="${mx}" cy="${my}" rx="12" ry="7" fill="#fb923c" stroke="#c2410c" stroke-width="1"/>`).join('')}
        <text x="120" y="245" style="font-size:10.5px;font-weight:800;fill:#b91c1c;text-anchor:middle">세포벽 없음 (유연한 세포막)</text>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">식물·동물 세포 비교: 세포벽 및 엽록체 유무</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">광합성 및 지지 구조 차이</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">식물 세포는 단단한 세포벽과 엽록체를 갖지만, 동물 세포는 세포벽 없이 형태가 유연해요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">세포벽(Cell Wall)과 세포막(Cell Membrane) 미세 초박 단면</text>
      <g transform="translate(60, 90)">
        <rect x="0" y="0" width="220" height="230" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
        <text x="110" y="28" style="font-size:12px;font-weight:800;fill:#15803d;text-anchor:middle">식물: 3중 세포벽 구조</text>
        <line x1="30" y1="80" x2="190" y2="80" stroke="#166534" stroke-width="10"/>
        <line x1="30" y1="100" x2="190" y2="100" stroke="#22c55e" stroke-width="8"/>
        <line x1="30" y1="120" x2="190" y2="120" stroke="#86efac" stroke-width="6"/>
        <text x="110" y="165" style="font-size:11px;font-weight:800;fill:#15803d;text-anchor:middle">셀룰로스 섬유 격자망</text>
        <text x="110" y="185" style="font-size:10px;fill:#334155;text-anchor:middle">높은 팽압(삼투압) 견딤</text>
      </g>
      <g transform="translate(360, 90)">
        <rect x="0" y="0" width="220" height="230" rx="10" fill="#fef2f2" stroke="#ef4444" stroke-width="2"/>
        <text x="110" y="28" style="font-size:12px;font-weight:800;fill:#b91c1c;text-anchor:middle">동물: 유동 모자이크 인지질 2중층</text>
        <line x1="30" y1="100" x2="190" y2="100" stroke="#ef4444" stroke-width="6" stroke-dasharray="4 2"/>
        <text x="110" y="165" style="font-size:11px;font-weight:800;fill:#b91c1c;text-anchor:middle">세포벽 없음 (단단함 없음)</text>
        <text x="110" y="185" style="font-size:10px;fill:#334155;text-anchor:middle">자유로운 형태 변형 및 아메바 운동</text>
      </g>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="373" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">식물은 뼈가 없는 대신 세포벽이 단단히 지탱하고, 동물은 세포벽이 없어 움직임이 자유로워요</text>
      </g>`;
    } else {
      body = `<g filter="url(#ex-shadow)">
      <rect x="40" y="80" width="560" height="280" rx="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <rect x="40" y="80" width="560" height="42" rx="14" fill="#0f172a"/>
      <text x="120" y="106" style="font-size:12px;font-weight:800;fill="#ffffff;text-anchor:middle">분류 기준</text>
      <text x="300" y="106" style="font-size:12px;font-weight:800;fill="#86efac;text-anchor:middle">표본 A (식물계)</text>
      <text x="470" y="106" style="font-size:12px;font-weight:800;fill="#fca5a5;text-anchor:middle">표본 B (동물계)</text>
      
      <line x1="40" y1="160" x2="600" y2="160" stroke="#f1f5f9" stroke-width="2"/>
      <text x="120" y="145" style="font-size:11.5px;font-weight:700;fill="#334155;text-anchor:middle">1. 세포벽</text>
      <text x="300" y="145" style="font-size:11.5px;font-weight:800;fill:#15803d;text-anchor:middle">있음 (셀룰로스)</text>
      <text x="470" y="145" style="font-size:11.5px;font-weight:800;fill:#dc2626;text-anchor:middle">없음</text>

      <line x1="40" y1="210" x2="600" y2="210" stroke="#f1f5f9" stroke-width="2"/>
      <text x="120" y="195" style="font-size:11.5px;font-weight:700;fill="#334155;text-anchor:middle">2. 엽록체 (광합성)</text>
      <text x="300" y="195" style="font-size:11.5px;font-weight:800;fill:#15803d;text-anchor:middle">관찰됨 (독립영양)</text>
      <text x="470" y="195" style="font-size:11.5px;font-weight:800;fill:#dc2626;text-anchor:middle">미관찰 (종속영양)</text>

      <line x1="40" y1="260" x2="600" y2="260" stroke="#f1f5f9" stroke-width="2"/>
      <text x="120" y="245" style="font-size:11.5px;font-weight:700;fill="#334155;text-anchor:middle">3. 운동성</text>
      <text x="300" y="245" style="font-size:11.5px;font-weight:700;fill:#475569;text-anchor:middle">고정 생활</text>
      <text x="470" y="245" style="font-size:11.5px;font-weight:700;fill:#475569;text-anchor:middle">자유 이동 가능</text>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#0284c7"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">과학적 분류: 명확한 기준에 따른 2분법 분류</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#15803d" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#15803d;text-anchor:middle">외형보다 구조적 기준 우선</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">생물을 분류할 때는 단순한 겉모습 대신 세포 구조와 영양 섭취 방식 등 객관적 기준을 세워요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">계통수(Phylogenetic Tree) 기반 생물 분류 체계</text>
      <g transform="translate(80, 85)">
        <rect x="0" y="0" width="440" height="240" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="220" y="35" style="font-size:13px;font-weight:800;fill:#0f172a;text-anchor:middle">공통 조상 (Common Ancestor)</text>
        <path d="M220 50V100M220 100L120 160M220 100L320 160" stroke="#334155" stroke-width="3"/>
        <rect x="60" y="160" width="120" height="40" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
        <text x="120" y="185" style="font-size:12px;font-weight:800;fill:#15803d;text-anchor:middle">식물계 (광합성)</text>
        <rect x="260" y="160" width="120" height="40" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="2"/>
        <text x="320" y="185" style="font-size:12px;font-weight:800;fill:#dc2626;text-anchor:middle">동물계 (포식·운동)</text>
      </g>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="373" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">진화 과정에서 갈라져 나온 유전적·세포적 공통 조상을 바탕으로 과학적 계통을 세워요</text>
      </g>`;
    }
    caption = c === 0 ? '작은 생물의 구조를 확대해 살펴봐요. 현미경 모형은 확대의 관계를 보여 주며 실제 사진은 아니에요.' : c === 1 ? '대표적인 동물·식물 세포의 공통점과 차이를 비교해요. 식물 세포는 세포벽과 엽록체를 지녀요.' : '분류 기준을 먼저 정하고 같은 기준으로 표본을 비교해요. 겉모습 하나로 확정하지 않아요.';

}else if (kind === 'magnets') {
    controls = ['다른 극을 마주 보기', '같은 극을 마주 보기', '자석 사이를 멀리', '나침반과 가까운 자석'];
    customSteps = ['자석과 자기력선', '자구(자석 미세 구조)'];

    if (c === 0) {
      // 다른 극을 마주 보기 (N-S 인력)
      body = `<g filter="url(#ex-shadow)">
      <!-- Left Bar Magnet (S-N) -->
      <g transform="translate(100, 180)">
        <rect x="0" y="0" width="70" height="60" rx="4" fill="url(#ex-mag-s)" stroke="#1e3a8a" stroke-width="1.5"/>
        <text x="35" y="38" style="font-size:22px;font-weight:900;fill:#ffffff;text-anchor:middle">S</text>
        <rect x="70" y="0" width="70" height="60" rx="4" fill="url(#ex-mag-n)" stroke="#991b1b" stroke-width="1.5"/>
        <text x="105" y="38" style="font-size:22px;font-weight:900;fill:#ffffff;text-anchor:middle">N</text>
      </g>
      <!-- Right Bar Magnet (S-N) -->
      <g transform="translate(400, 180)">
        <rect x="0" y="0" width="70" height="60" rx="4" fill="url(#ex-mag-s)" stroke="#1e3a8a" stroke-width="1.5"/>
        <text x="35" y="38" style="font-size:22px;font-weight:900;fill:#ffffff;text-anchor:middle">S</text>
        <rect x="70" y="0" width="70" height="60" rx="4" fill="url(#ex-mag-n)" stroke="#991b1b" stroke-width="1.5"/>
        <text x="105" y="38" style="font-size:22px;font-weight:900;fill:#ffffff;text-anchor:middle">N</text>
      </g>
      <!-- Magnetic Field Lines (Attraction looping between N and S) -->
      <g fill="none" stroke="#dc2626" stroke-width="2.5" marker-end="url(#ex-arrow-coral)">
        <path d="M240 210 Q320 210 395 210"/>
        <path d="M240 190 Q320 140 395 190"/>
        <path d="M240 230 Q320 280 395 230"/>
        <path d="M240 175 Q320 90 395 175"/>
        <path d="M240 245 Q320 330 395 245"/>
      </g>
      <!-- Attraction Force Vectors -->
      <g stroke="#0284c7" stroke-width="4" marker-end="url(#ex-arrow-cobalt)">
        <line x1="240" y1="280" x2="290" y2="280"/>
        <line x1="400" y1="280" x2="350" y2="280"/>
      </g>
      <text x="320" y="300" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">끌어당기는 힘 (인력)</text>

      <!-- Top Principle Badge -->
      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">다른 극 사이(N-S): 서로 끌어당기는 인력(Attraction) 작용</text>

      <!-- Top Telemetry Badge -->
      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">자기력: 인력 (+18.2 N)</text>

      <!-- Bottom Principle Ribbon -->
      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">자석의 다른 극(N극과 S극)을 마주 보게 놓으면 자기력선이 이어지며 서로 끌어당겨요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">자석 내부 자구(Magnetic Domain) 정렬 모형</text>
      <!-- Unmagnetized iron -->
      <g transform="translate(50, 90)">
        <rect x="0" y="0" width="230" height="230" rx="8" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>
        <text x="115" y="30" style="font-size:13px;font-weight:800;fill:#334155;text-anchor:middle">자화 전 (보통 철못)</text>
        <g stroke="#64748b" stroke-width="2" marker-end="url(#ex-arrow)">
          <line x1="40" y1="70" x2="80" y2="90"/>
          <line x1="120" y1="80" x2="160" y2="60"/>
          <line x1="180" y1="120" x2="150" y2="160"/>
          <line x1="70" y1="140" x2="40" y2="170"/>
          <line x1="100" y1="180" x2="140" y2="200"/>
        </g>
        <text x="115" y="215" style="font-size:11px;font-weight:700;fill:#64748b;text-anchor:middle">자구 방향 불규칙 (자력 상쇄)</text>
      </g>
      <!-- Magnetized bar -->
      <g transform="translate(360, 90)">
        <rect x="0" y="0" width="230" height="230" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="2"/>
        <text x="115" y="30" style="font-size:13px;font-weight:800;fill:#dc2626;text-anchor:middle">자화 후 (영구 자석)</text>
        <g stroke="#dc2626" stroke-width="2.5" marker-end="url(#ex-arrow-coral)">
          <line x1="40" y1="80" x2="190" y2="80"/>
          <line x1="40" y1="120" x2="190" y2="120"/>
          <line x1="40" y1="160" x2="190" y2="160"/>
        </g>
        <text x="115" y="215" style="font-size:11px;font-weight:700;fill:#dc2626;text-anchor:middle">자구 방향 일치 (강한 자력 합성)</text>
      </g>
      <rect x="40" y="350" width="560" height="45" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="377" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">철 내부 미세 자구들이 외부 자기장에 의해 한 방향으로 정렬되면 강한 자석의 성질을 띠게 돼요</text>
      </g>`;
    } else if (c === 1) {
      // 같은 극을 마주 보기 (N-N 척력)
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(100, 180)">
        <rect x="0" y="0" width="70" height="60" rx="4" fill="url(#ex-mag-s)" stroke="#1e3a8a" stroke-width="1.5"/>
        <text x="35" y="38" style="font-size:22px;font-weight:900;fill:#ffffff;text-anchor:middle">S</text>
        <rect x="70" y="0" width="70" height="60" rx="4" fill="url(#ex-mag-n)" stroke="#991b1b" stroke-width="1.5"/>
        <text x="105" y="38" style="font-size:22px;font-weight:900;fill:#ffffff;text-anchor:middle">N</text>
      </g>
      <g transform="translate(400, 180)">
        <rect x="0" y="0" width="70" height="60" rx="4" fill="url(#ex-mag-n)" stroke="#991b1b" stroke-width="1.5"/>
        <text x="35" y="38" style="font-size:22px;font-weight:900;fill:#ffffff;text-anchor:middle">N</text>
        <rect x="70" y="0" width="70" height="60" rx="4" fill="url(#ex-mag-s)" stroke="#1e3a8a" stroke-width="1.5"/>
        <text x="105" y="38" style="font-size:22px;font-weight:900;fill:#ffffff;text-anchor:middle">S</text>
      </g>
      <g fill="none" stroke="#dc2626" stroke-width="2.5" marker-end="url(#ex-arrow-coral)">
        <path d="M240 195 Q300 195 310 110"/>
        <path d="M400 195 Q340 195 330 110"/>
        <path d="M240 225 Q300 225 310 310"/>
        <path d="M400 225 Q340 225 330 310"/>
      </g>
      <circle cx="320" cy="210" r="12" fill="#f1f5f9" stroke="#94a3b8" stroke-dasharray="3,3"/>
      <text x="320" y="214" style="font-size:10px;font-weight:800;fill:#64748b;text-anchor:middle">B=0</text>
      <g stroke="#dc2626" stroke-width="4" marker-end="url(#ex-arrow-coral)">
        <line x1="240" y1="280" x2="180" y2="280"/>
        <line x1="400" y1="280" x2="460" y2="280"/>
      </g>
      <text x="320" y="300" style="font-size:12px;font-weight:800;fill:#dc2626;text-anchor:middle">밀어내는 힘 (척력)</text>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">같은 극 사이(N-N): 서로 밀어내는 척력(Repulsion) 작용</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#dc2626" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#dc2626;text-anchor:middle">자기력: 척력 (-24.5 N)</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">자석의 같은 극(N극과 N극, S극과 S극)끼리는 서로 강하게 밀어내어 가운데에 자기력이 0인 지점이 생겨요</text>
      </g>`;
      detail = body;
    } else if (c === 2) {
      // 자석 사이를 멀리
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(60, 180)">
        <rect x="0" y="0" width="60" height="60" rx="4" fill="url(#ex-mag-s)" stroke="#1e3a8a" stroke-width="1.5"/>
        <text x="30" y="38" style="font-size:20px;font-weight:900;fill:#ffffff;text-anchor:middle">S</text>
        <rect x="60" y="0" width="60" height="60" rx="4" fill="url(#ex-mag-n)" stroke="#991b1b" stroke-width="1.5"/>
        <text x="90" y="38" style="font-size:20px;font-weight:900;fill:#ffffff;text-anchor:middle">N</text>
      </g>
      <g transform="translate(460, 180)">
        <rect x="0" y="0" width="60" height="60" rx="4" fill="url(#ex-mag-s)" stroke="#1e3a8a" stroke-width="1.5"/>
        <text x="30" y="38" style="font-size:20px;font-weight:900;fill:#ffffff;text-anchor:middle">S</text>
        <rect x="60" y="0" width="60" height="60" rx="4" fill="url(#ex-mag-n)" stroke="#991b1b" stroke-width="1.5"/>
        <text x="90" y="38" style="font-size:20px;font-weight:900;fill:#ffffff;text-anchor:middle">N</text>
      </g>
      <line x1="180" y1="210" x2="460" y2="210" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4"/>
      <rect x="270" y="196" width="100" height="28" rx="6" fill="#ffffff" stroke="#64748b" stroke-width="1"/>
      <text x="320" y="215" style="font-size:12px;font-weight:800;fill:#1e293b;text-anchor:middle">거리 d = 25 cm</text>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">거리와 자기력: 거리가 멀어질수록 자력이 급격히 감소</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">자기력: 약화 (1.8 N)</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">자석 사이 거리가 멀어지면 서로 끌어당기거나 밀어내는 자기력의 세기가 빠르게 약해져요</text>
      </g>`;
      detail = body;
    } else if (c === 3) {
      // 나침반과 가까운 자석
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(250, 185)">
        <rect x="0" y="0" width="70" height="50" rx="4" fill="url(#ex-mag-s)" stroke="#1e3a8a" stroke-width="1.5"/>
        <text x="35" y="32" style="font-size:20px;font-weight:900;fill:#ffffff;text-anchor:middle">S</text>
        <rect x="70" y="0" width="70" height="50" rx="4" fill="url(#ex-mag-n)" stroke="#991b1b" stroke-width="1.5"/>
        <text x="105" y="32" style="font-size:20px;font-weight:900;fill:#ffffff;text-anchor:middle">N</text>
      </g>
      <g transform="translate(130, 210)">
        <circle cx="0" cy="0" r="30" fill="#ffffff" stroke="#334155" stroke-width="2"/>
        <polygon points="0,-22 8,0 0,0 -8,0" fill="#dc2626"/>
        <polygon points="0,22 8,0 0,0 -8,0" fill="#1d4ed8"/>
        <circle cx="0" cy="0" r="4" fill="#0f172a"/>
      </g>
      <g transform="translate(510, 210)">
        <circle cx="0" cy="0" r="30" fill="#ffffff" stroke="#334155" stroke-width="2"/>
        <polygon points="0,22 8,0 0,0 -8,0" fill="#dc2626"/>
        <polygon points="0,-22 8,0 0,0 -8,0" fill="#1d4ed8"/>
        <circle cx="0" cy="0" r="4" fill="#0f172a"/>
      </g>
      <g transform="translate(320, 95)">
        <circle cx="0" cy="0" r="30" fill="#ffffff" stroke="#334155" stroke-width="2"/>
        <polygon points="-22,0 0,-8 0,0 0,8" fill="#dc2626"/>
        <polygon points="22,0 0,-8 0,0 0,8" fill="#1d4ed8"/>
        <circle cx="0" cy="0" r="4" fill="#0f172a"/>
      </g>
      <g transform="translate(320, 325)">
        <circle cx="0" cy="0" r="30" fill="#ffffff" stroke="#334155" stroke-width="2"/>
        <polygon points="-22,0 0,-8 0,0 0,8" fill="#dc2626"/>
        <polygon points="22,0 0,-8 0,0 0,8" fill="#1d4ed8"/>
        <circle cx="0" cy="0" r="4" fill="#0f172a"/>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">나침반 바늘의 정렬: 자석 주위 자기력선의 방향을 가리킴</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">나침반 N극 → 자석 S극</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">자석 주위에 나침반을 놓으면 나침반 바늘의 N극은 자석의 S극을, S극은 자석의 N극을 가리켜요</text>
      </g>`;
      detail = body;
    }
    caption = c === 0 ? '자석의 다른 극(N-S)은 서로 끌어당겨요. 자기력선이 마주 보며 연결되어 인력이 작용해요.' : c === 1 ? '자석의 같은 극(N-N)은 서로 밀어내요. 자기력선이 서로 부딪혀 바깥으로 휘어지며 척력이 발생해요.' : c === 2 ? '자석 사이 거리가 멀어질수록 자력이 급격하게 감소해요.' : '나침반 바늘은 자석 주위의 자기력선 접선 방향을 따라 정렬돼요.';
  } else if (kind === 'sound') {
    controls = ['작은 진폭 · 같은 빠르기', '큰 진폭 · 같은 빠르기', '같은 진폭 · 더 빠른 진동'];
    customSteps = ['음파와 공기 밀소파', '오실로스코프 파형 분석'];

    const amp = c === 1 ? 14 : 6;
    const freq = c === 2 ? 2.5 : 1.2;
    const vibOffset = Math.sin(phase * Math.PI * 4 * freq) * amp;

    body = `<g filter="url(#ex-shadow)">
      <!-- Acoustic Resonance Box & Tuning Fork -->
      <g transform="translate(80, 140)">
        <!-- Wooden Box -->
        <rect x="0" y="140" width="100" height="65" rx="6" fill="#b45309" stroke="#78350f" stroke-width="2"/>
        <ellipse cx="50" cy="172" rx="18" ry="14" fill="#451a03"/>
        <!-- Steel Stem -->
        <rect x="44" y="90" width="12" height="50" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
        <!-- U-prong base -->
        <path d="M30 90 Q50 95 70 90 V20 Q70 12 50 12 Q30 12 30 20 Z" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
        <!-- Vibrating Left Prong -->
        <rect x="${30 - vibOffset}" y="15" width="10" height="75" rx="3" fill="#94a3b8" stroke="#334155" stroke-width="1.5"/>
        <!-- Vibrating Right Prong -->
        <rect x="${60 + vibOffset}" y="15" width="10" height="75" rx="3" fill="#94a3b8" stroke="#334155" stroke-width="1.5"/>
      </g>

      <!-- Longitudinal Sound Wavefronts (Air Molecules Compression & Rarefaction) -->
      <g transform="translate(200, 160)">
        ${Array.from({ length: 8 }, (_, i) => {
          const x = 30 + i * (c === 2 ? 28 : 48);
          const isDense = i % 2 === 0;
          return `<g transform="translate(${x}, 0)">
            <line x1="0" y1="20" x2="0" y2="120" stroke="${isDense ? (c === 1 ? '#0284c7' : '#38bdf8') : '#94a3b8'}" stroke-width="${isDense ? (c === 1 ? 7 : 4) : 1.5}" stroke-linecap="round" stroke-dasharray="${isDense ? 'none' : '4,4'}"/>
            <text x="0" y="140" style="font-size:10px;font-weight:700;fill:${isDense ? '#0284c7' : '#94a3b8'};text-anchor:middle">${isDense ? '밀(밀집)' : '소(희박)'}</text>
          </g>`;
        }).join('')}
      </g>

      <!-- Wave Direction Arrow -->
      <g transform="translate(210, 130)" stroke="#16a34a" stroke-width="3" marker-end="url(#ex-arrow)">
        <line x1="0" y1="0" x2="380" y2="0"/>
      </g>
      <text x="400" y="125" style="font-size:11px;font-weight:800;fill:#16a34a;text-anchor:middle">음파 진행 방향 (종파)</text>

      <!-- Top Principle Badge -->
      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">${c === 0 ? '진폭이 작음: 음차가 살짝 진동하여 작은 소리 발생' : c === 1 ? '진폭이 큼: 음차가 크게 진동하여 큰 소리(에너지 큼) 발생' : '진동수가 큼: 1초에 더 빠르게 진동하여 높은 음 발생'}</text>

      <!-- Top Telemetry Badge -->
      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">${c === 0 ? '진폭: 1.2 mm · 42 dB (작은 소리)' : c === 1 ? '진폭: 4.8 mm · 78 dB (큰 소리)' : '진동수: 512 Hz · 높은 소리(고음)'}</text>

      <!-- Bottom Principle Ribbon -->
      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">${c === 0 ? '소리의 세기는 진폭에 비례해요. 진폭이 작으면 전달되는 공기 압력 변화가 작아 조용한 소리가 나요.' : c === 1 ? '진폭이 크면 공기를 강하게 밀어내어 밀도 차이가 커지고 큰 소리로 멀리까지 전달돼요.' : '진동수가 많아지면 파장이 짧아지고 1초당 고막을 두드리는 횟수가 늘어나 높은 소리로 인지돼요.'}</text>
    </g>`;

    detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#0f172a" stroke="#334155" stroke-width="2"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#38bdf8;text-anchor:middle">디지털 오실로스코프(Oscilloscope) 음파 파형 정밀 분석</text>
      <!-- Grid Lines -->
      <g stroke="#1e293b" stroke-width="1">
        ${Array.from({ length: 9 }, (_, i) => `<line x1="50" y1="${80 + i * 35}" x2="590" y2="${80 + i * 35}"/>`).join('')}
        ${Array.from({ length: 15 }, (_, i) => `<line x1="${60 + i * 36}" y1="80" x2="${60 + i * 36}" y2="360"/>`).join('')}
      </g>
      <!-- Center Zero Line -->
      <line x1="50" y1="220" x2="590" y2="220" stroke="#475569" stroke-width="1.5"/>
      <!-- Sine Wave Form (Green Phosphor) -->
      <path d="M60 220 Q96 120 132 220 Q168 320 204 220 Q240 120 276 220 Q312 320 348 220 Q384 120 420 220 Q456 320 492 220 Q528 120 564 220" fill="none" stroke="#22c55e" stroke-width="3.5" filter="url(#ex-glow-cyan)"/>
      <!-- Dimension Markers -->
      <!-- Amplitude A -->
      <line x1="276" y1="220" x2="276" y2="120" stroke="#facc15" stroke-width="2.5" marker-end="url(#ex-arrow-amber)"/>
      <text x="290" y="170" style="font-size:12px;font-weight:800;fill:#facc15">진폭 (소리 크기 A)</text>
      <!-- Wavelength Lambda -->
      <line x1="132" y1="220" x2="276" y2="220" stroke="#38bdf8" stroke-width="3" marker-end="url(#ex-arrow-cyan)"/>
      <text x="204" y="240" style="font-size:12px;font-weight:800;fill:#38bdf8;text-anchor:middle">1주기 (진동수 f = 1/T)</text>
      <rect x="40" y="370" width="560" height="34" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="320" y="392" style="font-size:12px;font-weight:700;fill:#f8fafc;text-anchor:middle">파형의 높낮이(진폭)는 소리의 세기를 결정하고, 마루와 마루 사이 간격(진동수)은 음의 높낮이를 결정해요</text>
    </g>`;

    caption = c === 0 ? '진폭이 작으면 조용한 소리가 나요. 공기 입자의 압축 폭이 좁아요.' : c === 1 ? '진폭이 크면 큰 소리가 나요. 진동 에너지가 커져 공기 밀도 차이가 극대화돼요.' : '진동수가 크면 높은 소리가 나요. 1초 동안 진동하는 횟수가 많아 파장이 촘촘해져요.';
  } else if (kind === 'optics') {
    controls = ['빛과 그림자', '거울에서 빛의 반사', '볼록렌즈에서 빛의 굴절'];
    customSteps = ['광선 추적 실험', '렌즈 상의 굴절 메커니즘'];

    if (c === 0) {
      // 빛과 그림자
      body = `<g filter="url(#ex-shadow)">
      <!-- Light Source Flashlight -->
      <g transform="translate(60, 190)">
        <polygon points="0,0 45,0 75,-25 75,45 45,20 0,20" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
        <ellipse cx="75" cy="10" rx="6" ry="35" fill="#fef08a"/>
      </g>
      <!-- Collimated Light Rays -->
      <polygon points="140,165 310,140 310,280 140,255" fill="#fef08a" opacity="0.35"/>
      <polygon points="310,140 540,90 540,330 310,280" fill="#fef08a" opacity="0.25"/>
      <!-- Opaque Obstacle Cylinder -->
      <g transform="translate(310, 160)">
        <rect x="0" y="0" width="30" height="100" rx="6" fill="#334155" stroke="#0f172a" stroke-width="2"/>
        <text x="15" y="55" style="font-size:11px;font-weight:800;fill:#ffffff;text-anchor:middle">불투명체</text>
      </g>
      <!-- Screen with Umbra -->
      <g transform="translate(540, 80)">
        <rect x="0" y="0" width="16" height="260" rx="4" fill="#cbd5e1" stroke="#64748b" stroke-width="2"/>
        <rect x="0" y="55" width="16" height="150" fill="#0f172a"/>
        <text x="-10" y="135" style="font-size:11px;font-weight:800;fill:#dc2626;text-anchor:end">진한 그림자</text>
      </g>
      <!-- Ray Lines -->
      <line x1="140" y1="165" x2="540" y2="135" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,4"/>
      <line x1="140" y1="255" x2="540" y2="285" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,4"/>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">빛의 직진: 빛은 곧게 나아가며 장애물 뒤에 그림자를 형성</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">광선 경로: 완전 직진</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">빛은 균일한 매질에서 곧게 나아가므로, 불투명한 물체를 만나면 통과하지 못해 뒤편에 그림자가 생겨요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">광원의 크기와 본그림자(Umbra)·반그림자(Penumbra) 구조</text>
      <circle cx="90" cy="210" r="45" fill="#fef08a" stroke="#f59e0b" stroke-width="2"/>
      <text x="90" y="215" style="font-size:12px;font-weight:800;fill:#78350f;text-anchor:middle">확장 광원</text>
      <!-- Obstacle -->
      <circle cx="280" cy="210" r="30" fill="#334155" stroke="#0f172a" stroke-width="2"/>
      <text x="280" y="215" style="font-size:11px;font-weight:800;fill:#ffffff;text-anchor:middle">물체</text>
      <!-- Screen with Penumbra & Umbra -->
      <g transform="translate(520, 80)">
        <rect x="0" y="0" width="18" height="260" rx="4" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
        <rect x="0" y="60" width="18" height="140" fill="#475569"/>
        <rect x="0" y="90" width="18" height="80" fill="#0f172a"/>
        <text x="-12" y="135" style="font-size:11px;font-weight:800;fill:#0f172a;text-anchor:end">본그림자</text>
        <text x="-12" y="80" style="font-size:11px;font-weight:700;fill:#475569;text-anchor:end">반그림자</text>
      </g>
      <line x1="90" y1="165" x2="520" y2="170" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,3"/>
      <line x1="90" y1="255" x2="520" y2="250" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,3"/>
      <line x1="90" y1="165" x2="520" y2="60" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,3"/>
      <line x1="90" y1="255" x2="520" y2="340" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,3"/>
      <rect x="40" y="360" width="560" height="38" rx="6" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="384" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">광원이 점이 아니라 면적을 가질 때는 빛이 완전히 차단된 본그림자와 일부만 닿는 반그림자가 생겨요</text>
      </g>`;
    } else if (c === 1) {
      // 거울에서 빛의 반사
      body = `<g filter="url(#ex-shadow)">
      <!-- Plane Mirror -->
      <g transform="translate(140, 310)">
        <rect x="0" y="0" width="360" height="16" rx="3" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
        <line x1="0" y1="16" x2="360" y2="16" stroke="#0284c7" stroke-width="3"/>
      </g>
      <!-- Normal Line (법선) -->
      <line x1="320" y1="100" x2="320" y2="310" stroke="#64748b" stroke-width="2" stroke-dasharray="6,6"/>
      <text x="330" y="125" style="font-size:12px;font-weight:800;fill:#64748b">법선 (수직선)</text>
      <!-- Incident Ray -->
      <g stroke="#dc2626" stroke-width="3.5" marker-end="url(#ex-arrow-coral)">
        <line x1="140" y1="150" x2="320" y2="310"/>
      </g>
      <text x="210" y="205" style="font-size:12px;font-weight:800;fill:#dc2626">입사 광선 (40°)</text>
      <!-- Reflected Ray -->
      <g stroke="#0284c7" stroke-width="3.5" marker-end="url(#ex-arrow-cobalt)">
        <line x1="320" y1="310" x2="500" y2="150"/>
      </g>
      <text x="430" y="205" style="font-size:12px;font-weight:800;fill:#0284c7">반사 광선 (40°)</text>
      <!-- Angle Arcs -->
      <path d="M290 280 Q305 270 320 270" fill="none" stroke="#dc2626" stroke-width="2"/>
      <text x="285" y="260" style="font-size:11px;font-weight:800;fill:#dc2626">입사각</text>
      <path d="M320 270 Q335 270 350 280" fill="none" stroke="#0284c7" stroke-width="2"/>
      <text x="355" y="260" style="font-size:11px;font-weight:800;fill:#0284c7">반사각</text>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">반사의 법칙: 입사각(Angle of Incidence) = 반사각</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">입사각 40° = 반사각 40°</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">거울 표면에 부딪힌 빛은 법선을 기준으로 입사각과 반사각이 항상 같은 각도로 튕겨 나가요</text>
      </g>`;
      detail = body;
    } else if (c === 2) {
      // 볼록렌즈에서 빛의 굴절
      body = `<g filter="url(#ex-shadow)">
      <!-- Optical Axis -->
      <line x1="50" y1="210" x2="590" y2="210" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5,5"/>
      <text x="580" y="200" style="font-size:10px;font-weight:700;fill:#94a3b8">광축</text>
      <!-- Convex Lens -->
      <g transform="translate(300, 90)">
        <path d="M20 0 Q45 120 20 240 Q-5 120 20 0 Z" fill="url(#ex-glass)" stroke="#0284c7" stroke-width="2"/>
        <line x1="20" y1="0" x2="20" y2="240" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2,2"/>
      </g>
      <!-- Real Focal Point F -->
      <circle cx="480" cy="210" r="5" fill="#dc2626"/>
      <text x="480" y="235" style="font-size:12px;font-weight:800;fill:#dc2626;text-anchor:middle">초점 F</text>
      <!-- Parallel Incoming Rays and Converging Refracted Rays -->
      <g stroke="#f59e0b" stroke-width="2.5" marker-end="url(#ex-arrow-amber)">
        <!-- Top ray -->
        <line x1="70" y1="140" x2="320" y2="140"/>
        <line x1="320" y1="140" x2="540" y2="235"/>
        <!-- Center ray -->
        <line x1="70" y1="210" x2="320" y2="210"/>
        <line x1="320" y1="210" x2="540" y2="210"/>
        <!-- Bottom ray -->
        <line x1="70" y1="280" x2="320" y2="280"/>
        <line x1="320" y1="280" x2="540" y2="185"/>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">볼록렌즈의 굴절: 평행하게 들어온 빛을 한 초점으로 모음</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">초점 거리 f = 16 cm (빛 모음)</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">가운데가 두꺼운 볼록렌즈는 통과하는 빛을 두 번 굴절시켜 반대편의 초점(F)으로 모아줘요</text>
      </g>`;
      detail = body;
    }
    caption = c === 0 ? '빛이 곧게 나아가다 불투명한 물체를 만나면 뒤편에 선명한 그림자가 생겨요.' : c === 1 ? '매끄러운 거울 면에 빛이 닿으면 입사각과 반사각이 서로 같게 반사돼요.' : '볼록렌즈는 가장자리보다 가운데가 두꺼워 나란한 빛을 한 점(초점)에 모아 줘요.';
  } else if (kind === 'electricity') {
    controls = ['닫힌 회로 · 전구 켜짐', '열린 회로 · 전구 꺼짐', '전자석 · 전류 있음', '전자석 · 전류 없음'];
    customSteps = ['전기 회로 구성', '필라멘트 줄열/자기장'];

    if (c === 0) {
      // 닫힌 회로 · 전구 켜짐
      body = `<g filter="url(#ex-shadow)">
      <!-- Battery (AA 1.5V) -->
      <g transform="translate(100, 180)">
        <rect x="0" y="0" width="70" height="80" rx="6" fill="#334155" stroke="#0f172a" stroke-width="2"/>
        <rect x="25" y="-12" width="20" height="12" rx="2" fill="#eab308" stroke="#ca8a04" stroke-width="1.5"/>
        <text x="35" y="35" style="font-size:16px;font-weight:900;fill:#ef4444;text-anchor:middle">+</text>
        <text x="35" y="65" style="font-size:20px;font-weight:900;fill:#38bdf8;text-anchor:middle">−</text>
      </g>
      <!-- Circuit Wires -->
      <path d="M135 168 V100 H480 V180" fill="none" stroke="#dc2626" stroke-width="4.5"/>
      <path d="M135 260 V330 H480 V260" fill="none" stroke="#1d4ed8" stroke-width="4.5"/>
      <!-- Closed Switch -->
      <g transform="translate(260, 100)">
        <circle cx="0" cy="0" r="6" fill="#334155"/>
        <circle cx="60" cy="0" r="6" fill="#334155"/>
        <line x1="0" y1="0" x2="60" y2="0" stroke="#16a34a" stroke-width="4"/>
      </g>
      <!-- Glowing Incandescent Bulb -->
      <g transform="translate(480, 220)">
        <!-- Yellow Radiating Glow -->
        <circle cx="0" cy="0" r="45" fill="#fef08a" opacity="0.55" filter="url(#ex-glow-amber)"/>
        <!-- Glass Bulb -->
        <circle cx="0" cy="0" r="28" fill="#fef9c3" stroke="#eab308" stroke-width="2"/>
        <!-- Filament -->
        <path d="M-10 10 L-6 -8 L0 6 L6 -8 L10 10" fill="none" stroke="#ea580c" stroke-width="2.5"/>
        <!-- Base socket -->
        <rect x="-14" y="24" width="28" height="18" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
      </g>
      <!-- Moving Electron dots -->
      ${Array.from({ length: 6 }, (_, i) => `<circle cx="${180 + ((phase + i * 0.16) % 1) * 260}" cy="100" r="4.5" fill="#facc15"/>`).join('')}

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">폐회로(Closed Circuit): 전하가 끊김 없이 연속해서 흐름</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">전류 0.35 A · 전구 점등</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">전지와 전구, 스위치가 도선으로 완전히 연결된 닫힌 회로에서만 전류가 흘러 불이 켜져요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">백열전구 필라멘트(텅스텐 이중 코일) 줄열(Joule Heat) 방출 원리</text>
      <!-- Enlarged Bulb Chamber -->
      <g transform="translate(140, 90)">
        <ellipse cx="80" cy="110" rx="90" ry="110" fill="#fef9c3" stroke="#ca8a04" stroke-width="2.5" opacity="0.6"/>
        <!-- Coiled Filament -->
        <path d="M30 140 Q40 60 80 50 Q120 60 130 140" fill="none" stroke="#ea580c" stroke-width="4.5"/>
        <text x="80" y="40" style="font-size:12px;font-weight:800;fill:#b45309;text-anchor:middle">텅스텐 고저항 발열부</text>
      </g>
      <g transform="translate(360, 110)">
        <rect x="0" y="0" width="220" height="190" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="110" y="30" style="font-size:13px;font-weight:800;fill:#0f172a;text-anchor:middle">미세 전자 충돌</text>
        <text x="20" y="65" style="font-size:11px;font-weight:700;fill:#334155">• 전자 흐름 저항 충돌</text>
        <text x="20" y="95" style="font-size:11px;font-weight:700;fill:#334155">• 필라멘트 온도 2,500℃ 가열</text>
        <text x="20" y="125" style="font-size:11px;font-weight:700;fill:#334155">• 가시광선 빛 에너지 방출</text>
        <text x="20" y="155" style="font-size:11px;font-weight:800;fill:#dc2626">• P = I²R 발열 원리</text>
      </g>
      <rect x="40" y="355" width="560" height="40" rx="6" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="380" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">가늘고 긴 텅스텐 선에 전자가 부딪히며 높은 전기 저항으로 고온의 백열광을 방출해요</text>
      </g>`;
    } else if (c === 1) {
      // 열린 회로 · 전구 꺼짐
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(100, 180)">
        <rect x="0" y="0" width="70" height="80" rx="6" fill="#334155" stroke="#0f172a" stroke-width="2"/>
        <rect x="25" y="-12" width="20" height="12" rx="2" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
        <text x="35" y="35" style="font-size:16px;font-weight:900;fill:#94a3b8;text-anchor:middle">+</text>
        <text x="35" y="65" style="font-size:20px;font-weight:900;fill:#94a3b8;text-anchor:middle">−</text>
      </g>
      <path d="M135 168 V100 H480 V180" fill="none" stroke="#64748b" stroke-width="4.5"/>
      <path d="M135 260 V330 H480 V260" fill="none" stroke="#64748b" stroke-width="4.5"/>
      <!-- Open Switch -->
      <g transform="translate(260, 100)">
        <circle cx="0" cy="0" r="6" fill="#334155"/>
        <circle cx="60" cy="0" r="6" fill="#334155"/>
        <line x1="0" y1="0" x2="45" y2="-28" stroke="#dc2626" stroke-width="4"/>
        <text x="30" y="-35" style="font-size:11px;font-weight:800;fill:#dc2626;text-anchor:middle">스위치 열림 (단선)</text>
      </g>
      <!-- Dark Bulb -->
      <g transform="translate(480, 220)">
        <circle cx="0" cy="0" r="28" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
        <path d="M-10 10 L-6 -8 L0 6 L6 -8 L10 10" fill="none" stroke="#64748b" stroke-width="2"/>
        <rect x="-14" y="24" width="28" height="18" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">개회로(Open Circuit): 회로 중간이 끊어져 전류 차단</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#dc2626" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#dc2626;text-anchor:middle">전류 0.0 A · 전구 소등</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">스위치를 열면 회로가 끊겨 전하가 이동할 수 없으므로 전류가 흐르지 않고 전구가 꺼져요</text>
      </g>`;
      detail = body;
    } else if (c === 2) {
      // 전자석 · 전류 있음
      body = `<g filter="url(#ex-shadow)">
      <!-- Iron Core Nail with Coiled Wire -->
      <g transform="translate(180, 160)">
        <!-- Iron Nail -->
        <rect x="0" y="35" width="260" height="30" rx="4" fill="#94a3b8" stroke="#334155" stroke-width="2"/>
        <polygon points="260,30 290,50 260,70" fill="#64748b"/>
        <!-- Copper Coil Windings -->
        ${Array.from({ length: 9 }, (_, i) => `<ellipse cx="${40 + i * 22}" cy="50" rx="6" ry="24" fill="none" stroke="#ea580c" stroke-width="4.5"/>`).join('')}
      </g>
      <!-- Attracted Paperclips -->
      <g transform="translate(470, 210)" stroke="#475569" stroke-width="2.5" fill="none">
        <rect x="0" y="0" width="12" height="35" rx="6"/>
        <rect x="15" y="-10" width="12" height="35" rx="6" transform="rotate(25)"/>
        <rect x="25" y="10" width="12" height="35" rx="6" transform="rotate(-15)"/>
      </g>
      <!-- Magnetic Field Lines Loops -->
      <path d="M190 140 Q310 90 430 140" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-dasharray="4,4" marker-end="url(#ex-arrow-coral)"/>
      <path d="M190 260 Q310 310 430 260" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-dasharray="4,4" marker-end="url(#ex-arrow-coral)"/>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">전자석(Electromagnet): 코일에 전류가 흐를 때 강한 자력 발생</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">전자석 활성 (클립 흡착)</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">도선을 감은 철못에 전류를 흘려주면 영구 자석처럼 주위에 자기장을 형성하여 쇠붙이를 끌어당겨요</text>
      </g>`;
      detail = body;
    } else if (c === 3) {
      // 전자석 · 전류 없음
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(180, 160)">
        <rect x="0" y="35" width="260" height="30" rx="4" fill="#cbd5e1" stroke="#64748b" stroke-width="2"/>
        <polygon points="260,30 290,50 260,70" fill="#94a3b8"/>
        ${Array.from({ length: 9 }, (_, i) => `<ellipse cx="${40 + i * 22}" cy="50" rx="6" ry="24" fill="none" stroke="#94a3b8" stroke-width="4.5"/>`).join('')}
      </g>
      <!-- Fallen Paperclips in Dish -->
      <g transform="translate(440, 290)">
        <ellipse cx="40" cy="15" rx="55" ry="18" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
        <g stroke="#64748b" stroke-width="2.5" fill="none">
          <rect x="15" y="5" width="12" height="30" rx="6" transform="rotate(75)"/>
          <rect x="40" y="0" width="12" height="30" rx="6" transform="rotate(15)"/>
          <rect x="55" y="8" width="12" height="30" rx="6" transform="rotate(-60)"/>
        </g>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">전류 차단: 전류가 끊어지면 자석 성질이 즉시 소멸</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#64748b" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#64748b;text-anchor:middle">자력 소멸 (클립 낙하)</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">전류가 끊어지면 자기장이 사라져 자석의 성질을 잃고 붙어 있던 클립들이 아래로 떨어져요</text>
      </g>`;
      detail = body;
    }
    caption = c === 0 ? '닫힌 회로에서는 전류가 흘러 전구에 불이 켜져요.' : c === 1 ? '스위치를 열어 회로가 끊어지면 전류가 흐르지 않아 전구가 꺼져요.' : c === 2 ? '전류가 흐르는 코일은 자석의 성질을 띠어 철 클립을 끌어당겨요.' : '전류를 끊으면 자석의 성질이 사라져 붙어 있던 클립이 모두 떨어져요.';
  } else if (kind === 'energy-transfer') {
    controls = ['손 발전기 → 전구', '전지 → 모터', '태양 전지 → 모터'];
    customSteps = ['에너지 전환 과정', '생키(Sankey) 에너지 수지표'];

    if (c === 0) {
      // 손 발전기 → 전구
      body = `<g filter="url(#ex-shadow)">
      <!-- Hand Crank Generator -->
      <g transform="translate(100, 160)">
        <rect x="0" y="40" width="110" height="90" rx="8" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
        <text x="55" y="90" style="font-size:13px;font-weight:800;fill:#ffffff;text-anchor:middle">손 발전기</text>
        <!-- Crank Handle -->
        <circle cx="55" cy="40" r="14" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
        <line x1="55" y1="40" x2="85" y2="10" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
        <circle cx="85" cy="10" r="8" fill="#dc2626"/>
      </g>
      <!-- Wires -->
      <path d="M210 200 H430" fill="none" stroke="#f59e0b" stroke-width="5"/>
      <!-- Glowing Bulb -->
      <g transform="translate(430, 200)">
        <circle cx="0" cy="0" r="40" fill="#fef08a" opacity="0.6" filter="url(#ex-glow-amber)"/>
        <circle cx="0" cy="0" r="26" fill="#fef9c3" stroke="#eab308" stroke-width="2"/>
        <path d="M-8 8 L-4 -6 L0 6 L4 -6 L8 8" fill="none" stroke="#ea580c" stroke-width="2"/>
      </g>
      <!-- Energy Step Badges -->
      <g transform="translate(60, 290)">
        <rect x="0" y="0" width="150" height="34" rx="6" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5"/>
        <text x="75" y="22" style="font-size:11px;font-weight:800;fill:#0284c7;text-anchor:middle">역학적(운동) 에너지</text>
      </g>
      <text x="250" y="312" style="font-size:16px;font-weight:900;fill:#64748b">→</text>
      <g transform="translate(280, 290)">
        <rect x="0" y="0" width="120" height="34" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="60" y="22" style="font-size:11px;font-weight:800;fill:#b45309;text-anchor:middle">전기 에너지</text>
      </g>
      <text x="430" y="312" style="font-size:16px;font-weight:900;fill:#64748b">→</text>
      <g transform="translate(460, 290)">
        <rect x="0" y="0" width="130" height="34" rx="6" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>
        <text x="65" y="22" style="font-size:11px;font-weight:800;fill:#dc2626;text-anchor:middle">빛·열 에너지</text>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">에너지 전환: 운동 에너지 → 전기 에너지 → 빛·열 에너지</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">발전 전환 효율: 72%</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">손잡이를 돌리는 운동 에너지가 발전기에서 전기 에너지로 바뀌고, 전구에서 빛과 열로 전환돼요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">생키 다이어그램(Sankey Diagram) 에너지 보존 수지표</text>
      <!-- Input Band (100J) -->
      <path d="M60 160 H240 V280 H60 Z" fill="#0284c7"/>
      <text x="150" y="225" style="font-size:14px;font-weight:800;fill:#ffffff;text-anchor:middle">역학적 입력 100J</text>
      <!-- Branch Useful (72J) -->
      <path d="M240 160 C320 160 360 130 420 130 H550 V210 H420 C360 210 320 220 240 220 Z" fill="#f59e0b"/>
      <text x="480" y="175" style="font-size:13px;font-weight:800;fill:#ffffff;text-anchor:middle">유효 빛/전기 72J</text>
      <!-- Branch Thermal Loss (28J) -->
      <path d="M240 220 C300 220 330 290 390 290 H550 V340 H390 C330 340 300 280 240 280 Z" fill="#ef4444"/>
      <text x="470" y="320" style="font-size:12px;font-weight:800;fill:#ffffff;text-anchor:middle">비가역 열손실 28J</text>

      <rect x="40" y="360" width="560" height="40" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="385" style="font-size:12px;font-weight:800;fill:#0f172a;text-anchor:middle">에너지 보존 법칙: 전환 전후의 총 에너지 합은 100J로 항상 일정하게 보존돼요</text>
      </g>`;
    } else if (c === 1) {
      // 전지 → 모터
      body = `<g filter="url(#ex-shadow)">
      <!-- Chemical Battery -->
      <g transform="translate(100, 170)">
        <rect x="0" y="0" width="100" height="70" rx="6" fill="#10b981" stroke="#047857" stroke-width="2"/>
        <text x="50" y="42" style="font-size:13px;font-weight:800;fill:#ffffff;text-anchor:middle">화학 전지</text>
      </g>
      <path d="M200 205 H380" fill="none" stroke="#f59e0b" stroke-width="5"/>
      <!-- Motor with Propeller Fan -->
      <g transform="translate(420, 205)">
        <circle cx="0" cy="0" r="30" fill="#334155" stroke="#0f172a" stroke-width="2"/>
        <text x="0" y="5" style="font-size:11px;font-weight:800;fill:#ffffff;text-anchor:middle">모터</text>
        <!-- Rotating Blades -->
        <g stroke="#0284c7" stroke-width="6" stroke-linecap="round">
          <line x1="-50" y1="0" x2="50" y2="0"/>
          <line x1="0" y1="-50" x2="0" y2="50"/>
        </g>
      </g>
      <!-- Flow Text -->
      <g transform="translate(60, 290)">
        <rect x="0" y="0" width="150" height="34" rx="6" fill="#d1fae5" stroke="#10b981" stroke-width="1.5"/>
        <text x="75" y="22" style="font-size:11px;font-weight:800;fill:#047857;text-anchor:middle">전지의 화학 에너지</text>
      </g>
      <text x="250" y="312" style="font-size:16px;font-weight:900;fill:#64748b">→</text>
      <g transform="translate(280, 290)">
        <rect x="0" y="0" width="120" height="34" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="60" y="22" style="font-size:11px;font-weight:800;fill:#b45309;text-anchor:middle">전기 에너지</text>
      </g>
      <text x="430" y="312" style="font-size:16px;font-weight:900;fill:#64748b">→</text>
      <g transform="translate(460, 290)">
        <rect x="0" y="0" width="130" height="34" rx="6" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5"/>
        <text x="65" y="22" style="font-size:11px;font-weight:800;fill:#0284c7;text-anchor:middle">모터의 운동 에너지</text>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">에너지 전환: 화학 에너지 → 전기 에너지 → 모터 운동 에너지</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">모터 회전: 1,800 RPM</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">전지 속 물질의 화학 에너지가 도선을 따라 전기 에너지로 전달된 후 모터를 회전시키는 운동 에너지로 바뀌어요</text>
      </g>`;
      detail = body;
    } else if (c === 2) {
      // 태양 전지 → 모터
      body = `<g filter="url(#ex-shadow)">
      <!-- Sun Radiating Light -->
      <g transform="translate(90, 110)">
        <circle cx="0" cy="0" r="28" fill="#facc15" stroke="#eab308" stroke-width="2"/>
        ${Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return `<line x1="${Math.cos(a) * 35}" y1="${Math.sin(a) * 35}" x2="${Math.cos(a) * 48}" y2="${Math.sin(a) * 48}" stroke="#f59e0b" stroke-width="2.5"/>`;
        }).join('')}
      </g>
      <!-- Solar Panel -->
      <g transform="translate(180, 190)">
        <polygon points="0,30 90,0 120,60 30,90" fill="#1e3a8a" stroke="#172554" stroke-width="2"/>
        <line x1="30" y1="20" x2="60" y2="80" stroke="#38bdf8" stroke-width="1.5"/>
        <line x1="60" y1="10" x2="90" y2="70" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="60" y="55" style="font-size:11px;font-weight:800;fill:#ffffff">태양 전지판</text>
      </g>
      <!-- Wire to Motor -->
      <path d="M300 230 H450" fill="none" stroke="#f59e0b" stroke-width="4.5"/>
      <g transform="translate(480, 230)">
        <circle cx="0" cy="0" r="28" fill="#334155" stroke="#0f172a" stroke-width="2"/>
        <!-- Pinwheel fan -->
        <g stroke="#0284c7" stroke-width="5" stroke-linecap="round">
          <line x1="-38" y1="0" x2="38" y2="0"/>
          <line x1="0" y1="-38" x2="0" y2="38"/>
        </g>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">에너지 전환: 태양의 빛 에너지 → 태양전지 전기 → 운동 에너지</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">광전 변환 가동 중</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">햇빛의 빛 에너지를 태양 전지판이 흡수하여 전기를 만들고, 이 전기가 모터를 돌려 바람개비를 회전시켜요</text>
      </g>`;
      detail = body;
    }
    caption = c === 0 ? '손잡이를 돌리는 운동 에너지가 전기 에너지를 거쳐 전구의 빛과 열 에너지로 바뀌어요.' : c === 1 ? '전지 속 화학 에너지가 전기 에너지를 거쳐 모터를 회전시키는 운동 에너지로 바뀌어요.' : '태양의 빛 에너지를 태양 전지가 전기로 바꾸고, 모터가 이를 다시 운동 에너지로 전환해요.';
  } else if (kind === 'force-graph') {
    controls = ['추 1개', '추 2개', '추 3개'];
    customSteps = ['용수철 늘어남과 그래프', '탄성 한계와 금속 격자'];

    const weightCount = c + 1;
    const deltaY = weightCount * 35;

    body = `<g filter="url(#ex-shadow)">
      <!-- Stand and Ruler -->
      <g transform="translate(80, 80)">
        <!-- Top Horizontal Bar -->
        <rect x="0" y="0" width="140" height="14" rx="3" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
        <!-- Metric Ruler (0 to 20 cm) -->
        <rect x="120" y="14" width="26" height="260" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        ${Array.from({ length: 11 }, (_, i) => `
          <line x1="120" y1="${20 + i * 24}" x2="132" y2="${20 + i * 24}" stroke="#334155" stroke-width="1.5"/>
          <text x="136" y="${24 + i * 24}" style="font-size:9px;font-weight:700;fill:#475569">${i * 2}</text>
        `).join('')}
        <!-- Spring -->
        <g transform="translate(60, 14)">
          <line x1="0" y1="0" x2="0" y2="15" stroke="#334155" stroke-width="2"/>
          <!-- Elongating Spring Coils -->
          <path d="M0 15 ${Array.from({ length: 12 }, (_, i) => `q ${i % 2 === 0 ? 12 : -12} ${(deltaY + 70) / 24} 0 ${(deltaY + 70) / 12}`).join(' ')}" fill="none" stroke="#475569" stroke-width="2.5"/>
          <!-- Hanging Hook -->
          <line x1="0" y1="${85 + deltaY}" x2="0" y2="${100 + deltaY}" stroke="#334155" stroke-width="2"/>
          <!-- Red Indicator Needle pointing to ruler -->
          <polygon points="0,${100 + deltaY} 60,${100 + deltaY} 50,${96 + deltaY} 50,${104 + deltaY}" fill="#dc2626"/>
          <!-- Brass Weights -->
          ${Array.from({ length: weightCount }, (_, i) => `
            <g transform="translate(-20, ${100 + deltaY + i * 26})">
              <rect x="0" y="0" width="40" height="24" rx="4" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/>
              <text x="20" y="16" style="font-size:10px;font-weight:800;fill:#451a03;text-anchor:middle">1.0 N</text>
            </g>
          `).join('')}
        </g>
      </g>

      <!-- Side Graph (F vs Delta X Linear Plot) -->
      <g transform="translate(320, 100)">
        <rect x="0" y="0" width="280" height="240" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="140" y="25" style="font-size:12px;font-weight:800;fill:#1e293b;text-anchor:middle">추의 무게와 늘어난 길이 (훅의 법칙)</text>
        <!-- Axes -->
        <line x1="45" y1="200" x2="255" y2="200" stroke="#334155" stroke-width="2" marker-end="url(#ex-arrow)"/>
        <text x="250" y="218" style="font-size:10px;font-weight:800;fill:#334155">무게 F (N)</text>
        <line x1="45" y1="200" x2="45" y2="40" stroke="#334155" stroke-width="2" marker-end="url(#ex-arrow)"/>
        <text x="35" y="42" style="font-size:10px;font-weight:800;fill:#334155;text-anchor:end">늘어난 길이 (cm)</text>

        <!-- Grid Lines & Linear Line -->
        <line x1="45" y1="200" x2="235" y2="70" stroke="#dc2626" stroke-width="2.5"/>
        <!-- Plotted Data Points -->
        <circle cx="105" cy="160" r="5" fill="${weightCount >= 1 ? '#0284c7' : '#94a3b8'}"/>
        <text x="105" y="180" style="font-size:9px;font-weight:700;fill:#0284c7;text-anchor:middle">(1N, 2.5)</text>
        <circle cx="165" cy="115" r="5" fill="${weightCount >= 2 ? '#0284c7' : '#94a3b8'}"/>
        <text x="165" y="135" style="font-size:9px;font-weight:700;fill:#0284c7;text-anchor:middle">(2N, 5.0)</text>
        <circle cx="225" cy="70" r="5" fill="${weightCount >= 3 ? '#0284c7' : '#94a3b8'}"/>
        <text x="225" y="90" style="font-size:9px;font-weight:700;fill:#0284c7;text-anchor:middle">(3N, 7.5)</text>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">훅의 법칙: 용수철이 늘어난 길이는 매단 추의 무게에 비례</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">F = ${weightCount}.0 N · Δx = ${(weightCount * 2.5).toFixed(1)} cm</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">추의 무게가 2배, 3배가 되면 늘어난 길이도 정확히 2배, 3배가 되어 물체의 무게를 잴 수 있어요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">탄성 한계(Elastic Limit)와 금속 격자의 소성 변형</text>
      <g transform="translate(60, 90)">
        <rect x="0" y="0" width="480" height="230" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- Stress-Strain Curve -->
        <path d="M40 190 L180 80 Q260 65 320 80 T440 140" fill="none" stroke="#dc2626" stroke-width="3"/>
        <line x1="180" y1="40" x2="180" y2="200" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,4"/>
        <text x="110" y="60" style="font-size:12px;font-weight:800;fill:#16a34a">탄성 구간 (원상 복귀)</text>
        <text x="300" y="60" style="font-size:12px;font-weight:800;fill:#dc2626">소성 변형 구간 (영구 변형)</text>
        <text x="180" y="215" style="font-size:11px;font-weight:800;fill:#b45309;text-anchor:middle">탄성 한계선</text>
      </g>
      <rect x="40" y="355" width="560" height="40" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="380" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">탄성 한계 내에서는 무게에 비례하여 늘어나지만, 한계를 넘는 무거운 추를 달면 원래대로 돌아오지 않아요</text>
      </g>`;
    caption = c === 0 ? '추 1개를 달면 용수철이 일정한 길이만큼 늘어나요.' : c === 1 ? '추 2개를 달면 무게가 2배가 되어 늘어난 길이도 정확히 2배가 돼요.' : '추 3개를 달면 늘어난 길이도 3배가 돼요. 탄성 한계 안에서는 힘과 길이가 비례해요.';
  } else if (kind === 'materials') {
    controls = ['철 막대', '마른 나무 조각', '투명 플라스틱 판', '고무 띠'];
    customSteps = ['물질별 물리적 특성', '미세 원자 결합 구조'];

    if (c === 0) {
      // 철 막대
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(100, 160)">
        <rect x="0" y="0" width="220" height="40" rx="4" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
        <line x1="10" y1="8" x2="210" y2="8" stroke="#e2e8f0" stroke-width="3"/>
        <text x="110" y="26" style="font-size:14px;font-weight:800;fill:#0f172a;text-anchor:middle">철 막대 (Iron Rod)</text>
      </g>
      <!-- Property Badges -->
      <g transform="translate(360, 110)">
        <rect x="0" y="0" width="200" height="40" rx="6" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
        <text x="15" y="25" style="font-size:12px;font-weight:800;fill:#16a34a">전기 전도성: 매우 우수</text>
        <rect x="0" y="55" width="200" height="40" rx="6" fill="#eff6ff" stroke="#0284c7" stroke-width="1.5"/>
        <text x="15" y="80" style="font-size:12px;font-weight:800;fill:#0284c7">굳기: 단단함 (모스 4.5)</text>
        <rect x="0" y="110" width="200" height="40" rx="6" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5"/>
        <text x="15" y="135" style="font-size:12px;font-weight:800;fill:#dc2626">자성: 자석에 강하게 붙음</text>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">금속(철): 은백색 광택이 있고 단단하며 전기가 매우 잘 통함</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">전기 전도율 100% (도체)</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">철은 튼튼하고 단단하여 건축재로 쓰이며, 자유전자가 있어 열과 전기를 잘 전달해요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">금속 결합(Metallic Bonding)과 자유전자 모델</text>
      <g transform="translate(100, 100)">
        <rect x="0" y="0" width="400" height="220" rx="8" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/>
        ${Array.from({ length: 4 }, (_, r) => Array.from({ length: 6 }, (_, col) => `
          <circle cx="${45 + col * 60}" cy="${35 + r * 50}" r="18" fill="#94a3b8" stroke="#334155" stroke-width="2"/>
          <text x="${45 + col * 60}" y="${40 + r * 50}" style="font-size:12px;font-weight:900;fill:#ffffff;text-anchor:middle">Fe²⁺</text>
        `).join('')).join('')}
        <!-- Free electrons -->
        ${Array.from({ length: 14 }, (_, i) => `<circle cx="${25 + (i * 26) % 350}" cy="${20 + (i * 35) % 180}" r="4" fill="#facc15"/>`).join('')}
      </g>
      <rect x="40" y="355" width="560" height="40" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="380" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">금속 양이온 사이를 자유전자가 바다처럼 자유롭게 이동하기 때문에 전기와 열을 탁월하게 전달해요</text>
      </g>`;
    } else if (c === 1) {
      // 마른 나무 조각
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(100, 160)">
        <rect x="0" y="0" width="220" height="50" rx="4" fill="#d97706" stroke="#92400e" stroke-width="2"/>
        <line x1="20" y1="15" x2="200" y2="15" stroke="#b45309" stroke-width="2"/>
        <line x1="10" y1="35" x2="210" y2="35" stroke="#b45309" stroke-width="2"/>
        <text x="110" y="32" style="font-size:14px;font-weight:800;fill:#ffffff;text-anchor:middle">마른 나무 (Wood)</text>
      </g>
      <g transform="translate(360, 110)">
        <rect x="0" y="0" width="200" height="40" rx="6" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5"/>
        <text x="15" y="25" style="font-size:12px;font-weight:800;fill:#dc2626">전기 전도성: 전기가 통하지 않음</text>
        <rect x="0" y="55" width="200" height="40" rx="6" fill="#eff6ff" stroke="#0284c7" stroke-width="1.5"/>
        <text x="15" y="80" style="font-size:12px;font-weight:800;fill:#0284c7">밀도: 0.65 g/cm³ (물에 뜸)</text>
        <rect x="0" y="110" width="200" height="40" rx="6" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
        <text x="15" y="135" style="font-size:12px;font-weight:800;fill:#16a34a">자연 나이테 고유 결 보유</text>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">나무: 가볍고 물에 뜨며 전기가 통하지 않는 절연체</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#d97706" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#d97706;text-anchor:middle">부력 작용 (물에 뜸)</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">나무는 가볍고 물보다 밀도가 작아 물에 뜨며, 전기가 통하지 않아 안전한 손잡이나 가구에 쓰여요</text>
      </g>`;
      detail = body;
    } else if (c === 2) {
      // 투명 플라스틱 판
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(100, 160)">
        <rect x="0" y="0" width="220" height="50" rx="6" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2" opacity="0.8"/>
        <line x1="20" y1="10" x2="70" y2="10" stroke="#ffffff" stroke-width="3"/>
        <text x="110" y="32" style="font-size:14px;font-weight:800;fill:#0284c7;text-anchor:middle">투명 플라스틱 (Acrylic)</text>
      </g>
      <g transform="translate(360, 110)">
        <rect x="0" y="0" width="200" height="40" rx="6" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
        <text x="15" y="25" style="font-size:12px;font-weight:800;fill:#16a34a">광투과율: 92% (매우 투명)</text>
        <rect x="0" y="55" width="200" height="40" rx="6" fill="#eff6ff" stroke="#0284c7" stroke-width="1.5"/>
        <text x="15" y="80" style="font-size:12px;font-weight:800;fill:#0284c7">방수성: 물을 흡수하지 않음</text>
        <rect x="0" y="110" width="200" height="40" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="15" y="135" style="font-size:12px;font-weight:800;fill:#b45309">가공성: 가볍고 쉽게 성형</text>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">플라스틱: 투명하고 물에 젖지 않으며 다양한 모양 가공 가능</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">광투과율 92% (투명성)</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">플라스틱은 유리처럼 투명하면서도 잘 깨지지 않고 물을 튕겨내어 생활 용기로 널리 활용돼요</text>
      </g>`;
      detail = body;
    } else if (c === 3) {
      // 고무 띠
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(100, 160)">
        <path d="M0 25 Q110 -15 220 25 Q110 65 0 25 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
        <text x="110" y="30" style="font-size:14px;font-weight:800;fill:#ffffff;text-anchor:middle">고무 띠 (Rubber Band)</text>
      </g>
      <g transform="translate(360, 110)">
        <rect x="0" y="0" width="200" height="40" rx="6" fill="#eff6ff" stroke="#0284c7" stroke-width="1.5"/>
        <text x="15" y="25" style="font-size:12px;font-weight:800;fill:#0284c7">탄성 복원력: 99% 회복</text>
        <rect x="0" y="55" width="200" height="40" rx="6" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
        <text x="15" y="80" style="font-size:12px;font-weight:800;fill:#16a34a">유연성: 잡아당기면 잘 늘어남</text>
        <rect x="0" y="110" width="200" height="40" rx="6" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5"/>
        <text x="15" y="135" style="font-size:12px;font-weight:800;fill:#dc2626">충격 흡수 및 미끄럼 방지</text>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">고무: 탄성이 매우 커서 늘어났다 놓으면 원래대로 돌아옴</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#dc2626" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#dc2626;text-anchor:middle">탄성 복원력 우수</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">고무는 유연하고 탄성이 뛰어나 물건을 묶거나 미끄럼을 방지하는 신발 바닥 등에 적합해요</text>
      </g>`;
      detail = body;
    }
    caption = c === 0 ? '철은 광택이 있고 단단하며 전기와 열을 아주 잘 전달해요.' : c === 1 ? '마른 나무는 물에 뜨고 전기가 통하지 않으며 고유의 결이 있어요.' : c === 2 ? '플라스틱은 투명하고 가벼우며 물에 젖지 않고 모양을 만들기 쉬워요.' : '고무는 잡아당기면 길게 늘어나고 놓으면 원래대로 되돌아오는 탄성이 커요.';
  } else if (kind === 'solutions') {
    controls = ['적은 설탕 · 충분히 젓기', '많은 설탕 · 일부 남음', '같은 많은 양 · 따뜻한 물'];
    customSteps = ['용해 과정과 포화 관찰', '수화 분자 구조와 용해도'];

    if (c === 0) {
      // 적은 설탕 · 충분히 젓기
      body = `<g filter="url(#ex-shadow)">
      <!-- Beaker with Clear Water -->
      <g transform="translate(180, 100)">
        <path d="M30 40 V230 Q30 250 50 250 H210 Q230 250 230 230 V40" fill="url(#ex-glass)" stroke="#475569" stroke-width="3"/>
        <path d="M33 110 H227 V230 Q227 247 210 247 H50 Q33 247 33 230 Z" fill="url(#ex-water)" opacity="0.6"/>
        <!-- Stirring Rod -->
        <line x1="160" y1="20" x2="110" y2="230" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round"/>
        <!-- Dissolved sugar particles dispersed evenly -->
        ${Array.from({ length: 16 }, (_, i) => `<circle cx="${55 + (i * 37) % 150}" cy="${130 + (i * 23) % 100}" r="3.5" fill="#ffffff" stroke="#0284c7" stroke-width="1"/>`).join('')}
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">용해(Dissolution): 용질이 용매에 골고루 섞여 투명해짐</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">불포화 용액 (완전 용해)</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">적은 양의 설탕을 넣고 저어주면 입자가 물 분자 사이로 골고루 퍼져 투명한 용액이 돼요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">수화(Hydration) 현상과 용질-용매 분자 상호작용</text>
      <!-- Center Sugar Molecule surrounded by H2O -->
      <g transform="translate(240, 180)">
        <circle cx="0" cy="0" r="38" fill="#f8fafc" stroke="#334155" stroke-width="2.5"/>
        <text x="0" y="6" style="font-size:13px;font-weight:900;fill:#0f172a;text-anchor:middle">설탕 분자</text>
        <!-- Surrounding Water Dipoles -->
        ${Array.from({ length: 6 }, (_, i) => {
          const a = (i * Math.PI) / 3;
          const x = Math.cos(a) * 80;
          const y = Math.sin(a) * 80;
          return `<g transform="translate(${x}, ${y})">
            <circle cx="0" cy="0" r="14" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5"/>
            <text x="0" y="4" style="font-size:9px;font-weight:800;fill:#ffffff;text-anchor:middle">H₂O</text>
          </g>`;
        }).join('')}
      </g>
      <rect x="40" y="355" width="560" height="40" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="380" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">극성을 띤 물 분자들이 설탕 분자를 둘러싸며 결합을 떼어내어 용액 전체로 균일하게 확산시켜요</text>
      </g>`;
    } else if (c === 1) {
      // 많은 설탕 · 일부 남음
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(180, 100)">
        <path d="M30 40 V230 Q30 250 50 250 H210 Q230 250 230 230 V40" fill="url(#ex-glass)" stroke="#475569" stroke-width="3"/>
        <path d="M33 110 H227 V230 Q227 247 210 247 H50 Q33 247 33 230 Z" fill="url(#ex-water)" opacity="0.6"/>
        <!-- Undissolved sugar layer at bottom -->
        <rect x="45" y="225" width="170" height="22" rx="4" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>
        <text x="130" y="240" style="font-size:11px;font-weight:800;fill:#334155;text-anchor:middle">녹지 않고 남은 설탕 (침전)</text>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">포화(Saturation): 일정 온도에서 녹을 수 있는 한계 도달</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#dc2626" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#dc2626;text-anchor:middle">포화 상태 · 침전 발생</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">일정한 양의 물에 녹을 수 있는 용질의 양에는 한계가 있어, 더 많이 넣으면 바닥에 가라앉아요</text>
      </g>`;
      detail = body;
    } else if (c === 2) {
      // 같은 많은 양 · 따뜻한 물
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(180, 100)">
        <path d="M30 40 V230 Q30 250 50 250 H210 Q230 250 230 230 V40" fill="url(#ex-glass)" stroke="#475569" stroke-width="3"/>
        <path d="M33 110 H227 V230 Q227 247 210 247 H50 Q33 247 33 230 Z" fill="#bae6fd" opacity="0.75"/>
        <!-- Steam Wisps Rising -->
        <path d="M80 30 Q90 10 80 0 M130 30 Q140 10 130 0 M180 30 Q190 10 180 0" stroke="#94a3b8" stroke-width="2" fill="none" opacity="0.6"/>
        <!-- All dissolved in warm water -->
        ${Array.from({ length: 28 }, (_, i) => `<circle cx="${50 + (i * 29) % 160}" cy="${125 + (i * 17) % 110}" r="3" fill="#ffffff" stroke="#0284c7" stroke-width="1"/>`).join('')}
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">온도와 용해도: 따뜻한 물에서는 용해도가 증가함</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">수온 60℃ (완전 용해)</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">물의 온도가 높아지면 물 분자의 운동이 활발해져 고체 설탕을 훨씬 더 많이 녹일 수 있어요</text>
      </g>`;
      detail = body;
    }
    caption = c === 0 ? '적은 양의 설탕은 물에 완전히 녹아 투명한 용액이 돼요.' : c === 1 ? '설탕을 계속 넣으면 더 이상 녹지 못하고 바닥에 가라앉아 포화 상태가 돼요.' : '물의 온도를 높여주면 용해도가 증가해 바닥에 남았던 설탕도 모두 녹아요.';
  } else if (kind === 'gases') {
    controls = ['닫힌 주사기 · 큰 부피', '닫힌 주사기 · 압축', '산소와 이산화탄소 성질'];
    customSteps = ['기체 압축 및 성질 실험', 'P-V 보일 법칙 분석'];

    if (c === 0) {
      // 닫힌 주사기 · 큰 부피 (1.0 atm, 60mL)
      body = `<g filter="url(#ex-shadow)">
      <!-- Gas Syringe Barrel -->
      <g transform="translate(100, 150)">
        <rect x="0" y="0" width="360" height="100" rx="4" fill="url(#ex-glass)" stroke="#475569" stroke-width="2"/>
        <line x1="0" y1="50" x2="-25" y2="50" stroke="#0f172a" stroke-width="8"/>
        <!-- Rubber Stopper blocking nozzle -->
        <rect x="-35" y="35" width="14" height="30" rx="3" fill="#dc2626"/>
        <!-- Plunger at 60mL -->
        <rect x="300" y="5" width="24" height="90" rx="3" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
        <rect x="324" y="42" width="140" height="16" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
        <rect x="464" y="25" width="14" height="50" rx="3" fill="#94a3b8"/>
        <!-- Sparse Gas Particles -->
        ${Array.from({ length: 14 }, (_, i) => `<circle cx="${30 + (i * 24) % 260}" cy="${20 + (i * 19) % 65}" r="5" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5"/>`).join('')}
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">기체의 성질: 입자 사이 거리가 멀어 공간을 가득 채움</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">부피 V = 60 mL · 1.0 atm</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">기체 입자는 서로 멀리 떨어져 자유롭게 운동하며 주사기 내부 전체를 가득 채우고 있어요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">보일의 법칙(Boyle's Law) P-V 등온 곡선 분석</text>
      <g transform="translate(100, 90)">
        <rect x="0" y="0" width="400" height="220" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <line x1="50" y1="190" x2="360" y2="190" stroke="#334155" stroke-width="2" marker-end="url(#ex-arrow)"/>
        <text x="350" y="210" style="font-size:11px;font-weight:800;fill:#334155">부피 V (mL)</text>
        <line x1="50" y1="190" x2="50" y2="30" stroke="#334155" stroke-width="2" marker-end="url(#ex-arrow)"/>
        <text x="40" y="30" style="font-size:11px;font-weight:800;fill:#334155;text-anchor:end">압력 P (atm)</text>
        <!-- Hyperbola curve P * V = const -->
        <path d="M70 50 Q100 130 190 160 T340 180" fill="none" stroke="#0284c7" stroke-width="3"/>
        <circle cx="100" cy="130" r="5" fill="#dc2626"/>
        <text x="110" y="125" style="font-size:11px;font-weight:800;fill:#dc2626">(30mL, 2.0atm)</text>
        <circle cx="240" cy="170" r="5" fill="#0284c7"/>
        <text x="250" y="165" style="font-size:11px;font-weight:800;fill:#0284c7">(60mL, 1.0atm)</text>
      </g>
      <rect x="40" y="355" width="560" height="40" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="380" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">온도가 일정할 때 기체의 부피는 압력에 반비례하여 줄어들며, P × V 값은 항상 일정해요</text>
      </g>`;
    } else if (c === 1) {
      // 닫힌 주사기 · 압축 (2.0 atm, 30mL)
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(100, 150)">
        <rect x="0" y="0" width="360" height="100" rx="4" fill="url(#ex-glass)" stroke="#475569" stroke-width="2"/>
        <line x1="0" y1="50" x2="-25" y2="50" stroke="#0f172a" stroke-width="8"/>
        <rect x="-35" y="35" width="14" height="30" rx="3" fill="#dc2626"/>
        <!-- Plunger pushed in to 30mL -->
        <rect x="150" y="5" width="24" height="90" rx="3" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
        <rect x="174" y="42" width="140" height="16" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
        <rect x="314" y="25" width="14" height="50" rx="3" fill="#94a3b8"/>
        <!-- Force Push Arrow -->
        <g stroke="#dc2626" stroke-width="4" marker-end="url(#ex-arrow-coral)">
          <line x1="390" y1="50" x2="335" y2="50"/>
        </g>
        <!-- Compressed Dense Gas Particles -->
        ${Array.from({ length: 14 }, (_, i) => `<circle cx="${20 + (i * 20) % 120}" cy="${15 + (i * 17) % 70}" r="5" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5"/>`).join('')}
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">보일의 법칙: 외부 압력을 가하면 기체의 부피가 압축됨</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#dc2626" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#dc2626;text-anchor:middle">부피 V = 30 mL · 2.0 atm</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">기체는 입자 사이의 빈 공간이 넓기 때문에 피스톤을 누르면 쉽게 부피가 반으로 줄어들어요</text>
      </g>`;
      detail = body;
    } else if (c === 2) {
      // 산소와 이산화탄소 성질 비교
      body = `<g filter="url(#ex-shadow)">
      <!-- Oxygen Flask -->
      <g transform="translate(100, 110)">
        <path d="M40 0 H80 V40 L110 130 Q115 145 100 145 H20 Q5 145 10 130 L40 40 Z" fill="url(#ex-glass)" stroke="#475569" stroke-width="2"/>
        <text x="60" y="110" style="font-size:16px;font-weight:900;fill:#0284c7;text-anchor:middle">O₂ (산소)</text>
        <!-- Re-ignited Ember Splint -->
        <line x1="60" y1="0" x2="60" y2="70" stroke="#78350f" stroke-width="3"/>
        <circle cx="60" cy="70" r="14" fill="#facc15" filter="url(#ex-glow-amber)"/>
        <text x="60" y="170" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">깜부기불이 다시 타오름</text>
      </g>
      <!-- CO2 Flask -->
      <g transform="translate(380, 110)">
        <path d="M40 0 H80 V40 L110 130 Q115 145 100 145 H20 Q5 145 10 130 L40 40 Z" fill="url(#ex-glass)" stroke="#475569" stroke-width="2"/>
        <text x="60" y="110" style="font-size:16px;font-weight:900;fill:#64748b;text-anchor:middle">CO₂ (이산화탄소)</text>
        <!-- Extinguished Splint -->
        <line x1="60" y1="0" x2="60" y2="70" stroke="#78350f" stroke-width="3"/>
        <circle cx="60" cy="70" r="4" fill="#334155"/>
        <text x="60" y="170" style="font-size:12px;font-weight:800;fill:#64748b;text-anchor:middle">불꽃이 꺼지고 석회수 백탁</text>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">기체 성질: 산소(조연성, 연소 도움) vs 이산화탄소(소화성)</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">기체 반응 특성 분석</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">산소는 물질이 타는 것을 도와 불꽃을 살리고, 이산화탄소는 불을 끄며 석회수를 뿌옇게 흐리게 해요</text>
      </g>`;
      detail = body;
    }
    caption = c === 0 ? '기체는 입자 사이의 빈 공간이 매우 넓어 용기 전체를 고르게 채워요.' : c === 1 ? '피스톤을 세게 누르면 입자 사이 공간이 좁아지며 부피가 쉽게 압축돼요.' : '산소는 물질의 연소를 돕고, 이산화탄소는 불을 끄며 석회수를 뿌옇게 흐리게 해요.';
  } else if (kind === 'indicators') {
    controls = ['산성 용액 · BTB', '중성 용액 · BTB', '염기성 용액 · BTB', '같은 염기성 · 다른 지시약'];
    customSteps = ['용액 액성과 지시약', 'pH 척도 및 이온 농도'];

    if (c === 0) {
      // 산성 용액 · BTB (노란색)
      body = `<g filter="url(#ex-shadow)">
      <!-- Test Tube with Yellow Solution -->
      <g transform="translate(240, 90)">
        <rect x="50" y="0" width="60" height="200" rx="30" fill="url(#ex-glass)" stroke="#475569" stroke-width="2.5"/>
        <path d="M52 60 H108 V170 Q108 198 80 198 Q52 198 52 170 Z" fill="#facc15" opacity="0.85"/>
        <text x="80" y="140" style="font-size:13px;font-weight:900;fill:#78350f;text-anchor:middle">묽은 염산</text>
      </g>
      <!-- Dropping Pipette -->
      <g transform="translate(320, 40)">
        <polygon points="0,0 8,0 4,45 0,45" fill="#cbd5e1" stroke="#64748b" stroke-width="1"/>
        <circle cx="4" cy="55" r="4" fill="#facc15"/>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">산성 용액: BTB 용액을 떨어뜨리면 노란색으로 변함</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#ca8a04" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#ca8a04;text-anchor:middle">산성 (pH 2.0) · 노란색</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">식초나 묽은 염산 같은 산성 용액에 BTB 지시약을 넣으면 맑은 노란색을 띠게 돼요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">수소 이온(H⁺)과 수산화 이온(OH⁻) 농도 및 pH 스케일</text>
      <!-- pH Bar 1 to 14 -->
      <g transform="translate(60, 100)">
        <defs>
          <linearGradient id="ex-ph-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#ef4444"/>
            <stop offset="25%" stop-color="#facc15"/>
            <stop offset="50%" stop-color="#22c55e"/>
            <stop offset="75%" stop-color="#38bdf8"/>
            <stop offset="100%" stop-color="#7c3aed"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="480" height="35" rx="6" fill="url(#ex-ph-grad)" stroke="#334155" stroke-width="1.5"/>
        <text x="30" y="55" style="font-size:12px;font-weight:800;fill:#ef4444">pH 1 (강산)</text>
        <text x="240" y="55" style="font-size:12px;font-weight:800;fill:#16a34a;text-anchor:middle">pH 7 (중성)</text>
        <text x="450" y="55" style="font-size:12px;font-weight:800;fill:#7c3aed;text-anchor:end">pH 14 (강염기)</text>
      </g>
      <!-- Ion balance boxes -->
      <g transform="translate(60, 190)">
        <rect x="0" y="0" width="140" height="130" rx="8" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
        <text x="70" y="30" style="font-size:13px;font-weight:800;fill:#ef4444;text-anchor:middle">산성 용액</text>
        <text x="70" y="65" style="font-size:14px;font-weight:900;fill:#dc2626;text-anchor:middle">[H⁺] > [OH⁻]</text>
        <text x="70" y="100" style="font-size:11px;font-weight:700;fill:#334155;text-anchor:middle">BTB: 노란색</text>

        <rect x="170" y="0" width="140" height="130" rx="8" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
        <text x="240" y="30" style="font-size:13px;font-weight:800;fill:#16a34a;text-anchor:middle">중성 용액</text>
        <text x="240" y="65" style="font-size:14px;font-weight:900;fill:#16a34a;text-anchor:middle">[H⁺] = [OH⁻]</text>
        <text x="240" y="100" style="font-size:11px;font-weight:700;fill:#334155;text-anchor:middle">BTB: 초록색</text>

        <rect x="340" y="0" width="140" height="130" rx="8" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
        <text x="410" y="30" style="font-size:13px;font-weight:800;fill:#2563eb;text-anchor:middle">염기성 용액</text>
        <text x="410" y="65" style="font-size:14px;font-weight:900;fill:#2563eb;text-anchor:middle">[H⁺] < [OH⁻]</text>
        <text x="410" y="100" style="font-size:11px;font-weight:700;fill:#334155;text-anchor:middle">BTB: 파란색</text>
      </g>
      <rect x="40" y="355" width="560" height="40" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="380" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">용액 속 수소 이온 농도에 따라 지시약 분자의 화학 구조가 바뀌어 고유한 색을 나타내요</text>
      </g>`;
    } else if (c === 1) {
      // 중성 용액 · BTB (초록색)
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(240, 90)">
        <rect x="50" y="0" width="60" height="200" rx="30" fill="url(#ex-glass)" stroke="#475569" stroke-width="2.5"/>
        <path d="M52 60 H108 V170 Q108 198 80 198 Q52 198 52 170 Z" fill="#22c55e" opacity="0.85"/>
        <text x="80" y="140" style="font-size:13px;font-weight:900;fill:#064e3b;text-anchor:middle">증류수</text>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">중성 용액: BTB 용액을 떨어뜨리면 초록색으로 유지됨</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#16a34a;text-anchor:middle">중성 (pH 7.0) · 초록색</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">순수한 물이나 소금물처럼 산성도 염기성도 아닌 중성 용액에서는 BTB가 초록색을 띱니다</text>
      </g>`;
      detail = body;
    } else if (c === 2) {
      // 염기성 용액 · BTB (파란색)
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(240, 90)">
        <rect x="50" y="0" width="60" height="200" rx="30" fill="url(#ex-glass)" stroke="#475569" stroke-width="2.5"/>
        <path d="M52 60 H108 V170 Q108 198 80 198 Q52 198 52 170 Z" fill="#2563eb" opacity="0.85"/>
        <text x="80" y="140" style="font-size:13px;font-weight:900;fill:#ffffff;text-anchor:middle">수산화나트륨</text>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">염기성 용액: BTB 용액을 떨어뜨리면 짙은 파란색으로 변함</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#2563eb" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#2563eb;text-anchor:middle">염기성 (pH 12.0) · 파란색</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">유리세정제나 수산화나트륨 같은 염기성 용액에 BTB 지시약을 넣으면 선명한 파란색으로 변해요</text>
      </g>`;
      detail = body;
    } else if (c === 3) {
      // 같은 염기성 · 다른 지시약 (페놀프탈레인)
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(240, 90)">
        <rect x="50" y="0" width="60" height="200" rx="30" fill="url(#ex-glass)" stroke="#475569" stroke-width="2.5"/>
        <path d="M52 60 H108 V170 Q108 198 80 198 Q52 198 52 170 Z" fill="#ec4899" opacity="0.9"/>
        <text x="80" y="140" style="font-size:12px;font-weight:900;fill:#ffffff;text-anchor:middle">페놀프탈레인</text>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">페놀프탈레인 지시약: 염기성 용액에서만 붉은색(자주색)으로 변함</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#ec4899" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#ec4899;text-anchor:middle">페놀프탈레인: 붉은색</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">페놀프탈레인은 산성과 중성에서는 무색이지만, 염기성 용액을 만나면 붉은색으로 변해 쉽게 구별돼요</text>
      </g>`;
      detail = body;
    }
    caption = c === 0 ? 'BTB 용액은 산성에서 노란색, 중성에서 초록색, 염기성에서 파란색으로 변해요.' : c === 1 ? '증류수처럼 산성과 염기성 어느 쪽도 아닌 중성 용액에서는 BTB가 초록색이에요.' : c === 2 ? '수산화나트륨이나 비눗물 같은 염기성 용액에서는 BTB가 파란색으로 변해요.' : '페놀프탈레인 용액은 염기성 용액에서만 붉은색으로 변해 염기성을 확인하는 데 쓰여요.';
  } else if (kind === 'combustion') {
    controls = ['산소 공급 · 연소 지속', '산소 공급이 부족', '냉각하는 소화 원리'];
    customSteps = ['연소와 소화 원리', '연소의 삼각요소와 소화법'];

    if (c === 0) {
      // 산소 공급 · 연소 지속
      body = `<g filter="url(#ex-shadow)">
      <!-- Candle Stand and Wax Candle -->
      <g transform="translate(270, 160)">
        <rect x="25" y="60" width="50" height="110" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <line x1="50" y1="60" x2="50" y2="40" stroke="#0f172a" stroke-width="3"/>
        <!-- Candle Flame Layers -->
        <!-- Outer Flame (Orange) -->
        <path d="M50 0 Q65 25 50 45 Q35 25 50 0 Z" fill="#f97316" opacity="0.85" filter="url(#ex-glow-amber)"/>
        <!-- Inner Flame (Yellow) -->
        <path d="M50 10 Q60 28 50 45 Q40 28 50 10 Z" fill="#facc15"/>
        <!-- Core (Blue) -->
        <ellipse cx="50" cy="42" rx="6" ry="4" fill="#38bdf8"/>
      </g>
      <!-- Oxygen Inflow Arrows -->
      <g fill="none" stroke="#0284c7" stroke-width="2.5" marker-end="url(#ex-arrow-cyan)">
        <path d="M140 180 Q200 190 280 200"/>
        <path d="M460 180 Q400 190 320 200"/>
      </g>
      <text x="170" y="170" style="font-size:12px;font-weight:800;fill:#0284c7">산소(O₂) 공급</text>
      <text x="430" y="170" style="font-size:12px;font-weight:800;fill:#0284c7">산소(O₂) 공급</text>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">연소의 3요소: 탈 물질 + 산소 공급 + 발화점 이상의 온도</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#ea580c" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#ea580c;text-anchor:middle">연소 지속 (불꽃 활성)</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">공기 중의 산소가 계속 공급되고 온도가 유지되면 물질이 지속적으로 타며 빛과 열을 내요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">연소의 삼각요소(Fire Triangle)와 소화의 3대 원리</text>
      <!-- Triangle -->
      <g transform="translate(140, 90)">
        <polygon points="180,20 60,220 300,220" fill="none" stroke="#dc2626" stroke-width="4"/>
        <text x="180" y="10" style="font-size:14px;font-weight:900;fill:#dc2626;text-anchor:middle">1. 발화점 이상의 온도</text>
        <text x="30" y="235" style="font-size:14px;font-weight:900;fill:#0284c7;text-anchor:middle">2. 산소(O₂)</text>
        <text x="330" y="235" style="font-size:14px;font-weight:900;fill:#f59e0b;text-anchor:middle">3. 탈 물질</text>
        <!-- Center Flame Icon -->
        <circle cx="180" cy="140" r="28" fill="#fef08a" stroke="#f97316" stroke-width="2"/>
        <text x="180" y="145" style="font-size:13px;font-weight:900;fill:#ea580c;text-anchor:middle">연소</text>
      </g>
      <!-- 3 Methods badges -->
      <g transform="translate(460, 110)">
        <rect x="0" y="0" width="130" height="40" rx="6" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>
        <text x="65" y="25" style="font-size:11px;font-weight:800;fill:#dc2626;text-anchor:middle">냉각 소화 (물 분사)</text>
        <rect x="0" y="55" width="130" height="40" rx="6" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5"/>
        <text x="65" y="80" style="font-size:11px;font-weight:800;fill:#0284c7;text-anchor:middle">질식 소화 (산소 차단)</text>
        <rect x="0" y="110" width="130" height="40" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="65" y="135" style="font-size:11px;font-weight:800;fill:#b45309;text-anchor:middle">제거 소화 (연료 차단)</text>
      </g>
      <rect x="40" y="355" width="560" height="40" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="380" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">연소의 3요소 중 단 하나라도 제거하면 불이 꺼지는 것이 바로 소화의 근본 원리예요</text>
      </g>`;
    } else if (c === 1) {
      // 산소 공급이 부족 (집기병 덮기, 질식 소화)
      body = `<g filter="url(#ex-shadow)">
      <!-- Inverted Glass Bell Jar covering candle -->
      <g transform="translate(220, 110)">
        <rect x="0" y="0" width="200" height="180" rx="20" fill="url(#ex-glass)" stroke="#475569" stroke-width="2.5"/>
        <!-- Diminished Extinguishing Flame -->
        <g transform="translate(100, 110)">
          <rect x="-25" y="0" width="50" height="70" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
          <line x1="0" y1="0" x2="0" y2="-15" stroke="#0f172a" stroke-width="2"/>
          <!-- Dying Sparkle -->
          <circle cx="0" cy="-18" r="4" fill="#ea580c"/>
          <!-- Smoke Puff -->
          <circle cx="0" cy="-35" r="8" fill="#cbd5e1" opacity="0.6"/>
          <circle cx="8" cy="-50" r="12" fill="#cbd5e1" opacity="0.4"/>
        </g>
        <text x="100" y="45" style="font-size:11px;font-weight:800;fill:#dc2626;text-anchor:middle">밀폐 공간 산소 소진</text>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">질식 소화(산소 차단): 밀폐 용기로 산소를 막아 불 끄기</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#dc2626" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#dc2626;text-anchor:middle">산소 고갈 (불꽃 소화)</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">집기병을 덮으면 내부 산소가 빠르게 소비되어 산소 농도가 낮아지며 촛불이 저절로 꺼져요</text>
      </g>`;
      detail = body;
    } else if (c === 2) {
      // 냉각하는 소화 원리 (물 분사)
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(270, 160)">
        <rect x="25" y="60" width="50" height="110" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <line x1="50" y1="60" x2="50" y2="40" stroke="#0f172a" stroke-width="3"/>
        <circle cx="50" cy="40" r="4" fill="#475569"/>
      </g>
      <!-- Water Droplets and Steam Clouds -->
      <g fill="#0284c7">
        <circle cx="280" cy="170" r="5"/>
        <circle cx="310" cy="180" r="4"/>
        <circle cx="340" cy="165" r="5"/>
      </g>
      <!-- Steam Evaporation Cloud -->
      <g transform="translate(320, 130)" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1.5">
        <circle cx="0" cy="0" r="22"/>
        <circle cx="20" cy="-10" r="18"/>
        <circle cx="-15" cy="-8" r="16"/>
        <text x="0" y="5" style="font-size:11px;font-weight:800;fill:#0284c7;text-anchor:middle">수증기 증발</text>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">냉각 소화(온도 낮춤): 물을 뿌려 기화열로 발화점 미만 냉각</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">온도 급랭 (발화점 미만)</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">물을 뿌리면 물이 수증기로 변하며 많은 열을 빼앗아 가 온도를 발화점 아래로 떨어뜨려 불을 꺼요</text>
      </g>`;
      detail = body;
    }
    caption = c === 0 ? '탈 물질, 산소, 발화점 이상의 온도가 갖추어지면 연소가 지속돼요.' : c === 1 ? '밀폐된 집기병을 덮어 산소 공급을 차단하면 불이 저절로 꺼져요 (질식 소화).' : '물을 뿌려 물질의 온도를 발화점 아래로 낮추면 불이 꺼져요 (냉각 소화).';
  } else if (kind === 'particle-model') {
    controls = ['고체의 배열', '액체의 배열과 움직임', '기체의 간격과 움직임', '기체를 압축'];
    customSteps = ['물질 상태별 입자 배열', '온도 가열 곡선과 상변화'];

    if (c === 0) {
      // 고체의 배열
      body = `<g filter="url(#ex-shadow)">
      <!-- Chamber Container -->
      <g transform="translate(180, 110)">
        <rect x="0" y="0" width="280" height="230" rx="8" fill="#f8fafc" stroke="#334155" stroke-width="2.5"/>
        <!-- Highly regular crystalline grid (Solid) -->
        ${Array.from({ length: 4 }, (_, r) => Array.from({ length: 5 }, (_, col) => `
          <circle cx="${50 + col * 45}" cy="${60 + r * 45}" r="16" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
          <!-- Subtle vibration lines around each sphere -->
          <line x1="${30 + col * 45}" y1="${60 + r * 45}" x2="${33 + col * 45}" y2="${60 + r * 45}" stroke="#94a3b8" stroke-width="2"/>
          <line x1="${67 + col * 45}" y1="${60 + r * 45}" x2="${70 + col * 45}" y2="${60 + r * 45}" stroke="#94a3b8" stroke-width="2"/>
        `).join('')).join('')}
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">고체 상태: 입자들이 규칙적으로 배열되어 제자리 진동</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">모양과 부피 일정 (인력 강함)</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">고체는 입자 사이의 인력이 매우 강하여 일정한 모양과 부피를 유지하며 제자리에서만 살짝 떨려요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">상태 변화에 따른 가열 곡선(Heating Curve)과 상태 비교</text>
      <g transform="translate(80, 90)">
        <rect x="0" y="0" width="440" height="220" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <line x1="40" y1="190" x2="410" y2="190" stroke="#334155" stroke-width="2" marker-end="url(#ex-arrow)"/>
        <text x="400" y="210" style="font-size:11px;font-weight:800;fill:#334155">가열 시간</text>
        <line x1="40" y1="190" x2="40" y2="30" stroke="#334155" stroke-width="2" marker-end="url(#ex-arrow)"/>
        <text x="35" y="30" style="font-size:11px;font-weight:800;fill:#334155;text-anchor:end">온도 (℃)</text>
        <!-- Heating Curve with plateaus -->
        <path d="M40 180 L100 130 H180 L250 80 H330 L380 40" fill="none" stroke="#dc2626" stroke-width="3"/>
        <text x="140" y="120" style="font-size:11px;font-weight:800;fill:#0284c7;text-anchor:middle">융해(녹는점 0℃)</text>
        <text x="290" y="70" style="font-size:11px;font-weight:800;fill:#f59e0b;text-anchor:middle">기화(끓는점 100℃)</text>
      </g>
      <rect x="40" y="355" width="560" height="40" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="380" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">상태가 변하는 동안에는 공급된 열에너지가 입자 간 인력을 끊는 데 사용되어 온도가 일정하게 유지돼요</text>
      </g>`;
    } else if (c === 1) {
      // 액체의 배열과 움직임
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(180, 110)">
        <rect x="0" y="0" width="280" height="230" rx="8" fill="#f8fafc" stroke="#334155" stroke-width="2.5"/>
        <!-- Loosely packed particles at container bottom (Liquid) -->
        ${Array.from({ length: 18 }, (_, i) => {
          const x = 35 + (i * 42) % 210 + (i % 2 === 0 ? 10 : 0);
          const y = 130 + (i * 24) % 85;
          return `<g transform="translate(${x}, ${y})">
            <circle cx="0" cy="0" r="15" fill="#0d9488" stroke="#115e59" stroke-width="2"/>
            <path d="M-6 8 Q0 14 8 10" stroke="#5eead4" stroke-width="2" fill="none"/>
          </g>`;
        }).join('')}
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">액체 상태: 입자들이 비교적 가깝지만 자유롭게 미끄러져 흐름</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0d9488" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0d9488;text-anchor:middle">모양 변화 · 부피 일정</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">액체는 입자 사이 인력이 고체보다 약해 담는 그릇에 따라 모양이 변하지만 부피는 일정해요</text>
      </g>`;
      detail = body;
    } else if (c === 2) {
      // 기체의 간격과 움직임
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(180, 110)">
        <rect x="0" y="0" width="280" height="230" rx="8" fill="#f8fafc" stroke="#334155" stroke-width="2.5"/>
        <!-- Sparse particles with rapid motion arrows (Gas) -->
        ${Array.from({ length: 8 }, (_, i) => {
          const x = 40 + (i * 68) % 210;
          const y = 35 + (i * 54) % 165;
          const angle = (i * 45) * Math.PI / 180;
          return `<g transform="translate(${x}, ${y})">
            <circle cx="0" cy="0" r="12" fill="#e11d48" stroke="#9f1239" stroke-width="2"/>
            <line x1="0" y1="0" x2="${Math.cos(angle) * 25}" y2="${Math.sin(angle) * 25}" stroke="#dc2626" stroke-width="2.5" marker-end="url(#ex-arrow-coral)"/>
          </g>`;
        }).join('')}
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">기체 상태: 입자 사이 거리가 매우 멀고 모든 방향으로 활발히 운동</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#e11d48" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#e11d48;text-anchor:middle">모양과 부피 모두 변함</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">기체 입자는 서로 끌어당기는 힘이 거의 없어 공간 전체로 매우 빠르게 날아다니며 퍼져 나가요</text>
      </g>`;
      detail = body;
    } else if (c === 3) {
      // 기체를 압축
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(180, 110)">
        <rect x="0" y="0" width="280" height="230" rx="8" fill="#f8fafc" stroke="#334155" stroke-width="2.5"/>
        <!-- Plunger compressing top half -->
        <rect x="0" y="0" width="280" height="100" fill="#cbd5e1" stroke="#64748b" stroke-width="2"/>
        <text x="140" y="55" style="font-size:13px;font-weight:800;fill:#1e293b;text-anchor:middle">외부 가압 피스톤</text>
        <!-- Compressed Squeezed Gas Particles -->
        ${Array.from({ length: 8 }, (_, i) => {
          const x = 35 + (i * 65) % 210;
          const y = 135 + (i * 26) % 75;
          return `<g transform="translate(${x}, ${y})">
            <circle cx="0" cy="0" r="12" fill="#e11d48" stroke="#9f1239" stroke-width="2"/>
            <line x1="0" y1="0" x2="14" y2="10" stroke="#dc2626" stroke-width="2"/>
          </g>`;
        }).join('')}
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">기체의 압축: 빈 공간이 좁아지며 부피가 쉽게 압축됨</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#dc2626" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#dc2626;text-anchor:middle">입자 간격 급감 (압축)</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">기체를 압축해도 입자 자체의 크기는 변하지 않고, 입자들 사이의 빈 공간만 좁아지는 거예요</text>
      </g>`;
      detail = body;
    }
    caption = c === 0 ? '고체는 입자들이 규칙적으로 단단히 배열되어 제자리에서만 진동해요.' : c === 1 ? '액체는 입자 사이 거리가 비교적 가깝지만 자유롭게 미끄러져 흐를 수 있어요.' : c === 2 ? '기체는 입자 사이 거리가 매우 멀고 모든 방향으로 매우 빠르게 운동해요.' : '기체를 압축해도 입자 자체의 크기는 줄지 않고 입자 사이의 빈 공간만 줄어들어요.';
}else if (kind === 'erosion') {
    controls = ['완만한 흐름', '빠르고 강한 흐름', '파도가 바꾸는 해안'];
    customSteps = ['지형 변화 관찰', '유수 작용 단면 분석'];

    if (c < 2) {
      const isFast = c === 1;
      const speed = isFast ? 2.8 : 0.4;
      const waterColor = isFast ? '#0284c7' : '#38bdf8';
      const flowOffset = Math.round(phase * (isFast ? 120 : 40));

      body = `<g filter="url(#ex-shadow)">
      <path d="M40 150L200 90L600 220V370L360 405L40 280Z" fill="#a16207" stroke="#78350f" stroke-width="2.5"/>
      <path d="M40 150L200 90L600 220L360 290Z" fill="#ca8a04" opacity="0.85"/>
      <path d="M180 110Q230 220 350 235Q440 250 500 300L550 270Q450 220 355 210Q250 200 220 100Z" fill="${waterColor}" opacity="0.9"/>
      <path d="M200 115Q240 210 350 222Q440 235 520 285" fill="none" stroke="#ffffff" stroke-width="${isFast ? 3.5 : 2}" stroke-dasharray="8 6" stroke-dashoffset="${-flowOffset}" opacity="0.85"/>
      
      ${Array.from({ length: isFast ? 14 : 5 }, (_, i) => {
        const prog = (phase + i * (isFast ? 0.07 : 0.2)) % 1;
        const px = 200 + prog * 320;
        const py = 120 + prog * 160 + Math.sin(prog * Math.PI) * 20;
        return `<circle cx="${px}" cy="${py}" r="${isFast ? 4.5 + (i % 3) * 1.5 : 3}" fill="#78350f" stroke="#451a03" stroke-width="1"/>`;
      }).join('')}

      <rect x="65" y="305" width="55" height="24" rx="5" fill="#fffffffa" stroke="#dc2626" stroke-width="1.5"/>
      <text x="92" y="321" style="font-size:11px;font-weight:800;fill:#dc2626;text-anchor:middle">침식 (깎임)</text>

      <rect x="330" y="165" width="55" height="24" rx="5" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="357" y="181" style="font-size:11px;font-weight:800;fill:#0284c7;text-anchor:middle">운반 (이동)</text>

      <rect x="525" y="345" width="55" height="24" rx="5" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="552" y="361" style="font-size:11px;font-weight:800;fill:#16a34a;text-anchor:middle">퇴적 (쌓임)</text>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="${isFast ? '#dc2626' : '#0284c7'}" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="${isFast ? '#dc2626' : '#0284c7'}"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">${isFast ? '급경사·빠른 흐름: 강한 침식(V자곡 형성)과 자갈 운반' : '완경사·완만한 흐름: 곡류 형성 및 고운 흙 퇴적 우세'}</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="${isFast ? '#dc2626' : '#16a34a'}" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:${isFast ? '#dc2626' : '#16a34a'};text-anchor:middle">유속: ${speed} m/s (${isFast ? '침식 우세' : '퇴적 우세'})</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">흐르는 물은 지표면을 깎고(침식), 흙을 나르고(운반), 물살이 느려지면 내려놓아요(퇴적)</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">곡류(Meander) 하천의 공격사면(침식) vs 퇴적사면 단면</text>
      <rect x="60" y="90" width="520" height="235" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <path d="M80 180Q200 180 250 250Q350 290 450 260Q520 180 560 180V320H80Z" fill="#a16207" opacity="0.85"/>
      <path d="M180 210Q250 250 350 290Q450 260 520 210Z" fill="#38bdf8" opacity="0.8"/>
      <path d="M440 200V250" stroke="#dc2626" stroke-width="4" marker-end="url(#ex-arrow-coral)"/>
      <text x="440" y="185" style="font-size:11px;font-weight:800;fill:#dc2626;text-anchor:middle">바깥쪽: 빠른 유속 → 침식</text>
      <path d="M220 230V210" stroke="#16a34a" stroke-width="3"/>
      <text x="220" y="185" style="font-size:11px;font-weight:800;fill:#16a34a;text-anchor:middle">안쪽: 느린 유속 → 퇴적</text>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="373" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">하천이 굽이쳐 흐를 때 원심력으로 바깥쪽은 물살이 빨라 깎이고, 안쪽은 느려져 모래가 쌓여요</text>
      </g>`;
    } else {
      const waveShift = Math.sin(phase * Math.PI * 2) * 15;
      body = `<g filter="url(#ex-shadow)">
      <path d="M50 120L300 95L380 180V370L50 340Z" fill="#78350f" stroke="#451a03" stroke-width="2.5"/>
      <path d="M380 250Q330 290 380 320Z" fill="#451a03"/>
      <path d="M460 210L490 195L510 240L500 350L450 350Z" fill="#78350f" stroke="#451a03" stroke-width="2"/>
      <path d="M330 280Q450 ${260 + waveShift} 610 270V410H330Z" fill="#0284c7" opacity="0.85"/>
      <path d="M350 ${280 + waveShift}Q420 ${255 - waveShift} 560 ${275 + waveShift}" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-dasharray="10 5"/>

      <rect x="180" y="115" width="75" height="24" rx="5" fill="#fffffffa" stroke="#78350f" stroke-width="1.5"/>
      <text x="217" y="131" style="font-size:11px;font-weight:800;fill:#78350f;text-anchor:middle">해식애 (절벽)</text>

      <rect x="290" y="275" width="65" height="24" rx="5" fill="#fffffffa" stroke="#dc2626" stroke-width="1.5"/>
      <text x="322" y="291" style="font-size:11px;font-weight:800;fill:#dc2626;text-anchor:middle">해식동</text>

      <rect x="520" y="225" width="65" height="24" rx="5" fill="#fffffffa" stroke="#ca8a04" stroke-width="1.5"/>
      <text x="552" y="241" style="font-size:11px;font-weight:800;fill:#ca8a04;text-anchor:middle">시스택 (바위)</text>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#0284c7"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">해안 침식: 파도의 충격력에 의한 해식애·시스택 형성</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">파랑 에너지 유압 쐐기 작용</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">끊임없이 부딪치는 파도가 절벽 아래를 깎아 동굴을 만들고, 무너져 외딴 바위섬이 남아요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">해안 파식대(Wave-cut Platform) 형성 메커니즘 단면</text>
      <g transform="translate(60, 85)">
        <rect x="0" y="0" width="520" height="240" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <path d="M20 180H220V60H340V240H20Z" fill="#78350f" opacity="0.85"/>
        <path d="M20 180H220" stroke="#0284c7" stroke-width="14" opacity="0.6"/>
        <text x="120" y="160" style="font-size:11px;font-weight:800;fill:#0284c7;text-anchor:middle">파식대 (평탄면)</text>
        <text x="280" y="100" style="font-size:11px;font-weight:800;fill:#78350f;text-anchor:middle">해식애 (후퇴하는 절벽)</text>
      </g>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="373" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">파도가 절벽 아래를 계속 깎아내면 상부가 붕괴하고 절벽이 후퇴하면서 평탄한 파식대가 생겨요</text>
      </g>`;
    }
    caption = c === 2 ? '파도는 해안 바위를 끊임없이 깎아 절벽(해식애)과 동굴, 시스택 등 독특한 해안 지형을 만들어요.' : '물의 흐름이 빠를수록 강한 침식 작용이 일어나며, 느려지는 곳에서는 퇴적 작용이 활발해요.';
  }

  else if (kind === 'strata') {
    controls = ['퇴적층이 쌓이는 순서', '지층 단면과 화석', '암석 표본 비교'];
    customSteps = ['지층 구조 관찰', '지질 시대 표준 화석'];

    if (c === 0) {
      const strataLayers = [
        { name: '1. 역암층 (Conglomerate)', color: '#78350f', textCol: '#ffffff', y: 280, note: '자갈·모래 퇴적' },
        { name: '2. 사암층 (Sandstone)', color: '#ca8a04', textCol: '#ffffff', y: 215, note: '고운 모래 퇴적' },
        { name: '3. 셰일층 (Shale)', color: '#64748b', textCol: '#ffffff', y: 150, note: '진흙 입자 퇴적' },
        { name: '4. 석회암층 (Limestone)', color: '#cbd5e1', textCol: '#0f172a', y: 85, note: '조개·산호 유해' }
      ];

      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(60, 0)">
        ${strataLayers.map((ly, i) => `
          <g transform="translate(0, ${ly.y})">
            <rect x="0" y="0" width="450" height="65" rx="4" fill="${ly.color}" stroke="#334155" stroke-width="1.5"/>
            ${i === 0 ? [30, 90, 180, 260, 340, 410].map(cx => `<circle cx="${cx}" cy="32" r="8" fill="#451a03" stroke="#291102" stroke-width="1"/>`).join('') : i === 1 ? [40, 120, 200, 280, 360].map(cx => `<circle cx="${cx}" cy="32" r="2.5" fill="#fef08a"/>`).join('') : ''}
            <text x="25" y="38" style="font-size:12px;font-weight:800;fill:${ly.textCol}">${ly.name}</text>
            <text x="350" y="38" style="font-size:11px;font-weight:700;fill:${ly.textCol}">${ly.note}</text>
          </g>
        `).join('')}
      </g>

      <g transform="translate(545, 100)">
        <line x1="0" y1="240" x2="0" y2="10" stroke="#dc2626" stroke-width="4" marker-end="url(#ex-arrow-coral)"/>
        <text x="18" y="235" style="font-size:11px;font-weight:800;fill:#78350f">먼저 쌓임 (오래됨)</text>
        <text x="18" y="25" style="font-size:11px;font-weight:800;fill:#dc2626">나중 쌓임 (최근)</text>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">지층 누중의 법칙: 아래층이 위층보다 먼저 쌓임</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">수평 퇴적의 법칙 보존</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">뒤집히지 않은 정상적인 지층에서는 아래쪽에 있는 지층이 가장 먼저 쌓인 오래된 층이에요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">지층 시추 코어(Drill Core Sample) 고해상도 지질 분석</text>
      <g transform="translate(100, 85)">
        <rect x="0" y="0" width="100" height="240" rx="8" fill="#78350f" stroke="#451a03" stroke-width="2.5"/>
        <rect x="0" y="0" width="100" height="60" rx="4" fill="#cbd5e1"/>
        <rect x="0" y="60" width="100" height="60" rx="4" fill="#64748b"/>
        <rect x="0" y="120" width="100" height="60" rx="4" fill="#ca8a04"/>
        <rect x="0" y="180" width="100" height="60" rx="4" fill="#78350f"/>
      </g>
      <g transform="translate(240, 95)">
        <text x="0" y="25" style="font-size:12px;font-weight:800;fill:#334155">심도 0~50m: 석회암 (조개 유해 침전)</text>
        <text x="0" y="85" style="font-size:12px;font-weight:800;fill:#475569">심도 50~120m: 셰일 (호수·심해 진흙 압축)</text>
        <text x="0" y="145" style="font-size:12px;font-weight:800;fill:#ca8a04">심도 120~200m: 사암 (강어귀 모래 결착)</text>
        <text x="0" y="205" style="font-size:12px;font-weight:800;fill:#78350f">심도 200m+: 역암 (홍수 퇴적 둥근 자갈)</text>
      </g>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="366" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">원통형 코어를 채취해 퇴적 당시의 알갱이 크기와 퇴적 속도를 수직으로 정밀 복원해요</text>
      </g>`;
    } else if (c === 1) {
      body = `<g filter="url(#ex-shadow)">
      <rect x="60" y="85" width="520" height="75" rx="6" fill="#cbd5e1" stroke="#475569" stroke-width="1.5"/>
      <ellipse cx="200" cy="122" rx="22" ry="15" fill="#f8fafc" stroke="#334155" stroke-width="1.5"/>
      <text x="200" y="126" style="font-size:10px;font-weight:800;fill:#0f172a;text-anchor:middle">매머드 이</text>
      <text x="340" y="127" style="font-size:12px;font-weight:800;fill:#0f172a">신생대 지층 (약 6,600만 년 전 ~ 현재)</text>

      <rect x="60" y="165" width="520" height="75" rx="6" fill="#ca8a04" stroke="#854d0e" stroke-width="1.5"/>
      <g transform="translate(190, 202)">
        <circle cx="0" cy="0" r="18" fill="#fef08a" stroke="#78350f" stroke-width="1.5"/>
        <path d="M-10 0Q0 -12 10 0Q0 12 -10 0" stroke="#78350f" stroke-width="1.5" fill="none"/>
      </g>
      <text x="340" y="207" style="font-size:12px;font-weight:800;fill:#ffffff">중생대 지층: 암모나이트 화석 (따뜻한 바다)</text>

      <rect x="60" y="245" width="520" height="75" rx="6" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
      <g transform="translate(190, 282)">
        <ellipse cx="0" cy="0" rx="16" ry="22" fill="#451a03" stroke="#291102" stroke-width="1.5"/>
        <line x1="-12" y1="-5" x2="12" y2="-5" stroke="#a16207" stroke-width="1.5"/>
        <line x1="-12" y1="5" x2="12" y2="5" stroke="#a16207" stroke-width="1.5"/>
      </g>
      <text x="340" y="287" style="font-size:12px;font-weight:800;fill:#ffffff">고생대 지층: 삼엽충 화석 (원시 바다 환경)</text>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#0284c7"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">표준 화석: 지층이 퇴적된 지질 시대를 결정</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#ca8a04" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#ca8a04;text-anchor:middle">생존 기간 짧고 분포 면적 넓음</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">지층 속에 묻힌 화석을 분석하면 그 지층이 형성된 시대와 당시의 환경을 알 수 있어요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">표준 화석 vs 시상 화석의 비교 분석</text>
      <g transform="translate(60, 85)">
        <rect x="0" y="0" width="240" height="240" rx="10" fill="#f0f9ff" stroke="#38bdf8" stroke-width="2"/>
        <text x="120" y="30" style="font-size:13px;font-weight:800;fill:#0284c7;text-anchor:middle">표준 화석 (지질 시대 판단)</text>
        <circle cx="120" cy="110" r="45" fill="#bae6fd"/>
        <text x="120" y="115" style="font-size:11px;font-weight:800;fill:#0369a1;text-anchor:middle">삼엽충 · 공룡 · 매머드</text>
        <text x="120" y="180" style="font-size:11px;font-weight:700;fill:#334155;text-anchor:middle">생존 기간 짧음</text>
        <text x="120" y="205" style="font-size:11px;font-weight:700;fill:#334155;text-anchor:middle">분포 면적 전 지구적</text>
      </g>
      <g transform="translate(340, 85)">
        <rect x="0" y="0" width="240" height="240" rx="10" fill="#f0fdf4" stroke="#86efac" stroke-width="2"/>
        <text x="120" y="30" style="font-size:13px;font-weight:800;fill:#15803d;text-anchor:middle">시상 화석 (과거 환경 판단)</text>
        <circle cx="120" cy="110" r="45" fill="#bbf7d0"/>
        <text x="120" y="115" style="font-size:11px;font-weight:800;fill:#166534;text-anchor:middle">고사리 · 산호 · 조개</text>
        <text x="120" y="180" style="font-size:11px;font-weight:700;fill:#334155;text-anchor:middle">생존 기간 김</text>
        <text x="120" y="205" style="font-size:11px;font-weight:700;fill:#334155;text-anchor:middle">특정 환경(따뜻한 얕은 바다 등)</text>
      </g>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="373" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">화석의 종류에 따라 시대를 알려주는 표준 화석과 환경을 알려주는 시상 화석으로 나뉘어요</text>
      </g>`;
    } else {
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(45, 90)">
        <rect x="0" y="0" width="160" height="250" rx="10" fill="#fefce8" stroke="#ca8a04" stroke-width="2"/>
        <rect x="15" y="15" width="130" height="24" rx="5" fill="#ca8a04"/>
        <text x="80" y="31" style="font-size:12px;font-weight:800;fill:#ffffff;text-anchor:middle">1. 퇴적암 (Sedimentary)</text>
        <ellipse cx="80" cy="110" rx="55" ry="40" fill="#eab308" stroke="#a16207" stroke-width="2"/>
        <line x1="35" y1="105" x2="125" y2="105" stroke="#78350f" stroke-width="2"/>
        <line x1="40" y1="120" x2="120" y2="120" stroke="#78350f" stroke-width="2"/>
        <text x="80" y="175" style="font-size:11px;font-weight:800;fill:#854d0e;text-anchor:middle">층리 구조 · 알갱이</text>
        <text x="80" y="195" style="font-size:10px;fill:#475569;text-anchor:middle">화석 발견 가능</text>
        <text x="80" y="225" style="font-size:10px;font-weight:700;fill:#ca8a04;text-anchor:middle">예: 사암, 셰일, 석회암</text>
      </g>

      <g transform="translate(240, 90)">
        <rect x="0" y="0" width="160" height="250" rx="10" fill="#fff1f2" stroke="#e11d48" stroke-width="2"/>
        <rect x="15" y="15" width="130" height="24" rx="5" fill="#e11d48"/>
        <text x="80" y="31" style="font-size:12px;font-weight:800;fill:#ffffff;text-anchor:middle">2. 화성암 (Igneous)</text>
        <ellipse cx="80" cy="110" rx="55" ry="40" fill="#475569" stroke="#1e293b" stroke-width="2"/>
        ${[45, 75, 105, 60, 95].map(cx => `<circle cx="${cx}" cy="${95 + cx % 20}" r="3.5" fill="#cbd5e1"/>`).join('')}
        <text x="80" y="175" style="font-size:11px;font-weight:800;fill:#be123c;text-anchor:middle">마그마 냉각 결정</text>
        <text x="80" y="195" style="font-size:10px;fill:#475569;text-anchor:middle">화석 없음 (녹아 소멸)</text>
        <text x="80" y="225" style="font-size:10px;font-weight:700;fill:#e11d48;text-anchor:middle">예: 화강암, 현무암</text>
      </g>

      <g transform="translate(435, 90)">
        <rect x="0" y="0" width="160" height="250" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
        <rect x="15" y="15" width="130" height="24" rx="5" fill="#16a34a"/>
        <text x="80" y="31" style="font-size:12px;font-weight:800;fill:#ffffff;text-anchor:middle">3. 변성암 (Metamorphic)</text>
        <ellipse cx="80" cy="110" rx="55" ry="40" fill="#334155" stroke="#0f172a" stroke-width="2"/>
        <path d="M40 95Q80 115 120 95M35 115Q80 135 125 115" stroke="#94a3b8" stroke-width="3" fill="none"/>
        <text x="80" y="175" style="font-size:11px;font-weight:800;fill:#15803d;text-anchor:middle">엽리 구조 (줄무늬)</text>
        <text x="80" y="195" style="font-size:10px;fill:#475569;text-anchor:middle">고온·고압 변형</text>
        <text x="80" y="225" style="font-size:10px;font-weight:700;fill:#16a34a;text-anchor:middle">예: 편마암, 대리암</text>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#0284c7"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">3대 암석군 분류: 퇴적암, 화성암, 변성암</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#ca8a04" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#ca8a04;text-anchor:middle">형성 원인과 내부 구조 차이</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">알갱이가 쌓여 굳은 퇴적암, 마그마가 식은 화성암, 열과 압력으로 변한 변성암으로 구분해요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">암석의 순환(Rock Cycle) 다이어그램</text>
      <circle cx="320" cy="205" r="110" fill="none" stroke="#64748b" stroke-width="3" stroke-dasharray="8 6"/>
      <rect x="260" y="70" width="120" height="36" rx="8" fill="#ca8a04"/>
      <text x="320" y="93" style="font-size:12px;font-weight:800;fill:#ffffff;text-anchor:middle">퇴적암</text>
      <rect x="150" y="260" width="120" height="36" rx="8" fill="#e11d48"/>
      <text x="210" y="283" style="font-size:12px;font-weight:800;fill:#ffffff;text-anchor:middle">화성암</text>
      <rect x="370" y="260" width="120" height="36" rx="8" fill="#16a34a"/>
      <text x="430" y="283" style="font-size:12px;font-weight:800;fill:#ffffff;text-anchor:middle">변성암</text>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="373" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">지구 내부와 표면의 끊임없는 지각 변동을 통해 암석은 한 종류에 머물지 않고 순환해요</text>
      </g>`;
    }
    caption = c === 2 ? '암석은 생성 과정에 따라 알갱이가 쌓인 퇴적암, 마그마가 굳은 화성암, 열과 압력을 받은 변성암으로 분류해요.' : '지층은 아래에서부터 차례로 쌓이며, 지층 속 표준 화석을 통해 지질 시대를 추정해요.';
  }

  else if (kind === 'earth-interior') {
    controls = ['화산의 내부', '단층에서 생기는 지진', '판 경계의 움직임'];
    customSteps = ['단면 구조 관찰', '지각 변동 메커니즘'];

    if (c === 0) {
      body = `<g filter="url(#ex-shadow)">
      <path d="M40 340L240 160L285 110L355 110L400 160L600 340Z" fill="#78350f" stroke="#451a03" stroke-width="3"/>
      <path d="M120 340L260 210L380 210L520 340Z" fill="#a16207" opacity="0.8"/>
      
      <ellipse cx="320" cy="335" rx="110" ry="45" fill="#dc2626" stroke="#991b1b" stroke-width="3"/>
      <path d="M320 335V160L300 115" stroke="#dc2626" stroke-width="32" stroke-linecap="round"/>
      <path d="M320 335V160L300 115" stroke="#ea580c" stroke-width="18" stroke-linecap="round"/>
      <path d="M320 250L385 220" stroke="#ea580c" stroke-width="12" stroke-linecap="round"/>

      ${[0, 1, 2].map(i => {
        const by = 330 - ((phase + i * 0.33) % 1) * 200;
        return `<circle cx="316" cy="${by}" r="6.5" fill="#fef08a"/>`;
      }).join('')}

      <path d="M300 115C250 50 390 50 340 115Z" fill="#64748b" opacity="0.8"/>
      <path d="M340 115Q390 150 440 220" fill="none" stroke="#ea580c" stroke-width="8" stroke-linecap="round"/>

      <rect x="460" y="335" width="85" height="24" rx="5" fill="#fffffffa" stroke="#dc2626" stroke-width="1.5"/>
      <text x="502" y="351" style="font-size:11px;font-weight:800;fill:#dc2626;text-anchor:middle">마그마방 (~1200℃)</text>

      <rect x="180" y="210" width="65" height="24" rx="5" fill="#fffffffa" stroke="#ea580c" stroke-width="1.5"/>
      <text x="212" y="226" style="font-size:11px;font-weight:800;fill:#ea580c;text-anchor:middle">화도 (통로)</text>

      <rect x="420" y="110" width="85" height="24" rx="5" fill="#fffffffa" stroke="#dc2626" stroke-width="1.5"/>
      <text x="462" y="126" style="font-size:11px;font-weight:800;fill:#dc2626;text-anchor:middle">화구 및 용암류</text>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#dc2626" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#dc2626"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">화산 분출: 지하 마그마가 화도를 따라 상승·분출</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#ea580c" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#ea580c;text-anchor:middle">화산 쇄설물 + 화산 가스 + 용암</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#dc2626" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">땅속 깊은 곳에서 암석이 녹아 생긴 마그마가 압력에 의해 화도를 타고 지표로 뿜어져 나와요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">마그마 분출과 점성(Viscosity)에 따른 화산 형태 비교</text>
      <g transform="translate(60, 85)">
        <rect x="0" y="0" width="230" height="240" rx="10" fill="#fff1f2" stroke="#f43f5e" stroke-width="1.5"/>
        <text x="115" y="28" style="font-size:12px;font-weight:800;fill:#be123c;text-anchor:middle">종상 화산 (점성 큼 · 유문암질)</text>
        <path d="M40 200Q115 60 190 200Z" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
        <text x="115" y="225" style="font-size:11px;font-weight:700;fill:#be123c;text-anchor:middle">경사 급함 · 폭발적 분출</text>
      </g>
      <g transform="translate(350, 85)">
        <rect x="0" y="0" width="230" height="240" rx="10" fill="#f0f9ff" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="115" y="28" style="font-size:12px;font-weight:800;fill:#0369a1;text-anchor:middle">순상 화산 (점성 작음 · 현무암질)</text>
        <path d="M20 200Q115 140 210 200Z" fill="#475569" stroke="#1e293b" stroke-width="2"/>
        <text x="115" y="225" style="font-size:11px;font-weight:700;fill:#0369a1;text-anchor:middle">경사 완만 · 조용한 용암 분출</text>
      </g>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="373" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">마그마 속 규산(SiO2) 함량과 점성에 따라 폭발적인 산 모양이나 완만한 방패 모양 화산이 돼요</text>
      </g>`;
    } else {
      const isPlate = c === 2;
      const shift = Math.sin(phase * Math.PI * 2) * 12;

      body = `<g filter="url(#ex-shadow)">
      <path d="M60 140L260 90L310 160L130 220Z" fill="#ca8a04"/>
      <path d="M60 140L130 220V350L60 280Z" fill="#78350f"/>
      <path d="M130 220L310 160V290L130 350Z" fill="#a16207"/>
      
      <g transform="translate(${shift}, ${-shift})">
        <path d="M340 160L520 105L590 165L410 225Z" fill="#ca8a04"/>
        <path d="M340 160L410 225V355L340 290Z" fill="#78350f"/>
        <path d="M410 225L590 165V295L410 355Z" fill="#a16207"/>
      </g>

      <line x1="200" y1="285" x2="260" y2="245" stroke="#dc2626" stroke-width="4" marker-end="url(#ex-arrow-coral)"/>
      <line x1="480" y1="250" x2="420" y2="290" stroke="#dc2626" stroke-width="4" marker-end="url(#ex-arrow-coral)"/>

      <circle cx="325" cy="295" r="12" fill="#ef4444"/>
      <text x="325" y="299" style="font-size:10px;font-weight:800;fill:#ffffff;text-anchor:middle">진원</text>
      <circle cx="325" cy="295" r="${25 + ((phase * 40) % 40)}" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4 2"/>
      <circle cx="325" cy="295" r="${50 + ((phase * 40) % 40)}" fill="none" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="6 3"/>

      <circle cx="325" cy="180" r="6" fill="#dc2626"/>
      <rect x="300" y="145" width="50" height="22" rx="4" fill="#fffffffa" stroke="#dc2626"/>
      <text x="325" y="160" style="font-size:10px;font-weight:800;fill:#dc2626;text-anchor:middle">진앙</text>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#dc2626" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#dc2626"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">${isPlate ? '판 경계 운동: 수렴대에서의 충돌과 지각 변동' : '단층 지진: 지층이 끊어지며 탄성 에너지가 파동으로 방출'}</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">P파(종파) &amp; S파(횡파) 전파</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#dc2626" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">지층에 가해진 압축력이나 장력이 한계를 넘으면 지층이 어긋나며 거대한 지진파가 발생해요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">단층면 탄성 반발(Elastic Rebound) 및 지진파 전달 메커니즘</text>
      <g transform="translate(80, 85)">
        <rect x="0" y="0" width="440" height="240" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <line x1="40" y1="120" x2="400" y2="120" stroke="#94a3b8" stroke-width="3" stroke-dasharray="6 4"/>
        <line x1="220" y1="40" x2="220" y2="200" stroke="#dc2626" stroke-width="3"/>
        <circle cx="220" cy="120" r="16" fill="#ef4444"/>
        <text x="220" y="125" style="font-size:11px;font-weight:800;fill:#ffffff;text-anchor:middle">진원</text>
        <text x="120" y="80" style="font-size:12px;font-weight:800;fill:#1d4ed8">P파 (종파: 7~8 km/s 빠름)</text>
        <text x="120" y="165" style="font-size:12px;font-weight:800;fill:#ea580c">S파 (횡파: 3~4 km/s 큰 흔들림)</text>
      </g>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#dc2626" stroke-width="1.5"/>
      <text x="320" y="373" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">지반이 휘어지다 견디지 못하고 튕겨나가는 탄성 반발로 지진파가 발생해요</text>
      </g>`;
    }
    caption = c === 0 ? '화산은 지하의 마그마가 화도를 따라 지표로 분출하는 과정이에요.' : '단층과 판의 급격한 미끄러짐으로 축적된 에너지가 파동(지진)으로 전달돼요.';
  }

  else if (kind === 'weather-climate') {
    controls = ['낮 · 해풍', '밤 · 육풍', '짧은 기간 날씨 자료', '긴 기간 기후 자료'];
    customSteps = ['순환 메커니즘 관찰', '자료 비교 분석'];

    if (c < 2) {
      const isDay = c === 0;
      const sunMoon = isDay ? `<circle cx="100" cy="90" r="28" fill="#fde047" stroke="#ea580c" stroke-width="2"/>` : `<circle cx="100" cy="90" r="22" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>`;

      body = `<g filter="url(#ex-shadow)">
      <rect x="25" y="275" width="295" height="135" rx="8" fill="#0284c7" opacity="0.85"/>
      <text x="170" y="350" style="font-size:15px;font-weight:800;fill:#ffffff;text-anchor:middle">바다 (Sea)</text>
      <text x="170" y="375" style="font-size:11.5px;font-weight:700;fill:#e0f2fe;text-anchor:middle">${isDay ? '비열 큼 · 천천히 데워짐 (상대적 저온)' : '열 보존 · 천천히 식음 (상대적 고온)'}</text>

      <rect x="320" y="275" width="295" height="135" rx="8" fill="#78350f" opacity="0.85"/>
      <text x="470" y="350" style="font-size:15px;font-weight:800;fill:#ffffff;text-anchor:middle">육지 (Land)</text>
      <text x="470" y="375" style="font-size:11.5px;font-weight:700;fill:#fef08a;text-anchor:middle">${isDay ? '비열 작음 · 빠르게 가열됨 (상대적 고온)' : '빠르게 냉각됨 (상대적 저온)'}</text>

      ${sunMoon}

      ${isDay ? `
        <path d="M180 240H440" stroke="#0284c7" stroke-width="5" marker-end="url(#ex-arrow-cyan)"/>
        <text x="310" y="230" style="font-size:13px;font-weight:800;fill:#0284c7;text-anchor:middle">해풍 (바다 → 육지)</text>
        <path d="M470 230V130" stroke="#dc2626" stroke-width="4" marker-end="url(#ex-arrow-coral)"/>
        <text x="515" y="180" style="font-size:11px;font-weight:800;fill:#dc2626">상승 기류 (저기압)</text>
        <path d="M440 120H180" stroke="#64748b" stroke-width="3" stroke-dasharray="6 3"/>
        <path d="M160 130V230" stroke="#0284c7" stroke-width="4" marker-end="url(#ex-arrow-cyan)"/>
        <text x="110" y="180" style="font-size:11px;font-weight:800;fill:#0284c7">하강 기류 (고기압)</text>
      ` : `
        <path d="M440 240H180" stroke="#ca8a04" stroke-width="5" marker-end="url(#ex-arrow-amber)"/>
        <text x="310" y="230" style="font-size:13px;font-weight:800;fill:#ca8a04;text-anchor:middle">육풍 (육지 → 바다)</text>
        <path d="M160 230V130" stroke="#dc2626" stroke-width="4" marker-end="url(#ex-arrow-coral)"/>
        <text x="110" y="180" style="font-size:11px;font-weight:800;fill:#dc2626">상승 기류 (저기압)</text>
        <path d="M180 120H440" stroke="#64748b" stroke-width="3" stroke-dasharray="6 3"/>
        <path d="M470 130V230" stroke="#ca8a04" stroke-width="4" marker-end="url(#ex-arrow-amber)"/>
        <text x="515" y="180" style="font-size:11px;font-weight:800;fill:#ca8a04">하강 기류 (고기압)</text>
      `}

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="${isDay ? '#0284c7' : '#ca8a04'}" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="${isDay ? '#0284c7' : '#ca8a04'}"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">${isDay ? '낮의 해풍: 육지가 바다보다 빨리 데워져 바다에서 육지로 붊' : '밤의 육풍: 육지가 바다보다 빨리 식어 육지에서 바다로 붊'}</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">비열 차이에 의한 기압차 형성</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">모래(육지)와 물(바다)의 비열 차이로 인해 생기는 기온과 기압 차이가 바람을 일으켜요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">지표면 가열 차이와 등압선(Isobar) 기압 경도력 단면</text>
      <g transform="translate(80, 85)">
        <rect x="0" y="0" width="440" height="240" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <line x1="40" y1="70" x2="400" y2="70" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 2"/>
        <line x1="40" y1="130" x2="400" y2="130" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 2"/>
        <line x1="40" y1="190" x2="400" y2="190" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 2"/>
        <text x="60" y="65" style="font-size:10px;fill:#64748b">1008 hPa</text>
        <text x="60" y="125" style="font-size:10px;fill:#64748b">1012 hPa</text>
        <text x="60" y="185" style="font-size:10px;fill:#64748b">1016 hPa (고기압)</text>
        <path d="M120 180Q220 150 320 80" stroke="#0284c7" stroke-width="4" marker-end="url(#ex-arrow-cyan)"/>
        <text x="260" y="145" style="font-size:12px;font-weight:800;fill:#0284c7">기압 경도력 바람</text>
      </g>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="373" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">공기는 항상 기압이 높은 곳(고기압)에서 낮은 곳(저기압)으로 힘을 받아 이동해요</text>
      </g>`;
    } else {
      const isShort = c === 2;
      const data = isShort ? [180, 230, 160, 250, 190, 240, 200] : [240, 230, 215, 200, 185, 170, 160];

      body = `<g filter="url(#ex-shadow)">
      <rect x="60" y="80" width="520" height="270" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <line x1="110" y1="310" x2="550" y2="310" stroke="#334155" stroke-width="2"/>
      <line x1="110" y1="310" x2="110" y2="100" stroke="#334155" stroke-width="2"/>
      
      <path d="${data.map((y, i) => (i ? 'L' : 'M') + (150 + i * 60) + ' ' + y).join('')}" fill="none" stroke="${isShort ? '#ea580c' : '#dc2626'}" stroke-width="3.5"/>
      ${data.map((y, i) => `<circle cx="${150 + i * 60}" cy="${y}" r="5.5" fill="${isShort ? '#ea580c' : '#dc2626'}"/>`).join('')}

      <text x="90" y="110" style="font-size:11px;font-weight:800;fill:#334155">기온 (℃)</text>
      <text x="540" y="330" style="font-size:11px;font-weight:800;fill:#334155">${isShort ? '일자' : '연도 (30년)'}</text>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="${isShort ? '#ea580c' : '#dc2626'}" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="${isShort ? '#ea580c' : '#dc2626'}"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">${isShort ? '날씨 자료: 매일 매일의 불규칙한 단기 대기 상태' : '기후 자료: 30년 이상의 장기간 종합 평균 대기 추세'}</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">${isShort ? '일별 변동 폭 큼' : '장기 평년값 및 온난화 추세'}</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">날씨는 시시각각 변하는 짧은 상태이고, 기후는 수십 년간 축적된 규칙적인 평균 상태예요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">기후 평년값(Climate Normal) 산출 기준 분석</text>
      <rect x="80" y="85" width="440" height="240" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="300" y="125" style="font-size:13px;font-weight:800;fill:#0f172a;text-anchor:middle">세계기상기구(WMO) 30년 표준 기간</text>
      <text x="300" y="165" style="font-size:12px;fill:#334155;text-anchor:middle">1991년 ~ 2020년 30년 평균치 산정</text>
      <text x="300" y="205" style="font-size:12px;font-weight:700;fill:#dc2626;text-anchor:middle">최근 10년간 기온 상승 편차 +0.8℃ 관측</text>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="373" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">충분히 긴 30년 자료를 누적해야 계절적 특성과 기후 변화 추세를 과학적으로 증명할 수 있어요</text>
      </g>`;
    }
    caption = c === 0 ? '낮에는 육지가 빨리 데워져 상승 기류가 생기므로 바다에서 육지로 해풍이 불어요.' : c === 1 ? '밤에는 육지가 빨리 식어 바다 쪽이 따뜻하므로 육지에서 바다로 육풍이 불어요.' : c === 2 ? '날씨는 날마다 변하는 단기 상태예요.' : '기후는 최소 30년 이상의 오랜 기간 관측한 종합적인 평균 상태를 말해요.';
  }

  else if (kind === 'moon-seasons') {
    controls = ['달의 위치와 모양', '기울어진 자전축과 계절', '높은 태양 · 짧은 그림자', '낮은 태양 · 긴 그림자'];
    customSteps = ['천체 운동 관찰', '위상 및 그림자 분석'];

    if (c === 0) {
      const a = phase * Math.PI * 2;
      const mx = 320 + 155 * Math.cos(a);
      const my = 205 + 75 * Math.sin(a);
      const k = Math.cos(a);
      const rx = Math.max(0.1, Math.abs(k) * 28);
      const phaseShape = `<g transform="translate(520 355) scale(${Math.sin(a) >= 0 ? 1 : -1} 1)">
        <path d="M0 -28A28 28 0 0 1 0 28A${rx} 28 0 0 ${k >= 0 ? 1 : 0} 0 -28Z" fill="#fef08a"/>
      </g>`;

      body = `<g filter="url(#ex-shadow)">
      ${[130, 175, 220, 265].map(sy => `
        <line x1="25" y1="${sy}" x2="150" y2="${sy}" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6 3" marker-end="url(#ex-arrow-amber)"/>
      `).join('')}
      <text x="50" y="205" style="font-size:12px;font-weight:800;fill:#d97706;text-anchor:middle">햇빛 (Sunlight)</text>

      <ellipse cx="320" cy="205" rx="155" ry="75" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>

      <circle cx="320" cy="205" r="42" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
      <path d="M305 190Q325 175 345 200Q330 225 315 210Z" fill="#22c55e"/>
      <text x="320" y="240" style="font-size:11px;font-weight:800;fill:#ffffff;text-anchor:middle">지구</text>

      <circle cx="${mx}" cy="${my}" r="22" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
      <path d="M${mx} ${my - 22}A22 22 0 0 0 ${mx} ${my + 22}Z" fill="#fef08a"/>

      <rect x="420" y="280" width="200" height="130" rx="12" fill="#0f172a" stroke="#475569" stroke-width="2"/>
      <text x="520" y="305" style="font-size:11px;font-weight:800;fill:#86efac;text-anchor:middle">지구에서 본 달의 모양</text>
      <circle cx="520" cy="355" r="28" fill="#1e293b"/>
      ${phaseShape}

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#0284c7"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">달의 위상: 달의 공전에 따른 관측 각도 변화</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#ca8a04" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#ca8a04;text-anchor:middle">삭 → 상현 → 망(보름) → 하현</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">달은 항상 햇빛을 받는 반쪽이 밝지만, 달이 지구를 공전함에 따라 보이는 모양이 달라져요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">달의 공전 각도(0°~360°)와 지구 관측 위상 기하학</text>
      <circle cx="320" cy="205" r="100" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 3"/>
      <circle cx="320" cy="205" r="24" fill="#0284c7"/>
      ${[0, 90, 180, 270].map(deg => {
        const rad = deg * Math.PI / 180;
        const px = 320 + 100 * Math.cos(rad);
        const py = 205 + 100 * Math.sin(rad);
        return `<circle cx="${px}" cy="${py}" r="14" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>`;
      }).join('')}
      <text x="320" y="90" style="font-size:11px;font-weight:800;fill:#0f172a;text-anchor:middle">하현달 (270°)</text>
      <text x="320" y="335" style="font-size:11px;font-weight:800;fill:#0f172a;text-anchor:middle">상현달 (90°)</text>
      <text x="445" y="210" style="font-size:11px;font-weight:800;fill:#0f172a">보름달 (180°)</text>
      <text x="195" y="210" style="font-size:11px;font-weight:800;fill:#0f172a">삭 (0°)</text>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="373" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">달이 지구 그림자에 가려지는 월식이 아닌, 햇빛을 받는 면을 보는 각도 차이로 위상이 변해요</text>
      </g>`;
    } else if (c === 1) {
      const ex = 320 + 190 * Math.cos(phase * Math.PI * 2);
      const ey = 205 + 70 * Math.sin(phase * Math.PI * 2);

      body = `<g filter="url(#ex-shadow)">
      <ellipse cx="320" cy="205" rx="190" ry="70" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
      <circle cx="320" cy="205" r="38" fill="#f59e0b" stroke="#ea580c" stroke-width="2"/>
      <text x="320" y="210" style="font-size:12px;font-weight:800;fill:#ffffff;text-anchor:middle">태양</text>

      <g transform="translate(${ex}, ${ey})">
        <circle cx="0" cy="0" r="38" fill="#0284c7"/>
        <line x1="-20" y1="-55" x2="20" y2="55" stroke="#dc2626" stroke-width="3"/>
        <text x="25" y="-45" style="font-size:10px;font-weight:800;fill:#dc2626">23.5°</text>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#0284c7"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">계절의 변화: 자전축이 23.5° 기울어진 채 공전</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#dc2626" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#dc2626;text-anchor:middle">남중 고도와 낮의 길이 변화</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">지구 자전축이 기울어져 공전하기 때문에 반구별로 태양의 남중 고도와 낮 길이가 달라져요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">하지(여름) vs 동지(겨울)의 태양 입사광선 단면</text>
      <g transform="translate(60, 85)">
        <rect x="0" y="0" width="230" height="240" rx="10" fill="#fefce8" stroke="#ca8a04" stroke-width="1.5"/>
        <text x="115" y="28" style="font-size:12px;font-weight:800;fill:#ca8a04;text-anchor:middle">하지: 북반구 태양 직사 (고온)</text>
        <circle cx="115" cy="120" r="55" fill="#0284c7"/>
        <line x1="85" y1="45" x2="145" y2="195" stroke="#dc2626" stroke-width="3"/>
        <path d="M0 100H60M0 130H60" stroke="#f59e0b" stroke-width="3"/>
      </g>
      <g transform="translate(350, 85)">
        <rect x="0" y="0" width="230" height="240" rx="10" fill="#f0f9ff" stroke="#0284c7" stroke-width="1.5"/>
        <text x="115" y="28" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">동지: 북반구 비스듬한 입사 (저온)</text>
        <circle cx="115" cy="120" r="55" fill="#0284c7"/>
        <line x1="85" y1="45" x2="145" y2="195" stroke="#dc2626" stroke-width="3"/>
        <path d="M170 100H230M170 130H230" stroke="#f59e0b" stroke-width="3"/>
      </g>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="373" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">태양과의 거리 차이가 아니라, 자전축 기울기에 의한 일사각과 낮 길이 차이가 계절을 만들어요</text>
      </g>`;
    } else {
      const isHigh = c === 2;
      const sunY = isHigh ? 75 : 160;
      const sunX = 140;
      const poleX = 320;
      const poleH = 90;
      const shadowLen = isHigh ? 45 : 165;

      body = `<g filter="url(#ex-shadow)">
      <line x1="50" y1="300" x2="590" y2="300" stroke="#78350f" stroke-width="4"/>

      <circle cx="${sunX}" cy="${sunY}" r="32" fill="#f59e0b" stroke="#ea580c" stroke-width="2"/>
      <text x="${sunX}" y="${sunY + 5}" style="font-size:11px;font-weight:800;fill:#ffffff;text-anchor:middle">태양 (${isHigh ? '76.5°' : '29.5°'})</text>

      <rect x="${poleX - 5}" y="${300 - poleH}" width="10" height="${poleH}" rx="2" fill="#1e293b"/>
      <text x="${poleX}" y="${280 - poleH}" style="font-size:11px;font-weight:800;fill:#0f172a;text-anchor:middle">수직 막대</text>

      <line x1="${sunX}" y1="${sunY}" x2="${poleX + shadowLen}" y2="300" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6 3"/>

      <line x1="${poleX}" y1="302" x2="${poleX + shadowLen}" y2="302" stroke="#475569" stroke-width="10" stroke-linecap="round"/>
      <text x="${poleX + shadowLen / 2}" y="325" style="font-size:12px;font-weight:800;fill:#dc2626;text-anchor:middle">그림자 길이: ${isHigh ? '짧음 (약 25cm)' : '김 (약 175cm)'}</text>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="${isHigh ? '#ea580c' : '#0284c7'}" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="${isHigh ? '#ea580c' : '#0284c7'}"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">${isHigh ? '여름철 높은 고도(76.5°): 그림자가 짧고 일사량 집중' : '겨울철 낮은 고도(29.5°): 그림자가 길고 일사량 분산'}</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="${isHigh ? '#ea580c' : '#0284c7'}" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:${isHigh ? '#ea580c' : '#0284c7'};text-anchor:middle">태양 고도 ↔ 그림자 반비례</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">태양 고도가 높을수록 지표면에 도달하는 빛의 면적이 좁아져 단위 면적당 에너지가 커져요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">태양광선 입사각과 단위 면적당 도달 에너지 기하학적 분석</text>
      <g transform="translate(60, 85)">
        <rect x="0" y="0" width="230" height="240" rx="10" fill="#fefce8" stroke="#fde047" stroke-width="2"/>
        <text x="115" y="28" style="font-size:12px;font-weight:800;fill:#ca8a04;text-anchor:middle">여름 (높은 남중 고도)</text>
        <line x1="30" y1="70" x2="115" y2="180" stroke="#ea580c" stroke-width="4"/>
        <line x1="200" y1="70" x2="145" y2="180" stroke="#ea580c" stroke-width="4"/>
        <rect x="115" y="180" width="30" height="8" rx="2" fill="#ea580c"/>
        <text x="115" y="210" style="font-size:11px;font-weight:800;fill:#ea580c;text-anchor:middle">면적 좁음 → 에너지 집중(고온)</text>
      </g>
      <g transform="translate(350, 85)">
        <rect x="0" y="0" width="230" height="240" rx="10" fill="#f0f9ff" stroke="#38bdf8" stroke-width="2"/>
        <text x="115" y="28" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">겨울 (낮은 남중 고도)</text>
        <line x1="10" y1="90" x2="80" y2="180" stroke="#38bdf8" stroke-width="4"/>
        <line x1="140" y1="90" x2="190" y2="180" stroke="#38bdf8" stroke-width="4"/>
        <rect x="80" y="180" width="110" height="8" rx="2" fill="#0284c7"/>
        <text x="115" y="210" style="font-size:11px;font-weight:800;fill:#0284c7;text-anchor:middle">면적 넓음 → 에너지 분산(저온)</text>
      </g>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="373" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">태양 고도가 높을수록 같은 양의 빛이 좁은 면적에 집중되어 온도가 빠르게 올라가요</text>
      </g>`;
    }
    caption = c === 0 ? '달은 스스로 빛을 내지 않고 햇빛을 반사하며, 공전함에 따라 지구에서 보이는 밝은 부분의 모양이 달라져요.' : c === 1 ? '자전축이 기울어진 채 공전하므로 태양의 남중 고도와 낮의 길이가 계절마다 달라져요.' : c === 2 ? '태양 고도가 높으면 그림자가 짧아지고 기온이 높아져요.' : '태양 고도가 낮으면 그림자가 길어지고 기온이 낮아져요.';
  }

  else if (kind === 'fair-test') {
    controls = ['한 조건만 달리 비교', '여러 조건을 함께 변경', '같은 조건으로 반복 측정'];
    customSteps = ['실험 설계 비교', '탐구 타당도 분석'];

    if (c === 0) {
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(100, 100)">
        <rect x="0" y="0" width="180" height="230" rx="12" fill="#f0fdf4" stroke="#16a34a" stroke-width="2.5"/>
        <text x="90" y="30" style="font-size:13px;font-weight:800;fill:#15803d;text-anchor:middle">실험군 A (물 100 mL)</text>
        <rect x="50" y="120" width="80" height="65" rx="6" fill="#38bdf8" opacity="0.8"/>
        <rect x="30" y="195" width="120" height="18" rx="4" fill="#1e293b"/>
        <text x="90" y="155" style="font-size:11px;font-weight:800;fill:#ffffff;text-anchor:middle">100 mL</text>
        <text x="90" y="208" style="font-size:10px;font-weight:800;fill:#fde047;text-anchor:middle">500W 가열기</text>
      </g>

      <g transform="translate(360, 100)">
        <rect x="0" y="0" width="180" height="230" rx="12" fill="#f0fdf4" stroke="#16a34a" stroke-width="2.5"/>
        <text x="90" y="30" style="font-size:13px;font-weight:800;fill:#15803d;text-anchor:middle">실험군 B (물 200 mL)</text>
        <rect x="50" y="85" width="80" height="100" rx="6" fill="#38bdf8" opacity="0.8"/>
        <rect x="30" y="195" width="120" height="18" rx="4" fill="#1e293b"/>
        <text x="90" y="135" style="font-size:11px;font-weight:800;fill:#ffffff;text-anchor:middle">200 mL</text>
        <text x="90" y="208" style="font-size:10px;font-weight:800;fill:#fde047;text-anchor:middle">500W 가열기</text>
      </g>

      <rect x="250" y="180" width="140" height="42" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="320" y="200" style="font-size:12px;font-weight:800;fill:#15803d;text-anchor:middle">✓ 통제 변인 일치</text>
      <text x="320" y="214" style="font-size:10px;fill:#166534;text-anchor:middle">가열기·용기·초기온도 동일</text>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#16a34a"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">공정한 탐구: 물의 양(조작 변인)만 1개 달리 비교</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#16a34a" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#16a34a;text-anchor:middle">변인 통제 적합 (타당도 높음)</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">원인을 확인하려면 오직 한 가지 조건(조작 변인)만 다르게 하고 나머지는 엄격히 같게 해야 해요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">과학 탐구의 변인 통제 매트릭스 (Variable Matrix)</text>
      <g transform="translate(60, 85)">
        <rect x="0" y="0" width="520" height="240" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <rect x="0" y="0" width="520" height="38" rx="12" fill="#0f172a"/>
        <text x="100" y="24" style="font-size:11px;font-weight:800;fill:#ffffff;text-anchor:middle">변인 종류</text>
        <text x="260" y="24" style="font-size:11px;font-weight:800;fill:#ffffff;text-anchor:middle">실험 조건 설정</text>
        <text x="430" y="24" style="font-size:11px;font-weight:800;fill:#ffffff;text-anchor:middle">역할과 목적</text>
        <line x1="0" y1="90" x2="520" y2="90" stroke="#f1f5f9" stroke-width="2"/>
        <text x="100" y="65" style="font-size:11px;font-weight:800;fill:#dc2626;text-anchor:middle">조작 변인</text>
        <text x="260" y="65" style="font-size:11px;font-weight:700;fill:#334155;text-anchor:middle">물의 양만 1개 변경 (100 vs 200mL)</text>
        <text x="430" y="65" style="font-size:11px;font-weight:700;fill:#dc2626;text-anchor:middle">원인 가설 검증</text>
        <line x1="0" y1="150" x2="520" y2="150" stroke="#f1f5f9" stroke-width="2"/>
        <text x="100" y="125" style="font-size:11px;font-weight:800;fill:#16a34a;text-anchor:middle">통제 변인</text>
        <text x="260" y="125" style="font-size:11px;font-weight:700;fill:#334155;text-anchor:middle">가열기(500W), 비커, 초기온도 엄격 통제</text>
        <text x="430" y="125" style="font-size:11px;font-weight:700;fill:#16a34a;text-anchor:middle">오차 및 혼란 방지</text>
        <text x="100" y="185" style="font-size:11px;font-weight:800;fill:#0284c7;text-anchor:middle">종속 변인</text>
        <text x="260" y="185" style="font-size:11px;font-weight:700;fill:#334155;text-anchor:middle">시간 경과에 따른 최종 물의 온도 측정</text>
        <text x="430" y="185" style="font-size:11px;font-weight:700;fill:#0284c7;text-anchor:middle">결과 데이터 획득</text>
      </g>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="373" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">독립 변인(조작·통제)과 종속 변인을 명확히 분리해야 타당한 결론을 이끌어낼 수 있어요</text>
      </g>`;
    } else if (c === 1) {
      body = `<g filter="url(#ex-shadow)">
      <g transform="translate(100, 100)">
        <rect x="0" y="0" width="180" height="230" rx="12" fill="#fff1f2" stroke="#f43f5e" stroke-width="2.5"/>
        <text x="90" y="30" style="font-size:13px;font-weight:800;fill:#e11d48;text-anchor:middle">조건 A (물 100 mL)</text>
        <rect x="50" y="120" width="80" height="65" rx="6" fill="#38bdf8" opacity="0.8"/>
        <rect x="30" y="195" width="120" height="18" rx="4" fill="#1e293b"/>
        <text x="90" y="155" style="font-size:11px;font-weight:800;fill:#ffffff;text-anchor:middle">유리 비커</text>
        <text x="90" y="208" style="font-size:10px;font-weight:800;fill:#fde047;text-anchor:middle">500W 가열기</text>
      </g>

      <g transform="translate(360, 100)">
        <rect x="0" y="0" width="180" height="230" rx="12" fill="#fff1f2" stroke="#f43f5e" stroke-width="2.5"/>
        <text x="90" y="30" style="font-size:13px;font-weight:800;fill:#e11d48;text-anchor:middle">조건 B (식용유 200 mL)</text>
        <rect x="50" y="85" width="80" height="100" rx="6" fill="#fde047" opacity="0.8"/>
        <rect x="30" y="195" width="120" height="18" rx="4" fill="#dc2626"/>
        <text x="90" y="135" style="font-size:11px;font-weight:800;fill:#ffffff;text-anchor:middle">금속 냄비</text>
        <text x="90" y="208" style="font-size:10px;font-weight:800;fill:#ffffff;text-anchor:middle">1000W 버너</text>
      </g>

      <rect x="240" y="180" width="160" height="42" rx="8" fill="#ffe4e6" stroke="#f43f5e" stroke-width="2"/>
      <text x="320" y="200" style="font-size:12px;font-weight:800;fill:#e11d48;text-anchor:middle">✗ 변인 통제 실패</text>
      <text x="320" y="214" style="font-size:9.5px;fill:#be123c;text-anchor:middle">물질·용기·가열기 동시 변경</text>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#e11d48" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#e11d48"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">통제 실패: 여러 변인이 함께 바뀌어 원인 규명 불가</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#e11d48" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#e11d48;text-anchor:middle">실험 결론 무효 (오류 발생)</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#e11d48" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">물의 양과 가열기를 동시에 바꾸면 온도 변화가 물 때문인지 불꽃 때문인지 알 수 없어요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">혼란 변수(Confounding Variable) 제거 가이드</text>
      <rect x="80" y="85" width="440" height="240" rx="12" fill="#fff1f2" stroke="#f43f5e" stroke-width="1.5"/>
      <text x="300" y="125" style="font-size:13px;font-weight:800;fill:#be123c;text-anchor:middle">혼란 변수 발생 시 문제점</text>
      <text x="300" y="165" style="font-size:12px;fill:#475569;text-anchor:middle">온도 상승의 원인이 물질(물/기름)인지, 버너 화력인지 불분명</text>
      <text x="300" y="205" style="font-size:12px;font-weight:800;fill:#15803d;text-anchor:middle">해결책: 오직 1개 조건만 바꾸고 나머지는 완벽히 고정</text>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#dc2626" stroke-width="1.5"/>
      <text x="320" y="373" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">공정한 실험을 위해서는 바꾸지 말아야 할 조건을 꼼꼼히 찾아 모두 같게 통제해야 해요</text>
      </g>`;
    } else {
      body = `<g filter="url(#ex-shadow)">
      <rect x="60" y="80" width="520" height="270" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="320" y="115" style="font-size:14px;font-weight:800;fill:#1e293b;text-anchor:middle">3회 반복 측정 시 데이터 신뢰성 확보</text>
      
      ${[
        { name: '1차 측정', val: 78, y: 155 },
        { name: '2차 측정', val: 80, y: 205 },
        { name: '3차 측정', val: 79, y: 255 }
      ].map(tr => `
        <text x="120" y="${tr.y + 16}" style="font-size:12px;font-weight:800;fill:#334155">${tr.name}</text>
        <rect x="200" y="${tr.y}" width="${tr.val * 3.5}" height="24" rx="4" fill="#0284c7"/>
        <text x="${210 + tr.val * 3.5}" y="${tr.y + 17}" style="font-size:12px;font-weight:800;fill:#0284c7">${tr.val} ℃</text>
      `).join('')}

      <line x1="200" y1="140" x2="200" y2="295" stroke="#94a3b8" stroke-width="2"/>
      <text x="320" y="325" style="font-size:12px;font-weight:800;fill:#15803d;text-anchor:middle">평균값: 79.0 ℃ (오차 범위 ±1.0 ℃ 신뢰도 높음)</text>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#15803d" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#15803d"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">반복 측정: 우연한 측정 오차를 줄이고 신뢰도 향상</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">데이터 재현성 검증 완료</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">단 한 번의 측정으로는 우연한 실수를 걸러낼 수 없으므로 여러 번 반복 측정해 평균을 구해요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#faf8f2" stroke="#d5cebc" stroke-width="1.5"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#1e293b;text-anchor:middle">오차 막대(Error Bar)와 통계적 신뢰도 분석</text>
      <rect x="80" y="85" width="440" height="240" rx="12" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5"/>
      <line x1="200" y1="200" x2="400" y2="200" stroke="#334155" stroke-width="2"/>
      <line x1="300" y1="120" x2="300" y2="280" stroke="#dc2626" stroke-width="3"/>
      <line x1="285" y1="120" x2="315" y2="120" stroke="#dc2626" stroke-width="3"/>
      <line x1="285" y1="280" x2="315" y2="280" stroke="#dc2626" stroke-width="3"/>
      <circle cx="300" cy="200" r="6" fill="#15803d"/>
      <text x="300" y="105" style="font-size:11px;font-weight:800;fill:#dc2626;text-anchor:middle">최댓값 (80℃)</text>
      <text x="300" y="300" style="font-size:11px;font-weight:800;fill:#dc2626;text-anchor:middle">최솟값 (78℃)</text>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
      <text x="320" y="373" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">반복 측정을 통해 오차 범위를 좁히고 신뢰할 수 있는 평균값을 도출해요</text>
      </g>`;
    }
    caption = c === 0 ? '알아보고자 하는 하나의 조건만 달리하고 다른 조건은 모두 같게 통제해야 공정한 실험이에요.' : c === 1 ? '여러 조건을 한꺼번에 바꾸면 어떤 원인 때문에 결과가 나타났는지 알 수 없어요.' : '실험 결과를 신뢰하려면 같은 방법으로 여러 번 반복 측정하여 재현성을 확인해야 해요.';
  }

  else if (kind === 'star-sky') {
    controls = ['같은 밤 · 시간 경과', '다른 계절의 관찰', '도시 불빛이 강한 조건'];
    customSteps = ['성도 관찰', '일주 및 연주 운동 분석'];

    const bigDipper = [
      [220, 95], [245, 125], [290, 130], [335, 115], [370, 145], [405, 160], [425, 190]
    ];

    if (c === 0) {
      const rot = (phase * 120);

      body = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#0b132b"/>
      ${Array.from({ length: 70 }, (_, i) => `<circle cx="${35 + (i * 89) % 570}" cy="${40 + (i * 47) % 250}" r="${1 + (i % 3) * 0.5}" fill="#ffffff" opacity="${0.4 + (i % 5) * 0.15}"/>`).join('')}

      <circle cx="320" cy="130" r="6" fill="#fde047" stroke="#ffffff" stroke-width="2"/>
      <text x="320" y="112" style="font-size:12px;font-weight:800;fill:#fde047;text-anchor:middle">북극성 (Polaris)</text>

      <circle cx="320" cy="130" r="95" fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="6 4" opacity="0.6"/>
      <circle cx="320" cy="130" r="150" fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="6 4" opacity="0.6"/>

      <g transform="rotate(${rot} 320 130)">
        <path d="${bigDipper.map(([x, y], i) => (i ? 'L' : 'M') + x + ' ' + y).join('')}" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
        ${bigDipper.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="#ffffff" stroke="#0284c7" stroke-width="1.5"/>`).join('')}
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#0284c7"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">별의 일주 운동: 북극성 중심 반시계방향 15°/시간 회전</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">지구 자전 (서→동)의 겉보기 운동</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">지구가 서쪽에서 동쪽으로 자전하기 때문에 밤하늘의 별들은 동쪽에서 서쪽으로 회전해요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#0b132b"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#38bdf8;text-anchor:middle">천구 좌표계와 북극성 회전축 분석도</text>
      <circle cx="320" cy="210" r="120" fill="none" stroke="#38bdf8" stroke-width="2"/>
      <line x1="320" y1="70" x2="320" y2="350" stroke="#fde047" stroke-width="2.5" stroke-dasharray="5 3"/>
      <circle cx="320" cy="90" r="7" fill="#fde047"/>
      <text x="320" y="78" style="font-size:12px;font-weight:800;fill:#fde047;text-anchor:middle">천구의 북극 (북극성)</text>
      <ellipse cx="320" cy="210" rx="120" ry="35" fill="none" stroke="#64748b" stroke-width="1.5"/>
      <text x="320" y="215" style="font-size:11px;font-weight:700;fill:#94a3b8;text-anchor:middle">천구 적도면</text>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="373" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">지구 자전축을 북쪽으로 연장한 곳에 북극성이 있어, 북극성은 밤새 위치가 변하지 않아요</text>
      </g>`;
    } else if (c === 1) {
      body = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#0b132b"/>
      
      <g transform="translate(60, 85)">
        <rect x="0" y="0" width="230" height="120" rx="10" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="115" y="25" style="font-size:12px;font-weight:800;fill:#38bdf8;text-anchor:middle">봄철: 사자자리 · 목동자리</text>
        <circle cx="70" cy="65" r="4" fill="#fff"/><circle cx="110" cy="80" r="4" fill="#fff"/><circle cx="150" cy="55" r="4" fill="#fff"/>
        <path d="M70 65L110 80L150 55" stroke="#38bdf8" stroke-width="1.5"/>
      </g>

      <g transform="translate(350, 85)">
        <rect x="0" y="0" width="230" height="120" rx="10" fill="#1e293b" stroke="#fde047" stroke-width="1.5"/>
        <text x="115" y="25" style="font-size:12px;font-weight:800;fill:#fde047;text-anchor:middle">여름철: 백조자리 (데네브·베가·알타이르)</text>
        <circle cx="115" cy="50" r="4" fill="#fff"/><circle cx="70" cy="95" r="4" fill="#fff"/><circle cx="160" cy="95" r="4" fill="#fff"/>
        <path d="M115 50L70 95L160 95Z" stroke="#fde047" stroke-width="1.5" fill="none"/>
      </g>

      <g transform="translate(60, 230)">
        <rect x="0" y="0" width="230" height="120" rx="10" fill="#1e293b" stroke="#ca8a04" stroke-width="1.5"/>
        <text x="115" y="25" style="font-size:12px;font-weight:800;fill:#ca8a04;text-anchor:middle">가을철: 페가수스자리 (가을철 사각형)</text>
        <rect x="75" y="45" width="80" height="55" rx="2" fill="none" stroke="#ca8a04" stroke-width="1.5"/>
      </g>

      <g transform="translate(350, 230)">
        <rect x="0" y="0" width="230" height="120" rx="10" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
        <text x="115" y="25" style="font-size:12px;font-weight:800;fill:#f43f5e;text-anchor:middle">겨울철: 오리온자리 (베텔게우스·리겔)</text>
        <circle cx="85" cy="50" r="4" fill="#f43f5e"/><circle cx="145" cy="100" r="4" fill="#38bdf8"/>
        <line x1="95" y1="75" x2="135" y2="75" stroke="#ffffff" stroke-width="2"/>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#0284c7"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">계절별 별자리: 지구 공전에 따라 밤에 향하는 우주가 바뀜</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#0284c7;text-anchor:middle">지구 공전 (하루 약 1° 이동)</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">지구가 태양 주위를 공전하기 때문에 계절마다 밤에 태양 반대편에 보이는 별자리가 달라져요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#0b132b"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#38bdf8;text-anchor:middle">지구 공전 궤도와 계절별 밤하늘 방향</text>
      <circle cx="320" cy="205" r="95" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
      <circle cx="320" cy="205" r="28" fill="#f59e0b"/>
      <circle cx="320" cy="110" r="14" fill="#0284c7"/>
      <text x="320" y="100" style="font-size:11px;font-weight:800;fill:#ffffff;text-anchor:middle">여름</text>
      <circle cx="320" cy="300" r="14" fill="#0284c7"/>
      <text x="320" y="325" style="font-size:11px;font-weight:800;fill:#ffffff;text-anchor:middle">겨울</text>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="373" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">공전 궤도 상의 위치에 따라 밤(태양 반대쪽)에 바라보는 우주 공간이 달라져요</text>
      </g>`;
    } else {
      body = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#0b132b"/>
      
      <g transform="translate(40, 85)">
        <rect x="0" y="0" width="260" height="270" rx="12" fill="#070d1e" stroke="#38bdf8" stroke-width="2"/>
        <text x="130" y="28" style="font-size:13px;font-weight:800;fill:#38bdf8;text-anchor:middle">청정 시골 밤하늘 (은하수 관찰)</text>
        ${Array.from({ length: 65 }, (_, i) => `<circle cx="${15 + (i * 37) % 230}" cy="${40 + (i * 29) % 200}" r="${0.8 + (i % 3) * 0.6}" fill="#ffffff" opacity="${0.4 + (i % 4) * 0.2}"/>`).join('')}
        <path d="M40 240Q130 140 220 50" stroke="#bae6fd" stroke-width="18" opacity="0.25"/>
        <text x="130" y="245" style="font-size:11px;font-weight:800;fill:#86efac;text-anchor:middle">수천 개의 별과 은하수 뚜렷함</text>
      </g>

      <g transform="translate(340, 85)">
        <rect x="0" y="0" width="260" height="270" rx="12" fill="#2d3748" stroke="#ca8a04" stroke-width="2"/>
        <ellipse cx="130" cy="270" rx="120" ry="85" fill="#fde047" opacity="0.35"/>
        <text x="130" y="28" style="font-size:13px;font-weight:800;fill:#fde047;text-anchor:middle">도시 밤하늘 (광공해)</text>
        <circle cx="70" cy="90" r="3.5" fill="#ffffff"/>
        <circle cx="190" cy="140" r="3.5" fill="#ffffff"/>
        <text x="130" y="245" style="font-size:11px;font-weight:800;fill:#fca5a5;text-anchor:middle">밝은 1~2등성만 겨우 보임</text>
      </g>

      <rect x="25" y="24" width="370" height="34" rx="8" fill="#ffffffea" stroke="#0284c7" stroke-width="1.5"/>
      <circle cx="42" cy="41" r="5" fill="#0284c7"/>
      <text x="56" y="46" style="font-size:12px;font-weight:800;fill:#0f172a">광공해: 도시의 인공조명이 희미한 별빛을 가림</text>

      <rect x="420" y="24" width="195" height="34" rx="8" fill="#ffffffea" stroke="#ca8a04" stroke-width="1.5"/>
      <text x="517" y="46" style="font-size:12px;font-weight:800;fill:#ca8a04;text-anchor:middle">별이 사라진 것이 아님 확인</text>

      <rect x="40" y="388" width="560" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="406" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">도시 불빛이 너무 밝으면 먼 우주에서 오는 어두운 별빛이 묻혀 보이지 않게 돼요</text>
      </g>`;

      detail = `<g filter="url(#ex-shadow)">
      <rect x="20" y="20" width="600" height="395" rx="14" fill="#0b132b"/>
      <text x="320" y="55" style="font-size:15px;font-weight:800;fill:#38bdf8;text-anchor:middle">보틀 척도(Bortle Scale) 기반 밤하늘 등급</text>
      <g transform="translate(60, 90)">
        <rect x="0" y="0" width="520" height="230" rx="12" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <rect x="20" y="30" width="140" height="170" rx="8" fill="#070d1e"/>
        <text x="90" y="65" style="font-size:12px;font-weight:800;fill:#38bdf8;text-anchor:middle">Class 1: 청정</text>
        <text x="90" y="115" style="font-size:11px;fill:#cbd5e1;text-anchor:middle">은하수 명확</text>
        <text x="90" y="145" style="font-size:11px;fill:#86efac;text-anchor:middle">한계 7.5등급</text>
        <rect x="190" y="30" width="140" height="170" rx="8" fill="#1f2937"/>
        <text x="260" y="65" style="font-size:12px;font-weight:800;fill:#ca8a04;text-anchor:middle">Class 4: 교외</text>
        <text x="260" y="115" style="font-size:11px;fill:#cbd5e1;text-anchor:middle">은하수 희미</text>
        <text x="260" y="145" style="font-size:11px;fill:#fde047;text-anchor:middle">한계 6.0등급</text>
        <rect x="360" y="30" width="140" height="170" rx="8" fill="#374151"/>
        <text x="430" y="65" style="font-size:12px;font-weight:800;fill:#ef4444;text-anchor:middle">Class 8: 도심</text>
        <text x="430" y="115" style="font-size:11px;fill:#cbd5e1;text-anchor:middle">은하수 안 보임</text>
        <text x="430" y="145" style="font-size:11px;fill:#fca5a5;text-anchor:middle">한계 4.0등급</text>
      </g>
      <rect x="80" y="348" width="480" height="42" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
      <text x="320" y="373" style="font-size:12px;font-weight:700;fill:#0f172a;text-anchor:middle">인공 조명이 하늘로 향하지 않도록 갓을 씌우면 밤하늘의 별을 더 많이 보호할 수 있어요</text>
      </g>`;
    }
    caption = c === 1 ? '지구의 공전으로 인해 계절마다 밤에 태양 반대편에 놓이는 별자리가 달라져요.' : c === 2 ? '도시의 인공조명이 너무 밝으면 희미한 별을 보기 어려워져요. 별 자체가 사라진 것은 아니에요.' : '지구 자전으로 인해 같은 밤에도 시간이 지나면 별들이 북극성을 중심으로 일주 운동을 해요.';
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
<marker id="ex-arrow-cobalt" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 2L7 5L0 8Z" fill="#1d4ed8"/></marker>
<marker id="ex-arrow-coral" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 2L7 5L0 8Z" fill="#dc2626"/></marker>
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
