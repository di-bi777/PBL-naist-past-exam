import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

interface TestFormProps {
  onNavigate: (page: 'test-list' | 'home') => void;
  previousPage: 'test-list' | 'home';
}

export function TestForm({ onNavigate, previousPage }: TestFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    area: '',
    semester: '',
    year: new Date().getFullYear(),
    professor: '',
    examDate: '',
    duration: '',
    allowedMaterials: '',
    description: '',
    content: '',
    additionalInfo: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 送信処理（モック）
    alert('過去問を登録しました');
    onNavigate('test-list');
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const areas = ['情報科学領域', 'バイオサイエンス領域', '物質創成科学領域'];
  const semesters = ['春学期', '秋学期'];

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">過去問を登録</h1>
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
                  placeholder="例：微分積分学期末試験"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                    placeholder="例：微分積分学I"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                    placeholder="例：山本教授"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 試験詳細 */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">試験詳細</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    試験日
                  </label>
                  <input
                    type="date"
                    value={formData.examDate}
                    onChange={(e) => handleChange('examDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    試験時間
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => handleChange('duration', e.target.value)}
                    placeholder="例：90分"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  持ち込み可能なもの
                </label>
                <input
                  type="text"
                  value={formData.allowedMaterials}
                  onChange={(e) => handleChange('allowedMaterials', e.target.value)}
                  placeholder="例：電卓、A4用紙1枚（両面可）"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="試験の概要や特徴を簡潔に説明してください"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* 試験内容 */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">試験内容</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  問題内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  placeholder="試験問題の内容をできるだけ詳しく記入してください"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none font-mono"
                  rows={12}
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  ※ 問題の形式、配点、キーワードなどを記入してください
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  補足情報・アドバイス
                </label>
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) => handleChange('additionalInfo', e.target.value)}
                  placeholder="試験対策のアドバイスや注意点などを記入してください"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
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
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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
