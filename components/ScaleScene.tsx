"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  MathUtils,
  ShaderMaterial,
  Vector2,
  type PerspectiveCamera,
  type Points,
} from "three";

import { clamp } from "@/lib/format";
import { TOTAL_CATS, blockHalfSide, buildCatLayout } from "@/lib/scale";

const TAU = Math.PI * 2;
const FOV = 35;
const MAX_DPR = 1.75;
/** Sprite sizes in grid cells: a cat's face with its ears, and Peelu with his halo. */
const CAT_SIZE = 0.92;
const PEELU_SIZE = 1.9;
/** Peelu is never drawn smaller than this many CSS pixels, so he is always easy to find. */
const PEELU_MIN_PX = 20;
/** The red dot keeps one size on screen, in CSS pixels (sprite with its glow). */
const DOT_PX = 46;
/** Never frame less than this half-width, so one cat is not absurdly large. */
const MIN_HALF_SIDE = 3.2;
/** How much room the camera leaves around the block, and around the red dot's loop. */
const BLOCK_MARGIN = 1.36;
const LOOP_MARGIN = 1.36;
const POLAR_MIN = 0.12;
const POLAR_MAX = 1.25;
const START_AZIMUTH = 0.55;
const ORBIT_SPEED = 0.07;
/** The red dot's loop: one slow lap, and how long the crowd takes to set off or come home. */
const DOT_LAP_SECONDS = 18;
const DOT_START_ANGLE = 0.6;
const CHASE_SECONDS = 2.8;
const RETURN_SECONDS = 2.2;
/** Holding the pointer down this long on the canvas shows the red dot. */
const PRESS_DELAY_MS = 180;

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

const catVertexShader = /* glsl */ `
  uniform float uScale;
  uniform float uSize;
  uniform float uMinSize;
  uniform float uTime;
  uniform float uChase;
  uniform vec2 uDot;
  uniform float uDotAngle;
  uniform float uDotRadius;
  uniform float uReach;
  uniform float uTail;
  uniform float uBand;
  attribute vec2 aSeed;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vFade;
  varying float vDetail;
  varying float vSize;

  void main() {
    vec2 home = position.xz;
    vec2 ground = home;
    if (uChase > 0.0) {
      // Two unrelated numbers per cat: how far behind the dot it runs, and in which lane.
      float order = fract(aSeed.x * 17.31);
      float lane = aSeed.y;
      // Cats nearer the red dot notice it first and set off sooner.
      float delay = clamp(distance(home, uDot) / uReach, 0.0, 1.0) * 0.55 + order * 0.1;
      float go = smoothstep(delay, delay + 0.35, uChase);
      // Each cat then trails the dot along its loop by a lag of its own, so the
      // crowd strings out behind it: thick at the front, thin at the back.
      float surge = sin(uTime * (0.7 + lane) + aSeed.x * 53.0) * 0.06;
      float angle = uDotAngle - 0.03 - uTail * (pow(order, 1.4) - surge);
      float radius = uDotRadius * (1.0 + (lane - 0.5) * uBand * (1.0 - 0.45 * order));
      vec2 chase = vec2(cos(angle), sin(angle)) * radius;
      chase += vec2(sin(uTime * 5.1 + aSeed.x * 40.0), cos(uTime * 4.3 + aSeed.y * 31.0)) * 0.16;
      ground = mix(home, chase, go);
    }
    vec4 mvPosition = modelViewMatrix * vec4(ground.x, 0.0, ground.y, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    float size = uSize * uScale / max(-mvPosition.z, 0.001);
    float drawn = max(size, uMinSize);
    gl_PointSize = drawn;
    // Below the minimum size a sprite is drawn larger than life, so dim it to compensate.
    vFade = clamp(size / drawn, 0.0, 1.0);
    vDetail = smoothstep(7.0, 18.0, size);
    vSize = drawn;
    vColor = aColor * (0.74 + 0.26 * aSeed.x);
  }
`;

