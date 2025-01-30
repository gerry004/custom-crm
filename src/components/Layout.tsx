import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex bg-[#1f1f1f] min-h-screen">
      <Sidebar />
      <main className="ml-60 w-full p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout; 