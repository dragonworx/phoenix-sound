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
      <h3 className="text-xl text-green-500 font-bold mb-3">{title}!</h3>
      <p className="text-white/80 text-sm font-bold mb-2">{date}</p>
      <p className="text-white/80 text-sm mb-4">{location}</p>
      <p>
        <a
          href="https://www-phoenixpilates-org.filesusr.com/html/89595c_a49d7551334baf8da5f718e66b7564d6.html"
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more
        </a>
      </p>
    </div>
  );
}
