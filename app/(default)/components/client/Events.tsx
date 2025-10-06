import MenuItem from "./MenuItem";
import { GALAXY_IMAGES } from "./MenuItem";
import Event from "./Event";
import eventsData from "../../data.json";

interface EventsProps {
  focused?: boolean;
}

export default function Events({ focused = false }: EventsProps) {
  if (focused) {
    const galaxyImage = GALAXY_IMAGES[1];
    const upcoming = eventsData.upcoming;

    return (
      <div
        className="text-white"
        style={{
          background: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(4, 41, 84, 0.7)), url(${galaxyImage})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        <div className="text-center mb-8">
          <div className="text-6xl mb-6">📅</div>
          <h1 className="text-4xl font-bold mb-4">Events</h1>
        </div>
        <div className="max-w-2xl mx-auto space-y-6">
          <p className="text-lg text-white/90 leading-relaxed">
            See our upcoming events.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Event
              key={"Upcoming"}
              title={upcoming.title}
              date={upcoming.date}
              location={upcoming.location}
              isUpcoming={true}
            />
          </div>
        </div>
        <div className="max-w-2xl mx-auto space-y-6">
          <p className="text-lg text-white/90 leading-relaxed">
            See our past events.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {eventsData.events.map((event, index) => (
              <Event
                key={index}
                title={event.title}
                date={event.date}
                location={event.location}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <MenuItem imageIndex={2}>
      <div className="text-center">
        <div className="text-4xl mb-4">📅</div>
        <h3 className="text-white text-xl font-bold mb-2">Events</h3>
        <p className="text-white/80 text-sm">Upcoming events</p>
      </div>
    </MenuItem>
  );
}
