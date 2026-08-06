/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import {
  Loader2,
  Search,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  UserCheck,
  AlertCircle,
  Plus,
  Edit,
} from 'lucide-react';
import { Button } from '@/shared/ui/components/button';
import { Input } from '@/shared/ui/components/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/components/dialog';

interface UserRecord {
  id: number;
  email: string;
  is_approved: number;
  is_admin: number;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState('');

  // Dialog and form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formApproved, setFormApproved] = useState(true);
  const [formAdmin, setFormAdmin] = useState(false);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const openAddDialog = () => {
    setDialogMode('add');
    setCurrentId(null);
    setFormEmail('');
    setFormPassword('');
    setFormApproved(true);
    setFormAdmin(false);
    setFormError('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: UserRecord) => {
    setDialogMode('edit');
    setCurrentId(user.id);
    setFormEmail(user.email);
    setFormPassword('');
    setFormApproved(user.is_approved === 1);
    setFormAdmin(user.is_admin === 1);
    setFormError('');
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail) {
      setFormError('Email không được để trống');
      return;
    }
    if (dialogMode === 'add' && !formPassword) {
      setFormError('Mật khẩu không được để trống');
      return;
    }

    try {
      setFormLoading(true);
      const url = '/api/admin/users';
      const body =
        dialogMode === 'add'
          ? {
              email: formEmail,
              password: formPassword,
              isApproved: formApproved,
              isAdmin: formAdmin,
            }
          : {
              userId: currentId,
              email: formEmail,
              password: formPassword || undefined,
              isApproved: formApproved,
              isAdmin: formAdmin,
            };

      const method = dialogMode === 'add' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Thao tác thất bại');
      }

      setIsDialogOpen(false);
      await fetchUsers();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Không thể tải danh sách thành viên');
      const data = await res.json();
      setUsers(data);
      setError('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: UserRecord) => {
    try {
      setActionLoading(user.id);
      const nextApproved = user.is_approved === 1 ? 0 : 1;
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          isApproved: nextApproved,
          isAdmin: user.is_admin,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Cập nhật trạng thái thất bại');
      }

      await fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleRole = async (user: UserRecord) => {
    try {
      setActionLoading(user.id);
      const nextAdmin = user.is_admin === 1 ? 0 : 1;
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          isApproved: user.is_approved,
          isAdmin: nextAdmin,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Cập nhật quyền hạn thất bại');
      }

      await fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: number) => {
    if (
      !confirm(
        'Bạn có chắc chắn muốn xóa vĩnh viễn thành viên này khỏi hệ thống?',
      )
    )
      return;

    try {
      setActionLoading(userId);
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Xóa thành viên thất bại');
      }

      await fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter users by email on frontend
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-3xl font-extrabold tracking-tight text-white'>
            Quản lý Thành viên
          </h2>
          <p className='mt-1 text-sm text-slate-400'>
            Danh sách người dùng đăng ký hệ thống, quản lý phê duyệt và vai trò.
          </p>
        </div>
        <Button
          onClick={openAddDialog}
          className='flex h-10 cursor-pointer items-center gap-1.5 self-start rounded-xl bg-amber-500 px-4 font-semibold text-black hover:bg-amber-400 sm:self-center'
        >
          <Plus className='size-4' /> Thêm thành viên
        </Button>
      </div>

      {error && (
        <div className='flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-950/10 p-4 text-sm text-red-400'>
          <AlertCircle className='size-5 shrink-0' />
          <span>{error}</span>
        </div>
      )}

      {/* Control bar */}
      <div className='flex items-center gap-4 rounded-xl border border-[#1a1a1f] bg-[#09090b] p-4'>
        <div className='relative max-w-md flex-1'>
          <Search className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500' />
          <Input
            placeholder='Tìm thành viên theo email...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='border-[#1a1a1f] bg-[#121215] pl-9 text-slate-100 placeholder-slate-500 focus-visible:ring-amber-500'
          />
        </div>
        <div className='font-mono text-xs font-medium text-slate-500 select-none'>
          Hiển thị {filteredUsers.length} / {users.length} người dùng
        </div>
      </div>

      {/* Table */}
      <div className='rounded-2xl border border-[#1a1a1f] bg-[#09090b] p-6'>
        {loading && users.length === 0 ? (
          <div className='flex justify-center py-20'>
            <Loader2 className='size-8 animate-spin text-amber-500' />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-sm text-slate-500'>
            <UserCheck className='mb-3 size-12 text-slate-700' />
            <p>Không tìm thấy thành viên phù hợp.</p>
          </div>
        ) : (
          <div className='overflow-hidden rounded-xl border border-[#1a1a1f]'>
            <table className='w-full border-collapse text-left'>
              <thead>
                <tr className='border-b border-[#1a1a1f] bg-[#121215] text-xs font-semibold text-slate-400'>
                  <th className='px-6 py-3.5'>ID</th>
                  <th className='px-6 py-3.5'>Email</th>
                  <th className='px-6 py-3.5'>Trạng thái duyệt</th>
                  <th className='px-6 py-3.5'>Quyền hạn</th>
                  <th className='px-6 py-3.5'>Ngày đăng ký</th>
                  <th className='px-6 py-3.5 text-right'>Thao tác</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-[#1a1a1f] bg-[#09090b]/50'>
                {filteredUsers.map(user => (
                  <tr
                    key={user.id}
                    className='text-sm text-slate-300 transition-colors hover:bg-[#121215]/50'
                  >
                    <td className='px-6 py-4 font-mono text-xs text-slate-500'>
                      #{user.id}
                    </td>
                    <td className='px-6 py-4 font-medium text-white'>
                      {user.email}
                    </td>
                    <td className='px-6 py-4'>
                      <button
                        disabled={actionLoading !== null}
                        onClick={() => handleToggleStatus(user)}
                        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all select-none hover:scale-102 active:scale-98 ${
                          user.is_approved === 1
                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                            : 'border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                        }`}
                      >
                        {user.is_approved === 1 ? (
                          <>
                            <CheckCircle2 className='size-3' /> Đã phê duyệt
                          </>
                        ) : (
                          <>
                            <XCircle className='size-3' /> Chờ phê duyệt
                          </>
                        )}
                      </button>
                    </td>
                    <td className='px-6 py-4'>
                      <button
                        disabled={actionLoading !== null}
                        onClick={() => handleToggleRole(user)}
                        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all select-none hover:scale-102 active:scale-98 ${
                          user.is_admin === 1
                            ? 'border-purple-500/20 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
                            : 'border-slate-500/20 bg-slate-500/10 text-slate-400 hover:bg-slate-500/20'
                        }`}
                      >
                        {user.is_admin === 1 ? (
                          <>
                            <ShieldCheck className='size-3' /> Quản trị viên
                          </>
                        ) : (
                          <>
                            <ShieldAlert className='size-3' /> Thành viên
                          </>
                        )}
                      </button>
                    </td>
                    <td className='px-6 py-4 font-mono text-xs text-slate-500'>
                      {new Date(user.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className='flex items-center justify-end gap-1 px-6 py-4 text-right'>
                      <Button
                        size='icon'
                        variant='ghost'
                        disabled={actionLoading !== null}
                        onClick={() => openEditDialog(user)}
                        className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-[#16161a] hover:text-white'
                        aria-label='Sửa thành viên'
                      >
                        <Edit className='size-4' />
                      </Button>
                      <Button
                        size='icon'
                        variant='ghost'
                        disabled={actionLoading !== null}
                        onClick={() => handleDelete(user.id)}
                        className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-red-400 hover:bg-red-950/20 hover:text-red-300'
                        aria-label='Xóa thành viên'
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className='size-4 animate-spin text-slate-500' />
                        ) : (
                          <Trash2 className='size-4' />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-w-md rounded-2xl border border-[#1a1a1f] bg-[#09090b] text-slate-100'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold text-white'>
              {dialogMode === 'add'
                ? 'Thêm thành viên mới'
                : 'Chỉnh sửa thành viên'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className='space-y-4 py-4'>
            {formError && (
              <div className='flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-950/10 p-3 text-xs text-red-400'>
                <AlertCircle className='size-4 shrink-0' />
                <span>{formError}</span>
              </div>
            )}

            <div className='space-y-1.5'>
              <label className='text-xs font-semibold tracking-wider text-slate-400 uppercase'>
                Email *
              </label>
              <Input
                type='email'
                placeholder='Ví dụ: user@example.com'
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
                className='border-[#1a1a1f] bg-[#121215] text-slate-100 placeholder-slate-600 focus-visible:ring-amber-500'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-semibold tracking-wider text-slate-400 uppercase'>
                {dialogMode === 'add' ? 'Mật khẩu *' : 'Mật khẩu mới'}
              </label>
              <Input
                type='password'
                placeholder={
                  dialogMode === 'add'
                    ? 'Nhập mật khẩu...'
                    : 'Để trống nếu giữ nguyên mật khẩu'
                }
                value={formPassword}
                onChange={e => setFormPassword(e.target.value)}
                className='border-[#1a1a1f] bg-[#121215] text-slate-100 placeholder-slate-600 focus-visible:ring-amber-500'
              />
            </div>

            <div className='flex gap-6 py-2'>
              <label className='flex cursor-pointer items-center gap-2 select-none'>
                <input
                  type='checkbox'
                  checked={formApproved}
                  onChange={e => setFormApproved(e.target.checked)}
                  className='h-4 w-4 rounded border-[#1a1a1f] bg-[#121215] text-amber-500 focus:ring-amber-500/20'
                />
                <span className='text-sm text-slate-300'>Phê duyệt ngay</span>
              </label>

              <label className='flex cursor-pointer items-center gap-2 select-none'>
                <input
                  type='checkbox'
                  checked={formAdmin}
                  onChange={e => setFormAdmin(e.target.checked)}
                  className='h-4 w-4 rounded border-[#1a1a1f] bg-[#121215] text-amber-500 focus:ring-amber-500/20'
                />
                <span className='text-sm text-slate-300'>Quyền Admin</span>
              </label>
            </div>

            <DialogFooter className='flex gap-2 border-t border-[#1a1a1f] pt-4'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => setIsDialogOpen(false)}
                className='h-9 cursor-pointer bg-transparent text-xs text-slate-400 hover:bg-[#16161a] hover:text-white'
              >
                Hủy bỏ
              </Button>
              <Button
                type='submit'
                disabled={formLoading}
                className='flex h-9 cursor-pointer items-center gap-1.5 bg-amber-500 px-4 text-xs font-semibold text-black hover:bg-amber-400'
              >
                {formLoading && <Loader2 className='size-3 animate-spin' />}
                {dialogMode === 'add' ? 'Tạo tài khoản' : 'Lưu thay đổi'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
