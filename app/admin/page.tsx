import { requireAuth } from '@/lib/auth';
import { EventModel } from '@/lib/models/Event';
import { VideoModel } from '@/lib/models/Video';
import AdminHeader from './components/AdminHeader';
import DashboardStats from './components/DashboardStats';

export default async function AdminDashboard() {
  const user = await requireAuth();
  const events = await EventModel.findAll();
  const videos = await VideoModel.findAll();

  return (
    <div className="min-h-screen">
      <AdminHeader user={user} />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user.username}</h1>
            <p className="text-slate-400 text-lg">Here's what's happening with your system today.</p>
          </div>

          <DashboardStats eventCount={events.length} videoCount={videos.length} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-white">Recent Events</h2>
                  <a
                    href="/admin/events"
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    View all →
                  </a>
                </div>
                {events.length > 0 ? (
                  <div className="space-y-4">
                    {events.slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-center p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:bg-slate-700/50 transition-all">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                          <span className="text-white text-lg">📅</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{event.title}</h3>
                          <p className="text-sm text-slate-400">
                            {new Date(event.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-slate-400">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📅</span>
                    </div>
                    <p className="text-slate-400 text-lg">No events found</p>
                    <p className="text-slate-500 text-sm mt-1">Create your first event to get started</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 shadow-xl">
                <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  <a
                    href="/admin/events"
                    className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center">
                      <span className="mr-3">📅</span>
                      Manage Events
                    </div>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a
                    href="/admin/videos"
                    className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center">
                      <span className="mr-3">🎥</span>
                      Manage Videos
                    </div>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 shadow-xl">
                <h2 className="text-xl font-semibold text-white mb-4">System Health</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Server Status</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-green-400 text-sm font-medium">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Database</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-green-400 text-sm font-medium">Connected</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Last Backup</span>
                    <span className="text-slate-300 text-sm">2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}