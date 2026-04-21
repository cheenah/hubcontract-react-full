import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useLanguage } from '@/context/LanguageContext';
import { toast } from "sonner";
import useRecaptcha from '@/hooks/useRecaptcha';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const Registration = ({ setShowAuth }) => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { getToken } = useRecaptcha();
    const [loading, setLoading] = useState(false);

    const [registerForm, setRegisterForm] = useState({
        email: '',
        password: '',
        company_bin: '',
        phone: '',
        company_name: '',
        role: 'contractor'
    });

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Токен запрашивается здесь — непосредственно в момент нажатия кнопки,
            // чтобы не истёк 2-минутный TTL
            const captcha_token = await getToken('registration');

            await axios.post(`${API}/auth/register`, {
                ...registerForm,
                captcha_token,
            });

            toast.success('Регистрация успешна! Проверьте email для подтверждения.');
            navigate(`/verify-email?email=${encodeURIComponent(registerForm.email)}`);
        } catch (error) {
            const status = error.response?.status;
            const detail = error.response?.data?.detail;

            if (status === 403 && detail?.toLowerCase().includes('скоринг')) {
                toast.error(
                    'Система защиты посчитала действие подозрительным. ' +
                    'Попробуйте обновить страницу и повторить.',
                    { duration: 6000 }
                );
            } else {
                toast.error(detail || 'Ошибка регистрации');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
         <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 bg-[var(--color-bg-warm)]">
  <div className="container mx-auto max-w-[1100px] w-full bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden flex flex-col md:flex-row p-8">

                    <div className="w-full p-8 md:p-12 lg:p-16">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                {t('auth.register')}
                            </h1>
                            <p className="text-gray-500 mt-2">{t('common.joinEcosystem')}</p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="form-field">
                                    <Label htmlFor="register-email">{t('auth.email')}</Label>
                                    <Input
                                        id="register-email"
                                        type="email"
                                        className="h-11 mt-1"
                                        placeholder="example@mail.com"
                                        value={registerForm.email}
                                        onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-field">
                                    <Label htmlFor="register-password">{t('auth.password')}</Label>
                                    <Input
                                        id="register-password"
                                        type="password"
                                        className="h-11 mt-1"
                                        placeholder="••••••••"
                                        value={registerForm.password}
                                        onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="form-field">
                                    <Label htmlFor="company-bin">{t('auth.companyBin')}</Label>
                                    <Input
                                        id="company-bin"
                                        type="text"
                                        className="h-11 mt-1"
                                        placeholder={t('auth.binPlaceholder')}
                                        value={registerForm.company_bin}
                                        onChange={(e) => setRegisterForm({...registerForm, company_bin: e.target.value})}
                                        required
                                        maxLength={12}
                                    />
                                </div>
                                <div className="form-field">
                                    <Label htmlFor="phone">{t('auth.phone')}</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        className="h-11 mt-1"
                                        placeholder="+7 (___) ___ __ __"
                                        value={registerForm.phone}
                                        onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-field">
                                <Label htmlFor="company-name">{t('auth.companyName')}</Label>
                                <Input
                                    id="company-name"
                                    type="text"
                                    className="h-11 mt-1"
                                    placeholder="ТОО 'Ваша Компания'"
                                    value={registerForm.company_name}
                                    onChange={(e) => setRegisterForm({...registerForm, company_name: e.target.value})}
                                />
                            </div>

                            <div className="form-field">
                                <Label htmlFor="role">{t('auth.accountType')}</Label>
                                <Select
                                    value={registerForm.role}
                                    onValueChange={(value) => setRegisterForm({...registerForm, role: value})}
                                >
                                    <SelectTrigger className="h-11 mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="customer">{t('auth.customer')}</SelectItem>
                                        <SelectItem value="contractor">{t('auth.contractor')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold rounded-xl mt-4"
                                disabled={loading}
                            >
                                {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
                            </Button>

                            <p className="text-center mt-3" style={{ fontSize: 'var(--font-size-xxs)', color: 'var(--color-text-placeholder)' }}>
                                Эта форма защищена{' '}
                                <a
                                    href="https://policies.google.com/privacy"
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: 'var(--color-text-muted)', textDecoration: 'underline' }}
                                >
                                    reCAPTCHA v3
                                </a>
                                {' '}от Google
                            </p>
                        </form>
                    </div>


                </div>
            </div>
    );
};

export default Registration;