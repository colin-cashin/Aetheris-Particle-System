
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  debug: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children, sidebar, debug }) => {
  return (
    <div className="relative flex h-full w-full overflow-hidden text-white">
      {/* Sidebar - Left */}
      <aside className="w-80 h-full backdrop-blur-xl bg-black/30 border-r border-white/10 p-6 flex flex-col gap-8 z-20 transition-all">
        {sidebar}
      </aside>

      {/* Main Stage */}
      <main className="flex-1 relative">
        {children}
      </main>

      {/* Debug Monitor - Right */}
      <div className="absolute top-6 right-6 w-80 max-h-[60%] flex flex-col gap-4 z-20">
        {debug}
      </div>

      {/* Overlay Glows */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
    </div>
  );
};
