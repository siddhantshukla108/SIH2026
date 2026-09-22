import React from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-[var(--color-sahayak-bg)] font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 bg-grid-pattern relative overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
