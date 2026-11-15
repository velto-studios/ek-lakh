"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  MathUtils,
  ShaderMaterial,
  type PerspectiveCamera,
  type Points,
} from "three";

import { clamp } from "@/lib/format";
import { TOTAL_PEOPLE, buildCrowdLayout, buildPitchLines, pitchTiling, blockSide } from "@/lib/scale";

const FOV = 35;
const MAX_DPR = 1.75;
/** Shoulder width of one person seen from above, in metres. */
const PERSON_DIAMETER = 0.46;
/** Never frame less than this half-width, so one person is not absurdly large. */
const MIN_HALF_SIDE = 2.4;
const POLAR_MIN = 0.12;
const POLAR_MAX = 1.25;
const START_AZIMUTH = 0.55;
const ORBIT_SPEED = 0.07;

// Stable references: the canvas only re-applies settings whose identity changes.
const CANVAS_DPR: [number, number] = [1, MAX_DPR];
const CANVAS_RESIZE = { scroll: false };
const CANVAS_GL = { antialias: true, alpha: true, powerPreference: "high-performance" } as const;
const CANVAS_CAMERA = {
  fov: FOV,
  near: 0.1,
  far: 6000,
  position: [0, 12, 16] as [number, number, number],
};

const vertexShader = /* glsl */ `
  uniform float uSpacing;
  uniform float uScale;
  uniform float uSize;
  uniform float uMinSize;
  attribute float aSeed;
  varying float vSeed;
  varying float vFade;
  varying float vDetail;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position.x * uSpacing, 0.0, position.z * uSpacing, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    float size = uSize * uScale / max(-mvPosition.z, 0.001);
    float drawn = max(size, uMinSize);
    gl_PointSize = drawn;
    // Below the minimum size a sprite is drawn larger than life, so dim it to compensate.
    vFade = clamp(size / drawn, 0.0, 1.0);
    vDetail = smoothstep(5.0, 16.0, size);
    vSeed = aSeed;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uHead;
  uniform vec3 uBody;
  varying float vSeed;
  varying float vFade;
  varying float vDetail;

  void main() {
    float dist = length(gl_PointCoord - 0.5);
    float body = 1.0 - smoothstep(0.36, 0.5, dist);
    if (body < 0.01) discard;
    // Up close a point reads as a person from above: shoulders with a brighter head.
    float head = 1.0 - smoothstep(0.15, 0.23, dist);
    float tone = 0.6 + 0.4 * vSeed;
    vec3 color = mix(uHead, mix(uBody, uHead, head), vDetail) * tone;
    float alpha = body * mix(0.5, 1.0, vFade);
    gl_FragColor = vec4(color, alpha);
  }
`;

export interface ScaleSceneProps {
  /** How many people to show; always one of the count steps. */
  count: number;
  /** Distance between neighbours in metres. */
  spacing: number;
  /** Multiplier on the fitted camera distance (below 1 is closer). */
  zoom: number;
  autoRotate: boolean;
  /** Changing this value puts the camera back at its starting angle. */
  resetKey: number;
  /** False while the explorer is off screen or the tab is hidden. */
  active: boolean;
  reducedMotion: boolean;
  label: string;
  onInteract: () => void;
  onZoom: (factor: number) => void;
  onReady: () => void;
  onLost: () => void;
}

type CrowdProps = Omit<ScaleSceneProps, "label" | "onReady">;

/** Camera distance at which a ground disc of the given radius sits inside the frame. */
function fitDistance(radius: number, polar: number, halfV: number, aspect: number): number {
  const halfH = Math.atan(Math.tan(halfV) * aspect);
  const insetV = halfV * 0.9;
  const vertical = (radius * Math.cos(polar - insetV)) / Math.sin(insetV);
  const horizontal = radius / Math.sin(halfH * 0.94);
  return Math.max(vertical, horizontal);
}

