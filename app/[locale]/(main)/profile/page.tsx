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
  User,
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
  display_name?: string | null;
  name_updated_at?: string | null;
  is_approved: number;
  can_watch_video?: number;
  level?: string;
  is_admin: number;
  is_verified?: number;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Profile forms
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [formLoading, setFormLoading] = useState(false);

  // 7-day cooldown helper for changing display name
  const getDisplayNameCooldown = () => {
    if (!user?.name_updated_at || !user?.display_name) {
      return { canEdit: true, daysLeft: 0, nextAllowedDate: null };
    }
    const lastUpdatedTime = new Date(user.name_updated_at).getTime();
    const diffMs = Date.now() - lastUpdatedTime;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays >= 7) {
      return { canEdit: true, daysLeft: 0, nextAllowedDate: null };
    }
    const daysLeft = Math.ceil(7 - diffDays);
    const nextAllowedDate = new Date(lastUpdatedTime + 7 * 24 * 60 * 60 * 1000);
    return { canEdit: false, daysLeft, nextAllowedDate };
  };

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
      setDisplayName(data.display_name || '');
      setError('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi kết nối server.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartVerification = async () => {
    setShowVerifyModal(true);
    setOtpError('');
    setOtpSuccess('');
    setOtp('');
    setSendingOtp(true);
    try {
      const res = await fetch('/api/auth/verify-email/send', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gửi OTP thất bại');
      }
      setOtpSuccess('Mã xác thực OTP đã được gửi đến email của bạn.');
    } catch (err: any) {
      setOtpError(err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const sendOtp = async () => {
    setSendingOtp(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      const res = await fetch('/api/auth/verify-email/send', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gửi OTP thất bại');
      }
      setOtpSuccess('Mã xác thực OTP mới đã được gửi thành công.');
    } catch (err: any) {
      setOtpError(err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const confirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setOtpError('Mã xác thực phải gồm 6 chữ số.');
      return;
    }

    setVerifyingOtp(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      const res = await fetch('/api/auth/verify-email/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Xác thực OTP thất bại');
      }
      setOtpSuccess('Xác thực email thành công!');
      await fetchProfile();
      setTimeout(() => {
        setShowVerifyModal(false);
      }, 1500);
    } catch (err: any) {
      setOtpError(err.message);
    } finally {
      setVerifyingOtp(false);
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

    // Validate Display Name if changing
    const trimmedDisplayName = displayName.trim();
    if (trimmedDisplayName && trimmedDisplayName !== user?.display_name) {
      if (trimmedDisplayName.length < 2 || trimmedDisplayName.length > 30) {
        setError('Tên hiển thị phải có độ dài từ 2 đến 30 ký tự.');
        return;
      }
      const cooldown = getDisplayNameCooldown();
      if (!cooldown.canEdit) {
        setError(
          `Bạn chỉ có thể đổi tên hiển thị 7 ngày một lần. Vui lòng quay lại sau ${cooldown.daysLeft} ngày.`,
        );
        return;
      }
    }

    try {
      setFormLoading(true);
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: trimmedDisplayName || undefined,
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
                  className='max-w-[180px] truncate text-base font-bold text-white'
                  title={user?.display_name || user?.email}
                >
                  {user?.display_name || user?.email.split('@')[0]}
                </div>
                {user?.display_name && (
                  <div className='text-xs font-semibold text-amber-400/90'>
                    @{user.display_name}
                  </div>
                )}
                <div className='font-mono text-xs text-slate-500'>
                  ID: #{user?.id}
                </div>
              </div>
            </div>

            <div className='space-y-3.5 border-t border-[#1a1a1f] pt-4 text-xs text-slate-400'>
              <div className='flex flex-wrap items-center gap-2'>
                <Mail className='size-4 text-slate-500' />
                <span className='mr-1 truncate' title={user?.email}>
                  {user?.email}
                </span>
                {user?.is_verified === 1 ? (
                  <span className='inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400'>
                    <CheckCircle2 className='size-3' /> Đã xác thực
                  </span>
                ) : (
                  <span className='inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400'>
                    Chưa xác thực
                  </span>
                )}
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
              <div className='flex flex-wrap items-center gap-2 pt-1'>
                <span className='inline-flex items-center gap-1 rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400 uppercase'>
                  Khóa học: {user?.level || 'N5'}
                </span>
                {user?.can_watch_video === 1 ? (
                  <span className='inline-flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400'>
                    Đã mở quyền video
                  </span>
                ) : (
                  <span className='inline-flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400'>
                    Chưa kích hoạt video
                  </span>
                )}
              </div>
              {user?.is_admin === 1 && (
                <div className='flex w-fit items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 font-medium text-purple-400'>
                  <ShieldCheck className='size-3.5' />
                  <span>Quản trị viên</span>
                </div>
              )}
            </div>
          </div>

          <div className='mt-6 space-y-3'>
            {user && !user.is_verified && (
              <Button
                onClick={handleStartVerification}
                className='flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-950/20 font-semibold text-blue-400 transition-colors hover:bg-blue-900/20'
              >
                Xác thực tài khoản
              </Button>
            )}

            <Button
              onClick={handleLogout}
              className='flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-950/20 font-semibold text-red-400 transition-colors hover:bg-red-900/20'
            >
              <LogOut className='size-4' /> Đăng xuất tài khoản
            </Button>
          </div>
        </div>

        {/* Update Form card */}
        <div className='rounded-2xl border border-[#1a1a1f] bg-[#09090b] p-6 md:col-span-2'>
          <h3 className='mb-6 border-b border-[#1a1a1f] pb-3.5 text-lg font-bold text-white'>
            Cập nhật tài khoản
          </h3>

          {(() => {
            const cooldown = getDisplayNameCooldown();
            return (
              <form onSubmit={handleUpdateProfile} className='space-y-6'>
                {/* Tên hiển thị (Nickname) */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <label className='text-xs font-semibold tracking-wider text-slate-400 uppercase'>
                      Tên hiển thị (Nickname)
                    </label>
                    <span className='text-xs text-slate-500'>
                      {displayName.trim().length}/30
                    </span>
                  </div>
                  <div className='relative'>
                    <User className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500' />
                    <Input
                      type='text'
                      value={displayName}
                      maxLength={30}
                      disabled={!cooldown.canEdit}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder='Nhập tên hiển thị dùng để bình luận...'
                      className='border-[#1a1a1f] bg-[#121215] pl-9 text-slate-100 placeholder-slate-600 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-60'
                    />
                  </div>

                  {!cooldown.canEdit ? (
                    <div className='flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-300'>
                      <Lock className='mt-0.5 size-3.5 shrink-0 text-amber-400' />
                      <div>
                        <span>
                          Bạn chỉ có thể đổi tên hiển thị{' '}
                          <strong>7 ngày 1 lần</strong>. Lần đổi tiếp theo sau{' '}
                          <strong>{cooldown.daysLeft} ngày nữa</strong>
                          {cooldown.nextAllowedDate && (
                            <>
                              {' '}
                              (ngày{' '}
                              {cooldown.nextAllowedDate.toLocaleDateString(
                                'vi-VN',
                              )}
                              )
                            </>
                          )}
                          .
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className='text-[11px] text-slate-400'>
                      Tên hiển thị dùng khi bạn bình luận bài giảng và trao đổi
                      học tập (cho phép đổi 1 lần mỗi 7 ngày).
                    </p>
                  )}
                </div>

                <div className='my-6 border-t border-[#1a1a1f]'></div>

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
            );
          })()}
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

      <AlertDialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
        <AlertDialogContent className='max-w-md rounded-3xl border-[#1a1a1f] bg-[#09090b] text-slate-100'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-center text-2xl font-bold text-white'>
              Xác thực Email
            </AlertDialogTitle>
            <AlertDialogDescription className='mt-1 text-center text-sm leading-relaxed text-slate-400'>
              Mã xác thực OTP gồm 6 chữ số đã được gửi đến email{' '}
              <span className='font-semibold text-blue-400'>{user?.email}</span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>

          {otpError && (
            <div className='rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-center text-xs text-red-400'>
              {otpError}
            </div>
          )}

          {otpSuccess && (
            <div className='rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-center text-xs text-emerald-400'>
              {otpSuccess}
            </div>
          )}

          <form onSubmit={confirmOtp} className='mt-2 space-y-6'>
            <div className='space-y-2'>
              <input
                type='text'
                maxLength={6}
                required
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder='Mã OTP...'
                className='placeholder-zinc-650 block w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center font-mono text-2xl font-bold tracking-[0.5em] text-zinc-100 shadow-sm transition-all duration-300 focus:border-blue-500 focus:bg-white/[0.07] focus:ring-1 focus:ring-blue-500 focus:outline-none'
              />
            </div>

            <div className='flex items-center justify-between text-xs text-slate-400'>
              <span>Không nhận được mã?</span>
              <button
                type='button'
                onClick={sendOtp}
                disabled={sendingOtp}
                className='font-semibold text-blue-400 transition-colors hover:text-blue-300 disabled:opacity-50'
              >
                {sendingOtp ? 'Đang gửi...' : 'Gửi lại mã'}
              </button>
            </div>

            <AlertDialogFooter className='flex gap-3 pt-2 sm:flex-row'>
              <AlertDialogCancel
                type='button'
                onClick={() => setShowVerifyModal(false)}
                className='flex-1 cursor-pointer rounded-xl border border-[#1a1a1f] bg-transparent px-6 text-slate-300 transition-colors duration-205 hover:bg-[#121215] hover:text-white'
              >
                Hủy
              </AlertDialogCancel>
              <button
                type='submit'
                disabled={verifyingOtp || otp.length !== 6}
                className='flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-6 font-semibold text-white transition-colors duration-200 hover:bg-blue-500 disabled:pointer-events-none disabled:opacity-50'
              >
                {verifyingOtp && <Loader2 className='size-4 animate-spin' />}
                Xác nhận
              </button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
