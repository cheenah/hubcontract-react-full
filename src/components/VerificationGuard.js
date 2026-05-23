import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { useLanguage } from '@/context/LanguageContext';

const VerificationGuard = ({ children }) => {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const isBlocked = user && !user.documents_verified && user.role !== 'admin';

  const profilePath =
    user?.role === 'customer'   ? '/customer/profile' :
    user?.role === 'contractor' ? '/contractor/profile' :
    '/profile';

  if (!isBlocked) return children;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none">
        {children}
      </div>

      <div className="absolute inset-c-0 z-50 flex items-center justify-center backdrop-blur-sm bg-[var(--color-bg-surface)]/60">
        <div className="
          mx-4 max-w-md w-full
          bg-[var(--color-bg-surface)]
          border border-[var(--color-border)]
          rounded-2xl
          shadow-lg
          px-8 py-8
          flex flex-col items-center gap-4 text-center
        ">
          <div className="
            w-14 h-14 rounded-full
            bg-[var(--color-warning)]/10
            flex items-center justify-center
          ">
            <ShieldAlert size={28} className="text-[var(--color-warning)]" />
          </div>

          <h2 className="
            text-[length:var(--font-size-xl3)]
            font-semibold
            text-[var(--color-text-primary)]
            leading-snug
          ">
            {t('verificationGuard.title')}
          </h2>

          <p className="
            text-[length:var(--font-size-base)]
            text-[var(--color-text-muted)]
            leading-relaxed
          ">
            {t('verificationGuard.message')}
          </p>

          <button
            onClick={() => navigate(profilePath)}
            className="
              mt-1 w-full
              bg-[var(--color-primary)]
              hover:bg-[var(--color-primary-dark)]
              text-[var(--color-text-inverse)]
              text-[length:var(--font-size-base)]
              font-semibold
              rounded-xl
              px-6 py-2.5
              transition-colors duration-150
            "
          >
            {t('verificationGuard.goToDocs')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationGuard;
