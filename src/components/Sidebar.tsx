import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUsers, FiUserPlus, FiCheckSquare, FiUserCheck, FiLogOut } from 'react-icons/fi';

interface User {
  name: string;
  email: string;
}

const Sidebar = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

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

      <div className="mt-auto">
        {user && (
          <div className="px-2 py-3 border-t border-gray-800">
            <div className="text-sm font-medium text-white">{user.name}</div>
            <div className="text-xs text-gray-400">{user.email}</div>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className="mt-2 flex items-center gap-2 p-2 w-full hover:bg-[#2f2f2f] rounded-md text-red-400 hover:text-red-300 transition-colors"
        >
          <FiLogOut className="text-lg" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 