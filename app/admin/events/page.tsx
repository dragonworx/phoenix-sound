import { requireAuth } from '@/lib/auth';
import { EventModel } from '@/lib/models/Event';
import AdminHeader from '../components/AdminHeader';
import EventsList from './components/EventsList';
import AddEventButton from './components/AddEventButton';

export default async function EventsPage() {
  const user = await requireAuth();
  const events = await EventModel.findAll();

  return (
    <div className="min-h-screen">
      <AdminHeader user={user} />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Events Management</h1>
              <p className="text-slate-400">Manage your events and performances</p>
            </div>
            <AddEventButton />
          </div>

          <EventsList events={events} />
        </div>
      </main>
    </div>
  );
}