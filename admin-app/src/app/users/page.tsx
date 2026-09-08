/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  X,
  Trash2,
  Loader2,
  ShieldCheck,
  UserCheck,
  UserX,
  Video,
  Filter,
  RotateCcw,
} from 'lucide-react';

interface UserRecord {
  id: number;
  email: string;
  is_approved: number;
  can_watch_video: number;
  level: string;
  is_admin: number;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'approved' | 'pending' | 'can_watch' | 'admin'
  >('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

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

  // Filter users by search query and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search matching by email or id
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        user.email.toLowerCase().includes(q) ||
        user.id.toString().includes(q) ||
        `#${user.id}`.includes(q);

      // Status filter
      let matchStatus = true;
      if (statusFilter === 'approved') {
        matchStatus = user.is_approved === 1;
      } else if (statusFilter === 'pending') {
        matchStatus = user.is_approved === 0;
      } else if (statusFilter === 'can_watch') {
        matchStatus = user.can_watch_video === 1;
      } else if (statusFilter === 'admin') {
        matchStatus = user.is_admin === 1;
      }

      // Level filter
      const matchLevel =
        levelFilter === 'all' ||
        (user.level && user.level.toLowerCase() === levelFilter.toLowerCase());

      return matchSearch && matchStatus && matchLevel;
    });
  }, [users, searchQuery, statusFilter, levelFilter]);

  // Quick stats
  const stats = useMemo(() => {
    const total = users.length;
    const approved = users.filter(u => u.is_approved === 1).length;
    const pending = users.filter(u => u.is_approved === 0).length;
    const canWatch = users.filter(u => u.can_watch_video === 1).length;
    const admins = users.filter(u => u.is_admin === 1).length;
    return { total, approved, pending, canWatch, admins };
  }, [users]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setLevelFilter('all');
  };

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

  const handleToggleWatchVideo = async (user: UserRecord) => {
    try {
      setActionLoading(user.id);
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          canWatchVideo: user.can_watch_video === 1 ? 0 : 1,
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

  const handleChangeLevel = async (user: UserRecord, newLevel: string) => {
    try {
      setActionLoading(user.id);
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          level: newLevel,
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
          isApproved: 1,
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

  const hasActiveFilters =
    searchQuery !== '' || statusFilter !== 'all' || levelFilter !== 'all';

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='flex items-center gap-2.5 text-2xl font-black tracking-tight text-white'>
            <Users className='size-7 text-purple-400' />
            Quản Lý Thành Viên (Users)
          </h1>
          <p className='mt-1 text-xs text-slate-400'>
            Tổng cộng{' '}
            <span className='font-bold text-purple-400'>{stats.total}</span> tài
            khoản trong hệ thống • {stats.approved} đã kích hoạt •{' '}
            {stats.pending} chờ duyệt • {stats.canWatch} có quyền video
          </p>
        </div>
      </div>

      {/* Search Bar & Filter Controls */}
      <div className='flex flex-col gap-3 rounded-2xl border border-[#1e1e24] bg-[#0c0c0e] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between'>
        {/* Search input */}
        <div className='relative flex-1 sm:max-w-md'>
          <Search className='absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400' />
          <input
            type='text'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder='Tìm kiếm theo email hoặc ID người dùng...'
            className='w-full rounded-xl border border-[#2d2d38] bg-[#16161c] py-2.5 pr-10 pl-10 text-xs text-white transition-colors placeholder:text-slate-500 focus:border-purple-500 focus:outline-none'
          />
          {searchQuery && (
            <button
              type='button'
              onClick={() => setSearchQuery('')}
              className='absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-white'
            >
              <X className='size-3.5' />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className='flex flex-wrap items-center gap-2'>
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className='rounded-xl border border-[#2d2d38] bg-[#16161c] px-3 py-2 text-xs font-semibold text-slate-300 focus:border-purple-500 focus:outline-none'
          >
            <option value='all'>Tất cả trạng thái</option>
            <option value='approved'>Đã kích hoạt</option>
            <option value='pending'>Chờ duyệt</option>
            <option value='can_watch'>Được xem video</option>
            <option value='admin'>Quản trị viên</option>
          </select>

          {/* Level filter */}
          <select
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
            className='rounded-xl border border-[#2d2d38] bg-[#16161c] px-3 py-2 text-xs font-semibold text-slate-300 focus:border-purple-500 focus:outline-none'
          >
            <option value='all'>Tất cả cấp độ</option>
            <option value='n5'>JLPT N5</option>
            <option value='n4'>JLPT N4</option>
            <option value='n3'>JLPT N3</option>
            <option value='n2'>JLPT N2</option>
            <option value='n1'>JLPT N1</option>
          </select>

          {/* Clear filter button */}
          {hasActiveFilters && (
            <button
              type='button'
              onClick={handleClearFilters}
              className='inline-flex items-center gap-1 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-300 transition-colors hover:bg-purple-500/20'
            >
              <RotateCcw className='size-3' />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* Match info */}
      {hasActiveFilters && (
        <div className='flex items-center justify-between px-1 text-xs text-slate-400'>
          <span>
            Tìm thấy <b className='text-purple-400'>{filteredUsers.length}</b>{' '}
            kết quả phù hợp (trên tổng số {users.length} tài khoản)
          </span>
        </div>
      )}

      {/* Table */}
      <div className='rounded-2xl border border-[#1e1e24] bg-[#0c0c0e] p-5 shadow-sm'>
        {loading ? (
          <div className='flex justify-center py-20'>
            <Loader2 className='size-8 animate-spin text-purple-500' />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-slate-500'>
            <Users className='mb-2 size-10 text-slate-700' />
            <p className='text-xs font-medium'>
              {hasActiveFilters
                ? 'Không tìm thấy người dùng nào khớp với điều kiện tìm kiếm.'
                : 'Chưa có người dùng nào.'}
            </p>
            {hasActiveFilters && (
              <button
                type='button'
                onClick={handleClearFilters}
                className='mt-3 inline-flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20'
              >
                <RotateCcw className='size-3' />
                Xóa tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <div className='overflow-hidden rounded-xl border border-[#1e1e24]'>
            <table className='w-full border-collapse text-left text-sm'>
              <thead>
                <tr className='border-b border-[#1e1e24] bg-[#121215] text-xs font-semibold text-slate-400'>
                  <th className='px-5 py-3'>ID</th>
                  <th className='px-5 py-3'>Email</th>
                  <th className='px-5 py-3'>Trạng Thái</th>
                  <th className='px-5 py-3'>Xem Video</th>
                  <th className='px-5 py-3'>Cấp Độ JLPT</th>
                  <th className='px-5 py-3'>Vai Trò</th>
                  <th className='px-5 py-3'>Ngày Tạo</th>
                  <th className='px-5 py-3 text-right'>Thao Tác</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-[#1e1e24]'>
                {filteredUsers.map(user => (
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
                      {user.can_watch_video === 1 ? (
                        <span className='inline-flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400'>
                          <Video className='size-3' />
                          Được xem
                        </span>
                      ) : (
                        <span className='inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800/40 px-2 py-0.5 text-[10px] font-bold text-slate-500'>
                          Chưa cấp
                        </span>
                      )}
                    </td>
                    <td className='px-5 py-3.5'>
                      <select
                        value={user.level ? user.level.toLowerCase() : 'n5'}
                        disabled={actionLoading !== null}
                        onChange={e => handleChangeLevel(user, e.target.value)}
                        className='cursor-pointer rounded-lg border border-[#2d2d38] bg-[#16161c] px-2.5 py-1 text-xs font-semibold text-purple-300 transition-colors hover:border-purple-500/50 focus:border-purple-500 focus:outline-none disabled:opacity-50'
                      >
                        <option value='n5'>N5 (Cơ bản)</option>
                        <option value='n4'>N4 (Sơ cấp)</option>
                        <option value='n3'>N3 (Trung cấp)</option>
                        <option value='n2'>N2 (Cao cấp)</option>
                        <option value='n1'>N1 (Thượng cấp)</option>
                      </select>
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
                        onClick={() => handleToggleWatchVideo(user)}
                        className={`flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                          user.can_watch_video === 1
                            ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                            : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                        }`}
                        title='Cấp hoặc chặn quyền xem video'
                      >
                        {user.can_watch_video === 1
                          ? 'Chặn Video'
                          : 'Cấp Video'}
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
