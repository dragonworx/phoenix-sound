'use client';

import { Event } from '@/lib/models/Event';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EventsListProps {
  events: Event[];
}

export default function EventsList({ events: initialEvents }: EventsListProps) {
  const [events, setEvents] = useState(initialEvents);
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEvents(events.filter(event => event.id !== id));
      } else {
        alert('Failed to delete event');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete event');
    }
  };

  if (events.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-12 text-center">
        <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">📅</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
        <p className="text-slate-400 mb-6">Create your first event to get started</p>
        <button
          onClick={() => router.push('/admin/events/new')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
        >
          Create Event
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-700/50 border-b border-slate-600/50">
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-slate-700/30 transition-all duration-200">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">📅</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{event.title}</div>
                      <div className="text-xs text-slate-400">Event #{event.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-white font-medium">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(event.date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-300 max-w-xs">
                    <p className="truncate">{event.description}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => router.push(`/admin/events/edit/${event.id}`)}
                      className="inline-flex items-center px-3 py-2 text-xs font-medium rounded-lg text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/30 transition-all duration-200"
                    >
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="inline-flex items-center px-3 py-2 text-xs font-medium rounded-lg text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 transition-all duration-200"
                    >
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}