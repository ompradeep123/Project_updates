import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Shield, ShieldAlert } from 'lucide-react';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3">
            <img
                src="https://github.com/ompradeep123/images/blob/main/VelSecure_logo_final.png?raw=true"
                alt="VelSecure_logo"
                className="h-40 w-auto"
              />
              
            </Link>
            <Link
              to="/new-project"
              className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              New Project
            </Link>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}