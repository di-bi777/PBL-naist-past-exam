import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

interface AssignmentFormProps {
  onNavigate: (page: 'assignment-list' | 'home') => void;
  previousPage: 'assignment-list' | 'home';
}

export function AssignmentForm({ onNavigate, previousPage }: AssignmentFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    area: '',
    semester: '',
    year: new Date().getFullYear(),
    professor: '',
    type: '',
    dueDate: '',
    submissionMethod: '',
    pageRequirement: '',
    description: '',
    content: '',
    tips: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('課題を登録しました');
    onNavigate('assignment-list');
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const areas = ['情報科学領域', 'バイオサイエンス領域', '物質創成科学領域'];
  const semesters = ['春学期', '秋学期'];
  const types = ['レポート', 'プレゼンテーション', '演習問題', 'プログラミング課題', 'グループワーク', 'その他'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <button
          onClick={() => onNavigate(previousPage)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          キャンセル
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">課題を登録</h1>
          <p className="text-gray-600 mb-8">できるだけ詳細に情報を入力してください</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本情報 */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">基本情報</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="例：データ構造とアルゴリズムのレポート課題"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    科目名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    placeholder="例：データ構造とアルゴリズム"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    担当教員
                  </label>
                  <input
                    type="text"
                    value={formData.professor}
                    onChange={(e) => handleChange('professor', e.target.value)}
                    placeholder="例：佐藤教授"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    領域 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.area}
                    onChange={(e) => handleChange('area', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">選択してください</option>
                    {areas.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    開講期 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => handleChange('semester', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">選択してください</option>
                    {semesters.map((semester) => (
                      <option key={semester} value={semester}>{semester}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    年度 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleChange('year', parseInt(e.target.value))}
                    min="2000"
                    max="2030"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 課題詳細 */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">課題詳細</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    課題タイプ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">選択してください</option>
                    {types.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    提出期限 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  提出方法
                </label>
                <input
                  type="text"
                  value={formData.submissionMethod}
                  onChange={(e) => handleChange('submissionMethod', e.target.value)}
                  placeholder="例：オンライン提出（学習管理システム）"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分量・形式
                </label>
                <input
                  type="text"
                  value={formData.pageRequirement}
                  onChange={(e) => handleChange('pageRequirement', e.target.value)}
                  placeholder="例：A4用紙3〜5枚"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  概要
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="課題の概要を簡潔に説明してください"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* 課題内容 */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">課題内容</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  詳細内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  placeholder="課題の詳細内容、評価基準、注意事項などを記入してください"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                  rows={12}
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  ※ 課題の要件、評価基準、注意点などを詳しく記入してください
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ヒントとアドバイス
                </label>
                <textarea
                  value={formData.tips}
                  onChange={(e) => handleChange('tips', e.target.value)}
                  placeholder="課題に取り組む際のヒントやアドバイスを記入してください"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                  rows={4}
                />
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => onNavigate(previousPage)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                登録する
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
