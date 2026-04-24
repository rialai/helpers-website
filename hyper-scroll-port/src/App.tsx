import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import { SCENE_ITEMS, type SceneWorldItem } from "./content/scenes";

type ItemType = "text" | "card" | "star";

type WorldItem = {
  el: HTMLDivElement;
  type: ItemType;
  x: number;
  y: number;
  rot: number;
  baseZ: number;
  emphasis?: "accent" | "accent2" | "neutral";
};

const CONFIG = {
  starCount: 150,
  loopSize: 0,
  camSpeed: 2.5,
  colors: ["#ff003c", "#00f3ff", "#ccff00", "#ffffff"]
};
const deepestZ = Math.min(...SCENE_ITEMS.map((item) => item.z));
CONFIG.loopSize = Math.abs(deepestZ) + 2600;

function accentForItem(item: SceneWorldItem): string {
  if (item.emphasis === "accent") return "var(--accent)";
  if (item.emphasis === "accent2") return "var(--accent-2)";
  return CONFIG.colors[item.scene % CONFIG.colors.length];
}

export default function App() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const fpsRef = useRef<HTMLSpanElement>(null);
  const velRef = useRef<HTMLSpanElement>(null);
  const coordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!worldRef.current || !viewportRef.current) return;
    const world = worldRef.current;
    const viewport = viewportRef.current;

    const items: WorldItem[] = [];

    const state = {
      scroll: 0,
      velocity: 0,
      targetSpeed: 0,
      mouseX: 0,
      mouseY: 0
    };

    function init() {
      SCENE_ITEMS.forEach((sceneItem, idx) => {
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
            x: sceneItem.x,
            y: sceneItem.y,
            rot: sceneItem.rot,
            baseZ: sceneItem.z,
            emphasis: sceneItem.emphasis
          });
        } else {
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
            <div style="position:absolute; bottom:2rem; right:2rem; font-size:4rem; opacity:0.08; font-weight:900;">${String(idx + 1).padStart(2, "0")}</div>
          `;
          el.appendChild(card);

          items.push({
            el,
            type: "card",
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
          x: (Math.random() - 0.5) * 3000,
          y: (Math.random() - 0.5) * 3000,
          rot: 0,
          baseZ: -Math.random() * CONFIG.loopSize
        });
      }
    }

    init();

    const onMouseMove = (e: MouseEvent) => {
      state.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      state.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    const lenis = new Lenis({
      smooth: true,
      lerp: 0.08,
      direction: "vertical",
      gestureDirection: "vertical",
      smoothTouch: true
    } as unknown as ConstructorParameters<typeof Lenis>[0]);

    lenis.on("scroll", ({ scroll, velocity }: { scroll: number; velocity: number }) => {
      state.scroll = scroll;
      state.targetSpeed = velocity;
    });

    let rafId = 0;
    let lastTime = 0;

    function raf(time: number) {
      lenis.raf(time);

      const delta = time - lastTime;
      lastTime = time;
      if (time % 10 < 1 && fpsRef.current && delta > 0) {
        fpsRef.current.innerText = String(Math.round(1000 / delta));
      }

      state.velocity += (state.targetSpeed - state.velocity) * 0.1;

      if (velRef.current) {
        velRef.current.innerText = Math.abs(state.velocity).toFixed(2);
      }
      if (coordRef.current) {
        coordRef.current.innerText = `${state.scroll.toFixed(0)}`;
      }

      const tiltX = state.mouseY * 5 - state.velocity * 0.5;
      const tiltY = state.mouseX * 5;

      world.style.transform = `
        rotateX(${tiltX}deg) 
        rotateY(${tiltY}deg)
      `;

      const baseFov = 1000;
      const fov = baseFov - Math.min(Math.abs(state.velocity) * 10, 600);
      viewport.style.perspective = `${fov}px`;

      const cameraZ = state.scroll * CONFIG.camSpeed;

      items.forEach((item) => {
        const relZ = item.baseZ + cameraZ;
        const modC = CONFIG.loopSize;

        let vizZ = ((relZ % modC) + modC) % modC;
        if (vizZ > 500) vizZ -= modC;

        let alpha = 1;
        if (vizZ < -3600) alpha = 0;
        else if (vizZ < -2600) alpha = (vizZ + 3600) / 1000;

        if (vizZ > 180 && item.type !== "star") alpha = 1 - (vizZ - 180) / 520;

        if (alpha < 0) alpha = 0;
        item.el.style.opacity = String(alpha);

        if (alpha > 0) {
          let trans = `translate3d(${item.x}px, ${item.y}px, ${vizZ}px)`;

          if (item.type === "star") {
            const stretch = Math.max(1, Math.min(1 + Math.abs(state.velocity) * 0.1, 10));
            trans += ` scale3d(1, 1, ${stretch})`;
          } else if (item.type === "text") {
            trans += ` rotateZ(${item.rot}deg)`;
            if (Math.abs(state.velocity) > 1) {
              const offset = state.velocity * 2;
              item.el.style.textShadow = `${offset}px 0 red, ${-offset}px 0 cyan`;
            } else {
              item.el.style.textShadow = "none";
            }
          } else {
            const t = time * 0.001;
            const float = Math.sin(t + item.x) * 10;
            trans += ` rotateZ(${item.rot}deg) rotateY(${float}deg)`;
          }

          item.el.style.transform = trans;
        }
      });

      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.removeEventListener("mousemove", onMouseMove);
      items.length = 0;
      world.innerHTML = "";
    };
  }, []);

  return (
    <>
      <div className="scanlines" />
      <div className="vignette" />
      <div className="noise" />

      <div className="hud">
        <div className="hud-top">
          <span>COOP.READY</span>
          <div className="hud-line" />
          <span>
            FPS: <strong ref={fpsRef}>60</strong>
          </span>
        </div>

        <div className="center-nav">
          FLOW VELOCITY // <strong ref={velRef}>0.00</strong>
        </div>

        <div className="hud-bottom">
          <span>
            COORD: <strong ref={coordRef}>000.000</strong>
          </span>
          <div className="hud-line" />
          <span>BUILD 0.1 [LOCAL]</span>
        </div>
      </div>

      <div className="viewport" ref={viewportRef}>
        <div className="world" ref={worldRef} />
      </div>

      <div className="scroll-proxy" />
    </>
  );
}
