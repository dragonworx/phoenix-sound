interface EventProps {
  title: string;
  date: string;
  location: string;
  isUpcoming?: boolean;
  url?: string;
}

export default function Event({
  title,
  date,
  location,
  isUpcoming,
  url,
}: EventProps) {
  return (
    <div
      className={`bg-white/5 p-6 rounded-lg border border-white/10 m-5 ${
        isUpcoming ? "bg-black/50 border-white border-dashed border-2 shadow-[0_0_30px_rgba(255,255,255,0.3)]" : ""
      }`}
    >
      <h3 className="text-xl text-green-500 font-bold mb-3">{title}!</h3>
      <p className="text-white/80 text-sm font-bold mb-2">{date}</p>
      <p className="text-white/80 text-sm mb-4">{location}</p>
      {url && (
        <p>
          <a
            href={url}
            className="text-blue-500 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more
          </a>
        </p>
      )}
    </div>
  );
}
