import { useState, ChangeEvent } from 'react';
import { ArrowLeft, Save, Upload, Loader2} from 'lucide-react';

interface TestFormProps {
  onNavigate: (page: 'test-list') => void;
  previousPage: 'assignment-list' | 'home';
}

export function TestForm({ onNavigate , previousPage}: TestFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    area: '',
    semester: '',
    year: new Date().getFullYear(),
    professor: '',
    allowedMaterials: [] as string[],
    content: '',
  });

  const areas = ['情報科学領域', 'バイオサイエンス領域', '物質創成科学領域'];
  const semesters = ['春学期', '秋学期'];

  // GASのデプロイ後に発行されるURLを入力してください
  const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwE2UDkDMSLXeBb8CeHIzVfGHPGJF_le79zqwhliyOgAsOw2CCUdQ0PhzKU7y4UHK8/exec';

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('ファイルをアップロードしてください');
      return;
    }

    setIsUploading(true);

    try {
      // ファイルをBase64に変換
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Content = (reader.result as string).split(',')[1];
        
        const payload = {
          ...formData,
          fileData: base64Content,
          fileName: file.name,
          mimeType: file.type,
        };

        // GASへPOST送信
        const response = await fetch(GAS_ENDPOINT, {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          alert('過去問とファイルを登録しました');
          onNavigate('test-list');
        } else {
          throw new Error('送信に失敗しました');
        }
      };
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCheckboxChange = (item: string) => {
  const current = formData.allowedMaterials;
  const next = current.includes(item)
    ? current.filter((i) => i !== item) // すでにあれば削除
    : [...current, item];               // なければ追加

  setFormData({ ...formData, allowedMaterials: next });
};

  // ... (areas, semesters の定義はそのまま)

  return (
    
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <button
          onClick={() => onNavigate(previousPage)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          キャンセル
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">過去問を登録</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本情報の入力項目（既存） */}
            {/* 基本情報 */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">基本情報</h2>
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
              <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">試験詳細</h2>
              
              <div className="grid md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    持ち込み可能品 
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-white p-4 border border-gray-300 rounded-lg">
                    {['電卓', '辞書', '教科書', 'ノート', '自作メモ'].map((item) => (
                      <label key={item} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={formData.allowedMaterials.includes(item)}
                          onChange={() => handleCheckboxChange(item)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                          {item}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              

              

              
            </div>

            {/* ファイルアップロード項目の追加 */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">添付ファイル</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  試験問題（PDF/画像） <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        {file ? file.name : "クリックしてファイルをアップロード"}
                      </p>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,image/*" required />
                  </label>
                </div>
              </div>
            </div>

            {/* 送信ボタン */}
            <button
                type="button"
                onClick={() => onNavigate(previousPage)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isUploading}
                className={`flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Save className="w-5 h-5" />
                {isUploading ? '送信中...' : '登録する'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}