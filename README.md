
  # Exam Question Sharing App

  This is a code bundle for Exam Question Sharing App. The original project is available at https://www.figma.com/design/Fq80dpruQLhZlbADuKXzRn/Exam-Question-Sharing-App.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## 管理者画面からファイルを移動させるには

  .envファイルに以下の行を追加(2/13 21:10時点)
VITE_GAS_DRIVE_ENDPOINT=https://script.google.com/macros/s/AKfycbxkUP8mHxPPhjErsPfGoqujWnjswyqxRHFDVvaDNYIs2GbxIULpsi1MaWE9njy22lVj/exec
VITE_GAS_APPROVE_ENDPOINT=https://script.google.com/macros/s/AKfycbwgPYIjuIbIp1cRB-4-fB8k6uinj2UTNowwQuPlaRBWVx6eaaJJwQDL27bAvREOP0SGRA/exec
VITE_GAS_REJECT_ENDPOINT=https://script.google.com/macros/s/AKfycbxqH1wCETJOSrBlw72bMeR1iDZBHU8TWyKEhFmKsI_YzaGElFGm3HBzscGfkPFG64rG/exec
