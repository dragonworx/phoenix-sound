import { requireAuth } from '@/lib/auth';
import { VideoModel } from '@/lib/models/Video';
import AdminHeader from '../components/AdminHeader';
import Link from 'next/link';

export default async function VideosPage() {
  const user = await requireAuth();
  const videos = await VideoModel.findAll();

  return (
    <div className="min-h-screen">
      <AdminHeader user={user} />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Videos Management</h1>
              <p className="text-slate-400">Manage your video content and YouTube integration</p>
            </div>
            <Link
              href="/admin/videos/new"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25 hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Video
            </Link>
          </div>

          {videos.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-12 text-center">
              <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🎥</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No videos found</h3>
              <p className="text-slate-400 mb-6">Add your first video to get started</p>
              <Link
                href="/admin/videos/new"
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25"
              >
                Create Video
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative">
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
                    <div className="absolute bottom-3 right-3">
                      <div className="bg-red-600/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-medium">
                        YouTube
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-white font-semibold mb-2 line-clamp-2">{video.title}</h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                      {video.description}
                    </p>
                    <div className="flex flex-col space-y-3">
                      <a
                        href={`https://youtube.com/watch?v=${video.youtube_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full py-2 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium transition-all duration-200 border border-red-600/20 hover:border-red-600/30"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        View on YouTube
                      </a>
                      <div className="flex space-x-2">
                        <button className="flex-1 py-2 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 rounded-lg text-sm font-medium transition-all duration-200 border border-blue-600/20 hover:border-blue-600/30">
                          Edit
                        </button>
                        <button className="flex-1 py-2 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium transition-all duration-200 border border-red-600/20 hover:border-red-600/30">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}