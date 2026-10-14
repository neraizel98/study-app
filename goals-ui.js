(async function(){
    'use strict';
    await window.SmartStudy?.LocalRepository?.ready;
    let category='daily';
    const user=UserSession.getActiveUser();
    const icon=(name,size)=>window.SmartStudyIcons?.icon(name,{size})||'';
    function renderProgress(data){
        if(!window.Achievements)return;
        const p=Achievements.summary(data), level=data.level||1, required=UserSession.getRequiredEXP?UserSession.getRequiredEXP(level):100, exp=data.exp||0;
        document.getElementById('rewardLevel').textContent=`Lv.${level}`;
        document.getElementById('rewardLevelBar').style.width=`${Math.min(100,Math.round(exp/required*100))}%`;
        document.getElementById('rewardLevelLeft').textContent=`다음 레벨까지 ${Math.max(0,required-exp)} EXP`;
        document.getElementById('rewardStreak').textContent=`${p.current}일`;
        document.getElementById('rewardBest').textContent=`${p.longest}일`;
        document.getElementById('rewardQuizzes').textContent=`${p.quizzes}회`;
        document.getElementById('rewardWeekCount').textContent=`${p.week.filter(d=>d.stamped).length}/7일`;
        document.getElementById('rewardStamps').innerHTML=p.week.map(d=>`<span class="stamp${d.stamped?' is-stamped':''}${d.isToday?' is-today':''}${d.isFuture?' is-future':''}" title="${d.key}"><b>${d.stamped?icon('check',18):d.day}</b><small>${d.label}</small></span>`).join('');
        const earned=p.badges.filter(b=>b.earned).length;
        document.getElementById('badgeCount').textContent=`${earned}/${p.badges.length}`;
        document.getElementById('badgeGrid').innerHTML=p.badges.map(b=>`<div class="badge${b.earned?' is-earned':''}"><span class="badge-medal">${icon(b.earned?b.icon:'lock',22)}</span><strong>${b.title}</strong><small>${b.desc}</small></div>`).join('');
    }
    function render(){
        if(UserSession.getActiveUser()!==user){location.reload();return;}
        if(!user){document.getElementById('goalSummary').textContent='홈에서 로그인하면 나의 목표를 확인할 수 있어요.';return;}
        try{
            const completed=MissionManager.checkMissions();
            const data=UserSession.getUserData();
            document.getElementById('goalAccount').textContent=`${user} · 하루 목표 ${MissionManager.budget(data)}분`;
            renderProgress(data);
            MissionManager.renderGoals(category);
            if(completed?.length&&window.SmartStudyCelebrate){const exp=completed.reduce((sum,m)=>sum+(Number(m.exp)||0),0);SmartStudyCelebrate(completed.length===1?`미션 달성 · ${completed[0].title}`:`미션 ${completed.length}개 달성!`,`경험치 +${exp}를 받았어요.`,`+${exp}`);}
        }catch(error){console.error(error);document.getElementById('goalSummary').textContent='기록을 확인하지 못했습니다. 새로고침 후 다시 확인해 주세요.';}
    }
    document.querySelectorAll('[data-period]').forEach(button=>button.addEventListener('click',()=>{
        category=button.dataset.period;
        document.querySelectorAll('[data-period]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
        render();
    }));
    window.addEventListener('firemerged',render);
    window.addEventListener('focus',render);
    window.addEventListener('pageshow',render);
    render();
})().catch(console.error);
