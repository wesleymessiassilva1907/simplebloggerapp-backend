'use client';
import { createContext, useContext, useState } from 'react';

interface SidebarContextType {
  isMobileOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType>({ isMobileOpen: false, toggle: () => {}, close: () => {} });

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{
      isMobileOpen,
      toggle: () => setIsMobileOpen(p => !p),
      close: () => setIsMobileOpen(false),
    }}>
      {children}
    </SidebarContext.Provider>
  );
}
