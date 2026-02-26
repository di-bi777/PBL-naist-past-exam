import { buildTagsByFileId, resolveFileTags } from './tagResolver'
import type { DriveFile, FileTag } from './tagResolver'
import type { PastExamDbRow } from '@/app/constants/pastExamsDb'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const makeRow = (overrides: Partial<PastExamDbRow> = {}): PastExamDbRow => ({
  sourceSheet: 'exams',
  subject: 'Physics',
  instructor: 'Prof. A',
  area: 'Information',
  term: 'spring',
  year: '2024',
  type: 'final',
  allowedMaterialsStr: 'calc',
  pdf_file_id: 'file-id-001',
  ...overrides,
})

const makeFile = (overrides: Partial<DriveFile> = {}): DriveFile => ({
  id: 'file-id-001',
  name: 'Physics_2024.pdf',
  mimeType: 'application/pdf',
  ...overrides,
})

// ---------------------------------------------------------------------------
// buildTagsByFileId
// ---------------------------------------------------------------------------
describe('buildTagsByFileId', () => {
  it('returns an empty map for an empty array', () => {
    expect(buildTagsByFileId([])).toEqual(new Map())
  })

  it('creates one entry for a row with a valid pdf_file_id', () => {
    const map = buildTagsByFileId([makeRow()])
    expect(map.size).toBe(1)
    expect(map.has('file-id-001')).toBe(true)
  })

  it('skips a row whose pdf_file_id is undefined', () => {
    const map = buildTagsByFileId([makeRow({ pdf_file_id: undefined })])
    expect(map.size).toBe(0)
  })

  it('skips a row whose pdf_file_id is an empty string', () => {
    const map = buildTagsByFileId([makeRow({ pdf_file_id: '' })])
    expect(map.size).toBe(0)
  })

  it('skips a row whose pdf_file_id is whitespace only', () => {
    const map = buildTagsByFileId([makeRow({ pdf_file_id: '   ' })])
    expect(map.size).toBe(0)
  })

  it('first-seen rule: duplicate pdf_file_id keeps the first row', () => {
    const rows = [
      makeRow({ pdf_file_id: 'dup-id', subject: 'First' }),
      makeRow({ pdf_file_id: 'dup-id', subject: 'Second' }),
    ]
    const map = buildTagsByFileId(rows)
    expect(map.size).toBe(1)
    expect(map.get('dup-id')?.subject).toBe('First')
  })

  it('trims whitespace from all string fields', () => {
    const row = makeRow({
      pdf_file_id: '  abc  ',
      subject: '  Math  ',
      instructor: '  Dr. B  ',
      area: '  Bioscience  ',
      term: '  fall  ',
      year: '  2023  ',
      type: '  midterm  ',
      allowedMaterialsStr: '  notes  ',
    })
    const tag = buildTagsByFileId([row]).get('abc')!
    expect(tag.subject).toBe('Math')
    expect(tag.instructor).toBe('Dr. B')
    expect(tag.area).toBe('Bioscience')
    expect(tag.term).toBe('fall')
    expect(tag.year).toBe('2023')
    expect(tag.type).toBe('midterm')
    expect(tag.allowedMaterialsStr).toBe('notes')
  })

  it('sets matchType to "id"', () => {
    const tag = buildTagsByFileId([makeRow()]).get('file-id-001')!
    expect(tag.matchType).toBe('id')
  })

  it('maps sourceSheet correctly for "exams"', () => {
    const tag = buildTagsByFileId([makeRow({ sourceSheet: 'exams' })]).get('file-id-001')!
    expect(tag.sourceSheet).toBe('exams')
  })

  it('maps sourceSheet correctly for "assignments"', () => {
    const tag = buildTagsByFileId([makeRow({ sourceSheet: 'assignments' })]).get('file-id-001')!
    expect(tag.sourceSheet).toBe('assignments')
  })

  it('handles optional fields that are undefined', () => {
    const row = makeRow({
      subject: undefined,
      instructor: undefined,
      area: undefined,
      term: undefined,
      year: undefined,
      type: undefined,
      allowedMaterialsStr: undefined,
    })
    const tag = buildTagsByFileId([row]).get('file-id-001')!
    expect(tag.subject).toBeUndefined()
    expect(tag.instructor).toBeUndefined()
  })

  it('builds entries for multiple distinct rows', () => {
    const rows = [
      makeRow({ pdf_file_id: 'id-A' }),
      makeRow({ pdf_file_id: 'id-B' }),
      makeRow({ pdf_file_id: 'id-C' }),
    ]
    expect(buildTagsByFileId(rows).size).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// resolveFileTags
// ---------------------------------------------------------------------------
describe('resolveFileTags', () => {
  // --- exact match ---
  it('resolves a file with a matching ID (matchType = "id")', () => {
    const dbRows = [makeRow()]
    const tagsByFileId = buildTagsByFileId(dbRows)
    const files = [makeFile()]

    const result = resolveFileTags(files, tagsByFileId, dbRows)
    const tag = result.get('file-id-001')!
    expect(tag).toBeDefined()
    expect(tag.matchType).toBe('id')
    expect(tag.subject).toBe('Physics')
  })

  it('does not resolve a file whose ID is not in tagsByFileId and has no heuristic match', () => {
    const dbRows = [makeRow({ pdf_file_id: 'other-id' })]
    const tagsByFileId = buildTagsByFileId(dbRows)
    const files = [makeFile({ id: 'unknown-id', name: 'unknown.pdf' })]

    const result = resolveFileTags(files, tagsByFileId, dbRows)
    expect(result.has('unknown-id')).toBe(false)
  })

  it('resolves multiple files with different IDs correctly', () => {
    const rows = [
      makeRow({ pdf_file_id: 'id-1', subject: 'Math' }),
      makeRow({ pdf_file_id: 'id-2', subject: 'Chemistry' }),
    ]
    const tagsByFileId = buildTagsByFileId(rows)
    const files = [
      makeFile({ id: 'id-1', name: 'Math.pdf' }),
      makeFile({ id: 'id-2', name: 'Chemistry.pdf' }),
    ]

    const result = resolveFileTags(files, tagsByFileId, rows)
    expect(result.get('id-1')?.subject).toBe('Math')
    expect(result.get('id-2')?.subject).toBe('Chemistry')
  })

  // --- heuristic match ---
  it('resolves heuristically when filename includes the subject (no year in DB)', () => {
    const rows = [makeRow({ pdf_file_id: 'db-id', year: '', subject: 'Physics' })]
    const tagsByFileId = buildTagsByFileId(rows)
    // Drive file has a different ID but the filename contains the subject
    const files = [makeFile({ id: 'drive-xyz', name: 'Physics_exam.pdf' })]

    const result = resolveFileTags(files, tagsByFileId, rows)
    const tag = result.get('drive-xyz')!
    expect(tag).toBeDefined()
    expect(tag.matchType).toBe('heuristic')
    expect(tag.subject).toBe('Physics')
  })

  it('resolves heuristically when filename includes subject AND year', () => {
    const rows = [makeRow({ pdf_file_id: 'db-id', subject: 'Physics', year: '2024' })]
    const tagsByFileId = buildTagsByFileId(rows)
    const files = [makeFile({ id: 'drive-xyz', name: 'Physics_2024_final.pdf' })]

    const result = resolveFileTags(files, tagsByFileId, rows)
    expect(result.get('drive-xyz')?.matchType).toBe('heuristic')
  })

  it('normalises year "2024.0" to "2024" for the filename check', () => {
    const rows = [makeRow({ pdf_file_id: 'db-id', subject: 'Physics', year: '2024.0' })]
    const tagsByFileId = buildTagsByFileId(rows)
    // Filename contains "2024", not "2024.0"
    const files = [makeFile({ id: 'drive-xyz', name: 'physics_2024.pdf' })]

    const result = resolveFileTags(files, tagsByFileId, rows)
    expect(result.get('drive-xyz')?.matchType).toBe('heuristic')
  })

  it('does NOT match when filename has "2024.0" stripped and year is "2025"', () => {
    const rows = [makeRow({ pdf_file_id: 'db-id', subject: 'Physics', year: '2025.0' })]
    const tagsByFileId = buildTagsByFileId(rows)
    const files = [makeFile({ id: 'drive-xyz', name: 'physics_2024.pdf' })]

    const result = resolveFileTags(files, tagsByFileId, rows)
    expect(result.has('drive-xyz')).toBe(false)
  })

  it('subject comparison is case-insensitive', () => {
    const rows = [makeRow({ pdf_file_id: 'db-id', subject: 'Physics', year: '' })]
    const tagsByFileId = buildTagsByFileId(rows)
    const files = [makeFile({ id: 'drive-xyz', name: 'PHYSICS_exam.pdf' })]

    const result = resolveFileTags(files, tagsByFileId, rows)
    expect(result.get('drive-xyz')?.matchType).toBe('heuristic')
  })

  it('does not resolve when zero candidates match the filename', () => {
    const rows = [makeRow({ pdf_file_id: 'db-id', subject: 'Chemistry', year: '' })]
    const tagsByFileId = buildTagsByFileId(rows)
    const files = [makeFile({ id: 'drive-xyz', name: 'Physics_exam.pdf' })]

    const result = resolveFileTags(files, tagsByFileId, rows)
    expect(result.has('drive-xyz')).toBe(false)
  })

  it('does not resolve when multiple candidates match (ambiguous)', () => {
    const rows = [
      makeRow({ pdf_file_id: 'id-A', subject: 'Physics', year: '2024' }),
      makeRow({ pdf_file_id: 'id-B', subject: 'Physics', year: '2024' }),
    ]
    const tagsByFileId = buildTagsByFileId(rows)
    const files = [makeFile({ id: 'drive-xyz', name: 'physics_2024.pdf' })]

    const result = resolveFileTags(files, tagsByFileId, rows)
    expect(result.has('drive-xyz')).toBe(false)
  })

  it('does not resolve heuristically when DB subject is empty', () => {
    const rows = [makeRow({ pdf_file_id: 'db-id', subject: '', year: '' })]
    const tagsByFileId = buildTagsByFileId(rows)
    const files = [makeFile({ id: 'drive-xyz', name: 'anything.pdf' })]

    const result = resolveFileTags(files, tagsByFileId, rows)
    expect(result.has('drive-xyz')).toBe(false)
  })

  it('does not resolve heuristically when DB subject is undefined (covers subject ?? "" nullish branch)', () => {
    // subject is undefined → (undefined ?? '') = '' → !subject is true → skip
    const rows = [makeRow({ pdf_file_id: '', subject: undefined, year: '' })]
    const tagsByFileId = buildTagsByFileId(rows) // empty map (pdf_file_id is '')
    const files = [makeFile({ id: 'drive-xyz', name: 'physics_exam.pdf' })]

    const result = resolveFileTags(files, tagsByFileId, rows)
    expect(result.has('drive-xyz')).toBe(false)
  })

  it('matches heuristically when year is undefined in the DB row (covers year ?? "" nullish branch)', () => {
    // year is undefined → (undefined ?? '') = '' → !year is true → match by subject only
    const rows = [makeRow({ pdf_file_id: '', subject: 'physics', year: undefined })]
    const tagsByFileId = buildTagsByFileId(rows)
    const files = [makeFile({ id: 'drive-xyz', name: 'physics_exam.pdf' })]

    const result = resolveFileTags(files, tagsByFileId, rows)
    expect(result.get('drive-xyz')?.matchType).toBe('heuristic')
  })

  it('exact match takes priority over heuristic (exact ID is not re-evaluated)', () => {
    // The file's Drive ID matches exactly in the DB AND its filename also matches
    // the heuristic — exact should win.
    const rows = [makeRow({ pdf_file_id: 'file-id-001', subject: 'Physics', year: '' })]
    const tagsByFileId = buildTagsByFileId(rows)
    const files = [makeFile({ id: 'file-id-001', name: 'physics_exam.pdf' })]

    const result = resolveFileTags(files, tagsByFileId, rows)
    expect(result.get('file-id-001')?.matchType).toBe('id')
  })

  it('sets matchType "heuristic" and preserves all DB fields', () => {
    const rows = [
      makeRow({
        pdf_file_id: 'db-id',
        subject: 'Chemistry',
        instructor: 'Dr. C',
        area: 'Materials',
        term: 'fall',
        year: '2023',
        type: 'midterm',
        allowedMaterialsStr: 'notes',
        sourceSheet: 'assignments',
      }),
    ]
    const tagsByFileId = buildTagsByFileId(rows)
    const files = [makeFile({ id: 'drive-new', name: 'chemistry_2023.pdf' })]

    const result = resolveFileTags(files, tagsByFileId, rows)
    const tag = result.get('drive-new')!
    expect(tag.matchType).toBe('heuristic')
    expect(tag.sourceSheet).toBe('assignments')
    expect(tag.instructor).toBe('Dr. C')
    expect(tag.area).toBe('Materials')
    expect(tag.term).toBe('fall')
    expect(tag.year).toBe('2023')
    expect(tag.type).toBe('midterm')
    expect(tag.allowedMaterialsStr).toBe('notes')
  })

  it('returns an empty map when given no drive files', () => {
    const rows = [makeRow()]
    const tagsByFileId = buildTagsByFileId(rows)
    expect(resolveFileTags([], tagsByFileId, rows).size).toBe(0)
  })

  // --- category filtering helpers ---
  it('correctly categorises exam vs assignment files via sourceSheet', () => {
    const rows = [
      makeRow({ pdf_file_id: 'ex-id', sourceSheet: 'exams', subject: 'Math', year: '' }),
      makeRow({ pdf_file_id: 'as-id', sourceSheet: 'assignments', subject: 'Biology', year: '' }),
    ]
    const tagsByFileId = buildTagsByFileId(rows)
    const files = [
      makeFile({ id: 'ex-id', name: 'math_exam.pdf' }),
      makeFile({ id: 'as-id', name: 'biology_hw.pdf' }),
      makeFile({ id: 'un-id', name: 'unknown.pdf' }),
    ]

    const resolved = resolveFileTags(files, tagsByFileId, rows)

    const examFiles = files.filter(f => resolved.get(f.id)?.sourceSheet === 'exams')
    const assignmentFiles = files.filter(f => resolved.get(f.id)?.sourceSheet === 'assignments')
    const uncategorized = files.filter(f => !resolved.has(f.id))

    expect(examFiles.map(f => f.id)).toEqual(['ex-id'])
    expect(assignmentFiles.map(f => f.id)).toEqual(['as-id'])
    expect(uncategorized.map(f => f.id)).toEqual(['un-id'])
  })
})
