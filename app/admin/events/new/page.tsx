import { requireAuth } from '@/lib/auth';
import AdminHeader from '../../components/AdminHeader';
import NewEventForm from './components/NewEventForm';

export default async function NewEventPage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen">
      <AdminHeader user={user} />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Create New Event</h1>
            <p className="text-slate-400">Add a new event or performance</p>
          </div>

          <NewEventForm />
        </div>
      </main>
    </div>
  );
}