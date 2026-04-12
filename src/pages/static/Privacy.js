import React from 'react';
import StaticLayout from '../../components/StaticLayout';
import { useLanguage } from '@/context/LanguageContext';

const Privacy = () => {
    const { t } = useLanguage();
    
    return (
        <StaticLayout>
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
                    background: #fff;
                    padding: 50px;
                    max-width: 1280px;
                    margin: 20px auto;
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }
                .news-article {
                    margin-bottom: 0;
                }
                .article-header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .article-title {
                    font-size: 28px;
                    margin-bottom: 10px;
                }
                .article-subtitle {
                    font-size: 18px;
                    margin-bottom: 10px;
                    color: #777;
                }
                .article-meta {
                    font-size: 14px;
                    color: #999;
                    margin-bottom: 20px;
                }
                .article-meta span {
                    display: block;
                }
                .article-content {
                    font-size: 16px;
                    line-height: 1.7;
                }
                h3 {
                    font-size: 20px;
                    margin-top: 25px;
                    margin-bottom: 15px;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 5px;
                }
                p {
                    margin-bottom: 15px;
                }
                ul {
                    margin-left: 20px;
                    margin-bottom: 15px;
                }
                li {
                    margin-bottom: 5px;
                }
                .contacts-section {
                    margin-top: 30px;
                }
                .contacts-block {
                    background-color: #f9f9f9;
                    padding: 15px;
                    border-radius: 5px;
                    margin-top: 10px;
                }
                .contacts-block p {
                    margin: 5px 0;
                }
            `}</style>
        </StaticLayout>
    );
};

export default Privacy;