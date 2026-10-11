import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Monitor, ArrowLeft, Zap, Sparkles, Building2, Coffee, CheckCircle2 } from 'lucide-react';
import { CityEnvironment } from '../../../hooks/useEnvironmentalAudio';

interface RealisticOffice3DProps {
  city: CityEnvironment;
  player: any;
  business: any;
  website: any;
  wallet: any;
  onOpenWorkstation: () => void;
  onExitToDistrict: () => void;
  playSfx?: (type: 'click' | 'confirm' | 'workstation') => void;
}

export function RealisticOffice3D({
  city,
  player,
  business,
  website,
  wallet,
  onOpenWorkstation,
  onExitToDistrict,
  playSfx
}: RealisticOffice3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Verify WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch (_) {
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0c121e);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.6, 3.8); // Eye-level perspective facing desk and city window
    camera.lookAt(0, 1.25, -0.6);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Warm ceiling downlights
    const ceilingLight = new THREE.PointLight(0xffeedd, 1.2, 8);
    ceilingLight.position.set(0, 3.2, 0);
    ceilingLight.castShadow = true;
    scene.add(ceilingLight);

    // Natural daylight pouring through panoramic window
    const windowLight = new THREE.DirectionalLight(
      city === 'lagos' ? 0xfff4e6 : 0xe0f2fe, 
      1.4
    );
    windowLight.position.set(-2, 2.5, -4);
    windowLight.target.position.set(0, 1, 0);
    windowLight.castShadow = true;
    scene.add(windowLight);
    scene.add(windowLight.target);

    // 5. Office Room Shell (Walls, Ceiling, Hardwood Floor)
    // Floor
    const floorGeo = new THREE.PlaneGeometry(10, 8);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x3d2817, // Rich Walnut Hardwood
      roughness: 0.35,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(10, 8);
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 3.6;
    scene.add(ceiling);

    // Back & Side Walls
    const backWallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.75 });
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.6, 8), backWallMat);
    leftWall.position.set(-5, 1.8, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.6, 8), backWallMat);
    rightWall.position.set(5, 1.8, 0);
    scene.add(rightWall);

    // 6. Panoramic Floor-to-Ceiling Window (Z = -3.8)
    const windowFrameGeo = new THREE.BoxGeometry(8, 3.4, 0.1);
    const windowGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.85,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 1.5,
      reflectivity: 0.6
    });
    const windowGlass = new THREE.Mesh(windowFrameGeo, windowGlassMat);
    windowGlass.position.set(0, 1.7, -3.8);
    scene.add(windowGlass);

    // Exterior City Skyline Backdrop outside window
    const skyBackdropGeo = new THREE.PlaneGeometry(24, 12);
    // Dynamic city backdrop texture plane
    const backdropCanvas = document.createElement('canvas');
    backdropCanvas.width = 1024;
    backdropCanvas.height = 512;
    const ctx = backdropCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      if (city === 'lagos') {
        grad.addColorStop(0, '#7dd3fc');
        grad.addColorStop(0.5, '#bae6fd');
        grad.addColorStop(1, '#0284c7');
      } else {
        grad.addColorStop(0, '#94a3b8');
        grad.addColorStop(0.5, '#cbd5e1');
        grad.addColorStop(1, '#475569');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);

      // Distant Towers Silhouettes
      ctx.fillStyle = city === 'lagos' ? '#0f766e' : '#1e293b';
      const towers = [
        { x: 50, w: 90, h: 280 },
        { x: 160, w: 120, h: 360 },
        { x: 300, w: 110, h: 420 },
        { x: 440, w: 140, h: 330 },
        { x: 610, w: 100, h: 460 },
        { x: 740, w: 130, h: 370 },
        { x: 890, w: 110, h: 290 }
      ];
      towers.forEach(t => {
        ctx.fillRect(t.x, 512 - t.h, t.w, t.h);
        // glowing window dots
        ctx.fillStyle = '#fef08a';
        for (let wy = 512 - t.h + 20; wy < 480; wy += 25) {
          for (let wx = t.x + 15; wx < t.x + t.w - 15; wx += 20) {
            ctx.fillRect(wx, wy, 8, 12);
          }
        }
        ctx.fillStyle = city === 'lagos' ? '#0f766e' : '#1e293b';
      });
    }

    const cityTex = new THREE.CanvasTexture(backdropCanvas);
    const skyMat = new THREE.MeshBasicMaterial({ map: cityTex });
    const skyBackdrop = new THREE.Mesh(skyBackdropGeo, skyMat);
    skyBackdrop.position.set(0, 3, -6.5);
    scene.add(skyBackdrop);

    // 7. Executive SEO Workstation Desk & Objects
    const interactiveMeshes: THREE.Mesh[] = [];

    // Desk Top (Large modern executive desk)
    const deskTopGeo = new THREE.BoxGeometry(2.4, 0.08, 1.1);
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x181e29, // Matte Charcoal finish
      roughness: 0.25,
      metalness: 0.3
    });
    const deskTop = new THREE.Mesh(deskTopGeo, deskMat);
    deskTop.position.set(0, 0.76, -0.6);
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    scene.add(deskTop);

    // Metal Desk Legs
    const legGeo = new THREE.BoxGeometry(0.06, 0.76, 0.9);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-1.1, 0.38, -0.6);
    leftLeg.castShadow = true;
    scene.add(leftLeg);

    const rightLeg = leftLeg.clone();
    rightLeg.position.x = 1.1;
    scene.add(rightLeg);

    // Dual Curved SEO Monitors
    // Monitor 1: Primary Organic Search Analytics Screen (Left)
    const monCanvas1 = document.createElement('canvas');
    monCanvas1.width = 512;
    monCanvas1.height = 256;
    const mctx1 = monCanvas1.getContext('2d');
    if (mctx1) {
      mctx1.fillStyle = '#090d16';
      mctx1.fillRect(0, 0, 512, 256);
      mctx1.fillStyle = '#18B892';
      mctx1.font = 'bold 22px monospace';
      mctx1.fillText(`LIVE ORGANIC SERP MATRIX [${city.toUpperCase()}]`, 24, 38);
      mctx1.fillStyle = '#64748b';
      mctx1.font = '16px monospace';
      mctx1.fillText(`HQ: ${business?.name || 'Apex Strategic Digital'}`, 24, 68);
      
      // Graph curve
      mctx1.strokeStyle = '#18B892';
      mctx1.lineWidth = 4;
      mctx1.beginPath();
      mctx1.moveTo(24, 200);
      mctx1.bezierCurveTo(120, 180, 200, 110, 320, 130);
      mctx1.lineTo(480, 85);
      mctx1.stroke();

      // Stats
      mctx1.fillStyle = '#ffffff';
      mctx1.font = 'bold 28px sans-serif';
      mctx1.fillText(`₦${(business?.current_budget || 500000).toLocaleString()}`, 24, 230);
      mctx1.fillStyle = '#10b981';
      mctx1.font = '14px monospace';
      mctx1.fillText('ENERGY: 100% · AI: OPTIMAL', 300, 230);
    }
    const monTex1 = new THREE.CanvasTexture(monCanvas1);

    const monitorGeo = new THREE.BoxGeometry(0.78, 0.46, 0.03);
    const screenMat1 = new THREE.MeshBasicMaterial({ map: monTex1 });
    const screen1 = new THREE.Mesh(monitorGeo, screenMat1);
    screen1.position.set(-0.44, 1.16, -0.75);
    screen1.rotation.y = 0.15;
    screen1.userData = { name: 'workstation' };
    scene.add(screen1);
    interactiveMeshes.push(screen1);

    // Monitor 2: Live Crawl & Keyword Inspector (Right)
    const monCanvas2 = document.createElement('canvas');
    monCanvas2.width = 512;
    monCanvas2.height = 256;
    const mctx2 = monCanvas2.getContext('2d');
    if (mctx2) {
      mctx2.fillStyle = '#0f172a';
      mctx2.fillRect(0, 0, 512, 256);
      mctx2.fillStyle = '#38bdf8';
      mctx2.font = 'bold 22px monospace';
      mctx2.fillText('CRAWL BOTTLENECKS & RANKINGS', 24, 38);
      mctx2.fillStyle = '#94a3b8';
      mctx2.font = '16px monospace';
      mctx2.fillText('Target Market: Commercial Queries', 24, 68);
      
      // Data bars
      const bars = [80, 65, 92, 45, 88, 70];
      bars.forEach((b, idx) => {
        mctx2.fillStyle = idx === 2 ? '#10b981' : '#0284c7';
        mctx2.fillRect(40 + idx * 72, 210 - b, 48, b);
      });
    }
    const monTex2 = new THREE.CanvasTexture(monCanvas2);
    const screenMat2 = new THREE.MeshBasicMaterial({ map: monTex2 });
    const screen2 = new THREE.Mesh(monitorGeo, screenMat2);
    screen2.position.set(0.44, 1.16, -0.75);
    screen2.rotation.y = -0.15;
    screen2.userData = { name: 'workstation' };
    scene.add(screen2);
    interactiveMeshes.push(screen2);

    // Monitor Stands
    const standGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.35);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const stand1 = new THREE.Mesh(standGeo, standMat);
    stand1.position.set(-0.44, 0.94, -0.78);
    scene.add(stand1);
    const stand2 = new THREE.Mesh(standGeo, standMat);
    stand2.position.set(0.44, 0.94, -0.78);
    scene.add(stand2);

    // Keyboard & Mouse
    const kbGeo = new THREE.BoxGeometry(0.46, 0.015, 0.16);
    const kbMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const keyboard = new THREE.Mesh(kbGeo, kbMat);
    keyboard.position.set(0, 0.81, -0.45);
    scene.add(keyboard);

    const mouseGeo = new THREE.BoxGeometry(0.07, 0.02, 0.11);
    const mouseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
    const mouseMesh = new THREE.Mesh(mouseGeo, mouseMat);
    mouseMesh.position.set(0.36, 0.81, -0.45);
    scene.add(mouseMesh);

    // Coffee Mug (Interactive detail)
    const mugGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.09, 12);
    const mugMat = new THREE.MeshStandardMaterial({ color: 0x18B892, roughness: 0.2 });
    const mug = new THREE.Mesh(mugGeo, mugMat);
    mug.position.set(-0.7, 0.85, -0.42);
    mug.castShadow = true;
    mug.userData = { name: 'coffee' };
    scene.add(mug);
    interactiveMeshes.push(mug);

    // Ergonomic Agency Chair
    const seatGeo = new THREE.BoxGeometry(0.55, 0.08, 0.52);
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const seat = new THREE.Mesh(seatGeo, chairMat);
    seat.position.set(0, 0.52, 0.1);
    seat.castShadow = true;
    scene.add(seat);

    const backGeo = new THREE.BoxGeometry(0.52, 0.65, 0.06);
    const back = new THREE.Mesh(backGeo, chairMat);
    back.position.set(0, 0.88, 0.35);
    scene.add(back);

    // Indoor Office Potted Plant (Corner accent)
    const potGeo = new THREE.CylinderGeometry(0.22, 0.16, 0.45, 12);
    const potMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.set(-2.2, 0.22, -1.2);
    pot.castShadow = true;
    scene.add(pot);

    for (let f = 0; f < 5; f++) {
      const leafGeo = new THREE.ConeGeometry(0.2, 0.6, 5);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(-2.2 + (Math.random() - 0.5) * 0.15, 0.65, -1.2 + (Math.random() - 0.5) * 0.15);
      leaf.rotation.z = (Math.random() - 0.5) * 0.5;
      scene.add(leaf);
    }

    // 8. Raycasting & Interaction Handlers
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);
      if (intersects.length > 0) {
        const target = intersects[0].object.userData?.name;
        if (target) {
          setHoveredObject(target);
          container.style.cursor = 'pointer';
        }
      } else {
        setHoveredObject(null);
        container.style.cursor = 'default';
      }
    };

    const onPointerClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);
      if (intersects.length > 0) {
        const target = intersects[0].object.userData?.name;
        if (target === 'workstation') {
          playSfx?.('workstation');
          onOpenWorkstation();
        } else if (target === 'coffee') {
          playSfx?.('click');
        }
      }
    };

    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('click', onPointerClick);

    // 9. Subtle Camera Breathing Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle natural posture sway
      camera.position.x = Math.sin(elapsed * 0.3) * 0.05;
      camera.position.y = 1.6 + Math.cos(elapsed * 0.25) * 0.02;
      camera.lookAt(0, 1.25, -0.6);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('click', onPointerClick);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (renderer.domElement) container.innerHTML = '';
      renderer.dispose();
    };
  }, [city, business, onOpenWorkstation, playSfx]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-700/60 bg-slate-950 shadow-2xl">
      {/* 3D Office Canvas */}
      <div 
        ref={containerRef} 
        className="w-full h-[480px] sm:h-[560px] lg:h-[620px] select-none touch-none"
      />

      {/* Fallback when WebGL is unavailable */}
      {!webglSupported && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/95 z-20 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Monitor className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-white font-bold text-base">3D WebGL Acceleration Unavailable</h4>
            <p className="text-xs text-slate-400 max-w-md font-mono">
              Hardware WebGL context is not active in this environment. All SEO strategies and operational suites are fully usable via the workstation terminal or 2D operations board.
            </p>
          </div>
          <button
            onClick={() => {
              playSfx?.('workstation');
              onOpenWorkstation();
            }}
            className="py-3 px-6 rounded-xl bg-[#18B892] hover:bg-[#15a381] text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-[#18B892]/25 cursor-pointer"
          >
            Launch Workstation Terminal
          </button>
        </div>
      )}

      {/* Floating Office Navigation HUD */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Left: Back to District & Location */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => {
              playSfx?.('click');
              onExitToDistrict();
            }}
            className="py-2 px-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>District Exterior</span>
          </button>

          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl px-3 py-1.5 hidden sm:flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-[#18B892]" />
            <span className="text-xs font-bold text-white truncate max-w-[200px]">
              {business?.name || 'Apex Strategic Digital HQ'}
            </span>
          </div>
        </div>

        {/* Right: Direct Workstation Button */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => {
              playSfx?.('workstation');
              onOpenWorkstation();
            }}
            className="py-2.5 px-4 rounded-xl bg-[#18B892] hover:bg-[#15a381] text-slate-950 font-bold text-xs tracking-wider transition shadow-lg shadow-[#18B892]/30 cursor-pointer flex items-center gap-2"
          >
            <Monitor className="w-4 h-4" />
            <span>SIT AT WORKSTATION</span>
          </button>
        </div>
      </div>

      {/* Interactive Tooltip when hovering workstation desk / screens */}
      {hoveredObject === 'workstation' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md border border-[#18B892] text-white rounded-2xl px-5 py-2.5 shadow-2xl flex items-center gap-3 animate-fadeIn pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-[#18B892] animate-ping" />
          <div>
            <span className="text-xs font-bold text-white block">SEO SPECIALIST DUAL-MONITOR RIG</span>
            <span className="text-[11px] text-emerald-400 font-mono">Click screen or desk to open live SEO suite</span>
          </div>
        </div>
      )}

      {/* Ambient Office HUD Footer */}
      <div className="absolute bottom-3 right-4 pointer-events-none hidden md:flex items-center gap-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
        <span className="flex items-center gap-1 text-emerald-400">
          <CheckCircle2 className="w-3 h-3" /> Executive Workstation Ready
        </span>
        <span>·</span>
        <span>{city === 'lagos' ? '🇳🇬 Lagos Marina Horizon' : '🇬🇧 London City Horizon'}</span>
      </div>
    </div>
  );
}
