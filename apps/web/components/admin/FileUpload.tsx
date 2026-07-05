'use client';

import { useRef, useState, type DragEvent } from 'react';
import { Button } from '@favorit/ui';
import { Camera, ImagePlus, Upload } from 'lucide-react';
import { getAccessToken } from '@/lib/api';
import styles from '@/styles/fileUpload.module.css';

interface FileUploadProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  showUrlInput?: boolean;
  hint?: string;
  onUploadComplete?: (url: string) => void;
}

function isImageFile(file: File) {
  return file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name);
}

export function FileUpload({
  label = 'Изображение',
  value,
  onChange,
  disabled,
  showUrlInput = true,
  hint,
  onUploadComplete,
}: FileUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    if (!isImageFile(file)) {
      setError('Выберите изображение (JPEG, PNG, WebP, GIF, HEIC)');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);

      const token = getAccessToken();
      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
        credentials: 'include',
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error?.message ?? `Ошибка загрузки (${res.status})`);
      }
      if (!json?.data?.url) {
        throw new Error('Сервер не вернул ссылку на файл');
      }

      onChange(json.data.url);
      onUploadComplete?.(json.data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить');
    } finally {
      setLoading(false);
    }
  }

  function pickFile(input: HTMLInputElement | null) {
    if (!input || disabled || loading) return;
    input.value = '';
    input.click();
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (disabled || loading) return;
    const file = e.dataTransfer.files?.[0];
    if (file && isImageFile(file)) handleFile(file);
  }

  return (
    <div className={styles.root}>
      <label className={styles.label}>{label}</label>
      {hint && <p className={styles.hint}>{hint}</p>}

      <div
        className={[styles.zone, dragOver ? styles.zoneActive : '', value ? styles.zoneHasImage : '']
          .filter(Boolean)
          .join(' ')}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !loading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        {value ? (
          <img src={value} alt="" className={styles.preview} onError={() => setError('Не удалось показать превью — проверьте ссылку')} />
        ) : (
          <div className={styles.placeholder}>
            <Upload size={28} />
            <span>Перетащите фото сюда</span>
            <span className={styles.placeholderSub}>или выберите файл / сделайте снимок</span>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif"
          className={styles.hiddenInput}
          disabled={disabled || loading}
          onChange={onInputChange}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className={styles.hiddenInput}
          disabled={disabled || loading}
          onChange={onInputChange}
        />

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={loading}
            disabled={disabled}
            onClick={() => pickFile(fileRef.current)}
          >
            <ImagePlus size={16} />
            С компьютера
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={loading}
            disabled={disabled}
            onClick={() => pickFile(cameraRef.current)}
          >
            <Camera size={16} />
            С телефона
          </Button>
          {value && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled || loading}
              onClick={() => {
                onChange('');
                setError('');
              }}
            >
              Убрать
            </Button>
          )}
        </div>
      </div>

      {showUrlInput && (
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setError('');
            onChange(e.target.value);
          }}
          placeholder="или вставьте ссылку на изображение (https://...)"
          disabled={disabled || loading}
          className={styles.urlInput}
        />
      )}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
