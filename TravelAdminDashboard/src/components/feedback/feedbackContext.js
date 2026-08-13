import { createContext, useContext } from 'react';

/**
 * Context ve kanca ayrı dosyada: FeedbackProvider.jsx yalnızca bileşen
 * export ettiğinde Vite'ın hızlı yenileme (fast refresh) mekanizması
 * dosyayı doğru şekilde yeniden yükleyebiliyor.
 */
export const FeedbackContext = createContext(null);

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error('useFeedback yalnızca FeedbackProvider içinde kullanılabilir.');
  }
  return ctx;
}
