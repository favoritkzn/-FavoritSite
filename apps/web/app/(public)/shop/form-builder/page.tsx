'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@favorit/ui';
import {
  JerseyPreviewStage,
  useJerseyViewSide,
} from '@/components/shop/JerseyPreview';
import previewStyles from '@/components/shop/jersey-preview.module.css';
import { useCartStore } from '@/stores/cart';
import { JERSEY_PRODUCT_ID, JERSEY_PRICE } from '@/lib/shop';
import { formatPrice } from '@/lib/format';
import {
  getOccupiedJerseyNumbers,
  isJerseyNumberInRange,
  validateJersey,
  type JerseyValidationResult,
} from '@/lib/validate-jersey';
import pub from '@/styles/public.module.css';
import fb from './form-builder.module.css';

const SIZES = ['XS', 'S', 'M', 'L', 'XL'] as const;

const SIZE_GUIDE: Record<(typeof SIZES)[number], string> = {
  XS: '128–140 см',
  S: '140–152 см',
  M: '152–164 см',
  L: '164–176 см',
  XL: '176+ см',
};

type ValidationState = 'idle' | 'checking' | 'done';

function clampJerseyNumberInput(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 2);
  if (!digits) return '';
  const num = parseInt(digits, 10);
  if (num > 99) return '99';
  return String(num);
}

