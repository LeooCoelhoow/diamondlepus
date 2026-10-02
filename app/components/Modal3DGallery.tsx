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
import type { Product3DModel } from "../data/products";

/* ── Error boundary to catch WebGL / load errors gracefully ── */
class ModelErrorBoundary extends Component<
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
  componentDidCatch(error: Error, errorInfo: any) {
    console.warn("[Modal3DGallery] Error caught by boundary:", error, errorInfo);
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

// Preload models for instantaneous rendering
useGLTF.preload("/products/disup/Disup-branco.glb");
useGLTF.preload("/products/disup/Disup-preto.glb");

/* ── Inner 3D Scene for Each Card ── */
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

  // Auto-rotation when user is not manually orbiting
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
      <ambientLight intensity={1.5} />
      <directionalLight position={[4, 6, 4]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-4, 2, -2]} intensity={1.2} color="#e0e7ff" />
      <directionalLight position={[0, -3, 3]} intensity={0.9} color="#93c5fd" />
      <pointLight position={[0, 4, -4]} intensity={2.5} color="#a78bfa" />
      <pointLight position={[3, -2, 2]} intensity={1.2} color="#7c6ef2" />

      <ModelErrorBoundary fallback={<Fallback3DPlaceholder />}>
        <Suspense fallback={<Fallback3DPlaceholder />}>
          <group ref={groupRef}>
            <Center scale={0.016}>
              <ModelMesh key={modelUrl} modelUrl={modelUrl} />
            </Center>
          </group>
        </Suspense>
      </ModelErrorBoundary>

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

/* ── Individual Interactive 3D Model Card ── */
interface Modal3DCardProps {
  model: Product3DModel;
  isSelected: boolean;
  onSelect: () => void;
}

function Modal3DCard({ model, isSelected, onSelect }: Modal3DCardProps) {
  const [isInteracting, setIsInteracting] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const handlePointerDown = () => {
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
      className={`modal-3d-card ${isSelected ? "is-selected" : ""}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-label={`Selecionar modelo na cor ${model.colorName}`}
      aria-pressed={isSelected}
    >
      {/* Card Header: Swatch & Badge */}
      <div className="modal-3d-card-header">
        <div className="modal-3d-color-pill">
          <span
            className="modal-3d-color-swatch"
            style={{ background: model.colorGradient }}
          />
          <span className="modal-3d-color-name">{model.colorName}</span>
        </div>
        {model.badge && <span className="modal-3d-badge">{model.badge}</span>}
      </div>

      {/* 3D Canvas Viewport */}
      <div
        className="modal-3d-canvas-wrap"
        onPointerDown={handlePointerDown}
      >
        {model.tagline && (
          <span className="modal-3d-tagline-overlay">{model.tagline}</span>
        )}

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
            modelUrl={model.modelUrl}
            isInteracting={isInteracting}
            setIsInteracting={setIsInteracting}
            controlsRef={controlsRef}
          />
        </Canvas>
      </div>

      {/* Card Footer: Selection CTA & Reset/Hint */}
      <div className="modal-3d-card-footer">
        <button
          type="button"
          className={`modal-3d-select-action ${isSelected ? "selected" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          aria-label={`Escolher ${model.colorName}`}
        >
          {isSelected ? "✓ Selecionado" : "Selecionar cor"}
        </button>

        <div className="modal-3d-tools">
          {hasInteracted ? (
            <button
              type="button"
              className="modal-3d-reset-btn"
              onClick={handleResetView}
              title="Restaurar ângulo inicial"
              aria-label="Restaurar ângulo inicial da visualização 3D"
            >
              ⟲ Resetar
            </button>
          ) : (
            <span className="modal-3d-hint">
              <svg
                width="13"
                height="13"
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
              Arraste 360°
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Exported Modal3DGallery Component ── */
export interface Modal3DGalleryProps {
  models: Product3DModel[];
  selectedColorId: string;
  onSelectColor: (colorId: string) => void;
}

export default function Modal3DGallery({
  models,
  selectedColorId,
  onSelectColor,
}: Modal3DGalleryProps) {
  return (
    <div className="modal-gallery-container">
      {/* Top Header Bar */}
      <div className="modal-gallery-top-bar">
        <div className="modal-gallery-label-group">
          <span className="modal-gallery-live-dot" aria-hidden="true" />
          <span className="modal-gallery-heading">
            VISUALIZAÇÃO DUAL 3D EM TEMPO REAL
          </span>
        </div>
        <span className="modal-gallery-sub">
          Gire em 360° e clique para selecionar a cor do pedido
        </span>
      </div>

      {/* Dual 3D Side-by-Side Grid */}
      <div className="modal-3d-dual-grid">
        {models.map((model) => (
          <Modal3DCard
            key={model.id}
            model={model}
            isSelected={model.id === selectedColorId}
            onSelect={() => onSelectColor(model.id)}
          />
        ))}
      </div>
    </div>
  );
}
