"use client";
import { useState, useEffect, useRef } from "react";
import config from "./starfieldConfig";

import Header from "./components/server/Header";
import Footer from "./components/server/Footer";
import StarfieldRenderer from "./components/client/StarfieldRenderer";
import MenuCarrousel from "./components/client/MenuCarrousel";
import CloseButton from "./components/client/CloseButton";
import About from "./components/client/About";
import Events from "./components/client/Events";
import Audio, { type AudioRef } from "./components/client/Audio";

export default function HomePage() {
  const [focusedItem, setFocusedItem] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const hasPlayingVideoRef = useRef(false);
  const audioComponentRef = useRef<AudioRef | null>(null);
  const headerRef = useRef<{ stop: () => void } | null>(null);

  const handleVideoStateChange = (hasPlayingVideo: boolean) => {
    hasPlayingVideoRef.current = hasPlayingVideo;
  };

  const handleVideoPlay = () => {
    headerRef.current?.stop();
  };

  const menuItems = [
    {
      component: <About />,
      focusedComponent: <About focused={true} />,
      name: "About",
    },
    {
      component: <Events />,
      focusedComponent: <Events focused={true} />,
      name: "Events",
    },
    {
      component: <Audio />,
      focusedComponent: (
        <Audio
          ref={audioComponentRef}
          focused={true}
          onVideoStateChange={handleVideoStateChange}
          onVideoPlay={handleVideoPlay}
        />
      ),
      name: "Audio",
    },
  ];

  const handleItemClick = (index: number) => {
    setIsAnimating(true);
    setFocusedItem(index);
  };

  const handleClose = () => {
    // If Audio is focused (index 2) and has playing video, stop video only
    if (focusedItem === 2 && hasPlayingVideoRef.current) {
      audioComponentRef.current?.stopVideo();
      return;
    }

    // Otherwise close the focused item entirely
    setFocusedItem(null);
    setIsAnimating(false);
  };

  useEffect(() => {
    // Mark as initially loaded after component mounts
    setHasInitiallyLoaded(true);
  }, []);

  useEffect(() => {
    if (focusedItem !== null) {
      // Small delay to ensure the element is in DOM before animating
      const timer = setTimeout(() => setIsAnimating(false), 50);
      return () => clearTimeout(timer);
    }
  }, [focusedItem]);

  return (
    <div className="h-screen relative bg-black">
      <Header
        ref={headerRef}
        onClick={handleItemClick}
        className="fade-in-header-footer"
      />

      <main className="absolute inset-0">
        <div className="fade-in-canvas">
          <StarfieldRenderer config={config} />
        </div>

        {/* Floating Menu Carrousel */}
        {focusedItem === null && (
          <div
            className={`absolute inset-0 pointer-events-none ${
              !hasInitiallyLoaded ? "fade-in-carousel" : ""
            }`}
          >
            <MenuCarrousel
              fan={200}
              tilt={30}
              autoSpin={true}
              autoSpinSpeed={0.1}
              className="w-full h-full"
              onItemClick={handleItemClick}
            >
              {menuItems.map((item, index) => (
                <div key={index}>{item.component}</div>
              ))}
            </MenuCarrousel>
          </div>
        )}

        {/* Focused Item View */}
        {focusedItem !== null && (
          <div
            className={`absolute inset-0 flex items-center justify-center p-4 z-50 bg-black/40${
              isAnimating ? "opacity-0" : "opacity-100"
            }`}
          >
            <div
              className={`relative w-full max-w-4xl max-h-4xl bg-white/10 border border-white/20 rounded-lg shadow-xl${
                isAnimating
                  ? "scale-90 translate-y-8 opacity-0"
                  : "scale-100 translate-y-0 opacity-100"
              }`}
            >
              <CloseButton onClose={handleClose} />
              <div className="p-8 h-full overflow-auto">
                {menuItems[focusedItem].focusedComponent}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer className="fade-in-header-footer" />
    </div>
  );
}