function StatusIcon({ state }: { state: 'ok' | 'error' | 'pending' }) {
  if (state === 'pending') {
    return (
      <svg className={fb.validationIcon} viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
      </svg>
    );
  }
  if (state === 'ok') {
    return (
      <svg className={fb.validationIcon} viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M3.5 8.5L6.5 11.5L12.5 4.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg className={fb.validationIcon} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 5v4M8 11.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function FormBuilderPage() {
  const [surname, setSurname] = useState('');
  const [number, setNumber] = useState('');
  const [size, setSize] = useState<(typeof SIZES)[number]>('M');
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [validation, setValidation] = useState<JerseyValidationResult | null>(null);
  const [occupiedList, setOccupiedList] = useState<Array<{ number: number; holder: string }>>([]);
  const [added, setAdded] = useState(false);
  const [viewSide, setViewSide] = useJerseyViewSide('both');

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    void getOccupiedJerseyNumbers().then(setOccupiedList).catch(() => setOccupiedList([]));
  }, []);

  const runValidation = useCallback(async (nextSurname: string, nextNumber: string) => {
    if (!nextSurname.trim() && !nextNumber.trim()) {
      setValidation(null);
      setValidationState('idle');
      return;
    }

    setValidationState('checking');
    try {
      const result = await validateJersey(nextSurname, nextNumber);
      setValidation(result);
      setValidationState('done');
    } catch {
      setValidation({
        valid: false,
        reason: 'surname_not_found',
        matches: 0,
        occupiedNumbers: [],
      });
      setValidationState('done');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void runValidation(surname, number);
    }, 400);
    return () => clearTimeout(timer);
  }, [surname, number, runValidation]);

  useEffect(() => {
    if (added) {
      const timer = setTimeout(() => setAdded(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [added]);

  const numberInRange = isJerseyNumberInRange(number);
  const canSubmit = validation?.valid === true && numberInRange;

  const handleNumberChange = (raw: string) => {
    setNumber(clampJerseyNumberInput(raw));
  };

  const handleAdd = () => {
    if (!canSubmit) return;
    addItem({
      lineId: `jersey-${Date.now()}`,
      productId: JERSEY_PRODUCT_ID,
      name: `Форма «Фаворит» ${size} — ${surname.toUpperCase()} ${number}`,
      price: JERSEY_PRICE,
      size,
      customization: { surname: surname.toUpperCase(), number },
      imageUrl: '/images/shop/jersey-back.webp',
    });
    setAdded(true);
  };

  const validationMessage = (() => {
    if (!surname.trim()) {
      return 'Введите фамилию ученика, зарегистрированного в клубе';
    }
    if (validationState === 'checking') {
      return 'Проверяем данные в базе клуба…';
    }
    if (!number.trim()) {
      return validation?.matches
        ? 'Укажите номер от 1 до 99'
        : 'Такой фамилии нет в базе клуба';
    }
    if (!numberInRange) {
      return 'Номер должен быть от 1 до 99';
    }
    if (validation?.reason === 'number_taken') {
      return `Номер ${number} уже занят${validation.takenBy ? ` (${validation.takenBy})` : ''}`;
    }
    if (validation?.valid) {
      if (validation.matches === 1) {
        return 'Всё готово — можно оформить заказ';
      }
      return `Найдено учеников с этой фамилией: ${validation.matches}`;
    }
    if (validation?.reason === 'surname_not_found') {
      return 'Заказ доступен только для зарегистрированных учеников клуба';
    }
    return null;
  })();

  const validationStatus: 'ok' | 'error' | 'pending' = (() => {
    if (validationState === 'checking' || !surname.trim()) return 'pending';
    if (validation?.valid && numberInRange) return 'ok';
    if (validationState === 'done' && surname.trim()) return 'error';
    return 'pending';
  })();

  const validationClass =
    validationStatus === 'ok'
      ? fb.validationOk
      : validationStatus === 'error'
        ? fb.validationError
        : fb.validationPending;

  return (
    <div className={`${pub.container} ${fb.page}`}>
      <div className={fb.hero}>
        <span className={fb.heroBadge}>Игровая форма «Фаворит»</span>
        <h1 className={pub.title}>Конструктор формы</h1>
        <p className={pub.subtitle} style={{ marginBottom: 0 }}>
          Соберите персональную форму с фамилией и номером. Превью обновляется в реальном времени —
          проверьте обе стороны перед заказом.
        </p>
      </div>

      <div className={previewStyles.builderLayout}>
        <aside className={previewStyles.builderPreview}>
          <JerseyPreviewStage
            surname={surname}
            number={number}
            viewSide={viewSide}
            onViewSideChange={setViewSide}
          />
        </aside>

        <div className={fb.panel}>
          <div className={fb.panelHeader}>
            <h2 className={fb.panelTitle}>Настройки</h2>
            <p className={fb.panelHint}>
              Заполните данные ученика. Номер на форме — от 1 до 99, занятые номера недоступны.
            </p>
          </div>

          <div className={fb.panelBody}>
            <div className={fb.step}>
              <div className={fb.stepLabel}>
                <span className={fb.stepNum}>1</span>
                Размер
              </div>
              <div className={fb.sizeGrid}>
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`${fb.sizeBtn} ${size === s ? fb.sizeBtnActive : ''}`}
                    aria-pressed={size === s}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className={fb.sizeGuide}>
                Рост: {SIZE_GUIDE[size]}. При сомнениях выберите размер больше — дети быстро растут.
              </p>
            </div>

            <div className={fb.step}>
              <div className={fb.stepLabel}>
                <span className={fb.stepNum}>2</span>
                Фамилия
              </div>
              <Input
                label="Фамилия на спине"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="Карякин"
                maxLength={12}
                autoComplete="family-name"
              />
            </div>

            <div className={fb.step}>
              <div className={fb.stepLabel}>
                <span className={fb.stepNum}>3</span>
                Номер
              </div>
              <Input
                label="Номер на форме (1–99)"
                inputMode="numeric"
                value={number}
                onChange={(e) => handleNumberChange(e.target.value)}
                placeholder="9"
              />
              {validationMessage && (
                <p className={`${fb.validation} ${validationClass}`}>
                  <StatusIcon state={validationStatus} />
                  {validationMessage}
                </p>
              )}
            </div>

            {occupiedList.length > 0 && (
              <div className={fb.occupiedSection}>
                <p className={fb.occupiedTitle}>Занятые номера в клубе</p>
                <div className={fb.occupiedGrid}>
                  {occupiedList.map((item) => (
                    <span
                      key={item.number}
                      title={item.holder}
                      className={`${fb.occupiedChip} ${number === String(item.number) ? fb.occupiedChipTaken : ''}`}
                    >
                      {item.number} · {item.holder}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className={fb.priceCard}>
              <div>
                <p className={fb.priceLabel}>Итого за форму</p>
                <p className={fb.priceValue}>{formatPrice(JERSEY_PRICE)}</p>
                <p className={fb.priceNote}>
                  {size} · {surname.trim() ? surname.toUpperCase() : '—'} ·{' '}
                  {number.trim() || '—'}
                </p>
              </div>
            </div>

            {added && (
              <div className={fb.addedBanner} role="status">
                <StatusIcon state="ok" />
                Форма добавлена в корзину
              </div>
            )}

            <div className={fb.actions}>
              <div className={fb.actionsRow}>
                <Button onClick={handleAdd} disabled={!canSubmit} fullWidth>
                  В корзину
                </Button>
                <Link href="/shop/cart" style={{ display: 'contents' }}>
                  <Button variant="secondary" fullWidth>
                    Корзина
                  </Button>
                </Link>
              </div>
              <Link href="/shop" style={{ textAlign: 'center', fontSize: 14, color: 'var(--color-text-secondary)' }}>
                ← Вернуться в магазин
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
