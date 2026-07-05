'use client';

import { useState } from 'react';
import Image from 'next/image';
import { JerseyVector } from './JerseyVector';
import { JerseyTextOverlay } from './JerseyTextOverlay';
import './jersey-font.css';
import styles from './jersey-preview.module.css';

export type PreviewMode = 'photo' | 'vector';
export type ViewSide = 'front' | 'back' | 'both';

interface JerseyPreviewProps {
  side: 'front' | 'back';
  surname?: string;
  number?: string;
  mode?: PreviewMode;
  className?: string;
}

function displaySurname(surname: string) {
  return surname.trim().toUpperCase();
}

function displayNumber(number: string) {
  return number.trim();
}

export function JerseyPreview({
  side,
  surname = '',
  number = '',
  mode = 'photo',
  className,
}: JerseyPreviewProps) {
  const name = displaySurname(surname);
  const num = displayNumber(number);
  const showName = Boolean(name);
  const showNumber = Boolean(num);
  const rootClass = [styles.jersey, className].filter(Boolean).join(' ');

  if (mode === 'vector') {
    return (
      <div className={rootClass}>
        <JerseyVector side={side} surname={surname} number={number} />
      </div>
    );
  }

  const src = side === 'front' ? '/images/shop/jersey-front.webp' : '/images/shop/jersey-back.webp';

  return (
    <div
      className={rootClass}
      role="img"
      aria-label={
        side === 'front'
          ? `Форма, лицевая сторона${showNumber ? `: номер ${num}` : ''}`
          : `Форма, спина${showName || showNumber ? `: ${[name, num].filter(Boolean).join(' ')}` : ''}`
      }
    >
      <div className={styles.photoFrame}>
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 768px) 94vw, 720px"
          className={styles.photo}
          priority={side === 'back'}
        />

        {side === 'back' && !showName && !showNumber && (
          <div className={styles.placeholderHint} aria-hidden>
            <span>Фамилия и номер</span>
          </div>
        )}

        {side === 'front' && showNumber && (
          <JerseyTextOverlay text={num} kind="number-front" />
        )}

        {side === 'back' && (
          <>
            {showName && <JerseyTextOverlay text={name} kind="name-back" />}
            {showNumber && <JerseyTextOverlay text={num} kind="number-back" />}
          </>
        )}
      </div>
    </div>
  );
}

interface JerseyPreviewPairProps {
  surname?: string;
  number?: string;
  mode?: PreviewMode;
  activeSide?: 'front' | 'back' | 'both';
}

export function JerseyPreviewPair({
  surname,
  number,
  mode = 'photo',
  activeSide = 'both',
}: JerseyPreviewPairProps) {
  const showFront = activeSide === 'front' || activeSide === 'both';
  const showBack = activeSide === 'back' || activeSide === 'both';

  const stacked = activeSide === 'both';

  return (
    <div
      className={[
        styles.pair,
        stacked ? styles.pairStacked : styles.pairSingle,
      ].join(' ')}
    >
      {showBack && (
        <div className={styles.side}>
          <span className={styles.sideLabel}>Сзади</span>
          <JerseyPreview side="back" surname={surname} number={number} mode={mode} />
        </div>
      )}
      {showFront && (
        <div className={styles.side}>
          <span className={styles.sideLabel}>Спереди</span>
          <JerseyPreview side="front" surname={surname} number={number} mode={mode} />
        </div>
      )}
    </div>
  );
}

interface JerseyPreviewStageProps extends JerseyPreviewPairProps {
  viewSide?: ViewSide;
  onViewSideChange?: (side: ViewSide) => void;
}

export function JerseyPreviewStage({
  surname,
  number,
  mode = 'photo',
  viewSide = 'both',
  onViewSideChange,
}: JerseyPreviewStageProps) {
  return (
    <div className={styles.stage}>
      <div className={styles.stageGlow} aria-hidden />
      {onViewSideChange && (
        <div className={styles.viewTabs} role="tablist" aria-label="Вид формы">
          {(['both', 'front', 'back'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={viewSide === tab}
              className={`${styles.viewTab} ${viewSide === tab ? styles.viewTabActive : ''}`}
              onClick={() => onViewSideChange(tab)}
            >
              {tab === 'both' ? 'Обе стороны' : tab === 'front' ? 'Спереди' : 'Сзади'}
            </button>
          ))}
        </div>
      )}
      <JerseyPreviewPair
        surname={surname}
        number={number}
        mode={mode}
        activeSide={viewSide}
      />
    </div>
  );
}

export function useJerseyViewSide(defaultSide: ViewSide = 'both') {
  return useState<ViewSide>(defaultSide);
}
