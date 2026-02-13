export const termOptions = [
  { key: 'spring', label: '春学期' },
  { key: 'fall', label: '秋学期' },
] as const;

export const areaOptions = [
  { key: 'Information', label: '情報科学領域' },
  { key: 'Biological', label: 'バイオサイエンス領域' },
  { key: 'Materials', label: '物質創生科学領域' },
] as const;

export const allowedMaterialOptions = [
  { key: 'calc', label: '電卓' },
  { key: 'dict', label: '辞書' },
  { key: 'textbook', label: '教科書' },
  { key: 'notes', label: 'ノート' },
  { key: 'memo', label: '自作メモ' },
] as const;

const findLabel = (
  options: ReadonlyArray<{ key: string; label: string }>,
  key?: string
) => options.find((option) => option.key === key)?.label ?? '';

export const getTermLabel = (key?: string) => (key ? findLabel(termOptions, key) || key : '');
export const getAreaLabel = (key?: string) => (key ? findLabel(areaOptions, key) || key : '');
