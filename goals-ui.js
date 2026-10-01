(async function(){
    'use strict';
    await window.SmartStudy?.LocalRepository?.ready;
    let category='daily';
    const user=UserSession.getActiveUser();
    function render(){
        if(UserSession.getActiveUser()!==user){location.reload();return;}
        if(!user){document.getElementById('goalSummary').textContent='홈에서 로그인하면 나의 목표를 확인할 수 있어요.';return;}
        try{
            MissionManager.checkMissions();
            document.getElementById('goalAccount').textContent=`${user} · 저장된 하루 목표 ${MissionManager.budget(UserSession.getUserData())}분`;
            MissionManager.renderGoals(category);
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