const catFragmentShader = /* glsl */ `
  uniform vec3 uEye;
  varying vec3 vColor;
  varying float vFade;
  varying float vDetail;
  varying float vSize;

  void main() {
    vec2 p = gl_PointCoord - 0.5;
    p.y = -p.y;
    float soft = 1.5 / vSize;
    // From far away a cat is one soft round dot.
    float dotMask = 1.0 - smoothstep(0.36, 0.5, length(p));
    // Up close it is a face: a round head, two pointed ears and bright eyes.
    float head = length(p - vec2(0.0, -0.07)) - 0.31;
    vec2 ear = vec2(abs(p.x) - 0.2, p.y - 0.2);
    float ears = abs(ear.x) * 1.35 + abs(ear.y) * 0.85 - 0.2;
    float faceMask = 1.0 - smoothstep(-soft, soft, min(head, ears));
    float mask = mix(dotMask, faceMask, vDetail);
    if (mask < 0.01) discard;
    vec2 eye = vec2(abs(p.x) - 0.125, (p.y + 0.05) * 1.15);
    float eyes = (1.0 - smoothstep(0.05, 0.05 + soft * 2.0, length(eye))) * vDetail;
    vec3 color = mix(vColor, uEye, eyes);
    gl_FragColor = vec4(color, mask * mix(0.55, 1.0, vFade));
  }
`;

const peeluVertexShader = /* glsl */ `
  uniform float uScale;
  uniform float uSize;
  uniform float uMinSize;
  varying float vDetail;
  varying float vSize;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    float size = max(uSize * uScale / max(-mvPosition.z, 0.001), uMinSize);
    gl_PointSize = size;
    vDetail = smoothstep(30.0, 60.0, size);
    vSize = size;
  }
`;

const peeluFragmentShader = /* glsl */ `
  uniform vec3 uBody;
  uniform vec3 uBeak;
  uniform vec3 uInk;
  varying float vDetail;
  varying float vSize;

  void main() {
    vec2 p = gl_PointCoord - 0.5;
    p.y = -p.y;
    float soft = 1.5 / vSize;
    float dist = length(p);
    // A soft yellow halo, a dark rim that lifts him off the cats, then the round body.
    float halo = (1.0 - smoothstep(0.33, 0.5, dist)) * 0.3;
    float rim = 1.0 - smoothstep(0.33 - soft, 0.33 + soft, dist);
    float body = 1.0 - smoothstep(0.28 - soft, 0.28 + soft, dist);
    vec3 color = mix(uBody, uInk, rim);
    float alpha = max(halo, rim * 0.9);
    color = mix(color, uBody, body);
    alpha = max(alpha, body);
    // Up close he gets his tuft, his beak and an eye.
    float tuft = (1.0 - smoothstep(-soft, soft, length(p - vec2(-0.01, 0.3)) - 0.055)) * vDetail;
    color = mix(color, uBody, tuft);
    alpha = max(alpha, tuft);
    vec2 b = vec2(p.x - 0.3, p.y + 0.01);
    float beak = (1.0 - smoothstep(-soft, soft, abs(b.x) + abs(b.y) * 1.5 - 0.1)) * vDetail;
    color = mix(color, uBeak, beak);
    alpha = max(alpha, beak);
    float eye = (1.0 - smoothstep(0.034, 0.034 + soft * 2.0, length(p - vec2(0.12, 0.08)))) * vDetail;
    color = mix(color, uInk, eye);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

const dotVertexShader = /* glsl */ `
  uniform float uPixels;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uPixels;
  }
