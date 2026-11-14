(function (root) {
    'use strict';
    const TAU = Math.PI * 2;
    let libraryPromise;
    const diagnostics = { mounts: 0, disposals: 0, live: 0, renders: 0 };

    function library() {
        if (!libraryPromise) libraryPromise = import('./vendor/three/three.module.js');
        return libraryPromise;
    }

    function surfaceTexture(T) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024; canvas.height = 512;
        const c = canvas.getContext('2d');
        const ocean = c.createLinearGradient(0, 0, 0, 512);
        ocean.addColorStop(0, '#285a73'); ocean.addColorStop(.5, '#276c89'); ocean.addColorStop(1, '#214b65');
        c.fillStyle = ocean; c.fillRect(0, 0, 1024, 512);
        // Independently drawn schematic land silhouettes; not a geographical dataset.
        const lands = [
            [[.08,.22],[.12,.12],[.23,.12],[.29,.21],[.24,.31],[.20,.35],[.18,.47],[.13,.38],[.12,.29]],
            [[.21,.44],[.29,.48],[.31,.57],[.29,.66],[.25,.81],[.23,.88],[.21,.72],[.19,.58]],
            [[.46,.31],[.52,.24],[.58,.28],[.62,.42],[.58,.57],[.53,.73],[.49,.64],[.45,.46]],
            [[.49,.20],[.55,.15],[.63,.16],[.69,.09],[.81,.14],[.90,.24],[.85,.32],[.79,.30],[.74,.39],[.69,.49],[.65,.36],[.60,.31],[.56,.28]],
            [[.77,.65],[.84,.60],[.89,.65],[.90,.75],[.84,.79],[.77,.76]],
            [[.34,.09],[.39,.07],[.41,.18],[.37,.24],[.33,.17]]
        ];
        c.fillStyle = '#83a572'; c.strokeStyle = '#b9c592'; c.lineWidth = 2;
        for (const land of lands) {
            c.beginPath(); land.forEach(([x,y], i) => i ? c.lineTo(x*1024,y*512) : c.moveTo(x*1024,y*512)); c.closePath(); c.fill(); c.stroke();
        }
        c.fillStyle = '#e2e9de'; c.fillRect(0,0,1024,20);
        c.beginPath(); c.moveTo(0,470);
        for (let x=0; x<=1024; x+=16) c.lineTo(x,470+Math.sin(x*.022)*7);
        c.lineTo(1024,512); c.lineTo(0,512); c.fill();
        c.strokeStyle = 'rgba(214,235,235,.18)'; c.lineWidth = 1;
        for (let y=64; y<512; y+=64) { c.beginPath(); c.moveTo(0,y); c.lineTo(1024,y); c.stroke(); }
        for (let x=0; x<1024; x+=128) { c.beginPath(); c.moveTo(x,0); c.lineTo(x,512); c.stroke(); }
        const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace;
        return texture;
    }

    function glowTexture(T) {
        const canvas = document.createElement('canvas'); canvas.width=64; canvas.height=64;
        const c=canvas.getContext('2d'), g=c.createRadialGradient(32,32,0,32,32,32);
        g.addColorStop(0,'rgba(255,245,214,1)'); g.addColorStop(.22,'rgba(239,215,171,.7)'); g.addColorStop(1,'rgba(239,215,171,0)');
        c.fillStyle=g; c.fillRect(0,0,64,64); return new T.CanvasTexture(canvas);
    }

    async function mount(host, options = {}) {
        const T = await library();
        if (options.isCurrent && !options.isCurrent()) throw new Error('Stale 3D mount');
        if (!host.isConnected) throw new Error('Detached 3D host');
        const narrow = matchMedia('(max-width:700px)').matches;
        const renderer = new T.WebGLRenderer({ antialias: !narrow, alpha: false, powerPreference: 'low-power' });
        renderer.setClearColor('#eaf2f0', 1);
        renderer.outputColorSpace = T.SRGBColorSpace;
        const stage=document.createElement('div'); stage.className='science-three-stage';
        const canvas=renderer.domElement; canvas.className='science-three-canvas';
        canvas.setAttribute('role','img'); canvas.setAttribute('aria-label','지구와 태양의 움직임을 보여 주는 입체 모형');
        stage.append(canvas);
        const overlay=document.createElement('div'); overlay.className='science-three-labels'; stage.append(overlay);
        const scale=document.createElement('p'); scale.className='science-three-scale'; stage.append(scale);
        host.replaceChildren(stage);
        let disposed=false, scene=null, camera=null, content=null, condition=-1, current={condition:0,step:0,time:0}, visible=true;
        let resizeObserver, intersectionObserver, lastMemory=null;
        let width=0, height=0, labelNodes=[], geometries=new Set(), materials=new Set(), textures=new Set();
        const ownG=g=>(geometries.add(g),g), ownM=m=>(materials.add(m),m), ownT=t=>(textures.add(t),t);
        const texture=ownT(surfaceTexture(T)), glow=ownT(glowTexture(T));
        const geometriesShared=new Set(), materialsShared=new Set();
        const earthGeometry=ownG(new T.SphereGeometry(1, narrow?32:48, narrow?24:32)); geometriesShared.add(earthGeometry);
        const earthMaterial=ownM(new T.MeshPhongMaterial({map:texture,color:0xffffff,shininess:10,specular:0x183d4d})); materialsShared.add(earthMaterial);
        const v=new T.Vector3(), w=new T.Vector3(), normal=new T.Vector3();
        const label=(text, getPosition, classes='')=>{
            const node=document.createElement('span'); node.className='science-three-label '+classes; node.textContent=text; overlay.append(node);
            const entry={node,getPosition}; labelNodes.push(entry); return entry;
        };
        const mesh=(geometry,material,parent=scene)=>{const object=new T.Mesh(ownG(geometry),ownM(material)); parent.add(object); return object;};
        const line=(points,color,parent=scene,dashed=false)=>{
            const geometry=ownG(new T.BufferGeometry().setFromPoints(points));
            const material=ownM(dashed?new T.LineDashedMaterial({color,dashSize:.12,gapSize:.09,transparent:true,opacity:.6}):new T.LineBasicMaterial({color,transparent:true,opacity:.7}));
            const object=new T.Line(geometry,material); if(dashed)object.computeLineDistances(); parent.add(object); return object;
        };
        function earth(radius,parent=scene) {
            const tilt=new T.Group(); tilt.rotation.z=T.MathUtils.degToRad(-23.4); parent.add(tilt);
            const spin=new T.Group(); tilt.add(spin);
            const sphere=new T.Mesh(earthGeometry,earthMaterial); sphere.scale.setScalar(radius); spin.add(sphere);
            const axis=line([new T.Vector3(0,-radius*1.45,0),new T.Vector3(0,radius*1.45,0)],0xa58e5a,tilt);
            const atmosphere=mesh(new T.SphereGeometry(radius*1.025,32,20),new T.MeshBasicMaterial({color:0x82c5dc,transparent:true,opacity:.12,side:T.BackSide,depthWrite:false}),tilt);
            return {tilt,spin,sphere,axis,atmosphere,radius};
        }
        function clearScene() {
            overlay.replaceChildren(); labelNodes=[]; content=null;
            for(const g of [...geometries])if(!geometriesShared.has(g)){g.dispose();geometries.delete(g);}
            for(const m of [...materials])if(!materialsShared.has(m)){m.dispose();materials.delete(m);}
        }
        function stars(count,galaxy) {
            const positions=[],colors=[];
            for(let i=0;i<count;i++){
                const k=(i*.61803398875)%1, arm=i%4, r=galaxy?.28+Math.sqrt(k)*4.7:8+((i*43)%90)/10;
                const a=galaxy?arm*Math.PI/2+r*.83+Math.sin(i*17.3)*.13:i*2.39996;
                const y=galaxy?Math.sin(i*13.1)*(.045+.08*(1-r/5)):Math.sin(i*.39)*5;
                positions.push(Math.cos(a)*r,y,Math.sin(a)*r);
                const color=new T.Color(i%5===0?0xe9c294:i%3===0?0x9bbfdb:0xe3e9e5); colors.push(color.r,color.g,color.b);
            }
            const g=ownG(new T.BufferGeometry()); g.setAttribute('position',new T.Float32BufferAttribute(positions,3)); g.setAttribute('color',new T.Float32BufferAttribute(colors,3));
            const material=ownM(new T.PointsMaterial({size:galaxy?.035:.027,vertexColors:true,transparent:true,opacity:galaxy?.9:.35,depthWrite:false,sizeAttenuation:true}));
            const points=new T.Points(g,material); scene.add(points); return points;
        }
        function build(next) {
            clearScene(); condition=next;
            scene=new T.Scene(); camera=new T.PerspectiveCamera(37,1,.05,80);
            if(next===0){
                renderer.setClearColor('#eaf2f0',1); camera.position.set(0,1.4,8.5); camera.lookAt(.1,0,0);
                scene.add(new T.AmbientLight(0xb2ced8,.1));
                const light=new T.DirectionalLight(0xffeed1,2.8); light.position.set(-7,1.8,2.5); light.target.position.set(.55,0,0); scene.add(light,light.target);
                const globe=earth(1.45); globe.tilt.position.x=.55;
                const sun=mesh(new T.SphereGeometry(.38,24,16),new T.MeshBasicMaterial({color:0xf2c36f})); sun.position.set(-2.55,.3,0);
                const observer=mesh(new T.SphereGeometry(.055,12,8),new T.MeshBasicMaterial({color:0xe76f42}),globe.spin);
                observer.position.set(1.45*Math.cos(.42),1.45*Math.sin(.42),0).multiplyScalar(1.018);
                const rays=[];
                for(const y of [-.6,0,.6]){const arrow=new T.ArrowHelper(new T.Vector3(1,0,0),new T.Vector3(-2.05,y,0),.92,0xc99b4a,.14,.09);scene.add(arrow);arrow.traverse(o=>{if(o.geometry)ownG(o.geometry);if(o.material)ownM(o.material);});rays.push(arrow);}
                const observerLabel=label('地표 관찰점'.replace('地','지'),()=>observer.getWorldPosition(v),'observer');
                label('태양빛 →',()=>new T.Vector3(-2.35,-.95,0));
                label('자전축',()=>globe.tilt.localToWorld(new T.Vector3(0,2,0)));
                content={globe,observer,observerLabel,light,sun,rays};
                scale.textContent='자전 약 하루 · 공전 생략 · 화면 한 바퀴 18초 · 크기·거리 비례 아님';
            }else if(next===1){
                renderer.setClearColor('#142d3d',1); camera.position.set(0,5.7,8.8); camera.lookAt(0,0,0);
                scene.add(new T.AmbientLight(0x7da0b0,.16));
                const light=new T.PointLight(0xffe2a3,70,0,2); scene.add(light);
                const sun=mesh(new T.SphereGeometry(.52,32,24),new T.MeshBasicMaterial({color:0xf0bf69}));
                const halo=new T.Sprite(ownM(new T.SpriteMaterial({map:glow,color:0xffce7b,transparent:true,opacity:.55,depthWrite:false}))); halo.scale.set(2.3,2.3,1);scene.add(halo);
                const points=Array.from({length:161},(_,i)=>new T.Vector3(3.1*Math.cos(i/160*TAU),0,3.1*Math.sin(i/160*TAU)));
                line(points,0xa6b5be,scene,true);
                const globe=earth(.4);
                const trail=line(Array.from({length:31},()=>new T.Vector3()),0xd3b06a);trail.geometry.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(31*3),3));
                label('태양',()=>new T.Vector3(0,.75,0)); label('지구',()=>globe.tilt.position.clone().add(new T.Vector3(0,.7,0)),'earth-label');
                content={globe,light,sun,trail};
                scale.textContent='공전 약 1년 · 자전 애니메이션 생략 · 화면 한 바퀴 18초 · 앞 장면과 시간·거리 축척이 달라요';
            }else{
                renderer.setClearColor('#102333',1); camera.position.set(0,8,11.8); camera.lookAt(0,0,0);
                stars(narrow?1700:3800,true);
                // A diffuse stellar bulge, not a black hole or a central sun.
                const centerPositions=[];for(let i=0;i<(narrow?220:500);i++){const a=i*2.39996,r=Math.pow((i*.61803398875)%1,.7)*.85;centerPositions.push(Math.cos(a)*r,Math.sin(i*5.7)*.25*(1-r),Math.sin(a)*r);}const centerGeometry=ownG(new T.BufferGeometry());centerGeometry.setAttribute('position',new T.Float32BufferAttribute(centerPositions,3));const bulge=new T.Points(centerGeometry,ownM(new T.PointsMaterial({color:0xe9d1a9,size:.035,transparent:true,opacity:.7,depthWrite:false})));scene.add(bulge);
                const halo=new T.Sprite(ownM(new T.SpriteMaterial({map:glow,color:0xf5d4a3,transparent:true,opacity:.45,depthWrite:false})));halo.scale.set(3.2,2.1,1);scene.add(halo);
                line(Array.from({length:161},(_,i)=>new T.Vector3(3.55*Math.cos(i/160*TAU),.07,3.55*Math.sin(i/160*TAU))),0xc4ad7d,scene,true);
                const solar=mesh(new T.SphereGeometry(.105,14,10),new T.MeshBasicMaterial({color:0xf4bf58}));
                const ring=mesh(new T.TorusGeometry(.18,.018,6,30),new T.MeshBasicMaterial({color:0xffdc8a})); ring.rotation.x=Math.PI/2;
                label('은하 중심 · 별이 밀집한 부분',()=>new T.Vector3(0,.9,0)); label('태양계',()=>solar.position.clone().add(new T.Vector3(0,.35,0)),'solar-label');
                content={solar,ring,bulge};
                scale.textContent='은하 공전 약 2억3천만 년 · 독립 시간·거리 축척 · 나선 구조·태양계 궤도는 설명용 모형';
            }
            if(next!==2)stars(narrow?140:260,false);
            resize();
        }
        function projectLabels() {
            for(const {node,getPosition} of labelNodes){
                const point=getPosition().clone().project(camera);
                const half=Math.min(width/2-8,node.offsetWidth/2+4);node.style.left=Math.max(half,Math.min(width-half,(point.x*.5+.5)*width))+'px';
                const margin=node.offsetHeight/2+4;node.style.top=Math.max(margin,Math.min(height-scale.offsetHeight-16-margin,(-point.y*.5+.5)*height))+'px';
                node.hidden=point.z>1||point.z<-1;
            }
        }
        function update(model) {
            if(disposed)return;
            current={...model};
            try{
                if(condition!==Number(model.condition||0))build(Number(model.condition||0));
                const phase=(Number(model.time)||0)*TAU;
                if(condition===0){
                    content.globe.spin.rotation.y=phase;
                    scene.updateMatrixWorld(true);
                    const center=content.globe.tilt.getWorldPosition(w);
                    const point=content.observer.getWorldPosition(v);
                    normal.copy(point).sub(center).normalize();
                    const sunDirection=content.light.position.clone().sub(center).normalize();
                    const daylight=normal.dot(sunDirection)>=0;
                    const front=normal.dot(camera.position.clone().sub(center).normalize())>0;
                    content.observerLabel.node.textContent='지표 관찰점 · '+(daylight?'낮':'밤')+(front?'':' (뒷면)');
                    content.observerLabel.node.classList.toggle('is-back',!front);
                    canvas.dataset.observerDay=String(daylight);canvas.dataset.observerVisible=String(front);
                }else if(condition===1){
                    content.globe.tilt.position.set(3.1*Math.cos(phase),0,3.1*Math.sin(phase));
                    // Tilt stays in world coordinates. No orbit parent, no spin animation.
                    content.globe.spin.rotation.y=0;
                    const points=content.trail.geometry.attributes.position;
                    for(let i=0;i<31;i++){const a=phase-(30-i)*.018;points.setXYZ(i,3.1*Math.cos(a),.01,3.1*Math.sin(a));}points.needsUpdate=true;
                    const axisDirection=new T.Vector3(0,1,0).applyQuaternion(content.globe.tilt.quaternion); canvas.dataset.axis=axisDirection.toArray().join(',');
                }else{
                    content.solar.position.set(3.55*Math.cos(phase),.1,3.55*Math.sin(phase));content.ring.position.copy(content.solar.position);
                }
                scene.updateMatrixWorld(true);
                projectLabels();
                if(width&&height&&visible&&!document.hidden){renderer.render(scene,camera);diagnostics.renders++;}
                canvas.dataset.condition=String(condition); canvas.dataset.time=String(model.time||0);
            }catch(error){fail(error);}
        }
        function resize() {
            if(disposed)return;
            const rect=stage.getBoundingClientRect();width=rect.width;height=rect.height;
            if(!width||!height)return;
            const ratio=Math.min(devicePixelRatio||1,1.5,Math.sqrt(1000000/(width*height)));
            renderer.setPixelRatio(ratio);renderer.setSize(width,height,false);
            if(camera){camera.aspect=width/height;camera.updateProjectionMatrix();}
        }
        function fail(error){if(disposed)return;dispose();options.onFallback?.(error);}
        function contextLost(event){event.preventDefault();fail(new Error('WebGL context lost'));}
        canvas.addEventListener('webglcontextlost',contextLost);
        resizeObserver=new ResizeObserver(()=>{resize();if(scene)update(current);});resizeObserver.observe(stage);
        if(typeof IntersectionObserver!=='undefined'){intersectionObserver=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting!==false;options.onVisibility?.(visible);if(visible&&scene)update(current);});intersectionObserver.observe(stage);}
        function dispose(){
            if(disposed)return;disposed=true;lastMemory={...renderer.info.memory};
            resizeObserver?.disconnect();intersectionObserver?.disconnect();canvas.removeEventListener('webglcontextlost',contextLost);
            for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();
            geometries.clear();materials.clear();textures.clear();renderer.renderLists.dispose();renderer.dispose();renderer.forceContextLoss();
            stage.remove();diagnostics.disposals++;diagnostics.live--;
        }
        diagnostics.mounts++;diagnostics.live++;
        return {update,resize,dispose,getState:()=>({condition,visible,disposed,revision:T.REVISION,memory:disposed?lastMemory:{...renderer.info.memory},width,height,bufferPixels:canvas.width*canvas.height}),isVisible:()=>visible};
    }
    root.ScienceOrbitThree={mount,diagnostics};
})(window);
