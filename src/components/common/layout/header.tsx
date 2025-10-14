'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Logo } from '@/components/common/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Menu, X, ChevronDown, User } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { handleLogout } from '@/lib/auth/logout';

const Header = () => {
  const [menuState, setMenuState] = useState(false);
  const [examDropdownOpen, setExamDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const { user } = useAuth();

  const menuItems = [
    { name: 'Exams', href: '/#exams', hasDropdown: true },
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Resources', href: '/resources' },
  ];

  const examCategories = [
    {
      category: 'English Proficiency Tests',
      exams: [
        { name: 'IELTS Academic', href: '/ielts-academic', icon: '📚' },
        { name: 'PTE Academic', href: '/pte-academic', icon: '💻' },
      ],
    },
  ];

  const handleMouseEnter = () => {
    if (timeoutRef.current && typeof window !== 'undefined') {
      window.clearTimeout(timeoutRef.current);
    }
    setExamDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    if (typeof window !== 'undefined') {
      timeoutRef.current = window.setTimeout(() => {
        setExamDropdownOpen(false);
      }, 150);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setExamDropdownOpen(false);
      }
      
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExamDropdownOpen(false);
        setMenuState(false);
        setUserDropdownOpen(false);
      }
    };

    if (examDropdownOpen || userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      if (timeoutRef.current && typeof window !== 'undefined') {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [examDropdownOpen, userDropdownOpen]);

  return (
    <header>
      <nav
        data-state={menuState && 'active'}
        className="fixed z-50 w-full border-b border-dashed bg-white/95 backdrop-blur-sm md:relative dark:bg-zinc-950/95 lg:dark:bg-transparent"
      >
        <div className="m-auto max-w-5xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <Logo />
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:pr-4">
                <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                  {menuItems.map((item, index) => (
                    <li key={index} className="relative group">
                      {item.hasDropdown ? (
                        <div
                          ref={dropdownRef}
                          className="relative"
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                        >
                          <button
                            className="text-muted-foreground hover:text-accent-foreground flex items-center gap-1 duration-150 py-2"
                            onClick={() =>
                              setExamDropdownOpen(!examDropdownOpen)
                            }
                          >
                            <span>{item.name}</span>
                            <ChevronDown
                              className={`size-4 transition-transform duration-200 ${
                                examDropdownOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {/* Desktop Dropdown */}
                          <div
                            className={`absolute top-full left-0 mt-1 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 z-[100] ${
                              examDropdownOpen
                                ? 'opacity-100 visible translate-y-0'
                                : 'opacity-0 invisible -translate-y-2'
                            } hidden lg:block`}
                          >
                            <div className="p-6">
                              <div className="grid gap-6">
                                {examCategories.map((category, catIndex) => (
                                  <div key={catIndex}>
                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                                      {category.category}
                                    </h4>
                                    <div className="space-y-1">
                                      {category.exams.map((exam, examIndex) => (
                                        <Link
                                          key={examIndex}
                                          href={exam.href}
                                          className="flex items-center gap-3 text-sm text-muted-foreground hover:text-accent-foreground hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-3 rounded-lg transition-colors duration-150"
                                          onClick={() =>
                                            setExamDropdownOpen(false)
                                          }
                                        >
                                          <span className="text-lg">{exam.icon}</span>
                                          <div>
                                            <div className="font-medium">{exam.name}</div>
                                            <div className="text-xs text-gray-500">
                                              {exam.name === 'IELTS Academic' ? 'International English Test' : 'Computer-Based Test'}
                                            </div>
                                          </div>
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <Link
                                  href="/exams"
                                  className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                  onClick={() => setExamDropdownOpen(false)}
                                >
                                  View All Exams
                                  <ChevronDown className="size-4 -rotate-90" />
                                </Link>
                              </div>
                            </div>
                          </div>

                          {/* Mobile Dropdown */}
                          <div
                            className={`lg:hidden mt-2 space-y-4 ${
                              examDropdownOpen ? 'block' : 'hidden'
                            }`}
                          >
                            {examCategories.map((category, catIndex) => (
                              <div key={catIndex}>
                                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2">
                                  {category.category}
                                </h4>
                                <div className="space-y-1 ml-4">
                                  {category.exams.map((exam, examIndex) => (
                                    <Link
                                      key={examIndex}
                                      href={exam.href}
                                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent-foreground py-2"
                                      onClick={() => {
                                        setExamDropdownOpen(false);
                                        setMenuState(false);
                                      }}
                                    >
                                      <span>{exam.icon}</span>
                                      {exam.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className="text-muted-foreground hover:text-accent-foreground block duration-150 py-2"
                          onClick={() => setMenuState(false)}
                        >
                          <span>{item.name}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
                {user ? (
                  <div className="relative" ref={userDropdownRef}>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium"
                    >
                      <User className="size-4" />
                      <span>Account</span>
                    </button>
                    
                    <div
                      className={`absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 z-[100] ${
                        userDropdownOpen
                          ? 'opacity-100 visible translate-y-0'
                          : 'opacity-0 invisible -translate-y-2'
                      }`}
                    >
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          Profile
                        </Link>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        <button
                          onClick={async () => {
                            setUserDropdownOpen(false)
                            await handleLogout()
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/login">
                        <span>Login</span>
                      </Link>
                    </Button>

                    <Button asChild size="sm">
                      <Link href="/register">
                        <span>Start Learning</span>
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
