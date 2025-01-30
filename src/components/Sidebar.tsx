import React from 'react';
import Link from 'next/link';
import { FiUsers, FiUserPlus, FiCheckSquare } from 'react-icons/fi';

const Sidebar = () => {
  return (
    <div className="w-60 h-screen bg-[#191919] text-gray-300 p-4 fixed left-0 top-0">
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
      </div>
    </div>
  );
};

export default Sidebar; 