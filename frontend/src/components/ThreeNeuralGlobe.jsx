import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function ThreeNeuralGlobe() {
  const mountRef = useRef(null);
  const canvas2dRef = useRef(null);
  const [useFallback2D, setUseFallback2D] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer;
    let scene;
    let camera;
    let globeGroup;
    let animationFrameId;

    try {
      // Test WebGL availability
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.z = 240;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, failIfMajorPerformanceCaveat: false });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
      const particleCount = 400;
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

      for (let i = 0; i < 10; i++) {
        const idx1 = Math.floor(Math.random() * particleCount) * 3;
        const idx2 = Math.floor(Math.random() * particleCount) * 3;

        const p1 = new THREE.Vector3(particlePositions[idx1], particlePositions[idx1 + 1], particlePositions[idx1 + 2]);
        const p2 = new THREE.Vector3(particlePositions[idx2], particlePositions[idx2 + 1], particlePositions[idx2 + 2]);

        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        mid.normalize().multiplyScalar(radius * 1.3);

        const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
        const points = curve.getPoints(25);
        const curveGeo = new THREE.BufferGeometry().setFromPoints(points);

        const isAnomaly = i === 0;
        const curveMat = new THREE.LineBasicMaterial({
          color: isAnomaly ? 0xe11d48 : 0x0284c7,
          transparent: true,
          opacity: isAnomaly ? 0.8 : 0.45
        });

        arcGroup.add(new THREE.Line(curveGeo, curveMat));
      }

      // Mouse Interaction
      let mouseX = 0;
      let mouseY = 0;
      let targetRotX = 0;
      let targetRotY = 0;

      const onMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouseY = -(((e.clientY - rect.top) / container.clientHeight) * 2 - 1);
      };

      container.addEventListener('mousemove', onMouseMove);

      const onResize = () => {
        if (!container || !renderer || !camera) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener('resize', onResize);

      const clock = new THREE.Clock();
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        globeGroup.rotation.y += 0.004;

        targetRotY = mouseX * 0.4;
        targetRotX = mouseY * 0.4;
        globeGroup.rotation.y += (targetRotY - globeGroup.rotation.y) * 0.05;
        globeGroup.rotation.x += (targetRotX - globeGroup.rotation.x) * 0.05;

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', onResize);
        container.removeEventListener('mousemove', onMouseMove);
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    } catch (err) {
      console.warn("WebGL not supported in current environment, rendering luxury 3D Canvas matrix fallback.", err);
      setUseFallback2D(true);
    }
  }, []);

  // 3D Canvas Fallback for software GPU / headless environments
  useEffect(() => {
    if (!useFallback2D) return;

    const canvas = canvas2dRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let angle = 0;
    const width = canvas.width = canvas.parentElement.clientWidth || 400;
    const height = canvas.height = canvas.parentElement.clientHeight || 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    // Generate 3D spherical nodes
    const nodeCount = 120;
    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      nodes.push({
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
        isAnomaly: i === 0 || i === 12 || i === 45,
        isTrusted: i % 4 === 0
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angle += 0.01;

      // Draw outer glowing rings in 3D perspective
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius * 1.05, radius * 0.35, angle * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Project 3D nodes to 2D
      const projected = nodes.map(n => {
        // Rotate around Y axis
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const rotX = n.x * cos - n.z * sin;
        const rotZ = n.x * sin + n.z * cos;

        // Perspective scale
        const fov = 300;
        const scale = fov / (fov + rotZ);
        const projX = centerX + rotX * scale;
        const projY = centerY + n.y * scale;
        const alpha = (rotZ + radius) / (2 * radius);

        return { projX, projY, scale, rotZ, alpha: Math.max(0.15, Math.min(1, alpha)), isAnomaly: n.isAnomaly, isTrusted: n.isTrusted };
      });

      // Sort by Z for proper depth ordering
      projected.sort((a, b) => a.rotZ - b.rotZ);

      // Draw connection lines
      ctx.beginPath();
      for (let i = 0; i < projected.length; i += 6) {
        const next = projected[(i + 1) % projected.length];
        ctx.moveTo(projected[i].projX, projected[i].projY);
        ctx.lineTo(next.projX, next.projY);
      }
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw 3D nodes
      projected.forEach(p => {
        ctx.beginPath();
        const nodeRadius = Math.max(1.5, 3.5 * p.scale);
        ctx.arc(p.projX, p.projY, nodeRadius, 0, Math.PI * 2);

        if (p.isAnomaly) {
          ctx.fillStyle = `rgba(225, 29, 72, ${p.alpha})`;
          ctx.shadowColor = '#e11d48';
          ctx.shadowBlur = 8;
        } else if (p.isTrusted) {
          ctx.fillStyle = `rgba(5, 150, 105, ${p.alpha})`;
          ctx.shadowColor = '#059669';
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = `rgba(2, 132, 199, ${p.alpha})`;
          ctx.shadowColor = '#0284c7';
          ctx.shadowBlur = 4;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [useFallback2D]);

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] flex items-center justify-center cursor-grab active:cursor-grabbing">
      <div ref={mountRef} className="w-full h-full" />
      
      {useFallback2D && (
        <canvas ref={canvas2dRef} className="absolute inset-0 w-full h-full" />
      )}

      {/* 3D Interactive Telemetry Overlay Badges */}
      <div className="absolute top-4 left-4 p-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-md text-[11px] font-mono text-slate-700 pointer-events-none">
        <div className="flex items-center gap-1.5 font-bold text-sky-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>3D Mesh: 450 Banking Hubs</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">Interactive Real-Time Node Lattice</div>
      </div>

      <div className="absolute bottom-4 right-4 p-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-md text-[11px] font-mono text-slate-700 pointer-events-none">
        <div className="text-[10px] text-slate-500">Anomaly Arc Detection</div>
        <div className="font-bold text-rose-600">TX-948120 Flagged (Offshore)</div>
      </div>
    </div>
  );
}
