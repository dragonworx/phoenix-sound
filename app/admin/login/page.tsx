import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import LoginForm from './components/LoginForm';

export default async function LoginPage() {
  const user = await getSession();

  if (user) {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-5"></div>
      <div className="relative max-w-md w-full mx-4">
        <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">PS</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Phoenix Sound
            </h2>
            <p className="text-slate-400">
              Administration Panel
            </p>
          </div>
          <LoginForm />
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              © 2024 Phoenix Sound. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}