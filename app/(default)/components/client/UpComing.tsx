"use client";

import Image from "next/image";

interface UpComingData {
  title: string;
  date: string;
  location: string;
  url?: string;
  thumbnail?: string;
}

interface UpComingProps {
  data: UpComingData;
  showUpcoming: boolean;
}

export default function UpComing({ data, showUpcoming }: UpComingProps) {
  return (
    <div className="space-y-6 mb-12">
      <h2 className="text-2xl font-bold text-white/90">Upcoming Events:</h2>
      {showUpcoming ? (
        <div className="bg-black/50 p-6 rounded-lg border-white border-dashed border-2 shadow-[0_0_30px_rgba(255,255,255,0.3)] m-5">
          <div className="flex gap-6">
            {/* Content Area */}
            <div className="flex-1">
              <h3 className="text-xl text-green-500 font-bold mb-3">
                {data.title}
              </h3>
              <p className="text-white/80 text-sm font-bold mb-2">
                {data.date}
              </p>
              <p className="text-white/80 text-sm mb-4">{data.location}</p>
              {data.url && (
                <p>
                  <a
                    href={data.url}
                    className="text-blue-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book Now!
                  </a>
                </p>
              )}
            </div>

            {/* Thumbnail Area */}
            {data.thumbnail && (
              <div className="w-1/3 flex-shrink-0">
                <div className="relative w-full h-full min-h-[150px] rounded-lg overflow-hidden">
                  <Image
                    src={data.thumbnail}
                    alt={data.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white/5 p-8 rounded-lg border border-white/10 text-center">
          <p className="text-lg text-white/70">
            No upcoming events scheduled at this time. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
