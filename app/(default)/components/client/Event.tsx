interface EventProps {
  title: string;
  date: string;
  location: string;
  isUpcoming?: boolean;
}

export default function Event({
  title,
  date,
  location,
  isUpcoming,
}: EventProps) {
  return (
    <div
      className={`bg-white/5 p-6 rounded-lg border border-white/10 m-5 ${
        isUpcoming ? "bg-white/25 shadow-[0_0_30px_rgba(255,255,255,0.3)]" : ""
      }`}
    >
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-white/80 text-sm mb-2">{date}</p>
      <p className="text-white/80 text-sm mb-4">{location}</p>
    </div>
  );
}
