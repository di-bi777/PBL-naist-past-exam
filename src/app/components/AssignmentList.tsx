import { useState } from 'react';
import { Search, Plus, Calendar, BookOpen, ArrowLeft, User } from 'lucide-react';

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  area: string;
  semester: string;
  year: number;
  dueDate: string;
  type: string;
  fileName: string;
  fileSize: string;
  storageProvider: 'Google Drive' | 'Local';
  fileUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  viewCount: number;
}

interface AssignmentListProps {
  onNavigate: (page: 'home' | 'assignment-detail', assignmentId?: string) => void;
  onShowForm: () => void;
}

// モックデータ
export const assignmentMocks: Assignment[] = [
  {
    id: '1',
    title: 'データ構造とアルゴリズムのレポート課題',
    subject: 'データ構造とアルゴリズム',
    area: '情報',
    semester: '前期',
    year: 2025,
    dueDate: '2026-01-25',
    type: 'レポート',
    fileName: 'report_datastructures.pdf',
    fileSize: '1.2MB',
    storageProvider: 'Google Drive',
    fileUrl: '',
    uploadedBy: '山田太郎',
    uploadedAt: '2026-01-10',
    viewCount: 156,
  },
  {
    id: '2',
    title: '有機化学実験レポート',
    subject: '有機化学実験',
    area: '化学',
    semester: '後期',
    year: 2024,
    dueDate: '2025-12-20',
    type: 'レポート',
    fileName: 'organic_lab_report.docx',
    fileSize: '840KB',
    storageProvider: 'Google Drive',
    fileUrl: '',
    uploadedBy: '佐藤花子',
    uploadedAt: '2025-12-05',
    viewCount: 89,
  },
  {
    id: '3',
    title: '英語プレゼンテーション課題',
    subject: '学術英語II',
    area: '英語',
    semester: '前期',
    year: 2025,
    dueDate: '2026-01-30',
    type: 'プレゼンテーション',
    fileName: 'english_presentation.pptx',
    fileSize: '5.6MB',
    storageProvider: 'Google Drive',
    fileUrl: '',
    uploadedBy: '鈴木一郎',
    uploadedAt: '2026-01-08',
    viewCount: 124,
  },
  {
    id: '4',
    title: '物理学演習問題集',
    subject: '物理学I',
    area: '物理',
    semester: '前期',
    year: 2025,
    dueDate: '2026-02-05',
    type: '演習問題',
    fileName: 'physics_exercises.pdf',
    fileSize: '2.4MB',
    storageProvider: 'Google Drive',
    fileUrl: '',
    uploadedBy: '田中次郎',
    uploadedAt: '2026-01-12',
    viewCount: 203,
  },
  {
    id: '5',
    title: '経済学レポート：市場分析',
    subject: 'ミクロ経済学',
    area: '経済',
    semester: '後期',
    year: 2024,
    dueDate: '2025-12-15',
    type: 'レポート',
    fileName: 'microeconomics_market_analysis.pdf',
    fileSize: '1.8MB',
    storageProvider: 'Google Drive',
    fileUrl: '',
    uploadedBy: '高橋美咲',
    uploadedAt: '2025-11-28',
    viewCount: 167,
  },
];

export function AssignmentList({ onNavigate, onShowForm }: AssignmentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');

  const areas = ['all', '情報科学領域', 'バイオサイエンス領域', '物質創成科学領域'];
  const semesters = ['all', '春学期', '秋学期'];

  const filteredAssignments = assignmentMocks.filter((assignment) => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = selectedArea === 'all' || assignment.area === selectedArea;
    const matchesSemester = selectedSemester === 'all' || assignment.semester === selectedSemester;
    return matchesSearch && matchesArea && matchesSemester;
  });

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
            ホームに戻る
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">課題情報</h1>
              <p className="text-gray-600 mt-2">授業の課題を検索・閲覧</p>
            </div>
            <button
              onClick={onShowForm}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              課題を登録
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
                  placeholder="科目名・タイトルで検索"
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
                  <option key={area} value={area}>
                    {area === 'all' ? '全ての領域' : area}
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
                  <option key={semester} value={semester}>
                    {semester === 'all' ? '全ての開講期' : semester}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 検索結果 */}
        <div className="mb-4 text-gray-600">
          {filteredAssignments.length}件の課題情報が見つかりました
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
                      {assignment.area}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {assignment.semester}
                    </span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                      {assignment.type}
                    </span>
                    <span className="text-gray-500 text-sm">{assignment.year}年度</span>
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
                      <span>投稿: {assignment.uploadedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 ml-6">
                  <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                    <div className="font-medium">提出期限</div>
                    <div className="text-gray-900 font-bold">{assignment.dueDate}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {assignment.viewCount}回閲覧
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
