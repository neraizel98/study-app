(function (root) {
    'use strict';
    const app = root.SmartStudy = root.SmartStudy || {};
    const cache = new Map(), metadata = new Map(), committed = new Map(), states = new Map();
    let db, tail = Promise.resolve(), failure = null, pending = 0;
    const clone = value => JSON.parse(JSON.stringify(value));
    const kind = key => key.startsWith('SmartVocab_Reports_') ? 'reports'
        : key.startsWith('SmartStudy_WrongAnswers_') ? 'wrong' : null;
    const parts = (key, raw) => {
        const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (kind(key) === 'reports') return (value.items || value || []).map(item => [String(item.sessionId), item]);
        return Object.entries(value.subjects || value || {}).flatMap(([subject, items]) =>
            (items || []).map(item => [JSON.stringify([subject, item.wrongNoteId ||
                (subject === 'math' ? [item.levelId,item.semesterId,item.unitId,item.type].join(':') : item.questionId || item.word || item.hanja || item.type)]), { subject, item }]));
    };
    function transaction(stores, action) {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(stores, 'readwrite');
            tx.oncomplete = resolve;
            tx.onerror = tx.onabort = () => reject(tx.error || new Error('기기 저장에 실패했습니다.'));
            action(tx);
        });
    }
    function queue(action, key) {
        pending++;
        const revision=(states.get(key)?.revision||0)+1;
        states.set(key,{revision,persisted:false});
        const result = tail.then(action).then(()=>{
            if(states.get(key)?.revision===revision)states.set(key,{revision,persisted:true});
            root.dispatchEvent?.(new CustomEvent('smartstudy:storage-committed', {detail:{key}}));
        }).catch(error => {
            if(states.get(key)?.revision===revision)states.set(key,{revision,persisted:false,error});
            root.dispatchEvent?.(new CustomEvent('smartstudy:storage-error', {detail:{message:error.message}}));
            throw error;
        }).finally(()=>{pending--;});
        tail=result.catch(()=>{});
        return result;
    }
    const store = {
        isReady: false, parts,
        handles: key => Boolean(kind(key)),
        has: key => cache.has(key),
        read(key) {
            const rows = cache.get(key);
            if (!rows) return null;
            if (kind(key) === 'reports') return JSON.stringify({schemaVersion:4,items:[...rows.values()]});
            const subjects = Object.fromEntries((metadata.get('subjects:'+key)||[]).map(subject=>[subject,[]]));
            for (const {subject,item} of rows.values()) (subjects[subject] ||= []).push(item);
            return JSON.stringify({schemaVersion:3,subjects});
        },
        write(key, raw) {
            if (!store.isReady) throw new Error('학습 기록을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
            const rows = cache.get(key) || new Map();
            if(kind(key)==='wrong'){
                const parsed=typeof raw==='string'?JSON.parse(raw):raw;
                const names=Object.keys(parsed.subjects||parsed);
                metadata.set('subjects:'+key,names);
            }
            const next = new Map(parts(key, raw).map(([id,value]) => [id,clone(value)]));
            if(kind(key)==='wrong')for(const [part,value]of rows)if(!next.has(part)){
                next.set(part,value.item.deleted?value:{subject:value.subject,item:{...value.item,deleted:true,deletedAt:Date.now(),date:Date.now()}});
            }
            cache.set(key,next);
            const names=clone(metadata.get('subjects:'+key)||[]);
            return queue(async()=>{
                const previous=committed.get(key)||new Map();
                const changed=[...next].filter(([id,value])=>JSON.stringify(previous.get(id))!==JSON.stringify(value));
                const removed=[...previous.keys()].filter(id=>!next.has(id));
                await transaction(['records','meta'],tx=>{
                    const table=tx.objectStore('records');
                    changed.forEach(([part,value])=>table.put({id:JSON.stringify([key,part]),key,part,value}));
                    removed.forEach(part=>table.delete(JSON.stringify([key,part])));
                    if(kind(key)==='wrong')tx.objectStore('meta').put({key:'subjects:'+key,value:names});
                });
                committed.set(key,new Map(next));
            },key);
        },
        keys: ()=>[...cache.keys()],
        getMeta: key=>clone(metadata.get(key) ?? null),
        async setMeta(key,value) {
            const snapshot=clone(value);
            metadata.set(key,snapshot);
            await store.ready;
            await queue(()=>transaction(['meta'],tx=>tx.objectStore('meta').put({key,value:snapshot})),'meta:'+key);
        },
        metaKeys: ()=>[...metadata.keys()],
        isPersisted: key=>!states.has(key)||states.get(key).persisted,
        async flush() {
            await store.ready;
            let observed;do{observed=tail;await observed;}while(observed!==tail);
            if(failure)throw failure;
            const unresolved=[...states.values()].find(state=>!state.persisted);
            if(unresolved)throw unresolved.error||new Error('학습 기록을 저장 중입니다.');
        },
        async retry() {
            await store.ready;await tail;
            const dirty=[...states].filter(([,s])=>!s.persisted).map(([key])=>key);
            for(const key of dirty){
                if(key.startsWith('meta:'))await store.setMeta(key.slice(5),store.getMeta(key.slice(5)));
                else await store.write(key,store.read(key));
            }
            await store.flush();
        },
        async clear() {
            await store.flush();
            await transaction(['records','meta'],tx=>{tx.objectStore('records').clear();tx.objectStore('meta').clear();});
            cache.clear(); metadata.clear();committed.clear();states.clear();
        }
    };
    store.ready = new Promise((resolve,reject)=>{
        if(!root.indexedDB) {reject(new Error('이 브라우저에서 안전한 기록 저장소를 열 수 없습니다.'));return;}
        const request=root.indexedDB.open('SmartStudyRecords',1);
        request.onupgradeneeded=()=>{
            request.result.createObjectStore('records',{keyPath:'id'});
            request.result.createObjectStore('meta',{keyPath:'key'});
        };
        request.onerror=()=>reject(request.error);
        request.onblocked=()=>reject(new Error('다른 스마트 스터디 탭을 닫고 다시 열어 주세요.'));
        request.onsuccess=async()=>{
            db=request.result;
            try {
                await new Promise((done,fail)=>{
                    const tx=db.transaction(['records','meta'],'readonly');
                    tx.objectStore('records').openCursor().onsuccess=e=>{
                        const c=e.target.result;if(!c)return;
                        const row=c.value;if(!cache.has(row.key))cache.set(row.key,new Map());
                        cache.get(row.key).set(row.part,row.value);c.continue();
                    };
                    tx.objectStore('meta').openCursor().onsuccess=e=>{const c=e.target.result;if(c){metadata.set(c.key,c.value.value);c.continue();}};
                    tx.oncomplete=done;tx.onerror=()=>fail(tx.error);
                });
                // Migrate atomically, retaining the exact legacy envelope as a recovery copy.
                const keys=Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).filter(key=>kind(key)&&!key.includes('.backup.'));
                for(const key of keys){
                    const raw=localStorage.getItem(key);
                    const rows=new Map(cache.get(key)||[]);
                    for(const [part,value]of parts(key,raw)){
                        const existing=rows.get(part);
                        if(!existing){rows.set(part,value);continue;}
                        const old=kind(key)==='wrong'?existing.item:existing;
                        const incoming=kind(key)==='wrong'?value.item:value;
                        const newer=Number(incoming.updatedAt||incoming.date||0)>Number(old.updatedAt||old.date||0)?incoming:old;
                        const merged={...old,...newer};
                        if(kind(key)==='wrong'){
                            const history=new Map([...(old.history||[]),...(incoming.history||[])].map(event=>[event.eventId||JSON.stringify(event),event]));
                            merged.history=[...history.values()].sort((a,b)=>(a.createdAt||a.date||0)-(b.createdAt||b.date||0));
                            rows.set(part,{subject:value.subject,item:merged});
                        }else{
                            if(old.metadata?.initialAttempts)merged.metadata={...merged.metadata,initialAttempts:old.metadata.initialAttempts};
                            rows.set(part,merged);
                        }
                    }
                    const parsed=JSON.parse(raw),names=kind(key)==='wrong'?Object.keys(parsed.subjects||parsed):[];
                    await transaction(['records','meta'],tx=>{
                        tx.objectStore('meta').put({key:(cache.has(key)?'archive:'+Date.now()+':':'archive:')+key,value:raw});
                        tx.objectStore('meta').put({key:'subjects:'+key,value:names});
                        rows.forEach((value,part)=>tx.objectStore('records').put({id:JSON.stringify([key,part]),key,part,value}));
                    });
                    cache.set(key,rows);
                    metadata.set('subjects:'+key,names);
                    // Remove only after the transaction commits; original is preserved in archive.
                    localStorage.removeItem(key);
                }
                for(const [key,rows] of cache)committed.set(key,new Map(rows));
                store.isReady=true;resolve();
            }catch(error){reject(error);}
        };
    });
    store.ready.catch(error=>{failure=error;root.dispatchEvent?.(new CustomEvent('smartstudy:storage-error',{detail:{message:error.message}}));});
    app.DurableStore=store;
    root.addEventListener?.('beforeunload',event=>{
        // A normal clock/cursor metadata write on pagehide must not block a saved quiz's next step.
        // Pending answer records and any failed write still require the recovery warning.
        const unsafe=[...states].some(([key,s])=>!s.persisted&&(!key.startsWith('meta:')||s.error));
        if(failure || unsafe){event.preventDefault();event.returnValue='';}
    });
})(window);
