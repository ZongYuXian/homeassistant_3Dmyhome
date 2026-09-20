/**
 * ============================================================
 * 初始化.js --- 3D 智能设计器 Pro（地月系真实宇宙版 v7.2）
 * ============================================================
 * v7.2 更新（本次）：
 *  【修复】地球暗部泛红 / 泛粉
 *         · toneMappingExposure 1.0 → 0.92
 *           （避免城市暖色灯光进入 ACES 高光粉红区）
 *         · 夜灯提取改为"亮度门限 + 平方增强"
 *           （干掉 earth_lights 贴图自带的大片辉光背景，
 *             只保留真正的城市亮点 → 暗部回归纯黑）
 *         · 城市灯光颜色去掉红色偏置 (1.06,0.98,0.86) → (1.0,0.94,0.78)
 *         · nightIntensity 2.0 → 1.30
 *         · nightBaseGlow 0.018 → 0.005（暗部几乎纯黑）
 *         · nightRimColor 更暗更蓝，强度 0.14 → 0.07
 *         · 高光在夜面彻底归零（specLit 门限抬到 0.10）
 *
 * v7.1 基础特性（保留）：
 *  · 夜面城市灯光自发光（不受漫反射压暗）
 *  · 修复地球半透明（关闭 logarithmicDepthBuffer + 显式深度状态）
 *  · 进度 50% 后机器人平滑淡入并常驻
 *  · 粒子爆炸后机器人绕地球飞行 N 圈，最后冲向镜头
 *  · 机器人飞行姿态 XYZ 可调；光照集中可调
 *
 * -- 贴图目录（放在 img/ 下）--
 * img/earth_day.jpg  img/earth_night.jpg  img/earth_normal.jpg
 * img/earth_specular.jpg  img/earth_clouds.jpg
 * img/moon.jpg  img/sun.jpg  img/机器人.glb
 *
 * -- 可调参数导航 --
 *  · 地球白昼亮度   → 搜索 "★ 地球白昼亮度"
 *  · 地球夜晚灯光   → 搜索 "★ 地球夜晚灯光"
 *  · 夜灯亮度门限   → 搜索 "★ 夜灯亮度门限"
 *  · 粒子大小       → 搜索 "★ 粒子大小"
 *  · 粒子数量       → 搜索 "★ 粒子数量"
 *  · 汇聚速度       → 搜索 "★ 汇聚速度"
 *  · 爆炸速度       → 搜索 "★ 爆炸速度"
 *  · 爆炸散射       → 搜索 "★ 爆炸散射"
 *  · 爆炸衰减       → 搜索 "★ 爆炸衰减"
 *  · 爆炸时长       → 搜索 "★ 爆炸时长"
 *  · 宇航员位置     → 搜索 "★ 宇航员位置"
 *  · 机器人姿态     → 搜索 "★ 机器人姿态修正"
 *  · 机器人淡入     → 搜索 "★ 机器人淡入进度"
 *  · 绕地飞行       → 搜索 "★ 机器人飞行参数"
 *  · 光照强度       → 搜索 "★ 光照参数"
 * ============================================================
 */

