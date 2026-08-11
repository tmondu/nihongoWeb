/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Mail,
  Lock,
  Calendar,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/shared/ui/components/button';
import { Input } from '@/shared/ui/components/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/components/alert-dialog';

interface UserProfile {
  id: number;
  email: string;
  is_approved: number;
  is_admin: number;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Email form
  const [email, setEmail] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [formLoading, setFormLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        if (res.status === 401) {
          sessionStorage.clear();
          router.push('/login');
          return;
        }
        throw new Error('Không thể tải thông tin tài khoản');
      }
      const data = await res.json();
      setUser(data);
      setEmail(data.email);
      setError('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi kết nối server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email) {
      setError('Email không được để trống');
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        setError('Vui lòng nhập mật khẩu hiện tại để thay đổi mật khẩu.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Mật khẩu xác nhận không trùng khớp.');
        return;
      }
      if (newPassword.length < 6) {
        setError('Mật khẩu mới phải từ 6 ký tự trở lên.');
        return;
      }
    }

    try {
      setFormLoading(true);
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Cập nhật thông tin thất bại');
      }

      setSuccessMsg('Cập nhật tài khoản thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await fetchProfile();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      setLoading(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      sessionStorage.clear();
      window.location.href = '/login';
    } catch (err) {
      console.error('Đăng xuất thất bại:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className='flex min-h-[70vh] items-center justify-center'>
        <Loader2 className='size-8 animate-spin text-amber-500' />
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-4xl space-y-8 px-4 py-8 text-slate-100'>
      {/* Title */}
      <div>
        <h2 className='flex items-center gap-2 text-3xl font-extrabold tracking-tight text-white'>
          Hồ sơ Cá nhân
        </h2>
        <p className='mt-1 text-sm text-slate-400'>
          Quản lý thông tin tài khoản và bảo mật mật khẩu của bạn.
        </p>
      </div>

      {successMsg && (
        <div className='flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4 text-sm text-emerald-400'>
          <CheckCircle2 className='size-5 shrink-0' />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className='flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-950/10 p-4 text-sm text-red-400'>
          <AlertCircle className='size-5 shrink-0' />
          <span>{error}</span>
        </div>
      )}

      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        {/* Info Sidebar card */}
        <div className='flex flex-col justify-between space-y-6 rounded-2xl border border-[#1a1a1f] bg-[#09090b] p-6 md:col-span-1'>
          <div className='space-y-6'>
            <div className='flex items-center gap-3.5'>
              <div className='flex size-12 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400'>
                <KeyRound className='size-6' />
              </div>
              <div>
                <div
                  className='max-w-[150px] truncate font-bold text-white'
                  title={user?.email}
                >
                  {user?.email.split('@')[0]}
                </div>
                <div className='font-mono text-xs text-slate-500'>
                  ID: #{user?.id}
                </div>
              </div>
            </div>

            <div className='space-y-3.5 border-t border-[#1a1a1f] pt-4 text-xs text-slate-400'>
              <div className='flex items-center gap-2'>
                <Mail className='size-4 text-slate-500' />
                <span className='truncate' title={user?.email}>
                  {user?.email}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Calendar className='size-4 text-slate-500' />
                <span>
                  Tham gia:{' '}
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('vi-VN')
                    : ''}
                </span>
              </div>
              {user?.is_admin === 1 && (
                <div className='flex w-fit items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 font-medium text-purple-400'>
                  <ShieldCheck className='size-3.5' />
                  <span>Quản trị viên</span>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleLogout}
            className='flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-950/20 font-semibold text-red-400 transition-colors hover:bg-red-900/20'
          >
            <LogOut className='size-4' /> Đăng xuất tài khoản
          </Button>
        </div>

        {/* Update Form card */}
        <div className='rounded-2xl border border-[#1a1a1f] bg-[#09090b] p-6 md:col-span-2'>
          <h3 className='mb-6 border-b border-[#1a1a1f] pb-3.5 text-lg font-bold text-white'>
            Cập nhật tài khoản
          </h3>

          <form onSubmit={handleUpdateProfile} className='space-y-6'>
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold tracking-wider text-slate-400 uppercase'>
                Email đăng nhập
              </label>
              <div className='relative'>
                <Mail className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500' />
                <Input
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className='border-[#1a1a1f] bg-[#121215] pl-9 text-slate-100 placeholder-slate-600 focus-visible:ring-amber-500'
                />
              </div>
            </div>

            <div className='my-6 border-t border-[#1a1a1f]'></div>

            <h4 className='flex items-center gap-2 text-sm font-semibold tracking-wider text-white uppercase'>
              <Lock className='size-4 text-slate-500' /> Thay đổi mật khẩu
            </h4>

            <div className='space-y-4'>
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold tracking-wider text-slate-400 uppercase'>
                  Mật khẩu hiện tại
                </label>
                <Input
                  type='password'
                  placeholder='Nhập mật khẩu đang dùng...'
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className='border-[#1a1a1f] bg-[#121215] text-slate-100 placeholder-slate-600 focus-visible:ring-amber-500'
                />
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold tracking-wider text-slate-400 uppercase'>
                    Mật khẩu mới
                  </label>
                  <Input
                    type='password'
                    placeholder='Mật khẩu mới...'
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className='border-[#1a1a1f] bg-[#121215] text-slate-100 placeholder-slate-600 focus-visible:ring-amber-500'
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold tracking-wider text-slate-400 uppercase'>
                    Xác nhận mật khẩu
                  </label>
                  <Input
                    type='password'
                    placeholder='Nhập lại mật khẩu mới...'
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className='border-[#1a1a1f] bg-[#121215] text-slate-100 placeholder-slate-600 focus-visible:ring-amber-500'
                  />
                </div>
              </div>
            </div>

            <Button
              type='submit'
              disabled={formLoading}
              className='flex h-10 w-fit cursor-pointer items-center justify-center gap-1.5 self-end rounded-xl bg-amber-500 px-6 font-semibold text-black transition-all hover:bg-amber-400'
            >
              {formLoading && <Loader2 className='size-4 animate-spin' />}
              Lưu thay đổi
            </Button>
          </form>
        </div>
      </div>

      <AlertDialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <AlertDialogContent className='rounded-3xl border-[#1a1a1f] bg-[#09090b] text-slate-100'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-2xl font-bold text-white'>
              Đăng xuất khỏi tài khoản
            </AlertDialogTitle>
            <AlertDialogDescription className='text-base leading-relaxed text-slate-400'>
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không? Mọi tiến
              trình luyện tập chưa lưu sẽ bị hủy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='gap-3'>
            <AlertDialogCancel className='cursor-pointer rounded-xl border-[#1a1a1f] bg-transparent px-6 text-slate-300 transition-colors duration-200 hover:bg-[#121215] hover:text-white'>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              className='cursor-pointer rounded-xl bg-red-600 px-6 font-semibold text-white transition-colors duration-200 hover:bg-red-500'
            >
              Đăng xuất
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
