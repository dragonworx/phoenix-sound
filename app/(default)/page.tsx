"use client";
import { useState } from "react";
import config from "./starfieldConfig";

import Header from "./components/server/Header";
import Footer from "./components/server/Footer";
import StarfieldRenderer from "./components/client/StarfieldRenderer";
import MenuCarrousel from "./components/client/MenuCarrousel";
import MenuItem from "./components/client/MenuItem";
import CloseButton from "./components/client/CloseButton";
import About from "./about";
import Events from "./events";
import Audio from "./audio";

export default function HomePage() {
  const [focusedItem, setFocusedItem] = useState<number | null>(null);

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
      focusedComponent: <Audio focused={true} />,
      name: "Audio",
    },
  ];

  const handleItemClick = (index: number) => {
    setFocusedItem(index);
  };

  const handleClose = () => {
    setFocusedItem(null);
  };

  return (
    <div className="h-screen relative bg-black">
      <Header />

      <main className="absolute inset-0">
        <StarfieldRenderer config={config} />

        {/* Floating Menu Carrousel */}
        {focusedItem === null && (
          <div className="absolute inset-0 pointer-events-none">
            <MenuCarrousel
              fan={120}
              tilt={25}
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
          <div className="absolute inset-0 flex items-center justify-center p-4 z-50">
            <div className="relative w-full h-full max-w-4xl max-h-4xl bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-xl">
              <CloseButton onClose={handleClose} />
              <div className="p-8 h-full overflow-auto">
                {menuItems[focusedItem].focusedComponent}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
