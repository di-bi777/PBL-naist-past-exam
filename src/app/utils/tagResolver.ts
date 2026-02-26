import type { PastExamDbRow } from '@/app/constants/pastExamsDb';

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
};

export type FileTag = {
  sourceSheet: 'exams' | 'assignments';
  subject?: string;
  instructor?: string;
  area?: string;
  term?: string;
  year?: string;
  type?: string;
  allowedMaterialsStr?: string;
  matchType: 'id' | 'heuristic';
};

/**
 * Build a map of pdf_file_id → FileTag from the DB rows using exact ID matching.
 * - Rows with missing or empty pdf_file_id are skipped.
 * - When multiple rows share the same pdf_file_id, the first one wins.
 */
export const buildTagsByFileId = (dbRows: PastExamDbRow[]): Map<string, FileTag> => {
  const map = new Map<string, FileTag>();
  for (const row of dbRows) {
    const fileId = (row.pdf_file_id ?? '').trim();
    if (!fileId || map.has(fileId)) continue;
    map.set(fileId, {
      sourceSheet: row.sourceSheet,
      subject: row.subject?.trim(),
      instructor: row.instructor?.trim(),
      area: row.area?.trim(),
      term: row.term?.trim(),
      year: row.year?.trim(),
      type: row.type?.trim(),
      allowedMaterialsStr: row.allowedMaterialsStr?.trim(),
      matchType: 'id',
    });
  }
  return map;
};

/**
 * Resolve a FileTag for each Drive file.
 *
 * Pass 1 – exact match: if the file's Drive ID exists in tagsByFileId, use it.
 * Pass 2 – heuristic:   if the filename (lower-cased) contains a DB row's subject
 *           and (when present) that row's year, and exactly one DB row matches,
 *           tag the file with matchType 'heuristic'.
 *
 * Years stored as "2024.0" are normalised to "2024" before the substring check.
 */
export const resolveFileTags = (
  driveFiles: DriveFile[],
  tagsByFileId: Map<string, FileTag>,
  dbRows: PastExamDbRow[],
): Map<string, FileTag> => {
  const resolved = new Map<string, FileTag>();

  // Pass 1: exact ID match
  for (const file of driveFiles) {
    const exact = tagsByFileId.get(file.id);
    if (exact) resolved.set(file.id, exact);
  }

  // Pass 2: heuristic – filename includes subject (+ year when present)
  for (const file of driveFiles) {
    if (resolved.has(file.id)) continue;
    const fileName = file.name.toLowerCase();

    const candidates = dbRows.filter((row) => {
      const subject = (row.subject ?? '').trim().toLowerCase();
      if (!subject || !fileName.includes(subject)) return false;

      const rawYear = (row.year ?? '').trim();
      const year = rawYear.endsWith('.0') ? rawYear.slice(0, -2) : rawYear;
      if (!year) return true;
      return fileName.includes(year);
    });

    if (candidates.length !== 1) continue;
    const row = candidates[0];
    resolved.set(file.id, {
      sourceSheet: row.sourceSheet,
      subject: row.subject?.trim(),
      instructor: row.instructor?.trim(),
      area: row.area?.trim(),
      term: row.term?.trim(),
      year: row.year?.trim(),
      type: row.type?.trim(),
      allowedMaterialsStr: row.allowedMaterialsStr?.trim(),
      matchType: 'heuristic',
    });
  }

  return resolved;
};
