// Catch and recover from Storage QuotaExceededError or browser sandbox/iframe block errors
(function() {
  const originalSetItem = Storage.prototype.setItem;
  const originalGetItem = Storage.prototype.getItem;
  const originalRemoveItem = Storage.prototype.removeItem;
  const originalClear = Storage.prototype.clear;

  const memoryFallbackStorage: Record<string, string> = {};

  Storage.prototype.setItem = function(key: string, value: string) {
    try {
      originalSetItem.call(this, key, value);
      delete memoryFallbackStorage[key];
    } catch (error: any) {
      console.warn(`[Storage Wrapper] setItem failed for key "${key}":`, error?.name || error, error?.message || "");

      const isQuotaError = error && (
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        error.code === 22 ||
        error.code === 1014
      );

      if (isQuotaError) {
        const heavyKeys = [
          "pvp_news",
          "pvp_gallery",
          "pvp_campaigns",
          "pvp_team",
          "pvp_users"
        ];

        for (const hk of heavyKeys) {
          try {
            originalRemoveItem.call(this, hk);
          } catch (e) {}
        }

        try {
          originalSetItem.call(this, key, value);
          console.log(`[Storage Wrapper] Successfully saved key "${key}" after storage sweep.`);
          return;
        } catch (retryError: any) {
          console.warn(`[Storage Wrapper] Swipe and retry failed:`, retryError?.message || retryError);
        }
      }

      memoryFallbackStorage[key] = value;
    }
  };

  Storage.prototype.getItem = function(key: string): string | null {
    if (memoryFallbackStorage[key] !== undefined) {
      return memoryFallbackStorage[key];
    }

    try {
      return originalGetItem.call(this, key);
    } catch (e) {
      console.warn(`[Storage Wrapper] getItem failed for key "${key}":`, e);
      return null;
    }
  };

  Storage.prototype.removeItem = function(key: string) {
    try {
      originalRemoveItem.call(this, key);
    } catch (e) {
      console.warn(`[Storage Wrapper] removeItem failed for key "${key}":`, e);
    }

    delete memoryFallbackStorage[key];
  };

  Storage.prototype.clear = function() {
    try {
      originalClear.call(this);
    } catch (e) {
      console.warn(`[Storage Wrapper] clear failed:`, e);
    }

    for (const key in memoryFallbackStorage) {
      delete memoryFallbackStorage[key];
    }
  };
})();

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
