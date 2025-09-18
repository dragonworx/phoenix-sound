import { requireAuth } from '@/lib/auth';
import AdminHeader from '../../components/AdminHeader';
import NewVideoForm from './components/NewVideoForm';

export default async function NewVideoPage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen">
      <AdminHeader user={user} />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Add New Video</h1>
            <p className="text-slate-400">Add a new video from YouTube</p>
          </div>

          <NewVideoForm />
        </div>
      </main>
    </div>
  );
}