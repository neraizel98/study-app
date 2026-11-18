(function(root){
'use strict';
const labels=['전체 관찰','확대·단면'];
const text=(x,y,s,c='')=>`<text x="${x}" y="${y}" class="${c}${String(s).length<=5?' essential':''}">${s}</text>`;
const path=(d,c='flow')=>`<path d="${d}" class="${c}"/>`;
const circle=(x,y,r,c)=>`<circle cx="${x}" cy="${y}" r="${r}" class="${c}"/>`;
const rect=(x,y,w,h,fill,rx=10)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
const arrow=d=>path(d,'flow');

const defs=`<defs>
<marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#0e7490"/></marker>
<marker id="heat-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#dc2626"/></marker>
<marker id="arrow-cobalt" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 2L7 5L0 8Z" fill="#1d4ed8"/></marker>
<marker id="arrow-amber" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 2L7 5L0 8Z" fill="#f59e0b"/></marker>
<marker id="arrow-coral" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 2L7 5L0 8Z" fill="#dc2626"/></marker>
<marker id="arrow-green" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 2L7 5L0 8Z" fill="#15803d"/></marker>
<marker id="arrow-cyan" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 2L7 5L0 8Z" fill="#0284c7"/></marker>
<radialGradient id="galaxyGlow"><stop stop-color="#fdf3db" stop-opacity=".85"/><stop offset=".4" stop-color="#f5dcb1" stop-opacity=".45"/><stop offset="1" stop-color="#152f45" stop-opacity="0"/></radialGradient>
<radialGradient id="planet"><stop stop-color="#8fd4ed"/><stop offset=".6" stop-color="#4a95b8"/><stop offset="1" stop-color="#174e6b"/></radialGradient>
<radialGradient id="sunGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fffbeb"/><stop offset="40%" stop-color="#fde047"/><stop offset="80%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#ea580c" stop-opacity="0"/></radialGradient>
<linearGradient id="paperBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fdfcf8"/><stop offset="100%" stop-color="#f2ede4"/></linearGradient>
<linearGradient id="beakerGlass" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#edf6f8" stop-opacity=".85"/><stop offset=".2" stop-color="#f8fcfe" stop-opacity=".4"/><stop offset="1" stop-color="#d3ecf2" stop-opacity=".8"/></linearGradient>
<linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#9ddbf0"/><stop offset="100%" stop-color="#64b3cb"/></linearGradient>
<linearGradient id="warmWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fed7aa"/><stop offset="100%" stop-color="#f97316"/></linearGradient>
<linearGradient id="metalSpoon" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#64748b"/><stop offset=".3" stop-color="#f8fafc"/><stop offset=".6" stop-color="#94a3b8"/><stop offset="1" stop-color="#475569"/></linearGradient>
<linearGradient id="leafSurface" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#86efac"/><stop offset=".45" stop-color="#22c55e"/><stop offset="1" stop-color="#15803d"/></linearGradient>
<linearGradient id="stemSurface" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#166534"/><stop offset=".3" stop-color="#4ade80"/><stop offset=".7" stop-color="#22c55e"/><stop offset="1" stop-color="#14532d"/></linearGradient>
<linearGradient id="soilSurface" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a16207"/><stop offset=".2" stop-color="#78350f"/><stop offset="1" stop-color="#451a03"/></linearGradient>
<linearGradient id="cartChassis" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f8fafc"/><stop offset="50%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#94a3b8"/></linearGradient>
<filter id="softShadow" x="-10%" y="-10%" width="125%" height="125%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#1b363d" flood-opacity=".12"/></filter>
</defs>`;

function render(kind,state){
const extension=root.ScienceExtensionModels?.render(kind,state);if(extension)return extension;
if(!['plant','ecosystem','force','heat','states','mixtures','orbit','water-cycle','cosmos-local','cosmos'].includes(kind))return {sceneTitle:'관찰 모형 연결 확인 필요',controls:['연결 확인'],steps:['안내'],caption:'이 장면의 모형이 아직 연결되지 않았어요.',legends:[],svg:'<svg viewBox="0 0 640 430" role="img" aria-label="모형 연결 필요"><text x="320" y="210" text-anchor="middle">이 모형은 연결을 확인해야 해요.</text></svg>'};
if(kind==='cosmos-local'||kind==='cosmos'){
const c=Number(state.condition)||0;return {steps:['이동과 과거 자취'],controls:['움직이는 태양계','이동 흔적 전체'],sceneTitle:'태양의 이동과 행성의 공전·자전',legends:['태양과 함께 움직이지 않는 국소 기준','색 선은 천체의 과거 위치 / 실제 나선관이 아니에요','크기·거리·시간 비율과 공전면 방향을 조정한 모형'],caption:'태양이 이동하는 동안에도 행성은 태양 주위를 돌고 자신의 축을 중심으로 자전해요. 실제 은하 궤도의 짧은 구간을 직선으로 단순화한 설명용 모형이에요.',svg:`<svg viewBox="0 0 640 430" role="img" aria-label="태양이 이동하며 행성이 공전하는 과거 자취의 기본 도식"><rect width="640" height="430" rx="16" fill="#102033"/><g fill="none" stroke-width="2.5"><path d="M20 140Q160 20 250 170T510 220" stroke="#9bbed1"/><path d="M20 300Q170 390 280 230T550 280" stroke="#d3bb85"/><path d="M20 220Q160 100 300 220T520 170" stroke="#85b7d9"/><path d="M20 220H500" stroke="#c6ac72" stroke-dasharray="5 7"/></g><circle cx="480" cy="220" r="22" fill="#fae4b5" filter="drop-shadow(0 0 8px #f5dfab)"/><circle cx="520" cy="170" r="9" fill="#7fb2d7"/><text x="480" y="178" fill="#f0d59a" text-anchor="middle" font-size="22" font-weight="700">태양</text><text x="325" y="398" fill="#bdd3df" text-anchor="middle" font-size="18">기본 도식 · 국소 이동과 공전의 합성 자취</text></svg>`};}

const t=state.time||0, step=state.step||0, c=Number(state.condition||0), phase=t%1;
let body='',caption='',controls=[];

if(kind==='heat'){
 controls=['같은 에너지 · 물 1kg / 2kg','같은 에너지 · 물 1kg / 1kg','같은 1kg · 20℃ / 40℃','접촉 · 따뜻한 물과 숟가락'];
 const elapsed=Math.min(t,1)*60;
 body=[180,420].map((x,i)=>{
  const mass=i&&c===0?2:1,h=mass===2?115:70,temp=(c===2&&i?40:20)+1000*elapsed/(mass*4200);
  const waterY=275-h;
  return `<g filter="url(#softShadow)">
  <!-- Laboratory Hotplate Base -->
  <rect x="${x-75}" y="338" width="150" height="22" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <rect x="${x-65}" y="334" width="130" height="6" rx="3" fill="#ea580c" opacity="${elapsed>0?'.95':'.3'}"/>
  <!-- Thermal Radiation Guide Motion -->
  ${path(`M${x-45} 334V300M${x} 334V296M${x+45} 334V300`,'heat-arrow')}
  <!-- Borosilicate Beaker -->
  <ellipse cx="${x}" cy="100" rx="68" ry="16" fill="#f8fafc" stroke="#64748b" stroke-width="2.5"/>
  <path d="M${x-68} 100V268Q${x} 298 ${x+68} 268V100" fill="url(#beakerGlass)" stroke="#64748b" stroke-width="2.5"/>
  <!-- Liquid Column with Internal Convection Guide Loops -->
  <path d="M${x-64} ${waterY}V264Q${x} 288 ${x+64} 264V${waterY}" fill="url(#waterGrad)" opacity=".85"/>
  <ellipse cx="${x}" cy="${waterY}" rx="64" ry="14" fill="#bae6fd"/>
  <!-- Natural Convection Flow Loop Guide Motion -->
  ${elapsed>0?`<path d="M${x} ${waterY+15}Q${x-35} ${waterY+35} ${x-35} 250T${x} 265T${x+35} 250T${x} ${waterY+15}" fill="none" stroke="#f97316" stroke-width="1.6" stroke-dasharray="6 4" stroke-dashoffset="${Math.round(-phase*30)}" opacity="0.85"/>`:''}
  <!-- Volumetric Graduation Ticks -->
  <path d="M${x-58} 160H${x-44}M${x-58} 190H${x-44}M${x-58} 220H${x-44}M${x-58} 250H${x-44}" stroke="#475569" stroke-width="1.5"/>
  <!-- High-Precision Digital/Glass Thermometer -->
  <path d="M${x+34} 95V260" stroke="#f8fafc" stroke-width="12" stroke-linecap="round"/>
  <path d="M${x+34} 95V260" stroke="#94a3b8" stroke-width="1.5"/>
  <path d="M${x+34} ${Math.max(98, 250-temp*2.2)}V260" stroke="#dc2626" stroke-width="6" stroke-linecap="round"/>
  ${circle(x+34,262,11,'#dc2626')}
  <!-- Top Mass Badge -->
  <rect x="${x-48}" y="125" width="96" height="26" rx="7" fill="#ffffffea" stroke="#0284c7" stroke-width="1.4"/>
  ${text(x,143,mass===2?'질량: 2kg 물':'질량: 1kg 물','center essential')}
  <!-- Bottom High-Contrast Telemetry Badge -->
  <rect x="${x-56}" y="302" width="112" height="30" rx="8" fill="#fffffffa" stroke="#dc2626" stroke-width="1.8"/>
  <text x="${x}" y="${322}" style="font-size:13px;font-weight:800;fill:#dc2626;text-anchor:middle">${temp.toFixed(1)} ℃</text>
  ${text(x,385,'1000W 정밀 히터 가열','center')}
  </g>`;
 }).join('');
 body+=`<rect x="120" y="404" width="400" height="24" rx="6" fill="#ffffffea" stroke="#0e7490" stroke-width="1.2"/>
 ${text(320,420,`가열 시간: ${elapsed.toFixed(0)}초 · 공식: ΔT = P×t ÷ (m×c)`,'center')}`;
 caption=c===1?'같은 물질·같은 양·같은 처음 온도에 같은 에너지를 주면 온도 변화도 같아요. 열손실과 상태 변화는 생략했어요.':c===2?'처음 온도가 다르면 마지막 온도만으로 가열 효과를 비교하기 어려워요.':'같은 물질·같은 처음 온도·같은 에너지에서 물의 양이 적으면 온도가 더 많이 올라요. 열손실·상태 변화는 생략했어요.';
 if(c===3){
  body=`<g filter="url(#softShadow)">
  <!-- Beaker with Hot Water -->
  <ellipse cx="285" cy="135" rx="125" ry="25" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
  <path d="M160 135V310Q285 365 410 310V135" fill="url(#beakerGlass)" stroke="#64748b" stroke-width="3"/>
  <path d="M166 185V305Q285 352 404 305V185" fill="url(#warmWater)" opacity=".85"/>
  <ellipse cx="285" cy="185" rx="119" ry="24" fill="#fdba74"/>
  <!-- Submerged Stainless Steel Spoon -->
  <g transform="rotate(24 328 220)">
    <ellipse cx="328" cy="235" rx="32" ry="48" fill="url(#metalSpoon)" stroke="#475569" stroke-width="2"/>
    <rect x="318" y="45" width="20" height="175" rx="10" fill="url(#metalSpoon)" stroke="#475569" stroke-width="2"/>
    <!-- Heat Conduction Flow Lines inside Spoon Handle -->
    <path d="M328 230V65" fill="none" stroke="#dc2626" stroke-width="3.5" stroke-dasharray="8 5" stroke-dashoffset="${Math.round(-phase*26)}" marker-end="url(#heat-arr)"/>
  </g>
  <!-- High-Contrast Heat Conduction Vectors from Water to Spoon -->
  <path d="M225 240H285M235 210L285 225M235 270L285 255" stroke="#dc2626" stroke-width="2.5" marker-end="url(#heat-arr)"/>
  ${circle(245+45*phase,240,6,'#dc2626')}
  <!-- Temperature Badges -->
  <rect x="160" y="275" width="105" height="28" rx="7" fill="#fffffffa" stroke="#f97316" stroke-width="1.6"/>
  <text x="212" y="294" style="font-size:12px;font-weight:800;fill:#c2410c;text-anchor:middle">따뜻한 물 60℃</text>
  <rect x="400" y="115" width="115" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.6"/>
  <text x="457" y="134" style="font-size:12px;font-weight:800;fill:#0369a1;text-anchor:middle">차가운 숟가락 15℃</text>
  <!-- Conduction Principle Ribbon -->
  <rect x="120" y="388" width="400" height="28" rx="7" fill="#fffffffa" stroke="#dc2626" stroke-width="1.5"/>
  <text x="320" y="407" style="font-size:12px;font-weight:700;fill:#991b1b;text-anchor:middle">열전도: 고온(물 60℃) ──> 저온(숟가락 15℃)으로 열에너지 이동</text>
  </g>`;
  caption='더 따뜻한 물에서 차가운 숟가락 쪽으로 열이 전달돼요. 물은 에너지를 내주고 숟가락은 받아서 온도 차이가 줄어들어요. 화살표는 실제 열 알갱이가 아니에요.';
 }
}else if(kind==='orbit'){
 controls=['자전 · 약 하루','태양 공전 · 약 1년','은하 공전 · 약 2억3천만 년'];
 if(c===0){
  const rotAngle = (t * 6.28) % 6.28;
  const px = 370 + 105 * Math.cos(rotAngle);
  const front = Math.cos(rotAngle) < 0;
  body=`<g>
  <!-- Radiant Sun on Left -->
  <circle cx="85" cy="205" r="58" fill="url(#sunGlow)"/>
  <circle cx="85" cy="205" r="44" fill="#fde047" stroke="#eab308" stroke-width="2.5"/>
  <text x="85" y="211" style="font-size:14px;font-weight:800;fill:#854d0e;text-anchor:middle">태양</text>
  <!-- Parallel Solar Radiation Waves (High-Contrast Golden Rays) -->
  <path d="M145 150H235M145 185H240M145 220H240M145 255H235" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" marker-end="url(#arrow-amber)"/>
  <!-- Earth with 23.5° Axial Tilt -->
  <g transform="rotate(-23.5 370 205)">
    <!-- X-axis and Y-axis guide rings -->
    <ellipse cx="370" cy="205" rx="112" ry="110" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
    <!-- Continental Landmasses (Stylized Realistic Patches) -->
    <path d="M320 145Q350 130 380 155T390 210T340 240T315 190Z" fill="#15803d" opacity="0.9"/>
    <path d="M375 220Q410 200 440 230T420 270T370 260Z" fill="#166534" opacity="0.9"/>
    <!-- Latitudinal Rotation Guide Path -->
    <ellipse cx="370" cy="205" rx="${20 + 75 * Math.abs(Math.cos(rotAngle))}" ry="106" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-dasharray="8 6" opacity="0.9"/>
    <!-- Earth Axis Line -->
    <path d="M370 45V365" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round"/>
    <text x="370" y="38" style="font-size:11px;font-weight:800;fill:#d97706;text-anchor:middle">북극 (자전축 23.5°)</text>
    <text x="370" y="382" style="font-size:11px;font-weight:800;fill:#d97706;text-anchor:middle">남극</text>
  </g>
  <!-- Night Hemisphere Shadow with Atmospheric Twilight Terminator -->
  <path d="M370 93A112 112 0 0 1 370 317Z" fill="#09182b" opacity=".88"/>
  <line x1="370" y1="90" x2="370" y2="320" stroke="#fde047" stroke-width="1.5" stroke-dasharray="4 3"/>
  <!-- Surface Observer Location Marker -->
  <circle cx="${px}" cy="205" r="9" fill="${front?'#dc2626':'#38bdf8'}" stroke="#ffffff" stroke-width="2.5"/>
  <!-- Day / Night Frosted Status Pills -->
  <rect x="270" y="250" width="70" height="26" rx="6" fill="#ffffffea" stroke="#0284c7" stroke-width="1.4"/>
  <text x="305" y="268" style="font-size:12px;font-weight:800;fill:#0369a1;text-anchor:middle">낮 (태양 대면)</text>
  <rect x="395" y="250" width="70" height="26" rx="6" fill="#0f172aea" stroke="#64748b" stroke-width="1.4"/>
  <text x="430" y="268" style="font-size:12px;font-weight:800;fill:#ffffff;text-anchor:middle">밤 (그늘면)</text>
  <!-- Top Principle Badge -->
  <rect x="180" y="20" width="340" height="30" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
  <text x="350" y="40" style="font-size:12px;font-weight:800;fill:#0f172a;text-anchor:middle">지구 자전 (서$	o$동, 24시간): 관찰점(${front?'낮':'밤'})의 주기적 낮·밤 교대</text>
  </g>`;
  caption='태양을 향하는 반구는 낮이에요. 지구가 자전하며 관찰점이 낮과 밤을 번갈아 지나가요. 공전은 이 장면에서 생략했어요.';
 }else if(c===1){
  const orbitX=320+205*Math.cos(t*6.28), orbitY=215+95*Math.sin(t*6.28);
  body=`<g>
  <!-- Heliocentric Elliptical Orbit Track with Cardinal Stations -->
  <ellipse cx="320" cy="215" rx="205" ry="95" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6 6"/>
  <!-- Central Radiant Sun -->
  <circle cx="320" cy="215" r="54" fill="url(#sunGlow)"/>
  <circle cx="320" cy="215" r="38" fill="#fde047" stroke="#eab308" stroke-width="2.5"/>
  <text x="320" y="221" style="font-size:14px;font-weight:800;fill:#854d0e;text-anchor:middle">태양</text>
  <!-- Earth at Orbit Position with Persistent Axial Orientation -->
  <g transform="translate(${orbitX} ${orbitY})">
    <circle cx="0" cy="0" r="24" fill="#0284c7" stroke="#38bdf8" stroke-width="1.8"/>
    <!-- Persistent Parallel Axis in Space -->
    <path d="M-14 34L14 -34" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
    <circle cx="0" cy="0" r="5" fill="#22c55e"/>
  </g>
  <!-- Seasonal Cardinal Station Badges -->
  <text x="540" y="220" style="font-size:11px;font-weight:700;fill:#0369a1">춘분·추분</text>
  <text x="320" y="105" style="font-size:11px;font-weight:700;fill:#dc2626;text-anchor:middle">하지 (북반구 여름)</text>
  <text x="320" y="335" style="font-size:11px;font-weight:700;fill:#0284c7;text-anchor:middle">동지 (북반구 겨울)</text>
  <!-- Top Principle Badge -->
  <rect x="140" y="20" width="360" height="30" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
  <text x="320" y="40" style="font-size:12px;font-weight:800;fill:#0f172a;text-anchor:middle">태양 공전 (약 365.25일): 자전축 방향 불변 $\to$ 계절별 태양 남중고도 변화</text>
  </g>`;
  caption='약 1년의 공전만 따로 살펴봐요. 이 장면에서는 자전 애니메이션을 생략했어요. 천체 크기·거리·속도는 비례하지 않으며 자전 장면과 시간 압축률이 달라요.';
 }else{
  body=`<ellipse cx="320" cy="215" rx="255" ry="145" fill="#091424"/><ellipse cx="320" cy="215" rx="90" ry="50" fill="url(#galaxyGlow)"/>`+Array.from({length:4},(_,arm)=>{let d='';for(let j=0;j<75;j++){const r=12+j*3.1,a=j*.058+arm*Math.PI/2;d+=(j?'L':'M')+(320+Math.cos(a)*r).toFixed(1)+' '+(215+Math.sin(a)*r*.53).toFixed(1)+' ';}return `<path d="${d}" fill="none" stroke="#38bdf8" stroke-width="14" opacity=".22"/>`;}).join('')+Array.from({length:190},(_,i)=>{const a=i*.44,r=15+(i%45)*5;return circle(320+Math.cos(a+r*.018)*r,215+Math.sin(a+r*.018)*r*.53,1.2+(i%3)*.4,'#ffffff');}).join('')+`<ellipse cx="320" cy="215" rx="180" ry="98" fill="none" stroke="#f59e0b" stroke-dasharray="5 6" stroke-width="2"/>${circle(320+180*Math.cos(t*6.28),215+98*Math.sin(t*6.28),10,'#fde047')}<rect x="260" y="195" width="120" height="26" rx="6" fill="#0f172aea" stroke="#fde047" stroke-width="1.2"/>${text(320,212,'은하 중심 (궁수자리 A*)','center white essential')}<rect x="180" y="20" width="320" height="28" rx="7" fill="#0f172aea" stroke="#38bdf8" stroke-width="1.2"/>${text(340,38,'확장 탐구 · 우리 은하 속 태양계 공전 (v ≈ 220 km/s)','center white')}`;
  caption='태양계는 은하 전체에 퍼진 물질의 중력 영향을 받으며 은하 중심 주위를 돌아요. 이 장면만의 별도 시간·거리 축척이에요.';
 }
}else if(kind==='plant'){
 controls=['물 공급 · 물 이동','같은 물 · 빛 조건 비교','물 공급 중단'];
 const leaves=[
  ['M315 188C258 185 214 154 198 105C252 105 303 131 315 188Z','M315 188Q252 147 198 105'],
  ['M325 165C330 112 371 77 422 68C412 122 370 162 325 165Z','M325 165Q374 117 422 68'],
  ['M313 245C255 249 207 229 180 187C236 173 292 198 313 245Z','M313 245Q244 215 180 187'],
  ['M326 224C365 178 422 169 468 187C438 231 377 248 326 224Z','M326 224Q401 207 468 187'],
  ['M320 126C294 92 300 54 324 26C350 58 351 98 320 126Z','M320 126V30']
 ];
 body=`<defs>
 <linearGradient id="rootGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>
 </defs>
 <!-- Soil Stratum Layer with Mineral Depth Gradient -->
 <path d="M45 295Q180 277 320 294T595 290V420H45Z" fill="url(#soilSurface)"/>
 <path d="M45 313Q260 327 595 310M45 368Q270 345 595 376" fill="none" stroke="#78350f" stroke-width="2" opacity=".4"/>
 `+Array.from({length:70},(_,i)=>circle(55+i*71%530,312+i*43%100,1.4+(i%3)*.6,'#451a03')).join('')+`
 <!-- Translucent Xylem Vessel Stem with Capillary Flow Tubes -->
 <path d="M312 300L314 110Q320 92 326 110L328 300Z" fill="url(#stemSurface)" stroke="#166534" stroke-width="2"/>
 <!-- Internal Capillary Xylem Tubes in Stem -->
 <line x1="318" y1="300" x2="318" y2="110" stroke="#38bdf8" stroke-width="2.2" stroke-dasharray="5 4" stroke-dashoffset="${Math.round(-phase*24)}"/>
 <line x1="322" y1="300" x2="322" y2="110" stroke="#38bdf8" stroke-width="2.2" stroke-dasharray="5 4" stroke-dashoffset="${Math.round(-phase*24)}"/>
 <!-- Anatomical Leaves with Venation Network -->
 `+leaves.map(([d,v],i)=>`<path d="${d}" fill="url(#leafSurface)" stroke="#15803d" stroke-width="2" opacity="${c===2?'.65':(c===1?'.8':'1')}"/>
 <path d="${v}" fill="none" stroke="#bbf7d0" stroke-width="2.4" stroke-linecap="round"/>`).join('')+`
 <!-- Secondary Veins -->
 <g fill="none" stroke="#86efac" stroke-width="1.3" opacity=".85">
   <path d="M292 171L274 139M274 159L244 136M257 147L232 120M344 147L348 114M364 128L385 125M387 104L391 89M287 233L269 210M265 224L237 204M240 213L216 199M351 220L375 192M378 214L410 190M402 206L432 200"/>
 </g>
 <!-- Stomatal Transpiration Vapor Plumes (증산작용 수증기 배출) -->
 ${c!==2?`<g stroke="#38bdf8" stroke-width="1.4" fill="none" opacity="0.8">
   <path d="M198 105Q180 ${90-phase*20} 170 ${75-phase*20}" stroke-dasharray="3 3"/>
   <path d="M422 68Q440 ${55-phase*20} 450 ${40-phase*20}" stroke-dasharray="3 3"/>
   <path d="M468 187Q490 ${170-phase*20} 505 ${155-phase*20}" stroke-dasharray="3 3"/>
 </g>`:''}
 <!-- Root System (뿌리털 존 및 중심 주근) -->
 <g fill="none" stroke="#54381e" stroke-linecap="round">
   <path d="M320 295Q318 338 303 382" stroke-width="10"/>
   <path d="M319 317Q280 323 256 353M311 347Q352 346 385 375M308 364Q272 371 261 397M320 325Q353 325 371 344" stroke-width="5"/>
   <path d="M279 333L265 322M266 341L243 341M259 351L242 366M342 348L354 365M365 362L392 357M378 371L392 389M283 375L274 390M303 383L297 408M347 330L356 316M366 341L389 335" stroke-width="2.5"/>
 </g>
 <!-- High-Contrast Capillary Upward Water Flow Guide Motion -->
 ${c!==2?`<path d="M256 353Q280 323 319 317V125" fill="none" stroke="#0284c7" stroke-width="4" stroke-linecap="round" stroke-dasharray="8 6" stroke-dashoffset="${Math.round(-phase*28)}"/>
 <circle cx="319" cy="${315-phase*180}" r="6" fill="#38bdf8" stroke="#ffffff" stroke-width="2"/>
 <circle cx="319" cy="${315-((phase+0.5)%1)*180}" r="6" fill="#38bdf8" stroke="#ffffff" stroke-width="2"/>`:''}
 <!-- Sun with Solar Irradiance Rays -->
 <g>
   <circle cx="85" cy="72" r="32" fill="url(#sunGlow)"/>
   <circle cx="85" cy="72" r="22" fill="#fde047" stroke="#eab308" stroke-width="2"/>
   <path d="M85 32V20M85 112V124M45 72H33M125 72H137M56 43L46 33M114 43L124 33" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
 </g>
 <!-- Real-Time Botanical Telemetry Badges -->
 <rect x="52" y="112" width="66" height="25" rx="6" fill="#ffffffea" stroke="#d97706" stroke-width="1.2"/>
 ${text(85,129,'햇빛 (광합성)','center essential')}
 <rect x="425" y="125" width="75" height="25" rx="6" fill="#ffffffea" stroke="#15803d" stroke-width="1.2"/>
 ${text(462,142,'잎 (증산작용)','center essential')}
 <rect x="355" y="255" width="75" height="25" rx="6" fill="#ffffffea" stroke="#166534" stroke-width="1.2"/>
 ${text(392,272,'줄기 (물관 도관)','center essential')}
 <rect x="180" y="375" width="75" height="25" rx="6" fill="#ffffffea" stroke="#78350f" stroke-width="1.2"/>
 ${text(217,392,'뿌리 (수분 흡수)','center essential')}
 <!-- Top Telemetry Bar -->
 <rect x="150" y="16" width="340" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
 <text x="320" y="35" style="font-size:12px;font-weight:800;fill:#0f172a;text-anchor:middle">${c===0?'증산 속도: +14.2 mL/h (뿌리 흡수 $\\to$ 줄기 도관 $\\to$ 잎 방출)':(c===1?'광합성 대조 실험: 빛 조건에 따른 기공 개폐 비교':'수분 공급 중단: 도관 수분 결손 · 잎 시듦 현상')}</text>`;
 if(c===1){
  const plantCopy=body;
  body=`<g transform="translate(-10 45) scale(.51)">${plantCopy}</g><g transform="translate(320 45) scale(.51)">${plantCopy}</g><rect x="333" y="45" width="284" height="172" rx="18" fill="#0f172a" opacity=".45"/><rect x="90" y="330" width="130" height="26" rx="6" fill="#fffffffa" stroke="#15803d" stroke-width="1.5"/>${text(155,348,'물 같음 · 빛 충분 (정상)','center essential')}<rect x="405" y="330" width="130" height="26" rx="6" fill="#fffffffa" stroke="#64748b" stroke-width="1.5"/>${text(470,348,'물 같음 · 암실 (광합성 중단)','center essential')}${text(320,402,'물 흡수와 빛을 이용한 양분 생성은 다른 과정','center')}`;
 }
 caption=c===1?'물은 같게 공급하고 빛 조건을 다르게 비교해요. 뿌리의 물 흡수만으로 빛을 이용한 양분 생성을 대신할 수는 없어요.':c===2?'토양의 물 공급을 중단하면 잎에서 잃는 물을 보충하기 어려워요. 잎맥과 줄기의 물 통로를 연결해 살펴봐요.':'잔뿌리가 있는 뿌리에서 물을 흡수해 줄기의 물 통로와 잎맥으로 전달해요. 잎이 빛을 이용해 양분을 만드는 과정과 구분해요.';
}else if(kind==='ecosystem'){
 controls=['기본 먹이망','메뚜기 감소','분해자와 물질의 이동'];
 body=`
 <!-- High-Contrast Energy Flow Dynamic Arrows -->
 <g stroke-linecap="round">
   <path d="M140 240L280 140" stroke="#15803d" stroke-width="3.5" stroke-dasharray="8 5" stroke-dashoffset="${Math.round(-phase*26)}" marker-end="url(#arrow-green)"/>
   <path d="M140 240L280 320" stroke="#15803d" stroke-width="3.5" stroke-dasharray="8 5" stroke-dashoffset="${Math.round(-phase*26)}" marker-end="url(#arrow-green)"/>
   <path d="M350 140L490 220" stroke="#d97706" stroke-width="3.5" stroke-dasharray="8 5" stroke-dashoffset="${Math.round(-phase*26)}" marker-end="url(#arrow-amber)"/>
   <path d="M350 320L490 240" stroke="#d97706" stroke-width="3.5" stroke-dasharray="8 5" stroke-dashoffset="${Math.round(-phase*26)}" marker-end="url(#arrow-amber)"/>
 </g>
 <!-- Organism Trophic Cards -->
 `+[
   ['생산자 (풀/벼)','10,000 J',100,240,'#22c55e','#15803d'],
   ['1차 소비자 (메뚜기)','1,000 J',315,140,'#eab308','#a16207'],
   ['1차 소비자 (토끼)','1,000 J',315,320,'#38bdf8','#0284c7'],
   ['최종 소비자 (매)','100 J',525,230,'#ef4444','#b91c1c']
 ].map(([name,energy,x,y,borderColor,textColor])=>`
   <g opacity="${c===1&&name.includes('메뚜기')?'.28':'1'}" filter="url(#softShadow)">
     <rect x="${x-55}" y="${y-40}" width="110" height="80" rx="14" fill="#fffffffa" stroke="${borderColor}" stroke-width="2.5"/>
     <circle cx="${x}" cy="${y-14}" r="18" fill="${borderColor}" opacity=".2"/>
     <text x="${x}" y="${y-8}" style="font-size:16px;text-anchor:middle">${name.includes('풀')?'🌱':(name.includes('메뚜기')?'🦗':(name.includes('토끼')?'🐇':'🦅'))}</text>
     <text x="${x}" y="${y+14}" style="font-size:11px;font-weight:800;fill:#0f172a;text-anchor:middle">${name.split(' ')[0]}</text>
     <text x="${x}" y="${y+28}" style="font-size:10px;font-weight:700;fill:${textColor};text-anchor:middle">${energy}</text>
   </g>
 `).join('')+`
 <!-- Animated Floating Energy Pulse Particles -->
 <circle cx="${140+140*phase}" cy="${240-100*phase}" r="5" fill="#22c55e"/>
 <circle cx="${350+140*phase}" cy="${140+80*phase}" r="5" fill="#f59e0b"/>
 <!-- Principle Header Badge -->
 <rect x="140" y="20" width="360" height="30" rx="8" fill="#fffffffa" stroke="#15803d" stroke-width="1.5"/>
 <text x="320" y="40" style="font-size:12px;font-weight:800;fill:#0f172a;text-anchor:middle">${c===0?'에너지 이동: 생산자(100%) $\\to$ 초식(10%) $\\to$ 육식(1%) 전달':(c===1?'생태계 불균형: 메뚜기 급감 시 벼 번성 및 포식자 먹이난 발생':'물질 순환: 분해자(균류·세균)가 유기물을 무기물로 환원')}</text>`;
 if(c===2){
  body=`<g filter="url(#softShadow)">
  <!-- Closed Cyclic Nutrient Web -->
  <rect x="70" y="140" width="130" height="90" rx="12" fill="#fffffffa" stroke="#64748b" stroke-width="2"/>
  <text x="135" y="175" style="font-size:20px;text-anchor:middle">🍂</text>
  <text x="135" y="200" style="font-size:12px;font-weight:800;fill:#0f172a;text-anchor:middle">유기물 (사체·낙엽)</text>
  <path d="M200 185H265" stroke="#15803d" stroke-width="3" stroke-dasharray="6 4" stroke-dashoffset="${Math.round(-phase*20)}" marker-end="url(#arrow-green)"/>
  <rect x="265" y="140" width="130" height="90" rx="12" fill="#fffffffa" stroke="#15803d" stroke-width="2"/>
  <text x="330" y="175" style="font-size:20px;text-anchor:middle">🍄</text>
  <text x="330" y="200" style="font-size:12px;font-weight:800;fill:#15803d;text-anchor:middle">분해자 (균류·세균)</text>
  <path d="M395 185H460" stroke="#15803d" stroke-width="3" stroke-dasharray="6 4" stroke-dashoffset="${Math.round(-phase*20)}" marker-end="url(#arrow-green)"/>
  <rect x="460" y="140" width="130" height="90" rx="12" fill="#fffffffa" stroke="#d97706" stroke-width="2"/>
  <text x="525" y="175" style="font-size:20px;text-anchor:middle">🌱</text>
  <text x="525" y="200" style="font-size:12px;font-weight:800;fill:#d97706;text-anchor:middle">토양 무기양분</text>
  <!-- Cyclic Return Path to Plants -->
  <path d="M525 230Q330 350 135 230" fill="none" stroke="#0284c7" stroke-width="3" stroke-dasharray="8 6" stroke-dashoffset="${Math.round(-phase*28)}" marker-end="url(#arrow-cyan)"/>
  <rect x="140" y="20" width="360" height="30" rx="8" fill="#fffffffa" stroke="#15803d" stroke-width="1.5"/>
  <text x="320" y="40" style="font-size:12px;font-weight:800;fill:#0f172a;text-anchor:middle">물질은 순환하고, 에너지는 한 방향으로 흘러 열로 방출돼요</text>
  </g>`;
 }
 caption=c===2?'분해자는 죽은 생물 등의 물질을 분해하는 데 관여해요. 에너지의 이동과 물질의 순환을 같은 폐쇄 고리로 혼동하지 않아요.':c?'메뚜기가 줄면 연결된 생물이 영향을 받을 수 있어요. 다른 먹이와 환경도 살펴야 하며 미래 개체 수는 예측하지 않아요.':'풀은 생산자, 다른 생물을 먹는 동물은 소비자예요. 여러 먹이 관계가 얽혀 먹이망을 이루어요.';
}else if(kind==='force'){
 controls=['매끈한 바닥','거친 바닥','마찰 없는 이상적 조건'];
 const x=100+phase*(c===1?190:380);
 const frictionForce = c===1 ? 5.2 : (c===0 ? 0.8 : 0.0);
 const speedVal = (c===1 ? (1.5 - phase*1.1) : (c===0 ? 2.4 : 3.0)).toFixed(1);
 body=`
 <!-- Experimental Track with High-Contrast Surface Textures -->
 <path d="M40 300H600" stroke="${c===1?'#78350f':(c===0?'#0284c7':'#6366f1')}" stroke-width="14" ${c===1?'stroke-dasharray="8 6"':''}/>
 <!-- Microscopic Asperity Visualizer Line -->
 ${c===1?`<path d="M40 308L50 304L60 308L70 304L80 308L90 304L100 308L110 304L120 308L130 304L140 308L150 304L160 308L170 304L180 308L190 304L200 308L210 304L220 308L230 304L240 308L250 304L260 308L270 304L280 308L290 304L300 308L310 304L320 308L330 304L340 308L350 304L360 308L370 304L380 308L390 304L400 308L410 304L420 308L430 304L440 308L450 304L460 308L470 304L480 308L490 304L500 308L510 304L520 308L530 304L540 308L550 304L560 308L570 304L580 308L590 304L600 308" fill="none" stroke="#92400e" stroke-width="2"/>`:''}
 <!-- Dynamic Physics Cart -->
 <g transform="translate(${x} 225)" filter="url(#softShadow)">
   <rect width="110" height="52" rx="10" fill="url(#cartChassis)" stroke="#475569" stroke-width="2"/>
   <!-- Chassis Internal Battery/Sensor Deck -->
   <rect x="15" y="8" width="80" height="20" rx="4" fill="#0f172a"/>
   <circle cx="55" cy="18" r="4" fill="#22c55e"/>
   <!-- Ball-Bearing Wheels -->
   ${circle(24,56,16,'#1e293b')}
   ${circle(86,56,16,'#1e293b')}
   ${circle(24,56,6,'#e2e8f0')}
   ${circle(86,56,6,'#e2e8f0')}
   <!-- Applied Towing Force Vector (Forward) -->
   <path d="M110 26H160" stroke="#0284c7" stroke-width="3" stroke-linecap="round" marker-end="url(#arrow-cyan)"/>
   <text x="135" y="16" style="font-size:11px;font-weight:800;fill:#0284c7;text-anchor:middle">F (당기는 힘)</text>
   <!-- Opposing Friction Force Vector (Backward at Wheel Base) -->
   ${c!==2?`<path d="M20 58H${20-frictionForce*8}" stroke="#dc2626" stroke-width="3" stroke-linecap="round" marker-end="url(#arrow-coral)"/>
   <text x="${20-frictionForce*4}" y="76" style="font-size:10px;font-weight:800;fill:#dc2626;text-anchor:middle">마찰력 ${frictionForce} N</text>`:''}
 </g>
 <!-- Real-Time Physics Telemetry HUD -->
 <rect x="140" y="20" width="360" height="32" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
 <text x="320" y="41" style="font-size:12px;font-weight:800;fill:#0f172a;text-anchor:middle">속도: ${speedVal} m/s · 마찰 계수 $\\mu$: ${c===1?'0.52 (고마찰)':'0.08 (저마찰)'} · 알짜힘: ${c===2?'F_net = 0':'F_net = F - f'}</text>
 ${text(320,380,c===2?'마찰 없는 이상 조건: 외력이 없으면 등속 직선 운동을 계속해요 (관성 법칙)':(c===1?'거친 바닥: 접촉면의 미세 요철이 운동을 강하게 방해해요':'매끈한 바닥: 마찰력이 작아 더 멀리 빠르게 이동해요'),'center')}`;
 caption='힘은 빠르기나 운동 방향을 바꿀 수 있어요. 바닥만 바꾸어 비교하며, 화면 이동은 정성적인 반복 모형이에요.';
}else if(kind==='states'){
 controls=['고체 · 얼음','액체 · 물','기체 · 수증기','차가운 컵 바깥의 응결'];
 body=`<rect x="130" y="65" width="380" height="270" rx="20" fill="url(#beakerGlass)" stroke="#64748b" stroke-width="2.5"/>`+Array.from({length:32},(_,i)=>{
  let x,y;
  if(c===0){
    // Hexagonal Ice Lattice with Bond Spring Jitter
    const row=Math.floor(i/6), col=i%6;
    x=185+col*45 + (row%2===1?22:0) + Math.sin(t*18+i)*1.5;
    y=120+row*38 + Math.cos(t*16+i)*1.5;
  }else if(c===1){
    // Densely Packed Liquid Clusters Rolling Over Each Other
    x=160+(i*53%320)+Math.sin(t*6+i)*8;
    y=210+Math.floor(i/8)*28+Math.cos(t*5+i)*6;
  }else{
    // Fast High-Velocity Ballistic Free Gas Molecules
    x=150+(i*79+t*110)%340;
    y=85+(i*61+t*85)%230;
  }
  return `<g>
    <!-- Water Molecule H2O: Red Oxygen Center + Two White Hydrogen Ears -->
    <circle cx="${x}" cy="${y}" r="8" fill="#dc2626" stroke="#991b1b" stroke-width="1"/>
    <circle cx="${x-5}" cy="${y-5}" r="4.5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <circle cx="${x+5}" cy="${y-5}" r="4.5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    ${c===2?`<line x1="${x}" y1="${y}" x2="${x-12}" y2="${y-8}" stroke="#dc2626" stroke-width="1.2" opacity="0.6"/>`:''}
  </g>`;
 }).join('')+`
 <!-- State Characteristics HUD -->
 <rect x="120" y="16" width="400" height="32" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
 <text x="320" y="37" style="font-size:12px;font-weight:800;fill:#0f172a;text-anchor:middle">${c===0?'고체 (얼음): 육각 수소결합 격자 · 분자 간격 고정 · 형태 유지':(c===1?'액체 (물): 조밀한 분자 군집 · 유동성 유지 · 담는 용기 모양':'기체 (수증기): 분자 간격 극대화 · 자유 직선 운동 · 투명한 무색 기체')}</text>
 ${text(320,380,'입자 크기는 일정 · 배열·거리·운동을 비교해요','center')}`;
 caption=c===2?'수증기는 눈에 보이지 않는 기체예요. 확대 입자 표시는 실제로 보이는 수증기나 하얀 김이 아니에요.':'얼음과 물은 같은 물질이에요. 상태 변화는 입자 자체의 크기가 커지는 변화가 아니에요.';
 if(c===3){
  body=`<g filter="url(#softShadow)">
  <!-- Cold Stainless/Glass Cup with Ice Cubes -->
  <path d="M220 115V300Q320 350 420 300V115" fill="url(#beakerGlass)" stroke="#64748b" stroke-width="3"/>
  <ellipse cx="320" cy="115" rx="100" ry="19" fill="#e0f2fe"/>
  <!-- Cold Water & Ice Cubes Inside -->
  <path d="M230 210V295Q320 334 410 295V210Z" fill="url(#waterGrad)" opacity="0.9"/>
  <!-- Floating Translucent Ice Cubes -->
  <polygon points="265,225 305,210 335,230 295,248" fill="#ffffffea" stroke="#93c5fd" stroke-width="1.5"/>
  <polygon points="325,240 365,225 385,245 345,260" fill="#ffffffea" stroke="#93c5fd" stroke-width="1.5"/>
  <!-- Condensation Dew Droplets Forming on Outside Surface of Cold Glass -->
  ${Array.from({length:16},(_,i)=>`<ellipse cx="${i%2===0?215:425}" cy="${145+i*10}" rx="4" ry="5.5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.2"/>`).join('')}
  <!-- Ambient Invisible Water Vapor Approaching Cold Surface -->
  <path d="M130 170L205 190M510 170L435 190" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="6 4" stroke-dashoffset="${Math.round(-phase*20)}" marker-end="url(#arrow-cyan)"/>
  <!-- Top & Bottom Telemetry Ribbon -->
  <rect x="140" y="20" width="360" height="30" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
  <text x="320" y="40" style="font-size:12px;font-weight:800;fill:#0f172a;text-anchor:middle">응결: 공기 중 수증기가 찬 컵 외벽에 닿아 액체 물방울로 상변화</text>
  ${text(320,390,'공기 중 수증기 → 컵 바깥 물방울 응결','center')}
  </g>`;
  caption='차가운 컵 바깥의 물방울은 공기 중 수증기가 응결해 생길 수 있어요. 수증기는 보이지 않는 기체이며 하얀 김은 작은 물방울이에요.';
 }
}else if(kind==='mixtures'){
 controls=['체 · 콩과 쌀','거름 · 모래와 물','증발 · 소금물','섞이지 않는 물과 기름'];
 if(c===0){
  body=`<g filter="url(#softShadow)">
  <!-- Laboratory Brass Sieve Mesh -->
  <ellipse cx="320" cy="175" rx="175" ry="36" fill="#d97706" stroke="#92400e" stroke-width="5"/>
  <path d="M145 175L175 220H465L495 175" fill="#b45309" stroke="#78350f" stroke-width="3"/>
  <!-- Woven Wire Mesh Grid -->
  `+Array.from({length:28},(_,i)=>`<path d="M${180+i*10} 170V215" stroke="#fde68a" stroke-width="1.2"/>`).join('')+`
  <!-- Large Soybeans Retained on Sieve (알갱이 > 체눈) -->
  `+Array.from({length:12},(_,i)=>`<circle cx="${205+i*21}" cy="${158+i%2*10}" r="10" fill="#facc15" stroke="#a16207" stroke-width="1.5"/>`).join('')+`
  <!-- Small Rice Grains Falling Through Mesh (알갱이 < 체눈) -->
  `+Array.from({length:14},(_,i)=>`<ellipse cx="${205+i*18}" cy="${225+(i*19+phase*90)%80}" rx="3.5" ry="7" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>`).join('')+`
  <!-- Receiving Basin Below -->
  <path d="M165 315Q320 395 475 315L455 375Q320 415 185 375Z" fill="#e2e8f0" stroke="#64748b" stroke-width="3"/>
  <ellipse cx="320" cy="315" rx="155" ry="24" fill="#f8fafc" stroke="#94a3b8"/>
  `+Array.from({length:16},(_,i)=>`<ellipse cx="${215+i*14}" cy="${318+i%3*4}" rx="3.5" ry="7" fill="#ffffff" stroke="#cbd5e1"/>`).join('')+`
  <!-- Telemetry Badge -->
  <rect x="140" y="20" width="360" height="30" rx="8" fill="#fffffffa" stroke="#d97706" stroke-width="1.5"/>
  <text x="320" y="40" style="font-size:12px;font-weight:800;fill:#0f172a;text-anchor:middle">체 분리: 알갱이 크기 차이 (콩 > 체눈 2mm > 쌀) 이용</text>
  ${text(320,95,'큰 콩은 체에 남음 / 작은 쌀은 통과','center')}
  ${text(320,395,'받는 그릇','center essential')}
  </g>`;
 }else if(c===1){
  body=`<g filter="url(#softShadow)">
  <!-- Conical Glass Funnel with Filter Paper on Iron Ring Stand -->
  <path d="M175 100H465L345 240H295Z" fill="url(#beakerGlass)" stroke="#64748b" stroke-width="3"/>
  <!-- Fluted Filter Paper Lining -->
  <path d="M205 115L320 220L435 115Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2.5"/>
  <!-- Sand Grains Trapped on Filter Paper (Insoluble Inclusions) -->
  `+Array.from({length:22},(_,i)=>circle(275+(i*21%90),140+(i%4)*12,5,'#78350f')).join('')+`
  <!-- Clean Filtrate Liquid in Flask Below -->
  <path d="M230 275V350Q320 385 410 350V275" fill="url(#waterGrad)" stroke="#64748b" stroke-width="2.5"/>
  <ellipse cx="320" cy="275" rx="90" ry="16" fill="#bae6fd"/>
  <!-- Continuous Filtrate Droplets Falling -->
  ${circle(320,242+phase*32,6,'#38bdf8')}
  <!-- Top & Bottom Telemetry Badges -->
  <rect x="140" y="20" width="360" height="30" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
  <text x="320" y="40" style="font-size:12px;font-weight:800;fill:#0f172a;text-anchor:middle">거름 분리: 용해도 차이 (물+소금 통과 / 모래 잔류)</text>
  ${text(320,75,'모래는 거름종이에 남아요','center')}
  ${text(320,405,'물과 녹은 소금은 함께 통과해요','center')}
  </g>`;
 }else{
  body=`<g filter="url(#softShadow)">
  <!-- Porcelain Evaporating Dish with Burner Flame -->
  <path d="M160 245Q320 350 480 245Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="4"/>
  <ellipse cx="320" cy="245" rx="158" ry="34" fill="#38bdf8" opacity="${Math.max(0.15, 1-phase*.85)}"/>
  <!-- Crystallizing Cubic Halite Salt Grains Nucleating on Base -->
  `+Array.from({length:14},(_,i)=>`<rect x="${235+i*13}" y="${275+i%2*8}" width="9" height="9" fill="#ffffff" stroke="#64748b" stroke-width="1.2"/>`).join('')+`
  <!-- Ascending Water Evaporation Vapor Plumes -->
  <path d="M250 220Q230 160 260 100M320 220Q310 150 330 95M390 220Q370 160 400 100" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="6 4" stroke-dashoffset="${Math.round(-phase*22)}" marker-end="url(#arrow-cyan)"/>
  <!-- Top Principle Badge -->
  <rect x="140" y="20" width="360" height="30" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
  <text x="320" y="40" style="font-size:12px;font-weight:800;fill:#0f172a;text-anchor:middle">증발 분리: 끓는점 차이 (물 증발 비산 $\\to$ 소금 결정 석출)</text>
  ${text(320,80,'증발 접시 · 가열 없이도 증발해요','center')}
  ${text(320,375,'물은 공기로 이동 / 소금은 접시에 남음','center')}
  </g>`;
 }
 if(c===3){
  body=`<g filter="url(#softShadow)">
  <!-- Pear-Shaped Separatory Funnel on Ring Stand -->
  <path d="M240 95H400L365 260L335 285V335H305V285L275 260Z" fill="url(#beakerGlass)" stroke="#64748b" stroke-width="3"/>
  <!-- Upper Low-Density Oil Layer (황색 식용유 층) -->
  <path d="M245 110H395L380 180H260Z" fill="#fde047" opacity="0.9"/>
  <!-- Lower High-Density Water Layer (청색 물 층) -->
  <path d="M260 180H380L360 258L335 280H305L280 258Z" fill="#38bdf8" opacity="0.85"/>
  <!-- Stopcock & Dispensing Jet Stream Below -->
  ${path('M285 315H355','axis')}
  ${circle(320,340+phase*35,5.5,'#0284c7')}
  <!-- Density Layer Callouts -->
  <rect x="110" y="135" width="120" height="26" rx="6" fill="#fffffffa" stroke="#ca8a04" stroke-width="1.5"/>
  <text x="170" y="152" style="font-size:11px;font-weight:800;fill:#a16207;text-anchor:middle">기름층 (밀도 0.92)</text>
  <rect x="410" y="215" width="120" height="26" rx="6" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
  <text x="470" y="232" style="font-size:11px;font-weight:800;fill:#0369a1;text-anchor:middle">물층 (밀도 1.00)</text>
  <!-- Top Principle Badge -->
  <rect x="140" y="20" width="360" height="30" rx="8" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
  <text x="320" y="40" style="font-size:12px;font-weight:800;fill:#0f172a;text-anchor:middle">분액깔때기: 밀도 차이와 섞이지 않는 성질을 이용한 분리</text>
  ${text(320,410,'서로 섞이지 않는 액체의 층을 관찰','center')}
  </g>`;
 }
 caption=c===3?'물과 기름처럼 서로 잘 섞이지 않는 액체는 층을 이룰 수 있어요. 이 모형에서 아래층 물이 먼저 나오는 관계를 살펴요.':c===2?'물의 증발은 끓지 않아도 일어나요. 열린 접시에서는 물을 회수하지 못하고 소금이 남아요.':'물질의 크기와 녹는 성질 차이를 이용해요. 녹은 소금은 일반 거름종이로 분리되지 않아요.';
}else{
 controls=['따뜻한 조건','차가운 조건'];
 body=`<g>
 <!-- Ocean Reservoir -->
 <path d="M0 290Q150 260 300 310T640 280V420H0" fill="url(#waterGrad)"/>
 <!-- Mountain Watershed with Snowpack -->
 <path d="M370 310L500 155L640 310" fill="#475569"/>
 <path d="M470 190L500 155L530 190" fill="#f8fafc"/>
 <!-- Condensation Clouds in Troposphere -->
 <g fill="#ffffff" opacity="0.95" filter="url(#softShadow)">
   <ellipse cx="290" cy="100" rx="75" ry="35"/>
   <ellipse cx="355" cy="110" rx="55" ry="28"/>
   <ellipse cx="240" cy="115" rx="45" ry="24"/>
 </g>
 <!-- Evaporation Vapor Plumes (Ocean -> Atmosphere) -->
 <path d="M100 265Q100 130 220 110" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6 4" stroke-dashoffset="${Math.round(-phase*22)}" marker-end="url(#arrow-cyan)"/>
 <!-- Precipitation Rain Streams (Cloud -> Mountain) -->
 <path d="M360 145L405 245" fill="none" stroke="#0284c7" stroke-width="3" stroke-dasharray="6 4" stroke-dashoffset="${Math.round(-phase*24)}" marker-end="url(#arrow-cyan)"/>
 <!-- Runoff & Groundwater Flow (Mountain -> Ocean) -->
 <path d="M485 290Q400 350 210 325" fill="none" stroke="#0369a1" stroke-width="3" stroke-dasharray="6 4" stroke-dashoffset="${Math.round(-phase*22)}" marker-end="url(#arrow-cyan)"/>
 <!-- Hydrological Stage Badges -->
 <rect x="65" y="145" width="65" height="24" rx="5" fill="#fffffffa" stroke="#0284c7" stroke-width="1.2"/>
 ${text(97,162,'증발','center essential')}
 <rect x="255" y="55" width="130" height="24" rx="5" fill="#fffffffa" stroke="#0284c7" stroke-width="1.2"/>
 ${text(320,72,'응결 (구름 수적)','center essential')}
 <rect x="400" y="210" width="65" height="24" rx="5" fill="#fffffffa" stroke="#0284c7" stroke-width="1.2"/>
 ${text(432,227,'강수','center essential')}
 <rect x="300" y="375" width="100" height="24" rx="5" fill="#fffffffa" stroke="#0369a1" stroke-width="1.2"/>
 ${text(350,392,'유출 · 스며듦','center')}
 ${Array.from({length:c?18:8},(_,i)=>circle(245+(i*21%130),95+(i*29%30),3.5,'#0284c7')).join('')}
 ${Array.from({length:c?2:5},(_,i)=>circle(105+i*14,265-((phase+i*.24)%1)*125,4.5,'#38bdf8')).join('')}
 ${Array.from({length:5},(_,i)=>circle(370+i*9,155+((phase+i*.23)%1)*90,4.5,'#0284c7')).join('')}
 <!-- Top Principles Ribbon -->
 <rect x="140" y="16" width="360" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
 <text x="320" y="35" style="font-size:12px;font-weight:800;fill:#0f172a;text-anchor:middle">${c===0?'따뜻한 조건: 활발한 증발(+45mm/d)과 상승기류에 의한 적운 형성':'차가운 조건: 증발 감소, 기온 하강에 따른 응결 촉진 및 강설'}</text>
 </g>`;
 caption=c?'차가운 조건에서는 수증기가 물방울로 응결하기 쉬워요. 구름은 작은 물방울이나 얼음 알갱이예요.':'증발·응결·강수·흐름이 연결돼요. 물은 다양한 경로로 이동하므로 이것이 유일한 순서는 아니에요.';
}

const inspection={
 plant:['줄기 단면에서 물이 지나가는 통로 찾기','줄기 겉조직과 물 통로는 구분돼요.',()=>`
 <g filter="url(#softShadow)">
   <circle cx="320" cy="205" r="130" fill="#dcfce7" stroke="#16a34a" stroke-width="14"/>
   <circle cx="320" cy="205" r="110" fill="#f0fdf4" stroke="#86efac" stroke-width="5"/>
   <circle cx="320" cy="205" r="62" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
   `+Array.from({length:12},(_,i)=>`<circle cx="${320+95*Math.cos(i*.524)}" cy="${205+95*Math.sin(i*.524)}" r="14" fill="#38bdf8" stroke="#0284c7" stroke-width="2"/>`).join('')+`
   <rect x="150" y="20" width="340" height="28" rx="7" fill="#fffffffa" stroke="#16a34a" stroke-width="1.5"/>
   <text x="320" y="38" style="font-size:12px;font-weight:800;fill:#15803d;text-anchor:middle">관다발 단면: 물관부(청색 원)와 체관부(외곽)의 뚜렷한 기능 분리</text>
   ${text(320,390,'파란 원: 물이 지나가는 통로의 위치 모형','center')}
 </g>`],
 ecosystem:['먹이를 통한 에너지 이동을 확대','몸 안에서 먹이를 이용하지만 에너지가 다시 먹이로 돌아가지는 않아요.',()=>`
 <g filter="url(#softShadow)">
   <rect x="150" y="100" width="340" height="220" rx="20" fill="#f0fdf4" stroke="#16a34a" stroke-width="2.5"/>
   <ellipse cx="320" cy="200" rx="75" ry="48" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/>
   <path d="M45 200H235" stroke="#15803d" stroke-width="4" stroke-dasharray="8 5" marker-end="url(#arrow-green)"/>
   <path d="M400 200H575" stroke="#d97706" stroke-width="4" stroke-dasharray="8 5" marker-end="url(#arrow-amber)"/>
   ${text(70,165,'먹이 (섭취 에너지)')}
   ${text(320,205,'체내 대사·성장','center essential')}
   ${text(490,165,'호흡·열 방출 (90% 손실)')}
   <rect x="140" y="20" width="360" height="28" rx="7" fill="#fffffffa" stroke="#15803d" stroke-width="1.5"/>
   <text x="320" y="38" style="font-size:12px;font-weight:800;fill:#15803d;text-anchor:middle">생태 피라미드 10% 법칙: 에너지는 순환하지 않고 한 방향으로 흐릅니다</text>
   ${text(320,375,'화살표는 먹이·에너지 전달 방향','center')}
 </g>`],
 force:['바퀴와 바닥의 접촉 부분 확대','바닥과 접촉한 곳의 마찰이 운동을 방해하는 방향으로 작용해요.',()=>`
 <g filter="url(#softShadow)">
   ${circle(320,165,100,'#1e293b')}
   ${circle(320,165,40,'#64748b')}
   <path d="M80 265H560" stroke="#78350f" stroke-width="16"/>
   <!-- Microscopic Asperities Interlocking -->
   <path d="M80 272L100 256L120 272L140 256L160 272L180 256L200 272L220 256L240 272L260 256L280 272L300 256L320 272L340 256L360 272L380 256L400 272L420 256L440 272L460 256L480 272L500 256L520 272L540 256L560 272" fill="none" stroke="#b45309" stroke-width="3.5"/>
   <path d="M460 325H230" stroke="#dc2626" stroke-width="4" marker-end="url(#arrow-coral)"/>
   ${text(320,65,'수레 진행 방향 →','center')}
   <rect x="140" y="20" width="360" height="28" rx="7" fill="#fffffffa" stroke="#dc2626" stroke-width="1.5"/>
   <text x="320" y="38" style="font-size:12px;font-weight:800;fill:#991b1b;text-anchor:middle">미세 요철 결합부: 운동을 반대 방향으로 저지하는 마찰력 발생</text>
   ${text(320,380,'접촉면의 마찰 방향 ←','center')}
 </g>`],
 heat:['용기의 단면과 에너지 경계','같은 물질에 같은 열을 주어도 양이 다르면 온도 변화가 달라요.',()=>`
 <g filter="url(#softShadow)">
   <path d="M190 90V320H450V90" fill="#bae6fd" stroke="#0284c7" stroke-width="10"/>
   <path d="M205 140H435" stroke="#f8fafc" stroke-width="6"/>
   ${path('M320 395V330','heat-arrow')}
   ${path('M250 285V180M390 285V180','heat-arrow')}
   ${text(320,60,'물 내부 · 같은 물질','center')}
   ${text(320,175,'온도계로 온도를 측정','center')}
   ${text(320,265,'화살표 = 에너지 전달','center')}
   <rect x="140" y="20" width="360" height="28" rx="7" fill="#fffffffa" stroke="#dc2626" stroke-width="1.5"/>
   <text x="320" y="38" style="font-size:12px;font-weight:800;fill:#991b1b;text-anchor:middle">단면 에너지 경계: 비열 c와 질량 m에 반비례하는 온도 상승</text>
   ${text(320,420,'색 입자는 실제 열 알갱이가 아니에요','center')}
 </g>`],
 states:['입자 하나의 크기를 비교','각 상태의 입자는 같은 크기이며 배열·간격·운동이 달라요.',()=>[0,1,2].map((v)=>`
 <rect x="${30+v*205}" y="95" width="175" height="235" rx="14" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
 `+Array.from({length:9},(_,i)=>circle(65+v*205+(i%3)*(v===2?52:43),v===2?135+Math.floor(i/3)*70:215+Math.floor(i/3)*35,8.5,'#0284c7')).join('')+`
 <rect x="${60+v*205}" y="345" width="115" height="26" rx="6" fill="#fffffffa" stroke="#0284c7" stroke-width="1.4"/>
 ${text(117+v*205,362,['고체 (규칙적)','액체 (유동적)','기체 (자유 확산)'][v],'center')}`).join('')+`
 <rect x="140" y="20" width="360" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
 <text x="320" y="38" style="font-size:12px;font-weight:800;fill:#0f172a;text-anchor:middle">상태 변화: 분자 자체의 크기는 불변, 간격과 배열만 변화</text>`],
 mixtures:['거름종이의 구멍과 녹은 물질 확대','실제 입자와 구멍 크기에 비례한 그림은 아니에요.',()=>`
 <g filter="url(#softShadow)">
   <path d="M60 225H180M230 225H360M410 225H580" stroke="#92400e" stroke-width="22"/>
   ${circle(150,175,22,'#78350f')}
   ${circle(320,260+phase*50,7.5,'#0284c7')}
   ${circle(385,265+phase*40,4.5,'#38bdf8')}
   ${path('M320 120V325','flow')}
   <rect x="140" y="20" width="360" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
   <text x="320" y="38" style="font-size:12px;font-weight:800;fill:#0f172a;text-anchor:middle">거름종이 미세 기공 메커니즘: 용존 이온 통과 vs 불용성 모래 차단</text>
   ${text(320,75,'모래: 위에 남음 / 녹은 소금: 통과','center')}
   ${text(320,390,'거름은 녹은 소금을 걸러내지 못해요','center')}
 </g>`],
 orbit:['지구 자전축과 낮밤 경계','태양빛을 향한 반구가 낮이에요. 축은 지구를 통과하는 가상의 선이에요.',()=>`
 <g filter="url(#softShadow)">
   ${circle(320,210,125,'#0284c7')}
   <path d="M320 85A125 125 0 0 1 320 335Z" fill="#091424" opacity=".85"/>
   ${path('M280 45L360 370','axis')}
   <path d="M80 150H180M80 220H180" stroke="#f59e0b" stroke-width="3" marker-end="url(#arrow-amber)"/>
   <rect x="140" y="20" width="360" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
   <text x="320" y="38" style="font-size:12px;font-weight:800;fill:#0f172a;text-anchor:middle">자전축과 명암 경계선(Terminator): 태양빛을 받는 반구만 낮이 됨</text>
   ${text(230,215,'낮','center')}
   ${text(400,215,'밤','center')}
   ${text(320,410,'빛 방향 → / 밝고 어두운 경계','center')}
 </g>`],
 water:['구름 속 작은 물방울 확대','보이지 않는 수증기가 응결하면 작은 물방울이 돼요.',()=>`
 <g filter="url(#softShadow)">
   <ellipse cx="320" cy="205" rx="200" ry="125" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2"/>
   `+Array.from({length:24},(_,i)=>circle(180+i*31%280,120+i*43%155,7,'#0284c7')).join('')+`
   <path d="M80 205H130M510 205H560" stroke="#0284c7" stroke-width="3" marker-end="url(#arrow-cyan)"/>
   <rect x="140" y="20" width="360" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
   <text x="320" y="38" style="font-size:12px;font-weight:800;fill:#0f172a;text-anchor:middle">구름 미세물리: 응결핵(CCN) 주위에 뭉친 미세 수적 (r ≈ 10μm)</text>
   ${text(320,60,'구름 = 작은 물방울·얼음 알갱이','center')}
   ${text(320,385,'기체 수증기 자체는 눈에 보이지 않아요','center')}
 </g>`]
};

if(step===1&&!(kind==='heat'&&c===3)&&!(kind==='plant'&&c===1)&&!(kind==='states'&&c===3)&&!(kind==='mixtures'&&c===3)&&!(kind==='ecosystem'&&c===2)){
 const detail=inspection[kind]||inspection.water;
 body=detail[2]();
 if(kind==='mixtures'&&c===0){
  body=`<g filter="url(#softShadow)">
  <rect x="150" y="85" width="340" height="235" rx="16" fill="#fde68a" stroke="#d97706" stroke-width="3"/>
  `+Array.from({length:10},(_,i)=>`<path d="M${170+i*32} 85V320" stroke="#b45309" stroke-width="5"/>`).join('')+`
  `+Array.from({length:7},(_,i)=>`<path d="M150 ${110+i*32}H490" stroke="#b45309" stroke-width="5"/>`).join('')+`
  <circle cx="265" cy="180" r="34" fill="#f59e0b" stroke="#92400e" stroke-width="3"/>
  <ellipse cx="395" cy="235" rx="6" ry="15" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5"/>
  <rect x="140" y="20" width="360" height="28" rx="7" fill="#fffffffa" stroke="#d97706" stroke-width="1.5"/>
  <text x="320" y="38" style="font-size:12px;font-weight:800;fill:#92400e;text-anchor:middle">체눈 확대: 콩(지름 8mm)은 체눈(2mm)보다 커서 걸러짐</text>
  ${text(320,55,' 체눈 확대 · 콩은 구멍보다 커요','center')}
  ${text(320,380,'쌀은 구멍보다 작아 통과할 수 있어요','center')}
  </g>`;
 }
 if(kind==='mixtures'&&c===2){
  body=`<g filter="url(#softShadow)">
  <rect x="160" y="85" width="320" height="245" rx="15" fill="#f0fdf4" stroke="#0284c7" stroke-width="2.5"/>
  `+Array.from({length:18},(_,i)=>circle(190+i*47%250,135+i*37%150,6,'#38bdf8')).join('')+`
  `+Array.from({length:7},(_,i)=>`<rect x="${200+i*33}" y="${260+i%2*20}" width="12" height="12" fill="#ffffff" stroke="#475569" stroke-width="1.5"/>`).join('')+`
  <path d="M320 150V55" stroke="#0284c7" stroke-width="3" marker-end="url(#arrow-cyan)"/>
  <rect x="140" y="20" width="360" height="28" rx="7" fill="#fffffffa" stroke="#0284c7" stroke-width="1.5"/>
  <text x="320" y="38" style="font-size:12px;font-weight:800;fill:#0f172a;text-anchor:middle">물 분자 증발 이탈 $\\to$ 용질(NaCl) 결정 침전 석출</text>
  ${text(320,380,'기체로 나가는 물 / 남는 소금','center')}
  </g>`;
 }
 body+=text(25,425,'속 보기 · 보이지 않는 관계를 설명하는 모형');
 caption=detail[0]+'. '+detail[1];
}
if(step===1&&kind==='heat'&&c===3){
 body+=`<ellipse cx="305" cy="240" rx="85" ry="70" fill="none" stroke="#dc2626" stroke-width="3" stroke-dasharray="6 4"/>`;
 caption='접촉한 부분을 살펴봐요. 물과 숟가락의 온도 차이 때문에 물에서 숟가락 쪽으로 에너지가 전달돼요.';
}
if(step===2){
 body+=`<g transform="translate(20 5)"><rect width="600" height="32" rx="16" fill="#fffdf8"/><rect width="${60+phase*540}" height="5" y="27" rx="3" fill="#0e7490"/>${text(300,22,'과정: 처음 조건 → 변화의 원인 → 관찰 결과','center')}</g>`;
}
if(c<0||c>=controls.length)return {sceneTitle:'지원하지 않는 관찰 조건',controls,caption:'이 조건은 아직 연결되지 않았어요. 유효한 조건을 선택해 주세요.',svg:'<svg viewBox="0 0 640 430" role="img" aria-label="미지원 조건"><text x="320" y="210" text-anchor="middle">지원하지 않는 관찰 조건이에요.</text></svg>',legends:[]};
const legends=kind==='heat'&&step!==1&&c!==3?[`왼쪽: 물 1kg · ${(20+1000*Math.min(t,1)*60/4200).toFixed(1)}℃`,`오른쪽: 물 ${c===0?2:1}kg · ${((c===2?40:20)+1000*Math.min(t,1)*60/((c===0?2:1)*4200)).toFixed(1)}℃`,'각 히터 1000W · 모형 가열 시간 최대 60초','같은 물질 / 열손실·상태 변화 없음']:null;

const canvasBg=kind==='orbit'&&c===2?'':`<rect x="6" y="6" width="628" height="418" rx="16" fill="url(#paperBg)" stroke="#cadadb" stroke-width="1.5"/>`;

return {
 steps:(kind==='plant'&&c===1)||(kind==='states'&&c===3)||(kind==='mixtures'&&c===3)||(kind==='ecosystem'&&c===2)?['관찰과 조건 비교']:labels,
 legends,
 sceneTitle:controls[c]||controls[0],
 svg:`<svg viewBox="0 0 640 430" role="img" aria-label="${caption}">${defs}${canvasBg}${body}</svg>`,
 caption,
 controls
};
}
root.ScienceModels={render,steps:labels};
})(window);