function Crowd({
  count,
  spacing,
  zoom,
  autoRotate,
  resetKey,
  active,
  reducedMotion,
  onInteract,
  onZoom,
  onLost,
}: CrowdProps) {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const pointsRef = useRef<Points<BufferGeometry, ShaderMaterial>>(null);

  const crowd = useMemo(() => {
    const layout = buildCrowdLayout(TOTAL_PEOPLE);
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(layout.positions, 3));
    geometry.setAttribute("aSeed", new BufferAttribute(layout.seeds, 1));
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uSpacing: { value: 1 },
        uScale: { value: 1 },
        uSize: { value: PERSON_DIAMETER },
        uMinSize: { value: 1.5 },
        uHead: { value: new Color(1.0, 0.93, 0.83) },
        uBody: { value: new Color(0.62, 0.55, 0.47) },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    return { geometry, material };
  }, []);

  const side = blockSide(count, spacing);
  const { cols, rows } = pitchTiling(side);
  const pitchGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(buildPitchLines(cols, rows), 3));
    return geometry;
  }, [cols, rows]);
  const pitchMaterial = useMemo(
    () =>
      new LineBasicMaterial({
        color: 0xcdeedb,
        transparent: true,
        opacity: 0.36,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );

  useEffect(() => () => pitchGeometry.dispose(), [pitchGeometry]);
  useEffect(
    () => () => {
      crowd.geometry.dispose();
      crowd.material.dispose();
      pitchMaterial.dispose();
    },
    [crowd, pitchMaterial],
  );

  // Where the view is heading (from props) and where it currently is (animated).
  const target = useRef({ count, spacing, zoom, autoRotate });
  const view = useRef({
    logCount: Math.log10(count),
    spacing,
    zoom,
    azimuth: START_AZIMUTH,
    polar: -1,
    dragging: false,
  });

  useEffect(() => {
    target.current = { count, spacing, zoom, autoRotate };
    invalidate();
  }, [count, spacing, zoom, autoRotate, invalidate]);

  useEffect(() => {
    view.current.azimuth = START_AZIMUTH;
    view.current.polar = -1;
    invalidate();
  }, [resetKey, invalidate]);

  useEffect(() => {
    if (active) invalidate();
  }, [active, reducedMotion, invalidate]);

  // Orbit by dragging. Vertical touch drags keep scrolling the page, and the
  // wheel only zooms while Ctrl or Cmd is held, so the page scroll is never hijacked.
  useEffect(() => {
    const element = gl.domElement;
    let activePointer: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const canvas = event.currentTarget as HTMLCanvasElement;
      activePointer = event.pointerId;
      lastX = event.clientX;
      lastY = event.clientY;
      view.current.dragging = true;
      canvas.setPointerCapture(event.pointerId);
      canvas.dataset.dragging = "true";
      onInteract();
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== activePointer) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      view.current.azimuth -= dx * 0.006;
      if (event.pointerType !== "touch" && view.current.polar >= 0) {
        view.current.polar = clamp(view.current.polar - dy * 0.005, POLAR_MIN, POLAR_MAX);
      }
      invalidate();
    };
    const onPointerEnd = (event: PointerEvent) => {
      if (event.pointerId !== activePointer) return;
      const canvas = event.currentTarget as HTMLCanvasElement;
      activePointer = null;
      view.current.dragging = false;
      delete canvas.dataset.dragging;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      onInteract();
      onZoom(Math.exp(clamp(event.deltaY, -80, 80) * 0.004));
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      onLost();
    };

    element.addEventListener("pointerdown", onPointerDown);
    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerup", onPointerEnd);
    element.addEventListener("pointercancel", onPointerEnd);
    element.addEventListener("wheel", onWheel, { passive: false });
    element.addEventListener("webglcontextlost", onContextLost);
    return () => {
      element.removeEventListener("pointerdown", onPointerDown);
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerup", onPointerEnd);
      element.removeEventListener("pointercancel", onPointerEnd);
      element.removeEventListener("wheel", onWheel);
      element.removeEventListener("webglcontextlost", onContextLost);
    };
  }, [gl, invalidate, onInteract, onZoom, onLost]);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) return;
    const goal = target.current;
    const now = view.current;
    const dt = Math.min(delta, 0.05);
    const aspect = state.size.width / Math.max(1, state.size.height);

    // A flatter, more top-down angle on tall screens so the block fills the frame.
    if (now.polar < 0) now.polar = aspect < 1 ? 0.62 : 0.94;

    const goalLog = Math.log10(goal.count);
    const ease = (rate: number) => (reducedMotion ? 1 : 1 - Math.exp(-dt * rate));
    now.logCount += (goalLog - now.logCount) * ease(4.2);
    now.spacing += (goal.spacing - now.spacing) * ease(5);
    now.zoom += (goal.zoom - now.zoom) * ease(7);
    if (Math.abs(goalLog - now.logCount) < 0.0015) now.logCount = goalLog;
    if (Math.abs(goal.spacing - now.spacing) < 0.0005) now.spacing = goal.spacing;
    if (Math.abs(goal.zoom - now.zoom) < 0.001) now.zoom = goal.zoom;

    const settled =
      now.logCount === goalLog && now.spacing === goal.spacing && now.zoom === goal.zoom;
    const orbiting = goal.autoRotate && !now.dragging && !reducedMotion;
    if (orbiting) now.azimuth += dt * ORBIT_SPEED;

    // Reveal people from the centre outwards: the layout is ordered ring by ring.
    const shown =
      now.logCount === goalLog
        ? goal.count
        : clamp(Math.round(10 ** now.logCount), 1, TOTAL_PEOPLE);
    if (points.geometry.drawRange.count !== shown) points.geometry.setDrawRange(0, shown);

    const camera = state.camera as PerspectiveCamera;
    const halfV = MathUtils.degToRad(camera.fov) / 2;
    const halfSide = Math.max((Math.sqrt(10 ** now.logCount) * now.spacing) / 2, MIN_HALF_SIDE);
    const distance = fitDistance(halfSide * 1.3, now.polar, halfV, aspect) * now.zoom;
    const sinPolar = Math.sin(now.polar);
    camera.position.set(
      distance * sinPolar * Math.sin(now.azimuth),
      distance * Math.cos(now.polar),
      distance * sinPolar * Math.cos(now.azimuth),
    );
    camera.lookAt(0, 0, 0);
    camera.near = Math.max(0.05, distance * 0.02);
    camera.far = distance * 8 + 800;
    camera.updateProjectionMatrix();

    const pixelRatio = state.gl.getPixelRatio();
    const uniforms = points.material.uniforms;
    uniforms.uSpacing.value = now.spacing;
    uniforms.uScale.value = (state.size.height * pixelRatio) / (2 * Math.tan(halfV));
    uniforms.uMinSize.value = 1.3 * pixelRatio;

    // The loop runs on demand: keep asking for frames only while something moves.
    if (!settled || orbiting || now.dragging) state.invalidate();
  });

  return (
    <>
      <lineSegments
        geometry={pitchGeometry}
        material={pitchMaterial}
        frustumCulled={false}
        renderOrder={1}
      />
      <points
        ref={pointsRef}
        geometry={crowd.geometry}
        material={crowd.material}
        frustumCulled={false}
        renderOrder={2}
      />
    </>
  );
}

/**
 * One hundred thousand people as a single THREE.Points draw call, standing on
 * a sheet of football pitches. Loaded lazily and only rendered while visible.
 */
export default function ScaleScene({ label, onReady, ...crowd }: ScaleSceneProps) {
  return (
    <Canvas
      className="scale-canvas"
      role="img"
      aria-label={label}
      dpr={CANVAS_DPR}
      flat
      frameloop={crowd.active ? "demand" : "never"}
      resize={CANVAS_RESIZE}
      gl={CANVAS_GL}
      camera={CANVAS_CAMERA}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        onReady();
      }}
    >
      <Crowd {...crowd} />
    </Canvas>
  );
}
