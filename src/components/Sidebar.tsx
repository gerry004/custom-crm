import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUsers, FiUserPlus, FiCheckSquare, FiUserCheck, FiLogOut } from 'react-icons/fi';

const Sidebar = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="w-60 h-screen bg-[#191919] text-gray-300 p-4 fixed left-0 top-0 flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">CRM System</h1>
      </div>
      
      <div className="space-y-2">
        <Link 
          href="/customers" 
          className="flex items-center gap-2 p-2 hover:bg-[#2f2f2f] rounded-md"
        >
          <FiUsers className="text-lg" />
          <span>Customers</span>
        </Link>
        
        <Link 
          href="/leads" 
          className="flex items-center gap-2 p-2 hover:bg-[#2f2f2f] rounded-md"
        >
          <FiUserPlus className="text-lg" />
          <span>Leads</span>
        </Link>

        <Link 
          href="/tasks" 
          className="flex items-center gap-2 p-2 hover:bg-[#2f2f2f] rounded-md"
        >
          <FiCheckSquare className="text-lg" />
          <span>Tasks</span>
        </Link>

        <Link 
          href="/team-members" 
          className="flex items-center gap-2 p-2 hover:bg-[#2f2f2f] rounded-md"
        >
          <FiUserCheck className="text-lg" />
          <span>Team Members</span>
        </Link>
      </div>

      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-2 p-2 w-full hover:bg-[#2f2f2f] rounded-md text-red-400 hover:text-red-300 transition-colors"
      >
        <FiLogOut className="text-lg" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar; 