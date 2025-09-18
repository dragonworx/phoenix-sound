'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewEventForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Combine date and time into a single Date object
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);

      if (isNaN(eventDateTime.getTime())) {
        throw new Error('Invalid date or time');
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          date: eventDateTime.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }

      router.push('/admin/events');
    } catch (error) {
      console.error('Create event error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create event');
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
          <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
            Event Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter event title"
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
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical"
            placeholder="Enter event description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-2">
              Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-slate-300 mb-2">
              Time *
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-400 disabled:to-blue-500 disabled:opacity-50 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 disabled:transform-none"
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Event
              </>
            )}
          </button>

          <Link
            href="/admin/events"
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg font-medium transition-all duration-200 border border-slate-600/50 hover:border-slate-500/50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}