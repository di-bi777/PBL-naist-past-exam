import { useState, useEffect } from 'react';
import { Search, Plus, Calendar, BookOpen, ArrowLeft, User, Loader2 } from 'lucide-react';
import { areaOptions, termOptions } from '../constants/options';
import { useLanguage } from '../contexts/LanguageContext';

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  area: string;
  semester: string;
  year: number;
  type: string;
  fileName: string;
  fileSize: string;
  storageProvider: 'Google Drive' | 'Local';
  fileUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface AssignmentListProps {
  onNavigate: (page: 'home' | 'assignment-detail', assignmentId?: string) => void;
  onShowForm: () => void;
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

export function AssignmentList({ onNavigate, onShowForm }: AssignmentListProps) {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 先ほど設定した環境変数を使用
  const GAS_ENDPOINT = import.meta.env.VITE_GAS_DISPLAY_ENDPOINT as string;

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        // 新しく作成するGASのエンドポイントパス（assignments用）を指定
        const url = `${GAS_ENDPOINT}?path=get_approved_assignments`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        console.log("GASからの生データ:", json); // ← これを追記

        const rawData = json.data || [];
        console.log("フィルタ前のデータ数:", rawData.length); // ← これを追記


        // DBのヘッダー情報をReactのAssignment型にマッピング（変換）する
        const formattedAssignments: Assignment[] = rawData
          .filter((row: any) => row.type === 'approved')
          .map((row: any) => ({
            id: String(row.id),
            // DBにtitleがないため、科目名と第何回かで自動生成
            title: language === 'ja'
              ? `${row.subject} (第${row.lecture_no || '?'}回)`
              : `${row.subject} (Lecture ${row.lecture_no || '?'})`,
            subject: String(row.subject),
            area: String(row.area),
            semester: String(row.term),
            year: Number(row.year),
            type: t('assignmentList.type'),
            fileName: '', // DBに無い項目
            fileSize: '', // DBに無い項目
            storageProvider: 'Google Drive',
            fileUrl: String(row.file_url || ''),
            uploadedBy: t('assignmentList.unknown'),
            uploadedAt: row.created_at
              ? new Date(row.created_at).toLocaleDateString(language === 'ja' ? 'ja-JP' : 'en-US')
              : '',
          }));

        setAssignments(formattedAssignments);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : t('assignmentList.fetchError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [GAS_ENDPOINT]);

  const getAreaLabel = (area: string) => {
    if (area === 'all') return t('assignmentList.area.all');
    const key = areaToTranslationKey[area];
    return key ? t(key) : area;
  };

  const getSemesterLabel = (semester: string) => {
    if (semester === 'all') return t('assignmentList.semester.all');
    const key = semesterToTranslationKey[semester];
    return key ? t(key) : semester;
  };

  const areas = [{ key: 'all' }, ...areaOptions];
  const semesters = [{ key: 'all' }, ...termOptions];

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = selectedArea === 'all' || assignment.area === selectedArea;
    const matchesSemester = selectedSemester === 'all' || assignment.semester === selectedSemester;
    return matchesSearch && matchesArea && matchesSemester;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t('assignmentList.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
          >
            {t('assignmentList.reload')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('assignmentList.backToHome')}
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('assignmentList.title')}</h1>
              <p className="text-gray-600 mt-2">{t('assignmentList.subtitle')}</p>
            </div>
            <button
              onClick={onShowForm}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('assignmentList.register')}
            </button>
          </div>
        </div>

        {/* 検索とフィルター */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('assignmentList.search.placeholder')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                {areas.map((area) => (
                  <option key={area.key} value={area.key}>
                    {getAreaLabel(area.key)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                {semesters.map((semester) => (
                  <option key={semester.key} value={semester.key}>
                    {getSemesterLabel(semester.key)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 検索結果 */}
        <div className="mb-4 text-gray-600">
          {language === 'ja'
            ? `${filteredAssignments.length}件の課題情報が見つかりました`
            : `${filteredAssignments.length} assignment(s) found`}
        </div>

        {/* 課題リスト */}
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <div
              key={assignment.id}
              onClick={() => onNavigate('assignment-detail', assignment.id)}
              className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow p-6 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {getAreaLabel(assignment.area)}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {getSemesterLabel(assignment.semester)}
                    </span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                      {assignment.type}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {language === 'ja' ? `${assignment.year}年度` : String(assignment.year)}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{assignment.title}</h3>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                    <BookOpen className="w-4 h-4" />
                    <span>{assignment.subject}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{assignment.uploadedBy}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{t('assignmentList.postedDate')}{assignment.uploadedAt}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
