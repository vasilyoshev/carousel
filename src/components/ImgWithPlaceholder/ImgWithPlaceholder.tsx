import { useState } from 'react';

import type { ImgWithPlaceholderProps } from '../../interfaces/ImgWithPlaceholderProps';
import type { ImageLoadState } from '../../types/ImageLoadState';

import styles from './ImgWithPlaceholder.module.scss';

export const ImgWithPlaceholder = ({ src, alt }: ImgWithPlaceholderProps) => {
  const [state, setState] = useState<ImageLoadState>('loading');
  const [retryKey, setRetryKey] = useState(0);

  const handleRetry = () => {
    setState('loading');
    setRetryKey((prev) => prev + 1);
  };

  const ErrorBox = () => (
    <div className={styles.errorBox}>
      <span className={styles.errorText}>Failed to load</span>
      <button className={styles.retryBtn} onClick={handleRetry}>
        Retry
      </button>
    </div>
  );

  return (
    <div className={styles.frame}>
      <img
        key={retryKey}
        className={`${styles.img} ${state !== 'loaded' ? styles.imgHidden : ''}`}
        src={src}
        alt={alt}
        onLoad={() => setState('loaded')}
        onError={() => setState('error')}
        loading="lazy"
        decoding="async"
      />

      {state !== 'loaded' && (
        <div className={styles.overlay}>
          {state === 'error' ? <ErrorBox /> : <span className={styles.spinner} />}
        </div>
      )}
    </div>
  );
};
