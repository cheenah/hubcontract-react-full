import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

const Privacy = () => {
    const { t } = useLanguage();
    
    return (
      <>
            <div className="privacy-container">
                <article className="news-article">
                    <header className="article-header">
                        <h1 className="article-title">{t('privacy.title')}</h1>
                        <h2 className="article-subtitle">{t('privacy.subtitle')}</h2>
                        <div className="article-meta">
                            <span className="article-author">{t('privacy.author')}</span>
                            <span className="article-date">{t('privacy.date')}</span>
                            <span className="article-category">{t('privacy.category')}</span>
                        </div>
                    </header>

                    <div className="article-content">
                        <section>
                            <h3>{t('privacy.article1.title')}</h3>
                            <p>{t('privacy.article1.p1')}</p>
                            <p>{t('privacy.article1.p2')}</p>
                            <p>{t('privacy.article1.p3')}</p>
                            <p>{t('privacy.article1.p4')}</p>
                        </section>

                        <section>
                            <h3>{t('privacy.article2.title')}</h3>
                            <p>{t('privacy.article2.p1')}</p>
                            <ul>
                                <li>{t('privacy.article2.li1')}</li>
                                <li>{t('privacy.article2.li2')}</li>
                                <li>{t('privacy.article2.li3')}</li>
                                <li>{t('privacy.article2.li4')}</li>
                                <li>{t('privacy.article2.li5')}</li>
                            </ul>
                        </section>

                        <section>
                            <h3>{t('privacy.article3.title')}</h3>
                            <p>{t('privacy.article3.p1')}</p>
                            <ul>
                                <li>{t('privacy.article3.li1')}</li>
                                <li>{t('privacy.article3.li2')}</li>
                                <li>{t('privacy.article3.li3')}</li>
                                <li>{t('privacy.article3.li4')}</li>
                                <li>{t('privacy.article3.li5')}</li>
                                <li>{t('privacy.article3.li6')}</li>
                                <li>{t('privacy.article3.li7')}</li>
                                <li>{t('privacy.article3.li8')}</li>
                            </ul>
                        </section>

                        <section>
                            <h3>{t('privacy.article4.title')}</h3>
                            <p>{t('privacy.article4.p1')}</p>
                            <ul>
                                <li>{t('privacy.article4.li1')}</li>
                                <li>{t('privacy.article4.li2')}</li>
                                <li>{t('privacy.article4.li3')}</li>
                                <li>{t('privacy.article4.li4')}</li>
                            </ul>
                        </section>

                        <section>
                            <h3>{t('privacy.article5.title')}</h3>
                            <p>{t('privacy.article5.p1')}</p>
                            <p>{t('privacy.article5.p2')}</p>
                            <ul>
                                <li>{t('privacy.article5.li1')}</li>
                                <li>{t('privacy.article5.li2')}</li>
                                <li>{t('privacy.article5.li3')}</li>
                                <li>{t('privacy.article5.li4')}</li>
                                <li>{t('privacy.article5.li5')}</li>
                            </ul>
                            <p>{t('privacy.article5.p3')}</p>
                        </section>

                        <section>
                            <h3>{t('privacy.article6.title')}</h3>
                            <p>{t('privacy.article6.p1')}</p>
                            <ul>
                                <li>{t('privacy.article6.li1')}</li>
                                <li>{t('privacy.article6.li2')}</li>
                                <li>{t('privacy.article6.li3')}</li>
                                <li>{t('privacy.article6.li4')}</li>
                            </ul>
                            <p>{t('privacy.article6.p2')}</p>
                            <p>{t('privacy.article6.p3')}</p>
                        </section>

                        <section>
                            <h3>{t('privacy.article7.title')}</h3>
                            <p>{t('privacy.article7.p1')}</p>
                            <ul>
                                <li>{t('privacy.article7.li1')}</li>
                                <li>{t('privacy.article7.li2')}</li>
                                <li>{t('privacy.article7.li3')}</li>
                                <li>{t('privacy.article7.li4')}</li>
                                <li>{t('privacy.article7.li5')}</li>
                            </ul>
                            <p>{t('privacy.article7.p2')}</p>
                            <p>{t('privacy.article7.p3')}</p>
                        </section>

                        <section>
                            <h3>{t('privacy.article8.title')}</h3>
                            <p>{t('privacy.article8.p1')}</p>
                            <p>{t('privacy.article8.p2')}</p>
                        </section>

                        <section>
                            <h3>{t('privacy.article9.title')}</h3>
                            <p>{t('privacy.article9.p1')}</p>
                        </section>

                        <section className="contacts-section">
                            <h3>{t('privacy.article10.title')}</h3>
                            <div className="contacts-block">
                                <p><strong>{t('privacy.article10.resp')}</strong> {t('privacy.author')}</p>
                                <p><strong>{t('privacy.article10.email')}</strong> <a href="mailto:privacy@hubcontract.kz">privacy@hubcontract.kz</a></p>
                                <p><strong>{t('privacy.article10.address')}</strong> {t('privacy.article10.addressValue')}</p>
                                <p><strong>{t('privacy.article10.website')}</strong> <a href="https://www.hubcontract.kz/privacy">www.hubcontract.kz/privacy</a></p>
                            </div>
                        </section>
                    </div>
                </article>
            </div>
            <style jsx>{`
                .privacy-container {
                    background: var(--color-bg-surface);
                    padding: var(--space-12);
                    max-width: 1280px;
                    margin: var(--space-5) auto;
                    font-family: Arial, sans-serif;
                    line-height: var(--line-height-relaxed);
                    color: var(--color-text-secondary);
                }
                .news-article {
                    margin-bottom: 0;
                }
                .article-header {
                    text-align: center;
                    margin-bottom: var(--space-8);
                }
                .article-title {
                    font-size: var(--font-size-4xl);
                    margin-bottom: var(--space-2-5);
                }
                .article-subtitle {
                    font-size: var(--font-size-lg);
                    margin-bottom: var(--space-2-5);
                    color: var(--color-text-muted);
                }
                .article-meta {
                    font-size: var(--font-size-base);
                    color: var(--color-text-placeholder);
                    margin-bottom: var(--space-5);
                }
                .article-meta span {
                    display: block;
                }
                .article-content {
                    font-size: var(--font-size-lg);
                    line-height: var(--line-height-relaxed);
                }
                h3 {
                    font-size: var(--font-size-xl3);
                    margin-top: var(--space-6);
                    margin-bottom: var(--space-4);
                    border-bottom: 1px solid var(--color-border);
                    padding-bottom: var(--space-1-5);
                }
                p {
                    margin-bottom: var(--space-4);
                }
                ul {
                    margin-left: var(--space-5);
                    margin-bottom: var(--space-4);
                }
                li {
                    margin-bottom: var(--space-1-5);
                }
                .contacts-section {
                    margin-top: var(--space-8);
                }
                .contacts-block {
                    background-color: var(--color-bg-subtle);
                    padding: var(--space-4);
                    border-radius: var(--radius-sm);
                    margin-top: var(--space-2-5);
                }
                .contacts-block p {
                    margin: var(--space-1-5) 0;
                }
            `}</style>
      </>
    );
};

export default Privacy;