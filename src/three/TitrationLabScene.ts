import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ApparatusId, CameraPreset, LabSimulationState } from '../types/lab';
import { getSolutionColorState } from '../utils/chemistry';

export interface HoverInfo {
  apparatusId: ApparatusId;
  x: number;
  y: number;
}

interface LabCallbacks {
  onHoverChange: (info: HoverInfo | null) => void;
  onApparatusClick: (id: ApparatusId) => void;
  onFlaskPlacedUnderBurette: () => void;
}

const CAMERA_PRESETS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  overview: { pos: [0.3, 3.25, 6.2], target: [0.1, 1.45, -0.1] },
  meniscus: { pos: [-0.35, 4.35, 1.85], target: [-0.35, 4.15, -0.15] },
  flask: { pos: [-0.1, 1.35, 2.15], target: [-0.35, 0.55, -0.15] },
  phmeter: { pos: [-1.85, 1.45, 2.25], target: [-2.35, 0.48, -0.2] },
};

// Reusable math objects (zero GC in render loop)
const _rayMouse = new THREE.Vector2();
const _planeIntersect = new THREE.Vector3();
const _benchPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _camGoalPos = new THREE.Vector3();
const _camGoalTarget = new THREE.Vector3();

function detectSoftwareGl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function createLabelTexture(
  title: string,
  subtitle: string,
  bgColor: string,
  accentColor: string,
  textColor = '#0f172a',
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 256);

  // Top & bottom scientific border band
  ctx.fillStyle = accentColor;
  ctx.fillRect(0, 0, 512, 28);
  ctx.fillRect(0, 232, 512, 24);

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 32, 496, 196);

  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.font = '700 44px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(title, 256, 122);

  ctx.fillStyle = '#475569';
  ctx.font = '600 28px "IBM Plex Mono", monospace';
  ctx.fillText(subtitle, 256, 178);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createBuretteScaleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 256, 1024);

  // Subtle vertical white backing strip for reading contrast (Schellbach stripe style)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fillRect(104, 0, 48, 1024);
  ctx.fillStyle = 'rgba(37, 99, 235, 0.35)';
  ctx.fillRect(124, 0, 8, 1024);

  ctx.strokeStyle = '#0f172a';
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 20px "IBM Plex Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const padTop = 36;
  const usableH = 1024 - 72;

  for (let ml = 0; ml <= 50; ml += 0.5) {
    const y = padTop + (ml / 50) * usableH;
    const isMajor = ml % 5 === 0;
    const isUnit = ml % 1 === 0;
    ctx.lineWidth = isMajor ? 3 : isUnit ? 2 : 1.2;
    const tickLen = isMajor ? 46 : isUnit ? 30 : 18;
    ctx.beginPath();
    ctx.moveTo(118 - tickLen, y);
    ctx.lineTo(118, y);
    ctx.stroke();

    if (isMajor) {
      ctx.fillText(String(ml), 126, y);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createBenchTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 512);

  // Fine epoxy speckle
  for (let i = 0; i < 2400; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.18)';
    ctx.fillRect(x, y, 2, 2);
  }

  // Subtle tile seam grid
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 512, 512);
  ctx.beginPath();
  ctx.moveTo(256, 0);
  ctx.lineTo(256, 512);
  ctx.moveTo(0, 256);
  ctx.lineTo(512, 256);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 2);
  return tex;
}

function createPhDisplayTexture(ph: number, statusText: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  drawPhDisplay(ctx, ph, statusText);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function drawPhDisplay(ctx: CanvasRenderingContext2D, ph: number, statusText: string) {
  ctx.fillStyle = '#06202a';
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = '#0ea5e9';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, 492, 236);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '600 24px "IBM Plex Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('DIGITAL pH METER', 28, 48);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('25.0 °C', 482, 48);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#e0f2fe';
  ctx.font = '700 94px "IBM Plex Mono", monospace';
  ctx.fillText(ph.toFixed(2), 30, 158);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '600 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('pH', 360, 152);

  ctx.fillStyle = ph >= 8.2 && ph <= 9.5 ? '#f472b6' : ph > 9.5 ? '#fb7185' : '#34d399';
  ctx.font = '600 26px "IBM Plex Mono", monospace';
  ctx.fillText(statusText, 30, 218);
}

export class TitrationLabScene {
  private container: HTMLElement;
  private callbacks: LabCallbacks;
  private isSoftwareGl: boolean;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private raycaster = new THREE.Raycaster();
  private clock = new THREE.Clock();

  private frameId = 0;
  private disposed = false;
  private lastRaycastTime = 0;

  // Camera damping
  private cameraAnimating = false;
  private activePreset: CameraPreset = 'overview';

  // Interactive apparatus groups
  private interactiveGroups: THREE.Object3D[] = [];
  private apparatusMap = new Map<ApparatusId, THREE.Group>();

  // Dynamic visual elements
  private buretteLiquidMesh!: THREE.Mesh;
  private buretteMeniscusMesh!: THREE.Mesh;
  private stopcockHandleGroup!: THREE.Group;
  private flaskGroup!: THREE.Group;
  private flaskLiquidMesh!: THREE.Mesh;
  private flaskLiquidMaterial!: THREE.MeshPhysicalMaterial;
  private funnelGroup!: THREE.Group;
  private pipetteGroup!: THREE.Group;
  private pipetteLiquidMesh!: THREE.Mesh;
  private indicatorDropperGroup!: THREE.Group;
  private phDisplayCtx!: CanvasRenderingContext2D;
  private phDisplayTex!: THREE.CanvasTexture;
  private phProbeGroup!: THREE.Group;
  private tileTargetRing!: THREE.Mesh;

  // Droplet & squirt animation pools
  private droplets: { mesh: THREE.Mesh; active: boolean; y: number; vy: number }[] = [];
  private dropSpawnTimer = 0;
  private washStreamMesh!: THREE.Mesh;
  private washStreamTimer = 0;

  // Animation states
  private currentState: LabSimulationState;
  private stopcockAngle = 0;
  private swirlTimer = 0;
  private pipetteAnimPhase = 0; // >0 when animating transfer
  private funnelAnimActive = false;
  private indicatorAnimTimer = 0;
  private lastSwirlCount = 0;
  private lastWashCount = 0;
  private lastPhDisplayed = -1;

