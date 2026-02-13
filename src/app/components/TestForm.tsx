import { useState, ChangeEvent } from 'react';
import { ArrowLeft, Save, Upload, Loader2 } from 'lucide-react';
import { areaOptions, termOptions, allowedMaterialOptions, getAreaLabel } from '../constants/options';
import { GAS_ENDPOINT } from '../constants/gas';

interface TestFormProps {
  onNavigate: (page: 'test-list') => void;
  previousPage: 'assignment-list' | 'home';
}

export function TestForm({ onNavigate, previousPage }: TestFormProps) {
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
      const base64Content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const res = reader.result as string;
          resolve(res.split(',')[1]);
        };
        reader.onerror = reject;
      });

      // --- ファイル名の自動生成ロジック ---
      // 形式: 領域名_科目名_年度.拡張子
      const extension = file.name.split('.').pop();
      const areaLabel = getAreaLabel(formData.area) || formData.area;
      const generatedFileName = `${areaLabel}_${formData.subject}_${formData.year}.${extension}`;

      const payload = {
        ...formData,
        term: formData.semester,
        instructor: formData.professor,
        fileData: base64Content,
        fileName: generatedFileName, // 自動生成した名前をセット
        mimeType: file.type,
      };

      const response = await fetch(`${GAS_ENDPOINT}?path=upload_exam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let result: { status?: string; message?: string } | null = null;
      if (text) {
        try {
          result = JSON.parse(text) as { status?: string; message?: string };
        } catch {
          result = null;
        }
      }

      if (response.ok && result?.status === 'success') {
        alert(`過去問を登録しました\n保存名: ${generatedFileName}`);
        onNavigate('test-list');
      } else {
        const message = result?.message ? String(result.message) : text || '送信に失敗しました';
        throw new Error(message);
      }
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
      ? current.filter((i) => i !== item)
      : [...current, item];
    setFormData({ ...formData, allowedMaterials: next });
  };

  const areaLabelForDisplay = getAreaLabel(formData.area) || '領域';

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* ローディングオーバーレイ */}
      {isUploading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-bold text-gray-800">データを送信中...</p>
            <p className="text-sm text-gray-500 mt-2">
              {areaLabelForDisplay}_{formData.subject}_{formData.year} として保存しています
            </p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => onNavigate(previousPage)}
          disabled={isUploading}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
          キャンセル
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">過去問を登録</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    required
                    disabled={isUploading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">担当教員</label>
                  <input
                    type="text"
                    value={formData.professor}
                    onChange={(e) => handleChange('professor', e.target.value)}
                    placeholder="佐藤教授"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    disabled={isUploading}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    required
                    disabled={isUploading}
                  >
                    <option value="">選択してください</option>
                    {areaOptions.map((area) => (
                      <option key={area.key} value={area.key}>{area.label}</option>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    required
                    disabled={isUploading}
                  >
                    <option value="">選択してください</option>
                    {termOptions.map((term) => (
                      <option key={term.key} value={term.key}>{term.label}</option>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    required
                    disabled={isUploading}
                  />
                </div>
              </div>
            </div>

            {/* 試験詳細 */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">試験詳細</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">持ち込み可能品</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-white p-4 border border-gray-300 rounded-lg">
                  {allowedMaterialOptions.map((item) => (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.allowedMaterials.includes(item.key)}
                        onChange={() => handleCheckboxChange(item.key)}
                        disabled={isUploading}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 添付ファイル */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">添付ファイル</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  試験問題（PDF/画像） <span className="text-red-500">*</span>
                </label>
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${file ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'} ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <Upload className={`w-8 h-8 mb-2 ${file ? 'text-blue-500' : 'text-gray-400'}`} />
                    <p className="text-sm text-gray-600 truncate max-w-xs">
                      {file ? file.name : "クリックしてファイルをアップロード"}
                    </p>
                    {file && !isUploading && (
                      <p className="text-xs text-blue-500 mt-2 font-medium">
                        保存名: {areaLabelForDisplay}_{formData.subject || "科目"}_{formData.year}
                      </p>
                    )}
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange} 
                    accept=".pdf,image/*" 
                    required 
                    disabled={isUploading} 
                  />
                </label>
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isUploading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2 transition-all"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    送信中...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    登録する
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
