(function(root){
    'use strict';
    const app=root.SmartStudy, R=app.FirestoreRepository, D=app.DurableStore;
    const legacyGet=R.getUserBundle.bind(R), bodyCache=new Map();
    const clean=value=>JSON.parse(JSON.stringify(value));
    const canonical=value=>JSON.stringify(value,function(key,v){
        if(v && !Array.isArray(v) && typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]]));
        return v;
    });
    const hash=async text=>Array.from(new Uint8Array(await root.crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');
    const base=async user=>(await R.getDB()).collection('users').doc(user);
    const emit=(state,message)=>root.dispatchEvent?.(new CustomEvent('smartstudy:sync-state',{detail:{state,message}}));
    const identifier=(subject,item)=>subject==='math'?[item.levelId,item.semesterId,item.unitId,item.type].join(':')
        :item.wrongNoteId||item.questionId||item.word||item.hanja||item.type;
    async function pack(value){
        const json=canonical(value);
        if(typeof CompressionStream==='undefined')return {encoding:'json',text:json};
        const stream=new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
        const bytes=new Uint8Array(await new Response(stream).arrayBuffer());
        let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
        return {encoding:'gzip',text:btoa(binary)};
    }
    async function unpack(body){
        if(body.encoding==='json')return JSON.parse(body.text);
        const bytes=Uint8Array.from(atob(body.text),c=>c.charCodeAt(0));
        return JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
    }
    async function writeBody(ref,value){
        const revision=await hash(canonical(value));
        const packed=await pack(value), chunks=[];
        for(let i=0;i<packed.text.length;){
            let end=Math.min(i+80000,packed.text.length);
            const last=packed.text.charCodeAt(end-1);
            if(end<packed.text.length && last>=0xD800 && last<=0xDBFF)end--;
            chunks.push(packed.text.slice(i,end));i=end;
        }
        // Immutable content-addressed chunks: an interrupted upload cannot expose a partial record.
        for(let i=0;i<chunks.length;i++)await ref.collection('recordBodies').doc(`${revision}-${i}`).set({text:chunks[i]});
        return {revision,encoding:packed.encoding,chunks:chunks.length};
    }
    async function readBody(ref,body){
        const cached=bodyCache.get(body.revision);
        if(cached)return clean(cached);
        const snaps=await Promise.all(Array.from({length:body.chunks},(_,i)=>ref.collection('recordBodies').doc(`${body.revision}-${i}`).get()));
        if(snaps.some(s=>!s.exists))throw new Error('기록의 일부를 받지 못했습니다. 다시 동기화해 주세요.');
        const value=await unpack({...body,text:snaps.map(s=>s.data().text).join('')});
        if(await hash(canonical(value))!==body.revision)throw new Error('기록 검증에 실패했습니다.');
        bodyCache.set(body.revision,value);
        return value;
    }
    async function writeRecord(user,collection,id,value){
        const ref=await base(user), key=await hash(id), ack=`ack:${user}:${collection}:${key}`;
        const revision=await hash(canonical(value));
        if(D.getMeta(ack)===revision)return;
        const record=ref.collection(collection).doc(key);
        // Merge the current server copy before publishing; immutable bodies preserve previous versions.
        const previous=await record.get();
        let merged=value;
        if(previous.exists){
            const old=await readBody(ref,previous.data().body);
            if(collection==='quizRecords' && typeof _mergeReports==='function')merged=_mergeReports([value],[old])[0];
            if(collection==='wrongRecords' && typeof _mergeWrong==='function'){
                const subject=value.subject;
                merged={subject,item:_mergeWrong({[subject]:[value.item]},{[subject]:[old.item]})[subject][0]};
            }
        }
        const body=await writeBody(ref,merged);
        const summary=collection==='quizRecords'?{...merged,metadata:{...merged.metadata}}:{subject:merged.subject,item:{...merged.item}};
        if(collection==='quizRecords'){
            delete summary.metadata.attempts;delete summary.metadata.initialAttempts;delete summary.wrongItems;
        }else{delete summary.item.history;delete summary.item.choices;delete summary.item.explanation;delete summary.item.passageText;}
        await (await R.getDB()).runTransaction(async tx=>{
            const current=await tx.get(record);
            if((current.data()?.body?.revision||null)!==(previous.data()?.body?.revision||null))throw new Error('다른 기기의 변경을 확인 중입니다. 자동으로 다시 시도합니다.');
            tx.set(record,{summary,body,syncAt:root.firebase.firestore.FieldValue.serverTimestamp(),date:Number(value.date||value.item?.date||0),dueAt:value.item?.deleted?Number.MAX_SAFE_INTEGER:Number(value.item?.dueAt||0)});
        });
        await D.setMeta(ack,revision);
    }
    const locks=new Map();
    async function serial(key,action){
        const previous=locks.get(key)||Promise.resolve();
        const run=previous.catch(()=>{}).then(action);locks.set(key,run);
        try{return await run;}finally{if(locks.get(key)===run)locks.delete(key);}
    }
    R.putReports=async(user,reports)=>serial(`reports:${user}`,async()=>{
        await D.flush();emit('uploading','퀴즈 기록 동기화 중');
        for(let i=0;i<reports.length;i+=4){
            await Promise.all(reports.slice(i,i+4).map(report=>writeRecord(user,'quizRecords',String(report.sessionId),clean(report))));
            if(i%80===0)emit('uploading',`퀴즈 기록 확인 ${Math.min(i+4,reports.length)}/${reports.length}`);
        }
    });
    R.putWrongAnswers=async(user,subjects)=>serial(`wrong:${user}`,async()=>{
        await D.flush();emit('uploading','오답 기록 동기화 중');
        const entries=Object.entries(subjects).flatMap(([subject,items])=>items.map(item=>({subject,item})));
        for(let i=0;i<entries.length;i+=4)await Promise.all(entries.slice(i,i+4).map(({subject,item})=>
            writeRecord(user,'wrongRecords',JSON.stringify([subject,identifier(subject,item)]),clean({subject,item}))));
    });
    async function changes(user,collection){
        const ref=await base(user), cursorKey=`cursor:${user}:${collection}`, cursor=D.getMeta(cursorKey)||0;
        let query=ref.collection(collection).orderBy('syncAt').where('syncAt','>=',new Date(cursor)).limit(100), last=null;
        const values=[];
        while(true){
            const page=await query.get();
            for(const snap of page.docs){values.push(await readBody(ref,snap.data().body));last=snap;}
            if(page.size<100)break;
            query=ref.collection(collection).orderBy('syncAt').where('syncAt','>=',new Date(cursor)).startAfter(last).limit(100);
        }
        // Caller commits received records locally before advancing this checkpoint.
        return {values,checkpoint:last?last.data().syncAt.toMillis():cursor,cursorKey};
    }
    R.getUserBundle=async user=>{
        await D.ready;
        const ref=await base(user), marker=await ref.collection('data').doc('storageV2').get();
        let legacy={};
        if(!marker.exists)legacy=await legacyGet(user);
        const [profile,reports,wrong]=await Promise.all([ref.get(),changes(user,'quizRecords'),changes(user,'wrongRecords')]);
        const subjects={...(legacy.wrongAnswers||{})};
        for(const value of wrong.values)(subjects[value.subject]||=[]).push(value.item);
        return {user:profile.exists?profile.data():null,reports:[...(legacy.reports||[]),...reports.values],wrongAnswers:subjects,
            checkpoints:[reports,wrong].map(({cursorKey,checkpoint})=>({cursorKey,checkpoint})),migrationRequired:!marker.exists};
    };
    R.confirmBundle=async(user,bundle)=>{
        await D.flush();
        for(const c of bundle.checkpoints||[])await D.setMeta(c.cursorKey,c.checkpoint);
        if(bundle.migrationRequired){
            // Only mark complete after all legacy/local records have confirmed individual writes.
            await R.putReports(user,app.LocalRepository.listReports(user));
            await R.putWrongAnswers(user,app.LocalRepository.getWrongAnswers(user));
            await (await base(user)).collection('data').doc('storageV2').set({version:2,completedAt:root.firebase.firestore.FieldValue.serverTimestamp()});
        }
    };
    R.getReportsPage=async(user,{before=null,start=null,end=null,limit=20}={})=>{
        let query=(await base(user)).collection('quizRecords').orderBy('date','desc');
        if(start!==null)query=query.where('date','>=',start);
        if(end!==null)query=query.where('date','<=',end);
        if(before)query=query.startAfter(before);
        const page=await query.limit(limit).get();
        return {reports:page.docs.map(s=>({...s.data().summary,_body:s.data().body})),cursor:page.docs.at(-1)||null,hasMore:page.size===limit};
    };
    R.getReportDetail=async(user,summary)=>summary._body?readBody(await base(user),summary._body):summary;
    R.getDueWrong=async(user,limit=50)=>{
        const page=await (await base(user)).collection('wrongRecords').where('dueAt','<=',Date.now()).orderBy('dueAt').limit(limit).get();
        return page.docs.map(s=>s.data().summary);
    };
    const ledgerKey=(user,date)=>`daily:${user}:${date}`;
    app.DailyLedger={
        record(user,type,subject,value){
            if(!D.isReady || !['study_time','quiz_time','time','quiz'].includes(type) || value<0)return;
            const date=new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'});
            const key=ledgerKey(user,date), row=D.getMeta(key)||{date,subjects:{}};
            const item=row.subjects[subject]||{learningTime:0,quizTime:0,quizCount:0};
            if(type==='quiz')item.quizCount++;
            else item[type==='quiz_time'?'quizTime':'learningTime']+=value;
            row.subjects[subject]=item;
            // Update the in-memory ledger synchronously; its commit joins the durable write queue.
            D.setMeta(key,row).catch(()=>{});
        }
    };
    R.putDaily=async user=>{
        await D.flush();const ref=await base(user),device=app.LocalRepository.getDeviceId();
        for(const key of D.metaKeys().filter(k=>k.startsWith(`daily:${user}:`)||k.startsWith(`legacyDay:${user}:`))){
            const row=D.getMeta(key), fingerprint=canonical(row), ack=`ack:${key}`;
            if(D.getMeta(ack)===fingerprint)continue;
            const doc=ref.collection('dailyRecords').doc(row.date);
            await (await R.getDB()).runTransaction(async tx=>{
                const snap=await tx.get(doc),old=snap.data()||{date:row.date,devices:{}};
                const devices={...old.devices},subjects={},baseline={...old.baseline};
                if(key.startsWith('legacyDay:')){
                    for(const subject of new Set([...Object.keys(row.learningTime||{}),...Object.keys(row.quizTime||{})])){
                        const prior=baseline[subject]||{};
                        baseline[subject]={learningTime:Math.max(prior.learningTime||0,row.learningTime?.[subject]||0),quizTime:Math.max(prior.quizTime||0,row.quizTime?.[subject]||0),quizCount:prior.quizCount||0};
                    }
                }else{
                    const previous=devices[device]||{};devices[device]={...previous};
                    for(const [subject,item]of Object.entries(row.subjects)){
                        devices[device][subject]={};
                        for(const field of ['learningTime','quizTime','quizCount'])devices[device][subject][field]=Math.max(previous[subject]?.[field]||0,item[field]||0);
                    }
                }
                for(const values of Object.values(devices))for(const [subject,item]of Object.entries(values)){
                    const total=subjects[subject]||={learningTime:0,quizTime:0,quizCount:0};
                    for(const field of ['learningTime','quizTime','quizCount'])total[field]+=Number(item[field]||0);
                }
                for(const [subject,item]of Object.entries(baseline)){
                    subjects[subject]||={learningTime:0,quizTime:0,quizCount:0};
                    for(const field of ['learningTime','quizTime','quizCount'])subjects[subject][field]=Math.max(subjects[subject][field],item[field]||0);
                }
                tx.set(doc,{date:row.date,devices,baseline,subjects,updatedAt:root.firebase.firestore.FieldValue.serverTimestamp()});
            });
            await D.setMeta(ack,fingerprint);
        }
    };
    R.getDaily=async(user,start,end)=>{
        const snap=await (await base(user)).collection('dailyRecords').where('date','>=',start).where('date','<=',end).orderBy('date').get();
        return snap.docs.map(s=>s.data());
    };
    R.putUser=async(user,data)=>{
        const ref=await base(user);
        await (await R.getDB()).runTransaction(async tx=>{
            const current=await tx.get(ref);
            const merged=typeof _mergeUserData==='function'?_mergeUserData(data,current.data()||{},user):data;
            tx.set(ref,clean({...merged,_updatedAt:Date.now()}),{merge:true});
        });
    };
    R.getAdminOverview=async user=>{
        await D.ready;const ref=await base(user),marker=await ref.collection('data').doc('storageV2').get();
        if(!marker.exists){const bundle=await legacyGet(user);return {...bundle,legacy:true};}
        const [profile,page,due]=await Promise.all([ref.get(),R.getReportsPage(user),R.getDueWrong(user)]);
        const wrongAnswers={};for(const value of due)(wrongAnswers[value.subject]||=[]).push(value.item);
        return {user:profile.data(),reports:page.reports,wrongAnswers,page};
    };
    app.PartitionStorage={canonical,hash,pack,unpack,identifier};
})(window);
