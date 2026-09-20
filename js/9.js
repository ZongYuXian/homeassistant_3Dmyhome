/* ============================================================================
 * 3D智能户型设计器 - 未来科技动画特效引擎 (Future-Tech Animation FX Engine)
 * ============================================================================
 * 版本    : v5.0 Future-Tech
 * 适配宿主: appjs5.doc (HBuilderX 5+ App / 浏览器) 动画插件引擎
 * 特效数  : 30 种 (全部围绕模型原点精确无限循环)
 *
 * ★ v5.0 升级摘要 -----------------------------------------------------------
 *  ①【AQE 自适应画质引擎】全局FPS监测, 帧率不足自动缩减粒子规模(30%~100%),
 *     帧率恢复自动回升 → 低端手机不卡顿, 高端设备满特效。
 *  ②【边界污染修复】旧版度量把动画特效自身计入模型包围盒导致动画膨胀漂移,
 *     新版 walkBounds 跳过 animEffectGroup, 度量恒定精确。
 *  ③【热路径零分配】update 内零 new; 模块级临时对象复用;
 *     >1200粒子系统颜色缓冲每2帧节流; Δt 钳制防切页跳变。
 *  ④【13个全新未来科技特效】全息投影/能量护盾/激光矩阵/赛博隧道/量子涨落/
 *     DNA双螺旋/雷达扫描/曲率传送门/卫星轨道/曲速星驰/特斯拉电弧/磁场力线/
 *     全息故障方块 —— 全部基于解析周期函数, 数学上严格无限循环。
 *  ⑤ 参数全开放: 数量/大小/半径/速度/重力/浮力/辉光/透明度/双色。
 *
 * 安装: 放入 js/ 目录 + js/plugins.json → {"plugins":["ultimate_fx_pack.js"]}
 *       或通过宿主"动画插件"按钮手动导入本文件。
 * ==========================================================================*/
