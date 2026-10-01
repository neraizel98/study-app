/**
 * missions.js - 일간·주간·월간 목표 및 보상 시스템
 */
const MissionManager = {
    DEFINITIONS: {
        daily: [
            { id:'d_checkin', icon:'🌱', title:'학습에 시동 걸기', desc:'실제 학습·퀴즈 시간 5분 채우기', target:300, exp:20, type:'daily_time' },
            { id:'d_study_15', icon:'⏱', title:'오늘의 시간 약속', desc:'보호자가 정한 하루 목표 시간 채우기', target:'budget', exp:40, type:'daily_time' },
            { id:'d_two_subjects', icon:'📚', title:'국어·영어·수학 골고루', desc:'국어·영어·수학을 각각 2분 이상 공부하기. 영어 3영역과 수학 공식은 해당 과목에 합산해요.', target:3, exp:40, type:'daily_core' },
            { id:'d_score_80', icon:'✍️', title:'배운 내용 확인하기', desc:'점수에 관계없이 퀴즈 1회 끝까지 제출하기', target:1, exp:20, type:'daily_quiz' }
        ],
        weekly: [
            { id:'w_attendance_5', icon:'📅', title:'일주일에 5일 꾸준히', desc:'퀴즈를 끝까지 제출한 날 5일 만들기', target:5, exp:150, type:'quiz_days', period:'weekly' },
            { id:'w_total_time_3h', icon:'📚', title:'핵심 과목 반복하기', desc:'국어·영어·수학 각각 서로 다른 3일에 퀴즈 제출하기', target:3, exp:150, type:'core_days', period:'weekly' },
            { id:'w_all_subjects', icon:'🧭', title:'7개 영역 빠짐없이', desc:'국어, 영어 단어·문법·독해, 수학, 수학 공식, 한자에서 각각 퀴즈 1회 제출하기', target:7, exp:100, type:'coverage', days:1, period:'weekly' },
            { id:'w_quiz_5', icon:'🔁', title:'시간을 두고 다시 확인', desc:'전에 푼 학습 범위를 다른 날 다시 푼 날 2일 만들기', target:2, exp:100, type:'review_days', period:'weekly' }
        ],
        monthly: [
            { id:'m_attendance_20', icon:'🗓', title:'한 달 학습 습관', desc:'퀴즈를 끝까지 제출한 날 16일 만들기', target:16, exp:400, type:'quiz_days', period:'monthly' },
            { id:'m_total_time_12h', icon:'📚', title:'핵심 과목 기본기 쌓기', desc:'국어·영어·수학 각각 서로 다른 12일에 퀴즈 제출하기', target:3, exp:400, type:'core_days', period:'monthly' },
            { id:'m_all_subjects', icon:'🌳', title:'7개 영역 꾸준히', desc:'한자·수학 공식을 포함한 7개 영역에서 각각 서로 다른 4일에 퀴즈 제출하기', target:7, exp:300, type:'coverage', days:4, period:'monthly' },
            { id:'m_quiz_20', icon:'🔁', title:'기억을 실력으로', desc:'전에 푼 학습 범위를 다른 날 다시 푼 날 8일 만들기', target:8, exp:400, type:'review_days', period:'monthly' }
        ]
    },
    REWARDS: {
        daily:[{icon:'🌟',title:'오늘의 성취 배지',note:'4개 목표 완료'}],
        weekly:[{icon:'🎲',title:'가족 활동 선택 제안권',note:'활동·시간·비용은 보호자와 상의해요'}],
        monthly:[{icon:'🎡',title:'체험·나들이 선택 제안권',note:'장소·일정·비용은 보호자가 최종 결정해요'}]
    },
    registeredSubjects() { return typeof SubjectRegistry!=='undefined'?SubjectRegistry.list().map(s=>s.id):['reading','english','english_reading','grammar','hanja','math']; },
    get areas() { return [...new Set([...this.registeredSubjects(),'math_formula'])]; },
    budget(user) {
        const id=user?.id||UserSession.getActiveUser();
        const value=window.SmartStudy?.LocalRepository?.getPreference(`SmartStudy_ParentPlanSettings_${encodeURIComponent(id)}`,null);
        return [30,45,60].includes(Number(value?.budgetMinutes))?Number(value.budgetMinutes):45;
    },
    targetOf(mission,user) { return mission.target==='budget'?this.budget(user)*60:mission.target; },
    family(subject) { return ['english','grammar','english_reading'].includes(subject)?'english':subject==='math_formula'?'math':subject; },
    dailyTimes(user) {
        const daily=user.dailyStats||{}, f=user.formulaStudyTime||{};
        return Object.fromEntries(this.areas.map(subject=>[subject,subject==='math_formula'
            ? (f.date===this.periodKey('daily')?Math.max(0,Number(f.studySeconds||0))+Math.max(0,Number(f.quizSeconds||0)):0)
            : Math.max(0,Number(daily.studyTime?.[subject]||0))]));
    },
    evidence(user) {
        const records=window.SmartStudy?.LocalRepository?.listReports(user?.id||UserSession.getActiveUser())||[];
        const unique=new Map();
        for(const r of records){
            const m=r.metadata||{}, attempts=m.initialAttempts||m.attempts||[], total=Number(r.totalQuestions);
            const at=Number(m.submittedAt||r.createdAt||r.date);
            const subject=m.source==='math-formula'?'math_formula':r.subject;
            if(r.deleted||m.assessment||m.status==='draft'||!r.sessionId||!this.areas.includes(subject)||!Number.isInteger(total)||total<1||attempts.length<total||attempts.slice(0,total).some(a=>typeof a.correct!=='boolean')||!Number.isFinite(at)||at<=0||at>Date.now())continue;
            const date=StudyPeriods.daily(new Date(at));
            const key=subject+':'+r.sessionId;
            // Only the first submission counts; a same-session retry cannot create a new learning day.
            const scope=m.unitId||m.formulaNumber||m.level;
            const context=scope?[subject,m.levelId||m.stageId||'',m.semesterId||'',scope,m.passageId||''].join(':'):null;
            if(!unique.has(key)||at<unique.get(key).at)unique.set(key,{at,date,subject,context});
        }
        return [...unique.values()].sort((a,b)=>a.at-b.at);
    },
    progressOf(user,mission,evidence=this.evidence(user)) {
        const times=this.dailyTimes(user), today=this.periodKey('daily');
        const entries=evidence.filter(e=>e.date>=this.periodKey(mission.period||'daily')&&e.date<=today);
        const days=subject=>new Set(entries.filter(e=>e.subject===subject).map(e=>e.date)).size;
        switch(mission.type){
            case 'daily_time': return Object.values(times).reduce((a,b)=>a+b,0);
            case 'daily_core': return ['reading','english','math'].filter(s=>Object.entries(times).filter(([id])=>this.family(id)===s).reduce((n,[,v])=>n+v,0)>=120).length;
            case 'daily_quiz': return entries.length;
            case 'quiz_days': return new Set(entries.map(e=>e.date)).size;
            case 'core_days': return ['reading','english','math'].filter(s=>new Set(entries.filter(e=>this.family(e.subject)===s).map(e=>e.date)).size >= (mission.period==='weekly'?3:12)).length;
            case 'coverage': return this.areas.filter(s=>days(s)>=mission.days).length;
            case 'review_days': {
                const first=new Map(),review=new Set();
                for(const e of evidence){
                    if(!e.context)continue;
                    if(first.has(e.context)&&first.get(e.context)<e.date&&e.date>=this.periodKey(mission.period)&&e.date<=today)review.add(e.date);
                    if(!first.has(e.context))first.set(e.context,e.date);
                }
                return review.size;
            }
            default:return 0;
        }
    },

    periodKey(category) {
        if (typeof StudyPeriods !== 'undefined' && StudyPeriods[category]) {
            return StudyPeriods[category]();
        }
        const now = new Date();
        const key = date => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };
        if (category === 'daily') return key(now);
        if (category === 'monthly') return key(new Date(now.getFullYear(), now.getMonth(), 1));
        const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
        return key(monday);
    },

    randomReward(category) {
        const pool = this.REWARDS[category] || [];
        return pool[0];
    },

    grantExp(user, amount) {
        user.exp = (user.exp || 0) + amount;
        user.level = user.level || 1;
        while (user.exp >= user.level * 100) {
            user.exp -= user.level * 100;
            user.level += 1;
        }
    },

    awardReward(user, category) {
        const rewards = user.missionProgress.rewards;
        const reward = this.randomReward(category);
        if (!reward) return;
        const entry = { ...reward, awardedAt: Date.now(), used: false };
        const period = this.periodKey(category);
        if (rewards[category]?.period === period) return;
        rewards[category] = { ...entry, period };
    },

    checkMissions() {
        const user = UserSession.getUserData();
        if (!user) return [];
        user.missionProgress = user.missionProgress || {};
        user.missionProgress.rewards = user.missionProgress.rewards || { daily: null, weekly: null, monthly: null };
        user.missionProgress.periods = user.missionProgress.periods || {};
        const completedNow = [];
        const evidence = this.evidence(user);

        ['daily', 'weekly', 'monthly'].forEach(category => {
            const period = this.periodKey(category);
            if (user.missionProgress.periods[category] !== period) {
                user.missionProgress[category] = {};
                user.missionProgress.periods[category] = period;
            }
            user.missionProgress[category] = user.missionProgress[category] || {};
            this.DEFINITIONS[category].forEach(mission => {
                const target = this.targetOf(mission, user);
                const previous = user.missionProgress[category][mission.id];
                if (previous?.completed) return;
                const progress = this.progressOf(user, mission, evidence);
                if (progress >= target) {
                    user.missionProgress[category][mission.id] = { progress: target, completed: true, ruleVersion: 2, date: Date.now() };
                    this.grantExp(user, mission.exp);
                    completedNow.push(mission);
                } else {
                    user.missionProgress[category][mission.id] = { progress, completed: false, ruleVersion: 2 };
                }
            });
        });

        ['daily', 'weekly', 'monthly'].forEach(category => {
            const allDone = this.DEFINITIONS[category].every(mission => user.missionProgress[category][mission.id]?.completed);
            if (allDone) this.awardReward(user, category);
        });
        UserSession.saveUserData(user);
        return completedNow;
    },

    rewardFor(user, category) {
        const rewards = user.missionProgress.rewards || {};
        const reward = rewards[category];
        return reward?.period === this.periodKey(category) ? reward : null;
    },

    escape(value) { return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); },
    renderMissionList(containerId) {
        const user=UserSession.getUserData(), container=document.getElementById(containerId);
        if(!container||!user)return;
        container.innerHTML=`<a class="goal-entry" href="goals.html"><span class="goal-entry-icon" aria-hidden="true">🎯</span><span><strong>학습 목표</strong><span class="goal-entry-sub">일간 · 주간 · 월간 목표와 보상 확인</span><span class="goal-entry-counts">${['daily','weekly','monthly'].map((c,i)=>`${['일간','주간','월간'][i]} ${this.DEFINITIONS[c].filter(m=>user.missionProgress?.[c]?.[m.id]?.completed).length}/4`).join(' · ')}</span></span><span aria-hidden="true">→</span></a>`;
    },
    renderGoals(category) {
        const user=UserSession.getUserData(), container=document.getElementById('goalList');
        if(!container||!user)return;
        const defs=this.DEFINITIONS[category], map=user.missionProgress?.[category]||{};
        const done=defs.filter(m=>map[m.id]?.completed).length;
        document.getElementById('goalSummary').textContent=`${this.periodKey(category)} 시작 · ${done}/4 완료 · 전체 달성 시 ${defs.reduce((s,m)=>s+m.exp,0)} EXP`;
        const entries=this.evidence(user).filter(e=>e.date>=this.periodKey(category));
        const names={reading:'국어',english:'영어 단어',grammar:'영어 문법',english_reading:'영어 독해',math:'수학',math_formula:'수학 공식',hanja:'한자'};
        container.innerHTML=defs.map(m=>{
            const p=map[m.id]||{}, target=this.targetOf(m,user), value=Math.min(target,Math.max(0,p.progress||0));
            const legacy=p.completed&&p.ruleVersion!==2;
            const text=m.type==='daily_time'?`${Math.floor(value/60)} / ${target/60}분`:`${value} / ${target}${m.type.endsWith('_days')&&m.type!=='core_days'?'일':m.type==='coverage'?'영역':m.type.includes('core')?'과목':'회'}`;
            const details=['coverage','core_days'].includes(m.type)?`<div class="goal-breakdown">${(m.type==='coverage'?this.areas:['reading','english','math']).map(subject=>{const count=new Set(entries.filter(e=>m.type==='coverage'?e.subject===subject:this.family(e.subject)===subject).map(e=>e.date)).size;const needed=m.days||(category==='weekly'?3:12);return `<span>${m.type==='core_days'&&subject==='english'?'영어':names[subject]||this.escape(subject)} ${Math.min(count,needed)}/${needed}일</span>`;}).join('')}</div>`:'';
            return `<article class="goal-card ${p.completed?'is-complete':''}"><div class="goal-card-heading"><h2><span aria-hidden="true">${m.icon}</span> ${m.title}</h2><span class="goal-exp">+${m.exp} EXP</span></div><p>${m.desc}</p>${details}<div class="goal-meter"><progress max="${target}" value="${p.completed?target:value}" aria-label="${m.title}"></progress><strong>${legacy?'기존 달성 인정':p.completed?'달성 완료':text}</strong></div></article>`;
        }).join('');
        const earned=this.rewardFor(user,category),reward=earned||this.REWARDS[category][0],escape=this.escape;
        document.getElementById('goalReward').innerHTML=`<span class="goal-eyebrow">${earned?(earned.used?'사용한 보상':'획득한 보상'):'4개 목표를 모두 완료하면'}</span><h2>${escape(reward.icon)} ${escape(reward.title)}</h2><p>${escape(reward.note||'기존에 획득한 보상을 유지합니다.')}</p><p class="goal-muted">경험치는 목표마다 한 번 지급됩니다. 실물·활동 보상은 자동 결제되거나 예약되지 않습니다.</p>`;
    }
};
window.MissionManager = MissionManager;
