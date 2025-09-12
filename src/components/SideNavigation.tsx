'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface SideNavigationProps {
  className?: string;
}

export default function SideNavigation({ className = '' }: SideNavigationProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    {
      name: 'Options Screener',
      href: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
        </svg>
      ),
    },
    {
      name: 'Trade Counter',
      href: '/trade-counter',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
        </svg>
      ),
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
    {
      name: 'AI Assistant',
      href: '/chat',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gradient-to-b from-white to-gray-50/30 border-r border-gray-200/60 min-h-screen flex flex-col transition-all duration-300 ease-in-out shadow-sm ${className}`}>
      {/* Header */}
      <div className={`border-b border-gray-200 ${isCollapsed ? 'p-2' : 'p-4'} transition-all duration-300`}>
        {isCollapsed ? (
          // Collapsed Header Layout
          <div className="flex flex-col items-center space-y-3">
            {/* Hamburger Button at top */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="group p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Expand sidebar"
            >
              <svg 
                className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-all duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
              </svg>
            </button>
            
            {/* DH Logo - only when collapsed */}
            <Link href="/chat" className="w-8 h-8 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105">
              <span className="text-white font-bold text-sm tracking-tight">DH</span>
            </Link>
          </div>
        ) : (
          // Expanded Header Layout
          <div className="flex items-center justify-between">
            {/* Title only when expanded */}
            <Link href="/chat" className="relative group">
              <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors cursor-pointer">
                Del<span className="text-blue-600">Hub</span>
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full group-hover:w-12 transition-all duration-300"></div>
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1 group-hover:text-gray-700 transition-colors">Options Trading</p>
            </Link>
            
            {/* Hamburger Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="group p-2.5 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Collapse sidebar"
            >
              <svg 
                className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-all duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm'
                } ${isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'}`}
                title={isCollapsed ? item.name : ''}
              >
                {/* Active indicator line */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-r-full" />
                )}
                
                <span className={`${isCollapsed ? 'mx-0' : 'mr-4'} ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} transition-all duration-200 ${isCollapsed ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                
                {/* Text content - hidden when collapsed */}
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <div className={`font-medium truncate transition-colors duration-200 ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                      {item.name}
                    </div>
                  </div>
                )}
                
                {/* Hover arrow for expanded state */}
                {!isCollapsed && (
                  <div className={`ml-2 transition-all duration-200 ${
                    isActive 
                      ? 'text-blue-500 opacity-100 translate-x-0' 
                      : 'text-gray-300 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
                
                {/* Enhanced tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                    <div className="font-medium">{item.name}</div>
                    {/* Enhanced arrow */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 w-3 h-3 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-400 text-center">
            v1.0.0 • Built with Next.js
          </div>
        </div>
      )}
    </div>
  );
}
