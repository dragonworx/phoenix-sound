import { ReactNode } from "react";
import { GALAXY_IMAGES } from "./MenuItem";

interface FocusedFrameProps {
  imageIndex: number;
  title: string;
  children: ReactNode;
}

export default function FocusedFrame({
  imageIndex,
  title,
  children,
}: FocusedFrameProps) {
  const galaxyImage = GALAXY_IMAGES[imageIndex];

  return (
    <div
      className="text-white min-h-screen flex flex-col"
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
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
