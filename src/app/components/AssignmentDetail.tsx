import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, ExternalLink, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { GAS_DISPLAY_ENDPOINT } from '../constants/gas';

interface AssignmentDetailProps {
  assignmentId: string;
  onNavigate: (page: 'assignment-list') => void;
}

interface AssignmentDetailData {
  id: string;
  title: string;
  subject: string;
  lectureNumber: string;
  area: string;
  semester: string;
  year: number;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  fileUrl: string;
  previewUrl: string; // iframe埋め込み用
}

const areaToTranslationKey: Record<string, string> = {
  Information: 'area.Information',
  Biological: 'area.Biological',
  Materials: 'area.Materials',
  '情報科学領域': 'area.Information',
  'バイオサイエンス領域': 'area.Biological',
  '物質創生科学領域': 'area.Materials',
  '物質創成科学領域': 'area.Materials',
};

const semesterToTranslationKey: Record<string, string> = {
  spring: 'term.spring',
  fall: 'term.fall',
  '春学期': 'term.spring',
  '秋学期': 'term.fall',
};

export function AssignmentDetail({ assignmentId, onNavigate }: AssignmentDetailProps) {
  const { t, language } = useLanguage();
  const [assignment, setAssignment] = useState<AssignmentDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const url = `${GAS_DISPLAY_ENDPOINT}?path=get_assignment_detail&id=${assignmentId}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error(t('assignmentDetail.fetchError'));

        const json = await response.json();
        if (json.status === 'error') throw new Error(json.message);

        const row = json.data;

        // Google DriveのURLを埋め込み用（/preview）に変換
        const rawFileUrl = String(row.file_url || '');
        const previewUrl = rawFileUrl.replace(/\/view.*/, '/preview');

        // DBのデータをUI用にマッピング
        setAssignment({
          id: String(row.id),
          title: language === 'ja'
            ? `${row.subject} (第${row.lecture_no}回)`
            : `${row.subject} (Lecture ${row.lecture_no})`,
          subject: String(row.subject),
          lectureNumber: String(row.lecture_no),
          area: String(row.area),
          semester: String(row.term),
          year: Number(row.year),
          type: t('assignmentDetail.type'),
          uploadedBy: t('assignmentDetail.unknown'),
          uploadedAt: row.created_at
            ? new Date(row.created_at).toLocaleDateString(language === 'ja' ? 'ja-JP' : 'en-US')
            : '',
          fileUrl: rawFileUrl,
          previewUrl: previewUrl,
        });

      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : t('assignmentDetail.loadError'));
      } finally {
        setIsLoading(false);
      }
    };

    if (GAS_DISPLAY_ENDPOINT) {
      fetchDetail();
    } else {
      setError(t('assignmentDetail.endpointMissing'));
      setIsLoading(false);
    }
  }, [assignmentId, GAS_DISPLAY_ENDPOINT]);

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
          <Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t('assignmentDetail.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error || t('assignmentDetail.notFound')}</p>
        <button onClick={() => onNavigate('assignment-list')} className="text-green-600 hover:underline">
          {t('assignmentDetail.backToList')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 戻るボタン */}
        <button
          onClick={() => onNavigate('assignment-list')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('assignmentDetail.backToList')}
        </button>

        {/* メイン情報カード */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {displayArea(assignment.area)}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {displaySemester(assignment.semester)}
                </span>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  {assignment.type}
                </span>
                <span className="text-gray-500 text-sm">
                  {language === 'ja' ? `${assignment.year}年度` : String(assignment.year)}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{assignment.title}</h1>

              <div className="space-y-2 text-gray-700">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">{t('assignmentDetail.subject')}</span>
                  <span>{assignment.subject}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 登録情報 */}
          <div className="pt-6 border-t text-sm text-gray-500">
            <div>
              {t('assignmentDetail.registeredBy')} {assignment.uploadedBy}
              {' | '}
              {t('assignmentDetail.registeredDate')} {assignment.uploadedAt}
            </div>
          </div>
        </div>

        {/* ファイルプレビュー表示 */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">{t('assignmentDetail.fileTitle')}</h2>
            {assignment.fileUrl && (
              <a
                href={assignment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 bg-green-50 px-3 py-1.5 rounded-lg"
              >
                <ExternalLink className="w-4 h-4" />
                {t('assignmentDetail.openInNewTab')}
              </a>
            )}
          </div>

          {assignment.previewUrl ? (
            <div className="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
              <iframe
                src={assignment.previewUrl}
                width="100%"
                height="100%"
                title="File Preview"
                className="border-none"
                allow="autoplay"
              ></iframe>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
              {t('assignmentDetail.noFile')}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
