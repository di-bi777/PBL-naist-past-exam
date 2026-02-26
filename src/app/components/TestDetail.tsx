import { useState, useEffect } from 'react';
import { ArrowLeft, User, Calendar, BookOpen, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TestDetailProps {
  testId: string;
  onNavigate: (page: 'test-list') => void;
}

interface TestDetailData {
  id: string;
  subject: string;
  area: string;
  semester: string;
  year: number;
  professor: string;
  allowedMaterials: string;
  uploadedBy: string;
  uploadedAt: string;
  pdfUrl: string;
  previewUrl: string;
}

const areaToTranslationKey: Record<string, string> = {
  '情報科学領域': 'area.Information',
  'バイオサイエンス領域': 'area.Biological',
  '物質創生科学領域': 'area.Materials',
  '物質創成科学領域': 'area.Materials',
};

const semesterToTranslationKey: Record<string, string> = {
  '春学期': 'term.spring',
  '秋学期': 'term.fall',
};

export function TestDetail({ testId, onNavigate }: TestDetailProps) {
  const { t, language } = useLanguage();
  const [test, setTest] = useState<TestDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const GAS_ENDPOINT = import.meta.env.VITE_GAS_EXAM_DISPLAY_ENDPOINT as string;

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const url = `${GAS_ENDPOINT}?path=get_exam_detail&id=${testId}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error(t('testDetail.fetchError'));

        const json = await response.json();
        if (json.status === 'error') throw new Error(json.message);

        const row = json.data;

        const rawPdfUrl = String(row.pdf_url || '');
        const previewUrl = rawPdfUrl.replace(/\/view.*/, '/preview');

        setTest({
          id: String(row.id),
          subject: String(row.subject),
          area: String(row.area),
          semester: String(row.term),
          year: Number(row.year),
          professor: String(row.instructor || ''),
          allowedMaterials: String(row.allowedMaterialsStr || ''),
          uploadedBy: String(row.instructor || ''),
          uploadedAt: row.created_at
            ? new Date(row.created_at).toLocaleDateString(language === 'ja' ? 'ja-JP' : 'en-US')
            : '',
          pdfUrl: rawPdfUrl,
          previewUrl: previewUrl,
        });

      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : t('testDetail.loadError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [testId, GAS_ENDPOINT]);

  const displayArea = (area: string) => {
    const key = areaToTranslationKey[area];
    return key ? t(key) : area;
  };

  const displaySemester = (semester: string) => {
    const key = semesterToTranslationKey[semester];
    return key ? t(key) : semester;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t('testDetail.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error || t('testDetail.notFound')}</p>
        <button onClick={() => onNavigate('test-list')} className="text-blue-600 hover:underline">
          {t('testDetail.backToList')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate('test-list')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('testDetail.backToList')}
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {displayArea(test.area)}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {displaySemester(test.semester)}
                </span>
                <span className="text-gray-500 text-sm">
                  {language === 'ja' ? `${test.year}年度` : String(test.year)}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {language === 'ja' ? `${test.subject} (${test.year}年度)` : `${test.subject} (${test.year})`}
              </h1>

              <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">{t('testDetail.subject')}</span>
                  <span>{test.subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">{t('testDetail.instructor')}</span>
                  <span>{test.professor || t('testDetail.unknown')}</span>
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <AlertCircle className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">{t('testDetail.allowedMaterials')}</span>
                  <span>{test.allowedMaterials || t('testDetail.noMaterials')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t text-sm text-gray-500 flex justify-between items-center">
            <div>
              {t('testDetail.registeredBy')} {test.uploadedBy || t('testDetail.unknown')}
              {' | '}
              {t('testDetail.registeredDate')} {test.uploadedAt}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">{t('testDetail.pdfTitle')}</h2>
            {test.pdfUrl && (
              <a
                href={test.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg"
              >
                <ExternalLink className="w-4 h-4" />
                {t('testDetail.openInNewTab')}
              </a>
            )}
          </div>

          {test.previewUrl ? (
            <div className="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
              <iframe
                src={test.previewUrl}
                width="100%"
                height="100%"
                title="PDF Preview"
                className="border-none"
                allow="autoplay"
              ></iframe>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
              {t('testDetail.noPdf')}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
