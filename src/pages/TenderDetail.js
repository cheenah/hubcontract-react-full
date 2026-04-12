import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';
import {toast} from 'sonner';
import {AppContext} from '@/App';
import {useLanguage} from '@/context/LanguageContext';
import Layout from '@/components/Layout';
import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import {Calendar, MapPin, DollarSign, FileText, Banknote, Download} from 'lucide-react';
import StaticLayout from "@/components/StaticLayout";

const TenderDetail = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const {user, API} = React.useContext(AppContext);
    const {t, language} = useLanguage();
    const [tender, setTender] = useState(null);
    const [bids, setBids] = useState([]);
    const [showBidDialog, setShowBidDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submittingBid, setSubmittingBid] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [bidForm, setBidForm] = useState({
        price: '',
        proposal: '',
        delivery_time: '',
        documents: []
    });

    useEffect(() => {
        fetchTenderDetails();
    }, [id]);
    const {isAuth} = React.useContext(AppContext);
    const fetchTenderDetails = async () => {
        try {
            const tenderResponse = await axios.get(`${API}/tenders/${id}`);
            setTender(tenderResponse.data);

            if (user && user.role === 'customer' && tenderResponse.data.customer_id === user.id) {
                const bidsResponse = await axios.get(`${API}/bids/tender/${id}`);
                setBids(bidsResponse.data);
            }
        } catch (error) {
            toast.error(t('common.error'));
            navigate('/tenders');
        } finally {
            setLoading(false);
        }
    };

    const getLocalizedField = (item, field) => {
        if (!item) return '';
        if (language === 'ru') return item[field] || '';
        return item[`${field}_${language}`] || item[field] || '';
    };

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);
        const uploadedFiles = [];

        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                toast.error(`${file.name} ${t('tenderDetail.fileExceedsLimit')}`);
                continue;
            }

            const base64 = await convertToBase64(file);
            uploadedFiles.push({
                filename: file.name,
                content: base64,
                type: file.type,
                size: file.size.toString()
            });
        }

        setAttachedFiles([...attachedFiles, ...uploadedFiles]);
    };
    const linkStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        border: '0.5px solid var(--color-border-secondary)',
        borderRadius: '8px',
        textDecoration: 'none',
        color: 'var(--color-text-primary)',
        background: 'var(--color-background-secondary)',
        fontSize: '14px'
    };

    const iconStyle = {
        color: 'var(--color-text-secondary)',
        flexShrink: 0
    };
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => resolve(fileReader.result);
            fileReader.onerror = (error) => reject(error);
        });
    };

    const removeFile = (index) => {
        const newFiles = attachedFiles.filter((_, i) => i !== index);
        setAttachedFiles(newFiles);
    };

    const handleSubmitBid = async (e) => {
        e.preventDefault();

        // Validation
        if (!agreeToTerms) {
            toast.error(t('tenderDetail.agreeToTermsRequired'));
            return;
        }

        const bidPrice = parseFloat(bidForm.price);

        if (!bidForm.price || bidPrice <= 0) {
            toast.error(t('tenderDetail.invalidPrice'));
            return;
        }

        // Check if bid price exceeds tender budget
        if (bidPrice > tender.budget) {
            toast.error(t('tenderDetail.priceExceedsBudget'));
            return;
        }

        if (!bidForm.delivery_time || parseInt(bidForm.delivery_time) <= 0) {
            toast.error(t('tenderDetail.deliveryTimeRequired'));
            return;
        }

        if (!bidForm.proposal || bidForm.proposal.length < 50) {
            toast.error(t('tenderDetail.proposalTooShort'));
            return;
        }

        // Check if tender is still accepting bids
        const now = new Date();
        if (tender.deadline) {
            const deadline = new Date(tender.deadline);
            if (now > deadline) {
                toast.error(t('tenderDetail.deadlinePassed'));
                return;
            }
        }

        setSubmittingBid(true);

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API}/bids`,
                {
                    tender_id: id,
                    price: bidPrice,
                    proposal: bidForm.proposal,
                    delivery_time: bidForm.delivery_time,
                    documents: attachedFiles
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            toast.success(t('tenderDetail.bidSubmitSuccess'));
            setShowBidDialog(false);
            setBidForm({price: '', proposal: '', delivery_time: ''});
            setAttachedFiles([]);
            setAgreeToTerms(false);

            // Refresh tender details to show updated info
            fetchTenderDetails();
        } catch (error) {
            const errorMsg = error.response?.data?.detail || t('tenderDetail.bidSubmitError');
            toast.error(errorMsg);
        } finally {
            setSubmittingBid(false);
        }
    };

    const handleSelectWinner = async () => {
        try {
            await axios.post(`${API}/bids/${id}/select-winner`);
            toast.success(t('common.success'));
            fetchTenderDetails();
        } catch (error) {
            toast.error(error.response?.data?.detail || t('common.error'));
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            </Layout>
        );
    }

    if (!tender) return null;

    const isOwner = user && user.role === 'customer' && tender.customer_id === user.id;
    const canBid = user && user.role === 'contractor' &&
        (tender.status === 'active' || tender.status === 'published_receiving_proposals' || tender.status === 'published');


    const getStatusLabel = (status) => t(`status.${status}`);
    const getTypeLabel = (type) => {
        const map = {
            price_proposals: t('tenderList.priceProposals'),
            open_competition: t('tenderList.openCompetition'),
            auction: t('tenderList.auction'),
            single_source: t('tenderList.singleSource'),
        };
        return map[type] || type.replace('_', ' ');
    };
    // console.log(tender)
    const getCategoryLabel = (category) => {
        const map = {
            construction: t('tenderList.construction'),
            it: t('tenderList.itServices'),
            consulting: t('tenderList.consulting'),
            logistics: t('tenderList.logistics'),
        };
        return map[category] || category;
    };
    if (!isAuth) {
        return (
            <StaticLayout>
                <div className="tender-detail-container" data-testid="tender-detail">
                    <div className="tender-header-section">
                        <div>
                            <h1 className="tender-title" data-testid="tender-title">{getLocalizedField(tender, 'title')}</h1>
                            <div className="tender-meta">
              <span className={`status-badge status-${tender.status}`}>
                {getStatusLabel(tender.status)}
              </span>
                                <span className="tender-type">{getTypeLabel(tender.tender_type)}</span>
                            </div>
                        </div>
                        {canBid && (
                            <Button
                                onClick={() => navigate(`/tenders/${tender.id}/submit-bid`)}
                                className="neon-button-filled"
                                data-testid="submit-bid-btn"
                            >
                                {t('tenderDetail.submitBid')}
                            </Button>
                        )}
                        {isOwner && tender.status === 'active' && bids.filter(b => b.status === 'stage1_approved').length > 0 && (
                            <Button
                                onClick={handleSelectWinner}
                                className="neon-button-filled"
                                data-testid="select-winner-btn"
                            >
                                {t('tenderDetail.selectWinner')}
                            </Button>
                        )}
                        {/* Показать протокол для закрытых и завершенных тендеров */}
                        {(tender.status === 'closed' || tender.status === 'failed') && (
                            <Button
                                onClick={() => navigate(`/protocol/${id}`)}
                                className="neon-button-filled"
                                data-testid="view-protocol-btn"
                            >
                                <FileText size={16} style={{marginRight: '8px'}}/>
                                {t('tenderDetail.viewProtocol')}
                            </Button>
                        )}
                    </div>

                    <div className="tender-content">
                        <Card className="tender-info-card neon-card">
                            <h2 className="section-title">{t('tenderDetail.tenderInfo')}</h2>

                            <div className="info-grid">
                                <div className="info-item">
                                    <Banknote className="info-icon"/>
                                    <div>
                                        <p className="info-label">{t('tenderList.budget')}</p>
                                        <p className="info-value">{tender.budget.toLocaleString()} $</p>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <Calendar className="info-icon"/>
                                    <div>
                                        <p className="info-label">{t('tenderDetail.deadline')}</p>
                                        <p className="info-value">{new Date(tender.deadline).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <MapPin className="info-icon"/>
                                    <div>
                                        <p className="info-label">{t('tenderList.region')}</p>
                                        <p className="info-value">{tender.region}</p>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <FileText className="info-icon"/>
                                    <div>
                                        <p className="info-label">{t('tenderList.category')}</p>
                                        <p className="info-value">{getCategoryLabel(tender.category)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="description-section">
                                <h3 className="subsection-title">{t('tenderDetail.description')}</h3>
                                <p className="description-text">{getLocalizedField(tender, 'description')}</p>
                            </div>

                            <div className="description-section">
                                <h3 className="subsection-title">{t('tenderDetail.technicalSpecs')}</h3>
                                <p className="description-text">{getLocalizedField(tender, 'technical_specs')}</p>
                            </div>
    {String(tender?.id).toLowerCase() === '508e1745-94d6-40ca-9bd5-1e09327ad4f8' ? (
                            <div className="description-section">
                                <h3 className="subsection-title">{t('tenderDetail.documents')}</h3>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px'}}>
                                    {[
                                        {name: t('tenderDetail.document1'), url: '/documents/tz.pdf'},
                                        {name: t('tenderDetail.document2'), url: '/documents/tender_announcement.pdf'},
                                        {name: t('tenderDetail.document3'), url: '/documents/press.pdf'},
                                        {name: t('tenderDetail.document4'), url: '/documents/agreement.pdf'},
                                    ].map((doc, idx) => (
                                        <a key={idx} href={doc.url} download style={linkStyle}>
                                            <FileText size={16} style={iconStyle}/>
                                            <span style={{flex: 1}}>{doc.name}</span>
                                            <Download size={15} style={iconStyle}/>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            (tender?.documents && tender.documents.length > 0) ? (
                                <div className="description-section">
                                    <h3 className="subsection-title">{t('tenderDetail.documents')}</h3>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px',
                                        marginTop: '8px'
                                    }}>
                                        {tender.documents.map((doc, index) => (
                                            <a key={index} href={doc.url} download style={linkStyle}>
                                                <FileText size={16} style={iconStyle}/>
                                                <span style={{flex: 1}}>{doc.name || `${t('tenderDetail.documentFallback')} ${index + 1}`}</span>
                                                <Download size={15} style={iconStyle}/>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ) : null
                        )}
                            {tender.requirements && tender.requirements.length > 0 && (
                                <div className="description-section">
                                    <h3 className="subsection-title">{t('tenderDetail.requirements')}</h3>
                                    <ul className="requirements-list">
                                        {tender.requirements.map((req, idx) => (
                                            <li key={idx}>{req}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </Card>

                        {isOwner && bids.length > 0 && (
                            <Card className="bids-card neon-card">
                                <h2 className="section-title">{t('tenderDetail.submittedBids')} ({bids.length})</h2>
                                <div className="bids-list">
                                    {bids.map((bid) => (
                                        <div key={bid.id} className="bid-item" data-testid={`bid-${bid.id}`}>
                                            <div className="bid-header">
                                                <div>
                                                    <p className="bid-contractor">{bid.contractor_email}</p>
                                                    <p className="bid-price">{bid.price.toLocaleString()} $</p>
                                                </div>
                                                <div className="bid-status-info">
                        <span className={`status-badge status-${bid.status}`}>
                          {getStatusLabel(bid.status)}
                        </span>
                                                    <span
                                                        className="bid-score">{t('tenderDetail.aiScore')}: {bid.ai_score.toFixed(1)}/100</span>
                                                </div>
                                            </div>
                                            <p className="bid-proposal">{bid.proposal}</p>
                                            <p className="bid-delivery">{t('tenderDetail.delivery')}: {bid.delivery_time}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </StaticLayout>
        )
    }
    return (
        <Layout>
            <div className="tender-detail-container" data-testid="tender-detail">
                <div className="tender-header-section">
                    <div>
                        <h1 className="tender-title" data-testid="tender-title">{getLocalizedField(tender, 'title')}</h1>
                        <div className="tender-meta">
              <span className={`status-badge status-${tender.status}`}>
                {getStatusLabel(tender.status)}
              </span>
                            <span className="tender-type">{getTypeLabel(tender.tender_type)}</span>
                        </div>
                    </div>
                    {canBid && (
                        <Button
                            onClick={() => navigate(`/tenders/${tender.id}/submit-bid`)}
                            className="neon-button-filled"
                            data-testid="submit-bid-btn"
                        >
                            {t('tenderDetail.submitBid')}
                        </Button>
                    )}
                    {isOwner && tender.status === 'active' && bids.filter(b => b.status === 'stage1_approved').length > 0 && (
                        <Button
                            onClick={handleSelectWinner}
                            className="neon-button-filled"
                            data-testid="select-winner-btn"
                        >
                            {t('tenderDetail.selectWinner')}
                        </Button>
                    )}
                    {/* Показать протокол для закрытых и завершенных тендеров */}
                    {(tender.status === 'closed' || tender.status === 'failed') && (
                        <Button
                            onClick={() => navigate(`/protocol/${id}`)}
                            className="neon-button-filled"
                            data-testid="view-protocol-btn"
                        >
                            <FileText size={16} style={{marginRight: '8px'}}/>
                            {t('tenderDetail.viewProtocol')}
                        </Button>
                    )}
                </div>

                <div className="tender-content">
                    <Card className="tender-info-card neon-card">
                        <h2 className="section-title">{t('tenderDetail.tenderInfo')}</h2>

                        <div className="info-grid">
                            <div className="info-item">
                                <Banknote className="info-icon"/>
                                <div>
                                    <p className="info-label">{t('tenderList.budget')}</p>
                                    <p className="info-value">{tender.budget.toLocaleString()} $</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <Calendar className="info-icon"/>
                                <div>
                                    <p className="info-label">{t('tenderDetail.deadline')}</p>
                                    <p className="info-value">{new Date(tender.deadline).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <MapPin className="info-icon"/>
                                <div>
                                    <p className="info-label">{t('tenderList.region')}</p>
                                    <p className="info-value">{tender.region}</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <FileText className="info-icon"/>
                                <div>
                                    <p className="info-label">{t('tenderList.category')}</p>
                                    <p className="info-value">{getCategoryLabel(tender.category)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="description-section">
                            <h3 className="subsection-title">{t('tenderDetail.description')}</h3>
                            <p className="description-text">{getLocalizedField(tender, 'description')}</p>
                        </div>

                        <div className="description-section">
                            <h3 className="subsection-title">{t('tenderDetail.technicalSpecs')}</h3>
                            <p className="description-text">{getLocalizedField(tender, 'technical_specs')}</p>
                        </div>

                        {String(tender?.id).toLowerCase() === '508e1745-94d6-40ca-9bd5-1e09327ad4f8' ? (
                            <div className="description-section">
                                <h3 className="subsection-title">{t('tenderDetail.documents')}</h3>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px'}}>
                                    {[
                                        {name: t('tenderDetail.document1'), url: '/documents/tz.pdf'},
                                        {name: t('tenderDetail.document2'), url: '/documents/tender_announcement.pdf'},
                                        {name: t('tenderDetail.document3'), url: '/documents/press.pdf'},
                                        {name: t('tenderDetail.document4'), url: '/documents/agreement.pdf'},
                                    ].map((doc, idx) => (
                                        <a key={idx} href={doc.url} download style={linkStyle}>
                                            <FileText size={16} style={iconStyle}/>
                                            <span style={{flex: 1}}>{doc.name}</span>
                                            <Download size={15} style={iconStyle}/>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            (tender?.documents && tender.documents.length > 0) ? (
                                <div className="description-section">
                                    <h3 className="subsection-title">{t('tenderDetail.documents')}</h3>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px',
                                        marginTop: '8px'
                                    }}>
                                        {tender.documents.map((doc, index) => (
                                            <a key={index} href={doc.url} download style={linkStyle}>
                                                <FileText size={16} style={iconStyle}/>
                                                <span style={{flex: 1}}>{doc.name || `${t('tenderDetail.documentFallback')} ${index + 1}`}</span>
                                                <Download size={15} style={iconStyle}/>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ) : null
                        )}
                        {tender.requirements && tender.requirements.length > 0 && (
                            <div className="description-section">
                                <h3 className="subsection-title">{t('tenderDetail.requirements')}</h3>
                                <ul className="requirements-list">
                                    {tender.requirements.map((req, idx) => (
                                        <li key={idx}>{req}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Card>

                    {isOwner && bids.length > 0 && (
                        <Card className="bids-card neon-card">
                            <h2 className="section-title">{t('tenderDetail.submittedBids')} ({bids.length})</h2>
                            <div className="bids-list">
                                {bids.map((bid) => (
                                    <div key={bid.id} className="bid-item" data-testid={`bid-${bid.id}`}>
                                        <div className="bid-header">
                                            <div>
                                                <p className="bid-contractor">{bid.contractor_email}</p>
                                                <p className="bid-price">{bid.price.toLocaleString()} $</p>
                                            </div>
                                            <div className="bid-status-info">
                        <span className={`status-badge status-${bid.status}`}>
                          {getStatusLabel(bid.status)}
                        </span>
                                                <span
                                                    className="bid-score">{t('tenderDetail.aiScore')}: {bid.ai_score.toFixed(1)}/100</span>
                                            </div>
                                        </div>
                                        <p className="bid-proposal">{bid.proposal}</p>
                                        <p className="bid-delivery">{t('tenderDetail.delivery')}: {bid.delivery_time}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>

        </Layout>
    );
};

export default TenderDetail;
