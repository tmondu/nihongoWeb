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
  RotateCcw,
  Check,
  ArchiveRestore,
  AlertTriangle,
  ArrowLeft,
  Calendar,
} from 'lucide-react';

interface UserRecord {
  id: number;
  sbd: string | null;
  email: string;
  display_name: string | null;
  is_approved: number;
  can_watch_video: number;
  level: string;
  is_admin: number;
  created_at: string;
  deleted_at: string | null;
}

export default function AdminUsersPage() {
  const [currentTab, setCurrentTab] = useState<'active' | 'trash'>('active');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [trashCount, setTrashCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | string | null>(
    null,
  );

  // SBD manual entry states
  const [sbdInputs, setSbdInputs] = useState<Record<number, string>>({});
  const [savingSbdId, setSavingSbdId] = useState<number | null>(null);
  const [savedSbdId, setSavedSbdId] = useState<number | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'approved' | 'pending' | 'can_watch' | 'admin'
  >('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  // Confirmation Modals
  const [softDeleteTarget, setSoftDeleteTarget] = useState<UserRecord | null>(
    null,
  );
  const [permanentDeleteTarget, setPermanentDeleteTarget] =
    useState<UserRecord | null>(null);
  const [showEmptyTrashModal, setShowEmptyTrashModal] = useState(false);

  const fetchUsers = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const isTrash = currentTab === 'trash';
      const queryParams = new URLSearchParams();
      if (isTrash) queryParams.set('trash', 'true');
      if (searchQuery.trim()) queryParams.set('query', searchQuery.trim());

      const res = await fetch(`/api/users?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Không thể tải danh sách người dùng');
      const data = await res.json();

      if (data && typeof data === 'object' && 'users' in data) {
        setUsers(data.users || []);
        setActiveCount(data.activeCount || 0);
        setTrashCount(data.trashCount || 0);
      } else if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab]);

  // Filter users by search query and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search matching by email, display_name or sbd
      const q = searchQuery.trim().toLowerCase();
      const currentSbd =
        sbdInputs[user.id] !== undefined ? sbdInputs[user.id] : user.sbd || '';

      const matchSearch =
        !q ||
        user.email.toLowerCase().includes(q) ||
        (user.display_name && user.display_name.toLowerCase().includes(q)) ||
        currentSbd.toLowerCase().includes(q);

      if (currentTab === 'trash') {
        return matchSearch;
      }

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
  }, [users, searchQuery, statusFilter, levelFilter, sbdInputs, currentTab]);

  // Quick stats for active users
  const stats = useMemo(() => {
    const total = activeCount;
    const approved = users.filter(u => u.is_approved === 1).length;
    const pending = users.filter(u => u.is_approved === 0).length;
    const canWatch = users.filter(u => u.can_watch_video === 1).length;
    const admins = users.filter(u => u.is_admin === 1).length;
    return { total, approved, pending, canWatch, admins };
  }, [users, activeCount]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setLevelFilter('all');
  };

  const handleSaveSbd = async (user: UserRecord) => {
    const inputVal = sbdInputs[user.id];
    if (inputVal === undefined) return;

    const trimmed = inputVal.trim();
    const currentVal = (user.sbd || '').trim();
    if (trimmed === currentVal) return;

    try {
      setSavingSbdId(user.id);
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          sbd: trimmed,
        }),
      });

      if (res.ok) {
        setUsers(prev =>
          prev.map(u =>
            u.id === user.id ? { ...u, sbd: trimmed || null } : u,
          ),
        );
        setSavedSbdId(user.id);
        setTimeout(() => {
          setSavedSbdId(prev => (prev === user.id ? null : prev));
        }, 2000);
      } else {
        const data = await res.json();
        alert(data.error || 'Lỗi khi lưu SBD');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối đến máy chủ để lưu SBD');
    } finally {
      setSavingSbdId(null);
    }
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

  // 1. Soft Delete Action (Move to Trash)
  const handleConfirmSoftDelete = async () => {
    if (!softDeleteTarget) return;
    try {
      setActionLoading('soft-delete');
      const res = await fetch(`/api/users?userId=${softDeleteTarget.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSoftDeleteTarget(null);
        await fetchUsers(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // 2. Restore Action (Restore from Trash)
  const handleRestoreUser = async (userId: number) => {
    try {
      setActionLoading(userId);
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'restore',
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

  // 3. Restore All Action
  const handleRestoreAll = async () => {
    if (
      !confirm('Bạn có chắc muốn khôi phục toàn bộ tài khoản trong thùng rác?')
    )
      return;
    try {
      setActionLoading('restore-all');
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore_all' }),
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

  // 4. Permanent Hard Delete Action
  const handleConfirmPermanentDelete = async () => {
    if (!permanentDeleteTarget) return;
    try {
      setActionLoading('permanent-delete');
      const res = await fetch(
        `/api/users?userId=${permanentDeleteTarget.id}&permanent=true`,
        { method: 'DELETE' },
      );
      if (res.ok) {
        setPermanentDeleteTarget(null);
        await fetchUsers(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // 5. Empty All Trash Action
  const handleConfirmEmptyTrash = async () => {
    try {
      setActionLoading('empty-trash');
      const res = await fetch('/api/users?emptyTrash=true', {
        method: 'DELETE',
      });
      if (res.ok) {
        setShowEmptyTrashModal(false);
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
      {/* Header & Tabs */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='flex items-center gap-2.5 text-2xl font-black tracking-tight text-white'>
            <Users className='size-7 text-purple-400' />
            Quản Lý Thành Viên (Users)
          </h1>
          <p className='mt-1 text-xs text-slate-400'>
            {currentTab === 'active' ? (
              <>
                Tổng cộng{' '}
                <span className='font-bold text-purple-400'>{activeCount}</span>{' '}
                tài khoản đang hoạt động • {stats.approved} đã kích hoạt •{' '}
                {stats.pending} chờ duyệt • {stats.canWatch} có quyền video
              </>
            ) : (
              <>
                Thùng rác chứa{' '}
                <span className='font-bold text-rose-400'>{trashCount}</span>{' '}
                tài khoản đã xóa tạm thời. Bạn có thể khôi phục bất cứ lúc nào.
              </>
            )}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className='flex items-center gap-2 rounded-2xl border border-[#1e1e24] bg-[#0c0c0e] p-1.5'>
          <button
            type='button'
            onClick={() => {
              setCurrentTab('active');
              setSearchQuery('');
            }}
            className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              currentTab === 'active'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className='size-4' />
            <span>Thành Viên Hoạt Động</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                currentTab === 'active'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#1e1e24] text-slate-400'
              }`}
            >
              {activeCount}
            </span>
          </button>

          <button
            type='button'
            onClick={() => {
              setCurrentTab('trash');
              setSearchQuery('');
            }}
            className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              currentTab === 'trash'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-400 hover:text-rose-300'
            }`}
          >
            <Trash2 className='size-4' />
            <span>Thùng Rác</span>
            {trashCount > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  currentTab === 'trash'
                    ? 'bg-white/20 text-white'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {trashCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Trash Actions Banner (when in trash mode) */}
      {currentTab === 'trash' && (
        <div className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4'>
          <div className='flex items-center gap-2.5 text-xs text-rose-300'>
            <AlertTriangle className='size-4 shrink-0 text-rose-400' />
            <span>
              <strong>Lưu ý:</strong> Tài khoản trong thùng rác không thể đăng
              nhập hoặc xem video bài giảng. Bạn có thể khôi phục hoặc xóa hẳn.
            </span>
          </div>

          <div className='flex items-center gap-2'>
            {trashCount > 0 && (
              <>
                <button
                  type='button'
                  disabled={actionLoading !== null}
                  onClick={handleRestoreAll}
                  className='flex cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-400 transition-colors hover:bg-emerald-500/25'
                >
                  {actionLoading === 'restore-all' ? (
                    <Loader2 className='size-3.5 animate-spin' />
                  ) : (
                    <ArchiveRestore className='size-3.5' />
                  )}
                  <span>Khôi phục tất cả</span>
                </button>

                <button
                  type='button'
                  disabled={actionLoading !== null}
                  onClick={() => setShowEmptyTrashModal(true)}
                  className='flex cursor-pointer items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition-colors hover:bg-rose-500'
                >
                  <Trash2 className='size-3.5' />
                  <span>Dọn sạch thùng rác</span>
                </button>
              </>
            )}

            <button
              type='button'
              onClick={() => setCurrentTab('active')}
              className='flex cursor-pointer items-center gap-1 rounded-xl border border-[#2b2b35] bg-[#16161a] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white'
            >
              <ArrowLeft className='size-3.5' />
              <span>Quay lại</span>
            </button>
          </div>
        </div>
      )}

      {/* Search Bar & Filter Controls */}
      <div className='flex flex-col gap-3 rounded-2xl border border-[#1e1e24] bg-[#0c0c0e] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between'>
        {/* Search input */}
        <div className='relative flex-1 sm:max-w-md'>
          <Search className='absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400' />
          <input
            type='text'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder='Tìm kiếm theo email, tên hoặc SBD...'
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

        {/* Filters (only for active users) */}
        {currentTab === 'active' && (
          <div className='flex flex-wrap items-center gap-2'>
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={e =>
                setStatusFilter(
                  e.target.value as
                    | 'all'
                    | 'approved'
                    | 'pending'
                    | 'can_watch'
                    | 'admin',
                )
              }
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
        )}
      </div>

      {/* Match info */}
      {hasActiveFilters && (
        <div className='flex items-center justify-between px-1 text-xs text-slate-400'>
          <span>
            Tìm thấy <b className='text-purple-400'>{filteredUsers.length}</b>{' '}
            kết quả phù hợp
          </span>
        </div>
      )}

      {/* Main Table */}
      <div className='rounded-2xl border border-[#1e1e24] bg-[#0c0c0e] p-5 shadow-sm'>
        {loading ? (
          <div className='flex justify-center py-20'>
            <Loader2 className='size-8 animate-spin text-purple-500' />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-slate-500'>
            <Users className='mb-2 size-10 text-slate-700' />
            <p className='text-xs font-medium'>
              {currentTab === 'trash'
                ? 'Thùng rác hiện đang trống.'
                : hasActiveFilters
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
                  <th className='px-5 py-3'>SBD</th>
                  <th className='px-5 py-3'>Email</th>
                  <th className='px-5 py-3'>Tên Hiển Thị</th>
                  {currentTab === 'active' ? (
                    <>
                      <th className='px-5 py-3'>Trạng Thái</th>
                      <th className='px-5 py-3'>Xem Video</th>
                      <th className='px-5 py-3'>Cấp Độ JLPT</th>
                      <th className='px-5 py-3'>Vai Trò</th>
                      <th className='px-5 py-3'>Ngày Tạo</th>
                    </>
                  ) : (
                    <>
                      <th className='px-5 py-3'>Cấp Độ</th>
                      <th className='px-5 py-3'>Thời Gian Xóa</th>
                    </>
                  )}
                  <th className='px-5 py-3 text-right'>Thao Tác</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-[#1e1e24]'>
                {filteredUsers.map(user => (
                  <tr
                    key={user.id}
                    className='text-slate-300 transition-colors hover:bg-[#16161a]'
                  >
                    <td className='px-5 py-3.5'>
                      {currentTab === 'active' ? (
                        <div className='flex items-center gap-1.5'>
                          <input
                            type='text'
                            value={sbdInputs[user.id] ?? user.sbd ?? ''}
                            onChange={e => {
                              const val = e.target.value;
                              setSbdInputs(prev => ({
                                ...prev,
                                [user.id]: val,
                              }));
                            }}
                            onBlur={() => handleSaveSbd(user)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.currentTarget.blur();
                              }
                            }}
                            placeholder='Nhập SBD...'
                            title='Nhập số báo danh và bấm Enter hoặc click ra ngoài để lưu'
                            className='w-28 rounded-lg border border-[#2d2d38] bg-[#16161c] px-2.5 py-1 font-mono text-xs font-semibold text-purple-300 transition-colors placeholder:text-slate-600 hover:border-purple-500/40 focus:border-purple-500 focus:bg-[#1c1c24] focus:outline-none'
                          />
                          {savingSbdId === user.id ? (
                            <Loader2 className='size-3.5 shrink-0 animate-spin text-purple-400' />
                          ) : savedSbdId === user.id ? (
                            <Check className='size-3.5 shrink-0 text-emerald-400' />
                          ) : null}
                        </div>
                      ) : (
                        <span className='font-mono text-xs text-slate-400'>
                          {user.sbd || '-'}
                        </span>
                      )}
                    </td>
                    <td className='px-5 py-3.5 font-medium text-white'>
                      {user.email}
                    </td>
                    <td className='px-5 py-3.5 text-xs'>
                      {user.display_name ? (
                        <span className='font-medium text-slate-200'>
                          {user.display_name}
                        </span>
                      ) : (
                        <span className='text-slate-500 italic'>Chưa đặt</span>
                      )}
                    </td>

                    {/* Active columns */}
                    {currentTab === 'active' ? (
                      <>
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
                            onChange={e =>
                              handleChangeLevel(user, e.target.value)
                            }
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
                            <span className='text-xs text-slate-500'>
                              Học viên
                            </span>
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
                            onClick={() => setSoftDeleteTarget(user)}
                            className='flex size-7 cursor-pointer items-center justify-center rounded-lg text-rose-400 transition-colors hover:bg-rose-950/30 hover:text-rose-300'
                            title='Chuyển vào thùng rác'
                          >
                            <Trash2 className='size-3.5' />
                          </button>
                        </td>
                      </>
                    ) : (
                      /* Trash row columns */
                      <>
                        <td className='px-5 py-3.5'>
                          <span className='rounded border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-xs font-bold text-purple-400 uppercase'>
                            {user.level || 'N5'}
                          </span>
                        </td>
                        <td className='px-5 py-3.5 text-xs text-rose-400'>
                          <div className='flex items-center gap-1'>
                            <Calendar className='size-3.5' />
                            <span>
                              {user.deleted_at
                                ? new Date(user.deleted_at).toLocaleString(
                                    'vi-VN',
                                  )
                                : 'Vừa xong'}
                            </span>
                          </div>
                        </td>
                        <td className='flex items-center justify-end gap-2 px-5 py-3.5 text-right'>
                          {/* Restore button */}
                          <button
                            disabled={actionLoading !== null}
                            onClick={() => handleRestoreUser(user.id)}
                            className='flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-400 transition-colors hover:bg-emerald-500/30'
                            title='Khôi phục người dùng này'
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className='size-3.5 animate-spin' />
                            ) : (
                              <ArchiveRestore className='size-3.5' />
                            )}
                            <span>Khôi phục</span>
                          </button>

                          {/* Permanent delete button */}
                          <button
                            disabled={actionLoading !== null}
                            onClick={() => setPermanentDeleteTarget(user)}
                            className='flex cursor-pointer items-center gap-1.5 rounded-lg bg-rose-600/20 px-3 py-1.5 text-xs font-bold text-rose-400 transition-colors hover:bg-rose-600 hover:text-white'
                            title='Xóa vĩnh viễn khỏi database'
                          >
                            <Trash2 className='size-3.5' />
                            <span>Xóa vĩnh viễn</span>
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Soft Delete Confirmation (Move to Trash) */}
      {softDeleteTarget && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs'>
          <div className='max-w-md rounded-3xl border border-[#2d2d38] bg-[#121215] p-6 text-slate-100 shadow-2xl'>
            <div className='flex items-center gap-3 text-amber-400'>
              <div className='flex size-10 items-center justify-center rounded-2xl bg-amber-500/15'>
                <Trash2 className='size-5' />
              </div>
              <h3 className='text-lg font-bold text-white'>
                Chuyển vào Thùng rác?
              </h3>
            </div>

            <p className='mt-3 text-xs leading-relaxed text-slate-300'>
              Tài khoản{' '}
              <strong className='text-white'>{softDeleteTarget.email}</strong>{' '}
              sẽ được chuyển vào mục <strong>Thùng rác</strong> và tạm thời bị
              khóa quyền đăng nhập.
            </p>

            <div className='mt-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-300'>
              💡 <strong>An toàn:</strong> Bạn có thể khôi phục lại tài khoản
              này bất cứ lúc nào trong tab <strong>Thùng rác</strong> mà không
              sợ bị mất dữ liệu.
            </div>

            <div className='mt-5 flex items-center justify-end gap-2'>
              <button
                type='button'
                disabled={actionLoading !== null}
                onClick={() => setSoftDeleteTarget(null)}
                className='cursor-pointer rounded-xl border border-[#2b2b35] bg-[#18181d] px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white'
              >
                Hủy
              </button>
              <button
                type='button'
                disabled={actionLoading !== null}
                onClick={handleConfirmSoftDelete}
                className='flex cursor-pointer items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-600/20 hover:bg-amber-500'
              >
                {actionLoading === 'soft-delete' && (
                  <Loader2 className='size-3.5 animate-spin' />
                )}
                Chuyển vào thùng rác
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Permanent Delete Confirmation (Hard Delete) */}
      {permanentDeleteTarget && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs'>
          <div className='max-w-md rounded-3xl border border-rose-500/30 bg-[#140d10] p-6 text-slate-100 shadow-2xl'>
            <div className='flex items-center gap-3 text-rose-500'>
              <div className='flex size-10 items-center justify-center rounded-2xl bg-rose-500/20'>
                <AlertTriangle className='size-5 text-rose-400' />
              </div>
              <h3 className='text-lg font-black text-rose-400'>
                Xác thực Xóa Vĩnh Viễn
              </h3>
            </div>

            <p className='mt-3 text-xs leading-relaxed text-slate-300'>
              Bạn đang chuẩn bị xóa vĩnh viễn tài khoản{' '}
              <strong className='text-rose-300'>
                {permanentDeleteTarget.email}
              </strong>{' '}
              khỏi cơ sở dữ liệu.
            </p>

            <div className='mt-3 rounded-2xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs leading-relaxed text-rose-300'>
              ⚠️ <strong>Cảnh báo nguy hiểm:</strong> Toàn bộ dữ liệu tài khoản,
              tiến trình bài giảng và bình luận sẽ bị xóa hoàn toàn. Hành động
              này <strong>KHÔNG THỂ KHÔI PHỤC</strong>!
            </div>

            <div className='mt-5 flex items-center justify-end gap-2'>
              <button
                type='button'
                disabled={actionLoading !== null}
                onClick={() => setPermanentDeleteTarget(null)}
                className='cursor-pointer rounded-xl border border-[#2b2b35] bg-[#18181d] px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white'
              >
                Hủy
              </button>
              <button
                type='button'
                disabled={actionLoading !== null}
                onClick={handleConfirmPermanentDelete}
                className='flex cursor-pointer items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500'
              >
                {actionLoading === 'permanent-delete' && (
                  <Loader2 className='size-3.5 animate-spin' />
                )}
                Xác nhận Xóa Vĩnh Viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Empty Trash Confirmation */}
      {showEmptyTrashModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs'>
          <div className='max-w-md rounded-3xl border border-rose-500/30 bg-[#140d10] p-6 text-slate-100 shadow-2xl'>
            <div className='flex items-center gap-3 text-rose-500'>
              <div className='flex size-10 items-center justify-center rounded-2xl bg-rose-500/20'>
                <Trash2 className='size-5 text-rose-400' />
              </div>
              <h3 className='text-lg font-black text-rose-400'>
                Dọn Sạch Thùng Rác?
              </h3>
            </div>

            <p className='mt-3 text-xs leading-relaxed text-slate-300'>
              Tất cả <strong>{trashCount} tài khoản</strong> trong thùng rác sẽ
              bị xóa vĩnh viễn khỏi cơ sở dữ liệu.
            </p>

            <div className='mt-3 rounded-2xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs leading-relaxed text-rose-300'>
              ⚠️ <strong>Cảnh báo:</strong> Mọi tài khoản trong thùng rác sẽ
              biến mất hoàn toàn và không thể khôi phục lại!
            </div>

            <div className='mt-5 flex items-center justify-end gap-2'>
              <button
                type='button'
                disabled={actionLoading !== null}
                onClick={() => setShowEmptyTrashModal(false)}
                className='cursor-pointer rounded-xl border border-[#2b2b35] bg-[#18181d] px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white'
              >
                Hủy
              </button>
              <button
                type='button'
                disabled={actionLoading !== null}
                onClick={handleConfirmEmptyTrash}
                className='flex cursor-pointer items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500'
              >
                {actionLoading === 'empty-trash' && (
                  <Loader2 className='size-3.5 animate-spin' />
                )}
                Dọn sạch tất cả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
