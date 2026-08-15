"use client";

import { Suspense, useRef, useEffect, useState, Component, type ReactNode } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment, Center } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import * as THREE from "three";

/* ── Error boundary to catch 404 / load failures ── */
class MeshErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/* ── Octahedron fallback (shown while STL loads or on error) ── */
function FallbackOctahedron() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    meshRef.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[1.1, 0]} />
      <meshStandardMaterial
        color="#a78bfa"
        metalness={0.6}
        roughness={0.15}
        envMapIntensity={1.5}
      />
    </mesh>
  );
}

/* ── Actual STL mesh ── */
function RabbitMesh() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const rawGeometry = useLoader(STLLoader, "/logo/rabbit.stl");

  const [geo, setGeo] = useState<THREE.BufferGeometry | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const cloned = rawGeometry.clone();
    cloned.computeBoundingBox();
    const box = cloned.boundingBox!;
    const center = new THREE.Vector3();
    box.getCenter(center);
    cloned.translate(-center.x, -center.y, -center.z);

    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    setScale(2.2 / maxDim);

    cloned.computeVertexNormals();
    setGeo(cloned);

    return () => {
      cloned.dispose();
    };
  }, [rawGeometry]);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.35;
  });

  if (!geo) return null;

  return (
    <mesh ref={meshRef} geometry={geo} scale={scale} castShadow>
      <meshStandardMaterial
        color="#c8c0e8"
        metalness={0.3}
        roughness={0.35}
        envMapIntensity={1.5}
      />
    </mesh>
  );
}

/* ── Scene contents ── */
function SceneContents() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-3, 3, -2]} intensity={1.0} color="#a78bfa" />
      <pointLight position={[3, -2, 3]} intensity={0.5} color="#7c6ef2" />

      {/* ErrorBoundary wraps the STL attempt; Suspense shows octahedron while loading */}
      <MeshErrorBoundary fallback={<FallbackOctahedron />}>
        <Suspense fallback={<FallbackOctahedron />}>
          <Center>
            <RabbitMesh />
          </Center>
        </Suspense>
      </MeshErrorBoundary>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={(Math.PI * 3) / 4}
      />
      <Environment preset="city" />
    </>
  );
}

/* ── Main export ── */
export default function RabbitViewer() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ background: "transparent", width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <SceneContents />
    </Canvas>
  );
}
