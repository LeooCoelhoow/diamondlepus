"use client";

import { Suspense, useRef, useEffect, useState, useMemo, Component, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Center, useGLTF } from "@react-three/drei";
import * as THREE from "three";

/* ── Error boundary to catch load failures ── */
class MeshErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: any) {
    console.error("[RabbitViewer] Error caught by boundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/* ── Octahedron fallback (shown while loading or on error) ── */
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

/* ── Actual GLB mesh ── */
function RabbitMesh() {
  const meshRef = useRef<THREE.Group>(null!);
  const { scene } = useGLTF("/logo/LogoMarca3D.glb");

  const clonedScene = useMemo(() => {
    const cloned = scene.clone(true);
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // Garantir material visível e com double-sided caso o modelo do Blender esteja invertido
        mesh.material = new THREE.MeshStandardMaterial({
          color: "#d8d0f5",
          metalness: 0.6,
          roughness: 0.25,
          side: THREE.DoubleSide,
        });
      }
    });
    return cloned;
  }, [scene]);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.35;
  });

  return (
    <group ref={meshRef}>
      <primitive object={clonedScene} scale={1} />
    </group>
  );
}

useGLTF.preload("/logo/LogoMarca3D.glb");

/* ── Scene contents ── */
function SceneContents() {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 8, 5]} intensity={2.0} color="#ffffff" />
      <directionalLight position={[-5, -2, -3]} intensity={0.8} color="#a78bfa" />
      <pointLight position={[-3, 3, 2]} intensity={1.5} color="#c4b5fd" />
      <pointLight position={[3, -2, 2]} intensity={1.0} color="#7c6ef2" />

      {/* ErrorBoundary wraps the GLB attempt; Suspense shows octahedron while loading */}
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
    </>
  );
}

/* ── Main export ── */
export default function RabbitViewer() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ background: "transparent", width: "100%", height: "100%" }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "default",
        preserveDrawingBuffer: false,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <SceneContents />
    </Canvas>
  );
}