(function () {
  'use strict';

  if (window.__INIT_PAGE_LOADED__) return;
  window.__INIT_PAGE_LOADED__ = true;

  /*
  ============================================================
  * 1. 配置
  * ============================================================
  */

  const CONFIG = {
    minDuration: 4800,
    maxDuration: 22000,
    astronautUrl: 'https://threejs.org/examples/models/gltf/Soldier.glb',
    textures: {
      earthDay: 'img/earth1.jpg',
      earthNight: 'img/light.png',
      earthNormal: 'img/normal.jpg',
      earthSpecular: 'img/specular.jpg',
      earthClouds: 'img/cloud.png',
      moon: 'img/moon.jpg',
      sun: 'img/sun.jpeg'
    }
  };

  // ★ 宇航员位置（机器人初始悬停位置）
  const ASTRONAUT_POS = { x: 5.5, y: 2.8, z: 4.5 };

  /* ------------------------------------------------------------
   * ★★★ 机器人姿态修正（XYZ 轴调节）★★★
   * ---------------------------------------------------------- */
  const ROBOT_ROT_FIX = {
    x: Math.PI / 2,   // ★ 俯仰修正
    y: 0,             // ★ 偏航修正
    z: 0              // ★ 横滚修正
  };

  const ROBOT_OFFSET = { x: 0, y: 0, z: 0 };
  const ROBOT_SCALE_FIX = 1.0;

  /* ------------------------------------------------------------
   * ★★★ 机器人淡入进度 ★★★
   * ---------------------------------------------------------- */
  const ROBOT_REVEAL_AT = 50;       // ★ 进度到 50% 时开始显示机器人
  const ROBOT_REVEAL_SPEED = 0.9;   // ★ 淡入速度

  /* ------------------------------------------------------------
   * ★★★ 机器人飞行参数（爆炸后绕地球 + 冲向镜头）★★★
   * ---------------------------------------------------------- */
  const FLIGHT = {
    enabled: true,
    startDelay: 1.5,        // ★ 爆炸后等待多少秒开始起飞
    orbitRadius: 9.0,       // ★ 环绕地球的轨道半径（地球半径 5）
    orbitTilt: 0.42,        // ★ 轨道倾角（弧度）
    orbitTurns: 1.0,        // ★ 绕地球圈数
    orbitDuration: 5.0,     // ★ 绕行总时长（秒）
    orbitCenterY: 0.0,      // ★ 轨道中心高度微调
    dashSpeed: 60.0,        // ★ 冲向镜头的最大速度
    dashDuration: 1.8,      // ★ 冲刺阶段时长（秒）
    dashAccelTime: 0.6,     // ★ 加速度爬升时间（秒）
    finalFadeOut: 0.35      // ★ 飞出后淡出时长（秒）
  };

  const EXPLODE_SHOW_DURATION = 3000;

  /* ------------------------------------------------------------
   * ★★★ 光照参数（可调）★★★
   * ---------------------------------------------------------- */
  const LIGHT_CFG = {
    ambientColor: 0x445577,
    ambientIntensity: 0.22,
    sunColor: 0xfff2e0,
    sunIntensity: 2.4,
    sunDistance: 1800,
    sunPosition: { x: 60, y: 15, z: 30 },
    bounceColor: 0x5577aa,
    bounceIntensity: 0.35,
    hemiSky: 0x88aaff,
    hemiGround: 0x1a2233,
    hemiIntensity: 0.28
  };

  /* ------------------------------------------------------------
   * ★★★ 地球昼夜渲染参数（v7.2 关键修复）★★★
   * ---------------------------------------------------------- */
  const EARTH_CFG = {
    /* ---- 白昼 ---- */
    dayIntensity: 1.15,          // ★ 地球白昼亮度
    dayRimColor: { r: 0.32, g: 0.55, b: 1.0 },   // ★ 白昼边缘大气色
    dayRimStrength: 0.55,        // ★ 白昼边缘大气强度

    /* ---- 夜晚灯光（本次核心修复） ---- */
    nightIntensity: 1.30,        // ★ 地球夜晚灯光（从 2.0 降下来，避免泛粉）
    lightThreshold: 0.10,        // ★ 夜灯亮度门限（低于此值的贴图辉光被压掉）
    lightEdge: 0.25,             // ★ 夜灯门限过渡宽度（越大亮点边缘越柔）
    nightColorTint: { r: 1.0, g: 0.94, b: 0.78 }, // ★ 夜灯颜色（去掉红色偏置）

    /* ---- 夜面底光（越小越黑） ---- */
    nightBaseGlow: 0.005,        // ★ 夜面地表底光（从 0.018 降到几乎纯黑）

    /* ---- 夜面边缘大气 ---- */
    nightRimColor: { r: 0.05, g: 0.10, b: 0.24 }, // ★ 夜面边缘大气色（更暗更蓝）
    nightRimStrength: 0.07,      // ★ 夜面边缘大气强度（从 0.14 减弱）

    /* ---- 昼夜过渡 ---- */
    sunlitStart: -0.12,          // ★ 昼夜过渡起点
    sunlitEnd: 0.18,             // ★ 昼夜过渡终点

    /* ---- 高光 ---- */
    specularOnlyLit: true,       // ★ 高光只在受光面出现
    specLitStart: 0.10,          // ★ 高光出现门限起点（抬到 0.10，夜面完全无高光）
    specLitEnd: 0.40,            // ★ 高光出现门限终点

    /* ---- 法线 ---- */
    bumpStrength: 0.55           // ★ 法线扰动强度
  };

  /*
  ============================================================
  * 2. 全局状态
  * ============================================================
  */

  const state = {
    startTime: Date.now(),
    overlayEl: null,
    canvasEl: null,
    progressBarEl: null,
    percentEl: null,
    statusEl: null,
    three: null,
    fading: false,
    done: false,
    appReady: false,
    displayedProgress: 0
  };

  function setStatus(text) { if (state.statusEl) state.statusEl.textContent = text; }
  function isThreeReady() { return typeof THREE !== 'undefined' && THREE.WebGLRenderer; }
  function nowElapsed() { return Date.now() - state.startTime; }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /*
  ============================================================
  * 3. 创建 loading 覆盖层（科幻 UI）
  * ============================================================
  */

  function createOverlay() {
    if (state.overlayEl) return;

    const overlay = document.createElement('div');
    overlay.id = '__initLoadingOverlay__';
    overlay.style.cssText = [
      'position:fixed', 'top:0', 'left:0',
      'width:100vw', 'height:100vh',
      'height:calc(var(--vh,1vh) * 100)',
      'background:#000308',
      'z-index:99999',
      'overflow:hidden',
      'transition:opacity 0.9s ease',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif',
      'color:#fff',
      'user-select:none',
      '-webkit-tap-highlight-color:transparent',
      'touch-action:none'
    ].join(';');

    const canvas = document.createElement('canvas');
    canvas.id = '__init3DCanvas__';
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;touch-action:none;';
    overlay.appendChild(canvas);

    const styleEl = document.createElement('style');
    styleEl.id = '__initLoadingStyles__';
    styleEl.textContent = [
      '@keyframes __initBarShimmer__{0%{background-position:0% 50%;}100%{background-position:200% 50%;}}',
      '@keyframes __initScan__{0%{transform:translateY(-100%);opacity:0;}50%{opacity:0.7;}100%{transform:translateY(100vh);opacity:0;}}',
      '@keyframes __initPulse__{0%,100%{opacity:0.4;transform:scale(1);}50%{opacity:1;transform:scale(1.05);}}',
      '@keyframes __initRotate__{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}'
    ].join('');
    document.head.appendChild(styleEl);

    const scanline = document.createElement('div');
    scanline.style.cssText = 'position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#4cc9f0,transparent);animation:__initScan__ 5s linear infinite;pointer-events:none;z-index:3;box-shadow:0 0 12px rgba(76,201,240,0.7);';
    overlay.appendChild(scanline);

    const ui = document.createElement('div');
    ui.style.cssText = [
      'position:absolute', 'top:0', 'left:0',
      'width:100%', 'height:100%',
      'display:flex', 'flex-direction:column',
      'align-items:center', 'justify-content:center',
      'pointer-events:none', 'z-index:2',
      'padding:20px', 'box-sizing:border-box'
    ].join(';');

    ui.innerHTML = `
<div style="display:flex;flex-direction:column;align-items:center;gap:16px;position:relative;">
  <div style="position:relative;width:120px;height:120px;display:flex;align-items:center;justify-content:center;margin-bottom:6px;">
    <div style="position:absolute;inset:0;border:1px solid rgba(76,201,240,0.35);border-radius:50%;animation:__initRotate__ 8s linear infinite;">
      <div style="position:absolute;top:-2px;left:50%;transform:translateX(-50%);width:6px;height:6px;background:#4cc9f0;border-radius:50%;box-shadow:0 0 12px #4cc9f0;"></div>
    </div>
    <div style="position:absolute;inset:12px;border:1px dashed rgba(67,97,238,0.5);border-radius:50%;animation:__initRotate__ 12s linear infinite reverse;">
      <div style="position:absolute;bottom:-2px;left:50%;transform:translateX(-50%);width:4px;height:4px;background:#4361ee;border-radius:50%;box-shadow:0 0 10px #4361ee;"></div>
    </div>
    <div style="width:64px;height:64px;border-radius:50%;background:radial-gradient(circle at 50% 50%, rgba(76,201,240,0.9), rgba(67,97,238,0.15) 65%, transparent 70%);animation:__initPulse__ 2s ease-in-out infinite;filter:blur(0.2px);"></div>
    <div style="position:absolute;font-size:0.6rem;letter-spacing:2px;color:#4cc9f0;text-shadow:0 0 8px rgba(76,201,240,0.8);top:calc(100% + 8px);white-space:nowrap;">LOADING</div>
  </div>
  <div style="font-size:1.05rem;letter-spacing:7px;color:#4cc9f0;text-shadow:0 0 14px rgba(76,201,240,0.9),0 0 34px rgba(76,201,240,0.4);font-weight:300;margin-top:14px;">3D未来智慧家</div>
  <div style="font-size:0.62rem;letter-spacing:5px;color:rgba(255,255,255,0.45);margin-bottom:12px;">清河智家V移动版</div>
  <div style="width:280px;max-width:72vw;height:5px;background:rgba(76,201,240,0.14);border-radius:3px;overflow:hidden;position:relative;box-shadow:0 0 22px rgba(76,201,240,0.35),inset 0 0 12px rgba(76,201,240,0.08);border:1px solid rgba(76,201,240,0.2);">
    <div id="__initProgressBar__" style="width:0%;height:100%;background:linear-gradient(90deg,#4361ee,#4cc9f0,#4361ee);background-size:200% 100%;border-radius:3px;transition:width 0.25s ease;box-shadow:0 0 16px rgba(76,201,240,0.95),0 0 34px rgba(76,201,240,0.5);animation:__initBarShimmer__ 1.6s linear infinite;"></div>
  </div>
  <div id="__initPercent__" style="font-size:1.45rem;font-weight:200;letter-spacing:4px;color:#fff;text-shadow:0 0 22px rgba(76,201,240,0.85);font-variant-numeric:tabular-nums;margin-top:2px;">0%</div>
  <div id="__initStatus__" style="font-size:0.62rem;letter-spacing:1.5px;color:rgba(255,255,255,0.55);height:18px;text-align:center;max-width:80vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">初始化系统内核...</div>
</div>
<div style="position:absolute;bottom:22px;left:0;right:0;text-align:center;font-size:0.52rem;letter-spacing:2.5px;color:rgba(255,255,255,0.22);">
  © 3D SMART DESIGNER · LOADING CORE
</div>
`;

    overlay.appendChild(ui);
    document.body.appendChild(overlay);

    state.overlayEl = overlay;
    state.canvasEl = canvas;
    state.progressBarEl = overlay.querySelector('#__initProgressBar__');
    state.percentEl = overlay.querySelector('#__initPercent__');
    state.statusEl = overlay.querySelector('#__initStatus__');
  }

  /*
  ============================================================
  * 4. 程序化后备纹理
  * ============================================================
  */

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function generateProceduralEarthDay(size) {
    size = size || 1024;
    const c = document.createElement('canvas');
    c.width = size; c.height = size / 2;
    const ctx = c.getContext('2d');

    const oceanGrad = ctx.createLinearGradient(0, 0, 0, c.height);
    oceanGrad.addColorStop(0, '#0a2a4a');
    oceanGrad.addColorStop(0.5, '#0f4a7a');
    oceanGrad.addColorStop(1, '#0a2a4a');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, c.width, c.height);

    const drawContinent = (cx, cy, radius, seed) => {
      const rng = mulberry32(seed);
      for (let i = 0; i < 26; i++) {
        const angle = rng() * Math.PI * 2;
        const dist = rng() * radius * 0.9;
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;
        const r = radius * (0.3 + rng() * 0.7);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        const green = 80 + Math.floor(rng() * 60);
        const red = 40 + Math.floor(rng() * 30);
        const blue = 30 + Math.floor(rng() * 30);
        g.addColorStop(0, `rgb(${red},${green},${blue})`);
        g.addColorStop(0.6, `rgb(${red + 15},${green + 25},${blue + 10})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawContinent(c.width * 0.20, c.height * 0.35, c.height * 0.24, 1);
    drawContinent(c.width * 0.28, c.height * 0.70, c.height * 0.14, 2);
    drawContinent(c.width * 0.55, c.height * 0.35, c.height * 0.20, 3);
    drawContinent(c.width * 0.62, c.height * 0.65, c.height * 0.15, 4);
    drawContinent(c.width * 0.82, c.height * 0.75, c.height * 0.11, 5);
    drawContinent(c.width * 0.95, c.height * 0.22, c.height * 0.10, 6);

    const nGrad = ctx.createLinearGradient(0, 0, 0, c.height * 0.09);
    nGrad.addColorStop(0, 'rgba(255,255,255,1)');
    nGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = nGrad;
    ctx.fillRect(0, 0, c.width, c.height * 0.09);

    const sGrad = ctx.createLinearGradient(0, c.height, 0, c.height * 0.91);
    sGrad.addColorStop(0, 'rgba(255,255,255,1)');
    sGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sGrad;
    ctx.fillRect(0, c.height * 0.91, c.width, c.height * 0.09);

    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  function generateProceduralEarthNight(size) {
    size = size || 1024;
    const c = document.createElement('canvas');
    c.width = size; c.height = size / 2;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, c.width, c.height);

    const drawCities = (cx, cy, radius, seed) => {
      const rng = mulberry32(seed);
      for (let i = 0; i < 200; i++) {
        const angle = rng() * Math.PI * 2;
        const dist = rng() * radius * 0.9;
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;
        const r = 0.6 + rng() * 2.2;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
        g.addColorStop(0, `rgba(255,220,150,${0.5 + rng() * 0.5})`);
        g.addColorStop(1, 'rgba(255,180,80,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawCities(c.width * 0.20, c.height * 0.35, c.height * 0.24, 1);
    drawCities(c.width * 0.28, c.height * 0.70, c.height * 0.14, 2);
    drawCities(c.width * 0.55, c.height * 0.35, c.height * 0.20, 3);
    drawCities(c.width * 0.62, c.height * 0.65, c.height * 0.15, 4);
    drawCities(c.width * 0.82, c.height * 0.75, c.height * 0.11, 5);
    drawCities(c.width * 0.95, c.height * 0.22, c.height * 0.10, 6);

    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  function generateProceduralNormal(size) {
    size = size || 1024;
    const c = document.createElement('canvas');
    c.width = size; c.height = size / 2;
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgb(128,128,255)';
    ctx.fillRect(0, 0, c.width, c.height);

    const rng = mulberry32(9527);
    for (let i = 0; i < 800; i++) {
      const x = rng() * c.width;
      const y = rng() * c.height;
      const r = 4 + rng() * 22;
      const nx = 128 + (rng() - 0.5) * 40;
      const ny = 128 + (rng() - 0.5) * 40;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${nx | 0},${ny | 0},255,0.45)`);
      g.addColorStop(1, 'rgba(128,128,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  function generateProceduralSpecular(size) {
    size = size || 1024;
    const c = document.createElement('canvas');
    c.width = size; c.height = size / 2;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#b8d8ff';
    ctx.fillRect(0, 0, c.width, c.height);

    const drawLand = (cx, cy, radius, seed) => {
      const rng = mulberry32(seed);
      for (let i = 0; i < 26; i++) {
        const angle = rng() * Math.PI * 2;
        const dist = rng() * radius * 0.9;
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;
        const r = radius * (0.3 + rng() * 0.7);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(30,30,30,0.95)');
        g.addColorStop(0.7, 'rgba(40,40,40,0.7)');
        g.addColorStop(1, 'rgba(40,40,40,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawLand(c.width * 0.20, c.height * 0.35, c.height * 0.24, 1);
    drawLand(c.width * 0.28, c.height * 0.70, c.height * 0.14, 2);
    drawLand(c.width * 0.55, c.height * 0.35, c.height * 0.20, 3);
    drawLand(c.width * 0.62, c.height * 0.65, c.height * 0.15, 4);
    drawLand(c.width * 0.82, c.height * 0.75, c.height * 0.11, 5);
    drawLand(c.width * 0.95, c.height * 0.22, c.height * 0.10, 6);

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  function generateProceduralClouds(size) {
    size = size || 1024;
    const c = document.createElement('canvas');
    c.width = size; c.height = size / 2;
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, c.width, c.height);

    const rng = mulberry32(31415);
    for (let i = 0; i < 800; i++) {
      const x = rng() * c.width;
      const y = rng() * c.height;
      const r = 8 + rng() * 40;
      const a = 0.15 + rng() * 0.35;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(255,255,255,${a})`);
      g.addColorStop(0.5, `rgba(255,255,255,${a * 0.5})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  function generateProceduralMoon(size) {
    size = size || 512;
    const c = document.createElement('canvas');
    c.width = size; c.height = size / 2;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#8a8a8a';
    ctx.fillRect(0, 0, c.width, c.height);

    const rng = mulberry32(7777);
    for (let i = 0; i < 30; i++) {
      const x = rng() * c.width;
      const y = rng() * c.height;
      const r = 15 + rng() * 40;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(70,70,75,0.8)');
      g.addColorStop(1, 'rgba(70,70,75,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 400; i++) {
      const x = rng() * c.width;
      const y = rng() * c.height;
      const r = 1 + rng() * 8;
      const bright = rng() > 0.5;
      const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
      g.addColorStop(0, bright ? 'rgba(220,220,225,0.9)' : 'rgba(80,80,85,0.8)');
      g.addColorStop(0.7, 'rgba(120,120,125,0.4)');
      g.addColorStop(1, 'rgba(120,120,125,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  function generateProceduralSun(size) {
    size = size || 512;
    const c = document.createElement('canvas');
    c.width = size; c.height = size / 2;
    const ctx = c.getContext('2d');

    const g = ctx.createRadialGradient(size / 2, size / 4, 0, size / 2, size / 4, size / 2);
    g.addColorStop(0, '#fff5c4');
    g.addColorStop(0.4, '#ffcc66');
    g.addColorStop(0.7, '#ff9933');
    g.addColorStop(1, '#cc5500');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);

    const rng = mulberry32(2024);
    for (let i = 0; i < 2000; i++) {
      const x = rng() * c.width;
      const y = rng() * c.height;
      const r = 1 + rng() * 4;
      const bright = rng() > 0.5;
      ctx.fillStyle = bright ? `rgba(255,240,180,${rng() * 0.5})` : `rgba(200,80,0,${rng() * 0.4})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  /*
  ============================================================
  * 5. 星点柔光精灵纹理
  * ============================================================
  */

  function generateStarSpriteTexture(size) {
    size = size || 64;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    const half = size / 2;
    const g = ctx.createRadialGradient(half, half, 0, half, half, half);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.15, 'rgba(255,255,255,0.85)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.35)');
    g.addColorStop(0.7, 'rgba(255,255,255,0.08)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function generateSunGlowTexture(size) {
    size = size || 256;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.1, 'rgba(255,255,200,0.85)');
    g.addColorStop(0.3, 'rgba(255,200,100,0.55)');
    g.addColorStop(0.6, 'rgba(255,150,50,0.25)');
    g.addColorStop(1, 'rgba(255,100,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  /*
  ============================================================
  * 6. 纹理加载工具
  * ============================================================
  */

  function loadTextureSafe(loader, url, fallbackFn, asData) {
    return new Promise(resolve => {
      let settled = false;
      const done = tex => { if (settled) return; settled = true; resolve(tex); };
      const timer = setTimeout(() => {
        if (!settled) { settled = true; resolve(fallbackFn ? fallbackFn() : null); }
      }, 8000);
      try {
        loader.load(url,
          tex => {
            clearTimeout(timer);
            if (asData !== false) tex.encoding = THREE.sRGBEncoding;
            done(tex);
          },
          undefined,
          () => { clearTimeout(timer); done(fallbackFn ? fallbackFn() : null); }
        );
      } catch (e) {
        clearTimeout(timer);
        done(fallbackFn ? fallbackFn() : null);
      }
    });
  }

  /*
  ============================================================
  * 7. 着色器代码
  * ============================================================
  */

  /* ---------- 地球顶点着色器 ---------- */
  const EARTH_VERT = `
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

  /* ----------------------------------------------------------
   * 地球片元着色器（★ v7.2 修复泛红/泛粉核心）
   * ----------------------------------------------------------
   * 修复要点：
   *  1. 夜灯贴图先用 luminance 门限过滤掉背景辉光，
   *     只保留真正亮的城市点 → 暗部回归纯黑
   *  2. 夜灯颜色去掉红色偏置 (1.06→1.0, 0.86→0.78)
   *  3. nightIntensity 从 2.0 降到 1.30
   *  4. 夜面底光 0.018 → 0.005（接近纯黑，只留极淡轮廓）
   *  5. 高光门限抬到 NdotL = 0.10，夜面完全无高光泄漏
   *  6. nightRimColor 更暗更蓝，强度减半
   * -------------------------------------------------------- */
  const EARTH_FRAG = `
uniform sampler2D dayTexture;
uniform sampler2D nightTexture;
uniform sampler2D normalMap;
uniform sampler2D specularMap;

uniform vec3 sunDirection;
uniform vec3 sunColor;

uniform float roughness;
uniform float bumpStrength;
uniform float oceanSpecular;
uniform float landSpecular;

uniform float dayIntensity;
uniform float nightIntensity;
uniform float lightThreshold;   // ★ 夜灯亮度门限
uniform float lightEdge;        // ★ 门限过渡宽度
uniform vec3  nightTint;        // ★ 夜灯颜色
uniform float nightBaseGlow;
uniform vec3  nightRimColor;
uniform float nightRimStrength;
uniform vec3  dayRimColor;
uniform float dayRimStrength;
uniform float sunlitStart;
uniform float sunlitEnd;
uniform float specularOnlyLit;
uniform float specLitStart;
uniform float specLitEnd;

varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vWorldPosition;

void main() {
  /* ---------- 基础向量 ---------- */
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vWorldPosition);
  vec3 L = normalize(sunDirection - vWorldPosition);

  /* ---------- 法线扰动 ---------- */
  vec3 nTex = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
  vec3 up = vec3(0.0, 1.0, 0.0);
  vec3 T = normalize(cross(up, N) + vec3(1e-5, 0.0, 0.0));
  vec3 B = normalize(cross(N, T));
  vec3 Np = normalize(N + (T * nTex.x + B * nTex.y) * bumpStrength);

  /* ---------- 太阳光照 ---------- */
  float NdotL = dot(Np, L);
  float diffuse = max(NdotL, 0.0);

  /* ---------- 高光（夜面彻底归零） ---------- */
  vec3 H = normalize(L + V);
  float NdotH = max(dot(Np, H), 0.0);
  float shininess = mix(12.0, 160.0, 1.0 - roughness);
  float spec = pow(NdotH, shininess);
  float specMask = texture2D(specularMap, vUv).r;
  float specIntensity = mix(landSpecular, oceanSpecular, specMask);

  /* ★ 关键：高光门限抬到 specLitStart(0.10)，
     在夜面 NdotL ≈ 0 时彻底关闭，避免暖色高光泄漏 */
  float specLit = mix(1.0, smoothstep(specLitStart, specLitEnd, NdotL), specularOnlyLit);
  vec3 specularColor = sunColor * spec * specIntensity * 0.55 * specLit;

  /* ---------- 采样贴图 ---------- */
  vec3 dayColor   = texture2D(dayTexture,   vUv).rgb;
  vec3 nightRaw   = texture2D(nightTexture, vUv).rgb;

  /* ==========================================================
   * ★ 白昼面
   * ========================================================== */
  vec3 dayLit = dayColor * (diffuse * dayIntensity + 0.05);

  /* ==========================================================
   * ★ 夜面：城市灯火（v7.2 核心修复）
   *   - luminance 门限：低于 lightThreshold 的贴图辉光被压掉
   *   - 平方增强：让亮点更"点"，背景更黑
   *   - 颜色去掉红色偏置
   * ========================================================== */
  float nightLum = dot(nightRaw, vec3(0.299, 0.587, 0.114));
  float lightMask = smoothstep(lightThreshold, lightThreshold + lightEdge, nightLum);
  // 用两次乘法让亮点更集中（smoothstep 已保证平滑边缘）
  vec3 cityLights = nightRaw * lightMask * lightMask * nightTint * nightIntensity;

  /* 夜面地表底光（几乎纯黑，只保留极淡的陆海轮廓） */
  vec3 nightBase = dayColor * nightBaseGlow;

  vec3 nightLit = nightBase + cityLights;

  /* ==========================================================
   * ★ 昼夜混合
   * ========================================================== */
  float dayNight = smoothstep(sunlitStart, sunlitEnd, NdotL);
  vec3 baseColor = mix(nightLit, dayLit, dayNight);

  /* ==========================================================
   * ★ 边缘大气光
   * ========================================================== */
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);

  float litSide   = smoothstep(-0.25, 0.55, NdotL);
  float shadowSide = 1.0 - litSide;

  vec3 rimDay   = dayRimColor   * fres * dayRimStrength   * litSide;
  vec3 rimNight = nightRimColor * fres * nightRimStrength * shadowSide;

  /* ==========================================================
   * ★ 最终颜色
   * ========================================================== */
  vec3 finalColor = baseColor + specularColor + rimDay + rimNight;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

  /* ---------- 大气层 ---------- */
  const ATMO_VERT = `
varying vec3 vNormal;
varying vec3 vWorldPosition;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPosition = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

  const ATMO_FRAG = `
uniform vec3 glowColor;
uniform float intensity;
varying vec3 vNormal;
varying vec3 vWorldPosition;
void main() {
  vec3 V = normalize(cameraPosition - vWorldPosition);
  float rim = 1.0 - abs(dot(normalize(vNormal), V));
  float glow = pow(rim, 3.0) * intensity;
  gl_FragColor = vec4(glowColor, 1.0) * glow;
}
`;

  /* ---------- 星空 ---------- */
  const STAR_VERT = `
attribute float size;
attribute float phase;
attribute float brightness;
uniform float time;
uniform float twinkle;
varying float vAlpha;
void main() {
  vAlpha = brightness * (1.0 - twinkle * 0.5 + twinkle * 0.5 * sin(time * 2.0 + phase));
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

  const STAR_FRAG = `
uniform sampler2D pointTexture;
varying float vAlpha;
void main() {
  vec2 uv = gl_PointCoord.xy;
  vec4 texColor = texture2D(pointTexture, uv);
  gl_FragColor = vec4(texColor.rgb, texColor.a * vAlpha);
}
`;

  /*
  ============================================================
  * 8. 构建 Three.js 场景（核心）
  * ============================================================
  */

  async function buildThreeScene(canvas) {

    /* ----------------------------------------------------------
     * ★★★ 渲染器 ★★★
     * v7.2：toneMappingExposure 1.0 → 0.92
     *       避免暖色城市灯光进入 ACES 高光粉红区
     * -------------------------------------------------------- */
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      logarithmicDepthBuffer: false
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight, false);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;   // ★ 从 1.0 降到 0.92（修复泛粉）

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000005);

    const camera = new THREE.PerspectiveCamera(
      45,
      (canvas.clientWidth || window.innerWidth) / (canvas.clientHeight || window.innerHeight),
      0.5,
      6000
    );
    camera.position.set(0, 8, 32);
    camera.lookAt(0, 0, 0);

    /* ----------------------------------------------------------
     * 光照体系
     * -------------------------------------------------------- */
    const ambientLight = new THREE.AmbientLight(LIGHT_CFG.ambientColor, LIGHT_CFG.ambientIntensity);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(LIGHT_CFG.hemiSky, LIGHT_CFG.hemiGround, LIGHT_CFG.hemiIntensity);
    scene.add(hemiLight);

    const sunLight = new THREE.PointLight(LIGHT_CFG.sunColor, LIGHT_CFG.sunIntensity, LIGHT_CFG.sunDistance);
    sunLight.position.set(LIGHT_CFG.sunPosition.x, LIGHT_CFG.sunPosition.y, LIGHT_CFG.sunPosition.z);
    sunLight.castShadow = false;
    scene.add(sunLight);

    const bounceLight = new THREE.DirectionalLight(LIGHT_CFG.bounceColor, LIGHT_CFG.bounceIntensity);
    bounceLight.position.set(-40, -10, -30);
    scene.add(bounceLight);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    /*
    ============================================================
     * ★★★ 太阳 ★★★
     * ============================================================
     */
    setStatus('正在创建太阳...');
    const sunTex = await loadTextureSafe(loader, CONFIG.textures.sun, () => generateProceduralSun(512));
    const sunMat = new THREE.MeshBasicMaterial({ map: sunTex, color: 0xffffff });
    const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(2.5, 48, 32), sunMat);
    sunMesh.position.copy(sunLight.position);
    scene.add(sunMesh);

    const sunGlowMat = new THREE.SpriteMaterial({
      map: generateSunGlowTexture(256),
      color: 0xffaa55, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const sunGlow = new THREE.Sprite(sunGlowMat);
    sunGlow.scale.set(20, 20, 1);
    sunGlow.position.copy(sunLight.position);
    scene.add(sunGlow);

    /*
    ============================================================
     * ★★★ 地球系统 ★★★
     * ============================================================
     */
    setStatus('正在加载地球纹理...');
    const earthTextures = await Promise.all([
      loadTextureSafe(loader, CONFIG.textures.earthDay, () => generateProceduralEarthDay(1024)),
      loadTextureSafe(loader, CONFIG.textures.earthNight, () => generateProceduralEarthNight(1024)),
      loadTextureSafe(loader, CONFIG.textures.earthNormal, () => generateProceduralNormal(1024), false),
      loadTextureSafe(loader, CONFIG.textures.earthSpecular, () => generateProceduralSpecular(1024), false),
      loadTextureSafe(loader, CONFIG.textures.earthClouds, () => generateProceduralClouds(1024))
    ]);
    const earthDay = earthTextures[0];
    const earthNight = earthTextures[1];
    const earthNormal = earthTextures[2];
    const earthSpec = earthTextures[3];
    const earthClouds = earthTextures[4];

    const earthSystem = new THREE.Group();
    earthSystem.rotation.z = 23.5 * Math.PI / 180;
    scene.add(earthSystem);

    const EARTH_RADIUS = 5;

    const earthGeo = new THREE.SphereGeometry(EARTH_RADIUS, 128, 96);
    const earthMat = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture:      { value: earthDay },
        nightTexture:    { value: earthNight },
        normalMap:       { value: earthNormal },
        specularMap:     { value: earthSpec },
        sunDirection:    { value: sunLight.position.clone() },
        sunColor:        { value: new THREE.Color(LIGHT_CFG.sunColor) },
        roughness:       { value: 0.75 },
        bumpStrength:    { value: EARTH_CFG.bumpStrength },
        oceanSpecular:   { value: 1.6 },
        landSpecular:    { value: 0.05 },

        /* ★ 昼夜渲染参数 */
        dayIntensity:    { value: EARTH_CFG.dayIntensity },
        nightIntensity:  { value: EARTH_CFG.nightIntensity },
        lightThreshold:  { value: EARTH_CFG.lightThreshold },
        lightEdge:       { value: EARTH_CFG.lightEdge },
        nightTint:       { value: new THREE.Color(EARTH_CFG.nightColorTint.r, EARTH_CFG.nightColorTint.g, EARTH_CFG.nightColorTint.b) },
        nightBaseGlow:   { value: EARTH_CFG.nightBaseGlow },
        nightRimColor:   { value: new THREE.Color(EARTH_CFG.nightRimColor.r, EARTH_CFG.nightRimColor.g, EARTH_CFG.nightRimColor.b) },
        nightRimStrength:{ value: EARTH_CFG.nightRimStrength },
        dayRimColor:     { value: new THREE.Color(EARTH_CFG.dayRimColor.r, EARTH_CFG.dayRimColor.g, EARTH_CFG.dayRimColor.b) },
        dayRimStrength:  { value: EARTH_CFG.dayRimStrength },
        sunlitStart:     { value: EARTH_CFG.sunlitStart },
        sunlitEnd:       { value: EARTH_CFG.sunlitEnd },
        specularOnlyLit: { value: EARTH_CFG.specularOnlyLit ? 1.0 : 0.0 },
        specLitStart:    { value: EARTH_CFG.specLitStart },
        specLitEnd:      { value: EARTH_CFG.specLitEnd }
      },
      vertexShader: EARTH_VERT,
      fragmentShader: EARTH_FRAG,
      transparent: false,
      depthWrite: true,
      depthTest: true,
      side: THREE.FrontSide,
      fog: false
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthSystem.add(earthMesh);

    /* 云层：FrontSide + depthWrite:false
       ★ v7.2 附加优化：颜色略偏冷，避免在暖色灯光下也泛红 */
    const cloudGeo = new THREE.SphereGeometry(EARTH_RADIUS * 1.008, 96, 64);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: earthClouds,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      side: THREE.FrontSide,
      metalness: 0,
      roughness: 1,
      color: 0xeef4ff     // ★ 略偏冷白，避免被暖光照成粉
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    earthSystem.add(cloudMesh);

    /* 大气层 */
    const atmoGeo = new THREE.SphereGeometry(EARTH_RADIUS * 1.14, 96, 64);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x4facfe) },
        intensity: { value: 0.9 }
      },
      vertexShader: ATMO_VERT,
      fragmentShader: ATMO_FRAG,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    const atmosphereMesh = new THREE.Mesh(atmoGeo, atmoMat);
    earthSystem.add(atmosphereMesh);

    /*
    ============================================================
     * ★★★ 月球 ★★★
     * ============================================================
     */
    setStatus('正在加载月球...');
    const moonTex = await loadTextureSafe(loader, CONFIG.textures.moon, () => generateProceduralMoon(512));
    const moonGeo = new THREE.SphereGeometry(1.35, 64, 48);
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonTex, roughness: 0.92, metalness: 0.0,
      bumpMap: moonTex, bumpScale: 0.02
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.position.set(14, 0, 0);
    const moonPivot = new THREE.Object3D();
    moonPivot.rotation.z = 5 * Math.PI / 180;
    moonPivot.rotation.x = 5 * Math.PI / 180;
    moonPivot.add(moonMesh);
    scene.add(moonPivot);

    /*
    ============================================================
     * ★★★ 星空系统 ★★★
     * ============================================================
     */
    setStatus('正在生成星空...');
    const starSprite = generateStarSpriteTexture(64);

    (function makeUniverseBackground() {
      const geo = new THREE.SphereGeometry(2000, 64, 32);
      const c = document.createElement('canvas');
      c.width = 2048; c.height = 1024;
      const ctx = c.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, c.height);
      gradient.addColorStop(0, '#000015');
      gradient.addColorStop(0.35, '#000008');
      gradient.addColorStop(0.65, '#000008');
      gradient.addColorStop(1, '#000025');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, c.width, c.height);

      for (let i = 0; i < 60; i++) {
        const x = Math.random() * c.width;
        const y = Math.random() * c.height;
        const radius = 60 + Math.random() * 200;
        const alpha = 0.02 + Math.random() * 0.06;
        const hue = Math.random() * 360;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grd.addColorStop(0, `hsla(${hue}, 85%, 68%, ${alpha})`);
        grd.addColorStop(1, 'rgba(0, 0, 20, 0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      const tex = new THREE.CanvasTexture(c);
      const mat = new THREE.MeshBasicMaterial({
        map: tex, side: THREE.BackSide,
        transparent: true, opacity: 0.5, depthWrite: false
      });
      const bg = new THREE.Mesh(geo, mat);
      bg.name = 'universeBg';
      scene.add(bg);
    })();

    function makeStarField(opts) {
      const count = opts.count;
      const minR = opts.minR, maxR = opts.maxR;
      const sizeScale = opts.sizeScale;
      const brightnessScale = opts.brightnessScale || 1.0;
      const colorWeights = opts.colorWeights || [0.6, 0.25, 0.1, 0.05];

      const geo = new THREE.BufferGeometry();
      const posArr = new Float32Array(count * 3);
      const colArr = new Float32Array(count * 3);
      const sizeArr = new Float32Array(count);
      const phaseArr = new Float32Array(count);
      const brightArr = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        const r = minR + Math.random() * (maxR - minR);
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        posArr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        posArr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        posArr[i * 3 + 2] = r * Math.cos(phi);

        const t = Math.random();
        let r0, g0, b0;
        const cw = colorWeights;
        if (t < cw[0]) {
          r0 = 0.7 + Math.random() * 0.2;
          g0 = 0.85 + Math.random() * 0.15;
          b0 = 1.0;
        } else if (t < cw[0] + cw[1]) {
          r0 = 1.0; g0 = 1.0; b0 = 1.0;
        } else if (t < cw[0] + cw[1] + cw[2]) {
          r0 = 1.0;
          g0 = 0.82 + Math.random() * 0.1;
          b0 = 0.6;
        } else {
          r0 = 1.0;
          g0 = 0.65;
          b0 = 0.5;
        }
        colArr[i * 3] = r0;
        colArr[i * 3 + 1] = g0;
        colArr[i * 3 + 2] = b0;

        sizeArr[i] = (Math.random() * 1.8 + 0.5) * sizeScale;
        phaseArr[i] = Math.random() * Math.PI * 2;
        brightArr[i] = (0.5 + Math.random() * 0.5) * brightnessScale;
      }

      geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colArr, 3));
      geo.setAttribute('size', new THREE.BufferAttribute(sizeArr, 1));
      geo.setAttribute('phase', new THREE.BufferAttribute(phaseArr, 1));
      geo.setAttribute('brightness', new THREE.BufferAttribute(brightArr, 1));

      const mat = new THREE.ShaderMaterial({
        uniforms: {
          pointTexture: { value: starSprite },
          time: { value: 0 },
          twinkle: { value: opts.twinkle || 0.6 }
        },
        vertexShader: STAR_VERT,
        fragmentShader: STAR_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
      });

      const points = new THREE.Points(geo, mat);
      points.userData.isStarLayer = true;
      points.userData.rotSpeed = opts.rotSpeed || 0.003;
      scene.add(points);
      return points;
    }

    const starFar = makeStarField({
      count: 28000, minR: 900, maxR: 1400,
      sizeScale: 0.7, brightnessScale: 0.85, twinkle: 0.5,
      rotSpeed: 0.0012,
      colorWeights: [0.6, 0.25, 0.1, 0.05]
    });

    const starMid = makeStarField({
      count: 18000, minR: 600, maxR: 900,
      sizeScale: 1.1, brightnessScale: 1.0, twinkle: 0.7,
      rotSpeed: 0.0025,
      colorWeights: [0.55, 0.25, 0.12, 0.08]
    });

    const starNear = makeStarField({
      count: 8000, minR: 350, maxR: 600,
      sizeScale: 1.9, brightnessScale: 1.15, twinkle: 0.9,
      rotSpeed: 0.0042,
      colorWeights: [0.5, 0.25, 0.15, 0.1]
    });

    const starDust = makeStarField({
      count: 4000, minR: 180, maxR: 350,
      sizeScale: 0.6, brightnessScale: 1.3, twinkle: 1.2,
      rotSpeed: 0.0075,
      colorWeights: [0.45, 0.3, 0.15, 0.1]
    });

    let galaxyBand = null;
    (function makeGalaxyBand() {
      const count = 4500;
      const geo = new THREE.BufferGeometry();
      const posArr = new Float32Array(count * 3);
      const colArr = new Float32Array(count * 3);
      const sizeArr = new Float32Array(count);
      const phaseArr = new Float32Array(count);
      const brightArr = new Float32Array(count);

      const tilt = 0.62;
      const cy = Math.cos(tilt), sy = Math.sin(tilt);

      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 700 + Math.random() * 500;
        const spread = (Math.random() - 0.5) * 100 * (0.4 + Math.random() * 0.7);
        const x = Math.cos(a) * r;
        const z = Math.sin(a) * r;
        const yRaw = spread;
        const y = yRaw * cy - z * sy;
        const zN = yRaw * sy + z * cy;
        posArr[i * 3] = x;
        posArr[i * 3 + 1] = y;
        posArr[i * 3 + 2] = zN;

        const t = Math.random();
        let r0, g0, b0;
        if (t < 0.4) { r0 = 0.75; g0 = 0.78; b0 = 0.98; }
        else if (t < 0.7) { r0 = 0.98; g0 = 0.82; b0 = 0.92; }
        else if (t < 0.9) { r0 = 0.85; g0 = 0.95; b0 = 1.0; }
        else { r0 = 1.0; g0 = 0.9; b0 = 0.7; }
        colArr[i * 3] = r0;
        colArr[i * 3 + 1] = g0;
        colArr[i * 3 + 2] = b0;

        sizeArr[i] = Math.random() * 1.5 + 0.4;
        phaseArr[i] = Math.random() * Math.PI * 2;
        brightArr[i] = 0.4 + Math.random() * 0.5;
      }

      geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colArr, 3));
      geo.setAttribute('size', new THREE.BufferAttribute(sizeArr, 1));
      geo.setAttribute('phase', new THREE.BufferAttribute(phaseArr, 1));
      geo.setAttribute('brightness', new THREE.BufferAttribute(brightArr, 1));

      const mat = new THREE.ShaderMaterial({
        uniforms: {
          pointTexture: { value: starSprite },
          time: { value: 0 },
          twinkle: { value: 0.35 }
        },
        vertexShader: STAR_VERT,
        fragmentShader: STAR_FRAG,
        transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending, vertexColors: true
      });

      galaxyBand = new THREE.Points(geo, mat);
      galaxyBand.userData.isStarLayer = true;
      galaxyBand.userData.rotSpeed = 0.0018;
      galaxyBand.name = 'galaxyBand';
      scene.add(galaxyBand);
    })();

    let galaxyRing = null;
    (function makeGalaxyRing() {
      const count = 3000;
      const geo = new THREE.BufferGeometry();
      const posArr = new Float32Array(count * 3);
      const colArr = new Float32Array(count * 3);
      const sizeArr = new Float32Array(count);
      const phaseArr = new Float32Array(count);
      const brightArr = new Float32Array(count);

      const center = new THREE.Vector3(-600, 200, -500);
      const axis = new THREE.Vector3(0.3, 1, 0.2).normalize();

      for (let i = 0; i < count; i++) {
        const arm = Math.floor(Math.random() * 2);
        const t = Math.random();
        const r = 30 + t * 120;
        const angle = (arm * Math.PI) + t * Math.PI * 3 + (Math.random() - 0.5) * 0.7;
        const spread = (Math.random() - 0.5) * 25;

        const lx = Math.cos(angle) * r;
        const lz = Math.sin(angle) * r;
        const ly = spread;

        const px = center.x + lx + axis.x * ly;
        const py = center.y + axis.y * ly + ly * 0.5;
        const pz = center.z + lz + axis.z * ly;

        posArr[i * 3] = px;
        posArr[i * 3 + 1] = py;
        posArr[i * 3 + 2] = pz;

        const ct = Math.random();
        let r0, g0, b0;
        if (ct < 0.5) { r0 = 1.0; g0 = 0.95; b0 = 0.75; }
        else if (ct < 0.8) { r0 = 0.8; g0 = 0.85; b0 = 1.0; }
        else { r0 = 1.0; g0 = 0.85; b0 = 0.9; }
        colArr[i * 3] = r0;
        colArr[i * 3 + 1] = g0;
        colArr[i * 3 + 2] = b0;

        sizeArr[i] = Math.random() * 1.2 + 0.4;
        phaseArr[i] = Math.random() * Math.PI * 2;
        brightArr[i] = 0.5 + Math.random() * 0.4;
      }

      geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colArr, 3));
      geo.setAttribute('size', new THREE.BufferAttribute(sizeArr, 1));
      geo.setAttribute('phase', new THREE.BufferAttribute(phaseArr, 1));
      geo.setAttribute('brightness', new THREE.BufferAttribute(brightArr, 1));

      const mat = new THREE.ShaderMaterial({
        uniforms: {
          pointTexture: { value: starSprite },
          time: { value: 0 },
          twinkle: { value: 0.25 }
        },
        vertexShader: STAR_VERT,
        fragmentShader: STAR_FRAG,
        transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending, vertexColors: true
      });

      galaxyRing = new THREE.Points(geo, mat);
      galaxyRing.userData.isStarLayer = true;
      galaxyRing.userData.rotSpeed = 0.0006;
      galaxyRing.name = 'galaxyRing';
      scene.add(galaxyRing);
    })();

    (function makeAuroraArcs() {
      const arcColors = [
        { c: 0x4cc9f0, a: 0.10 },
        { c: 0x9b5cf6, a: 0.08 },
        { c: 0x6effc7, a: 0.06 }
      ];
      const arcGroup = new THREE.Group();
      arcColors.forEach((cfg, idx) => {
        const count = 800;
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(count * 3);
        const colArr = new Float32Array(count * 3);
        const c = new THREE.Color(cfg.c);
        const baseR = 900 + idx * 60;
        const tilt = 0.3 + idx * 0.1;

        for (let i = 0; i < count; i++) {
          const t = Math.random();
          const angle = t * Math.PI * 2;
          const r = baseR + (Math.random() - 0.5) * 50;
          const y = Math.sin(t * Math.PI * 3) * 150 * (0.5 + Math.random() * 0.5);
          posArr[i * 3] = Math.cos(angle) * r;
          posArr[i * 3 + 1] = y + 500;
          posArr[i * 3 + 2] = Math.sin(angle) * r * Math.cos(tilt);
          const k = 0.6 + Math.random() * 0.4;
          colArr[i * 3] = c.r * k;
          colArr[i * 3 + 1] = c.g * k;
          colArr[i * 3 + 2] = c.b * k;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colArr, 3));

        const mat = new THREE.PointsMaterial({
          size: 12.0,
          vertexColors: true,
          transparent: true,
          opacity: cfg.a,
          sizeAttenuation: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          map: starSprite,
          alphaTest: 0.001
        });

        const arc = new THREE.Points(geo, mat);
        arcGroup.add(arc);
      });
      arcGroup.userData.rotSpeed = 0.0004;
      scene.add(arcGroup);
      scene.userData = scene.userData || {};
      scene.userData.auroraArcs = arcGroup;
    })();

    const nebulas = [];
    (function makeNebulas() {
      const nebulaColors = [
        0x4361ee, 0x4cc9f0, 0x9b5cf6, 0xff6ec7,
        0x6effc7, 0xffcf6e, 0xff9a6e, 0xb06eff,
        0x6e9aff, 0x6effb6, 0xff6e9a, 0xffe06e
      ];
      for (let n = 0; n < 12; n++) {
        const g = new THREE.BufferGeometry();
        const cnt = 700;
        const p = new Float32Array(cnt * 3);
        const c = new Float32Array(cnt * 3);

        const cx = (Math.random() - 0.5) * 1800;
        const cy = (Math.random() - 0.5) * 1000;
        const cz = (Math.random() - 0.5) * 1800;
        const color = new THREE.Color(nebulaColors[n % nebulaColors.length]);
        const sizeR = 60 + Math.random() * 100;

        for (let i = 0; i < cnt; i++) {
          const r = Math.pow(Math.random(), 0.55) * sizeR;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          p[i * 3] = cx + r * Math.sin(phi) * Math.cos(theta);
          p[i * 3 + 1] = cy + r * Math.cos(phi) * 0.7;
          p[i * 3 + 2] = cz + r * Math.sin(phi) * Math.sin(theta);

          const k = 0.4 + Math.random() * 0.6;
          c[i * 3] = color.r * k;
          c[i * 3 + 1] = color.g * k;
          c[i * 3 + 2] = color.b * k;
        }

        g.setAttribute('position', new THREE.BufferAttribute(p, 3));
        g.setAttribute('color', new THREE.BufferAttribute(c, 3));

        const m = new THREE.PointsMaterial({
          size: 8.0,
          vertexColors: true,
          transparent: true,
          opacity: 0.24,
          sizeAttenuation: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          map: starSprite,
          alphaTest: 0.001
        });

        const neb = new THREE.Points(g, m);
        neb.userData.rotSpeed = 0.0005 + Math.random() * 0.0015;
        scene.add(neb);
        nebulas.push(neb);
      }
    })();

    const meteors = [];
    function spawnMeteor() {
      const geo = new THREE.BufferGeometry();
      const startR = 400 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1) * 0.6 + 0.2;
      const start = new THREE.Vector3(
        startR * Math.sin(phi) * Math.cos(theta),
        startR * Math.cos(phi),
        startR * Math.sin(phi) * Math.sin(theta)
      );

      const dir = new THREE.Vector3(
        -start.x + (Math.random() - 0.5) * 300,
        -start.y + (Math.random() - 0.5) * 150,
        -start.z + (Math.random() - 0.5) * 300
      ).normalize();

      const positions = new Float32Array(3 * 3);
      positions[0] = start.x;
      positions[1] = start.y;
      positions[2] = start.z;
      positions[3] = start.x - dir.x * 10;
      positions[4] = start.y - dir.y * 10;
      positions[5] = start.z - dir.z * 10;
      positions[6] = start.x - dir.x * 20;
      positions[7] = start.y - dir.y * 20;
      positions[8] = start.z - dir.z * 20;

      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const hue = Math.random() * 0.15 + 0.5;
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL(hue, 0.6, 0.85),
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const line = new THREE.Line(geo, mat);
      line.userData = {
        dir: dir,
        start: start.clone(),
        speed: 300 + Math.random() * 250,
        age: 0,
        life: 1.4 + Math.random() * 1.0
      };
      scene.add(line);
      meteors.push(line);
    }

    let meteorTimer = 1.5 + Math.random() * 2;
    function updateMeteors(delta) {
      meteorTimer -= delta;
      if (meteorTimer <= 0) {
        if (meteors.length < 8) spawnMeteor();
        meteorTimer = 1.5 + Math.random() * 3.5;
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        const u = m.userData;
        u.age += delta;
        const fade = Math.max(0, 1 - u.age / u.life);
        m.material.opacity = fade;

        const positions = m.geometry.attributes.position.array;
        const move = u.speed * delta;
        for (let k = 0; k < 3; k++) {
          positions[k * 3] += u.dir.x * move;
          positions[k * 3 + 1] += u.dir.y * move;
          positions[k * 3 + 2] += u.dir.z * move;
        }
        m.geometry.attributes.position.needsUpdate = true;

        if (u.age >= u.life) {
          scene.remove(m);
          m.geometry.dispose();
          m.material.dispose();
          meteors.splice(i, 1);
        }
      }
    }

    /*
    ============================================================
     * ★★★ 机器人（宇航员）★★★
     * ============================================================
     */
    setStatus('正在加载资源...');

    const ROBOT_HOME = new THREE.Vector3(ASTRONAUT_POS.x, ASTRONAUT_POS.y, ASTRONAUT_POS.z);

    const robotRig = new THREE.Group();
    robotRig.position.copy(ROBOT_HOME);
    scene.add(robotRig);

    const robotPose = new THREE.Group();
    robotPose.rotation.set(ROBOT_ROT_FIX.x, ROBOT_ROT_FIX.y, ROBOT_ROT_FIX.z);
    robotPose.position.set(ROBOT_OFFSET.x, ROBOT_OFFSET.y, ROBOT_OFFSET.z);
    robotRig.add(robotPose);

    const astronaut = robotRig;

    function setRobotOpacity(opacity) {
      const o = Math.max(0, Math.min(1, opacity));
      astronaut.visible = o > 0.002;
      const wantTransparent = o < 0.999;
      astronaut.traverse(function (c) {
        if (c.isMesh && c.material) {
          const mats = Array.isArray(c.material) ? c.material : [c.material];
          for (let i = 0; i < mats.length; i++) {
            const m = mats[i];
            if (!m) continue;
            if (m.transparent !== wantTransparent) {
              m.transparent = wantTransparent;
              m.needsUpdate = true;
            }
            m.opacity = o;
            m.depthWrite = !wantTransparent;
          }
        }
      });
    }

    let robotModel = null;
    if (typeof THREE.GLTFLoader === 'function') {
      robotModel = await new Promise(resolve => {
        const gltfLoader = new THREE.GLTFLoader();
        let settled = false;
        const done = m => { if (settled) return; settled = true; resolve(m); };
        const timer = setTimeout(() => {
          if (!settled) { settled = true; resolve(null); }
        }, 9000);

        try {
          gltfLoader.load(
            CONFIG.astronautUrl,
            gltf => {
              clearTimeout(timer);
              const model = gltf.scene;
              const box = new THREE.Box3().setFromObject(model);
              const size = box.getSize(new THREE.Vector3());
              const maxDim = Math.max(size.x, size.y, size.z) || 1;
              const scale = (2.2 / maxDim) * ROBOT_SCALE_FIX;
              model.scale.setScalar(scale);
              box.setFromObject(model);
              const center = box.getCenter(new THREE.Vector3());
              model.position.sub(center);

              model.traverse(c => {
                if (c.isMesh) {
                  c.castShadow = false;
                  c.receiveShadow = false;
                  if (c.material) {
                    const mats = Array.isArray(c.material) ? c.material : [c.material];
                    mats.forEach(m => {
                      if (m) {
                        m.transparent = true;
                        m.opacity = 0;
                        m.depthWrite = false;
                      }
                    });
                  }
                }
              });
              done(model);
            },
            undefined,
            () => { clearTimeout(timer); done(null); }
          );
        } catch (e) {
          clearTimeout(timer); done(null);
        }
      });
    }

    if (!robotModel) {
      console.warn('[InitPage] 机器人 GLB 加载失败，使用内置占位模型');
      robotModel = createFallbackAstronaut();
    }

    robotPose.add(robotModel);
    setRobotOpacity(0);

    /*
    ============================================================
     * ★★★ 汇聚粒子（全屏爆炸）★★★
     * ============================================================
     */
    setStatus('正在生成汇聚粒子...');

    const particleCount = 10000;        // ★ 粒子数量
    const PARTICLE_SIZE = 0.14;         // ★ 粒子大小
    const GATHER_SPEED = 0.30;          // ★ 汇聚速度
    const EXPLODE_SPEED = 55.0;         // ★ 爆炸速度
    const EXPLODE_SCATTER = 28.0;       // ★ 爆炸散射
    const EXPLODE_DECAY = 0.9;          // ★ 爆炸衰减
    const HOLD_DURATION = 0.35;

    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pCol = new Float32Array(particleCount * 3);
    const pVel = new Float32Array(particleCount * 3);
    const pTarget = [];
    const pSpeed = [];
    const pPhase = [];

    for (let i = 0; i < particleCount; i++) {
      const r = 20 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pPos[i * 3 + 1] = r * Math.cos(phi);
      pPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const t = Math.random();
      if (t < 0.55) { pCol[i * 3] = 0.3; pCol[i * 3 + 1] = 0.79; pCol[i * 3 + 2] = 0.94; }
      else if (t < 0.85) { pCol[i * 3] = 0.26; pCol[i * 3 + 1] = 0.38; pCol[i * 3 + 2] = 0.93; }
      else { pCol[i * 3] = 0.95; pCol[i * 3 + 1] = 0.85; pCol[i * 3 + 2] = 0.55; }

      pTarget.push(ROBOT_HOME.clone());
      pSpeed.push(0.35 + Math.random() * 0.55);
      pPhase.push(Math.random() * Math.PI * 2);
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));

    const pMat = new THREE.PointsMaterial({
      size: PARTICLE_SIZE,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      map: starSprite,
      alphaTest: 0.001
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    const astronautCenter = ROBOT_HOME.clone();

    function computeAstronautTargets() {
      const box = new THREE.Box3().setFromObject(astronaut);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      astronautCenter.copy(center);

      const rx = Math.max(size.x * 0.52, 0.3);
      const ry = Math.max(size.y * 0.52, 0.4);
      const rz = Math.max(size.z * 0.52, 0.3);

      const tmp = new THREE.Vector3();
      for (let i = 0; i < particleCount; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * Math.PI * 2;
        const phi = Math.acos(2 * v - 1);
        tmp.set(
          Math.sin(phi) * Math.cos(theta) * rx,
          Math.cos(phi) * ry,
          Math.sin(phi) * Math.sin(theta) * rz
        );
        pTarget[i].copy(center).add(tmp);
      }
    }
    computeAstronautTargets();

    /* ---------- OrbitControls ---------- */
    let controls = null;
    if (typeof THREE.OrbitControls === 'function') {
      controls = new THREE.OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.enablePan = false;
      controls.minDistance = 12;
      controls.maxDistance = 200;
      controls.target.set(0, 0, 0);
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.35;
      controls.rotateSpeed = 0.55;
      controls.zoomSpeed = 0.75;
      controls.enableZoom = true;
      controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE };
    }

    /* ---------- 动画循环 ---------- */
    const clock = new THREE.Clock();
    let rafId = null;
    let particleProgress = 0;
    let explosionActive = false;
    let explosionTime = 0;
    let explosionTriggered = false;
    let holdTimer = 0;
    let inHoldPhase = false;

    let robotOpacity = 0;
    let robotRevealStarted = false;
    let robotPhase = 'idle';
    let orbitTime = 0;
    let dashTime = 0;
    const dashVel = new THREE.Vector3();

    const ORBIT_TILT_AXIS = new THREE.Vector3(1, 0, 0);
    const orbitStartAngle = Math.atan2(ROBOT_HOME.z, ROBOT_HOME.x);
    const orbitStartRadius = Math.hypot(ROBOT_HOME.x, ROBOT_HOME.z);

    const _v1 = new THREE.Vector3();
    const _v2 = new THREE.Vector3();
    const _v3 = new THREE.Vector3();
    const _v4 = new THREE.Vector3();

    let finaleResolve = null;
    const finalePromise = new Promise(function (res) { finaleResolve = res; });

    function smoothstep01(t) {
      t = Math.min(1, Math.max(0, t));
      return t * t * (3 - 2 * t);
    }

    function orbitPosition(t, out) {
      const s = Math.min(1, Math.max(0, t));
      const a = orbitStartAngle + s * FLIGHT.orbitTurns * Math.PI * 2;
      const rBlend = smoothstep01(Math.min(1, s * 3));
      const r = orbitStartRadius + (FLIGHT.orbitRadius - orbitStartRadius) * rBlend;

      out.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      out.applyAxisAngle(ORBIT_TILT_AXIS, FLIGHT.orbitTilt);
      out.y += FLIGHT.orbitCenterY;

      const takeoff = smoothstep01(Math.min(1, s / 0.12));
      out.lerp(ROBOT_HOME, 1 - takeoff);
      return out;
    }

    function triggerExplosion() {
      if (explosionTriggered) return;
      explosionTriggered = true;
      explosionActive = true;
      explosionTime = 0;

      for (let i = 0; i < particleCount; i++) {
        const ix = i * 3;
        const dx = pPos[ix] - astronautCenter.x;
        const dy = pPos[ix + 1] - astronautCenter.y;
        const dz = pPos[ix + 2] - astronautCenter.z;
        const len = Math.hypot(dx, dy, dz) || 1;
        const speed = EXPLODE_SPEED * (0.6 + Math.random() * 0.8);
        const scatter = EXPLODE_SCATTER;

        pVel[ix] = (dx / len) * speed + (Math.random() - 0.5) * scatter;
        pVel[ix + 1] = (dy / len) * speed + (Math.random() - 0.5) * scatter;
        pVel[ix + 2] = (dz / len) * speed + (Math.random() - 0.5) * scatter;
      }
    }

    function tick() {
      rafId = requestAnimationFrame(tick);
      const delta = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsedTime();

      earthMesh.rotation.y += delta * 0.06;
      cloudMesh.rotation.y += delta * 0.09;
      earthSystem.rotation.y += delta * 0.008;

      moonPivot.rotation.y += delta * 0.18;
      moonMesh.rotation.y += delta * 0.18;

      const pulse = 1 + 0.08 * Math.sin(t * 1.8);
      sunGlow.scale.set(20 * pulse, 20 * pulse, 1);
      sunMesh.rotation.y += delta * 0.15;

      starFar.rotation.y -= delta * starFar.userData.rotSpeed;
      starFar.rotation.x -= delta * starFar.userData.rotSpeed * 0.3;
      starMid.rotation.y -= delta * starMid.userData.rotSpeed;
      starMid.rotation.x -= delta * starMid.userData.rotSpeed * 0.3;
      starNear.rotation.y -= delta * starNear.userData.rotSpeed;
      starNear.rotation.x -= delta * starNear.userData.rotSpeed * 0.3;
      starDust.rotation.y -= delta * starDust.userData.rotSpeed;
      starDust.rotation.x -= delta * starDust.userData.rotSpeed * 0.3;

      if (galaxyBand) galaxyBand.rotation.y -= delta * galaxyBand.userData.rotSpeed;
      if (galaxyRing) galaxyRing.rotation.y -= delta * galaxyRing.userData.rotSpeed;

      nebulas.forEach(n => {
        n.rotation.y += delta * n.userData.rotSpeed;
        n.rotation.x += delta * n.userData.rotSpeed * 0.4;
      });

      if (scene.userData && scene.userData.auroraArcs) {
        scene.userData.auroraArcs.rotation.y -= delta * scene.userData.auroraArcs.userData.rotSpeed;
      }

      starFar.material.uniforms.time.value = t;
      starMid.material.uniforms.time.value = t;
      starNear.material.uniforms.time.value = t;
      starDust.material.uniforms.time.value = t;
      if (galaxyBand) galaxyBand.material.uniforms.time.value = t;
      if (galaxyRing) galaxyRing.material.uniforms.time.value = t;

      updateMeteors(delta);

      /* ========================================================
       * 机器人：显示 / 飞行阶段机
       * ====================================================== */
      if (astronaut) {

        if (!robotRevealStarted && state.displayedProgress >= ROBOT_REVEAL_AT) {
          robotRevealStarted = true;
        }
        if (robotRevealStarted && robotOpacity < 1 && robotPhase === 'idle') {
          robotOpacity = Math.min(1, robotOpacity + delta * ROBOT_REVEAL_SPEED);
          setRobotOpacity(robotOpacity);
        }

        if (robotPhase === 'idle') {
          astronaut.position.set(
            ROBOT_HOME.x + Math.cos(t * 0.35) * 0.15,
            ROBOT_HOME.y + Math.sin(t * 0.7) * 0.35,
            ROBOT_HOME.z + Math.sin(t * 0.45) * 0.15
          );
          astronaut.rotation.x = Math.sin(t * 0.4) * 0.15;
          astronaut.rotation.y += delta * 0.25;
          astronaut.rotation.z = Math.sin(t * 0.55) * 0.1;

          const box = new THREE.Box3().setFromObject(astronaut);
          const center = box.getCenter(new THREE.Vector3());
          astronautCenter.copy(center);

          if (explosionActive && explosionTime >= FLIGHT.startDelay && FLIGHT.enabled) {
            robotPhase = 'orbit';
            orbitTime = 0;
            setStatus('机器进入地球轨道...');
          }
        }
        else if (robotPhase === 'orbit') {
          orbitTime += delta;
          const p = Math.min(1, orbitTime / Math.max(0.001, FLIGHT.orbitDuration));

          orbitPosition(p, _v1);
          orbitPosition(Math.min(1, p + 0.005), _v2);

          astronaut.position.copy(_v1);

          _v3.subVectors(_v2, _v1);
          if (_v3.lengthSq() > 1e-8) {
            _v4.copy(_v1).add(_v3.normalize());
            astronaut.lookAt(_v4);
          }

          if (p >= 1) {
            robotPhase = 'dash';
            dashTime = 0;
            dashVel.set(0, 0, 0);
            if (controls) controls.autoRotate = false;
            setStatus('欢迎来到您的智慧家...');
          }
        }
        else if (robotPhase === 'dash') {
          dashTime += delta;

          _v1.subVectors(camera.position, astronaut.position);
          const distToCam = _v1.length();
          if (distToCam > 0.001) _v1.divideScalar(distToCam);

          const accel = Math.min(1, dashTime / Math.max(0.001, FLIGHT.dashAccelTime));
          const spd = FLIGHT.dashSpeed * (0.25 + 0.75 * accel);
          _v2.copy(_v1).multiplyScalar(spd);

          dashVel.lerp(_v2, Math.min(1, delta * 5.0));
          astronaut.position.addScaledVector(dashVel, delta);

          _v3.copy(astronaut.position).add(dashVel);
          astronaut.lookAt(_v3);

          if (dashTime > FLIGHT.dashDuration) {
            const f = 1 - Math.min(1, (dashTime - FLIGHT.dashDuration) / Math.max(0.001, FLIGHT.finalFadeOut));
            setRobotOpacity(f);
            if (f <= 0.001) {
              robotPhase = 'gone';
              astronaut.visible = false;
              if (finaleResolve) { finaleResolve(); finaleResolve = null; }
            }
          } else if (distToCam < 1.2) {
            robotPhase = 'gone';
            astronaut.visible = false;
            if (finaleResolve) { finaleResolve(); finaleResolve = null; }
          }
        }
      }

      /* ========================================================
       * 粒子逻辑
       * ====================================================== */
      if (!explosionActive) {
        if (!inHoldPhase) {
          particleProgress = Math.min(1, particleProgress + delta * GATHER_SPEED);
          const positions = pGeo.attributes.position.array;

          for (let i = 0; i < particleCount; i++) {
            const ix = i * 3;
            const tg = pTarget[i];
            const k = Math.min(1, Math.pow(particleProgress, 1.3) + 0.02);

            positions[ix] += (tg.x - positions[ix]) * k * pSpeed[i] * delta * 6;
            positions[ix + 1] += (tg.y - positions[ix + 1]) * k * pSpeed[i] * delta * 6;
            positions[ix + 2] += (tg.z - positions[ix + 2]) * k * pSpeed[i] * delta * 6;

            if (particleProgress > 0.85) {
              const dist = Math.hypot(
                positions[ix] - tg.x,
                positions[ix + 1] - tg.y,
                positions[ix + 2] - tg.z
              );
              if (dist < 0.05) {
                positions[ix] += Math.sin(t * 1.8 + pPhase[i]) * 0.0028;
                positions[ix + 1] += Math.cos(t * 1.4 + pPhase[i]) * 0.0028;
                positions[ix + 2] += Math.sin(t * 1.6 + pPhase[i]) * 0.0028;
              }
            }
          }
          pGeo.attributes.position.needsUpdate = true;

          if (particleProgress >= 1) {
            inHoldPhase = true;
            holdTimer = 0;
          }
        } else {
          holdTimer += delta;
          const positions = pGeo.attributes.position.array;
          for (let i = 0; i < particleCount; i++) {
            const ix = i * 3;
            positions[ix] += Math.sin(t * 1.5 + pPhase[i]) * 0.002;
            positions[ix + 1] += Math.cos(t * 1.3 + pPhase[i]) * 0.002;
            positions[ix + 2] += Math.sin(t * 1.7 + pPhase[i]) * 0.002;
          }
          pGeo.attributes.position.needsUpdate = true;

          if (holdTimer >= HOLD_DURATION) triggerExplosion();
        }
      } else {
        explosionTime += delta;
        const decay = Math.exp(-explosionTime * EXPLODE_DECAY);
        const positions = pGeo.attributes.position.array;

        for (let i = 0; i < particleCount; i++) {
          const ix = i * 3;
          positions[ix] += pVel[ix] * delta * decay;
          positions[ix + 1] += pVel[ix + 1] * delta * decay;
          positions[ix + 2] += pVel[ix + 2] * delta * decay;

          positions[ix] += Math.sin(t * 0.7 + pPhase[i]) * 0.008;
          positions[ix + 1] += Math.cos(t * 0.6 + pPhase[i]) * 0.008;
          positions[ix + 2] += Math.sin(t * 0.8 + pPhase[i]) * 0.008;
        }
        pGeo.attributes.position.needsUpdate = true;

        const explodeGrow = Math.min(1, explosionTime * 1.2);
        pMat.size = PARTICLE_SIZE * (1 + explodeGrow * 1.3);
        pMat.opacity = Math.max(0.55, 0.95 - explosionTime * 0.08);
      }

      if (controls) controls.update();
      renderer.render(scene, camera);
    }

    tick();

    /* ---------- 尺寸自适应 ---------- */
    function onResize() {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      if (w <= 0 || h <= 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
    }

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', () => setTimeout(onResize, 300));
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onResize);
    }

    state.three = {
      renderer: renderer,
      scene: scene,
      camera: camera,
      controls: controls,
      earthSystem: earthSystem,
      earthMesh: earthMesh,
      cloudMesh: cloudMesh,
      atmosphereMesh: atmosphereMesh,
      moonMesh: moonMesh,
      moonPivot: moonPivot,
      sunMesh: sunMesh,
      sunGlow: sunGlow,
      sunLight: sunLight,
      starFar: starFar,
      starMid: starMid,
      starNear: starNear,
      starDust: starDust,
      nebulas: nebulas,
      meteors: meteors,
      astronaut: astronaut,
      particles: particles,
      rafId: null,
      triggerExplosion: triggerExplosion,
      waitForFinale: function () { return finalePromise; },
      dispose: function () {
        try { if (rafId) cancelAnimationFrame(rafId); } catch (e) {}
        window.removeEventListener('resize', onResize);
        if (window.visualViewport) {
          try { window.visualViewport.removeEventListener('resize', onResize); } catch (e) {}
        }
        try { renderer.dispose(); } catch (e) {}
        try {
          scene.traverse(o => {
            if (o.geometry) { try { o.geometry.dispose(); } catch (e) {} }
            if (o.material) {
              const ms = Array.isArray(o.material) ? o.material : [o.material];
              ms.forEach(m => { try { m.dispose(); } catch (e) {} });
            }
          });
        } catch (e) {}
      }
    };

    return state.three;
  }

  /*
  ============================================================
  * 9. 机器人后备（内置占位模型）
  * ============================================================
  */

  function createFallbackAstronaut() {
    const group = new THREE.Group();

    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, metalness: 0.35, roughness: 0.45 });
    const visorMat = new THREE.MeshStandardMaterial({ color: 0x0a1828, metalness: 0.95, roughness: 0.08, emissive: 0x4cc9f0, emissiveIntensity: 0.35 });

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.4, 20), whiteMat);
    torso.position.y = 1.0; group.add(torso);

    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 18), whiteMat);
    helmet.position.y = 2.05; group.add(helmet);

    const visor = new THREE.Mesh(new THREE.SphereGeometry(0.46, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.6), visorMat);
    visor.position.y = 2.05; visor.position.z = 0.14; group.add(visor);

    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.0, 0.36), whiteMat);
    backpack.position.set(0, 1.2, -0.55); group.add(backpack);

    const limbGeo = (THREE.CapsuleGeometry)
      ? new THREE.CapsuleGeometry(0.16, 0.75, 4, 10)
      : new THREE.CylinderGeometry(0.16, 0.16, 1.0, 10);

    const armL = new THREE.Mesh(limbGeo, whiteMat);
    armL.position.set(-0.7, 1.25, 0); armL.rotation.z = 0.35; group.add(armL);

    const armR = armL.clone();
    armR.position.set(0.7, 1.25, 0); armR.rotation.z = -0.35; group.add(armR);

    const legL = new THREE.Mesh(limbGeo, whiteMat);
    legL.position.set(-0.28, 0.15, 0); group.add(legL);

    const legR = legL.clone();
    legR.position.set(0.28, 0.15, 0); group.add(legR);

    return group;
  }

  /*
  ============================================================
  * 10. 进度条动画循环
  * ============================================================
  */

  function startProgressLoop() {
    let lastTarget = 0;

    function tick() {
      if (state.fading || state.done) return;

      const elapsed = nowElapsed();
      let target;

      if (elapsed < CONFIG.minDuration) {
        const t = elapsed / CONFIG.minDuration;
        target = (1 - Math.pow(1 - t, 2.2)) * 95;
      } else {
        const t2 = Math.min(1, (elapsed - CONFIG.minDuration) / 4000);
        target = 95 + t2 * 5;
      }

      if (state.appReady) target = Math.max(target, 100);
      target = Math.min(100, Math.max(0, target));
      if (target > lastTarget) lastTarget = target;

      const cur = parseFloat(state.progressBarEl.style.width || '0');
      const next = cur + (lastTarget - cur) * 0.09;

      state.progressBarEl.style.width = next.toFixed(2) + '%';
      state.percentEl.textContent = Math.floor(next) + '%';
      state.displayedProgress = next;

      if (!state.fading) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /*
  ============================================================
  * 11. 淡出 / 清理
  * ============================================================
  */

  function fadeOut() {
    if (state.fading || state.done) return;
    state.fading = true;
    state.done = true;
    setStatus('加载完成，进入系统...');

    const overlay = state.overlayEl;
    if (!overlay) return;

    try {
      state.progressBarEl.style.width = '100%';
      state.percentEl.textContent = '100%';
    } catch (e) {}

    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        try { if (state.three && state.three.dispose) state.three.dispose(); } catch (e) {}
        try { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); } catch (e) {}
        window.dispatchEvent(new Event('resize'));
        setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
        setTimeout(() => window.dispatchEvent(new Event('resize')), 600);
      }, 950);
    }, 280);
  }

  /*
  ============================================================
  * 12. 等待 app 就绪
  * ============================================================
  */

  function isAppReady() {
    if (!window.app) return false;
    if (window.app.scene && window.app.renderer) return true;
    return false;
  }

  function waitForAppReady() {
    return new Promise(resolve => {
      const check = () => {
        if (isAppReady()) { state.appReady = true; resolve(true); return; }
        if (nowElapsed() >= CONFIG.maxDuration) { resolve(false); return; }
        setTimeout(check, 180);
      };
      check();
    });
  }

  /*
  ============================================================
  * 13. 主程序补丁
  * ============================================================
  */

  function patchApp(app) {
    if (!app || app.__initPatched) return;
    app.__initPatched = true;

    if (typeof app.generate3D === 'function') {
      const origGenerate3D = app.generate3D;
      app.generate3D = function () {
        try { this._wallMergeCache = {}; } catch (e) {}
        const r = origGenerate3D.apply(this, arguments);
        try {
          setTimeout(() => {
            if (!this.structureGroup) return;
            let hasWall = false;
            this.structureGroup.children.forEach(m => {
              if (m.userData && m.userData.floorIndex !== undefined && !m.userData.isCeiling) hasWall = true;
            });
            const shapes = (this.floorShapes && this.floorShapes[this.currentFloor]) || [];
            if (!hasWall && shapes.length > 0) {
              this._wallMergeCache = {};
              try { origGenerate3D.call(this); } catch (e) {}
            }
          }, 80);
        } catch (e) {}
        return r;
      };
    }

    if (app.saveSystem && typeof app.saveSystem.deserializeScene === 'function') {
      const origDeserialize = app.saveSystem.deserializeScene;
      app.saveSystem.deserializeScene = async function (data) {
        const r = await origDeserialize.apply(this, arguments);
        try {
          app._wallMergeCache = {};
          app.generate3D();
          app.updateSceneVisibility();
          setTimeout(() => {
            try {
              app._wallMergeCache = {};
              app.generate3D();
              app.updateSceneVisibility();
            } catch (e) {}
          }, 380);
          setTimeout(() => {
            try {
              app._wallMergeCache = {};
              app.generate3D();
              app.updateSceneVisibility();
            } catch (e) {}
          }, 1400);
        } catch (e) {}
        return r;
      };
    }

    if (typeof app.clearCurrentFloor === 'function') {
      app.clearCurrentFloor = function () {
        const floorIdx = this.currentFloor;
        const self = this;

        this.dialog.confirm(
          `确定清空第${floorIdx + 1}层的所有房间与模型？`,
          () => {
            try {
              self.floorShapes[floorIdx] = [];
              self.currentPoints = [];
              self.mode = 'idle';
              if (self.roomColors[floorIdx]) delete self.roomColors[floorIdx];
              if (self.roomTextures[floorIdx]) delete self.roomTextures[floorIdx];
              self.selectedRoom = null;
              if (self._roomPanelEl) self._roomPanelEl.style.display = 'none';

              const toRemove = [];
              self.furnitureGroup.children.forEach(obj => {
                if (!obj || !obj.userData) return;
                const fi = (obj.userData.floorIndex !== undefined && obj.userData.floorIndex !== null)
                  ? obj.userData.floorIndex
                  : self.floorIndexOfY(obj.position.y);
                if (fi === floorIdx) toRemove.push(obj);
              });

              toRemove.forEach(obj => {
                try {
                  if (obj.userData.animEffectGroup) obj.remove(obj.userData.animEffectGroup);
                } catch (e) {}
                if (self._pendingAnimObjects) {
                  self._pendingAnimObjects = self._pendingAnimObjects.filter(o => o !== obj);
                }
                self.furnitureGroup.remove(obj);
              });

              self._wallMergeCache = {};
              self.render2D();
              self.generate3D();
              self.updateUIStatus();
              self.updateFloorInfo();
              try { self.refreshFloorModelList(); } catch (e) {}
              try { self.saveSystem.saveToDB(true); } catch (e) {}

              const tip = toRemove.length > 0
                ? `✅ 已清空第${floorIdx + 1}层（含 ${toRemove.length} 个模型）`
                : `✅ 已清空第${floorIdx + 1}层`;
              self.saveSystem.showToast(tip);
            } catch (e) {
              console.warn('清空本层异常:', e);
            }
          }
        );
      };
    }

    console.info('[InitPage] app 补丁已安装：墙体生成 & 清空本层已修复');
  }

  function waitAndPatchApp() {
    let patched = false;
    const timer = setInterval(() => {
      if (window.app && typeof window.app.generate3D === 'function') {
        if (!patched) { patchApp(window.app); patched = true; }
        clearInterval(timer);
      } else if (state.done) {
        clearInterval(timer);
      }
    }, 100);
    setTimeout(() => { try { clearInterval(timer); } catch (e) {} }, 12000);
  }

  /*
  ============================================================
  * 14. 启动
  * ============================================================
  */

  async function start() {
    try {
      if (!document.body) { setTimeout(start, 40); return; }

      createOverlay();
      setStatus('初始化系统内核...');
      waitAndPatchApp();

      if (!isThreeReady()) {
        console.warn('[InitPage] Three.js 未加载，使用纯 UI 模式');
        setStatus('加载中...');
        startProgressLoop();
        await sleep(CONFIG.minDuration);
        await waitForAppReady();
        fadeOut();
        return;
      }

      try {
        await buildThreeScene(state.canvasEl);
      } catch (e) {
        console.warn('[InitPage] 3D 场景构建失败，仅使用 UI 加载动画:', e);
      }

      setStatus('正在唤醒主程序...');
      startProgressLoop();

      const waitMin = Math.max(0, CONFIG.minDuration - nowElapsed());
      if (waitMin > 0) await sleep(waitMin);

      await waitForAppReady();
      await sleep(500);

      if (state.three && state.three.triggerExplosion) {
        setStatus('粒子爆炸，星河诞生...');
        try {
          state.progressBarEl.style.width = '100%';
          state.percentEl.textContent = '100%';
        } catch (e) {}

        state.three.triggerExplosion();

        await sleep(EXPLODE_SHOW_DURATION);

        if (state.three.waitForFinale) {
          setStatus('机器人绕地球巡航...');
          const maxWait = (FLIGHT.startDelay + FLIGHT.orbitDuration + FLIGHT.dashDuration + FLIGHT.finalFadeOut + 6) * 1000;
          await Promise.race([
            state.three.waitForFinale(),
            sleep(maxWait)
          ]);
        }
      }

      fadeOut();
    } catch (e) {
      console.error('[InitPage] 初始化异常:', e);
      try { fadeOut(); } catch (e2) {}
    }
  }

  if (document.body) {
    start();
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.__InitPage = {
    fadeOut: fadeOut,
    state: state,
    patchApp: patchApp,
    version: '7.2.0'
  };

  console.info('[InitPage] 初始化脚本已加载 v7.2.0（地球暗部泛红修复）');

})();