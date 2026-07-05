'use client';

import './jersey-font.css';

const JERSEY_RED = '#E01226';
const RED = JERSEY_RED;
const RED_DARK = '#C41928';
const WHITE = '#FAFAFA';
const FONT_FAMILY = "'JerseyForm', 'Roboto Condensed', 'Arial Narrow', sans-serif";

interface JerseyVectorProps {
  side: 'front' | 'back';
  surname?: string;
  number?: string;
  className?: string;
}

function displaySurname(surname: string) {
  return surname.trim().toUpperCase();
}

function displayNumber(number: string) {
  return number.trim();
}

function nameFontSize(name: string) {
  if (name.length > 12) return 9;
  if (name.length > 9) return 10;
  if (name.length > 6) return 11;
  return 12;
}

function numberFontSize(num: string, side: 'front' | 'back') {
  if (side === 'front') return num.length >= 2 ? 22 : 26;
  return num.length >= 2 ? 48 : 58;
}

function JerseyBody({ side }: { side: 'front' | 'back' }) {
  return (
    <>
      <defs>
        <linearGradient id="fabric" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor={WHITE} />
          <stop offset="100%" stopColor="#F0F0F0" />
        </linearGradient>
        <linearGradient id="collarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff3d4a" />
          <stop offset="100%" stopColor={RED_DARK} />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodOpacity="0.12" />
        </filter>
        <clipPath id="jerseyClip">
          <path d="M120 52 C120 52 145 38 200 38 L300 38 C355 38 380 52 380 52 L420 95 L395 115 L380 108 L380 420 C380 445 360 460 340 460 L160 460 C140 460 120 445 120 420 L120 108 L95 115 L70 95 Z" />
        </clipPath>
      </defs>

      <g filter="url(#shadow)">
        <path
          d="M120 52 C120 52 145 38 200 38 L300 38 C355 38 380 52 380 52 L420 95 L395 115 L380 108 L380 420 C380 445 360 460 340 460 L160 460 C140 460 120 445 120 420 L120 108 L95 115 L70 95 Z"
          fill="url(#fabric)"
          stroke="#E8E8E8"
          strokeWidth="0.8"
        />

        <path
          d="M175 52 C190 68 210 72 250 72 C290 72 310 68 325 52 L310 58 C295 68 275 72 250 72 C225 72 205 68 190 58 Z"
          fill="url(#collarGrad)"
        />

        <path d="M95 115 L120 108 L118 175 L92 168 Z" fill={RED} />
        <path d="M380 108 L405 115 L408 168 L382 175 Z" fill={RED} />
        <rect x="88" y="168" width="30" height="8" rx="2" fill={RED} />
        <rect x="382" y="168" width="30" height="8" rx="2" fill={RED} />

        <g clipPath="url(#jerseyClip)">
          <path d="M170 280 L250 220 L330 280 L310 280 L250 240 L190 280 Z" fill={RED} opacity="0.85" />
          <path d="M185 310 L250 255 L315 310 L295 310 L250 275 L205 310 Z" fill={RED} opacity="0.75" />
          <path d="M200 340 L250 290 L300 340 L285 340 L250 305 L215 340 Z" fill={RED} opacity="0.65" />
          <rect x="228" y="340" width="14" height="120" fill={RED} />
          <rect x="258" y="340" width="14" height="120" fill={RED} />
        </g>

        {side === 'front' && (
          <>
            <image
              href="/images/shop/favorit-crest.webp"
              x="295"
              y="118"
              width="58"
              height="64"
              preserveAspectRatio="xMidYMid meet"
            />
            <text x="155" y="145" fill={RED} fontSize="14" fontWeight="800" fontStyle="italic" fontFamily="Arial, sans-serif">
              2K
            </text>
            <text x="178" y="145" fill={RED} fontSize="9" fontWeight="700" fontFamily="Arial, sans-serif">
              SPORT
            </text>
          </>
        )}

        {side === 'back' && (
          <text x="250" y="108" fill={RED} fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="Arial, sans-serif" opacity="0.8">
            2K-SPORT
          </text>
        )}
      </g>
    </>
  );
}

export function JerseyVector({ side, surname = '', number = '', className }: JerseyVectorProps) {
  const name = displaySurname(surname);
  const num = displayNumber(number);
  const showName = Boolean(name);
  const showNumber = Boolean(num);
  const rootClass = ['jersey-vector', className].filter(Boolean).join(' ');

  return (
    <svg
      className={rootClass}
      viewBox="0 0 500 520"
      role="img"
      aria-label={
        side === 'front'
          ? `Форма, лицевая сторона: ${num}`
          : `Форма, спина: ${name} ${num}`
      }
    >
      <rect width="500" height="520" fill="transparent" />
      <JerseyBody side={side} />

      {side === 'front' && showNumber && (
        <text
          x="250"
          y="200"
          textAnchor="middle"
          fill={RED}
          fontSize={numberFontSize(num, 'front')}
          fontWeight="700"
          fontFamily={FONT_FAMILY}
          letterSpacing="-1"
          transform="scale(0.75 1) translate(83 0)"
        >
          {num}
        </text>
      )}

      {side === 'back' && (
        <>
          {showName && (
            <text
              x="250"
              y="108"
              textAnchor="middle"
              fill={RED}
              fontSize={nameFontSize(name)}
              fontWeight="700"
              fontFamily={FONT_FAMILY}
              letterSpacing="1"
            >
              {name}
            </text>
          )}
          {showNumber && (
            <text
              x="250"
              y="228"
              textAnchor="middle"
              fill={RED}
              fontSize={numberFontSize(num, 'back')}
              fontWeight="700"
              fontFamily={FONT_FAMILY}
              letterSpacing="-2"
              transform="scale(0.8 1) translate(62 0)"
            >
              {num}
            </text>
          )}
        </>
      )}
    </svg>
  );
}
