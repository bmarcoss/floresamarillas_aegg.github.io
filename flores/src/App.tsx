import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

/* ----------------------------- Marco de girasoles ----------------------------- */
type Pt = { x: number; y: number };

function useSunflowerFrame(bloom: number, pad: number) {
  const [points, setPoints] = useState<{ top: Pt[]; bottom: Pt[]; left: Pt[]; right: Pt[] }>(
    { top: [], bottom: [], left: [], right: [] }
  );

  function distribute(total: number, size: number, padding: number) {
    const inner = Math.max(0, total - 2 * padding);
    let count = Math.max(2, Math.floor(inner / size));
    if (inner - count * size > size * 0.6) count += 1;
    const free = Math.max(0, inner - count * size);
    const gap = count > 1 ? free / (count - 1) : 0;
    return { count, gap };
  }

  function recompute() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const { count: nX, gap: gapX } = distribute(w, 52, pad);
    const { count: nY, gap: gapY } = distribute(h, 52, pad);

    const top: Pt[] = [];
    const bottom: Pt[] = [];
    for (let i = 0; i < nX; i++) {
      const cx = pad + 26 + i * (52 + gapX);
      top.push({ x: cx, y: pad + 26 });
      bottom.push({ x: cx, y: h - pad - 26 });
    }
    const left: Pt[] = [];
    const right: Pt[] = [];
    for (let j = 1; j < nY - 1; j++) {
      const cy = pad + 26 + j * (52 + gapY);
      left.push({ x: pad + 26, y: cy });
      right.push({ x: w - pad - 26, y: cy });
    }
    setPoints({ top, bottom, left, right });
  }

  useEffect(() => {
    recompute();
    const onResize = () => recompute();
    window.addEventListener("resize", onResize);
    const mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    mq.addEventListener?.("change", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      mq.removeEventListener?.("change", onResize);
    };
  }, [bloom, pad]);

  return points;
}

function SunflowerFrame() {
  const pad = 24;
  const bloom = 52;
  const pts = useSunflowerFrame(bloom, pad);

  const petals = useMemo(
    () =>
      new Array(12).fill(0).map((_, i) => {
        const rot = (i * 360) / 12;
        return (
          <ellipse
            key={i}
            cx="0"
            cy="0"
            rx="12"
            ry="22"
            transform={`rotate(${rot})`}
            fill="#F4C335"
          />
        );
      }),
    []
  );

  const Flower = ({ x, y }: Pt) => (
    <g transform={`translate(${x}, ${y})`} className="sf">
      {petals}
      <circle r="16" fill="#5d3b23" />
    </g>
  );

  return (
    <svg className="frame" aria-hidden viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}>
      <defs>
        <filter id="sfShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter="url(#sfShadow)">
        {pts.top.map((p, i) => <Flower key={`t${i}`} {...p} />)}
        {pts.bottom.map((p, i) => <Flower key={`b${i}`} {...p} />)}
        {pts.left.map((p, i) => <Flower key={`l${i}`} {...p} />)}
        {pts.right.map((p, i) => <Flower key={`r${i}`} {...p} />)}
      </g>
    </svg>
  );
}

/* ------------------------------- Carta ------------------------------ */

function Envelope({ onOpen }: { onOpen: () => void }) {
  const [open, setOpen] = useState(false);

  const handleSeal = () => {
    setOpen(true);
    setTimeout(() => onOpen(), 600);
  };

  return (
    <div className={`envelope ${open ? "open" : ""}`}>
      <div className="env-body" />
      <div className="env-flap" />
      <button className="seal" onClick={handleSeal} aria-label="Abrir carta">
        <span className="seal-wax" />
        <span className="seal-A">A</span>
      </button>
    </div>
  );
}

function Letter({ onSurprise }: { onSurprise: () => void }) {
  return (
    <div className="letter">
      <div className="paper">
        <p className="msg">
          Hola mi bestie, perdón por no poder darte flores en físico esta vez,<br />
          pero espero esto lo pueda compensar.<br />
          Te ama tu cara de rana <span className="heart">&#x2764;&#xFE0E;</span>
        </p>
        <button className="ghost-link" onClick={onSurprise}>
          sorpresa, ábreme
        </button>
      </div>
      <div className="flap-visual" />
    </div>
  );
}

/* ------------------------------- Ramo (final) ------------------------------ */

