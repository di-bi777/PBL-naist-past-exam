export type PastExamDbRow = {
  sourceSheet: "exams" | "assignments";
  id?: string;
  subject?: string;
  instructor?: string;
  area?: string;
  term?: string;
  year?: string;
  type?: string;
  allowedMaterialsStr?: string;
  pdf_file_id?: string;
  pdf_url?: string;
  created_at?: string;
};

export const pastExamDbRows: PastExamDbRow[] = 
[
  {
    "sourceSheet": "exams",
    "id": "EX_20260213_180933_a5s7ci",
    "subject": "aa",
    "instructor": "bb",
    "area": "Information",
    "term": "fall",
    "year": "2026.0",
    "type": "pending",
    "allowedMaterialsStr": "calc, textbook",
    "pdf_file_id": "1dNPID2vwAfBgHFG2NFFx_yGryjkxu5cV",
    "pdf_url": "https://drive.google.com/file/d/1dNPID2vwAfBgHFG2NFFx_yGryjkxu5cV/view?usp=drivesdk",
    "created_at": "2026-02-13T09:09:33.084Z"
  },
  {
    "sourceSheet": "exams",
    "id": "EX_20260220_161914_8czvk4",
    "subject": "a",
    "instructor": "a",
    "area": "Information",
    "term": "spring",
    "year": "2026.0",
    "type": "pending",
    "allowedMaterialsStr": "dict",
    "pdf_file_id": "1OMkXBFm-baUmlIf9n6Qr_FP7-uHjtxNm",
    "pdf_url": "https://drive.google.com/file/d/1OMkXBFm-baUmlIf9n6Qr_FP7-uHjtxNm/view?usp=drivesdk",
    "created_at": "2026-02-20T07:19:14.674Z"
  },
  {
    "sourceSheet": "exams",
    "id": "EX_20260220_161950_yhqv6l",
    "subject": "a",
    "instructor": "a",
    "area": "Information",
    "term": "spring",
    "year": "2026.0",
    "type": "pending",
    "allowedMaterialsStr": "dict",
    "pdf_file_id": "1S-ES7Ix6czx8Dj717pDxHr8yrEVgEq2F",
    "pdf_url": "https://drive.google.com/file/d/1S-ES7Ix6czx8Dj717pDxHr8yrEVgEq2F/view?usp=drivesdk",
    "created_at": "2026-02-20T07:19:50.931Z"
  },
  {
    "sourceSheet": "exams",
    "id": "EX_20260220_163644_pj2qql",
    "subject": "a",
    "instructor": "",
    "area": "Information",
    "term": "spring",
    "year": "2026.0",
    "type": "pending",
    "allowedMaterialsStr": "dict",
    "pdf_file_id": "1fJZG_KVlQuQpMA756P0XtAPZqIZTxOsX",
    "pdf_url": "https://drive.google.com/file/d/1fJZG_KVlQuQpMA756P0XtAPZqIZTxOsX/view?usp=drivesdk",
    "created_at": "2026-02-20T07:36:44.246Z"
  },
  {
    "sourceSheet": "exams",
    "id": "EX_20260220_164239_anesv9",
    "subject": "a",
    "instructor": "",
    "area": "Information",
    "term": "spring",
    "year": "2026.0",
    "type": "pending",
    "allowedMaterialsStr": "",
    "pdf_file_id": "1ypOONrtbxMFFtqzRzxCTtMbI3btt-CKt",
    "pdf_url": "https://drive.google.com/file/d/1ypOONrtbxMFFtqzRzxCTtMbI3btt-CKt/view?usp=drivesdk",
    "created_at": "2026-02-20T07:42:39.556Z"
  },
  {
    "sourceSheet": "exams",
    "id": "EX_20260220_174041_uci33n",
    "subject": "saeki",
    "instructor": "akihiro",
    "area": "Information",
    "term": "spring",
    "year": "2026.0",
    "type": "approved",
    "allowedMaterialsStr": "",
    "pdf_file_id": "1lUaUGli3N8SSa0Rah9MXkU_RYcAwO1yZ",
    "pdf_url": "https://drive.google.com/file/d/1lUaUGli3N8SSa0Rah9MXkU_RYcAwO1yZ/view?usp=drivesdk",
    "created_at": "2026-02-20T08:40:41.845Z"
  },
  {
    "sourceSheet": "exams",
    "id": "EX_20260224_235738_mvbop7",
    "subject": "test_02-24",
    "instructor": "",
    "area": "Information",
    "term": "spring",
    "year": "2027.0",
    "type": "pending",
    "allowedMaterialsStr": "memo",
    "pdf_file_id": "1TVx0PWG2jU7_z3Kp8QteVgUDXoDeLTbH",
    "pdf_url": "https://drive.google.com/file/d/1TVx0PWG2jU7_z3Kp8QteVgUDXoDeLTbH/view?usp=drivesdk",
    "created_at": "2026-02-24T14:57:38.725Z"
  },
  {
    "sourceSheet": "exams",
    "id": "EX_20260225_000057_mmvtft",
    "subject": "test_githubio",
    "instructor": "",
    "area": "Information",
    "term": "spring",
    "year": "2027.0",
    "type": "pending",
    "allowedMaterialsStr": "",
    "pdf_file_id": "1m_fKr6cdD_E7iN_sxhnfdqA-tu6nhZld",
    "pdf_url": "https://drive.google.com/file/d/1m_fKr6cdD_E7iN_sxhnfdqA-tu6nhZld/view?usp=drivesdk",
    "created_at": "2026-02-24T15:00:57.613Z"
  },
  {
    "sourceSheet": "exams",
    "id": "EX_20260225_014200_ucf7rl",
    "subject": "approved_test",
    "instructor": "",
    "area": "Information",
    "term": "spring",
    "year": "2021.0",
    "type": "pending",
    "allowedMaterialsStr": "memo",
    "pdf_file_id": "10P4pI3Um_iMA2RtSmYslRypw0E0zHj9q",
    "pdf_url": "https://drive.google.com/file/d/10P4pI3Um_iMA2RtSmYslRypw0E0zHj9q/view?usp=drivesdk",
    "created_at": "2026-02-24T16:42:00.781Z"
  },
  {
    "sourceSheet": "exams",
    "id": "EX_20260225_014843_v39694",
    "subject": "test_approved",
    "instructor": "",
    "area": "Materials",
    "term": "spring",
    "year": "2026.0",
    "type": "Approved",
    "allowedMaterialsStr": "memo",
    "pdf_file_id": "1HP6IlnfbSyGZfqOapUGBI6nSxXbV7VZu",
    "pdf_url": "https://drive.google.com/file/d/1HP6IlnfbSyGZfqOapUGBI6nSxXbV7VZu/view?usp=drivesdk",
    "created_at": "2026-02-24T16:48:43.084Z"
  },
  {
    "sourceSheet": "exams",
    "id": "EX_20260225_015304_fx5oav",
    "subject": "あ",
    "instructor": "",
    "area": "Biological",
    "term": "fall",
    "year": "2022.0",
    "type": "pending",
    "allowedMaterialsStr": "textbook",
    "pdf_file_id": "1PaWIEy4yOXQPEHNVOz5YuMx8sM0Y36H7",
    "pdf_url": "https://drive.google.com/file/d/1PaWIEy4yOXQPEHNVOz5YuMx8sM0Y36H7/view?usp=drivesdk",
    "created_at": "2026-02-24T16:53:04.792Z"
  },
  {
    "sourceSheet": "exams",
    "id": "EX_20260225_015613_gxrp9y",
    "subject": "あ",
    "instructor": "",
    "area": "Biological",
    "term": "fall",
    "year": "2026.0",
    "type": "1",
    "allowedMaterialsStr": "dict",
    "pdf_file_id": "1wk0OSsq2CA0WJdSdIRFZxL5OvzbZdoVu",
    "pdf_url": "https://drive.google.com/file/d/1wk0OSsq2CA0WJdSdIRFZxL5OvzbZdoVu/view?usp=drivesdk",
    "created_at": "2026-02-24T16:56:13.206Z"
  },
  {
    "sourceSheet": "exams",
    "id": "EX_20260225_015854_ocx3z8",
    "subject": "test_approved",
    "instructor": "",
    "area": "Biological",
    "term": "spring",
    "year": "2022.0",
    "type": "Approved",
    "allowedMaterialsStr": "textbook",
    "pdf_file_id": "1JzRJrBnlMBWgTMgq0qewoDLZCw16qjvN",
    "pdf_url": "https://drive.google.com/file/d/1JzRJrBnlMBWgTMgq0qewoDLZCw16qjvN/view?usp=drivesdk",
    "created_at": "2026-02-24T16:58:54.095Z"
  }
];