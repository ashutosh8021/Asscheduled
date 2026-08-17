"use client";

/* V2 hero scene — a slowly turning wireframe globe with the Season 01 campuses
   lit as nodes and a glowing network between them.

   Deliberately abstract: the arcs are a network, not an itinerary. Boarding
   hubs and routes are open items (CLAUDE.md), so nothing here claims one.
   Campus coordinates are real public geography.

   This module is only ever reached through a dynamic import in SceneMount,
   after hydration and after a capability check — three.js never lands in the
   initial bundle. */

import { useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";

/* Supplied palette. The page behind this canvas is Gochujang Red and the
   canvas is transparent, so red needs no help here: Blaze and Varden do all
   the glowing, Cosmos is the globe body and the cool stars, and Gochujang is
   left to the page itself. Additive blending would swallow it anyway. */
const BLAZE = "#c1b21f";
const VARDEN = "#fee0d5";
const COSMOS = "#002f49";

const GLOBE_R = 2;

/* Real coordinates for the four Season 01 campuses. */
const CAMPUSES: { lat: number; lon: number; color: string }[] = [
  { lat: 28.5672, lon: 77.21, color: BLAZE },   // AIIMS Delhi   — PUL-01
  { lat: 28.545, lon: 77.1926, color: VARDEN }, // IIT Delhi     — REN-02
  { lat: 26.5123, lon: 80.2329, color: BLAZE }, // IIT Kanpur    — ANT-03
  { lat: 28.3639, lon: 75.5877, color: VARDEN },// BITS Pilani   — OAS-04
];

/** Lat/long in degrees to a point on a sphere of radius r. */
function geo(latDeg: number, lonDeg: number, r: number): THREE.Vector3 {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  return new THREE.Vector3(
    r * Math.cos(lat) * Math.cos(lon),
    r * Math.sin(lat),
    -r * Math.cos(lat) * Math.sin(lon)
  );
}

/** Arc bulging away from the surface between two points on the globe. */
function arcCurve(a: THREE.Vector3, b: THREE.Vector3): THREE.QuadraticBezierCurve3 {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const lift = 1 + a.distanceTo(b) * 0.28;
  mid.normalize().multiplyScalar(GLOBE_R * lift);
  return new THREE.QuadraticBezierCurve3(a, mid, b);
}

function Globe({ scroll, quality }: { scroll: RefObject<number>; quality: number }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const nodes = useMemo(
    () => CAMPUSES.map((c) => ({ pos: geo(c.lat, c.lon, GLOBE_R), color: c.color })),
    []
  );

  /* Every campus pair, so the network reads as a mesh rather than a path. */
  const arcs = useMemo(() => {
    const out: { curve: THREE.QuadraticBezierCurve3; geometry: THREE.TubeGeometry; color: string }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const curve = arcCurve(nodes[i].pos, nodes[j].pos);
        out.push({
          curve,
          geometry: new THREE.TubeGeometry(curve, 48, 0.008, 6, false),
          color: j % 2 === 0 ? BLAZE : VARDEN,
        });
      }
    }
    return out;
  }, [nodes]);

  const travellers = useRef<THREE.Mesh[]>([]);

  useFrame((state, delta) => {
    if (!group.current) return;

    /* Slow constant turn, plus a scroll-driven push so the globe reacts to
       the page rather than looping obliviously. */
    group.current.rotation.y += delta * 0.075 + scroll.current * delta * 0.5;

    /* Pointer parallax, eased. */
    pointer.current.x += (state.pointer.x - pointer.current.x) * 0.04;
    pointer.current.y += (state.pointer.y - pointer.current.y) * 0.04;
    group.current.rotation.x = -0.18 + pointer.current.y * 0.16;
    group.current.position.x = pointer.current.x * 0.22;

    /* Dots running the arcs — the only literal "travel" cue in the scene. */
    const t = state.clock.elapsedTime;
    travellers.current.forEach((mesh, i) => {
      if (!mesh) return;
      const arc = arcs[i % arcs.length];
      const p = arc.curve.getPointAt(((t * 0.16 + i * 0.17) % 1 + 1) % 1);
      mesh.position.copy(p);
    });
  });

  return (
    <group ref={group} rotation={[-0.18, 0, 0.12]}>
      {/* Wireframe shell */}
      <mesh>
        <sphereGeometry args={[GLOBE_R, quality > 1 ? 40 : 26, quality > 1 ? 28 : 18]} />
        <meshBasicMaterial
          color={VARDEN}
          wireframe
          transparent
          opacity={0.11}
          depthWrite={false}
        />
      </mesh>

      {/* Inner body, so the far side of the wireframe reads as behind */}
      <mesh>
        <sphereGeometry args={[GLOBE_R * 0.985, 32, 24]} />
        <meshBasicMaterial color={COSMOS} transparent opacity={0.9} />
      </mesh>

      {/* Campus nodes */}
      {nodes.map((n, i) => (
        <mesh key={i} position={n.pos}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshBasicMaterial color={n.color} toneMapped={false} />
        </mesh>
      ))}

      {/* Network */}
      {arcs.map((a, i) => (
        <mesh key={i} geometry={a.geometry}>
          <meshBasicMaterial
            color={a.color}
            transparent
            opacity={0.55}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Travelling dots */}
      {arcs.map((_, i) => (
        <mesh
          key={`t${i}`}
          ref={(el) => {
            if (el) travellers.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshBasicMaterial
            color={BLAZE}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function Starfield({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const a = new THREE.Color(VARDEN);
    const b = new THREE.Color(COSMOS);
    const c = new THREE.Color(BLAZE);

    for (let i = 0; i < count; i++) {
      /* Shell, so nothing sits inside the globe. */
      const r = 4.5 + Math.random() * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.6;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const pick = Math.random();
      const col = pick < 0.55 ? a : pick < 0.85 ? c : b;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [count]);

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.012;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.032}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/** Camera eases toward the globe as the hero scrolls away. */
function Rig({ scroll }: { scroll: RefObject<number> }) {
  useFrame((state, delta) => {
    const target = 6.2 - scroll.current * 2.1;
    state.camera.position.z += (target - state.camera.position.z) * Math.min(1, delta * 2.4);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Scene({
  scroll,
  starCount,
}: {
  scroll: RefObject<number>;
  starCount: number;
}) {
  /* Start conservative and let the monitor earn the extra pixels. */
  const [dpr, setDpr] = useState(1.25);
  const [quality, setQuality] = useState(1);

  return (
    <Canvas
      dpr={dpr}
      gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
      camera={{ position: [0, 0.5, 6.2], fov: 42 }}
      /* The canvas is decoration; the page never waits on it. */
      frameloop="always"
    >
      <PerformanceMonitor
        onIncline={() => {
          setDpr(Math.min(2, window.devicePixelRatio));
          setQuality(2);
        }}
        onDecline={() => {
          setDpr(1);
          setQuality(1);
        }}
      />
      <Starfield count={starCount} />
      <Globe scroll={scroll} quality={quality} />
      <Rig scroll={scroll} />
    </Canvas>
  );
}
