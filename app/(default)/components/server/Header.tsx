import { forwardRef } from "react";
import SoundToggle, { type SoundToggleRef } from "../client/SoundToggle";

export interface HeaderProps {
  onClick: (index: number) => void;
  className?: string;
}

const Header = forwardRef<SoundToggleRef, HeaderProps>(
  ({ onClick, className = "" }, ref) => {
    return (
      <header
        className={`bg-black/10 backdrop-blur-sm text-white w-full p-2.5 absolute top-0 left-0 right-0 z-10 border-b border-white/20 ${className} text-shadow`}
      >
        <div className="flex justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 bg-gray-600 rounded-full flex">
              <img
                src="/img/logo.jpg"
                alt="Logo"
                className="w-8 h-8 rounded-full"
              />
            </div>
            <h1
              className="text-xl font-bold"
              style={{ fontFamily: "Uniwars, sans-serif" }}
            >
              Phoenix Sound
            </h1>
          </div>
          <div className="flex items-center space-x-2.5">
            <SoundToggle ref={ref} />
            <button
              className="text-white hover:text-gray-300"
              onClick={() => onClick(0)}
            >
              About
            </button>
            <button
              className="text-white hover:text-gray-300"
              onClick={() => onClick(1)}
            >
              Events
            </button>
            <button
              className="text-white hover:text-gray-300"
              onClick={() => onClick(2)}
            >
              Recordings
            </button>
          </div>
        </div>
      </header>
    );
  }
);

Header.displayName = "Header";

export default Header;
