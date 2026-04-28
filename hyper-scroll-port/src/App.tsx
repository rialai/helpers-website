import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import { SCENE_ITEMS, type SceneWorldItem } from "./content/scenes";

type InteractionMode = "desktop" | "touch";

type ItemType = "text" | "card" | "star";

type WorldItem = {
  el: HTMLDivElement;
  type: ItemType;
  cardEl?: HTMLDivElement;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  rot: number;
  baseZ: number;
  emphasis?: "accent" | "accent2" | "neutral";
};

type ScrollRead = {
  scroll: number;
  velocity: number;
};

type ScrollSource = {
  update: (time: number) => void;
  read: () => ScrollRead;
  jumpTo: (scroll: number) => void;
  syncAfterResize: () => void;
  destroy: () => void;
};

const CONFIG = {
  starCount: 150,
  loopSize: 0,
  camSpeed: 2.5,
  colors: ["#ff003c", "#00f3ff", "#ccff00", "#ffffff"]
};
const deepestZ = Math.min(...SCENE_ITEMS.map((item) => item.z));
CONFIG.loopSize = Math.abs(deepestZ) + 2600;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function detectInteractionMode(): InteractionMode {
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const touchCapable = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const mobileUa = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  return coarsePointer || touchCapable || mobileUa ? "touch" : "desktop";
}

function createDesktopScrollSource(): ScrollSource {
  let currentScroll = 0;
  let currentVelocity = 0;

  const lenis = new Lenis({
    smooth: true,
    lerp: 0.08,
    direction: "vertical",
    gestureDirection: "vertical",
    smoothTouch: true
  } as unknown as ConstructorParameters<typeof Lenis>[0]);

  lenis.on("scroll", ({ scroll, velocity }: { scroll: number; velocity: number }) => {
    currentScroll = scroll;
    currentVelocity = velocity;
  });

  return {
    update: (time: number) => lenis.raf(time),
    read: () => ({ scroll: currentScroll, velocity: currentVelocity }),
    jumpTo: (scroll: number) => {
      lenis.scrollTo(scroll, { immediate: true, force: true });
      currentScroll = scroll;
      currentVelocity = 0;
    },
    syncAfterResize: () => {
      currentScroll = window.scrollY;
      currentVelocity = 0;
    },
    destroy: () => lenis.destroy()
  };
}

function createTouchScrollSource(): ScrollSource {
  let currentScroll = window.scrollY;
  let lastScroll = currentScroll;
  let currentVelocity = 0;

  return {
    update: () => {
      currentScroll = window.scrollY;
      currentVelocity = currentScroll - lastScroll;
      lastScroll = currentScroll;
    },
    read: () => ({ scroll: currentScroll, velocity: currentVelocity }),
    jumpTo: (scroll: number) => {
      window.scrollTo(0, scroll);
      currentScroll = scroll;
      lastScroll = scroll;
      currentVelocity = 0;
    },
    syncAfterResize: () => {
      currentScroll = window.scrollY;
      lastScroll = currentScroll;
      currentVelocity = 0;
    },
    destroy: () => undefined
  };
}

function accentForItem(item: SceneWorldItem): string {
  if (item.emphasis === "accent") return "var(--accent)";
  if (item.emphasis === "accent2") return "var(--accent-2)";
  return CONFIG.colors[item.scene % CONFIG.colors.length];
}

