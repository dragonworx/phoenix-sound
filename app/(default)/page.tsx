"use client";
import { useState, useEffect, useRef } from "react";
import config from "./starfieldConfig";

import Header from "./components/server/Header";
import Footer from "./components/server/Footer";
import StarfieldRenderer from "./components/client/StarfieldRenderer";
import MenuCarrousel from "./components/client/MenuCarrousel";
import CloseButton from "./components/client/CloseButton";
import About from "./components/client/About";
import Audio, { type AudioRef } from "./components/client/Events";
import { type SoundToggleRef } from "./components/client/SoundToggle";

export default function HomePage() {
  const [focusedItem, setFocusedItem] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const hasPlayingVideoRef = useRef(false);
  const audioComponentRef = useRef<AudioRef | null>(null);
  const headerRef = useRef<SoundToggleRef | null>(null);

  const handleVideoStateChange = (hasPlayingVideo: boolean) => {
    hasPlayingVideoRef.current = hasPlayingVideo;
  };

  const handleVideoPlay = () => {
    headerRef.current?.stop();
  };

  const handleCanvasClick = () => {
    // Only toggle sound on if it's not already playing
    // After first activation, let user control sound via header button only
    if (headerRef.current && !headerRef.current.isPlaying()) {
      headerRef.current.toggle();
    }
  };

  const menuItems = [
    {
      component: <About />,
      focusedComponent: <About focused={true} />,
      name: "About",
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
      name: "Events",
    },
  ];

  const handleItemClick = (index: number) => {
    setIsAnimating(true);
    setFocusedItem(index);
  };

  const handleClose = () => {
    // If Events (formerly Audio, index 1) is focused and has playing video, stop video only
    if (focusedItem === 1 && hasPlayingVideoRef.current) {
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
          <StarfieldRenderer config={config} onCanvasClick={handleCanvasClick} />
        </div>

        {/* Floating Menu Carrousel */}
        {/* {focusedItem === null && (
          <div
            className={`absolute inset-0 pointer-events-none ${
              !hasInitiallyLoaded ? "fade-in-carousel" : ""
            }`}
          >
            <MenuCarrousel
              fan={150}
              tilt={30}
              autoSpin={true}
              autoSpinSpeed={0.11}
              className="w-full h-full"
              onItemClick={handleItemClick}
            >
              {menuItems.map((item, index) => (
                <div key={index}>{item.component}</div>
              ))}
            </MenuCarrousel>
          </div>
        )} */}

        {/* Focused Item View */}
        {focusedItem !== null && (
          <div
            className={`absolute inset-0 flex items-center justify-center p-4 z-50 bg-black/40 ${
              isAnimating ? "opacity-0" : "opacity-100"
            }`}
          >
            <div
              className={`relative w-full max-w-4xl h-[90vh] max-h-[800px] bg-white/10 border border-white/20 rounded-lg shadow-xl flex flex-col ${
                isAnimating
                  ? "scale-90 translate-y-8 opacity-0"
                  : "scale-100 translate-y-0 opacity-100"
              }`}
            >
              <CloseButton onClose={handleClose} />
              <div className="p-8 flex-1 overflow-y-auto">
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
