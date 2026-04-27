import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import Layout from '@/components/Layout';
import { ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const { user } = useContext(AppContext);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const content = (
    <div className="flex flex-col items-center justify-center py-[var(--space-20)] px-[var(--space-6)] text-center">
      <span className="font-[var(--font-weight-black)] text-[var(--color-primary)] leading-none mb-[var(--space-5)]" style={{ fontSize: '8rem' }}>
        404
      </span>
      <h1 className="text-[var(--font-size-4xl)] font-[var(--font-weight-bold)] text-[var(--color-text-primary)] mb-[var(--space-3)]">
        {t('errors.notFound.title')}
      </h1>
      <p className="text-[var(--color-text-muted)] text-[var(--font-size-lg)] mb-[var(--space-8)] max-w-md">
        {t('errors.notFound.description')}
      </p>
      {user ? (
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-[var(--space-2)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-[var(--color-text-inverse)] rounded-[var(--radius-xl)] font-[var(--font-weight-semibold)] text-[var(--font-size-base)] px-[var(--space-6)] py-[var(--space-3)] border-none cursor-pointer transition-colors"
        >
          <ArrowLeft size={18} />
          {t('errors.back')}
        </button>
      ) : (
        <Link
          to="/"
          className="inline-flex items-center gap-[var(--space-2)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-[var(--color-text-inverse)] rounded-[var(--radius-xl)] font-[var(--font-weight-semibold)] text-[var(--font-size-base)] px-[var(--space-6)] py-[var(--space-3)] no-underline transition-colors"
        >
          {t('errors.goHome')}
        </Link>
      )}
    </div>
  );

  if (user) {
    return <Layout>{content}</Layout>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-subtle)] flex items-center justify-center">
      {content}
    </div>
  );
};

export default NotFound;
