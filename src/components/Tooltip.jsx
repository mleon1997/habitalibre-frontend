// src/components/Tooltip.jsx
import React, { useEffect, useId, useMemo, useRef, useState } from "react";

/**
 * Tooltip minimalista, accesible y "no-overwhelming".
 * - Hover / focus para desktop
 * - Tap para mobile (toggle)
 * - Cierra al click fuera / ESC
 *
 * FIX: soporta triggerAs="span" para evitar <button> dentro de <button>
 */
export default function Tooltip({
  label = "Info",
  content = "",
  side = "top", // "top" | "bottom"
  align = "center", // "start" | "center" | "end"
  className = "",
  buttonClassName = "",

  // ✅ NUEVO: "button" (default) o "span" para no anidar botones
  triggerAs = "button", // "button" | "span"
}) {
  const id = useId();
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);

  const posClass = useMemo(() => {
    const base = "absolute z-50 w-[260px] max-w-[70vw]";
    const y = side === "bottom" ? "top-full mt-2" : "bottom-full mb-2";
    const x =
      align === "start"
        ? "left-0"
        : align === "end"
        ? "right-0"
        : "left-1/2 -translate-x-1/2";
    return `${base} ${y} ${x}`;
  }, [side, align]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    function onDocClick(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick, { passive: true });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
    };
  }, []);

  const safeContent = String(content || "").trim();

  const triggerClass =
    buttonClassName ||
    "inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-700/70 bg-slate-950/30 text-slate-300 hover:text-slate-100 hover:border-slate-600 transition";

  const commonTriggerProps = {
    "aria-label": label,
    "aria-describedby": open ? id : undefined,
    onClick: (e) => {
      // evita burbujeo raro si está dentro de otros controles
      e.stopPropagation();
      setOpen((v) => !v);
    },
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
    className: triggerClass,
  };

  return (
    <span ref={wrapRef} className={`relative inline-flex ${className}`}>
      {triggerAs === "span" ? (
        <span
          role="button"
          tabIndex={0}
          {...commonTriggerProps}
          onKeyDown={(e) => {
            // Enter o Space para toggle accesible
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              setOpen((v) => !v);
            }
          }}
        >
          <span className="text-[13px] leading-none">ℹ️</span>
        </span>
      ) : (
        <button type="button" {...commonTriggerProps}>
          <span className="text-[13px] leading-none">ℹ️</span>
        </button>
      )}

      {open && safeContent ? (
        <div
          id={id}
          role="tooltip"
          className={`${posClass} rounded-2xl border border-slate-700/70 bg-slate-950/95 px-3 py-2 shadow-[0_18px_60px_rgba(0,0,0,0.55)]`}
        >
          <p className="text-[12px] leading-relaxed text-slate-200">{safeContent}</p>
        </div>
      ) : null}
    </span>
  );
}
