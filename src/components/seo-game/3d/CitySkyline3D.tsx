import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Sun, Sunset, Navigation, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import { CityEnvironment } from '../../../hooks/useEnvironmentalAudio';

interface CitySkyline3DProps {
  city: CityEnvironment;
  timeOfDay?: 'day' | 'golden_hour';
  onEnterOffice?: () => void;
  onSelectBuilding?: (buildingName: string) => void;
  playSfx?: (type: 'click' | 'confirm') => void;
}

export function CitySkyline3D({
  city,
  timeOfDay = 'day',
  onEnterOffice,
  onSelectBuilding,
  playSfx
}: CitySkyline3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [currentTime, setCurrentTime] = useState<'day' | 'golden_hour'>(timeOfDay);
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const vehiclesRef = useRef<{ mesh: THREE.Group; speed: number; direction: number; zBound: number }[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Verify WebGL support
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
    const height = container.clientHeight || 500;

    // 1. Scene & Atmosphere Fog
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const skyColor = currentTime === 'day' 
      ? (city === 'lagos' ? 0xd6eaf8 : 0xd5dbdb) 
      : (city === 'lagos' ? 0xfed7aa : 0xfbcfe8);
    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.FogExp2(skyColor, city === 'lagos' ? 0.008 : 0.01);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 48, 110);
    camera.lookAt(0, 16, 0);
    cameraRef.current = camera;

    // 3. Renderer with High-Fidelity Tone Mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = currentTime === 'day' ? 1.05 : 0.85;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(
      currentTime === 'day' ? 0xffffff : 0xffeedd, 
      currentTime === 'day' ? 0.85 : 0.6
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(
      currentTime === 'day' ? 0xfff8e7 : 0xffaa55, 
      currentTime === 'day' ? 1.4 : 1.1
    );
    sunLight.position.set(city === 'lagos' ? 80 : 50, 120, 70);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 300;
    const shadowD = 90;
    sunLight.shadow.camera.left = -shadowD;
    sunLight.shadow.camera.right = shadowD;
    sunLight.shadow.camera.top = shadowD;
    sunLight.shadow.camera.bottom = -shadowD;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // 5. Ground Plane & Plaza Pavement
    const groundGeo = new THREE.PlaneGeometry(350, 350);
    const groundMat = new THREE.MeshStandardMaterial({
      color: city === 'lagos' ? 0x2b3a4a : 0x334155,
      roughness: 0.85,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 6. Roads & Intersections
    const roadWidth = 18;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, 280);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });
    
    // Main dual-carriageway (Z axis)
    const mainRoad = new THREE.Mesh(roadGeo, roadMat);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.set(0, 0.05, 0);
    mainRoad.receiveShadow = true;
    scene.add(mainRoad);

    // Road divider (median strip with grass/curb)
    const medianGeo = new THREE.BoxGeometry(1.6, 0.3, 280);
    const medianMat = new THREE.MeshStandardMaterial({
      color: city === 'lagos' ? 0x166534 : 0x475569,
      roughness: 0.8
    });
    const median = new THREE.Mesh(medianGeo, medianMat);
    median.position.set(0, 0.15, 0);
    scene.add(median);

    // White dashed lane markings
    for (let z = -130; z < 130; z += 12) {
      const dashGeo = new THREE.PlaneGeometry(0.3, 5);
      const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      
      const leftDash = new THREE.Mesh(dashGeo, dashMat);
      leftDash.rotation.x = -Math.PI / 2;
      leftDash.position.set(-5, 0.08, z);
      scene.add(leftDash);

      const rightDash = new THREE.Mesh(dashGeo, dashMat);
      rightDash.rotation.x = -Math.PI / 2;
      rightDash.position.set(5, 0.08, z);
      scene.add(rightDash);
    }

    // 7. Architectural Towers
    const buildingList: THREE.Group[] = [];
    const interactiveMeshes: THREE.Mesh[] = [];

    // Helper: Build Architectural Skyscraper
    const createTower = (
      name: string,
      x: number,
      z: number,
      w: number,
      h: number,
      d: number,
      facadeColor: number,
      glassColor: number,
      isPlayerHQ = false
    ) => {
      const group = new THREE.Group();
      group.name = name;
      group.position.set(x, 0, z);

      // Main Tower Body
      const bodyGeo = new THREE.BoxGeometry(w, h, d);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: facadeColor,
        roughness: 0.4,
        metalness: 0.65
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = h / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      body.userData = { name, isPlayerHQ };
      group.add(body);
      interactiveMeshes.push(body);

      // Glass Curtain Facade Grid Lines
      const windowRows = Math.floor(h / 3);
      for (let r = 1; r < windowRows; r++) {
        const bandGeo = new THREE.BoxGeometry(w + 0.15, 0.25, d + 0.15);
        const bandMat = new THREE.MeshStandardMaterial({
          color: glassColor,
          roughness: 0.2,
          metalness: 0.8
        });
        const band = new THREE.Mesh(bandGeo, bandMat);
        band.position.y = r * 3;
        group.add(band);
      }

      // Rooftop Architectural Crown / Helipad / Spire
      if (isPlayerHQ) {
        // Penthouse Suite Crown
        const crownGeo = new THREE.BoxGeometry(w * 0.8, 4, d * 0.8);
        const crownMat = new THREE.MeshStandardMaterial({ color: 0x18B892, roughness: 0.3, metalness: 0.5 });
        const crown = new THREE.Mesh(crownGeo, crownMat);
        crown.position.y = h + 2;
        group.add(crown);

        // Antenna / Telecommunications Spire
        const spireGeo = new THREE.CylinderGeometry(0.15, 0.4, 14, 8);
        const spireMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.2 });
        const spire = new THREE.Mesh(spireGeo, spireMat);
        spire.position.y = h + 11;
        group.add(spire);

        // Beacon light
        const beaconGeo = new THREE.SphereGeometry(0.6, 8, 8);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.y = h + 18;
        group.add(beacon);
      } else {
        const roofRoofGeo = new THREE.BoxGeometry(w * 0.6, 3, d * 0.6);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
        const roofBox = new THREE.Mesh(roofRoofGeo, roofMat);
        roofBox.position.y = h + 1.5;
        group.add(roofBox);
      }

      scene.add(group);
      buildingList.push(group);
      return group;
    };

    if (city === 'lagos') {
      // LAGOS VICTORIA ISLAND & MARINA FINANCIAL ARCHITECTURE
      // Player HQ (Central Grade-A Digital Tower)
      createTower('Apex Strategic HQ (Penthouse Agency)', -26, -10, 22, 62, 22, 0x0f766e, 0x5eead4, true);

      // Surrounding Nigerian Commercial Towers
      createTower('Victoria Commercial Search Exchange', 26, -15, 24, 75, 24, 0x1e3a8a, 0x93c5fd);
      createTower('Flutterwave Merchant Financial Tower', -32, 38, 20, 50, 20, 0x4338ca, 0x818cf8);
      createTower('MTN Telecommunications High-Rise', 30, 42, 22, 58, 22, 0xb45309, 0xfde047);
      createTower('Eko Atlantic Maritime Tech Center', -28, -65, 26, 80, 26, 0x0369a1, 0x38bdf8);
      createTower('Dangote Industrial Commercial Tower', 28, -70, 28, 90, 26, 0x334155, 0x94a3b8);
      createTower('PwC Nigeria Advisory Tower', -55, 5, 20, 45, 20, 0x991b1b, 0xf87171);
      createTower('FirstBank Marina Corporate Center', 55, 0, 22, 48, 22, 0x1e293b, 0x38bdf8);

      // Tropical Landscaping (Palm Trees along road median & curbs)
      for (let z = -90; z < 90; z += 28) {
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 6, 6);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
        const leftTrunk = new THREE.Mesh(trunkGeo, trunkMat);
        leftTrunk.position.set(-11, 3, z);
        scene.add(leftTrunk);

        const frondsGeo = new THREE.ConeGeometry(3, 2, 6);
        const frondsMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
        const leftFronds = new THREE.Mesh(frondsGeo, frondsMat);
        leftFronds.position.set(-11, 6.5, z);
        scene.add(leftFronds);

        const rightTrunk = leftTrunk.clone();
        rightTrunk.position.set(11, 3, z + 14);
        scene.add(rightTrunk);
        const rightFronds = leftFronds.clone();
        rightFronds.position.set(11, 6.5, z + 14);
        scene.add(rightFronds);
      }
    } else {
      // LONDON FINANCIAL DISTRICT & CANARY WHARF ARCHITECTURE
      // Player HQ (Canary Wharf Executive Agency Suite)
      createTower('Apex Strategic London (Canary Wharf Suite)', -26, -10, 22, 68, 22, 0x047857, 0x34d399, true);

      // Surrounding City of London & Docklands High-Rises
      createTower('Bank of England International SERP Exchange', 26, -15, 26, 85, 26, 0x334155, 0x94a3b8);
      createTower('One Canada Square Commercial Tower', -32, 40, 24, 96, 24, 0x1e293b, 0x64748b);
      createTower('Broadgate Search Intelligence Centre', 30, 42, 22, 60, 22, 0x1e3a8a, 0xbfdbfe);
      createTower('Leadenhall Global Financial Plaza', -28, -65, 24, 78, 24, 0x0f172a, 0x38bdf8);
      createTower('HSBC European Operations Center', 28, -70, 26, 88, 24, 0xd97706, 0xfde68a);
      createTower('Bishopsgate Digital Agency Hub', -55, 5, 20, 52, 20, 0x475569, 0x94a3b8);
      createTower('Fenchurch Commercial Observatory', 55, 0, 22, 56, 22, 0x1e293b, 0x64748b);
    }

    // 8. Dynamic Animated 3D Vehicles (Moving Traffic)
    const vehicles: { mesh: THREE.Group; speed: number; direction: number; zBound: number }[] = [];

    // Helper: Create Danfo Bus (Lagos yellow with green stripe) or Double-Decker (London red)
    const createTransitBus = (type: 'danfo' | 'london_bus', zPos: number, laneX: number, dir: number) => {
      const busGroup = new THREE.Group();
      busGroup.position.set(laneX, 0, zPos);

      if (type === 'danfo') {
        // Yellow Volkswagen/Toyota Transporter Danfo Bus
        const busBodyGeo = new THREE.BoxGeometry(2.4, 2.2, 5.2);
        const busBodyMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 }); // Iconic Yellow
        const body = new THREE.Mesh(busBodyGeo, busBodyMat);
        body.position.y = 1.3;
        body.castShadow = true;
        busGroup.add(body);

        // Characteristic Horizontal Green Stripe
        const stripeGeo = new THREE.BoxGeometry(2.45, 0.35, 5.25);
        const stripeMat = new THREE.MeshStandardMaterial({ color: 0x15803d }); // Green stripe
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.y = 1.25;
        busGroup.add(stripe);

        // Windows
        const winGeo = new THREE.BoxGeometry(2.46, 0.6, 4.4);
        const winMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1, metalness: 0.9 });
        const win = new THREE.Mesh(winGeo, winMat);
        win.position.y = 1.75;
        busGroup.add(win);
      } else {
        // Iconic London Red Double-Decker Bus
        const busBodyGeo = new THREE.BoxGeometry(2.6, 4.2, 7.8);
        const busBodyMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 }); // London Red
        const body = new THREE.Mesh(busBodyGeo, busBodyMat);
        body.position.y = 2.3;
        body.castShadow = true;
        busGroup.add(body);

        // Upper & Lower Windows
        const winGeo = new THREE.BoxGeometry(2.65, 0.8, 6.8);
        const winMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });
        const lowerWin = new THREE.Mesh(winGeo, winMat);
        lowerWin.position.y = 1.8;
        busGroup.add(lowerWin);

        const upperWin = new THREE.Mesh(winGeo, winMat);
        upperWin.position.y = 3.2;
        busGroup.add(upperWin);
      }

      // Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 12);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
      [-1.8, 1.8].forEach(wz => {
        [-1.15, 1.15].forEach(wx => {
          const wheel = new THREE.Mesh(wheelGeo, wheelMat);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(wx, 0.45, wz);
          busGroup.add(wheel);
        });
      });

      // Headlights & Taillights
      const headGeo = new THREE.SphereGeometry(0.2, 8, 8);
      const headMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const hl1 = new THREE.Mesh(headGeo, headMat);
      hl1.position.set(-0.8, 0.9, dir > 0 ? 2.6 : -2.6);
      const hl2 = hl1.clone();
      hl2.position.x = 0.8;
      busGroup.add(hl1);
      busGroup.add(hl2);

      scene.add(busGroup);
      vehicles.push({
        mesh: busGroup,
        speed: 0.35 + Math.random() * 0.15,
        direction: dir,
        zBound: 130
      });
    };

    // Helper: Create Standard Car / SUV / London Black Cab
    const createCar = (type: 'car' | 'suv' | 'cab', zPos: number, laneX: number, dir: number) => {
      const carGroup = new THREE.Group();
      carGroup.position.set(laneX, 0, zPos);

      const color = type === 'cab' 
        ? 0x0f172a 
        : (type === 'suv' ? 0x1e293b : [0xffffff, 0x94a3b8, 0x2563eb, 0x475569][Math.floor(Math.random() * 4)]);

      const bodyHeight = type === 'suv' ? 1.6 : 1.2;
      const bodyLength = type === 'suv' ? 4.4 : 4.0;
      const carGeo = new THREE.BoxGeometry(1.9, bodyHeight, bodyLength);
      const carMat = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.6 });
      const body = new THREE.Mesh(carGeo, carMat);
      body.position.y = bodyHeight / 2 + 0.3;
      body.castShadow = true;
      carGroup.add(body);

      // Cabin / Roof
      const cabinGeo = new THREE.BoxGeometry(1.7, bodyHeight * 0.7, bodyLength * 0.55);
      const cabinMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1, metalness: 0.9 });
      const cabin = new THREE.Mesh(cabinGeo, cabinMat);
      cabin.position.y = bodyHeight + 0.2;
      carGroup.add(cabin);

      // Taxi roof light if cab
      if (type === 'cab') {
        const taxiSign = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.2, 0.3),
          new THREE.MeshBasicMaterial({ color: 0xf59e0b })
        );
        taxiSign.position.y = bodyHeight + 0.7;
        carGroup.add(taxiSign);
      }

      scene.add(carGroup);
      vehicles.push({
        mesh: carGroup,
        speed: 0.45 + Math.random() * 0.2,
        direction: dir,
        zBound: 130
      });
    };

    // Populate Lanes with Realistic Traffic Mix
    if (city === 'lagos') {
      // Lane 1 (Southbound: x = -5)
      createTransitBus('danfo', -60, -5, 1);
      createCar('suv', -15, -5, 1);
      createTransitBus('danfo', 30, -5, 1);
      createCar('car', 75, -5, 1);

      // Lane 2 (Northbound: x = 5)
      createCar('car', -45, 5, -1);
      createTransitBus('danfo', 0, 5, -1);
      createCar('suv', 45, 5, -1);
      createCar('car', 90, 5, -1);
    } else {
      // London Traffic: Double Deckers, Black Cabs, Executive Sedans
      // Lane 1 (Southbound: x = -5)
      createTransitBus('london_bus', -70, -5, 1);
      createCar('cab', -20, -5, 1);
      createCar('car', 35, -5, 1);
      createTransitBus('london_bus', 80, -5, 1);

      // Lane 2 (Northbound: x = 5)
      createCar('cab', -50, 5, -1);
      createCar('car', -5, 5, -1);
      createTransitBus('london_bus', 40, 5, -1);
      createCar('cab', 95, 5, -1);
    }
    vehiclesRef.current = vehicles;

    // 9. Raycasting for Building Hover and Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const bName = hit.userData?.name;
        if (bName) {
          setHoveredBuilding(bName);
          container.style.cursor = 'pointer';
        }
      } else {
        setHoveredBuilding(null);
        container.style.cursor = 'default';
      }
    };

    const onPointerClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        playSfx?.('confirm');
        if (hit.userData?.isPlayerHQ && onEnterOffice) {
          onEnterOffice();
        } else if (onSelectBuilding && hit.userData?.name) {
          onSelectBuilding(hit.userData.name);
        }
      }
    };

    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('click', onPointerClick);

    // 10. Animation Loop: Traffic Movement & Camera Subtle Orbit
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Update vehicle positions along road
      for (let i = 0; i < vehiclesRef.current.length; i++) {
        const v = vehiclesRef.current[i];
        v.mesh.position.z += v.speed * v.direction;

        // Wrap around road boundaries
        if (v.direction > 0 && v.mesh.position.z > v.zBound) {
          v.mesh.position.z = -v.zBound;
        } else if (v.direction < 0 && v.mesh.position.z < -v.zBound) {
          v.mesh.position.z = v.zBound;
        }
      }

      // Subtle dynamic camera float
      const elapsed = clock.getElapsedTime();
      camera.position.x = Math.sin(elapsed * 0.12) * 6;
      camera.lookAt(0, 16, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
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
  }, [city, currentTime, onEnterOffice, onSelectBuilding, playSfx]);

  const toggleDaylight = () => {
    playSfx?.('click');
    setCurrentTime(prev => (prev === 'day' ? 'golden_hour' : 'day'));
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-700/60 bg-slate-950 shadow-2xl">
      {/* 3D WebGL Canvas Viewport */}
      <div 
        ref={containerRef} 
        className="w-full h-[460px] sm:h-[540px] lg:h-[600px] select-none touch-none"
      />

      {/* Fallback when WebGL is unavailable */}
      {!webglSupported && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/95 z-20 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Sun className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-white font-bold text-base">3D WebGL Acceleration Unavailable</h4>
            <p className="text-xs text-slate-400 max-w-md font-mono">
              Hardware WebGL rendering is disabled on this device. The commercial district remains fully accessible via the 2D directory view.
            </p>
          </div>
          {onEnterOffice && (
            <button
              onClick={onEnterOffice}
              className="py-3 px-6 rounded-xl bg-[#18B892] hover:bg-[#15a381] text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-[#18B892]/25 cursor-pointer"
            >
              Enter Agency Headquarters Suite
            </button>
          )}
        </div>
      )}

      {/* Floating City HUD & Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Left: Current Environment Badge */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl px-3.5 py-2 flex items-center gap-2.5 shadow-lg">
          <div className={`w-3 h-3 rounded-full animate-pulse ${city === 'lagos' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
              {city === 'lagos' ? 'AFRICAN COMMERCIAL DISTRICT' : 'WESTERN COMMERCIAL DISTRICT'}
            </span>
            <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <span>{city === 'lagos' ? '🇳🇬 Lagos (Victoria Island & Marina)' : '🇬🇧 London (Canary Wharf & City)'}</span>
            </span>
          </div>
        </div>

        {/* Right: Lighting Mode & Enter Office Button */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={toggleDaylight}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-slate-200 transition cursor-pointer flex items-center gap-1.5 text-xs font-mono"
            title={currentTime === 'day' ? 'Switch to Golden Hour' : 'Switch to High Daylight'}
          >
            {currentTime === 'day' ? <Sun className="w-4 h-4 text-amber-400" /> : <Sunset className="w-4 h-4 text-orange-400" />}
            <span className="hidden sm:inline">{currentTime === 'day' ? 'Daylight 12:00' : 'Golden Hour 17:30'}</span>
          </button>

          {onEnterOffice && (
            <button
              onClick={() => {
                playSfx?.('confirm');
                onEnterOffice();
              }}
              className="py-2 px-4 rounded-xl bg-[#18B892] hover:bg-[#15a381] text-slate-950 font-bold text-xs tracking-wider transition shadow-lg shadow-[#18B892]/25 cursor-pointer flex items-center gap-1.5"
            >
              <span>ENTER AGENCY SUITE</span>
              <Navigation className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Hovered Building Tooltip Spotlight */}
      {hoveredBuilding && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md border border-[#18B892]/50 text-white rounded-xl px-4 py-2 shadow-2xl flex items-center gap-2 animate-fadeIn pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-[#18B892] animate-ping" />
          <span className="text-xs font-bold font-mono tracking-wide">{hoveredBuilding}</span>
          <span className="text-[10px] text-emerald-400 font-semibold uppercase">· Click to Enter / Inspect</span>
        </div>
      )}

      {/* Bottom Environmental Info Bar */}
      <div className="absolute bottom-3 right-4 pointer-events-none hidden md:flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-slate-900/70 px-2.5 py-1 rounded-lg border border-slate-800">
        <span>3D WebGL Realtime Engine</span>
        <span>·</span>
        <span>{city === 'lagos' ? 'Danfo Transit & Marina Towers' : 'Double-Decker Transit & Canary Wharf'}</span>
      </div>
    </div>
  );
}
