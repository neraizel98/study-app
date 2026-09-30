(function(root){
'use strict';
const rows=[];
function add(id,subject,context,passage,question,answer,choices,explanation,accepted=[]){rows.push({id:'exam-'+id,subject,context,passageTitle:'새 상황 연습',passageLines:passage?[passage]:[],question,answer,choices:choices||[],kind:choices?'choice':'written',accepted:[answer,...accepted],explanation,sourceType:'시험 대비 · 직접 작성한 문항'});}
const rc={levelId:'level1',unitId:'r4'},ec={levelId:'grade6',unitId:'er1'},mc={levelId:'elementary-6',semesterId:'2',unitId:'e6-2-u4'};
const p1='도서관은 창가 자리에만 작은 화분을 놓았다. 한 달 뒤 창가 이용자 열 명 중 여덟 명은 자리가 편안해졌다고 답했다. 그러나 다른 자리의 이용자에게는 묻지 않았다. 담당자는 이 결과만으로 도서관 전체 이용자가 만족한다고 결론을 내리지는 않았다.';
add('r1','reading',rc,p1,'조사 결과만으로 말할 수 있는 것은?','응답한 창가 이용자 10명 중 8명이 편안해졌다고 답했다.',['모든 이용자가 화분을 좋아한다.','응답한 창가 이용자 10명 중 8명이 편안해졌다고 답했다.','다른 자리 이용자는 모두 불편해한다.','화분 때문에 방문자가 늘었다.'],'응답 대상은 창가 이용자 열 명으로 제한되어 있습니다.');
add('r2','reading',rc,p1,'전체 이용자에게 결과를 확대하기 어려운 까닭은?','다른 자리 이용자의 의견을 조사하지 않았기 때문이다.',['조사한 사람은 아무도 없기 때문이다.','다른 자리 이용자의 의견을 조사하지 않았기 때문이다.','화분이 크기 때문이다.','한 달은 하루보다 짧기 때문이다.'],'조사 대상의 범위를 확인해야 합니다.');
add('r3','reading',rc,p1,'편안해졌다고 응답한 사람은 몇 명인가요? 숫자만 쓰세요.','8',null,'열 명 중 여덟 명이므로 8명입니다.');
const p2='학교 텃밭의 두 구역에 같은 종류의 씨앗을 심었다. 가 구역에는 매일, 나 구역에는 이틀마다 물을 주었다. 그런데 가 구역은 햇빛이 잘 들고 나 구역은 대부분 그늘이었다. 가 구역의 싹이 더 많이 자랐지만, 학생들은 물 주는 횟수만이 원인이라고 단정하지 않았다.';
add('r4','reading',rc,p2,'물 주는 횟수 외에 달랐던 조건은?','햇빛',['씨앗의 종류','햇빛','학교 이름','학생 수'],'가 구역은 햇빛이 들고 나 구역은 대부분 그늘이었습니다.');
add('r5','reading',rc,p2,'물 주는 횟수의 영향을 더 정확히 알아보려면?','햇빛 조건을 같게 하고 물 주는 횟수를 달리한다.',['씨앗 종류도 바꾼다.','햇빛 조건을 같게 하고 물 주는 횟수를 달리한다.','결과를 기록하지 않는다.','자란 싹을 모두 뽑는다.'],'비교하려는 조건 외의 조건을 같게 해야 합니다.');
add('r6','reading',rc,p2,'대부분 그늘이었던 구역의 이름을 한 글자로 쓰세요.','나',null,'지문에 나 구역은 대부분 그늘이었다고 나옵니다.');
const e1='Mina keeps a small notebook by her window. Every clear night, she draws the Moon. On Monday, clouds cover the sky, so she writes "No picture today." On Tuesday, the sky is clear again. She draws a thin Moon and writes the date under it. She does not throw away Monday\'s page. It helps her remember why one picture is missing.';
add('e1','english_reading',ec,e1,'Why does Mina keep Monday\'s page?','To remember why a picture is missing.',['To remember why a picture is missing.','To hide the date.','To draw clouds every morning.','To give it to a friend.'],'마지막 문장에서 그림이 없는 까닭을 기억하는 데 도움이 된다고 설명합니다.');
add('e2','english_reading',ec,e1,'What does Mina write under Tuesday\'s drawing?','The date.',['Her name.','The date.','A price.','A question.'],'She ... writes the date under it.이 근거입니다.');
add('e3','english_reading',ec,e1,'Complete with one word from the passage: On Monday, _____ cover the sky.','clouds',null,'지문의 clouds를 그대로 옮깁니다. 복수 주어이므로 cover와 연결됩니다.');
const e2='Jun and his sister watch the Moon from their yard. Jun wants to use a bright flashlight to see his notebook. His sister asks him to point it at the ground, not at her face. After he does this, she can look at the sky comfortably. They take turns drawing and holding the light. At the end, both names are on the same page.';
add('e4','english_reading',ec,e2,'How do Jun and his sister work together?','They take turns drawing and holding the light.',['Jun does everything alone.','They take turns drawing and holding the light.','They leave the notebook inside.','They stop looking at the sky.'],'take turns는 번갈아 한다는 뜻입니다.');
add('e5','english_reading',ec,e2,'Where does Jun point the flashlight after his sister asks?','At the ground.',['At her face.','At the Moon.','At the ground.','At a window.'],'point it at the ground가 근거입니다.');
add('e6','english_reading',ec,e2,'Complete with one word from the passage: They take _____ drawing and holding the light.','turns',null,'take turns + -ing는 번갈아 ~한다는 표현입니다.');
add('m1','math',mc,'','빨간 구슬과 파란 구슬의 수의 비는 2:3입니다. 모두 35개일 때 빨간 구슬은 몇 개인가요? 숫자만 쓰세요.','14',null,'전체 비 2+3=5, 한 몫은 35÷5=7개, 빨간 구슬은 7×2=14개입니다.');
add('m2','math',mc,'','지도에서 2 cm가 실제 5 km입니다. 같은 지도에서 6 cm는 실제 몇 km인가요?','15',['10','12','15','30'],'6÷2=3배이므로 실제 거리도 5×3=15 km입니다.');
add('m3','math',mc,'','주스 원액과 물을 1:4로 섞습니다. 물 20컵에 원액은 몇 컵 필요한가요?','5',['4','5','10','20'],'물의 비 4가 20컵이므로 1에 해당하는 원액은 20÷4=5컵입니다.');
add('m4','math',mc,'','두 사람이 48장을 3:5로 나눕니다. 더 많이 받는 사람은 몇 장을 받나요? 숫자만 쓰세요.','30',null,'48÷(3+5)×5=30장입니다.');
add('m5','math',mc,'','밀가루와 설탕의 양의 비는 5:2입니다. 밀가루 300 g에 설탕은 몇 g인가요?','120',['60','100','120','150'],'300÷5×2=120 g입니다.');
add('m6','math',mc,'','연필 4자루가 1800원입니다. 같은 가격의 연필 10자루는 얼마인가요?','4500',['3600','4000','4500','4800'],'한 자루 1800÷4=450원, 열 자루 450×10=4500원입니다.');
const normalize=x=>String(x??'').normalize('NFKC').trim().toLowerCase().replace(/[.!?。]+$/,'').trim();
function correct(q,value){return q.kind==='written'?q.accepted.some(a=>normalize(a)===normalize(value)):String(value)===q.answer;}
function build(user,form){const reports=root.SmartStudy.LocalRepository.listReports(user),seen=new Set(reports.flatMap(r=>(r.metadata?.initialAttempts||r.metadata?.attempts||[]).map(a=>a.questionId)));const evidence=root.SmartStudy.LearningProgress.evidence(user);const selected=rows.filter(q=>evidence.some(e=>e.at<=Date.now()&&e.subject===q.subject&&root.SmartStudy.LearningPlan.contextKey(q.subject,e.context)===root.SmartStudy.LearningPlan.contextKey(q.subject,q.context)));const groups={};for(const subject of ['reading','english_reading','math']){const pool=selected.filter(q=>q.subject===subject),ids=new Set(rows.filter(q=>q.subject===subject).slice(form==='B'?3:0,form==='B'?6:3).map(q=>q.id));const items=pool.filter(q=>ids.has(q.id)).map(q=>({...q,repeated:seen.has(q.id),sourceType:seen.has(q.id)?'시험 대비 · 재연습':'시험 대비 · 처음 푸는 문항'}));groups[subject]={items,requestedCount:3,actualCount:items.length};}return groups;}
root.SmartStudy.ExamTraining={items:rows,correct,build,normalize,limitSeconds:900};
})(window);