export default function App() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!worldRef.current || !viewportRef.current) return;
    const world = worldRef.current;
    const viewport = viewportRef.current;

    const items: WorldItem[] = [];

    const state = {
      scroll: 0,
      velocity: 0,
      targetSpeed: 0,
      textFade: 0,
      mouseX: 0,
      mouseY: 0
    };

    const interactionMode = detectInteractionMode();
    const isTouchMode = interactionMode === "touch";
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.documentElement.classList.toggle("touch-mode", isTouchMode);
    document.documentElement.classList.toggle("desktop-mode", !isTouchMode);
    document.documentElement.classList.toggle("reduced-motion", prefersReducedMotion);

    const syncViewport = () => {
      document.documentElement.style.setProperty("--app-height", `${window.innerHeight}px`);
      document.documentElement.style.setProperty("--app-width", `${window.innerWidth}px`);
    };

    const recalcLayout = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const minScaleRef = Math.min(width / 1440, height / 960);
      const desktopScale = clamp(minScaleRef, 0.78, 1.08);
      const touchScale = clamp(minScaleRef, 0.7, 1);
      const scale = isTouchMode ? touchScale : desktopScale;
      const isLandscapeTouch = isTouchMode && width > height;

      items.forEach((item) => {
        if (item.type === "star") return;

        const xScale = isLandscapeTouch ? scale * 0.9 : scale;
        const yScale = isLandscapeTouch ? scale * 0.75 : scale;

          if (item.type === "text") {
            // Keep large scene labels readable on first frame by reducing lateral spread.
            const textXFactor = isTouchMode ? 0.4 : 0.5;
            item.x = item.baseX * xScale * textXFactor;
            item.y = item.baseY * yScale;
            return;
          }

          item.x = item.baseX * xScale;
          item.y = item.baseY * yScale;
      });
    };

    function init() {
      let cardCounter = 0;

      SCENE_ITEMS.forEach((sceneItem) => {
        const el = document.createElement("div");
        el.className = "item";

        if (sceneItem.type === "text") {
          const txt = document.createElement("div");
          txt.className = "big-text";
          txt.innerText = sceneItem.title;
          el.appendChild(txt);
          items.push({
            el,
            type: "text",
            baseX: sceneItem.x,
            baseY: sceneItem.y,
            x: sceneItem.x,
            y: sceneItem.y,
            rot: sceneItem.rot,
            baseZ: sceneItem.z,
            emphasis: sceneItem.emphasis
          });
        } else {
          const cardNumber = String(++cardCounter).padStart(2, "0");
          const card = document.createElement("div");
          card.className = "card";
          const accentColor = accentForItem(sceneItem);
          card.innerHTML = `
            <div class="card-header">
              <span class="card-id">${sceneItem.eyebrow ?? "SCENE"}</span>
              <div style="width: 10px; height: 10px; background: ${accentColor};"></div>
            </div>
            <h2>${sceneItem.title}</h2>
            <p class="card-body">${sceneItem.body ?? ""}</p>
            <div class="card-footer">
              <span>${sceneItem.footerLeft ?? "HELPERS"}</span>
              <span>${sceneItem.footerRight ?? "LOCAL"}</span>
            </div>
            <div style="position:absolute; bottom:2rem; right:2rem; font-size:4rem; opacity:0.08; font-weight:900;">${cardNumber}</div>
          `;
          el.appendChild(card);

          items.push({
            el,
            type: "card",
            cardEl: card,
            baseX: sceneItem.x,
            baseY: sceneItem.y,
            x: sceneItem.x,
            y: sceneItem.y,
            rot: sceneItem.rot,
            baseZ: sceneItem.z,
            emphasis: sceneItem.emphasis
          });
        }
        world.appendChild(el);
      });

      for (let i = 0; i < CONFIG.starCount; i++) {
        const el = document.createElement("div");
        el.className = "star";
        world.appendChild(el);
        items.push({
          el,
          type: "star",
          baseX: (Math.random() - 0.5) * 3000,
          baseY: (Math.random() - 0.5) * 3000,
          x: (Math.random() - 0.5) * 3000,
          y: (Math.random() - 0.5) * 3000,
          rot: 0,
          baseZ: -Math.random() * CONFIG.loopSize
        });
      }

      recalcLayout();
    }

    init();

    syncViewport();

    const onMouseMove = (e: MouseEvent) => {
      state.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      state.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    if (!isTouchMode) {
      window.addEventListener("mousemove", onMouseMove);
    }

    const scrollSource = isTouchMode ? createTouchScrollSource() : createDesktopScrollSource();

    let resizeRaf = 0;
    const onViewportChange = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        syncViewport();
        recalcLayout();
        scrollSource.syncAfterResize();
      });
    };

    window.addEventListener("resize", onViewportChange);
    window.addEventListener("orientationchange", onViewportChange);

    let scrollWrapOffset = 0;
    const wrapEdgePx = 700;

    const getScrollMax = () => {
      const doc = document.documentElement;
      return Math.max(0, doc.scrollHeight - window.innerHeight);
    };

    const wrapScrollIfNeeded = (rawScroll: number) => {
      if (isTouchMode) {
        return rawScroll;
      }

      const maxScroll = getScrollMax();
      if (maxScroll < wrapEdgePx * 3) {
        return rawScroll;
      }

      const topWrapPoint = wrapEdgePx;
      const bottomWrapPoint = maxScroll - wrapEdgePx;
      const wrapSpan = bottomWrapPoint - topWrapPoint;

      if (wrapSpan <= 0) {
        return rawScroll;
      }

      if (rawScroll <= topWrapPoint) {
        const nextScroll = rawScroll + wrapSpan;
        scrollWrapOffset += rawScroll - nextScroll;
        scrollSource.jumpTo(nextScroll);
        return nextScroll;
      }

      if (rawScroll >= bottomWrapPoint) {
        const nextScroll = rawScroll - wrapSpan;
        scrollWrapOffset += rawScroll - nextScroll;
        scrollSource.jumpTo(nextScroll);
        return nextScroll;
      }

      return rawScroll;
    };

    const initInfiniteAnchor = () => {
      if (isTouchMode) {
        return;
      }

      const maxScroll = getScrollMax();
      if (maxScroll < wrapEdgePx * 3) {
        return;
      }

      const anchorScroll = Math.round(maxScroll * 0.5);
      scrollSource.jumpTo(anchorScroll);
      scrollWrapOffset = -anchorScroll;
    };

    initInfiniteAnchor();

    let rafId = 0;
    let lastTime = 0;
    let leadingCardEl: HTMLDivElement | null = null;

    function raf(time: number) {
      scrollSource.update(time);
      const scrollState = scrollSource.read();
      const wrappedScroll = wrapScrollIfNeeded(scrollState.scroll);
      state.scroll = wrappedScroll + scrollWrapOffset;
      state.targetSpeed = scrollState.velocity;

      lastTime = time;

      const velocityLerp = prefersReducedMotion ? 0.2 : isTouchMode ? 0.18 : 0.1;
      state.velocity += (state.targetSpeed - state.velocity) * velocityLerp;

      const desiredTextFade = clamp(Math.abs(state.velocity) * 0.22, 0, prefersReducedMotion ? 0.55 : 0.85);
      const textFadeLerp = prefersReducedMotion ? 0.16 : isTouchMode ? 0.12 : 0.2;
      state.textFade += (desiredTextFade - state.textFade) * textFadeLerp;

      const mouseTiltFactor = prefersReducedMotion ? 2.4 : 5;
      const velocityTiltFactor = prefersReducedMotion ? 0.22 : isTouchMode ? 0.18 : 0.5;
      const tiltX = isTouchMode
        ? -state.velocity * velocityTiltFactor
        : state.mouseY * mouseTiltFactor - state.velocity * velocityTiltFactor;
      const tiltY = isTouchMode ? 0 : state.mouseX * mouseTiltFactor;

      world.style.transform = `
        rotateX(${tiltX}deg) 
        rotateY(${tiltY}deg)
      `;

      const baseFov = prefersReducedMotion ? 1250 : isTouchMode ? 1160 : 1000;
      const fovVelocityFactor = prefersReducedMotion ? 2 : isTouchMode ? 4.5 : 10;
      const fovMaxWarp = prefersReducedMotion ? 120 : isTouchMode ? 240 : 600;
      const fov = baseFov - Math.min(Math.abs(state.velocity) * fovVelocityFactor, fovMaxWarp);
      viewport.style.perspective = `${fov}px`;

      const cameraZ = state.scroll * CONFIG.camSpeed;
      let nextLeadingCardEl: HTMLDivElement | null = null;
      let nextLeadingCardZ = -Infinity;

      items.forEach((item) => {
        const relZ = item.baseZ + cameraZ;
        const modC = CONFIG.loopSize;

        let vizZ = ((relZ % modC) + modC) % modC;
        if (vizZ > 500) vizZ -= modC;

        let alpha = 1;
        const farFadeStart = isTouchMode ? -3800 : -3600;
        const farFadeRange = isTouchMode ? 1200 : 1000;
        if (vizZ < farFadeStart) alpha = 0;
        else if (vizZ < farFadeStart + farFadeRange) {
          alpha = (vizZ - farFadeStart) / farFadeRange;
        }

        const nearFadeStart = isTouchMode ? 220 : 180;
        const nearFadeRange = isTouchMode ? 620 : 520;
        if (vizZ > nearFadeStart && item.type !== "star") {
          alpha = 1 - (vizZ - nearFadeStart) / nearFadeRange;
        }

        if (item.type === "text") {
          // Fade amount is smoothed from velocity to avoid threshold flicker on touch devices.
          alpha *= 1 - state.textFade;
        }

        if (alpha < 0) alpha = 0;
        item.el.style.opacity = String(alpha);

        if (item.type === "card" && item.cardEl && alpha > 0.04 && vizZ > nextLeadingCardZ) {
          nextLeadingCardEl = item.cardEl;
          nextLeadingCardZ = vizZ;
        }

        if (alpha > 0) {
          let trans = `translate3d(${item.x}px, ${item.y}px, ${vizZ}px)`;

          if (item.type === "star") {
            const stretch = Math.max(1, Math.min(1 + Math.abs(state.velocity) * 0.1, 10));
            trans += ` scale3d(1, 1, ${stretch})`;
          } else if (item.type === "text") {
            trans += ` rotateZ(${item.rot}deg)`;
            item.el.style.textShadow = "none";
          } else {
            const t = time * 0.001;
            const floatAmplitude = prefersReducedMotion ? 3 : isTouchMode ? 5.5 : 10;
            const float = Math.sin(t + item.x * 0.01) * floatAmplitude;
            trans += ` rotateZ(${item.rot}deg) rotateY(${float}deg)`;
          }

          item.el.style.transform = trans;
        }
      });

      if (leadingCardEl !== nextLeadingCardEl) {
        if (leadingCardEl) {
          leadingCardEl.classList.remove("is-leading");
        }
        if (nextLeadingCardEl) {
          nextLeadingCardEl.classList.add("is-leading");
        }
        leadingCardEl = nextLeadingCardEl;
      }

      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(resizeRaf);
      scrollSource.destroy();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("orientationchange", onViewportChange);
      document.documentElement.classList.remove("touch-mode");
      document.documentElement.classList.remove("desktop-mode");
      document.documentElement.classList.remove("reduced-motion");
      if (leadingCardEl) {
        leadingCardEl.classList.remove("is-leading");
      }
      items.length = 0;
      world.innerHTML = "";
    };
  }, []);

  return (
    <>
      <div className="scanlines" />
      <div className="vignette" />
      <div className="noise" />

      <div className="viewport" ref={viewportRef}>
        <div className="world" ref={worldRef} />
      </div>

      <div className="scroll-proxy" />
    </>
  );
}
