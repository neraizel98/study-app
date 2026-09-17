(function (root) {
    'use strict';
    const app = root.SmartStudy = root.SmartStudy || {};
    const cache = new Map(), metadata = new Map();
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
    function queue(action) {
        pending++;
        tail = tail.then(action).catch(error => {
            failure = error;
            root.dispatchEvent?.(new CustomEvent('smartstudy:storage-error', {detail:{message:error.message}}));
        }).finally(()=>{pending--;});
        return tail;
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
                queue(()=>transaction(['meta'],tx=>tx.objectStore('meta').put({key:'subjects:'+key,value:names})));
            }
            const next = new Map(parts(key, raw).map(([id,value]) => [id,clone(value)]));
            if(kind(key)==='wrong')for(const [part,value]of rows)if(!next.has(part)){
                next.set(part,value.item.deleted?value:{subject:value.subject,item:{...value.item,deleted:true,deletedAt:Date.now(),date:Date.now()}});
            }
            const changed = [...next].filter(([id,value])=>JSON.stringify(rows.get(id))!==JSON.stringify(value));
            const removed = [...rows.keys()].filter(id=>!next.has(id));
            cache.set(key,next);
            return queue(()=>transaction(['records'],tx=>{
                const table=tx.objectStore('records');
                changed.forEach(([part,value])=>table.put({id:JSON.stringify([key,part]),key,part,value}));
                removed.forEach(part=>table.delete(JSON.stringify([key,part])));
            }));
        },
        keys: ()=>[...cache.keys()],
        getMeta: key=>clone(metadata.get(key) ?? null),
        async setMeta(key,value) {
            metadata.set(key,clone(value));
            await store.ready;
            await queue(()=>transaction(['meta'],tx=>tx.objectStore('meta').put({key,value})));
            if(failure) throw failure;
        },
        metaKeys: ()=>[...metadata.keys()],
        async flush() { await store.ready; await tail; if(failure) throw failure; },
        async clear() {
            await store.flush();
            await transaction(['records','meta'],tx=>{tx.objectStore('records').clear();tx.objectStore('meta').clear();});
            cache.clear(); metadata.clear();
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
                store.isReady=true;resolve();
            }catch(error){reject(error);}
        };
    });
    store.ready.catch(error=>{failure=error;root.dispatchEvent?.(new CustomEvent('smartstudy:storage-error',{detail:{message:error.message}}));});
    app.DurableStore=store;
    root.addEventListener?.('beforeunload',event=>{
        if(pending || failure){event.preventDefault();event.returnValue='';}
    });
})(window);
