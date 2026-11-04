(function(root){
 'use strict';
 const app=root.SmartStudy;
 async function open(user,task,proceed){
  const target=app.MockLearning?.getState(user)?.targets?.find(item=>item.assessmentId===task.diagnostic?.assessmentId&&item.questionId===task.diagnostic?.questionId);
  const question=target?.question;
  if(!target||target.progress?.reviewDone||!question||!Array.isArray(question.choices)||question.choices.length<2){proceed();return;}
  const dialog=document.createElement('dialog');dialog.className='journey-dialog';dialog.setAttribute('aria-label','시험 오답 다시 보기');
  const title=document.createElement('h2');title.textContent='시험에서 헷갈린 문제 다시 보기';dialog.append(title);
  const prompt=document.createElement('p');prompt.textContent=question.question||question.prompt||'';dialog.append(prompt);
  if(question.passageLines?.length||question.passageText){
   const passage=document.createElement('p');passage.textContent=Array.isArray(question.passageLines||question.passageText)?(question.passageLines||question.passageText).join(' '):question.passageText;dialog.append(passage);
  }
  const choices=document.createElement('div');let selected=null;
  for(const value of question.choices){const b=document.createElement('button');b.className='journey-secondary';b.textContent=String(value);b.type='button';b.onclick=()=>{selected=String(value);for(const child of choices.children)child.setAttribute('aria-pressed',String(child===b));};choices.append(b);}
  dialog.append(choices);
  const feedback=document.createElement('p');feedback.setAttribute('role','status');dialog.append(feedback);
  const check=document.createElement('button');check.className='journey-primary';check.textContent='답 확인';dialog.append(check);
  const later=document.createElement('button');later.className='journey-secondary';later.textContent='학습으로 이동';dialog.append(later);
  document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove());later.onclick=()=>{dialog.close();proceed();};
  check.onclick=async()=>{
   if(selected===null){feedback.textContent='먼저 답을 골라 주세요.';return;}
   const result=root.AnswerValidation.choice(question,selected);
   if(result.correct===null){feedback.textContent='이 문제를 확인할 수 없어요. 학습으로 이동해 주세요.';return;}
   check.disabled=true;
   try{
    await app.MockLearning.recordReview(user,{assessmentId:target.assessmentId,questionId:target.questionId,selectedAnswer:selected,correct:result.correct,status:result.status});
    feedback.textContent=(result.correct?'잘했어요. ':'다시 살펴봐요. ')+'정답은 '+question.answer+'입니다. '+(question.explanation||'');
    later.textContent='학습 시작 →';
   }catch(error){feedback.textContent='복습을 저장하지 못했어요. 다시 눌러 주세요.';check.disabled=false;}
  };
  dialog.showModal();
 }
 app.MockLearningReview={open};
})(window);
