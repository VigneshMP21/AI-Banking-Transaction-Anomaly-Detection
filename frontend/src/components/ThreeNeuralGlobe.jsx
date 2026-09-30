import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeNeuralGlobe() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer;
    let scene;
    let camera;
    let globeGroup;
    let animationFrameId;

    try {
      const width = container.clientWidth || 400;
      const height = container.clientHeight || 420;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 240;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      
      // Clean previous children if any
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(renderer.domElement);

      globeGroup = new THREE.Group();
      scene.add(globeGroup);

      // Inner Wireframe Core
      const sphereGeo = new THREE.SphereGeometry(70, 24, 24);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        wireframe: true,
        transparent: true,
        opacity: 0.12
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      globeGroup.add(sphere);

      // Particle Cloud
      const particleCount = 350;
      const particlePositions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const cyan = new THREE.Color(0x0284c7);
      const blue = new THREE.Color(0x2563eb);
      const emerald = new THREE.Color(0x059669);
      const rose = new THREE.Color(0xe11d48);

      const radius = 72;
      for (let i = 0; i < particleCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / particleCount);
        const theta = Math.sqrt(particleCount * Math.PI) * phi;

        const x = radius * Math.cos(theta) * Math.sin(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(phi);

        particlePositions[i * 3] = x;
        particlePositions[i * 3 + 1] = y;
        particlePositions[i * 3 + 2] = z;

        const r = Math.random();
        const c = r > 0.88 ? rose : r > 0.65 ? emerald : r > 0.35 ? cyan : blue;
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }

      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const particleMat = new THREE.PointsMaterial({
        size: 3.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.85
      });

      const particles = new THREE.Points(particleGeo, particleMat);
      globeGroup.add(particles);

      // Curved Transaction Arcs
      const arcGroup = new THREE.Group();
      globeGroup.add(arcGroup);

      for (let i = 0; i < 8; i++) {
        const idx1 = Math.floor(Math.random() * particleCount) * 3;
        const idx2 = Math.floor(Math.random() * particleCount) * 3;

        const p1 = new THREE.Vector3(particlePositions[idx1], particlePositions[idx1 + 1], particlePositions[idx1 + 2]);
        const p2 = new THREE.Vector3(particlePositions[idx2], particlePositions[idx2 + 1], particlePositions[idx2 + 2]);

        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        mid.normalize().multiplyScalar(radius * 1.25);

        const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
        const points = curve.getPoints(24);
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

        const isAnomalyArc = i === 0 || i === 3;
        const lineMat = new THREE.LineBasicMaterial({
          color: isAnomalyArc ? 0xe11d48 : 0x38bdf8,
          transparent: true,
          opacity: isAnomalyArc ? 0.9 : 0.45,
          linewidth: isAnomalyArc ? 2 : 1
        });

        const line = new THREE.Line(lineGeo, lineMat);
        arcGroup.add(line);
      }

      // Handle Resize
      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const w = container.clientWidth || 400;
        const h = container.clientHeight || 420;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      // Drag Rotation
      let isDragging = false;
      let prevMousePos = { x: 0, y: 0 };

      const onMouseDown = (e) => {
        isDragging = true;
        prevMousePos = { x: e.clientX, y: e.clientY };
      };

      const onMouseMove = (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
        globeGroup.rotation.y += deltaX * 0.006;
        globeGroup.rotation.x += deltaY * 0.006;
        prevMousePos = { x: e.clientX, y: e.clientY };
      };

      const onMouseUp = () => {
        isDragging = false;
      };

      container.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      // Animation Loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        if (!isDragging) {
          globeGroup.rotation.y += 0.0025;
          globeGroup.rotation.x += 0.0006;
        }
        renderer.render(scene, camera);
      };
      animate();

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        container.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    } catch (e) {
      console.warn('WebGL initialization fallback: ', e);
    }
  }, []);

  return (
    <div className="relative w-full h-[380px] sm:h-[440px] flex items-center justify-center cursor-grab active:cursor-grabbing">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* 3D Telemetry Overlay Badges */}
      <div className="absolute top-4 left-4 p-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-md text-[11px] font-mono text-slate-700 pointer-events-none">
        <div className="flex items-center gap-1.5 font-bold text-sky-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>3D Mesh: 350 Global Banking Hubs</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">Real-Time Neural Node Matrix</div>
      </div>

      <div className="absolute bottom-4 right-4 p-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-md text-[11px] font-mono text-slate-700 pointer-events-none">
        <div className="text-[10px] text-slate-500">Live Arc Anomaly</div>
        <div className="font-bold text-rose-600">TX-948120 Flagged (Offshore)</div>
      </div>
    </div>
  );
}
