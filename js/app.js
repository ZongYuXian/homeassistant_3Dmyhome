const app = {
    floorShapes: [[]],
    floorHeights: [],
    currentFloor: 0,
    currentPoints: [],
    mode: 'idle',
    isPlayMode: false,
    playModeFloor: 0,
    playModeShowAll: false,
    dragTarget: null,
    rectStart: null,
    hoverEdge: null,
    labels: [],
    lastActivityTime: Date.now(),
    isIdleMode: false,
    fireworks: [],
    tempObjectData: null,
    clock: new THREE.Clock(),
    currentControlObj: null,
    glbMissingCount: 0,
    _pendingAnimObjects: [],
    _pendingGLBRestores: [],
    _glbRetryCount: 0,
    _fbxLoaderPromise: null,
    currentTheme: 'deep_space',
    skySphere: null,
    skySphereVisible: true,
    skyTexture: null,
    _skyIsHDR: false,
    _pmrem: null,
    _envRT: null,
    _themeTween: null,
    _skyAutoLoadStarted: false,
    _skyLoadDoneFlag: false,
    customSkyGradient: null,
    _jsPluginAutoLoadStarted: false,
    sysMenuReady: false,
    _sysActiveTab: 'music',
    transOptions: { lockHorizontal: true, lockUpright: true },
    _dragStartY: null,
    _prevLockHorizontal: undefined,
    _glbAutoLoadStarted: false,
    haConfig: { url: '', token: '' },
    haPollInterval: null,
    scene: null, camera: null, renderer: null, orbit: null, transCtrl: null,
    hemiLight: null, dirLight: null, gridHelper: null,
    structureGroup: new THREE.Group(),
    furnitureGroup: new THREE.Group(),
    fireworksGroup: new THREE.Group(),
    floorTextures: {},
    floorTextureScale: 1.0,
    // ★ 优化1：每个房间独立地板贴图/颜色
    roomTextures: {},
    roomColors: {},
    selectedRoom: null,
    _roomPanelEl: null,
    _roomTextureScale: {},
    materialTextures: new Map(),
    loadedPluginScripts: {},
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    selectedObj: null,
    selectedMaterialTarget: null,
    tempV: new THREE.Vector3(),
    plugins: {},
    sensorEntities: {}, sensorData: {}, sensorCards: [],
    sensorUpdateTimer: null, sensorCardOffsets: {}, _sensorOffsetSaveTimer: null,
    _flModelList: [], _flSelectedId: null, _flPanelInited: false,
    panX: 0, panY: 0,
    viewScale: 1.0,
    _panStartClientX: 0, _panStartClientY: 0,
    _panStartPanX: 0, _panStartPanY: 0,
    _fsResizeTimer: null,
    _wallMergeCache: {},
    _planImportBusy: false,
    // ★★★ 布局修复专用状态 ★★★
    _viewportObserver: null,
    _layoutResizeRaf: null,
    _mobileUIInited: false,

    /* ============================================================
     *  ★ 传感器类型表
     * ============================================================ */
    SENSOR_TYPES: {
        temperature: { name: '温度', icon: '🌡️', unit: '°C', color: '#ff9f68' },
        temperature_delta: { name: '温差', icon: '🌡️', unit: '°C', color: '#ffb08a' },
        dewpoint: { name: '露点', icon: '💧', unit: '°C', color: '#8ad4f0' },
        humidity: { name: '湿度', icon: '💧', unit: '%', color: '#6bc5f7' },
        absolute_humidity: { name: '绝对湿度', icon: '💧', unit: 'g/m³', color: '#6bc5f7' },
        moisture: { name: '水分/土壤湿度', icon: '🫗', unit: '%', color: '#4cc9a0' },
        pressure: { name: '气压', icon: '📊', unit: 'hPa', color: '#b8c4d0' },
        atmospheric_pressure: { name: '大气压', icon: '🌍', unit: 'hPa', color: '#b8c4d0' },
        illuminance: { name: '照度', icon: '☀️', unit: 'lx', color: '#ffe28a' },
        irradiance: { name: '辐照度', icon: '☀️', unit: 'W/m²', color: '#ffd166' },
        sound_pressure: { name: '声压/噪音', icon: '🔊', unit: 'dB', color: '#c8a8ff' },
        air_quality: { name: '空气质量', icon: '🌬️', unit: 'AQI', color: '#a8e6cf' },
        aqi: { name: '空气质量指数', icon: '🌬️', unit: '', color: '#a8e6cf' },
        co2: { name: 'CO₂ 二氧化碳', icon: '🫧', unit: 'ppm', color: '#ffb3b3' },
        carbon_dioxide: { name: 'CO₂ 二氧化碳', icon: '🫧', unit: 'ppm', color: '#ffb3b3' },
        carbon_monoxide: { name: 'CO 一氧化碳', icon: '🚬', unit: 'ppm', color: '#ff8f8f' },
        pm25: { name: 'PM2.5', icon: '🧪', unit: 'μg/m³', color: '#ffd93d' },
        pm10: { name: 'PM10', icon: '🧪', unit: 'μg/m³', color: '#ffc93d' },
        pm1: { name: 'PM1.0', icon: '🧪', unit: 'μg/m³', color: '#ffe066' },
        pm4: { name: 'PM4.0', icon: '🧪', unit: 'μg/m³', color: '#ffbe3d' },
        voc: { name: 'VOC 挥发物', icon: '🧴', unit: 'μg/m³', color: '#d4a5ff' },
        volatile_organic_compounds: { name: 'VOC 挥发物', icon: '🧴', unit: 'μg/m³', color: '#d4a5ff' },
        volatile_organic_compounds_parts: { name: 'VOC 比率', icon: '🧴', unit: 'ppm', color: '#d4a5ff' },
        formaldehyde: { name: '甲醛', icon: '🧴', unit: 'mg/m³', color: '#ff6b9d' },
        nitrogen_dioxide: { name: 'NO₂ 二氧化氮', icon: '🧪', unit: 'µg/m³', color: '#ffa07a' },
        nitrogen_monoxide: { name: 'NO 一氧化氮', icon: '🧪', unit: 'µg/m³', color: '#ffa07a' },
        nitrous_oxide: { name: 'N₂O 氧化亚氮', icon: '🧪', unit: 'µg/m³', color: '#ffa07a' },
        ozone: { name: 'O₃ 臭氧', icon: '🧪', unit: 'µg/m³', color: '#a0d8ef' },
        sulphur_dioxide: { name: 'SO₂ 二氧化硫', icon: '🧪', unit: 'µg/m³', color: '#f4a460' },
        radon: { name: '氡', icon: '☢️', unit: 'Bq/m³', color: '#b0e57c' },
        gas: { name: '燃气/气体量', icon: '🔥', unit: 'm³', color: '#ff7f50' },
        voltage: { name: '电压', icon: '⚡', unit: 'V', color: '#f9d423' },
        current: { name: '电流', icon: '⚡', unit: 'A', color: '#f9d423' },
        power: { name: '功率', icon: '⚡', unit: 'W', color: '#f5a623' },
        apparent_power: { name: '视在功率', icon: '⚡', unit: 'VA', color: '#f5a623' },
        reactive_power: { name: '无功功率', icon: '⚡', unit: 'var', color: '#f5a623' },
        power_factor: { name: '功率因数', icon: '⚡', unit: '', color: '#f5a623' },
        energy: { name: '能量/电表', icon: '🔋', unit: 'kWh', color: '#7ed321' },
        reactive_energy: { name: '无功能量', icon: '🔋', unit: 'kvarh', color: '#7ed321' },
        energy_storage: { name: '储能', icon: '🔋', unit: 'kWh', color: '#7ed321' },
        battery: { name: '电池电量', icon: '🔋', unit: '%', color: '#2ecc71' },
        frequency: { name: '频率', icon: '⚡', unit: 'Hz', color: '#f9d423' },
        water: { name: '水量/水表', icon: '💧', unit: 'L', color: '#4fc3f7' },
        volume: { name: '体积', icon: '📦', unit: 'L', color: '#81c784' },
        volume_flow_rate: { name: '流量', icon: '🌊', unit: 'L/min', color: '#4dd0e1' },
        volume_storage: { name: '储存容量', icon: '📦', unit: 'L', color: '#81c784' },
        distance: { name: '距离', icon: '📏', unit: 'm', color: '#90a4ae' },
        area: { name: '面积', icon: '📐', unit: 'm²', color: '#b0bec5' },
        speed: { name: '速度', icon: '🏃', unit: 'km/h', color: '#ce93d8' },
        weight: { name: '重量', icon: '⚖️', unit: 'kg', color: '#ffab91' },
        conductivity: { name: '电导率', icon: '🧂', unit: 'µS/cm', color: '#80deea' },
        ph: { name: 'pH 酸碱度', icon: '🧪', unit: 'pH', color: '#9ccc65' },
        signal_strength: { name: '信号强度', icon: '📶', unit: 'dBm', color: '#9fa8da' },
        uptime: { name: '运行时间', icon: '⏱️', unit: '', color: '#b39ddb' },
        duration: { name: '时长', icon: '⏱️', unit: 's', color: '#b39ddb' },
        timestamp: { name: '时间戳', icon: '🕒', unit: '', color: '#c5b3e6' },
        date: { name: '日期', icon: '📅', unit: '', color: '#c5b3e6' },
        data_size: { name: '数据量', icon: '💾', unit: 'GB', color: '#80cbc4' },
        data_rate: { name: '数据速率', icon: '💾', unit: 'Mbit/s', color: '#80cbc4' },
        monetary: { name: '货币', icon: '💰', unit: '', color: '#ffd54f' },
        wind_speed: { name: '风速', icon: '💨', unit: 'km/h', color: '#b3e5fc' },
        wind_direction: { name: '风向', icon: '🧭', unit: '°', color: '#b3e5fc' },
        precipitation: { name: '降水量', icon: '🌧️', unit: 'mm', color: '#90caf9' },
        precipitation_intensity: { name: '降水强度', icon: '🌧️', unit: 'mm/h', color: '#90caf9' },
        blood_glucose_concentration: { name: '血糖', icon: '🩸', unit: 'mmol/L', color: '#ef9a9a' },
        enum: { name: '枚举状态', icon: '🔘', unit: '', color: '#e0e0e0' },
        other: { name: '其他', icon: '📟', unit: '', color: '#e0e0e0' }
    },

    SENSOR_TYPE_GROUPS: [{
        label: '🌡️ 环境温湿光声',
        keys: ['temperature', 'temperature_delta', 'dewpoint', 'humidity', 'absolute_humidity', 'moisture', 'pressure', 'atmospheric_pressure', 'illuminance', 'irradiance', 'sound_pressure']
    }, {
        label: '🌬️ 空气质量',
        keys: ['aqi', 'co2', 'carbon_monoxide', 'pm25', 'pm10', 'pm1', 'pm4', 'voc', 'volatile_organic_compounds_parts', 'formaldehyde', 'nitrogen_dioxide', 'nitrogen_monoxide', 'nitrous_oxide', 'ozone', 'sulphur_dioxide', 'radon', 'gas']
    }, {
        label: '⚡ 电气能源',
        keys: ['voltage', 'current', 'power', 'apparent_power', 'reactive_power', 'power_factor', 'energy', 'reactive_energy', 'energy_storage', 'battery', 'frequency']
    }, {
        label: '📏 物理量',
        keys: ['water', 'volume', 'volume_flow_rate', 'volume_storage', 'distance', 'area', 'speed', 'weight', 'conductivity', 'ph']
    }, {
        label: '📊 信息其他',
        keys: ['signal_strength', 'uptime', 'duration', 'timestamp', 'date', 'data_size', 'data_rate', 'monetary', 'wind_speed', 'wind_direction', 'precipitation', 'precipitation_intensity', 'blood_glucose_concentration', 'enum', 'other']
    }],

    /* ============================================================
     *  ★ 背景主题
     * ============================================================ */
    BG_THEMES: {
        deep_space: { name: '深空黑', icon: '🌌', bg: '#0a0a0f', skyTop: '#050810', skyMid: '#0c1022', skyBottom: '#161b2e', wall: '#e0e0e0', hemiSky: '#ffffff', hemiGround: '#444444', dir: '#ffffff', fog: null },
        star_night: { name: '星空夜', icon: '🌙', bg: '#050a18', skyTop: '#02040c', skyMid: '#0a1330', skyBottom: '#1e2c55', wall: '#d9dfef', hemiSky: '#c8d6ff', hemiGround: '#1c2440', dir: '#c4d6ff', fog: 0.0022 },
        sunset: { name: '日落橙', icon: '🌇', bg: '#1d1012', skyTop: '#241030', skyMid: '#8a3040', skyBottom: '#ef7a3e', wall: '#f2dfc9', hemiSky: '#ffd2a8', hemiGround: '#5a3030', dir: '#ffb888', fog: 0.0018 },
        dawn: { name: '晨曦粉', icon: '🌅', bg: '#181018', skyTop: '#3c2650', skyMid: '#b4688e', skyBottom: '#f5c6aa', wall: '#f6e7ec', hemiSky: '#ffdee6', hemiGround: '#4c3852', dir: '#ffd4c4', fog: 0.0016 },
        ocean: { name: '海洋蓝', icon: '🌊', bg: '#071724', skyTop: '#041220', skyMid: '#0f3f64', skyBottom: '#2f9ccb', wall: '#dcebf3', hemiSky: '#c4ecff', hemiGround: '#133850', dir: '#c2e8ff', fog: 0.0016 },
        forest: { name: '翡翠林', icon: '🌲', bg: '#0a1710', skyTop: '#06130c', skyMid: '#154731', skyBottom: '#54aa72', wall: '#e3f0e4', hemiSky: '#ccf2da', hemiGround: '#1c402a', dir: '#cceed6', fog: 0.0018 },
        aurora: { name: '极光青', icon: '❄️', bg: '#081521', skyTop: '#021120', skyMid: '#0d5060', skyBottom: '#3ce8d2', wall: '#ddf3ef', hemiSky: '#c4fff4', hemiGround: '#104050', dir: '#c6f8ee', fog: 0.0015 },
        violet: { name: '紫罗兰', icon: '💜', bg: '#130b20', skyTop: '#0d0718', skyMid: '#3d1c70', skyBottom: '#a558ec', wall: '#e9def6', hemiSky: '#e0ccff', hemiGround: '#2c1c4e', dir: '#dcc8ff', fog: 0.0018 },
        warm_sun: { name: '暖阳金', icon: '☀️', bg: '#1b150b', skyTop: '#161009', skyMid: '#6e4c1a', skyBottom: '#f0ba62', wall: '#f6edda', hemiSky: '#fff2cc', hemiGround: '#4e3e22', dir: '#ffe6ae', fog: 0.0017 }
    },

    /* ============================================================
     *  ★ 工具函数
     * ============================================================ */
    _waitPlus: function (timeout) {
        return new Promise((resolve) => {
            if (window.plus && window.plus.io) { resolve(true); return; }
            let done = false;
            const finish = (v) => { if (!done) { done = true; resolve(v); } };
            const timer = setTimeout(() => finish(false), timeout || 6000);
            document.addEventListener('plusready', () => { clearTimeout(timer); finish(!!(window.plus && window.plus.io)); }, false);
        });
    },

    _localFetch: function (url, asText) {
        return new Promise((resolve, reject) => {
            let settled = false;
            const ok = (data) => { if (!settled) { settled = true; resolve(data); } };
            const fail = (e) => { if (!settled) { settled = true; reject(e); } };

            const viaXHR = () => {
                try {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', url, true);
                    if (!asText) { try { xhr.responseType = 'arraybuffer'; } catch (e) {} }
                    xhr.timeout = 60000;
                    xhr.onload = () => {
                        if (xhr.status === 200 || xhr.status === 0) {
                            if (asText) {
                                if (xhr.responseText && xhr.responseText.length > 0) ok(xhr.responseText);
                                else fail(new Error('空内容'));
                            } else {
                                if (xhr.response && xhr.response.byteLength > 0) ok(xhr.response);
                                else fail(new Error('空内容'));
                            }
                        } else fail(new Error('HTTP ' + xhr.status));
                    };
                    xhr.onerror = () => fail(new Error('加载失败: ' + url));
                    xhr.ontimeout = () => fail(new Error('超时: ' + url));
                    xhr.send();
                } catch (e) { fail(e); }
            };

            if (window.fetch) {
                fetch(url, { cache: 'no-store' }).then(res => {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    return asText ? res.text() : res.arrayBuffer();
                }).then(data => {
                    const valid = asText ? (data && data.length > 0) : (data && data.byteLength > 0);
                    if (valid) ok(data); else fail(new Error('空内容'));
                }).catch(() => viaXHR());
            } else viaXHR();
        });
    },

    arrayBufferToBase64: function (buffer) {
        try {
            const bytes = new Uint8Array(buffer);
            let binary = '';
            const chunkSize = 0x8000;
            for (let i = 0; i < bytes.length; i += chunkSize) {
                binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + chunkSize, bytes.length)));
            }
            return btoa(binary);
        } catch (e) { console.error('base64转换失败:', e); return ''; }
    },

	/* ============================================================
	 * ★ 全局灯光配置（集中管理，一处修改全场景生效）
	 *   - 灯具点光源为主光源（lampPower 大幅高于环境光）
	 *   - 天空/HDR 只作为环境补光，不抢主光源
	 *   - 灯开关时自动缩放全局光，让开/关效果清晰可辨
	 * ============================================================ */
	lightConfig: {
		// —— 环境光（半球光）——
		hemiSkyColor:     0xffffff,   // 半球光天空色
		hemiGroundColor:  0x444444,   // 半球光地面色
		hemiBase:         0.05,       // 半球光基础强度（低 → 突出灯具）

		// —— 平行光（太阳光）——
		dirColor:         0xffffff,
		dirBase:          0.10,       // 平行光基础强度（低 → 突出灯具）

		// —— 灯具点光源（主光源）——
		lampPower:        3.8,        // 单盏灯 100% 亮度时的强度
		lampDistance:     14,         // 影响半径 (m)
		lampDecay:        1.8,        // 衰减（2 为物理正确，1.8 略柔和）
		lampCastShadow:   false,      // 灯具是否投影（性能考虑默认关）
		lampEmissiveGain: 2.4,        // 灯罩自发光强度增益

		// —— 天空 / HDR 对环境光的贡献 ——
		skyEnvInfluence:  0.35,       // 0~1，天空环境贴图贡献系数

		// —— 自动调光（关键：让开关灯效果明显）——
		enableAutoDim:        true,   // 是否自动根据灯开关缩放全局光
		offSceneGlobalScale:  0.45,   // 本层灯全关时，全局光保留比例
		onLampAmplify:        1.20,   // 单灯打开时视觉差异放大系数
	},

	/* ============================================================
	 * ★ 根据当前场景状态重新计算全局光照
	 *   - 统计当前层灯具"开/关"比例
	 *   - 动态缩放半球光 / 平行光
	 *   - 统一缩放宽高材质的 envMapIntensity（HDR 补光）
	 *   - 调用位置：init3D / updateLights / 灯开关 / 主题切换 / HDR 加载
	 * ============================================================ */
	_recalculateGlobalLighting: function (floorIdx) {
		if (!this.hemiLight || !this.dirLight) return;

		const cfg = this.lightConfig;
		const idx = (typeof floorIdx === 'number' && isFinite(floorIdx))
					? floorIdx : this.currentFloor;

		// ── 1. 统计当前层灯具开关状态 ──
		let lampCount = 0, lampOnCount = 0;
		this.furnitureGroup.children.forEach(obj => {
			const d = obj && obj.userData;
			if (!d || d.type !== 'light') return;
			const fi = (typeof d.floorIndex === 'number') ? d.floorIndex : 0;
			if (fi !== idx) return;
			lampCount++;
			if (d.state && d.state.on) lampOnCount++;
		});

		// ── 2. 自动调光系数 ──
		//    灯全关 → offSceneGlobalScale
		//    灯全开 → 1.0
		let globalScale = 1.0;
		if (cfg.enableAutoDim && lampCount > 0) {
			const ratio = lampOnCount / lampCount;
			globalScale = cfg.offSceneGlobalScale +
						  (1.0 - cfg.offSceneGlobalScale) * ratio;
		}

		// ── 3. 读取用户 UI 滑杆，作为基础强度修正 ──
		const sunEl = document.getElementById('sunIntensity');
		const ambEl = document.getElementById('ambientIntensity');
		const sunUI = (sunEl && isFinite(parseFloat(sunEl.value)))
						? parseFloat(sunEl.value) / 100 : 1.0;
		const ambUI = (ambEl && isFinite(parseFloat(ambEl.value)))
						? parseFloat(ambEl.value) / 100 : 0.6;

		// ── 4. 应用系数 ──
		const hemiI = cfg.hemiBase * (ambUI / 0.6) * globalScale;
		const dirI  = cfg.dirBase  * sunUI * globalScale;

		this.hemiLight.intensity = Math.max(0.02, hemiI);
		this.dirLight.intensity  = Math.max(0.02, dirI);

		// ── 5. 统一缩放 HDR 环境贴图对材质的补光强度 ──
		try {
			this._applyEnvMapIntensity(cfg.skyEnvInfluence * globalScale);
		} catch (e) {}

		// ── 6. 让灯具点光源强度跟随主控开关同步 ──
		try {
			const amp = cfg.onLampAmplify || 1.0;
			this.furnitureGroup.children.forEach(obj => {
				const d = obj && obj.userData;
				if (!d || d.type !== 'light') return;
				const refs = d.refs || {};
				if (!refs.light) return;
				const on = !!(d.state && d.state.on);
				const dim = (d.state && isFinite(d.state.dimmer)) ? d.state.dimmer : 100;
				const base = (dim / 100) * cfg.lampPower;
				refs.light.intensity = on ? base * amp : 0;
				refs.light.distance  = cfg.lampDistance;
				refs.light.decay     = cfg.lampDecay;
				refs.light.visible   = on;
			});
		} catch (e) {}
	},

	/* ============================================================
	 * ★ 统一调整所有材质的 envMapIntensity（HDR 环境补光强度）
	 *   - three.js 不提供全局 environment 强度接口，需要逐材质设置
	 * ============================================================ */
	_applyEnvMapIntensity: function (scale) {
		if (!isFinite(scale)) return;
		scale = Math.max(0, Math.min(2, scale));

		const apply = (m) => {
			if (!m) return;
			if (Array.isArray(m)) { m.forEach(apply); return; }
			if (typeof m.envMapIntensity === 'number') {
				m.envMapIntensity = scale;
				m.needsUpdate = true;
			}
		};
		try {
			if (this.structureGroup) this.structureGroup.traverse(o => { if (o.isMesh) apply(o.material); });
			if (this.furnitureGroup) this.furnitureGroup.traverse(o => { if (o.isMesh) apply(o.material); });
		} catch (e) {}
	},

    /* ============================================================
     *  ★★★ 全局样式注入（含视口/侧边栏遮挡修复） ★★★
     * ============================================================ */
	_injectGlobalStyles: function () {
		if (document.getElementById('appInjectedStyles')) return;
		const s = document.createElement('style');
		s.id = 'appInjectedStyles';
		s.textContent = `
	body.play-mode header{display:none !important;}
	@keyframes appDlgFadeIn{from{opacity:0;}to{opacity:1;}}
	@keyframes appDlgPopIn{from{opacity:0;transform:scale(0.88);}to{opacity:1;transform:scale(1);}}
	#appDialogOverlay{animation:appDlgFadeIn 0.2s ease;}
	#appDialogCard{animation:appDlgPopIn 0.22s ease;}
	@keyframes appDdPopIn{from{opacity:0;transform:scale(0.92);}to{opacity:1;transform:scale(1);}}
	#animDropdownModal{animation:appDlgFadeIn 0.18s ease;}
	#animDropdownModal .anim-dd-card{animation:appDdPopIn 0.2s ease;}
	.sidebar-resizer{position:absolute;top:0;height:100%;z-index:28;display:flex;align-items:center;justify-content:center;cursor:ew-resize;background:transparent;touch-action:none;}
	.sidebar-resizer-left{right:-16px;width:32px;}
	.sidebar-resizer-right{left:-16px;width:32px;}
	.sidebar-resizer .resizer-bar{position:absolute;top:50%;transform:translateY(-50%);width:4px;height:80%;border-radius:2px;background:rgba(255,255,255,0.14);transition:background 0.2s ease;pointer-events:none;}
	.sidebar-resizer-left .resizer-bar{left:14px;}
	.sidebar-resizer-right .resizer-bar{right:14px;}
	.sidebar-resizer:hover .resizer-bar,.sidebar-resizer.dragging .resizer-bar{background:var(--accent);box-shadow:0 0 10px var(--accent);}
	.sidebar-resizer .resizer-plus{position:absolute;top:50%;transform:translateY(-50%);width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#4361ee,#4cc9f0);color:#fff;font-size:1rem;font-weight:bold;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.5),0 0 14px rgba(76,201,240,0.45);transition:transform 0.15s ease,background 0.2s ease;user-select:none;line-height:1;border:2px solid rgba(255,255,255,0.35);}
	.sidebar-resizer:hover .resizer-plus{transform:translateY(-50%) scale(1.12);}
	.sidebar-resizer .resizer-plus:active{transform:translateY(-50%) scale(0.92);}
	.sidebar-resizer-left .resizer-plus{left:-16px;}
	.sidebar-resizer-right .resizer-plus{right:-16px;}
	body.sidebar-resizing{cursor:ew-resize !important;user-select:none !important;}
	body.sidebar-resizing *{cursor:ew-resize !important;}
	.glb-rename-btn{position:absolute;top:2px;left:4px;font-size:0.6rem;cursor:pointer;z-index:3;opacity:0.6;transition:opacity 0.15s ease;}
	.glb-rename-btn:hover{opacity:1;}
	.floor-plan-import{margin-top:6px;background:linear-gradient(135deg,#2ecc71,#27ae60) !important;color:#fff !important;border:none !important;font-weight:600;text-align:center;padding:9px 8px !important;border-radius:9px;cursor:pointer;font-size:0.78rem;display:block;width:100%;box-sizing:border-box;}
	.floor-plan-import:hover{filter:brightness(1.08);}
	.floor-plan-import:active{transform:scale(0.98);}
	#roomSettingPanel{position:absolute;z-index:30;background:rgba(30,30,40,0.96);border:1px solid rgba(76,201,240,0.5);border-radius:10px;padding:10px;box-shadow:0 10px 30px rgba(0,0,0,0.7);min-width:200px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:none;}
	#roomSettingPanel .rsp-title{font-size:0.75rem;color:var(--accent);font-weight:600;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;}
	#roomSettingPanel .rsp-close{cursor:pointer;color:#aaa;font-size:1rem;padding:0 4px;}
	#roomSettingPanel .rsp-close:hover{color:#fff;}
	#roomSettingPanel .rsp-row{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
	#roomSettingPanel .rsp-row label{font-size:0.65rem;color:#ccc;flex-shrink:0;width:56px;}
	#roomSettingPanel .rsp-row input[type="color"]{flex:1;height:26px;border:none;background:none;cursor:pointer;padding:0;}
	#roomSettingPanel .rsp-row input[type="range"]{flex:1;}
	#roomSettingPanel .rsp-btn{flex:1;padding:6px;font-size:0.68rem;border:none;border-radius:6px;cursor:pointer;font-weight:600;}
	#roomSettingPanel .rsp-btn.primary{background:linear-gradient(135deg,#4361ee,#4cc9f0);color:#fff;}
	#roomSettingPanel .rsp-btn.danger{background:#e63946;color:#fff;}
	#roomSettingPanel .rsp-btn.default{background:#3a3a44;color:#fff;}
	body.play-mode .viewport{position:absolute !important;top:0 !important;left:0 !important;width:100vw !important;height:100vh !important;height:calc(var(--vh, 1vh) * 100) !important;margin:0 !important;padding:0 !important;}
	body.play-mode #three-canvas{position:absolute !important;top:0 !important;left:0 !important;width:100% !important;height:100% !important;}
	body.play-mode #three-canvas canvas{display:block !important;width:100% !important;height:100% !important;position:absolute !important;top:0 !important;left:0 !important;}
	body.play-mode .app-container{padding:0 !important;margin:0 !important;}

	/* ================================================================
	   ★★★ 核心修复：视口尺寸 & 侧边栏遮挡 ============================
	   ================================================================ */
	html,body{
		width:100%;height:100%;margin:0;padding:0;
		overflow:hidden;
		background:#0a0a0f;
		-webkit-tap-highlight-color:transparent;
		overscroll-behavior:none;
	}
	body{position:relative;}

	.app-container{
		width:100%;height:100%;
		display:flex;flex-direction:row;
		overflow:hidden;position:relative;
		padding:0;margin:0;box-sizing:border-box;
		min-height:0;
	}

	.viewport{
		position:relative;
		flex:1 1 auto;
		min-width:0;min-height:0;
		height:100%;
		width:auto;
		overflow:hidden;
		background:#0a0a0f;
		z-index:1;
	}
	#three-canvas{
		position:absolute;top:0;left:0;
		width:100%;height:100%;
		z-index:0;
	}
	#three-canvas canvas{
		display:block !important;
		width:100% !important;
		height:100% !important;
		position:absolute !important;
		top:0 !important;left:0 !important;
		outline:none;
	}

	.sidebar{
		flex:0 0 auto;
		overflow-y:auto;
		overflow-x:hidden;
		-webkit-overflow-scrolling:touch;
		box-sizing:border-box;
	}
	.sidebar-overlay{
		position:fixed;top:0;left:0;width:100%;height:100%;
		background:rgba(0,0,0,0.55);
		z-index:130;
		display:none;
		opacity:0;
		transition:opacity .25s ease;
	}
	.sidebar-overlay.active{display:block;opacity:1;}

	/* ================================================================
	   ★★★ 桌面端 / 大屏编辑工具栏默认样式（保持原布局） ★★★
	   ================================================================ */
	#transformToolbar{
		position:absolute;
		top:10px;left:50%;
		transform:translateX(-50%);
		z-index:60;
		display:flex;
		gap:6px;
		padding:6px 8px;
		background:rgba(20,20,28,0.85);
		border:1px solid rgba(76,201,240,0.35);
		border-radius:12px;
		box-shadow:0 4px 18px rgba(0,0,0,0.5);
		backdrop-filter:blur(10px);
		-webkit-backdrop-filter:blur(10px);
		flex-wrap:wrap;
		justify-content:center;
		max-width:calc(100% - 20px);
		box-sizing:border-box;
	}
	#transformToolbar button{
		min-width:52px;
		height:36px;
		padding:0 10px;
		font-size:0.75rem;
		border-radius:8px;
		background:#2a2a35;
		color:#eee;
		border:1px solid rgba(255,255,255,0.08);
		font-weight:600;
		cursor:pointer;
		transition:background 0.18s ease, transform 0.12s ease;
	}
	#transformToolbar button:hover{background:#34343f;}
	#transformToolbar button:active{transform:scale(0.96);}
	#transformToolbar button.active{
		background:linear-gradient(135deg,#4361ee,#4cc9f0);
		color:#fff;
		border-color:transparent;
		box-shadow:0 0 12px rgba(76,201,240,0.5);
	}
	#transformToolbar button#lockHBtn.active,
	#transformToolbar button#lockUBtn.active{
		background:linear-gradient(135deg,#2ecc71,#27ae60);
		box-shadow:0 0 12px rgba(46,204,113,0.5);
	}
	#transformToolbar.no-selection button:not(#lockHBtn):not(#lockUBtn){
		opacity:0.55;
	}

	/* ================================================================
	   ★★★ 移动端：侧栏悬浮 + 视口铺满 + 工具栏常驻显示 ★★★
	   ================================================================ */
	@media screen and (max-width:768px){
		.app-container{
			display:block !important;
			position:relative !important;
			width:100% !important;
			height:100% !important;
		}
		.viewport{
			position:absolute !important;
			top:0 !important;left:0 !important;right:0 !important;bottom:0 !important;
			width:100% !important;
			height:100% !important;
			flex:none !important;
			min-width:0 !important;
			z-index:1 !important;
		}
		.sidebar{
			position:fixed !important;
			top:0 !important;bottom:0 !important;
			height:100% !important;max-height:100% !important;
			width:82vw !important;
			max-width:340px !important;
			min-width:0 !important;
			z-index:140 !important;
			background:#181820 !important;
			transition:transform .28s cubic-bezier(.2,.8,.3,1) !important;
			will-change:transform;
			box-shadow:0 0 44px rgba(0,0,0,0.8);
			overflow-y:auto;
			overflow-x:hidden;
			-webkit-overflow-scrolling:touch;
		}
		.sidebar-left{
			left:0 !important;right:auto !important;
			transform:translateX(-105%);
		}
		.sidebar-left.open{transform:translateX(0);}
		.sidebar-right{
			right:0 !important;left:auto !important;
			transform:translateX(105%);
		}
		.sidebar-right.open{transform:translateX(0);}
		.sidebar:not(.open){pointer-events:none !important;visibility:hidden;}
		.sidebar.open{pointer-events:auto !important;visibility:visible;}
		.sidebar-resizer{display:none !important;}
		.mobile-close-btn{display:block !important;}
		#mobileSettingsBtn{display:flex !important;}
		header h1{font-size:0.95rem !important;}
		.header-actions button{padding:5px 8px !important;font-size:0.7rem !important;}

		/* ★ 移动端编辑工具栏：常驻显示，紧贴顶部，加大触摸区域 */
		#transformToolbar{
			position:absolute !important;
			top:calc(env(safe-area-inset-top, 0px) + 10px) !important;
			left:50% !important;
			right:auto !important;
			bottom:auto !important;
			transform:translateX(-50%) !important;
			z-index:80 !important;
			display:flex !important;
			gap:6px !important;
			padding:7px 9px !important;
			background:rgba(18,18,26,0.9) !important;
			border:1px solid rgba(76,201,240,0.5) !important;
			border-radius:14px !important;
			box-shadow:0 6px 22px rgba(0,0,0,0.6), 0 0 16px rgba(76,201,240,0.22) !important;
			backdrop-filter:blur(12px);
			-webkit-backdrop-filter:blur(12px);
			flex-wrap:wrap;
			justify-content:center;
			max-width:calc(100vw - 16px) !important;
			box-sizing:border-box;
		}
		#transformToolbar button{
			min-width:56px !important;
			height:40px !important;
			padding:0 12px !important;
			font-size:0.78rem !important;
			border-radius:10px !important;
			font-weight:600;
			touch-action:manipulation;
			-webkit-user-select:none;
			user-select:none;
		}
		#transformToolbar button.active{
			box-shadow:0 0 14px rgba(76,201,240,0.65) !important;
		}
		/* 演示模式下自动隐藏（由 JS 控制） */
		body.play-mode #transformToolbar{display:none !important;}
	}

	@media screen and (min-width:769px){
		#mobileSettingsBtn{display:none !important;}
		.mobile-menu-btn{display:none !important;}
		.mobile-close-btn{display:none !important;}
	}
	`;
		document.head.appendChild(s);
	},

    /* ============================================================
     *  ★★★ 布局修复工具方法 ★★★
     * ============================================================ */
    fixViewportLayout: function () {
        try {
            const vp = document.getElementById('viewport');
            if (vp) {
                vp.style.overflow = 'hidden';
                vp.style.background = vp.style.background || '#0a0a0f';
                if (window.innerWidth <= 768) {
                    vp.style.position = 'absolute';
                    vp.style.top = '0';
                    vp.style.left = '0';
                    vp.style.right = '0';
                    vp.style.bottom = '0';
                    vp.style.width = '100%';
                    vp.style.height = '100%';
                }
            }
            const tc = document.getElementById('three-canvas');
            if (tc) {
                tc.style.position = 'absolute';
                tc.style.top = '0';
                tc.style.left = '0';
                tc.style.width = '100%';
                tc.style.height = '100%';
                tc.style.zIndex = '0';
            }
            if (this.renderer && this.renderer.domElement) {
                const cvs = this.renderer.domElement;
                cvs.style.display = 'block';
                cvs.style.width = '100%';
                cvs.style.height = '100%';
                cvs.style.position = 'absolute';
                cvs.style.top = '0';
                cvs.style.left = '0';
            }
        } catch (e) {}
    },

    setupViewportObserver: function () {
        try {
            if (this._viewportObserver) return;
            const vp = document.getElementById('viewport');
            if (!vp) return;
            if (typeof ResizeObserver !== 'undefined') {
                const self = this;
                this._viewportObserver = new ResizeObserver(function () {
                    if (self._layoutResizeRaf) cancelAnimationFrame(self._layoutResizeRaf);
                    self._layoutResizeRaf = requestAnimationFrame(function () {
                        self._layoutResizeRaf = null;
                        try { self.fixViewportLayout(); } catch (e) {}
                        try {
                            if (self.isPlayMode) self._updateFullscreenViewport();
                            else self.updateRendererSize();
                        } catch (e) {}
                    });
                });
                this._viewportObserver.observe(vp);
            }
        } catch (e) { console.warn('视口监听初始化失败:', e); }
    },

    applyResponsiveSidebarWidths: function () {
        try {
            const isMobile = window.innerWidth <= 768;
            const left = document.getElementById('sidebarLeft');
            const right = document.getElementById('sidebarRight');
            if (isMobile) {
                // 移动端侧栏宽度由 CSS 控制，清掉内联宽度避免溢出
                if (left) left.style.width = '';
                if (right) right.style.width = '';
            } else {
                const lw = parseInt(localStorage.getItem('sidebarLeftWidth') || '0', 10);
                const rw = parseInt(localStorage.getItem('sidebarRightWidth') || '0', 10);
                if (lw >= 180 && lw <= 600 && left) left.style.width = lw + 'px';
                if (rw >= 180 && rw <= 600 && right) right.style.width = rw + 'px';
            }
        } catch (e) {}
    },

    /* ============================================================
     *  ★ 通用对话框
     * ============================================================ */
    dialog: {
        _overlay: null,
        _ensure: function () {
            if (this._overlay && document.body.contains(this._overlay)) return this._overlay;
            const ov = document.createElement('div');
            ov.id = 'appDialogOverlay';
            ov.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:1500;display:none;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);';
            const card = document.createElement('div');
            card.id = 'appDialogCard';
            card.style.cssText = 'background:#25252b;border:1px solid rgba(255,255,255,0.12);border-radius:14px;width:100%;max-width:320px;padding:20px 18px;box-shadow:0 20px 60px rgba(0,0,0,0.7);text-align:center;';
            ov.appendChild(card);
            document.body.appendChild(ov);
            this._overlay = ov;
            return ov;
        },
        show: function (opts) {
            const ov = this._ensure();
            const card = ov.querySelector('#appDialogCard');
            const icon = opts.icon ? '<div style="font-size:1.9rem;line-height:1;margin-bottom:10px;">' + opts.icon + '</div>' : '';
            const msg = '<div style="font-size:0.85rem;color:#e0e0e0;line-height:1.7;white-space:pre-wrap;word-break:break-word;">' + String(opts.msg) + '</div>';
            const btns = opts.buttons || [{ text: '确定', cls: 'primary' }];
            let btnHtml = '';
            btns.forEach((b, i) => {
                const bg = b.cls === 'primary' ? 'var(--primary)' : (b.cls === 'danger' ? 'var(--danger)' : (b.cls === 'success' ? 'var(--success)' : '#3a3a44'));
                const color = (b.cls === 'success') ? '#000' : '#fff';
                btnHtml += '<button data-appdlg="' + i + '" style="flex:1;min-height:40px;font-size:0.85rem;background:' + bg + ';color:' + color + ';border-radius:9px;">' + b.text + '</button>';
            });
            card.innerHTML = icon + msg + '<div style="display:flex;gap:10px;margin-top:18px;">' + btnHtml + '</div>';
            ov.style.display = 'flex';
            card.querySelectorAll('button[data-appdlg]').forEach(btn => {
                btn.onclick = () => {
                    const b = btns[parseInt(btn.getAttribute('data-appdlg'))];
                    this.hide();
                    if (b && typeof b.onClick === 'function') setTimeout(() => { b.onClick(); }, 80);
                };
            });
        },
        hide: function () { if (this._overlay) this._overlay.style.display = 'none'; },
        alert: function (msg, cb) { this.show({ icon: 'ℹ️', msg: msg, buttons: [{ text: '确定', cls: 'primary', onClick: cb }] }); },
        confirm: function (msg, onOk, onCancel) {
            this.show({ icon: '❓', msg: msg, buttons: [{ text: '取消', onClick: onCancel }, { text: '确定', cls: 'primary', onClick: onOk }] });
        }
    },

    /* ============================================================
     *  ★ 侧边栏 "＋" 按钮 + 拖拽调整宽度
     * ============================================================ */
    initSidebarResizer: function () {
        const left = document.getElementById('sidebarLeft');
        const right = document.getElementById('sidebarRight');

        const buildHandle = (panel, side) => {
            if (!panel) return;
            if (panel.dataset.resizerInited === '1') {
                const exist = panel.querySelector('.sidebar-resizer');
                if (!exist) panel.dataset.resizerInited = '0';
                else return;
            }
            panel.dataset.resizerInited = '1';
            panel.style.position = panel.style.position || 'relative';

            const r = document.createElement('div');
            r.id = side === 'left' ? 'leftResizer' : 'rightResizer';
            r.className = 'sidebar-resizer sidebar-resizer-' + side;

            const bar = document.createElement('div');
            bar.className = 'resizer-bar';
            r.appendChild(bar);

            const plus = document.createElement('div');
            plus.className = 'resizer-plus';
            plus.textContent = side === 'left' ? '◀' : '▶';
            plus.title = side === 'left' ? '点击循环切换左栏宽度 / 拖动可精确调整' : '点击循环切换右栏宽度 / 拖动可精确调整';
            r.appendChild(plus);

            panel.appendChild(r);
            this._bindResizer(r, panel, side, plus);
        };

        buildHandle(left, 'left');
        buildHandle(right, 'right');
        this.applyResponsiveSidebarWidths();
    },

    _bindResizer: function (handle, panel, side, plusEl) {
        const self = this;
        let dragging = false;
        let startX = 0, startW = 0;
        let moved = 0;
        const MIN = 180, MAX = 600;

        const applyWidth = (w, silent) => {
            w = Math.max(MIN, Math.min(MAX, w));
            panel.style.width = w + 'px';
            if (self.renderer) { try { self.updateRendererSize(); } catch (err) {} }
            if (!silent) {
                const key = side === 'left' ? 'sidebarLeftWidth' : 'sidebarRightWidth';
                try { localStorage.setItem(key, String(w)); } catch (e) {}
            }
            return w;
        };

        const onDown = (e) => {
            const t = e.touches ? e.touches[0] : e;
            if (plusEl && (e.target === plusEl || plusEl.contains(e.target))) {
                dragging = false;
                startX = t.clientX;
                startW = panel.offsetWidth;
                moved = 0;
                return;
            }
            dragging = true;
            moved = 0;
            startX = t.clientX;
            startW = panel.offsetWidth;
            handle.classList.add('dragging');
            document.body.classList.add('sidebar-resizing');
            if (e.cancelable) e.preventDefault();
            e.stopPropagation();
        };

        const onMove = (e) => {
            if (!dragging) {
                if (plusEl && e.touches && e.touches.length === 1) {
                    const t = e.touches[0];
                    const dx = Math.abs(t.clientX - startX);
                    if (dx > 6) {
                        dragging = true;
                        moved = dx;
                        handle.classList.add('dragging');
                        document.body.classList.add('sidebar-resizing');
                        onMove(e);
                    }
                }
                return;
            }
            const t = e.touches ? e.touches[0] : e;
            const dx = t.clientX - startX;
            moved = Math.max(moved, Math.abs(dx));
            let newW = side === 'left' ? startW + dx : startW - dx;
            applyWidth(newW, true);
            if (e.cancelable) e.preventDefault();
        };

        const onUp = () => {
            if (!dragging) return;
            dragging = false;
            handle.classList.remove('dragging');
            document.body.classList.remove('sidebar-resizing');
            const key = side === 'left' ? 'sidebarLeftWidth' : 'sidebarRightWidth';
            try { localStorage.setItem(key, String(panel.offsetWidth)); } catch (e) {}
            if (self.renderer) { try { self.updateRendererSize(); } catch (err) {} }
        };

        if (plusEl) {
            plusEl.addEventListener('click', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                const w = panel.offsetWidth;
                const presets = [200, 260, 340, 440, 560];
                let next = presets[0];
                for (let i = 0; i < presets.length; i++) {
                    if (w < presets[i] - 20) { next = presets[i]; break; }
                    next = presets[(i + 1) % presets.length];
                }
                applyWidth(next, false);
                const shown = panel.offsetWidth;
                self.saveSystem.showToast(`📐 ${side === 'left' ? '左' : '右'}侧栏宽度: ${shown}px`);
            });
        }

        handle.addEventListener('mousedown', onDown);
        handle.addEventListener('touchstart', onDown, { passive: false });
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchend', onUp);
    },

    /* ============================================================
     *  ★ GLB 模型库自动加载
     * ============================================================ */
    autoLoadGLBLibrary: async function (force) {
        if (this._glbAutoLoadStarted && !force) return;
        this._glbAutoLoadStarted = true;
        const hint = (t) => this.glbLibrary._hint(t);
        const hasPlus = await this._waitPlus(8000);
        try {
            hint('🔍 正在读取 img/models.json 清单...');
            const n1 = await this.glbLibrary.loadViaManifest();
            if (n1 > 0) { this._glbLoadSuccess(n1); return; }
        } catch (e) { console.warn('策略①清单加载失败:', e); }

        if (hasPlus) {
            try {
                hint('🔍 正在扫描 img 目录...');
                const n2 = await this.glbLibrary.scanPlusDirs();
                if (n2 > 0) { this._glbLoadSuccess(n2); return; }
            } catch (e) { console.warn('策略②目录扫描失败:', e); }

            setTimeout(async () => {
                if (this._glbLoadDone) return;
                let n = 0;
                try { n += await this.glbLibrary.loadViaManifest(); } catch (e) {}
                try { n += await this.glbLibrary.scanPlusDirs(); } catch (e) {}
                if (n > 0) { this._glbLoadSuccess(n); return; }
                if (this.glbLibrary.models.length === 0) {
                    hint('❌ 自动加载失败: 请确认img目录存在GLB/FBX文件\n或在img目录创建models.json清单');
                    this.saveSystem.showToast('⚠️ img目录未发现模型, 请检查目录或models.json');
                }
            }, 5000);
        } else {
            if (this.glbLibrary.models.length === 0) hint('🌐 浏览器环境: 请通过本地HTTP服务器访问(清单可用)或手动导入');
        }
    },

    _glbLoadSuccess: function (n) {
        this._glbLoadDone = true;
        const btn = document.getElementById('glbFolderBtn');
        if (btn && window.plus) btn.style.display = 'none';
        this.glbLibrary.renderUI();
        this.saveSystem.showToast(`📦 已自动加载 ${n} 个模型 (img目录)`);
        this._glbRetryCount = 0;
        setTimeout(() => { try { this._retryPendingGLBRestores(); } catch (e) {} }, 500);
    },

    /* ============================================================
     *  ★ JS 动画插件自动加载
     * ============================================================ */
    autoLoadJsPlugins: async function (force) {
        if (this._jsPluginAutoLoadStarted && !force) return;
        this._jsPluginAutoLoadStarted = true;
        const hasPlus = await this._waitPlus(5000);
        try {
            const n1 = await this._loadJsPluginsViaManifest();
            if (n1 > 0) { this._jsPluginLoadDone(n1); return; }
        } catch (e) { console.warn('JS插件清单加载失败:', e); }

        if (hasPlus) {
            try {
                const n2 = await this._scanJsPluginDirs();
                if (n2 > 0) { this._jsPluginLoadDone(n2); return; }
            } catch (e) { console.warn('JS插件目录扫描失败:', e); }

            setTimeout(async () => {
                let n = 0;
                try { n += await this._loadJsPluginsViaManifest(); } catch (e) {}
                try { n += await this._scanJsPluginDirs(); } catch (e) {}
                if (n > 0) { this._jsPluginLoadDone(n); return; }
                console.log('💡 js目录未发现动画插件 (可创建 js/plugins.json 清单: {"plugins":["myAnim.js"]})');
            }, 5000);
        } else {
            setTimeout(async () => {
                let n = 0;
                try { n += await this._loadJsPluginsViaManifest(); } catch (e) {}
                if (n > 0) { this._jsPluginLoadDone(n); return; }
                console.log('💡 浏览器环境: 可创建 js/plugins.json 清单自动加载动画插件');
            }, 3000);
        }
    },

    _jsPluginLoadDone: function (n) {
        this.saveSystem.showToast(`✨ 已自动加载 ${n} 个JS动画插件 (js目录)`);
        if (this.selectedObj) this.refreshAnimTypeSelect();
        try { this._reapplyAllAnimations(); } catch (e) {}
    },

    _loadJsPluginsViaManifest: async function () {
        const candidates = ['js/plugins.json', './js/plugins.json', '/js/plugins.json'];
        if (window.plus && window.plus.io && window.plus.io.convertLocalFileSystemURL) {
            ['_www/js/plugins.json', '_doc/js/plugins.json', '_downloads/js/plugins.json'].forEach(p => {
                try { const abs = window.plus.io.convertLocalFileSystemURL(p); if (abs) candidates.push(abs); } catch (e) {}
            });
        }
        let loaded = 0;
        for (const url of candidates) {
            let txt = '';
            try { txt = await this._localFetch(url, true); } catch (e) { continue; }
            if (!txt) continue;
            const t = txt.trim();
            if (t.length < 2 || (t[0] !== '{' && t[0] !== '[')) continue;
            let json;
            try { json = JSON.parse(t); } catch (e) { console.warn('plugins.json 解析失败:', url, e); continue; }
            const list = this._parseJsManifest(json);
            if (list.length === 0) continue;
            console.log(`发现 js/plugins.json (${url}): ${list.length} 个动画插件`);
            const base = url.substring(0, url.lastIndexOf('/') + 1);
            for (const item of list) {
                try {
                    const code = await this._localFetch(base + item.file, true);
                    if (code && code.length > 10 && this._execPluginCode(code, item.file)) loaded++;
                } catch (e) { console.warn('清单插件加载失败:', item.file, e); }
            }
            if (loaded > 0) break;
        }
        return loaded;
    },

    _parseJsManifest: function (json) {
        const list = [];
        const pushItem = (it) => {
            if (typeof it === 'string') {
                const f = it.trim();
                if (/\.js$/i.test(f)) list.push({ name: f.replace(/\.js$/i, ''), file: f });
            } else if (it && typeof it === 'object') {
                const f = it.file || it.fileName || it.filename || it.path || it.url;
                if (f && /\.js$/i.test(f)) list.push({
                    name: (it.name || it.title || String(f).replace(/.*\//, '').replace(/\.js$/i, '')), file: String(f)
                });
            }
        };
        if (Array.isArray(json)) json.forEach(pushItem);
        else if (json && typeof json === 'object') {
            const arr = json.plugins || json.list || json.files || json.items || json.data;
            if (Array.isArray(arr)) arr.forEach(pushItem);
            else {
                Object.keys(json).forEach(k => {
                    const v = json[k];
                    if (typeof v === 'string' && /\.js$/i.test(v)) pushItem({ name: k, file: v });
                    else if (typeof v === 'string' && /\.js$/i.test(k)) pushItem({ name: v, file: k });
                    else if (v && typeof v === 'object' && !Array.isArray(v)) {
                        const f = v.file || v.fileName || v.path;
                        if (f) pushItem({ name: v.name || k, file: f });
                    }
                });
            }
        }
        const seen = new Set();
        return list.filter(it => {
            const key = it.file.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return /\.js$/i.test(it.file) && !/^app\.js$/i.test(it.file);
        });
    },

    _scanJsPluginDirs: function () {
        return new Promise((resolve) => {
            if (!window.plus || !window.plus.io) { resolve(0); return; }
            const dirs = ['js/', 'js/plugins/', '_www/js/', '_www/js/plugins/', '_doc/js/', '_downloads/js/'];
            let loaded = 0, found = 0, finished = false;
            const finish = () => {
                if (finished) return;
                finished = true;
                if (found > 0) console.log(`js目录插件扫描: 发现${found}个.js, 成功加载${loaded}个`);
                resolve(loaded);
            };
            const loadAll = (all, done) => {
                const jsFiles = all.filter(e => e.isFile && /\.js$/i.test(e.name) && !/^app\.js$/i.test(e.name));
                found += jsFiles.length;
                if (jsFiles.length === 0) { done(); return; }
                let counter = 0;
                const oneDone = () => { counter++; if (counter >= jsFiles.length) done(); };
                const FR = window.plus.io.FileReader;
                jsFiles.forEach(fe => {
                    try {
                        if (this.loadedPluginScripts['file_' + fe.name]) { oneDone(); return; }
                        fe.file((file) => {
                            try {
                                const fr = new FR();
                                fr.onloadend = (evt) => {
                                    const code = evt.target.result || '';
                                    if (code && code.length > 10 && this._execPluginCode(code, fe.name)) loaded++;
                                    oneDone();
                                };
                                fr.onerror = () => oneDone();
                                fr.readAsText(file);
                            } catch (e) { oneDone(); }
                        }, () => oneDone());
                    } catch (e) { oneDone(); }
                });
            };
            const scanDir = (i) => {
                if (finished) return;
                if (i >= dirs.length) { finish(); return; }
                const goNext = () => { if (!finished) scanDir(i + 1); };
                try {
                    window.plus.io.resolveLocalFileSystemURL(dirs[i], (dirEntry) => {
                        if (finished) return;
                        try {
                            const reader = dirEntry.createReader();
                            const all = [];
                            const readBatch = () => {
                                if (finished) return;
                                reader.readEntries((entries) => {
                                    if (!entries || entries.length === 0) loadAll(all, goNext);
                                    else { all.push(...Array.prototype.slice.call(entries)); readBatch(); }
                                }, goNext);
                            };
                            readBatch();
                        } catch (e) { goNext(); }
                    }, goNext);
                } catch (e) { goNext(); }
            };
            try { scanDir(0); } catch (e) { finish(); }
            setTimeout(finish, 20000);
        });
    },

    _execPluginCode: function (code, fileName) {
        try {
            if (this.loadedPluginScripts['file_' + fileName]) return false;
            new Function('app', code)(app);
            this.loadedPluginScripts['file_' + fileName] = code;
            return true;
        } catch (e) { console.warn('动画插件执行失败:', fileName, e); return false; }
    },

    /* ============================================================
     *  ★ 文件输入修复
     * ============================================================ */
    _fixFileInputs: function () {
        const isPlus = !!(window.plus && window.plus.io);
        const ids = ['glbInput', 'glbFolderInput', 'texInput', 'matTextureInput', 'pluginLoader', 'floorPlanInput', 'roomTextureInput'];

        ids.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            if (el.hasAttribute('hidden')) el.removeAttribute('hidden');
            el.style.position = 'absolute';
            el.style.left = '-9999px';
            el.style.top = '0';
            el.style.width = '1px';
            el.style.height = '1px';
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';

            if (isPlus && (id === 'glbInput' || id === 'glbFolderInput')) el.setAttribute('accept', '*/*');
            else if (id === 'glbInput' || id === 'glbFolderInput') el.setAttribute('accept', '.glb,.gltf,.fbx');
        });

        const folder = document.getElementById('glbFolderInput');
        if (folder && isPlus) {
            folder.removeAttribute('webkitdirectory');
            folder.removeAttribute('directory');
            if (!folder.hasAttribute('multiple')) folder.setAttribute('multiple', '');
        }

        const glb = document.getElementById('glbInput');
        if (glb && !glb.dataset.jsBound) {
            glb.dataset.jsBound = '1';
            glb.addEventListener('change', (e) => { try { app.handleGLB(e.target); } catch (err) { console.error('模型导入异常:', err); } });
        }

        const fold = document.getElementById('glbFolderInput');
        if (fold && !fold.dataset.jsBound) {
            fold.dataset.jsBound = '1';
            fold.addEventListener('change', (e) => { try { app.loadGLBFolder(e.target); } catch (err) { console.error('模型批量导入异常:', err); } });
        }

        const roomTex = document.getElementById('roomTextureInput');
        if (roomTex && !roomTex.dataset.jsBound) {
            roomTex.dataset.jsBound = '1';
            roomTex.addEventListener('change', (e) => { try { app.handleRoomTexture(e.target); } catch (err) {} });
        }
    },

    _reapplyAllAnimations: function () {
        const pending = this._pendingAnimObjects || [];
        this._pendingAnimObjects = [];
        pending.forEach(obj => {
            if (!obj || !obj.parent) return;
            const cfg = obj.userData && obj.userData.animationConfig;
            if (cfg && cfg.enabled && this.plugins[cfg.type]) this.applyAnimationToObject(obj);
        });
        this.furnitureGroup.children.forEach(obj => {
            const cfg = obj.userData && obj.userData.animationConfig;
            if (cfg && cfg.enabled && this.plugins[cfg.type] && !obj.userData.animEffectGroup) this.applyAnimationToObject(obj);
        });
    },

    _retryPendingGLBRestores: async function () {
        if (!this._pendingGLBRestores || this._pendingGLBRestores.length === 0) return;
        const pending = this._pendingGLBRestores.slice();
        this._pendingGLBRestores = [];
        let restored = 0;
        for (const od of pending) {
            try {
                let rec = null;
                const libId = od.glbLibId || null;
                if (libId) rec = this.glbLibrary.models.find(m => m.id === libId);
                if (!rec) {
                    const key = ((od.glbName || od.name || '') + '').toLowerCase();
                    if (key) {
                        rec = this.glbLibrary.models.find(m => (m.fileName || '').toLowerCase() === key) ||
                            this.glbLibrary.models.find(m => (m.name || '').toLowerCase() === key.replace(/\.[^.]+$/, ''));
                    }
                }
                if (!rec && libId) {
                    rec = await this.saveSystem.getGLBFromStore(libId);
                    if (rec && rec.base64) { this.glbLibrary.models.push(rec); this.glbLibrary.renderUI(); }
                }
                if (rec && rec.base64) {
                    await this.createGLBFromBase64(rec.base64, od.name, od.type, od.features, {
                        glbLibId: rec.id, glbFileName: od.glbName || rec.fileName, silent: true, restoreData: od
                    });
                    restored++;
                } else this._pendingGLBRestores.push(od);
            } catch (e) {
                console.warn('GLB重试还原失败:', od.name, e);
                this._pendingGLBRestores.push(od);
            }
        }
        if (restored > 0) {
            this.generate3D();
            this.updateSceneVisibility();
            if (this.isPlayMode) this.createLabels();
            this.saveSystem.showToast(`✅ 已自动补齐还原 ${restored} 个模型`);
        }
        if (this._pendingGLBRestores.length > 0) {
            this._glbRetryCount++;
            if (this._glbRetryCount <= 8) {
                setTimeout(() => { try { this._retryPendingGLBRestores(); } catch (e) {} }, 4000);
            } else this.saveSystem.showToast(`⚠️ 仍有 ${this._pendingGLBRestores.length} 个模型待还原, 请在模型库点击"🔄 重扫"后自动补齐`);
        } else this._glbRetryCount = 0;
    },

    ensureFBXLoader: function () {
        if (typeof THREE !== 'undefined' && THREE.FBXLoader) return Promise.resolve(true);
        if (this._fbxLoaderPromise) return this._fbxLoaderPromise;
        this._fbxLoaderPromise = new Promise((resolve, reject) => {
            const loadScript = (src) => new Promise((res, rej) => {
                try {
                    const s = document.createElement('script');
                    s.src = src;
                    s.onload = () => res(true);
                    s.onerror = () => rej(new Error('脚本加载失败: ' + src));
                    document.head.appendChild(s);
                } catch (e) { rej(e); }
            });
            loadScript('https://cdn.jsdelivr.net/npm/fflate@0.6.10/umd/index.js')
                .then(() => loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/FBXLoader.js'))
                .then(() => {
                    if (typeof THREE !== 'undefined' && THREE.FBXLoader) resolve(true);
                    else reject(new Error('FBXLoader 初始化失败 (检查网络)'));
                })
                .catch((e) => { this._fbxLoaderPromise = null; reject(e); });
        });
        return this._fbxLoaderPromise;
    },

    /* ============================================================
     *  ★ 初始化（含布局修复）
     * ============================================================ */
	init: async function () {
		this._injectGlobalStyles();
		this.fixViewportLayout();
		this.initFloorHeights();
		this.hideLegacyPropPanels();
		this.hideDuplicateWallHeightControl();
		this.init2D();
		this.init3D();                       // 内部已调用 setupTransformToolbar → initTransformToolbarDrag
		this.createSkySphere();
		this.applyBackgroundTheme(this.currentTheme || 'deep_space', false);
		this.setupActivityListener();
		this.registerBuiltInPlugins();
		this.animate();
		this.updateUIStatus();
		this.updateFloorSelect();
		this.updateFloorInfo();
		this.setupFullscreenListener();
		this.setupMobileUI();
		this.initSidebarResizer();
		this.injectFloorPlanImportButton();
		this.ensureRoomSettingPanel();
		this.sensorEntities = {};
		this.sensorData = {};
		this.sensorCardOffsets = {};
		this._bindGlobalWallHeightInput();

		// ★ 布局修复：视口尺寸监听
		this.setupViewportObserver();
		this.applyResponsiveSidebarWidths();

		// ★ 编辑工具栏初始状态 + 长按拖拽
		this._updateTransformToolbarVisibility();
		this.initTransformToolbarDrag();

		try {
			await this.saveSystem.initDB();
			await this.glbLibrary.init();
			this._fixFileInputs();
			this._setupWalkerUI();
			this.autoLoadGLBLibrary();
			this.autoLoadSkyLibrary();
			this.autoLoadJsPlugins();
			this.initFloorModelManager();
			this.initGlobalEnvUI();

			const hasData = await this.saveSystem.hasSavedData();
			if (hasData) {
				setTimeout(() => {
					this.saveSystem.showToast("📂 正在自动恢复上次工程...");
					this.saveSystem.loadFromDB();
				}, 500);
			}
		} catch (e) { console.error("数据库初始化失败", e); }

		this.ensureAnimDropdownOverlay();

		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'hidden') { try { this.saveSystem.saveToDB(true); } catch (e) {} }
			else { setTimeout(() => { try { this.fixViewportLayout(); this.updateRendererSize(); } catch (e) {} }, 120); }
		});

		window.addEventListener('pagehide', () => { try { this.saveSystem.saveToDB(true); } catch (e) {} });
		window.addEventListener('beforeunload', () => { try { this.saveSystem.saveToDB(true); } catch (e) {} });

		setTimeout(() => {
			try {
				this._fixFileInputs();
				this._setupWalkerUI();
				this.initSidebarResizer();
				this.hideDuplicateWallHeightControl();
				this.injectFloorPlanImportButton();
				this.ensureRoomSettingPanel();
				this.setupMobileUI();
				this.applyResponsiveSidebarWidths();
				this.fixViewportLayout();
				this.updateRendererSize();
				this._updateTransformToolbarVisibility();
				// ★ 再次确保工具栏拖拽能力已就绪（DOM 可能被其他面板重建过）
				this.initTransformToolbarDrag();
			} catch (e) {}
		}, 1500);

		this.setVH();

		window.addEventListener('resize', () => {
			this.setVH();
			this.setupMobileUI();
			this.applyResponsiveSidebarWidths();
			this.fixViewportLayout();
			if (this.isPlayMode) this._updateFullscreenViewport();
			else this.updateRendererSize();
			try { this.updateRoomSettingPanelPosition(); } catch (e) {}
			this._updateTransformToolbarVisibility();
			// ★ 约束工具栏位置
			this._clampTransformToolbarPosition();
		});

		window.addEventListener('orientationchange', () => {
			setTimeout(() => {
				this.setVH();
				this.setupMobileUI();
				this.applyResponsiveSidebarWidths();
				this.fixViewportLayout();
				if (this.isPlayMode) this._updateFullscreenViewport();
				else this.updateRendererSize();
				try { this.updateRoomSettingPanelPosition(); } catch (e) {}
				this._updateTransformToolbarVisibility();
				this._clampTransformToolbarPosition();
			}, 300);
		});

		if (window.visualViewport) {
			window.visualViewport.addEventListener('resize', () => {
				this.setVH();
				this.fixViewportLayout();
				if (this.isPlayMode) this._updateFullscreenViewport();
				else this.updateRendererSize();
				this._clampTransformToolbarPosition();
			});
		}
	},

    hideDuplicateWallHeightControl: function () {
        try {
            const wh = document.getElementById('wallHeight');
            if (!wh) return;
            const item = wh.closest ? wh.closest('.control-item') : null;
            if (item && item.style.display !== 'none') {
                item.style.display = 'none';
                item.setAttribute('data-hidden-by-opt', '1');
            }
        } catch (e) {}
    },

    /* ============================================================
     *  ★ 户型图导入按钮
     * ============================================================ */
    injectFloorPlanImportButton: function () {
        if (document.getElementById('importFloorPlanBtn')) return;
        const drawingCanvas = document.getElementById('drawCanvas');
        if (!drawingCanvas) return;
        const drawingPanel = drawingCanvas.closest ? drawingCanvas.closest('.panel-group') : null;
        if (!drawingPanel) return;

        const wrap = document.createElement('div');
        wrap.id = 'importFloorPlanBtn';
        wrap.className = 'floor-plan-import';
        wrap.innerHTML = '🗺️ 导入我的平面户型图';

        const input = document.createElement('input');
        input.type = 'file';
        input.id = 'floorPlanInput';
        input.accept = 'image/jpeg,image/jpg,image/png,image/webp';
        input.style.display = 'none';

        wrap.appendChild(input);

        wrap.addEventListener('click', (e) => {
            if (e.target === input) return;
            input.click();
        });

        input.addEventListener('change', (e) => {
            const f = e.target.files && e.target.files[0];
            if (f) this.importFloorPlanImage(f);
            input.value = '';
        });

        const btnRows = drawingPanel.querySelectorAll('.btn-row');
        if (btnRows.length > 0) {
            btnRows[btnRows.length - 1].insertAdjacentElement('afterend', wrap);
        } else {
            drawingPanel.appendChild(wrap);
        }
    },

    /* ============================================================
     *  ★ 房间设置面板
     * ============================================================ */
    ensureRoomSettingPanel: function () {
        if (document.getElementById('roomSettingPanel')) return;
        const viewport = document.getElementById('viewport');
        if (!viewport) return;

        try {
            const pos = window.getComputedStyle(viewport).position;
            if (pos === 'static') viewport.style.position = 'relative';
        } catch (e) {}

        const panel = document.createElement('div');
        panel.id = 'roomSettingPanel';
        panel.innerHTML = `
<div class="rsp-title">
<span id="rspTitle">🏠 房间设置</span>
<span class="rsp-close" id="rspClose" title="关闭">✕</span>
</div>
<div class="rsp-row">
<label>地板颜色</label>
<input type="color" id="rspRoomColor" value="#505050">
</div>
<div class="rsp-row">
<label>贴图缩放</label>
<input type="range" id="rspRoomTexScale" min="0.1" max="5" step="0.1" value="1">
</div>
<div style="display:flex;gap:6px;margin-top:8px;">
<button class="rsp-btn primary" id="rspUploadTex">📂 上传贴图</button>
<button class="rsp-btn default" id="rspReset">↺ 恢复默认</button>
</div>
<input type="file" id="roomTextureInput" accept="image/*" style="display:none;">`;
        viewport.appendChild(panel);
        this._roomPanelEl = panel;

        document.getElementById('rspClose').onclick = () => {
            this.selectedRoom = null;
            panel.style.display = 'none';
            this.render2D();
        };

        document.getElementById('rspRoomColor').addEventListener('input', (e) => {
            if (!this.selectedRoom) return;
            const { floorIdx, roomIdx } = this.selectedRoom;
            if (!this.roomColors[floorIdx]) this.roomColors[floorIdx] = {};
            this.roomColors[floorIdx][roomIdx] = e.target.value;
            this.generate3D();
            this.render2D();
        });

        document.getElementById('rspRoomColor').addEventListener('change', () => {
            this.saveSystem.saveToDB(true);
        });

        document.getElementById('rspRoomTexScale').addEventListener('input', (e) => {
            if (!this.selectedRoom) return;
            const { floorIdx, roomIdx } = this.selectedRoom;
            const key = `roomTexScale_${floorIdx}_${roomIdx}`;
            if (!this._roomTextureScale) this._roomTextureScale = {};
            this._roomTextureScale[key] = parseFloat(e.target.value);

            const tex = this.roomTextures[floorIdx] && this.roomTextures[floorIdx][roomIdx];
            if (tex) {
                tex.repeat.set(parseFloat(e.target.value), parseFloat(e.target.value));
                tex.needsUpdate = true;
            }
            this.generate3D();
            this.saveSystem.saveToDB(true);
        });

        document.getElementById('rspUploadTex').onclick = () => {
            if (!this.selectedRoom) {
                this.saveSystem.showToast('⚠️ 请先在画布中点击一个房间');
                return;
            }
            const inp = document.getElementById('roomTextureInput');
            if (inp) inp.click();
        };

        document.getElementById('rspReset').onclick = () => {
            if (!this.selectedRoom) return;
            const { floorIdx, roomIdx } = this.selectedRoom;
            if (this.roomColors[floorIdx]) delete this.roomColors[floorIdx][roomIdx];
            if (this.roomTextures[floorIdx]) delete this.roomTextures[floorIdx][roomIdx];
            this.generate3D();
            this.render2D();
            this.refreshRoomSettingPanel();
            this.saveSystem.saveToDB(true);
            this.saveSystem.showToast('↺ 已恢复默认地板');
        };

        const inp = document.getElementById('roomTextureInput');
        if (inp && !inp.dataset.jsBound) {
            inp.dataset.jsBound = '1';
            inp.addEventListener('change', (e) => this.handleRoomTexture(e.target));
        }
    },

    refreshRoomSettingPanel: function () {
        this.ensureRoomSettingPanel();
        const panel = this._roomPanelEl || document.getElementById('roomSettingPanel');
        if (!panel) return;
        if (!this.selectedRoom) { panel.style.display = 'none'; return; }

        const { floorIdx, roomIdx } = this.selectedRoom;
        const titleEl = document.getElementById('rspTitle');
        if (titleEl) titleEl.textContent = `🏠 第${floorIdx + 1}层 · 房间${roomIdx + 1}`;

        const colorInput = document.getElementById('rspRoomColor');
        const floorColorDefault = document.getElementById('floorColor') ? document.getElementById('floorColor').value : '#505050';
        const currentColor = (this.roomColors[floorIdx] && this.roomColors[floorIdx][roomIdx]) || floorColorDefault;
        if (colorInput) colorInput.value = currentColor;

        const scaleKey = `roomTexScale_${floorIdx}_${roomIdx}`;
        const scaleVal = (this._roomTextureScale && this._roomTextureScale[scaleKey]) || 1;
        const scaleInput = document.getElementById('rspRoomTexScale');
        if (scaleInput) scaleInput.value = scaleVal;

        this.updateRoomSettingPanelPosition();
        panel.style.display = 'block';
    },

    updateRoomSettingPanelPosition: function () {
        const panel = this._roomPanelEl || document.getElementById('roomSettingPanel');
        if (!panel) return;
        if (panel.style.display === 'none') return;
        panel.style.left = 'auto';
        panel.style.top = '10px';
        panel.style.right = '10px';
        panel.style.bottom = 'auto';
    },

    handleRoomTexture: function (input) {
        if (!this.selectedRoom) { this.saveSystem.showToast('⚠️ 请先在画布中点击一个房间'); input.value = ''; return; }
        if (!input.files || !input.files[0]) return;

        const file = input.files[0];
        if (!file.type.startsWith('image/')) { this.saveSystem.showToast('⚠️ 请选择图片格式'); input.value = ''; return; }

        const { floorIdx, roomIdx } = this.selectedRoom;
        const img = new Image();

        img.onload = () => {
            const tex = new THREE.CanvasTexture(img);
            tex.image = img;
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.encoding = THREE.sRGBEncoding;

            const scaleKey = `roomTexScale_${floorIdx}_${roomIdx}`;
            const s = (this._roomTextureScale && this._roomTextureScale[scaleKey]) || 1;
            tex.repeat.set(s, s);

            if (!this.roomTextures[floorIdx]) this.roomTextures[floorIdx] = {};
            this.roomTextures[floorIdx][roomIdx] = tex;

            this.generate3D();
            this.saveSystem.showToast(`✅ 已应用房间贴图: ${file.name}`);
            this.saveSystem.saveToDB(true);
        };
        img.onerror = () => { this.saveSystem.showToast('❌ 图片加载失败'); };
        img.src = URL.createObjectURL(file);
        input.value = '';
    },

    /* ============================================================
     *  ★ 户型图导入算法
     * ============================================================ */
    _isNearWhitePixel: function (r, g, b) {
        return r >= 238 && g >= 238 && b >= 238;
    },

    _isBlackWallPixel: function (r, g, b) {
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        return mx <= 110 && (mx - mn) <= 55;
    },

    _dilateBinaryWalls: function (wall, w, h, radius) {
        const out = new Uint8Array(w * h);
        radius = Math.max(0, Math.min(4, radius | 0));
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let hit = 0;
                for (let dy = -radius; dy <= radius && !hit; dy++) {
                    const yy = y + dy;
                    if (yy < 0 || yy >= h) continue;
                    for (let dx = -radius; dx <= radius; dx++) {
                        const xx = x + dx;
                        if (xx < 0 || xx >= w) continue;
                        if (wall[yy * w + xx]) { hit = 1; break; }
                    }
                }
                out[y * w + x] = hit;
            }
        }
        return out;
    },

    _extractRoomLoopsFromMask: function (roomMask, w, h) {
        const visited = new Uint8Array(w * h);
        const loops = [];
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        const inBounds = (x, y) => x >= 0 && x < w && y >= 0 && y < h;
        const edgeKey = (x, y) => x + ':' + y;

        for (let sy = 0; sy < h; sy++) {
            for (let sx = 0; sx < w; sx++) {
                const si = sy * w + sx;
                if (!roomMask[si] || visited[si]) continue;

                const queue = [si];
                visited[si] = 1;
                let head = 0;
                const comp = [];
                let touchesBorder = false;

                while (head < queue.length) {
                    const idx = queue[head++];
                    const y = Math.floor(idx / w);
                    const x = idx - y * w;
                    comp.push(idx);
                    if (x === 0 || y === 0 || x === w - 1 || y === h - 1) touchesBorder = true;
                    for (let k = 0; k < 4; k++) {
                        const nx = x + dirs[k][0], ny = y + dirs[k][1];
                        if (!inBounds(nx, ny)) continue;
                        const ni = ny * w + nx;
                        if (roomMask[ni] && !visited[ni]) {
                            visited[ni] = 1;
                            queue.push(ni);
                        }
                    }
                }

                if (touchesBorder || comp.length < Math.max(24, Math.floor(w * h * 0.0007))) continue;

                const cellSet = new Set(comp);
                const edges = [];
                const addEdge = (ax, ay, bx, by) => edges.push([[ax, ay], [bx, by]]);

                for (let c = 0; c < comp.length; c++) {
                    const idx = comp[c];
                    const y = Math.floor(idx / w);
                    const x = idx - y * w;
                    if (!cellSet.has((y - 1) * w + x)) addEdge(x + 1, y, x, y);
                    if (!cellSet.has(y * w + (x + 1))) addEdge(x + 1, y + 1, x + 1, y);
                    if (!cellSet.has((y + 1) * w + x)) addEdge(x, y + 1, x + 1, y + 1);
                    if (!cellSet.has(y * w + (x - 1))) addEdge(x, y, x, y + 1);
                }

                if (edges.length < 8) continue;

                const adjacency = new Map();
                const addAdj = (a, b, id) => {
                    const k = edgeKey(a[0], a[1]);
                    if (!adjacency.has(k)) adjacency.set(k, []);
                    adjacency.get(k).push({ to: b, id: id });
                };
                edges.forEach((e, id) => { addAdj(e[0], e[1], id); addAdj(e[1], e[0], id); });

                const used = new Uint8Array(edges.length);
                let bestLoop = null;
                let bestLoopLen = 0;

                for (let startId = 0; startId < edges.length; startId++) {
                    if (used[startId]) continue;
                    const start = edges[startId][0];
                    let prev = null, curr = start.slice();
                    const pts = [];
                    let guard = 0;

                    while (guard++ < edges.length + 8) {
                        pts.push(curr.slice());
                        const list = adjacency.get(edgeKey(curr[0], curr[1])) || [];
                        let pick = null;
                        for (let n = 0; n < list.length; n++) {
                            if (used[list[n].id]) continue;
                            if (!prev || list[n].to[0] !== prev[0] || list[n].to[1] !== prev[1]) { pick = list[n]; break; }
                        }
                        if (!pick) break;
                        used[pick.id] = 1;
                        prev = curr;
                        curr = pick.to.slice();
                        if (curr[0] === start[0] && curr[1] === start[1]) break;
                    }

                    if (pts.length >= 4 && curr[0] === start[0] && curr[1] === start[1] && pts.length > bestLoopLen) {
                        bestLoop = pts;
                        bestLoopLen = pts.length;
                    }
                }

                if (bestLoop) {
                    const simp = [];
                    for (let i = 0; i < bestLoop.length; i++) {
                        const prevP = bestLoop[(i - 1 + bestLoop.length) % bestLoop.length];
                        const p = bestLoop[i];
                        const nextP = bestLoop[(i + 1) % bestLoop.length];
                        const colX = (prevP[0] === p[0] && p[0] === nextP[0]);
                        const colY = (prevP[1] === p[1] && p[1] === nextP[1]);
                        if (!colX && !colY) simp.push(p);
                    }
                    if (simp.length >= 4) loops.push({ area: comp.length, points: simp });
                }
            }
        }

        loops.sort((a, b) => b.area - a.area);
        return loops;
    },

    _normalizeImportedFloorLoops: function (loops, imgW, imgH) {
        const canvasW = this.canvas.width, canvasH = this.canvas.height;
        const pad = 12;
        const scale = Math.min((canvasW - pad * 2) / Math.max(imgW, 1), (canvasH - pad * 2) / Math.max(imgH, 1));
        const ox = (canvasW - imgW * scale) * 0.5;
        const oy = (canvasH - imgH * scale) * 0.5;
        const minArea = Math.max(120, imgW * imgH * 0.003);

        return loops.filter(item => item && item.points && item.points.length >= 4 && item.area >= minArea)
            .slice(0, 80)
            .map(item => item.points.map(p => ({ x: ox + p[0] * scale, y: oy + p[1] * scale })));
    },

    importFloorPlanImage: function (file) {
        if (this._planImportBusy) return;
        if (!file || !/^image\/(?:jpe?g|png|webp)$/i.test(file.type || '') && !/\.(jpe?g|png|webp)$/i.test(file.name || '')) {
            this.saveSystem.showToast('⚠️ 请选择 JPG / PNG / WebP 格式的平面户型图');
            return;
        }
        this._planImportBusy = true;
        this.saveSystem.showToast('⏳ 正在深度解析户型图, 请稍候...');

        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                try {
                    const maxDim = 640;
                    const ratio = Math.min(1, maxDim / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
                    const w = Math.max(64, Math.round((img.naturalWidth || img.width) * ratio));
                    const h = Math.max(64, Math.round((img.naturalHeight || img.height) * ratio));

                    const off = document.createElement('canvas');
                    off.width = w; off.height = h;
                    const octx = off.getContext('2d', { willReadFrequently: true });
                    octx.fillStyle = '#ffffff';
                    octx.fillRect(0, 0, w, h);
                    octx.drawImage(img, 0, 0, w, h);

                    const data = octx.getImageData(0, 0, w, h).data;
                    const wall = new Uint8Array(w * h);
                    let whiteCount = 0, wallCount = 0;

                    for (let i = 0, p = 0; i < wall.length; i++, p += 4) {
                        const r = data[p], g = data[p + 1], b = data[p + 2];
                        if (this._isNearWhitePixel(r, g, b)) whiteCount++;
                        if (this._isBlackWallPixel(r, g, b)) { wall[i] = 1; wallCount++; }
                    }

                    const total = w * h;
                    const whiteRatio = whiteCount / total;
                    const wallRatio = wallCount / total;

                    if (whiteRatio < 0.62 || wallRatio < 0.001 || wallRatio > 0.28) {
                        throw new Error('图片不符合要求：背景需以白色为主，墙体需为黑色线条');
                    }

                    const dilation = Math.max(1, Math.min(3, Math.round(Math.min(w, h) / 420)));
                    const wallClosed = this._dilateBinaryWalls(wall, w, h, dilation);
                    const roomMask = new Uint8Array(w * h);
                    for (let i = 0; i < total; i++) roomMask[i] = wallClosed[i] ? 0 : 1;

                    const loops = this._extractRoomLoopsFromMask(roomMask, w, h);
                    const shapes = this._normalizeImportedFloorLoops(loops, w, h);

                    if (!shapes.length) throw new Error('未识别到封闭房间轮廓。请确保墙体黑线连续闭合。');

                    this.dialog.show({
                        icon: '🗺️',
                        msg: `检测到 ${shapes.length} 个房间轮廓。\n\n是否替换当前楼层的房间？\n(点"取消"则追加到现有房间)`,
                        buttons: [
                            {
                                text: '取消(追加)', onClick: () => {
                                    this.floorShapes[this.currentFloor] = this.floorShapes[this.currentFloor].concat(JSON.parse(JSON.stringify(shapes)));
                                    this.panX = 0; this.panY = 0; this.viewScale = 1;
                                    this._wallMergeCache = {};
                                    this.selectedRoom = null;
                                    if (this._roomPanelEl) this._roomPanelEl.style.display = 'none';
                                    this.render2D();
                                    this.generate3D();
                                    this.updateUIStatus();
                                    this.updateFloorInfo();
                                    this.saveSystem.saveToDB(true);
                                    this.saveSystem.showToast(`✅ 成功追加 ${shapes.length} 个房间并生成 3D 户型`);
                                }
                            },
                            {
                                text: '确定(替换)', cls: 'primary', onClick: () => {
                                    this.floorShapes[this.currentFloor] = shapes;
                                    if (this.roomColors[this.currentFloor]) delete this.roomColors[this.currentFloor];
                                    if (this.roomTextures[this.currentFloor]) delete this.roomTextures[this.currentFloor];
                                    this.panX = 0; this.panY = 0; this.viewScale = 1;
                                    this._wallMergeCache = {};
                                    this.selectedRoom = null;
                                    if (this._roomPanelEl) this._roomPanelEl.style.display = 'none';
                                    this.render2D();
                                    this.generate3D();
                                    this.updateUIStatus();
                                    this.updateFloorInfo();
                                    this.saveSystem.saveToDB(true);
                                    this.saveSystem.showToast(`✅ 成功解析 ${shapes.length} 个房间并生成 3D 户型`);
                                }
                            }
                        ]
                    });
                } catch (e) {
                    console.error('户型图深度识别失败:', e);
                    this.saveSystem.showToast('❌ 户型图识别失败: ' + (e.message || e));
                } finally {
                    this._planImportBusy = false;
                }
            };
            img.onerror = () => {
                this._planImportBusy = false;
                this.saveSystem.showToast('❌ 图片加载失败');
            };
            img.src = reader.result;
        };
        reader.onerror = () => {
            this._planImportBusy = false;
            this.saveSystem.showToast('❌ 无法读取户型图文件');
        };
        reader.readAsDataURL(file);
    },

    /* ============================================================
     *  ★ 视口高度 & 移动端 UI
     * ============================================================ */
    setVH: function () {
        let h = window.innerHeight;
        if (window.visualViewport && window.visualViewport.height) h = window.visualViewport.height;
        const vh = h * 0.01;
        document.documentElement.style.setProperty('--vh', vh + 'px');
    },

	setupMobileUI: function () {
		const isMobile = window.innerWidth <= 768;

		if (isMobile) {
			/* ★ 修复：原判断条件 `header h1 + .mobile-menu-btn` 永远不成立，导致每次 resize 都重复创建。
			   改为全局唯一性检测，并防止重复绑定。 */
			if (!document.querySelector('.mobile-menu-btn')) {
				const h1 = document.querySelector('header h1');
				if (h1 && h1.parentNode) {
					const menuBtn = document.createElement('button');
					menuBtn.className = 'mobile-menu-btn';
					menuBtn.type = 'button';
					menuBtn.textContent = '☰';
					menuBtn.title = '打开左侧面板';
					menuBtn.style.cssText = 'background:transparent;color:var(--accent);font-size:1.4rem;padding:0 8px;margin-right:8px;border:none;cursor:pointer;touch-action:manipulation;';
					menuBtn.onclick = (e) => { e.stopPropagation(); this.toggleMobileSidebar('left'); };
					h1.parentNode.insertBefore(menuBtn, h1);
				}
			}

			const viewport = document.getElementById('viewport');
			if (viewport && !document.getElementById('mobileSettingsBtn')) {
				const rightToggle = document.createElement('button');
				rightToggle.id = 'mobileSettingsBtn';
				rightToggle.type = 'button';
				rightToggle.textContent = '⚙️';
				rightToggle.title = '打开右侧面板';
				rightToggle.style.cssText = 'position:absolute;bottom:calc(env(safe-area-inset-bottom, 0px) + 12px);right:12px;z-index:30;background:rgba(0,0,0,0.65);border:1px solid var(--border);border-radius:50%;width:44px;height:44px;font-size:1.2rem;color:#fff;touch-action:manipulation;display:flex;align-items:center;justify-content:center;cursor:pointer;';
				rightToggle.onclick = (e) => { e.stopPropagation(); this.toggleMobileSidebar('right'); };
				viewport.appendChild(rightToggle);
			}

			document.querySelectorAll('.mobile-close-btn').forEach(el => el.style.display = 'block');
		} else {
			/* 从移动端切回桌面端时，清理掉移动端专用按钮，避免残留 */
			document.querySelectorAll('.mobile-menu-btn').forEach(el => el.remove());
			const settingsBtn = document.getElementById('mobileSettingsBtn');
			if (settingsBtn) settingsBtn.remove();
		}

		const viewportEl = document.getElementById('viewport');
		if (viewportEl && !viewportEl.dataset.mobileClickBound) {
			viewportEl.dataset.mobileClickBound = '1';
			viewportEl.addEventListener('click', () => {
				if (window.innerWidth <= 768) this.closeMobileSidebars();
			});
		}
	},
	/* ★★★ 新增：统一管理编辑工具栏的显示逻辑
	   - 桌面端：仅在选中模型时显示
	   - 移动端：常驻显示（未选中时按钮置灰），方便用户随时切换模式
	   - 演示模式：强制隐藏 */
	_updateTransformToolbarVisibility: function () {
		const toolbar = document.getElementById('transformToolbar');
		if (!toolbar) return;

		if (this.isPlayMode) {
			toolbar.style.display = 'none';
			return;
		}

		const isMobile = window.innerWidth <= 768;

		if (isMobile) {
			toolbar.style.display = 'flex';
			if (this.selectedObj) toolbar.classList.remove('no-selection');
			else toolbar.classList.add('no-selection');
		} else {
			toolbar.style.display = this.selectedObj ? 'flex' : 'none';
			toolbar.classList.remove('no-selection');
		}

		// ★ 新增：显示后按当前视口重新约束一次位置（防止侧栏/横竖屏变化后跑出屏幕）
		this._clampTransformToolbarPosition(toolbar);
	},
    toggleMobileSidebar: function (side) {
        const overlay = document.getElementById('sidebarOverlay');
        if (side === 'left') {
            const el = document.getElementById('sidebarLeft');
            if (!el) return;
            const isOpen = el.classList.contains('open');
            this.closeMobileSidebars();
            if (!isOpen) {
                el.classList.add('open');
                if (overlay) overlay.classList.add('active');
            }
        } else if (side === 'right') {
            const el = document.getElementById('sidebarRight');
            if (!el) return;
            const isOpen = el.classList.contains('open');
            this.closeMobileSidebars();
            if (!isOpen) {
                el.classList.add('open');
                if (overlay) overlay.classList.add('active');
            }
        }
        // ★ 布局修复：切换后同步视口尺寸
        setTimeout(() => {
            try { this.fixViewportLayout(); this.updateRendererSize(); } catch (e) {}
        }, 60);
    },

    closeMobileSidebars: function () {
        const l = document.getElementById('sidebarLeft');
        const r = document.getElementById('sidebarRight');
        const o = document.getElementById('sidebarOverlay');
        if (l) l.classList.remove('open');
        if (r) r.classList.remove('open');
        if (o) o.classList.remove('active');
        setTimeout(() => {
            try { this.fixViewportLayout(); this.updateRendererSize(); } catch (e) {}
        }, 60);
    },

    /* ============================================================
     *  ★ Home Assistant
     * ============================================================ */
    ha: {
        testConnection: async function () {
            const url = document.getElementById('haUrl').value.replace(/\/$/, '');
            const token = document.getElementById('haToken').value;
            if (!url || !token) { app.dialog.alert("请填写完整的地址和Token"); return; }
            try {
                const res = await fetch(`${url}/api/`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                if (res.ok) {
                    const data = await res.json();
                    document.getElementById('haStatus').innerHTML = `<span style="color:#2ec4b6">✅ 已连接: ${data.location_name}</span>`;
                    app.haConfig = { url: url, token: token };
                    app.saveSystem.showToast("HA连接成功并已保存！");
                    app.saveSystem.saveToDB();
                } else throw new Error(res.statusText);
            } catch (e) {
                app.dialog.alert("连接失败: " + e.message);
                document.getElementById('haStatus').innerHTML = `<span style="color:#e63946">❌ 连接失败</span>`;
            }
        },

        callService: async function (domain, service, entityId, serviceData = {}) {
            if (!app.haConfig.url || !app.haConfig.token) return;
            const body = { entity_id: entityId, ...serviceData };
            try {
                await fetch(`${app.haConfig.url}/api/services/${domain}/${service}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${app.haConfig.token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                setTimeout(() => app.ha.syncEntity(entityId), 200);
            } catch (e) { console.error("HA Service Call Error", e); }
        },

        fetchState: async function (entityId) {
            if (!app.haConfig.url || !app.haConfig.token) return null;
            try {
                const res = await fetch(`${app.haConfig.url}/api/states/${entityId}`, {
                    headers: { 'Authorization': `Bearer ${app.haConfig.token}` }
                });
                if (res.ok) return await res.json();
            } catch (e) { console.error("HA Fetch Error", e); }
            return null;
        },

        syncEntity: async function (entityId) {
            const targets = [];
            app.furnitureGroup.traverse(obj => { if (obj.userData && obj.userData.entityId === entityId) targets.push(obj); });
            if (targets.length === 0) return;
            const stateData = await this.fetchState(entityId);
            if (!stateData) return;

            targets.forEach(obj => {
                const d = obj.userData;
                const haState = stateData.state;
                const attr = stateData.attributes;

                if (d.type === 'light' || d.type === 'switch' || d.type === 'tv') {
                    d.state.on = (haState === 'on' || haState === 'playing');
                    if (d.type === 'light' && attr.brightness !== undefined) d.state.dimmer = Math.round((attr.brightness / 255) * 100);
                    if (d.type === 'light' && attr.rgb_color) {
                        const r = attr.rgb_color[0], g = attr.rgb_color[1], b = attr.rgb_color[2];
                        d.state.color = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
                    }
                } else if (d.type === 'ac') {
                    d.state.on = (haState !== 'off');
                    d.state.mode = haState === 'off' ? 'cool' : haState;
                    if (attr.temperature) d.state.temp = attr.temperature;
                }

                app.applyDeviceState(obj);
                if (app.currentControlObj === obj && document.getElementById('iotPanel').style.display !== 'none') {
                    app.handleDeviceControl(obj);
                }
            });
        },

        syncAll: function () {
            const ids = new Set();
            app.furnitureGroup.traverse(obj => { if (obj.userData && obj.userData.entityId) ids.add(obj.userData.entityId); });
            ids.forEach(id => this.syncEntity(id));
            console.log(`Synced ${ids.size} HA entities.`);
        }
    },

    /* ============================================================
     *  ★ 保存系统
     * ============================================================ */
    saveSystem: {
        dbName: 'HomeDesignerDB',
        storeName: 'projects',
        glbStoreName: 'glbLibrary',
        db: null,
        _saving: false,
        _saveQueued: false,
        _saveQueuedSilent: true,

        initDB: function () {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, 2);
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(this.storeName)) db.createObjectStore(this.storeName, { keyPath: 'id' });
                    if (!db.objectStoreNames.contains(this.glbStoreName)) db.createObjectStore(this.glbStoreName, { keyPath: 'id' });
                };
                request.onsuccess = (event) => { this.db = event.target.result; console.log("IndexedDB Initialized"); resolve(); };
                request.onerror = (event) => { console.error("IndexedDB Error", event); reject(event); };
            });
        },

        saveGLBToStore: function (record) {
            return new Promise((resolve) => {
                if (!this.db) { resolve(); return; }
                try {
                    const tx = this.db.transaction([this.glbStoreName], 'readwrite');
                    tx.objectStore(this.glbStoreName).put(record);
                    tx.oncomplete = () => resolve();
                    tx.onerror = () => { try { this.showToast('⚠️ 模型写入存储失败(空间不足?), 刷新后该模型可能无法还原'); } catch (e) {} resolve(); };
                    tx.onabort = () => resolve();
                } catch (e) { resolve(); }
            });
        },

        getGLBFromStore: function (id) {
            return new Promise((resolve) => {
                if (!this.db) { resolve(null); return; }
                try {
                    const tx = this.db.transaction([this.glbStoreName], 'readonly');
                    const req = tx.objectStore(this.glbStoreName).get(id);
                    req.onsuccess = (e) => resolve(e.target.result || null);
                    req.onerror = () => resolve(null);
                } catch (e) { resolve(null); }
            });
        },

        getAllGLBFromStore: function () {
            return new Promise((resolve) => {
                if (!this.db) { resolve([]); return; }
                try {
                    const tx = this.db.transaction([this.glbStoreName], 'readonly');
                    const req = tx.objectStore(this.glbStoreName).getAll();
                    req.onsuccess = (e) => resolve(e.target.result || []);
                    req.onerror = () => resolve([]);
                } catch (e) { resolve([]); }
            });
        },

        deleteGLBFromStore: function (id) {
            return new Promise((resolve) => {
                if (!this.db) { resolve(); return; }
                try {
                    const tx = this.db.transaction([this.glbStoreName], 'readwrite');
                    tx.objectStore(this.glbStoreName).delete(id);
                    tx.oncomplete = () => resolve();
                    tx.onerror = () => resolve();
                } catch (e) { resolve(); }
            });
        },

        showToast: function (msg) {
            var x = document.getElementById("toast");
            if (!x) return;
            x.className = "show";
            x.innerText = msg;
            setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
        },

        saveToDB: async function (silent) {
            if (this._saving) {
                this._saveQueued = true;
                if (silent !== true) this._saveQueuedSilent = false;
                return;
            }
            this._saving = true;
            try {
                if (!this.db) await this.initDB();
                if (!this.db) { this.showToast("❌ 数据库不可用, 保存失败"); return; }
                if (!silent) this.showToast("💾 正在后台保存...");

                const data = this.serializeScene();
                await new Promise((resolve) => {
                    let settled = false;
                    const done = () => { if (!settled) { settled = true; resolve(); } };
                    try {
                        const tx = this.db.transaction([this.storeName], 'readwrite');
                        const store = tx.objectStore(this.storeName);
                        const record = { id: 'current_project', data: data, timestamp: Date.now(), version: 6 };
                        const request = store.put(record);
                        request.onsuccess = () => { if (!silent) this.showToast("✅ 保存成功！"); console.log("Saved to IndexedDB"); };
                        request.onerror = (e) => {
                            const ename = (e.target && e.target.error && e.target.error.name) ? e.target.error.name : '未知错误';
                            const msg = '❌ 保存失败: ' + ename + ' (可能是存储空间不足, 请清理模型库后重试)';
                            if (silent) this.showToast(msg); else app.dialog.alert(msg);
                        };
                        tx.oncomplete = done;
                        tx.onabort = () => { console.error("保存事务中止"); done(); };
                        tx.onerror = () => done();
                        setTimeout(done, 8000);
                    } catch (err) { if (silent) this.showToast('❌ 保存异常: ' + err.message); done(); }
                });
            } catch (e) {
                const msg = "❌ 序列化错误: " + e.message;
                if (silent) this.showToast(msg); else app.dialog.alert(msg);
            } finally {
                this._saving = false;
                if (this._saveQueued) {
                    const s = this._saveQueuedSilent;
                    this._saveQueued = false;
                    this._saveQueuedSilent = true;
                    setTimeout(() => { try { this.saveToDB(s); } catch (e) {} }, 60);
                }
            }
        },

        hasSavedData: function () {
            return new Promise((resolve) => {
                if (!this.db) { resolve(false); return; }
                const tx = this.db.transaction([this.storeName], 'readonly');
                const store = tx.objectStore(this.storeName);
                const request = store.get('current_project');
                request.onsuccess = (e) => { resolve(!!e.target.result); };
                request.onerror = () => resolve(false);
            });
        },

        loadFromDB: function () {
            if (!this.db) return;
            const tx = this.db.transaction([this.storeName], 'readonly');
            const store = tx.objectStore(this.storeName);
            const request = store.get('current_project');
            request.onsuccess = (e) => {
                if (e.target.result && e.target.result.data) this.deserializeScene(e.target.result.data);
            };
        },

        clearDB: function () {
            app.dialog.confirm("删除所有存档？", () => {
                const tx = this.db.transaction([this.storeName], 'readwrite');
                tx.objectStore(this.storeName).clear();
                this.showToast("🗑️ 存档已清空");
                setTimeout(() => location.reload(), 1000);
            });
        },

        serializeScene: function () {
            const settings = {
                wallOpacity: document.getElementById('wallOpacity').value,
                wallColor: document.getElementById('wallColor').value,
                floorColor: document.getElementById('floorColor').value,
                sunIntensity: document.getElementById('sunIntensity').value,
                ambientIntensity: document.getElementById('ambientIntensity').value,
                texScale: document.getElementById('texScale').value
            };

            const savedFloorTextures = {};
            for (let floor in app.floorTextures) {
                const tex = app.floorTextures[floor];
                if (tex.image) savedFloorTextures[floor] = this.getBase64Image(tex.image);
            }

            const savedRoomTextures = {};
            for (let floor in app.roomTextures) {
                const rooms = app.roomTextures[floor];
                if (!rooms) continue;
                for (let ri in rooms) {
                    const tex = rooms[ri];
                    if (tex && tex.image) {
                        if (!savedRoomTextures[floor]) savedRoomTextures[floor] = {};
                        savedRoomTextures[floor][ri] = this.getBase64Image(tex.image);
                    }
                }
            }

            const objects = [];
            app.furnitureGroup.children.forEach(obj => {
                const d = obj.userData;
                if (!d) return;
                if (!isFinite(obj.position.x) || !isFinite(obj.position.y) || !isFinite(obj.position.z) || !isFinite(obj.scale.x)) {
                    console.warn("跳过无效坐标对象:", d.name);
                    return;
                }

                const serializedObj = {
                    name: d.name, type: d.type,
                    sourceType: d.sourceType || 'preset',
                    presetKey: d.presetKey,
                    features: d.features, state: d.state, entityId: d.entityId,
                    floorIndex: (typeof d.floorIndex === 'number' && isFinite(d.floorIndex)) ? d.floorIndex : 0,
                    transform: {
                        pos: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
                        rot: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
                        scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z }
                    },
                    animConfig: d.animationConfig,
                    walkConfig: (d.type === 'walker') ? (d.walkConfig || null) : null,
                    manualPosition: d.manualPosition === true,
                    materials: {}
                };

                if (d.sourceType === 'glb') {
                    serializedObj.glbLibId = d.glbLibId || null;
                    serializedObj.glbName = d.glbFileName || d.name;
                } else if (d.materials) {
                    const firstMatKey = Object.keys(d.materials)[0];
                    const mat = d.materials[firstMatKey];
                    if (mat) {
                        serializedObj.customMaterial = {
                            color: mat.color.getHexString(),
                            roughness: mat.roughness,
                            metalness: mat.metalness,
                            opacity: mat.opacity
                        };
                        if (mat.map && mat.map.image) serializedObj.customMaterial.texture = this.getBase64Image(mat.map.image);
                    }
                }
                objects.push(serializedObj);
            });

            return {
                version: 6,
                floorShapes: app.floorShapes,
                floorHeights: (app.floorHeights && app.floorHeights.length > 0) ? app.floorHeights.slice() : null,
                haConfig: app.haConfig,
                settings: settings,
                floorTextures: savedFloorTextures,
                roomTextures: savedRoomTextures,
                roomColors: app.roomColors || {},
                roomTextureScale: app._roomTextureScale || {},
                objects: objects,
                plugins: app.loadedPluginScripts,
                sensorEntities: app.sensorEntities,
                sensorCardOffsets: app.sensorCardOffsets || {},
                bgTheme: app.currentTheme || 'deep_space',
                customTheme: app.BG_THEMES.custom || null,
                skyFileName: app.skyLibrary.currentFileName || null,
                skySphereVisible: app.skySphereVisible !== false,
                panX: app.panX || 0,
                panY: app.panY || 0,
                viewScale: app.viewScale || 1.0,
                sidebarLeftWidth: (() => { try { return parseInt(localStorage.getItem('sidebarLeftWidth') || '0', 10) || null; } catch (e) { return null; } })(),
                sidebarRightWidth: (() => { try { return parseInt(localStorage.getItem('sidebarRightWidth') || '0', 10) || null; } catch (e) { return null; } })()
            };
        },

        deserializeScene: async function (data) {
            // ===== 优化1：反序列化前先清空墙体合并缓存，避免缓存空数组导致首层无墙 =====
            app._wallMergeCache = {};
            app._doorCache = {};

            app.floorShapes = data.floorShapes || [[]];
            app.currentFloor = 0;

            if (data.floorHeights && Array.isArray(data.floorHeights) && data.floorHeights.length > 0) {
                const defH = parseFloat(document.getElementById('wallHeight').value) || 2.8;
                app.floorHeights = [];
                for (let i = 0; i < app.floorShapes.length; i++) {
                    const h = parseFloat(data.floorHeights[i]);
                    app.floorHeights.push((isFinite(h) && h >= 1 && h <= 20) ? h : defH);
                }
            } else app.initFloorHeights();

            app.syncFloorHeightUI();

            if (typeof data.panX === 'number' && isFinite(data.panX)) app.panX = data.panX;
            if (typeof data.panY === 'number' && isFinite(data.panY)) app.panY = data.panY;
            if (typeof data.viewScale === 'number' && isFinite(data.viewScale) && data.viewScale > 0.05) {
                app.viewScale = Math.max(0.15, Math.min(8, data.viewScale));
            }

            app.roomColors = data.roomColors || {};
            app._roomTextureScale = data.roomTextureScale || {};

            try {
                if (data.sidebarLeftWidth && data.sidebarLeftWidth >= 180 && data.sidebarLeftWidth <= 600) {
                    localStorage.setItem('sidebarLeftWidth', String(data.sidebarLeftWidth));
                    const left = document.getElementById('sidebarLeft');
                    if (left && window.innerWidth > 768) left.style.width = data.sidebarLeftWidth + 'px';
                }
                if (data.sidebarRightWidth && data.sidebarRightWidth >= 180 && data.sidebarRightWidth <= 600) {
                    localStorage.setItem('sidebarRightWidth', String(data.sidebarRightWidth));
                    const right = document.getElementById('sidebarRight');
                    if (right && window.innerWidth > 768) right.style.width = data.sidebarRightWidth + 'px';
                }
            } catch (e) {}

            if (data.haConfig) {
                app.haConfig = data.haConfig;
                const haUrl = document.getElementById('haUrl');
                const haToken = document.getElementById('haToken');
                const haStatus = document.getElementById('haStatus');
                if (haUrl) haUrl.value = app.haConfig.url || '';
                if (haToken) haToken.value = app.haConfig.token || '';
                if (haStatus && app.haConfig.url) haStatus.innerHTML = "已恢复配置";
            }

            if (data.settings) {
                const setVal = (id, v) => {
                    const el = document.getElementById(id);
                    if (el && v !== undefined && v !== null) el.value = v;
                };
                setVal('wallOpacity', data.settings.wallOpacity);
                setVal('wallColor', data.settings.wallColor);
                setVal('floorColor', data.settings.floorColor);
                setVal('sunIntensity', data.settings.sunIntensity);
                setVal('ambientIntensity', data.settings.ambientIntensity);
                setVal('texScale', data.settings.texScale || 1);
                app.floorTextureScale = parseFloat(data.settings.texScale) || 1;
                app.updateLights();
                app.updateFloorInfo();
                app.updateFloorTextureScale();
            }

            if (data.skySphereVisible !== undefined) app.skySphereVisible = !!data.skySphereVisible;
            if (data.customTheme && typeof data.customTheme === 'object' && data.customTheme.bg) app.BG_THEMES.custom = data.customTheme;

            if (data.bgTheme && app.BG_THEMES[data.bgTheme]) {
                app.currentTheme = data.bgTheme;
                app.applyBackgroundTheme(data.bgTheme, false);
            }

            if (data.skyFileName) {
                app.skyLibrary.currentFileName = data.skyFileName;
                const skyIt = app.skyLibrary.items.find(i => i.fileName === data.skyFileName);
                if (skyIt) app.applySkyItem(skyIt.id).catch(() => {});
            }

            if (data.plugins) {
                for (let id in data.plugins) { try { new Function('app', data.plugins[id])(app); } catch (e) {} }
            }

            if (data.floorTextures) {
                for (let floor in data.floorTextures) {
                    const img = new Image();
                    img.onload = () => {
                        const tex = new THREE.CanvasTexture(img);
                        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                        tex.repeat.set(app.floorTextureScale, app.floorTextureScale);
                        tex.encoding = THREE.sRGBEncoding;
                        app.floorTextures[floor] = tex;
                        app.generate3D();
                    };
                    img.src = data.floorTextures[floor];
                }
            }

            app.roomTextures = {};
            if (data.roomTextures) {
                for (let floor in data.roomTextures) {
                    const rooms = data.roomTextures[floor];
                    if (!rooms) continue;
                    app.roomTextures[floor] = {};
                    for (let ri in rooms) {
                        const img = new Image();
                        const roomIdx = parseInt(ri, 10);
                        img.onload = () => {
                            const tex = new THREE.CanvasTexture(img);
                            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                            tex.encoding = THREE.sRGBEncoding;
                            const scaleKey = `roomTexScale_${floor}_${roomIdx}`;
                            const s = (app._roomTextureScale && app._roomTextureScale[scaleKey]) || 1;
                            tex.repeat.set(s, s);
                            if (!app.roomTextures[floor]) app.roomTextures[floor] = {};
                            app.roomTextures[floor][roomIdx] = tex;
                            app.generate3D();
                        };
                        img.src = rooms[ri];
                    }
                }
            }

            if (data.sensorEntities) app.sensorEntities = data.sensorEntities;
            if (data.sensorCardOffsets) app.sensorCardOffsets = data.sensorCardOffsets;

            app._pendingAnimObjects = app._pendingAnimObjects || [];
            app._pendingGLBRestores = app._pendingGLBRestores || [];
            app.furnitureGroup.clear();

            const tasks = [];
            if (data.objects) {
                data.objects.forEach(objData => {
                    if (objData.sourceType === 'glb') {
                        tasks.push(app.restoreGLBObject(objData));
                    } else {
                        try {
                            app.tempObjectData = { sourceType: 'preset', presetKey: objData.presetKey };
                            app.createPresetModel(objData.presetKey, objData.name, objData.type, objData.features, {
                                silent: true, sourceType: 'preset', presetKey: objData.presetKey, restoreData: objData
                            });
                            const newObj = app.furnitureGroup.children[app.furnitureGroup.children.length - 1];
                            if (newObj) {
                                if (typeof objData.floorIndex === 'number' && isFinite(objData.floorIndex)) {
                                    newObj.userData.floorIndex = Math.max(0, Math.min(app.floorShapes.length - 1, objData.floorIndex));
                                }
                                if (objData.features) newObj.userData.features = Object.assign(newObj.userData.features || { power: true }, objData.features);
                                if (objData.entityId) newObj.userData.entityId = objData.entityId;
                                if (objData.animConfig) newObj.userData.animationConfig = objData.animConfig;
                                if (typeof objData.manualPosition === 'boolean') {
                                    newObj.userData.manualPosition = objData.manualPosition;
                                }
                                if (objData.customMaterial && newObj.userData.materials) {
                                    const firstMat = Object.values(newObj.userData.materials)[0];
                                    if (firstMat) {
                                        firstMat.color.setHex(parseInt(objData.customMaterial.color, 16));
                                        firstMat.roughness = objData.customMaterial.roughness;
                                        firstMat.metalness = objData.customMaterial.metalness;
                                        firstMat.opacity = objData.customMaterial.opacity;
                                        firstMat.transparent = firstMat.opacity < 1.0;
                                        if (objData.customMaterial.texture) {
                                            const tImg = new Image();
                                            tImg.onload = () => {
                                                const tex = new THREE.CanvasTexture(tImg);
                                                tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                                                tex.encoding = THREE.sRGBEncoding;
                                                app.adjustUVMapping(newObj, tex);
                                                firstMat.map = tex;
                                                firstMat.needsUpdate = true;
                                            };
                                            tImg.src = objData.customMaterial.texture;
                                        }
                                    }
                                }
                            }
                        } catch (e) { console.warn("对象还原失败:", e); }
                        tasks.push(Promise.resolve());
                    }
                });
            }

            try { await Promise.all(tasks); } catch (e) { console.error("批量还原出错:", e); }

            app.furnitureGroup.children.forEach(obj => {
                if (obj.userData && obj.userData.animationConfig) {
                    const config = obj.userData.animationConfig;
                    if (app.plugins[config.type]) app.applyAnimationToObject(obj);
                    else if (!app._pendingAnimObjects.includes(obj)) app._pendingAnimObjects.push(obj);
                }
            });

            app.updateFloorSelect();

            // ===== 优化1：恢复完成后强制清空墙体缓存并重建 3D =====
            app._wallMergeCache = {};
            app._doorCache = {};
            app.render2D();
            app.generate3D();
            app.updateSceneVisibility();

            if (app.sysMenuReady) {
                app.renderSysThemeGrid();
                app.renderSysSkyList();
                app.sysRenderSensorTab();
            }

            try {
                app.renderThemeGrid();
                app.renderEnvSkyList();
                app.renderCustomPalette();
                app._updateSkyToggleBtn();
            } catch (e) {}

            if (app.glbMissingCount > 0) {
                app.saveSystem.showToast(`⚠️ ${app.glbMissingCount}个模型数据缺失, 将自动重试还原 (也可点击模型库"🔄 重扫")`);
                app.glbMissingCount = 0;
                if (app._pendingGLBRestores.length > 0) {
                    setTimeout(() => { try { app._retryPendingGLBRestores(); } catch (e) {} }, 3000);
                }
            } else this.showToast("📂 存档读取成功！");

            app.refreshFloorModelList();

            // ★ 布局修复：恢复后重新计算视口
            setTimeout(() => {
                try { app.fixViewportLayout(); app.updateRendererSize(); } catch (e) {}
            }, 200);
        },

        getBase64Image: function (img) {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            return canvas.toDataURL("image/jpeg", 0.7);
        }
    },

    /* ============================================================
     *  ★ 内置插件
     * ============================================================ */
    registerBuiltInPlugins: function () {
        this.registerPlugin({
            id: 'ripple',
            name: '🔘 发光多层波纹',
            params: [
                { id: 'color', type: 'color', label: '波纹颜色', default: '#4cc9f0' },
                { id: 'size', type: 'range', label: '范围大小', min: 1, max: 20, step: 0.5, default: 2.0 },
                { id: 'duration', type: 'range', label: '扩散速度', min: 1, max: 10, step: 0.5, default: 3.0 },
                { id: 'opacity', type: 'range', label: '透明度', min: 0, max: 1, step: 0.1, default: 0.8 },
                { id: 'glow', type: 'range', label: '辉光强度', min: 0, max: 2, step: 0.1, default: 0.5 },
                { id: 'yOffset', type: 'range', label: '高度微调', min: -5, max: 5, step: 0.1, default: 0 }
            ],
            init: (object, config) => {
                const box = new THREE.Box3().setFromObject(object);
                const size = box.getSize(new THREE.Vector3());
                const group = new THREE.Group();
                group.position.y = (size.y / object.scale.y) + (config.yOffset || 0);
                const count = 3;
                const blending = (config.glow || 0) > 0.5 ? THREE.AdditiveBlending : THREE.NormalBlending;
                for (let i = 0; i < count; i++) {
                    const rGeo = new THREE.RingGeometry(0.9, 1.0, 64);
                    const rMat = new THREE.MeshBasicMaterial({
                        color: config.color, transparent: true, opacity: 0, side: THREE.DoubleSide,
                        blending: blending, depthWrite: false
                    });
                    const r = new THREE.Mesh(rGeo, rMat);
                    r.rotation.x = -Math.PI / 2;
                    r.userData = { offset: i * (1.0 / count) };
                    group.add(r);
                }
                return group;
            },
            update: (group, object, delta, time, config) => {
                const duration = config.duration || 3.0;
                const baseSize = Math.max(object.scale.x, object.scale.z);
                group.children.forEach(c => {
                    const elapsed = time + c.userData.offset * duration;
                    const progress = (elapsed % duration) / duration;
                    const scale = progress * (config.size || 2.0) * baseSize;
                    c.scale.set(scale, scale, scale);
                    let alpha = (1 - Math.pow(progress, 1.5)) * (config.opacity || 0.8);
                    if (config.glow > 0) alpha *= (1 + config.glow * 0.5);
                    c.material.opacity = alpha;
                    c.material.color.set(config.color);
                });
            }
        });
    },

    registerPlugin: function (plugin) {
        if (!plugin.id || !plugin.init || !plugin.update) return;
        this.plugins[plugin.id] = plugin;
        if (this.selectedObj) this.refreshAnimTypeSelect();
    },

    loadPlugin: function (input) {
        if (!input.files || !input.files[0]) { this.saveSystem.showToast("⚠️ 请选择一个JS插件文件"); return; }
        const file = input.files[0];
        if (!file.name.toLowerCase().endsWith('.js')) { this.saveSystem.showToast("⚠️ 请选择 .js 格式的插件文件"); input.value = ''; return; }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const code = e.target.result;
                new Function('app', code)(app);
                this.loadedPluginScripts[`plugin_${Date.now()}`] = code;
                this.saveSystem.showToast(`✅ 插件 "${file.name}" 加载成功！`);
                if (this.selectedObj) this.refreshAnimTypeSelect();
                try { this._reapplyAllAnimations(); } catch (err) {}
            } catch (err) {
                console.error("插件加载错误:", err);
                this.saveSystem.showToast(`❌ 插件加载失败: ${err.message}`);
            }
        };
        reader.onerror = () => { this.saveSystem.showToast("❌ 文件读取失败，请重试"); };
        reader.readAsText(file);
        input.value = '';
    },

    refreshAnimTypeSelect: function () {
        const select = document.getElementById('animType');
        if (!select) return;
        const currentVal = select.value;
        select.innerHTML = '';
        Object.values(this.plugins).forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.name;
            select.appendChild(opt);
        });
        if (currentVal && this.plugins[currentVal]) select.value = currentVal;
        else if (this.selectedObj && this.selectedObj.userData.animationConfig) select.value = this.selectedObj.userData.animationConfig.type;
        this.ensureAnimDropdownOverlay();
    },

    ensureAnimDropdownOverlay: function () {
        const sel = document.getElementById('animType');
        if (!sel || sel.dataset.ddFixed === '1') return;
        const parent = sel.parentNode;
        if (!parent) return;

        const wrap = document.createElement('div');
        wrap.className = 'anim-select-wrap';
        wrap.style.cssText = 'position:relative;flex:1;min-width:60px;display:block;';
        parent.insertBefore(wrap, sel);
        wrap.appendChild(sel);
        sel.style.width = '100%';
        sel.style.pointerEvents = 'none';

        const cover = document.createElement('div');
        cover.className = 'anim-select-cover';
        cover.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;z-index:6;cursor:pointer;background:transparent;';
        cover.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); this.openAnimDropdown(); });
        wrap.appendChild(cover);
        sel.dataset.ddFixed = '1';
    },

    openAnimDropdown: function () {
        const sel = document.getElementById('animType');
        const currentVal = sel ? sel.value : '';

        let dd = document.getElementById('animDropdownModal');
        if (dd) dd.remove();

        dd = document.createElement('div');
        dd.id = 'animDropdownModal';
        dd.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:1200;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);';

        const card = document.createElement('div');
        card.className = 'anim-dd-card';
        card.style.cssText = 'background:#25252b;border:1px solid rgba(255,255,255,0.12);border-radius:14px;width:100%;max-width:320px;max-height:72vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.7);';

        const head = document.createElement('div');
        head.textContent = '✨ 选择动画特效';
        head.style.cssText = 'padding:12px;color:var(--accent);font-weight:bold;border-bottom:1px solid #333;text-align:center;font-size:0.85rem;flex-shrink:0;';
        card.appendChild(head);

        const list = document.createElement('div');
        list.style.cssText = 'overflow-y:auto;padding:8px;-webkit-overflow-scrolling:touch;';

        const entries = Object.values(this.plugins || {});
        if (entries.length === 0) {
            const empty = document.createElement('div');
            empty.textContent = '暂无可用特效, 请先加载插件';
            empty.style.cssText = 'color:#888;text-align:center;padding:18px;font-size:0.78rem;';
            list.appendChild(empty);
        }

        entries.forEach(p => {
            const item = document.createElement('div');
            const active = (p.id === currentVal);
            item.textContent = p.name || p.id;
            item.style.cssText = 'padding:11px 12px;border-radius:9px;margin-bottom:5px;font-size:0.8rem;color:' + (active ? 'var(--accent)' : '#ddd') + ';background:' + (active ? 'rgba(76,201,240,0.12)' : 'rgba(255,255,255,0.04)') + ';border:1px solid ' + (active ? 'var(--accent)' : 'transparent') + ';text-align:center;cursor:pointer;';
            item.onclick = () => { if (sel) { sel.value = p.id; this.onAnimTypeChange(); } dd.remove(); };
            list.appendChild(item);
        });
        card.appendChild(list);

        const foot = document.createElement('div');
        foot.style.cssText = 'padding:10px;border-top:1px solid #333;flex-shrink:0;';
        const cancel = document.createElement('button');
        cancel.textContent = '取消';
        cancel.style.cssText = 'width:100%;min-height:36px;';
        cancel.onclick = () => dd.remove();
        foot.appendChild(cancel);
        card.appendChild(foot);

        dd.appendChild(card);
        dd.addEventListener('click', (e) => { if (e.target === dd) dd.remove(); });
        document.body.appendChild(dd);
    },

    onAnimTypeChange: function () {
        if (!this.selectedObj) return;
        const newType = document.getElementById('animType').value;
        const plugin = this.plugins[newType];
        if (!plugin) return;

        const config = { enabled: true, type: newType };
        plugin.params.forEach(p => config[p.id] = p.default);
        this.selectedObj.userData.animationConfig = config;
        this.renderPluginParamsUI(plugin, config);
        this.applyAnimationToObject(this.selectedObj);
        this.saveSystem.saveToDB(true);
        this.refreshFloorModelList();
    },

    renderPluginParamsUI: function (plugin, currentConfig) {
        const container = document.getElementById('dynamicParamsContainer');
        if (!container) return;
        container.innerHTML = '';

        plugin.params.forEach(param => {
            const wrapper = document.createElement('div');
            wrapper.className = 'control-item';
            const label = document.createElement('label');
            label.innerText = param.label;
            wrapper.appendChild(label);

            if (param.type === 'range') {
                const group = document.createElement('div');
                group.className = 'input-group';
                const range = document.createElement('input');
                range.type = 'range'; range.min = param.min; range.max = param.max; range.step = param.step;
                range.value = currentConfig[param.id] !== undefined ? currentConfig[param.id] : param.default;

                const num = document.createElement('input');
                num.type = 'number'; num.min = param.min; num.max = param.max; num.step = param.step;
                num.value = range.value;

                range.oninput = () => { num.value = range.value; this.updatePluginParam(param.id, parseFloat(range.value)); };
                num.onchange = () => { range.value = num.value; this.updatePluginParam(param.id, parseFloat(num.value)); };

                group.appendChild(range); group.appendChild(num);
                wrapper.appendChild(group);
            } else if (param.type === 'color') {
                const colorInput = document.createElement('input');
                colorInput.type = 'color';
                colorInput.value = currentConfig[param.id] !== undefined ? currentConfig[param.id] : param.default;
                colorInput.oninput = () => this.updatePluginParam(param.id, colorInput.value);
                wrapper.appendChild(colorInput);
            }
            container.appendChild(wrapper);
        });
    },

    updatePluginParam: function (key, value) {
        if (this.selectedObj && this.selectedObj.userData.animationConfig) {
            this.selectedObj.userData.animationConfig[key] = value;
            this.saveSystem.saveToDB(true);
        }
        if (this.selectedObj) this.applyAnimationToObject(this.selectedObj);
        this.refreshFloorModelList();
    },

    applyAnimationToObject: function (obj) {
        if (!obj || !obj.userData) return;
        const config = obj.userData.animationConfig;

        if (!config || !config.enabled) {
            if (obj.userData.animEffectGroup) {
                obj.remove(obj.userData.animEffectGroup);
                obj.userData.animEffectGroup.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
                obj.userData.animEffectGroup = null;
            }
            return;
        }

        const plugin = this.plugins[config.type];
        if (!plugin) { console.warn("插件未找到:", config.type); return; }

        if (obj.userData.animEffectGroup) {
            obj.remove(obj.userData.animEffectGroup);
            obj.userData.animEffectGroup.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
            obj.userData.animEffectGroup = null;
        }

        const effectGroup = plugin.init(obj, config);
        if (effectGroup) { obj.add(effectGroup); obj.userData.animEffectGroup = effectGroup; }
    },

    updateAnimSettings: function () {
        if (!this.selectedObj) return;
        const enabledEl = document.getElementById('animEnabled');
        if (!enabledEl) return;
        const enabled = enabledEl.checked;

        if (!this.selectedObj.userData.animationConfig) { this.onAnimTypeChange(); return; }
        this.selectedObj.userData.animationConfig.enabled = enabled;
        this.applyAnimationToObject(this.selectedObj);
        this.saveSystem.saveToDB(true);
        this.refreshFloorModelList();
    },

    /* ============================================================
     *  ★ 2D 画布
     * ============================================================ */
	init2D: function () {
		this.canvas = document.getElementById('drawCanvas');
		if (!this.canvas) return;
		// ★ 使用统一的 resetCanvasSize 初始化
		this.resetCanvasSize(true);
		this.ctx = this.canvas.getContext('2d');
		if (!this.canvas.dataset.bound2D) {
			this.canvas.dataset.bound2D = '1';
			this.canvas.addEventListener('mousedown', e => this.onMouseDown(e));
			this.canvas.addEventListener('mousemove', e => this.onMouseMove(e));
			this.canvas.addEventListener('touchstart', e => {
				if (!e.touches || e.touches.length !== 1) return;
				e.preventDefault();
				const t = e.touches[0];
				const me = new MouseEvent('mousedown', { clientX: t.clientX, clientY: t.clientY });
				this.onMouseDown(me);
			}, { passive: false });
			this.canvas.addEventListener('touchmove', e => {
				if (!e.touches || e.touches.length !== 1) return;
				e.preventDefault();
				const t = e.touches[0];
				const me = new MouseEvent('mousemove', { clientX: t.clientX, clientY: t.clientY });
				this.onMouseMove(me);
			}, { passive: false });
			this.canvas.addEventListener('touchend', e => { e.preventDefault(); this.onMouseUp(e); }, { passive: false });
			window.addEventListener('mouseup', e => this.onMouseUp(e));
			window.addEventListener('keydown', e => {
				if (this.isPlayMode) return;
				if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
				if (e.key === 'Delete') this.deleteSelected();
				if (e.key === 'Escape') this.cancelOperation();
				if (e.key === 'g') this.setTransformMode('translate');
				if (e.key === 'r') this.setTransformMode('rotate');
				if (e.key === 's') this.setTransformMode('scale');
				if (e.key === ' ') {
					e.preventDefault();
					this.panX = 0; this.panY = 0; this.viewScale = 1;
					this.render2D();
				}
			});
			this.canvas.addEventListener('wheel', (e) => {
				e.preventDefault();
				let dy = e.deltaY;
				if (Math.abs(dy) < 0.5 && Math.abs(e.deltaX) > Math.abs(dy)) dy = e.deltaX;
				if (dy === 0) return;
				const rect = this.canvas.getBoundingClientRect();
				const scaleX = this.canvas.width / rect.width;
				const scaleY = this.canvas.height / rect.height;
				const canvasX = (e.clientX - rect.left) * scaleX;
				const canvasY = (e.clientY - rect.top) * scaleY;
				const oldScale = this.viewScale;
				const worldX = (canvasX - this.panX) / oldScale;
				const worldY = (canvasY - this.panY) / oldScale;
				const factor = Math.exp(-dy * 0.0025);
				let newScale = oldScale * factor;
				newScale = Math.max(0.15, Math.min(8, newScale));
				this.panX = canvasX - worldX * newScale;
				this.panY = canvasY - worldY * newScale;
				this.viewScale = newScale;
				this.render2D();
			}, { passive: false });

			/* ============================================================
			 * ★★★ 优化1-A：双击画布 → 打开"户型编辑窗口" ★★★
			 *  桌面：dblclick 事件
			 *  移动端：320ms 内两次单触、位移<28px 判定为双击
			 * ============================================================ */
			this.canvas.addEventListener('touchstart', (e) => {
				if (this.isPlayMode) return;
				if (!e.touches || e.touches.length !== 1) return;
				const t = e.touches[0];
				const now = Date.now();
				const dt = now - (this._lastCanvasTapT || 0);
				const dx = t.clientX - (this._lastCanvasTapX || -9999);
				const dy = t.clientY - (this._lastCanvasTapY || -9999);
				this._lastCanvasTapT = now;
				this._lastCanvasTapX = t.clientX;
				this._lastCanvasTapY = t.clientY;
				if (dt < 320 && Math.hypot(dx, dy) < 28) {
					this._lastCanvasTapT = 0;
					if (this.mode === 'idle' || this.mode === 'panning') {
						try { e.preventDefault(); } catch (err) {}
						this.tryOpenFloorEditorFromCanvas();
					}
				}
			}, { passive: false });
			this.canvas.addEventListener('dblclick', (e) => {
				if (this.isPlayMode) return;
				e.preventDefault();
				this.tryOpenFloorEditorFromCanvas();
			});
		}
		this.canvas.style.cursor = 'grab';
		this.render2D();
		// ★ ResizeObserver：尺寸变化时同步 2D 画布 + 3D 场景
		if (typeof ResizeObserver !== 'undefined' && !this._canvasObserver) {
			const self = this;
			this._canvasObserver = new ResizeObserver(function () {
				const w = self.canvas.clientWidth;
				const h = self.canvas.clientHeight;
				if (w > 0 && h > 0 && (self.canvas.width !== w || self.canvas.height !== h)) {
					self.canvas.width = w;
					self.canvas.height = h;
					self._wallMergeCache = {};
					self._doorCache = {};
					self.render2D();
					if (self.scene && self.structureGroup && !self.isPlayMode) {
						try { self.generate3D(); } catch (e) {}
					}
				}
			});
			try { this._canvasObserver.observe(this.canvas.parentNode || this.canvas); } catch (e) {}
		}
	},

	/* ★★★ 新增：统一重置 2D 画布尺寸（保证 3D 缩放与画布一致）
	   - 返回是否发生了尺寸变化
	   - 变化时同步清空墙体缓存，避免用旧 scale 生成的墙体被复用
	   - 当 clientWidth 为 0 时回退到父容器尺寸，避免布局瞬间拿不到尺寸 */
	resetCanvasSize: function (force) {
		if (!this.canvas) return false;

		let w = this.canvas.clientWidth;
		let h = this.canvas.clientHeight;

		// 兜底：布局瞬间 clientWidth 可能为 0
		if ((!w || w <= 0 || !h || h <= 0) && this.canvas.parentNode) {
			w = this.canvas.parentNode.clientWidth;
			h = this.canvas.parentNode.clientHeight;
		}

		if (!w || w <= 0 || !h || h <= 0) return false;

		const changed = (this.canvas.width !== w || this.canvas.height !== h);
		if (force || changed) {
			this.canvas.width = w;
			this.canvas.height = h;
			this._wallMergeCache = {};
			this._doorCache = {};
			return true;
		}
		return false;
	},
    getMousePos: function (e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const canvasX = (e.clientX - rect.left) * scaleX;
        const canvasY = (e.clientY - rect.top) * scaleY;
        return {
            x: (canvasX - this.panX) / this.viewScale,
            y: (canvasY - this.panY) / this.viewScale
        };
    },

    getRawMousePos: function (e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    },

    pointToLineDist: function (p, v, w) {
        const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
        if (l2 == 0) return Math.hypot(p.x - v.x, p.y - v.y);
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
    },

    pointInPolygon: function (p, poly) {
        if (!poly || poly.length < 3) return false;
        let inside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const xi = poly[i].x, yi = poly[i].y;
            const xj = poly[j].x, yj = poly[j].y;
            const intersect = ((yi > p.y) !== (yj > p.y)) &&
                (p.x < (xj - xi) * (p.y - yi) / ((yj - yi) || 1e-9) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    },

    onMouseDown: function (e) {
        if (this.isPlayMode) return;
        const pos = this.getMousePos(e);

        if (this.mode === 'drawing_rect') { this.rectStart = pos; this.currentPoints = [pos, pos, pos, pos]; return; }

        if (this.mode === 'drawing') {
            if (this.currentPoints.length > 2) {
                const start = this.currentPoints[0];
                if (Math.hypot(pos.x - start.x, pos.y - start.y) < 15 / this.viewScale) { this.closeCurrentShape(); return; }
            }
            if (this.currentPoints.length > 0) {
                const last = this.currentPoints[this.currentPoints.length - 1];
                if (Math.abs(pos.x - last.x) < Math.abs(pos.y - last.y)) pos.x = last.x;
                else pos.y = last.y;
            }
            this.currentPoints.push(pos);
            this.render2D();
            return;
        }

        if (this.mode === 'idle') {
            const shapes = this.floorShapes[this.currentFloor];
            const hitR = 10 / this.viewScale;

            for (let s = 0; s < shapes.length; s++) {
                const shape = shapes[s];
                for (let p = 0; p < shape.length; p++) {
                    if (Math.hypot(pos.x - shape[p].x, pos.y - shape[p].y) < hitR) {
                        this.mode = 'dragging';
                        this.dragTarget = { type: 'point', shapeIndex: s, pointIndex: p };
                        return;
                    }
                }
            }

            for (let s = 0; s < shapes.length; s++) {
                const shape = shapes[s];
                for (let i = 0; i < shape.length; i++) {
                    const p1 = shape[i];
                    const p2 = shape[(i + 1) % shape.length];
                    if (this.pointToLineDist(pos, p1, p2) < 8 / this.viewScale) {
                        this.mode = 'dragging_edge';
                        this.dragTarget = { type: 'edge', shapeIndex: s, p1Index: i, p2Index: (i + 1) % shape.length, lastMouse: pos };
                        return;
                    }
                }
            }

            let hitRoom = false;
            for (let s = 0; s < shapes.length; s++) {
                if (this.pointInPolygon(pos, shapes[s])) {
                    this.selectedRoom = { floorIdx: this.currentFloor, roomIdx: s };
                    hitRoom = true;
                    break;
                }
            }

            if (hitRoom) {
                this.render2D();
                this.refreshRoomSettingPanel();
                return;
            } else {
                if (this.selectedRoom) {
                    this.selectedRoom = null;
                    if (this._roomPanelEl) this._roomPanelEl.style.display = 'none';
                    this.render2D();
                }
            }

            this.mode = 'panning';
            this._panStartClientX = e.clientX;
            this._panStartClientY = e.clientY;
            this._panStartPanX = this.panX;
            this._panStartPanY = this.panY;
            this.canvas.style.cursor = 'grabbing';
            if (e.cancelable) e.preventDefault();
        }
    },

    onMouseMove: function (e) {
        if (this.isPlayMode) return;
        const pos = this.getMousePos(e);

        if (this.mode === 'panning') {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const dx = (e.clientX - this._panStartClientX) * scaleX;
            const dy = (e.clientY - this._panStartClientY) * scaleY;
            this.panX = this._panStartPanX + dx;
            this.panY = this._panStartPanY + dy;
            this.render2D();
            return;
        }

        this.hoverEdge = null;

        if (this.mode === 'drawing_rect' && this.rectStart) {
            const start = this.rectStart;
            this.currentPoints = [
                { x: start.x, y: start.y }, { x: pos.x, y: start.y },
                { x: pos.x, y: pos.y }, { x: start.x, y: pos.y }
            ];
            this.render2D();
            return;
        }

        if (this.mode === 'drawing') { this.render2D(); return; }

        if (this.mode === 'dragging' && this.dragTarget.type === 'point') {
            this.floorShapes[this.currentFloor][this.dragTarget.shapeIndex][this.dragTarget.pointIndex] = pos;
            this._wallMergeCache = {};
            this.render2D();
            return;
        }

        if (this.mode === 'dragging_edge') {
            const t = this.dragTarget;
            const shape = this.floorShapes[this.currentFloor][t.shapeIndex];
            const p1 = shape[t.p1Index];
            const p2 = shape[t.p2Index];
            const dxRaw = Math.abs(p1.x - p2.x);
            const dyRaw = Math.abs(p1.y - p2.y);
            const isHorizontal = dxRaw > dyRaw;

            let moveX = pos.x - t.lastMouse.x;
            let moveY = pos.y - t.lastMouse.y;
            if (isHorizontal) moveX = 0; else moveY = 0;

            p1.x += moveX; p1.y += moveY;
            p2.x += moveX; p2.y += moveY;
            t.lastMouse = pos;

            this._wallMergeCache = {};
            this.render2D();
            return;
        }

        if (this.mode === 'idle') {
            let hovering = false;
            const shapes = this.floorShapes[this.currentFloor];

            for (let s = 0; s < shapes.length; s++) {
                const shape = shapes[s];
                for (let i = 0; i < shape.length; i++) {
                    const p1 = shape[i];
                    const p2 = shape[(i + 1) % shape.length];
                    if (this.pointToLineDist(pos, p1, p2) < 8 / this.viewScale) {
                        const dx = Math.abs(p1.x - p2.x);
                        const dy = Math.abs(p1.y - p2.y);
                        this.canvas.style.cursor = dx > dy ? 'ns-resize' : 'ew-resize';
                        this.hoverEdge = { p1: p1, p2: p2 };
                        hovering = true;
                        break;
                    }
                }
                if (hovering) break;
            }

            if (!hovering) {
                let insideRoom = false;
                for (let s = 0; s < shapes.length; s++) {
                    if (this.pointInPolygon(pos, shapes[s])) { insideRoom = true; break; }
                }
                this.canvas.style.cursor = insideRoom ? 'pointer' : 'grab';
            }

            this.render2D();
        }
    },

    onMouseUp: function (e) {
        if (this.mode === 'panning') {
            this.mode = 'idle';
            this.canvas.style.cursor = 'grab';
        }

        if (this.mode === 'drawing_rect' && this.rectStart) {
            if (this.currentPoints.length === 4) {
                if (Math.hypot(this.currentPoints[0].x - this.currentPoints[2].x) > 20) {
                    this.floorShapes[this.currentFloor].push(JSON.parse(JSON.stringify(this.currentPoints)));
                }
            }
            this.currentPoints = [];
            this.rectStart = null;
            this.mode = 'idle';
            this.updateUIStatus();
            this._wallMergeCache = {};
            this.generate3D();
            this.render2D();
        }

        if (this.mode === 'dragging' || this.mode === 'dragging_edge') {
            this.mode = 'idle';
            this.dragTarget = null;
            this._wallMergeCache = {};
            this.generate3D();
        }
    },

    startDrawing: function () {
        if (this.currentPoints.length > 0) { this.dialog.alert("请先闭合当前房间"); return; }
        this.mode = 'drawing';
        this.currentPoints = [];
        this.updateUIStatus();
    },

    startRectDrawing: function () {
        this.mode = 'drawing_rect';
        this.currentPoints = [];
        this.updateUIStatus();
    },

    closeCurrentShape: function () {
        if (this.currentPoints.length < 3) { this.dialog.alert("至少3个点"); return; }
        this.floorShapes[this.currentFloor].push(JSON.parse(JSON.stringify(this.currentPoints)));
        this.currentPoints = [];
        this.mode = 'idle';
        this._wallMergeCache = {};
        this.render2D();
        this.generate3D();
        this.updateUIStatus();
    },

    clearCurrentFloor: function () {
        this.dialog.confirm(`确定清空第${this.currentFloor + 1}层的所有房间和模型？`, () => {
            // 1. 删除本层所有模型
            const toRemove = [];
            this.furnitureGroup.children.forEach(obj => {
                if (!obj.userData) return;
                let fi = obj.userData.floorIndex;
                if (fi === undefined || fi === null) {
                    fi = this.floorIndexOfY(obj.position.y);
                }
                if (fi === this.currentFloor) {
                    toRemove.push(obj);
                }
            });

            toRemove.forEach(obj => {
                if (obj.userData.animEffectGroup) {
                    obj.remove(obj.userData.animEffectGroup);
                    obj.userData.animEffectGroup.traverse(c => {
                        if (c.geometry) c.geometry.dispose();
                        if (c.material) c.material.dispose();
                    });
                    obj.userData.animEffectGroup = null;
                }
                if (this._pendingAnimObjects) {
                    this._pendingAnimObjects = this._pendingAnimObjects.filter(o => o !== obj);
                }
                if (this.selectedObj === obj) {
                    this.deselect();
                }
                this.furnitureGroup.remove(obj);
            });

            if (this._flSelectedId) {
                const stillExists = this.furnitureGroup.children.some(c => c.userData && c.userData.id === this._flSelectedId);
                if (!stillExists) {
                    this._flSelectedId = null;
                    const propEl = document.getElementById('flPropPanel');
                    if (propEl) propEl.style.display = 'none';
                }
            }

            // 2. 清空本层房间数据
            this.floorShapes[this.currentFloor] = [];
            this.currentPoints = [];
            this.mode = 'idle';
            if (this.roomColors[this.currentFloor]) delete this.roomColors[this.currentFloor];
            if (this.roomTextures[this.currentFloor]) delete this.roomTextures[this.currentFloor];
            this.selectedRoom = null;
            if (this._roomPanelEl) this._roomPanelEl.style.display = 'none';
            this._wallMergeCache = {};
            this._doorCache = {};

            // 3. 刷新界面
            this.render2D();
            this.generate3D();
            this.updateUIStatus();
            this.updateFloorInfo();
            this.refreshFloorModelList();
            this.saveSystem.saveToDB(true);
        });
    },

    cancelOperation: function () {
        if (this.mode === 'drawing' || this.mode === 'drawing_rect') {
            this.currentPoints = [];
            this.mode = 'idle';
            this.updateUIStatus();
            this.render2D();
        }
    },
	/* ============================================================
	 * ★★★ 优化2：统一 2D 画布原点取值（全项目唯一事实来源） ★★★
	 *  - 3D 原点 (0,0) 在画布上的像素坐标 = (canvas.width/2, canvas.height/2)
	 *  - 取整，保证 render2D 网格 / 原点标记 / 编辑窗口 / generate3D 四处严格一致
	 * ============================================================ */
	getOrigin2D: function () {
		const c = this.canvas || document.getElementById('drawCanvas');
		const w = (c && c.width) ? c.width : 800;
		const h = (c && c.height) ? c.height : 600;
		return { x: Math.round(w / 2), y: Math.round(h / 2) };
	},

	render2D: function () {
		const ctx = this.ctx;
		if (!ctx) return;
		const w = this.canvas.width;
		const h = this.canvas.height;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.fillStyle = '#0f0f1a';
		ctx.fillRect(0, 0, w, h);
		ctx.save();
		ctx.translate(this.panX, this.panY);
		ctx.scale(this.viewScale, this.viewScale);

		/* ============================================================
		 * ★★★ 优化2：网格锚定在 3D 原点上 ★★★
		 *  网格线 = origin + k*gridSize，k=0 的两条线严格穿过原点
		 *  → 原点 (getOrigin2D) 必然精确落在网格顶点（交点）上
		 * ============================================================ */
		const origin = this.getOrigin2D();
		let gridSize = 20;
		while (gridSize * this.viewScale < 12) gridSize *= 2;
		while (gridSize * this.viewScale > 80) gridSize /= 2;
		const worldLeft = -this.panX / this.viewScale;
		const worldTop = -this.panY / this.viewScale;
		const worldRight = worldLeft + w / this.viewScale;
		const worldBottom = worldTop + h / this.viewScale;
		const EPS = 1e-9;
		const kStartX = Math.ceil((worldLeft - origin.x) / gridSize - EPS);
		const kEndX = Math.floor((worldRight - origin.x) / gridSize + EPS);
		const kStartY = Math.ceil((worldTop - origin.y) / gridSize - EPS);
		const kEndY = Math.floor((worldBottom - origin.y) / gridSize + EPS);
		ctx.strokeStyle = '#1a1a2e';
		ctx.lineWidth = 1 / this.viewScale;
		ctx.beginPath();
		for (let k = kStartX; k <= kEndX; k++) {
			const x = origin.x + k * gridSize;
			ctx.moveTo(x, worldTop);
			ctx.lineTo(x, worldBottom);
		}
		for (let k = kStartY; k <= kEndY; k++) {
			const y = origin.y + k * gridSize;
			ctx.moveTo(worldLeft, y);
			ctx.lineTo(worldRight, y);
		}
		ctx.stroke();
		/* ★ 穿过原点的两条主轴线（高亮，直观确认"原点=网格顶点"） */
		ctx.strokeStyle = 'rgba(76,201,240,0.22)';
		ctx.lineWidth = 1.2 / this.viewScale;
		ctx.beginPath();
		ctx.moveTo(origin.x, worldTop);
		ctx.lineTo(origin.x, worldBottom);
		ctx.moveTo(worldLeft, origin.y);
		ctx.lineTo(worldRight, origin.y);
		ctx.stroke();

		const shapes = this.floorShapes[this.currentFloor];
		const invScale = 1 / this.viewScale;
		const defaultFloorColor = document.getElementById('floorColor') ? document.getElementById('floorColor').value : '#505050';
		shapes.forEach((shape, idx) => {
			if (shape.length < 3) return;
			const roomColor = (this.roomColors[this.currentFloor] && this.roomColors[this.currentFloor][idx]) || defaultFloorColor;
			const isSelected = this.selectedRoom && this.selectedRoom.floorIdx === this.currentFloor && this.selectedRoom.roomIdx === idx;
			ctx.fillStyle = this._hexToRgba(roomColor, isSelected ? 0.45 : 0.28);
			ctx.beginPath();
			ctx.moveTo(shape[0].x, shape[0].y);
			for (let i = 1; i < shape.length; i++) ctx.lineTo(shape[i].x, shape[i].y);
			ctx.closePath();
			ctx.fill();
			if (isSelected) {
				ctx.save();
				ctx.strokeStyle = 'rgba(76,201,240,0.9)';
				ctx.lineWidth = 3 * invScale;
				ctx.shadowColor = '#4cc9f0';
				ctx.shadowBlur = 12 * this.viewScale;
				ctx.stroke();
				ctx.restore();
			}
		});
		const mergedWalls = this._getMergedWallSegments(this.currentFloor);
		ctx.strokeStyle = '#4361ee';
		ctx.lineWidth = 2 * invScale;
		mergedWalls.forEach(seg => {
			ctx.beginPath();
			ctx.moveTo(seg.p1.x, seg.p1.y);
			ctx.lineTo(seg.p2.x, seg.p2.y);
			ctx.stroke();
		});
		/* ★ 优化2：绘制 3D 原点标记（精确位于网格顶点上） */
		this._drawOriginMarker(ctx, invScale);
		shapes.forEach((shape, idx) => {
			if (shape.length < 3) return;
			let cx = 0, cy = 0;
			shape.forEach(p => { cx += p.x; cy += p.y; });
			ctx.fillStyle = '#fff';
			ctx.font = `${10 * invScale}px Arial`;
			ctx.fillText(`第${parseInt(this.currentFloor) + 1}层-房间${idx + 1}`, cx / shape.length - 20 * invScale, cy / shape.length + 4 * invScale);
			ctx.fillStyle = '#f72585';
			shape.forEach(p => {
				ctx.beginPath();
				ctx.arc(p.x, p.y, 4 * invScale, 0, Math.PI * 2);
				ctx.fill();
			});
		});
		if (this.hoverEdge) {
			ctx.strokeStyle = '#f7b731';
			ctx.lineWidth = 4 * invScale;
			ctx.beginPath();
			ctx.moveTo(this.hoverEdge.p1.x, this.hoverEdge.p1.y);
			ctx.lineTo(this.hoverEdge.p2.x, this.hoverEdge.p2.y);
			ctx.stroke();
		}
		if (this.currentPoints.length > 0) {
			ctx.strokeStyle = '#4cc9f0';
			ctx.lineWidth = 2 * invScale;
			ctx.beginPath();
			ctx.moveTo(this.currentPoints[0].x, this.currentPoints[0].y);
			for (let i = 1; i < this.currentPoints.length; i++) ctx.lineTo(this.currentPoints[i].x, this.currentPoints[i].y);
			if (this.mode === 'drawing_rect') ctx.closePath();
			ctx.stroke();
			ctx.fillStyle = '#4cc9f0';
			this.currentPoints.forEach(p => {
				ctx.beginPath();
				ctx.arc(p.x, p.y, 4 * invScale, 0, Math.PI * 2);
				ctx.fill();
			});
		}
		ctx.restore();
		ctx.fillStyle = 'rgba(76, 201, 240, 0.15)';
		ctx.fillRect(6, 6, 220, 20);
		ctx.fillStyle = '#4cc9f0';
		ctx.font = 'bold 10px Arial';
		ctx.fillText(`🏢 第 ${parseInt(this.currentFloor) + 1} 层 · 层高 ${this.getWallHeight(this.currentFloor).toFixed(1)}m · 缩放 ${(this.viewScale * 100).toFixed(0)}%`, 10, 20);
		if (this.panX !== 0 || this.panY !== 0 || Math.abs(this.viewScale - 1) > 0.02) {
			ctx.fillStyle = 'rgba(247, 183, 49, 0.85)';
			ctx.font = '10px Arial';
			ctx.fillText(`🖐 视图偏移(${this.panX.toFixed(0)}, ${this.panY.toFixed(0)}) · 滚轮缩放 · 空格键复位`, 10, h - 10);
		}
		if (this.selectedRoom) {
			ctx.fillStyle = 'rgba(76, 201, 240, 0.9)';
			ctx.font = 'bold 10px Arial';
			ctx.fillText(`🎨 已选中 房间${this.selectedRoom.roomIdx + 1} · 请在右上角面板修改地板`, 10, h - 26);
		}
		ctx.fillStyle = 'rgba(255,255,255,0.5)';
		ctx.font = '10px Arial';
		ctx.fillText('✌ 双击画布 → 打开「户型编辑窗口」 · ⌖ 原点已吸附网格顶点', 10, 38);
	},

/* ============================================================
 * ★★★ 优化2：3D 原点标记（主画布） ★★★
 *  - 坐标统一取自 getOrigin2D()，与 generate3D 的 offX/offY 严格一致
 *  - 外圈方形 = 网格顶点高亮框，十字/圆环/中心点 = 原点标记
 * ============================================================ */
	_drawOriginMarker: function (ctx, invScale) {
		if (!ctx) return;
		const o = this.getOrigin2D();
		const ox = o.x, oy = o.y;
		const s = invScale || 1;
		ctx.save();
		// 网格顶点高亮框（表示此处是网格线的交点）
		ctx.strokeStyle = 'rgba(255,82,82,0.55)';
		ctx.lineWidth = 1.2 * s;
		const v = 4.5 * s;
		ctx.beginPath();
		ctx.moveTo(ox - v, oy - v);
		ctx.lineTo(ox + v, oy - v);
		ctx.lineTo(ox + v, oy + v);
		ctx.lineTo(ox - v, oy + v);
		ctx.closePath();
		ctx.stroke();
		// 十字轴
		ctx.strokeStyle = 'rgba(255,82,82,0.9)';
		ctx.lineWidth = 1.5 * s;
		const arm = 14 * s;
		ctx.beginPath();
		ctx.moveTo(ox - arm, oy); ctx.lineTo(ox + arm, oy);
		ctx.moveTo(ox, oy - arm); ctx.lineTo(ox, oy + arm);
		ctx.stroke();
		// 圆环 + 中心点
		ctx.beginPath();
		ctx.arc(ox, oy, 6 * s, 0, Math.PI * 2);
		ctx.strokeStyle = '#ff5252';
		ctx.lineWidth = 2 * s;
		ctx.stroke();
		ctx.fillStyle = '#ff5252';
		ctx.beginPath();
		ctx.arc(ox, oy, 2 * s, 0, Math.PI * 2);
		ctx.fill();
		// 标签
		ctx.fillStyle = 'rgba(255,82,82,0.95)';
		ctx.font = `${10 * s}px Arial`;
		ctx.fillText('⌖ 3D原点(0,0)·网格顶点', ox + 9 * s, oy - 8 * s);
		ctx.restore();
	},


	/* ============================================================
	 * ★★★ 优化1-C：双击主画布 → 打开户型编辑窗口 ★★★
	 * ============================================================ */
	tryOpenFloorEditorFromCanvas: function () {
		if (this.isPlayMode) return;
		// 清理主画布可能残留的交互状态
		if (this.mode === 'drawing' || this.mode === 'drawing_rect') {
			this.currentPoints = [];
			this.rectStart = null;
		}
		this.mode = 'idle';
		this.dragTarget = null;
		this.hoverEdge = null;
		this.updateUIStatus();
		this.openFloorEditModal();
	},

	/* ============================================================
	 * ★★★ 户型编辑窗口（自适应手机模态）★★★
	 * 修复：工具栏按钮根据屏幕分辨率自动换行，全部可见可点
	 * ============================================================ */
	ensureFloorEditModal: function () {
	  if (!this._fem) {
		this._fem = {
		  open: false, mode: 'edit', drawMode: null, // mode: edit|move|scale; drawMode: null|rect|poly
		  panX: 0, panY: 0, viewScale: 1,
		  dragTarget: null, rectStart: null, currentPoints: [],
		  snapshot: null, snapColors: null, snapTex: null, snapTexScale: null,
		  selectedRoom: null, pendingRoomTap: undefined,
		  moved: false, downClientX: 0, downClientY: 0,
		  pinch: null,
		  lastPanTapT: 0, lastPanTapX: 0, lastPanTapY: 0
		};
	  }
	  if (document.getElementById('floorEditModal')) return;

	  // ---------- 注入样式（移动端自适应 + 工具栏自动换行） ----------
	  if (!document.getElementById('femStyles')) {
		const st = document.createElement('style');
		st.id = 'femStyles';
		st.textContent = `
	@keyframes femFadeIn{from{opacity:0;}to{opacity:1;}}
	@keyframes femPopIn{from{opacity:0;transform:scale(.92) translateY(16px);}to{opacity:1;transform:scale(1) translateY(0);}}

	#floorEditModal{position:fixed;top:0;left:0;right:0;bottom:0;z-index:1600;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.74);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:femFadeIn .2s ease;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px);box-sizing:border-box;}

	#floorEditModal .fem-card{display:flex;flex-direction:column;width:min(94vw,560px);height:min(86vh,760px);height:min(86dvh,760px);background:#15151f;border:1px solid rgba(76,201,240,.45);border-radius:16px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.78);animation:femPopIn .24s ease;box-sizing:border-box;}

	#floorEditModal .fem-head{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:rgba(76,201,240,.08);border-bottom:1px solid rgba(255,255,255,.08);}

	#floorEditModal .fem-title{font-size:.85rem;color:#4cc9f0;font-weight:700;}

	#floorEditModal .fem-close{cursor:pointer;color:#aaa;font-size:1.15rem;padding:2px 10px;user-select:none;-webkit-user-select:none;touch-action:manipulation;}

	#floorEditModal .fem-close:active{transform:scale(.9);}

	/* ============================================================
	   ★ 工具栏：flex-wrap 自动换行，按钮按屏幕宽度重新排列
	   桌面 : 每行 4 个 (flex:1 1 calc(25% - 6px))
	   平板 : 每行 3 个 (@media max-width:520px)
	   手机 : 每行 2 个 (@media max-width:380px)
	   ============================================================ */
	#floorEditModal .fem-tools{
	  flex:0 0 auto;
	  display:flex;
	  flex-wrap:wrap;
	  gap:6px;
	  padding:8px 10px;
	  overflow:hidden;               /* 去掉横向滚动，改为自动换行 */
	  background:#101018;
	  border-bottom:1px solid rgba(255,255,255,.06);
	  box-sizing:border-box;
	}

	#floorEditModal .fem-tools button{
	  flex:1 1 calc(25% - 6px);      /* 每行 4 个（大屏） */
	  min-width:66px;
	  max-width:100%;
	  min-height:36px;
	  padding:0 6px;
	  font-size:.72rem;
	  border-radius:9px;
	  border:1px solid rgba(255,255,255,.1);
	  background:#23232e;
	  color:#ddd;
	  font-weight:600;
	  cursor:pointer;
	  touch-action:manipulation;
	  -webkit-user-select:none;
	  user-select:none;
	  white-space:nowrap;
	  box-sizing:border-box;
	  line-height:1.15;
	}

	#floorEditModal .fem-tools button:active{transform:scale(.95);}

	#floorEditModal .fem-tools button.active{
	  background:linear-gradient(135deg,#4361ee,#4cc9f0);
	  color:#fff;
	  border-color:transparent;
	  box-shadow:0 0 12px rgba(76,201,240,.5);
	}

	#floorEditModal .fem-tools button.danger{color:#ff8585;}

	#floorEditModal .fem-canvas-wrap{position:relative;flex:1 1 auto;min-height:0;overflow:hidden;background:#0d0d17;}

	#femCanvas{position:absolute;top:0;left:0;width:100%;height:100%;touch-action:none;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;display:block;}

	#femRoomPanel{position:absolute;top:10px;right:10px;z-index:6;width:min(64vw,235px);background:rgba(24,24,34,.96);border:1px solid rgba(76,201,240,.55);border-radius:12px;padding:10px;box-shadow:0 10px 30px rgba(0,0,0,.7);display:none;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-sizing:border-box;}

	#femRoomPanel .fem-rp-title{font-size:.72rem;color:#4cc9f0;font-weight:700;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;gap:6px;}

	#femRoomPanel .fem-rp-close{cursor:pointer;color:#999;font-size:.95rem;padding:0 4px;}

	#femRoomPanel .fem-rp-row{display:flex;align-items:center;gap:8px;margin-bottom:7px;}

	#femRoomPanel .fem-rp-row label{font-size:.62rem;color:#bbb;flex-shrink:0;width:52px;}

	#femRoomPanel .fem-rp-row input[type="color"]{flex:1;height:27px;border:none;background:none;cursor:pointer;padding:0;}

	#femRoomPanel .fem-rp-row input[type="range"]{flex:1;min-width:0;}

	#femRoomPanel .fem-rp-btns{display:flex;gap:6px;margin-top:4px;}

	#femRoomPanel .fem-rp-btns button{flex:1;min-height:34px;font-size:.64rem;border:none;border-radius:8px;cursor:pointer;font-weight:600;touch-action:manipulation;}

	#femUploadTex{background:linear-gradient(135deg,#4361ee,#4cc9f0);color:#fff;}

	#femResetTex{background:#3a3a46;color:#ddd;}

	#floorEditModal .fem-hint{position:absolute;left:10px;bottom:8px;z-index:5;font-size:.58rem;color:rgba(255,255,255,.45);pointer-events:none;text-shadow:0 1px 3px rgba(0,0,0,.8);}

	#floorEditModal .fem-foot{flex:0 0 auto;display:flex;gap:10px;padding:10px 12px;background:#101018;border-top:1px solid rgba(255,255,255,.08);padding-bottom:calc(10px + env(safe-area-inset-bottom,0px));}

	#floorEditModal .fem-foot button{flex:1;min-height:46px;font-size:.85rem;border:none;border-radius:11px;font-weight:700;cursor:pointer;touch-action:manipulation;-webkit-user-select:none;user-select:none;}

	#floorEditModal .fem-foot button:active{transform:scale(.97);}

	#femCancel{background:#2c2c38;color:#ccc;}

	#femOk{background:linear-gradient(135deg,#2ecc71,#27ae60);color:#fff;box-shadow:0 4px 16px rgba(46,204,113,.4);}

	/* ---------- 响应式：平板 → 每行 3 个 ---------- */
	@media (max-width:520px){
	  #floorEditModal .fem-tools button{
		flex:1 1 calc(33.333% - 6px);
		min-width:0;
		font-size:.68rem;
		padding:0 4px;
	  }
	  #floorEditModal .fem-title{font-size:.78rem;}
	}

	/* ---------- 响应式：手机 → 每行 2 个 ---------- */
	@media (max-width:380px){
	  #floorEditModal .fem-tools{
		gap:5px;
		padding:7px 8px;
	  }
	  #floorEditModal .fem-tools button{
		flex:1 1 calc(50% - 5px);
		font-size:.66rem;
		min-height:34px;
		padding:0 4px;
	  }
	  #floorEditModal .fem-title{font-size:.74rem;}
	  #floorEditModal .fem-foot button{min-height:42px;font-size:.8rem;}
	}
	`;
		document.head.appendChild(st);
	  }

	  // ---------- 创建 DOM ----------
	  const modal = document.createElement('div');
	  modal.id = 'floorEditModal';
	  modal.innerHTML = `
	<div class="fem-card">
	  <div class="fem-head">
		<span class="fem-title" id="femFloorTitle">🗺️ 户型编辑</span>
		<span class="fem-close" id="femCloseBtn" title="关闭(不保存)">✕</span>
	  </div>
	  <div class="fem-tools" id="femTools">
		<button type="button" data-fem-mode="edit" class="active">✏️ 编辑</button>
		<button type="button" data-fem-mode="move">✥ 移动</button>
		<button type="button" data-fem-mode="scale">⤢ 缩放</button>
		<button type="button" data-fem-act="rect">▭ 矩形</button>
		<button type="button" data-fem-act="poly">➰ 折线</button>
		<button type="button" data-fem-act="closepoly" style="display:none;">✅ 闭合</button>
		<button type="button" data-fem-act="center">🎯 居中</button>
		<button type="button" data-fem-act="del" class="danger">🗑️ 删除</button>
	  </div>
	  <div class="fem-canvas-wrap" id="femCanvasWrap">
		<canvas id="femCanvas"></canvas>
		<div id="femRoomPanel">
		  <div class="fem-rp-title"><span id="femRoomPanelTitle">🏠 房间</span><span class="fem-rp-close" id="femRoomPanelClose">✕</span></div>
		  <div class="fem-rp-row"><label>地板颜色</label><input type="color" id="femRoomColor" value="#505050"></div>
		  <div class="fem-rp-row"><label>贴图缩放</label><input type="range" id="femRoomTexScale" min="0.1" max="5" step="0.1" value="1"></div>
		  <div class="fem-rp-btns">
			<button type="button" id="femUploadTex">📂 上传贴图</button>
			<button type="button" id="femResetTex">↺ 默认</button>
		  </div>
		  <input type="file" id="femRoomTextureInput" accept="image/*" style="display:none;">
		</div>
		<div class="fem-hint">拖顶点/边/房间=编辑 · 拖空白=平移 · 双指捏合=缩放 · 点房间=地板设置</div>
	  </div>
	  <div class="fem-foot">
		<button type="button" id="femCancel">取消</button>
		<button type="button" id="femOk">✅ 完成并退出</button>
	  </div>
	</div>`;
	  document.body.appendChild(modal);

	  // ---------- 工具栏绑定 ----------
	  const bar = document.getElementById('femTools');
	  bar.querySelectorAll('button[data-fem-mode]').forEach(b => {
		b.onclick = () => {
		  const M = this._fem;
		  M.mode = b.getAttribute('data-fem-mode');
		  M.drawMode = null;
		  M.currentPoints = [];
		  M.rectStart = null;
		  this._femSyncModeButtons();
		  this._femRender();
		};
	  });
	  bar.querySelector('[data-fem-act="rect"]').onclick = () => this._femStartRect();
	  bar.querySelector('[data-fem-act="poly"]').onclick = () => this._femStartPoly();
	  bar.querySelector('[data-fem-act="closepoly"]').onclick = () => this._femFinishPoly();
	  bar.querySelector('[data-fem-act="center"]').onclick = () => this._femCenterView();
	  bar.querySelector('[data-fem-act="del"]').onclick = () => this._femDeleteSelectedRoom();

	  // ---------- 头部/底部按钮 ----------
	  document.getElementById('femCloseBtn').onclick = () => this.closeFloorEditModal(false);
	  document.getElementById('femCancel').onclick = () => this.closeFloorEditModal(false);
	  document.getElementById('femOk').onclick = () => this.closeFloorEditModal(true);

	  // ---------- 房间贴图设置栏绑定 ----------
	  document.getElementById('femRoomColor').addEventListener('input', (e) => {
		const M = this._fem;
		if (!M || !M.selectedRoom) return;
		const { floorIdx, roomIdx } = M.selectedRoom;
		if (!this.roomColors[floorIdx]) this.roomColors[floorIdx] = {};
		this.roomColors[floorIdx][roomIdx] = e.target.value;
		this._femRender();
		try { this.render2D(); } catch (err) {}
	  });
	  document.getElementById('femRoomColor').addEventListener('change', () => { this.saveSystem.saveToDB(true); });

	  document.getElementById('femRoomTexScale').addEventListener('input', (e) => {
		const M = this._fem;
		if (!M || !M.selectedRoom) return;
		const { floorIdx, roomIdx } = M.selectedRoom;
		const key = `roomTexScale_${floorIdx}_${roomIdx}`;
		if (!this._roomTextureScale) this._roomTextureScale = {};
		this._roomTextureScale[key] = parseFloat(e.target.value);
		const tex = this.roomTextures[floorIdx] && this.roomTextures[floorIdx][roomIdx];
		if (tex) {
		  tex.repeat.set(parseFloat(e.target.value), parseFloat(e.target.value));
		  tex.needsUpdate = true;
		}
		this._femRender();
	  });
	  document.getElementById('femRoomTexScale').addEventListener('change', () => { this.saveSystem.saveToDB(true); });

	  document.getElementById('femUploadTex').onclick = () => {
		const M = this._fem;
		if (!M || !M.selectedRoom) { this.saveSystem.showToast('⚠️ 请先点击一个房间'); return; }
		document.getElementById('femRoomTextureInput').click();
	  };
	  document.getElementById('femRoomTextureInput').addEventListener('change', (e) => this._femHandleRoomTexture(e.target));

	  document.getElementById('femResetTex').onclick = () => {
		const M = this._fem;
		if (!M || !M.selectedRoom) return;
		const { floorIdx, roomIdx } = M.selectedRoom;
		if (this.roomColors[floorIdx]) delete this.roomColors[floorIdx][roomIdx];
		if (this.roomTextures[floorIdx]) delete this.roomTextures[floorIdx][roomIdx];
		const key = `roomTexScale_${floorIdx}_${roomIdx}`;
		if (this._roomTextureScale) delete this._roomTextureScale[key];
		this._femRender();
		try { this.render2D(); } catch (err) {}
		this._femShowRoomPanel();
		this.saveSystem.saveToDB(true);
		this.saveSystem.showToast('↺ 已恢复默认地板');
	  };

	  document.getElementById('femRoomPanelClose').onclick = () => this._femHideRoomPanel();
	},

	// 追加在 ensureFloorEditModal 结尾（可选）
	_femAutoFitToolbar: function () {
	  const bar = document.getElementById('femTools');
	  if (!bar) return;
	  const btns = bar.querySelectorAll('button');
	  if (!btns.length) return;
	  const W = bar.clientWidth - 20;         // 减去左右 padding
	  const MIN_W = 66;                       // 单个按钮最小宽度
	  const GAP = 6;
	  let perRow = Math.max(2, Math.floor((W + GAP) / (MIN_W + GAP)));
	  perRow = Math.min(perRow, 4);           // 最多 4 列
	  const w = (W - (perRow - 1) * GAP) / perRow;
	  btns.forEach(b => {
		b.style.flex = `1 1 ${w}px`;
		b.style.maxWidth = w + 'px';
	  });
	},
	/* ============================================================
	 * ★★★ 户型编辑窗口专用确认框
	 * - z-index 2200 > #floorEditModal(1600) > appDialogOverlay(1500)
	 * - 保证提示框永远显示在编辑窗口之上，不会被遮挡
	 * - 支持 ESC / 点击遮罩 / 点"取消" 三种关闭方式
	 * ============================================================ */
	_femConfirm: function (msg, onOk, onCancel) {
	  // 先清掉可能残留的旧确认框，避免叠加
	  const old = document.getElementById('femConfirmOverlay');
	  if (old) { try { old.remove(); } catch (e) {} }

	  const ov = document.createElement('div');
	  ov.id = 'femConfirmOverlay';
	  ov.style.cssText =
		'position:fixed;top:0;left:0;width:100%;height:100%;' +
		'background:rgba(0,0,0,0.68);z-index:2200;' +
		'display:flex;align-items:center;justify-content:center;padding:24px;' +
		'backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);' +
		'animation:femFadeIn .18s ease;box-sizing:border-box;' +
		'padding-top:calc(24px + env(safe-area-inset-top,0px));' +
		'padding-bottom:calc(24px + env(safe-area-inset-bottom,0px));';

	  const card = document.createElement('div');
	  card.style.cssText =
		'background:#25252b;border:1px solid rgba(255,255,255,0.12);' +
		'border-radius:14px;width:100%;max-width:340px;padding:20px 18px;' +
		'box-shadow:0 20px 60px rgba(0,0,0,0.7);text-align:center;' +
		'box-sizing:border-box;animation:femPopIn .22s ease;';

	  const icon = document.createElement('div');
	  icon.style.cssText = 'font-size:1.9rem;line-height:1;margin-bottom:10px;';
	  icon.textContent = '❓';

	  const msgEl = document.createElement('div');
	  msgEl.style.cssText =
		'font-size:0.85rem;color:#e0e0e0;line-height:1.7;' +
		'white-space:pre-wrap;word-break:break-word;text-align:left;';
	  msgEl.textContent = String(msg || '');

	  const btnRow = document.createElement('div');
	  btnRow.style.cssText = 'display:flex;gap:10px;margin-top:18px;';

	  const cancelBtn = document.createElement('button');
	  cancelBtn.type = 'button';
	  cancelBtn.textContent = '取消';
	  cancelBtn.style.cssText =
		'flex:1;min-height:44px;font-size:0.85rem;background:#3a3a44;' +
		'color:#fff;border:none;border-radius:9px;cursor:pointer;font-weight:600;' +
		'touch-action:manipulation;-webkit-user-select:none;user-select:none;';

	  const okBtn = document.createElement('button');
	  okBtn.type = 'button';
	  okBtn.textContent = '确定删除';
	  okBtn.style.cssText =
		'flex:1;min-height:44px;font-size:0.85rem;' +
		'background:linear-gradient(135deg,#e63946,#c1121f);color:#fff;' +
		'border:none;border-radius:9px;cursor:pointer;font-weight:700;' +
		'box-shadow:0 4px 14px rgba(230,57,70,0.4);' +
		'touch-action:manipulation;-webkit-user-select:none;user-select:none;';

	  let closed = false;
	  const close = () => {
		if (closed) return;
		closed = true;
		try { document.removeEventListener('keydown', onKey, true); } catch (e) {}
		try { ov.remove(); } catch (e) {}
	  };
	  const onKey = (e) => {
		if (!document.getElementById('femConfirmOverlay')) return;
		if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); if (typeof onCancel === 'function') setTimeout(onCancel, 60); }
		else if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); close(); if (typeof onOk === 'function') setTimeout(onOk, 60); }
	  };

	  cancelBtn.onclick = () => { close(); if (typeof onCancel === 'function') setTimeout(onCancel, 60); };
	  okBtn.onclick     = () => { close(); if (typeof onOk     === 'function') setTimeout(onOk,     60); };

	  // 点击遮罩空白处 = 取消
	  ov.addEventListener('click', (e) => {
		if (e.target === ov) { close(); if (typeof onCancel === 'function') setTimeout(onCancel, 60); }
	  });

	  btnRow.appendChild(cancelBtn);
	  btnRow.appendChild(okBtn);
	  card.appendChild(icon);
	  card.appendChild(msgEl);
	  card.appendChild(btnRow);
	  ov.appendChild(card);
	  document.body.appendChild(ov);

	  // ESC / Enter 快捷键
	  document.addEventListener('keydown', onKey, true);
	},
	/* ============================================================
	 * ★ 打开编辑窗口（快照当前层 → 用于取消回滚）
	 * ============================================================ */
	openFloorEditModal: function () {
		if (this.isPlayMode) return;
		this.ensureFloorEditModal();
		const M = this._fem;
		M.open = true;
		M.mode = 'edit';
		M.drawMode = null;
		M.currentPoints = [];
		M.rectStart = null;
		M.dragTarget = null;
		M.pinch = null;
		M.selectedRoom = null;
		M.moved = false;
		M.panX = 0; M.panY = 0; M.viewScale = 1;
		M.snapshot = JSON.parse(JSON.stringify(this.floorShapes[this.currentFloor] || []));
		M.snapColors = Object.assign({}, this.roomColors[this.currentFloor] || {});
		M.snapTex = Object.assign({}, this.roomTextures[this.currentFloor] || {});
		M.snapTexScale = Object.assign({}, this._roomTextureScale || {});
		const modal = document.getElementById('floorEditModal');
		modal.style.display = 'flex';
		const title = document.getElementById('femFloorTitle');
		if (title) title.textContent = `🗺️ 户型编辑 · 第${this.currentFloor + 1}层 (${(this.floorShapes[this.currentFloor] || []).length}个房间)`;
		this._femSyncModeButtons();
		this._femHideRoomPanel();
		this._femResizeCanvas();
		this._femRender();
		this._femBindEvents();
		if ((this.floorShapes[this.currentFloor] || []).length === 0) {
			this.saveSystem.showToast('💡 当前层暂无房间, 可用「▭ 矩形 / ➰ 折线」开始绘制');
		}
	},

	/* ============================================================
	 * ★ 关闭编辑窗口（ok=true 保存重建3D / ok=false 回滚快照）
	 * ============================================================ */
	closeFloorEditModal: function (ok) {
		const M = this._fem;
		if (!M || !M.open) return;
		const modal = document.getElementById('floorEditModal');
		if (ok) {
			this._wallMergeCache = {};
			this._doorCache = {};
			this.selectedRoom = null;
			if (this._roomPanelEl) this._roomPanelEl.style.display = 'none';
			this._femHideRoomPanel();
			this.render2D();
			this.generate3D();
			this.updateUIStatus();
			this.updateFloorInfo();
			this.refreshFloorModelList();
			this.saveSystem.saveToDB(true);
			this.saveSystem.showToast('✅ 户型已保存并重新生成 3D');
		} else {
			this.floorShapes[this.currentFloor] = M.snapshot ? JSON.parse(JSON.stringify(M.snapshot)) : [];
			this.roomColors[this.currentFloor] = M.snapColors || {};
			this.roomTextures[this.currentFloor] = M.snapTex || {};
			this._roomTextureScale = M.snapTexScale ? Object.assign({}, M.snapTexScale) : {};
			this._wallMergeCache = {};
			this._doorCache = {};
			this.selectedRoom = null;
			if (this._roomPanelEl) this._roomPanelEl.style.display = 'none';
			this._femHideRoomPanel();
			this.render2D();
			this.saveSystem.showToast('↩ 已取消编辑, 户型已还原');
		}
		M.open = false;
		M.selectedRoom = null;
		M.dragTarget = null;
		M.currentPoints = [];
		M.rectStart = null;
		M.drawMode = null;
		M.pinch = null;
		if (modal) modal.style.display = 'none';
	},
	/* ============================================================
	 * ★ 传感器卡片拖拽专用样式（强制可交互、无文本选择、无滚动干扰）
	 * ============================================================ */
	_injectSensorCardStyles: function () {
	  if (document.getElementById('sensorCardDragStyles')) return;
	  const s = document.createElement('style');
	  s.id = 'sensorCardDragStyles';
	  s.textContent = `
		#sensorCardContainer{
		  position:absolute !important;
		  top:0; left:0;
		  width:100%; height:100%;
		  pointer-events:none !important;
		  z-index:55;
		  overflow:visible;
		}
		#sensorCardContainer .sensor-card{
		  position:absolute;
		  pointer-events:auto !important;
		  cursor:grab;
		  user-select:none;
		  -webkit-user-select:none;
		  -webkit-touch-callout:none;
		  touch-action:none;
		  will-change:left, top, transform;
		  transition:opacity .2s ease, box-shadow .2s ease;
		}
		#sensorCardContainer .sensor-card.dragging{
		  cursor:grabbing !important;
		  box-shadow:0 12px 36px rgba(0,0,0,.8), 0 0 24px rgba(76,201,240,.7) !important;
		  transform:scale(1.03);
		  z-index:9999 !important;
		  opacity:1 !important;
		}
		#sensorCardContainer .sensor-card.dragging *{
		  cursor:grabbing !important;
		}
		/* 拖动时防止长按选中文字/弹出菜单 */
		body.sensor-card-dragging{
		  cursor:grabbing !important;
		  user-select:none !important;
		  -webkit-user-select:none !important;
		}
		body.sensor-card-dragging *{
		  cursor:grabbing !important;
		  user-select:none !important;
		}
		/* 拖动手柄（可保留作视觉提示，非必需） */
		#sensorCardContainer .sensor-card-drag-handle{
		  position:absolute;
		  top:2px; left:4px;
		  font-size:.65rem;
		  color:rgba(255,255,255,.5);
		  pointer-events:none;
		  user-select:none;
		  z-index:2;
		}
	  `;
	  document.head.appendChild(s);
	},
	/* ============================================================
	 * ★ 编辑窗口事件绑定（一次性）
	 * ============================================================ */
	_femBindEvents: function () {
		const c = document.getElementById('femCanvas');
		if (!c || c.dataset.femBound === '1') return;
		c.dataset.femBound = '1';
		c.addEventListener('mousedown', (e) => this._femOnDown(e));
		window.addEventListener('mousemove', (e) => { if (this._fem && this._fem.open) this._femOnMove(e); });
		window.addEventListener('mouseup', (e) => { if (this._fem && this._fem.open) this._femOnUp(e); });
		c.addEventListener('touchstart', (e) => { e.preventDefault(); this._femOnDown(e); }, { passive: false });
		c.addEventListener('touchmove', (e) => { e.preventDefault(); this._femOnMove(e); }, { passive: false });
		c.addEventListener('touchend', (e) => { this._femOnUp(e); }, { passive: false });
		c.addEventListener('wheel', (e) => {
			e.preventDefault();
			const M = this._fem;
			if (!M || !M.open) return;
			const rect = c.getBoundingClientRect();
			const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
			const wx = (cx - M.panX) / M.viewScale, wy = (cy - M.panY) / M.viewScale;
			const factor = Math.exp(-e.deltaY * 0.0025);
			M.viewScale = Math.max(0.15, Math.min(8, M.viewScale * factor));
			M.panX = cx - wx * M.viewScale;
			M.panY = cy - wy * M.viewScale;
			this._femRender();
		}, { passive: false });
		// 窗口尺寸变化 → 编辑画布自适应
		window.addEventListener('resize', () => {
			const M = this._fem;
			if (M && M.open) { this._femResizeCanvas(); this._femRender(); }
		});
		// 快捷键：ESC 逐级退出 / Enter 闭合折线 / Delete 删除选中房间
		window.addEventListener('keydown', (e) => {
			const M = this._fem;
			if (!M || !M.open) return;
			if (e.key === 'Escape') {
				if (M.drawMode) { M.drawMode = null; M.currentPoints = []; M.rectStart = null; this._femSyncModeButtons(); this._femRender(); }
				else if (M.selectedRoom) { M.selectedRoom = null; this._femHideRoomPanel(); this._femRender(); }
				else this.closeFloorEditModal(false);
			} else if (e.key === 'Enter' && M.drawMode === 'poly') {
				this._femFinishPoly();
			} else if ((e.key === 'Delete' || e.key === 'Backspace') && M.selectedRoom && e.target && !/input|textarea|select/i.test(e.target.tagName)) {
				e.preventDefault();
				this._femDeleteSelectedRoom();
			}
		});
	},

	/* ============================================================
	 * ★ 编辑画布尺寸自适应（含 DPR 高清渲染）
	 * ============================================================ */
	_femResizeCanvas: function () {
		const c = document.getElementById('femCanvas');
		const wrap = document.getElementById('femCanvasWrap');
		if (!c || !wrap) return;
		const w = Math.max(50, wrap.clientWidth);
		const h = Math.max(50, wrap.clientHeight);
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		c.width = Math.round(w * dpr);
		c.height = Math.round(h * dpr);
		c._cw = w; c._ch = h; c._dpr = dpr;
	},

	/* ============================================================
	 * ★ 事件坐标 → 编辑画布世界坐标
	 * ============================================================ */
	_femGetPos: function (e) {
		const c = document.getElementById('femCanvas');
		const M = this._fem;
		const rect = c.getBoundingClientRect();
		const pt = (e.touches && e.touches[0]) ? e.touches[0] : ((e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : e);
		const x = (pt.clientX - rect.left) * (c._cw / Math.max(1, rect.width));
		const y = (pt.clientY - rect.top) * (c._ch / Math.max(1, rect.height));
		return { x: (x - M.panX) / M.viewScale, y: (y - M.panY) / M.viewScale };
	},

	/* ============================================================
	 * ★ 命中检测：顶点 > 边 > 房间（后绘制的房间优先）
	 * ============================================================ */
	_femHitTest: function (pos) {
		const M = this._fem;
		const shapes = this.floorShapes[this.currentFloor] || [];
		const hitR = 14 / M.viewScale;
		const edgeR = 10 / M.viewScale;
		for (let s = 0; s < shapes.length; s++) {
			const shape = shapes[s];
			for (let p = 0; p < shape.length; p++) {
				if (Math.hypot(pos.x - shape[p].x, pos.y - shape[p].y) < hitR) {
					return { type: 'point', shapeIndex: s, pointIndex: p };
				}
			}
		}
		for (let s = 0; s < shapes.length; s++) {
			const shape = shapes[s];
			for (let i = 0; i < shape.length; i++) {
				const p1 = shape[i], p2 = shape[(i + 1) % shape.length];
				if (this.pointToLineDist(pos, p1, p2) < edgeR) {
					return { type: 'edge', shapeIndex: s, p1Index: i, p2Index: (i + 1) % shape.length };
				}
			}
		}
		for (let s = shapes.length - 1; s >= 0; s--) {
			if (this.pointInPolygon(pos, shapes[s])) {
				return { type: 'room', shapeIndex: s };
			}
		}
		return null;
	},

	/* ============================================================
	 * ★★★ 优化2：编辑窗口渲染（网格锚定原点，与主画布完全一致） ★★★
	 * ============================================================ */
	_femRender: function () {
		const M = this._fem;
		const c = document.getElementById('femCanvas');
		if (!c || !M || !M.open) return;
		const ctx = c.getContext('2d');
		const dpr = c._dpr || 1;
		const w = c._cw, h = c._ch;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.fillStyle = '#0d0d17';
		ctx.fillRect(0, 0, w, h);
		ctx.save();
		ctx.translate(M.panX, M.panY);
		ctx.scale(M.viewScale, M.viewScale);
		const inv = 1 / M.viewScale;
		/* ★ 网格锚定原点：线 = origin + k*gridSize，原点必为顶点 */
		const origin = this.getOrigin2D();
		let gridSize = 20;
		while (gridSize * M.viewScale < 14) gridSize *= 2;
		while (gridSize * M.viewScale > 90) gridSize /= 2;
		const wl = -M.panX / M.viewScale, wt = -M.panY / M.viewScale;
		const wr = wl + w / M.viewScale, wb = wt + h / M.viewScale;
		const EPS = 1e-9;
		const kStartX = Math.ceil((wl - origin.x) / gridSize - EPS);
		const kEndX = Math.floor((wr - origin.x) / gridSize + EPS);
		const kStartY = Math.ceil((wt - origin.y) / gridSize - EPS);
		const kEndY = Math.floor((wb - origin.y) / gridSize + EPS);
		ctx.strokeStyle = '#1a1a2e';
		ctx.lineWidth = 1 * inv;
		ctx.beginPath();
		for (let k = kStartX; k <= kEndX; k++) {
			const x = origin.x + k * gridSize;
			ctx.moveTo(x, wt); ctx.lineTo(x, wb);
		}
		for (let k = kStartY; k <= kEndY; k++) {
			const y = origin.y + k * gridSize;
			ctx.moveTo(wl, y); ctx.lineTo(wr, y);
		}
		ctx.stroke();
		/* ★ 穿过原点的两条主轴线（高亮） */
		ctx.strokeStyle = 'rgba(76,201,240,0.22)';
		ctx.lineWidth = 1.2 * inv;
		ctx.beginPath();
		ctx.moveTo(origin.x, wt); ctx.lineTo(origin.x, wb);
		ctx.moveTo(wl, origin.y); ctx.lineTo(wr, origin.y);
		ctx.stroke();
		// 房间填充
		const shapes = this.floorShapes[this.currentFloor] || [];
		const defaultFloorColor = (document.getElementById('floorColor') && document.getElementById('floorColor').value) || '#505050';
		shapes.forEach((shape, idx) => {
			if (shape.length < 3) return;
			const rc = (this.roomColors[this.currentFloor] && this.roomColors[this.currentFloor][idx]) || defaultFloorColor;
			const sel = M.selectedRoom && M.selectedRoom.roomIdx === idx;
			ctx.fillStyle = this._hexToRgba(rc, sel ? 0.5 : 0.26);
			ctx.beginPath();
			ctx.moveTo(shape[0].x, shape[0].y);
			for (let i = 1; i < shape.length; i++) ctx.lineTo(shape[i].x, shape[i].y);
			ctx.closePath(); ctx.fill();
			if (sel) {
				ctx.save();
				ctx.strokeStyle = 'rgba(76,201,240,0.95)';
				ctx.lineWidth = 3 * inv;
				ctx.shadowColor = '#4cc9f0';
				ctx.shadowBlur = 14 * M.viewScale;
				ctx.stroke();
				ctx.restore();
			}
		});
		// 合并墙线
		const merged = this._getMergedWallSegments(this.currentFloor);
		ctx.strokeStyle = '#4361ee';
		ctx.lineWidth = 2 * inv;
		merged.forEach(seg => {
			ctx.beginPath();
			ctx.moveTo(seg.p1.x, seg.p1.y);
			ctx.lineTo(seg.p2.x, seg.p2.y);
			ctx.stroke();
		});
		// ★ 3D 原点标记（位于网格顶点上，与主画布/三维场景一致）
		this._femDrawOrigin(ctx, inv);
		// 房间标签 + 顶点
		shapes.forEach((shape, idx) => {
			if (shape.length < 3) return;
			let cx = 0, cy = 0;
			shape.forEach(p => { cx += p.x; cy += p.y; });
			ctx.fillStyle = '#fff';
			ctx.font = `${11 * inv}px Arial`;
			ctx.fillText(`房间${idx + 1}`, cx / shape.length - 16 * inv, cy / shape.length + 4 * inv);
			ctx.fillStyle = '#f72585';
			shape.forEach(p => {
				ctx.beginPath();
				ctx.arc(p.x, p.y, 4.5 * inv, 0, Math.PI * 2);
				ctx.fill();
			});
		});
		// 绘制中的临时图形
		if (M.currentPoints.length > 0) {
			ctx.strokeStyle = '#4cc9f0';
			ctx.lineWidth = 2 * inv;
			ctx.beginPath();
			ctx.moveTo(M.currentPoints[0].x, M.currentPoints[0].y);
			for (let i = 1; i < M.currentPoints.length; i++) ctx.lineTo(M.currentPoints[i].x, M.currentPoints[i].y);
			if (M.drawMode === 'rect') ctx.closePath();
			ctx.stroke();
			ctx.fillStyle = '#4cc9f0';
			M.currentPoints.forEach(p => {
				ctx.beginPath(); ctx.arc(p.x, p.y, 4 * inv, 0, Math.PI * 2); ctx.fill();
			});
			if (M.drawMode === 'poly' && M.currentPoints.length >= 3) {
				const st = M.currentPoints[0];
				ctx.strokeStyle = 'rgba(46,204,113,0.9)';
				ctx.lineWidth = 2 * inv;
				ctx.beginPath(); ctx.arc(st.x, st.y, 12 * inv, 0, Math.PI * 2); ctx.stroke();
			}
		}
		ctx.restore();
		// HUD
		ctx.fillStyle = 'rgba(76,201,240,0.16)';
		ctx.fillRect(6, 6, 250, 20);
		ctx.fillStyle = '#4cc9f0';
		ctx.font = 'bold 10px Arial';
		const modeName = { edit: '✏️ 编辑', move: '✥ 移动', scale: '⤢ 缩放' }[M.mode] || M.mode;
		const drawName = M.drawMode === 'rect' ? ' · 矩形绘制中(拖动)' : (M.drawMode === 'poly' ? ` · 折线绘制中(${M.currentPoints.length}点)` : '');
		ctx.fillText(`第${this.currentFloor + 1}层 · ${modeName}${drawName} · ${(M.viewScale * 100).toFixed(0)}%`, 10, 20);
		ctx.fillStyle = 'rgba(255,255,255,0.55)';
		ctx.font = '10px Arial';
		ctx.fillText('双击空白=视图复位 · 点击房间=地板贴图设置 · ⌖=3D原点(网格顶点)', 10, h - 10);
	},

/* ============================================================
 * ★★★ 优化2：编辑窗口内的 3D 原点标记 ★★★
 *  坐标取自 getOrigin2D()，与主画布标记、generate3D 三方一致
 * ============================================================ */
	_femDrawOrigin: function (ctx, inv) {
		if (!ctx) return;
		const o = this.getOrigin2D();
		const ox = o.x, oy = o.y;
		ctx.save();
		// 网格顶点高亮框
		ctx.strokeStyle = 'rgba(255,82,82,0.55)';
		ctx.lineWidth = 1.2 * inv;
		const v = 4.5 * inv;
		ctx.beginPath();
		ctx.moveTo(ox - v, oy - v);
		ctx.lineTo(ox + v, oy - v);
		ctx.lineTo(ox + v, oy + v);
		ctx.lineTo(ox - v, oy + v);
		ctx.closePath();
		ctx.stroke();
		// 十字轴
		ctx.strokeStyle = 'rgba(255,82,82,0.9)';
		ctx.lineWidth = 1.5 * inv;
		const arm = 14 * inv;
		ctx.beginPath();
		ctx.moveTo(ox - arm, oy); ctx.lineTo(ox + arm, oy);
		ctx.moveTo(ox, oy - arm); ctx.lineTo(ox, oy + arm);
		ctx.stroke();
		// 圆环 + 中心点
		ctx.beginPath(); ctx.arc(ox, oy, 6 * inv, 0, Math.PI * 2);
		ctx.strokeStyle = '#ff5252'; ctx.lineWidth = 2 * inv; ctx.stroke();
		ctx.fillStyle = '#ff5252';
		ctx.beginPath(); ctx.arc(ox, oy, 2 * inv, 0, Math.PI * 2); ctx.fill();
		// 标签
		ctx.fillStyle = 'rgba(255,82,82,0.95)';
		ctx.font = `${10 * inv}px Arial`;
		ctx.fillText('⌖ 3D原点(0,0)·网格顶点', ox + 9 * inv, oy - 8 * inv);
		ctx.restore();
	},


	/* ============================================================
	 * ★ 按下：双指捏合 / 绘制加点 / 各模式命中分发
	 * ============================================================ */
	_femOnDown: function (e) {
		const M = this._fem;
		if (!M || !M.open) return;
		// 双指 → 进入捏合缩放
		if (e.touches && e.touches.length === 2) {
			const t1 = e.touches[0], t2 = e.touches[1];
			M.pinch = {
				dist: Math.max(1, Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)),
				cx: (t1.clientX + t2.clientX) / 2,
				cy: (t1.clientY + t2.clientY) / 2,
				scale: M.viewScale, panX: M.panX, panY: M.panY
			};
			M.dragTarget = null;
			return;
		}
		const pt = (e.touches && e.touches[0]) ? e.touches[0] : e;
		M.downClientX = pt.clientX;
		M.downClientY = pt.clientY;
		M.moved = false;
		const pos = this._femGetPos(e);
		// 矩形绘制：记录起点
		if (M.drawMode === 'rect') {
			M.rectStart = pos;
			M.currentPoints = [{ x: pos.x, y: pos.y }, { x: pos.x, y: pos.y }, { x: pos.x, y: pos.y }, { x: pos.x, y: pos.y }];
			this._femRender();
			return;
		}
		// 折线绘制：加点 / 点起点附近闭合
		if (M.drawMode === 'poly') {
			if (M.currentPoints.length >= 3) {
				const st = M.currentPoints[0];
				if (Math.hypot(pos.x - st.x, pos.y - st.y) < 20 / M.viewScale) { this._femFinishPoly(); return; }
			}
			if (M.currentPoints.length > 0) {
				const last = M.currentPoints[M.currentPoints.length - 1];
				if (Math.abs(pos.x - last.x) < Math.abs(pos.y - last.y)) pos.x = last.x;
				else pos.y = last.y;
			}
			M.currentPoints.push({ x: pos.x, y: pos.y });
			this._femRender();
			return;
		}
		const hit = this._femHitTest(pos);
		if (M.mode === 'edit') {
			if (hit && hit.type === 'point') {
				M.dragTarget = { type: 'point', shapeIndex: hit.shapeIndex, pointIndex: hit.pointIndex };
			} else if (hit && hit.type === 'edge') {
				M.dragTarget = { type: 'edge', shapeIndex: hit.shapeIndex, p1Index: hit.p1Index, p2Index: hit.p2Index, lastMouse: pos };
			} else if (hit && hit.type === 'room') {
				// 选中房间：可拖动；若未拖动(tap)则在抬起时弹出贴图设置栏
				M.selectedRoom = { floorIdx: this.currentFloor, roomIdx: hit.shapeIndex };
				M.dragTarget = { type: 'room', shapeIndex: hit.shapeIndex, lastPos: pos };
				M.pendingRoomTap = hit.shapeIndex;
			} else {
				// 空白：双击复位视图 / 单指平移
				const now = Date.now();
				if (now - (M.lastPanTapT || 0) < 320 &&
					Math.hypot(pt.clientX - (M.lastPanTapX || -9999), pt.clientY - (M.lastPanTapY || -9999)) < 30) {
					M.lastPanTapT = 0;
					M.panX = 0; M.panY = 0; M.viewScale = 1;
					this._femRender();
					return;
				}
				M.lastPanTapT = now; M.lastPanTapX = pt.clientX; M.lastPanTapY = pt.clientY;
				M.dragTarget = { type: 'pan', startClientX: pt.clientX, startClientY: pt.clientY, startPanX: M.panX, startPanY: M.panY };
			}
		} else if (M.mode === 'move') {
			if (hit && hit.type === 'room') {
				M.selectedRoom = { floorIdx: this.currentFloor, roomIdx: hit.shapeIndex };
				M.dragTarget = { type: 'room', shapeIndex: hit.shapeIndex, lastPos: pos };
			} else {
				M.dragTarget = { type: 'allRooms', lastPos: pos };
			}
		} else if (M.mode === 'scale') {
			if (hit && hit.type === 'room') {
				M.selectedRoom = { floorIdx: this.currentFloor, roomIdx: hit.shapeIndex };
				M.dragTarget = { type: 'scaleRoom', shapeIndex: hit.shapeIndex, start: { x: pos.x, y: pos.y }, base: JSON.parse(JSON.stringify(this.floorShapes[this.currentFloor][hit.shapeIndex])) };
			} else {
				M.dragTarget = { type: 'scaleAll', start: { x: pos.x, y: pos.y }, base: JSON.parse(JSON.stringify(this.floorShapes[this.currentFloor] || [])) };
			}
		} else {
			M.dragTarget = { type: 'pan', startClientX: pt.clientX, startClientY: pt.clientY, startPanX: M.panX, startPanY: M.panY };
		}
		this._femRender();
	},

	/* ============================================================
	 * ★ 移动：捏合缩放 / 视图平移 / 顶点·边·房间编辑 / 整体移动·缩放
	 * ============================================================ */
	_femOnMove: function (e) {
		const M = this._fem;
		if (!M || !M.open) return;
		if (e.cancelable && (M.dragTarget || M.pinch || (M.drawMode === 'rect' && M.rectStart))) e.preventDefault();
		// 双指捏合：以两指中心为锚点缩放
		if (M.pinch && e.touches && e.touches.length === 2) {
			const t1 = e.touches[0], t2 = e.touches[1];
			const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
			const c = document.getElementById('femCanvas');
			const rect = c.getBoundingClientRect();
			const ncx = (t1.clientX + t2.clientX) / 2 - rect.left;
			const ncy = (t1.clientY + t2.clientY) / 2 - rect.top;
			const pcx = M.pinch.cx - rect.left, pcy = M.pinch.cy - rect.top;
			const ratio = Math.max(0.05, dist / Math.max(1, M.pinch.dist));
			const ns = Math.max(0.15, Math.min(8, M.pinch.scale * ratio));
			const wx = (pcx - M.pinch.panX) / M.pinch.scale;
			const wy = (pcy - M.pinch.panY) / M.pinch.scale;
			M.panX = ncx - wx * ns;
			M.panY = ncy - wy * ns;
			M.viewScale = ns;
			this._femRender();
			return;
		}
		// 矩形绘制预览
		if (!M.dragTarget) {
			if (M.drawMode === 'rect' && M.rectStart) {
				const pos = this._femGetPos(e);
				const s = M.rectStart;
				M.currentPoints = [{ x: s.x, y: s.y }, { x: pos.x, y: s.y }, { x: pos.x, y: pos.y }, { x: s.x, y: pos.y }];
				this._femRender();
			}
			return;
		}
		const c = document.getElementById('femCanvas');
		const dt = M.dragTarget;
		const pt = (e.touches && e.touches[0]) ? e.touches[0] : e;
		if (Math.hypot(pt.clientX - M.downClientX, pt.clientY - M.downClientY) > 6) M.moved = true;
		// 视图平移
		if (dt.type === 'pan') {
			const rect = c.getBoundingClientRect();
			const sx = c._cw / Math.max(1, rect.width);
			const sy = c._ch / Math.max(1, rect.height);
			M.panX = dt.startPanX + (pt.clientX - dt.startClientX) * sx;
			M.panY = dt.startPanY + (pt.clientY - dt.startClientY) * sy;
			this._femRender();
			return;
		}
		const pos = this._femGetPos(e);
		// 拖动顶点（带直角吸附，与主画布一致）
		if (dt.type === 'point') {
			const shape = this.floorShapes[this.currentFloor][dt.shapeIndex];
			if (!shape) return;
			const target = shape[dt.pointIndex];
			if (!target) return;
			let nx = pos.x, ny = pos.y;
			if (shape.length > 1) {
				const prev = shape[(dt.pointIndex - 1 + shape.length) % shape.length];
				if (Math.abs(pos.x - prev.x) < Math.abs(pos.y - prev.y)) nx = prev.x;
				else ny = prev.y;
			}
			target.x = nx; target.y = ny;
			delete this._wallMergeCache[this.currentFloor];
			this._femRender();
			return;
		}
		// 拖动整条边（保持水平/垂直属性）
		if (dt.type === 'edge') {
			const shape = this.floorShapes[this.currentFloor][dt.shapeIndex];
			if (!shape) return;
			const p1 = shape[dt.p1Index], p2 = shape[dt.p2Index];
			if (!p1 || !p2) return;
			const isHorizontal = Math.abs(p1.x - p2.x) > Math.abs(p1.y - p2.y);
			const last = dt.lastMouse || pos;
			let mx = pos.x - last.x, my = pos.y - last.y;
			if (isHorizontal) mx = 0; else my = 0;
			p1.x += mx; p1.y += my;
			p2.x += mx; p2.y += my;
			dt.lastMouse = pos;
			delete this._wallMergeCache[this.currentFloor];
			this._femRender();
			return;
		}
		// 拖动整个房间
		if (dt.type === 'room') {
			const shape = this.floorShapes[this.currentFloor][dt.shapeIndex];
			if (!shape) return;
			const dx = pos.x - dt.lastPos.x, dy = pos.y - dt.lastPos.y;
			shape.forEach(p => { p.x += dx; p.y += dy; });
			dt.lastPos = pos;
			delete this._wallMergeCache[this.currentFloor];
			this._femRender();
			return;
		}
		// 整层平移
		if (dt.type === 'allRooms') {
			const shapes = this.floorShapes[this.currentFloor] || [];
			const dx = pos.x - dt.lastPos.x, dy = pos.y - dt.lastPos.y;
			shapes.forEach(sh => sh.forEach(p => { p.x += dx; p.y += dy; }));
			dt.lastPos = pos;
			delete this._wallMergeCache[this.currentFloor];
			this._femRender();
			return;
		}
		// 围绕包围盒中心缩放（单房间 / 整层）
		if (dt.type === 'scaleRoom' || dt.type === 'scaleAll') {
			const isRoom = (dt.type === 'scaleRoom');
			const baseShapes = isRoom ? [dt.base] : dt.base;
			const liveShapes = isRoom
				? [this.floorShapes[this.currentFloor][dt.shapeIndex]]
				: (this.floorShapes[this.currentFloor] || []);
			let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
			baseShapes.forEach(sh => (sh || []).forEach(p => {
				if (p.x < minX) minX = p.x;
				if (p.x > maxX) maxX = p.x;
				if (p.y < minY) minY = p.y;
				if (p.y > maxY) maxY = p.y;
			}));
			if (!isFinite(minX)) return;
			const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
			const d0 = Math.max(1, Math.hypot(dt.start.x - cx, dt.start.y - cy));
			const d1 = Math.hypot(pos.x - cx, pos.y - cy);
			const k = Math.max(0.1, Math.min(12, d1 / d0));
			for (let i = 0; i < liveShapes.length; i++) {
				const live = liveShapes[i], base = baseShapes[i];
				if (!live || !base) continue;
				for (let j = 0; j < live.length && j < base.length; j++) {
					live[j].x = cx + (base[j].x - cx) * k;
					live[j].y = cy + (base[j].y - cy) * k;
				}
			}
			delete this._wallMergeCache[this.currentFloor];
			this._femRender();
			return;
		}
	},

	/* ============================================================
	 * ★ 抬起：完成矩形 / tap房间 → 弹出地板贴图设置栏
	 * ============================================================ */
	_femOnUp: function (e) {
		const M = this._fem;
		if (!M || !M.open) return;
		if (M.pinch) { M.pinch = null; M.dragTarget = null; return; }
		// 完成矩形房间
		if (M.drawMode === 'rect' && M.rectStart) {
			const pts = M.currentPoints;
			if (pts.length === 4 &&
				Math.abs(pts[0].x - pts[2].x) > 20 / M.viewScale &&
				Math.abs(pts[0].y - pts[2].y) > 20 / M.viewScale) {
				this.floorShapes[this.currentFloor].push(JSON.parse(JSON.stringify(pts)));
				delete this._wallMergeCache[this.currentFloor];
				this.saveSystem.showToast('✅ 已添加矩形房间');
			}
			M.rectStart = null;
			M.currentPoints = [];
			M.drawMode = null;
			this._femSyncModeButtons();
			this._femRender();
			return;
		}
		// 编辑模式 tap 房间（未拖动）→ 打开该房间独立贴图设置栏
		if (M.dragTarget && M.dragTarget.type === 'room' && !M.moved && M.pendingRoomTap !== undefined) {
			M.selectedRoom = { floorIdx: this.currentFloor, roomIdx: M.pendingRoomTap };
			this._femShowRoomPanel();
		}
		M.pendingRoomTap = undefined;
		M.dragTarget = null;
		this._femRender();
	},

	/* ============================================================
	 * ★ 工具栏按钮状态同步
	 * ============================================================ */
	_femSyncModeButtons: function () {
		const M = this._fem;
		const bar = document.getElementById('femTools');
		if (!bar || !M) return;
		bar.querySelectorAll('button[data-fem-mode]').forEach(b => {
			b.classList.toggle('active', !M.drawMode && b.getAttribute('data-fem-mode') === M.mode);
		});
		const rectBtn = bar.querySelector('[data-fem-act="rect"]');
		const polyBtn = bar.querySelector('[data-fem-act="poly"]');
		const closeBtn = bar.querySelector('[data-fem-act="closepoly"]');
		if (rectBtn) rectBtn.classList.toggle('active', M.drawMode === 'rect');
		if (polyBtn) polyBtn.classList.toggle('active', M.drawMode === 'poly');
		if (closeBtn) closeBtn.style.display = (M.drawMode === 'poly') ? '' : 'none';
	},

	/* ============================================================
	 * ★ 视图居中（以 getOrigin2D + 房间包围盒为基准，保证原点可见）
	 * ============================================================ */
	_femCenterView: function () {
		const M = this._fem;
		const c = document.getElementById('femCanvas');
		if (!c || !M) return;
		const shapes = this.floorShapes[this.currentFloor] || [];
		/* ★ 优化2：以统一原点为初始包围盒种子，确保居中后原点必在视口内 */
		const o = this.getOrigin2D();
		let minX = o.x, minY = o.y, maxX = o.x, maxY = o.y;
		shapes.forEach(sh => sh.forEach(p => {
			if (p.x < minX) minX = p.x;
			if (p.x > maxX) maxX = p.x;
			if (p.y < minY) minY = p.y;
			if (p.y > maxY) maxY = p.y;
		}));
		const cw = c._cw || c.clientWidth || 300;
		const ch = c._ch || c.clientHeight || 300;
		const w = Math.max(50, maxX - minX), h = Math.max(50, maxY - minY);
		const s = Math.max(0.15, Math.min(8, Math.min((cw * 0.78) / w, (ch * 0.78) / h)));
		M.viewScale = s;
		M.panX = cw / 2 - ((minX + maxX) / 2) * s;
		M.panY = ch / 2 - ((minY + maxY) / 2) * s;
		this._femRender();
	},


	/* ============================================================
	 * ★ 新增房间：矩形 / 折线
	 * ============================================================ */
	_femStartRect: function () {
		const M = this._fem;
		M.drawMode = 'rect';
		M.currentPoints = [];
		M.rectStart = null;
		M.selectedRoom = null;
		this._femHideRoomPanel();
		this._femSyncModeButtons();
		this.saveSystem.showToast('🟦 在画布上按住拖动, 绘制矩形房间');
	},
	_femStartPoly: function () {
		const M = this._fem;
		M.drawMode = 'poly';
		M.currentPoints = [];
		M.rectStart = null;
		M.selectedRoom = null;
		this._femHideRoomPanel();
		this._femSyncModeButtons();
		this.saveSystem.showToast('📐 点击画布加点, 点起点绿圈或「✅ 闭合」完成');
	},
	_femFinishPoly: function () {
		const M = this._fem;
		if (M.currentPoints.length >= 3) {
			this.floorShapes[this.currentFloor].push(JSON.parse(JSON.stringify(M.currentPoints)));
			delete this._wallMergeCache[this.currentFloor];
			this.saveSystem.showToast(`✅ 已添加房间 (${M.currentPoints.length} 边形)`);
		} else {
			this.saveSystem.showToast('⚠️ 至少需要 3 个点');
		}
		M.currentPoints = [];
		M.drawMode = null;
		this._femSyncModeButtons();
		this._femRender();
	},

	/* ============================================================
	 * ★★★ 删除选中房间（针对性删除 + 提示框置顶 + 实时刷新 2D/3D）
	 *
	 * 修复要点：
	 *  ① 使用 _femConfirm（z-index 2200），不会被 #floorEditModal(1600) 遮挡
	 *  ② 只删除 M.selectedRoom 指定的房间，其他房间不受影响
	 *  ③ 同步迁移 roomColors / roomTextures / _roomTextureScale（贴图缩放键）
	 *  ④ 清空 _wallMergeCache / _doorCache 对应层缓存
	 *  ⑤ 立即调用 generate3D() + render2D() 实时刷新主画布与三维场景
	 *  ⑥ 静默持久化，用户点"完成并退出"时不会丢数据
	 * ============================================================ */
	_femDeleteSelectedRoom: function () {
	  const M = this._fem;
	  if (!M || !M.open) return;

	  // ---- 前置校验：必须先选中一个房间 ----
	  if (!M.selectedRoom) {
		this.saveSystem.showToast('⚠️ 请先点击画布中的房间，再点删除');
		return;
	  }

	  const floorIdx = this.currentFloor;
	  const idx = M.selectedRoom.roomIdx;
	  const shapes = this.floorShapes[floorIdx] || [];

	  if (idx < 0 || idx >= shapes.length) {
		this.saveSystem.showToast('⚠️ 选中的房间不存在，请重新点击');
		M.selectedRoom = null;
		this._femHideRoomPanel();
		this._femRender();
		return;
	  }

	  // ---- 弹出置顶确认框 ----
	  this._femConfirm(
		`确定删除 第${floorIdx + 1}层 · 房间${idx + 1}？\n\n` +
		`· 将同时移除该房间的地板颜色 / 贴图 / 贴图缩放\n` +
		`· 后续房间编号会自动前移\n` +
		`· 3D 场景会立即刷新`,
		() => {
		  // 二次校验（防止确认过程中数据被外部修改）
		  const liveShapes = this.floorShapes[floorIdx] || [];
		  if (idx < 0 || idx >= liveShapes.length) {
			this.saveSystem.showToast('⚠️ 房间已变更，请重新选择');
			M.selectedRoom = null;
			this._femHideRoomPanel();
			this._femRender();
			return;
		  }

		  // ============ ① 从楼层数组中移除目标房间 ============
		  liveShapes.splice(idx, 1);

		  // ============ ② 数字键索引前移（roomColors / roomTextures） ============
		  const remapNumericKeys = (obj) => {
			if (!obj || !obj[floorIdx]) return;
			const src = obj[floorIdx];
			const out = {};
			Object.keys(src).forEach(k => {
			  const ki = parseInt(k, 10);
			  if (isNaN(ki)) { out[k] = src[k]; return; }
			  if (ki === idx) return;                     // 丢弃被删房间
			  out[ki > idx ? ki - 1 : ki] = src[k];       // 后续前移一位
			});
			obj[floorIdx] = out;
		  };
		  remapNumericKeys(this.roomColors);
		  remapNumericKeys(this.roomTextures);

		  // ============ ③ 贴图缩放键 roomTexScale_${floor}_${room} 同步迁移 ============
		  if (this._roomTextureScale && typeof this._roomTextureScale === 'object') {
			const srcScale = this._roomTextureScale;
			const outScale = {};
			Object.keys(srcScale).forEach(k => {
			  const m = k.match(/^roomTexScale_(\d+)_(\d+)$/);
			  if (!m) { outScale[k] = srcScale[k]; return; }          // 非本规则键原样保留
			  const fi = parseInt(m[1], 10);
			  const ri = parseInt(m[2], 10);
			  if (fi !== floorIdx) { outScale[k] = srcScale[k]; return; } // 非本层原样保留
			  if (ri === idx) return;                                  // 被删房间键丢弃
			  const nri = ri > idx ? ri - 1 : ri;                      // 后续房间前移
			  outScale[`roomTexScale_${fi}_${nri}`] = srcScale[k];
			});
			this._roomTextureScale = outScale;
		  }

		  // ============ ④ 清理缓存（保证 3D 用新数据重建墙体） ============
		  delete this._wallMergeCache[floorIdx];
		  if (!this._doorCache) this._doorCache = {};
		  delete this._doorCache[floorIdx];
		  this._doorCacheGen = (this._doorCacheGen || 0) + 1;

		  // ============ ⑤ 重置编辑窗口选中态 ============
		  M.selectedRoom = null;
		  M.pendingRoomTap = undefined;
		  M.dragTarget = null;
		  this._femHideRoomPanel();

		  // ============ ⑥ 刷新编辑窗口画布 + 标题 ============
		  this._femRender();
		  const title = document.getElementById('femFloorTitle');
		  if (title) {
			title.textContent =
			  `🗺️ 户型编辑 · 第${floorIdx + 1}层 (${liveShapes.length}个房间)`;
		  }

		  // ============ ⑦ ★ 实时刷新主画布 2D + 三维场景 ============
		  try { this.render2D(); }               catch (e) { console.warn('render2D 失败:', e); }
		  try { this.generate3D(); }             catch (e) { console.warn('generate3D 失败:', e); }
		  try { this.updateSceneVisibility(); }  catch (e) {}
		  try { this.updateFloorInfo(); }        catch (e) {}
		  try { this.refreshFloorModelList(); }  catch (e) {}

		  // ============ ⑧ 后台静默持久化，退出时不会丢失 ============
		  try { this.saveSystem.saveToDB(true); } catch (e) {}

		  // ============ ⑨ 用户反馈 ============
		  this.saveSystem.showToast(
			`🗑️ 已删除 第${floorIdx + 1}层 · 房间${idx + 1}，3D 场景已刷新`
		  );
		},
		// 取消回调（可选）
		() => {
		  // 保留选中态，用户可以重新点"删除"或另选房间
		}
	  );
	},
	/* ============================================================
	 * ★ 房间地板贴图设置栏（编辑窗口内，独立于主画布面板）
	 * ============================================================ */
	_femShowRoomPanel: function () {
		const M = this._fem;
		const panel = document.getElementById('femRoomPanel');
		if (!panel || !M || !M.selectedRoom) return;
		const { floorIdx, roomIdx } = M.selectedRoom;
		const t = document.getElementById('femRoomPanelTitle');
		if (t) t.textContent = `🏠 第${floorIdx + 1}层 · 房间${roomIdx + 1}`;
		const colorInput = document.getElementById('femRoomColor');
		const defaultFloorColor = (document.getElementById('floorColor') && document.getElementById('floorColor').value) || '#505050';
		if (colorInput) colorInput.value = (this.roomColors[floorIdx] && this.roomColors[floorIdx][roomIdx]) || defaultFloorColor;
		const scaleKey = `roomTexScale_${floorIdx}_${roomIdx}`;
		const scaleInput = document.getElementById('femRoomTexScale');
		if (scaleInput) scaleInput.value = (this._roomTextureScale && this._roomTextureScale[scaleKey]) || 1;
		panel.style.display = 'block';
	},
	_femHideRoomPanel: function () {
		const panel = document.getElementById('femRoomPanel');
		if (panel) panel.style.display = 'none';
	},
	_femHandleRoomTexture: function (input) {
		const M = this._fem;
		if (!input.files || !input.files[0]) return;
		if (!M || !M.selectedRoom) { this.saveSystem.showToast('⚠️ 请先点击一个房间'); input.value = ''; return; }
		const file = input.files[0];
		if (!file.type.startsWith('image/')) { this.saveSystem.showToast('⚠️ 请选择图片格式'); input.value = ''; return; }
		const { floorIdx, roomIdx } = M.selectedRoom;
		const img = new Image();
		img.onload = () => {
			const tex = new THREE.CanvasTexture(img);
			tex.image = img;
			tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
			tex.encoding = THREE.sRGBEncoding;
			const scaleKey = `roomTexScale_${floorIdx}_${roomIdx}`;
			const s = (this._roomTextureScale && this._roomTextureScale[scaleKey]) || 1;
			tex.repeat.set(s, s);
			if (!this.roomTextures[floorIdx]) this.roomTextures[floorIdx] = {};
			this.roomTextures[floorIdx][roomIdx] = tex;
			this._femRender();
			try { if (!this.isPlayMode) this.render2D(); } catch (err) {}
			this.saveSystem.showToast(`✅ 已应用房间贴图: ${file.name}`);
			this.saveSystem.saveToDB(true);
		};
		img.onerror = () => { this.saveSystem.showToast('❌ 图片加载失败'); };
		img.src = URL.createObjectURL(file);
		input.value = '';
	},


    _hexToRgba: function (hex, alpha) {
        try {
            let h = String(hex).replace('#', '');
            if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
            const r = parseInt(h.substr(0, 2), 16) || 80;
            const g = parseInt(h.substr(2, 2), 16) || 80;
            const b = parseInt(h.substr(4, 2), 16) || 80;
            return `rgba(${r},${g},${b},${alpha})`;
        } catch (e) { return `rgba(80,80,80,${alpha})`; }
    },

    _getMergedWallSegments: function (floorIdx) {
        if (this._wallMergeCache && this._wallMergeCache[floorIdx]) {
            return this._wallMergeCache[floorIdx];
        }

        const shapes = this.floorShapes[floorIdx] || [];
        const segments = [];

        for (let s = 0; s < shapes.length; s++) {
            const shape = shapes[s];
            if (shape.length < 2) continue;
            for (let i = 0; i < shape.length; i++) {
                const a = shape[i];
                const b = shape[(i + 1) % shape.length];
                if (!isFinite(a.x) || !isFinite(a.y) || !isFinite(b.x) || !isFinite(b.y)) continue;
                const len = Math.hypot(b.x - a.x, b.y - a.y);
                if (len < 0.5) continue;
                segments.push({ p1: { x: a.x, y: a.y }, p2: { x: b.x, y: b.y } });
            }
        }

        let changed = true;
        let iter = 0;
        const MAX_ITER = 100;
        while (changed && iter < MAX_ITER) {
            changed = false;
            iter++;
            for (let i = 0; i < segments.length; i++) {
                for (let j = i + 1; j < segments.length; j++) {
                    const merged = this._tryMergeSegments(segments[i], segments[j]);
                    if (merged) {
                        segments[i] = merged;
                        segments.splice(j, 1);
                        changed = true;
                        break;
                    }
                }
                if (changed) break;
            }
        }

        if (!this._wallMergeCache) this._wallMergeCache = {};
        this._wallMergeCache[floorIdx] = segments;
        return segments;
    },

    _tryMergeSegments: function (s1, s2) {
        const TOL = 1.5;
        const dx1 = s1.p2.x - s1.p1.x;
        const dy1 = s1.p2.y - s1.p1.y;
        const len1 = Math.hypot(dx1, dy1);
        if (len1 < 1e-6) return null;

        const dx2 = s2.p2.x - s2.p1.x;
        const dy2 = s2.p2.y - s2.p1.y;
        const len2 = Math.hypot(dx2, dy2);
        if (len2 < 1e-6) return null;

        const dir1 = { x: dx1 / len1, y: dy1 / len1 };
        const dir2 = { x: dx2 / len2, y: dy2 / len2 };
        const dot = dir1.x * dir2.x + dir1.y * dir2.y;
        if (Math.abs(Math.abs(dot) - 1) > 0.02) return null;

        const nx = -dir1.y;
        const ny = dir1.x;
        const d1 = (s2.p1.x - s1.p1.x) * nx + (s2.p1.y - s1.p1.y) * ny;
        const d2 = (s2.p2.x - s1.p1.x) * nx + (s2.p2.y - s1.p1.y) * ny;
        if (Math.abs(d1) > TOL || Math.abs(d2) > TOL) return null;

        const proj = (p) => (p.x - s1.p1.x) * dir1.x + (p.y - s1.p1.y) * dir1.y;
        const t1a = 0, t1b = len1;
        const t2a = proj(s2.p1), t2b = proj(s2.p2);
        const t2min = Math.min(t2a, t2b);
        const t2max = Math.max(t2a, t2b);

        const overlapStart = Math.max(t1a, t2min);
        const overlapEnd = Math.min(t1b, t2max);
        const gap = overlapStart - overlapEnd;
        if (gap > TOL) return null;

        const newStart = Math.min(t1a, t2min);
        const newEnd = Math.max(t1b, t2max);
        return {
            p1: { x: s1.p1.x + dir1.x * newStart, y: s1.p1.y + dir1.y * newStart },
            p2: { x: s1.p1.x + dir1.x * newEnd, y: s1.p1.y + dir1.y * newEnd }
        };
    },

    updateUIStatus: function () {
        const badge = document.getElementById('modeStatus');
        const btnStart = document.getElementById('btnStart');
        const btnRect = document.getElementById('btnRect');
        const btnClose = document.getElementById('btnClose');
        if (!badge) return;

        if (this.mode === 'drawing') {
            badge.innerText = '绘制中...'; badge.style.color = '#4cc9f0';
            if (btnStart) btnStart.disabled = true;
            if (btnRect) btnRect.disabled = true;
            if (btnClose) btnClose.disabled = false;
        } else if (this.mode === 'drawing_rect') {
            badge.innerText = '矩形中...'; badge.style.color = '#f7b731';
            if (btnStart) btnStart.disabled = true;
            if (btnRect) btnRect.disabled = true;
            if (btnClose) btnClose.disabled = true;
        } else if (this.mode === 'panning') {
            badge.innerText = '平移中...'; badge.style.color = '#4cc9f0';
            if (btnStart) btnStart.disabled = false;
            if (btnRect) btnRect.disabled = false;
            if (btnClose) btnClose.disabled = true;
        } else {
            badge.innerText = '编辑模式'; badge.style.color = '#aaa';
            if (btnStart) btnStart.disabled = false;
            if (btnRect) btnRect.disabled = false;
            if (btnClose) btnClose.disabled = true;
        }
    },

    /* ============================================================
     *  ★ 楼层管理
     * ============================================================ */
    addFloor: function () {
        this.floorShapes.push([]);
        this.floorHeights.push(parseFloat(document.getElementById('wallHeight').value) || 2.8);
        this.updateFloorSelect();
        this.updateFloorInfo();
        this.currentFloor = this.floorShapes.length - 1;
        this.updateFloorSelect();
        this.switchFloor(this.currentFloor);
        if (this.sysMenuReady) this.sysRenderSensorTab();
        this.dialog.alert(`已添加第${this.floorShapes.length}层`);
    },

    removeFloor: function () {
        if (this.floorShapes.length <= 1) { this.dialog.alert("至少需要保留一层"); return; }
        this.dialog.confirm(`确定删除第${parseInt(this.currentFloor) + 1}层？`, () => {
            const removedIdx = this.currentFloor;
            this.floorShapes.splice(removedIdx, 1);
            this.floorHeights.splice(removedIdx, 1);

            const remap = (obj) => {
                if (!obj || typeof obj !== 'object') return obj;
                const out = {};
                for (let k in obj) {
                    const ki = parseInt(k, 10);
                    if (isNaN(ki)) { out[k] = obj[k]; continue; }
                    if (ki === removedIdx) continue;
                    out[ki > removedIdx ? ki - 1 : ki] = obj[k];
                }
                return out;
            };

            app.roomColors = remap(app.roomColors);
            app.roomTextures = remap(app.roomTextures);

            if (this.currentFloor >= this.floorShapes.length) this.currentFloor = this.floorShapes.length - 1;

            this.furnitureGroup.children.forEach(obj => this.updateObjectFloorIndex(obj));
            this.updateFloorSelect();
            this.updateFloorInfo();
            this.syncFloorHeightUI();
            this._wallMergeCache = {};
            this.render2D();
            this.generate3D();
            if (this.sysMenuReady) this.sysRenderSensorTab();
        });
    },

    switchFloor: function (floorIndex) {
        this.currentFloor = parseInt(floorIndex);
        this.currentPoints = [];
        this.mode = 'idle';
        this.selectedRoom = null;
        if (this._roomPanelEl) this._roomPanelEl.style.display = 'none';
        this.updateUIStatus();
        this.render2D();
        this.syncFloorHeightUI();
        this.updateSceneVisibility();
        this.refreshFloorModelList();
    },

    updateFloorSelect: function () {
        const select = document.getElementById('currentFloor');
        if (!select) return;
        select.innerHTML = '';
        this.floorShapes.forEach((floor, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${index + 1}层`;
            if (index === this.currentFloor) option.selected = true;
            select.appendChild(option);
        });
        this.ensureFloorHeightUI();
        this.syncFloorHeightUI();
    },

    updateFloorInfo: function () {
        const el = document.getElementById('floorInfo');
        if (!el) return;
        const h = this.getWallHeight(this.currentFloor);
        const roomCount = (this.floorShapes[this.currentFloor] || []).length;
        el.innerHTML = `总楼层: ${this.floorShapes.length} | 当前: 第${this.currentFloor + 1}层 | 房间: ${roomCount} | 层高: ${h.toFixed(1)}m`;
    },

    getWallHeight: function (floorIdx) {
        let def = 2.8;
        const whInput = document.getElementById('wallHeight');
        if (whInput && whInput.value) {
            const v = parseFloat(whInput.value);
            if (isFinite(v) && v > 0) def = v;
        }
        if (floorIdx === undefined || floorIdx === null || floorIdx < 0) return def;
        if (!Array.isArray(this.floorHeights)) this.floorHeights = [];
        while (this.floorHeights.length <= floorIdx) this.floorHeights.push(def);
        const h = parseFloat(this.floorHeights[floorIdx]);
        return (isFinite(h) && h >= 1 && h <= 20) ? h : def;
    },

    getFloorBaseY: function (floorIdx) {
        let y = 0;
        const total = (floorIdx === undefined || floorIdx === null) ? this.floorShapes.length : Math.min(Math.max(0, floorIdx), this.floorShapes.length);
        for (let i = 0; i < total; i++) y += this.getWallHeight(i);
        return y;
    },

    floorIndexOfY: function (y) {
        if (!isFinite(y) || y < 0) return 0;
        let acc = 0;
        for (let i = 0; i < this.floorShapes.length; i++) {
            const h = this.getWallHeight(i);
            if (y < acc + h - 0.001) return i;
            acc += h;
        }
        return Math.max(0, this.floorShapes.length - 1);
    },

    initFloorHeights: function () {
        if (!Array.isArray(this.floorHeights)) this.floorHeights = [];
        let def = 2.8;
        const whInput = document.getElementById('wallHeight');
        if (whInput && whInput.value) {
            const v = parseFloat(whInput.value);
            if (isFinite(v) && v > 0) def = v;
        }
        while (this.floorHeights.length < this.floorShapes.length) this.floorHeights.push(def);
        if (this.floorHeights.length > this.floorShapes.length) this.floorHeights.length = this.floorShapes.length;
        for (let i = 0; i < this.floorHeights.length; i++) {
            const h = parseFloat(this.floorHeights[i]);
            if (!isFinite(h) || h < 1 || h > 20) this.floorHeights[i] = def;
        }
        return this.floorHeights;
    },

    ensureFloorHeightUI: function () {
        if (document.getElementById('floorHeightPanel')) return;
        const floorSel = document.getElementById('currentFloor');
        if (!floorSel) return;

        let hostPanel = floorSel.parentNode;
        while (hostPanel && hostPanel.classList && !hostPanel.classList.contains('panel-group')) {
            hostPanel = hostPanel.parentNode;
            if (!hostPanel || hostPanel === document) break;
        }
        if (!hostPanel || hostPanel === document || !hostPanel.classList) hostPanel = floorSel.parentNode;

        const panel = document.createElement('div');
        panel.className = 'panel-group';
        panel.id = 'floorHeightPanel';
        panel.innerHTML =
            `<div class="group-title">🏢 楼层层高调节 <span style="font-size:0.6rem;color:#888;">第<b id="fhFloorNo">${this.currentFloor + 1}</b>层</span></div>` +
            `<div style="font-size:0.6rem;color:#888;margin-bottom:6px;line-height:1.5;">调节当前楼层高度, 墙体/天花板自动重建；灯具位置完全由用户自行定位，不会被自动吸附。</div>` +
            `<div class="control-item">` +
            `<label>当前层层高: <span id="floorHeightLabel" style="color:var(--accent);font-weight:bold;">2.8</span> m</label>` +
            `<div class="input-group">` +
            `<input type="range" id="floorHeightRange" min="1.2" max="10" step="0.1" value="2.8">` +
            `<input type="number" id="floorHeightNum" min="1.2" max="10" step="0.1" value="2.8" style="width:58px;">` +
            `</div></div>` +
            `<div class="btn-row" style="margin-top:4px;">` +
            `<button id="fhApplyAll" style="flex:2;">⬇ 同步到全部楼层</button>` +
            `<button id="fhReset" style="flex:1;">↺ 还原</button>` +
            `</div>`;

        if (hostPanel !== floorSel.parentNode && hostPanel.parentNode)
            hostPanel.parentNode.insertBefore(panel, hostPanel.nextSibling);
        else floorSel.parentNode.appendChild(panel);

        const range = document.getElementById('floorHeightRange');
        const num = document.getElementById('floorHeightNum');

        const apply = (v, from) => {
            const h = parseFloat(v);
            if (!isFinite(h)) return;
            if (from === 'range' && num && document.activeElement !== num) num.value = h;
            if (from === 'num' && range && document.activeElement !== range) range.value = h;
            this.setFloorHeight(this.currentFloor, h);
        };

        range.addEventListener('input', () => apply(range.value, 'range'));
        num.addEventListener('change', () => apply(num.value, 'num'));

        document.getElementById('fhApplyAll').onclick = () => {
            const h = this.getWallHeight(this.currentFloor);
            this.dialog.confirm(`将第${this.currentFloor + 1}层的层高 ${h.toFixed(1)}m 同步应用到所有楼层？\n(各层物体将保持层内相对位置；所有灯具均不会被自动吸附)`, () => {
                const shifts = [];
                this.furnitureGroup.children.forEach(o => {
                    if (!o.userData) return;
                    const fi = (o.userData.floorIndex !== undefined && o.userData.floorIndex !== null) ? o.userData.floorIndex : this.floorIndexOfY(o.position.y);
                    shifts.push({
                        obj: o, fi: fi,
                        rel: o.position.y - this.getFloorBaseY(fi)
                    });
                });

                for (let i = 0; i < this.floorShapes.length; i++) this.floorHeights[i] = h;

                shifts.forEach(s => {
                    const base = this.getFloorBaseY(s.fi);
                    s.obj.position.y = base + Math.max(0, s.rel);
                });

                this.furnitureGroup.children.forEach(o => this.updateObjectFloorIndex(o));
                this._doorCache = {};
                this.generate3D();
                this.updateSceneVisibility();
                if (this.isPlayMode) this.showFloorInPlayMode(this.playModeFloor);
                this.updateFloorInfo();
                this.refreshFloorModelList();
                this.saveSystem.saveToDB(true);
                this.saveSystem.showToast('✅ 已同步全部楼层层高为 ' + h.toFixed(1) + 'm');
            });
        };

        document.getElementById('fhReset').onclick = () => {
            const def = parseFloat(document.getElementById('wallHeight').value) || 2.8;
            this.setFloorHeight(this.currentFloor, def);
            this.saveSystem.showToast('↺ 当前层层高已还原为 ' + def.toFixed(1) + 'm');
        };
    },

    syncFloorHeightUI: function () {
        const r = document.getElementById('floorHeightRange');
        const n = document.getElementById('floorHeightNum');
        const lbl = document.getElementById('floorHeightLabel');
        const no = document.getElementById('fhFloorNo');
        const h = this.getWallHeight(this.currentFloor);
        if (r && document.activeElement !== r) r.value = h;
        if (n && document.activeElement !== n) n.value = h.toFixed(1);
        if (lbl) lbl.textContent = h.toFixed(1);
        if (no) no.textContent = this.currentFloor + 1;
    },

    setFloorHeight: function (floorIdx, h) {
        h = parseFloat(h);
        if (!isFinite(h)) return;
        h = Math.max(1.2, Math.min(12, h));
        if (floorIdx < 0 || floorIdx >= this.floorShapes.length) return;

        this.initFloorHeights();
        const oldH = this.getWallHeight(floorIdx);
        if (Math.abs(oldH - h) < 0.001) { this.syncFloorHeightUI(); return; }

        const oldBase = this.getFloorBaseY(floorIdx);
        this.floorHeights[floorIdx] = h;
        const newBase = this.getFloorBaseY(floorIdx);

        this.furnitureGroup.children.forEach(obj => {
            const d = obj.userData;
            if (!d) return;
            const fi = (d.floorIndex !== undefined && d.floorIndex !== null) ? d.floorIndex : this.floorIndexOfY(obj.position.y);
            if (fi !== floorIdx) return;
            const rel = obj.position.y - oldBase;
            obj.position.y = newBase + Math.max(0, rel);
        });

        this._doorCache = {};
        this.generate3D();
        this.updateFloorInfo();
        this.updateSceneVisibility();
        if (this.isPlayMode) { this.showFloorInPlayMode(this.playModeFloor); this.createLabels(); }
        this.refreshFloorModelList();
        this.syncFloorHeightUI();
        this.saveSystem.saveToDB(true);
    },

    _snapCeilingLights: function () { return; },

    hideLegacyPropPanels: function () {
        const propPanel = document.getElementById('propPanel');
        if (propPanel) propPanel.style.display = 'none';
        const mc = document.getElementById('materialControls');
        if (mc) mc.classList.remove('active');
        const ac = document.getElementById('animControls');
        if (ac) ac.classList.remove('active');
    },

    _bindGlobalWallHeightInput: function () {
        const whInput = document.getElementById('wallHeight');
        if (!whInput || whInput.dataset.fhBound) return;
        whInput.dataset.fhBound = '1';
        whInput.addEventListener('change', () => {
            const v = parseFloat(whInput.value) || 2.8;
            for (let i = 0; i < this.floorShapes.length; i++) {
                if (this.floorHeights[i] === undefined || this.floorHeights[i] === null) this.floorHeights[i] = v;
            }
            this._doorCache = {};
            this.generate3D();
            this.updateFloorInfo();
            this.syncFloorHeightUI();
            this.render2D();
        });
    },

    /* ============================================================
     *  ★ 全局环境 UI
     * ============================================================ */
    initGlobalEnvUI: function () {
        const sidebarLeft = document.getElementById('sidebarLeft');
        if (!sidebarLeft) return;

        let panel = document.getElementById('globalEnvPanel');
        if (!panel) {
            const groups = sidebarLeft.querySelectorAll('.panel-group');
            for (let i = 0; i < groups.length; i++) {
                const title = groups[i].querySelector('.group-title');
                if (title && /2\.\s*全局环境/.test((title.textContent || '').replace(/\s+/g, ''))) { panel = groups[i]; break; }
            }
        }
        if (!panel) return;
        panel.id = 'globalEnvPanel';

        const legacyThemeModal = document.getElementById('themeModal');
        if (legacyThemeModal) legacyThemeModal.remove();

        let skyToggle = document.getElementById('globalSkyToggle');
        let settings = document.getElementById('globalSkySettings');

        if (!skyToggle || !settings) {
            const ambient = document.getElementById('ambientIntensity');
            const ambientControl = ambient ? ambient.closest('.control-item') : null;
            if (!ambientControl) return;

            skyToggle = document.createElement('button');
            skyToggle.id = 'globalSkyToggle';
            skyToggle.type = 'button';
            skyToggle.style.cssText = 'width:100%;margin:2px 0 8px;background:linear-gradient(135deg,#4361ee,#4cc9f0);color:#fff;border:none;border-radius:8px;padding:8px;font-size:0.72rem;cursor:pointer;font-weight:600;text-align:left;';
            skyToggle.textContent = '🌌 天空背景 ▸';

            settings = document.createElement('div');
            settings.id = 'globalSkySettings';
            settings.style.cssText = 'display:none;border-top:1px dashed rgba(255,255,255,0.12);padding-top:8px;margin-top:2px;';
            settings.innerHTML =
                `<div class="group-title" style="font-size:0.75rem;color:var(--accent);">🎨 背景风格化</div>` +
                `<div style="font-size:0.6rem;color:#888;margin-bottom:8px;line-height:1.5;">点击风格卡片即应用 → 背景缓动过渡 + 自动协调墙体 / 灯光 / 天空球</div>` +
                `<div id="envThemeGrid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;"></div>` +
                `<div style="margin:10px 0 4px;">` +
                `<button id="envSkyToggle" type="button" style="width:100%;background:#333;color:#fff;border:none;border-radius:8px;padding:8px;font-size:0.68rem;cursor:pointer;font-weight:600;">🌐 天空球: 显示中</button>` +
                `</div>` +
                `<div style="border-top:1px dashed rgba(255,255,255,0.12);margin:10px 0 10px;padding-top:10px;">` +
                `<div class="group-title" style="font-size:0.75rem;color:var(--accent);">🌌 天空球 HDR 贴图</div>` +
                `<div id="envSkyGrid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px;"></div>` +
                `<div style="display:flex;gap:6px;">` +
                `<button id="envSkyRescan" type="button" style="flex:1;background:#333;color:#fff;border:none;border-radius:8px;padding:7px;font-size:0.68rem;cursor:pointer;">🔄 重扫</button>` +
                `<button id="envSkyClear" type="button" style="flex:1;background:#333;color:#fff;border:none;border-radius:8px;padding:7px;font-size:0.68rem;cursor:pointer;">🚫 清除HDR</button>` +
                `</div>` +
                `<div id="envSkyStatus" style="font-size:0.58rem;color:#888;margin-top:6px;text-align:center;line-height:1.5;">🔍 正在扫描 img 目录...</div>` +
                `</div>` +
                `<div style="border-top:1px dashed rgba(255,255,255,0.12);margin:10px 0 0;padding-top:10px;">` +
                `<div class="group-title" style="font-size:0.75rem;color:var(--accent);">🎛️ 自定义调色板</div>` +
                `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><span style="width:66px;font-size:0.62rem;color:#aaa;flex-shrink:0;">🌌 场景背景</span><input type="color" id="envPalBg" value="#0a0a0f" style="flex:1;height:26px;border:none;background:none;cursor:pointer;padding:0;"></div>` +
                `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><span style="width:66px;font-size:0.62rem;color:#aaa;flex-shrink:0;">🌄 天空顶部</span><input type="color" id="envPalSkyTop" value="#050810" style="flex:1;height:26px;border:none;background:none;cursor:pointer;padding:0;"></div>` +
                `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><span style="width:66px;font-size:0.62rem;color:#aaa;flex-shrink:0;">🌤️ 天空中部</span><input type="color" id="envPalSkyMid" value="#0c1022" style="flex:1;height:26px;border:none;background:none;cursor:pointer;padding:0;"></div>` +
                `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span style="width:66px;font-size:0.62rem;color:#aaa;flex-shrink:0;">🌇 天空底部</span><input type="color" id="envPalSkyBottom" value="#161b2e" style="flex:1;height:26px;border:none;background:none;cursor:pointer;padding:0;"></div>` +
                `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span style="width:66px;font-size:0.62rem;color:#aaa;flex-shrink:0;">🧱 协调墙体</span><input type="color" id="envPalWall" value="#e0e0e0" style="flex:1;height:26px;border:none;background:none;cursor:pointer;padding:0;"></div>` +
                `<div style="display:flex;gap:6px;">` +
                `<button id="envPalApply" type="button" style="flex:2;background:linear-gradient(135deg,#f7b731,#e67e22);color:#000;border:none;border-radius:8px;padding:8px;font-size:0.7rem;cursor:pointer;font-weight:bold;">✅ 应用调色板</button>` +
                `<button id="envPalReset" type="button" style="flex:1;background:#333;color:#fff;border:none;border-radius:8px;padding:8px;font-size:0.68rem;cursor:pointer;">↺ 还原</button>` +
                `</div></div>`;

            ambientControl.insertAdjacentElement('afterend', skyToggle);
            skyToggle.insertAdjacentElement('afterend', settings);

            skyToggle.onclick = () => this.toggleGlobalSkySettings();
            document.getElementById('envSkyToggle').onclick = () => this.toggleSkySphere();
            document.getElementById('envSkyRescan').onclick = () => this.skyLibrary.rescan();
            document.getElementById('envSkyClear').onclick = () => this.clearSkyTexture();

            ['envPalBg', 'envPalSkyTop', 'envPalSkyMid', 'envPalSkyBottom', 'envPalWall'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.addEventListener('input', () => this.previewPalette());
            });
            document.getElementById('envPalApply').onclick = () => this.applyCustomPalette();
            document.getElementById('envPalReset').onclick = () => this.resetCustomPalette();
        }

        this._updateGlobalSkySettingsButton();

        if (settings && settings.style.display === 'block') {
            this.renderThemeGrid();
            this.renderEnvSkyList();
            this.renderCustomPalette();
            this._updateSkyToggleBtn();
        }
    },

    toggleGlobalSkySettings: function (forceOpen) {
        this.initGlobalEnvUI();
        const settings = document.getElementById('globalSkySettings');
        if (!settings) return false;
        const open = (forceOpen === true) ? true : settings.style.display !== 'block';
        settings.style.display = open ? 'block' : 'none';
        this._updateGlobalSkySettingsButton();
        if (open) {
            this.renderThemeGrid();
            this.renderEnvSkyList();
            this.renderCustomPalette();
            this._updateSkyToggleBtn();
        }
        return open;
    },

    _updateGlobalSkySettingsButton: function () {
        const btn = document.getElementById('globalSkyToggle');
        const settings = document.getElementById('globalSkySettings');
        if (!btn) return;
        const open = !!(settings && settings.style.display === 'block');
        btn.textContent = open ? '🌌 天空背景 ▾' : '🌌 天空背景 ▸';
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.title = open ? '点击收起天空背景全部设置' : '点击展开天空背景全部设置';
    },

    renderEnvSkyList: function () {
        const grid = document.getElementById('envSkyGrid');
        const status = document.getElementById('envSkyStatus');
        if (!grid) return;
        grid.innerHTML = '';

        const items = this.skyLibrary.items;
        if (items.length === 0) {
            if (status) status.innerText = this._skyAutoLoadStarted && !this._skyLoadDoneFlag ? '🔍 正在扫描 img 目录...' : '💡 img目录暂无天空贴图: 支持 .hdr / sky命名图片 / img/sky.json';
            return;
        }

        items.forEach(it => {
            const active = this.skyLibrary.currentFileName === it.fileName;
            const card = document.createElement('div');
            card.style.cssText = 'background:#23252e;border-radius:9px;padding:6px 4px;text-align:center;cursor:pointer;border:2px solid ' + (active ? 'var(--accent)' : 'rgba(255,255,255,0.08)') + ';min-height:46px;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;' + (active ? 'box-shadow:0 0 10px rgba(76,201,240,0.35);' : '');

            const icon = document.createElement('div');
            icon.textContent = it.kind === 'hdr' ? '🔆' : '🖼️';
            icon.style.cssText = 'font-size:0.95rem;line-height:1.3;';

            const name = document.createElement('div');
            name.textContent = it.name;
            name.style.cssText = 'font-size:0.52rem;color:#aaa;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';

            card.appendChild(icon); card.appendChild(name);
            card.onclick = () => this.applySkyItem(it.id);
            grid.appendChild(card);
        });

        if (status) status.innerText = this.skyLibrary.currentFileName ? ('✅ 当前: ' + this.skyLibrary.currentFileName) : ('🔍 发现 ' + items.length + ' 个天空贴图, 点击应用');
    },

    _palGet: function (ids) {
        for (let i = 0; i < ids.length; i++) {
            const el = document.getElementById(ids[i]);
            if (el && el.value) return el.value;
        }
        return null;
    },

    /* ============================================================
     *  ★ 3D 初始化
     * ============================================================ */
	/* ============================================================
	 * ★ 3D 初始化（使用集中式灯光配置）
	 * ============================================================ */
	init3D: function () {
		const container = document.getElementById('three-canvas');
		const cw = (container && container.clientWidth) ||
				   (document.getElementById('viewport') &&
					document.getElementById('viewport').clientWidth) ||
				   window.innerWidth || 1;
		const ch = (container && container.clientHeight) ||
				   (document.getElementById('viewport') &&
					document.getElementById('viewport').clientHeight) ||
				   window.innerHeight || 1;

		const LC = this.lightConfig;

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x0a0a0f);

		this.camera = new THREE.PerspectiveCamera(45, cw / ch, 0.1, 1000);
		this.camera.position.set(0, 30, 40);
		this.camera.lookAt(0, 0, 0);

		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this.renderer.setSize(cw, ch);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.outputEncoding = THREE.sRGBEncoding;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.0;

		if (container) container.appendChild(this.renderer.domElement);

		const dom = this.renderer.domElement;
		if (dom) {
			dom.style.display = 'block';
			dom.style.width = '100%';
			dom.style.height = '100%';
			dom.style.position = 'absolute';
			dom.style.top = '0';
			dom.style.left = '0';
			dom.style.outline = 'none';
		}

		// ★ 半球光：基础强度由 lightConfig 控制（较低，突出灯具）
		this.hemiLight = new THREE.HemisphereLight(
			LC.hemiSkyColor,
			LC.hemiGroundColor,
			LC.hemiBase
		);
		this.hemiLight.position.set(0, 50, 0);
		this.scene.add(this.hemiLight);

		// ★ 平行光：基础强度同样受限，避免淹没灯具
		this.dirLight = new THREE.DirectionalLight(
			LC.dirColor,
			LC.dirBase
		);
		this.dirLight.position.set(10, 50, 20);
		this.dirLight.castShadow = true;
		this.dirLight.shadow.mapSize.width = 1024;
		this.dirLight.shadow.mapSize.height = 1024;
		this.dirLight.shadow.camera.near = 0.5;
		this.dirLight.shadow.camera.far = 100;
		this.dirLight.shadow.camera.left = -30;
		this.dirLight.shadow.camera.right = 30;
		this.dirLight.shadow.camera.top = 30;
		this.dirLight.shadow.camera.bottom = -30;
		this.dirLight.shadow.bias = -0.0005;
		this.scene.add(this.dirLight);

		const grid = new THREE.GridHelper(60, 60, 0x333333, 0x111111);
		this.gridHelper = grid;
		this.scene.add(grid);

		this.scene.add(this.structureGroup);
		this.scene.add(this.furnitureGroup);
		this.scene.add(this.fireworksGroup);

		this.orbit = new THREE.OrbitControls(this.camera, this.renderer.domElement);
		this.orbit.enablePan = true;
		this.orbit.enableDamping = true;
		this.orbit.dampingFactor = 0.08;

		this.transCtrl = new THREE.TransformControls(this.camera, this.renderer.domElement);
		this.transCtrl.setSize(0.75);

		// ===================== ★ 拖拽开始/结束事件 =====================
		this.transCtrl.addEventListener('dragging-changed', e => {
			this.orbit.enabled = !e.value;
			if (e.value) {
				if (this.selectedObj) {
					this._dragStartY = this.selectedObj.position.y;
				}
			} else {
				this.constrainAfterDrag();
			}
		});

		// ===================== ★ 拖拽过程事件 =====================
		this.transCtrl.addEventListener('objectChange', () => {
			if (!this.selectedObj) return;

			if (this.transOptions.lockUpright) {
				this.selectedObj.rotation.x = 0;
				this.selectedObj.rotation.z = 0;
			}

			if (this.transOptions.lockHorizontal && this.transCtrl.mode === 'translate') {
				const d = this.selectedObj.userData || {};
				const isLight = (d.type === 'light');
				if (!isLight && this._dragStartY !== null &&
					this._dragStartY !== undefined && isFinite(this._dragStartY)) {
					this.selectedObj.position.y = this._dragStartY;
				}
			}
			this.modelToUI();
		});

		this.transCtrl.addEventListener('change', () => this.modelToUI());
		this.scene.add(this.transCtrl);

		this.renderer.domElement.addEventListener('pointerdown', e => this.on3DClick(e));
		this.renderer.domElement.addEventListener('touchstart', e => {
			if (e.touches.length === 1) {
				const t = e.touches[0];
				const pe = new PointerEvent('pointerdown', {
					clientX: t.clientX, clientY: t.clientY
				});
				this.on3DClick(pe);
			}
		}, { passive: true });

		this.setupTransformToolbar();
		this._applyTransformGizmoVisibility('translate');
		this.setTransformMode('translate');

		window.addEventListener('resize', () => {
			this.updateRendererSize();
			this.setVH();
		});

		// ★ 初始化完成后立即计算一次全局光照
		try { this._recalculateGlobalLighting(this.currentFloor); } catch (e) {}
	},

	setupTransformToolbar: function () {
		const toolbar = document.getElementById('transformToolbar');
		if (!toolbar || toolbar.dataset.enhanced) return;
		toolbar.dataset.enhanced = '1';

		const hBtn = document.createElement('button');
		hBtn.id = 'lockHBtn';
		hBtn.type = 'button';
		hBtn.textContent = '⇔水平';
		hBtn.title = '水平移动锁定：开启后只能在地面(XZ)拖动模型，Y轴手柄会被隐藏';
		if (this.transOptions.lockHorizontal) hBtn.classList.add('active');
		hBtn.onclick = () => {
			this.transOptions.lockHorizontal = !this.transOptions.lockHorizontal;
			hBtn.classList.toggle('active', this.transOptions.lockHorizontal);

			// ★ 关键：根据最新锁定状态刷新三轴手柄可见性
			this._applyTransformGizmoVisibility(this.transCtrl ? this.transCtrl.mode : 'translate');

			// ★ 若当前处于 translate 模式，重新 setTransformMode 以同步工具栏按钮 active 状态
			if (this.transCtrl && this.transCtrl.mode === 'translate') {
				this.setTransformMode('translate');
			}

			this.saveSystem.showToast(this.transOptions.lockHorizontal
				? '🔒 已锁定水平移动（Y轴已隐藏，模型只能在XZ平面移动）'
				: '🔓 已解除水平锁定（可自由调整高度）');
		};
		toolbar.appendChild(hBtn);

		const uBtn = document.createElement('button');
		uBtn.id = 'lockUBtn';
		uBtn.type = 'button';
		uBtn.textContent = '↕直立';
		uBtn.title = '直立锁定：开启后模型永不翻倒，只能绕Y轴水平旋转，X/Z旋转手柄会被隐藏';
		if (this.transOptions.lockUpright) uBtn.classList.add('active');
		uBtn.onclick = () => {
			this.transOptions.lockUpright = !this.transOptions.lockUpright;
			uBtn.classList.toggle('active', this.transOptions.lockUpright);

			// 开启时立刻复位已有的翻转
			if (this.transOptions.lockUpright && this.selectedObj) {
				this.selectedObj.rotation.x = 0;
				this.selectedObj.rotation.z = 0;
			}

			// ★ 关键：根据最新锁定状态刷新三轴手柄可见性
			this._applyTransformGizmoVisibility(this.transCtrl ? this.transCtrl.mode : 'rotate');

			// ★ 若当前处于 rotate 模式，重新 setTransformMode 以同步工具栏按钮 active 状态
			if (this.transCtrl && this.transCtrl.mode === 'rotate') {
				this.setTransformMode('rotate');
			}

			this.saveSystem.showToast(this.transOptions.lockUpright
				? '🔒 已锁定模型直立（X/Z旋转手柄已隐藏，只能绕Y轴旋转）'
				: '🔓 已解除直立锁定（可自由旋转）');

			if (this._flSelectedId) {
				const obj = this.getFlSelectedObj();
				if (obj) this.flShowPropPanel(obj);
			}
		};
		toolbar.appendChild(uBtn);

		// 初始化时同步一次手柄显示状态
		this._applyTransformGizmoVisibility();
		this._updateTransformToolbarVisibility();

		// ★ 新增：初始化长按拖拽
		this.initTransformToolbarDrag();
	},

	constrainAfterDrag: function () {
		const obj = this.selectedObj;
		if (!obj) return;

		if (!isFinite(obj.position.x)) obj.position.x = 0;
		if (!isFinite(obj.position.y)) obj.position.y = this.getFloorBaseY(obj.userData.floorIndex || 0);
		if (!isFinite(obj.position.z)) obj.position.z = 0;
		if (!isFinite(obj.scale.x) || obj.scale.x <= 0) obj.scale.set(1, 1, 1);

		const mode = this.transCtrl.mode;
		const isLight = !!(obj.userData && obj.userData.type === 'light');

		if (mode === 'translate') {
			if (isLight) {
				// 灯具：手动拖动时记录 manualPosition，允许自由调整高度
				obj.userData.manualPosition = true;
			} else if (this.transOptions.lockHorizontal &&
					   this._dragStartY !== null && this._dragStartY !== undefined &&
					   isFinite(this._dragStartY)) {
				// ★ 水平锁定：拖拽结束后强制还原 Y 位置，杜绝任何跨层漂移
				obj.position.y = this._dragStartY;
			}
		}

		// ★ 直立锁定：无论什么模式都清零 X/Z 旋转
		if (this.transOptions.lockUpright) {
			obj.rotation.x = 0;
			obj.rotation.z = 0;
		}

		this._dragStartY = null;

		this.updateObjectFloorIndex(obj);
		this.modelToUI();
		this.updateSceneVisibility();
		if (obj.userData.type === 'door_window') this.generate3D();
		this.refreshFloorModelList();
		this.saveSystem.saveToDB(true);
	},

    /* ============================================================
     *  ★ 渲染器尺寸（★ 布局修复核心）
     * ============================================================ */
	updateRendererSize: function () {
		if (!this.renderer || !this.camera) return;

		let container = document.getElementById('viewport');
		if (!container) container = document.querySelector('.viewport');

		let width = 0, height = 0;
		if (container) {
			width = container.clientWidth;
			height = container.clientHeight;
		}
		if (!width || width <= 0) width = window.innerWidth || document.documentElement.clientWidth || 1;
		if (!height || height <= 0) height = window.innerHeight || document.documentElement.clientHeight || 1;

		if (width <= 0 || height <= 0) return;

		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height, true);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

		const dom = this.renderer.domElement;
		if (dom) {
			dom.style.width = '100%';
			dom.style.height = '100%';
			dom.style.display = 'block';
			dom.style.position = 'absolute';
			dom.style.top = '0';
			dom.style.left = '0';
		}

		if (this.orbit) this.orbit.update();
		this.updateSceneVisibility();

		// ★ 2D 画布尺寸同步（带防抖）：侧栏宽度 / 演示模式切换后，让 3D 缩放与画布一致
		if (!this.isPlayMode) {
			if (this._canvasSyncTimer) clearTimeout(this._canvasSyncTimer);
			this._canvasSyncTimer = setTimeout(() => {
				this._canvasSyncTimer = null;
				try {
					const changed = this.resetCanvasSize();
					if (changed) {
						this._wallMergeCache = {};
						this._doorCache = {};
						this.generate3D();
						this.render2D();
					}
				} catch (e) {}
			}, 120);
		}
	},



	/* ============================================================
	 * ★★★ 编辑工具栏长按拖拽（可移动到屏幕任意位置） ★★★
	 *  - 长按 450ms 进入拖拽态，普通点击不干扰按钮功能
	 *  - 拖拽结束自动保存位置到 localStorage，刷新后自动还原
	 *  - 窗口尺寸变化 / 横竖屏切换自动约束在可视区域内
	 *  - 工具栏空白处双击 → 复位到默认顶部居中
	 *  - 兼容移动端 CSS 中的 left:50% !important / transform !important
	 * ============================================================ */

	_TB_POS_KEY: 'transformToolbarPos',
	_TB_LONG_PRESS_MS: 450,
	_TB_MOVE_TOLERANCE: 10,

	_injectTransformToolbarDragStyles: function () {
		if (document.getElementById('tbDragStyles')) return;
		const s = document.createElement('style');
		s.id = 'tbDragStyles';
		s.textContent = `
			#transformToolbar.tb-dragging{
				opacity:0.94 !important;
				transition:none !important;
				cursor:grabbing !important;
				box-shadow:0 12px 34px rgba(0,0,0,0.72), 0 0 22px rgba(76,201,240,0.55) !important;
				border-color:var(--accent) !important;
			}
			#transformToolbar.tb-dragging button{ pointer-events:none !important; }
			#transformToolbar{ touch-action:none; -webkit-touch-callout:none; }
			body.tb-dragging{
				cursor:grabbing !important;
				-webkit-user-select:none !important;
				user-select:none !important;
				-webkit-touch-callout:none !important;
			}
			body.tb-dragging *{ cursor:grabbing !important; }
		`;
		document.head.appendChild(s);
	},

	initTransformToolbarDrag: function () {
		const toolbar = document.getElementById('transformToolbar');
		if (!toolbar) return;

		this._injectTransformToolbarDragStyles();
		this._restoreTransformToolbarPosition(toolbar);

		if (toolbar.dataset.tbDragInited === '1') return;
		toolbar.dataset.tbDragInited = '1';

		const self = this;
		const LONG_PRESS_MS = this._TB_LONG_PRESS_MS || 450;
		const MOVE_TOLERANCE = this._TB_MOVE_TOLERANCE || 10;

		let pressTimer = null;
		let armed = false;        // 已按下，等待长按判定
		let dragging = false;     // 已进入拖拽态
		let suppressed = false;   // 拖拽结束后短暂吞掉 click
		let startClientX = 0, startClientY = 0;
		let startLeft = 0, startTop = 0;

		/* ---------- 工具函数 ---------- */
		const getPoint = function (e) {
			if (e.touches && e.touches.length) return e.touches[0];
			if (e.changedTouches && e.changedTouches.length) return e.changedTouches[0];
			return e;
		};

		const getParent = function () {
			return toolbar.offsetParent || toolbar.parentElement || document.body;
		};

		const clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };

		const clearPress = function () {
			if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
			armed = false;
		};

		/* ---------- 进入拖拽态 ---------- */
		const enterDrag = function (pt) {
			if (dragging) return;
			dragging = true;
			armed = false;

			const parentEl = getParent();
			const rect = toolbar.getBoundingClientRect();
			const pRect = parentEl.getBoundingClientRect();

			// 换算为「相对 offsetParent padding-box」的坐标
			startLeft = rect.left - pRect.left - (parentEl.clientLeft || 0);
			startTop  = rect.top  - pRect.top  - (parentEl.clientTop  || 0);

			// 关键：用 !important 覆盖移动端 CSS 的 left:50% / transform:translateX(-50%)
			toolbar.style.setProperty('transform', 'none', 'important');
			toolbar.style.setProperty('margin', '0', 'important');
			toolbar.style.setProperty('right', 'auto', 'important');
			toolbar.style.setProperty('bottom', 'auto', 'important');
			toolbar.style.setProperty('left', startLeft + 'px', 'important');
			toolbar.style.setProperty('top',  startTop  + 'px', 'important');

			toolbar.classList.add('tb-dragging');
			document.body.classList.add('tb-dragging');

			// 以「长按触发瞬间」的指针位置重新校准基准，避免长按期间的轻微抖动造成跳位
			startClientX = pt.clientX;
			startClientY = pt.clientY;

			if (navigator.vibrate) { try { navigator.vibrate(18); } catch (e) {} }
		};

		/* ---------- 按下 ---------- */
		const onDown = function (e) {
			// 仅响应左键（鼠标）或单指（触摸）
			if (!e.touches && e.button !== undefined && e.button !== 0) return;
			if (e.touches && e.touches.length > 1) return;

			const pt = getPoint(e);
			armed = true;
			dragging = false;
			startClientX = pt.clientX;
			startClientY = pt.clientY;

			if (pressTimer) clearTimeout(pressTimer);
			pressTimer = setTimeout(function () {
				pressTimer = null;
				if (!armed || dragging) return;
				enterDrag(pt);
			}, LONG_PRESS_MS);

			document.addEventListener('mousemove', onMove);
			document.addEventListener('mouseup', onUp);
			document.addEventListener('touchmove', onMove, { passive: false });
			document.addEventListener('touchend', onUp);
			document.addEventListener('touchcancel', onUp);
		};

		/* ---------- 移动 ---------- */
		const onMove = function (e) {
			if (!armed && !dragging) return;

			const pt = getPoint(e);
			const dx = pt.clientX - startClientX;
			const dy = pt.clientY - startClientY;

			// 未进入拖拽：位移超过阈值 → 视为「点击按钮」意图，取消长按
			if (!dragging) {
				if (Math.abs(dx) > MOVE_TOLERANCE || Math.abs(dy) > MOVE_TOLERANCE) {
					clearPress();
				}
				return;
			}

			const parentEl = getParent();
			const maxL = Math.max(0, parentEl.clientWidth  - toolbar.offsetWidth);
			const maxT = Math.max(0, parentEl.clientHeight - toolbar.offsetHeight);

			const nl = clamp(startLeft + dx, 0, maxL);
			const nt = clamp(startTop  + dy, 0, maxT);

			toolbar.style.setProperty('left', nl + 'px', 'important');
			toolbar.style.setProperty('top',  nt + 'px', 'important');

			if (e.cancelable) e.preventDefault();
			e.stopPropagation();
		};

		/* ---------- 抬起 ---------- */
		const onUp = function (e) {
			clearPress();

			if (dragging) {
				dragging = false;
				toolbar.classList.remove('tb-dragging');
				document.body.classList.remove('tb-dragging');

				// 短暂屏蔽 click，避免长按抬手时误触发某个按钮
				suppressed = true;
				setTimeout(function () { suppressed = false; }, 350);

				self._saveTransformToolbarPosition(toolbar);
				if (e && e.cancelable) e.preventDefault();
				e && e.stopPropagation && e.stopPropagation();
			}

			document.removeEventListener('mousemove', onMove);
			document.removeEventListener('mouseup', onUp);
			document.removeEventListener('touchmove', onMove);
			document.removeEventListener('touchend', onUp);
			document.removeEventListener('touchcancel', onUp);
		};

		/* ---------- 拖拽结束后吞掉误触 click（捕获阶段拦截） ---------- */
		toolbar.addEventListener('click', function (e) {
			if (suppressed) {
				e.stopPropagation();
				e.preventDefault();
			}
		}, true);

		/* ---------- 长按期间屏蔽系统右键菜单 / 文本选择 ---------- */
		toolbar.addEventListener('contextmenu', function (e) {
			if (dragging || armed) e.preventDefault();
		});

		/* ---------- 空白处双击复位 ---------- */
		toolbar.addEventListener('dblclick', function (e) {
			if (e.target === toolbar) self._resetTransformToolbarPosition(toolbar);
		});

		/* ---------- 绑定 ---------- */
		toolbar.addEventListener('mousedown', onDown);
		toolbar.addEventListener('touchstart', onDown, { passive: true });

		/* ---------- 窗口变化时保持可见 ---------- */
		if (!this._tbClampBound) {
			this._tbClampBound = true;
			const reclamp = function () {
				const tb = document.getElementById('transformToolbar');
				if (!tb) return;
				self._clampTransformToolbarPosition(tb);
			};
			window.addEventListener('resize', function () {
				if (self._tbClampTimer) clearTimeout(self._tbClampTimer);
				self._tbClampTimer = setTimeout(reclamp, 120);
			});
			window.addEventListener('orientationchange', function () {
				setTimeout(reclamp, 320);
			});
			if (window.visualViewport) {
				window.visualViewport.addEventListener('resize', function () {
					if (self._tbClampTimer) clearTimeout(self._tbClampTimer);
					self._tbClampTimer = setTimeout(reclamp, 120);
				});
			}
		}
	},

	/* ---------- 位置持久化 ---------- */
	_saveTransformToolbarPosition: function (toolbar) {
		try {
			toolbar = toolbar || document.getElementById('transformToolbar');
			if (!toolbar) return;
			const l = parseFloat(toolbar.style.left);
			const t = parseFloat(toolbar.style.top);
			if (!isFinite(l) || !isFinite(t)) return;
			localStorage.setItem(this._TB_POS_KEY || 'transformToolbarPos',
				JSON.stringify({ left: l, top: t }));
		} catch (e) {}
	},

	_restoreTransformToolbarPosition: function (toolbar) {
		toolbar = toolbar || document.getElementById('transformToolbar');
		if (!toolbar) return;
		let saved = null;
		try {
			const raw = localStorage.getItem(this._TB_POS_KEY || 'transformToolbarPos');
			if (raw) saved = JSON.parse(raw);
		} catch (e) { saved = null; }

		if (!saved || typeof saved.left !== 'number' || typeof saved.top !== 'number') return;
		if (!isFinite(saved.left) || !isFinite(saved.top)) return;

		toolbar.style.setProperty('transform', 'none', 'important');
		toolbar.style.setProperty('margin', '0', 'important');
		toolbar.style.setProperty('right', 'auto', 'important');
		toolbar.style.setProperty('bottom', 'auto', 'important');
		toolbar.style.setProperty('left', saved.left + 'px', 'important');
		toolbar.style.setProperty('top',  saved.top  + 'px', 'important');

		this._clampTransformToolbarPosition(toolbar);
	},

	_clampTransformToolbarPosition: function (toolbar) {
		toolbar = toolbar || document.getElementById('transformToolbar');
		if (!toolbar) return;

		// 未脱离默认居中定位（内联 left 为空）→ 交给 CSS 控制，无需钳制
		if (!toolbar.style.left || toolbar.style.left === '') return;
		if (toolbar.style.left === '50%') return;

		const parentEl = toolbar.offsetParent || toolbar.parentElement || document.body;
		const l = parseFloat(toolbar.style.left);
		const t = parseFloat(toolbar.style.top);
		if (!isFinite(l) || !isFinite(t)) return;

		const maxL = Math.max(0, parentEl.clientWidth  - (toolbar.offsetWidth  || 0));
		const maxT = Math.max(0, parentEl.clientHeight - (toolbar.offsetHeight || 0));

		const nl = Math.min(Math.max(0, l), maxL);
		const nt = Math.min(Math.max(0, t), maxT);

		if (nl !== l || nt !== t) {
			toolbar.style.setProperty('left', nl + 'px', 'important');
			toolbar.style.setProperty('top',  nt + 'px', 'important');
			this._saveTransformToolbarPosition(toolbar);
		}
	},

	_resetTransformToolbarPosition: function (toolbar) {
		toolbar = toolbar || document.getElementById('transformToolbar');
		if (!toolbar) return;
		// 移除内联覆盖 → CSS 的 left:50% / transform:translateX(-50%) 重新生效
		toolbar.style.removeProperty('left');
		toolbar.style.removeProperty('top');
		toolbar.style.removeProperty('transform');
		toolbar.style.removeProperty('margin');
		toolbar.style.removeProperty('right');
		toolbar.style.removeProperty('bottom');
		try { localStorage.removeItem(this._TB_POS_KEY || 'transformToolbarPos'); } catch (e) {}
		try { this.saveSystem.showToast('📍 编辑工具栏已复位到顶部居中'); } catch (e) {}
	},



	_forceViewportResize: function () {
		if (!this.renderer || !this.camera) return;

		const syncAll = () => {
			try { this.setVH(); } catch (e) {}
			try { this.fixViewportLayout(); } catch (e) {}
			try { this.updateRendererSize(); } catch (e) {}

			// ★ 同步 2D canvas 尺寸，避免演示模式 / 侧栏切换后 3D 缩放使用旧值
			if (!this.isPlayMode) {
				try {
					const changed = this.resetCanvasSize();
					if (changed) {
						this._wallMergeCache = {};
						this._doorCache = {};
						this.generate3D();
						this.render2D();
					}
				} catch (e) {}
			}

			if (this.isPlayMode) { try { this._updateFullscreenViewport(); } catch (e) {} }
		};

		syncAll();
		[30, 120, 260, 420, 650, 900].forEach(d => setTimeout(syncAll, d));
	},

    _requestFullscreen: function () {
        const el = document.documentElement;
        const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
        if (!req) return;
        try {
            const r = req.call(el);
            if (r && r.catch) r.catch(() => {});
        } catch (e) {}
    },

    _exitFullscreen: function () {
        const doc = document;
        const exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
        if (!exit) return;
        const fsEl = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;
        if (!fsEl) return;
        try {
            const r = exit.call(doc);
            if (r && r.catch) r.catch(() => {});
        } catch (e) {}
    },

    _updateFullscreenViewport: function () {
        if (!this.renderer || !this.camera || !this.scene) return;

        let w = 0, h = 0;
        const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);

        if (window.visualViewport) {
            w = Math.max(w, Math.round(window.visualViewport.width));
            h = Math.max(h, Math.round(window.visualViewport.height));
        }
        if (isFs) {
            w = Math.max(w, window.innerWidth);
            h = Math.max(h, window.innerHeight);
        }

        const vp = document.getElementById('viewport');
        if (w <= 0 || h <= 0) {
            w = (vp && vp.clientWidth) || window.innerWidth || 1;
            h = (vp && vp.clientHeight) || window.innerHeight || 1;
        }
        if (w <= 0 || h <= 0) return;

        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.renderer.setPixelRatio(dpr);
        this.renderer.setSize(w, h, false);

        const dom = this.renderer.domElement;
        if (dom) {
            dom.style.width = '100%';
            dom.style.height = '100%';
            dom.style.display = 'block';
            dom.style.position = 'absolute';
            dom.style.top = '0';
            dom.style.left = '0';
            dom.style.margin = '0';
            dom.style.padding = '0';
        }

        if (vp) { vp.style.width = '100%'; vp.style.height = '100%'; }

        const threeCanvas = document.getElementById('three-canvas');
        if (threeCanvas) {
            threeCanvas.style.width = '100%';
            threeCanvas.style.height = '100%';
        }

        if (this.orbit) this.orbit.update();
        this.updateSceneVisibility();
    },

	/* ============================================================
	 * ★ 光照更新（UI 滑杆或状态变化时调用）
	 *   - 内部走 _recalculateGlobalLighting 统一处理
	 *   - 保证灯具开关效果永远清晰可见
	 * ============================================================ */
	updateLights: function () {
		try {
			this._recalculateGlobalLighting(this.currentFloor);
		} catch (e) { console.warn('updateLights 异常:', e); }
	},

    handleFloorTexture: function (input) {
        if (!input.files || !input.files[0]) { this.saveSystem.showToast("⚠️ 请选择一张图片作为地板纹理"); return; }
        const file = input.files[0];
        if (!file.type.startsWith('image/')) { this.saveSystem.showToast("⚠️ 请选择图片格式的文件 (jpg, png, webp等)"); input.value = ''; return; }

        const img = new Image();
        img.onload = () => {
            const t = new THREE.CanvasTexture(img);
            t.image = img;
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(this.floorTextureScale, this.floorTextureScale);
            t.encoding = THREE.sRGBEncoding;
            this.floorTextures[this.currentFloor] = t;
            this.generate3D();
            this.saveSystem.showToast(`✅ 楼层默认地板纹理 "${file.name}" 已应用`);
        };
        img.onerror = () => { this.saveSystem.showToast("❌ 图片加载失败，请检查文件是否损坏"); };
        img.src = URL.createObjectURL(file);
        input.value = '';
    },

    /* ============================================================
     *  ★ 3D 场景生成
     * ============================================================ */
	generate3D: function () {
		// ★★★ 守卫：canvas 尺寸无效时不生成，延迟重试
		if (!this.canvas || !this.canvas.width || this.canvas.width < 50 ||
			!this.canvas.height || this.canvas.height < 50) {
			if (!this._generate3DRetryTimer) {
				this._generate3DRetryTimer = setTimeout(() => {
					this._generate3DRetryTimer = null;
					try { this.resetCanvasSize(); } catch (e) {}
					try { this.generate3D(); } catch (e) {}
				}, 120);
			}
			return;
		}
		if (this._generate3DRetryTimer) {
			clearTimeout(this._generate3DRetryTimer);
			this._generate3DRetryTimer = null;
		}
		this._doorCacheGen = (this._doorCacheGen || 0) + 1;
		this.structureGroup.clear();
		let hasShapes = false;
		for (let floorIndex = 0; floorIndex < this.floorShapes.length; floorIndex++) {
			if (this.floorShapes[floorIndex].length > 0) { hasShapes = true; break; }
		}
		if (!hasShapes) return;
		const opacityEl = document.getElementById('wallOpacity');
		const wallColorEl = document.getElementById('wallColor');
		const floorColorEl = document.getElementById('floorColor');
		if (!opacityEl || !wallColorEl || !floorColorEl) return;
		const opacity = parseFloat(opacityEl.value);
		const wallColor = wallColorEl.value;
		const defaultFloorColor = floorColorEl.value;
		const wallMat = new THREE.MeshStandardMaterial({
			color: wallColor, side: THREE.DoubleSide, transparent: true, opacity: opacity, roughness: 0.8, metalness: 0.1
		});
		if (opacity < 1) wallMat.depthWrite = false;
		// ★ 关键：这里用到的 canvas.width 已被 resetCanvasSize 保证与当前布局一致
		const scale = 20 / this.canvas.width;
		/* ============================================================
		 * ★★★ 优化2：3D 原点统一取自 getOrigin2D() ★★★
		 *  与 2D 画布的原点标记 / 锚定网格严格像素级一致（偏差 0px）
		 * ============================================================ */
		const origin2D = this.getOrigin2D();
		const offX = origin2D.x;
		const offY = origin2D.y;
		for (let floorIndex = 0; floorIndex < this.floorShapes.length; floorIndex++) {
			const wallHeight = this.getWallHeight(floorIndex);
			const floorYOffset = this.getFloorBaseY(floorIndex);
			const floorShapes = this.floorShapes[floorIndex];
			floorShapes.forEach((points2D, roomIdx) => {
				if (points2D.length < 3) return;
				const p3d = points2D.map(p => new THREE.Vector2((p.x - offX) * scale, (p.y - offY) * scale));
				const roomColor = (this.roomColors[floorIndex] && this.roomColors[floorIndex][roomIdx]) || defaultFloorColor;
				const roomTex = this.roomTextures[floorIndex] && this.roomTextures[floorIndex][roomIdx];
				const roomMat = new THREE.MeshStandardMaterial({
					color: roomColor,
					side: THREE.DoubleSide,
					roughness: 0.8,
					metalness: 0.1
				});
				if (roomTex) {
					roomMat.map = roomTex;
					roomMat.color.setHex(0xffffff);
					const scaleKey = `roomTexScale_${floorIndex}_${roomIdx}`;
					const s = (this._roomTextureScale && this._roomTextureScale[scaleKey]) || 1;
					roomTex.repeat.set(s, s);
					roomMat.needsUpdate = true;
				} else if (this.floorTextures[floorIndex]) {
					roomMat.map = this.floorTextures[floorIndex];
					roomMat.color.setHex(0xffffff);
					this.floorTextures[floorIndex].repeat.set(this.floorTextureScale, this.floorTextureScale);
					roomMat.needsUpdate = true;
				}
				const shape = new THREE.Shape();
				shape.moveTo(p3d[0].x, p3d[0].y);
				for (let i = 1; i < p3d.length; i++) shape.lineTo(p3d[i].x, p3d[i].y);
				const floorGeo = new THREE.ShapeGeometry(shape);
				const uvAttr = floorGeo.attributes.uv;
				const roomTexScale = (() => {
					const scaleKey = `roomTexScale_${floorIndex}_${roomIdx}`;
					return (this._roomTextureScale && this._roomTextureScale[scaleKey]) || this.floorTextureScale;
				})();
				for (let i = 0; i < uvAttr.count; i++) {
					const x = floorGeo.attributes.position.getX(i);
					const y = floorGeo.attributes.position.getY(i);
					uvAttr.setXY(i, x * 0.5 * roomTexScale, y * 0.5 * roomTexScale);
				}
				const floor = new THREE.Mesh(floorGeo, roomMat);
				floor.rotation.x = Math.PI / 2;
				floor.position.y = floorYOffset + 0.01;
				floor.receiveShadow = true;
				floor.userData.floorIndex = floorIndex;
				floor.userData.roomIndex = roomIdx;
				this.structureGroup.add(floor);
				const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, side: THREE.DoubleSide, roughness: 0.9, metalness: 0.0 });
				const ceilingShape = new THREE.Shape();
				ceilingShape.moveTo(p3d[0].x, p3d[0].y);
				for (let i = 1; i < p3d.length; i++) ceilingShape.lineTo(p3d[i].x, p3d[i].y);
				const ceilingGeo = new THREE.ShapeGeometry(ceilingShape);
				const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
				ceiling.rotation.x = Math.PI / 2;
				ceiling.position.y = floorYOffset + wallHeight - 0.01;
				ceiling.receiveShadow = true;
				ceiling.userData.floorIndex = floorIndex;
				ceiling.userData.isCeiling = true;
				this.structureGroup.add(ceiling);
			});
			const mergedWalls = this._getMergedWallSegments(floorIndex);
			mergedWalls.forEach(seg => {
				const p1 = new THREE.Vector2((seg.p1.x - offX) * scale, (seg.p1.y - offY) * scale);
				const p2 = new THREE.Vector2((seg.p2.x - offX) * scale, (seg.p2.y - offY) * scale);
				const dist = p1.distanceTo(p2);
				if (dist < 0.02) return;
				const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
				const wallShape = new THREE.Shape();
				wallShape.moveTo(0, 0);
				wallShape.lineTo(dist, 0);
				wallShape.lineTo(dist, wallHeight);
				wallShape.lineTo(0, wallHeight);
				wallShape.closePath();
				const holes = this.calculateWallHoles(p1, p2, dist, wallHeight, floorYOffset, floorIndex);
				holes.forEach(hole => {
					const holePath = new THREE.Path();
					holePath.moveTo(hole.x, hole.y);
					holePath.lineTo(hole.x + hole.w, hole.y);
					holePath.lineTo(hole.x + hole.w, hole.y + hole.h);
					holePath.lineTo(hole.x, hole.y + hole.h);
					holePath.closePath();
					wallShape.holes.push(holePath);
				});
				try {
					const wallGeo = new THREE.ExtrudeGeometry(wallShape, { depth: 0.2, bevelEnabled: false, steps: 1 });
					wallGeo.center();
					const wallMesh = new THREE.Mesh(wallGeo, wallMat);
					const mid = p1.clone().add(p2).multiplyScalar(0.5);
					wallMesh.position.set(mid.x, floorYOffset + wallHeight / 2, mid.y);
					wallMesh.rotation.y = -angle;
					wallMesh.castShadow = true;
					wallMesh.receiveShadow = true;
					wallMesh.userData.floorIndex = floorIndex;
					this.structureGroup.add(wallMesh);
				} catch (e) { console.warn("墙体生成失败", e); }
				const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, wallHeight, 12), wallMat);
				pillar.position.set(p1.x, floorYOffset + wallHeight / 2, p1.y);
				pillar.castShadow = true;
				pillar.receiveShadow = true;
				pillar.userData.floorIndex = floorIndex;
				this.structureGroup.add(pillar);
			});
		}
		this.updateSceneVisibility();
	},

    calculateWallHoles: function (p1, p2, wallLen, wallHeight, floorYOffset, floorIndex) {
        const holes = [];
        const wallDir = new THREE.Vector2().subVectors(p2, p1).normalize();

        this.furnitureGroup.children.forEach(obj => {
            if (!obj.userData || obj.userData.type !== 'door_window') return;
            const objFloor = obj.userData.floorIndex;
            if (floorIndex !== undefined && objFloor !== undefined && objFloor !== null && objFloor !== floorIndex) return;
            if (!isFinite(obj.position.x) || !isFinite(obj.position.y) || !isFinite(obj.position.z)) return;

            const fx = obj.userData.animEffectGroup || null;
            let fxPrev = null;
            if (fx) { fxPrev = fx.visible; fx.visible = false; }

            let box = null;
            try { obj.updateMatrixWorld(true); box = new THREE.Box3().setFromObject(obj); } catch (e) { box = null; }
            if (fx) fx.visible = (fxPrev === undefined) ? true : fxPrev;
            if (!box || box.isEmpty()) return;

            const center = new THREE.Vector3();
            box.getCenter(center);
            if (!isFinite(center.x) || !isFinite(center.z)) return;

            const objPos2D = new THREE.Vector2(center.x, center.z);
            const vecToObj = new THREE.Vector2().subVectors(objPos2D, p1);
            const projLength = vecToObj.dot(wallDir);
            const perpVec = new THREE.Vector2(wallDir.y, -wallDir.x);
            const distToLine = Math.abs(vecToObj.dot(perpVec));

            if (distToLine >= 0.6) return;

            let halfW, halfH;
            const dims = obj.userData.dimensions;
            if (dims && dims.w && dims.h) { halfW = dims.w / 2; halfH = dims.h / 2; }
            else {
                const size = box.getSize(new THREE.Vector3());
                if (!isFinite(size.x) || !isFinite(size.z)) return;
                halfW = (Math.abs(size.x * wallDir.x) + Math.abs(size.z * wallDir.y)) / 2;
                halfH = size.y / 2;
            }

            let start = projLength - halfW;
            let end = projLength + halfW;

            const PAD = 0.015;
            start = Math.max(0.01, start + PAD);
            end = Math.min(wallLen - 0.01, end - PAD);

            const bottomY = Math.max(0, box.min.y - floorYOffset);
            const topY = Math.min(wallHeight - 0.01, box.max.y - floorYOffset);

            const width = end - start;
            const height = topY - bottomY;

            if (width > 0.05 && height > 0.05 && start < wallLen && end > 0) {
                holes.push({ x: start, y: bottomY, w: width, h: height });
            }
        });

        return holes;
    },

    updateSceneVisibility: function () {
        let targetFloor, showAll;
        if (this.isPlayMode) { targetFloor = this.playModeFloor; showAll = this.playModeShowAll; }
        else { targetFloor = this.currentFloor; showAll = false; }

        this.structureGroup.children.forEach(mesh => {
            const meshFloor = mesh.userData.floorIndex;
            const isCeiling = mesh.userData.isCeiling;
            if (meshFloor === undefined) return;

            if (showAll) mesh.visible = true;
            else {
                if (meshFloor === targetFloor) mesh.visible = !isCeiling;
                else mesh.visible = false;
            }
        });

        this.furnitureGroup.children.forEach(group => {
            if (!isFinite(group.position.y)) group.position.y = 0;

            let floorIndex;
            if (group.userData && group.userData.floorIndex !== undefined && group.userData.floorIndex !== null) {
                floorIndex = group.userData.floorIndex;
            } else floorIndex = this.floorIndexOfY(group.position.y);

            floorIndex = Math.max(0, Math.min(this.floorShapes.length - 1, floorIndex));

            if (showAll) group.visible = true;
            else group.visible = (floorIndex === targetFloor);
        });

        if (this.isPlayMode) this.updateSensorDisplay();
    },

    updateMaterials: function () { this.generate3D(); },

    updateFloorTextureScale: function () {
        const el = document.getElementById('texScale');
        if (!el) return;
        this.floorTextureScale = parseFloat(el.value);
        if (this.floorTextures[this.currentFloor]) {
            this.floorTextures[this.currentFloor].repeat.set(this.floorTextureScale, this.floorTextureScale);
            this.floorTextures[this.currentFloor].needsUpdate = true;
        }
        this.generate3D();
    },

    /* ============================================================
     *  ★ 预设模型
     * ============================================================ */
    initAddPreset: function (type) {
        let name = "", category = "furniture";

        if (type === 'ceiling_light') { name = "客厅吸顶灯"; category = "light"; }
        else if (type === 'spot_light') { name = "嵌入式射灯"; category = "light"; }
        else if (type === 'led_strip') { name = "装饰灯带"; category = "light"; }
        else if (type === 'ac_stand') { name = "立式空调"; category = "ac"; }
        else if (type === 'tv') { name = "客厅电视"; category = "tv"; }
        else if (type === 'wall_tv') { name = "壁挂大屏电视"; category = "tv"; }
        else if (type.includes('door') || type === 'window') {
            name = type === 'wooden_door' ? "卧室木门" : type === 'glass_door' ? "玻璃移门" : type === 'security_door' ? "入户防盗门" : "飘窗";
            category = "door_window";
        }
        else if (type === 'curtain') { name = "褶皱窗帘"; }
        else if (type === 'photo_frame') { name = "墙壁相框"; }
        else if (type === 'wardrobe') { name = "衣柜"; }
        else if (type === 'desk') { name = "书桌"; }
        else if (type === 'chair') { name = "办公椅"; }
        else if (type === 'ai_speaker') { name = "智能音箱"; category = "tv"; }
        else { name = type === 'bed' ? "双人床" : type === 'sofa' ? "沙发" : type === 'table' ? "餐桌" : "家具"; }

        this.tempObjectData = { sourceType: 'preset', presetKey: type, defaultName: name, defaultCategory: category };
        this.showConfigModal();
    },

    /* ============================================================
     *  ★ GLB 导入
     * ============================================================ */
    handleGLB: async function (input) {
        try {
            if (!input || !input.files || input.files.length === 0) {
                this.saveSystem.showToast("⚠️ 未选择文件, 请在弹出的选择器中选择模型文件");
                if (input) input.value = '';
                return;
            }
            const file = input.files[0];
            const fileName = file.name.toLowerCase();

            if (!/\.(glb|gltf|fbx)$/i.test(fileName)) {
                this.saveSystem.showToast("⚠️ 支持 .glb / .gltf / .fbx 格式 (带骨骼动画推荐GLB或FBX)");
                input.value = ''; return;
            }
            if (file.size > 150 * 1024 * 1024) {
                this.saveSystem.showToast("❌ 文件过大(>150MB), 请压缩后再导入");
                input.value = ''; return;
            }

            this.saveSystem.showToast(`⏳ 正在读取 "${file.name}" ...`);

            if (/\.fbx$/.test(fileName)) {
                try { this.saveSystem.showToast('⏳ 正在加载FBX解析器(首次需联网)...'); await this.ensureFBXLoader(); }
                catch (e) { throw new Error('FBX解析器加载失败: ' + e.message); }
            }

            const base64 = await this.fileToBase64(file);
            if (!base64 || base64.length < 10) throw new Error("文件内容为空或读取失败");

            const displayName = file.name.replace(/\.[^.]+$/, '') || "导入模型";
            const relPath = file.webkitRelativePath || file.name;

            this.saveSystem.showToast(`📦 正在入库 "${displayName}" ...`);
            const rec = await this.glbLibrary.addModel(displayName, base64, relPath);
            this.glbLibrary.renderUI();

            this.tempObjectData = { sourceType: 'glb_lib', libId: rec.id, defaultName: displayName, defaultCategory: "furniture" };
            this.showConfigModal();
            this.saveSystem.showToast(`✅ "${displayName}" 已加入模型库`);
        } catch (e) {
            console.error("模型导入失败:", e);
            this.saveSystem.showToast("❌ 模型导入失败: " + (e.message || e));
        } finally { if (input) input.value = ''; }
    },

    loadGLBFolder: async function (input) {
        const files = Array.from(input.files || []).filter(f => /\.(glb|gltf|fbx)$/i.test(f.name));
        if (files.length === 0) {
            this.saveSystem.showToast("⚠️ 未找到 GLB/GLTF/FBX 模型文件 (5+App内请改用单个导入)");
            input.value = ''; return;
        }

        this.saveSystem.showToast(`📦 正在导入 ${files.length} 个模型，请稍候...`);
        let ok = 0, fail = 0;

        for (const f of files) {
            try {
                const base64 = await this.fileToBase64(f);
                const displayName = f.name.replace(/\.[^.]+$/, '') || "未命名模型";
                const relPath = f.webkitRelativePath || f.name;
                await this.glbLibrary.addModel(displayName, base64, relPath);
                ok++;
                if (ok % 5 === 0) this.saveSystem.showToast(`📦 导入中... ${ok + fail}/${files.length}`);
            } catch (e) { fail++; console.warn("导入失败:", f.name, e); }
        }

        this.glbLibrary.renderUI();
        this.saveSystem.showToast(`✅ 模型库导入完成: 成功 ${ok} 个` + (fail > 0 ? `，失败 ${fail} 个` : ""));
        input.value = '';
    },

    fileToBase64: function (file) {
        return new Promise((resolve, reject) => {
            if (!file) { reject(new Error('无文件')); return; }
            const reader = new FileReader();
            reader.onload = () => {
                const res = reader.result;
                if (typeof res === 'string' && res.indexOf(',') !== -1) resolve(res.split(',')[1]);
                else resolve(res);
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsDataURL(file);
        });
    },

    base64ToArrayBuffer: function (base64) {
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
        return bytes.buffer;
    },

    /* ============================================================
     *  ★ 配置弹窗
     * ============================================================ */
    showConfigModal: function () {
        try { this._setupWalkerUI(); } catch (e) {}

        const modal = document.getElementById('configModal');
        if (!modal) return;

        document.getElementById('cfgName').value = this.tempObjectData.defaultName;
        document.getElementById('cfgType').value = this.tempObjectData.defaultCategory;
        this.onConfigTypeChange();
        modal.style.display = 'flex';
    },

    onConfigTypeChange: function () {
        const type = document.getElementById('cfgType').value;
        document.getElementById('cfgFeaturesLight').style.display = type === 'light' ? 'block' : 'none';
        document.getElementById('cfgFeaturesAC').style.display = type === 'ac' ? 'block' : 'none';
        document.getElementById('cfgFeaturesDoor').style.display = type === 'door_window' ? 'block' : 'none';

        const wk = document.getElementById('cfgFeaturesWalker');
        if (wk) wk.style.display = type === 'walker' ? 'block' : 'none';
    },

    confirmAddObject: function () {
        const name = document.getElementById('cfgName').value || "未命名设备";
        const type = document.getElementById('cfgType').value;
        const enablePBR = document.getElementById('featPBR') ? document.getElementById('featPBR').checked : false;

        const features = {
            power: true,
            dimmer: type === 'light' && document.getElementById('featDimmer').checked,
            color: type === 'light' && document.getElementById('featColor').checked,
            pbr: enablePBR
        };

        let walkConfig = null;
        if (type === 'walker') {
            const gv = (id, dft) => { const el = document.getElementById(id); return el ? el.value : dft; };
            const gc = (id) => { const el = document.getElementById(id); return el ? el.checked : true; };
            const freezeEl = document.getElementById('walkFreeze');

            walkConfig = {
                speed: Math.max(0.1, parseFloat(gv('walkSpeed', 0.6)) || 0.6),
                radius: Math.max(0.1, parseFloat(gv('walkRadius', 0.35)) || 0.35),
                faceOffset: ((parseFloat(gv('walkFaceOffset', 0)) || 0) * Math.PI) / 180,
                useAnim: gc('walkAnim'), useBob: gc('walkBob'),
                freeze: freezeEl ? !!freezeEl.checked : false,
                dir: Math.random() * Math.PI * 2,
                turnTimer: 2 + Math.random() * 3,
                paused: false
            };
        }

        document.getElementById('configModal').style.display = 'none';

        if (this.tempObjectData.sourceType === 'preset') {
            this.createPresetModel(this.tempObjectData.presetKey, name, type, features, { walkConfig: walkConfig });
        } else if (this.tempObjectData.sourceType === 'glb_lib' || this.tempObjectData.sourceType === 'glb') {
            this.addGLBFromLibraryToScene(this.tempObjectData.libId, name, type, features, walkConfig);
        }
    },

    _setupWalkerUI: function () {
        try {
            const cfgType = document.getElementById('cfgType');
            if (cfgType && !cfgType.querySelector('option[value="walker"]')) {
                const opt = document.createElement('option');
                opt.value = 'walker';
                opt.textContent = '🚶 模型行走 (自动巡游+碰撞)';
                cfgType.appendChild(opt);
            }

            const card = document.querySelector('#configModal .modal-card');
            if (card && !document.getElementById('cfgFeaturesWalker')) {
                const door = document.getElementById('cfgFeaturesDoor');
                const panel = document.createElement('div');
                panel.id = 'cfgFeaturesWalker';
                panel.style.cssText = 'display:none;margin-top:8px;border:1px dashed #444;padding:8px;';
                panel.innerHTML =
                    '<div style="font-size:0.75rem;color:var(--success);margin-bottom:6px;">🚶 确认添加后模型将在室内地板自动行走<br><span style="color:#888;">开启墙体碰撞+模型碰撞检测, 防止出墙/穿模重叠</span></div>' +
                    '<div class="control-item"><label>行走速度</label><input type="range" id="walkSpeed" min="0.2" max="2" step="0.1" value="0.6"></div>' +
                    '<div class="control-item"><label>碰撞半径</label><input type="range" id="walkRadius" min="0.15" max="1" step="0.05" value="0.35"></div>' +
                    '<div class="control-item"><label>朝向偏移°</label><input type="number" id="walkFaceOffset" value="0" step="15" style="width:60px;background:#1a1a1f;border:1px solid #444;color:var(--accent);padding:2px 4px;border-radius:4px;text-align:center;"></div>' +
                    '<label class="feature-check"><input type="checkbox" id="walkFreeze"> 🚫 禁止移动 (原地播放模型自带动画)</label>' +
                    '<label class="feature-check"><input type="checkbox" id="walkAnim" checked> 自动播放模型自带行走动画 (GLB/FBX骨骼动画)</label>' +
                    '<label class="feature-check"><input type="checkbox" id="walkBob" checked> 无动画时启用行走摆动</label>';

                if (door && door.parentNode === card) card.insertBefore(panel, door.nextSibling);
                else card.appendChild(panel);
            }
        } catch (e) { console.warn('行走UI初始化失败:', e); }
    },

    /* ============================================================
     *  ★ 预设模型生成
     * ============================================================ */
    createPresetModel: function (key, name, type, features, extra = {}) {
        const group = new THREE.Group();
        let meshObj, lightObj;
        let yPos = 0;
        let dims = { w: 1, h: 1, y: 0 };
        let materials = {};
        let refs = {};

        const curWallHeight = this.getWallHeight(this.currentFloor);

        if (type === 'door_window') {
            if (key === 'wooden_door' || key === 'security_door') {
                const w = 0.9, h = 2.1, d = 0.05;
                dims = { w: w, h: h, y: 0 };

                const frameGeo = new THREE.BoxGeometry(w + 0.1, h + 0.05, d + 0.1);
                const frameMat = new THREE.MeshStandardMaterial({ color: key === 'wooden_door' ? 0x8b5a2b : 0x4a4a4a, roughness: 0.7, metalness: 0.3 });
                const frame = new THREE.Mesh(frameGeo, frameMat); frame.position.y = h / 2; group.add(frame);

                const doorGeo = new THREE.BoxGeometry(w, h, d);
                const doorMat = new THREE.MeshStandardMaterial({ color: key === 'wooden_door' ? 0x8b5a2b : 0x4a4a4a, roughness: 0.6, metalness: 0.1 });
                meshObj = new THREE.Mesh(doorGeo, doorMat); meshObj.position.y = h / 2; group.add(meshObj);

                materials = { frame: frameMat, door: doorMat };
            } else if (key === 'glass_door') {
                const w = 1.6, h = 2.1, d = 0.05;
                dims = { w: w, h: h, y: 0 };

                const frameGeo = new THREE.BoxGeometry(w, h, d);
                const frameMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 });
                const frame = new THREE.Mesh(frameGeo, frameMat); frame.position.y = h / 2;

                const glassGeo = new THREE.BoxGeometry(w - 0.2, h - 0.2, 0.02);
                const glassMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, roughness: 0.05, metalness: 0.1 });
                const glass = new THREE.Mesh(glassGeo, glassMat); glass.position.y = h / 2;

                group.add(frame); group.add(glass);
                materials = { frame: frameMat, glass: glassMat };
            } else if (key === 'window') {
                const w = 1.5, h = 1.2, d = 0.05;
                const offY = 1.0;
                dims = { w: w, h: h, y: offY };

                const frameGeo = new THREE.BoxGeometry(w, h, d);
                const frameMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.2 });
                const frame = new THREE.Mesh(frameGeo, frameMat); frame.position.y = offY + h / 2;

                const glassGeo = new THREE.BoxGeometry(w - 0.1, h - 0.1, 0.01);
                const glassMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, roughness: 0.05 });
                const glass = new THREE.Mesh(glassGeo, glassMat); glass.position.y = offY + h / 2;

                group.add(frame); group.add(glass);
                materials = { frame: frameMat, glass: glassMat };
                yPos = offY;
            }
        } else if (key === 'ceiling_light') {
			const LC = this.lightConfig;
			dims = { w: 0.6, h: 0.2, y: 0 };

			const geo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
			const mat = new THREE.MeshStandardMaterial({
				color: 0xffffee,
				emissive: 0xffeeaa,
				emissiveIntensity: 0.5
			});

			meshObj = new THREE.Mesh(geo, mat);
			meshObj.castShadow = false;

			// ★ 点光源：由 lightConfig 驱动 → 主光源
			lightObj = new THREE.PointLight(
				0xffffee,
				LC.lampPower,          // 强度
				LC.lampDistance,       // 距离
				LC.lampDecay           // 衰减
			);
			lightObj.position.y = -0.1;
			lightObj.castShadow = !!LC.lampCastShadow;
			lightObj.visible = true;

			group.add(meshObj);
			group.add(lightObj);

			yPos = curWallHeight - 0.12;
			materials = { body: mat };
			refs.mesh = meshObj;
        } else if (key === 'spot_light') {
			const LC = this.lightConfig;
			dims = { w: 0.2, h: 0.2, y: 0 };

			const housingGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.1, 16);
			const housingMat = new THREE.MeshStandardMaterial({
				color: 0x888888, metalness: 0.8, roughness: 0.2
			});
			const housing = new THREE.Mesh(housingGeo, housingMat);

			const bulbGeo = new THREE.SphereGeometry(0.04, 16, 16);
			const bulbMat = new THREE.MeshStandardMaterial({
				color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.0
			});
			meshObj = new THREE.Mesh(bulbGeo, bulbMat);
			meshObj.position.y = -0.05;
			meshObj.castShadow = false;

			// ★ 射灯：强度更高、方向性好
			lightObj = new THREE.SpotLight(
				0xffffee,
				LC.lampPower * 1.2,     // 射灯更聚焦 → 略高
				LC.lampDistance,
				Math.PI / 4,
				0.2,
				LC.lampDecay
			);
			lightObj.position.y = -0.1;
			lightObj.castShadow = !!LC.lampCastShadow;
			lightObj.shadow.bias = -0.0001;

			const targetObj = new THREE.Object3D();
			targetObj.position.set(0, -1, 0);
			group.add(targetObj);
			lightObj.target = targetObj;

			group.add(housing);
			group.add(meshObj);
			group.add(lightObj);

			yPos = curWallHeight - 0.12;
			materials = { housing: housingMat, bulb: bulbMat };
			refs.mesh = meshObj;
        } else if (key === 'led_strip') {
			const LC = this.lightConfig;
			dims = { w: 0.2, h: 2.0, y: 0 };
			const h = 2.0;

			const geo = new THREE.BoxGeometry(0.05, h, 0.05);
			const mat = new THREE.MeshStandardMaterial({
				color: 0xffffff, emissive: 0x4cc9f0, emissiveIntensity: 1.5
			});
			meshObj = new THREE.Mesh(geo, mat);
			meshObj.position.y = h / 2;

			// ★ 灯带：柔和补光，范围略小
			lightObj = new THREE.PointLight(
				0x4cc9f0,
				LC.lampPower * 0.65,        // 灯带单点不如吸顶灯亮
				LC.lampDistance * 0.7,
				LC.lampDecay
			);
			lightObj.position.y = h / 2;
			lightObj.castShadow = false;

			group.add(meshObj);
			group.add(lightObj);

			materials = { strip: mat };
			refs.mesh = meshObj;
        } else if (key === 'bed') {
            dims = { w: 1.8, h: 0.5, y: 0 };
            const baseGeo = new THREE.BoxGeometry(1.8, 0.5, 2.0);
            const baseMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.8 });
            const base = new THREE.Mesh(baseGeo, baseMat); base.position.y = 0.25;

            const headGeo = new THREE.BoxGeometry(1.8, 1.0, 0.1);
            const headMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.6 });
            const head = new THREE.Mesh(headGeo, headMat); head.position.set(0, 0.5, -1.05);

            const pillowGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 12);
            pillowGeo.rotateZ(Math.PI / 2);
            const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
            const p1 = new THREE.Mesh(pillowGeo, pillowMat); p1.position.set(-0.5, 0.6, -0.8);
            const p2 = new THREE.Mesh(pillowGeo, pillowMat); p2.position.set(0.5, 0.6, -0.8);

            group.add(base); group.add(head); group.add(p1); group.add(p2);
            materials = { mattress: baseMat, headboard: headMat, pillow: pillowMat };
        } else if (key === 'sofa') {
            dims = { w: 2.2, h: 0.8, y: 0 };
            const baseGeo = new THREE.BoxGeometry(2.2, 0.4, 0.8);
            const fabricMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 });
            const base = new THREE.Mesh(baseGeo, fabricMat); base.position.y = 0.2;

            const backGeo = new THREE.BoxGeometry(2.2, 0.5, 0.2);
            const back = new THREE.Mesh(backGeo, fabricMat); back.position.set(0, 0.65, -0.3);

            const armGeo = new THREE.BoxGeometry(0.2, 0.4, 0.8);
            const armL = new THREE.Mesh(armGeo, fabricMat); armL.position.set(-1.0, 0.4, 0);
            const armR = new THREE.Mesh(armGeo, fabricMat); armR.position.set(1.0, 0.4, 0);

            group.add(base); group.add(back); group.add(armL); group.add(armR);
            materials = { fabric: fabricMat };
        } else if (key === 'tv') {
            dims = { w: 1.4, h: 0.8, y: 0 };
            const screenGeo = new THREE.BoxGeometry(1.4, 0.8, 0.05);
            const screenMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.8 });
            const screen = new THREE.Mesh(screenGeo, screenMat); screen.position.y = 1.0;

            const standGeo = new THREE.BoxGeometry(0.4, 0.6, 0.2);
            const standMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 });
            const stand = new THREE.Mesh(standGeo, standMat); stand.position.y = 0.3;

            group.add(screen); group.add(stand);
            materials = { screen: screenMat, stand: standMat };
            refs.screen = screen;
        } else if (key === 'wall_tv') {
            dims = { w: 1.6, h: 0.9, y: 0 };
            const w = 1.6, h = 0.9, d = 0.05;
            const screenGeo = new THREE.BoxGeometry(w, h, d);
            const screenMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 });
            const screen = new THREE.Mesh(screenGeo, screenMat); screen.position.y = 1.5;
            group.add(screen);
            materials = { screen: screenMat };
            refs.screen = screen;
        } else if (key === 'ac_stand') {
            dims = { w: 0.5, h: 1.8, y: 0 };
            const bodyGeo = new THREE.CylinderGeometry(0.25, 0.25, 1.8, 32);
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.1 });
            const body = new THREE.Mesh(bodyGeo, bodyMat); body.position.y = 0.9;

            const ventGeo = new THREE.BoxGeometry(0.3, 0.4, 0.1);
            const ventMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
            const vent = new THREE.Mesh(ventGeo, ventMat); vent.position.set(0, 1.4, 0.2);

            group.add(body); group.add(vent);
            materials = { body: bodyMat, vent: ventMat };
        } else if (key === 'ai_speaker') {
            dims = { w: 0.2, h: 0.25, y: 0 };
            const bodyGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.25, 32);
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.5 });
            const body = new THREE.Mesh(bodyGeo, bodyMat); body.position.y = 0.125;

            const topGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.01, 32);
            const lightMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 2 });
            const top = new THREE.Mesh(topGeo, lightMat); top.position.y = 0.25;

            const ringGeo = new THREE.RingGeometry(0.12, 0.15, 32);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0, side: THREE.DoubleSide });
            const ring = new THREE.Mesh(ringGeo, ringMat); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.05;

            group.add(ring); refs.ring = ring;
            group.add(body); group.add(top);
            materials = { body: bodyMat, ring: lightMat };
        } else if (key === 'curtain') {
            dims = { w: 1.5, h: 2.6, y: 0 };
            const shape = new THREE.Shape();
            const width = 1.5, folds = 10, depth = 0.1;

            for (let i = 0; i <= 50; i++) {
                const t = i / 50, x = (t - 0.5) * width;
                const z = Math.sin(t * Math.PI * folds) * depth;
                if (i === 0) shape.moveTo(x, z); else shape.lineTo(x, z);
            }
            for (let i = 50; i >= 0; i--) {
                const t = i / 50, x = (t - 0.5) * width;
                const z = Math.sin(t * Math.PI * folds) * depth + 0.02;
                shape.lineTo(x, z);
            }
            shape.closePath();

            const geo = new THREE.ExtrudeGeometry(shape, { depth: 2.6, bevelEnabled: false });
            geo.rotateX(Math.PI / 2); geo.center();

            const posAttr = geo.attributes.position;
            const originalPos = new Float32Array(posAttr.array.length);
            originalPos.set(posAttr.array);
            geo.userData.originalPos = originalPos;

            const mat = new THREE.MeshStandardMaterial({ color: 0xdddddd, side: THREE.DoubleSide, roughness: 0.9 });
            const mesh = new THREE.Mesh(geo, mat); mesh.position.y = 1.3;
            group.add(mesh);
            materials = { cloth: mat };
            refs.curtainMesh = mesh;
        } else if (key === 'table') {
            dims = { w: 0.8, h: 0.75, y: 0 };
            const topGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.05, 32);
            const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.6, metalness: 0.0 });
            const top = new THREE.Mesh(topGeo, woodMat); top.position.y = 0.75;

            const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.75, 12);
            const metalMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
            const leg = new THREE.Mesh(legGeo, metalMat); leg.position.y = 0.375;

            group.add(top); group.add(leg);
            materials = { top: woodMat, leg: metalMat };
        } else if (key === 'wardrobe') {
            dims = { w: 1.2, h: 2.2, y: 0 };
            const w = 1.2, h = 2.2, d = 0.6;
            const bodyGeo = new THREE.BoxGeometry(w, h, d);
            const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.6 });
            const body = new THREE.Mesh(bodyGeo, woodMat); body.position.y = h / 2;

            const handleGeo = new THREE.BoxGeometry(0.02, 0.4, 0.02);
            const metalMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8 });
            const h1 = new THREE.Mesh(handleGeo, metalMat); h1.position.set(-0.3, 1.1, d / 2 + 0.01);
            const h2 = new THREE.Mesh(handleGeo, metalMat); h2.position.set(0.3, 1.1, d / 2 + 0.01);

            group.add(body); group.add(h1); group.add(h2);
            materials = { body: woodMat, handle: metalMat };
        } else if (key === 'desk') {
            dims = { w: 1.4, h: 0.75, y: 0 };
            const w = 1.4, h = 0.75, d = 0.6;
            const topGeo = new THREE.BoxGeometry(w, 0.05, d);
            const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.6 });
            const top = new THREE.Mesh(topGeo, woodMat); top.position.y = h;

            const legGeo = new THREE.BoxGeometry(0.05, h, 0.05);
            const legMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
            const p1 = { x: -w / 2 + 0.1, z: -d / 2 + 0.1 };
            const p2 = { x: w / 2 - 0.1, z: -d / 2 + 0.1 };
            const p3 = { x: -w / 2 + 0.1, z: d / 2 - 0.1 };
            const p4 = { x: w / 2 - 0.1, z: d / 2 - 0.1 };

            [p1, p2, p3, p4].forEach(p => {
                const leg = new THREE.Mesh(legGeo, legMat); leg.position.set(p.x, h / 2, p.z); group.add(leg);
            });
            group.add(top);
            materials = { top: woodMat, legs: legMat };
        } else if (key === 'chair') {
            dims = { w: 0.5, h: 0.5, y: 0 };
            const seatH = 0.45;
            const seatGeo = new THREE.BoxGeometry(0.5, 0.05, 0.5);
            const fabricMat = new THREE.MeshStandardMaterial({ color: 0x4361ee, roughness: 0.9 });
            const seat = new THREE.Mesh(seatGeo, fabricMat); seat.position.y = seatH;

            const backGeo = new THREE.BoxGeometry(0.5, 0.5, 0.05);
            const back = new THREE.Mesh(backGeo, fabricMat); back.position.set(0, seatH + 0.25, -0.25);

            const legGeo = new THREE.CylinderGeometry(0.03, 0.02, seatH, 8);
            const metalMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.5 });
            const p1 = { x: -0.2, z: -0.2 };
            const p2 = { x: 0.2, z: -0.2 };
            const p3 = { x: -0.2, z: 0.2 };
            const p4 = { x: 0.2, z: 0.2 };

            [p1, p2, p3, p4].forEach(p => {
                const leg = new THREE.Mesh(legGeo, metalMat); leg.position.set(p.x, seatH / 2, p.z); group.add(leg);
            });
            group.add(seat); group.add(back);
            materials = { seat: fabricMat, legs: metalMat };
        } else if (key === 'photo_frame') {
            dims = { w: 0.6, h: 0.8, y: 0 };
            const w = 0.6, h = 0.8, d = 0.03;
            const frameGeo = new THREE.BoxGeometry(w, h, d);
            const frameMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
            const frame = new THREE.Mesh(frameGeo, frameMat); frame.position.y = 1.5;

            const photoGeo = new THREE.BoxGeometry(w - 0.08, h - 0.08, 0.01);
            const photoMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
            const photo = new THREE.Mesh(photoGeo, photoMat); photo.position.set(0, 1.5, d / 2 + 0.01);

            group.add(frame); group.add(photo);
            materials = { frame: frameMat, photo: photoMat };
        } else {
            dims = { w: 1, h: 1, y: 0 };
            const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xdddddd }));
            box.position.y = 0.5;
            group.add(box);
            materials = { default: box.material };
        }

        group.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        group.position.y = this.getFloorBaseY(this.currentFloor) + yPos;

        this.finalizeObject(group, name, type, features, { mesh: meshObj, light: lightObj, ...refs }, dims, materials, extra);
    },

    initAddGLBLibrary: function (libId) {
        const rec = this.glbLibrary.models.find(m => m.id === libId);
        if (!rec) { this.saveSystem.showToast("⚠️ 模型数据不存在，请点击模型库\"🔄 重扫\"重新加载"); return; }
        this.tempObjectData = { sourceType: 'glb_lib', libId: libId, defaultName: rec.name, defaultCategory: "furniture" };
        this.showConfigModal();
    },

    addGLBFromLibraryToScene: async function (libId, name, type, features, walkConfig) {
        const rec = this.glbLibrary.models.find(m => m.id === libId);
        if (!rec) { this.saveSystem.showToast("❌ 模型数据不存在，请点击模型库\"🔄 重扫\"重新加载"); return; }
        try {
            await this.createGLBFromBase64(rec.base64, name || rec.name, type, features, {
                glbLibId: libId, glbFileName: rec.fileName, walkConfig: walkConfig || null
            });
            this.saveSystem.showToast(`✅ 模型 "${name || rec.name}" 已添加到场景`);
        } catch (e) {
            console.error("GLB添加失败:", e);
            this.saveSystem.showToast("❌ 模型加载失败: " + (e.message || e) + (/\.(gltf)$/i.test(rec.fileName || '') ? " (外链.gltf请改用.glb单文件)" : ""));
        }
    },

    createGLBFromBase64: function (base64, name, type, features, opts = {}) {
        return new Promise((resolve, reject) => {
            try {
                if (!base64) { reject(new Error("模型数据为空")); return; }

                const fname = ((opts.glbFileName || opts.fileName || '') + '').toLowerCase();
                const isFBX = /\.fbx$/.test(fname) || opts.forceFBX === true;
                const isGLTFJson = /\.gltf$/.test(fname);

                const finish = (sceneObj, animations) => {
                    try { const group = this._buildModelFromScene(sceneObj, animations || [], name, type, features, opts); resolve(group); }
                    catch (err) { reject(err); }
                };

                const fail = (err) => {
                    console.error("模型解析失败:", err);
                    reject(new Error((err && err.message) ? err.message : "模型解析失败"));
                };

                if (isFBX) {
                    this.ensureFBXLoader().then(() => {
                        try {
                            const buf = this.base64ToArrayBuffer(base64);
                            const fbxObj = new THREE.FBXLoader().parse(buf, '');
                            finish(fbxObj, fbxObj.animations || []);
                        } catch (e) { fail(new Error('FBX解析失败: ' + (e.message || e))); }
                    }).catch(fail);
                    return;
                }

                try {
                    const loader = new THREE.GLTFLoader();
                    let data;
                    if (isGLTFJson) {
                        try { data = new TextDecoder('utf-8').decode(this.base64ToArrayBuffer(base64)); }
                        catch (e) { data = decodeURIComponent(escape(atob(base64))); }
                    } else data = this.base64ToArrayBuffer(base64);

                    loader.parse(data, '', (gltf) => finish(gltf.scene, gltf.animations || []), fail);
                } catch (e) { fail(e); }
            } catch (e) { reject(e); }
        });
    },

    _buildModelFromScene: function (model, animations, name, type, features, opts = {}) {
        const norm = this.normalizeModelTransform(model, type);
        const group = new THREE.Group();
        group.add(model);
        group.rotation.set(0, 0, 0);
        group.scale.set(1, 1, 1);

        let materials = {};
        let matCount = 0;

        model.traverse(c => {
            if (c.isMesh) {
                c.castShadow = true; c.receiveShadow = true;
                if (c.material) {
                    if (c.material.transparent || c.material.opacity < 1.0) c.material.depthWrite = true;
                    if (c.material.map) c.material.map.encoding = THREE.sRGBEncoding;
                    c.material.needsUpdate = true;
                    materials['mat_' + (matCount++)] = c.material;
                }
            }
        });

        let lightObj = null;
        if (type === 'light') {
            lightObj = new THREE.PointLight(0xffffee, 2.0, 12);
            lightObj.position.y = Math.max(0.1, norm.height * 0.5);
            lightObj.castShadow = false;
            group.add(lightObj);
        }

        const extra = {
            sourceType: 'glb', glbLibId: opts.glbLibId || null, glbFileName: opts.glbFileName || null,
            silent: !!opts.silent, restoreData: opts.restoreData || null, walkConfig: opts.walkConfig || null
        };

        if (opts.restoreData && opts.restoreData.transform) {
            if (typeof opts.restoreData.floorIndex === 'number' && isFinite(opts.restoreData.floorIndex)) {
                extra.floorIndex = Math.max(0, Math.min(this.floorShapes.length - 1, opts.restoreData.floorIndex));
            } else {
                const p = opts.restoreData.transform.pos;
                const safeY = (typeof p.y === 'number' && isFinite(p.y)) ? p.y : 0;
                extra.floorIndex = Math.max(0, Math.min(this.floorShapes.length - 1, this.floorIndexOfY(safeY)));
            }
        } else {
            extra.floorIndex = this.currentFloor;
            group.position.set(0, this.getFloorBaseY(this.currentFloor), 0);
        }

        if (opts.restoreData && opts.restoreData.animConfig) extra.restoreData = opts.restoreData;

        let walkMixer = null;
        if (type === 'walker' && animations && animations.length > 0) {
            const wc = opts.walkConfig || (opts.restoreData && opts.restoreData.walkConfig) || {};
            if (wc.useAnim !== false) {
                try {
                    walkMixer = new THREE.AnimationMixer(model);
                    let clip = animations.find(c => /walk|run|jog|move|step/i.test(c.name)) || animations[0];
                    const action = walkMixer.clipAction(clip);
                    action.play();
                } catch (e) { console.warn('行走动画初始化失败:', e); walkMixer = null; }
            }
        }

        this.finalizeObject(group, name, type, features || { power: true, dimmer: false, color: false, pbr: false }, { light: lightObj }, { w: norm.width, h: norm.height, y: 0 }, materials, extra);

        if (walkMixer) group.userData._walkMixer = walkMixer;
        return group;
    },

    normalizeModelTransform: function (model, type) {
        let box = new THREE.Box3();
        try { box.setFromObject(model); } catch (e) { box.set(new THREE.Vector3(-0.5, 0, -0.5), new THREE.Vector3(0.5, 1.5, 0.5)); }
        if (box.isEmpty()) box.set(new THREE.Vector3(-0.5, 0, -0.5), new THREE.Vector3(0.5, 1.5, 0.5));

        let size = box.getSize(new THREE.Vector3());
        ['x', 'y', 'z'].forEach(k => { if (!isFinite(size[k]) || size[k] < 1e-6) size[k] = 0.01; });

        let target, current;
        if (type === 'door_window') { target = 2.1; current = size.y; }
        else if (type === 'light') { target = 0.8; current = Math.max(size.x, size.y, size.z); }
        else if (type === 'ac') { target = 1.8; current = size.y; }
        else if (type === 'tv') { target = 1.2; current = size.y; }
        else { target = 1.6; current = Math.max(size.x, size.y, size.z); }

        let scaleFactor = 1;
        if (!(current >= target * 0.6 && current <= target * 1.6)) scaleFactor = target / Math.max(current, 1e-6);
        if (!isFinite(scaleFactor) || scaleFactor <= 0) scaleFactor = 1;
        scaleFactor = Math.min(Math.max(scaleFactor, 1e-4), 1e6);

        model.scale.multiplyScalar(scaleFactor);
        box.setFromObject(model);

        if (!box.isEmpty()) {
            const center = box.getCenter(new THREE.Vector3());
            model.position.x -= center.x;
            model.position.z -= center.z;
            model.position.y -= box.min.y;
        }

        box.setFromObject(model);
        const finalSize = box.isEmpty() ? new THREE.Vector3(1, 1, 1) : box.getSize(new THREE.Vector3());
        return { width: finalSize.x, height: finalSize.y, depth: finalSize.z };
    },

    restoreGLBObject: async function (objData) {
        try {
            let base64 = null;
            let usedId = objData.glbLibId || null;
            let rec = usedId ? this.glbLibrary.models.find(m => m.id === usedId) : null;

            if (!rec && (objData.glbName || objData.name)) {
                const key = ((objData.glbName || objData.name || '') + '').toLowerCase();
                if (key) {
                    rec = this.glbLibrary.models.find(m => (m.fileName || '').toLowerCase() === key) ||
                        this.glbLibrary.models.find(m => (m.name || '').toLowerCase() === key.replace(/\.[^.]+$/, ''));
                    if (rec) usedId = rec.id;
                }
            }

            if (!rec && usedId) {
                rec = await this.saveSystem.getGLBFromStore(usedId);
                if (rec && rec.base64) { this.glbLibrary.models.push(rec); this.glbLibrary.renderUI(); }
            }

            if (rec) base64 = rec.base64;
            if (!base64 && objData.glbData) base64 = objData.glbData;

            if (!base64) {
                console.warn("模型数据暂缺, 已加入自动重试队列:", objData.name);
                this.glbMissingCount++;
                (this._pendingGLBRestores = this._pendingGLBRestores || []).push(objData);
                return;
            }

            await this.createGLBFromBase64(base64, objData.name, objData.type, objData.features, {
                glbLibId: usedId,
                glbFileName: objData.glbName || (rec ? rec.fileName : null) || objData.name,
                silent: true, restoreData: objData
            });
        } catch (e) {
            console.error("模型还原失败:", objData.name, e);
            this.glbMissingCount++;
        }
    },

    /* ============================================================
     *  ★ 对象完成
     * ============================================================ */
    finalizeObject: function (group, name, type, features, refs = {}, dimensions = { w: 1, h: 1, y: 0 }, materials = {}, extra = {}) {
        const state = { on: true, dimmer: 100, color: '#ffffff', temp: 26, mode: 'cool', fan: 2 };
        const defaultAnimConfig = { enabled: false, type: 'ripple', color: '#4cc9f0', size: 2.0, duration: 3.0, opacity: 0.8, glow: 0.5, yOffset: 0.0 };
        let animConfig = defaultAnimConfig;

        let srcType = extra.sourceType;
        if (!srcType) srcType = (this.tempObjectData && this.tempObjectData.sourceType) ? this.tempObjectData.sourceType : 'preset';
        const presetKey = (extra.presetKey !== undefined) ? extra.presetKey : ((this.tempObjectData && this.tempObjectData.presetKey) ? this.tempObjectData.presetKey : null);

        const rd = extra.restoreData;
        if (rd && rd.animConfig) animConfig = rd.animConfig;

        group.userData = {
            id: Date.now() + Math.floor(Math.random() * 100000),
            name: name, type: type, features: features, state: state, refs: refs,
            dimensions: dimensions, materials: materials,
            materialProperties: this.getDefaultMaterialProperties(type),
            floorIndex: (extra.floorIndex !== undefined) ? extra.floorIndex : this.currentFloor,
            animationConfig: animConfig,
            sourceType: srcType, presetKey: presetKey,
            glbLibId: extra.glbLibId || null, glbFileName: extra.glbFileName || null,
            entityId: "", manualPosition: false
        };

        if (rd) {
            if (rd.name) group.userData.name = rd.name;
            if (rd.features) group.userData.features = Object.assign(group.userData.features || { power: true }, rd.features);
            if (rd.state) group.userData.state = Object.assign(group.userData.state, rd.state);
            if (rd.entityId) group.userData.entityId = rd.entityId;

            if (rd.transform) {
                const safeNum = (v, dft) => (typeof v === 'number' && isFinite(v)) ? v : dft;

                group.position.set(safeNum(rd.transform.pos.x, 0), safeNum(rd.transform.pos.y, 0), safeNum(rd.transform.pos.z, 0));
                group.rotation.set(0, safeNum(rd.transform.rot.y, 0), 0);
                const sc = safeNum(rd.transform.scale.x, 1);
                group.scale.setScalar(sc > 0 ? sc : 1);

                if (typeof rd.floorIndex === 'number' && isFinite(rd.floorIndex)) {
                    group.userData.floorIndex = Math.max(0, Math.min(this.floorShapes.length - 1, rd.floorIndex));
                } else {
                    group.userData.floorIndex = Math.max(0, Math.min(this.floorShapes.length - 1, this.floorIndexOfY(group.position.y)));
                }
            }

            if (type === 'light') {
                if (typeof rd.manualPosition === 'boolean') group.userData.manualPosition = rd.manualPosition;
            }
        }

        if (type === 'walker') {
            const defaultWalk = {
                speed: 0.6, radius: 0.35, faceOffset: 0, useAnim: true, useBob: true,
                freeze: false, dir: Math.random() * Math.PI * 2, turnTimer: 2 + Math.random() * 3, paused: false
            };
            let wc = Object.assign({}, defaultWalk, extra.walkConfig || {});
            if (rd && rd.walkConfig) wc = Object.assign(wc, rd.walkConfig);
            group.userData.walkConfig = wc;
        }

        this.furnitureGroup.add(group);

        if (type === 'walker' && !rd && !extra.silent) {
            try {
                if (!this.isPointInFloor(group.position.x, group.position.z, group.userData.floorIndex) &&
                    !this._isInDoorway(group.position.x, group.position.z, group.userData.floorIndex)) {
                    const centers = this.calculateFloorCenters();
                    const c = centers[Math.min(group.userData.floorIndex, centers.length - 1)] || { x: 0, z: 0 };
                    group.position.x = c.x;
                    group.position.z = c.z;
                }
            } catch (e) {}
        }

        if (!extra.silent) this.selectObj(group);
        this.applyDeviceState(group);

        if (!extra.silent) {
            this.generate3D();
            if (animConfig && animConfig.enabled) {
                if (this.plugins[animConfig.type]) { this.applyAnimationToObject(group); this.saveSystem.saveToDB(true); }
                else (this._pendingAnimObjects = this._pendingAnimObjects || []).push(group);
            }
        } else {
            if (animConfig && animConfig.enabled) {
                if (this.plugins[animConfig.type]) this.applyAnimationToObject(group);
                else (this._pendingAnimObjects = this._pendingAnimObjects || []).push(group);
            }
        }

        this.refreshFloorModelList();
    },

    updateObjectFloorIndex: function (obj) {
        if (!obj || !obj.userData) return;
        const d = obj.userData;

        if (typeof d.floorIndex === 'number' && isFinite(d.floorIndex)) {
            const fi = Math.max(0, Math.min(this.floorShapes.length - 1, d.floorIndex));
            const base = this.getFloorBaseY(fi);
            const h = this.getWallHeight(fi);
            const y = obj.position.y;
            if (isFinite(y) && y >= base - 0.5 && y <= base + h + 0.5) {
                d.floorIndex = fi;
                if (d.type === 'walker') this._alignWalkerToFloor(obj, this.getFloorBaseY(fi));
                return;
            }
        }

        if (!isFinite(obj.position.y)) obj.position.y = 0;
        obj.userData.floorIndex = Math.max(0, Math.min(this.floorShapes.length - 1, this.floorIndexOfY(obj.position.y)));

        if (obj.userData.type === 'walker') {
            const fi = Math.max(0, Math.min(this.floorShapes.length - 1, obj.userData.floorIndex || 0));
            this._alignWalkerToFloor(obj, this.getFloorBaseY(fi));
        }
    },

    getDefaultMaterialProperties: function (type) {
        const defaults = {
            door_window: { color: '#ffffff', roughness: 0.5, metalness: 0.2, opacity: 1.0 },
            furniture: { color: '#dddddd', roughness: 0.7, metalness: 0.0, opacity: 1.0 },
            light: { color: '#ffffff', roughness: 0.3, metalness: 0.8, opacity: 1.0 }
        };
        return defaults[type] || defaults.furniture;
    },

    handleMaterialTexture: function (input) {
        if (!this.selectedObj || !input.files || !input.files[0]) { this.saveSystem.showToast("⚠️ 请先选择一个对象，再上传纹理"); return; }
        const file = input.files[0];
        if (!file.type.startsWith('image/')) { this.saveSystem.showToast("⚠️ 请选择图片格式的文件"); input.value = ''; return; }

        const img = new Image();
        img.onload = () => {
            const texture = new THREE.CanvasTexture(img);
            texture.image = img;
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.encoding = THREE.sRGBEncoding;
            this.adjustUVMapping(this.selectedObj, texture);

            if (this.selectedMaterialTarget) {
                this.selectedMaterialTarget.map = texture;
                this.selectedMaterialTarget.needsUpdate = true;
                const obj = this.selectedObj;
                if (obj.userData.materialProperties) obj.userData.materialProperties.texture = texture;
                this.saveSystem.showToast(`✅ 纹理 "${file.name}" 已应用`);
            }

            const textureId = `user_${Date.now()}`;
            this.materialTextures.set(textureId, texture);
        };
        img.onerror = () => { this.saveSystem.showToast("❌ 纹理图片加载失败"); };
        img.src = URL.createObjectURL(file);
        input.value = '';
    },

    adjustUVMapping: function (group, texture) {
        group.traverse(child => {
            if (child.isMesh && child.geometry) {
                const box = new THREE.Box3().setFromObject(child);
                const size = new THREE.Vector3();
                box.getSize(size);
                const scaleS = Math.max(1, size.x > size.z ? size.x : size.z);
                const scaleT = Math.max(1, size.y);
                if (texture) texture.repeat.set(scaleS, scaleT);
                if (!child.geometry.attributes.uv) return;
                if (child.material && child.material.map === texture) child.material.map.needsUpdate = true;
            }
        });
    },

    updateMaterial: function () {
        if (!this.selectedObj || !this.selectedMaterialTarget) return;
        const color = document.getElementById('matColor').value;
        const roughness = parseFloat(document.getElementById('matRoughness').value);
        const metalness = parseFloat(document.getElementById('matMetalness').value);
        const opacity = parseFloat(document.getElementById('matOpacity').value);

        this.selectedMaterialTarget.color.set(color);
        this.selectedMaterialTarget.roughness = roughness;
        this.selectedMaterialTarget.metalness = metalness;
        this.selectedMaterialTarget.opacity = opacity;
        this.selectedMaterialTarget.transparent = opacity < 1.0;
        this.selectedMaterialTarget.needsUpdate = true;

        const obj = this.selectedObj;
        if (obj.userData.materialProperties) {
            obj.userData.materialProperties.color = color;
            obj.userData.materialProperties.roughness = roughness;
            obj.userData.materialProperties.metalness = metalness;
            obj.userData.materialProperties.opacity = opacity;
        }

        this.saveSystem.saveToDB(true);
        this.refreshFloorModelList();
    },

    resetMaterial: function () {
        if (!this.selectedObj || !this.selectedMaterialTarget) return;
        const defaults = this.getDefaultMaterialProperties(this.selectedObj.userData.type);

        this.selectedMaterialTarget.color.set(defaults.color);
        this.selectedMaterialTarget.roughness = defaults.roughness;
        this.selectedMaterialTarget.metalness = defaults.metalness;
        this.selectedMaterialTarget.opacity = defaults.opacity;
        this.selectedMaterialTarget.transparent = defaults.opacity < 1.0;
        this.selectedMaterialTarget.map = null;
        this.selectedMaterialTarget.needsUpdate = true;

        const mc = document.getElementById('matColor'); if (mc) mc.value = defaults.color;
        const mr = document.getElementById('matRoughness'); if (mr) mr.value = defaults.roughness;
        const mm = document.getElementById('matMetalness'); if (mm) mm.value = defaults.metalness;
        const mo = document.getElementById('matOpacity'); if (mo) mo.value = defaults.opacity;

        this.saveSystem.showToast("🔄 材质已重置");
        this.refreshFloorModelList();
    },

    applyToAllSimilar: function () {
        if (!this.selectedObj || !this.selectedMaterialTarget) return;
        const currentType = this.selectedObj.userData.type;
        const currentMaterial = this.selectedMaterialTarget;
        let count = 0;

        this.furnitureGroup.children.forEach(obj => {
            if (obj.userData.type === currentType && obj !== this.selectedObj) {
                const materials = obj.userData.materials;
                if (materials) {
                    Object.values(materials).forEach(mat => {
                        mat.color.copy(currentMaterial.color);
                        mat.roughness = currentMaterial.roughness;
                        mat.metalness = currentMaterial.metalness;
                        mat.opacity = currentMaterial.opacity;
                        mat.transparent = currentMaterial.transparent;
                        mat.map = currentMaterial.map;
                        mat.needsUpdate = true;
                    });
                    count++;
                }
            }
        });

        this.saveSystem.showToast(`✅ 已将材质应用到 ${count} 个同类模型`);
        this.refreshFloorModelList();
    },

    /* ============================================================
     *  ★ GLB 模型库
     * ============================================================ */
    glbLibrary: {
        models: [],
        uiReady: false,

        init: async function () {
            try { const list = await app.saveSystem.getAllGLBFromStore(); this.models = list || []; }
            catch (e) { this.models = []; }
            this.ensureUI();
            this.renderUI();
            if (this.models.length > 0) console.log(`模型库已从IndexedDB恢复 ${this.models.length} 个模型`);
        },

        _hint: function (text) {
            const el = document.getElementById('glbLibEmpty');
            if (!el) return;
            el.style.display = 'block';
            el.innerText = text;
        },

        ensureUI: function () {
            if (this.uiReady) return;
            const sidebarRight = document.getElementById('sidebarRight');
            if (!sidebarRight) return;

            const panel = document.createElement('div');
            panel.className = 'panel-group';
            panel.id = 'glbLibraryPanel';
            panel.innerHTML =
                `<div class="group-title">📦 模型库 <span class="badge" id="glbLibCount">0</span></div>` +
                `<div class="btn-row" style="margin:4px 0;">` +
                ` <div class="texture-upload" id="glbFolderBtn" style="flex:2;margin:0;">📂 导入文件夹</div>` +
                ` <div class="texture-upload" id="glbRescanBtn" style="flex:1;margin:0;">🔄 重扫</div>` +
                `</div>` +
                `<input type="file" id="glbFolderInput" hidden multiple accept=".glb,.gltf,.fbx">` +
                `<div class="preset-grid" id="glbLibraryGrid" style="margin-top:6px;"></div>` +
                `<div id="glbLibEmpty" style="font-size:0.65rem;color:#888;text-align:center;padding:6px;">🔍 正在自动扫描 img 目录...</div>` +
                `<div style="font-size:0.6rem;color:#666;line-height:1.6;margin-top:4px;">💡 支持 <b>.glb/.gltf/.fbx</b> (含骨骼动画):<br>① 5+App启动自动扫描img目录(零配置);<br>② 或创建 models.json: {"models":[{"name":"名称","file":"xx.glb"}]}<br>③ 加载失败时点击"🔄 重扫"重新扫描。<br>✏️ 点击卡片左上角铅笔可重命名。<br>🚶 行走模型: 导入带骨骼动画的GLB/FBX → 设为"模型行走"类型。</div>`;

            const glbInput = document.getElementById('glbInput');
            const refPanel = glbInput ? glbInput.closest('.panel-group') : null;

            if (refPanel && refPanel.parentNode === sidebarRight)
                refPanel.parentNode.insertBefore(panel, refPanel.nextSibling);
            else sidebarRight.appendChild(panel);

            const folderInput = document.getElementById('glbFolderInput');
            if (!(window.plus && window.plus.io)) {
                folderInput.setAttribute('webkitdirectory', '');
                folderInput.setAttribute('directory', '');
            }
            folderInput.setAttribute('accept', '.glb,.gltf,.fbx');

            document.getElementById('glbFolderBtn').onclick = () => folderInput.click();
            folderInput.addEventListener('change', (e) => { app.loadGLBFolder(e.target); });

            document.getElementById('glbRescanBtn').onclick = () => {
                app._glbAutoLoadStarted = false;
                app._glbLoadDone = false;
                app.saveSystem.showToast('🔍 正在重新扫描 img 目录...');
                app.autoLoadGLBLibrary(true);
            };

            if (window.plus && window.plus.io)
                document.getElementById('glbFolderBtn').style.display = 'none';

            this.uiReady = true;
            try { app._fixFileInputs(); } catch (e) {}
        },

        renderUI: function () {
            const grid = document.getElementById('glbLibraryGrid');
            const empty = document.getElementById('glbLibEmpty');
            const count = document.getElementById('glbLibCount');
            if (!grid) return;

            grid.innerHTML = '';
            if (count) count.innerText = this.models.length;

            if (this.models.length === 0) { if (empty) empty.style.display = 'block'; return; }
            if (empty) empty.style.display = 'none';

            this.models.forEach(m => {
                const card = document.createElement('div');
                card.className = 'preset-card';
                card.style.position = 'relative';

                const icon = document.createElement('span');
                icon.className = 'preset-icon';
                icon.textContent = /\.fbx$/i.test(m.fileName || '') ? '🚶' : '🧊';

                const nameSpan = document.createElement('span');
                nameSpan.className = 'preset-name';
                nameSpan.textContent = m.name;
                nameSpan.title = '双击可重命名: ' + m.name;
                nameSpan.ondblclick = (e) => {
                    e.stopPropagation();
                    app.glbLibrary._promptRenameModel(m.id);
                };

                card.appendChild(icon);
                card.appendChild(nameSpan);
                card.onclick = () => app.initAddGLBLibrary(m.id);

                const renameBtn = document.createElement('span');
                renameBtn.className = 'glb-rename-btn';
                renameBtn.textContent = '✏️';
                renameBtn.title = '重命名';
                renameBtn.onclick = (e) => {
                    e.stopPropagation();
                    this._promptRenameModel(m.id);
                };
                card.appendChild(renameBtn);

                const delBtn = document.createElement('span');
                delBtn.textContent = '✕';
                delBtn.style.cssText = 'position:absolute;top:2px;right:4px;color:#e63946;font-size:0.6rem;cursor:pointer;z-index:2;';
                delBtn.onclick = (e) => {
                    e.stopPropagation();
                    app.dialog.confirm(`从模型库删除 "${m.name}" ？\n(注意: 场景中已摆放的实例刷新后将无法还原)`, () => { this.removeModel(m.id); });
                };
                card.appendChild(delBtn);

                grid.appendChild(card);
            });
        },

        _promptRenameModel: function (id) {
            const m = this.models.find(x => x.id === id);
            if (!m) return;

            let dd = document.getElementById('glbRenameModal');
            if (dd) dd.remove();

            dd = document.createElement('div');
            dd.id = 'glbRenameModal';
            dd.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:1500;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);';

            const card = document.createElement('div');
            card.style.cssText = 'background:#25252b;border:1px solid rgba(255,255,255,0.12);border-radius:14px;width:100%;max-width:360px;padding:20px 18px;box-shadow:0 20px 60px rgba(0,0,0,0.7);';

            const safeName = String(m.name || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

            card.innerHTML = `
<div style="font-size:0.95rem;color:var(--accent);font-weight:600;margin-bottom:12px;">✏️ 重命名模型</div>
<div style="font-size:0.62rem;color:#888;margin-bottom:8px;line-height:1.5;">原名称: <b style="color:#aaa;word-break:break-all;">${safeName}</b></div>
<input type="text" id="glbRenameInput" value="${safeName}" style="width:100%;background:#1a1a22;border:1px solid #3a3a44;color:#fff;padding:8px 10px;border-radius:8px;font-size:0.85rem;outline:none;margin-bottom:16px;box-sizing:border-box;">
<div style="display:flex;gap:10px;">
<button id="glbRenameCancel" style="flex:1;min-height:38px;background:#3a3a44;color:#fff;border:none;border-radius:9px;font-size:0.85rem;cursor:pointer;">取消</button>
<button id="glbRenameOk" style="flex:1;min-height:38px;background:var(--primary);color:#fff;border:none;border-radius:9px;font-size:0.85rem;cursor:pointer;font-weight:600;">确定</button>
</div>`;

            dd.appendChild(card);
            document.body.appendChild(dd);

            setTimeout(() => {
                const inp = document.getElementById('glbRenameInput');
                if (inp) { inp.focus(); inp.select(); }
            }, 80);

            const close = () => dd.remove();

            const confirmRename = async () => {
                const inp = document.getElementById('glbRenameInput');
                const newName = (inp && inp.value || '').trim();
                if (!newName) { app.saveSystem.showToast('⚠️ 名称不能为空'); return; }
                if (newName === m.name) { close(); return; }

                m.name = newName;
                try { await app.saveSystem.saveGLBToStore(m); } catch (e) { console.warn('重命名保存失败:', e); }
                this.renderUI();
                close();
                app.saveSystem.showToast('✅ 已重命名为 "' + newName + '"');
            };

            document.getElementById('glbRenameCancel').onclick = close;
            document.getElementById('glbRenameOk').onclick = confirmRename;

            const inp = document.getElementById('glbRenameInput');
            if (inp) {
                inp.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') { e.preventDefault(); confirmRename(); }
                    else if (e.key === 'Escape') close();
                });
            }

            dd.addEventListener('click', (e) => { if (e.target === dd) close(); });
        },

        addModel: async function (name, base64, fileName) {
            fileName = fileName || (name + '.glb');
            const exist = this.models.find(m => m.fileName === fileName);
            if (exist) return exist;

            const record = {
                id: 'glb_' + Date.now() + '_' + Math.floor(Math.random() * 100000),
                name: name, fileName: fileName, base64: base64, addedAt: Date.now()
            };

            this.models.push(record);
            await app.saveSystem.saveGLBToStore(record);

            if (app._pendingGLBRestores && app._pendingGLBRestores.length > 0) {
                setTimeout(() => { try { app._glbRetryCount = 0; app._retryPendingGLBRestores(); } catch (e) {} }, 800);
            }

            return record;
        },

        removeModel: async function (id) {
            const idx = this.models.findIndex(m => m.id === id);
            if (idx === -1) return;
            this.models.splice(idx, 1);
            await app.saveSystem.deleteGLBFromStore(id);
            this.renderUI();
            app.saveSystem.showToast('🗑️ 模型已从模型库移除');
        },

	/* ============================================================
	 * ★ 通过 img/sky.json 加载 HDR / 图片天空贴图
	 *   - 依次尝试 相对 / 绝对 / plus 多种路径
	 *   - 不提前 break，多候选路径都尝试，保证兼容不同运行环境
	 *   - 已存在的不重复加载
	 * ============================================================ */
	loadViaManifest: async function () {
		const candidates = [
			'img/sky.json',
			'./img/sky.json',
			'/img/sky.json'
		];

		if (window.plus && window.plus.io && window.plus.io.convertLocalFileSystemURL) {
			['_www/img/sky.json', '_doc/img/sky.json', '_downloads/img/sky.json']
				.forEach(p => {
					try {
						const abs = window.plus.io.convertLocalFileSystemURL(p);
						if (abs && candidates.indexOf(abs) === -1) candidates.push(abs);
					} catch (e) {}
				});
		}

		let added = 0;
		const doneBase = new Set();

		for (const url of candidates) {
			let txt = '';
			try { txt = await app._localFetch(url, true); } catch (e) { continue; }
			if (!txt) continue;

			const t = txt.trim();
			if (t.length < 2 || (t[0] !== '{' && t[0] !== '[')) continue;

			let json;
			try { json = JSON.parse(t); }
			catch (e) { console.warn('sky.json 解析失败:', url, e); continue; }

			const list = this._parseManifest(json);
			if (list.length === 0) continue;

			const base = url.substring(0, url.lastIndexOf('/') + 1);
			if (doneBase.has(base)) continue;
			doneBase.add(base);

			console.log(`发现 sky.json (${url}): ${list.length} 个天空贴图`);

			for (const item of list) {
				try {
					if (this.items.some(i => i.fileName === item.file)) continue;

					const buf = await app._localFetch(base + item.file, false);
					if (!buf || (buf.byteLength !== undefined && buf.byteLength <= 0)) {
						console.warn('sky.json 贴图内容为空:', item.file);
						continue;
					}
					const b64 = app.arrayBufferToBase64(buf);
					if (b64 && b64.length > 10) {
						await this.addSkyItem(item.name, b64, item.file);
						added++;
						this.renderUI();
					}
				} catch (e) {
					console.warn('sky.json 贴图加载失败:', item.file, e);
				}
			}
			// 不 break：继续尝试其它候选 URL，兼容相对/绝对路径差异
		}

		return added;
	},

	/* ============================================================
	 * ★ 天空清单解析（同时支持 .hdr 与常见图片格式）
	 *   支持写法：
	 *     ["a.hdr", "b.jpg"]
	 *     { "skies": ["a.hdr", {"name":"黄昏","file":"sunset.hdr"}] }
	 *     { "sky": "...", "hdrs": [...], "images": [...] }
	 *     { "黄昏": "sunset.hdr", "夜景": "night.png" }
	 * ============================================================ */
	_parseManifest: function (json) {
		const list = [];
		const IMG_RE = /\.(hdr|exr|jpe?g|png|webp|gif|bmp|avif)$/i;

		const pushItem = (it) => {
			if (typeof it === 'string') {
				const f = it.trim();
				if (IMG_RE.test(f)) {
					list.push({ name: f.replace(/\.[^.]+$/, ''), file: f });
				}
				return;
			}
			if (it && typeof it === 'object') {
				const f = it.file || it.fileName || it.filename || it.path || it.url;
				if (f && IMG_RE.test(String(f))) {
					list.push({
						name: (it.name || it.title ||
							   String(f).replace(/.*\//, '').replace(/\.[^.]+$/, '')),
						file: String(f)
					});
				}
			}
		};

		if (Array.isArray(json)) {
			json.forEach(pushItem);
		} else if (json && typeof json === 'object') {
			// 兼容多种键名：优先取数组
			const arr = json.skies || json.sky || json.hdr || json.hdrs ||
						json.images || json.textures || json.environments ||
						json.list || json.files || json.items || json.data;
			if (Array.isArray(arr)) {
				arr.forEach(pushItem);
			} else {
				// 退化：把 { 名称: "文件" } 形式也解析
				Object.keys(json).forEach(k => {
					const v = json[k];
					if (typeof v === 'string' && IMG_RE.test(v)) {
						if (IMG_RE.test(k)) pushItem({ name: v, file: k });
						else                pushItem({ name: k, file: v });
					} else if (typeof v === 'string' && IMG_RE.test(k)) {
						pushItem({ name: v, file: k });
					} else if (v && typeof v === 'object' && !Array.isArray(v)) {
						const f = v.file || v.fileName || v.path || v.url;
						if (f && IMG_RE.test(String(f))) {
							pushItem({ name: v.name || k, file: f });
						}
					}
				});
			}
		}

		const seen = new Set();
		return list.filter(it => {
			const key = String(it.file || '').toLowerCase();
			if (!key || seen.has(key)) return false;
			seen.add(key);
			return IMG_RE.test(it.file);
		});
	},

        scanPlusDirs: function () {
            return new Promise((resolve) => {
                if (!window.plus || !window.plus.io) { resolve(0); return; }

                const dirs = ['_www/img/', '_doc/img/', '_downloads/img/', 'img/'];
                let totalNew = 0, totalFound = 0, finished = false;

                const finish = () => {
                    if (finished) return;
                    finished = true;
                    this.renderUI();
                    if (totalFound > 0) console.log(`img目录扫描完成: 发现${totalFound}个模型, 新增${totalNew}个`);
                    resolve(totalNew);
                };

                const loadAll = (all, done) => {
                    const glbs = all.filter(e => e.isFile && /\.(glb|gltf|fbx)$/i.test(e.name));
                    totalFound += glbs.length;
                    if (glbs.length === 0) { done(); return; }

                    this._hint(`🔍 发现 ${glbs.length} 个模型文件, 读取中... (已完成 ${totalNew})`);
                    let counter = 0;
                    const oneDone = () => { counter++; if (counter >= glbs.length) done(); };
                    const FR = window.plus.io.FileReader;

                    glbs.forEach(fe => {
                        try {
                            if (this.models.some(m => m.fileName === fe.name)) { oneDone(); return; }

                            fe.file((file) => {
                                try {
                                    const fr = new FR();
                                    fr.onloadend = async (evt) => {
                                        try {
                                            let r = evt.target.result || '';
                                            const ci = r.indexOf('base64,');
                                            const b64 = ci >= 0 ? r.substring(ci + 7) : r;
                                            if (b64 && b64.length > 10) {
                                                await this.addModel(fe.name.replace(/\.[^.]+$/, ''), b64, fe.name);
                                                totalNew++;
                                                this.renderUI();
                                                this._hint(`🔍 扫描中... 已加载 ${totalNew}/${totalFound}`);
                                            }
                                        } catch (err) { console.warn('读取失败:', fe.name, err); }
                                        oneDone();
                                    };
                                    fr.onerror = () => oneDone();
                                    fr.readAsDataURL(file);
                                } catch (e) { oneDone(); }
                            }, () => oneDone());
                        } catch (e) { oneDone(); }
                    });
                };

                const scanDir = (i) => {
                    if (finished) return;
                    if (i >= dirs.length) { finish(); return; }
                    const goNext = () => { if (!finished) scanDir(i + 1); };

                    try {
                        window.plus.io.resolveLocalFileSystemURL(dirs[i], (dirEntry) => {
                            if (finished) return;
                            try {
                                const reader = dirEntry.createReader();
                                const all = [];
                                const readBatch = () => {
                                    if (finished) return;
                                    reader.readEntries((entries) => {
                                        if (!entries || entries.length === 0) loadAll(all, goNext);
                                        else { all.push(...Array.prototype.slice.call(entries)); readBatch(); }
                                    }, goNext);
                                };
                                readBatch();
                            } catch (e) { goNext(); }
                        }, goNext);
                    } catch (e) { goNext(); }
                };

                try { scanDir(0); } catch (e) { finish(); }
                setTimeout(finish, 20000);
            });
        }
    },

    /* ============================================================
     *  ★ 天空球
     * ============================================================ */
    createSkySphere: function () {
        if (this.skySphere) {
            this.scene.remove(this.skySphere);
            this.skySphere.geometry.dispose();
            this.skySphere.material.dispose();
            this.skySphere = null;
        }

        const geo = new THREE.SphereGeometry(300, 48, 32);
        const mat = new THREE.MeshBasicMaterial({ side: THREE.BackSide, depthWrite: false, fog: false });
        const sky = new THREE.Mesh(geo, mat);
        sky.renderOrder = -10;
        sky.userData.isSkySphere = true;
        this.scene.add(sky);
        this.skySphere = sky;
        this.updateSkySphere();
    },

    _makeGradientSkyTexture: function (top, mid, bottom) {
        try {
            const c = document.createElement('canvas');
            c.width = 512; c.height = 256;
            const ctx = c.getContext('2d');
            const g = ctx.createLinearGradient(0, 0, 0, 256);
            g.addColorStop(0, top);
            if (mid) g.addColorStop(0.55, mid);
            g.addColorStop(1, bottom);
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, 512, 256);

            const tex = new THREE.CanvasTexture(c);
            tex.encoding = THREE.sRGBEncoding;
            return tex;
        } catch (e) { return null; }
    },

    _setGradientBackground: function (top, mid, bottom) {
        try {
            if (this.scene.background && this.scene.background.isTexture && this.scene.background.dispose) {
                try { this.scene.background.dispose(); } catch (e) {}
            }
            const tex = this._makeGradientSkyTexture(top, mid, bottom);
            if (tex) this.scene.background = tex;
        } catch (e) { console.warn('渐变背景设置失败:', e); }
    },

    updateSkySphere: function () {
        if (!this.skySphere) return;
        const mat = this.skySphere.material;

        if (this.skyTexture) {
            mat.map = this.skyTexture;
            mat.toneMapped = (this._skyIsHDR === true);
        } else if (this.customSkyGradient) {
            mat.map = this._makeGradientSkyTexture(this.customSkyGradient.top, this.customSkyGradient.mid, this.customSkyGradient.bottom);
            mat.toneMapped = false;
        } else {
            const t = this.BG_THEMES[this.currentTheme] || this.BG_THEMES.deep_space;
            mat.map = this._makeGradientSkyTexture(t.skyTop, t.skyMid, t.skyBottom);
            mat.toneMapped = false;
        }
        mat.needsUpdate = true;
    },

    toggleSkySphere: function () {
        this.skySphereVisible = !this.skySphereVisible;
        this.applyBackgroundTheme(this.currentTheme, false);
        this._updateSkyToggleBtn();
        this.saveSystem.saveToDB(true);
        this.saveSystem.showToast(this.skySphereVisible ?
            '🌐 天空球已显示' + (this.skyTexture ? ' (HDR贴图渲染中)' : '') :
            '🌐 天空球已隐藏: 渐变背景直接显示, HDR环境光照仍作用于模型');
    },

    _updateSkyToggleBtn: function () {
        const vis = this.skySphereVisible !== false;
        ['sysSkyToggle', 'envSkyToggle'].forEach(id => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.textContent = vis ? '🌐 天空球: 显示中 (点击隐藏HDR贴图)' : '🌐 天空球: 已隐藏 (点击显示HDR贴图)';
            btn.style.background = vis ? 'linear-gradient(135deg,#4361ee,#4cc9f0)' : '#555';
            btn.style.color = '#fff';
        });
    },

	/* ============================================================
	 * ★ 应用天空贴图（HDR / 图片通用） + 联动全局光照
	 *   - 天空/HDR 只作为环境补光，通过 envMapIntensity 受控
	 *   - 贴图变化后自动重算全局光照（灯具仍是主光源）
	 * ============================================================ */
	setSkyTexture: function (tex, isHDR) {
		if (!tex) return;

		tex.mapping = THREE.EquirectangularReflectionMapping;

		// 释放旧的 envRT
		if (this._envRT) { try { this._envRT.dispose(); } catch (e) {} this._envRT = null; }
		this.scene.environment = null;

		// PMREM 生成 IBL 反射贴图
		try {
			if (!this._pmrem) {
				this._pmrem = new THREE.PMREMGenerator(this.renderer);
				this._pmrem.compileEquirectangularShader();
			}
			const rt = this._pmrem.fromEquirectangular(tex);
			this.scene.environment = rt.texture;
			this._envRT = rt;
		} catch (e) {
			console.warn('PMREM环境生成失败, 降级为直接equirect:', e);
			this.scene.environment = tex;
		}

		this.skyTexture = tex;
		this._skyIsHDR = !!isHDR;

		// 天空球显示
		this.updateSkySphere();

		// ★ 关键：天空/HDR 加载后，统一用 lightConfig 的系数压缩环境补光
		try { this._recalculateGlobalLighting(this.currentFloor); } catch (e) {}

		// ★ 新建材质上的 envMapIntensity 需要重新应用一遍
		try {
			this._applyEnvMapIntensity(this.lightConfig.skyEnvInfluence *
				(this.lightConfig.enableAutoDim ? 1.0 : 1.0));
		} catch (e) {}
	},

	/* ============================================================
	 * ★ 清除天空 HDR 贴图（恢复渐变天空） + 联动全局光照
	 * ============================================================ */
	clearSkyTexture: function () {
		this.skyTexture = null;
		this._skyIsHDR = false;

		if (this._envRT) { try { this._envRT.dispose(); } catch (e) {} this._envRT = null; }
		this.scene.environment = null;

		this.skyLibrary.currentFileName = null;
		this.updateSkySphere();
		this.skyLibrary.renderUI();

		// ★ 环境光变化 → 重算全局光
		try { this._recalculateGlobalLighting(this.currentFloor); } catch (e) {}

		this.saveSystem.saveToDB(true);
		this.saveSystem.showToast('🚫 已清除HDR贴图, 使用渐变天空');
	},

	/* ============================================================
	 * ★ 从 base64 加载天空贴图（HDR 与普通图片共用）
	 *   - kind === 'hdr'  → RGBELoader
	 *   - kind === 'image'→ TextureLoader（含 sRGB 编码修正）
	 *   两者都返回可直接用于 equirectangular 反射的 Texture
	 * ============================================================ */
	loadSkyTextureFromBase64: function (base64, kind) {
		return new Promise((resolve, reject) => {
			try {
				if (!base64) { reject(new Error('数据为空')); return; }

				const ab = this.base64ToArrayBuffer(base64);
				const blob = new Blob([ab]);
				const url = URL.createObjectURL(blob);
				const cleanup = () => { try { URL.revokeObjectURL(url); } catch (e) {} };

				// 依据类型选取 loader
				const isHDR = (kind === 'hdr');

				if (isHDR) {
					if (typeof THREE.RGBELoader === 'undefined') {
						cleanup();
						reject(new Error('RGBELoader未加载(检查CDN网络)'));
						return;
					}
					const loader = new THREE.RGBELoader();
					loader.load(
						url,
						(tex) => {
							try {
								tex.mapping = THREE.EquirectangularReflectionMapping;
								if (THREE.sRGBEncoding !== undefined) {
									// HDR 使用线性空间，不设置 sRGB
									tex.encoding = THREE.LinearEncoding;
								}
							} catch (e) {}
							cleanup();
							resolve(tex);
						},
						undefined,
						(err) => { cleanup(); reject(err || new Error('HDR解析失败')); }
					);
				} else {
					const loader = new THREE.TextureLoader();
					loader.load(
						url,
						(tex) => {
							try {
								tex.mapping = THREE.EquirectangularReflectionMapping;
								if (THREE.sRGBEncoding !== undefined) {
									tex.encoding = THREE.sRGBEncoding;
								}
							} catch (e) {}
							cleanup();
							resolve(tex);
						},
						undefined,
						(err) => { cleanup(); reject(err || new Error('图片解析失败')); }
					);
				}
			} catch (e) { reject(e); }
		});
	},

    applySkyItem: async function (id) {
        const it = this.skyLibrary.items.find(i => i.id === id);
        if (!it) return;

        const status = document.getElementById('sysSkyStatus');
        const envStatus = document.getElementById('envSkyStatus');

        try {
            if (status) status.innerText = '⏳ 正在加载天空贴图: ' + it.fileName + ' ...';
            if (envStatus) envStatus.innerText = '⏳ 正在加载天空贴图: ' + it.fileName + ' ...';

            const tex = await this.loadSkyTextureFromBase64(it.base64, it.kind);
            this.setSkyTexture(tex, it.kind === 'hdr');
            this.skyLibrary.currentFileName = it.fileName;
            this.skyLibrary.renderUI();

            const okMsg = '✅ 已应用: ' + it.fileName + (it.kind === 'hdr' ? ' (HDR环境光照已启用' + (this.skySphereVisible === false ? ', 天空球隐藏中' : '') + ')' : ' (图片天空)');
            if (status) status.innerText = okMsg;
            if (envStatus) envStatus.innerText = okMsg;

            this.saveSystem.saveToDB(true);
            this.saveSystem.showToast('🌌 天空贴图已应用: ' + it.name);
        } catch (e) {
            console.error('天空贴图应用失败:', e);
            const errMsg = '❌ 加载失败: ' + it.fileName + ' - ' + (e.message || e);
            if (status) status.innerText = errMsg;
            if (envStatus) envStatus.innerText = errMsg;
            this.saveSystem.showToast('❌ 天空贴图加载失败: ' + (e.message || e));
        }
    },

    autoLoadSkyLibrary: async function (force) {
        if (this._skyAutoLoadStarted && !force) return;
        this._skyAutoLoadStarted = true;

        const status = (t) => {
            const el = document.getElementById('sysSkyStatus'); if (el) el.innerText = t;
            const el2 = document.getElementById('envSkyStatus'); if (el2) el2.innerText = t;
        };

        const hasPlus = await this._waitPlus(3000);

        try {
            status('🔍 正在读取 img/sky.json 清单...');
            const n1 = await this.skyLibrary.loadViaManifest();
            if (n1 > 0) { await this._skyLoadDone(); return; }
        } catch (e) { console.warn('sky.json 清单加载失败:', e); }

        if (hasPlus) {
            try {
                status('🔍 正在扫描 img 目录天空贴图...');
                const n2 = await this.skyLibrary.scanPlusDirs();
                if (n2 > 0) { await this._skyLoadDone(); return; }
            } catch (e) { console.warn('天空目录扫描失败:', e); }

            setTimeout(async () => {
                if (this._skyLoadDoneFlag) return;
                let n = 0;
                try { n += await this.skyLibrary.loadViaManifest(); } catch (e) {}
                try { n += await this.skyLibrary.scanPlusDirs(); } catch (e) {}
                if (n > 0) { await this._skyLoadDone(); return; }
                status('💡 img目录未发现天空贴图\n支持 .hdr 及 sky/天空命名图片, 或创建 img/sky.json');
            }, 5000);
        } else {
            try {
                const n = await this.skyLibrary.tryBrowserDefaults();
                if (n > 0) { await this._skyLoadDone(); return; }
            } catch (e) {}
            status('🌐 浏览器环境: 请通过HTTP服务访问 (img/sky.hdr 或 img/sky.json)');
        }
    },

    _skyLoadDone: async function () {
        this._skyLoadDoneFlag = true;
        const lib = this.skyLibrary;
        lib.renderUI();
        if (lib.items.length === 0) return;

        let target = null;
        if (lib.currentFileName) target = lib.items.find(i => i.fileName === lib.currentFileName);
        if (!target) target = lib.items.find(i => i.kind === 'hdr') || lib.items[0];
        if (target) await this.applySkyItem(target.id);
    },

	/* ============================================================
	 * ★ 应用背景主题 + 联动全局光照 / 灯具 / HDR 补光系数
	 *   - 主题只调节"环境色"，不抢灯具主光源地位
	 * ============================================================ */
	applyBackgroundTheme: function (key, coordinate) {
		const t = this.BG_THEMES[key];
		if (!t) return;

		this.currentTheme = key;
		if (key !== 'custom') this.customSkyGradient = null;

		const sphereHidden = (this.skySphereVisible === false);

		try {
			if (sphereHidden) {
				this._setGradientBackground(t.skyTop, t.skyMid, t.skyBottom);
				this._themeTween = null;
			} else {
				const targetColor = new THREE.Color(t.bg);
				const from = (this.scene.background && this.scene.background.isColor)
					? this.scene.background.clone() : targetColor.clone();
				this._themeTween = {
					from: from,
					to: targetColor.clone(),
					t0: performance.now(),
					dur: 900
				};
				if (!this.scene.background || !this.scene.background.isColor)
					this.scene.background = targetColor.clone();
			}

			const fogColor = new THREE.Color(t.bg);
			this.scene.fog = t.fog
				? new THREE.FogExp2(fogColor.getHex(), t.fog)
				: null;
		} catch (e) { console.warn('背景过渡设置失败:', e); }

		try {
			if (this.hemiLight) {
				this.hemiLight.color.set(t.hemiSky);
				this.hemiLight.groundColor.set(t.hemiGround);
			}
			if (this.dirLight) this.dirLight.color.set(t.dir);
		} catch (e) { console.warn('灯光协调失败:', e); }

		if (this.skySphere) this.skySphere.visible = !sphereHidden;
		this.updateSkySphere();

		// ★ 主题变化 → 重算全局光（灯具仍旧主导）
		try { this._recalculateGlobalLighting(this.currentFloor); } catch (e) {}

		if (coordinate) {
			const wallInput = document.getElementById('wallColor');
			let wallChanged = false;
			if (wallInput && wallInput.value.toLowerCase() !== t.wall.toLowerCase()) {
				wallInput.value = t.wall;
				wallChanged = true;
			}
			if (wallChanged) this.updateMaterials();

			this.saveSystem.saveToDB(true);
			this.saveSystem.showToast('🎨 已应用「' + t.name + '」, 墙体配色已同步协调');
		}

		if (typeof this.renderThemeGrid === 'function') this.renderThemeGrid();
		if (this.sysMenuReady) this.renderSysThemeGrid();
		try { this._updateSkyToggleBtn(); } catch (e) {}
	},

    updateThemeTween: function () {
        const tw = this._themeTween;
        if (!tw) return;

        let k = (performance.now() - tw.t0) / tw.dur;
        if (k >= 1) k = 1;
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;

        if (this.scene.background && this.scene.background.isColor) this.scene.background.copy(tw.from).lerp(tw.to, e);
        if (this.scene.fog) this.scene.fog.color.copy(tw.from).lerp(tw.to, e);
        if (k >= 1) this._themeTween = null;
    },

    renderThemeGrid: function () {
        const grids = document.querySelectorAll('#themeGrid, #envThemeGrid');
        if (!grids || grids.length === 0) return;

        grids.forEach(grid => {
            grid.innerHTML = '';
            Object.keys(this.BG_THEMES).forEach(key => {
                const t = this.BG_THEMES[key];
                const active = this.currentTheme === key;

                const card = document.createElement('div');
                card.style.cssText = 'position:relative;background:#25252b;border-radius:8px;padding:6px 4px;text-align:center;cursor:pointer;border:2px solid ' + (active ? 'var(--accent)' : 'transparent') + ';';

                const swatch = document.createElement('div');
                swatch.style.cssText = 'height:34px;border-radius:6px;background:linear-gradient(180deg,' + t.skyTop + ' 0%,' + t.skyMid + ' 55%,' + t.skyBottom + ' 100%);margin-bottom:4px;border:1px solid rgba(255,255,255,0.1);';

                const name = document.createElement('div');
                name.textContent = t.icon + ' ' + t.name;
                name.style.cssText = 'font-size:0.6rem;color:' + (active ? 'var(--accent)' : '#ccc') + ';';

                card.appendChild(swatch); card.appendChild(name);
                card.onclick = () => this.applyBackgroundTheme(key, true);
                grid.appendChild(card);
            });
        });
    },

    openThemeEditor: function () {
        if (this.isPlayMode) { this.openSystemMenu('theme'); return; }
        try { this.initGlobalEnvUI(); this.toggleGlobalSkySettings(true); } catch (e) {}

        const left = document.getElementById('sidebarLeft');
        const panel = document.getElementById('globalEnvPanel');
        if (window.innerWidth <= 768 && left && !left.classList.contains('open')) this.toggleMobileSidebar('left');

        const anchor = document.getElementById('globalSkyToggle');
        if (left && (anchor || panel)) {
            try { const target = anchor || panel; left.scrollTop = Math.max(0, target.offsetTop - 8); } catch (e) {}
        }
    },

    closeThemeEditor: function () {
        if (!this.isPlayMode) { this.toggleGlobalSkySettings(false); return; }
        const panel = document.getElementById('glassSidePanel');
        if (panel) panel.classList.remove('open');
    },

    /* ============================================================
     *  ★ 天空库
     * ============================================================ */
    skyLibrary: {
        items: [],
        currentFileName: null,

        rescan: function () {
            app._skyAutoLoadStarted = false;
            app._skyLoadDoneFlag = false;
            app.saveSystem.showToast('🔍 正在重新扫描 img 目录天空贴图...');
            app.autoLoadSkyLibrary(true);
        },

        renderUI: function () {
            if (typeof app !== 'undefined' && app.sysMenuReady && app.renderSysSkyList) { try { app.renderSysSkyList(); } catch (e) {} }
            if (typeof app !== 'undefined' && app.renderEnvSkyList) { try { app.renderEnvSkyList(); } catch (e) {} }
        },

        addSkyItem: async function (name, base64, fileName) {
            fileName = fileName || (name + '.hdr');
            if (this.items.some(i => i.fileName === fileName)) return null;

            const kind = /\.(hdr)$/i.test(fileName) ? 'hdr' : 'image';
            const it = {
                id: 'sky_' + Date.now() + '_' + Math.floor(Math.random() * 100000),
                name: name, fileName: fileName, kind: kind, base64: base64
            };

            this.items.push(it);
            this.renderUI();
            return it;
        },

        loadViaManifest: async function () {
            const candidates = ['img/sky.json', './img/sky.json', '/img/sky.json'];

            if (window.plus && window.plus.io && window.plus.io.convertLocalFileSystemURL) {
                ['_www/img/sky.json', '_doc/img/sky.json', '_downloads/img/sky.json'].forEach(p => {
                    try { const abs = window.plus.io.convertLocalFileSystemURL(p); if (abs) candidates.push(abs); } catch (e) {}
                });
            }

            let added = 0;
            for (const url of candidates) {
                let txt = '';
                try { txt = await app._localFetch(url, true); } catch (e) { continue; }
                if (!txt) continue;

                const t = txt.trim();
                if (t.length < 2 || (t[0] !== '{' && t[0] !== '[')) continue;

                let json;
                try { json = JSON.parse(t); } catch (e) { console.warn('sky.json 解析失败:', url, e); continue; }

                const list = this._parseManifest(json);
                if (list.length === 0) continue;

                console.log(`发现 sky.json (${url}): ${list.length} 个天空贴图`);
                const base = url.substring(0, url.lastIndexOf('/') + 1);

                for (const item of list) {
                    try {
                        if (this.items.some(i => i.fileName === item.file)) continue;
                        const buf = await app._localFetch(base + item.file, false);
                        const b64 = app.arrayBufferToBase64(buf);
                        if (b64 && b64.length > 10) { await this.addSkyItem(item.name, b64, item.file); added++; this.renderUI(); }
                    } catch (e) { console.warn('sky.json 贴图加载失败:', item.file, e); }
                }
                if (added > 0) break;
            }
            return added;
        },


	/* ============================================================
	 * ★ 新增：根据文件后缀判定天空贴图类型
	 *   - 'hdr' : 走 RGBELoader（IBL 环境光照）
	 *   - 'image' : 走 TextureLoader（普通图片天空球）
	 * ============================================================ */
	_detectSkyKind: function (fileName) {
		const m = String(fileName || '').toLowerCase().match(/\.([a-z0-9]+)$/);
		if (!m) return 'image';
		return (m[1] === 'hdr') ? 'hdr' : 'image';
	},

	addSkyItem: async function (name, base64, fileName) {
		fileName = fileName || (name + '.hdr');
		if (this.items.some(i => i.fileName === fileName)) return null;

		const kind = this._detectSkyKind(fileName);
		const it = {
			id: 'sky_' + Date.now() + '_' + Math.floor(Math.random() * 100000),
			name: name,
			fileName: fileName,
			kind: kind,          // 'hdr' | 'image'
			base64: base64
		};
		this.items.push(it);
		this.renderUI();
		return it;
	},

        _parseManifest: function (json) {
            const list = [];
            const pushItem = (it) => {
                if (typeof it === 'string') {
                    const f = it.trim();
                    if (/\.(hdr|jpe?g|png|webp)$/i.test(f)) list.push({ name: f.replace(/\.[^.]+$/, ''), file: f });
                } else if (it && typeof it === 'object') {
                    const f = it.file || it.fileName || it.filename || it.path || it.url;
                    if (f) list.push({
                        name: (it.name || it.title || String(f).replace(/.*\//, '').replace(/\.[^.]+$/, '')), file: String(f)
                    });
                }
            };

            if (Array.isArray(json)) json.forEach(pushItem);
            else if (json && typeof json === 'object') {
                const arr = json.skies || json.sky || json.list || json.files || json.items || json.data || json.hdr;
                if (Array.isArray(arr)) arr.forEach(pushItem);
                else {
                    Object.keys(json).forEach(k => {
                        const v = json[k];
                        if (typeof v === 'string' && /\.(hdr|jpe?g|png|webp)$/i.test(v)) pushItem({ name: k, file: v });
                        else if (typeof v === 'string' && /\.(hdr|jpe?g|png|webp)$/i.test(k)) pushItem({ name: v, file: k });
                        else if (v && typeof v === 'object' && !Array.isArray(v)) {
                            const f = v.file || v.fileName || v.path;
                            if (f) pushItem({ name: v.name || k, file: f });
                        }
                    });
                }
            }

            const seen = new Set();
            return list.filter(it => {
                const key = it.file.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return /\.(hdr|jpe?g|png|webp)$/i.test(it.file);
            });
        },

        tryBrowserDefaults: async function () {
            const names = ['sky.hdr', 'sky.jpg', 'sky.png', 'sky.webp', 'skybox.hdr', 'skybox.jpg', 'hdri.hdr', 'background.jpg', 'bg.jpg', '天空.hdr', '天空.jpg', '天空.png'];
            let added = 0;

            for (const n of names) {
                try {
                    const buf = await app._localFetch('img/' + n, false);
                    const b64 = app.arrayBufferToBase64(buf);
                    if (b64 && b64.length > 100) { await this.addSkyItem(n.replace(/\.[^.]+$/, ''), b64, n); added++; break; }
                } catch (e) {}
            }
            return added;
        },

        scanPlusDirs: function () {
            return new Promise((resolve) => {
                if (!window.plus || !window.plus.io) { resolve(0); return; }

                const dirs = ['_www/img/', '_doc/img/', '_downloads/img/', 'img/'];
                let totalNew = 0, totalFound = 0, finished = false;

				/* ============================================================
				 * ★ 天空贴图文件识别（放宽策略）
				 *   1) .hdr / .exr → 一定是 HDR
				 *   2) 图片且文件名含 sky/天空/背景/hdri/env/scene → 视为天空
				 *   3) img 目录下的其他图片：只有通过 sky.json 显式声明才加载，
				 *      避免把无关图片（家具贴图等）误当天空球
				 * ============================================================ */
				const isSkyFile = (name) => {
					if (/\.(hdr|exr)$/i.test(name)) return true;
					if (/\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(name) &&
						/(sky|天空|背景|background|hdri|env|scene|panorama)/i.test(name)) return true;
					return false;
				};

                const finish = () => {
                    if (finished) return;
                    finished = true;
                    this.renderUI();
                    if (totalFound > 0) console.log(`img目录天空贴图扫描: 发现${totalFound}个, 新增${totalNew}个`);
                    resolve(totalNew);
                };

                const loadAll = (all, done) => {
                    const files = all.filter(e => e.isFile && isSkyFile(e.name));
                    totalFound += files.length;
                    if (files.length === 0) { done(); return; }

                    const status = document.getElementById('sysSkyStatus');
                    const envStatus = document.getElementById('envSkyStatus');
                    if (status) status.innerText = `🔍 发现 ${files.length} 个天空贴图, 读取中... (已完成 ${totalNew})`;
                    if (envStatus) envStatus.innerText = `🔍 发现 ${files.length} 个天空贴图, 读取中... (已完成 ${totalNew})`;

                    let counter = 0;
                    const oneDone = () => { counter++; if (counter >= files.length) done(); };
                    const FR = window.plus.io.FileReader;

                    files.forEach(fe => {
                        try {
                            if (this.items.some(i => i.fileName === fe.name)) { oneDone(); return; }

                            fe.file((file) => {
                                try {
                                    const fr = new FR();
                                    fr.onloadend = async (evt) => {
                                        try {
                                            let r = evt.target.result || '';
                                            const ci = r.indexOf('base64,');
                                            const b64 = ci >= 0 ? r.substring(ci + 7) : r;
                                            if (b64 && b64.length > 10) {
                                                await this.addSkyItem(fe.name.replace(/\.[^.]+$/, ''), b64, fe.name);
                                                totalNew++;
                                                this.renderUI();
                                            }
                                        } catch (err) { console.warn('天空贴图读取失败:', fe.name, err); }
                                        oneDone();
                                    };
                                    fr.onerror = () => oneDone();
                                    fr.readAsDataURL(file);
                                } catch (e) { oneDone(); }
                            }, () => oneDone());
                        } catch (e) { oneDone(); }
                    });
                };

                const scanDir = (i) => {
                    if (finished) return;
                    if (i >= dirs.length) { finish(); return; }
                    const goNext = () => { if (!finished) scanDir(i + 1); };

                    try {
                        window.plus.io.resolveLocalFileSystemURL(dirs[i], (dirEntry) => {
                            if (finished) return;
                            try {
                                const reader = dirEntry.createReader();
                                const all = [];
                                const readBatch = () => {
                                    if (finished) return;
                                    reader.readEntries((entries) => {
                                        if (!entries || entries.length === 0) loadAll(all, goNext);
                                        else { all.push(...Array.prototype.slice.call(entries)); readBatch(); }
                                    }, goNext);
                                };
                                readBatch();
                            } catch (e) { goNext(); }
                        }, goNext);
                    } catch (e) { goNext(); }
                };

                try { scanDir(0); } catch (e) { finish(); }
                setTimeout(finish, 20000);
            });
        }
    },

    /* ============================================================
     *  ★ 系统菜单
     * ============================================================ */
    _injectSysStyles: function () {
        if (document.getElementById('sysInjectedStyles')) return;
        const s = document.createElement('style');
        s.id = 'sysInjectedStyles';
        s.textContent =
            '@keyframes sysPopIn{0%{opacity:0;transform:scale(0.85) translateY(24px);}100%{opacity:1;transform:scale(1) translateY(0);}}' +
            '@keyframes sysFadeIn{from{opacity:0;}to{opacity:1;}}' +
            '@keyframes sysCoverSpin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}' +
            '@keyframes sysPaneIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}' +
            '#sysPanelMenuRoot button{transition:all 0.2s ease;}' +
            '#sysPanelMenuRoot button:active{transform:scale(0.94);}' +
            '#sysMusicVolume{-webkit-appearance:none;appearance:none;}' +
            '#sysMusicVolume::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;background:linear-gradient(135deg,#3498db,#2ecc71);border-radius:50%;cursor:pointer;box-shadow:0 0 6px rgba(52,152,219,0.6);}' +
            '#sysMusicVolume::-moz-range-thumb{width:14px;height:14px;background:#3498db;border:none;border-radius:50%;cursor:pointer;}' +
            '.sys-hist-item{display:flex;justify-content:space-between;align-items:center;padding:5px 8px;border-radius:7px;margin-bottom:3px;background:rgba(255,255,255,0.05);cursor:pointer;font-size:0.65rem;color:#ddd;transition:background 0.15s ease;}' +
            '.sys-hist-item:hover{background:rgba(76,201,240,0.15);}' +
            '.sys-hist-item:active{transform:scale(0.98);}';
        document.head.appendChild(s);
    },

    setupSystemMenuUI: function () {
        const playUI = document.getElementById('playUI');
        if (!playUI) return;

        const panel = document.getElementById('glassSidePanel');
        if (panel) this._buildSidePanelMenu(panel);

        const btn = playUI.querySelector('.sensor-mgr-btn');
        if (btn) {
            btn.textContent = '📡 编辑传感器实体';
            btn.title = '打开系统菜单 · 传感器管理';
            btn.onclick = () => this.openSystemMenu('sensor');
        }

        playUI.querySelectorAll('.theme-mgr-btn').forEach(b => { b.style.display = 'none'; });

        if (!this.sysMenuReady) {
            this.sysMenuReady = true;
            this.renderSysThemeGrid();
            this.renderSysSkyList();
            this.sysRenderSensorTab();
            this.renderCustomPalette();
            this._updateSkyToggleBtn();
            this.musicPlayer.refreshUI();
        }
    },

    _buildSidePanelMenu: function (panel) {
        if (!panel || panel.dataset.sysEnhanced) return;
        this._injectSysStyles();

        const root = document.createElement('div');
        root.id = 'sysPanelMenuRoot';
        root.style.cssText = 'margin-top:14px;animation:sysFadeIn 0.35s ease;';
        root.innerHTML = `
<div id="sysTabBar" style="display:flex;gap:6px;margin-bottom:12px;">
<button id="sysTabBtnMusic" class="sys-tab-btn" style="flex:1;padding:8px 2px;border:none;border-radius:10px;background:rgba(255,255,255,0.08);color:#bbb;font-size:0.68rem;cursor:pointer;font-weight:600;">🎵 播放器</button>
<button id="sysTabBtnSensor" class="sys-tab-btn" style="flex:1;padding:8px 2px;border:none;border-radius:10px;background:rgba(255,255,255,0.08);color:#bbb;font-size:0.68rem;cursor:pointer;font-weight:600;">📡 传感器</button>
<button id="sysTabBtnTheme" class="sys-tab-btn" style="flex:1;padding:8px 2px;border:none;border-radius:10px;background:rgba(255,255,255,0.08);color:#bbb;font-size:0.68rem;cursor:pointer;font-weight:600;">🎨 背景</button>
</div>
<div id="sysTabMusic" class="sys-pane" style="display:none;animation:sysPaneIn 0.25s ease;">
<div id="sysMusicCoverWrap" class="sys-music-cover-wrap" style="width:118px;height:118px;margin:2px auto 12px;border-radius:50%;overflow:hidden;box-shadow:0 10px 26px rgba(0,0,0,0.5),0 0 0 5px rgba(255,255,255,0.06);animation:sysCoverSpin 20s linear infinite;animation-play-state:paused;">
<img id="sysMusicCover" src="https://picsum.photos/seed/music/300/300.jpg" style="width:100%;height:100%;object-fit:cover;display:block;" alt="专辑封面">
</div>
<div style="text-align:center;margin-bottom:10px;">
<div id="sysMusicName" style="font-size:0.8rem;font-weight:600;color:#fff;">网易云音乐 · 随机畅听</div>
<div style="font-size:0.6rem;color:#888;margin-top:3px;">状态: <span id="sysMusicStatus">未播放</span> · ID: <span id="sysMusicId">--</span></div>
</div>
<div id="sysMusicProgressWrap" style="width:100%;height:7px;background:rgba(255,255,255,0.12);border-radius:4px;margin-bottom:6px;cursor:pointer;position:relative;overflow:hidden;">
<div id="sysMusicProgress" style="height:100%;background:linear-gradient(90deg,#3498db,#2ecc71);border-radius:4px;width:0%;"></div>
</div>
<div style="display:flex;justify-content:space-between;font-size:0.62rem;color:rgba(255,255,255,0.6);margin-bottom:12px;">
<span id="sysMusicCur">0:00</span><span id="sysMusicDur">0:00</span>
</div>
<div style="display:flex;justify-content:center;align-items:center;gap:14px;margin-bottom:10px;">
<button id="sysMusicPrev" title="上一曲" style="width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,0.1);color:#fff;border:none;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;">⏮</button>
<button id="sysMusicPlayToggle" title="播放 / 暂停" style="width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,#3498db,#2ecc71);color:#fff;border:none;font-size:1.25rem;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(52,152,219,0.45);line-height:1;">▶</button>
<button id="sysMusicNext" title="下一曲" style="width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,0.1);color:#fff;border:none;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;">⏭</button>
</div>
<div style="display:flex;gap:6px;margin-bottom:8px;">
<button id="sysMusicLoop" title="单曲循环 开/关" style="flex:1;padding:7px 4px;border:none;border-radius:8px;background:rgba(255,255,255,0.1);color:#fff;font-size:0.66rem;cursor:pointer;font-weight:600;">🔁 单曲循环</button>
<button id="sysMusicHistBtn" title="播放历史记录" style="flex:1;padding:7px 4px;border:none;border-radius:8px;background:rgba(255,255,255,0.1);color:#fff;font-size:0.66rem;cursor:pointer;font-weight:600;">🕘 历史(0)</button>
</div>
<div id="sysMusicHistoryPanel" style="display:none;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:8px;margin-bottom:8px;background:rgba(0,0,0,0.2);">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
<span style="font-size:0.66rem;color:var(--accent);font-weight:600;">🕘 播放历史 (点击条目播放)</span>
<button id="sysMusicHistClear" style="background:rgba(230,57,70,0.2);color:#e63946;border:1px solid rgba(230,57,70,0.4);border-radius:5px;padding:2px 8px;font-size:0.58rem;cursor:pointer;">🗑️ 清空</button>
</div>
<div id="sysMusicHistoryList" style="max-height:150px;overflow-y:auto;"></div>
</div>
<div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:8px;">
<span id="sysMusicVolIcon" style="color:rgba(255,255,255,0.75);font-size:0.85rem;line-height:1;">🔊</span>
<input id="sysMusicVolume" type="range" min="0" max="100" value="80" style="width:140px;height:5px;background:rgba(255,255,255,0.2);border-radius:5px;outline:none;cursor:pointer;">
</div>
<div style="font-size:0.58rem;color:#777;text-align:center;word-break:break-all;">歌曲地址: <a id="sysMusicUrl" href="#" target="_blank" style="color:#3498db;text-decoration:none;">暂无</a></div>
<div style="font-size:0.55rem;color:#666;text-align:center;margin-top:6px;line-height:1.5;">💡 随机播放, 失效自动连续切歌直到成功<br>(iOS/https环境受浏览器自动播放策略限制)</div>
</div>
<div id="sysTabSensor" class="sys-pane" style="display:none;animation:sysPaneIn 0.25s ease;">
<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
<label style="color:#aaa;font-size:0.72rem;flex-shrink:0;">楼层:</label>
<select id="sysSensorFloor" style="flex:1;background:#1a1a22;border:1px solid #3a3a44;color:#fff;padding:5px 8px;border-radius:8px;font-size:0.72rem;outline:none;"></select>
</div>
<div id="sysSensorList" style="max-height:170px;overflow-y:auto;margin-bottom:10px;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:8px;"></div>
<div style="border-top:1px dashed rgba(255,255,255,0.12);padding-top:10px;">
<input id="sysSensorEntityId" type="text" placeholder="Entity ID (如: sensor.temp_living)" style="width:100%;background:#1a1a22;border:1px solid #3a3a44;color:#fff;padding:6px 8px;border-radius:8px;font-size:0.7rem;outline:none;margin-bottom:6px;">
<div style="display:flex;gap:6px;margin-bottom:6px;">
<input id="sysSensorName" type="text" placeholder="名称" style="flex:1;min-width:0;background:#1a1a22;border:1px solid #3a3a44;color:#fff;padding:6px 8px;border-radius:8px;font-size:0.7rem;outline:none;">
<select id="sysSensorType" style="flex:1.4;min-width:0;background:#1a1a22;border:1px solid #3a3a44;color:#fff;padding:6px 4px;border-radius:8px;font-size:0.68rem;outline:none;"></select>
</div>
<button id="sysSensorAdd" style="width:100%;background:linear-gradient(135deg,#4361ee,#4cc9f0);border:none;color:#fff;padding:9px;border-radius:8px;font-size:0.78rem;cursor:pointer;font-weight:bold;">➕ 添加传感器</button>
</div>
</div>
<div id="sysTabTheme" class="sys-pane" style="display:none;animation:sysPaneIn 0.25s ease;">
<div style="font-size:0.6rem;color:#888;margin-bottom:8px;line-height:1.5;">点击风格卡片即应用 → 背景缓动过渡 + 自动协调墙体 / 灯光 / 天空球</div>
<div id="sysThemeGrid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;"></div>
<div style="margin:10px 0 4px;">
<button id="sysSkyToggle" style="width:100%;background:linear-gradient(135deg,#4361ee,#4cc9f0);color:#fff;border:none;border-radius:8px;padding:8px;font-size:0.68rem;cursor:pointer;font-weight:600;">🌐 天空球: 显示中 (点击隐藏HDR贴图)</button>
</div>
<div style="border-top:1px dashed rgba(255,255,255,0.12);margin:10px 0 10px;padding-top:10px;">
<div style="font-size:0.75rem;color:var(--accent);font-weight:600;margin-bottom:4px;">🌌 天空球 HDR 贴图</div>
<div id="sysSkyGrid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px;"></div>
<div style="display:flex;gap:6px;">
<button id="sysSkyRescan" style="flex:1;background:#333;color:#fff;border:none;border-radius:8px;padding:7px;font-size:0.68rem;cursor:pointer;">🔄 重扫</button>
<button id="sysSkyClear" style="flex:1;background:#333;color:#fff;border:none;border-radius:8px;padding:7px;font-size:0.68rem;cursor:pointer;">🚫 清除HDR</button>
</div>
<div id="sysSkyStatus" style="font-size:0.58rem;color:#888;margin-top:6px;text-align:center;line-height:1.5;">🔍 正在扫描 img 目录...</div>
</div>
<div style="border-top:1px dashed rgba(255,255,255,0.12);margin:10px 0 0;padding-top:10px;">
<div style="font-size:0.75rem;color:var(--accent);font-weight:600;margin-bottom:4px;">🎛️ 自定义调色板</div>
<div class="sys-pal-row" style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
<span style="width:66px;font-size:0.62rem;color:#aaa;flex-shrink:0;">🌌 场景背景</span>
<input type="color" id="palBg" value="#0a0a0f" style="flex:1;height:26px;border:none;background:none;cursor:pointer;padding:0;">
</div>
<div class="sys-pal-row" style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
<span style="width:66px;font-size:0.62rem;color:#aaa;flex-shrink:0;">🌄 天空顶部</span>
<input type="color" id="palSkyTop" value="#050810" style="flex:1;height:26px;border:none;background:none;cursor:pointer;padding:0;">
</div>
<div class="sys-pal-row" style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
<span style="width:66px;font-size:0.62rem;color:#aaa;flex-shrink:0;">🌤️ 天空中部</span>
<input type="color" id="palSkyMid" value="#0c1022" style="flex:1;height:26px;border:none;background:none;cursor:pointer;padding:0;">
</div>
<div class="sys-pal-row" style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
<span style="width:66px;font-size:0.62rem;color:#aaa;flex-shrink:0;">🌇 天空底部</span>
<input type="color" id="palSkyBottom" value="#161b2e" style="flex:1;height:26px;border:none;background:none;cursor:pointer;padding:0;">
</div>
<div class="sys-pal-row" style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
<span style="width:66px;font-size:0.62rem;color:#aaa;flex-shrink:0;">🧱 协调墙体</span>
<input type="color" id="palWall" value="#e0e0e0" style="flex:1;height:26px;border:none;background:none;cursor:pointer;padding:0;">
</div>
<div style="display:flex;gap:6px;">
<button id="palApply" style="flex:2;background:linear-gradient(135deg,#f7b731,#e67e22);color:#000;border:none;border-radius:8px;padding:8px;font-size:0.7rem;cursor:pointer;font-weight:bold;">✅ 应用调色板</button>
<button id="palReset" style="flex:1;background:#333;color:#fff;border:none;border-radius:8px;padding:8px;font-size:0.68rem;cursor:pointer;">↺ 还原</button>
</div>
</div>
</div>`;

        panel.appendChild(root);

        document.getElementById('sysTabBtnMusic').onclick = () => this.toggleSysPane('music');
        document.getElementById('sysTabBtnSensor').onclick = () => this.toggleSysPane('sensor');
        document.getElementById('sysTabBtnTheme').onclick = () => this.toggleSysPane('theme');
        document.getElementById('sysSkyToggle').onclick = () => this.toggleSkySphere();
        document.getElementById('sysSkyRescan').onclick = () => this.skyLibrary.rescan();
        document.getElementById('sysSkyClear').onclick = () => this.clearSkyTexture();
        document.getElementById('sysSensorFloor').onchange = () => this.sysRenderSensorList();
        document.getElementById('sysSensorAdd').onclick = () => this.sysAddSensor();

        this._fillSensorTypeSelect(document.getElementById('sysSensorType'));

        document.getElementById('sysMusicPrev').onclick = () => this.musicPlayer.prev();
        document.getElementById('sysMusicNext').onclick = () => this.musicPlayer.next();
        document.getElementById('sysMusicPlayToggle').onclick = () => this.musicPlayer.togglePlay();
        document.getElementById('sysMusicLoop').onclick = () => this.musicPlayer.toggleLoop();
        document.getElementById('sysMusicHistBtn').onclick = () => this.musicPlayer.toggleHistory();
        document.getElementById('sysMusicHistClear').onclick = () => this.musicPlayer.clearHistory();
        document.getElementById('sysMusicVolume').addEventListener('input', (e) => this.musicPlayer.setVolume(e.target.value));

        const pw = document.getElementById('sysMusicProgressWrap');
        pw.addEventListener('click', (e) => this.musicPlayer.seek(e));
        pw.addEventListener('touchstart', (e) => { e.preventDefault(); this.musicPlayer.seek(e); }, { passive: false });

        ['palBg', 'palSkyTop', 'palSkyMid', 'palSkyBottom', 'palWall'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => this.previewPalette());
        });
        document.getElementById('palApply').onclick = () => this.applyCustomPalette();
        document.getElementById('palReset').onclick = () => this.resetCustomPalette();

        panel.dataset.sysEnhanced = '1';
    },

    _fillSensorTypeSelect: function (select) {
        if (!select) return;
        select.innerHTML = '';
        this.SENSOR_TYPE_GROUPS.forEach(g => {
            const og = document.createElement('optgroup');
            og.label = g.label;
            g.keys.forEach(k => {
                const meta = this.SENSOR_TYPES[k];
                if (!meta) return;
                const opt = document.createElement('option');
                opt.value = k;
                opt.textContent = `${meta.icon} ${meta.name}`;
                og.appendChild(opt);
            });
            select.appendChild(og);
        });
    },

    toggleSysPane: function (tab, forceOpen) {
        const idMap = { 'music': 'sysTabMusic', 'sensor': 'sysTabSensor', 'theme': 'sysTabTheme' };
        const pane = document.getElementById(idMap[tab]);
        if (!pane) return;
        const isVisible = pane.style.display === 'block';
        const willShow = (forceOpen !== undefined) ? forceOpen : !isVisible;
        pane.style.display = willShow ? 'block' : 'none';
        this._setTabActive(tab, willShow);
    },

    closeAllPanes: function () {
        const idMap = { 'music': 'sysTabMusic', 'sensor': 'sysTabSensor', 'theme': 'sysTabTheme' };
        for (let key in idMap) {
            const el = document.getElementById(idMap[key]);
            if (el) el.style.display = 'none';
            this._setTabActive(key, false);
        }
    },

    _setTabActive: function (tab, active) {
        const btnMap = { 'music': 'sysTabBtnMusic', 'sensor': 'sysTabBtnSensor', 'theme': 'sysTabBtnTheme' };
        const btn = document.getElementById(btnMap[tab]);
        if (!btn) return;
        if (active) {
            btn.style.background = 'linear-gradient(135deg,#4cc9f0,#4361ee)';
            btn.style.color = '#fff';
            btn.style.boxShadow = '0 0 12px rgba(76,201,240,0.5)';
        } else {
            btn.style.background = 'rgba(255,255,255,0.08)';
            btn.style.color = '#bbb';
            btn.style.boxShadow = 'none';
        }
    },

    openSystemMenu: function (tab) {
        this.setupSystemMenuUI();
        if (this.sysMenuReady) this.sysRenderSensorTab();
        const panel = document.getElementById('glassSidePanel');
        if (panel) panel.classList.add('open');
        this.closeAllPanes();
        if (tab) { this.toggleSysPane(tab, true); this._sysActiveTab = tab; }
    },

    closeSystemMenu: function () {
        const panel = document.getElementById('glassSidePanel');
        if (panel) panel.classList.remove('open');
    },

    switchSysTab: function (tab) {
        this.closeAllPanes();
        this.toggleSysPane(tab, true);
        this._sysActiveTab = tab;
    },

    renderSysThemeGrid: function () {
        const grid = document.getElementById('sysThemeGrid');
        if (!grid) return;
        grid.innerHTML = '';

        Object.keys(this.BG_THEMES).forEach(key => {
            const t = this.BG_THEMES[key];
            const active = this.currentTheme === key;

            const card = document.createElement('div');
            card.style.cssText = 'background:#23252e;border-radius:10px;padding:6px 4px;text-align:center;cursor:pointer;border:2px solid ' + (active ? 'var(--accent)' : 'rgba(255,255,255,0.08)') + ';' + (active ? 'box-shadow:0 0 12px rgba(76,201,240,0.4);' : '');

            const swatch = document.createElement('div');
            swatch.style.cssText = 'height:32px;border-radius:7px;background:linear-gradient(180deg,' + t.skyTop + ' 0%,' + t.skyMid + ' 55%,' + t.skyBottom + ' 100%);margin-bottom:4px;border:1px solid rgba(255,255,255,0.12);';

            const name = document.createElement('div');
            name.textContent = t.icon + ' ' + t.name;
            name.style.cssText = 'font-size:0.58rem;color:' + (active ? 'var(--accent)' : '#bbb') + ';font-weight:' + (active ? 'bold' : 'normal') + ';';

            card.appendChild(swatch); card.appendChild(name);
            card.onclick = () => this.applyBackgroundTheme(key, true);
            grid.appendChild(card);
        });
    },

    renderSysSkyList: function () {
        const grid = document.getElementById('sysSkyGrid');
        const status = document.getElementById('sysSkyStatus');
        if (!grid) return;
        grid.innerHTML = '';

        const items = this.skyLibrary.items;
        if (items.length === 0) {
            if (status) status.innerText = this._skyAutoLoadStarted && !this._skyLoadDoneFlag ? '🔍 正在扫描 img 目录...' : '💡 img目录暂无天空贴图: 支持 .hdr / sky命名图片 / img/sky.json';
            return;
        }

        items.forEach(it => {
            const active = this.skyLibrary.currentFileName === it.fileName;
            const card = document.createElement('div');
            card.style.cssText = 'background:#23252e;border-radius:9px;padding:6px 4px;text-align:center;cursor:pointer;border:2px solid ' + (active ? 'var(--accent)' : 'rgba(255,255,255,0.08)') + ';min-height:46px;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;' + (active ? 'box-shadow:0 0 10px rgba(76,201,240,0.35);' : '');

            const icon = document.createElement('div');
            icon.textContent = it.kind === 'hdr' ? '🔆' : '🖼️';
            icon.style.cssText = 'font-size:0.95rem;line-height:1.3;';

            const name = document.createElement('div');
            name.textContent = it.name;
            name.style.cssText = 'font-size:0.52rem;color:#aaa;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';

            card.appendChild(icon); card.appendChild(name);
            card.onclick = () => this.applySkyItem(it.id);
            grid.appendChild(card);
        });

        if (status) status.innerText = this.skyLibrary.currentFileName ? ('✅ 当前: ' + this.skyLibrary.currentFileName) : ('🔍 发现 ' + items.length + ' 个天空贴图, 点击应用');
    },

    renderCustomPalette: function () {
        const src = this.BG_THEMES.custom || this.BG_THEMES[this.currentTheme] || this.BG_THEMES.deep_space;
        const set = (ids, v) => { ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = v; }); };
        set(['palBg', 'envPalBg'], src.bg);
        set(['palSkyTop', 'envPalSkyTop'], src.skyTop);
        set(['palSkyMid', 'envPalSkyMid'], src.skyMid);
        set(['palSkyBottom', 'envPalSkyBottom'], src.skyBottom);
        set(['palWall', 'envPalWall'], src.wall);
    },

    previewPalette: function () {
        const bg = this._palGet(['envPalBg', 'palBg']);
        const top = this._palGet(['envPalSkyTop', 'palSkyTop']);
        const mid = this._palGet(['envPalSkyMid', 'palSkyMid']);
        const bottom = this._palGet(['envPalSkyBottom', 'palSkyBottom']);

        try {
            if (bg && this.scene) {
                if (this.skySphereVisible === false) {
                    const cur = this.customSkyGradient || {};
                    const t = this.BG_THEMES[this.currentTheme] || this.BG_THEMES.deep_space;
                    this._setGradientBackground(top || cur.top || t.skyTop, mid || cur.mid || t.skyMid, bottom || cur.bottom || t.skyBottom);
                } else if (!this.scene.background || !this.scene.background.isColor) this.scene.background = new THREE.Color(bg);
                else this.scene.background.set(bg);
            }
        } catch (e) {}

        if (top || mid || bottom) {
            const cur = this.customSkyGradient || {};
            const t = this.BG_THEMES[this.currentTheme] || this.BG_THEMES.deep_space;
            this.customSkyGradient = { top: top || cur.top || t.skyTop, mid: mid || cur.mid || t.skyMid, bottom: bottom || cur.bottom || t.skyBottom };
            this.updateSkySphere();
        }
    },

    applyCustomPalette: function () {
        this.BG_THEMES['custom'] = {
            name: '自定义', icon: '🎛️',
            bg: this._palGet(['envPalBg', 'palBg']) || '#0a0a0f',
            skyTop: this._palGet(['envPalSkyTop', 'palSkyTop']) || '#050810',
            skyMid: this._palGet(['envPalSkyMid', 'palSkyMid']) || '#0c1022',
            skyBottom: this._palGet(['envPalSkyBottom', 'palSkyBottom']) || '#161b2e',
            wall: this._palGet(['envPalWall', 'palWall']) || '#e0e0e0',
            hemiSky: '#ffffff', hemiGround: '#444444', dir: '#ffffff', fog: null
        };
        this.customSkyGradient = null;
        this.applyBackgroundTheme('custom', true);
        this.renderSysThemeGrid();
        this.saveSystem.saveToDB(true);
        this.saveSystem.showToast('🎛️ 自定义调色板已应用并持久化');
    },

    resetCustomPalette: function () {
        delete this.BG_THEMES['custom'];
        this.customSkyGradient = null;
        const fallback = (this.currentTheme === 'custom' || !this.BG_THEMES[this.currentTheme]) ? 'deep_space' : this.currentTheme;
        this.applyBackgroundTheme(fallback, true);
        this.renderCustomPalette();
        this.renderSysThemeGrid();
        this.saveSystem.saveToDB(true);
        this.saveSystem.showToast('↺ 已还原为「' + (this.BG_THEMES[fallback] ? this.BG_THEMES[fallback].name : fallback) + '」主题默认');
    },

    sysRenderSensorTab: function () {
        const floorSel = document.getElementById('sysSensorFloor');
        if (!floorSel) return;

        const prev = floorSel.value;
        floorSel.innerHTML = '';

        for (let i = 0; i < this.floorShapes.length; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = (i + 1) + '层';
            floorSel.appendChild(opt);
        }

        if (prev !== '' && parseInt(prev) < this.floorShapes.length) floorSel.value = prev;
        else if (this.isPlayMode && this.playModeFloor >= 0 && this.playModeFloor < this.floorShapes.length) floorSel.value = this.playModeFloor;

        this.sysRenderSensorList();
    },

    sysRenderSensorList: function () {
        const floorSel = document.getElementById('sysSensorFloor');
        const container = document.getElementById('sysSensorList');
        if (!floorSel || !container) return;

        const floorIdx = parseInt(floorSel.value);
        if (isNaN(floorIdx)) return;

        if (!this.sensorEntities[floorIdx]) this.sensorEntities[floorIdx] = [];

        container.innerHTML = '';
        const list = this.sensorEntities[floorIdx];

        if (list.length === 0) {
            container.innerHTML = `<div style="color:#888;text-align:center;padding:12px;font-size:0.72rem;">该层暂无传感器, 请在下方添加</div>`;
            return;
        }

        list.forEach((item, idx) => {
            const meta = this.SENSOR_TYPES[item.type] || this.SENSOR_TYPES.other;
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.05);padding:6px 10px;border-radius:8px;margin-bottom:4px;border-left:3px solid var(--accent);font-size:0.7rem;gap:8px;';

            const info = document.createElement('div');
            info.style.cssText = 'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
            info.innerHTML = `<span>${meta.icon} ${item.name}</span> <span style="color:#888;font-size:0.55rem;font-family:monospace;margin-left:6px;">${item.entityId} · ${meta.name}</span>`;

            const del = document.createElement('button');
            del.textContent = '删除';
            del.style.cssText = 'background:var(--danger);color:#fff;border:none;border-radius:5px;padding:3px 10px;font-size:0.6rem;cursor:pointer;flex-shrink:0;';
            del.onclick = () => this.sysRemoveSensor(floorIdx, idx);

            row.appendChild(info); row.appendChild(del);
            container.appendChild(row);
        });
    },

    sysAddSensor: function () {
        const floorSel = document.getElementById('sysSensorFloor');
        const entityIdEl = document.getElementById('sysSensorEntityId');
        const nameEl = document.getElementById('sysSensorName');
        const typeEl = document.getElementById('sysSensorType');
        if (!floorSel || !entityIdEl) return;

        const floorIdx = parseInt(floorSel.value);
        const entityId = entityIdEl.value.trim();
        const name = nameEl.value.trim() || entityId;
        const type = typeEl.value;

        if (!this._addSensorCore(floorIdx, entityId, name, type)) return;

        entityIdEl.value = ''; nameEl.value = '';
        this.sysRenderSensorList();
        this.renderSensorEditor();
        this.saveSystem.showToast(`✅ 已添加传感器: ${name}`);
        this.saveSystem.saveToDB();
        this.fetchSensorData(entityId);
        if (this.isPlayMode) this.updateSensorDisplay();
    },

    sysRemoveSensor: function (floorIdx, index) {
        if (!this.sensorEntities[floorIdx]) return;
        this.sensorEntities[floorIdx].splice(index, 1);
        this.sysRenderSensorList();
        this.renderSensorEditor();
        this.saveSystem.showToast("🗑️ 已删除传感器");
        this.saveSystem.saveToDB();
        if (this.isPlayMode) this.updateSensorDisplay();
    },

    /* ============================================================
     *  ★ 音乐播放器
     * ============================================================ */
    musicPlayer: {
        audio: null, currentSongId: null, isPlaying: false, isPausedByUser: false,
        loopMode: 'none', history: [], historyOpen: false,
        _HIST_KEY: 'sysMusicHistory', _HIST_MAX: 30,
        _session: 0, _activeSession: 0, _failCount: 0, _failHandled: false,

        init: function () {
            if (this.audio) return;
            const audio = document.createElement('audio');
            audio.id = 'sysMusicAudio';
            audio.preload = 'none';
            audio.style.display = 'none';
            document.body.appendChild(audio);
            audio.volume = 0.8;

            try { const raw = localStorage.getItem(this._HIST_KEY); this.history = raw ? JSON.parse(raw) : []; } catch (e) { this.history = []; }
            if (!Array.isArray(this.history)) this.history = [];

            const self = this;

            audio.addEventListener('playing', () => {
                if (self._activeSession !== self._session) return;
                if (!self.isPlaying) {
                    self.isPlaying = true;
                    self.isPausedByUser = false;
                    self._updateInfo(null, '播放中');
                    self._setPlayUI(true);
                }
                self._recordHistory(self.currentSongId);
            });

            audio.addEventListener('ended', () => {
                if (self._activeSession !== self._session) return;
                if (self.loopMode === 'one') {
                    self.audio.currentTime = 0;
                    const p = self.audio.play();
                    if (p && p.catch) p.catch(() => { if (!self._failHandled) { self._failHandled = true; self._onPlayFail(); } });
                    return;
                }
                self.isPlaying = false;
                self._setPlayUI(false);
                self._updateInfo(null, '播放结束');

                if (!self.isPausedByUser) {
                    self._failCount = 0;
                    const nid = self.generateRandomSongId();
                    setTimeout(() => { if (self._activeSession !== self._session) return; self.tryPlay(nid, false); }, 600);
                }
            });

            audio.addEventListener('timeupdate', () => {
                if (self._activeSession !== self._session) return;
                if (!isFinite(self.audio.duration) || self.audio.duration <= 0) return;
                self._updateProgress();
            });

            audio.addEventListener('loadedmetadata', () => {
                if (self._activeSession !== self._session) return;
                const dur = document.getElementById('sysMusicDur');
                if (dur && isFinite(self.audio.duration) && self.audio.duration > 0) dur.textContent = self.formatTime(self.audio.duration);
            });

            audio.addEventListener('error', () => {
                if (self._failHandled) return;
                if (!self.audio.src || self.audio.src === window.location.href) return;
                if (self._activeSession !== self._session) return;
                self._failHandled = true;
                self._onPlayFail();
            });

            this.audio = audio;
            this._updateHistoryBtn();
            this._updateLoopUI();
        },

        _beginUserAction: function () {
            this._session++;
            this._activeSession = this._session;
            this._failCount = 0;
            this._failHandled = false;
        },

        generateRandomSongId: function () { return Math.floor(1000000 + Math.random() * 9000000); },

        formatTime: function (seconds) {
            if (!isFinite(seconds) || seconds < 0) return '0:00';
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return mins + ':' + (secs < 10 ? '0' : '') + secs;
        },

        songUrl: function (id) { return 'http://music.163.com/song/media/outer/url?id=' + id + '.mp3'; },

        tryPlay: async function (songId, byUser) {
            this.init();
            if (byUser !== false) this._beginUserAction();

            this._activeSession = this._session;
            this._failHandled = false;
            this.currentSongId = songId;

            const url = this.songUrl(songId);
            this._resetProgressUI();
            this._updateInfo('歌曲 ID: ' + songId, '加载中...', songId);
            this._updateUrl(url);

            const cover = document.getElementById('sysMusicCover');
            if (cover) cover.src = 'https://picsum.photos/seed/' + songId + '/300/300.jpg';

            this.audio.src = url;
            this.audio.load();

            const session = this._session;
            try {
                await this.audio.play();
                if (session !== this._session) return;
                this.isPlaying = true;
                this.isPausedByUser = false;
                this._updateInfo('歌曲 ID: ' + songId, '播放中', songId);
                this._setPlayUI(true);
            } catch (e) {
                if (session !== this._session) return;
                if (!this._failHandled) { this._failHandled = true; this._onPlayFail(); }
            }
        },

        _onPlayFail: function () {
            this.isPlaying = false;
            this._setPlayUI(false);
            this._failCount++;

            const session = this._session;
            const appRef = window.app;

            if (appRef && (this._failCount === 3 || this._failCount % 15 === 0)) {
                appRef.saveSystem.showToast('⚠️ 歌曲源失效中, 已自动连续切换 ' + this._failCount + ' 次, 直到播放成功...');
            }

            this._updateInfo('自动切换下一曲中...', '重试中 (' + this._failCount + ')');

            const self = this;
            const newId = this.generateRandomSongId();
            const delay = this._failCount > 20 ? 1500 : 700;

            setTimeout(() => {
                if (session !== self._session) return;
                self._failHandled = false;
                self.tryPlay(newId, false);
            }, delay);
        },

        togglePlay: function () {
            this.init();
            const hasSrc = this.audio.src && this.audio.src !== window.location.href;

            if (!hasSrc) { this.tryPlay(this.generateRandomSongId(), true); return; }

            const self = this;
            if (this.isPlaying) {
                this.audio.pause();
                this.isPlaying = false;
                this.isPausedByUser = true;
                this._updateInfo(null, '已暂停');
                this._setPlayUI(false);
            } else {
                this._beginUserAction();
                const session = this._session;
                this.audio.play().then(() => {
                    if (session !== self._session) return;
                    self.isPlaying = true;
                    self.isPausedByUser = false;
                    self._updateInfo(null, '播放中');
                    self._setPlayUI(true);
                }).catch(() => {
                    if (session !== self._session) return;
                    if (!self._failHandled) { self._failHandled = true; self._onPlayFail(); }
                });
            }
        },

        next: function () { this.tryPlay(this.generateRandomSongId(), true); },

        prev: function () { this.tryPlay(this.currentSongId || this.generateRandomSongId(), true); },

        toggleLoop: function () {
            this.init();
            this.loopMode = (this.loopMode === 'one') ? 'none' : 'one';
            this._updateLoopUI();
            const appRef = window.app;
            if (appRef) appRef.saveSystem.showToast(this.loopMode === 'one' ? '🔂 已开启单曲循环' : '🔁 已关闭单曲循环');
        },

        _updateLoopUI: function () {
            const btn = document.getElementById('sysMusicLoop');
            if (!btn) return;
            const on = (this.loopMode === 'one');
            btn.textContent = on ? '🔂 单曲循环中' : '🔁 单曲循环';
            btn.style.background = on ? 'linear-gradient(135deg,#f7b731,#e67e22)' : 'rgba(255,255,255,0.1)';
            btn.style.color = on ? '#000' : '#fff';
            btn.style.boxShadow = on ? '0 0 12px rgba(247,183,49,0.5)' : 'none';
        },

        _recordHistory: function (songId) {
            if (!songId) return;
            if (this.history.length > 0 && this.history[0].id === songId) this.history[0].time = Date.now();
            else {
                this.history.unshift({ id: songId, time: Date.now() });
                if (this.history.length > this._HIST_MAX) this.history.length = this._HIST_MAX;
            }
            try { localStorage.setItem(this._HIST_KEY, JSON.stringify(this.history)); } catch (e) {}
            this._updateHistoryBtn();
            if (this.historyOpen) this.renderHistory();
        },

        _updateHistoryBtn: function () {
            const btn = document.getElementById('sysMusicHistBtn');
            if (btn) btn.textContent = '🕘 历史(' + this.history.length + ')';
        },

        toggleHistory: function () {
            this.init();
            this.historyOpen = !this.historyOpen;
            const panel = document.getElementById('sysMusicHistoryPanel');
            if (panel) panel.style.display = this.historyOpen ? 'block' : 'none';
            if (this.historyOpen) this.renderHistory();
        },

        clearHistory: function () {
            this.history = [];
            try { localStorage.removeItem(this._HIST_KEY); } catch (e) {}
            this._updateHistoryBtn();
            this.renderHistory();
            const appRef = window.app;
            if (appRef) appRef.saveSystem.showToast('🗑️ 播放历史已清空');
        },

        renderHistory: function () {
            const list = document.getElementById('sysMusicHistoryList');
            if (!list) return;
            list.innerHTML = '';

            if (this.history.length === 0) {
                list.innerHTML = `<div style="color:#888;text-align:center;padding:10px;font-size:0.62rem;">暂无播放记录, 播放歌曲后自动记录</div>`;
                return;
            }

            this.history.forEach(h => {
                const d = new Date(h.time);
                const hh = (d.getHours() < 10 ? '0' : '') + d.getHours();
                const mm = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();

                const item = document.createElement('div');
                item.className = 'sys-hist-item';
                item.innerHTML = `<span><span style="color:#4cc9f0;margin-right:6px;">▶</span>ID: ${h.id}</span><span style="color:#888;font-size:0.58rem;">${hh}:${mm}</span>`;
                item.title = '点击播放该歌曲';
                item.onclick = () => this.tryPlay(h.id, true);
                list.appendChild(item);
            });
        },

        setVolume: function (val) {
            this.init();
            const v = Math.max(0, Math.min(100, parseInt(val)));
            this.audio.volume = v / 100;
            this._updateVolumeIcon();
        },

        seek: function (e) {
            const wrap = document.getElementById('sysMusicProgressWrap');
            if (!wrap || !this.audio || !isFinite(this.audio.duration) || this.audio.duration <= 0) return;

            const rect = wrap.getBoundingClientRect();
            const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
            const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            this.audio.currentTime = pct * this.audio.duration;
            this._updateProgress();
        },

        pauseAll: function () {
            this._beginUserAction();
            if (this.audio && !this.audio.paused) this.audio.pause();
            this.isPlaying = false;
            this.isPausedByUser = true;
            this._setPlayUI(false);
            this._updateInfo(null, '已暂停');
        },

        refreshUI: function () {
            this._setPlayUI(this.isPlaying);
            this._updateVolumeIcon();
            this._updateLoopUI();
            this._updateHistoryBtn();
            if (this.historyOpen) this.renderHistory();

            if (this.audio) {
                const vol = document.getElementById('sysMusicVolume');
                if (vol) vol.value = Math.round(this.audio.volume * 100);
            }

            if (this.audio && this.audio.src && this.audio.src !== window.location.href) {
                this._updateUrl(this.audio.src);
                if (this.currentSongId) { const i = document.getElementById('sysMusicId'); if (i) i.textContent = this.currentSongId; }
                this._updateProgress();
                if (isFinite(this.audio.duration) && this.audio.duration > 0) {
                    const dur = document.getElementById('sysMusicDur');
                    if (dur) dur.textContent = this.formatTime(this.audio.duration);
                }
                this._updateInfo(null, this.isPlaying ? '播放中' : '已暂停');
            }
        },

        _setPlayUI: function (playing) {
            const btn = document.getElementById('sysMusicPlayToggle');
            if (btn) btn.textContent = playing ? '⏸' : '▶';

            const wrap = document.getElementById('sysMusicCoverWrap');
            if (wrap) wrap.style.animationPlayState = playing ? 'running' : 'paused';

            const root = document.getElementById('sysPanelMenuRoot');
            if (root) { if (playing) root.classList.add('sys-music-playing'); else root.classList.remove('sys-music-playing'); }
        },

        _updateInfo: function (name, status, songId) {
            const n = document.getElementById('sysMusicName');
            const s = document.getElementById('sysMusicStatus');
            const i = document.getElementById('sysMusicId');
            if (name !== null && name !== undefined && n) n.textContent = name;
            if (status !== null && status !== undefined && s) s.textContent = status;
            if (songId !== undefined && i) i.textContent = (songId !== null) ? songId : '--';
        },

        _updateUrl: function (url) {
            const a = document.getElementById('sysMusicUrl');
            if (a) { a.textContent = url; a.href = url; }
        },

        _updateProgress: function () {
            if (!this.audio) return;
            const bar = document.getElementById('sysMusicProgress');
            const cur = document.getElementById('sysMusicCur');
            if (bar && isFinite(this.audio.duration) && this.audio.duration > 0)
                bar.style.width = ((this.audio.currentTime / this.audio.duration) * 100) + '%';
            if (cur) cur.textContent = this.formatTime(this.audio.currentTime || 0);
        },

        _resetProgressUI: function () {
            const bar = document.getElementById('sysMusicProgress'); if (bar) bar.style.width = '0%';
            const cur = document.getElementById('sysMusicCur'); if (cur) cur.textContent = '0:00';
            const dur = document.getElementById('sysMusicDur'); if (dur) dur.textContent = '0:00';
        },

        _updateVolumeIcon: function () {
            const icon = document.getElementById('sysMusicVolIcon');
            if (!icon || !this.audio) return;
            const v = this.audio.volume;
            icon.textContent = (v === 0) ? '🔇' : (v < 0.5 ? '🔉' : '🔊');
        }
    },

    /* ============================================================
     *  ★ 行走模型
     * ============================================================ */
    isPointInFloor: function (x, z, floorIdx) {
        if (!this.canvas || !this.canvas.width) return true;
        const shapes = this.floorShapes[floorIdx];
        if (!shapes || shapes.length === 0) return true;

        const scale = 20 / this.canvas.width;
        const offX = this.canvas.width / 2;
        const offY = this.canvas.height / 2;

        for (let s = 0; s < shapes.length; s++) {
            const poly = shapes[s];
            let inside = false;
            for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
                const ax = (poly[i].x - offX) * scale, az = (poly[i].y - offY) * scale;
                const bx = (poly[j].x - offX) * scale, bz = (poly[j].y - offY) * scale;
                if (((az > z) !== (bz > z)) && (x < (bx - ax) * (z - az) / ((bz - az) || 1e-9) + ax)) inside = !inside;
            }
            if (inside) return true;
        }
        return false;
    },

    _getDoorBoxes: function (floorIdx) {
        const gen = this._doorCacheGen || 0;
        if (!this._doorCache) this._doorCache = {};
        if (this._doorCache._gen === gen && this._doorCache[floorIdx]) return this._doorCache[floorIdx];
        if (this._doorCache._gen !== gen) this._doorCache = { _gen: gen };

        const wallHeight = this.getWallHeight(floorIdx);
        const floorY = this.getFloorBaseY(floorIdx);
        const list = [];

        this.furnitureGroup.children.forEach(obj => {
            const d = obj.userData;
            if (!d || d.type !== 'door_window') return;
            if ((d.floorIndex || 0) !== floorIdx) return;
            if (!isFinite(obj.position.x) || !isFinite(obj.position.y) || !isFinite(obj.position.z)) return;

            try {
                const fx = d.animEffectGroup;
                let pv = null;
                if (fx) { pv = fx.visible; fx.visible = false; }
                obj.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(obj);
                if (fx) fx.visible = (pv === undefined) ? true : pv;
                if (box.isEmpty()) return;

                list.push({
                    minX: box.min.x - 0.08, maxX: box.max.x + 0.08,
                    minZ: box.min.z - 0.08, maxZ: box.max.z + 0.08,
                    low: (box.min.y - floorY) < 0.35
                });
            } catch (e) {}
        });

        this._doorCache[floorIdx] = list;
        return list;
    },

    _isInDoorway: function (x, z, floorIdx) {
        const boxes = this._getDoorBoxes(floorIdx);
        for (let i = 0; i < boxes.length; i++) {
            const b = boxes[i];
            if (!b.low) continue;
            if (x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ) return true;
        }
        return false;
    },

    _getObjectXZRadius: function (obj) {
        let r = obj.userData._collRadiusN;
        if (r === undefined) {
            r = 0.4;
            try {
                const fx = obj.userData.animEffectGroup;
                let pv = null;
                if (fx) { pv = fx.visible; fx.visible = false; }
                const box = new THREE.Box3().setFromObject(obj);
                if (fx) fx.visible = (pv === undefined) ? true : pv;

                if (!box.isEmpty()) {
                    const size = box.getSize(new THREE.Vector3());
                    const sc = Math.max(0.0001, Math.abs(obj.scale.x));
                    const rr = Math.max(size.x, size.z) * 0.5 / sc;
                    if (isFinite(rr) && rr > 0) r = Math.min(rr, 5);
                }
            } catch (e) {}
            obj.userData._collRadiusN = r;
        }
        return r * Math.max(0.0001, Math.abs(obj.scale.x));
    },

    checkWalkerCollision: function (walker, nx, nz) {
        const wc = walker.userData.walkConfig || {};
        const wRad = Math.max(this._getObjectXZRadius(walker), wc.radius || 0.35);

        for (let i = 0; i < this.furnitureGroup.children.length; i++) {
            const other = this.furnitureGroup.children[i];
            if (other === walker || !other.visible) continue;
            const od = other.userData;
            if (!od) continue;
            if (od.type === 'door_window') continue;
            if (od.type === 'light') continue;

            const oRad = this._getObjectXZRadius(other) * 0.8;
            const dx = nx - other.position.x;
            const dz = nz - other.position.z;
            const minDist = wRad + oRad;
            if ((dx * dx + dz * dz) < minDist * minDist) return true;
        }
        return false;
    },

    updateWalkers: function (delta, time) {
        if (typeof delta !== 'number' || delta <= 0) delta = 0.016;

        this.furnitureGroup.children.forEach(obj => {
            const d = obj.userData;
            if (!d || d.type !== 'walker' || !obj.visible) return;
            if (!this.isPlayMode && this.selectedObj === obj) return;
            if (this.transCtrl && this.transCtrl.dragging && this.selectedObj === obj) return;

            if (!d.walkConfig) d.walkConfig = {
                speed: 0.6, radius: 0.35, faceOffset: 0, useAnim: true, useBob: true,
                freeze: false, dir: Math.random() * Math.PI * 2, turnTimer: 2 + Math.random() * 3, paused: false
            };

            const cfg = d.walkConfig;
            const floorIdx = Math.max(0, Math.min(this.floorShapes.length - 1, d.floorIndex || 0));
            const floorY = this.getFloorBaseY(floorIdx);

            if (cfg.paused) { this._applyWalkerAnim(obj, delta, time, floorY, false); return; }
            if (cfg.freeze) { this._applyWalkerAnim(obj, delta, time, floorY, false); return; }

            const inFloorNow = this.isPointInFloor(obj.position.x, obj.position.z, floorIdx) ||
                this._isInDoorway(obj.position.x, obj.position.z, floorIdx);

            if (!inFloorNow) {
                const centers = this.calculateFloorCenters();
                const c = centers[floorIdx] || { x: 0, z: 0 };
                const dx = c.x - obj.position.x, dz = c.z - obj.position.z;
                const dist = Math.hypot(dx, dz);

                if (dist > 0.03) {
                    const stepBack = Math.min(cfg.speed * 2 * delta, dist);
                    obj.position.x += (dx / dist) * stepBack;
                    obj.position.z += (dz / dist) * stepBack;
                    cfg.dir = Math.atan2(dx, dz);
                }

                const tr0 = cfg.dir + (cfg.faceOffset || 0);
                let c0 = obj.rotation.y;
                let f0 = tr0 - c0;
                while (f0 > Math.PI) f0 -= Math.PI * 2;
                while (f0 < -Math.PI) f0 += Math.PI * 2;
                obj.rotation.y = c0 + f0 * Math.min(1, delta * 8);

                if (this.transOptions.lockUpright) { obj.rotation.x = 0; obj.rotation.z = 0; }
                this._applyWalkerAnim(obj, delta, time, floorY, true);
                return;
            }

            cfg.turnTimer -= delta;
            if (cfg.turnTimer <= 0) {
                cfg.turnTimer = 2 + Math.random() * 4;
                cfg.dir += (Math.random() - 0.5) * Math.PI * 0.9;
            }

            const step = cfg.speed * delta;
            const la = 0.12;
            let dir = cfg.dir;
            let moved = false;

            for (let attempt = 0; attempt < 5 && !moved; attempt++) {
                const nx = obj.position.x + Math.sin(dir) * step;
                const nz = obj.position.z + Math.cos(dir) * step;
                const lx = nx + Math.sin(dir) * la;
                const lz = nz + Math.cos(dir) * la;

                const okP = this.isPointInFloor(nx, nz, floorIdx) || this._isInDoorway(nx, nz, floorIdx);
                const okL = this.isPointInFloor(lx, lz, floorIdx) || this._isInDoorway(lx, lz, floorIdx);

                if (okP && okL && !this.checkWalkerCollision(obj, nx, nz)) {
                    obj.position.x = nx;
                    obj.position.z = nz;
                    cfg.dir = dir;
                    moved = true;
                } else dir += Math.PI * (0.35 + Math.random() * 0.45);
            }

            if (!moved) cfg.dir += Math.PI * (0.8 + Math.random() * 0.4);

            const targetRot = cfg.dir + (cfg.faceOffset || 0);
            let cur = obj.rotation.y;
            let diff = targetRot - cur;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            obj.rotation.y = cur + diff * Math.min(1, delta * 8);

            if (this.transOptions.lockUpright) { obj.rotation.x = 0; obj.rotation.z = 0; }
            this._applyWalkerAnim(obj, delta, time, floorY, false);
        });
    },

    _applyWalkerAnim: function (obj, delta, time, floorY, returning) {
        const d = obj.userData;
        const cfg = d.walkConfig || {};

        if (cfg.paused) {
            if (d._walkMixer) { d._walkMixer.timeScale = 0; d._walkMixer.update(delta); }
            this._alignWalkerToFloor(obj, floorY);
            return;
        }

        if (cfg.freeze) {
            if (d._walkMixer) { d._walkMixer.timeScale = 1; d._walkMixer.update(delta); }
            this._alignWalkerToFloor(obj, floorY);
            return;
        }

        const speed = cfg.speed || 0.6;

        if (d._walkMixer) {
            d._walkMixer.timeScale = returning ? 1.6 : Math.max(0.5, speed / 0.6);
            d._walkMixer.update(delta);
            this._alignWalkerToFloor(obj, floorY);
        } else {
            if (cfg.useBob !== false) {
                const t = time * (6 + speed * 4);
                obj.position.y += Math.abs(Math.sin(t)) * 0.04;
            }
            this._alignWalkerToFloor(obj, floorY);
        }
    },

    /* ============================================================
     *  ★ 演示模式
     * ============================================================ */
	togglePlayMode: function (enter) {
		this.isPlayMode = enter;
		this.deselect();

		const playUI = document.getElementById('playUI');
		if (playUI) playUI.style.display = enter ? 'block' : 'none';

		const iotPanel = document.getElementById('iotPanel');
		if (iotPanel) iotPanel.style.display = 'none';

		const hdr = document.querySelector('header');
		if (hdr) hdr.style.display = enter ? 'none' : '';

		this._updateTransformToolbarVisibility();

		if (enter) {
			document.body.classList.add('play-mode');
			this._requestFullscreen();
			this.orbit.maxPolarAngle = Math.PI / 2 - 0.1;
			this.playModeFloor = 0;
			this.playModeShowAll = false;
			this.showFloorInPlayMode(0);
			this.createLabels();
			this.lastActivityTime = Date.now();

			const floorNav = document.getElementById('floorNav');
			if (floorNav) floorNav.style.display = 'flex';

			this.updateFloorButtons();
			app.ha.syncAll();

			if (this.haPollInterval) clearInterval(this.haPollInterval);
			this.haPollInterval = setInterval(() => app.ha.syncAll(), 5000);

			this.closeMobileSidebars();
			this.setPlayIdleUI(false);
			this.updateSensorDisplay();

			if (this.sensorUpdateTimer) clearInterval(this.sensorUpdateTimer);
			this.sensorUpdateTimer = setInterval(() => { this.fetchAllSensorData(); }, 3000);
			this.fetchAllSensorData();

			this.setupSystemMenuUI();
			this.musicPlayer.init();
			if (this.sysMenuReady) this.sysRenderSensorTab();

			setTimeout(() => { try { this._updateFullscreenViewport(); } catch (e) {} }, 80);
			setTimeout(() => { try { this._updateFullscreenViewport(); } catch (e) {} }, 260);
			setTimeout(() => { try { this._updateFullscreenViewport(); } catch (e) {} }, 600);
			setTimeout(() => { try { this._updateFullscreenViewport(); } catch (e) {} }, 1200);
		} else {
			document.body.classList.remove('play-mode');
			this._exitFullscreen();

			const gsp = document.getElementById('glassSidePanel');
			if (gsp) gsp.classList.remove('open');

			const floorNav = document.getElementById('floorNav');
			if (floorNav) floorNav.style.display = 'none';

			this.orbit.maxPolarAngle = Math.PI;
			this.removeLabels();
			this.isIdleMode = false;
			this.fireworksGroup.clear();

			if (this.haPollInterval) clearInterval(this.haPollInterval);
			if (this.sensorUpdateTimer) clearInterval(this.sensorUpdateTimer);
			this.clearSensorCards();

			this.musicPlayer.pauseAll();
			this.closeSystemMenu();
			this.closeThemeEditor();
			this.setPlayIdleUI(false);

			const lc = document.getElementById('labelContainer');
			if (lc) lc.style.opacity = '1';

			// ★★★ 关键修复：退出演示模式后布局需要时间恢复（sidebar 重新展开、canvas 尺寸变化）
			//    延迟多轮执行"重置画布尺寸 + 重建 3D"，避免用错误的 canvas.width 计算缩放
			const restoreAfterExit = () => {
				try {
					this.resetCanvasSize();
					// 无论是否变化都重建 3D，确保墙体用最新 canvas 尺寸计算
					this._wallMergeCache = {};
					this._doorCache = {};
					this.generate3D();
					this.render2D();
				} catch (e) { console.warn('退出演示模式恢复画布失败:', e); }
			};

			setTimeout(restoreAfterExit, 60);
			setTimeout(restoreAfterExit, 240);
			setTimeout(restoreAfterExit, 600);
			setTimeout(restoreAfterExit, 1200);
		}

		this._updateTransformToolbarVisibility();
		this._forceViewportResize();
	},

    showFloorInPlayMode: function (floorIndex) {
        this.playModeFloor = floorIndex;
        if (floorIndex === -1) this.playModeShowAll = true;
        else this.playModeShowAll = false;

        this.updateSceneVisibility();

        if (!this.playModeShowAll) {
            const baseY = this.getFloorBaseY(floorIndex);
            this.camera.position.set(0, baseY + 20, 30);
            this.orbit.target.set(0, baseY, 0);
        } else {
            const totalH = this.getFloorBaseY(this.floorShapes.length);
            this.camera.position.set(0, totalH + 20, 50);
            this.orbit.target.set(0, totalH / 2, 0);
        }

        this.orbit.update();
        this.updateFloorButtons();
        if (this.isPlayMode) this.createLabels();
        this.updateSensorDisplay();
    },

    switchToFloor: function (floorIndex) {
        if (!this.isPlayMode) return;
        this.showFloorInPlayMode(floorIndex);
    },

    updateFloorButtons: function () {
        const container = document.getElementById('floorButtons');
        if (!container) return;
        container.innerHTML = '';

        const btnAll = document.createElement('button');
        btnAll.className = `floor-btn wide ${this.playModeShowAll ? 'active' : ''}`;
        btnAll.textContent = "全部";
        btnAll.onclick = () => this.switchToFloor(-1);
        container.appendChild(btnAll);

        for (let i = 0; i < this.floorShapes.length; i++) {
            const btn = document.createElement('button');
            btn.className = `floor-btn ${(!this.playModeShowAll && i === this.playModeFloor) ? 'active' : ''}`;
            btn.textContent = i + 1;
            btn.onclick = () => this.switchToFloor(i);
            container.appendChild(btn);
        }
    },

    _isSmartDevice: function (group) {
        const d = group.userData;
        if (!d) return false;
        if (d.entityId && String(d.entityId).trim() !== '') return true;
        if (['light', 'ac', 'tv', 'switch'].indexOf(d.type) !== -1) return true;
        return false;
    },

    createLabels: function () {
        const container = document.getElementById('labelContainer');
        if (!container) return;
        container.innerHTML = '';
        this.labels = [];

        this.furnitureGroup.children.forEach(group => {
            if (group.userData && group.userData.name && group.visible && this._isSmartDevice(group)) {
                const div = document.createElement('div');
                div.className = 'glass-label';
                div.innerText = group.userData.name;
                div.onclick = (e) => { e.stopPropagation(); this.handleDeviceControl(group); };
                div.ontouchstart = (e) => { e.stopPropagation(); this.handleDeviceControl(group); };
                container.appendChild(div);

                const box = new THREE.Box3().setFromObject(group);
                const size = new THREE.Vector3();
                box.getSize(size);
                this.labels.push({ div: div, obj: group, offsetY: size.y });
            }
        });
    },

    removeLabels: function () {
        const c = document.getElementById('labelContainer');
        if (c) c.innerHTML = '';
        this.labels = [];
    },

    updateLabels: function () {
        if (!this.isPlayMode || this.labels.length === 0) return;
        const clientW = this.renderer.domElement.clientWidth;
        const clientH = this.renderer.domElement.clientHeight;
        if (clientW === 0 || clientH === 0) return;

        this.labels.forEach(item => {
            if (!item.obj.visible) { item.div.style.display = 'none'; return; }

            item.obj.getWorldPosition(this.tempV);
            this.tempV.y += (item.offsetY || 1) + 0.3;
            this.tempV.project(this.camera);

            const x = (this.tempV.x * 0.5 + 0.5) * clientW;
            const y = (this.tempV.y * -0.5 + 0.5) * clientH;

            item.div.style.left = `${x}px`;
            item.div.style.top = `${y}px`;
            item.div.style.display = (this.tempV.z < 1 && Math.abs(this.tempV.x) < 1.1 && Math.abs(this.tempV.y) < 1.1) ? 'block' : 'none';
        });
    },

    setupActivityListener: function () {
        const resetTimer = () => {
            this.lastActivityTime = Date.now();
            if (this.isIdleMode) {
                this.isIdleMode = false;
                this.fireworksGroup.clear();
                this.fireworks = [];
                const lc = document.getElementById('labelContainer');
                if (this.isPlayMode && lc) lc.style.opacity = '1';
                this.updateSensorCardOpacity();
                this.setPlayIdleUI(false);
            }
            if (this.isPlayMode && !this.isIdleMode) {
                const lc = document.getElementById('labelContainer');
                if (lc) lc.style.opacity = '1';
            }
        };

        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('mousedown', resetTimer);
        window.addEventListener('keydown', resetTimer);
        window.addEventListener('touchstart', resetTimer);
        window.addEventListener('touchmove', resetTimer);
    },

    checkIdle: function () {
        if (Date.now() - this.lastActivityTime > 60000) {
            if (!this.isPlayMode) {
                this.saveSystem.saveToDB();
                this.togglePlayMode(true);
                console.log("Auto-saved and entered play mode due to inactivity.");
            }
            if (!this.isIdleMode) {
                this.isIdleMode = true;
                const lc = document.getElementById('labelContainer');
                if (lc) lc.style.opacity = '0';
                this.updateSensorCardOpacity();
                this.setPlayIdleUI(true);
            }
            this.structureGroup.rotation.y += 0.001;
            this.furnitureGroup.rotation.y += 0.001;
            if (Math.random() < 0.02) this.createFirework();
        }
    },

    setPlayIdleUI: function (idle) {
        document.querySelectorAll('.sensor-mgr-btn').forEach(b => { b.style.display = idle ? 'none' : ''; });
        document.querySelectorAll('.theme-mgr-btn').forEach(b => { b.style.display = 'none'; });
        const gearBtn = document.getElementById('mobileSettingsBtn');
        if (gearBtn) gearBtn.style.display = idle ? 'none' : '';
        if (this.gridHelper) this.gridHelper.visible = !idle;
    },

    updateSensorCardOpacity: function () {
        const targetOpacity = this.isIdleMode ? 0.5 : 1.0;
        this.sensorCards.forEach(item => { if (item.el) item.el.style.opacity = targetOpacity; });
    },

    createFirework: function () {
        const floorY = this.getFloorBaseY(this.playModeFloor);
        const color = new THREE.Color().setHSL(Math.random(), 1, 0.5);
        const particleCount = 50;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];

        const cx = (Math.random() - 0.5) * 20;
        const cy = floorY + 5 + Math.random() * 10;
        const cz = (Math.random() - 0.5) * 20 - 10;

        for (let i = 0; i < particleCount; i++) {
            positions.push(cx, cy, cz);
            velocities.push((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            size: 0.3, color: color, transparent: true, opacity: 1,
            blending: THREE.AdditiveBlending, depthWrite: false
        });

        const points = new THREE.Points(geometry, material);
        this.fireworksGroup.add(points);
        this.fireworks.push({ mesh: points, velocities: velocities, life: 1.0 });
    },

    updateFireworks: function () {
        if (!this.isIdleMode) return;
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const fw = this.fireworks[i];
            fw.life -= 0.015;
            if (fw.life <= 0) {
                this.fireworksGroup.remove(fw.mesh);
                this.fireworks.splice(i, 1);
                continue;
            }
            fw.mesh.material.opacity = fw.life;
            const positions = fw.mesh.geometry.attributes.position.array;
            for (let j = 0; j < fw.velocities.length / 3; j++) {
                positions[j * 3] += fw.velocities[j * 3];
                positions[j * 3 + 1] += fw.velocities[j * 3 + 1];
                positions[j * 3 + 2] += fw.velocities[j * 3 + 2];
                fw.velocities[j * 3 + 1] -= 0.005;
            }
            fw.mesh.geometry.attributes.position.needsUpdate = true;
        }
    },

    setupFullscreenListener: function () {
        const updateFn = () => {
            setTimeout(() => { this._updateFullscreenViewport(); this._forceViewportResize(); }, 60);
            setTimeout(() => { this._updateFullscreenViewport(); }, 260);
            setTimeout(() => { this._updateFullscreenViewport(); }, 600);
            setTimeout(() => {
                if (this.isPlayMode) {
                    this.showFloorInPlayMode(this.playModeFloor);
                    this.createLabels();
                    this.updateSensorDisplay();
                } else {
                    this.updateSceneVisibility();
                }
            }, 200);
        };

        document.addEventListener('fullscreenchange', updateFn);
        document.addEventListener('webkitfullscreenchange', updateFn);
        document.addEventListener('mozfullscreenchange', updateFn);
        document.addEventListener('MSFullscreenChange', updateFn);
    },

    forceUpdateVisibility: function () {
        this.generate3D();
        if (this.isPlayMode) {
            this.showFloorInPlayMode(this.playModeFloor);
            this.createLabels();
        } else this.updateSceneVisibility();
        this.orbit.update();
    },

    toggleSidePanel: function () {
        if (this.isPlayMode) this.setupSystemMenuUI();
        const panel = document.getElementById('glassSidePanel');
        if (panel) panel.classList.toggle('open');
    },

    on3DClick: function (e) {
        if (!this.renderer || !this.camera) return;
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const visibleObjects = [];
        this.furnitureGroup.children.forEach(obj => { if (obj.visible) visibleObjects.push(obj); });

        const intersects = this.raycaster.intersectObjects(visibleObjects, true);

        if (intersects.length > 0) {
            let target = intersects[0].object;
            while (target.parent && target.parent !== this.furnitureGroup) target = target.parent;

            if (this.isPlayMode) this.handleDeviceControl(target);
            else this.selectObj(target, intersects[0].object);
        } else {
            if (!this.isPlayMode && !this.transCtrl.dragging) this.deselect();
        }
    },

	/* ============================================================
	 * ★★★ 优化：选中模型（编辑模式）
	 * 
	 * 【本次优化点】
	 * 原行为：window.innerWidth <= 768 时，点击模型会强制弹出右侧侧边栏，
	 *         覆盖 3D 视口，严重影响用户对模型进行位置 / 旋转 / 缩放调节。
	 * 新行为：
	 *   1. 点击模型 → 仅做"选中 + 挂载 TransformControls + 刷新属性面板数据"，
	 *      不再自动弹出任何侧边栏；
	 *   2. 用户如需查看/编辑详细属性，可主动点击右下角 ⚙️ 按钮
	 *      （mobileSettingsBtn）或左侧 ☰ 按钮打开对应侧边栏；
	 *   3. 桌面端侧边栏本就常驻，行为与原先一致，无任何影响；
	 *   4. 移动端点击画布空白处依然会自动关闭侧边栏（原逻辑保留）。
	 * ============================================================ */
	selectObj: function (obj, clickedMesh = null) {
	  this.selectedObj = obj;
	  this.selectedMaterialTarget = null;

	  // ── 清理旧的内联属性面板 / 材质面板 / 动画面板（保留原有逻辑）──
	  const propPanel = document.getElementById('propPanel');
	  if (propPanel) propPanel.style.display = 'none';

	  const materialControls = document.getElementById('materialControls');
	  if (materialControls) materialControls.classList.remove('active');

	  const animControls = document.getElementById('animControls');
	  if (animControls) animControls.classList.remove('active');

	  // ★ 统一由 _updateTransformToolbarVisibility 处理工具栏显示逻辑
	  this._updateTransformToolbarVisibility();

	  // ── 解析当前点击到的材质（保留原有逻辑）──
	  if (obj.userData.materials && Object.keys(obj.userData.materials).length > 0) {
		if (clickedMesh && clickedMesh.material) {
		  this.selectedMaterialTarget = clickedMesh.material;
		} else {
		  const firstMatKey = Object.keys(obj.userData.materials)[0];
		  this.selectedMaterialTarget = obj.userData.materials[firstMatKey];
		}
	  }

	  // ── 兜底：确保动画配置存在（保留原有逻辑）──
	  if (!obj.userData.animationConfig) {
		const firstType = this.plugins['ripple']
		  ? 'ripple'
		  : (Object.keys(this.plugins)[0] || 'ripple');
		obj.userData.animationConfig = { enabled: false, type: firstType };
	  }

	  // ── 挂载变换控件（保留原有逻辑）──
	  if (!obj.userData.locked) this.transCtrl.attach(obj);
	  if (this.transCtrl && this.transCtrl.mode) {
		this.setTransformMode(this.transCtrl.mode);
	  }

	  // ── 刷新 UI 数值 / 锁定按钮状态（保留原有逻辑）──
	  this.modelToUI();
	  this.updateLockBtn();

	  // ── 门窗特殊处理：临时解锁 Y 轴（保留原有逻辑）──
	  if (obj.userData.type === 'door_window') {
		this._prevLockHorizontal = this.transOptions.lockHorizontal;
		if (this.transOptions.lockHorizontal) {
		  this.transOptions.lockHorizontal = false;
		  const hBtn = document.getElementById('lockHBtn');
		  if (hBtn) hBtn.classList.remove('active');
		  this.saveSystem.showToast('🚪 门窗模型已解锁Y轴，可上下调整高度，移动后自动重建墙体洞口');
		}
	  }

	  // ── 同步楼层模型管理面板选中态（保留原有逻辑）──
	  this._flSelectedId = obj.userData.id;
	  if (!this._flPanelInited) {
		try { this.initFloorModelManager(); } catch (e) {}
	  }
	  if (this._flPanelInited) {
		try { this.flShowPropPanel(obj); } catch (e) {}
	  }
	  this.refreshFloorModelList();
	},

    setupIoTPanelDrag: function () {
        const panel = document.getElementById('iotPanel');
        const header = document.getElementById('iotHeader');
        if (!panel || !header || panel.dataset.dragSetup) return;
        panel.dataset.dragSetup = '1';

        let isDragging = false, startX = 0, startY = 0, origX = 0, origY = 0;

        const onStart = (e) => {
            if (e.target.closest('.iot-close')) return;
            isDragging = true;
            const rect = panel.getBoundingClientRect();
            origX = rect.left; origY = rect.top;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            startX = clientX - origX;
            startY = clientY - origY;
            panel.style.cursor = 'grabbing';
            e.preventDefault();
        };

        const onMove = (e) => {
            if (!isDragging) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            let newX = clientX - startX;
            let newY = clientY - startY;
            const maxX = window.innerWidth - panel.offsetWidth;
            const maxY = window.innerHeight - panel.offsetHeight;
            newX = Math.max(0, Math.min(maxX, newX));
            newY = Math.max(0, Math.min(maxY, newY));
            panel.style.left = newX + 'px';
            panel.style.top = newY + 'px';
            panel.style.transform = 'none';
            panel.style.margin = '0';
            e.preventDefault();
        };

        const onEnd = () => { isDragging = false; panel.style.cursor = ''; };

        header.addEventListener('mousedown', onStart);
        header.addEventListener('touchstart', onStart, { passive: false });
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
    },

    handleDeviceControl: function (obj) {
        const data = obj.userData;
        const panel = document.getElementById('iotPanel');
        const title = document.getElementById('iotTitle');
        const content = document.getElementById('iotContent');
        if (!panel || !title || !content) return;

        this.currentControlObj = obj;
        this.setupIoTPanelDrag();

        const icon = data.type === 'light' ? '💡 ' : (data.type === 'ac' ? '❄️ ' : (data.type === 'door_window' ? '🚪 ' : (data.type === 'walker' ? '🚶 ' : '📺 ')));
        title.innerText = icon + data.name + (data.entityId ? ` (${data.entityId})` : "");

        content.innerHTML = '';

        if (data.type === 'walker') {
            const wc = data.walkConfig || {};
            const frozen = !!wc.freeze;

            const info = document.createElement('div');
            info.style.cssText = 'text-align:center;color:var(--accent);font-size:0.78rem;line-height:1.7;';
            info.innerHTML = frozen ?
                `🚫 禁止移动 · 原地播放模型自带动画<br><span style="color:#888;font-size:0.62rem;">巡游与碰撞检测已暂停</span>` :
                `🚶 自动行走巡游中<br><span style="color:#888;font-size:0.62rem;">速度 ${(wc.speed || 0.6).toFixed(1)} m/s · 墙体/模型碰撞检测已启用</span>`;
            content.appendChild(info);

            const wbtn = document.createElement('button');
            const paused = !!wc.paused;
            wbtn.className = paused ? 'success' : 'danger';
            wbtn.style.width = '100%'; wbtn.style.padding = '12px'; wbtn.style.fontSize = '1rem';
            wbtn.innerHTML = paused ? '▶ 继续行走' : '⏸ 暂停行走';
            wbtn.onclick = () => {
                data.walkConfig = data.walkConfig || {
                    speed: 0.6, radius: 0.35, faceOffset: 0, useAnim: true, useBob: true,
                    freeze: false, dir: 0, turnTimer: 2
                };
                data.walkConfig.paused = !data.walkConfig.paused;
                this.handleDeviceControl(this.currentControlObj);
            };
            content.appendChild(wbtn);

            const fbtn = document.createElement('button');
            fbtn.style.cssText = 'width:100%;padding:10px;font-size:0.85rem;margin-top:8px;border:none;border-radius:8px;cursor:pointer;background:' + (frozen ? 'linear-gradient(135deg,#2ecc71,#27ae60)' : '#444') + ';color:#fff;font-weight:600;';
            fbtn.innerHTML = frozen ? '🚶 恢复自动行走' : '🚫 禁止移动 (原地播动画)';
            fbtn.onclick = () => {
                data.walkConfig = data.walkConfig || {
                    speed: 0.6, radius: 0.35, faceOffset: 0, useAnim: true, useBob: true,
                    freeze: false, dir: 0, turnTimer: 2
                };
                data.walkConfig.freeze = !data.walkConfig.freeze;
                if (data.walkConfig.freeze) data.walkConfig.paused = false;
                this.handleDeviceControl(this.currentControlObj);
                this.saveSystem.saveToDB(true);
            };
            content.appendChild(fbtn);
        }

        if (data.type === 'furniture' || data.type === 'door_window') {
            content.innerHTML = `<div style="text-align:center;color:#888;">${data.type === 'door_window' ? '门窗已安装' : '无智能功能'}</div>`;
        }

        if (['light', 'ac', 'tv', 'switch'].includes(data.type)) {
            if (!data.features || data.features.power) {
                const btn = document.createElement('button');
                btn.className = data.state.on ? 'danger' : 'success';
                btn.style.width = '100%'; btn.style.padding = '12px'; btn.style.fontSize = '1rem';
                btn.innerHTML = data.state.on ? '⭕ 关闭电源' : '⚡ 开启电源';
                btn.onclick = () => this.toggleDevicePower();
                content.appendChild(btn);
            }
        }

        if (data.state.on) {
            if (data.type === 'light' && data.features) {
                if (data.features.dimmer) {
                    const div = document.createElement('div');
                    div.innerHTML = `<div style="color:#aaa;margin:6px 0 4px;">亮度: <span id="valDim">${data.state.dimmer}</span>%</div><input type="range" style="width:100%" min="0" max="100" value="${data.state.dimmer}" onchange="app.updateDeviceState('dimmer', this.value)">`;
                    content.appendChild(div);
                }
                if (data.features.color) {
                    const div = document.createElement('div');
                    div.innerHTML = `<div style="color:#aaa;margin:6px 0 4px;">光色:</div><input type="color" style="width:100%;height:36px;border:none;" value="${data.state.color}" onchange="app.updateDeviceState('color', this.value)">`;
                    content.appendChild(div);
                }
            }
            if (data.type === 'ac') this.renderACControls(content);
        }

        panel.style.display = 'block';
        panel.style.animation = 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        panel.style.left = '50%'; panel.style.top = '50%';
        panel.style.transform = 'translate(-50%, -50%)';
        panel.style.margin = '0';
    },

    closeIoTPanel: function () { const p = document.getElementById('iotPanel'); if (p) p.style.display = 'none'; },

    toggleDevicePower: function () {
        const data = this.currentControlObj.userData;
        data.state.on = !data.state.on;

        if (data.entityId) {
            if (data.type === 'light' || data.type === 'switch' || data.type === 'tv') {
                app.ha.callService(data.entityId.split('.')[0], data.state.on ? 'turn_on' : 'turn_off', data.entityId);
            } else if (data.type === 'ac') {
                app.ha.callService('climate', data.state.on ? 'turn_on' : 'turn_off', data.entityId);
            }
        }

        this.applyDeviceState(this.currentControlObj);
        this.handleDeviceControl(this.currentControlObj);
    },

    updateDeviceState: function (key, val) {
        const data = this.currentControlObj.userData;
        data.state[key] = val;

        if (key === 'dimmer') { const el = document.getElementById('valDim'); if (el) el.innerText = val; }

        if (data.entityId && data.type === 'light') {
            if (key === 'dimmer') {
                app.ha.callService('light', 'turn_on', data.entityId, { brightness_pct: parseInt(val) });
            } else if (key === 'color') {
                const r = parseInt(val.substr(1, 2), 16);
                const g = parseInt(val.substr(3, 2), 16);
                const b = parseInt(val.substr(5, 2), 16);
                app.ha.callService('light', 'turn_on', data.entityId, { rgb_color: [r, g, b] });
            }
        }

        this.applyDeviceState(this.currentControlObj);
    },

	/* ============================================================
	 * ★ 应用设备状态（灯具开关联动全局光）
	 *   - 灯具点光源由 lightConfig.lampPower 驱动（主光源）
	 *   - 灯具状态变化 → 立即重算全局光 → 开关差异明显
	 * ============================================================ */
	applyDeviceState: function (obj) {
		const d = obj.userData;
		if (!d) return;
		const s = d.state || (d.state = { on: true, dimmer: 100, color: '#ffffff' });
		const refs = d.refs || {};
		const LC = this.lightConfig;

		if (d.type === 'light') {
			// ★ 灯具 = 主光源，强度大幅高于环境光
			const maxI = LC.lampPower;
			const on = !!s.on;
			const dim = isFinite(s.dimmer) ? s.dimmer : 100;
			const intensity = on ? (dim / 100) * maxI * LC.onLampAmplify : 0;

			if (refs.light) {
				refs.light.intensity = intensity;
				try { refs.light.color.set(s.color || '#ffffff'); } catch (e) {}
				if (refs.light.distance !== undefined) refs.light.distance = LC.lampDistance;
				if (refs.light.decay !== undefined)    refs.light.decay    = LC.lampDecay;
				refs.light.visible = on;
				refs.light.castShadow = !!LC.lampCastShadow;
			}
			if (refs.mesh && refs.mesh.material && refs.mesh.material.emissive) {
				refs.mesh.material.emissive.set(s.color || '#ffffff');
				refs.mesh.material.emissiveIntensity = on
					? (dim / 100) * LC.lampEmissiveGain
					: 0;
				refs.mesh.material.needsUpdate = true;
			}

			// ★ 关键：灯状态变化后重算全局光（其它光源自动让位）
			try { this._recalculateGlobalLighting(d.floorIndex); } catch (e) {}

		} else if (d.type === 'ac') {
			const acContainer = document.getElementById('ac-controls-container');
			if (acContainer && app.currentControlObj === obj)
				this.renderACControls(document.getElementById('iotContent'));

		} else if (d.type === 'tv' && refs.screen) {
			refs.screen.material.emissive.setHex(s.on ? 0x222222 : 0x000000);
			if (refs.ring) refs.ring.visible = s.on;
		}

		if (d.animEffectGroup) d.animEffectGroup.visible = s.on;
	},

    renderACControls: function (parentContainer) {
        let acContainer = document.getElementById('ac-controls-container');
        if (!acContainer) {
            acContainer = document.createElement('div');
            acContainer.id = 'ac-controls-container';
            acContainer.style.marginTop = '8px';
            parentContainer.appendChild(acContainer);
        } else acContainer.innerHTML = '';

        const s = this.currentControlObj.userData.state;
        const modeColors = { 'cool': '#4cc9f0', 'heat': '#e63946', 'dry': '#f7b731', 'fan_only': '#ffffff', 'auto': '#2ec4b6' };
        const modeNames = { 'cool': '制冷', 'heat': '制热', 'dry': '除湿', 'fan_only': '送风', 'auto': '自动' };
        const displayMode = modeNames[s.mode] || s.mode;

        const screen = document.createElement('div');
        screen.className = 'ac-screen';
        screen.innerHTML = `<div class="ac-temp-display" style="color:${modeColors[s.mode] || '#fff'}">${s.temp}<small style="font-size:0.8rem">°C</small></div><div class="ac-info-grid"><span>模式: ${displayMode}</span><span>风速: ${"▮".repeat(s.fan)}${"▯".repeat(3 - s.fan)}</span></div>`;
        acContainer.appendChild(screen);

        const btns = document.createElement('div');
        btns.className = 'ac-grid-btns';
        btns.innerHTML += `<button onclick="app.setAC('temp', -1)">Temp -</button><button style="background:#444;cursor:default;">温度</button><button onclick="app.setAC('temp', 1)">Temp +</button>`;
        btns.innerHTML += `<button onclick="app.setAC('mode', 'cool')" style="color:#4cc9f0">❄️</button><button onclick="app.setAC('mode', 'heat')" style="color:#e63946">☀️</button><button onclick="app.setAC('mode', 'dry')" style="color:#f7b731">💧</button>`;
        btns.innerHTML += `<button onclick="app.setAC('fan', 0)" style="grid-column:span 3;margin-top:4px;">💨 风速 (${s.fan}/3)</button>`;
        acContainer.appendChild(btns);
    },

    setAC: function (key, val) {
        const s = this.currentControlObj.userData.state;
        const data = this.currentControlObj.userData;

        if (key === 'temp') {
            s.temp += val;
            if (s.temp < 16) s.temp = 16;
            if (s.temp > 30) s.temp = 30;
            if (data.entityId) app.ha.callService('climate', 'set_temperature', data.entityId, { temperature: s.temp });
        } else if (key === 'mode') {
            s.mode = val;
            if (data.entityId) app.ha.callService('climate', 'set_hvac_mode', data.entityId, { hvac_mode: val });
        } else if (key === 'fan') s.fan = (s.fan % 3) + 1;

        this.applyDeviceState(this.currentControlObj);
        if (document.getElementById('ac-controls-container'))
            this.renderACControls(document.getElementById('iotContent'));
    },

    updateObjName: function () {
        if (this.selectedObj) {
            const el = document.getElementById('objName');
            if (el) this.selectedObj.userData.name = el.value;
            if (this.isPlayMode) this.createLabels();
        }
        this.refreshFloorModelList();
    },

    updateObjEntityId: function () {
        if (this.selectedObj) {
            const el = document.getElementById('objEntityId');
            if (el) this.selectedObj.userData.entityId = el.value;
        }
    },

	deselect: function () {
		if (this.selectedObj && this.selectedObj.userData.type === 'door_window' && this._prevLockHorizontal !== undefined) {
			if (this.transOptions.lockHorizontal !== this._prevLockHorizontal) {
				this.transOptions.lockHorizontal = this._prevLockHorizontal;
				const hBtn = document.getElementById('lockHBtn');
				if (hBtn) hBtn.classList.toggle('active', this._prevLockHorizontal);
				if (this._prevLockHorizontal) this.saveSystem.showToast('🔒 已恢复水平锁定 (Y轴固定)');
			}
			this._prevLockHorizontal = undefined;
		}

		this.selectedObj = null;
		this.selectedMaterialTarget = null;
		if (this.transCtrl) this.transCtrl.detach();
		this._dragStartY = null;

		const propPanel = document.getElementById('propPanel');
		if (propPanel) propPanel.style.display = 'none';
		const materialControls = document.getElementById('materialControls');
		if (materialControls) materialControls.classList.remove('active');
		const animControls = document.getElementById('animControls');
		if (animControls) animControls.classList.remove('active');

		// ★ 统一由 _updateTransformToolbarVisibility 处理显示逻辑
		this._updateTransformToolbarVisibility();

		this._flSelectedId = null;
		this.refreshFloorModelList();
	},

    deleteSelected: function () {
        if (this.selectedObj) {
            if (this.selectedObj.userData.animEffectGroup) this.selectedObj.remove(this.selectedObj.userData.animEffectGroup);
            if (this._pendingAnimObjects) this._pendingAnimObjects = this._pendingAnimObjects.filter(o => o !== this.selectedObj);

            this.furnitureGroup.remove(this.selectedObj);
            this.deselect();
            this.generate3D();
            if (this.isPlayMode) this.createLabels();
            this.saveSystem.showToast("🗑️ 已删除选中对象");
            this.refreshFloorModelList();
        }
    },

    toggleLock: function () {
        if (this.selectedObj) {
            this.selectedObj.userData.locked = !this.selectedObj.userData.locked;
            if (this.selectedObj.userData.locked) this.transCtrl.detach();
            else this.transCtrl.attach(this.selectedObj);
            this.updateLockBtn();
        }
    },

    updateLockBtn: function () {
        const locked = this.selectedObj && this.selectedObj.userData.locked;
        ['flLockBtn', 'lockBtn'].forEach(id => {
            const btn = document.getElementById(id);
            if (!btn) return;
            if (locked) { btn.innerText = "🔒 已锁定"; btn.className = 'danger'; }
            else { btn.innerText = "🔓 锁定"; btn.className = ''; }
        });
    },

	setTransformMode: function (mode) {
		if (!this.transCtrl) return;

		this.transCtrl.setMode(mode);

		if (mode === 'translate') {
			this.transCtrl.setSpace('world');
		} else if (mode === 'rotate') {
			this.transCtrl.setSpace('world');
		} else {
			this.transCtrl.setSpace('local');
		}

		// ★ 核心：根据当前锁定状态设置三轴手柄显隐
		this._applyTransformGizmoVisibility(mode);

		// 更新工具栏按钮的 active 状态
		const toolbar = document.getElementById('transformToolbar');
		if (toolbar) {
			const modeNames = { translate: '移动', rotate: '旋转', scale: '缩放' };
			toolbar.querySelectorAll('button').forEach(btn => {
				if (btn.id === 'lockHBtn' || btn.id === 'lockUBtn') return;
				if (btn.textContent.trim() === modeNames[mode]) btn.classList.add('active');
				else btn.classList.remove('active');
			});
		}

		// ★ 移动端未选中模型时给出引导提示（只提示一次）
		if (!this.selectedObj && !this.isPlayMode && window.innerWidth <= 768) {
			if (!this._transformModeHintShown) {
				this._transformModeHintShown = true;
				const labels = { translate: '移动', rotate: '旋转', scale: '缩放' };
				this.saveSystem.showToast('💡 请先点击场景中的模型，再使用「' + (labels[mode] || mode) + '」模式');
			}
		}
	},

    modelToUI: function () {
        if (!this.selectedObj) return;
        const o = this.selectedObj;
        const setV = (id, v) => { const el = document.getElementById(id); if (el && document.activeElement !== el) el.value = v; };

        setV('posX', isFinite(o.position.x) ? o.position.x.toFixed(2) : '0.00');
        setV('posY', isFinite(o.position.y) ? o.position.y.toFixed(2) : '0.00');
        setV('posZ', isFinite(o.position.z) ? o.position.z.toFixed(2) : '0.00');
        setV('rotY', isFinite(o.rotation.y) ? (o.rotation.y * 180 / Math.PI).toFixed(0) : '0');
        setV('scaleS', (isFinite(o.scale.x) && o.scale.x > 0) ? o.scale.x : 1);

        setV('flPosX', isFinite(o.position.x) ? o.position.x.toFixed(2) : '0.00');
        setV('flPosY', isFinite(o.position.y) ? o.position.y.toFixed(2) : '0.00');
        setV('flPosZ', isFinite(o.position.z) ? o.position.z.toFixed(2) : '0.00');

        const deg = (r) => isFinite(r) ? Math.round(r * 180 / Math.PI * 10) / 10 : 0;
        const pct = (s) => (isFinite(s) && s > 0) ? Math.round(s * 1000) / 10 : 100;

        setV('flRotX', deg(o.rotation.x));
        setV('flRotY', deg(o.rotation.y));
        setV('flRotZ', deg(o.rotation.z));
        setV('flScaleX', pct(o.scale.x));
        setV('flScaleY', pct(o.scale.y));
        setV('flScaleZ', pct(o.scale.z));
    },

    uiToModel: function () {
        if (!this.selectedObj || this.selectedObj.userData.locked) return;
        const o = this.selectedObj;

        const nx = parseFloat(document.getElementById('posX').value);
        const ny = parseFloat(document.getElementById('posY').value);
        const nz = parseFloat(document.getElementById('posZ').value);

        if (!isNaN(nx) && isFinite(nx)) o.position.x = nx;
        if (!isNaN(ny) && isFinite(ny)) {
            const maxY = this.getFloorBaseY(this.floorShapes.length);
            o.position.y = Math.max(0, Math.min(maxY, ny));
            if (o.userData && o.userData.type === 'light') o.userData.manualPosition = true;
        }
        if (!isNaN(nz) && isFinite(nz)) o.position.z = nz;

        const rot = parseFloat(document.getElementById('rotY').value);
        if (!isNaN(rot) && isFinite(rot)) o.rotation.y = rot * Math.PI / 180;
        if (this.transOptions.lockUpright) { o.rotation.x = 0; o.rotation.z = 0; }

        const s = parseFloat(document.getElementById('scaleS').value);
        if (!isNaN(s) && isFinite(s) && s > 0) o.scale.set(s, s, s);

        this.updateObjectFloorIndex(o);
        this.updateSceneVisibility();
        this.updateAnimSettings();
        this.modelToUI();
        if (o.userData.type === 'door_window') this.generate3D();
        this.refreshFloorModelList();
    },

    /* ============================================================
     *  ★ 传感器数据
     * ============================================================ */
    openSensorEditor: function () {
        const modal = document.getElementById('sensorModal');
        const select = document.getElementById('sensorFloorSelect');
        if (!modal || !select) return;

        select.innerHTML = '';
        for (let i = 0; i < this.floorShapes.length; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `${i + 1}层`;
            select.appendChild(opt);
        }

        if (this.playModeFloor !== undefined && this.playModeFloor >= 0 && this.playModeFloor < this.floorShapes.length) select.value = this.playModeFloor;
        else select.value = 0;

        this.renderSensorEditor();
        modal.style.display = 'flex';
    },

    renderSensorEditor: function () {
        const floorSel = document.getElementById('sensorFloorSelect');
        if (!floorSel) return;
        const floorIdx = parseInt(floorSel.value);
        if (isNaN(floorIdx)) return;

        if (!this.sensorEntities[floorIdx]) this.sensorEntities[floorIdx] = [];
        const container = document.getElementById('sensorListContainer');
        if (!container) return;

        container.innerHTML = '';
        const list = this.sensorEntities[floorIdx];

        if (list.length === 0) {
            container.innerHTML = `<div style="color:#888;text-align:center;padding:12px;font-size:0.8rem;">该层暂无传感器，请添加</div>`;
            return;
        }

        list.forEach((item, idx) => {
            const row = document.createElement('div');
            row.className = 'sensor-list-item';

            const info = document.createElement('div');
            info.className = 'sensor-info';
            const meta = this.SENSOR_TYPES[item.type] || this.SENSOR_TYPES.other;
            info.innerHTML = `<span>${meta.icon} ${item.name}</span><span class="entity-id">${item.entityId} · ${meta.name}</span>`;

            const delBtn = document.createElement('button');
            delBtn.className = 'del-sensor-btn';
            delBtn.textContent = '删除';
            delBtn.onclick = () => { this.removeSensorEntity(floorIdx, idx); };

            row.appendChild(info); row.appendChild(delBtn);
            container.appendChild(row);
        });
    },

    _addSensorCore: function (floorIdx, entityId, name, type) {
        if (!entityId) { this.saveSystem.showToast("⚠️ 请输入Entity ID"); return false; }
        if (!this.sensorEntities[floorIdx]) this.sensorEntities[floorIdx] = [];
        if (this.sensorEntities[floorIdx].some(s => s.entityId === entityId)) {
            this.saveSystem.showToast("⚠️ 该Entity ID已存在");
            return false;
        }
        this.sensorEntities[floorIdx].push({
            id: 'sen_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            entityId: entityId, name: name, type: type, unit: this.getSensorUnit(type)
        });
        return true;
    },

    addSensorEntity: function () {
        const floorIdx = parseInt(document.getElementById('sensorFloorSelect').value);
        const entityId = document.getElementById('sensorEntityId').value.trim();
        const name = document.getElementById('sensorName').value.trim() || entityId;
        const type = document.getElementById('sensorType').value;

        if (!this._addSensorCore(floorIdx, entityId, name, type)) return;

        document.getElementById('sensorEntityId').value = '';
        document.getElementById('sensorName').value = '';

        this.renderSensorEditor();
        if (this.sysMenuReady) this.sysRenderSensorList();
        this.saveSystem.showToast(`✅ 已添加传感器: ${name}`);
        this.saveSystem.saveToDB();
        this.fetchSensorData(entityId);
    },

    removeSensorEntity: function (floorIdx, index) {
        if (!this.sensorEntities[floorIdx]) return;
        this.sensorEntities[floorIdx].splice(index, 1);
        this.renderSensorEditor();
        if (this.sysMenuReady) this.sysRenderSensorList();
        this.saveSystem.showToast("🗑️ 已删除传感器");
        this.saveSystem.saveToDB();
        if (this.isPlayMode) this.updateSensorDisplay();
    },

    getSensorUnit: function (type) { const meta = this.SENSOR_TYPES[type]; return meta ? meta.unit : ''; },
    getSensorIcon: function (type) { const meta = this.SENSOR_TYPES[type]; return meta ? meta.icon : '📟'; },

    fetchSensorData: async function (entityId) {
        if (!this.haConfig.url || !this.haConfig.token) return;
        try {
            const stateData = await this.ha.fetchState(entityId);
            if (stateData) {
                this.sensorData[entityId] = { state: stateData.state, attributes: stateData.attributes, lastUpdated: Date.now() };
            }
        } catch (e) { console.warn("获取传感器数据失败:", entityId, e); }
    },

    fetchAllSensorData: async function () {
        const allEntities = [];
        for (let floor in this.sensorEntities)
            this.sensorEntities[floor].forEach(s => { allEntities.push(s.entityId); });
        if (allEntities.length === 0) return;

        const unique = [...new Set(allEntities)];
        for (const eid of unique) await this.fetchSensorData(eid);
        if (this.isPlayMode) this.updateSensorDisplay();
    },

	/* ============================================================
	 * ★ 传感器卡片显示
	 *   - 拖动中：直接返回，避免卡片被重建
	 *   - 长按卡片任意区域可拖拽（事件在 _setupSensorCardDrag 中挂载）
	 * ============================================================ */
	updateSensorDisplay: function () {
	  if (!this.isPlayMode) {
		this.clearSensorCards();
		return;
	  }

	  // ★★★ 核心修复①：拖动中不重建卡片，避免打断拖动
	  if (this._sensorCardDragging) return;

	  // ★ 确保拖拽样式已注入
	  this._injectSensorCardStyles();

	  const container = document.getElementById('sensorCardContainer');
	  if (!container) return;

	  this.clearSensorCards();

	  const targetFloor = this.playModeShowAll ? -1 : this.playModeFloor;

	  for (let floorIdx = 0; floorIdx < this.floorShapes.length; floorIdx++) {
		if (targetFloor !== -1 && floorIdx !== targetFloor) continue;

		const sensors = this.sensorEntities[floorIdx] || [];
		if (sensors.length === 0) continue;

		const savedOffset = this.sensorCardOffsets[floorIdx] || { x: 0, y: 0 };

		const card = document.createElement('div');
		card.className = 'sensor-card';
		card.dataset.floor = floorIdx;
		card.setAttribute('data-floor', String(floorIdx));

		const title = document.createElement('div');
		title.className = 'sensor-floor-title';
		title.innerHTML = `🏢 ${floorIdx + 1}层 传感器`;
		card.appendChild(title);

		sensors.forEach(s => {
		  const data = this.sensorData[s.entityId] || { state: '--', attributes: {} };
		  const val = (data.state !== undefined && data.state !== null &&
					   data.state !== 'unknown' && data.state !== 'unavailable')
			? data.state : '--';
		  const unit = s.unit || '';
		  const meta = this.SENSOR_TYPES[s.type] || this.SENSOR_TYPES.other;
		  const icon = meta.icon;

		  const item = document.createElement('div');
		  item.className = 'sensor-item';

		  const label = document.createElement('span');
		  label.className = 'sensor-label';
		  label.textContent = `${icon} ${s.name}`;

		  const valueSpan = document.createElement('span');
		  valueSpan.className = `sensor-value ${s.type}`;
		  valueSpan.textContent = `${val}${unit ? ' ' + unit : ''}`;
		  if (meta.color) valueSpan.style.color = meta.color;

		  item.appendChild(label);
		  item.appendChild(valueSpan);
		  card.appendChild(item);
		});

		// 视觉提示手柄（事件不绑它，绑整个卡片）
		const handle = document.createElement('div');
		handle.className = 'sensor-card-drag-handle';
		handle.textContent = '⠿';
		handle.title = '长按卡片任意位置拖动 · 双击复位';
		card.appendChild(handle);

		container.appendChild(card);

		this.sensorCards.push({
		  el: card,
		  floor: floorIdx,
		  offsetX: savedOffset.x || 0,
		  offsetY: savedOffset.y || 0,
		  isDragging: false
		});

		// ★★★ 核心修复②：把拖拽事件绑到整张卡片（任意区域可拖）
		this._setupSensorCardDrag(card, floorIdx);
	  }

	  this.updateSensorCardOpacity();
	  this.updateSensorCardPositions();
	},
	/* ============================================================
	 * ★ 传感器卡片拖拽（长按任意区域 → 拖动 → 抬手固定保存）
	 *   - 鼠标 / 触摸统一处理
	 *   - 长按 180ms 进入拖拽态
	 *   - 拖动过程中位置由"鼠标位移"直接驱动，完全不经过相机投影
	 *     → 旋转/缩放场景不会让卡片漂移或消失
	 *   - 抬手时把屏幕坐标反算成 offset 持久化（兼容原存档）
	 *   - 双击 / 双触 → 复位
	 * ============================================================ */
	_setupSensorCardDrag: function (card, floorIdx) {
	  if (!card) return;
	  if (card.dataset.sensorDragBound === '1') return;
	  card.dataset.sensorDragBound = '1';

	  const self = this;
	  const container = document.getElementById('sensorCardContainer');
	  const LONG_PRESS_MS = 180;
	  const MOVE_TOLERANCE = 6;
	  const PAD = 4;

	  let armed = false;
	  let dragging = false;
	  let moved = false;
	  let pressTimer = null;
	  let startClientX = 0, startClientY = 0;
	  // ★ 拖动中"卡片在容器内的绝对屏幕坐标"（不依赖相机）
	  let startCardX = 0, startCardY = 0;
	  // 拖动结束后用于回写 offset
	  let lastClientX = 0, lastClientY = 0;
	  let lastTap = 0;

	  const getItem = () => self.sensorCards.find(c => c.el === card);

	  const clearPress = () => {
		if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
	  };

	  const getViewport = () => ({
		w: self.renderer ? self.renderer.domElement.clientWidth : window.innerWidth,
		h: self.renderer ? self.renderer.domElement.clientHeight : window.innerHeight
	  });

	  const getCardSize = () => {
		const r = card.getBoundingClientRect();
		return { w: r.width || 120, h: r.height || 60 };
	  };

	  const clampToViewport = (x, y) => {
		const { w, h } = getViewport();
		const { w: cw, h: ch } = getCardSize();
		const halfW = cw / 2, halfH = ch / 2;
		return {
		  x: Math.max(halfW + PAD, Math.min(w - halfW - PAD, x)),
		  y: Math.max(halfH + PAD, Math.min(h - halfH - PAD, y))
		};
	  };

	  /* ---------------- 复位 ---------------- */
	  const doReset = () => {
		const item = getItem();
		if (!item) return;
		item.offsetX = 0;
		item.offsetY = 0;
		delete self.sensorCardOffsets[floorIdx];
		self.updateSensorCardPositions();
		self._scheduleSensorOffsetSave();
		self.saveSystem.showToast('🔄 卡片位置已复位');
	  };

	  /* ---------------- 进入拖拽态 ---------------- */
	  const beginDrag = () => {
		if (dragging) return;
		dragging = true;
		moved = false;

		const item = getItem();
		if (item) item.isDragging = true;

		self._sensorCardDragging = true;

		// ★ 记录卡片当前的屏幕绝对位置（不依赖相机，拖动期间只加位移）
		const cRect = card.getBoundingClientRect();
		const contRect = container ? container.getBoundingClientRect() : { left: 0, top: 0 };
		startCardX = cRect.left - contRect.left + (cRect.width / 2);
		startCardY = cRect.top - contRect.top + (cRect.height / 2);

		card.classList.add('dragging');
		card.style.transition = 'none';
		document.body.classList.add('sensor-card-dragging');

		if (navigator.vibrate) { try { navigator.vibrate(15); } catch (e) {} }
	  };

	  /* ---------------- 退出拖拽态 ---------------- */
	  const endDrag = (saveIt) => {
		clearPress();
		const wasDragging = dragging;
		const wasMoved = moved;

		if (dragging) {
		  dragging = false;
		  const item = getItem();
		  if (item) item.isDragging = false;

		  self._sensorCardDragging = false;
		  card.classList.remove('dragging');
		  card.style.transition = '';
		  document.body.classList.remove('sensor-card-dragging');
		}

		if (wasDragging && wasMoved && saveIt) {
		  // ★ 拖动结束：把屏幕坐标反算成相对投影点的 offset 并持久化
		  const item = getItem();
		  if (item) {
			const base = self._sensorCardBasePos(floorIdx);
			// 卡片中心当前在容器内的坐标
			const cRect = card.getBoundingClientRect();
			const contRect = container ? container.getBoundingClientRect() : { left: 0, top: 0 };
			const curCenterX = cRect.left - contRect.left + cRect.width / 2;
			const curCenterY = cRect.top - contRect.top + cRect.height / 2;
			item.offsetX = curCenterX - base.x;
			item.offsetY = curCenterY - base.y;
			self.sensorCardOffsets[floorIdx] = { x: item.offsetX, y: item.offsetY };
		  }
		  self._scheduleSensorOffsetSave();
		  self.saveSystem.showToast('📌 卡片位置已固定保存');
		}

		armed = false;

		document.removeEventListener('mousemove', onMove);
		document.removeEventListener('mouseup', onUp);
		document.removeEventListener('touchmove', onMove);
		document.removeEventListener('touchend', onUp);
		document.removeEventListener('touchcancel', onUp);

		return { wasDragging, wasMoved };
	  };

	  /* ---------------- 移动 ---------------- */
	  const onMove = (e) => {
		if (!armed && !dragging) return;

		const t = (e.touches && e.touches[0]) ? e.touches[0]
				: (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0]
				: e;
		if (!t) return;
		lastClientX = t.clientX;
		lastClientY = t.clientY;

		// 未进入拖拽：位移超过阈值即取消长按
		if (!dragging) {
		  if (Math.abs(t.clientX - startClientX) > MOVE_TOLERANCE ||
			  Math.abs(t.clientY - startClientY) > MOVE_TOLERANCE) {
			clearPress();
			endDrag(false);
		  }
		  return;
		}

		// ★ 拖动中：位置 = 起始屏幕位置 + 鼠标位移，完全不经过相机投影
		const dx = t.clientX - startClientX;
		const dy = t.clientY - startClientY;
		if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;

		const target = clampToViewport(startCardX + dx, startCardY + dy);

		card.style.left = `${target.x - (card.offsetWidth / 2)}px`;
		card.style.top = `${target.y - (card.offsetHeight / 2)}px`;
		card.style.display = 'block';

		if (e.cancelable) e.preventDefault();
	  };

	  /* ---------------- 抬手 ---------------- */
	  const onUp = (e) => {
		const { wasDragging, wasMoved } = endDrag(true);

		if (wasDragging && wasMoved) {
		  if (e && e.cancelable) e.preventDefault();
		  if (e && e.stopPropagation) e.stopPropagation();
		  // 拖动后短暂屏蔽 dblclick，避免误触发复位
		  card.dataset.suppressDbl = '1';
		  setTimeout(() => { delete card.dataset.suppressDbl; }, 350);
		  return;
		}

		// 触摸双击复位（仅未拖动时）
		if (e && e.changedTouches && e.changedTouches.length) {
		  if (!wasMoved) {
			const now = Date.now();
			if (now - lastTap < 350) { doReset(); lastTap = 0; }
			else lastTap = now;
		  } else {
			lastTap = 0;
		  }
		}
	  };

	  /* ---------------- 按下 ---------------- */
	  const onDown = (e) => {
		if (!e.touches && e.button !== undefined && e.button !== 0) return;
		if (e.touches && e.touches.length > 1) return;

		// 阻止冒泡到 3D 视口，避免触发 on3DClick / 相机 / 场景状态
		e.stopPropagation();

		const item = getItem();
		if (!item) return;

		const t = (e.touches && e.touches[0]) ? e.touches[0] : e;
		if (!t) return;

		startClientX = t.clientX;
		startClientY = t.clientY;
		lastClientX = t.clientX;
		lastClientY = t.clientY;
		moved = false;
		armed = true;

		clearPress();
		pressTimer = setTimeout(() => {
		  pressTimer = null;
		  if (!armed) return;
		  beginDrag();
		}, LONG_PRESS_MS);

		document.addEventListener('mousemove', onMove);
		document.addEventListener('mouseup', onUp);
		document.addEventListener('touchmove', onMove, { passive: false });
		document.addEventListener('touchend', onUp);
		document.addEventListener('touchcancel', onUp);
	  };

	  /* ---------------- 事件绑定：整张卡片 ---------------- */
	  card.addEventListener('mousedown', onDown);
	  card.addEventListener('touchstart', onDown, { passive: true });

	  // 双击复位（拖动后 350ms 内被 suppress）
	  card.addEventListener('dblclick', (e) => {
		e.stopPropagation();
		if (card.dataset.suppressDbl === '1') return;
		if (dragging || moved) return;
		doReset();
	  });

	  // 长按/拖拽期间屏蔽系统右键菜单
	  card.addEventListener('contextmenu', (e) => {
		if (dragging || armed) e.preventDefault();
	  });
	},

	/* ============================================================
	 * ★ 卡片偏移防抖保存（抬手后 800ms 统一写库）
	 * ============================================================ */
	_scheduleSensorOffsetSave: function () {
	  if (this._sensorOffsetSaveTimer) clearTimeout(this._sensorOffsetSaveTimer);
	  this._sensorOffsetSaveTimer = setTimeout(() => {
		this._sensorOffsetSaveTimer = null;
		try { this.saveSystem.saveToDB(true); } catch (e) {}
	  }, 800);
	},

	/* ============================================================
	 * ★ 卡片位置刷新（旋转/缩放场景时不再让卡片消失）
	 *   - 只按楼层过滤，不做 NDC 视野裁剪
	 *   - 拖动中的卡片完全交给 _setupSensorCardDrag 控制
	 *   - 位置统一钳制到视口内，保证永远可见
	 * ============================================================ */
	updateSensorCardPositions: function () {
	  const container = document.getElementById('sensorCardContainer');
	  if (!container || !this.renderer) return;

	  const clientW = this.renderer.domElement.clientWidth;
	  const clientH = this.renderer.domElement.clientHeight;
	  if (clientW === 0 || clientH === 0) return;

	  const targetFloor = this.playModeShowAll ? -1 : this.playModeFloor;
	  const PAD = 4; // 视口内边距，避免贴边

	  this.sensorCards.forEach(item => {
		const floorIdx = item.floor;

		// ── 楼层过滤：不在当前查看的楼层 → 隐藏 ──
		if (targetFloor !== -1 && floorIdx !== targetFloor) {
		  item.el.style.display = 'none';
		  return;
		}

		// ── 拖动中的卡片：完全由拖动逻辑接管，这里不干预 ──
		if (item.isDragging) return;

		// ── 计算投影基准点 + 用户偏移 ──
		const base = this._sensorCardBasePos(floorIdx);
		let x = base.x + (item.offsetX || 0);
		let y = base.y + (item.offsetY || 0);

		// ── 视口边界钳制（关键：保证卡片永远在可见区域内） ──
		const rect = item.el.getBoundingClientRect();
		const halfW = rect.width / 2 || 60;
		const halfH = rect.height / 2 || 30;
		x = Math.max(halfW + PAD, Math.min(clientW - halfW - PAD, x));
		y = Math.max(halfH + PAD, Math.min(clientH - halfH - PAD, y));

		// ── 无条件显示（只受楼层过滤影响，不再受相机朝向影响） ──
		item.el.style.display = 'block';
		item.el.style.left = `${x}px`;
		item.el.style.top = `${y}px`;
	  });
	},

    calculateFloorCenters: function () {
        const centers = [];
        const scale = 20 / this.canvas.width;
        const offX = this.canvas.width / 2;
        const offY = this.canvas.height / 2;

        for (let floorIdx = 0; floorIdx < this.floorShapes.length; floorIdx++) {
            const shapes = this.floorShapes[floorIdx];
            let cx = 0, cz = 0, count = 0;

            shapes.forEach(shape => {
                shape.forEach(p => {
                    const wx = (p.x - offX) * scale;
                    const wz = (p.y - offY) * scale;
                    cx += wx; cz += wz; count++;
                });
            });

            if (count > 0) centers.push({ x: cx / count, z: cz / count });
            else centers.push({ x: 0, z: 0 });
        }
        return centers;
    },
	/* ============================================================
	 * ★ 计算某楼层传感器卡片在屏幕上的"投影基准点"
	 *   - 该函数只负责把 3D 坐标投影成 2D 像素
	 *   - 不做任何裁剪、不做可见性判断
	 *   - 供 updateSensorCardPositions / 拖动保存共用
	 * ============================================================ */
	_sensorCardBasePos: function (floorIdx) {
	  const clientW = this.renderer.domElement.clientWidth;
	  const clientH = this.renderer.domElement.clientHeight;

	  const centers = this.calculateFloorCenters();
	  const center = centers[floorIdx] || { x: 0, z: 0 };
	  const h = this.getWallHeight(floorIdx);
	  const yPos = this.getFloorBaseY(floorIdx) + h / 2 + 0.5;

	  const worldPos = new THREE.Vector3(center.x, yPos, center.z);
	  worldPos.project(this.camera);

	  const x = (worldPos.x * 0.5 + 0.5) * clientW;
	  const y = (worldPos.y * -0.5 + 0.5) * clientH;

	  return { x, y, ndcZ: worldPos.z };
	},
	/* ============================================================
	 * ★ 清空所有传感器卡片（退出演示模式 / 切楼层时调用）
	 * ============================================================ */
	clearSensorCards: function () {
	  const container = document.getElementById('sensorCardContainer');
	  if (container) container.innerHTML = '';
	  this.sensorCards = [];
	  // ★ 强制退出拖动态，防止状态残留
	  this._sensorCardDragging = false;
	  document.body.classList.remove('sensor-card-dragging');
	},

    /* ============================================================
     *  ★ 楼层模型管理器
     * ============================================================ */
    initFloorModelManager: function () {
        if (this._flPanelInited) return;
        const sidebarRight = document.getElementById('sidebarRight');
        if (!sidebarRight) return;

        const panel = document.createElement('div');
        panel.className = 'panel-group';
        panel.id = 'flModelManagerPanel';
        panel.style.marginTop = '6px';
        panel.innerHTML = `
<div class="group-title">📋 当前层模型管理 <span class="badge" id="flModelCount">0</span></div>
<div id="flModelList" style="max-height:180px;overflow-y:auto;margin-bottom:8px;border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:4px;"></div>
<div id="flPropPanel" style="border-top:1px dashed #444;padding-top:8px;display:none;">
<div class="group-title" style="font-size:0.7rem;color:var(--accent);">🔧 属性编辑</div>
<div class="control-item" style="background:#333;padding:4px;border-radius:4px;">
<label style="color:var(--accent);font-weight:bold;">🏷️ 名称</label>
<input type="text" id="flObjName" onchange="app.flUpdateObjName()">
</div>
<div class="control-item" style="background:#222;padding:4px;border-radius:4px;margin-top:4px;">
<label style="color:#aaa;">🔗 Entity ID</label>
<input type="text" id="flObjEntityId" placeholder="light.xx / switch.xx" onchange="app.flUpdateObjEntityId()">
</div>
<div class="control-item" id="flWalkerRow" style="display:none;background:#222;padding:6px;border-radius:4px;margin-top:4px;">
<label style="color:var(--accent);font-weight:bold;">🚶 行走控制</label>
<label class="feature-check" style="margin:4px 0 0;"><input type="checkbox" id="flWalkFreeze" onchange="app.flUpdateWalkerFreeze(this)"> 🚫 禁止移动 (原地播放自带动画)</label>
</div>
<div class="btn-row" style="margin-top:6px;">
<button id="flLockBtn" onclick="app.flToggleLock()">🔓 锁定</button>
<button class="danger" onclick="app.flDeleteSelected()">删除</button>
</div>
<div class="control-item"><label>X</label><input type="number" id="flPosX" step="0.1" onchange="app.flUiToModel()"></div>
<div class="control-item"><label>Y</label><input type="number" id="flPosY" step="0.1" onchange="app.flUiToModel()"></div>
<div class="control-item"><label>Z</label><input type="number" id="flPosZ" step="0.1" onchange="app.flUiToModel()"></div>
<div class="control-item"><label>旋转° (X / Y / Z)</label>
<div style="display:flex;gap:4px;">
<input type="number" id="flRotX" step="5" value="0" onchange="app.flUiToModel()" style="min-width:0;flex:1;">
<input type="number" id="flRotY" step="5" value="0" onchange="app.flUiToModel()" style="min-width:0;flex:1;">
<input type="number" id="flRotZ" step="5" value="0" onchange="app.flUiToModel()" style="min-width:0;flex:1;">
</div>
</div>
<div class="control-item"><label>缩放% (X / Y / Z)</label>
<div style="display:flex;gap:4px;">
<input type="number" id="flScaleX" min="0" max="1000" step="1" value="100" onchange="app.flUiToModel()" style="min-width:0;flex:1;">
<input type="number" id="flScaleY" min="0" max="1000" step="1" value="100" onchange="app.flUiToModel()" style="min-width:0;flex:1;">
<input type="number" id="flScaleZ" min="0" max="1000" step="1" value="100" onchange="app.flUiToModel()" style="min-width:0;flex:1;">
</div>
</div>
<div id="flAnimControls" class="anim-controls" style="display:block;border-top:1px dashed var(--accent);padding-top:8px;margin-top:8px;">
<div class="group-title" style="font-size:0.7rem;">✨ 动画引擎</div>
<label class="feature-check"><input type="checkbox" id="flAnimEnabled" onchange="app.flUpdateAnimSettings()"> 启用动画</label>
<div class="control-item"><label>特效</label><select id="flAnimType" onchange="app.flOnAnimTypeChange()"></select></div>
<div id="flDynamicParamsContainer"></div>
<div style="margin-top:10px;border-top:1px dashed #444;padding-top:8px;">
<div style="font-size:0.65rem;color:#888;margin-bottom:4px;">扩展库:</div>
<div class="texture-upload" onclick="document.getElementById('pluginLoader').click()">🧩 导入动画插件 (.js)<input type="file" id="pluginLoader" hidden accept=".js" onchange="app.loadPlugin(this)"></div>
</div>
</div>
<div id="flMaterialControls" class="material-controls" style="display:block;border-top:1px dashed #444;padding-top:8px;margin-top:8px;">
<div class="group-title" style="font-size:0.7rem;">🎨 材质 (PBR)</div>
<div class="control-item"><label>颜色</label><input type="color" id="flMatColor" onchange="app.flUpdateMaterial()"></div>
<div class="control-item"><label>粗糙度</label><input type="range" id="flMatRoughness" min="0" max="1" step="0.01" value="0.5" oninput="app.flUpdateMaterial()"></div>
<div class="control-item"><label>金属度</label><input type="range" id="flMatMetalness" min="0" max="1" step="0.01" value="0.2" oninput="app.flUpdateMaterial()"></div>
<div class="control-item"><label>透明度</label><input type="range" id="flMatOpacity" min="0" max="1" step="0.01" value="1.0" oninput="app.flUpdateMaterial()"></div>
<div class="texture-upload" onclick="document.getElementById('flMatTextureInput').click()">📁 上传纹理贴图<input type="file" id="flMatTextureInput" hidden accept="image/*" onchange="app.flHandleMaterialTexture(this)"></div>
<div class="btn-row">
<button onclick="app.flResetMaterial()">🔄 重置</button>
<button onclick="app.flApplyToAllSimilar()">📋 同类应用</button>
</div>
</div>
</div>
<div id="flEmptyHint" style="color:#888;text-align:center;padding:12px;font-size:0.72rem;">当前楼层暂无模型</div>`;

        const libPanel = document.getElementById('glbLibraryPanel');
        if (libPanel && libPanel.parentNode === sidebarRight)
            libPanel.parentNode.insertBefore(panel, libPanel.nextSibling);
        else sidebarRight.appendChild(panel);

        this._flPanelInited = true;
        this.refreshFloorModelList();
        this.flRefreshAnimTypeSelect();
    },

    flRefreshAnimTypeSelect: function () {
        const select = document.getElementById('flAnimType');
        if (!select) return;
        const currentVal = select.value;
        select.innerHTML = '';

        Object.values(this.plugins).forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.name;
            select.appendChild(opt);
        });

        if (currentVal && this.plugins[currentVal]) select.value = currentVal;
        else if (this._flSelectedId) {
            const obj = this.furnitureGroup.children.find(c => c.userData && c.userData.id === this._flSelectedId);
            if (obj && obj.userData.animationConfig) select.value = obj.userData.animationConfig.type;
        }
    },

    refreshFloorModelList: function () {
        const listEl = document.getElementById('flModelList');
        const countEl = document.getElementById('flModelCount');
        const emptyEl = document.getElementById('flEmptyHint');
        const propEl = document.getElementById('flPropPanel');
        if (!listEl) return;

        const floorIdx = this.currentFloor;
        const models = [];

        this.furnitureGroup.children.forEach(obj => {
            if (!obj.userData) return;
            const fIdx = obj.userData.floorIndex !== undefined ? obj.userData.floorIndex : this.floorIndexOfY(obj.position.y);
            if (fIdx === floorIdx) models.push(obj);
        });

        if (countEl) countEl.innerText = models.length;

        if (models.length === 0) {
            listEl.innerHTML = '';
            if (emptyEl) emptyEl.style.display = 'block';
            if (propEl) propEl.style.display = 'none';
            return;
        }

        if (emptyEl) emptyEl.style.display = 'none';
        listEl.innerHTML = '';

        models.forEach(obj => {
            const d = obj.userData;
            const isSelected = (this._flSelectedId === d.id);

            const item = document.createElement('div');
            item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:4px 6px;border-radius:4px;margin-bottom:2px;cursor:pointer;background:' + (isSelected ? 'rgba(76,201,240,0.15)' : 'rgba(255,255,255,0.04)') + ';border-left:3px solid ' + (isSelected ? 'var(--accent)' : 'transparent') + ';';

            item.onclick = () => {
                this._flSelectedId = d.id;
                this.flSelectObj(obj);
                this.refreshFloorModelList();
            };

            const nameSpan = document.createElement('span');
            nameSpan.style.cssText = 'font-size:0.7rem;color:' + (isSelected ? 'var(--accent)' : '#ddd') + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;';
            nameSpan.textContent = d.name || '未命名';

            const typeSpan = document.createElement('span');
            typeSpan.style.cssText = 'font-size:0.55rem;color:#888;margin-left:6px;flex-shrink:0;';
            const typeMap = { 'light': '💡', 'ac': '❄️', 'tv': '📺', 'door_window': '🚪', 'walker': '🚶', 'furniture': '🪑' };
            typeSpan.textContent = typeMap[d.type] || '📦';

            item.appendChild(nameSpan); item.appendChild(typeSpan);
            listEl.appendChild(item);
        });

        if (this._flSelectedId) {
            const obj = this.furnitureGroup.children.find(c => c.userData && c.userData.id === this._flSelectedId);
            if (obj && obj.parent) { this.flShowPropPanel(obj); if (propEl) propEl.style.display = 'block'; }
            else { this._flSelectedId = null; if (propEl) propEl.style.display = 'none'; }
        } else {
            if (propEl) propEl.style.display = 'none';
        }
    },

	flSelectObj: function (obj) {
		this.selectedObj = obj;
		this.selectedMaterialTarget = null;

		const propPanel = document.getElementById('propPanel');
		if (propPanel) propPanel.style.display = 'none';

		// ★ 统一由 _updateTransformToolbarVisibility 处理显示逻辑
		this._updateTransformToolbarVisibility();

		this.flShowPropPanel(obj);
		if (!obj.userData.locked) this.transCtrl.attach(obj);
		if (this.transCtrl && this.transCtrl.mode) this.setTransformMode(this.transCtrl.mode);
		this.modelToUI();
		this.updateLockBtn();
		this.refreshFloorModelList();
	},

    flShowPropPanel: function (obj) {
        const d = obj.userData;
        if (!d) return;

        const setV = (id, v) => { const el = document.getElementById(id); if (el && document.activeElement !== el) el.value = v; };

        setV('flObjName', d.name || '');
        setV('flObjEntityId', d.entityId || '');
        setV('flPosX', isFinite(obj.position.x) ? obj.position.x.toFixed(2) : '0.00');
        setV('flPosY', isFinite(obj.position.y) ? obj.position.y.toFixed(2) : '0.00');
        setV('flPosZ', isFinite(obj.position.z) ? obj.position.z.toFixed(2) : '0.00');

        const deg = (r) => isFinite(r) ? Math.round(r * 180 / Math.PI * 10) / 10 : 0;
        const pct = (s) => (isFinite(s) && s > 0) ? Math.round(s * 1000) / 10 : 100;

        const lockU = !!this.transOptions.lockUpright;
        setV('flRotX', lockU ? 0 : deg(obj.rotation.x));
        setV('flRotY', deg(obj.rotation.y));
        setV('flRotZ', lockU ? 0 : deg(obj.rotation.z));

        ['flRotX', 'flRotZ'].forEach(id => { const el = document.getElementById(id); if (el) el.disabled = lockU; });

        setV('flScaleX', pct(obj.scale.x));
        setV('flScaleY', pct(obj.scale.y));
        setV('flScaleZ', pct(obj.scale.z));

        const wkRow = document.getElementById('flWalkerRow');
        if (wkRow) wkRow.style.display = (d.type === 'walker') ? 'block' : 'none';
        const wfc = document.getElementById('flWalkFreeze');
        if (wfc) wfc.checked = !!(d.walkConfig && d.walkConfig.freeze);

        this.flRefreshAnimTypeSelect();

        if (!d.animationConfig) {
            const firstType = (document.getElementById('flAnimType') || {}).value || 'ripple';
            d.animationConfig = { enabled: false, type: firstType };
        }
        const config = d.animationConfig;
        const en = document.getElementById('flAnimEnabled');
        if (en) en.checked = config.enabled;
        const at = document.getElementById('flAnimType');
        if (at) at.value = config.type;

        const plugin = this.plugins[config.type];
        if (plugin) this.flRenderPluginParamsUI(plugin, config);

        if (d.materials && Object.keys(d.materials).length > 0) {
            const firstMatKey = Object.keys(d.materials)[0];
            const mat = d.materials[firstMatKey];
            if (mat) {
                this.selectedMaterialTarget = mat;
                setV('flMatColor', '#' + mat.color.getHexString());
                setV('flMatRoughness', mat.roughness || 0.5);
                setV('flMatMetalness', mat.metalness || 0.2);
                setV('flMatOpacity', mat.opacity || 1.0);
            }
        }

        this.flUpdateLockBtn();
    },

    flRenderPluginParamsUI: function (plugin, currentConfig) {
        const container = document.getElementById('flDynamicParamsContainer');
        if (!container) return;
        container.innerHTML = '';

        plugin.params.forEach(param => {
            const wrapper = document.createElement('div');
            wrapper.className = 'control-item';
            const label = document.createElement('label');
            label.innerText = param.label;
            wrapper.appendChild(label);

            if (param.type === 'range') {
                const group = document.createElement('div');
                group.className = 'input-group';
                const range = document.createElement('input');
                range.type = 'range'; range.min = param.min; range.max = param.max; range.step = param.step;
                range.value = currentConfig[param.id] !== undefined ? currentConfig[param.id] : param.default;

                const num = document.createElement('input');
                num.type = 'number'; num.min = param.min; num.max = param.max; num.step = param.step;
                num.value = range.value;

                range.oninput = () => { num.value = range.value; this.flUpdatePluginParam(param.id, parseFloat(range.value)); };
                num.onchange = () => { range.value = num.value; this.flUpdatePluginParam(param.id, parseFloat(num.value)); };

                group.appendChild(range); group.appendChild(num);
                wrapper.appendChild(group);
            } else if (param.type === 'color') {
                const colorInput = document.createElement('input');
                colorInput.type = 'color';
                colorInput.value = currentConfig[param.id] !== undefined ? currentConfig[param.id] : param.default;
                colorInput.oninput = () => this.flUpdatePluginParam(param.id, colorInput.value);
                wrapper.appendChild(colorInput);
            }
            container.appendChild(wrapper);
        });
    },

    flUpdatePluginParam: function (key, value) {
        const obj = this.getFlSelectedObj();
        if (!obj) return;
        if (obj.userData.animationConfig) {
            obj.userData.animationConfig[key] = value;
            this.saveSystem.saveToDB(true);
        }
        this.applyAnimationToObject(obj);
        this.flShowPropPanel(obj);
    },

    flUpdateObjName: function () {
        const obj = this.getFlSelectedObj();
        if (!obj) return;
        const el = document.getElementById('flObjName');
        if (el) obj.userData.name = el.value;
        if (this.isPlayMode) this.createLabels();
        this.refreshFloorModelList();
    },

    flUpdateObjEntityId: function () {
        const obj = this.getFlSelectedObj();
        if (!obj) return;
        const el = document.getElementById('flObjEntityId');
        if (el) obj.userData.entityId = el.value;
    },

    flUpdateWalkerFreeze: function (cb) {
        const obj = this.getFlSelectedObj();
        if (!obj || obj.userData.type !== 'walker') return;

        obj.userData.walkConfig = obj.userData.walkConfig || {
            speed: 0.6, radius: 0.35, faceOffset: 0, useAnim: true, useBob: true,
            freeze: false, dir: 0, turnTimer: 2, paused: false
        };
        obj.userData.walkConfig.freeze = !!cb.checked;
        if (obj.userData.walkConfig.freeze) obj.userData.walkConfig.paused = false;

        this.saveSystem.saveToDB(true);
        this.saveSystem.showToast(cb.checked ? '🚫 已禁止移动: 模型将原地播放自带动画' : '🚶 已恢复自动行走巡游');
    },

    flUiToModel: function () {
        const obj = this.getFlSelectedObj();
        if (!obj || obj.userData.locked) return;

        const gv = (id) => { const el = document.getElementById(id); return el ? parseFloat(el.value) : NaN; };

        const nx = gv('flPosX');
        const ny = gv('flPosY');
        const nz = gv('flPosZ');

        if (isFinite(nx)) obj.position.x = nx;
        if (isFinite(ny)) {
            const maxY = this.getFloorBaseY(this.floorShapes.length);
            obj.position.y = Math.max(0, Math.min(maxY, ny));
            if (obj.userData && obj.userData.type === 'light') obj.userData.manualPosition = true;
        }
        if (isFinite(nz)) obj.position.z = nz;

        const lockU = !!this.transOptions.lockUpright;
        const rx = gv('flRotX');
        const ry = gv('flRotY');
        const rz = gv('flRotZ');

        if (isFinite(ry)) obj.rotation.y = ry * Math.PI / 180;
        if (lockU) { obj.rotation.x = 0; obj.rotation.z = 0; }
        else {
            if (isFinite(rx)) obj.rotation.x = rx * Math.PI / 180;
            if (isFinite(rz)) obj.rotation.z = rz * Math.PI / 180;
        }

        [['flScaleX', 'x'], ['flScaleY', 'y'], ['flScaleZ', 'z']].forEach(pair => {
            const v = gv(pair[0]);
            if (isFinite(v) && v > 0) obj.scale[pair[1]] = v / 100;
        });

        this.updateObjectFloorIndex(obj);
        this.updateSceneVisibility();
        this.flShowPropPanel(obj);
        if (obj.userData.type === 'door_window') this.generate3D();
        this.saveSystem.saveToDB(true);
    },

    flToggleLock: function () {
        const obj = this.getFlSelectedObj();
        if (!obj) return;
        obj.userData.locked = !obj.userData.locked;
        if (obj.userData.locked) this.transCtrl.detach();
        else this.transCtrl.attach(obj);
        this.flUpdateLockBtn();
    },

    flUpdateLockBtn: function () {
        const btn = document.getElementById('flLockBtn');
        if (!btn) return;
        const obj = this.getFlSelectedObj();
        if (obj && obj.userData && obj.userData.locked) { btn.innerText = "🔒 已锁定"; btn.className = 'danger'; }
        else { btn.innerText = "🔓 锁定"; btn.className = ''; }
    },

    flDeleteSelected: function () {
        const obj = this.getFlSelectedObj();
        if (!obj) return;
        this.dialog.confirm(`确定删除 "${obj.userData.name || '未命名'}" ？`, () => {
            if (obj.userData.animEffectGroup) obj.remove(obj.userData.animEffectGroup);
            if (this._pendingAnimObjects) this._pendingAnimObjects = this._pendingAnimObjects.filter(o => o !== obj);

            this.furnitureGroup.remove(obj);

            if (this.selectedObj === obj) {
                this.selectedObj = null;
                this.selectedMaterialTarget = null;
                this.transCtrl.detach();
                const propPanel = document.getElementById('propPanel');
                if (propPanel) propPanel.style.display = 'none';
                const toolbar = document.getElementById('transformToolbar');
                if (toolbar) toolbar.style.display = 'none';
            }

            this._flSelectedId = null;
            this.generate3D();
            if (this.isPlayMode) this.createLabels();
            this.saveSystem.showToast("🗑️ 已删除选中对象");
            this.refreshFloorModelList();
            this.saveSystem.saveToDB(true);
        });
    },

    flUpdateAnimSettings: function () {
        const obj = this.getFlSelectedObj();
        if (!obj) return;
        const el = document.getElementById('flAnimEnabled');
        if (!el) return;
        const enabled = el.checked;

        if (!obj.userData.animationConfig) { this.flOnAnimTypeChange(); return; }
        obj.userData.animationConfig.enabled = enabled;
        this.applyAnimationToObject(obj);
        this.saveSystem.saveToDB(true);
        this.flShowPropPanel(obj);
    },

    flOnAnimTypeChange: function () {
        const obj = this.getFlSelectedObj();
        if (!obj) return;
        const newType = document.getElementById('flAnimType').value;
        const plugin = this.plugins[newType];
        if (!plugin) return;

        const config = { enabled: true, type: newType };
        plugin.params.forEach(p => config[p.id] = p.default);
        obj.userData.animationConfig = config;

        this.flRenderPluginParamsUI(plugin, config);
        this.applyAnimationToObject(obj);
        this.saveSystem.saveToDB(true);
        this.flShowPropPanel(obj);
        this.refreshFloorModelList();
    },

    flUpdateMaterial: function () {
        const obj = this.getFlSelectedObj();
        if (!obj || !this.selectedMaterialTarget) return;

        const color = document.getElementById('flMatColor').value;
        const roughness = parseFloat(document.getElementById('flMatRoughness').value);
        const metalness = parseFloat(document.getElementById('flMatMetalness').value);
        const opacity = parseFloat(document.getElementById('flMatOpacity').value);

        this.selectedMaterialTarget.color.set(color);
        this.selectedMaterialTarget.roughness = roughness;
        this.selectedMaterialTarget.metalness = metalness;
        this.selectedMaterialTarget.opacity = opacity;
        this.selectedMaterialTarget.transparent = opacity < 1.0;
        this.selectedMaterialTarget.needsUpdate = true;

        if (obj.userData.materialProperties) {
            obj.userData.materialProperties.color = color;
            obj.userData.materialProperties.roughness = roughness;
            obj.userData.materialProperties.metalness = metalness;
            obj.userData.materialProperties.opacity = opacity;
        }

        this.saveSystem.saveToDB(true);
    },

    flResetMaterial: function () {
        const obj = this.getFlSelectedObj();
        if (!obj || !this.selectedMaterialTarget) return;

        const defaults = this.getDefaultMaterialProperties(obj.userData.type);

        this.selectedMaterialTarget.color.set(defaults.color);
        this.selectedMaterialTarget.roughness = defaults.roughness;
        this.selectedMaterialTarget.metalness = defaults.metalness;
        this.selectedMaterialTarget.opacity = defaults.opacity;
        this.selectedMaterialTarget.transparent = defaults.opacity < 1.0;
        this.selectedMaterialTarget.map = null;
        this.selectedMaterialTarget.needsUpdate = true;

        const a = document.getElementById('flMatColor'); if (a) a.value = defaults.color;
        const b = document.getElementById('flMatRoughness'); if (b) b.value = defaults.roughness;
        const c = document.getElementById('flMatMetalness'); if (c) c.value = defaults.metalness;
        const d = document.getElementById('flMatOpacity'); if (d) d.value = defaults.opacity;

        this.saveSystem.showToast("🔄 材质已重置");
        this.saveSystem.saveToDB(true);
    },

    flApplyToAllSimilar: function () {
        const obj = this.getFlSelectedObj();
        if (!obj || !this.selectedMaterialTarget) return;

        const currentType = obj.userData.type;
        const currentMaterial = this.selectedMaterialTarget;
        let count = 0;

        this.furnitureGroup.children.forEach(o => {
            if (o.userData.type === currentType && o !== obj) {
                const materials = o.userData.materials;
                if (materials) {
                    Object.values(materials).forEach(mat => {
                        mat.color.copy(currentMaterial.color);
                        mat.roughness = currentMaterial.roughness;
                        mat.metalness = currentMaterial.metalness;
                        mat.opacity = currentMaterial.opacity;
                        mat.transparent = currentMaterial.transparent;
                        mat.map = currentMaterial.map;
                        mat.needsUpdate = true;
                    });
                    count++;
                }
            }
        });

        this.saveSystem.showToast(`✅ 已将材质应用到 ${count} 个同类模型`);
        this.saveSystem.saveToDB(true);
    },

    flHandleMaterialTexture: function (input) {
        const obj = this.getFlSelectedObj();
        if (!obj || !input.files || !input.files[0]) { this.saveSystem.showToast("⚠️ 请先选择一个对象，再上传纹理"); return; }
        const file = input.files[0];
        if (!file.type.startsWith('image/')) { this.saveSystem.showToast("⚠️ 请选择图片格式的文件"); input.value = ''; return; }

        const img = new Image();
        img.onload = () => {
            const texture = new THREE.CanvasTexture(img);
            texture.image = img;
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.encoding = THREE.sRGBEncoding;
            this.adjustUVMapping(obj, texture);

            if (this.selectedMaterialTarget) {
                this.selectedMaterialTarget.map = texture;
                this.selectedMaterialTarget.needsUpdate = true;
                if (obj.userData.materialProperties) obj.userData.materialProperties.texture = texture;
                this.saveSystem.showToast(`✅ 纹理 "${file.name}" 已应用`);
            }

            const textureId = `user_${Date.now()}`;
            this.materialTextures.set(textureId, texture);
            this.saveSystem.saveToDB(true);
        };
        img.onerror = () => { this.saveSystem.showToast("❌ 纹理图片加载失败"); };
        img.src = URL.createObjectURL(file);
        input.value = '';
    },

    getFlSelectedObj: function () {
        if (!this._flSelectedId) return null;
        return this.furnitureGroup.children.find(c => c.userData && c.userData.id === this._flSelectedId) || null;
    },


	/* ★★★ 新增：统一根据锁定状态控制 TransformControls 三轴手柄显隐
	   - translate + lockHorizontal：隐藏 Y 轴手柄，只允许在 XZ 平面移动
	   - rotate    + lockUpright   ：隐藏 X/Z 轴手柄，只允许绕 Y 轴水平旋转
	   - scale 模式保持三轴全开（缩放通常需要等比） */
	_applyTransformGizmoVisibility: function (mode) {
		if (!this.transCtrl) return;

		mode = mode || this.transCtrl.mode || 'translate';
		const lockH = !!this.transOptions.lockHorizontal;
		const lockU = !!this.transOptions.lockUpright;

		if (mode === 'translate') {
			this.transCtrl.showX = true;
			this.transCtrl.showZ = true;
			this.transCtrl.showY = !lockH;   // ★ 水平锁定时 Y 轴手柄隐藏
		} else if (mode === 'rotate') {
			this.transCtrl.showY = true;
			this.transCtrl.showX = !lockU;   // ★ 直立锁定时 X 轴旋转手柄隐藏
			this.transCtrl.showZ = !lockU;   // ★ 直立锁定时 Z 轴旋转手柄隐藏
		} else {
			// scale 模式：三轴全开
			this.transCtrl.showX = true;
			this.transCtrl.showY = true;
			this.transCtrl.showZ = true;
		}

		// ★ 立即触发一次手柄刷新（TransformControls 内部会在下一帧自动检查这些标志位）
		try {
			if (typeof this.transCtrl.updateMatrixWorld === 'function') {
				this.transCtrl.updateMatrixWorld(true);
			}
		} catch (e) {}
	},

	/* ============================================================
	 * ★ 设备动画循环（灯具闪烁使用 lampPower 基数，不越界）
	 * ============================================================ */
	updateDeviceAnimations: function (time, delta) {
		// —— 动画特效插件 ——
		this.furnitureGroup.children.forEach(obj => {
			if (obj.userData.animEffectGroup &&
				obj.userData.animEffectGroup.visible &&
				obj.userData.animationConfig &&
				obj.userData.animationConfig.enabled) {
				const config = obj.userData.animationConfig;
				const plugin = this.plugins[config.type];
				if (plugin && plugin.update) {
					plugin.update(obj.userData.animEffectGroup, obj, delta, time, config);
				}
			}
		});

		if (!this.isPlayMode) return;

		const LC = this.lightConfig;

		this.furnitureGroup.children.forEach(group => {
			if (!group.visible) return;
			const d = group.userData;
			if (!d || !d.state || !d.state.on) return;

			// —— 灯具闪烁（围绕 lampPower 基数）——
			if (d.type === 'light' && d.refs && d.refs.light) {
				const dim = isFinite(d.state.dimmer) ? d.state.dimmer : 100;
				const baseIntensity = (dim / 100) * LC.lampPower * LC.onLampAmplify;
				const flicker = Math.sin(time * 3) * 0.04 + Math.sin(time * 7.7) * 0.02;
				d.refs.light.intensity = Math.max(0, baseIntensity * (1 + flicker));
			}

			// —— 电视屏幕呼吸 ——
			if (d.type === 'tv' && d.refs && d.refs.screen &&
				d.refs.screen.material && d.refs.screen.material.emissive) {
				d.refs.screen.material.emissiveIntensity = 0.9 + Math.sin(time * 1.6) * 0.15;
			}

			// —— 智能音箱光环 ——
			if (d.refs && d.refs.ring && d.refs.ring.material) {
				const ring = d.refs.ring;
				if (ring.visible !== false) {
					const k = (Math.sin(time * 2.4) + 1) / 2;
					ring.scale.setScalar(0.9 + k * 1.1);
					ring.material.opacity = 0.55 - k * 0.4;
				}
			}

			// —— 窗帘布料飘动 ——
			if (d.refs && d.refs.curtainMesh && d.refs.curtainMesh.geometry &&
				d.refs.curtainMesh.geometry.userData &&
				d.refs.curtainMesh.geometry.userData.originalPos) {
				const geo = d.refs.curtainMesh.geometry;
				const orig = geo.userData.originalPos;
				const posAttr = geo.attributes.position;
				if (posAttr && posAttr.count * 3 === orig.length) {
					for (let i = 0; i < posAttr.count; i++) {
						const oy = orig[i * 3 + 1];
						const oz = orig[i * 3 + 2];
						posAttr.array[i * 3 + 2] =
							oz + Math.sin(oy * 1.8 + time * 1.1) * 0.025;
					}
					posAttr.needsUpdate = true;
				}
			}
		});
	},

    animate: function () {
        requestAnimationFrame(() => this.animate());

        const delta = Math.min(this.clock.getDelta(), 0.1);
        const time = this.clock.getElapsedTime();

        try { this.updateThemeTween(); } catch (e) {}
        try { this.updateDeviceAnimations(time, delta); } catch (e) {}
        try { this.updateWalkers(delta, time); } catch (e) {}
        try { this.updateFireworks(); } catch (e) {}

        if (this.orbit) this.orbit.update();
        try { this.checkIdle(); } catch (e) {}

        if (this.isPlayMode) {
            try { this.updateLabels(); } catch (e) {}
            try { this.updateSensorCardPositions(); } catch (e) {}
        }

        if (this.renderer && this.scene && this.camera)
            this.renderer.render(this.scene, this.camera);
    }
};

/*
 * =====================================================================
 * HBuilderX 5+ APP 指定问题增强层（来自 appjs12.doc）
 * =====================================================================
 */
(function installPrecisionEnhancements() {
    if (app.__precisionEnhancementsInstalled) return;
    app.__precisionEnhancementsInstalled = true;

    const originalFinalizeObject = app.finalizeObject;
    const originalBuildModelFromScene = app._buildModelFromScene;
    const originalShowConfigModal = app.showConfigModal;
    const originalConfirmAddObject = app.confirmAddObject;
    const originalSelectObj = app.selectObj;
    const originalFlShowPropPanel = app.flShowPropPanel;
    const originalSetTransformMode = app.setTransformMode;
    const originalUpdateDeviceAnimations = app.updateDeviceAnimations;
    const originalHandleDeviceControl = app.handleDeviceControl;
    const originalApplyDeviceState = app.applyDeviceState;
    const originalUpdateDeviceState = app.updateDeviceState;
    const originalToggleDevicePower = app.toggleDevicePower;
    const originalSerializeScene = app.saveSystem.serializeScene;
    const originalDeserializeScene = app.saveSystem.deserializeScene;
    const originalRefreshFloorModelList = app.refreshFloorModelList;
    const originalUpdateObjectFloorIndex = app.updateObjectFloorIndex;
    const originalInit = app.init;

    app._num = function (v, fallback = 0) { return (typeof v === 'number' && isFinite(v)) ? v : fallback; };

    app._getObjectWorldBounds = function (obj) {
        if (!obj) return null;
        try {
            obj.updateMatrixWorld(true);
            const box = new THREE.Box3().setFromObject(obj);
            if (!box.isEmpty() &&
                isFinite(box.min.x) && isFinite(box.min.y) && isFinite(box.min.z) &&
                isFinite(box.max.x) && isFinite(box.max.y) && isFinite(box.max.z)) return box;
        } catch (e) {}
        return null;
    };

    app._getObjectGeometryWorldCorners = function (obj) {
        const points = [];
        if (!obj) return points;
        const excluded = obj.userData && obj.userData.animEffectGroup;

        obj.updateMatrixWorld(true);
        obj.traverse(node => {
            if (!node || !node.isMesh || !node.geometry || node === excluded) return;
            if (excluded && (node === excluded || excluded.getObjectById(node.id))) return;

            const geometry = node.geometry;
            if (!geometry.boundingBox) { try { geometry.computeBoundingBox(); } catch (e) { return; } }
            const b = geometry.boundingBox;
            if (!b || b.isEmpty()) return;

            const c = [
                new THREE.Vector3(b.min.x, b.min.y, b.min.z), new THREE.Vector3(b.min.x, b.min.y, b.max.z),
                new THREE.Vector3(b.min.x, b.max.y, b.min.z), new THREE.Vector3(b.min.x, b.max.y, b.max.z),
                new THREE.Vector3(b.max.x, b.min.y, b.min.z), new THREE.Vector3(b.max.x, b.min.y, b.max.z),
                new THREE.Vector3(b.max.x, b.max.y, b.min.z), new THREE.Vector3(b.max.x, b.max.y, b.max.z)
            ];
            c.forEach(p => points.push(p.applyMatrix4(node.matrixWorld)));
        });
        return points;
    };

    app._getObjectBottomY = function (obj) {
        const box = this._getObjectWorldBounds(obj);
        return box ? box.min.y : this._num(obj && obj.position && obj.position.y);
    };

    app._alignWalkerToFloor = function (obj, floorY) {
        if (!obj || !obj.userData || !isFinite(floorY)) return false;
        const EPS = 0.003;
        try {
            obj.updateMatrixWorld(true);
            const box = new THREE.Box3();
            let hasVisual = false;
            const excluded = obj.userData.animEffectGroup || null;

            obj.traverse(node => {
                if (!node || !node.isMesh || !node.geometry || !node.visible) return;
                if (excluded && (node === excluded || excluded.getObjectById(node.id))) return;
                if (!node.geometry.boundingBox) { try { node.geometry.computeBoundingBox(); } catch (e) { return; } }
                const gb = node.geometry.boundingBox;
                if (!gb || gb.isEmpty()) return;

                const pts = [
                    new THREE.Vector3(gb.min.x, gb.min.y, gb.min.z), new THREE.Vector3(gb.min.x, gb.min.y, gb.max.z),
                    new THREE.Vector3(gb.min.x, gb.max.y, gb.min.z), new THREE.Vector3(gb.min.x, gb.max.y, gb.max.z),
                    new THREE.Vector3(gb.max.x, gb.min.y, gb.min.z), new THREE.Vector3(gb.max.x, gb.min.y, gb.max.z),
                    new THREE.Vector3(gb.max.x, gb.max.y, gb.min.z), new THREE.Vector3(gb.max.x, gb.max.y, gb.max.z)
                ];
                pts.forEach(pt => { box.expandByPoint(pt.applyMatrix4(node.matrixWorld)); hasVisual = true; });
            });

            if (!hasVisual || box.isEmpty() || !isFinite(box.min.y)) return false;

            const correction = floorY + EPS - box.min.y;
            if (Math.abs(correction) > 1e-8) obj.position.y += correction;

            obj.userData.__walkerGroundY = floorY;
            obj.userData.__walkerBottomY = floorY + EPS;
            return true;
        } catch (e) {
            try { obj.position.y = floorY; } catch (e2) {}
            return false;
        }
    };

    app._getObjectWorldSize = function (obj) {
        const box = this._getObjectWorldBounds(obj);
        return box ? box.getSize(new THREE.Vector3()) : new THREE.Vector3(1, 1, 1);
    };

    app.DEVICE_TYPE_OPTIONS = [
        { value: 'furniture', label: '普通家具/装饰' },
        { value: 'door_window', label: '门窗 (墙体挖洞)' },
        { value: 'light', label: '智能灯具' },
        { value: 'ac', label: '空调设备' },
        { value: 'tv', label: '电视/多媒体' },
        { value: 'fan', label: '风扇' },
        { value: 'switch', label: '智能开关' },
        { value: 'walker', label: '模型行走 (自动巡游+碰撞)' }
    ];

    app._deviceTypeLabel = function (type) {
        const hit = this.DEVICE_TYPE_OPTIONS.find(x => x.value === type);
        return hit ? hit.label : (type || '普通家具/装饰');
    };

    app._deviceTypeIcon = function (type) {
        return ({ furniture: '🛋️', door_window: '🚪', light: '💡', ac: '❄️', tv: '📺', fan: '🌀', switch: '🔘', walker: '🚶' })[type] || '📦';
    };

    app._centerModelPivot = function (group) {
        if (!group || !group.userData) return group;
        group.userData.positionAnchor = 'position';
        group.userData.__pivotStable = true;
        return group;
    };

    app.finalizeObject = function (group, name, type, features, refs, dimensions, materials, extra) {
        refs = refs || {};
        dimensions = dimensions || { w: 1, h: 1, y: 0 };
        materials = materials || {};
        extra = extra || {};

        const result = originalFinalizeObject.call(this, group, name, type, features, refs, dimensions, materials, extra);

        try {
            if (group.userData) {
                group.userData.positionAnchor = 'position';
                group.userData.__pivotStable = true;
            }
            this.modelToUI();
        } catch (e) { console.warn('模型定位增强失败:', e); }

        return result || group;
    };

    app.updateObjectFloorIndex = function (obj) {
        if (!obj || !obj.userData) return;
        const d = obj.userData;

        if (typeof d.floorIndex === 'number' && isFinite(d.floorIndex)) {
            const fi = Math.max(0, Math.min(this.floorShapes.length - 1, d.floorIndex));
            const base = this.getFloorBaseY(fi);
            const h = this.getWallHeight(fi);
            const y = obj.position.y;
            if (isFinite(y) && y >= base - 0.5 && y <= base + h + 0.5) {
                d.floorIndex = fi;
                if (d.type === 'walker') this._alignWalkerToFloor(obj, this.getFloorBaseY(fi));
                return;
            }
        }

        const y = this._getObjectBottomY(obj);
        if (!isFinite(y)) return;

        obj.userData.floorIndex = Math.max(0, Math.min(
            this.floorShapes.length - 1,
            this.floorIndexOfY(Math.max(0, y + 0.00001))
        ));

        if (obj.userData.type === 'walker') {
            const fi = Math.max(0, Math.min(this.floorShapes.length - 1, obj.userData.floorIndex || 0));
            this._alignWalkerToFloor(obj, this.getFloorBaseY(fi));
        }
    };

    app.setTransformMode = function (mode) {
        originalSetTransformMode.call(this, mode);
        if (this.transCtrl && mode === 'translate') {
            this.transCtrl.showX = true;
            this.transCtrl.showY = true;
            this.transCtrl.showZ = true;
        }
    };

    app.constrainAfterDrag = function () {
        const obj = this.selectedObj;
        if (!obj) return;

        if (!isFinite(obj.position.x)) obj.position.x = 0;
        if (!isFinite(obj.position.y)) obj.position.y = this.getFloorBaseY(obj.userData.floorIndex || 0);
        if (!isFinite(obj.position.z)) obj.position.z = 0;
        if (!isFinite(obj.scale.x) || obj.scale.x <= 0) obj.scale.x = 1;
        if (!isFinite(obj.scale.y) || obj.scale.y <= 0) obj.scale.y = obj.scale.x;
        if (!isFinite(obj.scale.z) || obj.scale.z <= 0) obj.scale.z = obj.scale.x;

        if (this.transOptions.lockUpright) { obj.rotation.x = 0; obj.rotation.z = 0; }

        obj.userData.manualPosition = true;
        obj.userData.__lastManualTransform = {
            pos: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
            rot: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
            scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z }
        };

        this._dragStartY = null;
        this.updateObjectFloorIndex(obj);
        this.modelToUI();
        this.updateSceneVisibility();
        if (obj.userData.type === 'door_window') this.generate3D();
        this.refreshFloorModelList();
        this.saveSystem.saveToDB(true);
    };

    app.uiToModel = function () {
        if (!this.selectedObj || this.selectedObj.userData.locked) return;
        const obj = this.selectedObj;
        const read = id => { const el = document.getElementById(id); return el ? parseFloat(el.value) : NaN; };

        const nx = read('posX'), ny = read('posY'), nz = read('posZ');
        if (isFinite(nx)) obj.position.x = nx;
        if (isFinite(ny)) {
            obj.position.y = ny;
            obj.userData.manualPosition = true;
        }
        if (isFinite(nz)) obj.position.z = nz;

        const ry = read('rotY');
        if (isFinite(ry)) obj.rotation.y = ry * Math.PI / 180;
        if (this.transOptions.lockUpright) { obj.rotation.x = 0; obj.rotation.z = 0; }

        const s = read('scaleS');
        if (isFinite(s) && s > 0) obj.scale.setScalar(s);

        this.updateObjectFloorIndex(obj);
        this.updateSceneVisibility();
        this.modelToUI();
        if (obj.userData.type === 'door_window') this.generate3D();
        this.refreshFloorModelList();
        this.saveSystem.saveToDB(true);
    };

    app._normalizeNativeAnimationConfig = function (cfg) {
        const c = Object.assign({ enabled: false, clipIndex: 0, clipName: '', loop: true, timeScale: 1 }, cfg || {});
        c.enabled = !!c.enabled;
        c.clipIndex = Math.max(0, parseInt(c.clipIndex, 10) || 0);
        c.clipName = typeof c.clipName === 'string' ? c.clipName : '';
        c.loop = c.loop !== false;
        c.timeScale = (isFinite(c.timeScale) && c.timeScale > 0) ? c.timeScale : 1;
        return c;
    };

    app._getNativeAnimationClips = function (obj) {
        return obj && obj.userData && Array.isArray(obj.userData._nativeAnimations) ?
            obj.userData._nativeAnimations : [];
    };

    app._chooseNativeClip = function (obj, cfg) {
        const clips = this._getNativeAnimationClips(obj);
        if (!clips.length) return null;
        cfg = this._normalizeNativeAnimationConfig(cfg);

        if (cfg.clipName) {
            const exact = clips.find(c => c && c.name === cfg.clipName);
            if (exact) return exact;
            const like = clips.find(c => c && c.name && c.name.toLowerCase().includes(cfg.clipName.toLowerCase()));
            if (like) return like;
        }
        return clips[Math.min(cfg.clipIndex, clips.length - 1)] || clips[0];
    };

    app._configureNativeAnimation = function (obj, restart) {
        if (!obj || !obj.userData) return false;
        const d = obj.userData;
        const clips = this._getNativeAnimationClips(obj);
        d.nativeAnimationConfig = this._normalizeNativeAnimationConfig(d.nativeAnimationConfig);
        d._nativeAnimationAvailable = clips.length > 0;
        if (!clips.length) return false;

        if (d.type === 'walker' && d._walkMixer) { d._nativeMixer = d._walkMixer; return true; }

        const clip = this._chooseNativeClip(obj, d.nativeAnimationConfig);
        if (!clip) return false;

        if (!d._nativeMixer) {
            try { d._nativeMixer = new THREE.AnimationMixer(d.__visualRoot || obj); } catch (e) { return false; }
        }

        const currentName = d._nativeAction && d._nativeAction.getClip ? d._nativeAction.getClip().name : '';
        if (!d._nativeAction || currentName !== clip.name || restart) {
            try { if (d._nativeAction) d._nativeAction.stop(); } catch (e) {}
            try {
                d._nativeAction = d._nativeMixer.clipAction(clip);
                d._nativeAction.reset();
                d._nativeAction.setLoop(d.nativeAnimationConfig.loop ? THREE.LoopRepeat : THREE.LoopOnce,
                    d.nativeAnimationConfig.loop ? Infinity : 1);
                d._nativeAction.clampWhenFinished = !d.nativeAnimationConfig.loop;
            } catch (e) { return false; }
        }

        d._nativeMixer.timeScale = d.nativeAnimationConfig.timeScale;

        if (d.nativeAnimationConfig.enabled && (!d.state || d.state.on !== false)) {
            d._nativeAction.enabled = true;
            d._nativeAction.play();
        } else {
            try { d._nativeAction.stop(); } catch (e) {}
            d._nativeAction.enabled = false;
        }
        return true;
    };

    app._updateNativeAnimations = function (delta) {
        this.furnitureGroup.children.forEach(obj => {
            const d = obj && obj.userData;
            if (!d || !d._nativeMixer || !d._nativeAnimationAvailable) return;
            if (d.type === 'walker' && d._walkMixer === d._nativeMixer) return;

            try {
                d.nativeAnimationConfig = this._normalizeNativeAnimationConfig(d.nativeAnimationConfig);
                if (d.nativeAnimationConfig.enabled && (!d.state || d.state.on !== false) && d._nativeAction) {
                    d._nativeMixer.timeScale = d.nativeAnimationConfig.timeScale;
                    d._nativeAction.play();
                    d._nativeMixer.update(Math.min(delta, 0.1));
                }
            } catch (e) {}
        });
    };

    app.updateDeviceAnimations = function (time, delta) {
        try { this._updateNativeAnimations(delta); } catch (e) {}
        return originalUpdateDeviceAnimations.call(this, time, delta);
    };

    app._buildModelFromScene = function (model, animations, name, type, features, opts) {
        opts = opts || {};
        const group = originalBuildModelFromScene.call(this, model, animations, name, type, features, opts);
        if (!group || !group.userData) return group;

        group.userData._nativeAnimations = Array.isArray(animations) ? animations.slice() : [];

        const savedCfg = opts.restoreData && (opts.restoreData.nativeAnimationConfig || opts.restoreData.modelAnimationConfig);
        const enabled = savedCfg ? !!savedCfg.enabled : !!(
            (features && features.modelAnimation) ||
            (this.tempObjectData && this.tempObjectData.nativeAnimationEnabled)
        );

        group.userData.nativeAnimationConfig = this._normalizeNativeAnimationConfig(savedCfg || { enabled: enabled });
        group.userData.features = group.userData.features || {};
        group.userData.features.modelAnimation = !!group.userData.nativeAnimationConfig.enabled;

        this._configureNativeAnimation(group, false);
        return group;
    };

    app._ensureConfigDeviceType = function () {
        const select = document.getElementById('cfgType');
        if (!select) return;
        const values = Array.from(select.options).map(o => o.value);

        this.DEVICE_TYPE_OPTIONS.forEach(def => {
            if (!values.includes(def.value)) {
                const opt = document.createElement('option');
                opt.value = def.value;
                opt.textContent = def.label;
                select.appendChild(opt);
            }
        });
    };

    app._ensureConfigNativeAnimationUI = function () {
        const card = document.querySelector('#configModal .modal-card');
        if (!card) return;
        this._ensureConfigDeviceType();

        let panel = document.getElementById('cfgNativeAnimPanel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'cfgNativeAnimPanel';
            panel.style.cssText = 'margin-top:8px;border:1px dashed #444;padding:8px;border-radius:6px;';
            panel.innerHTML =
                '<div style="font-size:0.75rem;color:var(--accent);margin-bottom:5px;">✨ 模型绑定动画</div>' +
                '<label class="feature-check"><input type="checkbox" id="cfgNativeAnimEnabled"> 开启动画</label>' +
                '<div style="font-size:0.62rem;color:#888;margin-top:4px;line-height:1.5;">所有设备类型均可使用 GLB/GLTF/FBX 模型自带动画；无动画的模型不会产生额外效果。</div>';

            const walker = document.getElementById('cfgFeaturesWalker');
            const door = document.getElementById('cfgFeaturesDoor');
            const anchor = walker || door;
            if (anchor && anchor.parentNode === card) anchor.parentNode.insertBefore(panel, anchor.nextSibling);
            else card.appendChild(panel);
        }

        const cb = document.getElementById('cfgNativeAnimEnabled');
        if (cb) {
            if (cb.dataset.precisionBound !== '1') {
                cb.dataset.precisionBound = '1';
                cb.addEventListener('change', () => {
                    if (app.tempObjectData) app.tempObjectData.nativeAnimationEnabled = !!cb.checked;
                });
            }
            cb.checked = !!(this.tempObjectData && this.tempObjectData.nativeAnimationEnabled);
        }
    };

    app.showConfigModal = function () {
        const r = originalShowConfigModal.call(this);
        try { this._ensureConfigDeviceType(); this._ensureConfigNativeAnimationUI(); } catch (e) {}
        return r;
    };

    app.confirmAddObject = function () {
        const cb = document.getElementById('cfgNativeAnimEnabled');
        if (this.tempObjectData) this.tempObjectData.nativeAnimationEnabled = !!(cb && cb.checked);

        const result = originalConfirmAddObject.call(this);
        const obj = this.selectedObj;

        if (obj && obj.userData) {
            obj.userData.nativeAnimationConfig = this._normalizeNativeAnimationConfig(Object.assign({},
                obj.userData.nativeAnimationConfig, { enabled: !!(cb && cb.checked) }));
            obj.userData.features = obj.userData.features || {};
            obj.userData.features.modelAnimation = obj.userData.nativeAnimationConfig.enabled;
            this._configureNativeAnimation(obj, true);
        }
        return result;
    };

    app._ensureFloorManagerDeviceAndNativeUI = function () {
        const prop = document.getElementById('flPropPanel');
        if (!prop) return;

        let typeRow = document.getElementById('flDeviceTypeRow');
        if (!typeRow) {
            typeRow = document.createElement('div');
            typeRow.id = 'flDeviceTypeRow';
            typeRow.className = 'control-item';
            typeRow.innerHTML = '<label>设备类型</label><select id="flDeviceType"></select>';

            const nameInput = document.getElementById('flObjName');
            if (nameInput && nameInput.parentNode && nameInput.parentNode.parentNode === prop) {
                nameInput.parentNode.insertAdjacentElement('afterend', typeRow);
            } else prop.insertBefore(typeRow, prop.firstChild);
        }

        const typeSelect = document.getElementById('flDeviceType');
        if (typeSelect) {
            typeSelect.innerHTML = '';
            this.DEVICE_TYPE_OPTIONS.forEach(def => {
                const opt = document.createElement('option');
                opt.value = def.value;
                opt.textContent = def.label;
                typeSelect.appendChild(opt);
            });

            if (typeSelect.dataset.precisionBound !== '1') {
                typeSelect.dataset.precisionBound = '1';
                typeSelect.addEventListener('change', () => this.flChangeDeviceType(typeSelect.value));
            }
        }

        let animPanel = document.getElementById('flNativeAnimControls');
        if (!animPanel) {
            animPanel = document.createElement('div');
            animPanel.id = 'flNativeAnimControls';
            animPanel.style.cssText = 'border-top:1px dashed #444;padding-top:8px;margin-top:8px;';
            animPanel.innerHTML =
                '<div class="group-title" style="font-size:0.7rem;">✨ 模型绑定动画</div>' +
                '<label class="feature-check"><input type="checkbox" id="flNativeAnimEnabled"> 开启动画</label>' +
                '<div class="control-item"><label>动画片段</label><select id="flNativeAnimSelect"></select></div>';

            const target = document.getElementById('flAnimControls');
            if (target && target.parentNode === prop) target.parentNode.insertBefore(animPanel, target);
            else prop.appendChild(animPanel);
        }

        const enabled = document.getElementById('flNativeAnimEnabled');
        if (enabled && enabled.dataset.precisionBound !== '1') {
            enabled.dataset.precisionBound = '1';
            enabled.addEventListener('change', () => this.flUpdateNativeAnimationEnabled(enabled.checked));
        }

        const clipSelect = document.getElementById('flNativeAnimSelect');
        if (clipSelect && clipSelect.dataset.precisionBound !== '1') {
            clipSelect.dataset.precisionBound = '1';
            clipSelect.addEventListener('change', () => this.flUpdateNativeAnimationClip(parseInt(clipSelect.value, 10) || 0));
        }
    };

    app._refreshFloorNativeAnimUI = function (obj) {
        this._ensureFloorManagerDeviceAndNativeUI();
        if (!obj || !obj.userData) return;

        const d = obj.userData;
        const typeSelect = document.getElementById('flDeviceType');
        if (typeSelect) typeSelect.value = d.type || 'furniture';

        const cfg = this._normalizeNativeAnimationConfig(d.nativeAnimationConfig || { enabled: !!(d.features && d.features.modelAnimation) });
        d.nativeAnimationConfig = cfg;

        const enabled = document.getElementById('flNativeAnimEnabled');
        if (enabled) enabled.checked = cfg.enabled;

        const clipSelect = document.getElementById('flNativeAnimSelect');
        const clips = this._getNativeAnimationClips(obj);

        if (clipSelect) {
            clipSelect.innerHTML = '';
            if (!clips.length) {
                const opt = document.createElement('option');
                opt.value = '0';
                opt.textContent = '无绑定动画';
                clipSelect.appendChild(opt);
                clipSelect.disabled = true;
            } else {
                clipSelect.disabled = false;
                clips.forEach((clip, idx) => {
                    const opt = document.createElement('option');
                    opt.value = String(idx);
                    opt.textContent = clip.name || ('动画 ' + (idx + 1));
                    clipSelect.appendChild(opt);
                });
                clipSelect.value = String(Math.min(cfg.clipIndex, clips.length - 1));
            }
        }
    };

    app.flUpdateNativeAnimationEnabled = function (enabled) {
        const obj = this.getFlSelectedObj();
        if (!obj || !obj.userData) return;

        obj.userData.nativeAnimationConfig = this._normalizeNativeAnimationConfig(Object.assign({},
            obj.userData.nativeAnimationConfig, { enabled: !!enabled }));
        obj.userData.features = obj.userData.features || {};
        obj.userData.features.modelAnimation = !!enabled;

        this._configureNativeAnimation(obj, true);
        this.applyDeviceState(obj);
        this.saveSystem.saveToDB(true);
        this.flShowPropPanel(obj);
    };

    app.flUpdateNativeAnimationClip = function (index) {
        const obj = this.getFlSelectedObj();
        if (!obj || !obj.userData) return;

        const clips = this._getNativeAnimationClips(obj);
        if (!clips.length) return;
        index = Math.max(0, Math.min(clips.length - 1, index));

        obj.userData.nativeAnimationConfig = this._normalizeNativeAnimationConfig(Object.assign({},
            obj.userData.nativeAnimationConfig, {
                clipIndex: index,
                clipName: clips[index] && clips[index].name ? clips[index].name : ''
            }));

        this._configureNativeAnimation(obj, true);
        this.saveSystem.saveToDB(true);
        this.flShowPropPanel(obj);
    };

    app.flChangeDeviceType = function (newType) {
        const obj = this.getFlSelectedObj();
        if (!obj || !obj.userData) return;
        if (!this.DEVICE_TYPE_OPTIONS.some(x => x.value === newType)) return;

        const oldType = obj.userData.type;
        if (oldType === newType) return;

        obj.userData.type = newType;
        obj.userData.features = obj.userData.features || {};
        if (newType === 'door_window') obj.userData.features.pbr = obj.userData.features.pbr !== false;

        obj.userData.features.modelAnimation = !!(obj.userData.nativeAnimationConfig && obj.userData.nativeAnimationConfig.enabled);
        obj.userData.manualPosition = true;

        if (newType === 'walker' && !obj.userData.walkConfig) {
            obj.userData.walkConfig = {
                speed: 0.6, radius: 0.35, faceOffset: 0, useAnim: true, useBob: true,
                freeze: false, dir: Math.random() * Math.PI * 2, turnTimer: 2, paused: false
            };
        }

        this._configureNativeAnimation(obj, true);
        this.applyDeviceState(obj);
        this.updateObjectFloorIndex(obj);
        this.flShowPropPanel(obj);
        this.refreshFloorModelList();
        if (oldType === 'door_window' || newType === 'door_window') this.generate3D();
        this.saveSystem.saveToDB(true);
    };

    app.flShowPropPanel = function (obj) {
        const r = originalFlShowPropPanel.call(this, obj);
        try { this._ensureFloorManagerDeviceAndNativeUI(); this._refreshFloorNativeAnimUI(obj); } catch (e) {}
        return r;
    };

    app.selectObj = function (obj, clickedMesh) {
        const r = originalSelectObj.call(this, obj, clickedMesh);
        try { this._ensureFloorManagerDeviceAndNativeUI(); this._refreshFloorNativeAnimUI(obj); } catch (e) {}
        return r;
    };

    app.handleDeviceControl = function (obj) {
        const r = originalHandleDeviceControl.call(this, obj);
        if (!obj || !obj.userData || obj.userData.type !== 'fan') return r;

        const d = obj.userData;
        const panel = document.getElementById('iotPanel');
        const title = document.getElementById('iotTitle');
        const content = document.getElementById('iotContent');
        if (!panel || !title || !content) return r;

        title.innerText = '🌀 ' + (d.name || '风扇') + (d.entityId ? ` (${d.entityId})` : '');
        content.innerHTML = '';

        const btn = document.createElement('button');
        btn.className = d.state && d.state.on ? 'danger' : 'success';
        btn.style.cssText = 'width:100%;padding:12px;font-size:1rem;';
        btn.textContent = d.state && d.state.on ? '⏹ 关闭风扇' : '▶️ 开启风扇';
        btn.onclick = () => this.toggleDevicePower();
        content.appendChild(btn);

        const tip = document.createElement('div');
        tip.style.cssText = 'text-align:center;color:#888;font-size:0.7rem;margin-top:6px;line-height:1.5;';
        tip.textContent = d._nativeAnimationAvailable ? '模型绑定动画会随风扇开关播放。' : '当前模型没有检测到绑定动画。';
        content.appendChild(tip);

        panel.style.display = 'block';
        panel.style.left = '50%'; panel.style.top = '50%';
        panel.style.transform = 'translate(-50%, -50%)';
        panel.style.margin = '0';
        return r;
    };

    app.toggleDevicePower = function () {
        const obj = this.currentControlObj;
        if (!obj || !obj.userData) return;

        const d = obj.userData;
        d.state = d.state || { on: true };
        d.state.on = !d.state.on;

        if (d.entityId) {
            if (d.type === 'fan') {
                this.ha.callService('fan', d.state.on ? 'turn_on' : 'turn_off', d.entityId);
            } else if (d.type === 'light' || d.type === 'switch' || d.type === 'tv') {
                this.ha.callService(d.entityId.split('.')[0], d.state.on ? 'turn_on' : 'turn_off', d.entityId);
            } else if (d.type === 'ac') {
                this.ha.callService('climate', d.state.on ? 'turn_on' : 'turn_off', d.entityId);
            }
        }

        this.applyDeviceState(obj);
        this.handleDeviceControl(obj);
        this.saveSystem.saveToDB(true);
    };

    app.applyDeviceState = function (obj) {
        const r = originalApplyDeviceState.call(this, obj);
        if (!obj || !obj.userData) return r;

        const d = obj.userData;
        d.state = d.state || { on: true };
        d.nativeAnimationConfig = this._normalizeNativeAnimationConfig(d.nativeAnimationConfig || { enabled: !!(d.features && d.features.modelAnimation) });

        if (d._nativeAnimationAvailable) {
            if (d.nativeAnimationConfig.enabled && d.state.on) this._configureNativeAnimation(obj, false);
            else if (d._nativeAction) {
                try { d._nativeAction.stop(); } catch (e) {}
                d._nativeAction.enabled = false;
            }
        }
        return r;
    };

    app.updateDeviceState = function (key, value) {
        const r = originalUpdateDeviceState.call(this, key, value);
        try { if (this.currentControlObj) this.applyDeviceState(this.currentControlObj); } catch (e) {}
        return r;
    };

    app.calculateWallHoles = function (p1, p2, wallLen, wallHeight, floorYOffset, floorIndex) {
        const holes = [];
        const wallVector = new THREE.Vector2().subVectors(p2, p1);
        const length = wallVector.length();
        if (!(length > 1e-6)) return holes;

        const wallDir = wallVector.clone().normalize();
        const wallNormal = new THREE.Vector2(-wallDir.y, wallDir.x);
        const WALL_HALF_DEPTH = 0.1;
        const CONTACT_TOLERANCE = WALL_HALF_DEPTH + 0.08;

        this.furnitureGroup.children.forEach(obj => {
            if (!obj || !obj.userData || obj.userData.type !== 'door_window') return;

            const objectFloor = obj.userData.floorIndex;
            if (floorIndex !== undefined && objectFloor !== undefined && objectFloor !== null && objectFloor !== floorIndex) return;

            let points = this._getObjectGeometryWorldCorners(obj);
            if (!points.length) {
                const b = this._getObjectWorldBounds(obj);
                if (!b) return;
                points = [
                    new THREE.Vector3(b.min.x, b.min.y, b.min.z), new THREE.Vector3(b.min.x, b.min.y, b.max.z),
                    new THREE.Vector3(b.min.x, b.max.y, b.min.z), new THREE.Vector3(b.min.x, b.max.y, b.max.z),
                    new THREE.Vector3(b.max.x, b.min.y, b.min.z), new THREE.Vector3(b.max.x, b.min.y, b.max.z),
                    new THREE.Vector3(b.max.x, b.max.y, b.min.z), new THREE.Vector3(b.max.x, b.max.y, b.max.z)
                ];
            }

            let minT = Infinity, maxT = -Infinity;
            let minN = Infinity, maxN = -Infinity;
            let minY = Infinity, maxY = -Infinity;

            points.forEach(pt => {
                const rel = new THREE.Vector2(pt.x, pt.z).sub(p1);
                minT = Math.min(minT, rel.dot(wallDir));
                maxT = Math.max(maxT, rel.dot(wallDir));
                minN = Math.min(minN, rel.dot(wallNormal));
                maxN = Math.max(maxN, rel.dot(wallNormal));
                minY = Math.min(minY, pt.y);
                maxY = Math.max(maxY, pt.y);
            });

            if (![minT, maxT, minN, maxN, minY, maxY].every(isFinite)) return;
            if (minN > CONTACT_TOLERANCE || maxN < -CONTACT_TOLERANCE) return;

            const startRaw = Math.max(0, minT);
            const endRaw = Math.min(wallLen, maxT);
            const overlap = endRaw - startRaw;
            if (!(overlap > 0.03)) return;

            const bottom = Math.max(0, minY - floorYOffset);
            const top = Math.min(wallHeight, maxY - floorYOffset);
            const height = top - bottom;
            if (!(height > 0.03)) return;

            const PAD = 0.002;
            holes.push({
                x: Math.max(0.01, startRaw + PAD),
                y: Math.max(0.0, bottom + PAD),
                w: Math.max(0.01, overlap - PAD * 2),
                h: Math.max(0.01, height - PAD * 2)
            });
        });

        return holes;
    };

    app.saveSystem.serializeScene = function () {
        const data = originalSerializeScene.call(this);
        try {
            data.version = 6;
            if (Array.isArray(data.objects)) {
                data.objects.forEach((saved, idx) => {
                    const obj = app.furnitureGroup.children[idx];
                    if (!obj || !obj.userData) return;
                    const d = obj.userData;

                    saved.type = d.type || saved.type;
                    saved.deviceType = d.type || saved.type;
                    saved.features = d.features || saved.features || {};
                    saved.floorIndex = (typeof d.floorIndex === 'number' && isFinite(d.floorIndex)) ? d.floorIndex : 0;
                    saved.positionAnchor = 'position';
                    saved.transform = saved.transform || {};
                    saved.transform.positionAnchor = 'position';
                    saved.transform.pos = { x: app._num(obj.position.x), y: app._num(obj.position.y), z: app._num(obj.position.z) };
                    saved.transform.rot = { x: app._num(obj.rotation.x), y: app._num(obj.rotation.y), z: app._num(obj.rotation.z) };
                    saved.transform.scale = { x: app._num(obj.scale.x, 1), y: app._num(obj.scale.y, 1), z: app._num(obj.scale.z, 1) };
                    saved.nativeAnimationConfig = app._normalizeNativeAnimationConfig(d.nativeAnimationConfig || { enabled: !!saved.features.modelAnimation });
                    saved.modelAnimationConfig = saved.nativeAnimationConfig;
                    saved.manualPosition = d.manualPosition === true;
                });
            }

            try {
                const lw = parseInt(localStorage.getItem('sidebarLeftWidth') || '0', 10);
                const rw = parseInt(localStorage.getItem('sidebarRightWidth') || '0', 10);
                if (lw >= 180 && lw <= 600) data.sidebarLeftWidth = lw;
                if (rw >= 180 && rw <= 600) data.sidebarRightWidth = rw;
            } catch (e) {}

            data.panX = app.panX || 0;
            data.panY = app.panY || 0;
            data.viewScale = app.viewScale || 1.0;
            data.roomColors = app.roomColors || {};
            data.roomTextureScale = app._roomTextureScale || {};
        } catch (e) { console.warn('精确模型持久化增强失败:', e); }
        return data;
    };

    app.saveSystem.deserializeScene = async function (data) {
        const result = await originalDeserializeScene.call(this, data);

        try {
            app.furnitureGroup.children.forEach(obj => {
                if (!obj || !obj.userData) return;
                const d = obj.userData;

                const candidates = Array.isArray(data.objects) ? data.objects.filter(x =>
                    x && x.name === d.name && (!x.glbLibId || x.glbLibId === d.glbLibId)
                ) : [];
                const saved = candidates.length ? candidates[candidates.length - 1] : null;

                if (saved && typeof saved.floorIndex === 'number' && isFinite(saved.floorIndex)) {
                    d.floorIndex = Math.max(0, Math.min(app.floorShapes.length - 1, saved.floorIndex));
                }
                if (saved && typeof saved.manualPosition === 'boolean') {
                    d.manualPosition = saved.manualPosition;
                }

                const cfg = (saved && (saved.nativeAnimationConfig || saved.modelAnimationConfig)) ||
                    d.nativeAnimationConfig || { enabled: !!(d.features && d.features.modelAnimation) };

                d.nativeAnimationConfig = app._normalizeNativeAnimationConfig(cfg);
                d.features = d.features || {};
                d.features.modelAnimation = d.nativeAnimationConfig.enabled;

                app._configureNativeAnimation(obj, false);

                if (typeof d.floorIndex !== 'number' || !isFinite(d.floorIndex)) {
                    app.updateObjectFloorIndex(obj);
                } else if (d.type === 'walker') {
                    const fi = Math.max(0, Math.min(app.floorShapes.length - 1, d.floorIndex));
                    app._alignWalkerToFloor(obj, app.getFloorBaseY(fi));
                }
            });

            app.refreshFloorModelList();
        } catch (e) {}

        return result;
    };

    app.refreshFloorModelList = function () {
        const r = originalRefreshFloorModelList.call(this);
        try {
            const list = document.getElementById('flModelList');
            if (list) {
                Array.from(list.children).forEach(item => {
                    const raw = item.textContent || '';
                    const found = this.furnitureGroup.children.find(obj => {
                        const f = obj && obj.userData;
                        const fi = f ? f.floorIndex : -1;
                        return f && fi === this.currentFloor && raw.indexOf(f.name || '\uffff') >= 0;
                    });s
                    if (!found) return;

                    const old = item.querySelector('.precision-state-tag');
                    if (old) old.remove();

                    const tag = document.createElement('span');
                    tag.className = 'precision-state-tag';
                    tag.style.cssText = 'font-size:0.5rem;color:var(--accent);margin-left:5px;flex-shrink:0;';
                    tag.textContent = this._deviceTypeIcon(found.userData.type) +
                        (found.userData.nativeAnimationConfig && found.userData.nativeAnimationConfig.enabled ? ' ✨' : '');
                    item.appendChild(tag);
                });
            }

            if (this._flSelectedId) {
                const selected = this.getFlSelectedObj();
                if (selected) this._refreshFloorNativeAnimUI(selected);
            }
        } catch (e) {}
        return r;
    };

    app._snapCeilingLights = function () { return; };

    app.init = async function () {
        const result = await originalInit.call(this);

        try {
            this._ensureConfigDeviceType();
            this._ensureConfigNativeAnimationUI();
            this._ensureFloorManagerDeviceAndNativeUI();

            this.transOptions.lockHorizontal = false;
            const hBtn = document.getElementById('lockHBtn');
            if (hBtn) hBtn.classList.remove('active');

            this.furnitureGroup.children.forEach(obj => {
                if (!obj || !obj.userData) return;

                obj.userData.nativeAnimationConfig = this._normalizeNativeAnimationConfig(
                    obj.userData.nativeAnimationConfig || { enabled: !!(obj.userData.features && obj.userData.features.modelAnimation) }
                );
                this._configureNativeAnimation(obj, false);

                if (typeof obj.userData.floorIndex !== 'number' || !isFinite(obj.userData.floorIndex)) {
                    this.updateObjectFloorIndex(obj);
                }
            });

            this.setTransformMode(this.transCtrl && this.transCtrl.mode ? this.transCtrl.mode : 'translate');
            this.refreshFloorModelList();
            this._forceViewportResize();
            this.initSidebarResizer();
            this.hideDuplicateWallHeightControl();
            this.injectFloorPlanImportButton();
            this.ensureRoomSettingPanel();

            // ★ 布局修复
            this.fixViewportLayout();
            this.applyResponsiveSidebarWidths();
            this.setupViewportObserver();
        } catch (e) { console.warn('精确编辑增强初始化异常:', e); }

        return result;
    };

    console.info('[PrecisionEnhancements] 模型位置 / XYZ 精确定位 / 风扇 / 原生动画 / 门窗开洞增强已启用');
    console.info('[LightFree] 智能灯具位置完全自由：不再有任何自动吸附，彻底修复刷新后吸顶灯位置漂移与楼层错乱问题');
    console.info('[SidebarResize] ★ 侧栏边框已增加"+"按钮，一键循环切换宽度，移动端友好');
    console.info('[UI] 材质装修面板中重复的"层高"参数已隐藏，楼层层高统一由"🏢 楼层层高调节"面板管理');
    console.info('[FloorPlan] ★ 户型图导入算法：白底黑墙像素检测 + 形态学闭运算 + 边界追踪提取房间闭环');
    console.info('[Fullscreen] 演示模式全屏 API + visualViewport 实时适配不同分辨率');
    console.info('[WallMerge] 重叠/共线墙体线段在 3D 生成时自动合并为同一墙体，消除重复渲染');
    console.info('[Zoom] 画布鼠标滚轮缩放（以鼠标位置为中心，0.15x ~ 8x）');
    console.info('[RoomFloor] ★ 优化1：每个房间支持独立地板贴图与颜色（点击画布房间即可设置）');
    console.info('[ViewportFix] ★★★ 手机端/HBuilderX 5+App 三维场景遮挡修复已启用：视口始终铺满、侧栏悬浮折叠、画布强制自适应');
})();

(function bootstrap() {
    const start = () => {
        if (app._booted) return;
        app._booted = true;
        app.init();
        // ★ 布局修复：启动后多次校正视口尺寸
        setTimeout(() => { try { app.fixViewportLayout(); app.updateRendererSize(); } catch (e) {} }, 300);
        setTimeout(() => { try { app.fixViewportLayout(); app.updateRendererSize(); } catch (e) {} }, 1000);
    };
	if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
	  setTimeout(() => app.setShadowQuality('low'), 3000);
	};
    if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', start);
    else start();
})();
/* ============================================================================
 * ★★★ 行走模型碰撞修复 v4 —— Raycaster 射线检测版 ★★★
 * 
 * 核心突破：
 *   彻底放弃 2D 画布坐标 ↔ 3D 世界坐标的数学转换（易受 canvas 尺寸影响），
 *   改用 three.js 原生 Raycaster 从 walker 头顶向下打射线，
 *   直接检测是否落在该楼层的真实地板 Mesh 上。
 * 
 * 优点：
 *   · 与 generate3D 生成的几何体完全一致，不受 canvas 尺寸 / 缩放 / 演示模式影响
 *   · 房间非凸 / L 形 / 多个房间 / 多楼层 全部正确判定
 *   · 编辑模式 / 演示模式 双模式行为一致
 * 
 * 安全策略：
 *   · 位置非法时【绝不瞬移】，只朝最近地板点小步走（≤0.06m/帧）
 *   · 20m 内找不到地板时只旋转方向，不改变位置
 *   · 位置完全异常（NaN）才做一次强制归位
 * ============================================================================ */

(function installWalkerFixV4() {
  'use strict';
  if (typeof app === 'undefined' || !app) return;
  if (app.__walkerFixV4Installed) return;
  app.__walkerFixV4Installed = true;

  const _clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const _num = (v, dft) => (typeof v === 'number' && isFinite(v)) ? v : dft;

  /* =====================================================================
   * 【新增】获取某楼层的地板 Mesh 列表
   * ---------------------------------------------------------------------
   * 从 structureGroup 中筛选：
   *   · userData.floorIndex === 目标楼层
   *   · 不是天花板 (userData.isCeiling !== true)
   *   · 有 roomIndex (说明是房间地板，不是墙 / 柱)
   * ===================================================================== */
  app._getWalkerFloorMeshes = function (floorIdx) {
    const list = [];
    if (!this.structureGroup) return list;
    const children = this.structureGroup.children;
    for (let i = 0; i < children.length; i++) {
      const m = children[i];
      if (!m || !m.userData) continue;
      if (m.userData.floorIndex !== floorIdx) continue;
      if (m.userData.isCeiling) continue;
      if (m.userData.roomIndex === undefined) continue;
      if (!m.isMesh) continue;
      list.push(m);
    }
    return list;
  };

  /* =====================================================================
   * 【新增】判断 (x, z) 是否落在某楼层地板上
   * ---------------------------------------------------------------------
   * 用 Raycaster 从上方垂直向下打射线：
   *   origin = (x, y0 + 20, z)
   *   direction = (0, -1, 0)
   * 如果击中地板 Mesh → 说明在户型内
   * ===================================================================== */
  app._walkerIsOnFloor = function (x, z, floorIdx, meshesCache) {
    if (!isFinite(x) || !isFinite(z)) return false;

    const meshes = meshesCache || this._getWalkerFloorMeshes(floorIdx);
    if (meshes.length === 0) return true; // 无地板 → 不做限制

    const y0 = this.getFloorBaseY(floorIdx);
    const rc = new THREE.Raycaster(
      new THREE.Vector3(x, y0 + 20, z),
      new THREE.Vector3(0, -1, 0),
      0,
      100
    );

    let hits;
    try {
      hits = rc.intersectObjects(meshes, false);
    } catch (e) {
      return true; // 出错时保守放行，避免把 walker 卡死
    }

    return hits && hits.length > 0;
  };

  /* =====================================================================
   * 【新增】判断 walker 的圆盘是否都在地板上
   * ---------------------------------------------------------------------
   * 采样点：中心 + 4 个正方向外沿 (radius 距离)
   * 全部在地板上才认为安全
   * ===================================================================== */
  app._walkerIsDiscOnFloor = function (x, z, floorIdx, radius, meshesCache) {
    const meshes = meshesCache || this._getWalkerFloorMeshes(floorIdx);
    if (meshes.length === 0) return true;

    // ① 中心
    if (!this._walkerIsOnFloor(x, z, floorIdx, meshes)) return false;

    // ② 四个正方向外沿
    const r = Math.max(0.05, radius);
    const dirs = [
      [r, 0],   // 东
      [-r, 0],  // 西
      [0, r],   // 南
      [0, -r]   // 北
    ];
    for (let i = 0; i < dirs.length; i++) {
      if (!this._walkerIsOnFloor(
        x + dirs[i][0],
        z + dirs[i][1],
        floorIdx,
        meshes
      )) {
        return false;
      }
    }
    return true;
  };

  /* =====================================================================
   * 【新增】从 (x, z) 出发，由近及远搜索最近的地板点
   * ---------------------------------------------------------------------
   * 12 个方向 × 11 个距离档位，最多 132 次 raycast（通常前几档就命中）
   * ===================================================================== */
  app._findNearestFloorPointForWalker = function (x, z, floorIdx, maxDist, meshesCache) {
    const meshes = meshesCache || this._getWalkerFloorMeshes(floorIdx);
    if (meshes.length === 0) return null;

    const angles = 12;
    const dists = [0.15, 0.3, 0.5, 0.8, 1.2, 2, 3, 5, 8, 12, 18];
    const limit = _num(maxDist, 18);

    for (let di = 0; di < dists.length; di++) {
      const dist = dists[di];
      if (dist > limit) break;
      for (let i = 0; i < angles; i++) {
        const a = (i / angles) * Math.PI * 2;
        const tx = x + Math.cos(a) * dist;
        const tz = z + Math.sin(a) * dist;
        if (this._walkerIsOnFloor(tx, tz, floorIdx, meshes)) {
          return { x: tx, z: tz };
        }
      }
    }
    return null;
  };

  /* =====================================================================
   * 【替换】平滑旋转朝向
   * ===================================================================== */
  app._smoothFace = function (obj, cfg, delta) {
    if (!obj || !cfg) return;
    const targetRot = cfg.dir + (cfg.faceOffset || 0);
    let cur = obj.rotation.y;
    let diff = targetRot - cur;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    obj.rotation.y = cur + diff * Math.min(1, delta * 8);
    if (this.transOptions && this.transOptions.lockUpright) {
      obj.rotation.x = 0;
      obj.rotation.z = 0;
    }
  };

  /* =====================================================================
   * 【替换】获取物体 XZ 半径（带安全上限）
   * ===================================================================== */
  app._getObjectXZRadius = function (obj) {
    let r = obj.userData._collRadiusN;
    if (r === undefined) {
      r = 0.4;
      try {
        const fx = obj.userData.animEffectGroup;
        let pv = null;
        if (fx) { pv = fx.visible; fx.visible = false; }
        obj.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(obj);
        if (fx) fx.visible = (pv === undefined) ? true : pv;
        if (!box.isEmpty()) {
          const size = box.getSize(new THREE.Vector3());
          const sc = Math.max(0.0001, Math.abs(obj.scale.x));
          const rr = Math.max(size.x, size.z) * 0.5 / sc;
          if (isFinite(rr) && rr > 0) r = Math.min(rr, 3); // 上限 3m
        }
      } catch (e) {}
      obj.userData._collRadiusN = r;
    }
    return Math.min(r * Math.max(0.0001, Math.abs(obj.scale.x)), 3);
  };

  /* =====================================================================
   * 【替换】家具碰撞检测
   * ===================================================================== */
  app.checkWalkerCollision = function (walker, nx, nz) {
    if (!walker || !walker.userData) return false;

    const wc = walker.userData.walkConfig || {};
    const wRad = _clamp(_num(wc.radius, 0.35), 0.15, 0.6);

    const list = this.furnitureGroup.children;
    for (let i = 0; i < list.length; i++) {
      const other = list[i];
      if (other === walker || !other.visible) continue;
      const od = other.userData;
      if (!od) continue;
      // 门窗 / 灯具不阻挡行走
      if (od.type === 'door_window') continue;
      if (od.type === 'light') continue;

      const oRad = this._getObjectXZRadius(other) * 0.8;
      const dx = nx - other.position.x;
      const dz = nz - other.position.z;
      const minDist = wRad + oRad;
      if ((dx * dx + dz * dz) < minDist * minDist) return true;
    }
    return false;
  };

  /* =====================================================================
   * 【替换】行走动画应用
   * ===================================================================== */
  app._applyWalkerAnim = function (obj, delta, time, floorY, returning) {
    const d = obj.userData;
    const cfg = d.walkConfig || {};

    const align = () => {
      if (typeof this._alignWalkerToFloor === 'function') {
        this._alignWalkerToFloor(obj, floorY);
      } else if (isFinite(floorY)) {
        obj.position.y = floorY;
      }
    };

    if (cfg.paused) {
      if (d._walkMixer) { d._walkMixer.timeScale = 0; d._walkMixer.update(delta); }
      align();
      return;
    }
    if (cfg.freeze) {
      if (d._walkMixer) { d._walkMixer.timeScale = 1; d._walkMixer.update(delta); }
      align();
      return;
    }

    const speed = cfg.speed || 0.6;
    if (d._walkMixer) {
      d._walkMixer.timeScale = returning ? 1.6 : Math.max(0.5, speed / 0.6);
      d._walkMixer.update(delta);
      align();
    } else {
      if (cfg.useBob !== false) {
        const t = time * (6 + speed * 4);
        obj.position.y += Math.abs(Math.sin(t)) * 0.04;
      }
      align();
    }
  };

  /* =====================================================================
   * ★★★ 行走主循环 —— Raycaster 射线检测版 ★★★
   * ---------------------------------------------------------------------
   * 逻辑流程：
   *   1. 位置完全异常 → 强制归位一次（唯一传送场景）
   *   2. 当前位置安全 → 正常巡游
   *   3. 当前位置非法 → 由近及远找地板点，小步走（不传送）
   *   4. 找不到地板 → 只旋转方向，不动位置
   * ===================================================================== */
  app.updateWalkers = function (delta, time) {
    if (!this.scene || !this.structureGroup) return;

    if (typeof delta !== 'number' || delta <= 0 || !isFinite(delta)) delta = 0.016;
    delta = Math.min(delta, 0.05);

    const totalFloors = this.floorShapes.length;
    if (totalFloors === 0) return;

    // 本帧内缓存每层地板 mesh
    const meshCache = {};

    this.furnitureGroup.children.forEach(obj => {
      const d = obj.userData;
      if (!d || d.type !== 'walker') return;
      if (!obj.visible) return;

      // ── 编辑模式下拖拽中 → 跳过（由用户控制）──
      if (this.transCtrl && this.transCtrl.dragging && this.transCtrl.object === obj) {
        return;
      }

      // ── 确保 walkConfig 完整 ──
      if (!d.walkConfig) {
        d.walkConfig = {
          speed: 0.6, radius: 0.35, faceOffset: 0,
          useAnim: true, useBob: true, freeze: false,
          dir: Math.random() * Math.PI * 2,
          turnTimer: 2 + Math.random() * 3,
          paused: false
        };
      }
      const cfg = d.walkConfig;

      let floorIdx = d.floorIndex;
      if (typeof floorIdx !== 'number' || !isFinite(floorIdx)) floorIdx = 0;
      floorIdx = _clamp(floorIdx, 0, totalFloors - 1);
      const floorY = this.getFloorBaseY(floorIdx);

      // ── 暂停 / 禁止移动 → 只播动画 ──
      if (cfg.paused || cfg.freeze) {
        this._applyWalkerAnim(obj, delta, time, floorY, false);
        return;
      }

      // ── 本帧该楼层地板 mesh 列表（缓存）──
      if (!meshCache[floorIdx]) {
        meshCache[floorIdx] = this._getWalkerFloorMeshes(floorIdx);
      }
      const meshes = meshCache[floorIdx];

      const wRad = _clamp(_num(cfg.radius, 0.35), 0.15, 0.6);
      const curX = obj.position.x;
      const curZ = obj.position.z;

      /* ---------- ① 位置完全异常（NaN / Infinity） ---------- */
      if (!isFinite(curX) || !isFinite(curZ)) {
        const target = this._findNearestFloorPointForWalker(0, 0, floorIdx, 20, meshes);
        if (target) {
          obj.position.x = target.x;
          obj.position.z = target.z;
          cfg.dir = Math.random() * Math.PI * 2;
        }
        return;
      }

      /* ---------- ② 当前位置是否安全 ---------- */
      const currentlySafe = this._walkerIsDiscOnFloor(
        curX, curZ, floorIdx, wRad, meshes
      );

      if (!currentlySafe) {
        /* =========================================================
         * 【分支 A】位置非法 → 由近及远找地板点，小步走过去
         * 
         * 关键：绝不传送！每帧最多移动 0.06m
         * ========================================================= */
        const target = this._findNearestFloorPointForWalker(
          curX, curZ, floorIdx, 20, meshes
        );

        if (target) {
          const dx = target.x - curX;
          const dz = target.z - curZ;
          const dist = Math.hypot(dx, dz);

          if (dist > 0.01 && isFinite(dist)) {
            // 每帧最多走 0.06m，防止"瞬移"
            const step = Math.min(cfg.speed * delta * 1.5, dist, 0.06);
            obj.position.x = curX + (dx / dist) * step;
            obj.position.z = curZ + (dz / dist) * step;
            cfg.dir = Math.atan2(dx, dz);
          }
        } else {
          // 20m 内找不到地板 → 只旋转，绝不移动位置
          cfg.dir += Math.PI * (0.3 + Math.random() * 0.4);
        }

        this._smoothFace(obj, cfg, delta);
        this._applyWalkerAnim(obj, delta, time, floorY, true);
        return;
      }

      /* =========================================================
       * 【分支 B】位置合法 → 正常巡游
       * ========================================================= */

      // 定期换向
      cfg.turnTimer -= delta;
      if (cfg.turnTimer <= 0) {
        cfg.turnTimer = 2 + Math.random() * 4;
        cfg.dir += (Math.random() - 0.5) * Math.PI * 0.9;
      }

      const step = cfg.speed * delta;
      if (step <= 1e-4) {
        this._smoothFace(obj, cfg, delta);
        this._applyWalkerAnim(obj, delta, time, floorY, false);
        return;
      }

      // 最多尝试 8 个方向寻找合法路径
      let dir = cfg.dir;
      let moved = false;

      for (let attempt = 0; attempt < 8 && !moved; attempt++) {
        const nx = curX + Math.sin(dir) * step;
        const nz = curZ + Math.cos(dir) * step;

        // ① 目标圆盘必须全部落在地板上
        if (!this._walkerIsDiscOnFloor(nx, nz, floorIdx, wRad, meshes)) {
          dir += Math.PI * (0.35 + Math.random() * 0.25);
          continue;
        }

        // ② 不能与家具重叠
        if (this.checkWalkerCollision(obj, nx, nz)) {
          dir += Math.PI * (0.35 + Math.random() * 0.25);
          continue;
        }

        // 全部通过 → 执行移动
        obj.position.x = nx;
        obj.position.z = nz;
        cfg.dir = dir;
        moved = true;
      }

      // 所有方向都被阻挡 → 原地转向等下一帧
      if (!moved) {
        cfg.dir += Math.PI * (0.8 + Math.random() * 0.4);
      }

      this._smoothFace(obj, cfg, delta);
      this._applyWalkerAnim(obj, delta, time, floorY, false);
    });
  };

  console.info('╔══════════════════════════════════════════════════════════╗');
  console.info('║  [WalkerFix V4] 行走模型 Raycaster 碰撞检测已启用         ║');
  console.info('║  ✓ 直接检测真实地板 Mesh，完全避开坐标转换误差            ║');
  console.info('║  ✓ 位置非法时只小步走向地板（≤0.06m/帧），绝不瞬移        ║');
  console.info('║  ✓ 20m 内找不到地板时只旋转不移动                         ║');
  console.info('║  ✓ 编辑 / 演示 / 多楼层 / 非凸房间 全部正确                ║');
  console.info('╚══════════════════════════════════════════════════════════╝');

})();
/* ============================================================================
 * ★★★ 阴影效果真实化增强 v1 ★★★
 * 
 * 设计目标：
 *   1. 阳光（平行光）投射清晰、柔和、无漏光的阴影
 *   2. 灯具（点光 / 射灯）按需投射真实阴影，夜晚氛围更佳
 *   3. 智能豁免发光体（灯罩、电视屏幕、灯带本身不投阴影）
 *   4. 地板 / 天花板 / 墙壁 / 家具 各司其职接收阴影
 *   5. 性能友好：每层最多 N 盏灯投射阴影，可在控制台动态调档
 * 
 * 安装方式：追加到 js/app.js 末尾即可
 * 现有功能：完全不受影响
 * ============================================================================ */

(function installShadowEnhancement() {
  'use strict';
  if (typeof app === 'undefined' || !app) return;
  if (app.__shadowEnhanceInstalled) return;
  app.__shadowEnhanceInstalled = true;

  /* =====================================================================
   * 一、扩展 lightConfig，追加阴影相关配置
   * ===================================================================== */
  const LC = app.lightConfig || (app.lightConfig = {});

  // ---- 平行光（太阳）阴影 ----
  if (LC.shadowMapSize === undefined) LC.shadowMapSize = 2048;
  if (LC.shadowCameraSize === undefined) LC.shadowCameraSize = 45;
  if (LC.shadowCameraFar === undefined) LC.shadowCameraFar = 200;
  if (LC.shadowBias === undefined) LC.shadowBias = -0.0003;
  if (LC.shadowNormalBias === undefined) LC.shadowNormalBias = 0.03;
  if (LC.shadowRadius === undefined) LC.shadowRadius = 3;
  if (LC.softShadowEnabled === undefined) LC.softShadowEnabled = true;

  // ---- 灯具（点光 / 射灯）阴影 ----
  if (!LC.lampShadow) {
    LC.lampShadow = {
      enabled: true,          // 是否允许灯投射阴影
      maxShadowCasters: 3,    // 每层最多几盏灯投射阴影
      mapSize: 1024,          // 阴影贴图分辨率（PointLight 是立方体，开销大）
      bias: -0.001,
      normalBias: 0.03,
      radius: 4,
      cameraFarRatio: 1.6     // shadow camera far = lampDistance * ratio
    };
  }

  // ---- 兼容原 lampCastShadow 语义（真实控制交给 _updateLampShadows） ----
  LC.lampCastShadow = true;

  console.info('[Shadow] 阴影配置已扩展：平行光 2048²，每层灯具最多 '
    + LC.lampShadow.maxShadowCasters + ' 盏投射');

  /* =====================================================================
   * 二、核心：增强渲染器 + 平行光的阴影设置
   * ===================================================================== */
  app._enhanceShadowSetup = function () {
    const LC = this.lightConfig;

    // ---- 渲染器 ----
    const r = this.renderer;
    if (r) {
      r.shadowMap.enabled = true;
      r.shadowMap.type = LC.softShadowEnabled
        ? THREE.PCFSoftShadowMap
        : THREE.PCFShadowMap;
      r.shadowMap.autoUpdate = true;
      r.shadowMap.needsUpdate = true;
    }

    // ---- 平行光 ----
    const d = this.dirLight;
    if (d) {
      d.castShadow = true;

      // 高分辨率贴图
      if (!d.shadow.mapSize) d.shadow.mapSize = new THREE.Vector2(2048, 2048);
      d.shadow.mapSize.width = LC.shadowMapSize;
      d.shadow.mapSize.height = LC.shadowMapSize;

      // 阴影相机范围（覆盖整个场景）
      const s = LC.shadowCameraSize;
      d.shadow.camera.near = 0.5;
      d.shadow.camera.far = LC.shadowCameraFar;
      d.shadow.camera.left = -s;
      d.shadow.camera.right = s;
      d.shadow.camera.top = s;
      d.shadow.camera.bottom = -s;

      // 反阴影痤疮 + 反漏光
      d.shadow.bias = LC.shadowBias;
      d.shadow.normalBias = LC.shadowNormalBias;

      // PCFSoft 柔和半径
      if (d.shadow.radius !== undefined) {
        d.shadow.radius = LC.shadowRadius;
      }

      d.shadow.camera.updateProjectionMatrix();

      // 阴影贴图必须重建
      if (d.shadow.map) {
        try {
          d.shadow.map.dispose();
          d.shadow.map = null;
        } catch (e) {}
      }
    }

    // 环境贴图强度重新应用（阴影变化后环境补光会显得更突出）
    try { this._applyEnvMapIntensity(this.lightConfig.skyEnvInfluence || 0.35); }
    catch (e) {}

    // 立即触发一次渲染
    if (r && r.shadowMap) r.shadowMap.needsUpdate = true;
  };

  /* =====================================================================
   * 三、智能标记：为场景内所有 mesh 设置正确的 castShadow / receiveShadow
   * ===================================================================== */
  app._applyShadowFlags = function () {
    /* ---- 结构组：墙 / 地板 / 天花板 / 柱 ---- */
    if (this.structureGroup) {
      this.structureGroup.traverse(o => {
        if (!o.isMesh) return;
        const ud = o.userData || {};

        if (ud.isCeiling) {
          // 天花板：不投阴影（会挡住所有室内光），接收阴影
          o.castShadow = false;
          o.receiveShadow = true;
        } else if (ud.roomIndex !== undefined) {
          // 地板：不投阴影（地板本身就是承影面），接收阴影
          o.castShadow = false;
          o.receiveShadow = true;
        } else {
          // 墙体 / 柱子：投阴影 + 接收阴影
          o.castShadow = true;
          o.receiveShadow = true;
        }

        // 让材质响应阴影变化
        if (o.material) {
          if (Array.isArray(o.material)) {
            o.material.forEach(m => { if (m) m.needsUpdate = true; });
          } else {
            o.material.needsUpdate = true;
          }
        }
      });
    }

    /* ---- 家具组：所有家具投 + 收；发光体豁免 ---- */
    if (this.furnitureGroup) {
      this.furnitureGroup.traverse(o => {
        if (!o.isMesh) return;

        const m = o.material;
        let isEmissive = false;

        // 智能识别发光体：emissive 颜色非黑 且 强度较高 → 不投阴影
        if (m) {
          const mats = Array.isArray(m) ? m : [m];
          for (let i = 0; i < mats.length; i++) {
            const mm = mats[i];
            if (!mm || !mm.emissive) continue;
            const hex = (mm.emissive.getHex && mm.emissive.getHex()) || 0;
            const intensity = mm.emissiveIntensity || 1;
            if (hex !== 0x000000 && intensity > 1.5) {
              isEmissive = true;
              break;
            }
          }
        }

        if (isEmissive) {
          // 灯罩 / 屏幕 / 灯带本身不投阴影
          o.castShadow = false;
          o.receiveShadow = true;
        } else {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
    }
  };

  /* =====================================================================
   * 四、灯具阴影动态控制：每层最多 N 盏灯投射阴影
   * ===================================================================== */
  app._updateLampShadows = function () {
    const LC = this.lightConfig;
    const ls = LC.lampShadow;
    if (!ls || !ls.enabled) {
      // 全局关闭 → 所有灯不投阴影
      this.furnitureGroup.children.forEach(obj => {
        const d = obj.userData;
        if (!d || d.type !== 'light') return;
        if (d.refs && d.refs.light) d.refs.light.castShadow = false;
      });
      return;
    }

    const maxCasters = Math.max(0, ls.maxShadowCasters || 3);

    // ---- 按楼层分组 ----
    const byFloor = {};
    this.furnitureGroup.children.forEach(obj => {
      const d = obj.userData;
      if (!d || d.type !== 'light') return;
      if (!d.refs || !d.refs.light) return;

      const light = d.refs.light;
      if (!light.isPointLight && !light.isSpotLight) return;

      let fi = d.floorIndex;
      if (typeof fi !== 'number' || !isFinite(fi)) fi = 0;

      if (!byFloor[fi]) byFloor[fi] = [];
      byFloor[fi].push({
        light: light,
        on: !!(d.state && d.state.on),
        intensity: isFinite(light.intensity) ? light.intensity : 0
      });
    });

    // ---- 每层处理 ----
    Object.keys(byFloor).forEach(fi => {
      const arr = byFloor[fi];

      // 开启的灯按强度降序排序，取前 N 盏
      const onLights = arr
        .filter(x => x.on)
        .sort((a, b) => b.intensity - a.intensity);

      const casterSet = new Set(
        onLights.slice(0, maxCasters).map(x => x.light)
      );

      arr.forEach(x => {
        const l = x.light;
        const shouldCast = casterSet.has(l);

        if (shouldCast) {
          l.castShadow = true;

          // 阴影贴图分辨率（PointLight 是 CubeShadowMap，开销较大）
          if (!l.shadow.mapSize) {
            l.shadow.mapSize = new THREE.Vector2(ls.mapSize, ls.mapSize);
          }
          l.shadow.mapSize.width = ls.mapSize;
          l.shadow.mapSize.height = ls.mapSize;

          // 阴影相机 near/far 适配灯具距离
          if (l.shadow.camera) {
            l.shadow.camera.near = 0.1;
            const lampDist = isFinite(LC.lampDistance) ? LC.lampDistance : 14;
            l.shadow.camera.far = lampDist * (ls.cameraFarRatio || 1.6);
            l.shadow.camera.updateProjectionMatrix();
          }

          // bias / normalBias 防漏光 / 防痤疮
          l.shadow.bias = ls.bias !== undefined ? ls.bias : -0.001;
          l.shadow.normalBias = ls.normalBias !== undefined ? ls.normalBias : 0.03;

          // 柔和半径（PointLight 支持 radius 参数）
          if (l.shadow.radius !== undefined) {
            l.shadow.radius = ls.radius !== undefined ? ls.radius : 4;
          }

          // 强制重建阴影贴图
          if (l.shadow.map) {
            try {
              l.shadow.map.dispose();
              l.shadow.map = null;
            } catch (e) {}
          }
        } else {
          l.castShadow = false;
        }
      });
    });

    // ---- 触发一次渲染器阴影更新 ----
    if (this.renderer && this.renderer.shadowMap) {
      this.renderer.shadowMap.needsUpdate = true;
    }
  };

  /* =====================================================================
   * 五、方法覆盖 —— 用增强逻辑包裹原有方法
   * ===================================================================== */

  /* ---- ① init3D：初始化后立即应用阴影增强 ---- */
  const _origInit3D = app.init3D;
  app.init3D = function () {
    const r = _origInit3D.call(this);
    try {
      this._enhanceShadowSetup();
      // 延迟一点，等 dirLight.shadow.camera 完全就绪
      setTimeout(() => {
        try {
          this._enhanceShadowSetup();
          this._applyShadowFlags();
          this._updateLampShadows();
        } catch (e) {}
      }, 100);
    } catch (e) {
      console.warn('[Shadow] init3D 增强失败:', e);
    }
    return r;
  };

  /* ---- ② generate3D：几何体重建后重新标记阴影标志 ---- */
  const _origGenerate3D = app.generate3D;
  app.generate3D = function () {
    const r = _origGenerate3D.call(this);
    try { this._applyShadowFlags(); } catch (e) {}
    return r;
  };

  /* ---- ③ applyDeviceState：灯开关变化后重算阴影投射者 ---- */
  const _origApplyDeviceState = app.applyDeviceState;
  app.applyDeviceState = function (obj) {
    const r = _origApplyDeviceState.call(this, obj);
    try { this._updateLampShadows(); } catch (e) {}
    return r;
  };

  /* ---- ④ _recalculateGlobalLighting：全局光变化后同步阴影 ---- */
  const _origRecalc = app._recalculateGlobalLighting;
  app._recalculateGlobalLighting = function (floorIdx) {
    const r = _origRecalc.call(this, floorIdx);
    try {
      // 灯具强度会随全局光重算，重新分配投射者
      this._updateLampShadows();
    } catch (e) {}
    return r;
  };

  /* ---- ⑤ toggleDevicePower：开关灯后立即刷新阴影 ---- */
  if (typeof app.toggleDevicePower === 'function') {
    const _origTogglePower = app.toggleDevicePower;
    app.toggleDevicePower = function () {
      const r = _origTogglePower.call(this);
      try { this._updateLampShadows(); } catch (e) {}
      return r;
    };
  }

  /* ---- ⑥ updateDeviceState：调亮度 / 颜色后刷新阴影 ---- */
  if (typeof app.updateDeviceState === 'function') {
    const _origUpdateDeviceState = app.updateDeviceState;
    app.updateDeviceState = function (key, value) {
      const r = _origUpdateDeviceState.call(this, key, value);
      try { this._updateLampShadows(); } catch (e) {}
      return r;
    };
  }

  /* ---- ⑦ updateLights：UI 滑杆调整后同步阴影 ---- */
  const _origUpdateLights = app.updateLights;
  app.updateLights = function () {
    const r = _origUpdateLights.call(this);
    try {
      this._updateLampShadows();
      // 阳光强度变了，阴影相机与贴图重新对齐
      if (this.dirLight && this.dirLight.shadow) {
        this.dirLight.shadow.camera.updateProjectionMatrix();
      }
    } catch (e) {}
    return r;
  };

  /* ---- ⑧ init：整体初始化后应用一次阴影 ---- */
  const _origInit = app.init;
  app.init = async function () {
    const r = await _origInit.call(this);
    // 多次延迟应用，覆盖数据库恢复场景
    [300, 800, 1500, 2500].forEach(delay => {
      setTimeout(() => {
        try {
          this._enhanceShadowSetup();
          this._applyShadowFlags();
          this._updateLampShadows();
        } catch (e) {}
      }, delay);
    });
    return r;
  };

  /* ---- ⑨ togglePlayMode：进入/退出演示模式后重新应用 ---- */
  const _origTogglePlayMode = app.togglePlayMode;
  app.togglePlayMode = function (enter) {
    const r = _origTogglePlayMode.call(this, enter);
    // 演示模式会切换 viewport，需要重新计算阴影
    [120, 400, 900].forEach(delay => {
      setTimeout(() => {
        try {
          this._enhanceShadowSetup();
          this._applyShadowFlags();
          this._updateLampShadows();
        } catch (e) {}
      }, delay);
    });
    return r;
  };

  /* =====================================================================
   * 六、对外 API：阴影质量动态切换（控制台调用）
   * ---------------------------------------------------------------------
   *   app.setShadowQuality('off')     关闭阴影（最高性能）
   *   app.setShadowQuality('low')     低（1024²，1 盏灯）
   *   app.setShadowQuality('medium')  中（2048²，2 盏灯）—— 默认
   *   app.setShadowQuality('high')    高（4096²，4 盏灯）
   *   app.setShadowQuality('ultra')   极致（4096²，8 盏灯）
   * ===================================================================== */
  app.setShadowQuality = function (level) {
    const LC = this.lightConfig;
    const ls = LC.lampShadow;
    const r = this.renderer;

    if (level === 'off') {
      if (r) r.shadowMap.enabled = false;
      if (this.dirLight) this.dirLight.castShadow = false;
      ls.enabled = false;
      this.furnitureGroup.children.forEach(obj => {
        const d = obj.userData;
        if (d && d.type === 'light' && d.refs && d.refs.light) {
          d.refs.light.castShadow = false;
        }
      });
      this.saveSystem.showToast('🔅 已关闭阴影（性能最优）');
      return;
    }

    if (r) r.shadowMap.enabled = true;
    if (this.dirLight) this.dirLight.castShadow = true;
    ls.enabled = true;

    if (level === 'low') {
      LC.shadowMapSize = 1024;
      LC.shadowCameraSize = 30;
      LC.shadowRadius = 2;
      ls.maxShadowCasters = 1;
      ls.mapSize = 512;
      if (r) r.shadowMap.type = THREE.PCFShadowMap;
    } else if (level === 'medium') {
      LC.shadowMapSize = 2048;
      LC.shadowCameraSize = 45;
      LC.shadowRadius = 3;
      ls.maxShadowCasters = 2;
      ls.mapSize = 1024;
      if (r) r.shadowMap.type = THREE.PCFSoftShadowMap;
    } else if (level === 'high') {
      LC.shadowMapSize = 4096;
      LC.shadowCameraSize = 50;
      LC.shadowRadius = 4;
      ls.maxShadowCasters = 4;
      ls.mapSize = 2048;
      if (r) r.shadowMap.type = THREE.PCFSoftShadowMap;
    } else if (level === 'ultra') {
      LC.shadowMapSize = 4096;
      LC.shadowCameraSize = 60;
      LC.shadowRadius = 5;
      ls.maxShadowCasters = 8;
      ls.mapSize = 2048;
      if (r) r.shadowMap.type = THREE.PCFSoftShadowMap;
    } else {
      return;
    }

    // 应用配置
    try {
      this._enhanceShadowSetup();
      this._applyShadowFlags();
      this._updateLampShadows();
      this.generate3D();
    } catch (e) {
      console.warn('[Shadow] setShadowQuality 应用失败:', e);
    }

    this.saveSystem.showToast('✨ 阴影质量: ' + level.toUpperCase());
  };

  /* =====================================================================
   * 七、控制台提示
   * ===================================================================== */
  console.info('╔══════════════════════════════════════════════════════════╗');
  console.info('║  [ShadowEnhance v1] 阴影效果真实化已启用                  ║');
  console.info('║  ✓ 平行光 2048² + PCFSoft + normalBias 抗痤疮              ║');
  console.info('║  ✓ 每层最多 2 盏灯投射阴影（可调）                        ║');
  console.info('║  ✓ 发光体智能豁免（灯罩 / 屏幕 / 灯带不投阴影）           ║');
  console.info('║  ✓ 控制台可用: app.setShadowQuality(low|medium|high|off)  ║');
  console.info('╚══════════════════════════════════════════════════════════╝');

})();
/* ============================================================================
 * ★★★ 模型渲染阴影 + 模型风格化 v3（最终修复版）★★★
 * 
 * v3 关键修复：
 *   1. 动漫风格【完整保留原模型颜色 + 贴图】，仅添加三渲二效果
 *   2. SkinnedMesh（骨骼动画模型）【逐槽位独立材质】，彻底解决动画冻结
 *   3. 多材质数组 mesh 正确逐个替换
 *   4. 保留透明通道 / alphaMap / side 等所有渲染属性
 *   5. 素描风格保留原色相（非纯白）
 * 
 * 本次追加修复：
 *   ★ 关闭“模型渲染阴影”后，进入全屏演示模式不再被其它阴影增强模块重新开启。
 *   ★ 对 _enhanceShadowSetup / _updateLampShadows / _applyShadowFlags 做包装，
 *     当 showShadow === false 时一律强制关闭阴影。
 *   ★ togglePlayMode 多次延迟强制同步阴影状态，覆盖 installShadowEnhancement 的延迟调用。
 * 
 * UI 位置：左侧侧边栏 → 2. 全局环境
 * 状态持久化：localStorage
 * ============================================================================ */

/* ============================================================================
 * ★★★ 模型渲染阴影 + 模型风格化 v5（像素风格优化：分辨率可调）★★★
 * 
 * v5 修复重点：
 *   1. 修复像素风格过于模糊的问题：渲染比例从 0.12 提升至 0.25（清晰可见）
 *   2. 新增像素风格参数集中配置区，一处修改全局生效
 *   3. 新增控制台 API 动态调节像素化强度
 * 
 * 【像素风格调参指南】详见下方 _pixelStyleConfig 注释
 * ============================================================================ */

(function installModelStyleShadowV5() {
    'use strict';
    if (typeof app === 'undefined' || !app) return;
    if (app.__modelStyleShadowV5Installed) return;
    app.__modelStyleShadowV5Installed = true;
  
    /* ======================================================================
     * 一、状态与配置
     * ====================================================================== */
    if (app._currentStyle === undefined) app._currentStyle = 'default';
    if (app.showShadow === undefined) app.showShadow = true;
  
    // 记录初始像素比（用于从像素风恢复时使用），与渲染器实际比例对齐
    app._originalPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  
    /* ======================================================================
     * ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
     * ★                                                                           ★
     * ★              ✨ 像素风格参数集中配置区 (Pixel Style Config) ✨             ★
     * ★                                                                           ★
     * ★  【_pixelStyleRatio】渲染分辨率比例 —— 控制像素块大小与画面清晰度的核心   ★
     * ★      · 0.10 ~ 0.15 → 重度像素化（大颗粒，8-bit 复古感，画面很模糊）      ★
     * ★      · 0.18 ~ 0.24 → 中度像素化（推荐范围，像素块明显，场景细节可见）    ★
     * ★      · 0.25 ~ 0.32 → 轻度像素化（像素感较弱，画面清晰）   ★ 默认 0.28    ★
     * ★      · 0.35 ~ 0.50 → 几乎看不出像素（不推荐）                             ★
     * ★                                                                           ★
     * ★  【_pixelUseHardEdge】是否使用硬边缘像素化（image-rendering: pixelated） ★
     * ★      · true  → 硬边方块（经典像素游戏观感，图三效果） ★ 默认 true         ★
     * ★      · false → 平滑插值（画面更柔和，但不呈现"像素块"感）                 ★
     * ★                                                                           ★
     * ★  修改方式1（静态）：直接修改下方数值，刷新页面生效                        ★
     * ★  修改方式2（动态）：控制台输入                                             ★
     * ★      app.setPixelStyleRatio(0.35)      // 调整像素块大小                  ★
     * ★      app.setPixelHardEdge(false)       // 关闭硬边缘像素化                ★
     * ★                                                                           ★
     * ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
     * ====================================================================== */
    app._pixelStyleRatio = 0.28;   // ★ 像素化渲染比例（0.28 = 保留 28% 分辨率，清晰与像素感平衡点）
    app._pixelUseHardEdge = true;  // ★ 是否启用硬边缘像素化（true = 方块边缘锐利，false = 平滑）
  
    const STYLE_META = {
      default:   { icon: '🎨', label: '默认', name: '默认风格' },
      realistic: { icon: '📷', label: '写实', name: '写实风格' },
      white:     { icon: '⬜', label: '白模', name: '白模风格' },
      toon:      { icon: '🎭', label: '动漫', name: '动漫风格(三渲二)' },
      sketch:    { icon: '✏️', label: '素描', name: '素描风格' },
      pixel:     { icon: '👾', label: '像素', name: '像素风格 (3D Pixel)' }
    };
    const STYLE_ORDER = ['default', 'realistic', 'white', 'toon', 'sketch', 'pixel'];
  
    /* ======================================================================
     * 二、全局缓存池
     * ====================================================================== */
    const cache = {
      toonGradient: null,
      commonMatCache: new Map()
    };
  
    /* ======================================================================
     * 三、三渲二渐变贴图（动漫风格专用）
     * ====================================================================== */
    function getToonGradient() {
      if (cache.toonGradient) return cache.toonGradient;
      try {
        const colors = new Uint8Array([40, 110, 190, 255]);
        const fmt = (THREE.RedFormat !== undefined) ? THREE.RedFormat : THREE.LuminanceFormat;
        const tex = new THREE.DataTexture(colors, colors.length, 1, fmt);
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
        tex.generateMipmaps = false;
        tex.needsUpdate = true;
        cache.toonGradient = tex;
        return tex;
      } catch (e) {
        console.warn('[Toon] 渐变贴图创建失败:', e);
        return null;
      }
    }
  
    /* ======================================================================
     * 四、核心：从原材质构建目标风格材质
     * ====================================================================== */
    function buildFromOriginal(origMat, style) {
      if (!origMat) return new THREE.MeshStandardMaterial({ color: 0xcccccc });
  
      const origSide = (origMat.side !== undefined) ? origMat.side : THREE.FrontSide;
      const origTransparent = !!origMat.transparent;
      const origOpacity = (typeof origMat.opacity === 'number') ? origMat.opacity : 1.0;
      const origAlphaTest = (typeof origMat.alphaTest === 'number') ? origMat.alphaTest : 0;
      const origAlphaMap = origMat.alphaMap || null;
      const origDepthWrite = origMat.depthWrite !== false;
      const origColor = origMat.color ? origMat.color.clone() : new THREE.Color(0xffffff);
      const origMap = origMat.map || null;
  
      /* ---- 像素风格：极简材质，保留颜色和贴图，依靠渲染器降采样出像素 ---- */
      if (style === 'pixel') {
        return new THREE.MeshBasicMaterial({
          color: origColor.clone(),
          map: origMap,
          side: origSide,
          transparent: origTransparent,
          opacity: origOpacity,
          alphaTest: origAlphaTest,
          alphaMap: origAlphaMap,
          depthWrite: origDepthWrite
        });
      }
  
      /* ---- 白模风格 ---- */
      if (style === 'white') {
        return new THREE.MeshStandardMaterial({
          color: 0xf0f0f0,
          map: null,
          roughness: 0.85,
          metalness: 0.0,
          side: origSide,
          transparent: origTransparent,
          opacity: origOpacity,
          alphaTest: origAlphaTest,
          alphaMap: origAlphaMap,
          depthWrite: origDepthWrite
        });
      }
  
      /* ---- 动漫风格（三渲二优化版） ---- */
      if (style === 'toon') {
        const mat = new THREE.MeshToonMaterial({
          color: origColor.clone(),
          map: origMap,
          gradientMap: getToonGradient() || undefined,
          side: origSide,
          transparent: origTransparent,
          opacity: origOpacity,
          alphaTest: origAlphaTest,
          alphaMap: origAlphaMap,
          depthWrite: origDepthWrite
        });
  
        try {
          const hsl = { h: 0, s: 0, l: 0 };
          mat.color.getHSL(hsl);
          hsl.s = Math.min(1.0, hsl.s * 1.35);
          hsl.l = Math.min(0.95, Math.max(0.3, hsl.l * 1.1));
          mat.color.setHSL(hsl.h, hsl.s, hsl.l);
        } catch (e) {}
  
        try {
          mat.emissive = mat.color.clone().multiplyScalar(0.2);
          mat.emissiveIntensity = 1.0;
        } catch (e) {}
  
        return mat;
      }
  
      /* ---- 素描风格 ---- */
      if (style === 'sketch') {
        const sketchColor = origColor.clone();
        try {
          const hsl = { h: 0, s: 0, l: 0 };
          sketchColor.getHSL(hsl);
          hsl.l = Math.max(0.72, Math.min(1.0, hsl.l * 1.15 + 0.35));
          hsl.s = Math.min(1.0, hsl.s * 1.15);
          sketchColor.setHSL(hsl.h, hsl.s, hsl.l);
        } catch (e) {}
  
        return new THREE.MeshBasicMaterial({
          color: sketchColor,
          wireframe: true,
          transparent: origTransparent,
          opacity: Math.max(0.6, origOpacity),
          side: THREE.DoubleSide,
          depthWrite: false
        });
      }
  
      return origMat;
    }
  
    function getCommonStyledMat(origMat, style) {
      if (!origMat) return null;
      const key = (origMat.uuid || '') + '|' + style;
      if (cache.commonMatCache.has(key)) return cache.commonMatCache.get(key);
      const mat = buildFromOriginal(origMat, style);
      cache.commonMatCache.set(key, mat);
      return mat;
    }
  
    function getSkinnedStyledMat(mesh, origMat, style, slotIndex) {
      if (!mesh.userData.__skinnedStyleMats) mesh.userData.__skinnedStyleMats = {};
      const key = style + '|' + slotIndex;
      if (!mesh.userData.__skinnedStyleMats[key]) {
        mesh.userData.__skinnedStyleMats[key] = buildFromOriginal(origMat, style);
      }
      return mesh.userData.__skinnedStyleMats[key];
    }
  
    app._applyStyleToMesh = function (mesh, style) {
      if (!mesh || !mesh.isMesh || !mesh.material) return;
  
      if (mesh.userData.__origMat === undefined) {
        mesh.userData.__origMat = mesh.material;
      }
      const orig = mesh.userData.__origMat;
  
      if (style === 'default' || style === 'realistic') {
        if (mesh.material !== orig) mesh.material = orig;
        if (style === 'realistic') {
          const mats = Array.isArray(orig) ? orig : [orig];
          mats.forEach(m => {
            if (!m) return;
            if (typeof m.envMapIntensity === 'number') m.envMapIntensity = 1.25;
            if (typeof m.roughness === 'number' && typeof m.metalness === 'number') {
              m.roughness = Math.max(0.12, m.roughness * 0.65);
              m.metalness = Math.min(1.0, m.metalness + 0.05);
            }
            m.needsUpdate = true;
          });
        }
        return;
      }
  
      const isSkinned = !!mesh.isSkinnedMesh;
      if (Array.isArray(orig)) {
        const newMats = orig.map((m, i) => {
          return isSkinned ? getSkinnedStyledMat(mesh, m, style, i) : getCommonStyledMat(m, style);
        });
        mesh.material = newMats;
      } else {
        mesh.material = isSkinned ? getSkinnedStyledMat(mesh, orig, style, 0) : getCommonStyledMat(orig, style);
      }
  
      const finalMats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      finalMats.forEach(m => { if (m) m.needsUpdate = true; });
    };
  
    app._applyStyleToScene = function (style) {
      try {
        if (this.structureGroup) this.structureGroup.traverse(o => this._applyStyleToMesh(o, style));
        if (this.furnitureGroup) this.furnitureGroup.traverse(o => this._applyStyleToMesh(o, style));
      } catch (e) {
        console.warn('[Style] 场景应用失败:', e);
      }
    };
  
    /* ======================================================================
     * ★★★ 新增：像素风格渲染参数应用函数（集中管理像素化开关） ★★★
     * 
     * 调用时机：
     *   · setModelStyle('pixel')        进入像素风格
     *   · generate3D()                  重建场景后
     *   · togglePlayMode()              演示模式切换后
     *   · setPixelStyleRatio()          动态调整像素比
     *   · setPixelHardEdge()            动态调整边缘模式
     * ====================================================================== */
    app._applyPixelStyleSettings = function () {
      if (!this.renderer || !this.renderer.domElement) return;
  
      const ratio = (typeof this._pixelStyleRatio === 'number' && this._pixelStyleRatio > 0)
        ? this._pixelStyleRatio : 0.28;
      const hardEdge = this._pixelUseHardEdge !== false;
  
      try {
        // ★★★ 核心：降低渲染分辨率，产生像素块效果 ★★★
        this.renderer.setPixelRatio(ratio);
  
        // ★ 让渲染器立即按新像素比重置尺寸
        const canvas = this.renderer.domElement;
        const w = canvas.clientWidth || this.renderer.domElement.width;
        const h = canvas.clientHeight || this.renderer.domElement.height;
        if (w > 0 && h > 0) {
          this.renderer.setSize(w, h, false);
        }
      } catch (e) {
        console.warn('[Pixel] setPixelRatio 失败:', e);
      }
  
      try {
        // ★★★ 核心：CSS 渲染模式 ★★★
        // true  → 'pixelated'     硬边缘像素块（图三效果）
        // false → 'auto'          平滑插值（不呈现像素感）
        const cssValue = hardEdge ? 'pixelated' : 'auto';
        this.renderer.domElement.style.imageRendering = cssValue;
        this.renderer.domElement.style.msInterpolationMode = hardEdge ? 'nearest-neighbor' : 'auto';
        this.renderer.domElement.style.webkitOptimizeContrast = hardEdge ? 'nearest-neighbor' : 'auto';
      } catch (e) {}
    };
  
    /* ======================================================================
     * ★★★ 新增：恢复默认像素比（退出像素风格时调用） ★★★
     * ====================================================================== */
    app._restoreDefaultRenderRatio = function () {
      if (!this.renderer || !this.renderer.domElement) return;
      try {
        this.renderer.setPixelRatio(this._originalPixelRatio || 1);
        this.renderer.domElement.style.imageRendering = 'auto';
        this.renderer.domElement.style.msInterpolationMode = 'auto';
        this.renderer.domElement.style.webkitOptimizeContrast = 'auto';
  
        const canvas = this.renderer.domElement;
        const w = canvas.clientWidth || canvas.width;
        const h = canvas.clientHeight || canvas.height;
        if (w > 0 && h > 0) {
          this.renderer.setSize(w, h, false);
        }
      } catch (e) {
        console.warn('[Pixel] 恢复默认渲染比例失败:', e);
      }
    };
  
    /* ======================================================================
     * 八、对外 API: setModelStyle（核心：加入像素化分辨率控制）
     * ====================================================================== */
    app.setModelStyle = function (style) {
      if (STYLE_ORDER.indexOf(style) < 0) style = 'default';
  
      const now = Date.now();
      if (this._lastStyleTime && (now - this._lastStyleTime) < 80) {
        this._refreshStyleUI && this._refreshStyleUI();
        return;
      }
      this._lastStyleTime = now;
  
      const prevStyle = this._currentStyle;
      this._currentStyle = style;
  
      /* ★★★ 像素风格：应用像素化渲染参数 ★★★
       * 参数值从 _pixelStyleRatio / _pixelUseHardEdge 读取，
       * 集中配置在模块顶部"像素风格参数集中配置区"
       */
      if (style === 'pixel') {
        this._applyPixelStyleSettings();
      } else if (prevStyle === 'pixel') {
        // 从像素风切回其它风格 → 恢复原始分辨率
        this._restoreDefaultRenderRatio();
      }
  
      this._applyStyleToScene(style);
  
      if (style === 'default' || prevStyle === 'pixel') {
        try {
          const envI = (this.lightConfig && this.lightConfig.skyEnvInfluence) || 0.35;
          this._applyEnvMapIntensity && this._applyEnvMapIntensity(envI);
        } catch (e) {}
      }
  
      this._refreshStyleUI && this._refreshStyleUI();
      try { localStorage.setItem('modelStyle', style); } catch (e) {}
      try { this.saveSystem.saveToDB(true); } catch (e) {}
  
      const meta = STYLE_META[style] || STYLE_META.default;
      this.saveSystem.showToast('🎨 已应用: ' + meta.name);
    };
  
    /* ======================================================================
     * ★★★ 新增：控制台可调 API —— 动态修改像素化强度 ★★★
     * 
     * 用法：
     *   app.setPixelStyleRatio(0.35)   // 提高清晰度（像素块变小）
     *   app.setPixelStyleRatio(0.15)   // 加大像素感（像素块变大）
     *   app.setPixelHardEdge(false)    // 关闭硬边缘（画面变平滑）
     *   app.setPixelHardEdge(true)     // 开启硬边缘（经典像素观感）
     * ====================================================================== */
    app.setPixelStyleRatio = function (ratio) {
      const r = parseFloat(ratio);
      if (!isFinite(r) || r <= 0) {
        console.warn('[Pixel] 无效的像素比例:', ratio);
        return;
      }
      // 范围限制：0.05（极度模糊）~ 0.80（几乎无像素感）
      this._pixelStyleRatio = Math.max(0.05, Math.min(0.80, r));
  
      // 如果当前正处于像素风格，立即应用
      if (this._currentStyle === 'pixel') {
        this._applyPixelStyleSettings();
      }
  
      this.saveSystem.showToast('👾 像素比例已设为 ' + this._pixelStyleRatio.toFixed(2));
      console.log('[Pixel] _pixelStyleRatio =', this._pixelStyleRatio,
                  '(数值越小越模糊，越大越清晰)');
    };
  
    app.setPixelHardEdge = function (enabled) {
      this._pixelUseHardEdge = !!enabled;
      if (this._currentStyle === 'pixel') {
        this._applyPixelStyleSettings();
      }
      this.saveSystem.showToast('👾 硬边缘像素化: ' + (this._pixelUseHardEdge ? '已开启' : '已关闭'));
    };
  
    app.setModelShadow = function (show) {
      show = !!show;
      const changed = (this.showShadow !== show);
      this.showShadow = show;
  
      if (this.renderer && this.renderer.shadowMap) {
        this.renderer.shadowMap.enabled = show;
        if (show) this.renderer.shadowMap.needsUpdate = true;
      }
  
      try {
        if (this.scene) {
          this.scene.traverse(o => {
            if (!o.material) return;
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            mats.forEach(m => { if (m) m.needsUpdate = true; });
          });
        }
      } catch (e) {}
  
      if (show) {
        try { this._enhanceShadowSetup && this._enhanceShadowSetup(); } catch (e) {}
        try { this._updateLampShadows && this._updateLampShadows(); } catch (e) {}
      } else {
        if (typeof this._enforceShadowOff === 'function') this._enforceShadowOff();
      }
  
      this._refreshShadowUI && this._refreshShadowUI();
      try { localStorage.setItem('showShadow', show ? '1' : '0'); } catch (e) {}
      try { this.saveSystem.saveToDB(true); } catch (e) {}
  
      if (changed) {
        this.saveSystem.showToast(show ? '☀️ 模型阴影已开启' : '🌙 模型阴影已关闭');
      }
    };
  
    app.toggleModelShadow = function () {
      this.setModelShadow(!this.showShadow);
    };
  
    app._enforceShadowOff = function () {
      try {
        if (this.renderer && this.renderer.shadowMap) {
          this.renderer.shadowMap.enabled = false;
          this.renderer.shadowMap.needsUpdate = false;
        }
        if (this.dirLight) this.dirLight.castShadow = false;
        if (this.furnitureGroup) {
          this.furnitureGroup.traverse(o => {
            if (o.isLight) o.castShadow = false;
            if (o.userData && o.userData.type === 'light' && o.userData.refs && o.userData.refs.light) {
              o.userData.refs.light.castShadow = false;
            }
          });
        }
      } catch (e) {}
    };
  
    /* ======================================================================
     * 十、UI 注入（多重容错，确保面板必定显示）
     * ====================================================================== */
    app._injectShadowAndStyleUI = function () {
      if (document.getElementById('modelRenderOptions')) {
        this._refreshShadowUI();
        this._refreshStyleUI();
        return;
      }
  
      let panel = document.getElementById('globalEnvPanel');
      let insertTarget = null;
  
      if (!panel) {
        const sidebarLeft = document.getElementById('sidebarLeft');
        if (sidebarLeft) {
          panel = document.createElement('div');
          panel.id = 'globalEnvPanel';
          panel.className = 'panel-group';
          panel.innerHTML = '<div class="group-title">2. 全局环境</div>';
          sidebarLeft.appendChild(panel);
        }
      }
  
      if (!panel) {
        console.warn('[Style] 无法找到侧边栏，UI 注入失败');
        return;
      }
  
      const anchor = document.getElementById('globalSkyToggle');
      if (anchor && anchor.parentNode === panel) {
        insertTarget = anchor;
      }
  
      const styleCardHTML = (key) => {
        const meta = STYLE_META[key];
        return `
          <div data-style="${key}" style="
            background:#23252e;border-radius:9px;padding:7px 4px;
            text-align:center;cursor:pointer;user-select:none;
            border:2px solid rgba(255,255,255,0.08);
            transition:border-color .15s, background .15s, box-shadow .15s;
            -webkit-tap-highlight-color:transparent;
          ">
            <div style="font-size:0.95rem;line-height:1.3;pointer-events:none;">${meta.icon}</div>
            <div style="font-size:0.55rem;color:#aaa;margin-top:2px;pointer-events:none;">${meta.label}</div>
          </div>
        `;
      };
  
      const wrap = document.createElement('div');
      wrap.id = 'modelRenderOptions';
      wrap.style.cssText =
        'border-top:1px dashed rgba(255,255,255,0.12);' +
        'padding-top:10px;margin-top:8px;margin-bottom:8px;';
  
      wrap.innerHTML =
        '<div class="group-title" style="font-size:0.75rem;color:var(--accent);margin-bottom:8px;">' +
          '🖼️ 模型渲染与风格' +
        '</div>' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;">' +
          '<span style="font-size:0.7rem;color:#ccc;">☀️ 模型渲染阴影</span>' +
          '<button id="modelShadowToggleBtn" type="button" style="' +
            'background:linear-gradient(135deg,#4361ee,#4cc9f0);' +
            'color:#fff;border:none;border-radius:8px;' +
            'padding:5px 14px;font-size:0.68rem;font-weight:600;' +
            'cursor:pointer;min-width:74px;' +
            'transition:background .2s ease;' +
          '">已开启</button>' +
        '</div>' +
        '<div style="margin-bottom:4px;">' +
          '<div style="font-size:0.68rem;color:#aaa;margin-bottom:6px;">' +
            '🎨 模型风格化' +
          '</div>' +
          '<div id="modelStyleGrid" style="' +
            'display:grid;grid-template-columns:repeat(3,1fr);gap:6px;' +
          '">' +
            STYLE_ORDER.map(styleCardHTML).join('') +
          '</div>' +
        '</div>' +
        '<div style="font-size:0.58rem;color:#777;line-height:1.5;margin-top:8px;">' +
          '💡 风格实时生效；关闭阴影可提升低性能设备帧率<br>' +
          '👾 像素风可通过控制台 <b>app.setPixelStyleRatio(0.3)</b> 调清晰度' +
        '</div>';
  
      if (insertTarget) {
        insertTarget.parentNode.insertBefore(wrap, insertTarget);
      } else {
        panel.appendChild(wrap);
      }
  
      const shadowBtn = document.getElementById('modelShadowToggleBtn');
      if (shadowBtn) {
        shadowBtn.addEventListener('click', (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          this.toggleModelShadow();
        });
      }
  
      const grid = document.getElementById('modelStyleGrid');
      if (grid) {
        const handler = (ev) => {
          const card = ev.target.closest ? ev.target.closest('[data-style]') : null;
          if (!card) return;
          const style = card.getAttribute('data-style');
          if (!style) return;
          ev.preventDefault();
          ev.stopPropagation();
          this.setModelStyle(style);
        };
        grid.addEventListener('click', handler);
        grid.addEventListener('touchend', handler, { passive: false });
      }
  
      this._refreshShadowUI();
      this._refreshStyleUI();
    };
  
    app._refreshShadowUI = function () {
      const btn = document.getElementById('modelShadowToggleBtn');
      if (!btn) return;
      const show = !!this.showShadow;
      btn.textContent = show ? '已开启' : '已关闭';
      btn.style.background = show
        ? 'linear-gradient(135deg,#4361ee,#4cc9f0)'
        : 'linear-gradient(135deg,#4a4a55,#2a2a33)';
      btn.style.color = show ? '#fff' : '#bbb';
    };
  
    app._refreshStyleUI = function () {
      const grid = document.getElementById('modelStyleGrid');
      if (!grid) return;
      const current = this._currentStyle || 'default';
      grid.querySelectorAll('[data-style]').forEach(card => {
        const style = card.getAttribute('data-style');
        const active = (style === current);
        card.style.border = active ? '2px solid var(--accent)' : '2px solid rgba(255,255,255,0.08)';
        card.style.background = active ? 'rgba(76,201,240,0.15)' : '#23252e';
        card.style.boxShadow = active ? '0 0 10px rgba(76,201,240,0.4)' : 'none';
      });
    };
  
    /* ======================================================================
     * 十二、方法覆盖与生命周期绑定
     * ====================================================================== */
  
    const _origInitGlobalEnvUI = app.initGlobalEnvUI;
    app.initGlobalEnvUI = function () {
      const r = (typeof _origInitGlobalEnvUI === 'function') ? _origInitGlobalEnvUI.call(this) : undefined;
      try { this._injectShadowAndStyleUI(); } catch (e) { console.warn('[Style] UI 注入失败:', e); }
      return r;
    };
  
    const _origGenerate3D = app.generate3D;
    app.generate3D = function () {
      const r = (typeof _origGenerate3D === 'function') ? _origGenerate3D.call(this) : undefined;
  
      try {
        if (this.renderer && this.renderer.shadowMap) {
          this.renderer.shadowMap.enabled = this.showShadow !== false;
          if (this.showShadow === false && typeof this._enforceShadowOff === 'function') {
            this._enforceShadowOff();
          }
        }
      } catch (e) {}
  
      /* ★★★ 像素风格：重建后重新应用像素化参数（防止被尺寸调整重置） ★★★ */
      if (this._currentStyle === 'pixel') {
        this._applyPixelStyleSettings();
      }
  
      if (this._currentStyle && this._currentStyle !== 'default') {
        if (!this._styleApplyPending) {
          this._styleApplyPending = true;
          const self = this;
          setTimeout(() => {
            self._styleApplyPending = false;
            try {
              if (self.structureGroup) self.structureGroup.traverse(o => self._applyStyleToMesh(o, self._currentStyle));
              if (self.furnitureGroup) self.furnitureGroup.traverse(o => self._applyStyleToMesh(o, self._currentStyle));
            } catch (e) {}
          }, 30);
        }
      }
      return r;
    };
  
    const _origInit = app.init;
    app.init = async function () {
      const r = await _origInit.call(this);
      [1200, 2200, 3500].forEach(delay => {
        setTimeout(() => { try { this._restoreStyleAndShadowFromStorage(); } catch (e) {} }, delay);
      });
      return r;
    };
  
    const _origDeserialize = app.saveSystem.deserializeScene;
    if (typeof _origDeserialize === 'function') {
      app.saveSystem.deserializeScene = async function (data) {
        const r = await _origDeserialize.call(this, data);
        setTimeout(() => { try { app._restoreStyleAndShadowFromStorage(); } catch (e) {} }, 400);
        return r;
      };
    }
  
    const _origTogglePlayMode = app.togglePlayMode;
    if (typeof _origTogglePlayMode === 'function') {
      app.togglePlayMode = function (enter) {
        const r = _origTogglePlayMode.call(this, enter);
        const enforceStyleState = () => {
          try {
            /* ★★★ 像素风格：演示模式切换后重新应用像素化参数 ★★★ */
            if (this._currentStyle === 'pixel') {
              this._applyPixelStyleSettings();
            }
  
            if (this.renderer && this.renderer.shadowMap) {
              this.renderer.shadowMap.enabled = this.showShadow !== false;
              if (this.showShadow === false) {
                if (typeof this._enforceShadowOff === 'function') this._enforceShadowOff();
              } else {
                this._enhanceShadowSetup && this._enhanceShadowSetup();
                this._updateLampShadows && this._updateLampShadows();
              }
            }
            if (this._currentStyle && this._currentStyle !== 'default') {
              if (this.structureGroup) this.structureGroup.traverse(o => this._applyStyleToMesh(o, this._currentStyle));
              if (this.furnitureGroup) this.furnitureGroup.traverse(o => this._applyStyleToMesh(o, this._currentStyle));
            }
            this._refreshShadowUI && this._refreshShadowUI();
            this._refreshStyleUI && this._refreshStyleUI();
          } catch (e) {}
        };
        [80, 200, 400, 700, 1000, 1500, 2200, 3000].forEach(delay => setTimeout(enforceStyleState, delay));
        return r;
      };
    }
  
    app._restoreStyleAndShadowFromStorage = function () {
      try {
        const savedShadow = localStorage.getItem('showShadow');
        if (savedShadow !== null) {
          const show = savedShadow === '1';
          if (this.showShadow !== show) {
            this.showShadow = show;
            if (this.renderer && this.renderer.shadowMap) this.renderer.shadowMap.enabled = show;
            if (show) {
              try { this._enhanceShadowSetup && this._enhanceShadowSetup(); } catch (e) {}
              try { this._updateLampShadows && this._updateLampShadows(); } catch (e) {}
            } else {
              if (typeof this._enforceShadowOff === 'function') this._enforceShadowOff();
            }
          }
        }
      } catch (e) {}
  
      try {
        const savedStyle = localStorage.getItem('modelStyle');
        if (savedStyle && STYLE_ORDER.indexOf(savedStyle) >= 0) {
          if (this._currentStyle !== savedStyle) {
            this.setModelStyle(savedStyle);
          }
        }
      } catch (e) {}
  
      this._refreshShadowUI && this._refreshShadowUI();
      this._refreshStyleUI && this._refreshStyleUI();
    };
  
    /* ======================================================================
     * 十三、控制台快速 API
     * ====================================================================== */
    app.lowPerfMode = function () {
      try {
        this.setModelShadow(false);
        this.setModelStyle('pixel');
        // 低性能模式使用较低分辨率（更流畅）
        this._pixelStyleRatio = 0.20;
        if (this._currentStyle === 'pixel') this._applyPixelStyleSettings();
        if (typeof this.setShadowQuality === 'function') {
          this.setShadowQuality('off');
        }
        this.saveSystem.showToast('⚡ 已启用低性能模式 (像素风+无阴影)');
      } catch (e) {
        console.warn('[LowPerf] 应用失败:', e);
      }
    };
  
    console.info('╔══════════════════════════════════════════════════════════╗');
    console.info('║  [ModelStyle v5] 模型风格化 + 渲染阴影 【像素风优化】    ║');
    console.info('║  ✓ 修复像素风过度模糊：默认比例 0.28（清晰且保留像素感）  ║');
    console.info('║  ✓ 新增像素参数集中配置区，一处修改全局生效                ║');
    console.info('║  ✓ 控制台: app.setPixelStyleRatio(0.35) 调清晰度          ║');
    console.info('║  ✓ 控制台: app.setPixelHardEdge(false)  关硬边缘像素化    ║');
    console.info('║  ✓ 动漫风格：4级阶梯渐变 + 高饱和 + 自发光                ║');
    console.info('╚══════════════════════════════════════════════════════════╝');
  
  })();
/* ============================================================================
 * ★★★ 移动端侧边栏触摸滚动修复 V2（JS 手动滚动版）★★★
 *
 * 【为什么 V1 CSS 方案失败】
 *   Android WebView 中，`.sidebar` 上的 position:fixed + will-change:transform
 *   + transition:transform 三者组合会创建独立合成层，导致原生 touchmove 滚动
 *   事件被合成层吞掉，无论怎么设置 touch-action / overflow 都无法恢复。
 *
 * 【V2 核心策略 —— 用 JS 手动接管滚动】
 *   1. 在 touchstart / touchmove / touchend 中手动计算位移，直接写 sidebar.scrollTop
 *   2. touchmove 上 preventDefault，彻底摆脱原生滚动失效的困扰
 *   3. 加入动量（惯性）滚动，模拟原生顺滑手感
 *   4. 自动跳过 input/select/textarea/button/滑块等需要原生触摸的元素
 *   5. 通过 MutationObserver 自动清除 will-change，避免合成层阻塞
 *   6. 覆盖 setupMobileUI / toggleMobileSidebar / init，全生命周期持续保证可用
 *
 * 【完全不影响】
 *   · 桌面端（仅 max-width:768px 生效）
 *   · 侧边栏内的所有按钮 / 输入框 / 滑块 / 下拉菜单
 *   · 侧边栏宽度拖拽手柄（移动端本已隐藏）
 *   · 其它所有业务功能
 * ============================================================================ */

(function installSidebarTouchScrollFixV2() {
    'use strict';
    if (typeof app === 'undefined' || !app) return;
    if (app.__sidebarTouchScrollFixV2Installed) return;
    app.__sidebarTouchScrollFixV2Installed = true;

    /* ======================================================================
     * 一、注入 CSS（作为基础保障 + 消除合成层）
     * ====================================================================== */
    (function injectStyles() {
        if (document.getElementById('sidebarTouchScrollStylesV2')) return;
        const s = document.createElement('style');
        s.id = 'sidebarTouchScrollStylesV2';
        s.textContent = `
        @media screen and (max-width: 768px) {
            /* ★ 侧栏本体：强制允许纵向滚动 + 关闭合成层 */
            .sidebar {
                touch-action: pan-y !important;
                -webkit-overflow-scrolling: auto !important;
                overscroll-behavior: contain !important;
                overflow-y: auto !important;
                overflow-x: hidden !important;
                will-change: auto !important;
                -webkit-backface-visibility: hidden;
                backface-visibility: hidden;
            }
            .sidebar.open {
                will-change: auto !important;
            }
            /* ★ 滑块：恢复横向独立触摸 */
            .sidebar input[type="range"] {
                touch-action: pan-x !important;
            }
            /* ★ 输入/选择类控件：保留文本编辑与原生触摸 */
            .sidebar input[type="text"],
            .sidebar input[type="number"],
            .sidebar input[type="password"],
            .sidebar input[type="email"],
            .sidebar input[type="search"],
            .sidebar input[type="color"],
            .sidebar input[type="file"],
            .sidebar textarea,
            .sidebar select {
                touch-action: manipulation !important;
                -webkit-user-select: text !important;
                user-select: text !important;
                -webkit-touch-callout: default !important;
            }
            /* ★ 拖拽中禁用过渡动画，保证 1:1 跟手 */
            .sidebar.sb-scrolling {
                transition: none !important;
            }
        }
        `;
        document.head.appendChild(s);
    })();

    /* ======================================================================
     * 二、工具：判断触摸目标是否需要原生触摸行为
     * ====================================================================== */
    app._isSidebarInteractiveTarget = function (el, root) {
        let node = el;
        while (node && node !== root && node.nodeType === 1) {
            const tag = node.tagName.toUpperCase();
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
            if (tag === 'BUTTON') return true;
            if (tag === 'A') return true;
            if (node.classList && (
                node.classList.contains('sidebar-resizer') ||
                node.classList.contains('resizer-plus') ||
                node.classList.contains('resizer-bar')
            )) return true;
            node = node.parentElement;
        }
        return false;
    };

    /* ======================================================================
     * 三、核心：为单个侧栏启用"JS 手动滚动"
     * ====================================================================== */
    app._setupSidebarManualScroll = function () {
        const ids = ['sidebarLeft', 'sidebarRight'];

        ids.forEach(id => {
            const sidebar = document.getElementById(id);
            if (!sidebar) return;
            if (sidebar.dataset.sbManualScrollV2 === '1') return;
            sidebar.dataset.sbManualScrollV2 = '1';

            /* ---------- ① 内联兜底样式（即使外部 CSS 未生效也能工作） ---------- */
            try {
                sidebar.style.setProperty('touch-action', 'pan-y', 'important');
                sidebar.style.setProperty('overflow-y', 'auto', 'important');
                sidebar.style.setProperty('overflow-x', 'hidden', 'important');
                sidebar.style.setProperty('-webkit-overflow-scrolling', 'auto', 'important');
                sidebar.style.setProperty('overscroll-behavior', 'contain', 'important');
                sidebar.style.setProperty('will-change', 'auto', 'important');
            } catch (e) {}

            /* ---------- ② 触摸滚动状态 ---------- */
            let startY = 0;
            let startScrollTop = 0;
            let lastY = 0;
            let lastTime = 0;
            let velocity = 0;
            let isTouching = false;
            let skipNative = false;
            let momentumRAF = null;
            const BOUNDARY_DAMP = 0.35;  // 边界阻尼
            const FRICTION = 0.94;       // 惯性摩擦
            const MIN_VELOCITY = 0.6;    // 停止惯性阈值

            const cancelMomentum = () => {
                if (momentumRAF) {
                    cancelAnimationFrame(momentumRAF);
                    momentumRAF = null;
                }
            };

            const getMaxScroll = () =>
                Math.max(0, sidebar.scrollHeight - sidebar.clientHeight);

            /* ---------- ③ touchstart ---------- */
            const onTouchStart = (e) => {
                if (window.innerWidth > 768) return;
                if (e.touches.length !== 1) {
                    isTouching = false;
                    cancelMomentum();
                    return;
                }
                /* 命中 input/button/select 等原生控件 → 交给原生处理 */
                if (app._isSidebarInteractiveTarget(e.target, sidebar)) {
                    skipNative = true;
                    isTouching = false;
                    return;
                }
                skipNative = false;
                cancelMomentum();
                isTouching = true;
                startY = e.touches[0].clientY;
                lastY = startY;
                lastTime = Date.now();
                startScrollTop = sidebar.scrollTop;
                velocity = 0;

                /* 清除 will-change，避免合成层阻塞 */
                try {
                    sidebar.style.setProperty('will-change', 'auto', 'important');
                    sidebar.classList.add('sb-scrolling');
                } catch (err) {}
            };

            /* ---------- ④ touchmove（手动滚动核心） ---------- */
            const onTouchMove = (e) => {
                if (!isTouching || skipNative) return;
                if (e.touches.length !== 1) return;

                const y = e.touches[0].clientY;
                const now = Date.now();
                const dt = Math.max(1, now - lastTime);

                /* 速度计算（px / 帧@60fps） */
                velocity = (lastY - y) / dt * 16;

                lastY = y;
                lastTime = now;

                const dy = startY - y;
                const maxScroll = getMaxScroll();
                let newTop = startScrollTop + dy;

                /* 边界阻尼：拖出范围时手感更柔和 */
                if (newTop < 0) {
                    newTop = newTop * BOUNDARY_DAMP;
                } else if (newTop > maxScroll) {
                    newTop = maxScroll + (newTop - maxScroll) * BOUNDARY_DAMP;
                }

                sidebar.scrollTop = newTop;

                /* ★ 关键：阻止默认行为，彻底摆脱原生滚动失效的困扰 */
                if (e.cancelable) e.preventDefault();
            };

            /* ---------- ⑤ touchend（触发惯性） ---------- */
            const onTouchEnd = () => {
                if (!isTouching) {
                    skipNative = false;
                    return;
                }
                isTouching = false;
                try { sidebar.classList.remove('sb-scrolling'); } catch (err) {}

                /* 惯性滚动 */
                const applyMomentum = () => {
                    if (Math.abs(velocity) < MIN_VELOCITY) {
                        momentumRAF = null;
                        /* 回弹到有效范围 */
                        const maxScroll = getMaxScroll();
                        if (sidebar.scrollTop < 0) sidebar.scrollTop = 0;
                        else if (sidebar.scrollTop > maxScroll) sidebar.scrollTop = maxScroll;
                        return;
                    }

                    const maxScroll = getMaxScroll();
                    let newTop = sidebar.scrollTop + velocity;

                    if (newTop <= 0) {
                        newTop = 0;
                        velocity = 0;
                    } else if (newTop >= maxScroll) {
                        newTop = maxScroll;
                        velocity = 0;
                    }

                    sidebar.scrollTop = newTop;
                    velocity *= FRICTION;

                    if (Math.abs(velocity) >= MIN_VELOCITY) {
                        momentumRAF = requestAnimationFrame(applyMomentum);
                    } else {
                        momentumRAF = null;
                    }
                };
                applyMomentum();
                skipNative = false;
            };

            /* ---------- ⑥ touchcancel ---------- */
            const onTouchCancel = () => {
                isTouching = false;
                skipNative = false;
                cancelMomentum();
                try { sidebar.classList.remove('sb-scrolling'); } catch (err) {}
            };

            /* ---------- ⑦ 绑定事件 ---------- */
            sidebar.addEventListener('touchstart', onTouchStart, { passive: true });
            sidebar.addEventListener('touchmove', onTouchMove, { passive: false });
            sidebar.addEventListener('touchend', onTouchEnd, { passive: true });
            sidebar.addEventListener('touchcancel', onTouchCancel, { passive: true });

            /* ---------- ⑧ 监听 open 类变化，自动复位 will-change ---------- */
            if (window.MutationObserver) {
                try {
                    const obs = new MutationObserver(function (muts) {
                        muts.forEach(function (m) {
                            if (m.attributeName !== 'class') return;
                            if (sidebar.classList.contains('open')) {
                                /* 过渡动画 280ms 结束后再清除 will-change */
                                setTimeout(function () {
                                    try {
                                        sidebar.style.setProperty('will-change', 'auto', 'important');
                                    } catch (err) {}
                                }, 320);
                            } else {
                                try { sidebar.style.removeProperty('will-change'); } catch (err) {}
                            }
                        });
                    });
                    obs.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
                    sidebar._sbClassObserverV2 = obs;
                } catch (e) {}
            }
        });
    };

    /* ======================================================================
     * 四、覆盖关键生命周期方法
     * ====================================================================== */

    /* ---- ① setupMobileUI：原逻辑 + 手动滚动初始化 ---- */
    const _origSetupMobileUI = app.setupMobileUI;
    app.setupMobileUI = function () {
        if (typeof _origSetupMobileUI === 'function') {
            try { _origSetupMobileUI.call(this); } catch (e) {
                console.warn('[SidebarScrollV2] setupMobileUI 原逻辑异常:', e);
            }
        }
        try { this._setupSidebarManualScroll(); } catch (e) {
            console.warn('[SidebarScrollV2] 手动滚动初始化失败:', e);
        }
    };

    /* ---- ② toggleMobileSidebar：切换后再次同步 ---- */
    const _origToggleMobileSidebar = app.toggleMobileSidebar;
    app.toggleMobileSidebar = function (side) {
        if (typeof _origToggleMobileSidebar === 'function') {
            _origToggleMobileSidebar.call(this, side);
        }
        setTimeout(() => {
            try { this._setupSidebarManualScroll(); } catch (e) {}
        }, 80);
    };

    /* ---- ③ closeMobileSidebars：关闭时复位状态 ---- */
    const _origCloseMobileSidebars = app.closeMobileSidebars;
    app.closeMobileSidebars = function () {
        if (typeof _origCloseMobileSidebars === 'function') {
            _origCloseMobileSidebars.call(this);
        }
        ['sidebarLeft', 'sidebarRight'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            try { el.style.removeProperty('will-change'); } catch (e) {}
            el.classList.remove('sb-scrolling');
        });
    };

    /* ---- ④ init：启动后多次延迟应用，覆盖数据库恢复场景 ---- */
    const _origInit = app.init;
    app.init = async function () {
        const r = await _origInit.call(this);
        [200, 500, 1000, 2000, 3500, 5000].forEach(d => {
            setTimeout(() => {
                try { this._setupSidebarManualScroll(); } catch (e) {}
            }, d);
        });
        return r;
    };

    /* ======================================================================
     * 五、窗口尺寸 / 方向变化：重新应用
     * ====================================================================== */
    window.addEventListener('resize', () => {
        if (app._sbScrollResizeTimer) clearTimeout(app._sbScrollResizeTimer);
        app._sbScrollResizeTimer = setTimeout(() => {
            try { app._setupSidebarManualScroll(); } catch (e) {}
        }, 150);
    });

    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            try { app._setupSidebarManualScroll(); } catch (e) {}
        }, 400);
    });

    /* ======================================================================
     * 六、对外 API：手动修复 / 诊断
     * ====================================================================== */
    app.fixSidebarScroll = function () {
        this._setupSidebarManualScroll();
        ['sidebarLeft', 'sidebarRight'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            try { el.style.setProperty('will-change', 'auto', 'important'); } catch (e) {}
        });
        this.saveSystem.showToast('🔧 侧边栏触摸滚动已修复 (V2 手动滚动)');
    };

    app.diagnoseSidebarScroll = function () {
        const result = [];
        ['sidebarLeft', 'sidebarRight'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) { result.push({ id: id, error: '未找到' }); return; }
            const cs = window.getComputedStyle(el);
            result.push({
                id: id,
                open: el.classList.contains('open'),
                scrollHeight: el.scrollHeight,
                clientHeight: el.clientHeight,
                scrollTop: el.scrollTop,
                canScroll: el.scrollHeight > el.clientHeight,
                overflowY: cs.overflowY,
                touchAction: cs.touchAction,
                willChange: cs.willChange,
                inlineWillChange: el.style.getPropertyValue('will-change') || '(未设置)',
                position: cs.position,
                webkitOverflowScrolling: cs.webkitOverflowScrolling,
                manualScrollBound: el.dataset.sbManualScrollV2 === '1'
            });
        });
        console.table(result);
        return result;
    };

    /* ======================================================================
     * 七、启动横幅
     * ====================================================================== */
    console.info('╔══════════════════════════════════════════════════════════╗');
    console.info('║  [SidebarTouchScroll V2] JS 手动滚动版已启用             ║');
    console.info('║  ✓ 手动接管 touchmove，直接写 scrollTop                  ║');
    console.info('║  ✓ 带惯性动量滚动，模拟原生顺滑手感                      ║');
    console.info('║  ✓ 自动跳过 input/button/select/滑块等原生控件           ║');
    console.info('║  ✓ 自动清除 will-change，避免合成层阻塞                  ║');
    console.info('║  ✓ 控制台: app.fixSidebarScroll() / diagnoseSidebarScroll() ║');
    console.info('╚══════════════════════════════════════════════════════════╝');

})();
/* ============================================================================
 * ★★★ 资源加载与纹理应用修复 v3（完全独立整合版）★★★
 *
 * 整合三大资源加载器 + 纹理应用修复 + 房间纹理选择器：
 *   ① 模型库  — img/models.json   + 目录扫描（_www/_doc/_downloads/img）
 *   ② 纹理库  — img/textures.json + 目录扫描
 *   ③ 天空库  — img/sky.json      + 目录扫描
 *
 * 同时修复：
 *   ✓ 纹理应用 "failed to fetch"        → <img src> 优先，XHR 兜底
 *   ✓ _scanImgLibrary is not a function → 强制独立实现
 *   ✓ 主画布房间面板 / 户型编辑窗口房间面板 → 新增「🖼️ 从img库选择贴图」
 *
 * 完全独立，不依赖 AppDirScanner V3 / 任何其它补丁
 * ============================================================================ */
(function installAssetLoaderAndTextureFixV3() {
    'use strict';
    if (typeof app === 'undefined' || !app) return;
    if (app.__assetLoaderAndTextureFixV3Installed) return;
    app.__assetLoaderAndTextureFixV3Installed = true;

    /* ======================================================================
     * 一、常量
     * ====================================================================== */
    const IMG_RE = /\.(jpe?g|png|webp|gif|bmp|avif)$/i;
    const GLB_RE = /\.(glb|gltf|fbx)$/i;
    const HDR_RE = /\.(hdr|exr)$/i;
    const SKY_RE = /\.(hdr|exr|jpe?g|png|webp|gif|bmp|avif)$/i;

    const DIR_CANDIDATES = [
        '_www/img/', '_www/img',
        '_www/static/img/', '_www/static/img',
        '_doc/img/', '_doc/img',
        '_downloads/img/', '_downloads/img',
        'img/', 'img'
    ];

    const MANIFEST_DIRS = ['img/', './img/', '_www/img/', '/img/'];

    /* ======================================================================
     * 二、通用工具函数
     * ====================================================================== */

    /* ---------- 2.1 mime ---------- */
    if (typeof app._mimeFromName !== 'function') {
        app._mimeFromName = function (name) {
            const m = String(name || '').toLowerCase().match(/\.([a-z0-9]+)$/);
            if (!m) return 'image/jpeg';
            const map = {
                'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
                'png': 'image/png', 'webp': 'image/webp',
                'gif': 'image/gif', 'bmp': 'image/bmp', 'avif': 'image/avif'
            };
            return map[m[1]] || 'image/jpeg';
        };
    }

    /* ---------- 2.2 base64 → Image ---------- */
    app._b64ToImg = function (base64, fileName) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('图片解码失败'));
            img.src = 'data:' + app._mimeFromName(fileName) + ';base64,' + base64;
        });
    };

    /* ---------- 2.3 src → Image ---------- */
    app._srcToImg = function (src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            if (/^https?:/i.test(src)) img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('图片加载失败: ' + src));
            img.src = src;
        });
    };

    /* ---------- 2.4 XHR → ArrayBuffer（禁用 fetch） ---------- */
    app._xhrArrayBuffer = function (url) {
        return new Promise((resolve, reject) => {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.responseType = 'arraybuffer';
                xhr.timeout = 15000;
                xhr.onload = () => {
                    if ((xhr.status === 200 || xhr.status === 0) &&
                        xhr.response && xhr.response.byteLength > 0) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error('HTTP ' + xhr.status));
                    }
                };
                xhr.onerror = () => reject(new Error('网络错误'));
                xhr.ontimeout = () => reject(new Error('请求超时'));
                xhr.send();
            } catch (e) { reject(e); }
        });
    };

    /* ---------- 2.5 plus FileEntry → base64 ---------- */
    if (typeof app._readEntryAsBase64 !== 'function') {
        app._readEntryAsBase64 = function (entry) {
            return new Promise((resolve, reject) => {
                if (!entry) { reject(new Error('无效文件')); return; }
                try {
                    entry.file(function (file) {
                        try {
                            const FR = window.plus.io.FileReader;
                            const fr = new FR();
                            fr.onloadend = function (evt) {
                                try {
                                    let r = evt.target.result || '';
                                    const ci = r.indexOf('base64,');
                                    const b64 = ci >= 0 ? r.substring(ci + 7) : r;
                                    if (b64 && b64.length > 10) resolve(b64);
                                    else reject(new Error('空内容'));
                                } catch (e) { reject(e); }
                            };
                            fr.onerror = function () { reject(new Error('读取失败')); };
                            fr.readAsDataURL(file);
                        } catch (e) { reject(e); }
                    }, function (err) { reject(err || new Error('获取文件失败')); });
                } catch (e) { reject(e); }
            });
        };
    }

    /* ---------- 2.6 plus FileEntry → localURL ---------- */
    if (typeof app._getEntryLocalURL !== 'function') {
        app._getEntryLocalURL = function (entry) {
            if (!entry) return '';
            try {
                if (typeof entry.toLocalURL === 'function') {
                    const u = entry.toLocalURL();
                    if (u) return u;
                }
            } catch (e) {}
            try {
                if (entry.fullPath && window.plus && window.plus.io) {
                    return window.plus.io.convertLocalFileSystemURL(entry.fullPath);
                }
            } catch (e) {}
            return '';
        };
    }

    /* ---------- 2.7 目录递归扫描 ---------- */
    if (typeof app._scanDirRecursive !== 'function') {
        app._scanDirRecursive = function (dirPath, filterFn, maxDepth) {
            return new Promise((resolve) => {
                if (!window.plus || !window.plus.io) { resolve([]); return; }
                if (!dirPath) { resolve([]); return; }

                const results = [];
                const seen = new Set();
                let finished = false;
                const timeoutId = setTimeout(() => finish(), 8000);

                function finish() {
                    if (finished) return;
                    finished = true;
                    clearTimeout(timeoutId);
                    resolve(results);
                }

                function scanDir(dirEntry, depth, callback) {
                    if (finished) { callback(); return; }
                    if (depth > (maxDepth || 1)) { callback(); return; }

                    let reader;
                    try { reader = dirEntry.createReader(); }
                    catch (e) { callback(); return; }

                    const all = [];
                    function readBatch() {
                        if (finished) { callback(); return; }
                        try {
                            reader.readEntries(function (entries) {
                                if (finished) { callback(); return; }
                                if (!entries || entries.length === 0) {
                                    processAll(all, callback);
                                } else {
                                    for (let i = 0; i < entries.length; i++) all.push(entries[i]);
                                    readBatch();
                                }
                            }, function () { callback(); });
                        } catch (e) { callback(); }
                    }

                    function processAll(entries, done) {
                        const subDirs = [];
                        const matched = [];

                        for (let i = 0; i < entries.length; i++) {
                            const e = entries[i];
                            if (!e) continue;
                            if (e.isFile) {
                                if (!filterFn || filterFn(e.name)) {
                                    const key = String(e.name || '').toLowerCase();
                                    if (!seen.has(key)) {
                                        seen.add(key);
                                        matched.push(e);
                                    }
                                }
                            } else if (e.isDirectory && depth < (maxDepth || 1)) {
                                const n = String(e.name || '').toLowerCase();
                                if (n === 'node_modules' || n === '.git' ||
                                    n === 'icons' || n === 'thumbnails' ||
                                    n === 'js' || n === 'css' || n === 'lib') continue;
                                subDirs.push(e);
                            }
                        }

                        for (let j = 0; j < matched.length; j++) results.push(matched[j]);

                        if (subDirs.length === 0) { done(); return; }

                        let idx = 0;
                        (function next() {
                            if (finished || idx >= subDirs.length) { done(); return; }
                            scanDir(subDirs[idx++], depth + 1, next);
                        })();
                    }

                    readBatch();
                }

                try {
                    window.plus.io.resolveLocalFileSystemURL(
                        dirPath,
                        function (dirEntry) {
                            if (finished) return;
                            scanDir(dirEntry, 0, finish);
                        },
                        function () { finish(); }
                    );
                } catch (e) { finish(); }
            });
        };
    }

    /* ---------- 2.8 扫描所有候选目录 ---------- */
    if (typeof app._scanAllCandidateDirs !== 'function') {
        app._scanAllCandidateDirs = async function (filterFn, maxDepth) {
            const allEntries = [];
            const seenNames = new Set();

            for (let i = 0; i < DIR_CANDIDATES.length; i++) {
                const dir = DIR_CANDIDATES[i];
                try {
                    const entries = await this._scanDirRecursive(dir, filterFn, maxDepth);
                    for (let j = 0; j < entries.length; j++) {
                        const e = entries[j];
                        const key = String(e.name || '').toLowerCase();
                        if (seenNames.has(key)) continue;
                        seenNames.add(key);
                        allEntries.push(e);
                    }
                } catch (e) {}
            }
            return allEntries;
        };
    }

    /* ---------- 2.9 尝试加载清单（多路径） ---------- */
    if (typeof app._tryLoadManifest !== 'function') {
        app._tryLoadManifest = async function (fileName) {
            for (let i = 0; i < MANIFEST_DIRS.length; i++) {
                const url = MANIFEST_DIRS[i] + fileName;
                try {
                    const txt = await this._localFetch(url, true);
                    if (!txt) continue;
                    const t = txt.trim();
                    if (t.length < 2 || (t[0] !== '{' && t[0] !== '[')) continue;
                    const json = JSON.parse(t);
                    const base = url.substring(0, url.lastIndexOf('/') + 1);
                    return { json: json, base: base, url: url };
                } catch (e) { continue; }
            }
            return null;
        };
    }

    /* ======================================================================
     * 三、★ 模型库（models.json）
     * ====================================================================== */

    /* ---------- 3.1 解析 models.json ---------- */
    app._parseModelManifest = function (json) {
        const list = [];
        const push = (it) => {
            if (typeof it === 'string') {
                const f = it.trim();
                if (GLB_RE.test(f)) list.push({ name: f.replace(/\.[^.]+$/, ''), file: f });
            } else if (it && typeof it === 'object') {
                const f = it.file || it.fileName || it.filename || it.path || it.url;
                if (f && GLB_RE.test(String(f))) {
                    list.push({
                        name: it.name || it.title ||
                            String(f).replace(/.*\//, '').replace(/\.[^.]+$/, ''),
                        file: String(f)
                    });
                }
            }
        };
        if (Array.isArray(json)) json.forEach(push);
        else if (json && typeof json === 'object') {
            const arr = json.models || json.list || json.files || json.items || json.data;
            if (Array.isArray(arr)) arr.forEach(push);
            else Object.keys(json).forEach(k => {
                const v = json[k];
                if (typeof v === 'string' && GLB_RE.test(v)) push({ name: k, file: v });
            });
        }
        const seen = new Set();
        return list.filter(it => {
            const k = String(it.file).toLowerCase();
            if (seen.has(k)) return false;
            seen.add(k);
            return GLB_RE.test(it.file);
        });
    };

    /* ---------- 3.2 扫描所有目录的 GLB ---------- */
    app._scanGLBFromAllDirs = async function () {
        const entries = await this._scanAllCandidateDirs(
            function (name) { return GLB_RE.test(name); }, 2
        );
        if (entries.length === 0) return 0;

        const hint = (t) => { try { this.glbLibrary._hint(t); } catch (e) {} };
        let loaded = 0;
        const total = entries.length;

        for (let i = 0; i < entries.length; i++) {
            const fe = entries[i];
            if (this.glbLibrary.models.some(m => m.fileName === fe.name)) continue;
            try {
                hint('📦 读取模型 ' + (i + 1) + '/' + total + ': ' + fe.name);
                const b64 = await this._readEntryAsBase64(fe);
                if (b64 && b64.length > 10) {
                    const baseName = String(fe.name).replace(/\.[^.]+$/, '');
                    await this.glbLibrary.addModel(baseName, b64, fe.name);
                    loaded++;
                }
            } catch (e) { console.warn('模型读取失败:', fe.name, e); }
        }
        try { this.glbLibrary.renderUI(); } catch (e) {}
        return loaded;
    };

    /* ---------- 3.3 autoLoadGLBLibrary（模型库主入口） ---------- */
    app.autoLoadGLBLibrary = async function (force) {
        if (this._glbAutoLoadStarted && !force) return;
        this._glbAutoLoadStarted = true;

        const hint = (t) => { try { this.glbLibrary._hint(t); } catch (e) {} };
        hint('🔍 正在扫描 img 目录模型...');

        /* ---- 策略①：img/models.json 清单 ---- */
        try {
            const mf = await this._tryLoadManifest('models.json');
            if (mf) {
                const list = this._parseModelManifest(mf.json);
                console.log('[ModelLib] 发现 models.json (' + mf.url + '): ' + list.length + ' 个模型');
                if (list.length > 0) {
                    let n = 0;
                    for (let i = 0; i < list.length; i++) {
                        const item = list[i];
                        if (this.glbLibrary.models.some(m => m.fileName === item.file)) continue;
                        try {
                            hint('📦 读取模型 ' + (i + 1) + '/' + list.length + ': ' + item.file);
                            const buf = await this._xhrArrayBuffer(mf.base + item.file);
                            const b64 = this.arrayBufferToBase64(buf);
                            if (b64 && b64.length > 10) {
                                await this.glbLibrary.addModel(item.name, b64, item.file);
                                n++;
                            }
                        } catch (e) { console.warn('[ModelLib] 读取失败:', item.file, e); }
                    }
                    if (n > 0) {
                        console.log('[ModelLib] models.json 加载完成: ' + n + ' 个');
                        this._glbLoadSuccess(n);
                        return;
                    }
                }
            }
        } catch (e) { console.warn('[ModelLib] models.json 加载失败:', e); }

        /* ---- 策略②：plus 目录扫描 ---- */
        if (window.plus && window.plus.io) {
            try {
                hint('🔍 正在扫描 _www/_doc/_downloads/img 模型...');
                const n2 = await this._scanGLBFromAllDirs();
                if (n2 > 0) {
                    this._glbLoadSuccess(n2);
                    return;
                }
            } catch (e) { console.warn('[ModelLib] 目录扫描失败:', e); }
        }

        /* ---- 策略③：延迟重试 ---- */
        setTimeout(async () => {
            if (this._glbLoadDone) return;
            let n = 0;

            try {
                const mf = await this._tryLoadManifest('models.json');
                if (mf) {
                    const list = this._parseModelManifest(mf.json);
                    for (let i = 0; i < list.length; i++) {
                        const item = list[i];
                        if (this.glbLibrary.models.some(m => m.fileName === item.file)) continue;
                        try {
                            const buf = await this._xhrArrayBuffer(mf.base + item.file);
                            const b64 = this.arrayBufferToBase64(buf);
                            if (b64) {
                                await this.glbLibrary.addModel(item.name, b64, item.file);
                                n++;
                            }
                        } catch (e) {}
                    }
                }
            } catch (e) {}

            if (window.plus && window.plus.io && n === 0) {
                try { n += await this._scanGLBFromAllDirs(); } catch (e) {}
            }

            if (n > 0) { this._glbLoadSuccess(n); return; }

            if (this.glbLibrary.models.length === 0) {
                const hasPlus = !!(window.plus && window.plus.io);
                hint(hasPlus ?
                    '❌ img 目录未发现模型\n\n' +
                    '请确保:\n' +
                    '① 项目根目录有 img/ 文件夹\n' +
                    '② 里面放有 .glb/.gltf/.fbx 文件\n' +
                    '③ 或创建 img/models.json: {"models":[{"name":"灯","file":"lamp.glb"}]}\n' +
                    '④ 重新打包 APK 安装\n\n' +
                    '控制台: app.diagnoseAssetDirs() 查看目录状态' :
                    '🌐 浏览器环境: 请通过本地HTTP服务器访问');
            }
        }, 4000);
    };

    /* ---------- 3.4 _glbLoadSuccess / _glbLoadDone 兜底（若原代码缺失） ---------- */
    if (typeof app._glbLoadSuccess !== 'function') {
        app._glbLoadSuccess = function (n) {
            this._glbLoadDone = true;
            const btn = document.getElementById('glbFolderBtn');
            if (btn && window.plus) btn.style.display = 'none';
            try { this.glbLibrary.renderUI(); } catch (e) {}
            try { this.saveSystem.showToast('📦 已自动加载 ' + n + ' 个模型'); } catch (e) {}
            this._glbRetryCount = 0;
            setTimeout(() => {
                try { this._retryPendingGLBRestores(); } catch (e) {}
            }, 500);
        };
    }

    /* ======================================================================
     * 四、★ 纹理库（textures.json）
     * ====================================================================== */

    /* ---------- 4.1 解析 textures.json ---------- */
    app._parseImgManifest = function (json) {
        const list = [];
        const push = (it) => {
            if (typeof it === 'string') {
                const f = it.trim();
                if (IMG_RE.test(f)) list.push({
                    name: f.replace(/\.[^.]+$/, ''),
                    file: f
                });
            } else if (it && typeof it === 'object') {
                const f = it.file || it.fileName || it.filename || it.path || it.url;
                if (f && IMG_RE.test(String(f))) {
                    list.push({
                        name: it.name || it.title ||
                            String(f).replace(/.*\//, '').replace(/\.[^.]+$/, ''),
                        file: String(f)
                    });
                }
            }
        };
        if (Array.isArray(json)) json.forEach(push);
        else if (json && typeof json === 'object') {
            const arr = json.textures || json.images || json.list ||
                        json.files || json.items || json.data;
            if (Array.isArray(arr)) arr.forEach(push);
            else Object.keys(json).forEach(k => {
                const v = json[k];
                if (typeof v === 'string' && IMG_RE.test(v)) push({ name: k, file: v });
                else if (typeof v === 'string' && IMG_RE.test(k)) push({ name: v, file: k });
            });
        }
        const seen = new Set();
        return list.filter(it => {
            const k = String(it.file).toLowerCase();
            if (seen.has(k)) return false;
            seen.add(k);
            return IMG_RE.test(it.file);
        });
    };

    /* ---------- 4.2 扫描纹理库（强制重写，独立实现） ---------- */
    app._imgLibCache = app._imgLibCache || {
        items: [], scanned: false, scanning: false, lastScanTime: 0
    };

    app._scanImgLibrary = async function (force) {
        if (this._imgLibCache.scanning) return this._imgLibCache.items;
        if (!force && this._imgLibCache.scanned &&
            (Date.now() - this._imgLibCache.lastScanTime) < 5 * 60 * 1000) {
            return this._imgLibCache.items;
        }

        this._imgLibCache.scanning = true;
        const items = [];
        const seen = new Set();

        /* ---- ① img/textures.json 清单 ---- */
        try {
            const mf = await this._tryLoadManifest('textures.json');
            if (mf) {
                const list = this._parseImgManifest(mf.json);
                console.log('[ImgPicker] 发现 textures.json (' + mf.url + '): ' + list.length + ' 张图片');
                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    const key = String(item.file).toLowerCase();
                    if (seen.has(key)) continue;
                    seen.add(key);
                    items.push({
                        name: item.name,
                        fileName: item.file,
                        localURL: mf.base + item.file,
                        url: mf.base + item.file,
                        base64: null,
                        source: 'manifest'
                    });
                }
            }
        } catch (e) {
            console.warn('[ImgPicker] textures.json 加载失败:', e);
        }

        /* ---- ② plus 目录扫描 ---- */
        if (window.plus && window.plus.io) {
            try {
                const entries = await this._scanAllCandidateDirs(
                    function (name) { return IMG_RE.test(name); }, 2
                );
                console.log('[ImgPicker] 目录扫描发现: ' + entries.length + ' 张图片');
                for (let i = 0; i < entries.length; i++) {
                    const fe = entries[i];
                    const key = String(fe.name).toLowerCase();
                    if (seen.has(key)) continue;
                    seen.add(key);
                    items.push({
                        name: String(fe.name).replace(/\.[^.]+$/, ''),
                        fileName: fe.name,
                        localURL: this._getEntryLocalURL(fe),
                        entry: fe,
                        base64: null,
                        source: 'plus'
                    });
                }
            } catch (e) {
                console.warn('[ImgPicker] 目录扫描失败:', e);
            }
        }

        this._imgLibCache.items = items;
        this._imgLibCache.scanned = true;
        this._imgLibCache.scanning = false;
        this._imgLibCache.lastScanTime = Date.now();
        console.log('[ImgPicker] 纹理库共 ' + items.length + ' 张图片');
        return items;
    };

    /* ---------- 4.3 加载单张图片（多策略，解决 failed to fetch） ---------- */
    app._loadItemImage = async function (item) {
        if (!item) throw new Error('无效图片项');
        const fileName = item.fileName || item.name || 'image.png';

        /* ① 缓存 base64 */
        if (item.base64 && item.base64.length > 10) {
            try {
                return await this._b64ToImg(item.base64, fileName);
            } catch (e) {
                console.warn('[ImgPicker] 缓存 base64 解码失败，尝试其它方式:', e);
                item.base64 = null;
            }
        }

        /* ② 优先 localURL / url <img src> 加载 */
        const src = item.localURL || item.url;
        if (src) {
            try {
                return await this._srcToImg(src);
            } catch (e) {
                console.warn('[ImgPicker] src 直载失败，尝试 FileEntry:', e);
            }
        }

        /* ③ plus FileEntry → base64 */
        if (item.entry && window.plus && window.plus.io) {
            try {
                const b64 = await this._readEntryAsBase64(item.entry);
                if (b64 && b64.length > 10) {
                    item.base64 = b64;
                    return await this._b64ToImg(b64, fileName);
                }
            } catch (e) {
                console.warn('[ImgPicker] FileEntry 读取失败:', e);
            }
        }

        /* ④ XHR 兜底 */
        if (item.url) {
            try {
                const ab = await this._xhrArrayBuffer(item.url);
                const b64 = this.arrayBufferToBase64(ab);
                item.base64 = b64;
                return await this._b64ToImg(b64, fileName);
            } catch (e) {
                throw new Error('图片加载失败: ' + (e.message || e));
            }
        }

        throw new Error('无法读取图片数据');
    };

    /* ---------- 4.4 应用地板贴图 ---------- */
    app._applyFloorTextureFromItem = async function (item) {
        try {
            this.saveSystem.showToast('⏳ 正在加载纹理...');
            const img = await this._loadItemImage(item);
            const t = new THREE.CanvasTexture(img);
            t.image = img;
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(this.floorTextureScale, this.floorTextureScale);
            t.encoding = THREE.sRGBEncoding;
            t.needsUpdate = true;

            this.floorTextures[this.currentFloor] = t;
            this.generate3D();

            this.saveSystem.showToast('✅ 地板纹理 "' + item.fileName + '" 已应用');
            try { this.saveSystem.saveToDB(true); } catch (e) {}
            return true;
        } catch (e) {
            console.error('[ImgPicker] 应用失败:', e);
            this.saveSystem.showToast('❌ 应用失败: ' + (e.message || e));
            return false;
        }
    };

    /* ---------- 4.5 楼层纹理选择器 ---------- */
    app._showFloorTexturePicker = async function () {
        const self = this;
        const old = document.getElementById('floorTexPickerModal');
        if (old) { try { old.remove(); } catch (e) {} }

        const modal = document.createElement('div');
        modal.id = 'floorTexPickerModal';
        modal.style.cssText =
            'position:fixed;top:0;left:0;width:100%;height:100%;' +
            'background:rgba(0,0,0,0.78);z-index:1400;' +
            'display:flex;align-items:center;justify-content:center;' +
            'padding:16px;box-sizing:border-box;';

        const card = document.createElement('div');
        card.style.cssText =
            'background:#1e1e28;border:1px solid rgba(76,201,240,0.4);' +
            'border-radius:14px;width:100%;max-width:560px;' +
            'max-height:88vh;display:flex;flex-direction:column;' +
            'overflow:hidden;box-sizing:border-box;';

        card.innerHTML =
            '<div style="display:flex;align-items:center;justify-content:space-between;' +
                'padding:12px 14px;background:rgba(76,201,240,0.1);' +
                'border-bottom:1px solid rgba(255,255,255,0.08);flex-shrink:0;">' +
                '<div style="font-size:0.9rem;color:#4cc9f0;font-weight:700;">' +
                    '🖼️ 从 img 目录选择地板纹理</div>' +
                '<div style="display:flex;gap:8px;align-items:center;">' +
                    '<span id="floorTexRefresh" style="cursor:pointer;font-size:0.75rem;color:#aaa;' +
                        'padding:4px 8px;border:1px solid #444;border-radius:6px;user-select:none;">🔄 刷新</span>' +
                    '<span id="floorTexClose" style="cursor:pointer;font-size:1.2rem;color:#aaa;' +
                        'padding:0 6px;user-select:none;">✕</span>' +
                '</div>' +
            '</div>' +
            '<div id="floorTexStatus" style="padding:8px 14px;font-size:0.68rem;color:#888;' +
                'border-bottom:1px solid rgba(255,255,255,0.05);flex-shrink:0;">' +
                '🔍 正在扫描 img 目录...' +
            '</div>' +
            '<div id="floorTexGrid" style="display:grid;' +
                'grid-template-columns:repeat(auto-fill,minmax(96px,1fr));' +
                'gap:8px;padding:10px;overflow-y:auto;flex:1 1 auto;' +
                'min-height:120px;max-height:60vh;touch-action:pan-y;' +
                '-webkit-overflow-scrolling:touch;"></div>' +
            '<div style="display:flex;gap:8px;padding:10px 14px;' +
                'background:#181822;border-top:1px solid rgba(255,255,255,0.08);flex-shrink:0;">' +
                '<button id="floorTexUpload" style="flex:2;min-height:38px;' +
                    'background:linear-gradient(135deg,#4361ee,#4cc9f0);color:#fff;' +
                    'border:none;border-radius:9px;font-size:0.78rem;cursor:pointer;font-weight:600;">' +
                    '📁 从本地文件上传</button>' +
                '<button id="floorTexCancel" style="flex:1;min-height:38px;background:#3a3a44;' +
                    'color:#ddd;border:none;border-radius:9px;font-size:0.78rem;cursor:pointer;">取消</button>' +
            '</div>';

        modal.appendChild(card);
        document.body.appendChild(modal);

        const grid = document.getElementById('floorTexGrid');
        const status = document.getElementById('floorTexStatus');

        modal.addEventListener('click', (e) => {
            if (e.target === modal) { try { modal.remove(); } catch (err) {} }
        });
        document.getElementById('floorTexClose').onclick = () => {
            try { modal.remove(); } catch (e) {}
        };
        document.getElementById('floorTexCancel').onclick = () => {
            try { modal.remove(); } catch (e) {}
        };
        document.getElementById('floorTexUpload').onclick = () => {
            try { modal.remove(); } catch (e) {}
            const inp = document.getElementById('texInput');
            if (inp) inp.click();
        };
        document.getElementById('floorTexRefresh').onclick = async () => {
            try {
                status.textContent = '🔄 正在重新扫描...';
                grid.innerHTML = '';
                await self._scanImgLibrary(true);
                renderGrid();
            } catch (e) {}
        };

        const renderGrid = () => {
            const items = self._imgLibCache.items || [];
            grid.innerHTML = '';

            if (items.length === 0) {
                const hasPlus = !!(window.plus && window.plus.io);
                const empty = document.createElement('div');
                empty.style.cssText =
                    'grid-column:1/-1;color:#888;text-align:center;' +
                    'padding:30px 12px;font-size:0.75rem;line-height:1.7;';
                empty.innerHTML = hasPlus
                    ? '📂 img 目录下未发现图片<br>' +
                      '<span style="color:#666;font-size:0.65rem;">' +
                      '① 项目根目录有 img/ 文件夹并放入图片<br>' +
                      '② 或创建 img/textures.json: {"textures":["a.jpg","b.png"]}<br>' +
                      '③ 重新打包 APK 安装<br>' +
                      '或点击右上角「🔄 刷新」' +
                      '</span>'
                    : '🌐 浏览器环境无法扫描目录<br>' +
                      '<span style="color:#666;font-size:0.65rem;">' +
                      '请通过 HTTP 服务并创建 img/textures.json' +
                      '</span>';
                grid.appendChild(empty);
                status.textContent = '共 0 张图片';
                return;
            }

            items.forEach((item) => {
                const cell = document.createElement('div');
                cell.style.cssText =
                    'display:flex;flex-direction:column;align-items:center;' +
                    'background:#23252e;border-radius:9px;padding:5px;' +
                    'cursor:pointer;border:2px solid rgba(255,255,255,0.08);' +
                    'overflow:hidden;box-sizing:border-box;user-select:none;';

                const imgWrap = document.createElement('div');
                imgWrap.style.cssText =
                    'position:relative;width:100%;padding-top:100%;' +
                    'background:#111;border-radius:6px;overflow:hidden;';

                const img = document.createElement('img');
                img.style.cssText =
                    'position:absolute;top:0;left:0;width:100%;height:100%;' +
                    'object-fit:cover;display:block;';
                img.alt = item.fileName;
                img.loading = 'lazy';
                if (item.localURL) img.src = item.localURL;

                img.onerror = function () {
                    this.onerror = null;
                    this.style.display = 'none';
                    const ph = document.createElement('div');
                    ph.style.cssText =
                        'position:absolute;top:0;left:0;width:100%;height:100%;' +
                        'display:flex;align-items:center;justify-content:center;' +
                        'font-size:1.6rem;color:#555;background:#1a1a22;';
                    ph.textContent = '🖼️';
                    imgWrap.appendChild(ph);
                };

                imgWrap.appendChild(img);
                cell.appendChild(imgWrap);

                const nameEl = document.createElement('div');
                nameEl.textContent = item.name || item.fileName;
                nameEl.style.cssText =
                    'font-size:0.58rem;color:#ccc;margin-top:4px;' +
                    'width:100%;text-align:center;' +
                    'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
                nameEl.title = item.fileName;
                cell.appendChild(nameEl);

                cell.onclick = async () => {
                    try {
                        cell.style.opacity = '0.6';
                        status.textContent = '⏳ 正在应用: ' + item.fileName;
                        const ok = await self._applyFloorTextureFromItem(item);
                        if (ok) { try { modal.remove(); } catch (e) {} }
                        else { cell.style.opacity = '1'; status.textContent = '❌ 应用失败'; }
                    } catch (e) {
                        cell.style.opacity = '1';
                        status.textContent = '❌ ' + (e.message || e);
                    }
                };

                grid.appendChild(cell);
            });

            status.textContent = '共 ' + items.length + ' 张 · 点击应用到「第' +
                (self.currentFloor + 1) + '层」地板';
        };

        try {
            await this._scanImgLibrary(false);
            renderGrid();
            if ((this._imgLibCache.items || []).length === 0 && window.plus && window.plus.io) {
                setTimeout(async () => {
                    try {
                        const retry = await self._scanImgLibrary(true);
                        if (retry.length > 0) renderGrid();
                    } catch (e) {}
                }, 1500);
            }
        } catch (e) {
            status.textContent = '❌ 扫描失败: ' + (e.message || e);
        }
    };

    app.pickFloorTextureFromImgLib = function () {
        try { this._showFloorTexturePicker(); }
        catch (e) {
            try {
                const inp = document.getElementById('texInput');
                if (inp) inp.click();
            } catch (err) {}
        }
    };

    /* ======================================================================
     * 五、★ 天空库（sky.json）
     * ====================================================================== */

    /* ---------- 5.1 解析 sky.json ---------- */
    app._parseSkyManifest = function (json) {
        const list = [];
        const push = (it) => {
            if (typeof it === 'string') {
                const f = it.trim();
                if (SKY_RE.test(f)) list.push({ name: f.replace(/\.[^.]+$/, ''), file: f });
            } else if (it && typeof it === 'object') {
                const f = it.file || it.fileName || it.filename || it.path || it.url;
                if (f && SKY_RE.test(String(f))) {
                    list.push({
                        name: it.name || it.title ||
                            String(f).replace(/.*\//, '').replace(/\.[^.]+$/, ''),
                        file: String(f)
                    });
                }
            }
        };
        if (Array.isArray(json)) json.forEach(push);
        else if (json && typeof json === 'object') {
            const arr = json.skies || json.sky || json.hdr || json.hdrs ||
                        json.images || json.textures || json.list ||
                        json.files || json.items || json.data;
            if (Array.isArray(arr)) arr.forEach(push);
            else Object.keys(json).forEach(k => {
                const v = json[k];
                if (typeof v === 'string' && SKY_RE.test(v)) push({ name: k, file: v });
                else if (typeof v === 'string' && SKY_RE.test(k)) push({ name: v, file: k });
            });
        }
        const seen = new Set();
        return list.filter(it => {
            const k = String(it.file).toLowerCase();
            if (seen.has(k)) return false;
            seen.add(k);
            return SKY_RE.test(it.file);
        });
    };

    /* ---------- 5.2 扫描所有目录的天空贴图 ---------- */
    app._scanSkyFromAllDirs = async function () {
        const isSkyFile = function (name) {
            if (HDR_RE.test(name)) return true;
            if (SKY_RE.test(name) &&
                /(sky|天空|背景|background|hdri|env|scene|panorama)/i.test(name)) return true;
            return false;
        };

        const entries = await this._scanAllCandidateDirs(isSkyFile, 2);
        if (entries.length === 0) return 0;

        const status = (t) => {
            const el = document.getElementById('sysSkyStatus'); if (el) el.innerText = t;
            const el2 = document.getElementById('envSkyStatus'); if (el2) el2.innerText = t;
        };

        let loaded = 0;
        for (let i = 0; i < entries.length; i++) {
            const fe = entries[i];
            if (this.skyLibrary.items.some(x => x.fileName === fe.name)) continue;
            try {
                status('🔍 读取天空 ' + (i + 1) + '/' + entries.length + ': ' + fe.name);
                const b64 = await this._readEntryAsBase64(fe);
                if (b64 && b64.length > 10) {
                    const baseName = String(fe.name).replace(/\.[^.]+$/, '');
                    await this.skyLibrary.addSkyItem(baseName, b64, fe.name);
                    loaded++;
                }
            } catch (e) { console.warn('天空读取失败:', fe.name, e); }
        }
        try { this.skyLibrary.renderUI(); } catch (e) {}
        return loaded;
    };

    /* ---------- 5.3 autoLoadSkyLibrary ---------- */
    app.autoLoadSkyLibrary = async function (force) {
        if (this._skyAutoLoadStarted && !force) return;
        this._skyAutoLoadStarted = true;

        const status = (t) => {
            const el = document.getElementById('sysSkyStatus'); if (el) el.innerText = t;
            const el2 = document.getElementById('envSkyStatus'); if (el2) el2.innerText = t;
        };

        status('🔍 正在读取 img/sky.json 清单...');

        /* ---- ① sky.json 清单 ---- */
        try {
            const mf = await this._tryLoadManifest('sky.json');
            if (mf) {
                const list = this._parseSkyManifest(mf.json);
                console.log('[SkyLib] 发现 sky.json: ' + list.length + ' 个贴图');
                if (list.length > 0) {
                    let n = 0;
                    for (let i = 0; i < list.length; i++) {
                        const item = list[i];
                        if (this.skyLibrary.items.some(x => x.fileName === item.file)) continue;
                        try {
                            const buf = await this._xhrArrayBuffer(mf.base + item.file);
                            const b64 = this.arrayBufferToBase64(buf);
                            if (b64 && b64.length > 10) {
                                await this.skyLibrary.addSkyItem(item.name, b64, item.file);
                                n++;
                            }
                        } catch (e) { console.warn('[SkyLib] 读取失败:', item.file, e); }
                    }
                    if (n > 0) { await this._skyLoadDone(); return; }
                }
            }
        } catch (e) { console.warn('[SkyLib] sky.json 加载失败:', e); }

        /* ---- ② plus 目录扫描 ---- */
        if (window.plus && window.plus.io) {
            try {
                status('🔍 正在扫描 img 目录天空贴图...');
                const n2 = await this._scanSkyFromAllDirs();
                if (n2 > 0) { await this._skyLoadDone(); return; }
            } catch (e) { console.warn('[SkyLib] 目录扫描失败:', e); }
        }

        /* ---- ③ 延迟重试 ---- */
        setTimeout(async () => {
            if (this._skyLoadDoneFlag) return;
            let n = 0;

            try {
                const mf = await this._tryLoadManifest('sky.json');
                if (mf) {
                    const list = this._parseSkyManifest(mf.json);
                    for (let i = 0; i < list.length; i++) {
                        const item = list[i];
                        if (this.skyLibrary.items.some(x => x.fileName === item.file)) continue;
                        try {
                            const buf = await this._xhrArrayBuffer(mf.base + item.file);
                            const b64 = this.arrayBufferToBase64(buf);
                            if (b64) { await this.skyLibrary.addSkyItem(item.name, b64, item.file); n++; }
                        } catch (e) {}
                    }
                }
            } catch (e) {}

            if (window.plus && window.plus.io && n === 0) {
                try { n += await this._scanSkyFromAllDirs(); } catch (e) {}
            }
            if (n > 0) { await this._skyLoadDone(); return; }

            const hasPlus = !!(window.plus && window.plus.io);
            status(hasPlus ?
                '💡 img 目录未发现天空贴图\n支持 .hdr / sky*.jpg / img/sky.json' :
                '🌐 浏览器环境: 请通过HTTP服务访问');
        }, 4000);
    };

    /* ======================================================================
     * 六、★ 房间纹理选择器（主画布房间面板 / 户型编辑窗口共用）
     * ====================================================================== */
    app._showRoomTexturePicker = async function (floorIdx, roomIdx, isFem) {
        const self = this;
        const old = document.getElementById('roomTexPickerModal');
        if (old) { try { old.remove(); } catch (e) {} }

        const modal = document.createElement('div');
        modal.id = 'roomTexPickerModal';
        modal.style.cssText =
            'position:fixed;top:0;left:0;width:100%;height:100%;' +
            'background:rgba(0,0,0,0.78);z-index:1650;' +
            'display:flex;align-items:center;justify-content:center;' +
            'padding:16px;box-sizing:border-box;';

        const card = document.createElement('div');
        card.style.cssText =
            'background:#1e1e28;border:1px solid rgba(76,201,240,0.4);' +
            'border-radius:14px;width:100%;max-width:560px;' +
            'max-height:88vh;display:flex;flex-direction:column;' +
            'overflow:hidden;box-sizing:border-box;';

        card.innerHTML =
            '<div style="display:flex;align-items:center;justify-content:space-between;' +
                'padding:12px 14px;background:rgba(76,201,240,0.1);' +
                'border-bottom:1px solid rgba(255,255,255,0.08);flex-shrink:0;">' +
                '<div style="font-size:0.88rem;color:#4cc9f0;font-weight:700;">' +
                    '🖼️ 为「第' + (floorIdx + 1) + '层 · 房间' + (roomIdx + 1) + '」选择地板贴图' +
                '</div>' +
                '<div style="display:flex;gap:8px;align-items:center;">' +
                    '<span id="roomTexRefresh" style="cursor:pointer;font-size:0.75rem;color:#aaa;' +
                        'padding:4px 8px;border:1px solid #444;border-radius:6px;user-select:none;">🔄 刷新</span>' +
                    '<span id="roomTexClose" style="cursor:pointer;font-size:1.2rem;color:#aaa;' +
                        'padding:0 6px;user-select:none;">✕</span>' +
                '</div>' +
            '</div>' +
            '<div id="roomTexStatus" style="padding:8px 14px;font-size:0.68rem;color:#888;' +
                'border-bottom:1px solid rgba(255,255,255,0.05);flex-shrink:0;">' +
                '🔍 正在扫描 img 目录...' +
            '</div>' +
            '<div id="roomTexGrid" style="display:grid;' +
                'grid-template-columns:repeat(auto-fill,minmax(96px,1fr));' +
                'gap:8px;padding:10px;overflow-y:auto;flex:1 1 auto;' +
                'min-height:120px;max-height:60vh;touch-action:pan-y;' +
                '-webkit-overflow-scrolling:touch;"></div>' +
            '<div style="display:flex;gap:8px;padding:10px 14px;' +
                'background:#181822;border-top:1px solid rgba(255,255,255,0.08);flex-shrink:0;">' +
                '<button id="roomTexUpload" style="flex:2;min-height:38px;' +
                    'background:linear-gradient(135deg,#4361ee,#4cc9f0);color:#fff;' +
                    'border:none;border-radius:9px;font-size:0.78rem;cursor:pointer;font-weight:600;">' +
                    '📁 从本地文件上传</button>' +
                '<button id="roomTexCancel" style="flex:1;min-height:38px;background:#3a3a44;' +
                    'color:#ddd;border:none;border-radius:9px;font-size:0.78rem;cursor:pointer;">取消</button>' +
            '</div>';

        modal.appendChild(card);
        document.body.appendChild(modal);

        const close = () => { try { modal.remove(); } catch (e) {} };
        document.getElementById('roomTexClose').onclick = close;
        document.getElementById('roomTexCancel').onclick = close;
        modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

        document.getElementById('roomTexUpload').onclick = () => {
            close();
            if (isFem) {
                if (self._fem) self._fem.selectedRoom = { floorIdx: floorIdx, roomIdx: roomIdx };
                const inp = document.getElementById('femRoomTextureInput');
                if (inp) inp.click();
            } else {
                self.selectedRoom = { floorIdx: floorIdx, roomIdx: roomIdx };
                const inp = document.getElementById('roomTextureInput');
                if (inp) inp.click();
            }
        };

        const grid = document.getElementById('roomTexGrid');
        const status = document.getElementById('roomTexStatus');

        const applyItem = async (item, cell) => {
            try {
                if (cell) cell.style.opacity = '0.5';
                status.textContent = '⏳ 正在应用: ' + item.fileName + ' ...';

                const img = await self._loadItemImage(item);
                const tex = new THREE.CanvasTexture(img);
                tex.image = img;
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                tex.encoding = THREE.sRGBEncoding;

                const scaleKey = 'roomTexScale_' + floorIdx + '_' + roomIdx;
                const s = (self._roomTextureScale && self._roomTextureScale[scaleKey]) || 1;
                tex.repeat.set(s, s);
                tex.needsUpdate = true;

                if (!self.roomTextures[floorIdx]) self.roomTextures[floorIdx] = {};
                self.roomTextures[floorIdx][roomIdx] = tex;

                try { self.render2D(); } catch (e) {}
                try { self.generate3D(); } catch (e) {}
                if (isFem) {
                    try { self._femRender(); } catch (e) {}
                } else {
                    try { self.refreshRoomSettingPanel(); } catch (e) {}
                }

                self.saveSystem.saveToDB(true);
                self.saveSystem.showToast('✅ 已应用房间贴图: ' + item.fileName);
                close();
            } catch (e) {
                console.error('[RoomTexPicker] 应用失败:', e);
                if (cell) cell.style.opacity = '1';
                status.textContent = '❌ 应用失败: ' + (e.message || e);
                self.saveSystem.showToast('❌ 应用失败: ' + (e.message || e));
            }
        };

        const renderGrid = () => {
            const items = (self._imgLibCache && self._imgLibCache.items) || [];
            grid.innerHTML = '';

            if (items.length === 0) {
                const hasPlus = !!(window.plus && window.plus.io);
                const empty = document.createElement('div');
                empty.style.cssText =
                    'grid-column:1/-1;color:#888;text-align:center;' +
                    'padding:30px 12px;font-size:0.75rem;line-height:1.7;';
                empty.innerHTML = hasPlus
                    ? '📂 img 目录下未发现图片<br>' +
                      '<span style="color:#666;font-size:0.65rem;">' +
                      '① 项目根目录有 img/ 文件夹并放入图片<br>' +
                      '② 或创建 img/textures.json: {"textures":["a.jpg","b.png"]}<br>' +
                      '③ 重新打包 APK 安装' +
                      '</span>'
                    : '🌐 浏览器环境无法扫描目录<br>' +
                      '<span style="color:#666;font-size:0.65rem;">' +
                      '请通过 HTTP 服务并创建 img/textures.json' +
                      '</span>';
                grid.appendChild(empty);
                status.textContent = '共 0 张图片';
                return;
            }

            items.forEach((item) => {
                const cell = document.createElement('div');
                cell.style.cssText =
                    'display:flex;flex-direction:column;align-items:center;' +
                    'background:#23252e;border-radius:9px;padding:5px;' +
                    'cursor:pointer;border:2px solid rgba(255,255,255,0.08);' +
                    'overflow:hidden;box-sizing:border-box;user-select:none;';

                const imgWrap = document.createElement('div');
                imgWrap.style.cssText =
                    'position:relative;width:100%;padding-top:100%;' +
                    'background:#111;border-radius:6px;overflow:hidden;';

                const img = document.createElement('img');
                img.style.cssText =
                    'position:absolute;top:0;left:0;width:100%;height:100%;' +
                    'object-fit:cover;display:block;';
                img.alt = item.fileName;
                img.loading = 'lazy';
                if (item.localURL) img.src = item.localURL;

                img.onerror = function () {
                    this.onerror = null;
                    this.style.display = 'none';
                    const ph = document.createElement('div');
                    ph.style.cssText =
                        'position:absolute;top:0;left:0;width:100%;height:100%;' +
                        'display:flex;align-items:center;justify-content:center;' +
                        'font-size:1.6rem;color:#555;background:#1a1a22;';
                    ph.textContent = '🖼️';
                    imgWrap.appendChild(ph);
                };

                imgWrap.appendChild(img);
                cell.appendChild(imgWrap);

                const nameEl = document.createElement('div');
                nameEl.textContent = item.name || item.fileName;
                nameEl.style.cssText =
                    'font-size:0.58rem;color:#ccc;margin-top:4px;' +
                    'width:100%;text-align:center;' +
                    'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
                nameEl.title = item.fileName;
                cell.appendChild(nameEl);

                cell.onclick = () => applyItem(item, cell);
                grid.appendChild(cell);
            });

            status.textContent = '共 ' + items.length + ' 张 · 点击应用到「第' +
                (floorIdx + 1) + '层 · 房间' + (roomIdx + 1) + '」';
        };

        document.getElementById('roomTexRefresh').onclick = async () => {
            try {
                status.textContent = '🔄 正在重新扫描...';
                grid.innerHTML = '';
                await self._scanImgLibrary(true);
                renderGrid();
            } catch (e) {
                status.textContent = '❌ 刷新失败: ' + (e.message || e);
            }
        };

        try {
            status.textContent = '🔍 正在扫描 img 目录...';
            await this._scanImgLibrary(false);
            renderGrid();

            if ((this._imgLibCache.items || []).length === 0 &&
                window.plus && window.plus.io) {
                setTimeout(async () => {
                    try {
                        const retry = await self._scanImgLibrary(true);
                        if (retry.length > 0) renderGrid();
                    } catch (e) {}
                }, 1500);
            }
        } catch (e) {
            status.textContent = '❌ 扫描失败: ' + (e.message || e);
        }
    };

    /* ======================================================================
     * 七、为主画布「房间设置」/ 户型编辑窗口「房间面板」注入按钮
     * ====================================================================== */
    app._injectRoomPanelImgBtn = function () {
        const panel = document.getElementById('roomSettingPanel');
        if (!panel) return;
        if (panel.dataset.imgBtnInjected === '1') return;
        panel.dataset.imgBtnInjected = '1';

        const rspUpload = document.getElementById('rspUploadTex');
        if (!rspUpload) return;
        const oldRow = rspUpload.parentNode;

        const newRow = document.createElement('div');
        newRow.style.cssText = 'display:flex;gap:6px;margin-top:6px;';

        const btn = document.createElement('button');
        btn.className = 'rsp-btn primary';
        btn.id = 'rspPickImgTex';
        btn.type = 'button';
        btn.style.cssText = 'flex:1;';
        btn.textContent = '🖼️ 从img库选择贴图';

        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!app.selectedRoom) {
                app.saveSystem.showToast('⚠️ 请先在画布中点击一个房间');
                return;
            }
            app._showRoomTexturePicker(
                app.selectedRoom.floorIdx,
                app.selectedRoom.roomIdx,
                false
            );
        };

        newRow.appendChild(btn);
        if (oldRow && oldRow.parentNode) {
            oldRow.parentNode.insertBefore(newRow, oldRow.nextSibling);
        } else {
            panel.appendChild(newRow);
        }
    };

    app._injectFemRoomPanelImgBtn = function () {
        const panel = document.getElementById('femRoomPanel');
        if (!panel) return;
        if (panel.dataset.imgBtnInjected === '1') return;
        panel.dataset.imgBtnInjected = '1';

        const femUpload = document.getElementById('femUploadTex');
        if (!femUpload) return;
        const oldRow = femUpload.parentNode;

        const newRow = document.createElement('div');
        newRow.style.cssText = 'display:flex;gap:6px;margin-top:6px;';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'femPickImgTex';
        btn.style.cssText =
            'flex:1;min-height:34px;font-size:0.64rem;border:none;' +
            'border-radius:8px;cursor:pointer;font-weight:600;' +
            'background:linear-gradient(135deg,#4361ee,#4cc9f0);color:#fff;';
        btn.textContent = '🖼️ 从img库选择贴图';

        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const M = app._fem;
            if (!M || !M.selectedRoom) {
                app.saveSystem.showToast('⚠️ 请先点击一个房间');
                return;
            }
            app._showRoomTexturePicker(
                M.selectedRoom.floorIdx,
                M.selectedRoom.roomIdx,
                true
            );
        };

        newRow.appendChild(btn);
        if (oldRow && oldRow.parentNode) {
            oldRow.parentNode.insertBefore(newRow, oldRow.nextSibling);
        } else {
            panel.appendChild(newRow);
        }
    };

    /* ======================================================================
     * 八、包装关键方法
     * ====================================================================== */

    /* ① ensureRoomSettingPanel */
    const _origEnsureRoomSettingPanel = app.ensureRoomSettingPanel;
    if (typeof _origEnsureRoomSettingPanel === 'function') {
        app.ensureRoomSettingPanel = function () {
            const r = _origEnsureRoomSettingPanel.call(this);
            try { this._injectRoomPanelImgBtn(); } catch (e) {}
            return r;
        };
    }

    /* ② refreshRoomSettingPanel */
    const _origRefreshRoomSettingPanel = app.refreshRoomSettingPanel;
    if (typeof _origRefreshRoomSettingPanel === 'function') {
        app.refreshRoomSettingPanel = function () {
            const r = _origRefreshRoomSettingPanel.call(this);
            try { this._injectRoomPanelImgBtn(); } catch (e) {}
            return r;
        };
    }

    /* ③ ensureFloorEditModal */
    const _origEnsureFloorEditModal = app.ensureFloorEditModal;
    if (typeof _origEnsureFloorEditModal === 'function') {
        app.ensureFloorEditModal = function () {
            const r = _origEnsureFloorEditModal.call(this);
            try { this._injectFemRoomPanelImgBtn(); } catch (e) {}
            return r;
        };
    }

    /* ④ _femShowRoomPanel */
    const _origFemShowRoomPanel = app._femShowRoomPanel;
    if (typeof _origFemShowRoomPanel === 'function') {
        app._femShowRoomPanel = function () {
            const r = _origFemShowRoomPanel.call(this);
            try { this._injectFemRoomPanelImgBtn(); } catch (e) {}
            return r;
        };
    }

    /* ⑤ openFloorEditModal */
    const _origOpenFloorEditModal = app.openFloorEditModal;
    if (typeof _origOpenFloorEditModal === 'function') {
        app.openFloorEditModal = function () {
            const r = _origOpenFloorEditModal.call(this);
            try { this._injectFemRoomPanelImgBtn(); } catch (e) {}
            return r;
        };
    }

    /* ======================================================================
     * 九、init 完成后延迟注入
     * ====================================================================== */
    const _origInit = app.init;
    app.init = async function () {
        const r = await _origInit.call(this);
        [300, 800, 1500, 2500, 4000, 6000].forEach((d) => {
            setTimeout(() => {
                try { this._injectRoomPanelImgBtn(); } catch (e) {}
                try { this._injectFemRoomPanelImgBtn(); } catch (e) {}
            }, d);
        });
        return r;
    };

    const tryInject = () => {
        try { app._injectRoomPanelImgBtn(); } catch (e) {}
        try { app._injectFemRoomPanelImgBtn(); } catch (e) {}
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(tryInject, 100));
    } else {
        setTimeout(tryInject, 100);
    }

    /* ======================================================================
     * 十、诊断工具
     * ====================================================================== */
    app.diagnoseAssetDirs = async function () {
        const result = {
            hasPlus: !!(window.plus && window.plus.io),
            dirs: {},
            glbCount: this.glbLibrary ? (this.glbLibrary.models || []).length : 0,
            skyCount: this.skyLibrary ? (this.skyLibrary.items || []).length : 0,
            textureCount: (this._imgLibCache && this._imgLibCache.items)
                ? this._imgLibCache.items.length : 0,
            location: (typeof window.location !== 'undefined') ? window.location.href : ''
        };

        if (!result.hasPlus) {
            console.log('=== 非 5+ App 环境诊断 ===');
            console.log('glb 数量:', result.glbCount);
            console.log('sky 数量:', result.skyCount);
            console.log('texture 数量:', result.textureCount);
            console.table(result);
            return result;
        }

        console.log('=== img 目录诊断 (5+ App) ===');
        for (let i = 0; i < DIR_CANDIDATES.length; i++) {
            const dir = DIR_CANDIDATES[i];
            result.dirs[dir] = await new Promise((resolve) => {
                try {
                    window.plus.io.resolveLocalFileSystemURL(dir,
                        (entry) => resolve('✅ 可访问 (isDir=' + entry.isDirectory + ')'),
                        (err) => resolve('❌ ' + (err && err.message ? err.message : '访问失败'))
                    );
                } catch (e) { resolve('❌ 异常: ' + e.message); }
            });
        }
        console.table(result.dirs);
        console.log('模型数量:', result.glbCount, '| 天空贴图:', result.skyCount,
                    '| 纹理图片:', result.textureCount);
        return result;
    };

    app.diagnoseTextureLib = async function () {
        console.log('=== 纹理库诊断 ===');
        console.log('plus 环境:', !!(window.plus && window.plus.io));
        const mf = await this._tryLoadManifest('textures.json');
        console.log('textures.json:', mf ? mf.url : '未找到');
        const items = await this._scanImgLibrary(true);
        console.log('扫描结果:', items.length, '张');
        console.table(items.map(x => ({
            name: x.name, fileName: x.fileName,
            source: x.source, localURL: x.localURL
        })));
        return items;
    };

    /* ======================================================================
     * 十一、启动横幅
     * ====================================================================== */
    console.info('╔══════════════════════════════════════════════════════════╗');
    console.info('║  [AssetLoader+TextureFix v3] 完全独立整合版 已启用        ║');
    console.info('║  ✓ 模型库  img/models.json   + 目录扫描                  ║');
    console.info('║  ✓ 纹理库  img/textures.json + 目录扫描                  ║');
    console.info('║  ✓ 天空库  img/sky.json      + 目录扫描                  ║');
    console.info('║  ✓ 纹理应用: <img src> 优先，XHR 兜底，禁用 fetch         ║');
    console.info('║  ✓ 主画布 / 户型编辑窗口 房间面板均支持选图               ║');
    console.info('║  ✓ 控制台: app.diagnoseAssetDirs() / diagnoseTextureLib() ║');
    console.info('╚══════════════════════════════════════════════════════════╝');

})();
/* ============================================================================
 * ★★★ 当前层模型管理列表 —— 移动端触摸滚动修复 v1 ★★★
 * ----------------------------------------------------------------------------
 * 【问题】
 *   手机客户端中，右侧边栏 → "📋 当前层模型管理" 列表 (id=flModelList)
 *   无法上下滑动选择模型。
 *
 * 【根因】
 *   Android WebView 下 .sidebar 的 position:fixed + will-change:transform
 *   + transition:transform 三件套创建独立 GPU 合成层，吞掉了子元素的原生
 *   touchmove 滚动事件，CSS 的 touch-action / overflow 全都无效。
 *
 * 【方案】
 *   在 flModelList 上手动接管 touchstart / touchmove / touchend：
 *     · 直接写 scrollTop，完全绕过原生滚动机制
 *     · 加入惯性动量，模拟原生顺滑手感
 *     · 边界阻尼（拖出范围时手感更柔和）
 *     · 位移 > 6px 时抑制 click，防止滑动误触选择
 *     · 通过 MutationObserver 自动应对列表重建 (refreshFloorModelList)
 *
 * 【覆盖范围】
 *   · 主修复目标：flModelList (当前层模型管理)
 *   · 顺带修复：sidebarLeft / sidebarRight / glbLibraryGrid
 *              sensorListContainer / sysSensorList / sysMusicHistoryList
 * ============================================================================ */
(function installFloorModelListScrollFix() {
    'use strict';
    if (typeof app === 'undefined' || !app) return;
    if (app.__flModelListScrollFixInstalled) return;
    app.__flModelListScrollFixInstalled = true;

    /* ======================================================================
     * §1  配置
     * ====================================================================== */
    const CFG = {
        friction:       0.94,    // 惯性摩擦（越小越快停止）
        minVelocity:    0.5,     // 停止惯性阈值 (px/frame@60fps)
        moveTolerance:  6,       // 位移超过此值判定为滑动（抑制 click）
        boundaryDamp:   0.35,    // 边界阻尼系数
        momentumMax:    40,      // 单帧最大惯性位移
        isMobile:       () => window.innerWidth <= 768
    };

    /* ======================================================================
     * §2  注入 CSS（作为基础保障）
     * ====================================================================== */
    function injectStyles() {
        if (document.getElementById('flModelListScrollStyles')) return;
        const s = document.createElement('style');
        s.id = 'flModelListScrollStyles';
        s.textContent = `
        @media screen and (max-width: 768px) {
            /* ★ 主目标：当前层模型管理列表 */
            #flModelList {
                touch-action: pan-y !important;
                -webkit-overflow-scrolling: auto !important;
                overscroll-behavior: contain !important;
                overflow-y: auto !important;
                overflow-x: hidden !important;
                will-change: auto !important;
                -webkit-backface-visibility: hidden;
                backface-visibility: hidden;
                /* ★ 适度放大列表高度，让用户少滚动 */
                max-height: 42vh !important;
                min-height: 120px;
                -webkit-user-select: none;
                user-select: none;
                -webkit-touch-callout: none;
            }
            /* 拖动中关闭过渡，保证 1:1 跟手 */
            #flModelList.fl-scrolling {
                transition: none !important;
            }
            /* ★ 列表项：加大触摸区域，视觉反馈 */
            #flModelList > div {
                min-height: 34px !important;
                padding: 6px 8px !important;
                touch-action: manipulation;
                -webkit-tap-highlight-color: rgba(76,201,240,0.2);
                transition: background 0.12s ease;
            }
            #flModelList > div:active {
                background: rgba(76,201,240,0.18) !important;
            }
            /* 连带改善其它内嵌滚动容器 */
            #glbLibraryGrid,
            #sensorListContainer,
            #sysSensorList,
            #sysMusicHistoryList {
                touch-action: pan-y !important;
                overscroll-behavior: contain !important;
                will-change: auto !important;
            }
            /* 侧边栏本身：允许纵向滚动 + 关闭合成层副作用 */
            .sidebar {
                touch-action: pan-y !important;
                -webkit-overflow-scrolling: auto !important;
                overscroll-behavior: contain !important;
            }
            .sidebar.open {
                will-change: auto !important;
            }
        }
        `;
        document.head.appendChild(s);
    }

    /* ======================================================================
     * §3  判断触摸目标是否为交互控件（是则交给原生处理）
     * ====================================================================== */
    function isInteractiveTarget(el, root) {
        let node = el;
        while (node && node !== root && node.nodeType === 1) {
            const tag = node.tagName ? node.tagName.toUpperCase() : '';
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
            if (tag === 'BUTTON' || tag === 'A') return true;
            // 排除开关、滑块、复选框
            if (node.classList && (
                node.classList.contains('feature-check') ||
                node.classList.contains('resizer-plus') ||
                node.classList.contains('resizer-bar') ||
                node.classList.contains('sidebar-resizer') ||
                node.classList.contains('del-sensor-btn')
            )) return true;
            node = node.parentElement;
        }
        return false;
    }

    /* ======================================================================
     * §4  ★ 核心：为单个滚动容器启用"JS 手动滚动 + 惯性 + 点击抑制"
     * ====================================================================== */
    function setupManualScroll(el, opts) {
        if (!el) return;
        if (el.dataset.flManualScrollBound === '1') return;
        el.dataset.flManualScrollBound = '1';

        const options = opts || {};
        const suppressClickMs = options.suppressClickMs || 320;

        // —— 内联样式兜底（即使外部 CSS 未生效也能工作）——
        try {
            el.style.setProperty('touch-action', 'pan-y', 'important');
            el.style.setProperty('overflow-y', 'auto', 'important');
            el.style.setProperty('overflow-x', 'hidden', 'important');
            el.style.setProperty('-webkit-overflow-scrolling', 'auto', 'important');
            el.style.setProperty('overscroll-behavior', 'contain', 'important');
            el.style.setProperty('will-change', 'auto', 'important');
        } catch (e) {}

        // —— 状态变量 ——
        let startY = 0;
        let startScrollTop = 0;
        let lastY = 0;
        let lastTime = 0;
        let velocity = 0;
        let isTouching = false;
        let skipNative = false;
        let moved = false;
        let momentumRAF = null;
        let suppressClickUntil = 0;

        const cancelMomentum = () => {
            if (momentumRAF) {
                cancelAnimationFrame(momentumRAF);
                momentumRAF = null;
            }
        };

        const getMaxScroll = () =>
            Math.max(0, el.scrollHeight - el.clientHeight);

        /* ---------------- touchstart ---------------- */
        const onTouchStart = (e) => {
            if (!CFG.isMobile()) return;

            if (e.touches.length !== 1) {
                isTouching = false;
                cancelMomentum();
                return;
            }

            // 交互控件 → 交给原生
            if (isInteractiveTarget(e.target, el)) {
                skipNative = true;
                isTouching = false;
                return;
            }

            skipNative = false;
            cancelMomentum();
            isTouching = true;
            moved = false;

            startY = e.touches[0].clientY;
            lastY = startY;
            lastTime = Date.now();
            startScrollTop = el.scrollTop;
            velocity = 0;

            try {
                el.classList.add('fl-scrolling');
                el.style.setProperty('will-change', 'auto', 'important');
            } catch (err) {}
        };

        /* ---------------- touchmove（核心） ---------------- */
        const onTouchMove = (e) => {
            if (!isTouching || skipNative) return;
            if (e.touches.length !== 1) return;

            const y = e.touches[0].clientY;
            const now = Date.now();
            const dt = Math.max(1, now - lastTime);

            // 速度计算（px / frame@60fps）
            velocity = (lastY - y) / dt * 16;

            lastY = y;
            lastTime = now;

            const dy = startY - y;
            if (Math.abs(dy) > CFG.moveTolerance) {
                moved = true;
            }

            const maxScroll = getMaxScroll();
            let newTop = startScrollTop + dy;

            // 边界阻尼：拖出范围时手感更柔和
            if (newTop < 0) {
                newTop = newTop * CFG.boundaryDamp;
            } else if (newTop > maxScroll) {
                newTop = maxScroll + (newTop - maxScroll) * CFG.boundaryDamp;
            }

            el.scrollTop = newTop;

            // ★ 关键：阻止默认行为，彻底摆脱合成层吞事件的困扰
            if (e.cancelable) e.preventDefault();
        };

        /* ---------------- touchend（触发惯性） ---------------- */
        const onTouchEnd = (e) => {
            if (!isTouching) {
                skipNative = false;
                return;
            }
            isTouching = false;
            try { el.classList.remove('fl-scrolling'); } catch (err) {}

            // ★ 关键：如果有滑动位移，抑制接下来的 click，防止误触选择
            if (moved) {
                suppressClickUntil = Date.now() + suppressClickMs;
            }

            // 惯性滚动
            const applyMomentum = () => {
                if (Math.abs(velocity) < CFG.minVelocity) {
                    momentumRAF = null;
                    // 回弹到有效范围
                    const maxScroll = getMaxScroll();
                    if (el.scrollTop < 0) el.scrollTop = 0;
                    else if (el.scrollTop > maxScroll) el.scrollTop = maxScroll;
                    return;
                }

                const maxScroll = getMaxScroll();
                let step = velocity;
                // 单帧最大位移限制（防止超长列表时跳太远）
                if (step > CFG.momentumMax) step = CFG.momentumMax;
                if (step < -CFG.momentumMax) step = -CFG.momentumMax;

                let newTop = el.scrollTop + step;

                if (newTop <= 0) {
                    newTop = 0;
                    velocity = 0;
                } else if (newTop >= maxScroll) {
                    newTop = maxScroll;
                    velocity = 0;
                }

                el.scrollTop = newTop;
                velocity *= CFG.friction;

                if (Math.abs(velocity) >= CFG.minVelocity) {
                    momentumRAF = requestAnimationFrame(applyMomentum);
                } else {
                    momentumRAF = null;
                }
            };
            applyMomentum();
            skipNative = false;
        };

        /* ---------------- touchcancel ---------------- */
        const onTouchCancel = () => {
            isTouching = false;
            skipNative = false;
            cancelMomentum();
            try { el.classList.remove('fl-scrolling'); } catch (err) {}
        };

        /* ---------------- 事件绑定 ---------------- */
        el.addEventListener('touchstart', onTouchStart, { passive: true });
        el.addEventListener('touchmove', onTouchMove, { passive: false });
        el.addEventListener('touchend', onTouchEnd, { passive: true });
        el.addEventListener('touchcancel', onTouchCancel, { passive: true });

        // ★ 捕获阶段拦截 click，滑动后 320ms 内的点击全部吞掉
        el.addEventListener('click', (e) => {
            if (Date.now() < suppressClickUntil) {
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
        }, true);

        // 记录到全局便于诊断
        if (!app._flManualScrollTargets) app._flManualScrollTargets = [];
        if (app._flManualScrollTargets.indexOf(el) === -1) {
            app._flManualScrollTargets.push(el);
        }
    }

    /* ======================================================================
     * §5  ★ 全量扫描：找出所有需要修复的滚动容器
     * ====================================================================== */
    function scanAllScrollables() {
        // ① 主目标：当前层模型管理列表（优先级最高，给更长的 click 抑制时间）
        const flList = document.getElementById('flModelList');
        if (flList) {
            setupManualScroll(flList, { suppressClickMs: 320 });
        }

        // ② 其它内嵌滚动容器
        const innerIds = [
            'glbLibraryGrid',
            'sensorListContainer',
            'sysSensorList',
            'sysMusicHistoryList',
            'flPropPanel'
        ];
        innerIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) setupManualScroll(el, { suppressClickMs: 260 });
        });

        // ③ 侧边栏本身（让整个侧栏也能顺畅滚动）
        ['sidebarLeft', 'sidebarRight'].forEach(id => {
            const el = document.getElementById(id);
            if (el) setupManualScroll(el, { suppressClickMs: 200 });
        });

        // ④ 移动端独有的 modal 内列表
        const femList = document.getElementById('femCanvasWrap');
        if (femList) setupManualScroll(femList, { suppressClickMs: 100 });
    }

    /* ======================================================================
     * §6  ★ 监听列表重建：refreshFloorModelList 会 innerHTML='' 重建内容
     * ----------------------------------------------------------------------
     * 注意：重建的是 flModelList 的子元素，容器本身没变，
     *       所以触摸事件监听器依然有效，不需要重新绑定。
     *       但为保险起见，重建后重新扫描一次，覆盖可能的容器替换。
     * ====================================================================== */
    const _origRefreshFloorModelList = app.refreshFloorModelList;
    if (typeof _origRefreshFloorModelList === 'function') {
        app.refreshFloorModelList = function () {
            const r = _origRefreshFloorModelList.apply(this, arguments);
            // 延迟到 DOM 更新完成
            setTimeout(() => {
                try { scanAllScrollables(); } catch (e) {}
            }, 30);
            return r;
        };
    }

    /* ======================================================================
     * §7  ★ 监听右侧栏 DOM 变化
     * ----------------------------------------------------------------------
     * 场景：面板首次创建、模型列表重建、切换到属性面板等
     * ====================================================================== */
    function observeSidebar() {
        if (!window.MutationObserver) return;

        ['sidebarLeft', 'sidebarRight'].forEach(id => {
            const sb = document.getElementById(id);
            if (!sb) return;
            if (sb._flScrollObserver) return;

            try {
                const obs = new MutationObserver(function (mutations) {
                    // 只关心子节点变化（新元素加入）
                    let needsRescan = false;
                    for (let i = 0; i < mutations.length; i++) {
                        const m = mutations[i];
                        if (m.type === 'childList' && (m.addedNodes.length > 0)) {
                            needsRescan = true;
                            break;
                        }
                    }
                    if (needsRescan) {
                        // 使用 debounce 防止高频触发
                        if (sb._flScrollRescanTimer) {
                            clearTimeout(sb._flScrollRescanTimer);
                        }
                        sb._flScrollRescanTimer = setTimeout(() => {
                            sb._flScrollRescanTimer = null;
                            try { scanAllScrollables(); } catch (e) {}
                        }, 80);
                    }
                });
                obs.observe(sb, { childList: true, subtree: true });
                sb._flScrollObserver = obs;
            } catch (e) {}
        });
    }

    /* ======================================================================
     * §8  ★ 劫持关键生命周期方法
     * ====================================================================== */

    /* ---- ① initFloorModelManager：首次创建面板 ---- */
    const _origInitFloorModelManager = app.initFloorModelManager;
    if (typeof _origInitFloorModelManager === 'function') {
        app.initFloorModelManager = function () {
            const r = _origInitFloorModelManager.apply(this, arguments);
            setTimeout(scanAllScrollables, 60);
            setTimeout(scanAllScrollables, 260);
            return r;
        };
    }

    /* ---- ② setupMobileUI：移动端 UI 初始化 ---- */
    const _origSetupMobileUI = app.setupMobileUI;
    if (typeof _origSetupMobileUI === 'function') {
        app.setupMobileUI = function () {
            const r = _origSetupMobileUI.apply(this, arguments);
            setTimeout(scanAllScrollables, 80);
            return r;
        };
    }

    /* ---- ③ toggleMobileSidebar：打开侧栏时确保绑定就绪 ---- */
    const _origToggleMobileSidebar = app.toggleMobileSidebar;
    if (typeof _origToggleMobileSidebar === 'function') {
        app.toggleMobileSidebar = function (side) {
            const r = _origToggleMobileSidebar.apply(this, arguments);
            // 侧栏展开动画约 280ms，之后确保滚动绑定
            setTimeout(scanAllScrollables, 60);
            setTimeout(scanAllScrollables, 320);
            return r;
        };
    }

    /* ---- ④ closeMobileSidebars：关闭时清残留状态 ---- */
    const _origCloseMobileSidebars = app.closeMobileSidebars;
    if (typeof _origCloseMobileSidebars === 'function') {
        app.closeMobileSidebars = function () {
            const r = _origCloseMobileSidebars.apply(this, arguments);
            // 清理残留 class
            ['sidebarLeft', 'sidebarRight', 'flModelList'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    try { el.classList.remove('fl-scrolling'); } catch (e) {}
                }
            });
            return r;
        };
    }

    /* ---- ⑤ deserializeScene：从存档恢复后模型列表被重建 ---- */
    const _origDeserialize = app.saveSystem && app.saveSystem.deserializeScene;
    if (typeof _origDeserialize === 'function') {
        app.saveSystem.deserializeScene = async function (data) {
            const r = await _origDeserialize.call(this, data);
            setTimeout(scanAllScrollables, 200);
            setTimeout(scanAllScrollables, 700);
            return r;
        };
    }

    /* ---- ⑥ init：启动后多次延迟绑定 ---- */
    const _origInit = app.init;
    app.init = async function () {
        const r = await _origInit.call(this);

        // ★ 多时间点扫描，覆盖懒加载面板、存档恢复等场景
        [200, 600, 1200, 2000, 3500, 5000].forEach(delay => {
            setTimeout(() => {
                try { scanAllScrollables(); } catch (e) {}
            }, delay);
        });

        // ★ 监听侧栏 DOM 变化
        setTimeout(observeSidebar, 400);
        setTimeout(observeSidebar, 2000);

        return r;
    };

    /* ======================================================================
     * §9  ★ 窗口尺寸 / 方向变化
     * ====================================================================== */
    window.addEventListener('resize', () => {
        if (app._flScrollResizeTimer) clearTimeout(app._flScrollResizeTimer);
        app._flScrollResizeTimer = setTimeout(scanAllScrollables, 150);
    });

    window.addEventListener('orientationchange', () => {
        setTimeout(scanAllScrollables, 400);
    });

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
            if (app._flScrollResizeTimer) clearTimeout(app._flScrollResizeTimer);
            app._flScrollResizeTimer = setTimeout(scanAllScrollables, 150);
        });
    }

    /* ======================================================================
     * §10  对外 API
     * ====================================================================== */
    app.fixFloorModelListScroll = function () {
        scanAllScrollables();
        this.saveSystem.showToast('🔧 模型列表触摸滚动已修复');
    };

    app.diagnoseFloorModelListScroll = function () {
        const el = document.getElementById('flModelList');
        if (!el) {
            console.warn('[FLScroll] #flModelList 未找到');
            return null;
        }
        const cs = window.getComputedStyle(el);
        const result = {
            exists: true,
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
            scrollTop: el.scrollTop,
            canScroll: el.scrollHeight > el.clientHeight,
            overflowY: cs.overflowY,
            touchAction: cs.touchAction,
            willChange: cs.willChange,
            inlineWillChange: el.style.getPropertyValue('will-change') || '(未设置)',
            position: cs.position,
            maxHeight: cs.maxHeight,
            childCount: el.children.length,
            manualScrollBound: el.dataset.flManualScrollBound === '1',
            innerHTMLPreview: (el.innerHTML || '').substring(0, 80) + '...'
        };
        console.log('=== 当前层模型管理列表滚动诊断 ===');
        console.table(result);

        if (!result.canScroll) {
            console.warn('⚠️ 列表内容不足以滚动 (scrollHeight <= clientHeight)');
            console.warn('   → 需添加更多模型或减小 CSS max-height');
        } else if (!result.manualScrollBound) {
            console.warn('⚠️ 手动滚动未绑定！执行 app.fixFloorModelListScroll() 修复');
        } else {
            console.log('✅ 手动滚动已正确绑定');
        }
        return result;
    };

    /* ======================================================================
     * §11  启动横幅
     * ====================================================================== */
    console.info('╔══════════════════════════════════════════════════════════╗');
    console.info('║  [FLModelListScroll v1] 模型列表触摸滚动修复已启用       ║');
    console.info('║  ✓ JS 手动滚动: 绕过合成层吞事件的 bug                    ║');
    console.info('║  ✓ 惯性动量 + 边界阻尼: 模拟原生顺滑手感                 ║');
    console.info('║  ✓ 滑动 > 6px 抑制 click: 防止误触选择                   ║');
    console.info('║  ✓ MutationObserver: 自动应对列表重建                     ║');
    console.info('║  ✓ 同时修复: 侧栏 / GLB库 / 传感器列表                    ║');
    console.info('║  ✓ 控制台: app.fixFloorModelListScroll() /              ║');
    console.info('║            app.diagnoseFloorModelListScroll()            ║');
    console.info('╚══════════════════════════════════════════════════════════╝');

    /* ======================================================================
     * §12  立即执行一次
     * ====================================================================== */
    injectStyles();

    const tryInit = () => {
        try { scanAllScrollables(); } catch (e) {}
        try { observeSidebar(); } catch (e) {}
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(tryInit, 120));
    } else {
        setTimeout(tryInit, 120);
    }
})();
/* ============================================================================
 * GLB 模型库按需加载优化 V1
 * 目标：
 * 1. 启动时只读取 img/models.json / img 目录中的“模型名称和路径”，绝不读取 GLB 文件内容。
 * 2. 模型库卡片只负责显示名称；用户确认添加后，才读取指定 GLB/GLTF/FBX。
 * 3. IndexedDB 启动恢复只读取模型元数据，避免 getAll() 一次性把历史 Base64 全搬入内存。
 * 4. 场景恢复仍保留原功能；已经摆放到场景中的 GLB 按顺序逐个恢复，避免 Promise.all 并行解析造成移动端内存峰值。
 * 5. 保留原有 normalizeModelTransform / floorIndex / manualPosition / animation / material / walker 逻辑。
 * 6. 原有“本地文件导入”和“文件夹导入”仍可使用，不改变其入口。
 * ============================================================================ */
(function installGLBLazyCatalogV1() {
    'use strict';

    if (typeof app === 'undefined' || !app || typeof THREE === 'undefined') return;
    if (app.__glbLazyCatalogV1Installed) return;
    app.__glbLazyCatalogV1Installed = true;

    const GLB_RE = /\.(glb|gltf|fbx)$/i;
    const MANIFEST_DIRS = ['img/', './img/', '_www/img/', '/img/'];
    const PLUS_IMG_DIRS = ['_www/img/', '_doc/img/', '_downloads/img/', 'img/'];
    const MAX_GLTF_GLTF_BYTES = 150 * 1024 * 1024;

    const safeText = (v, dft) => {
        const s = String(v == null ? '' : v).trim();
        return s || dft || '';
    };

    const safeFinite = (v, dft) =>
        (typeof v === 'number' && isFinite(v)) ? v : dft;

    const yieldToUI = () => new Promise(resolve => setTimeout(resolve, 0));

    /* ======================================================================
     * 一、IndexedDB：只取模型元数据，旧记录仍兼容
     * ====================================================================== */
    app.saveSystem.getAllGLBMetadataFromStore = function () {
        return new Promise((resolve) => {
            if (!this.db) {
                resolve([]);
                return;
            }

            try {
                const tx = this.db.transaction([this.glbStoreName], 'readonly');
                const store = tx.objectStore(this.glbStoreName);
                const rows = [];

                const req = store.openCursor();

                req.onsuccess = function (event) {
                    const cursor = event.target.result;
                    if (!cursor) {
                        resolve(rows);
                        return;
                    }

                    try {
                        const v = cursor.value || {};
                        rows.push({
                            id: v.id || null,
                            name: safeText(v.name, '未命名模型'),
                            fileName: safeText(v.fileName, ''),
                            addedAt: safeFinite(v.addedAt, Date.now()),
                            sourceType: safeText(v.sourceType, v.base64 ? 'legacy' : 'local'),
                            sourceUrl: safeText(v.sourceUrl || v.url, ''),
                            sourcePath: safeText(v.sourcePath, ''),
                            localURL: safeText(v.localURL, ''),
                            hasStoredData: !!(v.base64 && String(v.base64).length > 10)
                        });
                    } catch (e) {}

                    cursor.continue();
                };

                req.onerror = () => resolve([]);
            } catch (e) {
                resolve([]);
            }
        });
    };

    app.saveSystem.getGLBMetadataFromStore = function (id) {
        return new Promise((resolve) => {
            if (!this.db || !id) {
                resolve(null);
                return;
            }

            try {
                const tx = this.db.transaction([this.glbStoreName], 'readonly');
                const req = tx.objectStore(this.glbStoreName).get(id);

                req.onsuccess = (event) => {
                    const v = event.target.result || null;
                    if (!v) {
                        resolve(null);
                        return;
                    }

                    resolve({
                        id: v.id || id,
                        name: safeText(v.name, '未命名模型'),
                        fileName: safeText(v.fileName, ''),
                        addedAt: safeFinite(v.addedAt, Date.now()),
                        sourceType: safeText(v.sourceType, v.base64 ? 'legacy' : 'local'),
                        sourceUrl: safeText(v.sourceUrl || v.url, ''),
                        sourcePath: safeText(v.sourcePath, ''),
                        localURL: safeText(v.localURL, ''),
                        hasStoredData: !!(v.base64 && String(v.base64).length > 10)
                    });
                };

                req.onerror = () => resolve(null);
            } catch (e) {
                resolve(null);
            }
        });
    };

    /* ======================================================================
     * 二、models.json 解析：只解析“名字 + 文件路径”
     * ====================================================================== */
    app._parseModelManifest = function (json) {
        const list = [];

        const push = (it) => {
            if (typeof it === 'string') {
                const f = it.trim();
                if (GLB_RE.test(f)) {
                    list.push({
                        name: f.replace(/.*\//, '').replace(/\.[^.]+$/, ''),
                        file: f
                    });
                }
                return;
            }

            if (it && typeof it === 'object') {
                const f = it.file || it.fileName || it.filename ||
                          it.path || it.url;

                if (f && GLB_RE.test(String(f))) {
                    list.push({
                        name: safeText(
                            it.name || it.title,
                            String(f).replace(/.*\//, '').replace(/\.[^.]+$/, '')
                        ),
                        file: String(f)
                    });
                }
            }
        };

        if (Array.isArray(json)) {
            json.forEach(push);
        } else if (json && typeof json === 'object') {
            const arr = json.models || json.list || json.files ||
                        json.items || json.data;

            if (Array.isArray(arr)) {
                arr.forEach(push);
            } else {
                Object.keys(json).forEach(k => {
                    const v = json[k];
                    if (typeof v === 'string' && GLB_RE.test(v)) {
                        push({ name: k, file: v });
                    }
                });
            }
        }

        const seen = new Set();

        return list.filter(it => {
            const k = String(it.file || '').toLowerCase();
            if (!k || seen.has(k)) return false;
            seen.add(k);
            return GLB_RE.test(k);
        });
    };

    /* ======================================================================
     * 三、模型库：启动只建目录索引，不读 GLB
     * ====================================================================== */
    app._upsertGLBCatalogRecord = async function (meta) {
        if (!meta || !meta.fileName) return null;

        const fileName = String(meta.fileName);
        const key = fileName.toLowerCase();

        let rec = this.glbLibrary.models.find(m =>
            String(m.fileName || '').toLowerCase() === key
        );

        if (rec) {
            let changed = false;

            if (meta.name && rec.name !== meta.name) {
                rec.name = meta.name;
                changed = true;
            }

            if (meta.sourceType && rec.sourceType !== meta.sourceType) {
                /*
                 * legacy/manual 记录优先保留；只有本来就是目录索引的记录才更新来源。
                 */
                if (rec.sourceType !== 'manual' &&
                    rec.sourceType !== 'legacy') {
                    rec.sourceType = meta.sourceType;
                    changed = true;
                }
            }

            if (meta.sourceUrl && rec.sourceUrl !== meta.sourceUrl) {
                if (!rec.sourceUrl || rec.sourceType === 'manifest') {
                    rec.sourceUrl = meta.sourceUrl;
                    changed = true;
                }
            }

            if (meta.sourcePath && rec.sourcePath !== meta.sourcePath) {
                rec.sourcePath = meta.sourcePath;
                changed = true;
            }

            if (meta.localURL && rec.localURL !== meta.localURL) {
                rec.localURL = meta.localURL;
                changed = true;
            }

            if (changed) {
                try {
                    await this.saveSystem.saveGLBToStore({
                        id: rec.id,
                        name: rec.name,
                        fileName: rec.fileName,
                        sourceType: rec.sourceType || 'local',
                        sourceUrl: rec.sourceUrl || '',
                        sourcePath: rec.sourcePath || '',
                        localURL: rec.localURL || '',
                        base64: rec.base64 || null,
                        addedAt: rec.addedAt || Date.now()
                    });
                } catch (e) {}
            }

            return rec;
        }

        rec = {
            id: 'glb_' + Date.now() + '_' + Math.floor(Math.random() * 100000),
            name: safeText(meta.name, key.replace(/\.[^.]+$/, '')),
            fileName: fileName,
            sourceType: meta.sourceType || 'manifest',
            sourceUrl: meta.sourceUrl || '',
            sourcePath: meta.sourcePath || '',
            localURL: meta.localURL || '',
            base64: null,
            addedAt: Date.now(),
            hasStoredData: false
        };

        this.glbLibrary.models.push(rec);

        /*
         * 关键：自动目录索引只保存元数据。
         * 不把 GLB 内容转 Base64，不创建大字符串，不把大对象写入 IndexedDB。
         */
        try {
            await this.saveSystem.saveGLBToStore({
                id: rec.id,
                name: rec.name,
                fileName: rec.fileName,
                sourceType: rec.sourceType,
                sourceUrl: rec.sourceUrl,
                sourcePath: rec.sourcePath,
                localURL: rec.localURL,
                base64: null,
                addedAt: rec.addedAt
            });
        } catch (e) {
            console.warn('[GLB Lazy] 元数据保存失败:', e);
        }

        return rec;
    };

    app.glbLibrary.init = async function () {
        try {
            /*
             * 这里彻底避免 getAll()：
             * 原代码 getAll() 会把每个历史 record 中的 base64 一次性复制到 JS 堆。
             */
            const list = await app.saveSystem.getAllGLBMetadataFromStore();
            this.models = Array.isArray(list) ? list : [];
        } catch (e) {
            this.models = [];
        }

        this.ensureUI();
        this.renderUI();

        if (this.models.length > 0) {
            console.log('[GLB Lazy] 模型库元数据已恢复:', this.models.length);
        }
    };

    app.glbLibrary.addModel = async function (name, base64, fileName, meta) {
        fileName = fileName || (name + '.glb');

        const exist = this.models.find(m =>
            String(m.fileName || '').toLowerCase() === String(fileName).toLowerCase()
        );

        if (exist) {
            /*
             * 手动导入同名模型时保留原有模型库语义；
             * 有新 base64 才更新数据，没有 base64 则仅更新目录来源。
             */
            if (base64 && base64.length > 10) {
                exist.base64 = base64;
                exist.sourceType = (meta && meta.sourceType) || 'manual';
                exist.sourceUrl = (meta && meta.sourceUrl) || exist.sourceUrl || '';
                exist.sourcePath = (meta && meta.sourcePath) || exist.sourcePath || '';
                exist.localURL = (meta && meta.localURL) || exist.localURL || '';
                exist.addedAt = Date.now();

                await app.saveSystem.saveGLBToStore({
                    id: exist.id,
                    name: name || exist.name,
                    fileName: exist.fileName,
                    base64: base64,
                    sourceType: exist.sourceType,
                    sourceUrl: exist.sourceUrl || '',
                    sourcePath: exist.sourcePath || '',
                    localURL: exist.localURL || '',
                    addedAt: exist.addedAt
                });

                exist.name = name || exist.name;
            }

            return exist;
        }

        const record = {
            id: 'glb_' + Date.now() + '_' + Math.floor(Math.random() * 100000),
            name: name || '未命名模型',
            fileName: fileName,
            base64: base64 || null,
            sourceType: (meta && meta.sourceType) || (base64 ? 'manual' : 'manifest'),
            sourceUrl: (meta && meta.sourceUrl) || '',
            sourcePath: (meta && meta.sourcePath) || '',
            localURL: (meta && meta.localURL) || '',
            addedAt: Date.now(),
            hasStoredData: !!(base64 && base64.length > 10)
        };

        this.models.push(record);

        await app.saveSystem.saveGLBToStore({
            id: record.id,
            name: record.name,
            fileName: record.fileName,
            base64: record.base64,
            sourceType: record.sourceType,
            sourceUrl: record.sourceUrl,
            sourcePath: record.sourcePath,
            localURL: record.localURL,
            addedAt: record.addedAt
        });

        return record;
    };

    app.glbLibrary.renderUI = function () {
        const grid = document.getElementById('glbLibraryGrid');
        const empty = document.getElementById('glbLibEmpty');
        const count = document.getElementById('glbLibCount');

        if (!grid) return;

        grid.innerHTML = '';

        const models = Array.isArray(this.models) ? this.models : [];

        if (count) count.innerText = String(models.length);

        if (models.length === 0) {
            if (empty) {
                empty.style.display = 'block';
                empty.innerText =
                    '📂 未发现模型清单\n' +
                    '请在 img/models.json 中配置模型名称和 .glb/.gltf/.fbx 文件';
            }
            return;
        }

        if (empty) {
            empty.style.display = 'block';
            empty.innerText =
                '✅ 模型库已建立（仅名称/路径索引）\n' +
                '点击模型后才读取对应 GLB 文件';
        }

        models.forEach(m => {
            const card = document.createElement('div');
            card.className = 'preset-card';
            card.style.position = 'relative';

            const icon = document.createElement('span');
            icon.className = 'preset-icon';
            icon.textContent = /\.fbx$/i.test(m.fileName || '') ? '🚶' : '🧊';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'preset-name';
            nameSpan.textContent = m.name || m.fileName || '未命名模型';
            nameSpan.title =
                (m.name || m.fileName || '') +
                '\n文件: ' + (m.fileName || '') +
                '\n点击后才加载模型';

            nameSpan.ondblclick = (e) => {
                e.stopPropagation();
                if (app.glbLibrary._promptRenameModel) {
                    app.glbLibrary._promptRenameModel(m.id);
                }
            };

            card.appendChild(icon);
            card.appendChild(nameSpan);

            card.onclick = () => {
                /*
                 * 只打开原有配置弹窗。
                 * 此处绝不读取 GLB。
                 */
                app.initAddGLBLibrary(m.id);
            };

            const renameBtn = document.createElement('span');
            renameBtn.className = 'glb-rename-btn';
            renameBtn.textContent = '✏️';
            renameBtn.title = '重命名';
            renameBtn.onclick = (e) => {
                e.stopPropagation();
                if (app.glbLibrary._promptRenameModel) {
                    app.glbLibrary._promptRenameModel(m.id);
                }
            };
            card.appendChild(renameBtn);

            const delBtn = document.createElement('span');
            delBtn.textContent = '✕';
            delBtn.title = '删除模型库记录';
            delBtn.style.cssText =
                'position:absolute;top:2px;right:4px;color:#e63946;' +
                'font-size:0.6rem;cursor:pointer;z-index:2;';

            delBtn.onclick = (e) => {
                e.stopPropagation();

                const remove = () => app.glbLibrary.removeModel(m.id);

                if (app.dialog && typeof app.dialog.confirm === 'function') {
                    app.dialog.confirm(
                        `从模型库删除 "${m.name}"？\n` +
                        '(注意: 场景中已摆放的实例仍遵循原有保存/还原规则)',
                        remove
                    );
                } else if (window.confirm(`从模型库删除 "${m.name}"？`)) {
                    remove();
                }
            };

            card.appendChild(delBtn);
            grid.appendChild(card);
        });
    };

    /* ======================================================================
     * 四、只扫描 models.json / 文件名，不读取 GLB
     * ====================================================================== */
    app._loadGLBCatalogFromManifest = async function () {
        let added = 0;

        for (let i = 0; i < MANIFEST_DIRS.length; i++) {
            const url = MANIFEST_DIRS[i];

            let txt = '';
            try {
                txt = await this._localFetch(url + 'models.json', true);
            } catch (e) {
                continue;
            }

            if (!txt) continue;

            let json;
            try {
                json = JSON.parse(txt.trim());
            } catch (e) {
                console.warn('[GLB Lazy] models.json 解析失败:', url, e);
                continue;
            }

            const list = this._parseModelManifest(json);
            if (!list.length) continue;

            const base = url;

            for (let i2 = 0; i2 < list.length; i2++) {
                const item = list[i2];

                if (!item.file) continue;

                let sourceUrl = '';
                try {
                    sourceUrl = new URL(item.file, base).href;
                } catch (e) {
                    sourceUrl = base + item.file;
                }

                await this._upsertGLBCatalogRecord({
                    name: item.name,
                    fileName: item.file,
                    sourceType: 'manifest',
                    sourceUrl: sourceUrl
                });

                added++;
                try {
                    this.glbLibrary._hint(
                        '📚 建立模型目录索引: ' +
                        (i2 + 1) + '/' + list.length +
                        ' · ' + item.name
                    );
                } catch (e) {}
            }

            /*
             * 找到一个有效 manifest 即可，不再继续读取其它候选目录，
             * 防止重复索引和重复写入。
             */
            break;
        }

        this.glbLibrary.renderUI();
        return added;
    };

    app._scanGLBFromAllDirs = async function () {
        if (!window.plus || !window.plus.io) return 0;

        let entries = [];

        try {
            entries = await this._scanAllCandidateDirs(
                function (name) { return GLB_RE.test(name); },
                2
            );
        } catch (e) {
            console.warn('[GLB Lazy] 目录索引失败:', e);
            return 0;
        }

        let indexed = 0;

        /*
         * 注意：这里只拿 FileEntry 的名字/路径。
         * 禁止调用 _readEntryAsBase64。
         */
        for (let i = 0; i < entries.length; i++) {
            const fe = entries[i];
            if (!fe || !fe.name || !GLB_RE.test(fe.name)) continue;

            let localURL = '';
            let sourcePath = '';

            try {
                sourcePath = fe.fullPath || '';
            } catch (e) {}

            try {
                localURL = this._getEntryLocalURL(fe) || '';
            } catch (e) {}

            await this._upsertGLBCatalogRecord({
                name: String(fe.name).replace(/\.[^.]+$/, ''),
                fileName: fe.name,
                sourceType: 'plus',
                sourcePath: sourcePath,
                localURL: localURL
            });

            indexed++;

            try {
                this.glbLibrary._hint(
                    '📚 建立 img 模型目录索引: ' +
                    (i + 1) + '/' + entries.length
                );
            } catch (e) {}
        }

        this.glbLibrary.renderUI();
        return indexed;
    };

    app._glbLoadSuccess = function (n) {
        this._glbLoadDone = true;
        this._glbRetryCount = 0;

        try {
            this.glbLibrary.renderUI();
        } catch (e) {}

        try {
            this.saveSystem.showToast(
                '📦 模型目录已建立，共 ' +
                (this.glbLibrary.models || []).length +
                ' 个模型；点击后才加载文件'
            );
        } catch (e) {}

        /*
         * 这里仍然触发已有场景的 GLB 待还原队列，
         * 但恢复本身由下面的串行队列控制。
         */
        setTimeout(() => {
            try { this._retryPendingGLBRestores(); } catch (e) {}
        }, 500);
    };

    app.autoLoadGLBLibrary = async function (force) {
        if (this._glbCatalogLoadingPromise && !force) {
            return this._glbCatalogLoadingPromise;
        }

        if (this._glbAutoLoadStarted && !force) return;

        this._glbAutoLoadStarted = true;

        this._glbCatalogLoadingPromise = (async () => {
            let indexed = 0;

            try {
                this.glbLibrary._hint('🔍 正在读取 img/models.json（只读取清单）...');
            } catch (e) {}

            try {
                indexed += await this._loadGLBCatalogFromManifest();
            } catch (e) {
                console.warn('[GLB Lazy] manifest 索引失败:', e);
            }

            /*
             * 只有 models.json 不存在/没有有效模型时才扫描目录。
             * 扫描目录同样只读文件名，不读文件内容。
             */
            if (indexed === 0 && window.plus && window.plus.io) {
                try {
                    this.glbLibrary._hint('🔍 未发现有效 models.json，正在建立 img 文件名索引...');
                    indexed += await this._scanGLBFromAllDirs();
                } catch (e) {
                    console.warn('[GLB Lazy] plus 目录索引失败:', e);
                }
            }

            if (indexed > 0) {
                this._glbLoadSuccess(indexed);
                return indexed;
            }

            try {
                this.glbLibrary._hint(
                    window.plus && window.plus.io
                        ? '⚠️ 未发现 .glb / .gltf / .fbx 模型清单或文件'
                        : '🌐 浏览器环境请通过 HTTP 服务并配置 img/models.json'
                );
            } catch (e) {}

            /*
             * 仅做一次轻量延迟重试；绝不重复读取 GLB。
             */
            if (!this._glbCatalogRetryTimer) {
                this._glbCatalogRetryTimer = setTimeout(async () => {
                    this._glbCatalogRetryTimer = null;
                    this._glbAutoLoadStarted = false;

                    try {
                        await this.autoLoadGLBLibrary(true);
                    } catch (e) {}
                }, 3000);
            }

            return 0;
        })();

        try {
            return await this._glbCatalogLoadingPromise;
        } finally {
            this._glbCatalogLoadingPromise = null;
        }
    };

    /* ======================================================================
     * 五、GLB 文件按需读取
     * ====================================================================== */
    app._readEntryAsArrayBuffer = function (entry) {
        return new Promise((resolve, reject) => {
            if (!entry) {
                reject(new Error('无效 FileEntry'));
                return;
            }

            try {
                entry.file((file) => {
                    try {
                        /*
                         * 优先标准 FileReader：只返回 ArrayBuffer。
                         * 避免 DataURL/Base64 再膨胀一次。
                         */
                        if (typeof FileReader !== 'undefined') {
                            const fr = new FileReader();

                            fr.onload = () => {
                                const ab = fr.result;

                                if (ab && ab.byteLength > 0) {
                                    resolve(ab);
                                    return;
                                }

                                reject(new Error('模型文件为空'));
                            };

                            fr.onerror = () => reject(new Error('模型文件读取失败'));

                            fr.readAsArrayBuffer(file);
                            return;
                        }
                    } catch (e) {}

                    /*
                     * 5+ 兼容兜底：使用原工程已有 plus FileReader，
                     * 仅在点击加载一个模型时使用。
                     */
                    try {
                        const PlusFR =
                            window.plus &&
                            window.plus.io &&
                            window.plus.io.FileReader;

                        if (!PlusFR) {
                            reject(new Error('当前环境不支持 ArrayBuffer 文件读取'));
                            return;
                        }

                        const fr = new PlusFR();

                        fr.onloadend = (evt) => {
                            try {
                                const result = evt && evt.target
                                    ? (evt.target.result || '')
                                    : '';

                                const idx = result.indexOf('base64,');
                                const b64 = idx >= 0
                                    ? result.substring(idx + 7)
                                    : result;

                                if (!b64 || b64.length < 10) {
                                    reject(new Error('模型文件为空'));
                                    return;
                                }

                                resolve(app.base64ToArrayBuffer(b64));
                            } catch (e) {
                                reject(e);
                            }
                        };

                        fr.onerror = () => reject(new Error('模型文件读取失败'));
                        fr.readAsDataURL(file);
                    } catch (e) {
                        reject(e);
                    }
                }, (err) => {
                    reject(err || new Error('获取模型文件失败'));
                });
            } catch (e) {
                reject(e);
            }
        });
    };

    app._loadGLBRecordArrayBuffer = function (rec) {
        if (!rec) {
            return Promise.reject(new Error('模型记录不存在'));
        }

        if (rec._loadingPromise) {
            return rec._loadingPromise;
        }

        rec._loadingPromise = (async () => {
            /*
             * 1) 本会话内刚导入且仍有 Base64：直接使用。
             *    解析完成后，调用方可清空内存副本。
             */
            if (rec.base64 && rec.base64.length > 10) {
                return app.base64ToArrayBuffer(rec.base64);
            }

            /*
             * 2) 5+App：按 sourcePath 找到指定 FileEntry。
             */
            if (rec.sourcePath && window.plus && window.plus.io) {
                try {
                    const ab = await new Promise((resolve, reject) => {
                        window.plus.io.resolveLocalFileSystemURL(
                            rec.sourcePath,
                            entry => resolve(entry),
                            err => reject(err || new Error('本地路径不存在'))
                        );
                    });

                    return await this._readEntryAsArrayBuffer(ab);
                } catch (e) {
                    console.warn('[GLB Lazy] sourcePath 读取失败:', e);
                }
            }

            /*
             * 3) manifest / localURL / sourceUrl：只请求用户当前点击的一个文件。
             */
            const url = rec.localURL || rec.sourceUrl || rec.sourcePath;

            if (url) {
                const data = await this._xhrArrayBuffer(url);

                if (!data || !data.byteLength) {
                    throw new Error('模型文件为空: ' + rec.fileName);
                }

                return data;
            }

            /*
             * 4) 老版本 IndexedDB 记录：数据库中仍有 base64，
             *    只在用户点击/已有场景恢复时单独取这一条。
             */
            if (rec.id) {
                try {
                    const old = await this.saveSystem.getGLBFromStore(rec.id);

                    if (old && old.base64 && old.base64.length > 10) {
                        return this.base64ToArrayBuffer(old.base64);
                    }

                    if (old) {
                        const oldURL = old.localURL || old.sourceUrl || old.sourcePath;
                        if (oldURL) {
                            const data = await this._xhrArrayBuffer(oldURL);
                            if (data && data.byteLength) return data;
                        }
                    }
                } catch (e) {}
            }

            throw new Error(
                '无法定位模型文件: ' + (rec.fileName || rec.name || '未知模型')
            );
        })();

        return rec._loadingPromise.finally(() => {
            rec._loadingPromise = null;
        });
    };

    /* ======================================================================
     * 六、GLTF/GLB/FBX 解析：单模型解析，保留原动画和模型规范化
     * ====================================================================== */
    app.createGLBFromArrayBuffer = function (
        data,
        name,
        type,
        features,
        opts = {}
    ) {
        return new Promise((resolve, reject) => {
            try {
                if (!data || !data.byteLength) {
                    reject(new Error('模型数据为空'));
                    return;
                }

                const fname =
                    String(opts.glbFileName || opts.fileName || '')
                        .toLowerCase();

                const isFBX =
                    /\.fbx$/.test(fname) ||
                    opts.forceFBX === true;

                const isGLTFJson = /\.gltf$/.test(fname);

                if (data.byteLength > MAX_GLTF_GLTF_BYTES) {
                    reject(new Error(
                        '模型文件过大(>' +
                        (MAX_GLTF_GLTF_BYTES / (1024 * 1024)) +
                        'MB), 请压缩后再加载'
                    ));
                    return;
                }

                const finish = (sceneObj, animations) => {
                    try {
                        /*
                         * 完全沿用原有 _buildModelFromScene：
                         * normalizeModelTransform
                         * material / PBR
                         * floorIndex
                         * light
                         * walker + AnimationMixer
                         * restoreData / manualPosition
                         */
                        const group = this._buildModelFromScene(
                            sceneObj,
                            animations || [],
                            name,
                            type,
                            features,
                            opts
                        );

                        resolve(group);
                    } catch (err) {
                        reject(err);
                    }
                };

                const fail = (err) => {
                    console.error('模型解析失败:', err);
                    reject(new Error(
                        (err && err.message) || '模型解析失败'
                    ));
                };

                if (isFBX) {
                    this.ensureFBXLoader().then(() => {
                        try {
                            const fbxObj =
                                new THREE.FBXLoader().parse(data, '');

                            finish(
                                fbxObj,
                                fbxObj.animations || []
                            );
                        } catch (e) {
                            fail(new Error(
                                'FBX解析失败: ' + (e.message || e)
                            ));
                        }
                    }).catch(fail);

                    return;
                }

                try {
                    const loader = new THREE.GLTFLoader();

                    let parsedData = data;

                    if (isGLTFJson) {
                        try {
                            parsedData = new TextDecoder('utf-8')
                                .decode(data);
                        } catch (e) {
                            let binary = '';
                            const bytes = new Uint8Array(data);
                            const step = 0x8000;

                            for (let i = 0; i < bytes.length; i += step) {
                                binary += String.fromCharCode.apply(
                                    null,
                                    bytes.subarray(
                                        i,
                                        Math.min(i + step, bytes.length)
                                    )
                                );
                            }

                            parsedData = decodeURIComponent(
                                escape(binary)
                            );
                        }
                    }

                    /*
                     * 原工程使用空路径解析 .gltf。
                     * 为保持原功能，外链 .bin 的语义不改；
                     * 模型库推荐继续使用单文件 .glb。
                     */
                    loader.parse(
                        parsedData,
                        '',
                        (gltf) => {
                            finish(
                                gltf.scene,
                                gltf.animations || []
                            );
                        },
                        fail
                    );
                } catch (e) {
                    fail(e);
                }
            } catch (e) {
                reject(e);
            }
        });
    };

    app.createGLBFromBase64 = function (
        base64,
        name,
        type,
        features,
        opts = {}
    ) {
        return new Promise((resolve, reject) => {
            try {
                if (!base64 || base64.length < 10) {
                    reject(new Error('模型数据为空'));
                    return;
                }

                const data = this.base64ToArrayBuffer(base64);

                this.createGLBFromArrayBuffer(
                    data,
                    name,
                    type,
                    features,
                    opts
                ).then(resolve).catch(reject);
            } catch (e) {
                reject(e);
            }
        });
    };

    /* ======================================================================
     * 七、点击模型库卡片后才真正读取 GLB
     * ====================================================================== */
    app.initAddGLBLibrary = function (libId) {
        const rec = this.glbLibrary.models.find(m => m.id === libId);

        if (!rec) {
            this.saveSystem.showToast(
                '⚠️ 模型记录不存在，请点击模型库“🔄 重扫”'
            );
            return;
        }

        /*
         * 这里不触碰 GLB 数据。
         * 用户取消配置也绝不会产生任何 GLB 文件读取。
         */
        this.tempObjectData = {
            sourceType: 'glb_lib',
            libId: libId,
            defaultName: rec.name,
            defaultCategory: 'furniture'
        };

        this.showConfigModal();
    };

    app._glbHeavyLoadQueue = app._glbHeavyLoadQueue || Promise.resolve();

    app._enqueueGLBHeavyLoad = function (task) {
        const run = async () => {
            await yieldToUI();
            return task();
        };

        const p = this._glbHeavyLoadQueue.then(run, run);

        this._glbHeavyLoadQueue = p.catch(() => {});
        return p;
    };

    app.addGLBFromLibraryToScene = async function (
        libId,
        name,
        type,
        features,
        walkConfig
    ) {
        let rec =
            this.glbLibrary.models.find(m => m.id === libId) || null;

        /*
         * 理论上 init() 已经建立索引；这里保留数据库兼容兜底。
         */
        if (!rec) {
            try {
                rec = await this.saveSystem.getGLBMetadataFromStore(libId);
                if (rec) {
                    this.glbLibrary.models.push(rec);
                    this.glbLibrary.renderUI();
                }
            } catch (e) {}
        }

        if (!rec) {
            this.saveSystem.showToast(
                '❌ 模型数据不存在，请点击模型库“🔄 重扫”'
            );
            return;
        }

        this.saveSystem.showToast(
            `⏳ 正在加载模型 "${name || rec.name}" ...`
        );

        try {
            await this._enqueueGLBHeavyLoad(async () => {
                let data = null;

                try {
                    data = await this._loadGLBRecordArrayBuffer(rec);

                    /*
                     * 这里只处理当前用户点击的一个模型。
                     */
                    await this.createGLBFromArrayBuffer(
                        data,
                        name || rec.name,
                        type,
                        features,
                        {
                            glbLibId: libId,
                            glbFileName: rec.fileName,
                            walkConfig: walkConfig || null,
                            sourceType: 'glb',
                            silent: false
                        }
                    );
                } finally {
                    /*
                     * 释放临时 ArrayBuffer 引用。
                     */
                    data = null;

                    /*
                     * 手动导入模型如果当前对象还持有 Base64，
                     * 解析完成后释放内存副本；数据库仍保留原数据。
                     */
                    if (rec.sourceType === 'manual' &&
                        rec.base64 &&
                        rec.base64.length > 10) {
                        rec.base64 = null;
                        rec.hasStoredData = true;
                    }
                }
            });

            this.saveSystem.showToast(
                `✅ 模型 "${name || rec.name}" 已添加到场景`
            );
        } catch (e) {
            console.error('GLB添加失败:', e);

            const hint = /\.gltf$/i.test(rec.fileName || '')
                ? '（外链 .gltf 若引用外部 .bin/纹理，建议改为单文件 .glb）'
                : '';

            this.saveSystem.showToast(
                '❌ 模型加载失败: ' +
                ((e && e.message) || e) + hint
            );
        }
    };

    /* ======================================================================
     * 八、场景恢复：保留原功能，但改为串行重载
     * ====================================================================== */
    app._restoreGLBObjectNowV1 = async function (objData) {
        if (!objData) return false;

        let rec = null;
        let usedId = objData.glbLibId || null;

        if (usedId) {
            rec = this.glbLibrary.models.find(m => m.id === usedId) || null;
        }

        if (!rec && (objData.glbName || objData.name)) {
            const key = String(
                objData.glbName || objData.name || ''
            ).toLowerCase();

            if (key) {
                rec =
                    this.glbLibrary.models.find(m =>
                        String(m.fileName || '').toLowerCase() === key
                    ) ||
                    this.glbLibrary.models.find(m =>
                        String(m.name || '').toLowerCase() ===
                        key.replace(/\.[^.]+$/, '')
                    );

                if (rec) usedId = rec.id;
            }
        }

        if (!rec && usedId) {
            const meta =
                await this.saveSystem.getGLBMetadataFromStore(usedId);

            if (meta) {
                rec = meta;

                if (!this.glbLibrary.models.some(m => m.id === meta.id)) {
                    this.glbLibrary.models.push(meta);
                    this.glbLibrary.renderUI();
                }
            }
        }

        if (!rec) {
            console.warn(
                '模型记录暂缺，已加入自动重试队列:',
                objData.name
            );

            this.glbMissingCount =
                (this.glbMissingCount || 0) + 1;

            (this._pendingGLBRestores =
                this._pendingGLBRestores || []).push(objData);

            return false;
        }

        let data = null;

        try {
            data = await this._loadGLBRecordArrayBuffer(rec);

            await this.createGLBFromArrayBuffer(
                data,
                objData.name,
                objData.type,
                objData.features,
                {
                    glbLibId: usedId || rec.id || null,
                    glbFileName:
                        objData.glbName ||
                        rec.fileName ||
                        objData.name,
                    silent: true,
                    restoreData: objData
                }
            );

            return true;
        } catch (e) {
            console.error(
                '模型还原失败:',
                objData.name,
                e
            );

            this.glbMissingCount =
                (this.glbMissingCount || 0) + 1;

            return false;
        } finally {
            data = null;
        }
    };

    app.restoreGLBObject = function (objData) {
        if (!objData) return Promise.resolve(false);

        /*
         * serialize/deserializeScene 仍可保持 Promise.all，
         * 但真正的重型 GLB 读取/解析在这里统一串行。
         */
        const task = () =>
            this._restoreGLBObjectNowV1(objData);

        return this._enqueueGLBHeavyLoad(task);
    };

    app._retryPendingGLBRestores = async function () {
        if (!this._pendingGLBRestores ||
            this._pendingGLBRestores.length === 0) {
            return;
        }

        const pending = this._pendingGLBRestores.slice();
        this._pendingGLBRestores = [];

        let restored = 0;

        for (let i = 0; i < pending.length; i++) {
            const od = pending[i];

            try {
                const ok = await this.restoreGLBObject(od);

                if (ok) {
                    restored++;
                } else {
                    this._pendingGLBRestores.push(od);
                }
            } catch (e) {
                console.warn(
                    'GLB重试还原失败:',
                    od && od.name,
                    e
                );

                this._pendingGLBRestores.push(od);
            }

            await yieldToUI();
        }

        if (restored > 0) {
            try {
                this.generate3D();
                this.updateSceneVisibility();

                if (this.isPlayMode) this.createLabels();

                this.saveSystem.showToast(
                    `✅ 已自动补齐还原 ${restored} 个模型`
                );
            } catch (e) {}
        }

        if (this._pendingGLBRestores.length > 0) {
            this._glbRetryCount =
                (this._glbRetryCount || 0) + 1;

            if (this._glbRetryCount <= 8) {
                setTimeout(() => {
                    try {
                        this._retryPendingGLBRestores();
                    } catch (e) {}
                }, 4000);
            } else {
                this.saveSystem.showToast(
                    '⚠️ 仍有 ' +
                    this._pendingGLBRestores.length +
                    ' 个模型待还原，请检查 models.json / 模型文件'
                );
            }
        } else {
            this._glbRetryCount = 0;
        }
    };

    /* ======================================================================
     * 九、修正模型库说明文字（不改 HTML 文件结构）
     * ====================================================================== */
    const refreshGLBPanelHint = () => {
        try {
            const el = document.getElementById('glbLibEmpty');
            if (el && (!app.glbLibrary.models ||
                app.glbLibrary.models.length === 0)) {
                el.innerText =
                    '🔍 正在读取 models.json 清单（不加载 GLB 内容）...';
            }

            const panel =
                document.getElementById('glbLibraryPanel');

            if (panel) {
                const info = panel.querySelector(
                    '[data-glb-lazy-hint="1"]'
                );

                if (!info) {
                    const p = document.createElement('div');
                    p.setAttribute('data-glb-lazy-hint', '1');
                    p.style.cssText =
                        'font-size:0.6rem;color:#666;' +
                        'line-height:1.6;margin-top:4px;';

                    p.innerHTML =
                        '💡 模型库启动时只读取 models.json 的“名称/文件路径”。' +
                        '<br>点击模型并确认添加后，才加载对应 GLB/GLTF/FBX。' +
                        '<br>这样可避免手机客户端启动时同时读取全部模型导致内存峰值。';

                    panel.appendChild(p);
                }
            }
        } catch (e) {}
    };

    refreshGLBPanelHint();

    /*
     * 若面板稍后由 glbLibrary.ensureUI() 创建，再做一次轻量同步。
     */
    setTimeout(refreshGLBPanelHint, 500);

    console.info(
        '[GLB Lazy V1] 已启用：启动只建立模型索引；点击确认添加后才加载指定 GLB；场景恢复串行化。'
    );
})();
/* ============================================================================
 * ★★★ 户型/房间「从img库选择贴图」弹窗 —— 移动端触摸滚动修复 v1 ★★★
 * 
 * 【问题】
 *   手机客户端中，打开「🖼️ 从img库选择贴图」弹窗后：
 *     · 图片网格 (#roomTexGrid / #floorTexGrid) 无法用手指上下滑动
 *     · 只能看到前面几行图片，下方图片显示不全、无法点选
 * 
 * 【根因】
 *   Android WebView 下，position:fixed 的模态框 + 内层 overflow-y:auto 
 *   的网格，会在 Chromium 合成层中出现"原生 touchmove 被吞掉"的问题，
 *   与侧边栏 (.sidebar) 触摸滚动失效完全同源。
 * 
 * 【方案】
 *   复用侧边栏 V2 方案的成熟思路，为网格容器手动接管 touchstart / 
 *   touchmove / touchend：
 *     · 直接写 scrollTop，完全绕过原生滚动机制
 *     · 加入惯性动量，模拟原生顺滑手感
 *     · 边界阻尼（拖出范围时手感更柔和）
 *     · 位移 > 6px 时抑制 click，防止滑动误触选图
 *     · MutationObserver 自动监听弹窗动态创建 → 100% 覆盖
 * 
 * 【覆盖范围】
 *   · #roomTexGrid   —— 「户型编辑窗口 / 主画布 房间设置」的贴图选择器
 *   · #floorTexGrid  —— 「全楼层地板纹理」的选择器
 *   · 顺带修复所有内部动态网格
 * 
 * 【完全不影响】
 *   · 桌面端（鼠标行为不变）
 *   · 弹窗的按钮 / 关闭 / 刷新 / 上传等交互
 *   · 图片缩略图渲染与点击应用逻辑
 * ============================================================================ */
(function installModalGridTouchScrollFixV1() {
    'use strict';
    if (typeof app === 'undefined' || !app) return;
    if (app.__modalGridTouchScrollFixV1Installed) return;
    app.__modalGridTouchScrollFixV1Installed = true;

    /* ======================================================================
     * §1  配置
     * ====================================================================== */
    const CFG = {
        friction:       0.94,   // 惯性摩擦（越小越快停止）
        minVelocity:    0.5,    // 停止惯性阈值 (px/frame@60fps)
        moveTolerance:  6,      // 位移超过此值判定为滑动（抑制 click）
        boundaryDamp:   0.35,   // 边界阻尼系数
        momentumMax:    40,     // 单帧最大惯性位移
        suppressMs:     320     // 滑动后抑制 click 的时长
    };

    const GRID_IDS = ['roomTexGrid', 'floorTexGrid'];

    /* ======================================================================
     * §2  注入 CSS（消除合成层 + 放大可滚动区域 + 触摸体验优化）
     * ====================================================================== */
    function injectStyles() {
        if (document.getElementById('modalGridTouchScrollStylesV1')) return;
        const s = document.createElement('style');
        s.id = 'modalGridTouchScrollStylesV1';
        s.textContent = `
        /* ---------- 弹窗网格：关闭合成层副作用 + 允许纵向滚动 ---------- */
        #roomTexGrid, #floorTexGrid {
            touch-action: pan-y !important;
            overscroll-behavior: contain !important;
            -webkit-overflow-scrolling: auto !important;
            will-change: auto !important;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            -webkit-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
            /* ★ 移动端给网格更多可见高度，减少滚动次数 */
            max-height: 68vh !important;
            min-height: 160px !important;
            padding: 12px 10px !important;
        }
        #roomTexGrid.mg-scrolling,
        #floorTexGrid.mg-scrolling {
            transition: none !important;
        }

        /* ---------- 缩略图单元格：加大触摸热区 ---------- */
        #roomTexGrid > div,
        #floorTexGrid > div {
            touch-action: manipulation;
            -webkit-tap-highlight-color: rgba(76,201,240,0.25);
            transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        #roomTexGrid > div:active,
        #floorTexGrid > div:active {
            transform: scale(0.96);
            box-shadow: 0 0 12px rgba(76,201,240,0.6);
        }
        #roomTexGrid img,
        #floorTexGrid img {
            pointer-events: none;
            -webkit-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
        }

        /* ---------- 弹窗本体：避免与内部网格争抢滚动 ---------- */
        #roomTexPickerModal,
        #floorTexPickerModal {
            touch-action: manipulation;
        }

        /* ---------- 弹窗内卡片：小屏适配 ---------- */
        @media screen and (max-width: 480px) {
            #roomTexGrid, #floorTexGrid {
                grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)) !important;
                gap: 7px !important;
                max-height: 62vh !important;
                min-height: 180px !important;
            }
        }

        /* ---------- 超小屏：每行 3 张，缩略图更大更好点 ---------- */
        @media screen and (max-width: 360px) {
            #roomTexGrid, #floorTexGrid {
                grid-template-columns: repeat(3, 1fr) !important;
                gap: 6px !important;
            }
        }
        `;
        document.head.appendChild(s);
    }

    /* ======================================================================
     * §3  判断触摸目标是否为交互控件（是则交给原生处理）
     * ====================================================================== */
    function isInteractiveTarget(el, root) {
        let node = el;
        while (node && node !== root && node.nodeType === 1) {
            const tag = node.tagName ? node.tagName.toUpperCase() : '';
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
            if (tag === 'BUTTON' || tag === 'A') return true;
            node = node.parentElement;
        }
        return false;
    }

    /* ======================================================================
     * §4  ★ 核心：为单个网格容器启用「JS 手动滚动 + 惯性 + 点击抑制」
     * ====================================================================== */
    app._attachManualScrollToGrid = function (el) {
        if (!el) return;
        if (el.dataset.mgScrollBound === '1') return;
        el.dataset.mgScrollBound = '1';

        /* ---------- 内联样式兜底（即使外部 CSS 未生效也能工作） ---------- */
        try {
            el.style.setProperty('touch-action', 'pan-y', 'important');
            el.style.setProperty('overflow-y', 'auto', 'important');
            el.style.setProperty('overflow-x', 'hidden', 'important');
            el.style.setProperty('-webkit-overflow-scrolling', 'auto', 'important');
            el.style.setProperty('overscroll-behavior', 'contain', 'important');
            el.style.setProperty('will-change', 'auto', 'important');
        } catch (e) {}

        /* ---------- 状态变量 ---------- */
        let startY = 0;
        let startScrollTop = 0;
        let lastY = 0;
        let lastTime = 0;
        let velocity = 0;
        let isTouching = false;
        let skipNative = false;
        let moved = false;
        let momentumRAF = null;
        let suppressClickUntil = 0;

        const cancelMomentum = () => {
            if (momentumRAF) {
                cancelAnimationFrame(momentumRAF);
                momentumRAF = null;
            }
        };

        const getMaxScroll = () =>
            Math.max(0, el.scrollHeight - el.clientHeight);

        /* ---------------- touchstart ---------------- */
        const onTouchStart = (e) => {
            if (e.touches.length !== 1) {
                isTouching = false;
                cancelMomentum();
                return;
            }
            // 交互控件 → 交给原生处理
            if (isInteractiveTarget(e.target, el)) {
                skipNative = true;
                isTouching = false;
                return;
            }
            skipNative = false;
            cancelMomentum();
            isTouching = true;
            moved = false;

            startY = e.touches[0].clientY;
            lastY = startY;
            lastTime = Date.now();
            startScrollTop = el.scrollTop;
            velocity = 0;

            try {
                el.classList.add('mg-scrolling');
                el.style.setProperty('will-change', 'auto', 'important');
            } catch (err) {}
        };

        /* ---------------- touchmove（核心：手动写 scrollTop） ---------------- */
        const onTouchMove = (e) => {
            if (!isTouching || skipNative) return;
            if (e.touches.length !== 1) return;

            const y = e.touches[0].clientY;
            const now = Date.now();
            const dt = Math.max(1, now - lastTime);

            // 速度计算（px / frame@60fps）
            velocity = (lastY - y) / dt * 16;

            lastY = y;
            lastTime = now;

            const dy = startY - y;
            if (Math.abs(dy) > CFG.moveTolerance) moved = true;

            const maxScroll = getMaxScroll();
            let newTop = startScrollTop + dy;

            // 边界阻尼
            if (newTop < 0) {
                newTop = newTop * CFG.boundaryDamp;
            } else if (newTop > maxScroll) {
                newTop = maxScroll + (newTop - maxScroll) * CFG.boundaryDamp;
            }

            el.scrollTop = newTop;

            // ★ 关键：阻止默认行为，彻底摆脱原生滚动失效的困扰
            if (e.cancelable) e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
        };

        /* ---------------- touchend（触发惯性 + 抑制后续 click） ---------------- */
        const onTouchEnd = () => {
            if (!isTouching) {
                skipNative = false;
                return;
            }
            isTouching = false;
            try { el.classList.remove('mg-scrolling'); } catch (err) {}

            // ★ 有滑动位移 → 抑制接下来的 click，防止误触选图
            if (moved) {
                suppressClickUntil = Date.now() + CFG.suppressMs;
            }

            // 惯性滚动
            const applyMomentum = () => {
                if (Math.abs(velocity) < CFG.minVelocity) {
                    momentumRAF = null;
                    // 回弹到有效范围
                    const maxScroll = getMaxScroll();
                    if (el.scrollTop < 0) el.scrollTop = 0;
                    else if (el.scrollTop > maxScroll) el.scrollTop = maxScroll;
                    return;
                }

                const maxScroll = getMaxScroll();
                let step = velocity;
                if (step > CFG.momentumMax) step = CFG.momentumMax;
                if (step < -CFG.momentumMax) step = -CFG.momentumMax;

                let newTop = el.scrollTop + step;
                if (newTop <= 0) { newTop = 0; velocity = 0; }
                else if (newTop >= maxScroll) { newTop = maxScroll; velocity = 0; }

                el.scrollTop = newTop;
                velocity *= CFG.friction;

                if (Math.abs(velocity) >= CFG.minVelocity) {
                    momentumRAF = requestAnimationFrame(applyMomentum);
                } else {
                    momentumRAF = null;
                }
            };
            applyMomentum();
            skipNative = false;
        };

        /* ---------------- touchcancel ---------------- */
        const onTouchCancel = () => {
            isTouching = false;
            skipNative = false;
            cancelMomentum();
            try { el.classList.remove('mg-scrolling'); } catch (err) {}
        };

        /* ---------------- 事件绑定 ---------------- */
        el.addEventListener('touchstart', onTouchStart, { passive: true });
        el.addEventListener('touchmove', onTouchMove, { passive: false });
        el.addEventListener('touchend', onTouchEnd, { passive: true });
        el.addEventListener('touchcancel', onTouchCancel, { passive: true });

        // ★ 捕获阶段拦截 click，滑动后 320ms 内的点击全部吞掉
        el.addEventListener('click', (e) => {
            if (Date.now() < suppressClickUntil) {
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
        }, true);

        // 记录到全局便于诊断
        if (!app._mgScrollTargets) app._mgScrollTargets = [];
        if (app._mgScrollTargets.indexOf(el) === -1) {
            app._mgScrollTargets.push(el);
        }
    };

    /* ======================================================================
     * §5  ★ 尝试为 ID 对应的网格挂载
     * ====================================================================== */
    function tryAttach(id) {
        const el = document.getElementById(id);
        if (el && typeof app._attachManualScrollToGrid === 'function') {
            app._attachManualScrollToGrid(el);
        }
    }

    function attachAll() {
        GRID_IDS.forEach(tryAttach);
    }

    /* ======================================================================
     * §6  ★ MutationObserver：监听弹窗动态创建
     * ----------------------------------------------------------------------
     * 因为 _showRoomTexturePicker / _showFloorTexturePicker 会动态
     * appendChild(modal)，需要监听 body 变化，将新网格立刻接管。
     * ====================================================================== */
    function observeBody() {
        if (!window.MutationObserver) return;
        if (app._mgScrollObserver) return;

        try {
            app._mgScrollObserver = new MutationObserver((mutations) => {
                let needAttach = false;
                for (let i = 0; i < mutations.length; i++) {
                    const m = mutations[i];
                    if (m.type !== 'childList' || m.addedNodes.length === 0) continue;

                    for (let j = 0; j < m.addedNodes.length; j++) {
                        const n = m.addedNodes[j];
                        if (!n || n.nodeType !== 1) continue;

                        // 自身就是目标网格
                        if (n.id && GRID_IDS.indexOf(n.id) !== -1) {
                            needAttach = true;
                            continue;
                        }
                        // 内部包含目标网格
                        if (n.querySelector) {
                            for (let k = 0; k < GRID_IDS.length; k++) {
                                if (n.querySelector('#' + GRID_IDS[k])) {
                                    needAttach = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (needAttach) break;
                }

                if (needAttach) {
                    // 使用微任务 + 双重延迟，确保 DOM 完全就绪
                    if (app._mgAttachTimer) clearTimeout(app._mgAttachTimer);
                    app._mgAttachTimer = setTimeout(() => {
                        app._mgAttachTimer = null;
                        attachAll();
                    }, 30);
                }
            });

            app._mgScrollObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        } catch (e) {
            console.warn('[ModalGridScroll] MutationObserver 初始化失败:', e);
        }
    }

    /* ======================================================================
     * §7  ★ 包装 picker 函数：渲染后立即接管
     * ====================================================================== */
    const _origShowRoomTexPicker = app._showRoomTexturePicker;
    if (typeof _origShowRoomTexPicker === 'function') {
        app._showRoomTexturePicker = async function () {
            const r = await _origShowRoomTexPicker.apply(this, arguments);
            // 弹窗刚创建完毕，多时间点尝试接管（覆盖异步渲染）
            setTimeout(() => tryAttach('roomTexGrid'), 0);
            setTimeout(() => tryAttach('roomTexGrid'), 80);
            setTimeout(() => tryAttach('roomTexGrid'), 300);
            setTimeout(() => tryAttach('roomTexGrid'), 800);
            return r;
        };
    }

    const _origShowFloorTexPicker = app._showFloorTexturePicker;
    if (typeof _origShowFloorTexPicker === 'function') {
        app._showFloorTexturePicker = async function () {
            const r = await _origShowFloorTexPicker.apply(this, arguments);
            setTimeout(() => tryAttach('floorTexGrid'), 0);
            setTimeout(() => tryAttach('floorTexGrid'), 80);
            setTimeout(() => tryAttach('floorTexGrid'), 300);
            setTimeout(() => tryAttach('floorTexGrid'), 800);
            return r;
        };
    }

    /* ======================================================================
     * §8  ★ 对外 API：手动修复 / 诊断
     * ====================================================================== */
    app.fixModalGridScroll = function () {
        attachAll();
        this.saveSystem.showToast('🔧 贴图选择器触摸滚动已修复');
    };

    app.diagnoseModalGridScroll = function () {
        const result = [];
        GRID_IDS.forEach(id => {
            const el = document.getElementById(id);
            if (!el) {
                result.push({ id: id, status: '未找到（弹窗未打开）' });
                return;
            }
            const cs = window.getComputedStyle(el);
            result.push({
                id: id,
                status: '已找到',
                scrollHeight: el.scrollHeight,
                clientHeight: el.clientHeight,
                canScroll: el.scrollHeight > el.clientHeight,
                overflowY: cs.overflowY,
                touchAction: cs.touchAction,
                willChange: cs.willChange,
                manualBound: el.dataset.mgScrollBound === '1',
                childCount: el.children.length
            });
        });
        console.log('=== 贴图选择器网格滚动诊断 ===');
        console.table(result);

        result.forEach(item => {
            if (item.status !== '已找到') return;
            if (!item.canScroll) {
                console.warn('⚠️ ' + item.id + ' 内容不足以滚动（scrollHeight <= clientHeight）');
            } else if (!item.manualBound) {
                console.warn('⚠️ ' + item.id + ' 手动滚动未绑定！执行 app.fixModalGridScroll() 修复');
            } else {
                console.log('✅ ' + item.id + ' 手动滚动已正确绑定');
            }
        });
        return result;
    };

    /* ======================================================================
     * §9  ★ 启动
     * ====================================================================== */
    injectStyles();

    // DOM 就绪后开始监听
    const boot = () => {
        try { attachAll(); } catch (e) {}
        try { observeBody(); } catch (e) {}
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 100));
    } else {
        setTimeout(boot, 100);
    }

    // 窗口尺寸 / 方向变化后重新尝试
    window.addEventListener('resize', () => {
        if (app._mgResizeTimer) clearTimeout(app._mgResizeTimer);
        app._mgResizeTimer = setTimeout(() => {
            try { attachAll(); } catch (e) {}
        }, 150);
    });
    window.addEventListener('orientationchange', () => {
        setTimeout(() => { try { attachAll(); } catch (e) {} }, 400);
    });

    /* ======================================================================
     * §10  启动横幅
     * ====================================================================== */
    console.info('╔══════════════════════════════════════════════════════════╗');
    console.info('║  [ModalGridScroll v1] 贴图选择器触摸滚动修复已启用        ║');
    console.info('║  ✓ JS 手动滚动: 绕过合成层吞事件的 bug                    ║');
    console.info('║  ✓ 惯性动量 + 边界阻尼: 模拟原生顺滑手感                  ║');
    console.info('║  ✓ 滑动 > 6px 抑制 click: 防止误触选图                    ║');
    console.info('║  ✓ MutationObserver: 自动接管动态创建的弹窗               ║');
    console.info('║  ✓ 覆盖: #roomTexGrid / #floorTexGrid                     ║');
    console.info('║  ✓ 控制台: app.fixModalGridScroll() /                    ║');
    console.info('║            app.diagnoseModalGridScroll()                 ║');
    console.info('╚══════════════════════════════════════════════════════════╝');

})();/* ============================================================================
 * ★★★ HBuilderX 5+ APP / Android WebView GLB Compatibility V2 ★★★
 *
 * 目标：
 *   1) 不改原有业务入口、UI、户型编辑、楼层、IoT、材质、特效、保存等功能；
 *   2) 统一桌面浏览器 / HBuilderX 模拟器 / 真机的 GLB/GLTF/FBX 数据读取路径；
 *   3) 以“静止几何包围盒”而不是动画后 Box3 作为模型初始规范化依据，
 *      避免 SkinnedMesh / 骨骼动画模型在移动端因包围盒/根节点差异而比例异常；
 *   4) 骨骼模型：保留 SkinnedMesh、bindMatrix、skeleton、morph/skin 属性，
 *      不改骨骼层级，不把模型拆开，不把动画绑定到外层业务 Group；
 *   5) 原生绑定动画：始终以 GLTFLoader 返回的 gltf.scene 为 Mixer root，
 *      完整保存 nativeAnimationConfig，真机恢复后继续检测/播放；
 *   6) 新导入超大模型：首次加入场景时按当前户型尺度做一次安全自适应，
 *      用户手动调整后的 transform 不再被后续刷新自动覆盖；
 *   7) Base64 转 ArrayBuffer 使用分块方式，降低 Android WebView 瞬时内存峰值；
 *   8) HBuilderX/plus FileEntry 优先于 XHR，避免 file:// / _www 路径在真机 WebView
 *      下出现“模拟器能读、安装包读不到”的差异。
 *
 * 注意：本层只增强 GLB/GLTF/FBX 的兼容性和恢复链路，不替换原工程其它功能。
 * ============================================================================ */
(function installMobileGLBCompatibilityV2() {
    'use strict';

    if (typeof app === 'undefined' || !app || typeof THREE === 'undefined') return;
    if (app.__mobileGLBCompatibilityV2Installed) return;
    app.__mobileGLBCompatibilityV2Installed = true;

    const CFG = {
        targetScaleRatioMin: 0.60,
        targetScaleRatioMax: 1.60,
        sceneFitRatio: 0.46,
        wallFitRatio: 0.92,
        hardMaxWorldSize: 80,
        minWorldSize: 0.0001,
        mobilePixelRatioMax: 1.25,
        parseChunkChars: 0x8000,
        repairPasses: [250, 900, 2200, 5000]
    };

    const isFiniteNum = (v) => typeof v === 'number' && isFinite(v);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const safeName = (v) => String(v == null ? '' : v).trim();

    app._mobileGLBIsMobile = function () {
        try {
            const ua = navigator.userAgent || '';
            return /Android|Adr|iPhone|iPad|iPod|HarmonyOS/i.test(ua) ||
                (!!window.plus && /mobile/i.test(ua));
        } catch (e) {
            return !!(window.plus && window.plus.io);
        }
    };

    /* ------------------------------------------------------------------------
     * 1. 分块 Base64 -> ArrayBuffer
     * ------------------------------------------------------------------------ */
    app.base64ToArrayBuffer = function (base64) {
        if (!base64 || typeof base64 !== 'string') {
            throw new Error('无效 Base64 数据');
        }

        let s = base64.trim();
        const comma = s.indexOf(',');
        if (comma >= 0) s = s.substring(comma + 1);
        s = s.replace(/\s+/g, '');
        if (!s) throw new Error('Base64 数据为空');

        const mod = s.length % 4;
        if (mod === 1) throw new Error('Base64 数据长度非法');
        if (mod > 0) s += '='.repeat(4 - mod);

        const padding = s.endsWith('==') ? 2 : (s.endsWith('=') ? 1 : 0);
        const totalLen = Math.max(0, Math.floor(s.length * 3 / 4) - padding);
        const out = new Uint8Array(totalLen);

        let outOffset = 0;
        const step = Math.max(4, CFG.parseChunkChars - (CFG.parseChunkChars % 4));
        for (let i = 0; i < s.length; i += step) {
            const chunk = s.substring(i, Math.min(i + step, s.length));
            const bin = atob(chunk);
            for (let j = 0; j < bin.length && outOffset < totalLen; j++) {
                out[outOffset++] = bin.charCodeAt(j);
            }
        }
        return out.buffer;
    };

    /* ------------------------------------------------------------------------
     * 2. GLB 数据签名校验：真机错误路径时尽早报告，不让损坏二进制进入解析器
     * ------------------------------------------------------------------------ */
    app._validateGLBArrayBuffer = function (data, fileName) {
        const name = safeName(fileName).toLowerCase();
        if (!data || !data.byteLength) throw new Error('模型数据为空');
        if (/\.gltf$/i.test(name) || /\.fbx$/i.test(name)) return true;
        if (!/\.glb$/i.test(name)) return true;
        if (data.byteLength < 12) throw new Error('GLB 文件头不完整');

        try {
            const v = new DataView(data, 0, Math.min(data.byteLength, 12));
            const magic = v.getUint32(0, false);
            const version = v.getUint32(4, true);
            const length = v.getUint32(8, true);
            if (magic !== 0x676c5446) throw new Error('GLB magic 不是 glTF');
            if (version !== 2) throw new Error('仅支持 glTF 2.x GLB');
            if (length > data.byteLength) throw new Error('GLB 声明长度大于实际文件长度');
        } catch (e) {
            throw new Error('GLB 二进制校验失败: ' + (e && e.message ? e.message : e));
        }
        return true;
    };

    /* ------------------------------------------------------------------------
     * 3. HBuilderX / plus 本地文件统一读取
     * ------------------------------------------------------------------------ */
    app._mobileGLBReadEntryAsArrayBuffer = function (entry) {
        return new Promise((resolve, reject) => {
            if (!entry) {
                reject(new Error('无效 FileEntry'));
                return;
            }

            try {
                entry.file((file) => {
                    try {
                        if (typeof FileReader !== 'undefined') {
                            const fr = new FileReader();
                            fr.onload = () => {
                                const ab = fr.result;
                                if (ab && ab.byteLength > 0) resolve(ab);
                                else reject(new Error('本地模型文件为空'));
                            };
                            fr.onerror = () => reject(new Error('本地模型文件读取失败'));
                            fr.readAsArrayBuffer(file);
                            return;
                        }
                    } catch (e) {}

                    try {
                        const PlusFR = window.plus && window.plus.io && window.plus.io.FileReader;
                        if (!PlusFR) {
                            reject(new Error('当前 5+ 环境不支持 ArrayBuffer 文件读取'));
                            return;
                        }
                        const fr = new PlusFR();
                        fr.onloadend = (evt) => {
                            try {
                                const result = evt && evt.target ? (evt.target.result || '') : '';
                                const p = result.indexOf('base64,');
                                const b64 = p >= 0 ? result.substring(p + 7) : result;
                                if (!b64) {
                                    reject(new Error('本地模型文件为空'));
                                    return;
                                }
                                resolve(app.base64ToArrayBuffer(b64));
                            } catch (e) {
                                reject(e);
                            }
                        };
                        fr.onerror = () => reject(new Error('5+ FileReader 读取模型失败'));
                        fr.readAsDataURL(file);
                    } catch (e) {
                        reject(e);
                    }
                }, (err) => reject(err || new Error('获取 FileEntry.file 失败')));
            } catch (e) {
                reject(e);
            }
        });
    };

    app._mobileGLBPathCandidates = function (rec) {
        const out = [];
        const push = (v) => {
            const s = safeName(v);
            if (!s || out.indexOf(s) >= 0) return;
            out.push(s);
        };

        if (!rec) return out;
        push(rec.sourcePath);
        push(rec.localURL);
        push(rec.sourceUrl);

        const raw = safeName(rec.sourcePath || rec.localURL || rec.sourceUrl);
        if (raw) {
            push(raw.replace(/^file:\/\//i, ''));
            push(raw.replace(/^_www\/?/i, 'img/'));
            push(raw.replace(/^\.\/?/i, ''));
        }

        const fn = safeName(rec.fileName);
        if (fn) {
            push('_www/img/' + fn);
            push('_doc/img/' + fn);
            push('_downloads/img/' + fn);
            push('img/' + fn);
            push('./img/' + fn);
        }
        return out;
    };

    app._mobileGLBResolveEntry = function (candidate) {
        return new Promise((resolve, reject) => {
            if (!window.plus || !window.plus.io || !window.plus.io.resolveLocalFileSystemURL) {
                reject(new Error('5+ 本地文件 API 不可用'));
                return;
            }

            const candidates = [];
            const add = (v) => {
                const s = safeName(v);
                if (s && candidates.indexOf(s) < 0) candidates.push(s);
            };
            add(candidate);

            try {
                if (window.plus.io.convertLocalFileSystemURL) {
                    add(window.plus.io.convertLocalFileSystemURL(candidate));
                }
            } catch (e) {}

            const tryNext = (index) => {
                if (index >= candidates.length) {
                    reject(new Error('无法解析本地路径: ' + candidate));
                    return;
                }
                const p = candidates[index];
                try {
                    window.plus.io.resolveLocalFileSystemURL(
                        p,
                        (entry) => resolve(entry),
                        () => tryNext(index + 1)
                    );
                } catch (e) {
                    tryNext(index + 1);
                }
            };
            tryNext(0);
        });
    };

    const originalLoadGLBRecordArrayBuffer = app._loadGLBRecordArrayBuffer;
    app._loadGLBRecordArrayBuffer = function (rec) {
        if (!rec) return Promise.reject(new Error('模型记录不存在'));
        if (rec._mobileCompatLoadingPromise) return rec._mobileCompatLoadingPromise;

        rec._mobileCompatLoadingPromise = (async () => {
            /* ① 已有内存 Base64：分块解码 */
            if (rec.base64 && rec.base64.length > 10) {
                return this.base64ToArrayBuffer(rec.base64);
            }

            /* ② HBuilderX 5+：优先 resolveLocalFileSystemURL + FileReader */
            if (window.plus && window.plus.io) {
                const candidates = this._mobileGLBPathCandidates(rec);
                for (let i = 0; i < candidates.length; i++) {
                    const p = candidates[i];
                    try {
                        const entry = await this._mobileGLBResolveEntry(p);
                        const data = await this._mobileGLBReadEntryAsArrayBuffer(entry);
                        if (data && data.byteLength) return data;
                    } catch (e) {
                        console.warn('[GLB Mobile V2] 本地路径尝试失败:', p, e && e.message ? e.message : e);
                    }
                }
            }

            /* ③ HTTP/HTTPS / 工程可访问 URL */
            const urls = [];
            const addUrl = (v) => {
                const s = safeName(v);
                if (!s || urls.indexOf(s) >= 0) return;
                urls.push(s);
            };
            addUrl(rec.sourceUrl);
            addUrl(rec.localURL);

            for (let i = 0; i < urls.length; i++) {
                const u = urls[i];
                if (!/^https?:\/\//i.test(u)) continue;
                try {
                    const data = await this._xhrArrayBuffer(u);
                    if (data && data.byteLength) return data;
                } catch (e) {
                    console.warn('[GLB Mobile V2] URL 读取失败:', u, e && e.message ? e.message : e);
                }
            }

            /* ④ 兼容旧版本记录：数据库完整取一条 */
            if (rec.id) {
                try {
                    const old = await this.saveSystem.getGLBFromStore(rec.id);
                    if (old && old.base64 && old.base64.length > 10) {
                        return this.base64ToArrayBuffer(old.base64);
                    }

                    if (old) {
                        const oldPaths = this._mobileGLBPathCandidates(old);
                        for (let i = 0; i < oldPaths.length; i++) {
                            try {
                                const entry = await this._mobileGLBResolveEntry(oldPaths[i]);
                                const data = await this._mobileGLBReadEntryAsArrayBuffer(entry);
                                if (data && data.byteLength) return data;
                            } catch (e) {}
                        }

                        const oldUrl = safeName(old.sourceUrl || old.localURL);
                        if (/^https?:\/\//i.test(oldUrl)) {
                            const data = await this._xhrArrayBuffer(oldUrl);
                            if (data && data.byteLength) return data;
                        }
                    }
                } catch (e) {}
            }

            /* ⑤ 最后一层：保留原工程读取策略作为兼容兜底 */
            if (typeof originalLoadGLBRecordArrayBuffer === 'function') {
                return originalLoadGLBRecordArrayBuffer.call(this, rec);
            }

            throw new Error('无法定位模型文件: ' + (rec.fileName || rec.name || '未知模型'));
        })();

        return rec._mobileCompatLoadingPromise.finally(() => {
            rec._mobileCompatLoadingPromise = null;
        });
    };

    /* ------------------------------------------------------------------------
     * 4. 安全静止几何边界，不依赖 SkinnedMesh 当前动画变形
     * ------------------------------------------------------------------------ */
    app._mobileGLBRestPoseBounds = function (model) {
        const box = new THREE.Box3();
        let hasMesh = false;
        const excluded = model && model.userData ? model.userData.animEffectGroup : null;

        if (!model) return null;

        try { model.updateMatrixWorld(true); } catch (e) {}

        model.traverse((node) => {
            if (!node || !node.isMesh || !node.geometry || node.visible === false) return;
            if (excluded && (node === excluded || (excluded.getObjectById && excluded.getObjectById(node.id)))) return;

            const g = node.geometry;
            let b = g.boundingBox;
            if (!b) {
                try { g.computeBoundingBox(); b = g.boundingBox; } catch (e) { return; }
            }
            if (!b || b.isEmpty()) return;

            const corners = [
                new THREE.Vector3(b.min.x, b.min.y, b.min.z),
                new THREE.Vector3(b.min.x, b.min.y, b.max.z),
                new THREE.Vector3(b.min.x, b.max.y, b.min.z),
                new THREE.Vector3(b.min.x, b.max.y, b.max.z),
                new THREE.Vector3(b.max.x, b.min.y, b.min.z),
                new THREE.Vector3(b.max.x, b.min.y, b.max.z),
                new THREE.Vector3(b.max.x, b.max.y, b.min.z),
                new THREE.Vector3(b.max.x, b.max.y, b.max.z)
            ];

            for (let i = 0; i < corners.length; i++) {
                const p = corners[i].applyMatrix4(node.matrixWorld);
                if (isFiniteNum(p.x) && isFiniteNum(p.y) && isFiniteNum(p.z)) {
                    box.expandByPoint(p);
                    hasMesh = true;
                }
            }
        });

        if (!hasMesh || box.isEmpty()) return null;
        return box;
    };

    app._mobileGLBPrepareSkinning = function (model) {
        if (!model || !this._mobileGLBIsMobile()) return;

        try {
            model.traverse((node) => {
                if (!node) return;

                if (node.isSkinnedMesh) {
                    /*
                     * 移动端不依赖 GPU 动画包围盒进行裁剪。
                     * 这不会改变几何形状，只避免大动作/异常 AABB 导致整件模型被裁掉。
                     */
                    node.frustumCulled = false;

                    const g = node.geometry;
                    if (g) {
                        try {
                            if (g.attributes && g.attributes.skinWeight &&
                                typeof g.normalizeSkinWeights === 'function') {
                                g.normalizeSkinWeights();
                            }
                        } catch (e) {}

                        /* 仅修正非有限权重，不改正常权重数据 */
                        try {
                            const sw = g.attributes && g.attributes.skinWeight;
                            if (sw && sw.array) {
                                let changed = false;
                                const a = sw.array;
                                for (let i = 0; i < a.length; i++) {
                                    if (!isFinite(a[i])) { a[i] = 0; changed = true; }
                                }
                                if (changed) sw.needsUpdate = true;
                            }
                        } catch (e) {}
                    }

                    try {
                        if (node.skeleton && typeof node.skeleton.update === 'function') {
                            node.skeleton.update();
                        }
                    } catch (e) {}
                }
            });
        } catch (e) {
            console.warn('[GLB Mobile V2] SkinnedMesh 兼容处理失败:', e);
        }
    };

    /* ------------------------------------------------------------------------
     * 5. 户型尺度估算
     * ------------------------------------------------------------------------ */
    app._mobileGLBGetFloorPlanSpan = function (floorIndex) {
        const fi = clamp(
            isFiniteNum(floorIndex) ? floorIndex : this.currentFloor,
            0,
            Math.max(0, (this.floorShapes || []).length - 1)
        );
        const shapes = (this.floorShapes && this.floorShapes[fi]) || [];
        let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;

        for (let s = 0; s < shapes.length; s++) {
            const shape = shapes[s] || [];
            for (let i = 0; i < shape.length; i++) {
                const p = shape[i];
                if (!p) continue;
                const x = parseFloat(p.x);
                const z = parseFloat(p.y);
                if (!isFinite(x) || !isFinite(z)) continue;
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minZ = Math.min(minZ, z);
                maxZ = Math.max(maxZ, z);
            }
        }

        if (!isFinite(minX) || !isFinite(maxX) || !isFinite(minZ) || !isFinite(maxZ)) return 0;
        return Math.max(maxX - minX, maxZ - minZ);
    };

    app._mobileGLBGetFitCap = function (floorIndex, type) {
        const fi = isFiniteNum(floorIndex) ? floorIndex : this.currentFloor;
        const wallH = Math.max(1, parseFloat(this.getWallHeight(fi)) || 2.8);
        const span = this._mobileGLBGetFloorPlanSpan(fi);
        const planCap = span > 0 ? span * CFG.sceneFitRatio : Infinity;
        const wallCap = wallH * CFG.wallFitRatio;

        let cap = Math.min(wallCap, planCap);
        if (!isFinite(cap) || cap <= 0) cap = wallCap;

        /* 非常小户型仍给模型一个最低可见尺寸 */
        cap = Math.max(0.25, cap);

        /* 门窗 / 灯具 / 电视等已有业务目标保持优先，只对异常大模型做上限约束 */
        const targetMap = {
            door_window: 2.1,
            light: 0.8,
            ac: 1.8,
            tv: 1.2,
            walker: 1.6,
            furniture: 1.6
        };
        const preferred = targetMap[type] || 1.6;
        return Math.max(preferred, cap);
    };

    /* ------------------------------------------------------------------------
     * 6. 重新实现模型规范化：保持业务目标值，但使用稳定 rest-pose AABB
     * ------------------------------------------------------------------------ */
    app.normalizeModelTransform = function (model, type) {
        if (!model) return { width: 1, height: 1, depth: 1 };

        this._mobileGLBPrepareSkinning(model);

        let box = this._mobileGLBRestPoseBounds(model);
        if (!box || box.isEmpty()) {
            try {
                box = new THREE.Box3().setFromObject(model);
            } catch (e) {
                box = new THREE.Box3(
                    new THREE.Vector3(-0.5, 0, -0.5),
                    new THREE.Vector3(0.5, 1.5, 0.5)
                );
            }
        }

        let size = box.getSize(new THREE.Vector3());
        ['x', 'y', 'z'].forEach(k => {
            if (!isFiniteNum(size[k]) || Math.abs(size[k]) < CFG.minWorldSize) size[k] = CFG.minWorldSize;
        });

        let target;
        let current;
        if (type === 'door_window') {
            target = 2.1;
            current = size.y;
        } else if (type === 'light') {
            target = 0.8;
            current = Math.max(size.x, size.y, size.z);
        } else if (type === 'ac') {
            target = 1.8;
            current = size.y;
        } else if (type === 'tv') {
            target = 1.2;
            current = size.y;
        } else {
            target = 1.6;
            current = Math.max(size.x, size.y, size.z);
        }

        const ctx = this.__mobileGLBNormalizeContext || {};
        let fitTarget = target;

        /* 只有“新加入场景”做户型尺度安全上限；恢复存档严格保留用户已有 transform。
         * 普通尺寸模型维持原工程的目标尺寸；只有明显超大模型才按户型上限压缩，
         * 这样不会把正常家具/门窗无故缩得过小，同时可以阻止巨大模型压垮场景。 */
        if (!ctx.restoreData) {
            const floorIndex = isFiniteNum(ctx.floorIndex) ? ctx.floorIndex : this.currentFloor;
            const cap = this._mobileGLBGetFitCap(floorIndex, type);
            if (current > Math.max(target * CFG.targetScaleRatioMax, cap * 1.20) || current > CFG.hardMaxWorldSize) {
                fitTarget = Math.min(target, cap);
            }
        }

        let scaleFactor = 1;
        if (!(current >= fitTarget * CFG.targetScaleRatioMin &&
              current <= fitTarget * CFG.targetScaleRatioMax)) {
            scaleFactor = fitTarget / Math.max(current, CFG.minWorldSize);
        }

        if (!isFiniteNum(scaleFactor) || scaleFactor <= 0) scaleFactor = 1;
        scaleFactor = clamp(scaleFactor, 1e-6, 1e6);

        try { model.scale.multiplyScalar(scaleFactor); } catch (e) { model.scale.setScalar(scaleFactor); }

        try { model.updateMatrixWorld(true); } catch (e) {}
        box = this._mobileGLBRestPoseBounds(model);

        if (box && !box.isEmpty()) {
            const center = box.getCenter(new THREE.Vector3());
            model.position.x -= center.x;
            model.position.z -= center.z;
            model.position.y -= box.min.y;
        }

        try { model.updateMatrixWorld(true); } catch (e) {}
        box = this._mobileGLBRestPoseBounds(model);
        const finalSize = box && !box.isEmpty()
            ? box.getSize(new THREE.Vector3())
            : new THREE.Vector3(1, 1, 1);

        return {
            width: isFiniteNum(finalSize.x) ? finalSize.x : 1,
            height: isFiniteNum(finalSize.y) ? finalSize.y : 1,
            depth: isFiniteNum(finalSize.z) ? finalSize.z : 1
        };
    };

    /* ------------------------------------------------------------------------
     * 7. GLB 构建上下文：让 normalizeModelTransform 知道当前是否为存档恢复，
     *    并给 native AnimationMixer 明确的 gltf.scene root。
     * ------------------------------------------------------------------------ */
    const previousBuildModelFromScene = app._buildModelFromScene;
    app._buildModelFromScene = function (model, animations, name, type, features, opts) {
        opts = opts || {};
        const prevCtx = this.__mobileGLBNormalizeContext;
        const prevRoot = this.__mobileGLBVisualRoot;
        const restoreData = opts.restoreData || null;

        this.__mobileGLBNormalizeContext = {
            restoreData: restoreData,
            floorIndex: (restoreData && isFiniteNum(restoreData.floorIndex))
                ? restoreData.floorIndex
                : this.currentFloor
        };
        this.__mobileGLBVisualRoot = model;

        try {
            const group = previousBuildModelFromScene.call(this, model, animations, name, type, features, opts);
            if (!group || !group.userData) return group;

            group.userData.__visualRoot = model;
            group.userData._nativeAnimations = Array.isArray(animations) ? animations.slice() : [];
            group.userData._nativeAnimationNames = group.userData._nativeAnimations.map(c => safeName(c && c.name));
            group.userData._mobileGLBCompatVersion = '2';

            const savedCfg = restoreData && (
                restoreData.nativeAnimationConfig ||
                restoreData.modelAnimationConfig ||
                restoreData.nativeAnimConfig
            );
            if (savedCfg) {
                group.userData.nativeAnimationConfig = this._normalizeNativeAnimationConfig(savedCfg);
            } else if (!group.userData.nativeAnimationConfig) {
                const enabled = !!(
                    (features && features.modelAnimation) ||
                    (this.tempObjectData && this.tempObjectData.nativeAnimationEnabled)
                );
                group.userData.nativeAnimationConfig = this._normalizeNativeAnimationConfig({ enabled: enabled });
            }

            group.userData.features = group.userData.features || {};
            group.userData.features.modelAnimation = !!(
                group.userData.nativeAnimationConfig && group.userData.nativeAnimationConfig.enabled
            );

            this._mobileGLBPrepareSkinning(model);
            this._configureNativeAnimation(group, false);
            return group;
        } finally {
            this.__mobileGLBNormalizeContext = prevCtx;
            this.__mobileGLBVisualRoot = prevRoot;
        }
    };

    /* ------------------------------------------------------------------------
     * 8. 原生绑定动画：明确 mixer root = GLB scene root
     * ------------------------------------------------------------------------ */
    app._configureNativeAnimation = function (obj, restart) {
        if (!obj || !obj.userData) return false;
        const d = obj.userData;
        const clips = this._getNativeAnimationClips(obj);
        d.nativeAnimationConfig = this._normalizeNativeAnimationConfig(d.nativeAnimationConfig);
        d._nativeAnimationAvailable = clips.length > 0;
        d._nativeAnimationCount = clips.length;
        d._nativeAnimationNames = clips.map(c => safeName(c && c.name) || '未命名动画');

        const root = d.__visualRoot || this.__mobileGLBVisualRoot || obj;
        if (!root) return false;

        if (!clips.length) {
            try {
                if (d._nativeAction) d._nativeAction.stop();
                if (d._nativeMixer && d.__nativeMixerRoot && d._nativeMixerRoot !== root) {
                    d._nativeMixer.uncacheRoot(d.__nativeMixerRoot);
                }
            } catch (e) {}
            d._nativeAction = null;
            return false;
        }

        const clip = this._chooseNativeClip(obj, d.nativeAnimationConfig);
        if (!clip) return false;

        const needsNewMixer = !d._nativeMixer || d.__nativeMixerRoot !== root;
        if (needsNewMixer) {
            try {
                if (d._nativeMixer) {
                    d._nativeMixer.stopAllAction();
                    if (d.__nativeMixerRoot) d._nativeMixer.uncacheRoot(d.__nativeMixerRoot);
                }
            } catch (e) {}
            try {
                d._nativeMixer = new THREE.AnimationMixer(root);
                d.__nativeMixerRoot = root;
                d._nativeAction = null;
            } catch (e) {
                d._nativeMixer = null;
                d.__nativeMixerRoot = null;
                return false;
            }
        }

        const currentName = d._nativeAction && d._nativeAction.getClip
            ? safeName(d._nativeAction.getClip().name)
            : '';

        if (!d._nativeAction || currentName !== safeName(clip.name) || restart) {
            try { if (d._nativeAction) d._nativeAction.stop(); } catch (e) {}
            try {
                d._nativeAction = d._nativeMixer.clipAction(clip);
                d._nativeAction.reset();
                d._nativeAction.setLoop(
                    d.nativeAnimationConfig.loop ? THREE.LoopRepeat : THREE.LoopOnce,
                    d.nativeAnimationConfig.loop ? Infinity : 1
                );
                d._nativeAction.clampWhenFinished = !d.nativeAnimationConfig.loop;
            } catch (e) {
                d._nativeAction = null;
                return false;
            }
        }

        d._nativeMixer.timeScale = d.nativeAnimationConfig.timeScale;
        const canPlay = d.nativeAnimationConfig.enabled && (!d.state || d.state.on !== false);

        if (canPlay) {
            d._nativeAction.enabled = true;
            d._nativeAction.paused = false;
            d._nativeAction.play();
        } else {
            try { d._nativeAction.stop(); } catch (e) {}
            d._nativeAction.enabled = false;
        }

        return true;
    };

    app._updateNativeAnimations = function (delta) {
        const dt = Math.min(Math.max(parseFloat(delta) || 0, 0), 0.1);
        this.furnitureGroup.children.forEach((obj) => {
            const d = obj && obj.userData;
            if (!d || !d._nativeMixer || !d._nativeAnimationAvailable || !d._nativeAction) return;

            try {
                d.nativeAnimationConfig = this._normalizeNativeAnimationConfig(d.nativeAnimationConfig);
                const canPlay = d.nativeAnimationConfig.enabled && (!d.state || d.state.on !== false);
                if (canPlay) {
                    d._nativeMixer.timeScale = d.nativeAnimationConfig.timeScale;
                    d._nativeAction.enabled = true;
                    d._nativeAction.paused = false;
                    d._nativeAction.play();
                    if (dt > 0) d._nativeMixer.update(dt);
                }
            } catch (e) {
                /* 单个坏动画不能中断整个帧循环 */
            }
        });
    };

    /* ------------------------------------------------------------------------
     * 9. 场景内已存在的 GLB 修复：不覆盖 manualPosition，仅修复动画/蒙皮/极端尺寸
     * ------------------------------------------------------------------------ */
    app._mobileGLBRepairExistingObjects = function () {
        let changed = false;
        if (!this.furnitureGroup || !this.furnitureGroup.children) return false;

        this.furnitureGroup.children.forEach((obj) => {
            const d = obj && obj.userData;
            if (!d || d.sourceType !== 'glb') return;

            try {
                const root = d.__visualRoot || (obj.children && obj.children.find(c => c && (c.isScene || c.isGroup))) || obj;
                d.__visualRoot = root;
                this._mobileGLBPrepareSkinning(root);
                this._configureNativeAnimation(obj, false);
            } catch (e) {}

            /* 非手动定位对象，且尺寸远超户型时，只缩小一次；绝不重新算楼层位置 */
            try {
                if (!d.manualPosition && !d.__mobileAutoFitApplied) {
                    const box = this._mobileGLBRestPoseBounds(obj);
                    if (box && !box.isEmpty()) {
                        const size = box.getSize(new THREE.Vector3());
                        const maxSize = Math.max(size.x, size.y, size.z);
                        const cap = this._mobileGLBGetFitCap(d.floorIndex, d.type);
                        if (isFinite(maxSize) && maxSize > cap * 1.35 && maxSize > CFG.minWorldSize) {
                            const factor = clamp(cap / maxSize, 0.02, 1);
                            obj.scale.multiplyScalar(factor);
                            obj.updateMatrixWorld(true);
                            d.__mobileAutoFitApplied = true;
                            changed = true;
                        }
                    }
                }
            } catch (e) {}
        });

        if (changed) {
            try { this.saveSystem.saveToDB(true); } catch (e) {}
            try { this.updateSceneVisibility(); } catch (e) {}
            try { this.refreshFloorModelList(); } catch (e) {}
        }
        return changed;
    };

    /* ------------------------------------------------------------------------
     * 10. serializeScene 增加原生动画配置；旧存档字段不受影响
     * ------------------------------------------------------------------------ */
    const previousSerializeScene = app.saveSystem && app.saveSystem.serializeScene;
    if (typeof previousSerializeScene === 'function') {
        app.saveSystem.serializeScene = function () {
            const data = previousSerializeScene.call(this);
            try {
                if (!data || !Array.isArray(data.objects) || !app.furnitureGroup) return data;

                const validChildren = [];
                app.furnitureGroup.children.forEach((obj) => {
                    const d = obj && obj.userData;
                    if (!d) return;
                    if (!isFiniteNum(obj.position.x) || !isFiniteNum(obj.position.y) ||
                        !isFiniteNum(obj.position.z) || !isFiniteNum(obj.scale.x)) return;
                    validChildren.push(obj);
                });

                for (let i = 0; i < data.objects.length && i < validChildren.length; i++) {
                    const saved = data.objects[i];
                    const obj = validChildren[i];
                    const d = obj.userData || {};
                    if (!saved || !obj || d.sourceType !== 'glb') continue;

                    saved.objectId = d.id || null;
                    saved.nativeAnimationConfig = d.nativeAnimationConfig
                        ? app._normalizeNativeAnimationConfig(d.nativeAnimationConfig)
                        : null;
                    saved.modelAnimationConfig = saved.nativeAnimationConfig;
                    saved.nativeAnimationEnabled = !!(
                        saved.nativeAnimationConfig && saved.nativeAnimationConfig.enabled
                    );
                    saved.nativeAnimationNames = Array.isArray(d._nativeAnimationNames)
                        ? d._nativeAnimationNames.slice()
                        : [];
                    saved.mobileGLBCompatVersion = '2';
                    saved.manualPosition = d.manualPosition === true;

                    if (d.dimensions) saved.baseDimensions = {
                        width: isFiniteNum(d.dimensions.w) ? d.dimensions.w : undefined,
                        height: isFiniteNum(d.dimensions.h) ? d.dimensions.h : undefined,
                        depth: isFiniteNum(d.dimensions.d) ? d.dimensions.d : undefined
                    };
                }
            } catch (e) {
                console.warn('[GLB Mobile V2] 扩展场景序列化失败:', e);
            }
            return data;
        };
    }

    /* ------------------------------------------------------------------------
     * 11. createGLBFromArrayBuffer 增加校验，真正解析仍沿用原工程
     * ------------------------------------------------------------------------ */
    const previousCreateGLBFromArrayBuffer = app.createGLBFromArrayBuffer;
    if (typeof previousCreateGLBFromArrayBuffer === 'function') {
        app.createGLBFromArrayBuffer = async function (data, name, type, features, opts) {
            opts = opts || {};
            this._validateGLBArrayBuffer(data, opts.glbFileName || opts.fileName || name || 'model.glb');
            const group = await previousCreateGLBFromArrayBuffer.call(this, data, name, type, features, opts);

            try {
                if (group && group.userData) {
                    group.userData.__mobileGLBCompatVersion = '2';
                    if (group.userData.__visualRoot) this._mobileGLBPrepareSkinning(group.userData.__visualRoot);
                    this._configureNativeAnimation(group, false);
                }
            } catch (e) {
                console.warn('[GLB Mobile V2] 模型后处理失败:', e);
            }

            return group;
        };
    }

    /* ------------------------------------------------------------------------
     * 12. 选择模型时立即再检测一次原生动画，并刷新现有楼层管理 UI
     * ------------------------------------------------------------------------ */
    const previousSelectObj = app.selectObj;
    if (typeof previousSelectObj === 'function') {
        app.selectObj = function (obj, clickedMesh) {
            const r = previousSelectObj.call(this, obj, clickedMesh);
            try {
                if (obj && obj.userData) {
                    if (obj.userData._nativeAnimations && obj.userData._nativeAnimations.length) {
                        this._configureNativeAnimation(obj, false);
                    }
                    if (typeof this._refreshFloorNativeAnimUI === 'function') {
                        this._refreshFloorNativeAnimUI(obj);
                    }
                }
            } catch (e) {}
            return r;
        };
    }

    /* ------------------------------------------------------------------------
     * 13. 移动端 renderer 只降低像素比，避免高分辨率屏幕把 GPU 内存峰值放大；
     *     不改变 antialias / 光照 / 阴影业务逻辑。
     * ------------------------------------------------------------------------ */
    const previousInit3D = app.init3D;
    if (typeof previousInit3D === 'function') {
        app.init3D = function () {
            const r = previousInit3D.apply(this, arguments);
            try {
                if (this.renderer && this._mobileGLBIsMobile() && this.renderer.getPixelRatio) {
                    const ratio = Math.min(window.devicePixelRatio || 1, CFG.mobilePixelRatioMax);
                    if (this.renderer.getPixelRatio() > ratio) {
                        this.renderer.setPixelRatio(ratio);
                        this.renderer.setSize(
                            this.renderer.domElement.clientWidth || window.innerWidth,
                            this.renderer.domElement.clientHeight || window.innerHeight,
                            false
                        );
                    }
                }
            } catch (e) {
                console.warn('[GLB Mobile V2] 移动端渲染比例调整失败:', e);
            }
            return r;
        };
    }

    /* ------------------------------------------------------------------------
     * 14. 自动修复已恢复模型：多次轻量尝试，覆盖异步 IndexedDB / GLB 重载完成时机
     * ------------------------------------------------------------------------ */
    const scheduleRepair = () => {
        CFG.repairPasses.forEach((ms) => {
            setTimeout(() => {
                try {
                    app._mobileGLBRepairExistingObjects();
                    if (app.selectedObj && app.selectedObj.userData) {
                        app._configureNativeAnimation(app.selectedObj, false);
                        if (typeof app._refreshFloorNativeAnimUI === 'function') {
                            app._refreshFloorNativeAnimUI(app.selectedObj);
                        }
                    }
                } catch (e) {}
            }, ms);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', scheduleRepair, false);
    } else {
        scheduleRepair();
    }

    try {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                try { app._mobileGLBRepairExistingObjects(); } catch (e) {}
            }, 500);
        }, false);
    } catch (e) {}

    /* ------------------------------------------------------------------------
     * 15. 诊断 API
     * ------------------------------------------------------------------------ */
    app.diagnoseGLBMobileCompatibility = function (obj) {
        obj = obj || this.selectedObj;
        if (!obj || !obj.userData) return { ok: false, reason: '未选择模型' };

        const d = obj.userData;
        const root = d.__visualRoot || null;
        const clips = this._getNativeAnimationClips(obj);
        let size = null;
        try {
            const b = this._mobileGLBRestPoseBounds(obj);
            if (b) size = b.getSize(new THREE.Vector3());
        } catch (e) {}

        const result = {
            ok: true,
            mobile: this._mobileGLBIsMobile(),
            sourceType: d.sourceType || '',
            fileName: d.glbFileName || '',
            floorIndex: d.floorIndex,
            manualPosition: d.manualPosition === true,
            nativeAnimationAvailable: clips.length > 0,
            nativeAnimationCount: clips.length,
            nativeAnimationNames: clips.map(c => safeName(c && c.name)),
            nativeAnimationEnabled: !!(d.nativeAnimationConfig && d.nativeAnimationConfig.enabled),
            visualRoot: !!root,
            mixerRootBound: !!(d._nativeMixer && d.__nativeMixerRoot === root),
            skinnedMeshCount: 0,
            worldSize: size ? { x: size.x, y: size.y, z: size.z } : null,
            mobileGLBCompatVersion: d.__mobileGLBCompatVersion || ''
        };

        try {
            const rr = root || obj;
            rr.traverse((n) => { if (n && n.isSkinnedMesh) result.skinnedMeshCount++; });
        } catch (e) {}

        console.log('=== GLB Mobile V2 诊断 ===', result);
        return result;
    };

    console.info('[GLB Mobile V2] 已安装：统一 5+ 文件读取、rest-pose 规范化、SkinnedMesh 兼容、native AnimationMixer root、动画配置存档及移动端适配。');
})();

/* ============================================================================
 * ★★★ 场景持久化恢复修复 V3 — 防止“保存成功 / 刷新后全部丢失” ★★★
 *
 * 修复目标：
 * 1. 页面首次启动时，禁止“空场景”在存档恢复完成前覆盖 current_project。
 * 2. loadFromDB 改为真正可等待的 Promise，确保恢复顺序确定。
 * 3. GLB/预设模型恢复完成前，不允许自动保存覆盖旧存档。
 * 4. 给已保存对象恢复稳定 objectId，防止 GLB 异步追加后对象顺序变化，
 *    导致 serializeScene 按 children[index] 重新配错模型。
 * 5. 序列化优先按 objectId / GLB id / 名称匹配，不再依赖异步恢复后的数组顺序。
 * 6. 旧版本存档无 objectId 时自动补齐，以后刷新继续稳定。
 * 7. 原生绑定动画 nativeAnimationConfig / clipIndex / clipName 一并持久化。
 * 8. 恢复完成后只进行一次“最终保存”，避免恢复过程中连续覆盖存档。
 * 9. 保留原工程全部功能；本层仅做持久化与恢复时序保护。
 * ============================================================================ */
(function installPersistenceRestoreV3() {
    'use strict';

    if (typeof app === 'undefined' || !app || !app.saveSystem) return;
    if (app.__persistenceRestoreV3Installed) return;
    app.__persistenceRestoreV3Installed = true;

    const SS = app.saveSystem;

    const isNum = (v) => typeof v === 'number' && isFinite(v);
    const safeNum = (v, d) => isNum(v) ? v : d;
    const text = (v) => v == null ? '' : String(v);

    /* ------------------------------------------------------------------------
     * §1. 状态机
     * ------------------------------------------------------------------------ */
    SS._restoreGate = false;
    SS._restoreInProgress = false;
    SS._restorePromise = null;
    SS._restoreRequestedAgain = false;
    SS._restoreFailed = false;
    SS._restoreGeneration = 0;
    SS._restoreCompleted = false;
    SS._queuedSaveAfterRestore = false;
    SS._queuedSaveSilentAfterRestore = true;
    SS._lastLoadedProjectTimestamp = 0;

    /* ------------------------------------------------------------------------
     * §2. 稳定对象身份
     * ------------------------------------------------------------------------ */
    app._ensureStableObjectId = function (obj, saved) {
        if (!obj) return '';
        if (!obj.userData) obj.userData = {};

        let id = obj.userData.id;
        if (saved && saved.objectId != null && text(saved.objectId)) {
            id = text(saved.objectId);
        }

        if (!id) {
            id = 'obj_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
        }

        obj.userData.id = id;
        obj.userData.positionAnchor = 'position';
        obj.userData.__pivotStable = true;
        return id;
    };

    app._getSavedObjectKey = function (saved) {
        if (!saved) return '';
        if (saved.objectId != null && text(saved.objectId)) return 'id:' + text(saved.objectId);

        const glb = text(saved.glbLibId || '');
        const file = text(saved.glbName || '');
        const name = text(saved.name || '');
        const type = text(saved.type || saved.deviceType || '');
        const floor = isNum(saved.floorIndex) ? saved.floorIndex : '';
        return 'sig:' + glb + '|' + file + '|' + name + '|' + type + '|' + floor;
    };

    app._getLiveObjectKey = function (obj) {
        if (!obj || !obj.userData) return '';
        const d = obj.userData;
        if (d.id != null && text(d.id)) return 'id:' + text(d.id);

        const glb = text(d.glbLibId || '');
        const file = text(d.glbFileName || '');
        const name = text(d.name || '');
        const type = text(d.type || '');
        const floor = isNum(d.floorIndex) ? d.floorIndex : '';
        return 'sig:' + glb + '|' + file + '|' + name + '|' + type + '|' + floor;
    };

    app._findSavedForLiveObject = function (obj, savedObjects, used) {
        if (!obj || !Array.isArray(savedObjects)) return null;
        used = used || new Set();

        const d = obj.userData || {};

        /* ① 最优先：稳定 objectId */
        if (d.id != null && text(d.id)) {
            for (let i = 0; i < savedObjects.length; i++) {
                if (used.has(i)) continue;
                const s = savedObjects[i];
                if (s && s.objectId != null && text(s.objectId) === text(d.id)) {
                    return { saved: s, index: i };
                }
            }
        }

        /* ② GLB 库 ID + 文件名 */
        for (let i = 0; i < savedObjects.length; i++) {
            if (used.has(i)) continue;
            const s = savedObjects[i];
            if (!s) continue;
            if (text(d.glbLibId || '') && text(s.glbLibId || '') &&
                text(d.glbLibId) === text(s.glbLibId)) {
                return { saved: s, index: i };
            }
        }

        /* ③ 文件名 + 名称 + 类型 */
        for (let i = 0; i < savedObjects.length; i++) {
            if (used.has(i)) continue;
            const s = savedObjects[i];
            if (!s) continue;
            if (text(d.glbFileName || '').toLowerCase() &&
                text(d.glbFileName || '').toLowerCase() === text(s.glbName || '').toLowerCase() &&
                text(d.name || '') === text(s.name || '') &&
                text(d.type || '') === text(s.type || s.deviceType || '')) {
                return { saved: s, index: i };
            }
        }

        /* ④ 名称 + 类型 + 楼层 */
        for (let i = 0; i < savedObjects.length; i++) {
            if (used.has(i)) continue;
            const s = savedObjects[i];
            if (!s) continue;
            const sf = isNum(s.floorIndex) ? s.floorIndex : null;
            const df = isNum(d.floorIndex) ? d.floorIndex : null;
            if (text(d.name || '') === text(s.name || '') &&
                text(d.type || '') === text(s.type || s.deviceType || '') &&
                (sf === null || df === null || sf === df)) {
                return { saved: s, index: i };
            }
        }

        return null;
    };

    /* ------------------------------------------------------------------------
     * §3. 保存保护：恢复阶段绝不能把“空场景/半场景”覆盖旧存档
     * ------------------------------------------------------------------------ */
    const _previousSaveToDB = SS.saveToDB;

    SS.saveToDB = async function (silent, options) {
        options = options || {};

        if (this._restoreGate && !options.allowDuringRestore) {
            this._queuedSaveAfterRestore = true;
            if (silent !== true) this._queuedSaveSilentAfterRestore = false;
            return false;
        }

        if (this._restoreFailed && !options.forceAfterRestoreFailure) {
            /*
             * 恢复失败时宁可不保存，也不允许空场景覆盖用户唯一存档。
             * 提供 forceAfterRestoreFailure 给明确的人工强制保存场景。
             */
            if (!silent) {
                try { this.showToast('⚠️ 上次工程恢复未完整完成，已阻止自动覆盖原存档'); } catch (e) {}
            }
            return false;
        }

        return _previousSaveToDB.call(this, silent);
    };

    /* ------------------------------------------------------------------------
     * §4. loadFromDB：从“单纯事件回调”改成可等待 Promise，并做单飞保护
     * ------------------------------------------------------------------------ */
    const _previousLoadFromDB = SS.loadFromDB;

    SS.loadFromDB = function () {
        if (this._restorePromise) return this._restorePromise;
        if (this._restoreCompleted && !this._restoreFailed) return Promise.resolve(true);

        this._restoreInProgress = true;
        this._restoreGate = true;
        this._restoreFailed = false;
        this._restoreGeneration++;
        const generation = this._restoreGeneration;

        this._restorePromise = new Promise((resolve) => {
            try {
                if (!this.db) {
                    this._restoreFailed = true;
                    this._restoreInProgress = false;
                    resolve(false);
                    return;
                }

                const tx = this.db.transaction([this.storeName], 'readonly');
                const store = tx.objectStore(this.storeName);
                const request = store.get('current_project');

                request.onsuccess = async (e) => {
                    try {
                        const record = e && e.target ? e.target.result : null;
                        if (!record || !record.data) {
                            this._restoreFailed = false;
                            this._restoreInProgress = false;
                            this._restoreGate = false;
                            this._restoreCompleted = true;
                            resolve(true);
                            return;
                        }

                        this._lastLoadedProjectTimestamp = safeNum(record.timestamp, 0);

                        /*
                         * 调用“当前最终版本”的 deserializeScene。
                         * 不在这里直接调用原始函数，避免跳过后续兼容层。
                         */
                        await this.deserializeScene(record.data);

                        /*
                         * 生成一份恢复结果快照。
                         * GLB 异步恢复可能完成得比 preset 晚，因此这里再做一次
                         * 稳定 ID / native animation / transform 的对齐。
                         */
                        try {
                            app._reconcileRestoredScene(record.data);
                        } catch (err) {
                            console.warn('[Persistence V3] 恢复后对象对齐失败:', err);
                        }

                        /*
                         * 只等待“短暂恢复窗口”，让串行 GLB 队列把当前任务跑完。
                         * 若后续仍存在缺失模型，_ensureSavedGLBObjectsRestored()
                         * 会继续尝试；绝不提前允许空场景写回数据库。
                         */
                        const ok = await app._ensureSavedGLBObjectsRestored(record.data, generation);

                        if (!ok) {
                            this._restoreFailed = true;
                            this._restoreInProgress = false;
                            /* 保持 restoreGate=true，保护原存档不被覆盖 */
                            try { this.showToast('⚠️ 工程恢复不完整，原存档已受保护，请检查模型资源后再保存'); } catch (e2) {}
                            resolve(false);
                            return;
                        }

                        try {
                            app._reconcileRestoredScene(record.data);
                        } catch (e3) {}

                        this._restoreFailed = false;
                        this._restoreInProgress = false;
                        this._restoreGate = false;
                        this._restoreCompleted = true;

                        /*
                         * 恢复完成后如有保存请求，只执行一次最终保存。
                         * 这样可保留修复后的 objectId/native animation 等新字段，
                         * 同时不会出现恢复中途覆盖。
                         */
                        if (this._queuedSaveAfterRestore) {
                            const silentSave = this._queuedSaveSilentAfterRestore !== false;
                            this._queuedSaveAfterRestore = false;
                            this._queuedSaveSilentAfterRestore = true;
                            setTimeout(() => {
                                try { this.saveToDB(silentSave); } catch (e4) {}
                            }, 80);
                        }

                        try {
                            app.updateSceneVisibility();
                            app.refreshFloorModelList();
                            if (app.isPlayMode && typeof app.createLabels === 'function') app.createLabels();
                        } catch (e5) {}

                        resolve(true);
                    } catch (err) {
                        console.error('[Persistence V3] 场景恢复异常:', err);
                        this._restoreFailed = true;
                        this._restoreInProgress = false;
                        /* 核心原则：恢复失败时保持 gate，禁止覆盖旧存档 */
                        try { this.showToast('❌ 工程恢复失败，已保护原存档避免数据被空场景覆盖'); } catch (e6) {}
                        resolve(false);
                    }
                };

                request.onerror = () => {
                    this._restoreFailed = true;
                    this._restoreInProgress = false;
                    try { this.showToast('❌ 读取工程存档失败，原存档未被覆盖'); } catch (e7) {}
                    resolve(false);
                };

                tx.onerror = () => {
                    if (!this._restoreInProgress) return;
                };
            } catch (err) {
                console.error('[Persistence V3] loadFromDB 初始化失败:', err);
                this._restoreFailed = true;
                this._restoreInProgress = false;
                resolve(false);
            }
        }).finally(() => {
            this._restorePromise = null;
        });

        return this._restorePromise;
    };

    /* ------------------------------------------------------------------------
     * §5. 恢复后的对象稳定化
     * ------------------------------------------------------------------------ */
    app._reconcileRestoredScene = function (data) {
        const savedObjects = data && Array.isArray(data.objects) ? data.objects : [];
        const live = this.furnitureGroup && this.furnitureGroup.children
            ? this.furnitureGroup.children.slice()
            : [];

        const usedSaved = new Set();

        /* 第一轮：按稳定 objectId / GLB id / 名称匹配 */
        live.forEach((obj) => {
            if (!obj || !obj.userData) return;
            const hit = this._findSavedForLiveObject(obj, savedObjects, usedSaved);
            const saved = hit ? hit.saved : null;
            if (hit) usedSaved.add(hit.index);

            this._ensureStableObjectId(obj, saved);

            const d = obj.userData;
            if (saved) {
                if (saved.type || saved.deviceType) d.type = saved.type || saved.deviceType;
                if (saved.name) d.name = saved.name;
                if (saved.glbLibId) d.glbLibId = saved.glbLibId;
                if (saved.glbName) d.glbFileName = saved.glbName;

                if (isNum(saved.floorIndex)) {
                    d.floorIndex = Math.max(0, Math.min(
                        Math.max(0, app.floorShapes.length - 1), saved.floorIndex
                    ));
                }

                if (typeof saved.manualPosition === 'boolean') {
                    d.manualPosition = saved.manualPosition;
                }

                const nativeCfg = saved.nativeAnimationConfig || saved.modelAnimationConfig;
                if (nativeCfg || d.nativeAnimationConfig) {
                    d.nativeAnimationConfig = app._normalizeNativeAnimationConfig(
                        nativeCfg || d.nativeAnimationConfig
                    );
                    d.features = d.features || {};
                    d.features.modelAnimation = !!d.nativeAnimationConfig.enabled;
                }

                if (Array.isArray(saved.nativeAnimationNames)) {
                    d._nativeAnimationNames = saved.nativeAnimationNames.slice();
                }
            }

            /* 永远不依据“模型是否为灯具”去重新定位楼层 */
            if (typeof d.floorIndex !== 'number' || !isFinite(d.floorIndex)) {
                if (typeof app.updateObjectFloorIndex === 'function') {
                    try { app.updateObjectFloorIndex(obj); } catch (e) {}
                }
            }

            try {
                if (d.nativeAnimationConfig && typeof app._configureNativeAnimation === 'function') {
                    app._configureNativeAnimation(obj, false);
                }
            } catch (e) {}
        });

        try { app.updateSceneVisibility(); } catch (e) {}
        try { app.refreshFloorModelList(); } catch (e) {}

        return live;
    };

    /* ------------------------------------------------------------------------
     * §6. 确认所有保存的 GLB 对象都已经回来
     * ------------------------------------------------------------------------ */
    app._findLiveObjectForSaved = function (saved) {
        if (!saved || !this.furnitureGroup) return null;

        const children = this.furnitureGroup.children || [];

        /* ① objectId */
        if (saved.objectId != null && text(saved.objectId)) {
            const byId = children.find((obj) =>
                obj && obj.userData && text(obj.userData.id) === text(saved.objectId)
            );
            if (byId) return byId;
        }

        /* ② GLB library id */
        if (saved.glbLibId) {
            const byGlb = children.find((obj) =>
                obj && obj.userData && text(obj.userData.glbLibId || '') === text(saved.glbLibId)
            );
            if (byGlb) return byGlb;
        }

        /* ③ 文件名 + 名称 */
        const file = text(saved.glbName || '').toLowerCase();
        const nm = text(saved.name || '');
        if (file || nm) {
            const byFileName = children.find((obj) => {
                if (!obj || !obj.userData) return false;
                const d = obj.userData;
                const df = text(d.glbFileName || '').toLowerCase();
                return (file && df === file) && (!nm || text(d.name || '') === nm);
            });
            if (byFileName) return byFileName;
        }

        return null;
    };

    app._ensureSavedGLBObjectsRestored = async function (data, generation) {
        if (!data || !Array.isArray(data.objects)) return true;

        const glbSaved = data.objects.filter(o =>
            o && (
                o.sourceType === 'glb' ||
                o.glbLibId ||
                o.glbName ||
                o.mobileGLBCompatVersion
            )
        );

        if (glbSaved.length === 0) return true;

        const MAX_PASS = 6;

        for (let pass = 0; pass < MAX_PASS; pass++) {
            if (generation !== SS._restoreGeneration) return false;

            const missing = glbSaved.filter(saved => !this._findLiveObjectForSaved(saved));

            if (missing.length === 0) {
                return true;
            }

            /*
             * 优先确认模型库索引已经准备好。
             * 不主动读取全部 GLB，只建立/刷新元数据索引。
             */
            try {
                if (typeof this.glbLibrary.init === 'function' && pass === 0) {
                    await this.glbLibrary.init();
                }
            } catch (e) {}

            try {
                if (typeof this.autoLoadGLBLibrary === 'function') {
                    await this.autoLoadGLBLibrary(false);
                }
            } catch (e) {}

            for (let i = 0; i < missing.length; i++) {
                const saved = missing[i];
                try {
                    const ok = await this.restoreGLBObject(saved);
                    if (!ok) {
                        console.warn('[Persistence V3] GLB 尚未恢复:', saved.name || saved.glbName || saved.glbLibId);
                    }
                } catch (e) {
                    console.warn('[Persistence V3] GLB 恢复重试失败:', e);
                }

                /* 给 5+ WebView / IndexedDB / 文件 IO 一个事件循环切换机会 */
                if (typeof yieldToUI === 'function') {
                    try { await yieldToUI(); } catch (e) {}
                } else {
                    await new Promise(r => setTimeout(r, 0));
                }
            }

            try { this._reconcileRestoredScene(data); } catch (e) {}

            const stillMissing = glbSaved.filter(saved => !this._findLiveObjectForSaved(saved));
            if (stillMissing.length === 0) return true;

            await new Promise(r => setTimeout(r, 350 * (pass + 1)));
        }

        const finalMissing = glbSaved.filter(saved => !this._findLiveObjectForSaved(saved));
        if (finalMissing.length > 0) {
            console.error('[Persistence V3] 以下保存模型未能完整恢复:', finalMissing.map(x => x.name || x.glbName || x.glbLibId));
            return false;
        }

        return true;
    };

    /* ------------------------------------------------------------------------
     * §7. 关键：修正 serializeScene 的“children[index] 对应 saved[index]”问题
     * ------------------------------------------------------------------------ */
    const _previousSerializeScene = SS.serializeScene;

    SS.serializeScene = function () {
        const data = _previousSerializeScene.call(this);
        try {
            if (!data || !Array.isArray(data.objects) || !app.furnitureGroup) return data;

            const live = app.furnitureGroup.children || [];
            const usedSaved = new Set();
            const rewritten = [];

            /*
             * 不再简单依赖 children 下标。
             * 现有对象先建立稳定 objectId，再精确写回对应存档记录。
             */
            for (let i = 0; i < live.length; i++) {
                const obj = live[i];
                if (!obj || !obj.userData) continue;

                const d = obj.userData;
                app._ensureStableObjectId(obj);

                let saved = null;
                let savedIndex = -1;

                /* ① 先尝试当前 data.objects 中相同 objectId */
                for (let j = 0; j < data.objects.length; j++) {
                    if (usedSaved.has(j)) continue;
                    const candidate = data.objects[j];
                    if (candidate && candidate.objectId != null &&
                        text(candidate.objectId) === text(d.id)) {
                        saved = candidate;
                        savedIndex = j;
                        break;
                    }
                }

                /* ② GLB id */
                if (!saved && d.glbLibId) {
                    for (let j = 0; j < data.objects.length; j++) {
                        if (usedSaved.has(j)) continue;
                        const candidate = data.objects[j];
                        if (candidate && candidate.glbLibId &&
                            text(candidate.glbLibId) === text(d.glbLibId)) {
                            saved = candidate;
                            savedIndex = j;
                            break;
                        }
                    }
                }

                /* ③ 文件名 + 名称 + 类型 */
                if (!saved) {
                    const df = text(d.glbFileName || '').toLowerCase();
                    for (let j = 0; j < data.objects.length; j++) {
                        if (usedSaved.has(j)) continue;
                        const candidate = data.objects[j];
                        if (!candidate) continue;
                        if (df && text(candidate.glbName || '').toLowerCase() === df &&
                            text(candidate.name || '') === text(d.name || '') &&
                            text(candidate.type || candidate.deviceType || '') === text(d.type || '')) {
                            saved = candidate;
                            savedIndex = j;
                            break;
                        }
                    }
                }

                /* ④ 最后才使用相同下标作为兼容旧存档的兜底 */
                if (!saved && data.objects[i] && !usedSaved.has(i)) {
                    saved = data.objects[i];
                    savedIndex = i;
                }

                if (!saved) {
                    /* 理论上只有运行期新增对象才会进入这里 */
                    saved = {};
                    savedIndex = -1;
                }

                if (savedIndex >= 0) usedSaved.add(savedIndex);

                saved.objectId = d.id;
                saved.name = d.name || saved.name || '未命名设备';
                saved.type = d.type || saved.type || 'furniture';
                saved.deviceType = d.type || saved.deviceType || saved.type;
                saved.sourceType = d.sourceType || saved.sourceType || 'preset';
                saved.floorIndex = isNum(d.floorIndex) ? d.floorIndex : 0;
                saved.manualPosition = d.manualPosition === true;
                saved.positionAnchor = 'position';

                saved.transform = saved.transform || {};
                saved.transform.positionAnchor = 'position';
                saved.transform.pos = {
                    x: safeNum(obj.position.x, 0),
                    y: safeNum(obj.position.y, 0),
                    z: safeNum(obj.position.z, 0)
                };
                saved.transform.rot = {
                    x: safeNum(obj.rotation.x, 0),
                    y: safeNum(obj.rotation.y, 0),
                    z: safeNum(obj.rotation.z, 0)
                };
                saved.transform.scale = {
                    x: safeNum(obj.scale.x, 1),
                    y: safeNum(obj.scale.y, 1),
                    z: safeNum(obj.scale.z, 1)
                };

                saved.features = d.features || saved.features || {};
                saved.state = d.state || saved.state;
                saved.entityId = d.entityId || saved.entityId || '';
                saved.animConfig = d.animationConfig || saved.animConfig;
                saved.animationConfig = d.animationConfig || saved.animationConfig;

                if (d.nativeAnimationConfig || (d.features && d.features.modelAnimation)) {
                    saved.nativeAnimationConfig = app._normalizeNativeAnimationConfig(
                        d.nativeAnimationConfig || { enabled: !!d.features.modelAnimation }
                    );
                    saved.modelAnimationConfig = saved.nativeAnimationConfig;
                    saved.nativeAnimationEnabled = !!saved.nativeAnimationConfig.enabled;
                } else if (saved.nativeAnimationConfig) {
                    saved.nativeAnimationConfig = app._normalizeNativeAnimationConfig(saved.nativeAnimationConfig);
                    saved.modelAnimationConfig = saved.nativeAnimationConfig;
                    saved.nativeAnimationEnabled = !!saved.nativeAnimationConfig.enabled;
                }

                if (Array.isArray(d._nativeAnimationNames)) {
                    saved.nativeAnimationNames = d._nativeAnimationNames.slice();
                }

                if (d.glbLibId) {
                    saved.glbLibId = d.glbLibId;
                    saved.glbName = d.glbFileName || saved.glbName || d.name;
                    saved.mobileGLBCompatVersion = '2';
                }

                if (d.walkConfig) saved.walkConfig = d.walkConfig;

                if (d.dimensions) {
                    saved.baseDimensions = {
                        width: isNum(d.dimensions.w) ? d.dimensions.w : undefined,
                        height: isNum(d.dimensions.h) ? d.dimensions.h : undefined,
                        depth: isNum(d.dimensions.d) ? d.dimensions.d : undefined
                    };
                }

                rewritten.push(saved);
            }

            /*
             * 关键：完全按照“当前家具组真实存在对象”的顺序生成最终对象表。
             * 这样即使 GLB 异步恢复导致 children 顺序和旧存档不同，也不会再错位。
             */
            data.objects = rewritten;
            data.objectCount = rewritten.length;
            data.persistenceFormatVersion = 3;
            data.savedAt = Date.now();
            data.sceneIntegrity = {
                objectCount: rewritten.length,
                glbCount: rewritten.filter(x => x && (x.sourceType === 'glb' || x.glbLibId || x.glbName)).length,
                floors: Array.isArray(data.floorShapes) ? data.floorShapes.length : 0
            };
        } catch (e) {
            console.warn('[Persistence V3] 场景序列化增强失败:', e);
        }

        return data;
    };

    /* ------------------------------------------------------------------------
     * §8. 最终 deserializeScene wrapper：恢复稳定 objectId
     * ------------------------------------------------------------------------ */
    const _previousDeserializeScene = SS.deserializeScene;

    SS.deserializeScene = async function (data) {
        const r = await _previousDeserializeScene.call(this, data);

        try {
            const savedObjects = data && Array.isArray(data.objects) ? data.objects : [];
            const live = app.furnitureGroup && app.furnitureGroup.children
                ? app.furnitureGroup.children.slice()
                : [];

            const usedSaved = new Set();

            live.forEach((obj) => {
                if (!obj || !obj.userData) return;

                const hit = app._findSavedForLiveObject(obj, savedObjects, usedSaved);
                const saved = hit ? hit.saved : null;
                if (hit) usedSaved.add(hit.index);

                app._ensureStableObjectId(obj, saved);

                const d = obj.userData;

                if (saved) {
                    if (saved.glbLibId) d.glbLibId = saved.glbLibId;
                    if (saved.glbName) d.glbFileName = saved.glbName;
                    if (saved.name) d.name = saved.name;
                    if (saved.type || saved.deviceType) d.type = saved.type || saved.deviceType;
                    if (isNum(saved.floorIndex)) d.floorIndex = Math.max(0, Math.min(
                        Math.max(0, app.floorShapes.length - 1), saved.floorIndex
                    ));
                    if (typeof saved.manualPosition === 'boolean') d.manualPosition = saved.manualPosition;

                    const cfg = saved.nativeAnimationConfig || saved.modelAnimationConfig;
                    if (cfg) {
                        d.nativeAnimationConfig = app._normalizeNativeAnimationConfig(cfg);
                        d.features = d.features || {};
                        d.features.modelAnimation = !!d.nativeAnimationConfig.enabled;
                    }

                    if (Array.isArray(saved.nativeAnimationNames)) {
                        d._nativeAnimationNames = saved.nativeAnimationNames.slice();
                    }

                    if (saved.objectId != null) d.id = text(saved.objectId);
                }

                try {
                    if (d.__visualRoot && !d.__nativeMixerRoot) {
                        d.__nativeMixerRoot = d.__visualRoot;
                    }
                    if (d.nativeAnimationConfig) app._configureNativeAnimation(obj, false);
                } catch (e) {}
            });

            app._reconcileRestoredScene(data);
        } catch (e) {
            console.warn('[Persistence V3] deserializeScene 二次校正失败:', e);
        }

        return r;
    };

    /* ------------------------------------------------------------------------
     * §9. final init wrapper：真正等待恢复完成后才打开自动保存
     * ------------------------------------------------------------------------ */
    const _previousInit = app.init;

    app.init = async function () {
        /*
         * 必须在调用原始 init 之前打开保护。
         * 原工程 init 内部存在定时 loadFromDB、visibility/pagehide/saveToDB
         * 等异步入口，如果晚于它们再加锁，仍然存在空场景覆盖窗口。
         */
        SS._restoreGate = true;
        SS._restoreInProgress = true;
        SS._restoreFailed = false;
        SS._restoreCompleted = false;

        let initResult;
        try {
            initResult = await _previousInit.apply(this, arguments);
        } catch (e) {
            SS._restoreFailed = true;
            SS._restoreInProgress = false;
            console.error('[Persistence V3] app.init 原始初始化失败:', e);
            /* 不解除 gate，避免后续自动保存覆盖旧存档 */
            return null;
        }

        try {
            /* DB 初始化在原 init 中已经完成；这里再次确认 */
            if (!SS.db && typeof SS.initDB === 'function') {
                await SS.initDB();
            }

            const hasData = await SS.hasSavedData();

            if (!hasData) {
                SS._restoreFailed = false;
                SS._restoreInProgress = false;
                SS._restoreGate = false;

                if (SS._queuedSaveAfterRestore) {
                    const silentSave = SS._queuedSaveSilentAfterRestore !== false;
                    SS._queuedSaveAfterRestore = false;
                    SS._queuedSaveSilentAfterRestore = true;
                    setTimeout(() => {
                        try { SS.saveToDB(silentSave); } catch (e) {}
                    }, 100);
                }
            } else {
                SS._restoreGate = true;
                SS._restoreInProgress = true;

                const restored = await SS.loadFromDB();

                if (!restored) {
                    /*
                     * loadFromDB 已负责保护原存档。
                     * 这里不强制解锁，防止别的异步模块随后覆盖 current_project。
                     */
                    SS._restoreFailed = true;
                    SS._restoreGate = true;
                } else {
                    SS._restoreFailed = false;
                    SS._restoreInProgress = false;
                    SS._restoreGate = false;
                }
            }
        } catch (e) {
            SS._restoreFailed = true;
            SS._restoreInProgress = false;
            SS._restoreGate = true;
            console.error('[Persistence V3] 启动恢复流程失败:', e);
        }

        try {
            app.updateSceneVisibility();
            app.refreshFloorModelList();
        } catch (e) {}

        return initResult;
    };

    /* ------------------------------------------------------------------------
     * §10. 手动恢复 / 强制保存诊断接口
     * ------------------------------------------------------------------------ */
    SS.retryRestore = async function () {
        try {
            if (!this.db) await this.initDB();
            this._restoreFailed = false;
            this._restoreGate = true;
            this._restoreInProgress = true;
            return await this.loadFromDB();
        } catch (e) {
            this._restoreFailed = true;
            this._restoreGate = true;
            this._restoreInProgress = false;
            return false;
        }
    };

    SS.forceSaveAfterRestoreFailure = async function (silent) {
        this._restoreFailed = false;
        this._restoreGate = false;
        this._restoreInProgress = false;
        return this.saveToDB(silent === true, { forceAfterRestoreFailure: true });
    };

    SS.diagnosePersistence = async function () {
        let record = null;
        try {
            if (!this.db) await this.initDB();
            record = await new Promise((resolve) => {
                try {
                    const tx = this.db.transaction([this.storeName], 'readonly');
                    const req = tx.objectStore(this.storeName).get('current_project');
                    req.onsuccess = (e) => resolve(e.target.result || null);
                    req.onerror = () => resolve(null);
                } catch (e) { resolve(null); }
            });
        } catch (e) {}

        const currentObjects = app.furnitureGroup && app.furnitureGroup.children
            ? app.furnitureGroup.children : [];
        const savedObjects = record && record.data && Array.isArray(record.data.objects)
            ? record.data.objects : [];

        const report = {
            dbReady: !!this.db,
            hasCurrentProject: !!record,
            projectTimestamp: record ? record.timestamp : 0,
            savedObjectCount: savedObjects.length,
            liveObjectCount: currentObjects.length,
            savedGLBCount: savedObjects.filter(x => x && (x.sourceType === 'glb' || x.glbLibId || x.glbName)).length,
            liveGLBCount: currentObjects.filter(x => x && x.userData && (x.userData.sourceType === 'glb' || x.userData.glbLibId || x.userData.glbFileName)).length,
            restoreGate: !!this._restoreGate,
            restoreInProgress: !!this._restoreInProgress,
            restoreFailed: !!this._restoreFailed,
            queuedSave: !!this._queuedSaveAfterRestore,
            furnitureChildren: currentObjects.map(obj => ({
                id: obj && obj.userData ? obj.userData.id : null,
                name: obj && obj.userData ? obj.userData.name : '',
                type: obj && obj.userData ? obj.userData.type : '',
                floorIndex: obj && obj.userData ? obj.userData.floorIndex : null,
                glbLibId: obj && obj.userData ? obj.userData.glbLibId : null,
                nativeAnimation: !!(obj && obj.userData && obj.userData._nativeAnimationAvailable)
            }))
        };

        console.log('=== Persistence V3 诊断 ===', report);
        return report;
    };

    /* ------------------------------------------------------------------------
     * §11. 防止 pagehide/beforeunload/visibilitychange 在恢复时覆盖存档
     * ------------------------------------------------------------------------ */
    window.addEventListener('pagehide', (e) => {
        try {
            if (SS._restoreGate || SS._restoreInProgress || SS._restoreFailed) return;
            SS.saveToDB(true);
        } catch (err) {}
    }, false);

    window.addEventListener('beforeunload', (e) => {
        try {
            if (SS._restoreGate || SS._restoreInProgress || SS._restoreFailed) return;
            SS.saveToDB(true);
        } catch (err) {}
    }, false);

    document.addEventListener('visibilitychange', () => {
        try {
            if (document.visibilityState !== 'hidden') return;
            if (SS._restoreGate || SS._restoreInProgress || SS._restoreFailed) return;
            SS.saveToDB(true);
        } catch (err) {}
    }, false);

    console.info('[Persistence V3] 已启用：恢复期间禁止空场景覆盖、稳定 objectId、GLB 异步顺序安全、原生动画配置持久化、失败保护。');
})();
/*
============================================================================
* ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
* ★                                                                          ★
* ★  演示模式增强层 V2 —— 相机聚焦 / 卡片美化 / IoT玻璃面板 / 房间光照隔离  ★
* ★                                                                          ★
* ★  【V2 关键修复】                                                        ★
* ★                                                                          ★
* ★  1. 修复"演示模式无法自由旋转 / 缩放"                                    ★
* ★     · pointerdown 仅记录起点，不立即触发聚焦/复位                        ★
* ★     · pointerup 时位移 < 10px 且时间 < 600ms 才判定为"点击"              ★
* ★     · 拖动 / 捏合 → 完全交给 OrbitControls 处理，互不干扰               ★
* ★                                                                          ★
* ★  2. 修复"点击模型 → 相机聚焦放大查看"                                    ★
* ★     · 与拖动解耦后，单击模型即平滑聚焦                                  ★
* ★                                                                          ★
* ★  3. 修复"点击空白 → 相机回归整体户型总览（对准原点三维户型）"            ★
* ★     · 严格以可见 structureGroup 包围盒中心为目标                        ★
* ★     · 无结构时回退到原点 (0, floorY, 0)                                  ★
* ★                                                                          ★
* ★  本层为纯追加增强，不修改任何原有函数体，所有原功能 100% 保留。          ★
* ★                                                                          ★
* ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
============================================================================
*/
(function installDemoEnhancementV2() {
    'use strict';

    if (typeof app === 'undefined' || !app) return;
    if (app.__demoEnhancementV2Installed) return;
    app.__demoEnhancementV2Installed = true;

    /* ========================================================================
     * ▓▓▓▓▓▓▓▓▓▓ 第一部分：相机平滑聚焦引擎 ▓▓▓▓▓▓▓▓▓▓
     * ======================================================================== */

    app._camAnimV2 = null;

    app._snapshotCameraStateV2 = function () {
        return {
            pos: this.camera ? this.camera.position.clone() : new THREE.Vector3(),
            target: (this.orbit && this.orbit.target)
                ? this.orbit.target.clone()
                : new THREE.Vector3()
        };
    };

    app._smoothCameraToV2 = function (toPos, toTarget, duration) {
        if (!this.camera || !this.orbit) return;
        duration = Math.max(180, duration || 720);
        const snap = this._snapshotCameraStateV2();
        this._camAnimV2 = {
            start: performance.now(),
            dur: duration,
            fromPos: snap.pos,
            toPos: toPos.clone(),
            fromTgt: snap.target,
            toTgt: toTarget.clone()
        };
    };

    app._updateCameraAnimV2 = function () {
        const a = this._camAnimV2;
        if (!a) return false;
        const t = Math.min(1, (performance.now() - a.start) / a.dur);
        // easeInOutCubic
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        try {
            this.camera.position.lerpVectors(a.fromPos, a.toPos, e);
            if (this.orbit && this.orbit.target) {
                this.orbit.target.lerpVectors(a.fromTgt, a.toTgt, e);
            }
            this.orbit.update();
        } catch (err) {}
        if (t >= 1) {
            try {
                this.camera.position.copy(a.toPos);
                if (this.orbit && this.orbit.target) {
                    this.orbit.target.copy(a.toTgt);
                    this.orbit.update();
                }
            } catch (err) {}
            this._camAnimV2 = null;
            return false;
        }
        return true;
    };

    /**
     * 聚焦到任意 3D 对象（放大展示）
     * @param {THREE.Object3D} obj 目标模型
     * @param {Object} opts { padding, direction, duration, minDistance, maxDistance }
     */
    app.focusOnObjectV2 = function (obj, opts) {
        if (!obj || !this.camera || !this.orbit) return;
        opts = opts || {};
        let box;
        try {
            obj.updateMatrixWorld(true);
            box = new THREE.Box3().setFromObject(obj);
        } catch (e) { return; }
        if (!box || box.isEmpty()) return;

        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z, 0.4);
        const fov = (this.camera.fov || 45) * Math.PI / 180;
        const padding = (typeof opts.padding === 'number') ? opts.padding : 2.35;

        let dist = (maxDim / (2 * Math.tan(fov / 2))) * padding;
        const minDist = (typeof opts.minDistance === 'number') ? opts.minDistance : 1.6;
        const maxDist = (typeof opts.maxDistance === 'number') ? opts.maxDistance : 60;
        dist = Math.max(minDist, Math.min(maxDist, dist));

        const dir = (opts.direction instanceof THREE.Vector3)
            ? opts.direction.clone().normalize()
            : new THREE.Vector3(1, 0.72, 1).normalize();

        const toPos = center.clone().add(dir.multiplyScalar(dist));
        this._smoothCameraToV2(toPos, center, opts.duration || 720);
    };

    /**
     * ★★★ V2 修复：相机回归整体户型总览（对准原点 / 户型中心） ★★★
     *
     * 优先级：
     *   1. 合并所有可见 structureGroup 子对象的包围盒 → 以其中心为目标
     *   2. 无可见结构 → 严格对准原点 (0, baseY, 0)
     */
    app.resetCameraOverviewV2 = function (opts) {
        opts = opts || {};
        if (!this.camera || !this.orbit) return;

        const fi = this.isPlayMode
            ? (this.playModeShowAll ? 0 : this.playModeFloor)
            : this.currentFloor;
        const baseY = this.getFloorBaseY(fi);

        // ── 收集所有"可见结构"的包围盒 ──
        let box = new THREE.Box3();
        let hasBox = false;
        try {
            if (this.structureGroup) {
                this.structureGroup.children.forEach(mesh => {
                    if (!mesh) return;
                    if (mesh.visible === false) return;
                    // 只统计带几何的 mesh（地板/墙/天花板/柱）
                    if (!mesh.isMesh && !(mesh.children && mesh.children.length)) return;
                    let b;
                    try { b = new THREE.Box3().setFromObject(mesh); } catch (e) { return; }
                    if (!b || b.isEmpty()) return;
                    if (!isFinite(b.min.x) || !isFinite(b.max.x) ||
                        !isFinite(b.min.z) || !isFinite(b.max.z)) return;
                    if (!hasBox) { box.copy(b); hasBox = true; }
                    else box.union(b);
                });
            }
        } catch (e) {}

        let toTarget, toPos;

        if (hasBox) {
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            // 目标 = 户型几何中心（世界坐标 x/z，通常接近原点）
            toTarget = center.clone();
            // ★ 强制把目标拉到当前楼层的水平中心：户型就是以画布原点为中心绘制的
            // 因此 center.x ≈ 0、center.z ≈ 0，这里直接使用即可
            const maxDim = Math.max(size.x, size.y, size.z, 4);
            const fov = (this.camera.fov || 45) * Math.PI / 180;
            let dist = (maxDim / (2 * Math.tan(fov / 2))) * 1.65;
            dist = Math.max(dist, 12);
            const dir = new THREE.Vector3(1, 0.85, 1).normalize();
            toPos = center.clone().add(dir.multiplyScalar(dist));
        } else {
            // ── 无结构：严格对准原点 ──
            const totalH = this.getFloorBaseY(this.floorShapes.length);
            const camY = baseY + Math.max(totalH * 0.6, 14);
            toTarget = new THREE.Vector3(0, baseY, 0);
            toPos = new THREE.Vector3(0, camY, 28);
        }

        this._smoothCameraToV2(toPos, toTarget, opts.duration || 850);
    };

    /**
     * 聚焦指示器（屏幕中心光晕）
     */
    app._showFocusIndicatorV2 = function (obj) {
        if (!obj || !this.renderer || !this.camera) return;
        let el = document.getElementById('focusIndicatorV2');
        if (!el) {
            el = document.createElement('div');
            el.id = 'focusIndicatorV2';
            el.style.cssText = [
                'position:absolute',
                'width:46px',
                'height:46px',
                'border:2px solid rgba(76,201,240,0.92)',
                'border-radius:50%',
                'box-shadow:0 0 20px rgba(76,201,240,0.75), inset 0 0 16px rgba(76,201,240,0.45)',
                'pointer-events:none',
                'transform:translate(-50%, -50%)',
                'z-index:45',
                'display:none',
                'transition:opacity 0.2s ease'
            ].join(';');
            const container = document.getElementById('viewport') || document.body;
            container.appendChild(el);
        }
        try {
            obj.updateMatrixWorld(true);
            const box = new THREE.Box3().setFromObject(obj);
            if (box.isEmpty()) { el.style.display = 'none'; return; }
            const center = box.getCenter(new THREE.Vector3());
            center.project(this.camera);
            const cw = this.renderer.domElement.clientWidth;
            const ch = this.renderer.domElement.clientHeight;
            const x = (center.x * 0.5 + 0.5) * cw;
            const y = (center.y * -0.5 + 0.5) * ch;
            el.style.left = x + 'px';
            el.style.top = y + 'px';
            el.style.display = 'block';
        } catch (e) {
            el.style.display = 'none';
        }
    };

    app._hideFocusIndicatorV2 = function () {
        const el = document.getElementById('focusIndicatorV2');
        if (el) el.style.display = 'none';
    };

    /* ========================================================================
     * ▓▓▓▓▓▓▓▓▓▓ 第二部分：演示模式点击检测（区分单击 / 拖动）▓▓▓▓▓▓▓▓▓▓
     * ========================================================================
     *
     * ★★★ 这是本次修复的核心 ★★★
     *
     * 原 V1 版：pointerdown 立即聚焦/复位，导致拖动旋转时相机乱飞
     * V2 版  ：pointerdown 只记录起点；pointerup 时按位移/时长判定
     *
     * 判定标准：
     *   · 位移 < 10px
     *   · 时间 < 600ms
     *   · 单指（触摸时）
     * 满足 → 点击；否则 → 视为拖动，交给 OrbitControls
     */

    // 内联"真正的原始" on3DClick（避免与 V1 包装器叠加）
    const _realOrigOn3DClickV2 = function (e) {
        if (!this.renderer || !this.camera) return;
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const visibleObjects = [];
        this.furnitureGroup.children.forEach(obj => {
            if (obj.visible) visibleObjects.push(obj);
        });
        const intersects = this.raycaster.intersectObjects(visibleObjects, true);
        if (intersects.length > 0) {
            let target = intersects[0].object;
            while (target.parent && target.parent !== this.furnitureGroup) target = target.parent;
            if (this.isPlayMode) this.handleDeviceControl(target);
            else this.selectObj(target, intersects[0].object);
        } else {
            if (!this.isPlayMode && !this.transCtrl.dragging) this.deselect();
        }
    };

    app.on3DClick = function (e) {
        if (!this.renderer || !this.camera) return;
        // 编辑模式：完全交给原始逻辑
        if (!this.isPlayMode) {
            return _realOrigOn3DClickV2.call(this, e);
        }
        // 演示模式：仅记录起点，等待 pointerup 判定
        this._demoClickStartV2 = {
            x: e.clientX,
            y: e.clientY,
            time: performance.now(),
            pointerId: (e.pointerId !== undefined) ? e.pointerId : null
        };
    };

    app._setupDemoClickDetectionV2 = function () {
        if (this._demoClickDetectionSetupV2) return;
        if (!this.renderer || !this.renderer.domElement) return;
        this._demoClickDetectionSetupV2 = true;

        const dom = this.renderer.domElement;
        const self = this;

        const finishClick = (clientX, clientY) => {
            if (!self.isPlayMode) return;
            const start = self._demoClickStartV2;
            if (!start) return;
            const dx = Math.abs(clientX - start.x);
            const dy = Math.abs(clientY - start.y);
            const dt = performance.now() - start.time;
            self._demoClickStartV2 = null;

            // ★ 只有位移小、时间短才算"点击"，否则视为拖动
            if (dx < 10 && dy < 10 && dt < 600) {
                self._handleDemoTapV2(clientX, clientY);
            }
        };

        dom.addEventListener('pointerup', (e) => {
            finishClick(e.clientX, e.clientY);
        });

        dom.addEventListener('touchend', (e) => {
            if (e.changedTouches && e.changedTouches[0]) {
                finishClick(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            }
        }, { passive: true });

        // 若 pointercancel / touchcancel 也要清理状态
        const cancelClick = () => { self._demoClickStartV2 = null; };
        dom.addEventListener('pointercancel', cancelClick);
        dom.addEventListener('touchcancel', cancelClick, { passive: true });
    };

    /**
     * ★★★ 演示模式下的"单击"处理 ★★★
     * · 命中模型 → 平滑聚焦 + 显示控制面板
     * · 空白点击 → 相机回归整体户型（对准原点）
     */
    app._handleDemoTapV2 = function (clientX, clientY) {
        if (!this.renderer || !this.camera) return;
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const visibleObjects = [];
        this.furnitureGroup.children.forEach(obj => {
            if (obj.visible) visibleObjects.push(obj);
        });

        let hits = [];
        try {
            hits = this.raycaster.intersectObjects(visibleObjects, true);
        } catch (err) { hits = []; }

        if (hits.length > 0) {
            // ── 命中模型：聚焦 + 显示控制面板 ──
            let target = hits[0].object;
            while (target.parent && target.parent !== this.furnitureGroup) {
                target = target.parent;
            }
            if (!target || !target.userData) return;

            this.focusOnObjectV2(target, { duration: 680, padding: 2.4 });
            this._showFocusIndicatorV2(target);
            try { this.handleDeviceControl(target); } catch (err) {}
        } else {
            // ── 空白点击：相机回归整体户型（对准原点） ──
            this.resetCameraOverviewV2({ duration: 820 });
            this._hideFocusIndicatorV2();
            this.closeIoTPanel();
            this.currentControlObj = null;
        }
    };

    /* ========================================================================
     * ▓▓▓▓▓▓▓▓▓▓ 第三部分：设备状态历史记录 ▓▓▓▓▓▓▓▓▓▓
     * ======================================================================== */

    app._recordDeviceStateHistoryV2 = function (obj) {
        if (!obj || !obj.userData) return;
        const d = obj.userData;
        d.state = d.state || { on: false, dimmer: 100, color: '#ffffff' };
        if (!d.__stateHistory) d.__stateHistory = { lastOn: null, lastOff: null };
        const now = Date.now();
        if (d.state.on) d.__stateHistory.lastOn = now;
        else d.__stateHistory.lastOff = now;
    };

    app._formatTimestampV2 = function (ts) {
        if (!ts || !isFinite(ts)) return '---';
        try {
            const dt = new Date(ts);
            const pad = (n) => (n < 10 ? '0' + n : '' + n);
            return dt.getFullYear() + '-' +
                pad(dt.getMonth() + 1) + '-' +
                pad(dt.getDate()) + ' ' +
                pad(dt.getHours()) + ':' +
                pad(dt.getMinutes()) + ':' +
                pad(dt.getSeconds());
        } catch (e) { return '---'; }
    };

    // 包装 toggleDevicePower
    const _origToggleDevicePowerV2 = app.toggleDevicePower;
    if (typeof _origToggleDevicePowerV2 === 'function') {
        app.toggleDevicePower = function () {
            const obj = this.currentControlObj;
            if (obj && obj.userData) {
                obj.userData.state = obj.userData.state || {};
                const willBeOn = !obj.userData.state.on;
                if (!obj.userData.__stateHistory) {
                    obj.userData.__stateHistory = { lastOn: null, lastOff: null };
                }
                const now = Date.now();
                if (willBeOn) obj.userData.__stateHistory.lastOn = now;
                else obj.userData.__stateHistory.lastOff = now;
            }
            const r = _origToggleDevicePowerV2.call(this);
            try { this.saveSystem.saveToDB(true); } catch (e) {}
            return r;
        };
    }

    // 包装 applyDeviceState
    const _origApplyDeviceStateV2 = app.applyDeviceState;
    if (typeof _origApplyDeviceStateV2 === 'function') {
        app.applyDeviceState = function (obj) {
            if (obj && obj.userData) {
                const d = obj.userData;
                d.__prevOnState = d.__prevOnState === undefined
                    ? !!(d.state && d.state.on)
                    : d.__prevOnState;
                const nowOn = !!(d.state && d.state.on);
                if (nowOn !== d.__prevOnState) {
                    if (!d.__stateHistory) d.__stateHistory = { lastOn: null, lastOff: null };
                    const ts = Date.now();
                    if (nowOn) d.__stateHistory.lastOn = ts;
                    else d.__stateHistory.lastOff = ts;
                    d.__prevOnState = nowOn;
                }
            }
            return _origApplyDeviceStateV2.call(this, obj);
        };
    }

    /* ========================================================================
     * ▓▓▓▓▓▓▓▓▓▓ 第四部分：IoT 面板 —— 玻璃质感 + 时间 / 亮度 / 颜色 ▓▓▓▓▓▓▓▓▓▓
     * ======================================================================== */

    app.handleDeviceControl = function (obj) {
        if (!obj || !obj.userData) return;
        const data = obj.userData;
        const panel = document.getElementById('iotPanel');
        const title = document.getElementById('iotTitle');
        const content = document.getElementById('iotContent');
        if (!panel || !title || !content) return;

        this.currentControlObj = obj;
        try { this.setupIoTPanelDrag(); } catch (e) {}

        const iconMap = {
            light: '💡', ac: '❄️', tv: '📺',
            door_window: '🚪', walker: '🚶', fan: '🌀', switch: '🔘'
        };
        const icon = iconMap[data.type] || '📦';
        title.innerText = icon + ' ' + (data.name || '设备') +
            (data.entityId ? ' · ' + data.entityId : '');
        content.innerHTML = '';

        // ---- 步行模型 ----
        if (data.type === 'walker') {
            const wc = data.walkConfig || {};
            const frozen = !!wc.freeze;
            const paused = !!wc.paused;
            const info = document.createElement('div');
            info.style.cssText =
                'text-align:center;color:var(--accent);font-size:0.78rem;line-height:1.7;' +
                'padding:10px 12px;background:rgba(255,255,255,0.045);' +
                'border:1px solid rgba(255,255,255,0.08);border-radius:12px;';
            info.innerHTML = frozen
                ? '🚫 禁止移动 · 原地播放模型自带动画<br><span style="color:#888;font-size:0.62rem;">巡游与碰撞检测已暂停</span>'
                : '🚶 自动行走巡游中<br><span style="color:#888;font-size:0.62rem;">速度 ' +
                  (wc.speed || 0.6).toFixed(1) + ' m/s · 墙体/模型碰撞检测已启用</span>';
            content.appendChild(info);

            const wbtn = document.createElement('button');
            wbtn.className = paused ? 'success' : 'danger';
            wbtn.style.width = '100%';
            wbtn.innerHTML = paused ? '▶ 继续行走' : '⏸ 暂停行走';
            wbtn.onclick = () => {
                data.walkConfig = data.walkConfig || {
                    speed: 0.6, radius: 0.35, faceOffset: 0,
                    useAnim: true, useBob: true, freeze: false,
                    dir: 0, turnTimer: 2
                };
                data.walkConfig.paused = !data.walkConfig.paused;
                this.handleDeviceControl(this.currentControlObj);
            };
            content.appendChild(wbtn);

            const fbtn = document.createElement('button');
            fbtn.style.cssText =
                'width:100%;border:none;border-radius:10px;cursor:pointer;' +
                'background:' + (frozen
                    ? 'linear-gradient(135deg,#2ecc71,#27ae60)'
                    : 'linear-gradient(135deg,#4a4a55,#2a2a33)') + ';' +
                'color:#fff;font-weight:600;';
            fbtn.innerHTML = frozen ? '🚶 恢复自动行走' : '🚫 禁止移动 (原地播动画)';
            fbtn.onclick = () => {
                data.walkConfig = data.walkConfig || {
                    speed: 0.6, radius: 0.35, faceOffset: 0,
                    useAnim: true, useBob: true, freeze: false,
                    dir: 0, turnTimer: 2
                };
                data.walkConfig.freeze = !data.walkConfig.freeze;
                if (data.walkConfig.freeze) data.walkConfig.paused = false;
                this.handleDeviceControl(this.currentControlObj);
                this.saveSystem.saveToDB(true);
            };
            content.appendChild(fbtn);
        }

        // ---- 普通家具 / 门窗 ----
        if (data.type === 'furniture' || data.type === 'door_window') {
            const info = document.createElement('div');
            info.style.cssText =
                'text-align:center;color:#888;padding:12px;font-size:0.78rem;';
            info.textContent = data.type === 'door_window' ? '门窗已安装' : '无智能功能';
            content.appendChild(info);
        }

        // ---- 智能设备 ----
        const isSmart = ['light', 'ac', 'tv', 'switch', 'fan'].indexOf(data.type) !== -1;
        if (isSmart) {
            // ① 上次开 / 关时间
            const hist = data.__stateHistory || { lastOn: null, lastOff: null };
            const stateRow = document.createElement('div');
            stateRow.className = 'iot-state-row';
            const onItem = document.createElement('div');
            onItem.className = 'iot-state-item on';
            onItem.innerHTML =
                '<div class="iot-state-label">上次打开</div>' +
                '<div class="iot-state-value">' + this._formatTimestampV2(hist.lastOn) + '</div>';
            const offItem = document.createElement('div');
            offItem.className = 'iot-state-item off';
            offItem.innerHTML =
                '<div class="iot-state-label">上次关闭</div>' +
                '<div class="iot-state-value">' + this._formatTimestampV2(hist.lastOff) + '</div>';
            stateRow.appendChild(onItem);
            stateRow.appendChild(offItem);
            content.appendChild(stateRow);

            // ② 电源按钮
            const on = !!(data.state && data.state.on);
            const powerBtn = document.createElement('button');
            powerBtn.className = on ? 'danger' : 'success';
            powerBtn.style.cssText =
                'width:100%;padding:12px;font-size:1rem;border-radius:10px;' +
                'box-shadow:0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.14);';
            powerBtn.innerHTML = on ? '⭕ 关闭电源' : '⚡ 开启电源';
            powerBtn.onclick = () => this.toggleDevicePower();
            content.appendChild(powerBtn);

            // ③ 灯具专属：亮度 + 颜色
            if (data.type === 'light' && data.state && data.state.on) {
                if (!data.features || data.features.dimmer !== false) {
                    const brightBlock = document.createElement('div');
                    brightBlock.className = 'iot-slider-block';
                    const head = document.createElement('div');
                    head.className = 'iot-slider-head';
                    head.innerHTML =
                        '<span>💡 亮度</span>' +
                        '<span class="iot-slider-value" id="iotDimValV2">' +
                        (data.state.dimmer || 100) + '%</span>';
                    const slider = document.createElement('input');
                    slider.type = 'range';
                    slider.min = 0; slider.max = 100;
                    slider.value = data.state.dimmer || 100;
                    slider.addEventListener('input', (e) => {
                        const v = parseInt(e.target.value, 10) || 0;
                        const valEl = document.getElementById('iotDimValV2');
                        if (valEl) valEl.textContent = v + '%';
                        this.updateDeviceState('dimmer', v);
                    });
                    brightBlock.appendChild(head);
                    brightBlock.appendChild(slider);
                    content.appendChild(brightBlock);
                }

                if (!data.features || data.features.color !== false) {
                    const colorBlock = document.createElement('div');
                    colorBlock.className = 'iot-color-block';
                    const label = document.createElement('label');
                    label.textContent = '🎨 颜色';
                    const colorInput = document.createElement('input');
                    colorInput.type = 'color';
                    colorInput.value = data.state.color || '#ffffff';
                    colorInput.addEventListener('input', (e) => {
                        this.updateDeviceState('color', e.target.value);
                    });
                    colorBlock.appendChild(label);
                    colorBlock.appendChild(colorInput);
                    content.appendChild(colorBlock);

                    const palette = document.createElement('div');
                    palette.className = 'iot-quick-colors';
                    const presetColors = [
                        '#ffffff', '#ffe28a', '#ffb3b3', '#a8e6cf',
                        '#6bc5f7', '#d4a5ff', '#ff9f68', '#4cc9f0'
                    ];
                    presetColors.forEach(c => {
                        const dot = document.createElement('div');
                        dot.className = 'qc-dot';
                        dot.style.background = c;
                        dot.style.color = c;
                        dot.title = c;
                        dot.onclick = () => {
                            this.updateDeviceState('color', c);
                            if (colorInput) colorInput.value = c;
                        };
                        palette.appendChild(dot);
                    });
                    content.appendChild(palette);
                }
            }

            // ④ 空调专属
            if (data.type === 'ac' && data.state && data.state.on) {
                this.renderACControls(content);
            }

            // ⑤ 风扇提示
            if (data.type === 'fan') {
                const tip = document.createElement('div');
                tip.style.cssText =
                    'text-align:center;color:#888;font-size:0.68rem;padding:8px;line-height:1.5;';
                tip.textContent = data._nativeAnimationAvailable
                    ? '✅ 模型绑定动画会随风扇开关播放'
                    : '当前模型没有检测到绑定动画';
                content.appendChild(tip);
            }
        }

        panel.style.display = 'block';
        panel.style.animation = 'popIn 0.32s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        if (!panel.dataset.positionSet) {
            panel.style.left = '50%';
            panel.style.top = '50%';
            panel.style.transform = 'translate(-50%, -50%)';
            panel.style.margin = '0';
            panel.dataset.positionSet = '1';
        }
    };

    /* ========================================================================
     * ▓▓▓▓▓▓▓▓▓▓ 第五部分：房间光源隔离 ▓▓▓▓▓▓▓▓▓▓
     * ======================================================================== */

    app._applyRoomLightIsolationV2 = function () {
        if (!this.furnitureGroup || !this.structureGroup) return;
        const shadowOn = (this.showShadow !== false);
        const LC = this.lightConfig || {};
        const lampShadowCfg = LC.lampShadow || {};
        const maxShadowCasters = shadowOn
            ? Math.max(0, lampShadowCfg.maxShadowCasters || 3)
            : 0;

        // ① 结构阴影标记
        try {
            this.structureGroup.traverse((o) => {
                if (!o.isMesh) return;
                const ud = o.userData || {};
                if (ud.isCeiling) {
                    o.castShadow = false;
                    o.receiveShadow = shadowOn;
                } else if (ud.roomIndex !== undefined) {
                    o.castShadow = false;
                    o.receiveShadow = shadowOn;
                } else {
                    o.castShadow = shadowOn;
                    o.receiveShadow = shadowOn;
                }
                if (o.material) {
                    const mats = Array.isArray(o.material) ? o.material : [o.material];
                    mats.forEach(m => { if (m) m.needsUpdate = true; });
                }
            });
        } catch (e) {
            console.warn('[RoomLightIsolation V2] 墙体阴影标记失败:', e);
        }

        // ② 按楼层分组
        const byFloor = {};
        this.furnitureGroup.children.forEach((obj) => {
            const d = obj && obj.userData;
            if (!d || d.type !== 'light') return;
            const light = d.refs && d.refs.light;
            if (!light) return;
            let fi = d.floorIndex;
            if (typeof fi !== 'number' || !isFinite(fi)) fi = 0;
            if (!byFloor[fi]) byFloor[fi] = [];
            byFloor[fi].push({
                obj, light,
                on: !!(d.state && d.state.on),
                intensity: isFinite(light.intensity) ? light.intensity : 0
            });
        });

        // ③ 每层挑选投射者
        Object.keys(byFloor).forEach((fi) => {
            const list = byFloor[fi];
            if (!shadowOn) {
                list.forEach((item) => {
                    const l = item.light;
                    l.castShadow = false;
                    if (l.shadow && l.shadow.map) {
                        try { l.shadow.map.dispose(); l.shadow.map = null; } catch (e) {}
                    }
                });
                return;
            }
            const onLights = list.filter(x => x.on)
                .sort((a, b) => b.intensity - a.intensity);
            const casterSet = new Set(
                onLights.slice(0, maxShadowCasters).map(x => x.light)
            );
            list.forEach((item) => {
                const l = item.light;
                const shouldCast = casterSet.has(l);
                if (shouldCast) {
                    l.castShadow = true;
                    if (!l.shadow.mapSize) l.shadow.mapSize = new THREE.Vector2(1024, 1024);
                    const mapSize = lampShadowCfg.mapSize || 1024;
                    l.shadow.mapSize.width = mapSize;
                    l.shadow.mapSize.height = mapSize;
                    if (l.shadow.camera) {
                        l.shadow.camera.near = 0.1;
                        const lampDist = isFinite(LC.lampDistance) ? LC.lampDistance : 14;
                        l.shadow.camera.far = Math.max(8, lampDist * 1.8);
                        l.shadow.camera.updateProjectionMatrix();
                    }
                    l.shadow.bias = -0.0012;
                    l.shadow.normalBias = 0.04;
                    if (l.shadow.radius !== undefined) l.shadow.radius = 4;
                    if (l.shadow.map) {
                        try { l.shadow.map.dispose(); l.shadow.map = null; } catch (e) {}
                    }
                } else {
                    l.castShadow = false;
                    if (l.shadow && l.shadow.map) {
                        try { l.shadow.map.dispose(); l.shadow.map = null; } catch (e) {}
                    }
                }
            });
        });

        if (this.renderer && this.renderer.shadowMap) {
            this.renderer.shadowMap.enabled = shadowOn;
            this.renderer.shadowMap.needsUpdate = true;
        }
    };

    /* ========================================================================
     * ▓▓▓▓▓▓▓▓▓▓ 第六部分：生命周期挂钩 ▓▓▓▓▓▓▓▓▓▓
     * ======================================================================== */

    // ① init3D 后设置点击检测
    const _origInit3DV2 = app.init3D;
    app.init3D = function () {
        const r = _origInit3DV2.apply(this, arguments);
        try { this._setupDemoClickDetectionV2(); } catch (e) {}
        return r;
    };

    // ② generate3D 后重新应用房间光照隔离
    const _origGenerate3DV2 = app.generate3D;
    app.generate3D = function () {
        const r = _origGenerate3DV2.apply(this, arguments);
        try { this._applyRoomLightIsolationV2(); } catch (e) {}
        return r;
    };

    // ③ 灯/开关切换后
    const _origApplyDeviceStateV2b = app.applyDeviceState;
    app.applyDeviceState = function (obj) {
        const r = _origApplyDeviceStateV2b.call(this, obj);
        try { this._applyRoomLightIsolationV2(); } catch (e) {}
        return r;
    };

    // ④ 全局光重算后
    const _origRecalcGlobalLightingV2 = app._recalculateGlobalLighting;
    if (typeof _origRecalcGlobalLightingV2 === 'function') {
        app._recalculateGlobalLighting = function (floorIdx) {
            const r = _origRecalcGlobalLightingV2.call(this, floorIdx);
            try { this._applyRoomLightIsolationV2(); } catch (e) {}
            return r;
        };
    }

    // ⑤ 阴影质量切换后
    const _origSetShadowQualityV2 = app.setShadowQuality;
    if (typeof _origSetShadowQualityV2 === 'function') {
        app.setShadowQuality = function (level) {
            const r = _origSetShadowQualityV2.call(this, level);
            try { this._applyRoomLightIsolationV2(); } catch (e) {}
            return r;
        };
    }

    // ⑥ 模型渲染阴影开关 → 联动房间光照隔离
    const _origSetModelShadowV2 = app.setModelShadow;
    if (typeof _origSetModelShadowV2 === 'function') {
        app.setModelShadow = function (show) {
            const r = _origSetModelShadowV2.call(this, show);
            try {
                this._applyRoomLightIsolationV2();
                if (show) {
                    this.saveSystem.showToast('🔒 已开启房间光照隔离：每盏灯只照亮所在房间');
                } else {
                    this.saveSystem.showToast('🔓 已关闭房间光照隔离：所有灯光全局生效');
                }
            } catch (e) {}
            return r;
        };
    }

    // ⑦ togglePlayMode：进入时初始化点击检测，退出时清理状态
    const _origTogglePlayModeV2 = app.togglePlayMode;
    app.togglePlayMode = function (enter) {
        const r = _origTogglePlayModeV2.call(this, enter);

        if (enter) {
            try { this._setupDemoClickDetectionV2(); } catch (e) {}
            // 进入演示模式：初始相机总览（对准原点）
            setTimeout(() => {
                try { this.resetCameraOverviewV2({ duration: 700 }); } catch (e) {}
            }, 900);
        } else {
            // 退出演示模式：清理状态
            try { this._hideFocusIndicatorV2(); } catch (e) {}
            try { this._camAnimV2 = null; } catch (e) {}
            try { this._demoClickStartV2 = null; } catch (e) {}
        }

        [120, 400, 900, 1500].forEach(d => {
            setTimeout(() => {
                try { this._applyRoomLightIsolationV2(); } catch (e) {}
            }, d);
        });

        return r;
    };

    // ⑧ init 后多次应用
    const _origInitV2 = app.init;
    app.init = async function () {
        const r = await _origInitV2.call(this);
        [300, 800, 1500, 2500, 4000].forEach(d => {
            setTimeout(() => {
                try { this._applyRoomLightIsolationV2(); } catch (e) {}
                try { this._setupDemoClickDetectionV2(); } catch (e) {}
            }, d);
        });
        return r;
    };

    // ⑨ 把相机动画接入渲染循环
    const _origUpdateDeviceAnimationsV2 = app.updateDeviceAnimations;
    if (typeof _origUpdateDeviceAnimationsV2 === 'function') {
        app.updateDeviceAnimations = function (time, delta) {
            const r = _origUpdateDeviceAnimationsV2.call(this, time, delta);
            try { this._updateCameraAnimV2(); } catch (e) {}
            if (this.isPlayMode && this.currentControlObj) {
                try { this._showFocusIndicatorV2(this.currentControlObj); } catch (e) {}
            }
            return r;
        };
    }

    // ⑩ createLabels 增强：卡片点击聚焦
    const _origCreateLabelsV2 = app.createLabels;
    if (typeof _origCreateLabelsV2 === 'function') {
        app.createLabels = function () {
            const r = _origCreateLabelsV2.call(this);
            try {
                const container = document.getElementById('labelContainer');
                if (!container) return r;
                const children = Array.from(container.children);
                children.forEach((el, idx) => {
                    const item = this.labels[idx];
                    if (!item || !item.obj) return;
                    const obj = item.obj;
                    const clone = el.cloneNode(true);
                    el.parentNode.replaceChild(clone, el);
                    item.div = clone;
                    clone.onclick = (e) => {
                        e.stopPropagation();
                        this.focusOnObjectV2(obj, { duration: 700, padding: 2.4 });
                        this._showFocusIndicatorV2(obj);
                        this.handleDeviceControl(obj);
                    };
                    clone.ontouchstart = (e) => {
                        e.stopPropagation();
                        this.focusOnObjectV2(obj, { duration: 700, padding: 2.4 });
                        this._showFocusIndicatorV2(obj);
                        this.handleDeviceControl(obj);
                    };
                });
            } catch (e) {}
            return r;
        };
    }

    /* ========================================================================
     * ▓▓▓▓▓▓▓▓▓▓ 第七部分：IoT 面板拖拽增强 ▓▓▓▓▓▓▓▓▓▓
     * ======================================================================== */

    app.setupIoTPanelDrag = function () {
        const panel = document.getElementById('iotPanel');
        const header = document.getElementById('iotHeader');
        if (!panel || !header) return;
        if (panel.dataset.dragSetupV2 === '1') return;
        panel.dataset.dragSetupV2 = '1';

        let isDragging = false;
        let startX = 0, startY = 0, origX = 0, origY = 0;

        const getPoint = (e) => {
            if (e.touches && e.touches[0]) return e.touches[0];
            if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0];
            return e;
        };

        const onStart = (e) => {
            if (e.target.closest && e.target.closest('.iot-close')) return;
            const pt = getPoint(e);
            isDragging = true;
            const rect = panel.getBoundingClientRect();
            origX = rect.left;
            origY = rect.top;
            startX = pt.clientX - origX;
            startY = pt.clientY - origY;
            panel.style.transform = 'none';
            panel.style.margin = '0';
            panel.style.left = origX + 'px';
            panel.style.top = origY + 'px';
            panel.style.cursor = 'grabbing';
            header.style.cursor = 'grabbing';
            if (e.cancelable) e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
        };

        const onMove = (e) => {
            if (!isDragging) return;
            const pt = getPoint(e);
            let newX = pt.clientX - startX;
            let newY = pt.clientY - startY;
            const maxX = window.innerWidth - panel.offsetWidth - 4;
            const maxY = window.innerHeight - panel.offsetHeight - 4;
            newX = Math.max(4, Math.min(maxX, newX));
            newY = Math.max(4, Math.min(maxY, newY));
            panel.style.left = newX + 'px';
            panel.style.top = newY + 'px';
            if (e.cancelable) e.preventDefault();
        };

        const onEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            panel.style.cursor = '';
            header.style.cursor = 'grab';
        };

        header.addEventListener('mousedown', onStart);
        header.addEventListener('touchstart', onStart, { passive: false });
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
        document.addEventListener('touchcancel', onEnd);
    };

    /* ========================================================================
     * ▓▓▓▓▓▓▓▓▓▓ 第八部分：控制台 API ▓▓▓▓▓▓▓▓▓▓
     * ======================================================================== */

    app.focusOnSelectedModelV2 = function () {
        if (this.selectedObj) {
            this.focusOnObjectV2(this.selectedObj, { duration: 720, padding: 2.4 });
        } else if (this.currentControlObj) {
            this.focusOnObjectV2(this.currentControlObj, { duration: 720, padding: 2.4 });
        } else {
            this.saveSystem.showToast('⚠️ 请先点击一个模型');
        }
    };

    app.resetCameraViewV2 = function () {
        this.resetCameraOverviewV2({ duration: 850 });
        this._hideFocusIndicatorV2();
    };

    app.diagnoseRoomLightIsolation = function () {
        const shadowOn = (this.showShadow !== false);
        const result = {
            showShadow: shadowOn,
            isolationMode: shadowOn
                ? '已开启（房间光源独立，被墙体阻挡）'
                : '已关闭（所有灯光全局生效）',
            lamps: [],
            wallsCastShadow: 0,
            ceilingsCastShadow: 0
        };
        if (this.furnitureGroup) {
            this.furnitureGroup.children.forEach((obj) => {
                const d = obj && obj.userData;
                if (!d || d.type !== 'light') return;
                const l = d.refs && d.refs.light;
                result.lamps.push({
                    name: d.name || '未命名灯',
                    floorIndex: d.floorIndex,
                    on: !!(d.state && d.state.on),
                    castShadow: !!(l && l.castShadow),
                    intensity: l ? (l.intensity || 0).toFixed(2) : '0'
                });
            });
        }
        if (this.structureGroup) {
            this.structureGroup.traverse((o) => {
                if (!o.isMesh) return;
                const ud = o.userData || {};
                if (ud.isCeiling && o.castShadow) result.ceilingsCastShadow++;
                if (!ud.isCeiling && ud.roomIndex === undefined && o.castShadow) {
                    result.wallsCastShadow++;
                }
            });
        }
        console.log('=== 房间光源隔离诊断 V2 ===');
        console.table(result);
        console.log('灯光详情:', result.lamps);
        return result;
    };

    app.diagnoseDemoMode = function () {
        const info = {
            isPlayMode: !!this.isPlayMode,
            clickDetectionSetup: !!this._demoClickDetectionSetupV2,
            camAnimActive: !!this._camAnimV2,
            demoClickStart: this._demoClickStartV2 || null,
            orbitEnabled: this.orbit ? !!this.orbit.enabled : false,
            orbitRotateEnabled: this.orbit ? !!this.orbit.enableRotate : false,
            orbitZoomEnabled: this.orbit ? !!this.orbit.enableZoom : false,
            orbitDampingEnabled: this.orbit ? !!this.orbit.enableDamping : false,
            orbitMaxPolarAngle: this.orbit ? this.orbit.maxPolarAngle : null
        };
        console.log('=== 演示模式诊断 V2 ===', info);
        return info;
    };

    /* ========================================================================
     * 启动横幅
     * ======================================================================== */

    console.info('╔══════════════════════════════════════════════════════════════╗');
    console.info('║ [DemoEnhance V2] 演示模式 + 相机聚焦 + IoT玻璃面板 已启用     ║');
    console.info('║ ✓ 修复1：拖动/滚轮缩放与点击聚焦完全解耦，演示模式自由旋转    ║');
    console.info('║ ✓ 修复2：单击模型 → 相机平滑聚焦放大 + 控制面板               ║');
    console.info('║ ✓ 修复3：单击空白 → 相机回归整体户型（对准原点 0,0,0）         ║');
    console.info('║ ✓ 优化：IoT 玻璃面板 + 上次开/关时间 + 亮度/颜色滑块           ║');
    console.info('║ ✓ 优化：开启阴影 → 房间光照隔离；关闭 → 全局照明              ║');
    console.info('║                                                                ║');
    console.info('║ 控制台 API：                                                   ║');
    console.info('║   app.focusOnSelectedModelV2()   → 聚焦选中模型                ║');
    console.info('║   app.resetCameraViewV2()        → 相机复位总览                ║');
    console.info('║   app.diagnoseDemoMode()         → 演示模式诊断                ║');
    console.info('║   app.diagnoseRoomLightIsolation() → 房间光照隔离诊断         ║');
    console.info('╚══════════════════════════════════════════════════════════════╝');

})();