(function (hostApp) {
	'use strict';

	if (!hostApp || typeof hostApp.registerPlugin !== 'function') {
		console.error('[FutureFX] 加载失败: 未找到宿主 app.registerPlugin 接口');
		return;
	}
	if (typeof THREE === 'undefined') {
		console.error('[FutureFX] 加载失败: 未检测到 THREE.js');
		return;
	}

	/* ============================================================
	 * ① AQE 自适应画质引擎 (防卡顿核心)
	 *    同一 rAF 帧内多个特效只计 1 帧 (<3ms 判定同帧)
	 * ============================================================ */
	var _q = 1, _ft = -1, _fn = 0, _fc = 0;
	function frameTick() {
		var now = performance.now();
		if (now - _ft < 3) return _q;
		_ft = now; _fn++;
		if (now - _fc >= 800) {
			var fps = _fn * 1000 / (now - _fc);
			_fn = 0; _fc = now;
			if (fps < 38) _q = Math.max(0.3, _q - 0.15);        // 降质保帧
			else if (fps > 56) _q = Math.min(1, _q + 0.06);     // 逐级回升
		}
		return _q;
	}
	/** 重粒子系统颜色缓冲节流 (>1200 粒子每2帧刷新一次颜色) */
	function colorGate(u, n) {
		if (n <= 1200) return true;
		u._cg = !u._cg;
		return u._cg;
	}
	function cd(delta) { return (delta > 0.05 || delta < 0) ? 0.016 : delta; } // Δt钳制
	function visOk(group) { return group.visible && group.parent && group.parent.visible; }

	/* ============================================================
	 * ② 核心工具库
	 * ============================================================ */
	var _wp = new THREE.Vector3(), _wq = new THREE.Quaternion(), _ws = new THREE.Vector3();
	var _ca = new THREE.Color(), _cb = new THREE.Color(), _cc = new THREE.Color();
	var _box = new THREE.Box3(), _b2 = new THREE.Box3();

	function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
	function wrap01(v) { v = v % 1; return v < 0 ? v + 1 : v; }
	function rand(a, b) { return a + Math.random() * (b - a); }
	function sstep(a, b, x) { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); }
	function num(c, k, d) { var v = parseFloat(c && c[k]); return isFinite(v) ? v : d; }
	function colOf(v, d) { return (typeof v === 'string' && v) || d; }
	function lerp2(out, a, b, t) { return out.set(colOf(a, '#ffffff')).lerp(_cb.set(colOf(b, '#ffffff')), clamp(t, 0, 1)); }

	/** ★ 包围盒遍历 (跳过动画特效自身 → 修复边界污染/滚雪球bug) */
	function walkBounds(o, skip) {
		if (o === skip) return;
		if (o.geometry) {
			if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
			var b = o.geometry.boundingBox;
			if (b && !b.isEmpty()) { _b2.copy(b).applyMatrix4(o.matrixWorld); _box.union(_b2); }
		}
		var ch = o.children;
		for (var i = 0; i < ch.length; i++) walkBounds(ch[i], skip);
	}
	/** ★ 核心: 模型"局部度量" (世界包围盒→局部空间, 动画精确围绕原点) */
	function metrics(object) {
		object.updateWorldMatrix(true, true);
		var eg = (object.userData && object.userData.animEffectGroup) || null;
		_box.makeEmpty();
		walkBounds(object, eg);
		if (_box.isEmpty()) _box.set(new THREE.Vector3(-0.5, 0, -0.5), new THREE.Vector3(0.5, 1.5, 0.5));
		var wSize = _box.getSize(new THREE.Vector3());
		var wCenter = _box.getCenter(new THREE.Vector3());
		object.matrixWorld.decompose(_wp, _wq, _ws);
		var sx = (isFinite(_ws.x) && _ws.x > 1e-6) ? _ws.x : 1;
		var sy = (isFinite(_ws.y) && _ws.y > 1e-6) ? _ws.y : 1;
		var sz = (isFinite(_ws.z) && _ws.z > 1e-6) ? _ws.z : 1;
		var lSize = new THREE.Vector3(wSize.x / sx, wSize.y / sy, wSize.z / sz);
		var lCenter = object.worldToLocal(wCenter.clone());
		var lRadius = Math.max(Math.max(lSize.x, lSize.z) * 0.5, Math.max(lSize.y, 0.2) * 0.35, 0.2);
		return {
			size: lSize, center: lCenter, radius: lRadius,
			height: Math.max(lSize.y, 0.2),
			bottom: lCenter.y - lSize.y * 0.5, top: lCenter.y + lSize.y * 0.5
		};
	}
	/** 节流重算度量 (约1.5秒一次, 自动贴合用户后期缩放) */
	function refreshMetrics(group, object) {
		var u = group.userData;
		u._f = (u._f || 0) + 1;
		if (!u.m || (u._f % 90 === 0)) u.m = metrics(object);
		return u.m;
	}
	/** 顶点色粒子系统 (预分配Buffer, additive发光) */
	function makePoints(count, colorHex) {
		var geo = new THREE.BufferGeometry();
		var pos = new Float32Array(count * 3);
		var col = new Float32Array(count * 3);
		var c = new THREE.Color(colorHex || '#ffffff');
		for (var i = 0; i < count; i++) {
			var j = i * 3;
			col[j] = c.r; col[j + 1] = c.g; col[j + 2] = c.b;
		}
		geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
		geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
		var mat = new THREE.PointsMaterial({
			size: 0.05, vertexColors: true, transparent: true, opacity: 0.9,
			blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
		});
		var p = new THREE.Points(geo, mat);
		p.frustumCulled = false;
		return p;
	}
	/** 顶点色线段系统 */
	function makeLines(totalVerts, opacity) {
		var geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(totalVerts * 3), 3));
		geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(totalVerts * 3), 3));
		var mat = new THREE.LineBasicMaterial({
			vertexColors: true, transparent: true, opacity: opacity || 0.9,
			blending: THREE.AdditiveBlending, depthWrite: false
		});
		var l = new THREE.LineSegments(geo, mat);
		l.frustumCulled = false;
		return l;
	}
	function glowMat(colorHex, opacity) {
		return new THREE.MeshBasicMaterial({
			color: new THREE.Color(colorHex || '#ffffff'), transparent: true,
			opacity: opacity === undefined ? 0.8 : opacity, side: THREE.DoubleSide,
			blending: THREE.AdditiveBlending, depthWrite: false
		});
	}
	function wireMat(colorHex, opacity) {
		return new THREE.MeshBasicMaterial({
			color: new THREE.Color(colorHex || '#00f0ff'), wireframe: true, transparent: true,
			opacity: opacity === undefined ? 0.25 : opacity,
			blending: THREE.AdditiveBlending, depthWrite: false
		});
	}

	var REG = hostApp.registerPlugin.bind(hostApp);

	/* ============================================================
	 * 01 ✨ 粒子漩涡
	 * ============================================================ */
	REG({
		id: 'swirl_pro', name: '✨ 粒子漩涡',
		params: [
			{ id: 'count', type: 'range', label: '粒子数量', min: 100, max: 4000, step: 100, default: 1200 },
			{ id: 'psize', type: 'range', label: '粒子大小', min: 1, max: 30, step: 1, default: 6 },
			{ id: 'radius', type: 'range', label: '漩涡半径', min: 0.2, max: 5, step: 0.1, default: 1.2 },
			{ id: 'height', type: 'range', label: '漩涡高度', min: 0.2, max: 5, step: 0.1, default: 1.5 },
			{ id: 'speed', type: 'range', label: '旋转速度', min: 0, max: 10, step: 0.1, default: 2.5 },
			{ id: 'gravity', type: 'range', label: '重力沉降', min: -3, max: 3, step: 0.1, default: 0.5 },
			{ id: 'glow', type: 'range', label: '辉光强度', min: 0, max: 1, step: 0.05, default: 0.8 },
			{ id: 'colorA', type: 'color', label: '主颜色', default: '#ff3366' },
			{ id: 'colorB', type: 'color', label: '副颜色', default: '#33ccff' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var n = clamp(Math.round(num(config, 'count', 1200)), 50, 4000);
			var pts = makePoints(n, colv(config, 'colorA', '#ff3366'));
			var d = [];
			for (var i = 0; i < n; i++) {
				d.push({ a: Math.random() * 6.283, r: Math.sqrt(Math.random()), y: Math.random(), sp: 0.6 + Math.random() * 0.9, ph: Math.random() * 6.283, ca: Math.random() });
			}
			pts.userData.d = d;
			g.add(pts);
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var q = frameTick();
			var pts = group.children[0]; if (!pts) return;
			var pos = pts.geometry.attributes.position.array;
			var col = pts.geometry.attributes.color.array;
			var d = pts.userData.d, n = d.length, nEff = (n * q) | 0;
			var R = m.radius * num(config, 'radius', 1.2);
			var H = m.height * num(config, 'height', 1.5);
			var cy = m.center.y, spd = num(config, 'speed', 2.5);
			var grav = num(config, 'gravity', 0.5) * 0.06;
			var glow = num(config, 'glow', 0.8), t = time;
			var gate = colorGate(pts.userData, n);
			for (var i = 0; i < n; i++) {
				var j = i * 3;
				if (i >= nEff) { col[j] = 0; col[j + 1] = 0; col[j + 2] = 0; continue; }
				var p = d[i];
				p.a += cd(delta) * spd * p.sp;
				var cyc = wrap01(p.y + t * grav * p.sp);
				var rr = p.r * R * (0.85 + 0.15 * Math.sin(p.a * 2 + p.ph));
				pos[j] = Math.cos(p.a) * rr;
				pos[j + 1] = cy + (cyc - 0.5) * H + Math.sin(t * 1.5 + p.ph) * 0.05 * H;
				pos[j + 2] = Math.sin(p.a) * rr;
				if (gate) {
					lerp2(_cc, config.colorA, config.colorB, 0.5 + 0.5 * Math.sin(cyc * 6.283 + p.ca * 6.283));
					var br = (0.55 + 0.45 * Math.sin(t * 2 + p.ph)) * (0.35 + 0.65 * glow);
					col[j] = _cc.r * br; col[j + 1] = _cc.g * br; col[j + 2] = _cc.b * br;
				}
			}
			pts.geometry.attributes.position.needsUpdate = true;
			if (gate) pts.geometry.attributes.color.needsUpdate = true;
			pts.material.size = Math.max(0.004, num(config, 'psize', 6) * 0.004);
			pts.material.opacity = clamp(0.3 + glow * 0.7, 0.05, 1);
		}
	});

	/* ============================================================
	 * 02 🌟 星轨环绕
	 * ============================================================ */
	REG({
		id: 'orbit_stars', name: '🌟 星轨环绕',
		params: [
			{ id: 'count', type: 'range', label: '星星数量', min: 200, max: 3000, step: 100, default: 900 },
			{ id: 'psize', type: 'range', label: '星星大小', min: 1, max: 20, step: 1, default: 4 },
			{ id: 'rings', type: 'range', label: '轨道数量', min: 1, max: 5, step: 1, default: 3 },
			{ id: 'radius', type: 'range', label: '轨道半径', min: 0.2, max: 5, step: 0.1, default: 1.3 },
			{ id: 'height', type: 'range', label: '轨道层高', min: 0.1, max: 3, step: 0.1, default: 0.8 },
			{ id: 'speed', type: 'range', label: '环绕速度', min: -5, max: 5, step: 0.1, default: 1.6 },
			{ id: 'twinkle', type: 'range', label: '闪烁频率', min: 0, max: 10, step: 0.1, default: 3 },
			{ id: 'glow', type: 'range', label: '辉光强度', min: 0, max: 1, step: 0.05, default: 0.8 },
			{ id: 'colorA', type: 'color', label: '内轨颜色', default: '#ffe9a8' },
			{ id: 'colorB', type: 'color', label: '外轨颜色', default: '#9fd8ff' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var n = clamp(Math.round(num(config, 'count', 900)), 50, 3000);
			var pts = makePoints(n, colv(config, 'colorA', '#ffe9a8'));
			var rings = Math.max(1, Math.round(num(config, 'rings', 3)));
			var d = [];
			for (var i = 0; i < n; i++) {
				var ring = i % rings;
				d.push({ ring: ring, a0: (i / n) * 18.85 + Math.random() * 0.4, rj: 1 + (Math.random() - 0.5) * 0.1, y0: Math.random(), ph: Math.random() * 6.283, sp: 0.85 + Math.random() * 0.3, dir: (ring % 2 === 0) ? 1 : -1 });
			}
			pts.userData.d = d;
			g.add(pts);
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var q = frameTick();
			var pts = group.children[0]; if (!pts) return;
			var pos = pts.geometry.attributes.position.array;
			var col = pts.geometry.attributes.color.array;
			var d = pts.userData.d, n = d.length, nEff = (n * q) | 0;
			var rings = Math.max(1, Math.round(num(config, 'rings', 3)));
			var R = m.radius * num(config, 'radius', 1.3);
			var H = m.height * num(config, 'height', 0.8);
			var spd = num(config, 'speed', 1.6), twS = num(config, 'twinkle', 3);
			var glow = num(config, 'glow', 0.8), t = time;
			var gate = colorGate(pts.userData, n);
			for (var i = 0; i < n; i++) {
				var j = i * 3;
				if (i >= nEff) { col[j] = 0; col[j + 1] = 0; col[j + 2] = 0; continue; }
				var p = d[i];
				var rf = (rings === 1) ? 0.75 : (0.4 + 0.6 * p.ring / (rings - 1));
				var r = rf * R * p.rj * (1 + 0.02 * Math.sin(t * 1.2 + p.ph));
				var ang = p.a0 + t * spd * p.sp * p.dir;
				pos[j] = Math.cos(ang) * r;
				pos[j + 1] = m.center.y + (rf - 0.75) * H * 0.7 + (p.y0 - 0.5) * 0.06 * H + Math.sin(t * 1.8 + p.ph) * 0.03 * H;
				pos[j + 2] = Math.sin(ang) * r;
				if (gate) {
					var tw = 0.5 + 0.5 * Math.sin(t * twS * 2 + p.ph);
					lerp2(_cc, config.colorA, config.colorB, rings === 1 ? 0.5 : p.ring / (rings - 1));
					var br = (0.3 + 0.7 * tw * tw) * (0.4 + 0.6 * glow);
					col[j] = _cc.r * br; col[j + 1] = _cc.g * br; col[j + 2] = _cc.b * br;
				}
			}
			pts.geometry.attributes.position.needsUpdate = true;
			if (gate) pts.geometry.attributes.color.needsUpdate = true;
			pts.material.size = Math.max(0.004, num(config, 'psize', 4) * 0.004);
			pts.material.opacity = clamp(0.4 + glow * 0.6, 0.05, 1);
		}
	});

	/* ============================================================
	 * 03 ⚡ 能量网格
	 * ============================================================ */
	REG({
		id: 'energy_grid', name: '⚡ 能量网格',
		params: [
			{ id: 'gridN', type: 'range', label: '网格密度', min: 4, max: 24, step: 1, default: 12 },
			{ id: 'radius', type: 'range', label: '网格半径', min: 0.3, max: 4, step: 0.1, default: 1.1 },
			{ id: 'waveH', type: 'range', label: '波动幅度', min: 0, max: 1, step: 0.05, default: 0.3 },
			{ id: 'speed', type: 'range', label: '脉冲速度', min: 0, max: 10, step: 0.1, default: 2.5 },
			{ id: 'glow', type: 'range', label: '发光强度', min: 0, max: 1, step: 0.05, default: 0.75 },
			{ id: 'colorA', type: 'color', label: '网格颜色', default: '#00ffcc' },
			{ id: 'colorB', type: 'color', label: '脉冲颜色', default: '#ffffff' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var N = clamp(Math.round(num(config, 'gridN', 12)), 3, 24);
			var vc = (N + 1) * (N + 1);
			var gx = new Float32Array(vc), gz = new Float32Array(vc);
			var i, row, colI;
			for (i = 0; i < vc; i++) {
				row = Math.floor(i / (N + 1)); colI = i % (N + 1);
				gx[i] = (colI / N - 0.5) * 2; gz[i] = (row / N - 0.5) * 2;
			}
			var segs = [], r, c;
			for (r = 0; r <= N; r++) for (c = 0; c < N; c++) segs.push(r * (N + 1) + c, r * (N + 1) + c + 1);
			for (c = 0; c <= N; c++) for (r = 0; r < N; r++) segs.push(r * (N + 1) + c, (r + 1) * (N + 1) + c);
			var lines = makeLines(segs.length, 0.9);
			lines.userData = { N: N, gx: gx, gz: gz, seg: new Int32Array(segs) };
			g.add(lines);
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var lines = group.children[0]; if (!lines) return;
			var u = lines.userData, N = u.N, seg = u.seg, gx = u.gx, gz = u.gz;
			var pos = lines.geometry.attributes.position.array;
			var col = lines.geometry.attributes.color.array;
			var R = m.radius * num(config, 'radius', 1.1);
			var amp = num(config, 'waveH', 0.3) * m.height * 0.5;
			var sp = num(config, 'speed', 2.5), glow = num(config, 'glow', 0.75), t = time;
			var vc = (N + 1) * (N + 1);
			if (!u.ys || u.ys.length !== vc) u.ys = new Float32Array(vc);
			var ys = u.ys, i, x, z;
			_ca.set(colOf(config.colorA, '#00ffcc'));
			_cb.set(colOf(config.colorB, '#ffffff'));
			for (i = 0; i < vc; i++) {
				x = gx[i] * R; z = gz[i] * R;
				ys[i] = m.center.y + (Math.sin(x * 2.2 / R + t * sp) * 0.35 + Math.cos(z * 2.6 / R + t * sp * 0.8) * 0.35 + Math.sin((x + z) * 1.5 / R + t * sp * 1.7) * 0.3) * amp;
			}
			for (i = 0; i < seg.length; i++) {
				var vi = seg[i], j = i * 3;
				pos[j] = gx[vi] * R; pos[j + 1] = ys[vi]; pos[j + 2] = gz[vi] * R;
				var pulse = 0.45 + 0.55 * Math.sin(t * 2.4 + (gx[vi] + gz[vi]) * 4.4 / R);
				_cc.copy(_ca).lerp(_cb, pulse * 0.5);
				var br = pulse * (0.35 + 0.65 * glow);
				col[j] = _cc.r * br; col[j + 1] = _cc.g * br; col[j + 2] = _cc.b * br;
			}
			lines.geometry.attributes.position.needsUpdate = true;
			lines.geometry.attributes.color.needsUpdate = true;
			lines.material.opacity = clamp(0.3 + glow * 0.7, 0.05, 1);
		}
	});

	/* ============================================================
	 * 04 🌈 彩虹光环
	 * ============================================================ */
	REG({
		id: 'rainbow_rings', name: '🌈 彩虹光环',
		params: [
			{ id: 'ringCount', type: 'range', label: '光环数量', min: 2, max: 10, step: 1, default: 6 },
			{ id: 'radius', type: 'range', label: '光环半径', min: 0.3, max: 4, step: 0.1, default: 1.2 },
			{ id: 'bandH', type: 'range', label: '垂直分布', min: 0, max: 1, step: 0.05, default: 0.5 },
			{ id: 'rotSpeed', type: 'range', label: '旋转速度', min: -5, max: 5, step: 0.1, default: 1 },
			{ id: 'waveAmp', type: 'range', label: '升降幅度', min: 0, max: 1, step: 0.05, default: 0.18 },
			{ id: 'waveSpeed', type: 'range', label: '升降速度', min: 0, max: 10, step: 0.1, default: 2 },
			{ id: 'rainbow', type: 'range', label: '彩虹混合', min: 0, max: 1, step: 0.05, default: 0.7 },
			{ id: 'opacity', type: 'range', label: '透明度', min: 0.05, max: 1, step: 0.05, default: 0.75 },
			{ id: 'colorA', type: 'color', label: '颜色A', default: '#ff5588' },
			{ id: 'colorB', type: 'color', label: '颜色B', default: '#55ccff' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var m = metrics(object);
			var n = clamp(Math.round(num(config, 'ringCount', 6)), 2, 10);
			var R = m.radius * num(config, 'radius', 1.2);
			var geo = new THREE.RingGeometry(0.86, 1, 64);
			for (var i = 0; i < n; i++) {
				var f = n === 1 ? 0.5 : i / (n - 1);
				var mesh = new THREE.Mesh(geo, glowMat('#ffffff', 0.7));
				mesh.scale.setScalar(R * (0.35 + 0.65 * f));
				mesh.rotation.x = -Math.PI / 2;
				mesh.userData = { f: f, yBase: m.center.y + (f - 0.5) * num(config, 'bandH', 0.5) * m.height, ph: i * 0.45, hue: i / n };
				g.add(mesh);
			}
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var R = m.radius * num(config, 'radius', 1.2), H = m.height, t = time;
			var rs = num(config, 'rotSpeed', 1), wa = num(config, 'waveAmp', 0.18);
			var ws = num(config, 'waveSpeed', 2), rb = num(config, 'rainbow', 0.7);
			var op = num(config, 'opacity', 0.75);
			for (var i = 0; i < group.children.length; i++) {
				var ring = group.children[i], u = ring.userData;
				ring.position.y = u.yBase + Math.sin(t * ws + u.ph) * wa * H;
				ring.rotation.z += cd(delta) * rs;
				var pulse = 0.94 + 0.06 * Math.sin(t * 2 + u.ph);
				ring.scale.setScalar(R * (0.35 + 0.65 * u.f) * pulse);
				if (rb > 0.01) { _cc.setHSL((u.hue + t * 0.06 * rb) % 1, 0.85, 0.6); _ca.copy(_cc); }
				else lerp2(_ca, config.colorA, config.colorB, u.f);
				ring.material.color.copy(_ca);
				ring.material.opacity = clamp(op * (0.6 + 0.4 * Math.sin(t * 1.3 + u.ph)), 0.03, 1);
			}
		}
	});

	/* ============================================================
	 * 05 🎇 循环烟花
	 * ============================================================ */
	REG({
		id: 'fireworks_loop', name: '🎇 循环烟花',
		params: [
			{ id: 'perBurst', type: 'range', label: '每发粒子', min: 100, max: 1500, step: 50, default: 500 },
			{ id: 'bursts', type: 'range', label: '爆炸源数', min: 1, max: 8, step: 1, default: 3 },
			{ id: 'psize', type: 'range', label: '粒子大小', min: 1, max: 20, step: 1, default: 5 },
			{ id: 'radius', type: 'range', label: '爆炸半径', min: 0.3, max: 4, step: 0.1, default: 1.5 },
			{ id: 'height', type: 'range', label: '爆炸高度', min: 0.5, max: 4, step: 0.1, default: 1.8 },
			{ id: 'speed', type: 'range', label: '爆发速度', min: 0.5, max: 8, step: 0.1, default: 3 },
			{ id: 'gravity', type: 'range', label: '重力下坠', min: 0, max: 3, step: 0.1, default: 0.8 },
			{ id: 'period', type: 'range', label: '循环周期', min: 1, max: 8, step: 0.5, default: 3 },
			{ id: 'glow', type: 'range', label: '辉光强度', min: 0, max: 1, step: 0.05, default: 0.9 },
			{ id: 'colorA', type: 'color', label: '花色A', default: '#ff6688' },
			{ id: 'colorB', type: 'color', label: '花色B', default: '#66ccff' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var m = metrics(object);
			var bursts = clamp(Math.round(num(config, 'bursts', 3)), 1, 8);
			var R = m.radius * num(config, 'radius', 1.5);
			var H = m.height * num(config, 'height', 1.8);
			var bc = [];
			for (var b = 0; b < bursts; b++) bc.push({ x: (Math.random() - 0.5) * R * 0.8, y: m.center.y + H * (0.3 + Math.random() * 0.4), z: (Math.random() - 0.5) * R * 0.8 });
			var n = clamp(Math.round(num(config, 'perBurst', 500)) * bursts, 50, 6000);
			var pts = makePoints(n, colv(config, 'colorA', '#ff6688'));
			var d = [];
			for (var i = 0; i < n; i++) {
				var uu = Math.random() * 2 - 1, a = Math.random() * 6.283, s = Math.sqrt(1 - uu * uu);
				d.push({ b: i % bursts, dx: s * Math.cos(a), dy: uu + 0.55, dz: s * Math.sin(a), sp: 0.75 + Math.random() * 0.5, ph: Math.random(), hue: Math.random() });
			}
			for (i = 0; i < n; i++) { var v = 1 / Math.sqrt(d[i].dx * d[i].dx + d[i].dy * d[i].dy + d[i].dz * d[i].dz); d[i].dx *= v; d[i].dy *= v; d[i].dz *= v; }
			pts.userData.d = d; pts.userData.bc = bc;
			g.add(pts);
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var q = frameTick();
			var pts = group.children[0]; if (!pts) return;
			var pos = pts.geometry.attributes.position.array;
			var col = pts.geometry.attributes.color.array;
			var d = pts.userData.d, bc = pts.userData.bc, n = d.length, nEff = (n * q) | 0;
			var R = m.radius * num(config, 'radius', 1.5);
			var v0 = num(config, 'speed', 3) * R * 0.5;
			var grav = num(config, 'gravity', 0.8) * R * 0.5;
			var T = Math.max(0.5, num(config, 'period', 3));
			var glow = num(config, 'glow', 0.9), t = time;
			var gate = colorGate(pts.userData, n);
			for (var i = 0; i < n; i++) {
				var j = i * 3;
				if (i >= nEff) { col[j] = 0; col[j + 1] = 0; col[j + 2] = 0; continue; }
				var p = d[i];
				var lt = wrap01(t / T + p.ph), ltT = lt * T;
				var dist = v0 * p.sp * ltT, c = bc[p.b];
				pos[j] = c.x + p.dx * dist;
				pos[j + 1] = c.y + p.dy * dist - 0.5 * grav * ltT * ltT;
				pos[j + 2] = c.z + p.dz * dist;
				if (gate) {
					var fade = Math.pow(1 - lt, 1.6);
					lerp2(_cc, config.colorA, config.colorB, p.hue);
					var flash = lt < 0.07 ? (0.07 - lt) / 0.07 : 0;
					var br = fade * (0.35 + 0.65 * glow) + flash;
					col[j] = _cc.r * br + flash; col[j + 1] = _cc.g * br + flash; col[j + 2] = _cc.b * br + flash;
				}
			}
			pts.geometry.attributes.position.needsUpdate = true;
			if (gate) pts.geometry.attributes.color.needsUpdate = true;
			pts.material.size = Math.max(0.004, num(config, 'psize', 5) * 0.004);
			pts.material.opacity = clamp(0.4 + glow * 0.6, 0.05, 1);
		}
	});

	/* ============================================================
	 * 06 🔥 烈焰燃烧
	 * ============================================================ */
	REG({
		id: 'fire_flame', name: '🔥 烈焰燃烧',
		params: [
			{ id: 'flames', type: 'range', label: '火苗数量', min: 1, max: 12, step: 1, default: 6 },
			{ id: 'flameH', type: 'range', label: '火焰高度', min: 0.2, max: 3, step: 0.1, default: 1.0 },
			{ id: 'flameW', type: 'range', label: '火焰宽度', min: 0.2, max: 2, step: 0.1, default: 0.6 },
			{ id: 'speed', type: 'range', label: '燃烧速度', min: 0.5, max: 10, step: 0.1, default: 4 },
			{ id: 'flicker', type: 'range', label: '闪烁强度', min: 0, max: 1, step: 0.05, default: 0.6 },
			{ id: 'sparks', type: 'range', label: '火星数量', min: 50, max: 800, step: 50, default: 300 },
			{ id: 'sparkBuoy', type: 'range', label: '火星浮力', min: 0, max: 3, step: 0.1, default: 1.2 },
			{ id: 'colorIn', type: 'color', label: '内焰颜色', default: '#fff3b0' },
			{ id: 'colorOut', type: 'color', label: '外焰颜色', default: '#ff5a00' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var m = metrics(object);
			var nF = clamp(Math.round(num(config, 'flames', 6)), 1, 12);
			var geo = new THREE.ConeGeometry(0.5, 1, 10, 1, true);
			geo.translate(0, 0.5, 0);
			for (var i = 0; i < nF; i++) {
				var ang = (i / nF) * 6.283;
				var mesh = new THREE.Mesh(geo, glowMat(colOf(config.colorOut, '#ff5a00'), 0.8));
				mesh.frustumCulled = false;
				mesh.userData = { bx: Math.cos(ang) * m.radius * 0.35, bz: Math.sin(ang) * m.radius * 0.35, ph: Math.random() * 6.283 };
				g.add(mesh);
			}
			var nS = clamp(Math.round(num(config, 'sparks', 300)), 20, 800);
			var sparks = makePoints(nS, colOf(config.colorIn, '#fff3b0'));
			var sd = [];
			for (var k = 0; k < nS; k++) {
				var a2 = Math.random() * 6.283, rr = Math.sqrt(Math.random()) * m.radius * 0.4;
				sd.push({ x: Math.cos(a2) * rr, z: Math.sin(a2) * rr, y0: Math.random(), ph: Math.random() * 6.283, fs: 0.7 + Math.random() * 0.6 });
			}
			sparks.userData.d = sd;
			g.add(sparks);
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var q = frameTick();
			var R = m.radius, t = time, d = cd(delta);
			var H = m.height * num(config, 'flameH', 1);
			var W = num(config, 'flameW', 0.6) * R * 0.55;
			var sp = num(config, 'speed', 4), fk = num(config, 'flicker', 0.6);
			var baseY = m.bottom;
			_ca.set(colOf(config.colorIn, '#fff3b0'));
			_cb.set(colOf(config.colorOut, '#ff5a00'));
			var i, mesh;
			for (i = 0; i < group.children.length - 1; i++) {
				mesh = group.children[i];
				if (!mesh.userData || mesh.userData.bx === undefined) continue;
				var u = mesh.userData;
				var sw = Math.sin(t * sp * 2.2 + u.ph) * 0.5 + 0.5;
				var hScale = H * (0.75 + 0.5 * sw) * (1 + fk * 0.35 * Math.sin(t * 11 + u.ph * 2.3));
				var wScale = W * (0.85 + 0.25 * Math.sin(t * 6 + u.ph));
				mesh.scale.set(Math.max(wScale, 0.02), Math.max(hScale, 0.02), Math.max(wScale, 0.02));
				mesh.position.set(u.bx + Math.sin(t * 2 + u.ph) * 0.06 * R, baseY, u.bz + Math.cos(t * 2.3 + u.ph) * 0.06 * R);
				_cc.copy(_ca).lerp(_cb, sw * 0.8 + 0.1);
				mesh.material.color.copy(_cc);
				mesh.material.opacity = clamp(0.55 + 0.35 * Math.sin(t * 7 + u.ph), 0.15, 1);
			}
			var sparks = group.children[group.children.length - 1];
			if (sparks && sparks.userData.d) {
				var pos = sparks.geometry.attributes.position.array;
				var col = sparks.geometry.attributes.color.array;
				var sd = sparks.userData.d, n = sd.length, nEff = (n * q) | 0;
				var buoy = num(config, 'sparkBuoy', 1.2) * 0.22;
				for (i = 0; i < n; i++) {
					var j = i * 3;
					if (i >= nEff) { col[j] = 0; col[j + 1] = 0; col[j + 2] = 0; continue; }
					var p = sd[i];
					var lt = wrap01(p.y0 + t * buoy * p.fs);
					pos[j] = p.x + Math.sin(t * 3 + p.ph) * 0.05 * R;
					pos[j + 1] = baseY + lt * H * 1.4;
					pos[j + 2] = p.z + Math.cos(t * 2.7 + p.ph) * 0.05 * R;
					var br2 = Math.pow(1 - lt, 1.5) * 0.9;
					col[j] = _ca.r * br2; col[j + 1] = _ca.g * br2; col[j + 2] = _ca.b * br2;
				}
				sparks.geometry.attributes.position.needsUpdate = true;
				sparks.geometry.attributes.color.needsUpdate = true;
				sparks.material.size = Math.max(0.003, R * 0.012);
			}
		}
	});

	/* ============================================================
	 * 07 ❄️ 冰雪飘落
	 * ============================================================ */
	REG({
		id: 'snow_fall', name: '❄️ 冰雪飘落',
		params: [
			{ id: 'count', type: 'range', label: '雪花数量', min: 100, max: 3000, step: 100, default: 900 },
			{ id: 'psize', type: 'range', label: '雪花大小', min: 1, max: 20, step: 1, default: 5 },
			{ id: 'radius', type: 'range', label: '飘落半径', min: 0.3, max: 4, step: 0.1, default: 1.4 },
			{ id: 'height', type: 'range', label: '飘落层高', min: 0.5, max: 4, step: 0.1, default: 2.2 },
			{ id: 'fall', type: 'range', label: '下落速度', min: 0.2, max: 5, step: 0.1, default: 1.0 },
			{ id: 'wind', type: 'range', label: '风力大小', min: 0, max: 2, step: 0.1, default: 0.6 },
			{ id: 'sway', type: 'range', label: '摇摆频率', min: 0, max: 5, step: 0.1, default: 1.5 },
			{ id: 'glow', type: 'range', label: '辉光强度', min: 0, max: 1, step: 0.05, default: 0.6 },
			{ id: 'colorA', type: 'color', label: '雪色', default: '#ffffff' },
			{ id: 'colorB', type: 'color', label: '蓝调', default: '#bfe3ff' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var m = metrics(object);
			var n = clamp(Math.round(num(config, 'count', 900)), 50, 3000);
			var R = m.radius * num(config, 'radius', 1.4);
			var pts = makePoints(n, colOf(config.colorA, '#ffffff'));
			var d = [];
			for (var i = 0; i < n; i++) {
				var a = Math.random() * 6.283, rr = Math.sqrt(Math.random()) * R;
				d.push({ x: Math.cos(a) * rr, z: Math.sin(a) * rr, y0: Math.random(), fs: 0.7 + Math.random() * 0.6, ph: Math.random() * 6.283, sw: 0.5 + Math.random() });
			}
			pts.userData.d = d; pts.userData.R0 = R;
			g.add(pts);
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var q = frameTick();
			var pts = group.children[0]; if (!pts) return;
			var pos = pts.geometry.attributes.position.array;
			var col = pts.geometry.attributes.color.array;
			var d = pts.userData.d, n = d.length, nEff = (n * q) | 0;
			var k = (m.radius * num(config, 'radius', 1.4)) / Math.max(pts.userData.R0, 1e-4);
			var H = m.height * num(config, 'height', 2.2);
			var fall = num(config, 'fall', 1) * 0.22, wind = num(config, 'wind', 0.6);
			var sway = num(config, 'sway', 1.5), glow = num(config, 'glow', 0.6), t = time;
			_ca.set(colOf(config.colorA, '#ffffff'));
			var top = m.top + 0.1;
			for (var i = 0; i < n; i++) {
				var j = i * 3;
				if (i >= nEff) { col[j] = 0; col[j + 1] = 0; col[j + 2] = 0; continue; }
				var p = d[i];
				var cyc = wrap01(p.y0 + t * fall * p.fs);
				pos[j] = p.x * k + Math.sin(t * sway * p.sw * 0.6 + p.ph) * 0.08 * m.radius * (0.5 + wind);
				pos[j + 1] = top - cyc * H;
				pos[j + 2] = p.z * k + Math.cos(t * sway * 0.43 + p.ph) * 0.06 * m.radius * (0.5 + wind);
				var br = (0.6 + 0.4 * Math.sin(t * 3 + p.ph)) * (0.45 + 0.55 * glow);
				col[j] = _ca.r * br; col[j + 1] = _ca.g * br; col[j + 2] = _ca.b * br;
			}
			pts.geometry.attributes.position.needsUpdate = true;
			pts.geometry.attributes.color.needsUpdate = true;
			pts.material.size = Math.max(0.004, num(config, 'psize', 5) * 0.004);
			pts.material.opacity = clamp(0.5 + glow * 0.5, 0.05, 1);
		}
	});

	/* ============================================================
	 * 08 🫧 泡沫上升
	 * ============================================================ */
	REG({
		id: 'bubbles_rise', name: '🫧 泡沫上升',
		params: [
			{ id: 'count', type: 'range', label: '气泡数量', min: 50, max: 1500, step: 50, default: 500 },
			{ id: 'psize', type: 'range', label: '气泡大小', min: 1, max: 30, step: 1, default: 10 },
			{ id: 'radius', type: 'range', label: '分布半径', min: 0.3, max: 4, step: 0.1, default: 1.1 },
			{ id: 'height', type: 'range', label: '上升高度', min: 0.5, max: 4, step: 0.1, default: 2 },
			{ id: 'buoy', type: 'range', label: '浮力速度', min: 0.1, max: 4, step: 0.1, default: 1.0 },
			{ id: 'sway', type: 'range', label: '摇摆幅度', min: 0, max: 5, step: 0.1, default: 1.5 },
			{ id: 'glow', type: 'range', label: '辉光强度', min: 0, max: 1, step: 0.05, default: 0.7 },
			{ id: 'colorA', type: 'color', label: '气泡色', default: '#aef4ff' },
			{ id: 'colorB', type: 'color', label: '深水色', default: '#3fa9ff' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var m = metrics(object);
			var n = clamp(Math.round(num(config, 'count', 500)), 20, 1500);
			var R = m.radius * num(config, 'radius', 1.1);
			var pts = makePoints(n, colOf(config.colorA, '#aef4ff'));
			var d = [];
			for (var i = 0; i < n; i++) {
				var a = Math.random() * 6.283, rr = Math.sqrt(Math.random()) * R;
				d.push({ x: Math.cos(a) * rr, z: Math.sin(a) * rr, y0: Math.random(), rs: 0.7 + Math.random() * 0.6, ph: Math.random() * 6.283, rf: rr / Math.max(R, 1e-4) });
			}
			pts.userData.d = d; pts.userData.R0 = R;
			g.add(pts);
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var q = frameTick();
			var pts = group.children[0]; if (!pts) return;
			var pos = pts.geometry.attributes.position.array;
			var col = pts.geometry.attributes.color.array;
			var d = pts.userData.d, n = d.length, nEff = (n * q) | 0;
			var k = (m.radius * num(config, 'radius', 1.1)) / Math.max(pts.userData.R0, 1e-4);
			var H = m.height * num(config, 'height', 2);
			var buoy = num(config, 'buoy', 1) * 0.18, sway = num(config, 'sway', 1.5);
			var glow = num(config, 'glow', 0.7), t = time, base = m.bottom;
			_ca.set(colOf(config.colorA, '#aef4ff'));
			_cb.set(colOf(config.colorB, '#3fa9ff'));
			for (var i = 0; i < n; i++) {
				var j = i * 3;
				if (i >= nEff) { col[j] = 0; col[j + 1] = 0; col[j + 2] = 0; continue; }
				var p = d[i];
				var cyc = wrap01(p.y0 + t * buoy * p.rs);
				pos[j] = p.x * k + Math.sin(t * sway * 0.7 + p.ph) * 0.05 * m.radius;
				pos[j + 1] = base + cyc * H;
				pos[j + 2] = p.z * k + Math.cos(t * sway * 0.55 + p.ph) * 0.05 * m.radius;
				var fade = cyc > 0.85 ? (1 - cyc) / 0.15 : Math.min(1, cyc / 0.08);
				_cc.copy(_ca).lerp(_cb, 1 - p.rf);
				var br = fade * (0.4 + 0.6 * glow) * (0.7 + 0.3 * Math.sin(t * 4 + p.ph));
				col[j] = _cc.r * br; col[j + 1] = _cc.g * br; col[j + 2] = _cc.b * br;
			}
			pts.geometry.attributes.position.needsUpdate = true;
			pts.geometry.attributes.color.needsUpdate = true;
			pts.material.size = Math.max(0.004, num(config, 'psize', 10) * 0.004);
			pts.material.opacity = clamp(0.4 + glow * 0.6, 0.05, 1);
		}
	});

	/* ============================================================
	 * 09 ☄️ 流星雨
	 * ============================================================ */
	REG({
		id: 'meteor_rain', name: '☄️ 流星雨',
		params: [
			{ id: 'meteors', type: 'range', label: '流星数量', min: 1, max: 20, step: 1, default: 8 },
			{ id: 'radius', type: 'range', label: '划落半径', min: 0.5, max: 5, step: 0.1, default: 1.8 },
			{ id: 'length', type: 'range', label: '划行距离', min: 0.5, max: 3, step: 0.1, default: 1.5 },
			{ id: 'speed', type: 'range', label: '划落速度', min: 0.2, max: 5, step: 0.1, default: 1.4 },
			{ id: 'gravity', type: 'range', label: '重力弧度', min: 0, max: 3, step: 0.1, default: 0.5 },
			{ id: 'tail', type: 'range', label: '拖尾长度', min: 0.1, max: 1, step: 0.05, default: 0.45 },
			{ id: 'glow', type: 'range', label: '辉光强度', min: 0, max: 1, step: 0.05, default: 0.85 },
			{ id: 'colorA', type: 'color', label: '流星头', default: '#fff7d6' },
			{ id: 'colorB', type: 'color', label: '流星尾', default: '#7fd4ff' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var m = metrics(object);
			var n = clamp(Math.round(num(config, 'meteors', 8)), 1, 20);
			var R = m.radius * num(config, 'radius', 1.8);
			var lines = makeLines(n * 2, 0.95);
			var d = [];
			for (var i = 0; i < n; i++) {
				var a = Math.random() * 6.283, rr = (0.6 + Math.random() * 0.4) * R, az = Math.random() * 6.283;
				d.push({ sx: Math.cos(a) * rr, sz: Math.sin(a) * rr, sy: m.top + Math.random() * m.height * 0.3, dx: Math.cos(az), dz: Math.sin(az), dy: -(0.55 + Math.random() * 0.3), ph: Math.random(), fs: 0.8 + Math.random() * 0.4 });
			}
			lines.userData.d = d;
			g.add(lines);
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var q = frameTick();
			var lines = group.children[0]; if (!lines) return;
			var pos = lines.geometry.attributes.position.array;
			var col = lines.geometry.attributes.color.array;
			var d = lines.userData.d, n = d.length, nEff = (n * q) | 0;
			var R = m.radius * num(config, 'radius', 1.8);
			var L = num(config, 'length', 1.5) * m.height;
			var spd = num(config, 'speed', 1.4), grav = num(config, 'gravity', 0.5) * R * 0.6;
			var tail = num(config, 'tail', 0.45), glow = num(config, 'glow', 0.85), t = time;
			_ca.set(colOf(config.colorA, '#fff7d6'));
			_cb.set(colOf(config.colorB, '#7fd4ff'));
			for (var i = 0; i < n; i++) {
				var j = i * 6;
				if (i >= nEff) { for (var z = 0; z < 6; z++) col[j + z] = 0; continue; }
				var p = d[i];
				var lt = wrap01(t * spd * p.fs * 0.35 + p.ph);
				var travel = lt * L;
				var hx = p.sx + p.dx * travel, hy = p.sy + p.dy * travel - grav * lt * lt, hz = p.sz + p.dz * travel;
				var tl = tail * L * (0.4 + 0.6 * lt);
				var br = Math.sin(lt * Math.PI) * (0.35 + 0.65 * glow);
				if (br < 0) br = 0;
				pos[j] = hx; pos[j + 1] = hy; pos[j + 2] = hz;
				pos[j + 3] = hx - p.dx * tl; pos[j + 4] = hy - p.dy * tl + grav * lt * lt * 0.35; pos[j + 5] = hz - p.dz * tl;
				col[j] = _ca.r * br; col[j + 1] = _ca.g * br; col[j + 2] = _ca.b * br;
				col[j + 3] = _cb.r * br * 0.08; col[j + 4] = _cb.g * br * 0.08; col[j + 5] = _cb.b * br * 0.08;
			}
			lines.geometry.attributes.position.needsUpdate = true;
			lines.geometry.attributes.color.needsUpdate = true;
		}
	});

	/* ============================================================
	 * 10 ☀️ 光晕呼吸
	 * ============================================================ */
	REG({
		id: 'halo_pulse', name: '☀️ 光晕呼吸',
		params: [
			{ id: 'rings', type: 'range', label: '光环数量', min: 2, max: 10, step: 1, default: 5 },
			{ id: 'radius', type: 'range', label: '最大半径', min: 0.3, max: 4, step: 0.1, default: 1.4 },
			{ id: 'speed', type: 'range', label: '扩散速度', min: 0.1, max: 5, step: 0.1, default: 1.0 },
			{ id: 'breath', type: 'range', label: '呼吸强度', min: 0, max: 1, step: 0.05, default: 0.3 },
			{ id: 'spread', type: 'range', label: '层间高度', min: 0, max: 1, step: 0.05, default: 0.15 },
			{ id: 'opacity', type: 'range', label: '透明度', min: 0.05, max: 1, step: 0.05, default: 0.7 },
			{ id: 'colorA', type: 'color', label: '中心色', default: '#fff0b0' },
			{ id: 'colorB', type: 'color', label: '边缘色', default: '#ff9f5a' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var m = metrics(object);
			var n = clamp(Math.round(num(config, 'rings', 5)), 2, 10);
			var geo = new THREE.RingGeometry(0.86, 1, 64);
			for (var i = 0; i < n; i++) {
				var mesh = new THREE.Mesh(geo, glowMat('#ffffff', 0.6));
				mesh.rotation.x = -Math.PI / 2;
				mesh.userData = { ph: i / n, y: m.center.y + (i / (n - 1) - 0.5) * num(config, 'spread', 0.15) * m.height };
				g.add(mesh);
			}
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var R = m.radius * num(config, 'radius', 1.4);
			var spd = num(config, 'speed', 1), br = num(config, 'breath', 0.3);
			var op = num(config, 'opacity', 0.7), t = time;
			_ca.set(colOf(config.colorA, '#fff0b0'));
			_cb.set(colOf(config.colorB, '#ff9f5a'));
			for (var i = 0; i < group.children.length; i++) {
				var ring = group.children[i], u = ring.userData;
				var k = wrap01(t * spd + u.ph);
				var s = (0.12 + 0.88 * k) * R * (1 + br * 0.08 * Math.sin(t * 2.4));
				ring.scale.set(s, s, 1);
				ring.position.y = u.y;
				ring.material.opacity = clamp((1 - k) * op, 0.02, 1);
				ring.material.color.copy(_ca).lerp(_cb, k);
			}
		}
	});

	/* ============================================================
	 * 11 🌀 时空漩涡
	 * ============================================================ */
	REG({
		id: 'vortex_ring', name: '🌀 时空漩涡',
		params: [
			{ id: 'count', type: 'range', label: '粒子数量', min: 200, max: 3000, step: 100, default: 1000 },
			{ id: 'psize', type: 'range', label: '粒子大小', min: 1, max: 20, step: 1, default: 5 },
			{ id: 'radius', type: 'range', label: '漩涡半径', min: 0.3, max: 4, step: 0.1, default: 1.2 },
			{ id: 'height', type: 'range', label: '漩涡层高', min: 0.1, max: 2, step: 0.1, default: 0.5 },
			{ id: 'speed', type: 'range', label: '旋转速度', min: 0, max: 10, step: 0.1, default: 3 },
			{ id: 'suck', type: 'range', label: '吸入强度', min: 0, max: 1, step: 0.05, default: 0.4 },
			{ id: 'glow', type: 'range', label: '辉光强度', min: 0, max: 1, step: 0.05, default: 0.8 },
			{ id: 'colorA', type: 'color', label: '外旋色', default: '#7c4dff' },
			{ id: 'colorB', type: 'color', label: '内芯色', default: '#00e5ff' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var n = clamp(Math.round(num(config, 'count', 1000)), 50, 3000);
			var pts = makePoints(n, colOf(config.colorA, '#7c4dff'));
			var d = [];
			for (var i = 0; i < n; i++) {
				d.push({ a0: Math.random() * 6.283, rr: Math.pow(Math.random(), 0.6), yy: Math.random(), ph: Math.random() * 6.283, fs: 0.7 + Math.random() * 0.6, dir: (i % 2 === 0) ? 1 : -1 });
			}
			pts.userData.d = d;
			g.add(pts);
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var q = frameTick();
			var pts = group.children[0]; if (!pts) return;
			var pos = pts.geometry.attributes.position.array;
			var col = pts.geometry.attributes.color.array;
			var d = pts.userData.d, n = d.length, nEff = (n * q) | 0;
			var R = m.radius * num(config, 'radius', 1.2);
			var H = m.height * num(config, 'height', 0.5);
			var spd = num(config, 'speed', 3), suck = num(config, 'suck', 0.4);
			var glow = num(config, 'glow', 0.8), t = time;
			_ca.set(colOf(config.colorA, '#7c4dff'));
			_cb.set(colOf(config.colorB, '#00e5ff'));
			for (var i = 0; i < n; i++) {
				var j = i * 3;
				if (i >= nEff) { col[j] = 0; col[j + 1] = 0; col[j + 2] = 0; continue; }
				var p = d[i];
				var rNow = p.rr * R * (1 - 0.35 * suck * (0.5 + 0.5 * Math.sin(t * 0.8 + p.ph)));
				var ang = p.a0 + t * spd * p.fs * p.dir * (1.6 - p.rr);
				pos[j] = Math.cos(ang) * rNow;
				pos[j + 1] = m.center.y + (p.yy - 0.5) * H * (1 - p.rr * 0.5) + Math.sin(t * 2 + p.ph) * 0.04 * H;
				pos[j + 2] = Math.sin(ang) * rNow;
				_cc.copy(_ca).lerp(_cb, 1 - p.rr);
				var br = (0.45 + 0.55 * Math.sin(t * 3 + p.ph * 2)) * (0.4 + 0.6 * glow);
				col[j] = _cc.r * br; col[j + 1] = _cc.g * br; col[j + 2] = _cc.b * br;
			}
			pts.geometry.attributes.position.needsUpdate = true;
			pts.geometry.attributes.color.needsUpdate = true;
			pts.material.size = Math.max(0.004, num(config, 'psize', 5) * 0.004);
			pts.material.opacity = clamp(0.35 + glow * 0.65, 0.05, 1);
		}
	});

	/* ============================================================
	 * 12 💖 爱心律动
	 * ============================================================ */
	REG({
		id: 'heart_beat', name: '💖 爱心律动',
		params: [
			{ id: 'count', type: 'range', label: '粒子数量', min: 200, max: 2500, step: 100, default: 900 },
			{ id: 'psize', type: 'range', label: '粒子大小', min: 1, max: 20, step: 1, default: 5 },
			{ id: 'size', type: 'range', label: '爱心大小', min: 0.3, max: 3, step: 0.1, default: 1.0 },
			{ id: 'thickness', type: 'range', label: '爱心厚度', min: 0.05, max: 1, step: 0.05, default: 0.25 },
			{ id: 'speed', type: 'range', label: '心跳速度', min: 0.2, max: 6, step: 0.1, default: 1.6 },
			{ id: 'beat', type: 'range', label: '跳动幅度', min: 0, max: 1, step: 0.05, default: 0.5 },
			{ id: 'spin', type: 'range', label: '自转速度', min: 0, max: 3, step: 0.1, default: 0.4 },
			{ id: 'glow', type: 'range', label: '辉光强度', min: 0, max: 1, step: 0.05, default: 0.85 },
			{ id: 'colorA', type: 'color', label: '主色', default: '#ff5f8f' },
			{ id: 'colorB', type: 'color', label: '高光色', default: '#ffccdd' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var n = clamp(Math.round(num(config, 'count', 900)), 50, 2500);
			var pts = makePoints(n, colOf(config.colorA, '#ff5f8f'));
			var d = [];
			for (var i = 0; i < n; i++) {
				var u = Math.random() * 6.283;
				d.push({
					hx: 16 * Math.pow(Math.sin(u), 3) / 17,
					hy: (13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u)) / 17,
					s: Math.sqrt(Math.random()), z: Math.random() - 0.5, ph: Math.random() * 6.283, ph2: Math.random() * 6.283
				});
			}
			pts.userData.d = d;
			g.add(pts);
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var q = frameTick();
			group.rotation.y += cd(delta) * num(config, 'spin', 0.4) * 0.6;
			var pts = group.children[0]; if (!pts) return;
			var pos = pts.geometry.attributes.position.array;
			var col = pts.geometry.attributes.color.array;
			var d = pts.userData.d, n = d.length, nEff = (n * q) | 0;
			var R = num(config, 'size', 1) * Math.max(m.radius, m.height * 0.5) * 1.1;
			var th = num(config, 'thickness', 0.25) * R * 0.35;
			var spd = num(config, 'speed', 1.6), beat = num(config, 'beat', 0.5);
			var glow = num(config, 'glow', 0.85), t = time;
			var beatS = 1 + beat * 0.16 * Math.pow(Math.max(0, Math.sin(t * spd * Math.PI)), 3);
			_ca.set(colOf(config.colorA, '#ff5f8f'));
			_cb.set(colOf(config.colorB, '#ffccdd'));
			for (var i = 0; i < n; i++) {
				var j = i * 3;
				if (i >= nEff) { col[j] = 0; col[j + 1] = 0; col[j + 2] = 0; continue; }
				var p = d[i], rr = p.s * beatS;
				pos[j] = p.hx * R * rr;
				pos[j + 1] = m.center.y + p.hy * R * rr + Math.sin(t * 1.3 + p.ph2) * 0.03 * R;
				pos[j + 2] = p.z * th + Math.sin(t * 2 + p.ph) * 0.02 * R;
				_cc.copy(_ca).lerp(_cb, 0.5 + 0.5 * Math.sin(t * 2 + p.ph));
				var br = (0.45 + 0.55 * beatS - 0.4) * (0.4 + 0.6 * glow) + 0.25;
				col[j] = _cc.r * br; col[j + 1] = _cc.g * br; col[j + 2] = _cc.b * br;
			}
			pts.geometry.attributes.position.needsUpdate = true;
			pts.geometry.attributes.color.needsUpdate = true;
			pts.material.size = Math.max(0.004, num(config, 'psize', 5) * 0.004);
			pts.material.opacity = clamp(0.4 + glow * 0.6, 0.05, 1);
		}
	});

	/* ============================================================
	 * 13 🌸 花瓣纷飞
	 * ============================================================ */
	REG({
		id: 'petal_fall', name: '🌸 花瓣纷飞',
		params: [
			{ id: 'count', type: 'range', label: '花瓣数量', min: 5, max: 60, step: 1, default: 24 },
			{ id: 'psize', type: 'range', label: '花瓣大小', min: 0.5, max: 8, step: 0.5, default: 3 },
			{ id: 'radius', type: 'range', label: '分布半径', min: 0.3, max: 4, step: 0.1, default: 1.3 },
			{ id: 'height', type: 'range', label: '飘落层高', min: 0.5, max: 4, step: 0.1, default: 2 },
			{ id: 'fall', type: 'range', label: '下落速度', min: 0.2, max: 4, step: 0.1, default: 1 },
			{ id: 'spin', type: 'range', label: '翻转速度', min: 0, max: 8, step: 0.1, default: 3 },
			{ id: 'wind', type: 'range', label: '风力漂移', min: 0, max: 2, step: 0.1, default: 0.8 },
			{ id: 'opacity', type: 'range', label: '透明度', min: 0.05, max: 1, step: 0.05, default: 0.85 },
			{ id: 'colorA', type: 'color', label: '花色浅', default: '#ffb7c5' },
			{ id: 'colorB', type: 'color', label: '花色深', default: '#ff7fa5' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var m = metrics(object);
			var n = clamp(Math.round(num(config, 'count', 24)), 3, 60);
			var R = m.radius * num(config, 'radius', 1.3);
			var geo = new THREE.PlaneGeometry(1, 0.62);
			_ca.set(colOf(config.colorA, '#ffb7c5'));
			_cb.set(colOf(config.colorB, '#ff7fa5'));
			for (var i = 0; i < n; i++) {
				var a = Math.random() * 6.283, rr = Math.sqrt(Math.random()) * R;
				var mat = new THREE.MeshBasicMaterial({ color: _ca.clone().lerp(_cb, Math.random()), transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false });
				var mesh = new THREE.Mesh(geo, mat);
				mesh.frustumCulled = false;
				mesh.userData = { x0: Math.cos(a) * rr, z0: Math.sin(a) * rr, y0: Math.random(), fs: 0.7 + Math.random() * 0.6, ph: Math.random() * 6.283 };
				g.add(mesh);
			}
			g.userData.R0 = R;
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var q = frameTick();
			var R0 = group.userData.R0 || 1;
			var R = m.radius * num(config, 'radius', 1.3);
			var k = R / Math.max(R0, 1e-4);
			var H = m.height * num(config, 'height', 2);
			var fall = num(config, 'fall', 1) * 0.2, spin = num(config, 'spin', 3);
			var wind = num(config, 'wind', 0.8), op = num(config, 'opacity', 0.85);
			var psize = num(config, 'psize', 3) * R * 0.028;
			var top = m.top + 0.1, t = time, nEff = (group.children.length * q) | 0;
			for (var i = 0; i < group.children.length; i++) {
				var mesh = group.children[i], u = mesh.userData;
				if (!u || u.x0 === undefined) continue;
				mesh.visible = i < nEff;
				if (!mesh.visible) continue;
				var cyc = wrap01(u.y0 + t * fall * u.fs);
				mesh.position.set(u.x0 * k + Math.sin(t * wind * 0.8 + u.ph) * 0.1 * R, top - cyc * H, u.z0 * k + Math.cos(t * wind * 0.6 + u.ph * 1.3) * 0.08 * R);
				mesh.rotation.set(t * spin * u.fs, t * spin * u.fs * 1.3 + u.ph, Math.sin(t + u.ph) * 0.8);
				mesh.scale.setScalar(Math.max(psize, 0.01));
				mesh.material.opacity = clamp(op * (1 - cyc * 0.2), 0.03, 1);
			}
		}
	});

	/* ============================================================
	 * 14 ⚡ 电弧闪电
	 * ============================================================ */
	REG({
		id: 'lightning_arc', name: '⚡ 电弧闪电',
		params: [
			{ id: 'arcs', type: 'range', label: '电弧数量', min: 1, max: 10, step: 1, default: 5 },
			{ id: 'segs', type: 'range', label: '折线段数', min: 4, max: 14, step: 1, default: 8 },
			{ id: 'radius', type: 'range', label: '劈落半径', min: 0.3, max: 4, step: 0.1, default: 1.2 },
			{ id: 'height', type: 'range', label: '劈落距离', min: 0.5, max: 3, step: 0.1, default: 1.6 },
			{ id: 'speed', type: 'range', label: '闪现速度', min: 0.2, max: 6, step: 0.1, default: 1.5 },
			{ id: 'jitter', type: 'range', label: '抖动强度', min: 0, max: 1, step: 0.05, default: 0.5 },
			{ id: 'flash', type: 'range', label: '闪光强度', min: 0, max: 1, step: 0.05, default: 0.85 },
			{ id: 'colorA', type: 'color', label: '电弧色', default: '#bfe9ff' },
			{ id: 'colorB', type: 'color', label: '电芯色', default: '#ffffff' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var m = metrics(object);
			var nA = clamp(Math.round(num(config, 'arcs', 5)), 1, 10);
			var nS = clamp(Math.round(num(config, 'segs', 8)), 3, 14);
			var R = m.radius * num(config, 'radius', 1.2);
			for (var i = 0; i < nA; i++) {
				var a = Math.random() * 6.283, rr = (0.4 + Math.random() * 0.6) * R;
				var geo = new THREE.BufferGeometry();
				geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((nS + 1) * 3), 3));
				var mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
				var line = new THREE.Line(geo, mat);
				line.frustumCulled = false;
				line.userData = { x0: Math.cos(a) * rr, z0: Math.sin(a) * rr, topY: m.top, dx: Math.random() - 0.5, dz: Math.random() - 0.5, ph: Math.random(), fs: 0.8 + Math.random() * 0.4, nS: nS };
				g.add(line);
			}
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var q = frameTick();
			var R = m.radius * num(config, 'radius', 1.2);
			var L = num(config, 'height', 1.6) * m.height;
			var spd = num(config, 'speed', 1.5), jit = num(config, 'jitter', 0.5);
			var flash = num(config, 'flash', 0.85), t = time;
			var nA = group.children.length, nEffA = Math.max(1, (nA * q) | 0);
			_ca.set(colOf(config.colorA, '#bfe9ff'));
			_cb.set(colOf(config.colorB, '#ffffff'));
			for (var i = 0; i < nA; i++) {
				var line = group.children[i], u = line.userData;
				if (!u || u.x0 === undefined) continue;
				line.visible = i < nEffA;
				if (!line.visible) continue;
				var nS = u.nS, pos = line.geometry.attributes.position.array;
				var lt = wrap01(t * spd * u.fs * 0.4 + u.ph);
				var K = Math.max(0, 1 - lt * 2.2);
				var reach = Math.min(1, lt * 1.4) * L;
				for (var s = 0; s <= nS; s++) {
					var f = s / nS, j = s * 3;
					pos[j] = u.x0 + u.dx * reach * 0.18 * f + Math.sin(t * 37 + s * 2.3 + u.ph * 10) * 0.035 * R * jit * K;
					pos[j + 1] = u.topY - reach * f;
					pos[j + 2] = u.z0 + u.dz * reach * 0.18 * f + Math.cos(t * 33 + s * 1.9 + u.ph * 10) * 0.035 * R * jit * K;
				}
				line.geometry.attributes.position.needsUpdate = true;
				var br = K * (0.3 + 0.7 * flash);
				line.material.color.copy(_ca).lerp(_cb, K * 0.6);
				line.material.opacity = clamp(br, 0, 1);
			}
		}
	});

	/* ============================================================
	 * 15 🌌 银河旋臂
	 * ============================================================ */
	REG({
		id: 'galaxy_spiral', name: '🌌 银河旋臂',
		params: [
			{ id: 'count', type: 'range', label: '恒星数量', min: 300, max: 4000, step: 100, default: 1400 },
			{ id: 'psize', type: 'range', label: '恒星大小', min: 1, max: 20, step: 1, default: 4 },
			{ id: 'arms', type: 'range', label: '旋臂数量', min: 1, max: 6, step: 1, default: 3 },
			{ id: 'radius', type: 'range', label: '星系半径', min: 0.3, max: 4, step: 0.1, default: 1.5 },
			{ id: 'flat', type: 'range', label: '盘面厚度', min: 0.05, max: 1, step: 0.05, default: 0.18 },
			{ id: 'speed', type: 'range', label: '旋转速度', min: 0, max: 6, step: 0.1, default: 1.2 },
			{ id: 'wind', type: 'range', label: '旋臂缠绕', min: 0.5, max: 4, step: 0.1, default: 2.2 },
			{ id: 'glow', type: 'range', label: '辉光强度', min: 0, max: 1, step: 0.05, default: 0.8 },
			{ id: 'colorCore', type: 'color', label: '核心色', default: '#ffe9b0' },
			{ id: 'colorEdge', type: 'color', label: '边缘色', default: '#6f7bff' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var n = clamp(Math.round(num(config, 'count', 1400)), 100, 4000);
			var pts = makePoints(n, colOf(config.colorCore, '#ffe9b0'));
			var d = [];
			for (var i = 0; i < n; i++) {
				var tt = Math.pow(Math.random(), 0.75);
				d.push({ arm: i % Math.max(1, Math.round(num(config, 'arms', 3))), tt: tt, s1: (Math.random() - 0.5) * 0.2 * (0.3 + tt), s2: (Math.random() - 0.5) * 0.2 * (0.3 + tt), yy: Math.random() - 0.5, ph: Math.random() * 6.283 });
			}
			pts.userData.d = d;
			var core = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), glowMat(colOf(config.colorCore, '#ffe9b0'), 0.85));
			g.add(core);
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var q = frameTick();
			var pts = group.children[0], core = group.children[1];
			if (!pts) return;
			var pos = pts.geometry.attributes.position.array;
			var col = pts.geometry.attributes.color.array;
			var d = pts.userData.d, n = d.length, nEff = (n * q) | 0;
			var arms = Math.max(1, Math.round(num(config, 'arms', 3)));
			var R = m.radius * num(config, 'radius', 1.5);
			var H = m.height * num(config, 'flat', 0.18);
			var spd = num(config, 'speed', 1.2), wind = num(config, 'wind', 2.2);
			var glow = num(config, 'glow', 0.8), t = time;
			_ca.set(colOf(config.colorCore, '#ffe9b0'));
			_cb.set(colOf(config.colorEdge, '#6f7bff'));
			var gate = colorGate(pts.userData, n);
			for (var i = 0; i < n; i++) {
				var j = i * 3;
				if (i >= nEff) { col[j] = 0; col[j + 1] = 0; col[j + 2] = 0; continue; }
				var p = d[i], r = p.tt * R;
				var ang = p.arm * (6.283 / arms) + p.tt * wind + t * spd * (1.25 - p.tt * 0.9);
				pos[j] = Math.cos(ang) * r + p.s1 * R * 0.35;
				pos[j + 1] = m.center.y + p.yy * H * 0.5 * (0.4 + p.tt);
				pos[j + 2] = Math.sin(ang) * r + p.s2 * R * 0.35;
				if (gate) {
					_cc.copy(_ca).lerp(_cb, p.tt);
					var br = (0.55 + 0.45 * Math.sin(t * 2 + p.ph)) * (1.15 - p.tt * 0.6) * (0.4 + 0.6 * glow);
					col[j] = _cc.r * br; col[j + 1] = _cc.g * br; col[j + 2] = _cc.b * br;
				}
			}
			pts.geometry.attributes.position.needsUpdate = true;
			if (gate) pts.geometry.attributes.color.needsUpdate = true;
			pts.material.size = Math.max(0.004, num(config, 'psize', 4) * 0.004);
			pts.material.opacity = clamp(0.4 + glow * 0.6, 0.05, 1);
			if (core && core.material) {
				var cs = Math.max(0.02, R * 0.09 * (1 + 0.18 * Math.sin(t * 3)));
				core.scale.setScalar(cs);
				core.position.copy(m.center);
				core.material.opacity = clamp(0.55 + 0.35 * glow, 0.1, 1);
			}
		}
	});

	/* ============================================================
	 * 16 🌊 水波荡漾
	 * ============================================================ */
	REG({
		id: 'water_ripple', name: '🌊 水波荡漾',
		params: [
			{ id: 'waves', type: 'range', label: '波源数量', min: 1, max: 5, step: 1, default: 3 },
			{ id: 'segs', type: 'range', label: '水面精度', min: 16, max: 64, step: 4, default: 40 },
			{ id: 'radius', type: 'range', label: '水面半径', min: 0.3, max: 4, step: 0.1, default: 1.3 },
			{ id: 'speed', type: 'range', label: '波速', min: 0.2, max: 6, step: 0.1, default: 2 },
			{ id: 'amp', type: 'range', label: '波峰高度', min: 0, max: 1, step: 0.05, default: 0.12 },
			{ id: 'fade', type: 'range', label: '边缘衰减', min: 0, max: 1, step: 0.05, default: 0.5 },
			{ id: 'opacity', type: 'range', label: '透明度', min: 0.05, max: 1, step: 0.05, default: 0.8 },
			{ id: 'colorA', type: 'color', label: '深水色', default: '#39a0ff' },
			{ id: 'colorB', type: 'color', label: '波峰色', default: '#bff3ff' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var m = metrics(object);
			var R = m.radius * num(config, 'radius', 1.3);
			var seg = clamp(Math.round(num(config, 'segs', 40)), 12, 64);
			var geo = new THREE.PlaneGeometry(R * 2, R * 2, seg, seg);
			var posA = geo.attributes.position;
			var base = new Float32Array(posA.count * 2);
			for (var i = 0; i < posA.count; i++) { base[i * 2] = posA.getX(i); base[i * 2 + 1] = posA.getY(i); }
			geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(posA.count * 3), 3));
			var mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.8, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
			mesh.rotation.x = -Math.PI / 2;
			mesh.position.y = m.center.y;
			mesh.frustumCulled = false;
			var nW = clamp(Math.round(num(config, 'waves', 3)), 1, 5);
			var src = [];
			for (var w = 0; w < nW; w++) {
				var a = Math.random() * 6.283, rr = Math.random() * R * 0.55;
				src.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr, ph: Math.random() * 6.283 });
			}
			mesh.userData = { R0: R, base: base, src: src };
			g.add(mesh);
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var mesh = group.children[0]; if (!mesh) return;
			var u = mesh.userData, R0 = u.R0, base = u.base, src = u.src;
			var R = m.radius * num(config, 'radius', 1.3);
			var k = R / Math.max(R0, 1e-4);
			mesh.scale.set(k, k, 1);
			mesh.position.y = m.center.y;
			var geo = mesh.geometry;
			var pos = geo.attributes.position.array;
			var col = geo.attributes.color.array;
			var cnt = pos.length / 3;
			var sp = num(config, 'speed', 2) * 2.2;
			var amp = num(config, 'amp', 0.12) * m.height * 0.6;
			var fade = num(config, 'fade', 0.5), op = num(config, 'opacity', 0.8);
			var kk = 6.283 / (R * 0.55), t = time;
			_ca.set(colOf(config.colorA, '#39a0ff'));
			_cb.set(colOf(config.colorB, '#bff3ff'));
			for (var i = 0; i < cnt; i++) {
				var j = i * 3, x = base[i * 2], y = base[i * 2 + 1], h = 0;
				for (var w = 0; w < src.length; w++) {
					var dx = x * k - src[w].x, dy = y * k - src[w].y;
					var dd = Math.sqrt(dx * dx + dy * dy);
					h += Math.sin(dd * kk - t * sp + src[w].ph) * Math.exp(-fade * dd / R) / (1 + dd * 2.2 / R);
				}
				pos[j + 2] = h * amp;
				var dist0 = Math.sqrt(x * x + y * y) * k;
				var edge = 1 - sstep(0.72, 1.0, dist0 / R);
				var hn = clamp(0.5 + h * 0.9, 0, 1);
				_cc.copy(_ca).lerp(_cb, hn);
				var br = edge * (0.55 + 0.45 * op);
				col[j] = _cc.r * br; col[j + 1] = _cc.g * br; col[j + 2] = _cc.b * br;
			}
			geo.attributes.position.needsUpdate = true;
			geo.attributes.color.needsUpdate = true;
			mesh.material.opacity = clamp(op, 0.05, 1);
		}
	});

	/* ============================================================
	 * 17 💠 数字流光
	 * ============================================================ */
	REG({
		id: 'data_stream', name: '💠 数字流光',
		params: [
			{ id: 'count', type: 'range', label: '流光数量', min: 100, max: 2000, step: 50, default: 700 },
			{ id: 'psize', type: 'range', label: '光点大小', min: 1, max: 20, step: 1, default: 4 },
			{ id: 'radius', type: 'range', label: '环绕半径', min: 0.3, max: 4, step: 0.1, default: 1.2 },
			{ id: 'height', type: 'range', label: '流层高度', min: 0.5, max: 4, step: 0.1, default: 2 },
			{ id: 'speed', type: 'range', label: '上升速度', min: 0.1, max: 5, step: 0.1, default: 1.2 },
			{ id: 'spin', type: 'range', label: '环绕速度', min: -5, max: 5, step: 0.1, default: 1.5 },
			{ id: 'stream', type: 'range', label: '流线长度', min: 0.1, max: 1, step: 0.05, default: 0.4 },
			{ id: 'glow', type: 'range', label: '辉光强度', min: 0, max: 1, step: 0.05, default: 0.85 },
			{ id: 'colorA', type: 'color', label: '主色', default: '#00e5ff' },
			{ id: 'colorB', type: 'color', label: '辅色', default: '#7c4dff' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var m = metrics(object);
			var n = clamp(Math.round(num(config, 'count', 700)), 50, 2000);
			var R = m.radius * num(config, 'radius', 1.2);
			var pts = makePoints(n, colOf(config.colorA, '#00e5ff'));
			var d = [];
			for (var i = 0; i < n; i++) {
				var a = Math.random() * 6.283, rr = Math.sqrt(Math.random()) * R;
				d.push({ a0: a, rr: rr / Math.max(R, 1e-4), y0: Math.random(), fs: 0.7 + Math.random() * 0.6, ph: Math.random() * 6.283, hue: Math.random() });
			}
			pts.userData.d = d; pts.userData.R0 = R;
			g.add(pts);
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var q = frameTick();
			var pts = group.children[0]; if (!pts) return;
			var pos = pts.geometry.attributes.position.array;
			var col = pts.geometry.attributes.color.array;
			var d = pts.userData.d, n = d.length, nEff = (n * q) | 0;
			var k = (m.radius * num(config, 'radius', 1.2)) / Math.max(pts.userData.R0, 1e-4);
			var H = m.height * num(config, 'height', 2);
			var up = num(config, 'speed', 1.2) * 0.25, spin = num(config, 'spin', 1.5);
			var glow = num(config, 'glow', 0.85), t = time, base = m.bottom;
			_ca.set(colOf(config.colorA, '#00e5ff'));
			_cb.set(colOf(config.colorB, '#7c4dff'));
			for (var i = 0; i < n; i++) {
				var j = i * 3;
				if (i >= nEff) { col[j] = 0; col[j + 1] = 0; col[j + 2] = 0; continue; }
				var p = d[i];
				var cyc = wrap01(p.y0 + t * up * p.fs);
				var ang = p.a0 * k + t * spin * (1.3 - p.rr) + p.ph;
				var rr = p.rr * m.radius * num(config, 'radius', 1.2);
				pos[j] = Math.cos(ang) * rr;
				pos[j + 1] = base + cyc * H;
				pos[j + 2] = Math.sin(ang) * rr;
				_cc.copy(_ca).lerp(_cb, p.hue);
				var br = (1 - cyc * 0.6) * (0.4 + 0.6 * glow) * (0.7 + 0.3 * Math.sin(t * 5 + p.ph));
				col[j] = _cc.r * br; col[j + 1] = _cc.g * br; col[j + 2] = _cc.b * br;
			}
			pts.geometry.attributes.position.needsUpdate = true;
			pts.geometry.attributes.color.needsUpdate = true;
			pts.material.size = Math.max(0.004, num(config, 'psize', 4) * 0.004);
			pts.material.opacity = clamp(0.35 + glow * 0.65, 0.05, 1);
		}
	});

	/* ============================================================
	 * 18 🔮 全息投影 (全息线框罩 + 循环扫描面 + 全息闪烁)
	 * ============================================================ */
	REG({
		id: 'holo_scan', name: '🔮 全息投影',
		params: [
			{ id: 'radius', type: 'range', label: '投影半径', min: 0.3, max: 3, step: 0.1, default: 1.05 },
			{ id: 'scanSpeed', type: 'range', label: '扫描速度', min: 0.1, max: 3, step: 0.1, default: 0.8 },
			{ id: 'spin', type: 'range', label: '旋转速度', min: -3, max: 3, step: 0.1, default: 0.4 },
			{ id: 'flicker', type: 'range', label: '全息闪烁', min: 0, max: 1, step: 0.05, default: 0.5 },
			{ id: 'opacity', type: 'range', label: '投影透明度', min: 0.05, max: 1, step: 0.05, default: 0.6 },
			{ id: 'colorA', type: 'color', label: '全息主色', default: '#00f0ff' },
			{ id: 'colorB', type: 'color', label: '全息辅色', default: '#0066ff' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var m = metrics(object);
			var R = m.radius * num(config, 'radius', 1.05), H = m.height;
			_ca.set(colOf(config.colorA, '#00f0ff'));
			var wire = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 0.96, H, 20, 5, true), wireMat(config.colorA, 0.2));
			wire.position.copy(m.center);
			wire.userData.role = 'wire';
			var scan = new THREE.Mesh(new THREE.RingGeometry(0.05, 1, 36), glowMat(config.colorB, 0.35));
			scan.rotation.x = -Math.PI / 2;
			scan.scale.setScalar(R);
			scan.userData.role = 'scan';
			var base = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 48), glowMat(config.colorA, 0.5));
			base.rotation.x = -Math.PI / 2;
			base.scale.setScalar(R);
			base.position.set(m.center.x, m.bottom + 0.01, m.center.z);
			base.userData.role = 'base';
			var topR = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.56, 40), glowMat(config.colorA, 0.4));
			topR.rotation.x = -Math.PI / 2;
			topR.scale.setScalar(R);
			topR.position.set(m.center.x, m.top + 0.01, m.center.z);
			topR.userData.role = 'top';
			g.add(wire); g.add(scan); g.add(base); g.add(topR);
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var R = m.radius * num(config, 'radius', 1.05), H = m.height;
			var spd = num(config, 'scanSpeed', 0.8), spin = num(config, 'spin', 0.4);
			var fk = num(config, 'flicker', 0.5), op = num(config, 'opacity', 0.6), t = time;
			var flick = 1 - fk * 0.55 * Math.max(0, Math.sin(t * 23.7) * Math.sin(t * 9.1));
			for (var i = 0; i < group.children.length; i++) {
				var o = group.children[i], role = o.userData.role;
				if (role === 'wire') {
					o.rotation.y += cd(delta) * spin;
					o.position.copy(m.center);
					o.material.opacity = clamp(op * (0.18 + 0.1 * Math.sin(t * 3)) * flick, 0.02, 1);
				} else if (role === 'scan') {
					var k = wrap01(t * spd * 0.35);
					o.position.set(m.center.x, m.bottom + k * H, m.center.z);
					o.scale.setScalar(R);
					o.material.opacity = clamp(op * (0.2 + 0.3 * Math.sin(k * Math.PI)) * flick, 0.02, 1);
				} else {
					o.material.opacity = clamp(op * (role === 'base' ? 0.5 : 0.4) * (0.8 + 0.2 * Math.sin(t * 2.2 + (role === 'base' ? 0 : 1.5))) * flick, 0.02, 1);
				}
			}
		}
	});

	/* ============================================================
	 * 19 🛡️ 能量护盾 (线框护盾 + 扩散涟漪壳 + 呼吸脉动)
	 * ============================================================ */
	REG({
		id: 'energy_shield', name: '🛡️ 能量护盾',
		params: [
			{ id: 'radius', type: 'range', label: '护盾半径', min: 0.5, max: 3, step: 0.1, default: 1.15 },
			{ id: 'pulseSpeed', type: 'range', label: '涟漪速度', min: 0.1, max: 4, step: 0.1, default: 1.0 },
			{ id: 'ripples', type: 'range', label: '涟漪层数', min: 1, max: 5, step: 1, default: 3 },
			{ id: 'spin', type: 'range', label: '旋转速度', min: -3, max: 3, step: 0.1, default: 0.5 },
			{ id: 'opacity', type: 'range', label: '护盾透明度', min: 0.05, max: 1, step: 0.05, default: 0.5 },
			{ id: 'colorA', type: 'color', label: '护盾色', default: '#37f5ff' },
			{ id: 'colorB', type: 'color', label: '涟漪色', default: '#a5b8ff' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var m = metrics(object);
			var R = m.radius * num(config, 'radius', 1.15);
			var shellGeo = new THREE.SphereGeometry(1, 22, 13);
			var outer = new THREE.Mesh(shellGeo, wireMat(config.colorA, 0.22));
			outer.scale.set(R, R * 0.82, R);
			outer.position.copy(m.center);
			outer.userData.role = 'outer';
			var nR = clamp(Math.round(num(config, 'ripples', 3)), 1, 5);
			for (var i = 0; i < nR; i++) {
				var rp = new THREE.Mesh(shellGeo, glowMat(config.colorB, 0.15));
				rp.scale.setScalar(R * 0.9);
				rp.position.copy(m.center);
				rp.userData.role = 'ripple';
				rp.userData.ph = i / nR;
				g.add(rp);
			}
			var eq = new THREE.Mesh(new THREE.RingGeometry(0.94, 1, 56), glowMat(config.colorA, 0.45));
			eq.rotation.x = -Math.PI / 2;
			eq.scale.setScalar(R);
			eq.position.copy(m.center);
			eq.userData.role = 'eq';
			g.add(outer);
			g.add(eq);
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var R = m.radius * num(config, 'radius', 1.15);
			var ps = num(config, 'pulseSpeed', 1), spin = num(config, 'spin', 0.5);
			var op = num(config, 'opacity', 0.5), t = time, d = cd(delta);
			_ca.set(colOf(config.colorA, '#37f5ff'));
			_cb.set(colOf(config.colorB, '#a5b8ff'));
			for (var i = 0; i < group.children.length; i++) {
				var o = group.children[i], role = o.userData.role;
				if (role === 'outer') {
					o.rotation.y += d * spin;
					o.rotation.x = Math.sin(t * 0.4) * 0.15;
					o.position.copy(m.center);
					o.material.opacity = clamp(op * (0.2 + 0.1 * Math.sin(t * 5.3) * Math.sin(t * 2.1)) + 0.06, 0.02, 1);
				} else if (role === 'ripple') {
					var k = wrap01(t * ps * 0.35 + o.userData.ph);
					var s = R * (0.82 + 0.45 * k);
					o.scale.set(s, s * 0.82, s);
					o.position.copy(m.center);
					o.material.opacity = clamp((1 - k) * op * 0.5, 0.01, 1);
					o.material.color.copy(_cb);
				} else {
					o.scale.setScalar(R * (1 + 0.02 * Math.sin(t * 3)));
					o.position.copy(m.center);
					o.material.opacity = clamp(op * 0.8 * (0.7 + 0.3 * Math.sin(t * 2.6)), 0.02, 1);
					o.material.color.copy(_ca);
				}
			}
		}
	});

	/* ============================================================
	 * 20 🎯 激光矩阵 (旋转扇形激光束 + 地面扩散环)
	 * ============================================================ */
	REG({
		id: 'laser_fan', name: '🎯 激光矩阵',
		params: [
			{ id: 'beams', type: 'range', label: '激光束数', min: 2, max: 12, step: 1, default: 6 },
			{ id: 'radius', type: 'range', label: '激光半径', min: 0.3, max: 3, step: 0.1, default: 1.1 },
			{ id: 'height', type: 'range', label: '激光高度', min: 0.5, max: 3, step: 0.1, default: 1.5 },
			{ id: 'rotSpeed', type: 'range', label: '旋转速度', min: -5, max: 5, step: 0.1, default: 1.2 },
			{ id: 'pulse', type: 'range', label: '脉冲频率', min: 0.1, max: 8, step: 0.1, default: 3 },
			{ id: 'glow', type: 'range', label: '激光亮度', min: 0, max: 1, step: 0.05, default: 0.9 },
			{ id: 'colorA', type: 'color', label: '激光色', default: '#ff2d55' },
			{ id: 'colorB', type: 'color', label: '光晕色', default: '#ff99aa' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var m = metrics(object);
			var n = clamp(Math.round(num(config, 'beams', 6)), 2, 12);
			var R = m.radius * num(config, 'radius', 1.1);
			var lines = makeLines(n * 2, 0.95);
			lines.userData.n = n;
			var ring = new THREE.Mesh(new THREE.RingGeometry(0.93, 1, 48), glowMat(config.colorB, 0.4));
			ring.rotation.x = -Math.PI / 2;
			ring.scale.setScalar(R);
			ring.position.set(m.center.x, m.bottom + 0.01, m.center.z);
			g.add(lines); g.add(ring);
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var lines = group.children[0], ring = group.children[1];
			if (!lines) return;
			var n = lines.userData.n;
			var R = m.radius * num(config, 'radius', 1.1);
			var H = m.height * num(config, 'height', 1.5);
			var rs = num(config, 'rotSpeed', 1.2), pf = num(config, 'pulse', 3);
			var glow = num(config, 'glow', 0.9), t = time;
			var pos = lines.geometry.attributes.position.array;
			var col = lines.geometry.attributes.color.array;
			_ca.set(colOf(config.colorA, '#ff2d55'));
			_cb.set(colOf(config.colorB, '#ff99aa'));
			var baseAng = t * rs;
			for (var i = 0; i < n; i++) {
				var a = baseAng + i * 6.283 / n;
				var ca = Math.cos(a), sa = Math.sin(a);
				var j = i * 6;
				var hOut = H * (0.82 + 0.18 * Math.sin(t * 2 + i * 1.1));
				pos[j] = m.center.x + ca * R * 0.3; pos[j + 1] = m.bottom; pos[j + 2] = m.center.z + sa * R * 0.3;
				pos[j + 3] = m.center.x + ca * R; pos[j + 4] = m.bottom + hOut; pos[j + 5] = m.center.z + sa * R;
				var br = (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * pf + i * 1.3))) * glow;
				col[j] = _cb.r * br * 0.4; col[j + 1] = _cb.g * br * 0.4; col[j + 2] = _cb.b * br * 0.4;
				col[j + 3] = _ca.r * br; col[j + 4] = _ca.g * br; col[j + 5] = _ca.b * br;
			}
			lines.geometry.attributes.position.needsUpdate = true;
			lines.geometry.attributes.color.needsUpdate = true;
			var k = wrap01(t * 0.45);
			ring.scale.setScalar(R * (0.15 + 0.85 * k));
			ring.material.opacity = clamp((1 - k) * 0.5, 0.01, 1);
		}
	});

	/* ============================================================
	 * 21 🌐 赛博隧道 (数据流上升 + 能量环穿越)
	 * ============================================================ */
	REG({
		id: 'cyber_tunnel', name: '🌐 赛博隧道',
		params: [
			{ id: 'count', type: 'range', label: '数据粒子', min: 200, max: 3000, step: 100, default: 1000 },
			{ id: 'psize', type: 'range', label: '粒子大小', min: 1, max: 20, step: 1, default: 4 },
			{ id: 'radius', type: 'range', label: '隧道半径', min: 0.3, max: 3, step: 0.1, default: 1.0 },
			{ id: 'height', type: 'range', label: '隧道高度', min: 0.5, max: 4, step: 0.1, default: 2.2 },
			{ id: 'speed', type: 'range', label: '流速', min: 0.5, max: 6, step: 0.1, default: 2.5 },
			{ id: 'rings', type: 'range', label: '能量环数', min: 1, max: 8, step: 1, default: 4 },
			{ id: 'glow', type: 'range', label: '辉光强度', min: 0, max: 1, step: 0.05, default: 0.85 },
			{ id: 'colorA', type: 'color', label: '数据色', default: '#00ffc8' },
			{ id: 'colorB', type: 'color', label: '能量环色', default: '#0088ff' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var m = metrics(object);
			var n = clamp(Math.round(num(config, 'count', 1000)), 50, 3000);
			var R = m.radius * num(config, 'radius', 1.0);
			var pts = makePoints(n, colOf(config.colorA, '#00ffc8'));
			var d = [];
			for (var i = 0; i < n; i++) {
				d.push({ a: Math.random() * 6.283, rf: 0.55 + Math.random() * 0.45, y0: Math.random(), fs: 0.7 + Math.random() * 0.6, ph: Math.random() * 6.283 });
			}
			pts.userData.d = d;
			g.add(pts);
			var nR = clamp(Math.round(num(config, 'rings', 4)), 1, 8);
			var torusGeo = new THREE.TorusGeometry(1, 0.014, 6, 40);
			for (var r = 0; r < nR; r++) {
				var ring = new THREE.Mesh(torusGeo, glowMat(config.colorB, 0.3));
				ring.rotation.x = Math.PI / 2;
				ring.scale.setScalar(R);
				ring.userData.role = 'ring';
				ring.userData.ph = r / nR;
				g.add(ring);
			}
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var q = frameTick();
			var pts = group.children[0]; if (!pts) return;
			var pos = pts.geometry.attributes.position.array;
			var col = pts.geometry.attributes.color.array;
			var d = pts.userData.d, n = d.length, nEff = (n * q) | 0;
			var R = m.radius * num(config, 'radius', 1.0);
			var H = m.height * num(config, 'height', 2.2);
			var spd = num(config, 'speed', 2.5), glow = num(config, 'glow', 0.85), t = time;
			var bottom = m.bottom;
			_ca.set(colOf(config.colorA, '#00ffc8'));
			_cb.set(colOf(config.colorB, '#0088ff'));
			var gate = colorGate(pts.userData, n);
			for (var i = 0; i < n; i++) {
				var j = i * 3;
				if (i >= nEff) { col[j] = 0; col[j + 1] = 0; col[j + 2] = 0; continue; }
				var p = d[i];
				var cyc = wrap01(p.y0 + t * spd * 0.22 * p.fs);
				var r = R * p.rf;
				pos[j] = Math.cos(p.a) * r;
				pos[j + 1] = bottom + cyc * H;
				pos[j + 2] = Math.sin(p.a) * r;
				if (gate) {
					var br = (0.2 + 0.8 * Math.sin(cyc * Math.PI)) * (0.5 + 0.5 * Math.sin(t * 8 + p.ph)) * glow;
					col[j] = _ca.r * br; col[j + 1] = _ca.g * br; col[j + 2] = _ca.b * br;
				}
			}
			pts.geometry.attributes.position.needsUpdate = true;
			if (gate) pts.geometry.attributes.color.needsUpdate = true;
			pts.material.size = Math.max(0.004, num(config, 'psize', 4) * 0.004);
			pts.material.opacity = clamp(0.4 + glow * 0.6, 0.05, 1);
			for (var k = 1; k < group.children.length; k++) {
				var ring = group.children[k];
				if (!ring.userData || ring.userData.role !== 'ring') continue;
				var kr = wrap01(t * spd * 0.12 + ring.userData.ph);
				ring.position.y = bottom + kr * H;
				ring.scale.setScalar(R * (1 + 0.03 * Math.sin(t * 2 + kr * 6)));
				ring.material.opacity = clamp(Math.sin(kr * Math.PI) * 0.45, 0.01, 1);
			}
		}
	});

	/* ============================================================
	 * 22 ⚛️ 量子涨落 (多壳层轨道 + 确定性量子跃迁闪光)
	 * ============================================================ */
	REG({
		id: 'quantum_jump', name: '⚛️ 量子涨落',
		params: [
			{ id: 'count', type: 'range', label: '量子数量', min: 200, max: 2500, step: 100, default: 800 },
			{ id: 'psize', type: 'range', label: '量子大小', min: 1, max: 20, step: 1, default: 5 },
			{ id: 'shells', type: 'range', label: '壳层数量', min: 1, max: 5, step: 1, default: 3 },
			{ id: 'radius', type: 'range', label: '轨道半径', min: 0.3, max: 3, step: 0.1, default: 1.2 },
			{ id: 'height', type: 'range', label: '云层高度', min: 0.2, max: 3, step: 0.1, default: 1.2 },
			{ id: 'speed', type: 'range', label: '轨道速度', min: 0, max: 8, step: 0.1, default: 2.2 },
			{ id: 'jumpRate', type: 'range', label: '跃迁频率', min: 0.2, max: 4, step: 0.1, default: 1.0 },
			{ id: 'glow', type: 'range', label: '辉光强度', min: 0, max: 1, step: 0.05, default: 0.85 },
			{ id: 'colorA', type: 'color', label: '基态色', default: '#7cffb2' },
			{ id: 'colorB', type: 'color', label: '激发色', default: '#ff77e1' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var n = clamp(Math.round(num(config, 'count', 800)), 50, 2500);
			var pts = makePoints(n, colOf(config.colorA, '#7cffb2'));
			var d = [];
			for (var i = 0; i < n; i++) {
				d.push({ a0: Math.random() * 6.283, rf: Math.sqrt(Math.random()), seed: Math.random(), spin: 0.7 + Math.random() * 0.6, ph: Math.random() * 6.283 });
			}
			pts.userData.d = d;
			g.add(pts);
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var q = frameTick();
			var pts = group.children[0]; if (!pts) return;
			var pos = pts.geometry.attributes.position.array;
			var col = pts.geometry.attributes.color.array;
			var d = pts.userData.d, n = d.length, nEff = (n * q) | 0;
			var S = Math.max(1, Math.round(num(config, 'shells', 3)));
			var R = m.radius * num(config, 'radius', 1.2);
			var H = m.height * num(config, 'height', 1.2);
			var spd = num(config, 'speed', 2.2), jr = num(config, 'jumpRate', 1);
			var glow = num(config, 'glow', 0.85), t = time, cy = m.center.y;
			_ca.set(colOf(config.colorA, '#7cffb2'));
			_cb.set(colOf(config.colorB, '#ff77e1'));
			var gate = colorGate(pts.userData, n);
			for (var i = 0; i < n; i++) {
				var j = i * 3;
				if (i >= nEff) { col[j] = 0; col[j + 1] = 0; col[j + 2] = 0; continue; }
				var p = d[i];
				var f = wrap01(p.seed + t * jr * 0.22);
				var shell = Math.min(S - 1, (f * S) | 0);
				var fr2 = f * S - shell;
				var flash = fr2 < 0.12 ? (1 - fr2 / 0.12) : 0;
				var sf = S <= 1 ? 0.5 : shell / (S - 1);
				var shellR = R * (0.3 + 0.7 * sf);
				var ang = p.a0 + t * spd * p.spin * (1.3 - shell * 0.18);
				pos[j] = Math.cos(ang) * shellR;
				pos[j + 1] = cy + (p.rf - 0.5) * H + Math.sin(t * 1.6 + p.ph) * 0.05 * H;
				pos[j + 2] = Math.sin(ang) * shellR;
				if (gate) {
					_cc.copy(_ca).lerp(_cb, sf);
					var br = (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 4 + p.ph))) * (0.4 + 0.6 * glow) * (1 + flash * 1.6);
					col[j] = _cc.r * br; col[j + 1] = _cc.g * br; col[j + 2] = _cc.b * br;
				}
			}
			pts.geometry.attributes.position.needsUpdate = true;
			if (gate) pts.geometry.attributes.color.needsUpdate = true;
			pts.material.size = Math.max(0.004, num(config, 'psize', 5) * 0.004);
			pts.material.opacity = clamp(0.4 + glow * 0.6, 0.05, 1);
		}
	});

	/* ============================================================
	 * 23 🧬 DNA双螺旋 (双链旋转 + 碱基横档)
	 * ============================================================ */
	REG({
		id: 'dna_helix', name: '🧬 DNA双螺旋',
		params: [
			{ id: 'nodes', type: 'range', label: '链节点数', min: 20, max: 120, step: 2, default: 48 },
			{ id: 'psize', type: 'range', label: '节点大小', min: 1, max: 20, step: 1, default: 5 },
			{ id: 'turns', type: 'range', label: '螺旋圈数', min: 1, max: 5, step: 0.1, default: 2.2 },
			{ id: 'radius', type: 'range', label: '螺旋半径', min: 0.2, max: 2, step: 0.1, default: 0.55 },
			{ id: 'height', type: 'range', label: '螺旋高度', min: 0.5, max: 4, step: 0.1, default: 2.2 },
			{ id: 'speed', type: 'range', label: '旋转速度', min: -5, max: 5, step: 0.1, default: 1.5 },
			{ id: 'glow', type: 'range', label: '辉光强度', min: 0, max: 1, step: 0.05, default: 0.85 },
			{ id: 'colorA', type: 'color', label: '链A色', default: '#00e5ff' },
			{ id: 'colorB', type: 'color', label: '链B色', default: '#ff60d0' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var n = clamp(Math.round(num(config, 'nodes', 48)), 10, 120);
			var pts = makePoints(n * 2, colOf(config.colorA, '#00e5ff'));
			var nR = Math.max(1, Math.floor(n / 3));
			var lines = makeLines(nR * 2, 0.7);
			pts.userData.n = n;
			pts.userData.nR = nR;
			pts.userData.p1 = new Float32Array(n * 3);
			pts.userData.p2 = new Float32Array(n * 3);
			g.add(pts); g.add(lines);
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var q = frameTick();
			var pts = group.children[0], lines = group.children[1];
			if (!pts) return;
			var n = pts.userData.n, nR = pts.userData.nR;
			var pos = pts.geometry.attributes.position.array;
			var col = pts.geometry.attributes.color.array;
			var p1 = pts.userData.p1, p2 = pts.userData.p2;
			var R = m.radius * num(config, 'radius', 0.55);
			var H = m.height * num(config, 'height', 2.2);
			var turns = num(config, 'turns', 2.2), spd = num(config, 'speed', 1.5);
			var glow = num(config, 'glow', 0.85), t = time, bottom = m.bottom;
			_ca.set(colOf(config.colorA, '#00e5ff'));
			_cb.set(colOf(config.colorB, '#ff60d0'));
			var nEff = (n * q) | 0;
			for (var i = 0; i < n; i++) {
				var f = i / (n - 1);
				var ang = t * spd + f * turns * 6.283;
				var x = Math.cos(ang) * R, z = Math.sin(ang) * R;
				var y = bottom + f * H;
				var jA = i * 3, jB = (n + i) * 3;
				p1[jA] = x; p1[jA + 1] = y; p1[jA + 2] = z;
				p2[jA] = -x; p2[jA + 1] = y; p2[jA + 2] = -z;
				var vis = i < nEff;
				var br = vis ? (0.5 + 0.5 * Math.sin(t * 3 + f * 9)) * (0.45 + 0.55 * glow) : 0;
				pos[jA] = x; pos[jA + 1] = y; pos[jA + 2] = z;
				pos[jB] = -x; pos[jB + 1] = y; pos[jB + 2] = -z;
				col[jA] = _ca.r * br; col[jA + 1] = _ca.g * br; col[jA + 2] = _ca.b * br;
				col[jB] = _cb.r * br; col[jB + 1] = _cb.g * br; col[jB + 2] = _cb.b * br;
			}
			pts.geometry.attributes.position.needsUpdate = true;
			pts.geometry.attributes.color.needsUpdate = true;
			pts.material.size = Math.max(0.004, num(config, 'psize', 5) * 0.004);
			pts.material.opacity = clamp(0.4 + glow * 0.6, 0.05, 1);
			var lpos = lines.geometry.attributes.position.array;
			var lcol = lines.geometry.attributes.color.array;
			for (var k = 0; k < nR; k++) {
				var idx = k * 3, j = k * 6;
				var iN = (k * 3) % n;
				var vis2 = iN < nEff;
				var br2 = vis2 ? (0.3 + 0.3 * Math.sin(t * 4 + k)) * glow + 0.15 : 0;
				lpos[j] = p1[idx]; lpos[j + 1] = p1[idx + 1]; lpos[j + 2] = p1[idx + 2];
				lpos[j + 3] = p2[idx]; lpos[j + 4] = p2[idx + 1]; lpos[j + 5] = p2[idx + 2];
				var mr = (_ca.r + _cb.r) * 0.5, mg = (_ca.g + _cb.g) * 0.5, mb = (_ca.b + _cb.b) * 0.5;
				lcol[j] = mr * br2; lcol[j + 1] = mg * br2; lcol[j + 2] = mb * br2;
				lcol[j + 3] = mr * br2; lcol[j + 4] = mg * br2; lcol[j + 5] = mb * br2;
			}
			lines.geometry.attributes.position.needsUpdate = true;
			lines.geometry.attributes.color.needsUpdate = true;
		}
	});

	/* ============================================================
	 * 24 📡 雷达扫描 (扩散环 + 扫描扇尾 + 目标闪点)
	 * ============================================================ */
	REG({
		id: 'radar_sweep', name: '📡 雷达扫描',
		params: [
			{ id: 'radius', type: 'range', label: '雷达半径', min: 0.3, max: 3, step: 0.1, default: 1.3 },
			{ id: 'speed', type: 'range', label: '环扩散速度', min: 0.2, max: 3, step: 0.1, default: 0.8 },
			{ id: 'sweepSpeed', type: 'range', label: '扫描速度', min: 0.5, max: 5, step: 0.1, default: 1.5 },
			{ id: 'blips', type: 'range', label: '目标数量', min: 0, max: 40, step: 1, default: 16 },
			{ id: 'trail', type: 'range', label: '扇尾长度', min: 0.1, max: 1, step: 0.05, default: 0.5 },
			{ id: 'glow', type: 'range', label: '辉光强度', min: 0, max: 1, step: 0.05, default: 0.85 },
			{ id: 'colorA', type: 'color', label: '雷达色', default: '#39ff8e' },
			{ id: 'colorB', type: 'color', label: '目标色', default: '#ffe95c' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var m = metrics(object);
			var R = m.radius * num(config, 'radius', 1.3);
			var sub = new THREE.Group();
			sub.rotation.x = -Math.PI / 2;
			sub.position.y = m.center.y;
			sub.userData.role = 'sub';
			var nR = 3;
			for (var i = 0; i < nR; i++) {
				var ring = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 48), glowMat(config.colorA, 0.4));
				ring.userData.role = 'ring';
				ring.userData.ph = i / nR;
				sub.add(ring);
			}
			var arcL = Math.PI * 0.45;
			var arc = new THREE.Mesh(new THREE.RingGeometry(0.12, 1, 32, 1, 0, arcL), glowMat(config.colorA, 0.22));
			arc.userData.role = 'arc';
			arc.userData.arcL = arcL;
			sub.add(arc);
			var lineGeo = new THREE.BufferGeometry();
			lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
			var sweep = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: new THREE.Color(colOf(config.colorA, '#39ff8e')), transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
			sweep.frustumCulled = false;
			sweep.userData.role = 'sweep';
			sub.add(sweep);
			var nB = clamp(Math.round(num(config, 'blips', 16)), 0, 40);
			if (nB > 0) {
				var blips = makePoints(nB, colOf(config.colorB, '#ffe95c'));
				var bd = [];
				for (var b = 0; b < nB; b++) {
					var a = Math.random() * 6.283, rr = Math.sqrt(Math.random()) * R * 0.9;
					bd.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr, ang: a, ph: Math.random() * 6.283 });
					blips.geometry.attributes.position.array[b * 3] = Math.cos(a) * rr;
					blips.geometry.attributes.position.array[b * 3 + 1] = Math.sin(a) * rr;
				}
				blips.userData.d = bd;
				blips.material.size = Math.max(0.01, R * 0.045);
				blips.userData.role = 'blips';
				sub.add(blips);
			}
			g.add(sub);
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var R = m.radius * num(config, 'radius', 1.3);
			var spd = num(config, 'speed', 0.8), ss = num(config, 'sweepSpeed', 1.5);
			var trailF = num(config, 'trail', 0.5), glow = num(config, 'glow', 0.85), t = time;
			var sub = null;
			for (var i = 0; i < group.children.length; i++) if (group.children[i].userData.role === 'sub') { sub = group.children[i]; break; }
			if (!sub) return;
			var sweepAng = t * ss * 2.0;
			var arcL = Math.PI * 0.45 * trailF * 2;
			for (i = 0; i < sub.children.length; i++) {
				var o = sub.children[i], role = o.userData ? o.userData.role : null;
				if (role === 'ring') {
					var k = wrap01(t * spd * 0.35 + o.userData.ph);
					o.scale.setScalar(Math.max(k * R, 0.01));
					o.material.opacity = clamp((1 - k) * 0.5, 0.01, 1);
				} else if (role === 'arc') {
					o.scale.setScalar(R);
					o.rotation.z = sweepAng - arcL;
					o.material.opacity = clamp(0.1 + 0.15 * glow, 0.02, 1);
				} else if (role === 'sweep') {
					var lp = o.geometry.attributes.position.array;
					lp[0] = 0; lp[1] = 0; lp[2] = 0;
					lp[3] = Math.cos(sweepAng) * R; lp[4] = Math.sin(sweepAng) * R; lp[5] = 0;
					o.geometry.attributes.position.needsUpdate = true;
					o.material.opacity = clamp(0.5 + 0.5 * glow, 0.1, 1);
				} else if (role === 'blips') {
					var col = o.geometry.attributes.color.array;
					var bd = o.userData.d;
					_cb.set(colOf(config.colorB, '#ffe95c'));
					_ca.set(colOf(config.colorA, '#39ff8e'));
					for (var b = 0; b < bd.length; b++) {
						var j = b * 3;
						var diff = sweepAng - bd[b].ang;
						diff = diff - Math.floor(diff / 6.283) * 6.283;
						var bb = Math.max(0, 1 - diff * 1.4);
						var br = (0.08 + bb * (0.5 + 0.5 * glow)) * (0.8 + 0.2 * Math.sin(t * 5 + bd[b].ph));
						col[j] = (bb > 0.5 ? _cb.r : _ca.r) * br;
						col[j + 1] = (bb > 0.5 ? _cb.g : _ca.g) * br;
						col[j + 2] = (bb > 0.5 ? _cb.b : _ca.b) * br;
					}
					o.geometry.attributes.color.needsUpdate = true;
					o.material.opacity = 1;
					o.material.size = Math.max(0.01, R * 0.045);
				}
			}
			sub.position.y = m.center.y;
		}
	});

	/* ============================================================
	 * 25 🚪 曲率传送门 (内旋粒子盘 + 边界光环 + 摆动)
	 * ============================================================ */
	REG({
		id: 'warp_portal', name: '🚪 曲率传送门',
		params: [
			{ id: 'count', type: 'range', label: '粒子数量', min: 300, max: 3000, step: 100, default: 1200 },
			{ id: 'psize', type: 'range', label: '粒子大小', min: 1, max: 20, step: 1, default: 5 },
			{ id: 'radius', type: 'range', label: '传送门半径', min: 0.3, max: 3, step: 0.1, default: 1.1 },
			{ id: 'speed', type: 'range', label: '吸入速度', min: 0.5, max: 5, step: 0.1, default: 1.5 },
			{ id: 'swirl', type: 'range', label: '旋涡强度', min: 0, max: 4, step: 0.1, default: 1.5 },
			{ id: 'thickness', type: 'range', label: '粒子层厚', min: 0.05, max: 1, step: 0.05, default: 0.2 },
			{ id: 'glow', type: 'range', label: '辉光强度', min: 0, max: 1, step: 0.05, default: 0.9 },
			{ id: 'colorA', type: 'color', label: '外环色', default: '#a54dff' },
			{ id: 'colorB', type: 'color', label: '内芯色', default: '#4dffff' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var m = metrics(object);
			var R = m.radius * num(config, 'radius', 1.1);
			var n = clamp(Math.round(num(config, 'count', 1200)), 50, 3000);
			var pts = makePoints(n, colOf(config.colorA, '#a54dff'));
			var d = [];
			for (var i = 0; i < n; i++) {
				d.push({ a0: Math.random() * 6.283, y0: Math.random(), z0: Math.random() - 0.5, fs: 0.7 + Math.random() * 0.6, ph: Math.random() * 6.283 });
			}
			pts.userData.d = d;
			g.add(pts);
			var edge = new THREE.Mesh(new THREE.TorusGeometry(1, 0.035, 8, 64), glowMat(config.colorA, 0.75));
			edge.scale.setScalar(R);
			edge.userData.role = 'edge';
			var disc = new THREE.Mesh(new THREE.CircleGeometry(0.94, 48), glowMat(config.colorB, 0.1));
			disc.scale.setScalar(R);
			disc.userData.role = 'disc';
			g.add(edge); g.add(disc);
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var q = frameTick();
			var R = m.radius * num(config, 'radius', 1.1);
			var spd = num(config, 'speed', 1.5), swirl = num(config, 'swirl', 1.5);
			var th = num(config, 'thickness', 0.2), glow = num(config, 'glow', 0.9), t = time;
			group.position.copy(m.center);
			group.rotation.y = Math.sin(t * 0.6) * 0.25;
			var pts = group.children[0]; if (!pts) return;
			var pos = pts.geometry.attributes.position.array;
			var col = pts.geometry.attributes.color.array;
			var d = pts.userData.d, n = d.length, nEff = (n * q) | 0;
			_ca.set(colOf(config.colorA, '#a54dff'));
			_cb.set(colOf(config.colorB, '#4dffff'));
			for (var i = 0; i < n; i++) {
				var j = i * 3;
				if (i >= nEff) { col[j] = 0; col[j + 1] = 0; col[j + 2] = 0; continue; }
				var p = d[i];
				var k = wrap01(p.y0 + t * spd * 0.18 * p.fs);
				var r = R * (1 - k) * 0.97;
				var ang = p.a0 + t * spd * swirl * 1.2 * (0.35 + 1.6 * (1 - k));
				pos[j] = Math.cos(ang) * r;
				pos[j + 1] = Math.sin(ang) * r;
				pos[j + 2] = p.z0 * th * R;
				_cc.copy(_ca).lerp(_cb, 1 - k);
				var br = (0.25 + 0.75 * (1 - k)) * (0.4 + 0.6 * glow) * (0.7 + 0.3 * Math.sin(t * 6 + p.ph));
				col[j] = _cc.r * br; col[j + 1] = _cc.g * br; col[j + 2] = _cc.b * br;
			}
			pts.geometry.attributes.position.needsUpdate = true;
			pts.geometry.attributes.color.needsUpdate = true;
			pts.material.size = Math.max(0.004, num(config, 'psize', 5) * 0.004);
			pts.material.opacity = clamp(0.35 + glow * 0.65, 0.05, 1);
			var edge = group.children[1], disc = group.children[2];
			if (edge) {
				edge.scale.setScalar(R * (1 + 0.015 * Math.sin(t * 3)));
				edge.material.opacity = clamp(0.5 + 0.35 * glow * (0.7 + 0.3 * Math.sin(t * 7)), 0.05, 1);
			}
			if (disc) {
				disc.rotation.z -= cd(delta) * 0.4;
				disc.material.opacity = clamp(0.06 + 0.1 * glow * (0.6 + 0.4 * Math.sin(t * 2.2)), 0.01, 1);
			}
		}
	});

	/* ============================================================
	 * 26 🛰️ 卫星轨道 (倾斜轨道环 + 卫星拖尾)
	 * ============================================================ */
	REG({
		id: 'sat_orbit', name: '🛰️ 卫星轨道',
		params: [
			{ id: 'sats', type: 'range', label: '卫星数量', min: 1, max: 6, step: 1, default: 3 },
			{ id: 'radius', type: 'range', label: '轨道半径', min: 0.4, max: 3, step: 0.1, default: 1.4 },
			{ id: 'tilt', type: 'range', label: '轨道倾角', min: 0, max: 1, step: 0.05, default: 0.35 },
			{ id: 'speed', type: 'range', label: '公转速度', min: 0.1, max: 4, step: 0.1, default: 1.0 },
			{ id: 'trail', type: 'range', label: '拖尾弧长', min: 0.1, max: 1.5, step: 0.05, default: 0.5 },
			{ id: 'glow', type: 'range', label: '辉光强度', min: 0, max: 1, step: 0.05, default: 0.85 },
			{ id: 'colorA', type: 'color', label: '轨道色', default: '#5c8dff' },
			{ id: 'colorB', type: 'color', label: '卫星色', default: '#ffffff' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var m = metrics(object);
			var R = m.radius * num(config, 'radius', 1.4);
			var S = clamp(Math.round(num(config, 'sats', 3)), 1, 6);
			var satGeo = new THREE.SphereGeometry(1, 10, 8);
			for (var i = 0; i < S; i++) {
				var cPts = [];
				for (var k = 0; k < 64; k++) {
					var a = k / 64 * 6.283;
					cPts.push(new THREE.Vector3(Math.cos(a) * R, 0, Math.sin(a) * R));
				}
				var ringGeo = new THREE.BufferGeometry().setFromPoints(cPts);
				var ring = new THREE.Line(ringGeo, new THREE.LineBasicMaterial({ color: new THREE.Color(colOf(config.colorA, '#5c8dff')), transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
				ring.frustumCulled = false;
				ring.position.copy(m.center);
				ring.rotation.x = (Math.random() - 0.5) * num(config, 'tilt', 0.35) * 2;
				ring.rotation.z = (Math.random() - 0.5) * num(config, 'tilt', 0.35) * 1.2;
				ring.userData.role = 'orbit';
				ring.userData.R = R;
				ring.userData.ph = i * 2.1;
				ring.userData.spF = 1 + i * 0.13;
				var sat = new THREE.Mesh(satGeo, glowMat(config.colorB, 0.95));
				sat.userData.role = 'sat';
				var trailGeo = new THREE.BufferGeometry();
				trailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
				var trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color: new THREE.Color(colOf(config.colorB, '#ffffff')), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
				trail.frustumCulled = false;
				trail.userData.role = 'trail';
				ring.add(sat); ring.add(trail);
				g.add(ring);
			}
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var R = m.radius * num(config, 'radius', 1.4);
			var spd = num(config, 'speed', 1), trailA = num(config, 'trail', 0.5);
			var glow = num(config, 'glow', 0.85), t = time;
			_cb.set(colOf(config.colorB, '#ffffff'));
			for (var i = 0; i < group.children.length; i++) {
				var ring = group.children[i];
				if (!ring.userData || ring.userData.role !== 'orbit') continue;
				ring.position.copy(m.center);
				var ang = t * spd * ring.userData.spF + ring.userData.ph;
				var cx = Math.cos(ang) * R, cz = Math.sin(ang) * R;
				var tx = Math.cos(ang - trailA) * R, tz = Math.sin(ang - trailA) * R;
				for (var k = 0; k < ring.children.length; k++) {
					var o = ring.children[k];
					if (o.userData.role === 'sat') {
						o.position.set(cx, 0, cz);
						o.scale.setScalar(Math.max(R * 0.05 * (1 + 0.15 * Math.sin(t * 4 + i)), 0.01));
						o.material.opacity = clamp(0.55 + 0.45 * glow, 0.1, 1);
					} else if (o.userData.role === 'trail') {
						var lp = o.geometry.attributes.position.array;
						lp[0] = cx; lp[1] = 0; lp[2] = cz;
						lp[3] = tx; lp[4] = 0; lp[5] = tz;
						o.geometry.attributes.position.needsUpdate = true;
						o.material.opacity = clamp(0.3 + 0.4 * glow, 0.05, 1);
					}
				}
				ring.material.opacity = clamp(0.25 + 0.15 * Math.sin(t * 2 + i) + 0.1 * glow, 0.05, 1);
			}
		}
	});

	/* ============================================================
	 * 27 💫 曲速星驰 (超空间径向星光跃迁)
	 * ============================================================ */
	REG({
		id: 'warp_stars', name: '💫 曲速星驰',
		params: [
			{ id: 'stars', type: 'range', label: '星驰数量', min: 100, max: 1500, step: 50, default: 600 },
			{ id: 'radius', type: 'range', label: '星场半径', min: 0.5, max: 4, step: 0.1, default: 2.0 },
			{ id: 'speed', type: 'range', label: '跃迁速度', min: 0.5, max: 8, step: 0.1, default: 3 },
			{ id: 'stretch', type: 'range', label: '光迹拉伸', min: 0.1, max: 1, step: 0.05, default: 0.35 },
			{ id: 'glow', type: 'range', label: '辉光强度', min: 0, max: 1, step: 0.05, default: 0.85 },
			{ id: 'colorA', type: 'color', label: '星光色', default: '#cfe8ff' },
			{ id: 'colorB', type: 'color', label: '跃迁色', default: '#7fa8ff' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var n = clamp(Math.round(num(config, 'stars', 600)), 30, 1500);
			var lines = makeLines(n * 2, 0.95);
			var d = [];
			for (var i = 0; i < n; i++) {
				var u = Math.random() * 2 - 1, a = Math.random() * 6.283, s = Math.sqrt(1 - u * u);
				d.push({ dx: s * Math.cos(a), dy: u, dz: s * Math.sin(a), seed: Math.random(), br: 0.5 + Math.random() * 0.5 });
			}
			lines.userData.d = d;
			g.add(lines);
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var q = frameTick();
			var lines = group.children[0]; if (!lines) return;
			var pos = lines.geometry.attributes.position.array;
			var col = lines.geometry.attributes.color.array;
			var d = lines.userData.d, n = d.length, nEff = (n * q) | 0;
			var R = m.radius * num(config, 'radius', 2.0);
			var spd = num(config, 'speed', 3), st = num(config, 'stretch', 0.35);
			var glow = num(config, 'glow', 0.85), t = time, cy = m.center;
			_ca.set(colOf(config.colorA, '#cfe8ff'));
			_cb.set(colOf(config.colorB, '#7fa8ff'));
			var gate = colorGate(lines.userData, n);
			for (var i = 0; i < n; i++) {
				var j = i * 6;
				if (i >= nEff) { for (var z = 0; z < 6; z++) col[j + z] = 0; continue; }
				var p = d[i];
				var k = Math.pow(wrap01(p.seed + t * spd * 0.05), 1.7);
				var r = k * R;
				var hx = cy.x + p.dx * r, hy = cy.y + p.dy * r, hz = cy.z + p.dz * r;
				var rk = r * (1 - st * (0.25 + 0.75 * k));
				var br = k * p.br * (0.4 + 0.6 * glow);
				pos[j] = hx; pos[j + 1] = hy; pos[j + 2] = hz;
				pos[j + 3] = cy.x + p.dx * rk; pos[j + 4] = cy.y + p.dy * rk; pos[j + 5] = cy.z + p.dz * rk;
				if (gate) {
					col[j] = _ca.r * br; col[j + 1] = _ca.g * br; col[j + 2] = _ca.b * br;
					col[j + 3] = _cb.r * br * 0.15; col[j + 4] = _cb.g * br * 0.15; col[j + 5] = _cb.b * br * 0.15;
				}
			}
			lines.geometry.attributes.position.needsUpdate = true;
			if (gate) lines.geometry.attributes.color.needsUpdate = true;
		}
	});

	/* ============================================================
	 * 28 🔱 特斯拉电弧 (垂直闪电束 + 底部电晕火花)
	 * ============================================================ */
	REG({
		id: 'tesla_coil', name: '🔱 特斯拉电弧',
		params: [
			{ id: 'bolts', type: 'range', label: '电弧数量', min: 1, max: 8, step: 1, default: 4 },
			{ id: 'segs', type: 'range', label: '折线段数', min: 6, max: 16, step: 1, default: 10 },
			{ id: 'radius', type: 'range', label: '电弧半径', min: 0.3, max: 3, step: 0.1, default: 1.0 },
			{ id: 'strikeRate', type: 'range', label: '放电频率', min: 0.5, max: 6, step: 0.1, default: 2 },
			{ id: 'jitter', type: 'range', label: '抖动强度', min: 0, max: 1, step: 0.05, default: 0.6 },
			{ id: 'corona', type: 'range', label: '电晕数量', min: 0, max: 40, step: 2, default: 24 },
			{ id: 'glow', type: 'range', label: '辉光强度', min: 0, max: 1, step: 0.05, default: 0.9 },
			{ id: 'colorA', type: 'color', label: '电弧色', default: '#9fd8ff' },
			{ id: 'colorB', type: 'color', label: '电芯色', default: '#ffffff' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var m = metrics(object);
			var B = clamp(Math.round(num(config, 'bolts', 4)), 1, 8);
			var nS = clamp(Math.round(num(config, 'segs', 10)), 4, 16);
			var R = m.radius * num(config, 'radius', 1.0);
			for (var i = 0; i < B; i++) {
				var geo = new THREE.BufferGeometry();
				geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((nS + 1) * 3), 3));
				var line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
				line.frustumCulled = false;
				var jit = new Float32Array(64);
				for (var k = 0; k < 64; k++) jit[k] = Math.random() - 0.5;
				var a = Math.random() * 6.283, rr = Math.random() * R * 0.35;
				line.userData = { x0: Math.cos(a) * rr, z0: Math.sin(a) * rr, jit: jit, ph: Math.random(), nS: nS, role: 'bolt' };
				g.add(line);
			}
			var nC = clamp(Math.round(num(config, 'corona', 24)), 0, 40);
			if (nC > 0) {
				var corona = makePoints(nC, colOf(config.colorA, '#9fd8ff'));
				var cd2 = [];
				for (var c = 0; c < nC; c++) {
					var a2 = Math.random() * 6.283, rr2 = R * (0.3 + Math.random() * 0.3);
					cd2.push({ x: Math.cos(a2) * rr2, z: Math.sin(a2) * rr2, ph: Math.random() * 6.283 });
				}
				corona.userData.d = cd2;
				corona.userData.role = 'corona';
				corona.material.size = Math.max(0.006, R * 0.02);
				g.add(corona);
			}
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var q = frameTick();
			var R = m.radius * num(config, 'radius', 1.0);
			var H = m.height;
			var rate = num(config, 'strikeRate', 2), jit = num(config, 'jitter', 0.6);
			var glow = num(config, 'glow', 0.9), t = time;
			var top = m.top, bottom = m.bottom;
			_ca.set(colOf(config.colorA, '#9fd8ff'));
			_cb.set(colOf(config.colorB, '#ffffff'));
			var nB = 0, bolts = [];
			for (var i = 0; i < group.children.length; i++) {
				var o = group.children[i];
				if (o.userData && o.userData.role === 'bolt') bolts.push(o);
			}
			nB = bolts.length;
			var nEffB = Math.max(1, (nB * q) | 0);
			for (i = 0; i < nB; i++) {
				var line = bolts[i], u = line.userData;
				line.visible = i < nEffB;
				if (!line.visible) continue;
				var nS = u.nS, pos = line.geometry.attributes.position.array;
				var lt = wrap01(t * rate * 0.5 + u.ph);
				var inten = 1 - lt * 0.75;
				var strikeK = Math.floor(t * rate + u.ph * 100);
				for (var s = 0; s <= nS; s++) {
					var f = s / nS, j = s * 3;
					var env = Math.sin(Math.PI * Math.min(f * 1.15, 1));
					var jj = u.jit[(s * 5 + strikeK * 7) & 63];
					pos[j] = u.x0 * (1 - f * 0.7) + (jj + Math.sin(t * 41 + s * 2.7 + u.ph * 9) * 0.4) * R * 0.5 * jit * env;
					pos[j + 1] = top - f * H;
					pos[j + 2] = u.z0 * (1 - f * 0.7) + (u.jit[(s * 7 + strikeK * 11) & 63] + Math.cos(t * 37 + s * 2.1 + u.ph * 9) * 0.4) * R * 0.5 * jit * env;
				}
				line.geometry.attributes.position.needsUpdate = true;
				line.material.color.copy(_ca).lerp(_cb, inten * 0.6);
				line.material.opacity = clamp(inten * (0.4 + 0.6 * glow), 0.05, 1);
			}
			for (i = 0; i < group.children.length; i++) {
				var cor = group.children[i];
				if (!cor.userData || cor.userData.role !== 'corona') continue;
				var cpos = cor.geometry.attributes.position.array;
				var ccol = cor.geometry.attributes.color.array;
				var cd2 = cor.userData.d;
				var baseI = nEffB > 0 ? (1 - wrap01(t * rate * 0.5) * 0.75) : 0;
				for (var c2 = 0; c2 < cd2.length; c2++) {
					var j2 = c2 * 3;
					var fl = Math.max(0, Math.sin(t * 13 + cd2[c2].ph * 7));
					cpos[j2] = cd2[c2].x * (1 + 0.15 * fl);
					cpos[j2 + 1] = bottom + fl * R * 0.12;
					cpos[j2 + 2] = cd2[c2].z * (1 + 0.15 * fl);
					var br2 = fl * baseI * (0.4 + 0.6 * glow);
					ccol[j2] = _ca.r * br2; ccol[j2 + 1] = _ca.g * br2; ccol[j2 + 2] = _ca.b * br2;
				}
				cor.geometry.attributes.position.needsUpdate = true;
				cor.geometry.attributes.color.needsUpdate = true;
			}
		}
	});

	/* ============================================================
	 * 29 🧲 磁场力线 (倾斜椭圆力线 + 沿线流动粒子)
	 * ============================================================ */
	REG({
		id: 'mag_field', name: '🧲 磁场力线',
		params: [
			{ id: 'loops', type: 'range', label: '力线数量', min: 2, max: 8, step: 1, default: 4 },
			{ id: 'radius', type: 'range', label: '磁场半径', min: 0.3, max: 3, step: 0.1, default: 1.2 },
			{ id: 'dots', type: 'range', label: '每线粒子', min: 4, max: 24, step: 1, default: 10 },
			{ id: 'flowSpeed', type: 'range', label: '流动速度', min: 0.2, max: 4, step: 0.1, default: 1.0 },
			{ id: 'tilt', type: 'range', label: '磁场倾角', min: 0, max: 1, step: 0.05, default: 0.6 },
			{ id: 'glow', type: 'range', label: '辉光强度', min: 0, max: 1, step: 0.05, default: 0.8 },
			{ id: 'colorA', type: 'color', label: '力线色', default: '#4d7cff' },
			{ id: 'colorB', type: 'color', label: '粒子色', default: '#7cf5ff' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var m = metrics(object);
			var L = clamp(Math.round(num(config, 'loops', 4)), 2, 8);
			var R = m.radius * num(config, 'radius', 1.2);
			var tilt = num(config, 'tilt', 0.6);
			var nD = clamp(Math.round(num(config, 'dots', 10)), 2, 24);
			for (var i = 0; i < L; i++) {
				var rx = R * (0.75 + 0.25 * Math.random()), rz = rx * (0.45 + 0.15 * Math.random());
				var ePts = [];
				for (var k = 0; k < 48; k++) {
					var a = k / 48 * 6.283;
					ePts.push(new THREE.Vector3(Math.cos(a) * rx, 0, Math.sin(a) * rz));
				}
				var loopGeo = new THREE.BufferGeometry().setFromPoints(ePts);
				var loop = new THREE.Line(loopGeo, new THREE.LineBasicMaterial({ color: new THREE.Color(colOf(config.colorA, '#4d7cff')), transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
				loop.frustumCulled = false;
				loop.position.copy(m.center);
				loop.rotation.x = (i / (L - 1) - 0.5) * Math.PI * tilt + (Math.random() - 0.5) * 0.15;
				loop.rotation.y = i * 6.283 / L;
				loop.userData.role = 'loop';
				loop.userData.rx = rx; loop.userData.rz = rz;
				loop.userData.seedArr = (function () { var arr = []; for (var q = 0; q < nD; q++) arr.push(Math.random()); return arr; })();
				var dpts = makePoints(nD, colOf(config.colorB, '#7cf5ff'));
				dpts.userData.role = 'dots';
				loop.add(dpts);
				g.add(loop);
			}
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var q = frameTick();
			var fs = num(config, 'flowSpeed', 1), glow = num(config, 'glow', 0.8), t = time;
			_ca.set(colOf(config.colorA, '#4d7cff'));
			_cb.set(colOf(config.colorB, '#7cf5ff'));
			for (var i = 0; i < group.children.length; i++) {
				var loop = group.children[i];
				if (!loop.userData || loop.userData.role !== 'loop') continue;
				loop.position.copy(m.center);
				loop.rotation.y += cd(delta) * 0.06;
				loop.material.opacity = clamp(0.25 + 0.15 * Math.sin(t * 1.5 + i) + 0.1 * glow, 0.05, 1);
				var rx = loop.userData.rx, rz = loop.userData.rz;
				var seeds = loop.userData.seedArr;
				for (var k = 0; k < loop.children.length; k++) {
					var dpts = loop.children[k];
					if (!dpts.userData || dpts.userData.role !== 'dots') continue;
					var pos = dpts.geometry.attributes.position.array;
					var col = dpts.geometry.attributes.color.array;
					var nD = seeds.length, nEffD = Math.max(1, (nD * q) | 0);
					for (var b = 0; b < nD; b++) {
						var j = b * 3;
						if (b >= nEffD) { col[j] = 0; col[j + 1] = 0; col[j + 2] = 0; continue; }
						var prm = wrap01(seeds[b] + t * fs * 0.12 * (1 + i * 0.1));
						var a2 = prm * 6.283;
						pos[j] = Math.cos(a2) * rx;
						pos[j + 1] = 0;
						pos[j + 2] = Math.sin(a2) * rz;
						var br = (0.45 + 0.55 * Math.sin(t * 4 + prm * 12.566 + i)) * (0.4 + 0.6 * glow);
						col[j] = _cb.r * br; col[j + 1] = _cb.g * br; col[j + 2] = _cb.b * br;
					}
					dpts.geometry.attributes.position.needsUpdate = true;
					dpts.geometry.attributes.color.needsUpdate = true;
					dpts.material.size = Math.max(0.006, rx * 0.03);
					dpts.material.opacity = clamp(0.4 + glow * 0.6, 0.05, 1);
				}
			}
		}
	});

	/* ============================================================
	 * 30 🔷 全息故障 (环绕线框方块 + 周期性故障跳变)
	 * ============================================================ */
	REG({
		id: 'glitch_grid', name: '🔷 全息故障',
		params: [
			{ id: 'cubes', type: 'range', label: '方块数量', min: 2, max: 10, step: 1, default: 6 },
			{ id: 'size', type: 'range', label: '方块大小', min: 0.2, max: 2, step: 0.1, default: 0.5 },
			{ id: 'radius', type: 'range', label: '环绕半径', min: 0.3, max: 3, step: 0.1, default: 1.2 },
			{ id: 'height', type: 'range', label: '分布高度', min: 0.2, max: 3, step: 0.1, default: 1.2 },
			{ id: 'speed', type: 'range', label: '环绕速度', min: 0, max: 4, step: 0.1, default: 0.9 },
			{ id: 'glitchRate', type: 'range', label: '故障频率', min: 0.2, max: 4, step: 0.1, default: 1.2 },
			{ id: 'opacity', type: 'range', label: '透明度', min: 0.05, max: 1, step: 0.05, default: 0.7 },
			{ id: 'colorA', type: 'color', label: '线框色', default: '#00ffc8' },
			{ id: 'colorB', type: 'color', label: '故障色', default: '#ff3d6e' }
		],
		init: function (object, config) {
			var g = new THREE.Group();
			var m = metrics(object);
			var C = clamp(Math.round(num(config, 'cubes', 6)), 2, 10);
			var R = m.radius * num(config, 'radius', 1.2);
			var boxGeo = new THREE.BoxGeometry(1, 1, 1);
			for (var i = 0; i < C; i++) {
				var cube = new THREE.Mesh(boxGeo, wireMat(config.colorA, 0.5));
				cube.frustumCulled = false;
				cube.userData = {
					role: 'cube',
					rf: 0.6 + Math.random() * 0.4,
					hf: Math.random() - 0.5,
					sp: 0.6 + Math.random() * 0.8,
					ph: Math.random() * 6.283,
					jx: (Math.random() - 0.5) * 2, jy: (Math.random() - 0.5) * 2, jz: (Math.random() - 0.5) * 2,
					sr: R
				};
				g.add(cube);
			}
			return g;
		},
		update: function (group, object, delta, time, config) {
			if (!visOk(group)) return;
			var m = refreshMetrics(group, object);
			var R = m.radius * num(config, 'radius', 1.2);
			var H = m.height * num(config, 'height', 1.2);
			var spd = num(config, 'speed', 0.9), gr = num(config, 'glitchRate', 1.2);
			var op = num(config, 'opacity', 0.7), t = time, d = cd(delta);
			_ca.set(colOf(config.colorA, '#00ffc8'));
			_cb.set(colOf(config.colorB, '#ff3d6e'));
			var sz = num(config, 'size', 0.5) * R * 0.3;
			for (var i = 0; i < group.children.length; i++) {
				var cube = group.children[i], u = cube.userData;
				if (!u || u.role !== 'cube') continue;
				var gk = 0, glitching = false;
				var gP = wrap01(t * gr * 0.25 + u.ph);
				if (gP < 0.15) { glitching = true; gk = 1 - gP / 0.15; }
				var ang = t * spd * u.sp + u.ph;
				var r = u.rf * R;
				cube.position.set(
					Math.cos(ang) * r + (glitching ? u.jx * gk * R * 0.25 : 0),
					m.center.y + u.hf * H + Math.sin(t + u.ph) * 0.05 * H + (glitching ? u.jy * gk * R * 0.2 : 0),
					Math.sin(ang) * r + (glitching ? u.jz * gk * R * 0.25 : 0)
				);
				cube.rotation.x += d * spd * u.sp;
				cube.rotation.y += d * spd * u.sp * 1.4;
				var s = sz * (1 + gk * 0.3);
				cube.scale.setScalar(Math.max(s, 0.01));
				cube.material.color.copy(glitching ? _cb : _ca);
				cube.material.opacity = clamp(op * (0.4 + 0.25 * Math.sin(t * 2 + u.ph)) * (1 + gk * 0.8), 0.03, 1);
			}
		}
	});

	/* ============================================================
	 * 加载完成校验 (已选中模型时立即刷新动画下拉列表)
	 * ============================================================ */
	try {
		if (hostApp.selectedObj && typeof hostApp.refreshAnimTypeSelect === 'function') {
			hostApp.refreshAnimTypeSelect();
		}
	} catch (e) { /* 忽略 */ }

	/* 暴露性能状态供调试: 控制台查看 app.__fxPerf.quality */
	try {
		Object.defineProperty(hostApp, '__fxPerf', {
			value: { get quality() { return _q; } },
			writable: false, configurable: true
		});
	} catch (e) { /* 忽略 */ }

	console.log('%c[FutureFX v5.0] ✅ 30个未来科技动画特效加载完成 — AQE自适应画质引擎已启动',
		'color:#00ffc8;font-weight:bold;text-shadow:0 0 8px #00ffc8;');
	console.log('%c  经典系: 漩涡/星轨/能量网格/彩虹环/烟花/烈焰/飘雪/泡沫/流星/光晕/漩涡/爱心/花瓣/闪电/银河/水波/流光',
		'color:#7fa8ff;');
	console.log('%c  科技系: 全息投影/能量护盾/激光矩阵/赛博隧道/量子涨落/DNA螺旋/雷达/传送门/卫星/曲速星驰/特斯拉/磁场/全息故障',
		'color:#ff7cf0;');

})(window.app || (typeof app !== 'undefined' ? app : undefined));