function Bouquet() {
  // curva del arreglo
  const ARC_AMPLITUDE = 12;
  const centerX = 210;
  const spread = 42;

  // límites laterales para NO dibujar hojas/tallos fuera del ramo
  const X_MIN = 90;
  const X_MAX = 330;

  // y de la "boca" del envoltorio (coincide con la boca del path)
  const MOUTH_Y = 360;
  const CLIP_H = MOUTH_Y - 6;

  const arcY = (i: number, N: number, base: number) => {
    const t = i - (N - 1) / 2;
    const norm = Math.abs(t) / ((N - 1) / 2 || 1);
    return base - ARC_AMPLITUDE * (1 - norm * norm);
  };

  // Flores
  const SUN_N = 7;
  const suns = Array.from({ length: SUN_N }, (_, i) => ({
    cx: centerX + (i - (SUN_N - 1) / 2) * spread,
    cy: arcY(i, SUN_N, 158),
  }));

  const TUL_N = SUN_N + 2;
  const tulips = Array.from({ length: TUL_N }, (_, i) => ({
    cx: centerX + (i - (TUL_N - 1) / 2) * (spread * 0.9),
    cy: arcY(i, TUL_N, 188),
  }));

  // Tulipanes altos de fondo (centrados)
  const TALL_N = 4;
  const tallTulips = Array.from({ length: TALL_N }, (_, i) => ({
    cx: centerX + (i - (TALL_N - 1) / 2) * (spread * 1.05),
    cy: arcY(i, TALL_N, 146),
  }));

  // Posiciones de relleno para hojas curvadas (solo interior)
  const filler = [110, 150, 190, 230, 270, 310];

  const inside = (x: number) => x >= X_MIN && x <= X_MAX;

  return (
    <div className="bouquet">
      <svg className="bouquet-svg" viewBox="0 0 420 540" aria-hidden>
        <defs>
          <linearGradient id="wrapGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#d8ccff" />
            <stop offset="1" stopColor="#b7a4ff" />
          </linearGradient>
          <linearGradient id="ribbonGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#6d28d9" />
            <stop offset="1" stopColor="#5b21b6" />
          </linearGradient>
          <linearGradient id="leafGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#2f7d4a" />
            <stop offset="1" stopColor="#1f5f37" />
          </linearGradient>
          <linearGradient id="tulipPetal" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ffe27d" />
            <stop offset="1" stopColor="#f4c335" />
          </linearGradient>
          <linearGradient id="sunPetal" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ffd770" />
            <stop offset="1" stopColor="#f2b62b" />
          </linearGradient>
          <filter id="bqShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="12" stdDeviation="12" floodOpacity="0.22" />
          </filter>

          {/* Recorte: tallos/hojas SOLO por encima de la boca */}
          <clipPath id="stemClip" clipPathUnits="userSpaceOnUse">
            <rect x="0" y="0" width="420" height={CLIP_H} />
          </clipPath>
        </defs>

        {/* ----- Vegetal clippeado (sin salirse por los lados) ----- */}
        <g clipPath="url(#stemClip)">
          {/* tulipanes altos detrás */}
          {tallTulips.map(({ cx, cy }, i) => (
            <g key={`tb${i}`} transform={`translate(${cx},${cy})`} opacity=".95">
              <path d={`M-3 70 C -6 140 -2 190 0 230`} stroke="#1f6137" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d={`M 3 70 C  6 140  2 190 0 230`} stroke="#1f6137" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M-14 32 C -28 36 -28 62 -14 68 C 2 62 2 36 -14 32 Z" fill="url(#tulipPetal)" />
              <path d="M 14 32 C  28 36  28 62  14 68 C -2 62 -2 36  14 32 Z" fill="url(#tulipPetal)" />
              <path d="M0 28 C -10 36 -10 62 0 70 C 10 62 10 36 0 28 Z" fill="url(#tulipPetal)" />
            </g>
          ))}

          {/* tallos rectos/ligeramente curvos (filtrados por X) */}
          {[...suns.map(s => s.cx), ...tulips.map(t => t.cx)]
            .filter(inside)
            .map((x, i) => (
              <rect key={`st${i}`} x={x - 4} y={220} width="8" height="150" rx="4" fill="#1f6137"
                    transform={`rotate(${(i % 2 ? -10 : 8)}, ${x}, 370)`} />
            ))}

          {/* hojas curvas interiores (sin extremos) */}
          {filler.map((sx, i) => (
            <path key={`curv${i}`} d={`M ${sx} 230 C ${sx - 18} 290, ${sx + 18} 320, ${sx + 6} 370`}
                  stroke="#1f6137" strokeWidth="6" fill="none" strokeLinecap="round" />
          ))}

          {[...suns.map(s => s.cx), ...tulips.map(t => t.cx), ...filler]
            .filter(inside)
            .map((x, i) => (
              <path key={`leafA${i}`}
                    d={`M${x} 310 C ${x + (i % 2 ? 40 : -40)} 270, ${x + (i % 2 ? 48 : -48)} 245, ${x + (i % 2 ? 30 : -30)} 220
                        C ${x + (i % 2 ? 12 : -12)} 250, ${x} 280, ${x} 310 Z`}
                    fill="url(#leafGrad)" opacity=".95" />
            ))}

          {[...suns.map(s => s.cx), ...tulips.map(t => t.cx), ...filler]
            .filter(inside)
            .map((x, i) => (
              <path key={`leafB${i}`}
                    d={`M${x - 10} 320 C ${x + (i % 2 ? -44 : 44)} 290, ${x + (i % 2 ? -34 : 34)} 260, ${x + (i % 2 ? -18 : 18)} 235
                        C ${x - 6} 262, ${x - 6} 290, ${x - 10} 320 Z`}
                    fill="url(#leafGrad)" opacity=".75" />
            ))}
        </g>

        {/* nubecillas (delante de hojas, detrás de tulipanes) */}
        {tulips.map(({ cx, cy }, i) => (
          <g key={`bb${i}`} transform={`translate(${cx},${cy + 36})`} opacity=".98">
            {[
              [-18, 6], [-10, 0], [0, 6], [10, 0], [18, 6], [0, 12], [-12, 12], [12, 12],
            ].map(([dx, dy], k) => (
              <circle key={k} cx={dx} cy={dy} r="7" fill="#ffffff" stroke="#eaeaea" strokeWidth="1" />
            ))}
          </g>
        ))}

        {/* girasoles (detrás de los tulipanes) */}
        {suns.map(({ cx, cy }, i) => (
          <g key={`sun${i}`} transform={`translate(${cx},${cy})`}>
            {new Array(16).fill(0).map((_, k) => (
              <ellipse key={k} cx="0" cy="0" rx="16" ry="26" transform={`rotate(${(k * 360) / 16})`} fill="url(#sunPetal)" />
            ))}
            <circle r="20" fill="#5d3b23" />
            <circle r="11" fill="#6d4428" opacity=".35" />
          </g>
        ))}

        {/* tulipanes al frente */}
        {tulips.map(({ cx, cy }, i) => (
          <g key={`tu${i}`} transform={`translate(${cx},${cy})`}>
            <path d="M-12 0 C -26 4 -26 26 -12 30 C 4 26 4 4 -12 0 Z" fill="url(#tulipPetal)" />
            <path d="M 12 0 C  26 4  26 26  12 30 C -4 26 -4 4  12 0 Z" fill="url(#tulipPetal)" />
            <path d="M0 -4 C -10 2 -10 26 0 32 C 10 26 10 2 0 -4 Z" fill="url(#tulipPetal)" />
            <path d="M0 2 C 0 10 -2 18 0 28" stroke="#e6b93c" strokeOpacity=".7" strokeWidth="2" fill="none" />
            <path d="M-6 6 C -8 12 -8 18 -6 24" stroke="#e6b93c" strokeOpacity=".5" strokeWidth="1.6" fill="none" />
            <path d="M 6 6 C  8 12  8 18  6 24"  stroke="#e6b93c" strokeOpacity=".5" strokeWidth="1.6" fill="none" />
          </g>
        ))}

        {/* Envoltorio + listón */}
        <g filter="url(#bqShadow)">
          <path
            d="M 50 360
               C 135 315, 285 315, 370 360
               L 328 395
               C 340 470, 324 536, 210 548
               C  96 536,  80 470,  92 395
               L 50 360 Z"
            fill="url(#wrapGrad)"
          />
          <path d="M92 395 Q 210 415 328 395" stroke="url(#ribbonGrad)" strokeWidth="6" fill="none" />
          <g transform="translate(210,395)" stroke="url(#ribbonGrad)" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="0" cy="0" r="3" fill="url(#ribbonGrad)" stroke="none" />
            <path d="M 0 0 C -20 -14 -40 -14 -50 0 C -34 8 -24 8 0 0" />
            <path d="M 0 0 C  20 -14  40 -14  50 0 C  34 8  24 8  0 0" />
            <path d="M 0 0 C -4 18 -6 32 10 52" />
            <path d="M 0 0 C  2 16  2 28 -12 46" />
          </g>
        </g>
      </svg>
    </div>
  );
}

/* --------------------------------- App ---------------------------------- */

export default function App() {
  const [stage, setStage] = useState<"closed" | "letter" | "bouquet">("closed");
  const audioRef = useRef<HTMLAudioElement>(null);

  // Pausa el audio si sales del ramo
  useEffect(() => {
    if (stage !== "bouquet") audioRef.current?.pause();
  }, [stage]);

  return (
    <div className="app">
      <SunflowerFrame />

      {/* Audio oculto; cambia la ruta si usas otro nombre */}
      <audio ref={audioRef} src="/cancion.mp3" preload="auto" loop />

      <div className="safe">
        {stage === "closed" && <Envelope onOpen={() => setStage("letter")} />}

        {stage === "letter" && (
          <Letter
            onSurprise={() => {
              setStage("bouquet");
              const el = audioRef.current;
              if (el) {
                el.currentTime = 0;
                el.play().catch(() => {
                  /* si el navegador bloquea, el siguiente click permite reproducir */
                });
              }
            }}
          />
        )}

        {stage === "bouquet" && <Bouquet />}
      </div>
    </div>
  );
}
