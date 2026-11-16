(function (root) {
    'use strict';
    const TAU = Math.PI * 2;
    let libraryPromise;

    function library() {
        if (!libraryPromise) libraryPromise = import('./vendor/three/three.module.js');
        return libraryPromise;
    }

    function earthTexture(T) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024; canvas.height = 512;
        const c = canvas.getContext('2d');
        const ocean = c.createLinearGradient(0, 0, 0, 512);
        ocean.addColorStop(0, '#245268'); ocean.addColorStop(.5, '#286885'); ocean.addColorStop(1, '#1e445b');
        c.fillStyle = ocean; c.fillRect(0, 0, 1024, 512);
        const lands = [
            [[.08,.22],[.12,.12],[.23,.12],[.29,.21],[.24,.31],[.20,.35],[.18,.47],[.13,.38],[.12,.29]],
            [[.21,.44],[.29,.48],[.31,.57],[.29,.66],[.25,.81],[.23,.88],[.21,.72],[.19,.58]],
            [[.46,.31],[.52,.24],[.58,.28],[.62,.42],[.58,.57],[.53,.73],[.49,.64],[.45,.46]],
            [[.49,.20],[.55,.15],[.63,.16],[.69,.09],[.81,.14],[.90,.24],[.85,.32],[.79,.30],[.74,.39],[.69,.49],[.65,.36],[.60,.31],[.56,.28]],
            [[.77,.65],[.84,.60],[.89,.65],[.90,.75],[.84,.79],[.77,.76]],
            [[.34,.09],[.39,.07],[.41,.18],[.37,.24],[.33,.17]]
        ];
        c.fillStyle = '#7ba069'; c.strokeStyle = '#b2c08b'; c.lineWidth = 2;
        for (const land of lands) {
            c.beginPath(); land.forEach(([x,y], i) => i ? c.lineTo(x*1024,y*512) : c.moveTo(x*1024,y*512)); c.closePath(); c.fill(); c.stroke();
        }
        c.fillStyle = '#e4ece0'; c.fillRect(0,0,1024,22);
        c.beginPath(); c.moveTo(0,470);
        for (let x=0; x<=1024; x+=16) c.lineTo(x,470+Math.sin(x*.022)*7);
        c.lineTo(1024,512); c.lineTo(0,512); c.fill();
        const texture = new T.CanvasTexture(canvas);
        texture.colorSpace = T.SRGBColorSpace;
        return texture;
    }

    function moonTexture(T) {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 256;
        const c = canvas.getContext('2d');
        c.fillStyle = '#d6dbdb'; c.fillRect(0, 0, 512, 256);
        c.fillStyle = '#a1a8a8';
        const maria = [
            [150, 90, 45, 30], [220, 80, 55, 35], [290, 110, 40, 30],
            [170, 150, 50, 30], [250, 160, 60, 40], [380, 100, 35, 25]
        ];
        for (const [x, y, rx, ry] of maria) {
            c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill();
        }
        c.fillStyle = '#eaf0f0';
        for (let i = 0; i < 40; i++) {
            const cx = (i * 73) % 512, cy = (i * 37) % 256, r = 2 + (i % 3);
            c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fill();
        }
        const texture = new T.CanvasTexture(canvas);
        texture.colorSpace = T.SRGBColorSpace;
        return texture;
    }

    function glowTexture(T) {
        const canvas = document.createElement('canvas'); canvas.width=64; canvas.height=64;
        const c=canvas.getContext('2d'), g=c.createRadialGradient(32,32,0,32,32,32);
        g.addColorStop(0,'rgba(255,245,214,1)'); g.addColorStop(.25,'rgba(245,218,160,.7)'); g.addColorStop(1,'rgba(245,218,160,0)');
        c.fillStyle=g; c.fillRect(0,0,64,64); return new T.CanvasTexture(canvas);
    }

    async function mount(host, options = {}) {
        const T = await library();
        if (options.isCurrent && !options.isCurrent()) throw new Error('Stale 3D mount');
        if (!host.isConnected) throw new Error('Detached 3D host');
        const narrow = matchMedia('(max-width:700px)').matches;
        const renderer = new T.WebGLRenderer({ antialias: !narrow, alpha: false, powerPreference: 'low-power' });
        renderer.setClearColor('#102231', 1);
        renderer.outputColorSpace = T.SRGBColorSpace;

        const stage = document.createElement('div'); stage.className = 'science-three-stage';
        const canvas = renderer.domElement; canvas.className = 'science-three-canvas';
        canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', '달의 공전과 지구 계절 변화를 보여 주는 3D 입체 모형');
        stage.append(canvas);

        const overlay = document.createElement('div'); overlay.className = 'science-three-labels'; stage.append(overlay);
        const scale = document.createElement('p'); scale.className = 'science-three-scale'; stage.append(scale);
        host.replaceChildren(stage);

        let disposed = false, scene = null, camera = null, content = null, condition = -1, visible = true;
        let resizeObserver, intersectionObserver;
        let width = 0, height = 0, labelNodes = [];
        let geometries = new Set(), materials = new Set(), textures = new Set();
        const ownG = g => (geometries.add(g), g), ownM = m => (materials.add(m), m), ownT = t => (textures.add(t), t);

        const earthTex = ownT(earthTexture(T)), moonTex = ownT(moonTexture(T)), glow = ownT(glowTexture(T));
        const sharedG = new Set(), sharedM = new Set();

        const earthGeo = ownG(new T.SphereGeometry(1, narrow ? 32 : 48, narrow ? 24 : 32)); sharedG.add(earthGeo);
        const earthMat = ownM(new T.MeshPhongMaterial({ map: earthTex, color: 0xffffff, shininess: 10, specular: 0x183d4d })); sharedM.add(earthMat);

        const moonGeo = ownG(new T.SphereGeometry(1, 28, 20)); sharedG.add(moonGeo);
        const moonMat = ownM(new T.MeshPhongMaterial({ map: moonTex, color: 0xffffff, shininess: 2, specular: 0x111111 })); sharedM.add(moonMat);

        const v = new T.Vector3();
        const label = (text, getPosition, classes = '') => {
            const node = document.createElement('span'); node.className = 'science-three-label ' + classes; node.textContent = text; overlay.append(node);
            const entry = { node, getPosition }; labelNodes.push(entry); return entry;
        };
        const mesh = (geometry, material, parent = scene) => { const obj = new T.Mesh(ownG(geometry), ownM(material)); parent.add(obj); return obj; };
        const line = (points, color, parent = scene, dashed = false) => {
            const geometry = ownG(new T.BufferGeometry().setFromPoints(points));
            const material = ownM(dashed ? new T.LineDashedMaterial({ color, dashSize: .15, gapSize: .1, transparent: true, opacity: .6 }) : new T.LineBasicMaterial({ color, transparent: true, opacity: .7 }));
            const obj = new T.Line(geometry, material); if (dashed) obj.computeLineDistances(); parent.add(obj); return obj;
        };

        function createEarth(radius, parent = scene) {
            const tilt = new T.Group(); tilt.rotation.z = T.MathUtils.degToRad(-23.4); parent.add(tilt);
            const spin = new T.Group(); tilt.add(spin);
            const sphere = new T.Mesh(earthGeo, earthMat); sphere.scale.setScalar(radius); spin.add(sphere);
            line([new T.Vector3(0, -radius * 1.5, 0), new T.Vector3(0, radius * 1.5, 0)], 0xa58e5a, tilt);
            return { tilt, spin, sphere, radius };
        }

        function clearScene() {
            overlay.replaceChildren(); labelNodes = []; content = null;
            for (const g of [...geometries]) if (!sharedG.has(g)) { g.dispose(); geometries.delete(g); }
            for (const m of [...materials]) if (!sharedM.has(m)) { m.dispose(); materials.delete(m); }
        }

        function build(next) {
            clearScene(); condition = next;
            scene = new T.Scene(); camera = new T.PerspectiveCamera(36, 1, .05, 80);

            if (next === 0) {
                // 달의 위치와 모양: 중심 지구 + 공전하는 달 + 왼쪽 태양빛
                renderer.setClearColor('#0d1b28', 1);
                camera.position.set(0, 5.5, 7.8); camera.lookAt(0, 0, 0);
                scene.add(new T.AmbientLight(0x5c7b8e, .2));
                const sunLight = new T.DirectionalLight(0xfff0d4, 3.2);
                sunLight.position.set(-10, 1.2, 0); sunLight.target.position.set(0, 0, 0);
                scene.add(sunLight, sunLight.target);

                const globe = createEarth(0.85);
                const orbitRadius = 2.85;
                const orbitPts = Array.from({ length: 121 }, (_, i) => new T.Vector3(orbitRadius * Math.cos(i / 120 * TAU), 0, orbitRadius * Math.sin(i / 120 * TAU)));
                line(orbitPts, 0x7694a0, scene, true);

                const moonPivot = new T.Group(); scene.add(moonPivot);
                const moonSphere = new T.Mesh(moonGeo, moonMat); moonSphere.scale.setScalar(0.32);
                moonSphere.position.set(orbitRadius, 0, 0); moonPivot.add(moonSphere);

                label('지구', () => new T.Vector3(0, 1.1, 0), 'earth-label');
                label('달', () => moonSphere.getWorldPosition(v).add(new T.Vector3(0, .5, 0)), 'moon-label');
                label('태양빛 →', () => new T.Vector3(-3.4, 0, 0), 'solar-label');

                content = { globe, moonPivot, moonSphere, orbitRadius };
                scale.textContent = '달의 공전과 위상 · 태양을 향한 반구가 밝음 · 지구에서 보는 각도에 따라 위상 변화';
            } else {
                // 기울어진 자전축과 계절: 태양 중심 + 23.5° 기울기 유지 공전
                renderer.setClearColor('#0e1d2c', 1);
                camera.position.set(0, 6.2, 9.2); camera.lookAt(0, 0, 0);
                scene.add(new T.AmbientLight(0x658091, .2));

                const sunLight = new T.PointLight(0xffdf99, 65, 0, 2); scene.add(sunLight);
                mesh(new T.SphereGeometry(0.68, 32, 24), new T.MeshBasicMaterial({ color: 0xf5c667 }));
                const halo = new T.Sprite(ownM(new T.SpriteMaterial({ map: glow, color: 0xffd27d, transparent: true, opacity: .55, depthWrite: false })));
                halo.scale.set(2.8, 2.8, 1); scene.add(halo);

                const orbitRadius = 3.6;
                const orbitPts = Array.from({ length: 161 }, (_, i) => new T.Vector3(orbitRadius * Math.cos(i / 160 * TAU), 0, orbitRadius * Math.sin(i / 160 * TAU)));
                line(orbitPts, 0x8ea2af, scene, true);

                const globe = createEarth(0.48);
                label('태양', () => new T.Vector3(0, .9, 0), 'solar-label');
                label('지구 (자전축 23.5° 유지)', () => globe.tilt.position.clone().add(new T.Vector3(0, .75, 0)), 'earth-label');

                content = { globe, sunLight, orbitRadius };
                scale.textContent = '기울어진 자전축 유지 공전 · 반구별 햇빛 입사각 변화 · 계절은 거리 하나로 설명하지 않아요';
            }
            resize();
        }

        function resize() {
            if (!stage.isConnected || disposed) return;
            const rect = stage.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            width = rect.width; height = rect.height;
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            renderer.setPixelRatio(dpr);
            renderer.setSize(width, height, false);
            if (camera) { camera.aspect = width / height; camera.updateProjectionMatrix(); }
            updateLabels();
        }

        function updateLabels() {
            if (!camera || !width || !height) return;
            for (const { node, getPosition } of labelNodes) {
                const pos = getPosition();
                v.copy(pos).project(camera);
                const x = (v.x * .5 + .5) * width;
                const y = (-v.y * .5 + .5) * height;
                node.style.left = x.toFixed(1) + 'px';
                node.style.top = y.toFixed(1) + 'px';
                node.classList.toggle('is-back', v.z > 1 || v.z < -1);
            }
        }

        function renderFrame() {
            if (!scene || !camera || disposed || !visible) return;
            renderer.render(scene, camera);
            updateLabels();
        }

        function update(model) {
            if (disposed) return;
            const nextCondition = Number(model.condition) || 0;
            if (condition !== nextCondition) build(nextCondition);

            const t = Number(model.time) || 0;
            const angle = (t % 1) * TAU;

            if (condition === 0 && content) {
                content.moonPivot.rotation.y = angle;
                content.globe.spin.rotation.y = t * 4;
            } else if (condition === 1 && content) {
                const x = content.orbitRadius * Math.cos(angle);
                const z = content.orbitRadius * Math.sin(angle);
                content.globe.tilt.position.set(x, 0, z);
                content.globe.spin.rotation.y = t * 8;
            }
            renderFrame();
        }

        resizeObserver = new ResizeObserver(() => { resize(); renderFrame(); });
        resizeObserver.observe(stage);

        intersectionObserver = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) renderFrame();
            if (options.onVisibility) options.onVisibility(visible);
        }, { threshold: 0.1 });
        intersectionObserver.observe(stage);

        build(Number(options.condition) || 0);

        function dispose() {
            if (disposed) return;
            disposed = true;
            resizeObserver?.disconnect();
            intersectionObserver?.disconnect();
            clearScene();
            for (const g of sharedG) g.dispose();
            for (const m of sharedM) m.dispose();
            for (const t of textures) t.dispose();
            renderer.dispose();
            stage.remove();
        }

        return {
            update,
            dispose,
            isVisible: () => visible && !disposed,
            getState: () => ({ kind: 'moon-seasons', condition, three: true })
        };
    }

    root.ScienceMoonThree = { mount };
})(window);
