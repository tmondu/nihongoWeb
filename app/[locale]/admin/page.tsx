/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  KeyRound,
  CheckCircle2,
  UserX,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/shared/ui/components/button';

interface Stats {
  totalUsers: number;
  pendingUsers: number;
  totalVocab: number;
  totalKanji: number;
}

interface UserRecord {
  id: number;
  email: string;
  is_approved: number;
  is_admin: number;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch stats
      const statsRes = await fetch('/api/admin/stats');
      if (!statsRes.ok) throw new Error('Không thể tải thống kê');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch pending users by filtering user list
      const usersRes = await fetch('/api/admin/users');
      if (!usersRes.ok) throw new Error('Không thể tải danh sách thành viên');
      const usersData = await usersRes.json();
      const filteredPending = usersData.filter(
        (u: UserRecord) => u.is_approved === 0,
      );
      setPendingUsers(filteredPending);
      setError('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Đã xảy ra lỗi không xác định.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApprove = async (userId: number) => {
    try {
      setActionLoading(userId);
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          isApproved: 1,
          isAdmin: 0,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Duyệt thành viên thất bại');
      }

      // Refresh data
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thành viên này không?')) return;

    try {
      setActionLoading(userId);
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Xóa thành viên thất bại');
      }

      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && !stats) {
    return (
      <div className='flex min-h-[50vh] items-center justify-center'>
        <Loader2 className='size-8 animate-spin text-amber-500' />
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Welcome header */}
      <div>
        <h2 className='text-3xl font-extrabold tracking-tight text-white'>
          Tổng quan hệ thống
        </h2>
        <p className='mt-1 text-sm text-slate-400'>
          Theo dõi số liệu thống kê và phê duyệt thành viên mới nhanh chóng.
        </p>
      </div>

      {error && (
        <div className='flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-950/10 p-4 text-sm text-red-400'>
          <AlertCircle className='size-5 shrink-0' />
          <span>{error}</span>
        </div>
      )}

      {/* Grid Stats */}
      {stats && (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {/* Card 1: Users */}
          <div className='group rounded-2xl border border-[#1a1a1f] bg-[#09090b]/80 p-6 backdrop-blur-md transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/2'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-xs font-semibold tracking-wider text-slate-500 uppercase'>
                  Tổng thành viên
                </p>
                <h3 className='mt-2 text-3xl font-black text-white transition-colors group-hover:text-blue-400'>
                  {stats.totalUsers}
                </h3>
              </div>
              <div className='rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-500'>
                <Users className='size-5' />
              </div>
            </div>
          </div>

          {/* Card 2: Pending approvals */}
          <div className='group rounded-2xl border border-[#1a1a1f] bg-[#09090b]/80 p-6 backdrop-blur-md transition-all hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/2'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-xs font-semibold tracking-wider text-slate-500 uppercase'>
                  Chờ phê duyệt
                </p>
                <h3 className='mt-2 text-3xl font-black text-white transition-colors group-hover:text-amber-400'>
                  {stats.pendingUsers}
                </h3>
              </div>
              <div className='rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-500'>
                <KeyRound className='size-5' />
              </div>
            </div>
          </div>

          {/* Card 3: Vocabulary */}
          <div className='group rounded-2xl border border-[#1a1a1f] bg-[#09090b]/80 p-6 backdrop-blur-md transition-all hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/2'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-xs font-semibold tracking-wider text-slate-500 uppercase'>
                  Tổng số Từ vựng
                </p>
                <h3 className='mt-2 text-3xl font-black text-white transition-colors group-hover:text-purple-400'>
                  {stats.totalVocab}
                </h3>
              </div>
              <div className='rounded-xl border border-purple-500/20 bg-purple-500/10 p-3 text-purple-500'>
                <BookOpen className='size-5' />
              </div>
            </div>
          </div>

          {/* Card 4: Kanji */}
          <div className='group rounded-2xl border border-[#1a1a1f] bg-[#09090b]/80 p-6 backdrop-blur-md transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/2'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-xs font-semibold tracking-wider text-slate-500 uppercase'>
                  Tổng số Kanji
                </p>
                <h3 className='mt-2 text-3xl font-black text-white transition-colors group-hover:text-emerald-400'>
                  {stats.totalKanji}
                </h3>
              </div>
              <div className='rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-500'>
                <CheckCircle2 className='size-5' />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending approvals section */}
      <div className='rounded-2xl border border-[#1a1a1f] bg-[#09090b] p-6'>
        <h3 className='flex items-center gap-2 text-lg font-bold text-white'>
          <span>Thành viên đang chờ duyệt</span>
          {pendingUsers.length > 0 && (
            <span className='rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-500'>
              {pendingUsers.length}
            </span>
          )}
        </h3>

        {pendingUsers.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-sm text-slate-500'>
            <CheckCircle2 className='mb-3 size-12 text-slate-700' />
            <p>Không có đăng ký mới nào đang chờ phê duyệt.</p>
          </div>
        ) : (
          <div className='mt-6 overflow-hidden rounded-xl border border-[#1a1a1f]'>
            <table className='w-full border-collapse text-left'>
              <thead>
                <tr className='border-b border-[#1a1a1f] bg-[#121215] text-xs font-semibold text-slate-400'>
                  <th className='px-6 py-3.5'>Email</th>
                  <th className='px-6 py-3.5'>Ngày đăng ký</th>
                  <th className='px-6 py-3.5 text-right'>Thao tác</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-[#1a1a1f] bg-[#09090b]/50'>
                {pendingUsers.map(user => (
                  <tr
                    key={user.id}
                    className='text-sm text-slate-300 transition-colors hover:bg-[#121215]/50'
                  >
                    <td className='px-6 py-4 font-medium text-white'>
                      {user.email}
                    </td>
                    <td className='px-6 py-4 font-mono text-xs text-slate-500'>
                      {new Date(user.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className='flex items-center justify-end gap-2 px-6 py-4 text-right'>
                      <Button
                        size='sm'
                        disabled={actionLoading !== null}
                        onClick={() => handleApprove(user.id)}
                        className='flex h-8.5 cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-500'
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className='size-3 animate-spin' />
                        ) : (
                          <CheckCircle2 className='size-3.5' />
                        )}
                        Duyệt
                      </Button>
                      <Button
                        size='sm'
                        variant='ghost'
                        disabled={actionLoading !== null}
                        onClick={() => handleDelete(user.id)}
                        className='flex h-8.5 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300'
                      >
                        <UserX className='size-3.5' />
                        Từ chối
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