  // Dragging state
  private draggingFlask = false;
  private pointerDownPos = { x: 0, y: 0 };
  private hoveredApparatus: ApparatusId | null = null;

  constructor(container: HTMLElement, initialState: LabSimulationState, callbacks: LabCallbacks) {
    this.container = container;
    this.currentState = initialState;
    this.callbacks = callbacks;
    this.isSoftwareGl = detectSoftwareGl();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#dbeafe');
    this.scene.fog = new THREE.Fog('#dbeafe', 12, 26);

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 620;

    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);
    this.camera.position.set(...CAMERA_PRESETS.overview.pos);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // Mandatory Studio Environment Reflection
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(...CAMERA_PRESETS.overview.target);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.07;
    this.controls.minDistance = 1.4;
    this.controls.maxDistance = 11;
    this.controls.maxPolarAngle = Math.PI * 0.48;
    this.controls.minPolarAngle = 0.15;
    this.controls.addEventListener('start', () => {
      this.cameraAnimating = false;
    });

    this.setupLighting();
    this.buildLabEnvironment();
    this.buildRetortAndBurette();
    this.buildWhiteTile();
    this.buildConicalFlask();
    this.buildPipetteAndBeaker();
    this.buildFunnel();
    this.buildReagentBottles();
    this.buildWashBottle();
    this.buildPhMeter();
    this.buildDropletPool();

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.bindEvents();
    this.startLoop();
  }

  private setupLighting() {
    // Cool sky / warm bench bounce hemisphere fill
    const hemi = new THREE.HemisphereLight('#f0f9ff', '#cbd5e1', 0.85);
    this.scene.add(hemi);

    // Warm key directional light
    const key = new THREE.DirectionalLight('#fffbeb', 1.65);
    key.position.set(4.5, 8.5, 5.0);
    key.castShadow = !this.isSoftwareGl;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -4.5;
    key.shadow.camera.right = 4.5;
    key.shadow.camera.top = 5.5;
    key.shadow.camera.bottom = -2.5;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 20;
    key.shadow.bias = -0.0005;
    key.shadow.normalBias = 0.02;
    this.scene.add(key);

    // Cool rim light for glassware specular edge highlights
    const rim = new THREE.DirectionalLight('#bae6fd', 0.9);
    rim.position.set(-4.5, 5.0, -4.5);
    this.scene.add(rim);
  }

  private registerApparatus(id: ApparatusId, group: THREE.Group) {
    group.userData.apparatusId = id;
    group.traverse((child) => {
      child.userData.apparatusId = id;
    });
    this.apparatusMap.set(id, group);
    this.interactiveGroups.push(group);
    this.scene.add(group);
  }

  private createGlassMaterial(opacityFallback = 0.36): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.06,
      metalness: 0.0,
      transmission: this.isSoftwareGl ? 0 : 0.92,
      transparent: true,
      opacity: this.isSoftwareGl ? opacityFallback : 1,
      ior: 1.5,
      thickness: 0.22,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }

  private buildLabEnvironment() {
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    const benchTex = createBenchTexture();
    benchTex.anisotropy = maxAniso;

    const benchGroup = new THREE.Group();

    // Main epoxy resin workbench top (top surface strictly at y = 0)
    const benchGeo = new THREE.BoxGeometry(9.6, 0.24, 4.4);
    const benchMat = new THREE.MeshStandardMaterial({
      map: benchTex,
      roughness: 0.42,
      metalness: 0.08,
    });
    const benchTop = new THREE.Mesh(benchGeo, benchMat);
    benchTop.position.set(0, -0.12, 0);
    benchTop.receiveShadow = true;
    benchGroup.add(benchTop);

    // Brushed aluminum front trim rail
    const trimGeo = new THREE.BoxGeometry(9.62, 0.06, 0.06);
    const trimMat = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      metalness: 0.85,
      roughness: 0.22,
    });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(0, -0.04, 2.21);
    benchGroup.add(trim);

    // Backsplash curb
    const curbGeo = new THREE.BoxGeometry(9.6, 0.36, 0.14);
    const curb = new THREE.Mesh(curbGeo, benchMat);
    curb.position.set(0, 0.18, -2.13);
    curb.receiveShadow = true;
    benchGroup.add(curb);

    // Clean clinical laboratory back wall & reagent shelf
    const wallMat = new THREE.MeshStandardMaterial({ color: '#eff6ff', roughness: 0.85, metalness: 0.0 });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(18, 10), wallMat);
    wall.position.set(0, 3.8, -2.25);
    wall.receiveShadow = true;
    benchGroup.add(wall);

    // Upper lab shelf
    const shelfMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.5, metalness: 0.1 });
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.08, 0.55), shelfMat);
    shelf.position.set(0, 4.1, -1.96);
    benchGroup.add(shelf);

    this.registerApparatus('workbench', benchGroup);
  }

  private buildWhiteTile() {
    const group = new THREE.Group();
    group.position.set(-0.35, 0, -0.15);

    const tileGeo = new THREE.BoxGeometry(1.18, 0.04, 1.18);
    const tileMat = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      roughness: 0.12,
      metalness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
    });
    const tile = new THREE.Mesh(tileGeo, tileMat);
    tile.position.y = 0.02;
    tile.receiveShadow = true;
    tile.castShadow = true;
    group.add(tile);

    // Subtle recessed indicator ring showing where to place conical flask
    const ringGeo = new THREE.RingGeometry(0.32, 0.36, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#3b82f6',
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    this.tileTargetRing = new THREE.Mesh(ringGeo, ringMat);
    this.tileTargetRing.rotation.x = -Math.PI / 2;
    this.tileTargetRing.position.y = 0.042;
    group.add(this.tileTargetRing);

    this.registerApparatus('white_tile', group);
  }

  private buildRetortAndBurette() {
    // 1. Retort Stand + Bosshead + Burette Clamp
    const standGroup = new THREE.Group();
    const baseMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.6, metalness: 0.35 });
    const steelMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.18, metalness: 0.92 });
    const clampMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.4, metalness: 0.65 });
    const rubberMat = new THREE.MeshStandardMaterial({ color: '#2563eb', roughness: 0.78, metalness: 0.05 });

    // Heavy cast-iron base positioned behind the white tile
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.08, 1.85), baseMat);
    base.position.set(-0.98, 0.04, -0.38);
    base.castShadow = true;
    base.receiveShadow = true;
    standGroup.add(base);

    // Vertical stainless steel rod
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 5.2, 24), steelMat);
    rod.position.set(-1.15, 2.68, -0.15);
    rod.castShadow = true;
    standGroup.add(rod);

    // Bosshead block at y = 3.35
    const boss = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.16), clampMat);
    boss.position.set(-1.15, 3.35, -0.15);
    standGroup.add(boss);

    // Thumb screw on bosshead
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 16), steelMat);
    screw.rotation.z = Math.PI / 2;
    screw.position.set(-1.26, 3.35, -0.15);
    standGroup.add(screw);

    // Horizontal clamp arm reaching x = -0.35
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.72, 16), steelMat);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(-0.79, 3.35, -0.15);
    standGroup.add(arm);

    // Twin rubber-lined clamp jaws around burette
    const jawGeo = new THREE.TorusGeometry(0.082, 0.018, 12, 24, Math.PI * 1.45);
    const jaw = new THREE.Mesh(jawGeo, rubberMat);
    jaw.rotation.x = Math.PI / 2;
    jaw.rotation.z = -Math.PI * 0.22;
    jaw.position.set(-0.35, 3.35, -0.15);
    standGroup.add(jaw);

    this.registerApparatus('retort_stand', standGroup);

    // 2. 50 mL Graduated Burette
    const buretteGroup = new THREE.Group();
    buretteGroup.position.set(-0.35, 0, -0.15);

    const glassMat = this.createGlassMaterial(0.32);

    // Lathe profile for burette glass body (from tip y = 1.88 to flared top y = 4.88)
    const burettePts = [
      new THREE.Vector2(0.014, 1.88),
      new THREE.Vector2(0.026, 2.02),
      new THREE.Vector2(0.056, 2.18),
      new THREE.Vector2(0.056, 4.78),
      new THREE.Vector2(0.075, 4.88),
    ];
    const buretteGeo = new THREE.LatheGeometry(burettePts, 32);
    const buretteMesh = new THREE.Mesh(buretteGeo, glassMat);
    buretteMesh.renderOrder = 6;
    buretteGroup.add(buretteMesh);

    // Graduated scale sleeve (y = 2.25 is 50 mL mark, y = 4.65 is 0 mL mark)
    const scaleTex = createBuretteScaleTexture();
    scaleTex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const scaleMat = new THREE.MeshBasicMaterial({
      map: scaleTex,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const scaleCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 2.58, 28, 1, true), scaleMat);
    scaleCyl.position.y = 3.45;
    scaleCyl.rotation.y = -Math.PI * 0.5;
    scaleCyl.renderOrder = 7;
    buretteGroup.add(scaleCyl);

    // Internal NaOH Liquid Column (base at y = 2.20, height scaled up to y = 4.65)
    const liqGeo = new THREE.CylinderGeometry(0.048, 0.048, 1, 24);
    liqGeo.translate(0, 0.5, 0); // pivot at bottom
    const liqMat = new THREE.MeshPhysicalMaterial({
      color: '#bae6fd',
      transparent: true,
      opacity: 0.42,
      roughness: 0.08,
      metalness: 0.0,
    });
    this.buretteLiquidMesh = new THREE.Mesh(liqGeo, liqMat);
    this.buretteLiquidMesh.position.y = 2.2;
    this.buretteLiquidMesh.scale.y = 0.01;
    this.buretteLiquidMesh.renderOrder = 4;
    buretteGroup.add(this.buretteLiquidMesh);

    // Concave Meniscus ring at top of liquid column
    const meniscusGeo = new THREE.TorusGeometry(0.044, 0.006, 10, 24);
    const meniscusMat = new THREE.MeshBasicMaterial({ color: '#0284c7', transparent: true, opacity: 0.85 });
    this.buretteMeniscusMesh = new THREE.Mesh(meniscusGeo, meniscusMat);
    this.buretteMeniscusMesh.rotation.x = Math.PI / 2;
    this.buretteMeniscusMesh.position.y = 2.21;
    buretteGroup.add(this.buretteMeniscusMesh);

    // PTFE Stopcock assembly at y = 2.1
    const ptfeMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.35, metalness: 0.05 });
    const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.18, 16), ptfeMat);
    housing.rotation.z = Math.PI / 2;
    housing.position.set(0, 2.1, 0);
    buretteGroup.add(housing);

    // Rotating Blue Stopcock Handle
    this.stopcockHandleGroup = new THREE.Group();
    this.stopcockHandleGroup.position.set(0.1, 2.1, 0);
    const blueTapMat = new THREE.MeshStandardMaterial({ color: '#2563eb', roughness: 0.3, metalness: 0.1 });
    const handleBar = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.038, 0.24), blueTapMat);
    const handleCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 16), blueTapMat);
    handleCollar.rotation.z = Math.PI / 2;
    this.stopcockHandleGroup.add(handleBar, handleCollar);
    buretteGroup.add(this.stopcockHandleGroup);

    this.registerApparatus('burette', buretteGroup);
  }

  private buildConicalFlask() {
    this.flaskGroup = new THREE.Group();
    this.flaskGroup.position.set(1.05, 0, 0.45);

    const glassMat = this.createGlassMaterial(0.34);

    // Authentic 250 mL Erlenmeyer flask Lathe profile (height ~ 1.05, base radius 0.34, neck radius 0.115)
    const flaskPts = [
      new THREE.Vector2(0.0, 0.01),
      new THREE.Vector2(0.28, 0.01),
      new THREE.Vector2(0.34, 0.05),
      new THREE.Vector2(0.33, 0.14),
      new THREE.Vector2(0.125, 0.72),
      new THREE.Vector2(0.115, 0.98),
      new THREE.Vector2(0.145, 1.04),
    ];
    const flaskGeo = new THREE.LatheGeometry(flaskPts, 36);
    const flaskMesh = new THREE.Mesh(flaskGeo, glassMat);
    flaskMesh.castShadow = true;
    flaskMesh.renderOrder = 6;
    this.flaskGroup.add(flaskMesh);

    // Subtle white enamel label ring on flask
    const markGeo = new THREE.RingGeometry(0.23, 0.24, 32);
    const markMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.45, side: THREE.DoubleSide });
    const mark = new THREE.Mesh(markGeo, markMat);
    mark.rotation.x = Math.PI / 2;
    mark.position.y = 0.32;
    this.flaskGroup.add(mark);

    // Internal Dynamic Liquid Volume (conical frustum matching flask interior)
    const liqPts = [
      new THREE.Vector2(0.0, 0.02),
      new THREE.Vector2(0.26, 0.02),
      new THREE.Vector2(0.315, 0.06),
      new THREE.Vector2(0.305, 0.14),
      new THREE.Vector2(0.255, 0.28),
      new THREE.Vector2(0.0, 0.28),
    ];
    const liqGeo = new THREE.LatheGeometry(liqPts, 32);
    this.flaskLiquidMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xdbeafe,
      transparent: true,
      opacity: 0.3,
      roughness: 0.08,
      metalness: 0.0,
      clearcoat: 0.6,
    });
    this.flaskLiquidMesh = new THREE.Mesh(liqGeo, this.flaskLiquidMaterial);
    this.flaskLiquidMesh.visible = false;
    this.flaskLiquidMesh.renderOrder = 4;
    this.flaskGroup.add(this.flaskLiquidMesh);

    this.registerApparatus('conical_flask', this.flaskGroup);
  }

  private buildPipetteAndBeaker() {
    const glassMat = this.createGlassMaterial(0.36);

    // 1. 100 mL Beaker holding Unknown HCl
    const beakerGroup = new THREE.Group();
    beakerGroup.position.set(1.85, 0, 0.45);

    const beakerPts = [
      new THREE.Vector2(0.0, 0.01),
      new THREE.Vector2(0.24, 0.01),
      new THREE.Vector2(0.25, 0.05),
      new THREE.Vector2(0.25, 0.64),
      new THREE.Vector2(0.275, 0.67),
    ];
    const beakerMesh = new THREE.Mesh(new THREE.LatheGeometry(beakerPts, 32), glassMat);
    beakerMesh.castShadow = true;
    beakerMesh.renderOrder = 6;
    beakerGroup.add(beakerMesh);

    // HCl liquid inside beaker
    const hclLiq = new THREE.Mesh(
      new THREE.CylinderGeometry(0.23, 0.23, 0.4, 28),
      new THREE.MeshPhysicalMaterial({
        color: '#e0f2fe',
        transparent: true,
        opacity: 0.42,
        roughness: 0.08,
      }),
    );
    hclLiq.position.y = 0.22;
    hclLiq.renderOrder = 4;
    beakerGroup.add(hclLiq);

    // Beaker label badge
    const labelTex = createLabelTexture('HCl', 'Analyte (100 mL)', '#ffffff', '#ef4444');
    const labelMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.254, 0.254, 0.22, 24, 1, true, -0.7, 1.4),
      new THREE.MeshBasicMaterial({ map: labelTex, transparent: true }),
    );
    labelMesh.position.y = 0.34;
    beakerGroup.add(labelMesh);

    this.registerApparatus('beaker', beakerGroup);

    // 2. 10 mL Volumetric Pipette (standing on small holder beside beaker)
    this.pipetteGroup = new THREE.Group();
    this.pipetteGroup.position.set(2.35, 0, -0.2);

    // Small pipette holder base & post
    const holderMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.4, metalness: 0.2 });
    const holderBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.04, 20), holderMat);
    holderBase.position.y = 0.02;
    this.pipetteGroup.add(holderBase);

    // Pipette glass profile
    const pipPts = [
      new THREE.Vector2(0.012, 0.14),
      new THREE.Vector2(0.026, 0.55),
      new THREE.Vector2(0.068, 0.72),
      new THREE.Vector2(0.068, 0.96),
      new THREE.Vector2(0.026, 1.12),
      new THREE.Vector2(0.026, 1.62),
    ];
    const pipMesh = new THREE.Mesh(new THREE.LatheGeometry(pipPts, 24), glassMat);
    pipMesh.renderOrder = 6;
    this.pipetteGroup.add(pipMesh);

    // 10 mL calibration ring
    const calRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.028, 0.004, 8, 20),
      new THREE.MeshBasicMaterial({ color: '#1d4ed8' }),
    );
    calRing.rotation.x = Math.PI / 2;
    calRing.position.y = 1.38;
    this.pipetteGroup.add(calRing);

    // Blue silicone pipette filler bulb
    const bulbMat = new THREE.MeshStandardMaterial({ color: '#2563eb', roughness: 0.65, metalness: 0.05 });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 16), bulbMat);
    bulb.scale.set(0.85, 1.35, 0.85);
    bulb.position.y = 1.72;
    this.pipetteGroup.add(bulb);

    // Internal HCl liquid inside pipette (visible during transfer)
    const pipLiqGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.0, 16);
    pipLiqGeo.translate(0, 0.5, 0);
    this.pipetteLiquidMesh = new THREE.Mesh(
      pipLiqGeo,
      new THREE.MeshPhysicalMaterial({ color: '#bae6fd', transparent: true, opacity: 0.55, roughness: 0.1 }),
    );
    this.pipetteLiquidMesh.position.y = 0.25;
    this.pipetteLiquidMesh.scale.y = 0.001;
    this.pipetteLiquidMesh.visible = false;
    this.pipetteGroup.add(this.pipetteLiquidMesh);

    this.registerApparatus('pipette', this.pipetteGroup);
  }

  private buildFunnel() {
    this.funnelGroup = new THREE.Group();
    this.funnelGroup.position.set(-1.62, 0, 0.35);

    const glassMat = this.createGlassMaterial(0.38);

    // Rest ring stand for funnel when not on burette
    const funnelPts = [
      new THREE.Vector2(0.016, 0.02),
      new THREE.Vector2(0.022, 0.22),
      new THREE.Vector2(0.18, 0.48),
      new THREE.Vector2(0.19, 0.5),
    ];
    const funnelMesh = new THREE.Mesh(new THREE.LatheGeometry(funnelPts, 28), glassMat);
    funnelMesh.renderOrder = 6;
    this.funnelGroup.add(funnelMesh);

    this.registerApparatus('funnel', this.funnelGroup);
  }

  private buildReagentBottles() {
    // 1. 0.1 M NaOH Bottle (White HDPE + Blue Cap)
    const naohGroup = new THREE.Group();
    naohGroup.position.set(-1.75, 0, -1.15);
    const hdpeMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.38, metalness: 0.02 });
    const naohBody = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.85, 28), hdpeMat);
    naohBody.position.y = 0.425;
    naohBody.castShadow = true;
    const naohShoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.28, 0.16, 28), hdpeMat);
    naohShoulder.position.y = 0.93;
    const naohCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.12, 24),
      new THREE.MeshStandardMaterial({ color: '#2563eb', roughness: 0.4 }),
    );
    naohCap.position.y = 1.07;

    const naohLabelTex = createLabelTexture('0.1 M NaOH', 'Standard Titrant', '#ffffff', '#2563eb');
    const naohLabel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.284, 0.284, 0.42, 28, 1, true, -0.9, 1.8),
      new THREE.MeshBasicMaterial({ map: naohLabelTex }),
    );
    naohLabel.position.y = 0.44;
    naohGroup.add(naohBody, naohShoulder, naohCap, naohLabel);
    this.registerApparatus('naoh_bottle', naohGroup);

    // 2. Unknown HCl Reagent Bottle (Amber Glass + Red Cap)
    const hclGroup = new THREE.Group();
    hclGroup.position.set(1.05, 0, -1.15);
    const amberMat = new THREE.MeshPhysicalMaterial({
      color: '#92400e',
      roughness: 0.12,
      metalness: 0.0,
      transparent: true,
      opacity: 0.86,
      clearcoat: 0.9,
    });
    const hclBody = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.82, 28), amberMat);
    hclBody.position.y = 0.41;
    hclBody.castShadow = true;
    const hclShoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.27, 0.15, 28), amberMat);
    hclShoulder.position.y = 0.895;
    const hclCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.11, 24),
      new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.4 }),
    );
    hclCap.position.y = 1.02;

    const hclLabelTex = createLabelTexture('HCl (Unknown)', 'Strong Acid', '#ffffff', '#dc2626');
    const hclLabel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.274, 0.274, 0.4, 28, 1, true, -0.9, 1.8),
      new THREE.MeshBasicMaterial({ map: hclLabelTex }),
    );
    hclLabel.position.y = 0.42;
    hclGroup.add(hclBody, hclShoulder, hclCap, hclLabel);
    this.registerApparatus('hcl_bottle', hclGroup);

    // 3. Phenolphthalein Dropper Bottle (Amber Bottle + Pipette Dropper Cap)
    this.indicatorDropperGroup = new THREE.Group();
    this.indicatorDropperGroup.position.set(2.05, 0, -1.05);
    const indBody = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.48, 24), amberMat);
    indBody.position.y = 0.24;
    indBody.castShadow = true;
    const indCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.085, 0.09, 20),
      new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.4 }),
    );
    indCap.position.y = 0.525;
    const indBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 16, 14),
      new THREE.MeshStandardMaterial({ color: '#ec4899', roughness: 0.55 }),
    );
    indBulb.scale.set(0.9, 1.35, 0.9);
    indBulb.position.y = 0.62;

    const indLabelTex = createLabelTexture('Phenolphthalein', 'pH 8.2 - 10.0', '#ffffff', '#db2777');
    const indLabel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.174, 0.174, 0.25, 24, 1, true, -0.95, 1.9),
      new THREE.MeshBasicMaterial({ map: indLabelTex }),
    );
    indLabel.position.y = 0.25;
    this.indicatorDropperGroup.add(indBody, indCap, indBulb, indLabel);
    this.registerApparatus('indicator_bottle', this.indicatorDropperGroup);
  }

  private buildWashBottle() {
    const group = new THREE.Group();
    group.position.set(-1.72, 0, 1.05);

    const ldpeMat = new THREE.MeshPhysicalMaterial({
      color: '#f1f5f9',
      roughness: 0.35,
      transparent: true,
      opacity: 0.85,
    });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.68, 24), ldpeMat);
    body.position.y = 0.34;
    body.castShadow = true;

    const waterInside = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.48, 24),
      new THREE.MeshPhysicalMaterial({ color: '#bae6fd', transparent: true, opacity: 0.55, roughness: 0.1 }),
    );
    waterInside.position.y = 0.25;

    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.11, 0.12, 20),
      new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.38 }),
    );
    cap.position.y = 0.74;

    // Angled wash bottle spout via TubeGeometry
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.8, 0),
      new THREE.Vector3(0.04, 0.96, 0),
      new THREE.Vector3(0.22, 1.02, -0.08),
      new THREE.Vector3(0.32, 0.94, -0.12),
    ]);
    const spout = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 16, 0.016, 10, false),
      new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.35 }),
    );

    const washLabelTex = createLabelTexture('Distilled H₂O', 'Wash Bottle', '#ffffff', '#0284c7');
    const washLabel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.224, 0.224, 0.3, 24, 1, true, -0.9, 1.8),
      new THREE.MeshBasicMaterial({ map: washLabelTex }),
    );
    washLabel.position.y = 0.34;

    group.add(body, waterInside, cap, spout, washLabel);
    this.registerApparatus('wash_bottle', group);

    // Wash water arc mesh (shown briefly when squirted)
    const streamCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.4, 0.94, 0.93),
      new THREE.Vector3(-0.9, 1.28, 0.42),
      new THREE.Vector3(-0.35, 0.88, -0.15),
    ]);
    this.washStreamMesh = new THREE.Mesh(
      new THREE.TubeGeometry(streamCurve, 20, 0.012, 8, false),
      new THREE.MeshBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.75 }),
    );
    this.washStreamMesh.visible = false;
    this.scene.add(this.washStreamMesh);
  }

  private buildPhMeter() {
    const group = new THREE.Group();
    group.position.set(-2.55, 0, -0.2);

    // Angled benchtop instrument chassis using ExtrudeGeometry
    const shape = new THREE.Shape();
    shape.moveTo(-0.42, 0);
    shape.lineTo(0.42, 0);
    shape.lineTo(0.42, 0.18);
    shape.lineTo(0.15, 0.56);
    shape.lineTo(-0.42, 0.56);
    shape.closePath();

    const chassisGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.72,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3,
    });
    chassisGeo.center();
    const chassisMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.32, metalness: 0.12 });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.set(0, 0.29, 0);
    chassis.rotation.y = Math.PI * 0.28;
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    group.add(chassis);

    // Live LCD screen canvas
    this.phDisplayTex = createPhDisplayTexture(7.0, 'STANDBY');
    this.phDisplayTex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const canvas = this.phDisplayTex.image as HTMLCanvasElement;
    this.phDisplayCtx = canvas.getContext('2d')!;

    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.62, 0.32),
      new THREE.MeshBasicMaterial({ map: this.phDisplayTex }),
    );
    screenMesh.position.set(0.15, 0.42, 0.19);
    screenMesh.rotation.y = Math.PI * 0.28;
    screenMesh.rotation.x = -0.58;
    // Align cleanly on angled front face
    const screenHolder = new THREE.Group();
    screenHolder.rotation.y = Math.PI * 0.28;
    screenMesh.position.set(0.24, 0.39, 0.0);
    screenMesh.rotation.set(0, Math.PI / 2, 0);
    screenMesh.rotateX(-0.62);
    screenHolder.add(screenMesh);
    group.add(screenHolder);

    // Electrode Probe + Flexible Cable
    this.phProbeGroup = new THREE.Group();
    const probeBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.75, 14),
      new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.35 }),
    );
    probeBody.position.y = 0.375;
    const probeTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 12, 12),
      new THREE.MeshPhysicalMaterial({ color: '#bae6fd', transparent: true, opacity: 0.75, roughness: 0.1 }),
    );
    this.phProbeGroup.add(probeBody, probeTip);
    this.phProbeGroup.position.set(-0.42, 0.22, -0.15);
    this.scene.add(this.phProbeGroup);

    // Cable connecting meter to electrode holder
    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.5, 0.45, -0.35),
      new THREE.Vector3(-2.1, 1.15, -0.55),
      new THREE.Vector3(-1.3, 1.35, -0.45),
      new THREE.Vector3(-0.42, 0.96, -0.15),
    ]);
    const cable = new THREE.Mesh(
      new THREE.TubeGeometry(cableCurve, 24, 0.012, 8, false),
      new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.65 }),
    );
    this.scene.add(cable);

    this.registerApparatus('ph_meter', group);
  }

  private buildDropletPool() {
    const dropGeo = new THREE.SphereGeometry(0.02, 12, 12);
    const dropMat = new THREE.MeshPhysicalMaterial({
      color: '#e0f2fe',
      transparent: true,
      opacity: 0.85,
      roughness: 0.05,
    });
    for (let i = 0; i < 8; i++) {
      const mesh = new THREE.Mesh(dropGeo, dropMat);
      mesh.scale.set(0.85, 1.35, 0.85);
      mesh.visible = false;
      this.scene.add(mesh);
      this.droplets.push({ mesh, active: false, y: 1.9, vy: 0 });
    }
  }

  private spawnDroplet() {
    const slot = this.droplets.find((d) => !d.active);
    if (!slot) return;
    slot.active = true;
    slot.y = 1.88;
    slot.vy = -1.2;
    slot.mesh.position.set(-0.35, slot.y, -0.15);
    slot.mesh.visible = true;
  }

  public triggerSingleDrop() {
    this.spawnDroplet();
  }

  public setCameraPreset(preset: CameraPreset) {
    this.activePreset = preset;
    this.cameraAnimating = true;
  }

  public syncState(next: LabSimulationState) {
    if (next.swirlTriggerCount !== this.lastSwirlCount) {
      this.lastSwirlCount = next.swirlTriggerCount;
      this.swirlTimer = 1.15;
    }
    if (next.washSquirtCount !== this.lastWashCount) {
      this.lastWashCount = next.washSquirtCount;
      this.washStreamTimer = 0.65;
    }
    if (!this.currentState.hclTransferred && next.hclTransferred) {
      this.pipetteAnimPhase = 1.0;
    }
    if (!this.currentState.indicatorAdded && next.indicatorAdded) {
      this.indicatorAnimTimer = 1.0;
    }
    this.funnelAnimActive = next.currentStep === 2 && !next.buretteFilled;
    this.currentState = next;
  }

  private updateDynamicVisuals(dt: number) {
    const s = this.currentState;

    // 1. Burette liquid height (0 mL -> full height 2.45, 50 mL -> 0.02)
    const targetFillRatio = s.buretteFilled
      ? Math.max(0.01, (50 - s.buretteReadingMl) / 50)
      : s.buretteRinsed
      ? 0.06
      : 0.005;
    const targetScaleY = targetFillRatio * 2.45;
    this.buretteLiquidMesh.scale.y = THREE.MathUtils.damp(this.buretteLiquidMesh.scale.y, targetScaleY, 10, dt);
    this.buretteLiquidMesh.visible = s.buretteFilled || s.buretteRinsed;
    this.buretteMeniscusMesh.position.y = 2.2 + this.buretteLiquidMesh.scale.y;
    this.buretteMeniscusMesh.visible = s.buretteFilled;

    // 2. Stopcock tap handle rotation
    const targetTapAngle =
      s.tapSpeed === 'closed'
        ? 0
        : s.tapSpeed === 'slow'
        ? Math.PI * 0.24
        : s.tapSpeed === 'medium'
        ? Math.PI * 0.38
        : Math.PI * 0.5;
    this.stopcockAngle = THREE.MathUtils.damp(this.stopcockAngle, targetTapAngle, 14, dt);
    this.stopcockHandleGroup.rotation.x = this.stopcockAngle;

    // 3. Falling droplets while tap is open
    if (s.tapSpeed !== 'closed' && s.buretteFilled && s.buretteReadingMl < 50) {
      const interval = s.tapSpeed === 'slow' ? 0.42 : s.tapSpeed === 'medium' ? 0.18 : 0.07;
      this.dropSpawnTimer += dt;
      if (this.dropSpawnTimer >= interval) {
        this.dropSpawnTimer = 0;
        this.spawnDroplet();
      }
    }

    for (const d of this.droplets) {
      if (!d.active) continue;
      d.vy -= 9.5 * dt;
      d.y += d.vy * dt;
      d.mesh.position.y = d.y;
      if (d.y <= 0.35) {
        d.active = false;
        d.mesh.visible = false;
        if (s.flaskUnderBurette) {
          this.swirlTimer = Math.max(this.swirlTimer, 0.35);
        }
      }
    }

    // 4. Conical flask placement & swirl animation
    if (!this.draggingFlask) {
      const targetX = s.flaskUnderBurette ? -0.35 : 1.05;
      const targetY = s.flaskUnderBurette ? 0.042 : 0.0;
      const targetZ = s.flaskUnderBurette ? -0.15 : 0.45;
      this.flaskGroup.position.x = THREE.MathUtils.damp(this.flaskGroup.position.x, targetX, 8, dt);
      this.flaskGroup.position.y = THREE.MathUtils.damp(this.flaskGroup.position.y, targetY, 8, dt);
      this.flaskGroup.position.z = THREE.MathUtils.damp(this.flaskGroup.position.z, targetZ, 8, dt);
    }

    if (this.swirlTimer > 0) {
      this.swirlTimer = Math.max(0, this.swirlTimer - dt);
      const t = this.clock.getElapsedTime() * 14;
      const amp = Math.min(1, this.swirlTimer * 1.5);
      this.flaskGroup.rotation.z = Math.sin(t) * 0.045 * amp;
      this.flaskGroup.rotation.x = Math.cos(t) * 0.045 * amp;
    } else {
      this.flaskGroup.rotation.z = THREE.MathUtils.damp(this.flaskGroup.rotation.z, 0, 10, dt);
      this.flaskGroup.rotation.x = THREE.MathUtils.damp(this.flaskGroup.rotation.x, 0, 10, dt);
    }

    // 5. Flask liquid visibility, volume & phenolphthalein colour
    const hasLiquid = s.hclTransferred || s.volumeAddedMl > 0 || s.distilledWaterAddedMl > 0;
    this.flaskLiquidMesh.visible = hasLiquid;
    if (hasLiquid) {
      const totalMl = (s.hclTransferred ? s.hclPipetteVolume : 0) + s.volumeAddedMl + s.distilledWaterAddedMl;
      const volScaleY = THREE.MathUtils.clamp(0.45 + (totalMl / 45) * 0.85, 0.35, 1.35);
      this.flaskLiquidMesh.scale.y = THREE.MathUtils.damp(this.flaskLiquidMesh.scale.y, volScaleY, 8, dt);

      const colState = getSolutionColorState(s.currentPh, s.indicatorAdded, s.hclTransferred, s.pinkFlashIntensity);
      this.flaskLiquidMaterial.color.setHex(colState.hex);
      this.flaskLiquidMaterial.opacity = THREE.MathUtils.damp(this.flaskLiquidMaterial.opacity, colState.opacity, 10, dt);
    }

    // 6. Funnel placement (top of burette during filling, else resting)
    const funnelGoalX = this.funnelAnimActive ? -0.35 : -1.62;
    const funnelGoalY = this.funnelAnimActive ? 4.78 : 0.0;
    const funnelGoalZ = this.funnelAnimActive ? -0.15 : 0.35;
    this.funnelGroup.position.x = THREE.MathUtils.damp(this.funnelGroup.position.x, funnelGoalX, 7, dt);
    this.funnelGroup.position.y = THREE.MathUtils.damp(this.funnelGroup.position.y, funnelGoalY, 7, dt);
    this.funnelGroup.position.z = THREE.MathUtils.damp(this.funnelGroup.position.z, funnelGoalZ, 7, dt);

    // 7. Volumetric Pipette transfer animation
    if (this.pipetteAnimPhase > 0) {
      this.pipetteAnimPhase = Math.max(0, this.pipetteAnimPhase - dt * 0.75);
      const arc = Math.sin(this.pipetteAnimPhase * Math.PI);
      this.pipetteGroup.position.x = THREE.MathUtils.lerp(2.35, 1.05, arc);
      this.pipetteGroup.position.y = arc * 0.95;
      this.pipetteGroup.position.z = THREE.MathUtils.lerp(-0.2, 0.45, arc);
      this.pipetteLiquidMesh.visible = true;
      this.pipetteLiquidMesh.scale.y = 0.85 * this.pipetteAnimPhase;
    } else {
      this.pipetteGroup.position.x = THREE.MathUtils.damp(this.pipetteGroup.position.x, 2.35, 8, dt);
      this.pipetteGroup.position.y = THREE.MathUtils.damp(this.pipetteGroup.position.y, 0.0, 8, dt);
      this.pipetteGroup.position.z = THREE.MathUtils.damp(this.pipetteGroup.position.z, -0.2, 8, dt);
      this.pipetteLiquidMesh.visible = false;
    }

    // 8. Phenolphthalein dropper animation
    if (this.indicatorAnimTimer > 0) {
      this.indicatorAnimTimer = Math.max(0, this.indicatorAnimTimer - dt * 0.85);
      const arc = Math.sin(this.indicatorAnimTimer * Math.PI);
      const targetFlaskX = s.flaskUnderBurette ? -0.35 : 1.05;
      const targetFlaskZ = s.flaskUnderBurette ? -0.15 : 0.45;
      this.indicatorDropperGroup.position.x = THREE.MathUtils.lerp(2.05, targetFlaskX, arc);
      this.indicatorDropperGroup.position.y = arc * 1.15;
      this.indicatorDropperGroup.position.z = THREE.MathUtils.lerp(-1.05, targetFlaskZ, arc);
    } else {
      this.indicatorDropperGroup.position.x = THREE.MathUtils.damp(this.indicatorDropperGroup.position.x, 2.05, 8, dt);
      this.indicatorDropperGroup.position.y = THREE.MathUtils.damp(this.indicatorDropperGroup.position.y, 0, 8, dt);
      this.indicatorDropperGroup.position.z = THREE.MathUtils.damp(this.indicatorDropperGroup.position.z, -1.05, 8, dt);
    }

    // 9. Wash bottle water stream
    if (this.washStreamTimer > 0) {
      this.washStreamTimer = Math.max(0, this.washStreamTimer - dt);
      this.washStreamMesh.visible = true;
    } else {
      this.washStreamMesh.visible = false;
    }

    // 10. pH Electrode probe placement & live LCD update
    const probeTargetX = s.flaskUnderBurette ? -0.42 : -1.55;
    const probeTargetY = s.flaskUnderBurette ? 0.22 : 0.35;
    const probeTargetZ = s.flaskUnderBurette ? -0.15 : -0.35;
    this.phProbeGroup.position.x = THREE.MathUtils.damp(this.phProbeGroup.position.x, probeTargetX, 8, dt);
    this.phProbeGroup.position.y = THREE.MathUtils.damp(this.phProbeGroup.position.y, probeTargetY, 8, dt);
    this.phProbeGroup.position.z = THREE.MathUtils.damp(this.phProbeGroup.position.z, probeTargetZ, 8, dt);

    const displayPh = s.hclTransferred ? s.currentPh : 7.0;
    if (Math.abs(displayPh - this.lastPhDisplayed) >= 0.01) {
      this.lastPhDisplayed = displayPh;
      const status = !s.hclTransferred
        ? 'STANDBY'
        : displayPh < 6.8
        ? 'ACIDIC'
        : displayPh < 8.2
        ? 'NEUTRAL ZONE'
        : displayPh <= 9.5
        ? 'ENDPOINT REACHED'
        : 'BASIC (OVERSHOT)';
      drawPhDisplay(this.phDisplayCtx, displayPh, status);
      this.phDisplayTex.needsUpdate = true;
    }

    // 11. Tile target ring visibility
    this.tileTargetRing.visible = !s.flaskUnderBurette;

    // 12. Smooth camera preset transitions
    if (this.cameraAnimating) {
      const preset = CAMERA_PRESETS[this.activePreset];
      _camGoalPos.set(...preset.pos);
      _camGoalTarget.set(...preset.target);
      this.camera.position.lerp(_camGoalPos, 1 - Math.exp(-6 * dt));
      this.controls.target.lerp(_camGoalTarget, 1 - Math.exp(-6 * dt));
      if (this.camera.position.distanceTo(_camGoalPos) < 0.02) {
        this.cameraAnimating = false;
      }
    }
  }

  private getApparatusAtPointer(clientX: number, clientY: number): ApparatusId | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    _rayMouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    _rayMouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(_rayMouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.interactiveGroups, true);
    for (const hit of hits) {
      const id = hit.object.userData.apparatusId as ApparatusId | undefined;
      if (id && id !== 'workbench') return id;
    }
    return null;
  }

  private bindEvents() {
    const canvas = this.renderer.domElement;

    const onPointerMove = (e: PointerEvent) => {
      if (this.draggingFlask) {
        const rect = canvas.getBoundingClientRect();
        _rayMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        _rayMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(_rayMouse, this.camera);
        if (this.raycaster.ray.intersectPlane(_benchPlane, _planeIntersect)) {
          this.flaskGroup.position.x = THREE.MathUtils.clamp(_planeIntersect.x, -1.6, 2.2);
          this.flaskGroup.position.z = THREE.MathUtils.clamp(_planeIntersect.z, -0.8, 1.4);
          this.flaskGroup.position.y = 0.08;
        }
        return;
      }

      const now = performance.now();
      if (now - this.lastRaycastTime < 45) return;
      this.lastRaycastTime = now;

      const hitId = this.getApparatusAtPointer(e.clientX, e.clientY);
      if (hitId !== this.hoveredApparatus || hitId !== null) {
        this.hoveredApparatus = hitId;
        canvas.style.cursor = hitId ? 'pointer' : 'grab';
        this.callbacks.onHoverChange(
          hitId ? { apparatusId: hitId, x: e.clientX, y: e.clientY } : null,
        );
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
      const hitId = this.getApparatusAtPointer(e.clientX, e.clientY);
      if (hitId === 'conical_flask' && !this.currentState.flaskUnderBurette && this.currentState.hclTransferred) {
        this.draggingFlask = true;
        this.controls.enabled = false;
        canvas.style.cursor = 'grabbing';
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (this.draggingFlask) {
        this.draggingFlask = false;
        this.controls.enabled = true;
        canvas.style.cursor = 'pointer';
        const distToTile = Math.hypot(this.flaskGroup.position.x - -0.35, this.flaskGroup.position.z - -0.15);
        if (distToTile < 0.78) {
          this.callbacks.onFlaskPlacedUnderBurette();
          return;
        }
      }

      const moved = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
      if (moved < 7) {
        const hitId = this.getApparatusAtPointer(e.clientX, e.clientY);
        if (hitId) {
          this.callbacks.onApparatusClick(hitId);
        }
      }
    };

    const onResize = () => {
      if (this.disposed) return;
      const w = this.container.clientWidth || 900;
      const h = this.container.clientHeight || 620;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('resize', onResize);

    // Store cleanup on instance
    this.cleanupListeners = () => {
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
    };
  }

  private cleanupListeners: () => void = () => {};

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) return;
      const status = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
      if (status === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private startLoop() {
    const tick = () => {
      if (this.disposed) return;
      const dt = Math.min(this.clock.getDelta(), 0.1);
      this.controls.update();
      this.updateDynamicVisuals(dt);
      this.renderer.render(this.scene, this.camera);
      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };
    tick();
  }

  public dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.cleanupListeners();
    this.controls.dispose();
    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose();
        if (Array.isArray(m.material)) {
          m.material.forEach((mat) => mat.dispose());
        } else {
          m.material?.dispose();
        }
      }
    });
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
