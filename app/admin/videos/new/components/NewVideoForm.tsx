'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewVideoForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtube_url: '',
    youtube_id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const extractYouTubeId = (url: string): string => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };

      // Auto-extract YouTube ID when URL changes
      if (name === 'youtube_url') {
        updated.youtube_id = extractYouTubeId(value);
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!formData.youtube_id) {
        throw new Error('Please enter a valid YouTube URL');
      }

      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          youtube_url: formData.youtube_url,
          youtube_id: formData.youtube_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create video');
      }

      router.push('/admin/videos');
    } catch (error) {
      console.error('Create video error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create video');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="youtube_url" className="block text-sm font-medium text-slate-300 mb-2">
            YouTube URL *
          </label>
          <input
            type="url"
            id="youtube_url"
            name="youtube_url"
            value={formData.youtube_url}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
            placeholder="https://www.youtube.com/watch?v=..."
          />
          {formData.youtube_id && (
            <p className="text-green-400 text-xs mt-2">✓ Video ID detected: {formData.youtube_id}</p>
          )}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
            Video Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter video title"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-vertical"
            placeholder="Enter video description"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-red-400 disabled:to-red-500 disabled:opacity-50 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25 hover:-translate-y-0.5 disabled:transform-none"
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Adding Video...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Video
              </>
            )}
          </button>

          <Link
            href="/admin/videos"
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg font-medium transition-all duration-200 border border-slate-600/50 hover:border-slate-500/50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}