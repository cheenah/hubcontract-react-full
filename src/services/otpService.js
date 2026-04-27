import axios from 'axios';
import { BASE_URL as API } from '@/services/api';

/**
 * Повторная отправка OTP-кода.
 * @param {string} email
 * @param {string} [captcha_token]
 * @returns {Promise<void>}
 * @throws error.response с полем detail и status
 */
export async function resendOtp(email, captcha_token) {
  if (!email) throw new Error('Email не указан');
  await axios.post(`${API}/auth/resend-verification`, {
    email,
    ...(captcha_token ? { captcha_token } : {}),
  });
}