`;

const dotFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;

  void main() {
    vec2 p = abs(gl_PointCoord - 0.5);
    // A small sharp square with a soft glow around it.
    float core = 1.0 - smoothstep(0.125, 0.15, max(p.x, p.y));
    float glow = pow(max(0.0, 1.0 - length(p) * 2.0), 2.0) * 0.55;
    float alpha = max(core, glow) * uOpacity;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export interface ScaleSceneProps {
  /** How many cats to show; always one of the count steps. */
  count: number;
  /** Multiplier on the fitted camera distance (below 1 is closer). */
  zoom: number;
  autoRotate: boolean;
  /** True while the red dot is out and the cats are chasing it. */
  dotOn: boolean;
  /** Changing this value puts the camera back at its starting angle. */
  resetKey: number;
  /** False while the explorer is off screen or the tab is hidden. */
  active: boolean;
  reducedMotion: boolean;
  label: string;
  onInteract: () => void;
  onZoom: (factor: number) => void;
  /** Reports whether the pointer is being held down on the canvas. */
  onPress: (pressed: boolean) => void;
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
  zoom,
  autoRotate,
  dotOn,
  resetKey,
  active,
  reducedMotion,
  onInteract,
  onZoom,
  onPress,
  onLost,
}: CrowdProps) {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const catsRef = useRef<Points<BufferGeometry, ShaderMaterial>>(null);
  const peeluRef = useRef<Points<BufferGeometry, ShaderMaterial>>(null);
  const dotRef = useRef<Points<BufferGeometry, ShaderMaterial>>(null);

  const scene = useMemo(() => {
    const layout = buildCatLayout(TOTAL_CATS);
    const cats = new BufferGeometry();
    cats.setAttribute("position", new BufferAttribute(layout.positions, 3));
    cats.setAttribute("aSeed", new BufferAttribute(layout.seeds, 2));
    cats.setAttribute("aColor", new BufferAttribute(layout.colors, 3));
    const catMaterial = new ShaderMaterial({
      vertexShader: catVertexShader,
      fragmentShader: catFragmentShader,
      uniforms: {
        uScale: { value: 1 },
        uSize: { value: CAT_SIZE },
        uMinSize: { value: 1.5 },
        uTime: { value: 0 },
        uChase: { value: 0 },
        uDot: { value: new Vector2(0, 0) },
        uDotAngle: { value: DOT_START_ANGLE },
        uDotRadius: { value: 1 },
        uReach: { value: 1 },
        uTail: { value: 0.25 },
        uBand: { value: 0.1 },
        uEye: { value: new Color(0.82, 0.91, 0.41) },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    // Peelu and the red dot are one point each, standing on the origin of their own object.
    const single = new BufferGeometry();
    single.setAttribute("position", new BufferAttribute(new Float32Array(3), 3));
    const peeluMaterial = new ShaderMaterial({
      vertexShader: peeluVertexShader,
      fragmentShader: peeluFragmentShader,
      uniforms: {
        uScale: { value: 1 },
        uSize: { value: PEELU_SIZE },
        uMinSize: { value: PEELU_MIN_PX },
        uBody: { value: new Color(1.0, 0.824, 0.247) },
        uBeak: { value: new Color(0.941, 0.549, 0.102) },
        uInk: { value: new Color(0.043, 0.043, 0.051) },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const dotMaterial = new ShaderMaterial({
      vertexShader: dotVertexShader,
      fragmentShader: dotFragmentShader,
      uniforms: {
        uPixels: { value: DOT_PX },
        uColor: { value: new Color(0.784, 0.063, 0.18) },
        uOpacity: { value: 0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    return { cats, catMaterial, single, peeluMaterial, dotMaterial };
  }, []);

  useEffect(
    () => () => {
      scene.cats.dispose();
      scene.catMaterial.dispose();
      scene.single.dispose();
      scene.peeluMaterial.dispose();
      scene.dotMaterial.dispose();
    },
    [scene],
  );

  // Where the view is heading (from props) and where it currently is (animated).
  const target = useRef({ count, zoom, autoRotate, dotOn });
  const view = useRef({
    logCount: Math.log10(count),
    zoom,
    azimuth: START_AZIMUTH,
    polar: -1,
    dragging: false,
    /** 0 with every cat at home, 1 with every cat behind the dot. */
    chase: 0,
    /** How visible the red dot is. */
    dot: 0,
    /** How far the camera has pulled back to keep the dot's loop in frame. */
    wide: 0,
    dotAngle: DOT_START_ANGLE,
    time: 0,
  });

  useEffect(() => {
    target.current = { count, zoom, autoRotate, dotOn };
    invalidate();
  }, [count, zoom, autoRotate, dotOn, invalidate]);

  useEffect(() => {
    view.current.azimuth = START_AZIMUTH;
    view.current.polar = -1;
    invalidate();
  }, [resetKey, invalidate]);

  useEffect(() => {
    if (active) invalidate();
  }, [active, reducedMotion, invalidate]);

  // Orbit by dragging; holding the pointer down also brings out the red dot.
  // Vertical touch drags keep scrolling the page, and the wheel only zooms while
  // Ctrl or Cmd is held, so the page scroll is never hijacked.
  useEffect(() => {
    const element = gl.domElement;
    let activePointer: number | null = null;
    let lastX = 0;
    let lastY = 0;
    let pressTimer: number | undefined;
    let pressed = false;

    const endPress = () => {
      window.clearTimeout(pressTimer);
      pressTimer = undefined;
      if (pressed) {
        pressed = false;
        onPress(false);
      }
    };

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
      // A short hold, so a tap or the start of a page scroll does not flash the dot.
      window.clearTimeout(pressTimer);
      pressTimer = window.setTimeout(() => {
        pressTimer = undefined;
        pressed = true;
        onPress(true);
      }, PRESS_DELAY_MS);
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
      endPress();
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
    element.addEventListener("lostpointercapture", onPointerEnd);
    element.addEventListener("wheel", onWheel, { passive: false });
    element.addEventListener("webglcontextlost", onContextLost);
    return () => {
      element.removeEventListener("pointerdown", onPointerDown);
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerup", onPointerEnd);
      element.removeEventListener("pointercancel", onPointerEnd);
      element.removeEventListener("lostpointercapture", onPointerEnd);
      element.removeEventListener("wheel", onWheel);
      element.removeEventListener("webglcontextlost", onContextLost);
      view.current.dragging = false;
      endPress();
    };
  }, [gl, invalidate, onInteract, onZoom, onPress, onLost]);

  useFrame((state, delta) => {
    const cats = catsRef.current;
    const peelu = peeluRef.current;
    const dot = dotRef.current;
    if (!cats || !peelu || !dot) return;
    const goal = target.current;
    const now = view.current;
    const dt = Math.min(delta, 0.05);
    const aspect = state.size.width / Math.max(1, state.size.height);

    // A flatter, more top-down angle on tall screens so the block fills the frame.
    if (now.polar < 0) now.polar = aspect < 1 ? 0.62 : 0.94;

    const goalLog = Math.log10(goal.count);
    const ease = (rate: number) => (reducedMotion ? 1 : 1 - Math.exp(-dt * rate));
    now.logCount += (goalLog - now.logCount) * ease(4.2);
    now.zoom += (goal.zoom - now.zoom) * ease(7);
    if (Math.abs(goalLog - now.logCount) < 0.0015) now.logCount = goalLog;
    if (Math.abs(goal.zoom - now.zoom) < 0.001) now.zoom = goal.zoom;

    // The chase runs on a steady clock: out when the dot appears, home when it goes.
    const dotGoal = goal.dotOn ? 1 : 0;
    if (reducedMotion) {
      now.chase = dotGoal;
    } else if (goal.dotOn) {
      now.chase = Math.min(1, now.chase + dt / CHASE_SECONDS);
    } else {
      now.chase = Math.max(0, now.chase - dt / RETURN_SECONDS);
    }
    now.dot += (dotGoal - now.dot) * ease(9);
    now.wide += (dotGoal - now.wide) * ease(2.4);
    if (Math.abs(dotGoal - now.dot) < 0.004) now.dot = dotGoal;
    if (Math.abs(dotGoal - now.wide) < 0.002) now.wide = dotGoal;

    // While anything is chasing, the dot keeps walking its loop and the cats keep scurrying.
    const chasing = !reducedMotion && (goal.dotOn || now.chase > 0);
    if (chasing) {
      now.dotAngle = (now.dotAngle + (dt * TAU) / DOT_LAP_SECONDS) % TAU;
      now.time += dt;
    }

    const settled =
      now.logCount === goalLog &&
      now.zoom === goal.zoom &&
      now.chase === dotGoal &&
      now.dot === dotGoal &&
      now.wide === dotGoal;
    const orbiting = goal.autoRotate && !now.dragging && !reducedMotion;
    if (orbiting) now.azimuth += dt * ORBIT_SPEED;

    // Reveal cats from Peelu outwards: the layout is ordered ring by ring.
    const shownCount = 10 ** now.logCount;
    const shown =
      now.logCount === goalLog ? goal.count : clamp(Math.round(shownCount), 1, TOTAL_CATS);
    if (cats.geometry.drawRange.count !== shown) cats.geometry.setDrawRange(0, shown);

    // The dot's loop runs a little outside the block, whatever size the block is.
    const blockHalf = blockHalfSide(shownCount);
    const dotRadius = blockHalf * 1.5 + 1.8;
    const dotX = Math.cos(now.dotAngle) * dotRadius;
    const dotZ = Math.sin(now.dotAngle) * dotRadius;
    const crowd = clamp(now.logCount / 5, 0, 1);

    const camera = state.camera as PerspectiveCamera;
    const halfV = MathUtils.degToRad(camera.fov) / 2;
    const blockFrame = Math.max(blockHalf, MIN_HALF_SIDE) * BLOCK_MARGIN;
    const chaseFrame = Math.max(blockFrame, dotRadius * LOOP_MARGIN);
    const frame = blockFrame + (chaseFrame - blockFrame) * now.wide;
    const distance = fitDistance(frame, now.polar, halfV, aspect) * now.zoom;
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
    const scale = (state.size.height * pixelRatio) / (2 * Math.tan(halfV));

    const catUniforms = cats.material.uniforms;
    catUniforms.uScale.value = scale;
    catUniforms.uMinSize.value = 1.3 * pixelRatio;
    catUniforms.uTime.value = now.time;
    catUniforms.uChase.value = now.chase;
    (catUniforms.uDot.value as Vector2).set(dotX, dotZ);
    catUniforms.uDotAngle.value = now.dotAngle;
    catUniforms.uDotRadius.value = dotRadius;
    catUniforms.uReach.value = dotRadius + blockHalf * 1.42;
    catUniforms.uTail.value = 0.25 + 1.75 * crowd;
    catUniforms.uBand.value = 0.1 + 0.4 * crowd;

    const peeluUniforms = peelu.material.uniforms;
    peeluUniforms.uScale.value = scale;
    peeluUniforms.uMinSize.value = PEELU_MIN_PX * pixelRatio;

    dot.position.set(dotX, 0, dotZ);
    dot.visible = now.dot > 0;
    dot.material.uniforms.uPixels.value = DOT_PX * pixelRatio;
    dot.material.uniforms.uOpacity.value = now.dot;

    // The loop runs on demand: keep asking for frames only while something moves.
    if (!settled || orbiting || now.dragging || chasing) state.invalidate();
  });

  return (
    <>
      <points
        ref={catsRef}
        geometry={scene.cats}
        material={scene.catMaterial}
        frustumCulled={false}
        renderOrder={1}
      />
      <points
        ref={dotRef}
        geometry={scene.single}
        material={scene.dotMaterial}
        frustumCulled={false}
        renderOrder={2}
      />
      <points
        ref={peeluRef}
        geometry={scene.single}
        material={scene.peeluMaterial}
        frustumCulled={false}
        renderOrder={3}
      />
    </>
  );
}

/**
 * One hundred thousand cats as a single THREE.Points draw call, with Peelu in
 * the middle and a red dot for them to chase. Loaded lazily and only rendered
 * while visible.
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
