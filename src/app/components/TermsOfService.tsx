interface TermsOfServiceProps {
  onClose: () => void;
}

export function TermsOfService({ onClose }: TermsOfServiceProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="px-6 py-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900">利用規約</h2>
        </div>
        
        <div className="px-6 py-4 overflow-y-auto flex-1">
          <div className="space-y-6 text-gray-700">
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-2">第1条（適用）</h3>
              <p className="text-sm leading-relaxed">
                本規約は、本サービスの提供条件及び本サービスの利用に関する当社と利用者との間の権利義務関係を定めることを目的とし、利用者と当社との間の本サービスの利用に関わる一切の関係に適用されます。
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-2">第2条（定義）</h3>
              <p className="text-sm leading-relaxed mb-2">本規約において使用する用語の定義は、次の各号に定めるとおりとします。</p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>「本サービス」とは、当社が提供する過去問共有プラットフォームをいいます。</li>
                <li>「利用者」とは、本サービスを利用する全ての方をいいます。</li>
                <li>「登録情報」とは、利用者が本サービスの利用にあたり登録した情報をいいます。</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-2">第3条（登録）</h3>
              <p className="text-sm leading-relaxed">
                本サービスの利用を希望する方は、本規約に同意の上、当社が定める一定の情報を当社に提供することにより、利用登録を申請することができます。当社は、当社の基準に従って、利用登録の可否を判断し、当社が登録を認める場合にはその旨を申請者に通知します。
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-2">第4条（投稿コンテンツの取扱い）</h3>
              <p className="text-sm leading-relaxed mb-2">
                利用者は、過去問や課題に関する情報を投稿する際、以下の事項を遵守するものとします。
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>著作権法その他の法令に違反する内容を投稿しないこと</li>
                <li>虚偽の情報や誤解を招く情報を投稿しないこと</li>
                <li>他者の権利やプライバシーを侵害する内容を投稿しないこと</li>
                <li>公序良俗に反する内容を投稿しないこと</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-2">第5条（評価とコメント）</h3>
              <p className="text-sm leading-relaxed">
                利用者は、投稿された過去問に対して評価やコメントを行うことができます。不適切な内容として一定数の低評価を受けた投稿は、自動的に削除される場合があります。
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-2">第6条（禁止事項）</h3>
              <p className="text-sm leading-relaxed mb-2">利用者は、本サービスの利用にあたり、以下の行為を行ってはなりません。</p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>当社のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                <li>当社のサービスの運営を妨害するおそれのある行為</li>
                <li>他の利用者に関する個人情報等を収集または蓄積する行為</li>
                <li>不正アクセスをし、またはこれを試みる行為</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-2">第7条（免責事項）</h3>
              <p className="text-sm leading-relaxed">
                当社は、本サービスに投稿される過去問の正確性、完全性、有用性等について一切保証いたしません。利用者は、自己の責任において本サービスを利用するものとします。
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-2">第8条（本規約の変更）</h3>
              <p className="text-sm leading-relaxed">
                当社は、必要と判断した場合には、利用者に通知することなくいつでも本規約を変更することができるものとします。
              </p>
            </section>
          </div>
        </div>

        <div className="px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
