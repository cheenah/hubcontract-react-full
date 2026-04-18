import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useCallback } from 'react';

/**
 * Returns an async function `getToken(action)` that executes reCAPTCHA v3
 * and resolves with the captcha_token to include in API requests.
 *
 * Usage:
 *   const { getToken } = useRecaptcha();
 *   const captcha_token = await getToken('login');
 *   axios.post('/auth/login', { ...form, captcha_token });
 */
const useRecaptcha = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const getToken = useCallback(
    async (action = 'submit') => {
      // В dev-режиме капча пропускается — бэкенд должен делать то же самое
      if (process.env.REACT_APP_SKIP_CAPTCHA === 'true') {
        return 'dev-skip';
      }
      if (!executeRecaptcha) {
        throw new Error('reCAPTCHA не загрузилась. Обновите страницу.');
      }
      const token = await executeRecaptcha(action);
      if (!token) {
        throw new Error('Не удалось получить токен reCAPTCHA. Проверьте site key.');
      }
      return token;
    },
    [executeRecaptcha]
  );

  return { getToken };
};

export default useRecaptcha;
