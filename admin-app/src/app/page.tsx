/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Languages,
  Clock,
  CheckCircle2,
  Trash2,
  Loader2,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  pendingUsers: number;
  totalVocab: number;
  totalKanji: number;
  vocabByLevel: { level: string; count: number }[];
  kanjiByLevel: { level: string; count: number }[];
}

interface UserRecord {
  id: number;
  email: string;
  is_approved: number;
  is_admin: number;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/users'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setPendingUsers(
          usersData.filter((u: UserRecord) => u.is_approved === 0),
        );
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isApproved: 1, isAdmin: 0 }),
      });
      if (res.ok) {
        await fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thành viên này?')) return;
    try {
      setActionLoading(userId);
      const res = await fetch(`/api/users?userId=${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center'>
        <Loader2 className='size-8 animate-spin text-amber-500' />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Tổng Từ Vựng',
      value: stats?.totalVocab?.toLocaleString('vi-VN') ?? 0,
      sub: 'N5 đến N1',
      icon: BookOpen,
      color:
        'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
      href: '/vocabulary',
    },
    {
      title: 'Tổng Chữ Kanji',
      value: stats?.totalKanji?.toLocaleString('vi-VN') ?? 0,
      sub: 'Bộ Hán tự chuẩn',
      icon: Languages,
      color: 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30',
      href: '/kanji',
    },
    {
      title: 'Tổng Thành Viên',
      value: stats?.totalUsers?.toLocaleString('vi-VN') ?? 0,
      sub: 'Đã đăng ký',
      icon: Users,
      color:
        'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
      href: '/users',
    },
    {
      title: 'Chờ Phê Duyệt',
      value: stats?.pendingUsers ?? 0,
      sub: 'Cần xác nhận',
      icon: Clock,
      color: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30',
      href: '/users',
    },
  ];

  return (
    <div className='space-y-8'>
      {/* Title */}
      <div>
        <h1 className='text-2xl font-black tracking-tight text-white'>
          Bảng Điều Khiển Quản Trị
        </h1>
        <p className='mt-1 text-xs text-slate-400'>
          Theo dõi tổng quan dữ liệu và thành viên hệ thống Nihongo PThamSS.
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'>
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.href}
              className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${card.color} bg-[#0c0c0e]/60`}
            >
              <div className='flex items-center justify-between'>
                <span className='text-xs font-semibold text-slate-400'>
                  {card.title}
                </span>
                <Icon className='size-5 opacity-80 transition-transform group-hover:scale-110' />
              </div>
              <div className='mt-4 flex items-baseline justify-between'>
                <p className='text-3xl font-black tracking-tight text-white'>
                  {card.value}
                </p>
                <span className='text-[10px] font-bold text-slate-500'>
                  {card.sub}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pending Users Approval Table */}
      <div className='rounded-2xl border border-[#1e1e24] bg-[#0c0c0e] p-6 shadow-sm'>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h2 className='text-base font-bold text-white'>
              Tài Khoản Đang Chờ Duyệt
            </h2>
            <p className='text-xs text-slate-400'>
              Những người dùng mới đăng ký cần quyền truy cập
            </p>
          </div>
          <span className='rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400'>
            {pendingUsers.length} chờ duyệt
          </span>
        </div>

        {pendingUsers.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <CheckCircle2 className='mb-2 size-10 text-emerald-500/50' />
            <p className='text-sm font-semibold text-slate-400'>
              Không có tài khoản nào đang chờ phê duyệt.
            </p>
          </div>
        ) : (
          <div className='overflow-hidden rounded-xl border border-[#1e1e24]'>
            <table className='w-full border-collapse text-left text-sm'>
              <thead>
                <tr className='border-b border-[#1e1e24] bg-[#121215] text-xs font-semibold text-slate-400'>
                  <th className='px-5 py-3'>ID</th>
                  <th className='px-5 py-3'>Email</th>
                  <th className='px-5 py-3'>Ngày Đăng Ký</th>
                  <th className='px-5 py-3 text-right'>Thao Tác</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-[#1e1e24]'>
                {pendingUsers.map(user => (
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
                    <td className='px-5 py-3.5 text-xs text-slate-400'>
                      {new Date(user.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className='flex items-center justify-end gap-2 px-5 py-3.5 text-right'>
                      <button
                        disabled={actionLoading !== null}
                        onClick={() => handleApprove(user.id)}
                        className='flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20'
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className='size-3.5 animate-spin' />
                        ) : (
                          <CheckCircle2 className='size-3.5' />
                        )}
                        Duyệt
                      </button>
                      <button
                        disabled={actionLoading !== null}
                        onClick={() => handleDelete(user.id)}
                        className='flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20'
                      >
                        <Trash2 className='size-3.5' />
                        Xóa
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
