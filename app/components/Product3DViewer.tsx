"use client";

import {
  Suspense,
  useRef,
  useState,
  useMemo,
  useEffect,
  useCallback,
  Component,
  type ReactNode,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Center, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

/* ── Error boundary to catch WebGL / load errors gracefully ── */
class ModelErrorBoundary extends Component<
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
    console.warn("[Product3DViewer] Error caught by boundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/* ── Fallback 3D wireframe while loading or on error ── */
function Fallback3DPlaceholder() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.8;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[1.2, 0]} />
      <meshStandardMaterial
        color="#a78bfa"
        wireframe
        emissive="#7c6ef2"
        emissiveIntensity={0.6}
        roughness={0.2}
      />
    </mesh>
  );
}

/* ── Single GLB Mesh Renderer ── */
interface ModelMeshProps {
  modelUrl: string;
}

function ModelMesh({ modelUrl }: ModelMeshProps) {
  const { scene } = useGLTF(modelUrl);

  const clonedScene = useMemo(() => {
    const cloned = scene.clone(true);
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          mat.side = THREE.DoubleSide;
          mat.needsUpdate = true;
          mesh.material = mat;
        }
      }
    });
    return cloned;
  }, [scene]);

  return <primitive object={clonedScene} />;
}

/* ── Preload GLB models for instant switching ── */
useGLTF.preload("/products/disup/Disup-branco.glb");
useGLTF.preload("/products/disup/Disup-preto.glb");

/* ── Inner 3D Scene ── */
interface SceneProps {
  modelUrl: string;
  isInteracting: boolean;
  setIsInteracting: (val: boolean) => void;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

function SceneContents({
  modelUrl,
  isInteracting,
  setIsInteracting,
  controlsRef,
}: SceneProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-rotation when user is not manually rotating
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (!isInteracting) {
      groupRef.current.rotation.y += delta * 0.45;
    }
  });

  const handleStart = useCallback(() => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    setIsInteracting(true);
  }, [setIsInteracting]);

  const handleEnd = useCallback(() => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 1800);
  }, [setIsInteracting]);

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  return (
    <>
      {/* Studio Lighting tuned for PLA 3D Prints */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[4, 6, 4]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-4, 2, -2]} intensity={1.2} color="#e0e7ff" />
      <directionalLight position={[0, -3, 3]} intensity={0.9} color="#93c5fd" />
      <pointLight position={[0, 4, -4]} intensity={2.5} color="#a78bfa" />
      <pointLight position={[3, -2, 2]} intensity={1.2} color="#7c6ef2" />

      {/* Model with dynamic centering and scaling */}
      <ModelErrorBoundary fallback={<Fallback3DPlaceholder />}>
        <Suspense fallback={<Fallback3DPlaceholder />}>
          <group ref={groupRef}>
            <Center scale={0.016}>
              <ModelMesh key={modelUrl} modelUrl={modelUrl} />
            </Center>
          </group>
        </Suspense>
      </ModelErrorBoundary>

      {/* Interactive Controls (Smooth Orbit, bounded rotation) */}
      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.8}
        dampingFactor={0.08}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={(Math.PI * 5) / 6}
        onStart={handleStart}
        onEnd={handleEnd}
      />
    </>
  );
}

/* ── Main Product3DViewer Component ── */
export interface Product3DViewerProps {
  activeColor: "branco" | "preto";
  onColorChange?: (color: "branco" | "preto") => void;
  badge?: string;
}

export default function Product3DViewer({
  activeColor,
  onColorChange,
  badge = "Personalizável",
}: Product3DViewerProps) {
  const [isInteracting, setIsInteracting] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const modelPath =
    activeColor === "preto"
      ? "/products/disup/Disup-preto.glb"
      : "/products/disup/Disup-branco.glb";

  const handleInteractionStart = () => {
    setIsInteracting(true);
    setHasInteracted(true);
  };

  const handleResetView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div
      className="product-3d-wrapper"
      onPointerDown={handleInteractionStart}
    >
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0.35, 4.2], fov: 42 }}
        dpr={[1, 1.5]}
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <SceneContents
          modelUrl={modelPath}
          isInteracting={isInteracting}
          setIsInteracting={setIsInteracting}
          controlsRef={controlsRef}
        />
      </Canvas>

      {/* Top Badges */}
      <div className="product-3d-badges">
        <span className="product-3d-badge-model">
          <span className="product-3d-dot" aria-hidden="true" />
          3D • 360°
        </span>
        {badge && <span className="card-badge">{badge}</span>}
      </div>

      {/* Bottom Color Switcher Pills & Rotate Hint */}
      <div className="product-3d-controls">
        <div
          className="product-3d-color-picker"
          role="group"
          aria-label="Selecionar cor do modelo 3D"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className={`color-pill ${activeColor === "branco" ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onColorChange?.("branco");
            }}
            aria-label="Ver DISUP na cor Branca"
            title="DISUP Branco"
          >
            <span
              className="color-dot"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)",
                border: "1px solid rgba(255, 255, 255, 0.4)",
              }}
            />
            <span className="color-label">Branco</span>
          </button>

          <button
            type="button"
            className={`color-pill ${activeColor === "preto" ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onColorChange?.("preto");
            }}
            aria-label="Ver DISUP na cor Preta"
            title="DISUP Preto"
          >
            <span
              className="color-dot"
              style={{
                background: "linear-gradient(135deg, #2e2e38 0%, #0d0d12 100%)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            />
            <span className="color-label">Preto</span>
          </button>
        </div>

        {/* 360 Rotate Hint or Reset button */}
        <div className="product-3d-hint-area">
          {hasInteracted ? (
            <button
              type="button"
              className="product-3d-reset-btn"
              onClick={handleResetView}
              title="Restaurar ângulo inicial"
              aria-label="Restaurar ângulo inicial do 3D"
            >
              ⟲ Resetar visão
            </button>
          ) : (
            <span className="product-3d-hint">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              Arraste para girar
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
