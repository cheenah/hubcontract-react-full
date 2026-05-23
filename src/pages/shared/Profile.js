import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import apiClient from '@/services/api';
import { parseApiError } from '@/utils/apiError';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, CheckCircle, AlertCircle, Clock, Edit2, Save, X, Loader2 } from 'lucide-react';
import ProfileDocuments from '@/components/profile/ProfileDocuments';

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_LABELS = { contractor: 'Исполнитель', customer: 'Заказчик', admin: 'Администратор' };

// ── Sub-components ────────────────────────────────────────────────────────────

const ReadField = ({ label, value, wide }) => (
  <div className={`flex flex-col gap-1.5 ${wide ? 'col-span-full' : ''}`}>
    <label className="text-sm font-semibold text-gray-500">{label}</label>
    <p className="text-base text-gray-900 min-h-[1.5em] m-0">
      {value || <span className="text-gray-400 italic">Не указано</span>}
    </p>
  </div>
);

const OrgField = ({ label, children, wide }) => (
  <div className={`flex flex-col gap-1.5 ${wide ? 'col-span-full' : ''}`}>
    <label className="text-sm font-semibold text-gray-500">{label}</label>
    {children}
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────

const Profile = () => {
  const user     = useAuthStore(s => s.user);
  const { t }    = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ── RBAC flags ───────────────────────────────────────────────────────────
  const targetUserId = searchParams.get('userId');
  const isOwner  = !targetUserId || targetUserId === String(user?.id);
  const isAdmin  = user?.role === 'admin';
  const canEdit  = isOwner || isAdmin;

  const [targetUser,     setTargetUser]     = useState(null);
  const [targetDocCount, setTargetDocCount] = useState(null);
  const [targetDocs,     setTargetDocs]     = useState(null);
  const [isEditing,  setIsEditing]  = useState(false);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [orgData, setOrgData] = useState({
    company_name: '', company_bin: '', legal_address: '', actual_address: '',
    director_name: '', contact_person: '', contact_phone: '', contact_email: '',
    description: '', industry: '', employees_count: '', foundation_year: '', website: '',
  });

  useEffect(() => {
    if (targetUserId && !isAdmin) {
      navigate('/profile', { replace: true });
      return;
    }
    if (!isOwner) fetchTargetUser();
    fetchOrgData();
  }, [targetUserId, isAdmin]);

  // ── Fetchers ──────────────────────────────────────────────────────────────

  const fetchTargetUser = async () => {
    try {
      const res = await apiClient.get(`/admin/users/${targetUserId}`);
      setTargetUser(res.data.user || res.data);
      const docs = Array.isArray(res.data.documents) ? res.data.documents : [];
      setTargetDocCount(docs.length);
      setTargetDocs(docs);
    } catch {
      // Non-critical: status badge degrades gracefully
    }
  };

  const fetchOrgData = async () => {
    try {
      let org, usr;
      if (targetUserId) {
        const res = await apiClient.get(`/admin/users/${targetUserId}`);
        org = res.data.organization_profile || {};
        usr = res.data.user                 || res.data;
      } else {
        const res = await apiClient.get('/organization/profile');
        org = res.data || {};
        usr = user     || {};
      }
      setOrgData({
        company_name:    org.company_name    || usr.company_name || '',
        company_bin:     org.company_bin     || usr.company_bin  || '',
        legal_address:   org.legal_address   || '',
        actual_address:  org.actual_address  || '',
        director_name:   org.director_name   || '',
        contact_person:  org.contact_person  || '',
        contact_phone:   org.contact_phone   || usr.phone || '',
        contact_email:   org.contact_email   || usr.email || '',
        description:     org.description     || '',
        industry:        org.industry        || '',
        employees_count: org.employees_count || '',
        foundation_year: org.foundation_year || '',
        website:         org.website         || '',
      });
    } catch (e) {
      console.error('fetchOrgData error:', e);
      if (isOwner) {
        setOrgData(prev => ({
          ...prev,
          company_name:  user?.company_name || '',
          company_bin:   user?.company_bin  || '',
          contact_email: user?.email        || '',
          contact_phone: user?.phone        || '',
        }));
      }
    } finally {
      setLoadingOrg(false);
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSave = async () => {
    try {
      const url = targetUserId
        ? `/organization/profile?user_id=${targetUserId}`
        : `/organization/profile`;
      await apiClient.put(url, orgData);
      toast.success('Профиль организации успешно обновлён');
      setIsEditing(false);
    } catch (error) {
      toast.error(parseApiError(error, 'Ошибка при сохранении'));
    }
  };

  const handleChange = (field, value) => {
    setOrgData(prev => ({ ...prev, [field]: value }));
  };

  // ── Status badge ──────────────────────────────────────────────────────────

  const getStatus = (profileUser) => {
    if (profileUser?.documents_verified)
      return { text: t('profile.verified'),      color: 'var(--color-success-alt)',       Icon: CheckCircle };
    if (profileUser?.verification_status === 'pending')
      return { text: t('profile.pendingReview'), color: 'var(--color-warning)',           Icon: Clock };
    if (profileUser?.verification_status === 'rejected')
      return { text: t('profile.rejected'),      color: 'var(--color-danger)',            Icon: AlertCircle };
    return   { text: t('profile.notVerified'),   color: 'var(--color-text-placeholder)', Icon: Shield };
  };

  const profileUser = !isOwner ? targetUser : user;
  const { text: statusText, color: statusColor, Icon: StatusIcon } = getStatus(profileUser);

  const docCount = !isOwner
    ? (targetDocCount ?? Object.keys(profileUser?.documents || {}).length)
    : Object.keys(profileUser?.documents || {}).length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8" data-testid="profile-page">

      {/* Title row */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {!isOwner && (
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="flex-shrink-0">
            ← Назад
          </Button>
        )}
        <h1 className="text-2xl font-bold text-gray-900 m-0">
          {!isOwner
            ? `Профиль: ${orgData.company_name || targetUser?.email || 'Пользователь'}`
            : t('profile.title')}
        </h1>
        <div
          className="flex items-center gap-1.5 px-3.5 py-1 border-2 rounded-full text-sm font-semibold flex-shrink-0"
          style={{ borderColor: statusColor, color: statusColor }}
        >
          <StatusIcon size={15} />
          <span>{statusText}</span>
        </div>
        {!isOwner && (
          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold border border-gray-200 tracking-wide">
            Режим просмотра
          </span>
        )}
      </div>

      <Tabs defaultValue="registration" className="w-full">
        <TabsList className="mb-5">
          <TabsTrigger value="registration">Регистрационные данные</TabsTrigger>
          <TabsTrigger value="documents">Документы</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Org registration data ── */}
        <TabsContent value="registration">
          <Card className="p-6 sm:p-7">

            {/* Card header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Профиль организации</h2>
              {canEdit && (
                !isEditing ? (
                  <Button onClick={() => setIsEditing(true)} size="sm">
                    <Edit2 size={16} />
                    Редактировать
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">
                      <Save size={16} />
                      Сохранить
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                      <X size={16} />
                      Отмена
                    </Button>
                  </div>
                )
              )}
            </div>

            {loadingOrg ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <Loader2 className="animate-spin text-gray-400" size={28} />
              </div>
            ) : (
              <div className="flex flex-col gap-8">

                {/* Юридическая информация */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-4 pb-2 border-b border-gray-100">
                    Юридическая информация
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {isEditing && canEdit ? (
                      <OrgField label="Название организации" wide>
                        <Input
                          value={orgData.company_name}
                          onChange={e => handleChange('company_name', e.target.value)}
                        />
                      </OrgField>
                    ) : (
                      <ReadField label="Название организации" value={orgData.company_name} wide />
                    )}

                    <ReadField label="БИН" value={orgData.company_bin} />

                    {isEditing && canEdit ? (
                      <OrgField label="Отрасль">
                        <Input
                          value={orgData.industry}
                          onChange={e => handleChange('industry', e.target.value)}
                          placeholder="Строительство, ИТ, Логистика..."
                        />
                      </OrgField>
                    ) : (
                      <ReadField label="Отрасль" value={orgData.industry} />
                    )}

                    {isEditing && canEdit ? (
                      <OrgField label="Количество сотрудников">
                        <Input
                          type="number"
                          value={orgData.employees_count}
                          onChange={e => handleChange('employees_count', e.target.value)}
                        />
                      </OrgField>
                    ) : (
                      <ReadField label="Количество сотрудников" value={String(orgData.employees_count || '')} />
                    )}

                    {isEditing && canEdit ? (
                      <OrgField label="Год основания">
                        <Input
                          type="number"
                          value={orgData.foundation_year}
                          onChange={e => handleChange('foundation_year', e.target.value)}
                        />
                      </OrgField>
                    ) : (
                      <ReadField label="Год основания" value={String(orgData.foundation_year || '')} />
                    )}

                    {isEditing && canEdit ? (
                      <OrgField label="Юридический адрес" wide>
                        <Input
                          value={orgData.legal_address}
                          onChange={e => handleChange('legal_address', e.target.value)}
                        />
                      </OrgField>
                    ) : (
                      <ReadField label="Юридический адрес" value={orgData.legal_address} wide />
                    )}

                    {isEditing && canEdit ? (
                      <OrgField label="Фактический адрес" wide>
                        <Input
                          value={orgData.actual_address}
                          onChange={e => handleChange('actual_address', e.target.value)}
                        />
                      </OrgField>
                    ) : (
                      <ReadField label="Фактический адрес" value={orgData.actual_address} wide />
                    )}

                    {isEditing && canEdit ? (
                      <OrgField label="Описание деятельности" wide>
                        <Textarea
                          value={orgData.description}
                          onChange={e => handleChange('description', e.target.value)}
                          rows={4}
                          placeholder="Краткое описание деятельности организации"
                        />
                      </OrgField>
                    ) : (
                      <ReadField label="Описание деятельности" value={orgData.description} wide />
                    )}

                    {/* Read-only system fields — never editable */}
                    <ReadField
                      label="Роль"
                      value={ROLE_LABELS[profileUser?.role] || profileUser?.role}
                    />
                    <ReadField
                      label="Статус верификации"
                      value={
                        <span
                          className="inline-flex items-center gap-1 font-semibold text-sm"
                          style={{ color: statusColor }}
                        >
                          <StatusIcon size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                          {statusText}
                        </span>
                      }
                    />
                    <ReadField
                      label="Документов загружено"
                      value={String(docCount)}
                    />
                    <ReadField
                      label="Дата регистрации"
                      value={
                        profileUser?.created_at
                          ? new Date(profileUser.created_at).toLocaleDateString('ru-RU')
                          : null
                      }
                    />
                  </div>
                </div>

                {/* Контактная информация */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-4 pb-2 border-b border-gray-100">
                    Контактная информация
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {isEditing && canEdit ? (
                      <OrgField label="ФИО директора">
                        <Input
                          value={orgData.director_name}
                          onChange={e => handleChange('director_name', e.target.value)}
                        />
                      </OrgField>
                    ) : (
                      <ReadField label="ФИО директора" value={orgData.director_name} />
                    )}

                    {isEditing && canEdit ? (
                      <OrgField label="Контактное лицо">
                        <Input
                          value={orgData.contact_person}
                          onChange={e => handleChange('contact_person', e.target.value)}
                        />
                      </OrgField>
                    ) : (
                      <ReadField label="Контактное лицо" value={orgData.contact_person} />
                    )}

                    {isEditing && canEdit ? (
                      <OrgField label="Телефон">
                        <Input
                          value={orgData.contact_phone}
                          onChange={e => handleChange('contact_phone', e.target.value)}
                        />
                      </OrgField>
                    ) : (
                      <ReadField label="Телефон" value={orgData.contact_phone} />
                    )}

                    {isEditing && canEdit ? (
                      <OrgField label="Email">
                        <Input
                          type="email"
                          value={orgData.contact_email}
                          onChange={e => handleChange('contact_email', e.target.value)}
                        />
                      </OrgField>
                    ) : (
                      <ReadField label="Email" value={orgData.contact_email} />
                    )}

                    {isEditing && canEdit ? (
                      <OrgField label="Веб-сайт" wide>
                        <Input
                          value={orgData.website}
                          onChange={e => handleChange('website', e.target.value)}
                          placeholder="https://example.com"
                        />
                      </OrgField>
                    ) : (
                      <ReadField label="Веб-сайт" value={orgData.website} wide />
                    )}

                  </div>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ── Tab 2: Documents ── */}
        <TabsContent value="documents">
          <Card className="p-6 sm:p-7">
            <ProfileDocuments
              targetUserId={targetUserId}
              canEdit={canEdit}
              initialDocuments={targetDocs}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
