/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  Trash2,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
} from 'lucide-react';

interface UserRecord {
  id: number;
  email: string;
  is_approved: number;
  is_admin: number;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchUsers = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Không thể tải danh sách người dùng');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleApprove = async (user: UserRecord) => {
    try {
      setActionLoading(user.id);
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          isApproved: user.is_approved === 1 ? 0 : 1,
          isAdmin: user.is_admin,
        }),
      });
      if (res.ok) {
        await fetchUsers(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleAdmin = async (user: UserRecord) => {
    const nextAdmin = user.is_admin === 1 ? 0 : 1;
    if (
      !confirm(
        `Bạn có chắc chắn muốn ${nextAdmin ? 'CẤP' : 'HỦY'} quyền Quản trị viên (Admin) cho ${user.email}?`,
      )
    )
      return;

    try {
      setActionLoading(user.id);
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          isApproved: 1, // Make sure admin is approved
          isAdmin: nextAdmin,
        }),
      });
      if (res.ok) {
        await fetchUsers(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản này không?'))
      return;

    try {
      setActionLoading(userId);
      const res = await fetch(`/api/users?userId=${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchUsers(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-black tracking-tight text-white'>
            Quản Lý Thành Viên (Users)
          </h1>
          <p className='mt-1 text-xs text-slate-400'>
            Tổng cộng:{' '}
            <span className='font-bold text-purple-400'>{users.length}</span>{' '}
            tài khoản trong hệ thống
          </p>
        </div>
      </div>

      {/* Table */}
      <div className='rounded-2xl border border-[#1e1e24] bg-[#0c0c0e] p-5 shadow-sm'>
        {loading ? (
          <div className='flex justify-center py-20'>
            <Loader2 className='size-8 animate-spin text-purple-500' />
          </div>
        ) : users.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-slate-500'>
            <Users className='mb-2 size-10 text-slate-700' />
            <p className='text-xs'>Không có người dùng nào.</p>
          </div>
        ) : (
          <div className='overflow-hidden rounded-xl border border-[#1e1e24]'>
            <table className='w-full border-collapse text-left text-sm'>
              <thead>
                <tr className='border-b border-[#1e1e24] bg-[#121215] text-xs font-semibold text-slate-400'>
                  <th className='px-5 py-3'>ID</th>
                  <th className='px-5 py-3'>Email</th>
                  <th className='px-5 py-3'>Trạng Thái</th>
                  <th className='px-5 py-3'>Vai Trò</th>
                  <th className='px-5 py-3'>Ngày Tạo</th>
                  <th className='px-5 py-3 text-right'>Thao Tác</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-[#1e1e24]'>
                {users.map(user => (
                  <tr
                    key={user.id}
                    className='text-slate-300 transition-colors hover:bg-[#16161a]'
                  >
                    <td className='px-5 py-3.5 font-mono text-xs text-slate-500'>
                      #{user.id}
                    </td>
                    <td className='px-5 py-3.5 font-medium text-white'>
                      {user.email}
                    </td>
                    <td className='px-5 py-3.5'>
                      {user.is_approved === 1 ? (
                        <span className='inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400'>
                          <UserCheck className='size-3' />
                          Đã kích hoạt
                        </span>
                      ) : (
                        <span className='inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400'>
                          <UserX className='size-3' />
                          Chờ duyệt
                        </span>
                      )}
                    </td>
                    <td className='px-5 py-3.5'>
                      {user.is_admin === 1 ? (
                        <span className='inline-flex items-center gap-1 rounded-md border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400'>
                          <ShieldCheck className='size-3' />
                          Admin
                        </span>
                      ) : (
                        <span className='text-xs text-slate-500'>Học viên</span>
                      )}
                    </td>
                    <td className='px-5 py-3.5 text-xs text-slate-400'>
                      {new Date(user.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className='flex items-center justify-end gap-2 px-5 py-3.5 text-right'>
                      <button
                        disabled={actionLoading !== null}
                        onClick={() => handleToggleApprove(user)}
                        className={`flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                          user.is_approved === 1
                            ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {user.is_approved === 1 ? 'Khóa' : 'Duyệt'}
                      </button>

                      <button
                        disabled={actionLoading !== null}
                        onClick={() => handleToggleAdmin(user)}
                        className='flex cursor-pointer items-center gap-1 rounded-lg bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-400 transition-colors hover:bg-purple-500/20'
                      >
                        {user.is_admin === 1 ? 'Hạ quyền' : 'Lên Admin'}
                      </button>

                      <button
                        disabled={actionLoading !== null}
                        onClick={() => handleDelete(user.id)}
                        className='flex size-7 cursor-pointer items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-950/20 hover:text-red-300'
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className='size-3.5 animate-spin' />
                        ) : (
                          <Trash2 className='size-3.5' />
                        )}
                      </button>
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
