import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

interface SubmissionListRow extends RowDataPacket {
  id: number;
  user_id: number;
  test_id: number;
  test_title: string;
  student_name: string | null;
  student_email: string;
  student_sbd: string | null;
  mcq_status: string;
  essay_status: string;
  overall_status: string;
  mcq_score: number;
  essay_score: number;
  total_score: number;
  mcq_time_spent_seconds: number;
  essay_time_spent_seconds: number;
  completed_at: string | null;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('id');
    const query = searchParams.get('query')?.trim();

    const pool = getDbPool();

    // If ID is provided, fetch full details for one submission
    if (submissionId) {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT s.*, u.display_name as student_name, u.email as student_email, u.sbd as student_sbd, t.title as test_title
         FROM assessment_submissions s
         JOIN users u ON s.user_id = u.id
         JOIN assessment_tests t ON s.test_id = t.id
         WHERE s.id = ?`,
        [Number(submissionId)],
      );

      if (rows.length === 0) {
        return NextResponse.json(
          { error: 'Không tìm thấy bài thi' },
          { status: 404 },
        );
      }

      const item = rows[0];
      return NextResponse.json({
        submission: {
          ...item,
          answers:
            typeof item.answers_json === 'string'
              ? JSON.parse(item.answers_json)
              : item.answers_json || {},
          grading_details:
            typeof item.grading_details_json === 'string'
              ? JSON.parse(item.grading_details_json)
              : item.grading_details_json || {},
        },
      });
    }

    // Otherwise fetch list
    let sql = `
      SELECT s.id, s.user_id, s.test_id, t.title as test_title, 
             u.display_name as student_name, u.email as student_email, u.sbd as student_sbd,
             s.mcq_status, s.essay_status, s.overall_status,
             s.mcq_score, s.essay_score, s.total_score,
             s.mcq_time_spent_seconds, s.essay_time_spent_seconds,
             s.completed_at, s.created_at
      FROM assessment_submissions s
      JOIN users u ON s.user_id = u.id
      JOIN assessment_tests t ON s.test_id = t.id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (query) {
      sql += ' AND (u.email LIKE ? OR u.display_name LIKE ? OR u.sbd LIKE ?)';
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }

    sql += ' ORDER BY s.id DESC';

    const [rows] = await pool.execute<SubmissionListRow[]>(sql, params);

    return NextResponse.json({
      submissions: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error('Error fetching admin assessment submissions:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
