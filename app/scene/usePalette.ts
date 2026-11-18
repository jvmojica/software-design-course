import { useEffect, useState } from "react";
import { type Palette, readPalette } from "./palette";

/** Current scene palette; re-read when the OS color scheme or the site's theme toggle changes. */
export function usePalette(): Palette {
  const [palette, setPalette] = useState(() => readPalette(document.documentElement));
  useEffect(() => {
    const update = () => setPalette(readPalette(document.documentElement));
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", update);
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => { mq.removeEventListener("change", update); mo.disconnect(); };
  }, []);
  return palette;
}
