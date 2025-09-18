'use client';

import { useRouter } from 'next/navigation';
import { AuthUser } from '@/lib/auth';
import Link from 'next/link';

interface AdminHeaderProps {
  user: AuthUser;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg"><Link href="/">PS</Link></span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Phoenix Sound</h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>

          <nav className="flex items-center space-x-1">
            <a
              href="/admin"
              className="text-slate-300 hover:text-white hover:bg-slate-700/50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out"
            >
              Dashboard
            </a>
            <a
              href="/admin/events"
              className="text-slate-300 hover:text-white hover:bg-slate-700/50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out"
            >
              Events
            </a>
            <a
              href="/admin/videos"
              className="text-slate-300 hover:text-white hover:bg-slate-700/50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out"
            >
              Videos
            </a>
            <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-slate-700">
              <div className="text-right">
                <div className="text-sm font-medium text-white">{user.username}</div>
                <div className="text-xs text-slate-400">Administrator</div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out shadow-lg hover:shadow-red-500/25"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}