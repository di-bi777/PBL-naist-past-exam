
  # Exam Question Sharing App

  This is a code bundle for Exam Question Sharing App. The original project is available at https://www.figma.com/design/Fq80dpruQLhZlbADuKXzRn/Exam-Question-Sharing-App.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## 管理者画面のGAS連携設定

  フロント側は `.env` なしでも動かせます。
  その場合は `src/app/constants/gasAdmin.ts` の `DEFAULT_NETLIFY_FUNCTIONS_BASE` を Netlify のURLに変更してください。

  `.env` で上書きしたい場合は以下です。

VITE_NETLIFY_FUNCTIONS_BASE={NetlifyサイトURL 例: https://xxxxx.netlify.app}

  GAS の実URLは Netlify 側の環境変数で管理します。

GAS_DRIVE_ENDPOINT={doGet(Pending)のデプロイURL}

GAS_APPROVE_ENDPOINT={approve_pending_fileのデプロイURL}

GAS_REJECT_ENDPOINT={reject_pending_fileのデプロイURL}

GAS_DB_ENDPOINT={doGet(DB)のデプロイURL}

ADMIN_API_TOKEN={承認/拒否で使う管理者トークン}
