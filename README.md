
  # Exam Question Sharing App

  This is a code bundle for Exam Question Sharing App. The original project is available at https://www.figma.com/design/Fq80dpruQLhZlbADuKXzRn/Exam-Question-Sharing-App.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## 管理者画面からファイルを移動させるには

  .envファイルに以下の行を追加
  
VITE_GAS_DRIVE_ENDPOINT={doGet(Pending)のデプロイURL}

VITE_GAS_APPROVE_ENDPOINT={approve_pending_fileのデプロイURL}

VITE_GAS_REJECT_ENDPOINT={reject_pending_fileのデプロイURL}
