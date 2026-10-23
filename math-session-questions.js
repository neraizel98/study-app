(function(root){
    'use strict';
    function build(templates,generate,count=10){
        const questions=[],seen=new Set();
        if(!templates.length)return questions;
        for(let attempt=0;attempt<Math.max(count,templates.length)*30&&questions.length<count;attempt++){
            const item=generate(templates[attempt%templates.length]);
            const key=String(item.question||item.prompt||'').replace(/\s+/g,' ').trim();
            if(!key||seen.has(key))continue;
            seen.add(key);questions.push(item);
        }
        return questions;
    }
    root.MathSessionQuestions={build};
    if(typeof module!=='undefined')module.exports={build};
})(typeof window!=='undefined'?window:globalThis);
