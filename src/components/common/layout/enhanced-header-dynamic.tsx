'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Logo } from '@/components/common/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Menu,
  X,
  ChevronDown,
  User,
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { handleLogout } from '@/lib/auth/logout';
import { useExamNavigation } from '@/hooks/use-exam-navigation';
import {
  getSectionIcon,
  getExamIcon,
  getQuestionTypeNavUrl,
  getExamLandingUrl,
} from '@/lib/navigation-utils';

const EnhancedHeaderDynamic = () => {
  const [menuState, setMenuState] = useState(false);
  const [activeExamIndex, setActiveExamIndex] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const closeTimeoutRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const { exams, isLoading } = useExamNavigation();

  const menuItems = [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Resources', href: '/resources' },
  ];

  const openDropdown = (index: number) => {
    if (closeTimeoutRef.current !== null) {
      clearTimeout(closeTimeoutRef.current);
    }
    setActiveExamIndex(index);
    setIsDropdownOpen(true);
  };

  const closeDropdown = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 150) as unknown as number;
  };

  const handleDropdownTransitionEnd = () => {
    if (!isDropdownOpen) {
      setActiveExamIndex(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
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
        setIsDropdownOpen(false);
        setMenuState(false);
        setUserDropdownOpen(false);
      }
    };

    if (isDropdownOpen || userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      if (closeTimeoutRef.current && typeof window !== 'undefined') {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [isDropdownOpen, userDropdownOpen]);

  const contentVariants: Variants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  const containerVariants: Variants = {
    closed: { opacity: 0, pointerEvents: 'none' },
    open: { opacity: 1, pointerEvents: 'auto' },
  };

  return (
    <header>
      <nav
        data-state={menuState && 'active'}
        className="fixed z-50 w-full border-b border-dashed bg-white/95 backdrop-blur-sm md:relative dark:bg-zinc-950/95 lg:dark:bg-transparent"
      >
        <div className="m-auto max-w-6xl px-6">
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
                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:pr-4">
                <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                  {/* Desktop Exam Buttons */}
                  {!isLoading && exams.length > 0 && (
                    <li className="relative group hidden lg:block">
                      <div className="flex gap-2" onMouseLeave={closeDropdown}>
                        {exams.map((exam, examIndex) => (
                          <div
                            key={exam.id}
                            className="relative"
                            onMouseEnter={() => openDropdown(examIndex)}
                          >
                            <button
                              className={`text-muted-foreground hover:text-accent-foreground flex items-center gap-1 duration-150 py-2 px-3 rounded-md transition-colors ${
                                activeExamIndex === examIndex && isDropdownOpen
                                  ? 'text-accent-foreground bg-accent/10'
                                  : ''
                              }`}
                            >
                              <span className="text-lg">{getExamIcon(exam.id)}</span>
                              <span>{exam.name.split(' ')[0]}</span>
                              <ChevronDown
                                className={`size-4 transition-transform duration-200 ${
                                  activeExamIndex === examIndex && isDropdownOpen
                                    ? 'rotate-180'
                                    : ''
                                }`}
                              />
                            </button>
                            {activeExamIndex === examIndex && isDropdownOpen && (
                              <motion.div
                                layoutId="underline"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </li>
                  )}

                  {/* Mobile Exam Links */}
                  {!isLoading && exams.map((exam) => (
                    <li key={`mobile-${exam.id}`} className="lg:hidden">
                      <Link
                        href={getExamLandingUrl(exam.id)}
                        className="text-muted-foreground hover:text-accent-foreground flex items-center gap-2 duration-150 py-2"
                        onClick={() => setMenuState(false)}
                      >
                        <span className="text-lg">{getExamIcon(exam.id)}</span>
                        <span>{exam.name.split(' ')[0]}</span>
                      </Link>
                    </li>
                  ))}

                  {/* Regular Menu Items */}
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150 py-2"
                        onClick={() => setMenuState(false)}
                      >
                        <span>{item.name}</span>
                      </Link>
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
                            setUserDropdownOpen(false);
                            await handleLogout();
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

        {/* Desktop Animated Mega Dropdown */}
        <AnimatePresence>
          {isDropdownOpen && activeExamIndex !== null && exams[activeExamIndex] && (
            <motion.div
              key="mega-dropdown-container"
              className="hidden lg:block absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-xl border-t border-gray-200 dark:border-gray-700"
              initial="closed"
              animate="open"
              exit="closed"
              variants={containerVariants}
              transition={{ duration: 0.3 }}
              onMouseEnter={() => {
                if (closeTimeoutRef.current !== null)
                  clearTimeout(closeTimeoutRef.current);
              }}
              onMouseLeave={closeDropdown}
              onAnimationComplete={handleDropdownTransitionEnd}
              ref={dropdownRef}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`mega-dropdown-content-${activeExamIndex}`}
                  variants={contentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                  className="max-w-6xl mx-auto px-6 py-4"
                >
                  {/* Header */}
                  <div className="mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <Link
                      href={getExamLandingUrl(exams[activeExamIndex].id)}
                      className="inline-flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100 hover:text-accent-foreground transition-colors group"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="text-lg">
                        {getExamIcon(exams[activeExamIndex].id)}
                      </span>
                      <span className="group-hover:text-accent-foreground">
                        {exams[activeExamIndex].displayName}
                      </span>
                      <ChevronDown className="w-4 h-4 -rotate-90 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Sections Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {exams[activeExamIndex].sections.map((section) => (
                      <div key={section.id} className="space-y-2">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-gray-100 dark:border-gray-800">
                          {getSectionIcon(section.name)}
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {section.displayName}
                          </h3>
                        </div>
                        <ul className="space-y-1">
                          {section.questionTypes.map((questionType) => (
                            <li key={questionType.id}>
                              <Link
                                href={getQuestionTypeNavUrl(
                                  exams[activeExamIndex].id,
                                  questionType.id
                                )}
                                className="block px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <div className="text-xs font-medium text-gray-900 dark:text-gray-100 group-hover:text-accent-foreground">
                                  {questionType.displayName}
                                </div>
                                <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                                  {questionType.description}
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <Link
                      href={getExamLandingUrl(exams[activeExamIndex].id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-foreground hover:text-accent-foreground/80 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Start {exams[activeExamIndex].displayName} Practice
                      <ChevronDown className="w-3 h-3 -rotate-90" />
                    </Link>
                    <Link
                      href="/exams"
                      className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      View All Exams →
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default EnhancedHeaderDynamic;
