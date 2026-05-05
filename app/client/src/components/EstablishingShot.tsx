import { useEffect, useState } from "react";
import { cerebroColors as C } from "@/lib/keepConfig";

const SEEN_KEY = "cerebro.establishingShot.seen";

export default function EstablishingShot() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SEEN_KEY) !== "1";
  });
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const t = window.setTimeout(() => dismiss(), 4500);
    return () => window.clearTimeout(t);
  }, [visible]);

  function dismiss() {
    setFading(true);
    window.setTimeout(() => {
      try {
        window.localStorage.setItem(SEEN_KEY, "1");
      } catch {}
      setVisible(false);
    }, 600);
  }

  if (!visible) return null;

  return (
    <div
      onClick={dismiss}
      className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
      style={{
        background: C.background,
        opacity: fading ? 0 : 1,
        transition: "opacity 600ms ease-out",
      }}
    >
      <img
        src="/sprites/backgrounds/castle-exterior.gif"
        alt=""
        style={{
          width: "min(80vmin, 720px)",
          height: "min(80vmin, 720px)",
          imageRendering: "pixelated",
          filter: "drop-shadow(0 0 40px rgba(0,0,0,0.8))",
        }}
      />
      <div
        className="absolute bottom-10 text-xs uppercase tracking-widest"
        style={{ color: C.textMuted, letterSpacing: "0.3em" }}
      >
        The Keep · Click anywhere to enter
      </div>
    </div>
  );
}
