import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

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
