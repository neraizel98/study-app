(function(root){
    'use strict';
    const app=root.SmartStudy=root.SmartStudy||{};
    app.AnswerMathRenderer={render(container,value){
        const text=String(value??''),doc=container.ownerDocument;
        container.replaceChildren();
        const pattern=/\$\$([\s\S]+?)\$\$|\$([^\n$]+?)\$/g;
        let start=0,match;
        while((match=pattern.exec(text))){
            container.appendChild(doc.createTextNode(text.slice(start,match.index)));
            const formula=doc.createElement('span');
            // Stored question/answer text is untrusted: only KaTeX creates markup.
            try{
                if(!root.katex?.render)throw new Error('Math renderer unavailable');
                root.katex.render(match[1]??match[2],formula,{throwOnError:true,trust:false,displayMode:match[1]!==undefined,strict:'ignore',maxExpand:1000});
            }catch(error){formula.textContent=match[0];}
            container.appendChild(formula);
            start=pattern.lastIndex;
        }
        container.appendChild(doc.createTextNode(text.slice(start)));
    }};
})(window);
