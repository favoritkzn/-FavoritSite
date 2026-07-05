'use client';

import { useEffect, useRef } from 'react';
import styles from './jersey-text-overlay.module.css';

/** Красный с референсного макета (среднее по нанесению) */
const JERSEY_RED = '#E01226';

type OverlayKind = 'name-back' | 'number-back' | 'number-front';

interface JerseyTextOverlayProps {
  text: string;
  kind: OverlayKind;
  className?: string;
}

interface LayoutSpec {
  y: number;
  fontScale: number;
  scaleX: number;
  letterSpacing: number;
  maxWidth: number;
  fontFamily: string;
  fontWeight: number;
}

const LAYOUT: Record<OverlayKind, LayoutSpec> = {
  'name-back': {
    y: 0.21,
    fontScale: 0.072,
    scaleX: 0.94,
    letterSpacing: 0.05,
    maxWidth: 0.9,
    fontFamily: 'JerseyFormName, "Roboto Condensed", sans-serif',
    fontWeight: 700,
  },
  'number-back': {
    y: 0.525,
    fontScale: 0.318,
    scaleX: 0.76,
    letterSpacing: -0.04,
    maxWidth: 0.75,
    fontFamily: 'JerseyFormNumber, "Roboto Condensed", sans-serif',
    fontWeight: 900,
  },
  'number-front': {
    y: 0.385,
    fontScale: 0.152,
    scaleX: 0.72,
    letterSpacing: -0.05,
    maxWidth: 0.45,
    fontFamily: 'JerseyFormNumber, "Roboto Condensed", sans-serif',
    fontWeight: 900,
  },
};

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  height: number,
  spec: LayoutSpec,
) {
  let size = Math.round(height * spec.fontScale);
  const min = Math.round(height * spec.fontScale * 0.55);
  const maxWidth = height * spec.maxWidth;

  while (size > min) {
    ctx.font = `${spec.fontWeight} ${size}px ${spec.fontFamily}`;
    const width = ctx.measureText(text).width * spec.scaleX + text.length * size * spec.letterSpacing;
    if (width <= maxWidth) break;
    size -= 1;
  }

  return size;
}

function drawText(
  canvas: HTMLCanvasElement,
  text: string,
  kind: OverlayKind,
) {
  const spec = LAYOUT[kind];
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = JERSEY_RED;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const fontSize = fitFontSize(ctx, text, height, spec);
  ctx.font = `${spec.fontWeight} ${fontSize}px ${spec.fontFamily}`;

  const x = width / 2;
  const y = height * spec.y;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(spec.scaleX, 1);

  if (spec.letterSpacing !== 0) {
    const chars = [...text];
    const totalWidth =
      chars.reduce((sum, ch) => sum + ctx.measureText(ch).width, 0) +
      spec.letterSpacing * fontSize * Math.max(0, chars.length - 1);
    let cursor = -totalWidth / 2;
    for (const ch of chars) {
      const chWidth = ctx.measureText(ch).width;
      ctx.fillText(ch, cursor + chWidth / 2, 0);
      cursor += chWidth + spec.letterSpacing * fontSize;
    }
  } else {
    ctx.fillText(text, 0, 0);
  }

  ctx.restore();
}

export function JerseyTextOverlay({ text, kind, className }: JerseyTextOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !text) return;

    let cancelled = false;
    const spec = LAYOUT[kind];

    const render = async () => {
      if ('fonts' in document) {
        try {
          await document.fonts.load(`${spec.fontWeight} 48px ${spec.fontFamily}`);
          await document.fonts.ready;
        } catch {
          // fallback to system fonts
        }
      }
      if (!cancelled) {
        drawText(canvas, text, kind);
      }
    };

    void render();

    const observer = new ResizeObserver(() => {
      drawText(canvas, text, kind);
    });
    observer.observe(canvas);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [text, kind]);

  if (!text) return null;

  return (
    <canvas
      ref={canvasRef}
      className={[styles.overlay, className].filter(Boolean).join(' ')}
      aria-hidden
    />
  );
}
