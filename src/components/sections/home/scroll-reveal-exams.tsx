'use client';
import React, { FC, RefObject, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useScroll,
  MotionValue,
} from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Play, Pause } from 'lucide-react';
import { MacbookPro } from '@/components/ui/macbook-pro';
import { Iphone15Pro } from '@/components/ui/iphone-15-pro';
import { Safari } from '@/components/ui/safari';
import Link from 'next/link';

type Section = {
  title: string;
  description: string;
  accent?: string;
  mainImage: string;
};

function useParallaxTransform(ref: RefObject<HTMLElement>) {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const translateY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  return { translateY };
}

const VideoComponent: FC<{ src: string; className?: string }> = ({
  src,
  className,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);

  return (
    <div
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <img
        src={src}
        alt="Video thumbnail"
        className="w-full h-full object-cover"
      />

      {showControls && (
        <motion.div
          className="absolute inset-0 bg-black/20 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 " />
            ) : (
              <Play className="w-6  ml-1" />
            )}
          </button>
        </motion.div>
      )}

      {isPlaying && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/20 rounded-full h-1">
            <motion.div
              className="bg-white rounded-full h-1"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 10, ease: 'linear' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// IELTS Exam Components
const IELTSBeforeInView: FC = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto h-[200px] md:h-[240px] flex items-center justify-center">
      {/* Wide background card */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[130px] bg-gray-100 rounded-2xl" />

      {/* Subtle accent background */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-[110px] rounded-xl opacity-5 bg-blue-100" />

      {/* Main central image */}
      <div className="relative z-10">
        <MacbookPro
          className="w-[300px] h-[180px] md:w-[350px] md:h-[200px]"
          src="https://framerusercontent.com/images/RNGjWSxLjuHAKDSuKnc5a3DRXUY.png?scale-down-to=1024"
        />
      </div>
    </div>
  );
};

const IELTSInView: FC = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto h-[200px] md:h-[240px] flex items-center justify-center">
      {/* Wide background card */}
      <motion.div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[130px] bg-blue-500 rounded-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'backOut' }}
      />

      {/* Main central image - enhanced */}
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1.1, y: -5 }}
          transition={{ duration: 0.4, ease: 'backOut' }}
        >
          <MacbookPro
            className="w-[300px] h-[180px] md:w-[350px] md:h-[200px]"
            src="https://framerusercontent.com/images/RNGjWSxLjuHAKDSuKnc5a3DRXUY.png?scale-down-to=1024"
          />
        </motion.div>
      </div>

      {/* Supporting components */}
      <div className="absolute inset-0">
        {/* IELTS Mobile App */}
        <motion.div
          className="absolute -left-8 -top-6 md:-left-12 md:-top-8 z-[2]"
          initial={{ opacity: 0, scale: 0, rotate: -45 }}
          animate={{ opacity: 1, scale: 0.7, rotate: -8 }}
          transition={{
            duration: 0.4,
            ease: 'backOut',
            delay: 0.1,
          }}
        >
          <div className="w-[120px] h-[240px] md:w-[160px] md:h-[320px] bg-gray-900 rounded-[24px] md:rounded-[32px] p-2 md:p-3 shadow-2xl z-10">
            <div className="w-full h-full bg-white rounded-[20px] md:rounded-[28px] overflow-hidden relative">
              <img
                src="https://framerusercontent.com/images/MLTilchdLHA21Cn23atqm54qtdQ.png"
                alt="IELTS Mobile App"
                className="w-full h-full object-cover"
              />
              {/* Phone UI overlay */}
            </div>
          </div>
        </motion.div>

        {/* IELTS Speaking Practice */}
        <motion.div
          className="absolute -right-8 top-0 md:-right-12 md:-top-2 w-[160px] h-[120px] md:w-[180px] md:h-[130px] z-[1]"
          initial={{ opacity: 0, scale: 0, rotate: 45 }}
          animate={{ opacity: 1, scale: 0.7, rotate: 8 }}
          transition={{
            duration: 0.3,
            ease: 'backOut',
            delay: 0.15,
          }}
        >
          <div className="w-full h-full bg-white rounded-lg shadow-lg border border-blue-100 p-2 md:p-3 overflow-hidden">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <h3 className="text-[10px] md:text-xs font-bold text-blue-900">
                Speaking Practice
              </h3>
              <div className="w-3  md:w-4 md: bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white text-[6px] md:text-[8px] font-bold">
                  🎤
                </span>
              </div>
            </div>
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center space-x-1 md:space-x-2">
                <div className="w-6  md:w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <div className="w-3  md:w-4  rounded-full bg-blue-500 animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <div className="h-1 md:h-2 bg-blue-200 rounded-full w-full mb-1"></div>
                  <div className="h-1 md:h-2 bg-blue-200 rounded-full w-3/4"></div>
                </div>
              </div>
              <div className="flex justify-between text-[8px] md:text-[10px] text-gray-600">
                <span>Part 1: Introduction</span>
                <span className="font-bold text-blue-900">7.5/9</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* IELTS Writing Feedback */}
        <motion.div
          className="absolute -right-4 bottom-0 md:-right-6 md:bottom-2 w-[130px] h-[70px] md:w-[150px] md:h-[80px] z-[3]"
          initial={{ opacity: 0, scale: 0, rotate: -45 }}
          animate={{ opacity: 1, scale: 0.65, rotate: -6 }}
          transition={{
            duration: 0.35,
            ease: 'backOut',
            delay: 0.2,
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md border border-blue-200 p-1.5 md:p-2 overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[8px] md:text-[10px] font-bold text-blue-900">
                Writing Feedback
              </h4>
              <span className="text-[8px] md:text-[10px] text-blue-600 font-bold">
                NEW
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full"></div>
                <span className="text-[7px] md:text-[8px] text-blue-700">
                  Task Achievement
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-[7px] md:text-[8px] text-blue-700">
                  Coherence
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full"></div>
                <span className="text-[7px] md:text-[8px] text-blue-700">
                  Grammar
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// PTE Exam Components
const PTEBeforeInView: FC = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto h-[200px] md:h-[240px] flex items-center justify-center">
      {/* Wide background card */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[130px] bg-gray-100 rounded-2xl" />

      {/* Subtle accent background */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-[110px] rounded-xl opacity-5 bg-emerald-100" />

      {/* Main central image */}
      <div className="relative z-10">
        <Safari
          className="w-[300px] h-[180px] md:w-[350px] md:h-[200px] "
          imageSrc="https://framerusercontent.com/images/RNGjWSxLjuHAKDSuKnc5a3DRXUY.png?scale-down-to=1024"
        />
      </div>
    </div>
  );
};

const PTEInView: FC = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto h-[200px] md:h-[240px] flex items-center justify-center">
      {/* Wide background card */}
      <motion.div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[130px] bg-emerald-500 rounded-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'backOut' }}
      />

      {/* Main central image - enhanced */}
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1.1, y: -5 }}
          transition={{ duration: 0.4, ease: 'backOut' }}
        >
          <Safari
            className="w-[300px] h-[180px] md:w-[350px] md:h-[200px]"
            imageSrc="https://framerusercontent.com/images/RNGjWSxLjuHAKDSuKnc5a3DRXUY.png?scale-down-to=1024"
          />
        </motion.div>
      </div>

      {/* Supporting components */}
      <div className="absolute inset-0">
        {/* PTE Describe Image Task */}
        <motion.div
          className="absolute -left-8 -top-6 md:-left-12 md:-top-8 z-[2]"
          initial={{ opacity: 0, scale: 0, rotate: -45 }}
          animate={{ opacity: 1, scale: 0.7, rotate: -8 }}
          transition={{
            duration: 0.4,
            ease: 'backOut',
            delay: 0.1,
          }}
        >
          <div className="w-[150px] h-[120px] md:w-[180px] md:h-[140px] bg-white rounded-lg shadow-xl border-2 border-emerald-500 p-2 md:p-3 overflow-hidden">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <h3 className="text-[10px] md:text-xs font-bold text-emerald-900">
                Describe Image
              </h3>
              <div className="w-4  md:w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[8px] md:text-[10px] font-bold">
                  45s
                </span>
              </div>
            </div>
            <div className="flex space-x-1 md:space-x-2">
              <div className="w-12 md:w-16 h-16 bg-emerald-100 rounded border-2 border-dashed border-emerald-300 flex items-center justify-center">
                <span className="text-emerald-500 text-[8px] md:text-[10px]">
                  Chart
                </span>
              </div>
              <div className="flex-1">
                <div className="h-1 md:h-2 bg-emerald-200 rounded-full w-full mb-1"></div>
                <div className="h-1 md:h-2 bg-emerald-200 rounded-full w-3/4 mb-1"></div>
                <div className="h-1 md:h-2 bg-emerald-200 rounded-full w-1/2"></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* PTE Automated Scoring */}
        <motion.div
          className="absolute -right-8 top-0 md:-right-12 md:-top-2 w-[160px] h-[110px] md:w-[180px] md:h-[120px] z-[10]"
          initial={{ opacity: 0, scale: 0, rotate: 45 }}
          animate={{ opacity: 1, scale: 0.7, rotate: 8 }}
          transition={{
            duration: 0.3,
            ease: 'backOut',
            delay: 0.15,
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg shadow-lg border-2 border-emerald-200 p-2 md:p-3 overflow-hidden">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <h3 className="text-[10px] md:text-xs font-bold text-emerald-900">
                AI Scoring
              </h3>
              <div className="w-3  md:w-4  bg-emerald-500 rounded flex items-center justify-center">
                <span className="text-white text-[6px] md:text-[8px] font-bold">
                  🤖
                </span>
              </div>
            </div>
            <div className="space-y-1 md:space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[8px] md:text-[10px] text-emerald-700">
                  Fluency
                </span>
                <div className="flex space-x-0.5 md:space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div
                      key={star}
                      className={`w-1 h-1 md:w-2 md:h-2 rounded-full ${
                        star <= 4 ? 'bg-emerald-500' : 'bg-emerald-200'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[8px] md:text-[10px] text-emerald-700">
                  Pronunciation
                </span>
                <div className="flex space-x-0.5 md:space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div
                      key={star}
                      className={`w-1 h-1 md:w-2 md:h-2 rounded-full ${
                        star <= 5 ? 'bg-emerald-500' : 'bg-emerald-200'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* PTE Practice Stats */}
        <motion.div
          className="absolute -right-4 bottom-0 md:-right-6 md:bottom-2 w-[140px] h-[80px] md:w-[160px] md:h-[90px] z-[10]"
          initial={{ opacity: 0, scale: 0, rotate: -45 }}
          animate={{ opacity: 1, scale: 0.65, rotate: -6 }}
          transition={{
            duration: 0.35,
            ease: 'backOut',
            delay: 0.2,
          }}
        >
          <div className="w-full h-full bg-white rounded-lg shadow-md border border-emerald-200 p-1.5 md:p-2 overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[8px] md:text-[10px] font-bold text-emerald-900">
                Weekly Stats
              </h4>
              <span className="text-[8px] md:text-[10px] text-emerald-600 font-bold">
                ↑12%
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[7px] md:text-[9px]">
                <span className="text-emerald-700">Practice Time</span>
                <span className="font-bold text-emerald-900">4.2h</span>
              </div>
              <div className="flex justify-between text-[7px] md:text-[9px]">
                <span className="text-emerald-700">Tasks Completed</span>
                <span className="font-bold text-emerald-900">24</span>
              </div>
              <div className="flex justify-between text-[7px] md:text-[9px]">
                <span className="text-emerald-700">Accuracy</span>
                <span className="font-bold text-emerald-900">84%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// UCAT Exam Components
const UCATBeforeInView: FC = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto h-[200px] md:h-[240px] flex items-center justify-center">
      {/* Wide background card */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[130px] bg-gray-100 rounded-2xl" />

      {/* Subtle accent background */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-[110px] rounded-xl opacity-5 bg-amber-100" />

      {/* Main central image */}
      <div className="relative z-10">
        <MacbookPro
          className="w-[300px] h-[180px] md:w-[350px] md:h-[200px]"
          src="https://framerusercontent.com/images/TW98hAtElvqCJ2Geps2OUJq0E.png?scale-down-to=1024"
        />
      </div>
    </div>
  );
};

const UCATInView: FC = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto h-[200px] md:h-[240px] flex items-center justify-center">
      {/* Wide background card */}
      <motion.div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[130px] bg-amber-500 rounded-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'backOut' }}
      />

      {/* Main central image - enhanced */}
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1.1, y: -5 }}
          transition={{ duration: 0.4, ease: 'backOut' }}
        >
          <MacbookPro
            className="w-[300px] h-[180px] md:w-[350px] md:h-[200px]"
            src="https://framerusercontent.com/images/TW98hAtElvqCJ2Geps2OUJq0E.png?scale-down-to=1024"
          />
        </motion.div>
      </div>

      {/* Supporting components */}
      <div className="absolute inset-0">
        {/* UCAT Abstract Reasoning Practice */}
        <motion.div
          className="absolute -left-8 -top-6 md:-left-12 md:-top-8 z-[2]"
          initial={{ opacity: 0, scale: 0, rotate: -45 }}
          animate={{ opacity: 1, scale: 0.7, rotate: -8 }}
          transition={{
            duration: 0.4,
            ease: 'backOut',
            delay: 0.1,
          }}
        >
          <div className="w-[150px] h-[130px] md:w-[250px] md:h-[200px] bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg shadow-2xl border-2 border-amber-300 p-2 md:p-3 overflow-hidden">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <h3 className="text-[10px] md:text-xs font-bold text-amber-900">
                Abstract Reasoning
              </h3>
              <div className="w-4  md:w-5  bg-amber-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[8px] md:text-[10px] font-bold">
                  ?
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1 md:gap-2">
              <div className="w-10 h-10 md:w-12 bg-white rounded border-2 border-amber-400 flex items-center justify-center">
                <div className="w-5 h-5 md:w-6  bg-amber-500 rounded-full"></div>
              </div>
              <div className="w-10 h-10 md:w-12 bg-white rounded border-2 border-amber-400 flex items-center justify-center">
                <div className="w-5 h-5 md:w-6  bg-amber-200 rounded-full"></div>
              </div>
              <div className="w-10 h-10 md:w-12 bg-white rounded border-2 border-amber-400 flex items-center justify-center">
                <div className="w-5 h-5 md:w-6  bg-amber-500 rounded-full"></div>
              </div>
              <div className="w-10 h-10 md:w-12 bg-amber-200 rounded border-2 border-amber-400 flex items-center justify-center">
                <div className="w-5 h-5 md:w-6  bg-white rounded-full"></div>
              </div>
            </div>
            <div className="mt-1 md:mt-2 flex space-x-1 md:space-x-2">
              <div className="w-5 h-5 md:w-6  bg-amber-500 rounded flex items-center justify-center">
                <span className="text-white text-[8px] md:text-[10px] font-bold">
                  A
                </span>
              </div>
              <div className="w-5 h-5 md:w-6  bg-amber-200 rounded flex items-center justify-center">
                <span className="text-amber-800 text-[8px] md:text-[10px] font-bold">
                  B
                </span>
              </div>
              <div className="w-5 h-5 md:w-6  bg-amber-200 rounded flex items-center justify-center">
                <span className="text-amber-800 text-[8px] md:text-[10px] font-bold">
                  C
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* UCAT Decision Making Scenario */}
        <motion.div
          className="absolute -right-8 top-0 md:-right-12 md:-top-2 w-[160px] h-[120px] md:w-[180px] md:h-[130px] z-[1]"
          initial={{ opacity: 0, scale: 0, rotate: 45 }}
          animate={{ opacity: 1, scale: 0.7, rotate: 8 }}
          transition={{
            duration: 0.3,
            ease: 'backOut',
            delay: 0.15,
          }}
        >
          <div className="w-full h-full bg-white rounded-lg shadow-lg border border-amber-200 p-2 md:p-3 overflow-hidden">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <h3 className="text-[10px] md:text-xs font-bold text-amber-900">
                Decision Making
              </h3>
              <div className="w-3  md:w-4  bg-amber-500 rounded flex items-center justify-center">
                <span className="text-white text-[6px] md:text-[8px] font-bold">
                  ⚖️
                </span>
              </div>
            </div>
            <div className="space-y-1 md:space-y-2">
              <div className="text-[8px] md:text-[10px] text-gray-700">
                A factory produces 240 units per hour. If it operates 16 hours a
                day...
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 md:w-3  rounded-full bg-amber-200 border border-amber-400"></div>
                <span className="text-[7px] md:text-[9px] text-amber-700">
                  1200 units
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 md:w-3  rounded-full bg-amber-500 border border-amber-600"></div>
                <span className="text-[7px] md:text-[9px] text-amber-900 font-bold">
                  3840 units
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* UCAT Timing Strategy */}
        <motion.div
          className="absolute -right-4 bottom-0 md:-right-6 md:bottom-2 w-[140px] h-[80px] md:w-[160px] md:h-[90px] z-[3]"
          initial={{ opacity: 0, scale: 0, rotate: -45 }}
          animate={{ opacity: 1, scale: 0.65, rotate: -6 }}
          transition={{
            duration: 0.35,
            ease: 'backOut',
            delay: 0.2,
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg shadow-md border-2 border-amber-300 p-1.5 md:p-2 overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[8px] md:text-[10px] font-bold text-amber-900">
                Time Strategy
              </h4>
              <span className="text-[8px] md:text-[10px] text-amber-600 font-bold">
                ⏱️
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[7px] md:text-[9px]">
                <span className="text-amber-700">VR</span>
                <span className="font-bold text-amber-900">30s/q</span>
              </div>
              <div className="flex justify-between text-[7px] md:text-[9px]">
                <span className="text-amber-700">DM</span>
                <span className="font-bold text-amber-900">60s/q</span>
              </div>
              <div className="flex justify-between text-[7px] md:text-[9px]">
                <span className="text-amber-700">QR</span>
                <span className="font-bold text-amber-900">45s/q</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Individual Exam Media Components
const IELTSMedia: FC = () => {
  const { ref, inView } = useInView({
    threshold: 0.6,
    triggerOnce: false,
    rootMargin: '-30% 0px -30% 0px',
  });

  return (
    <div ref={ref}>{inView ? <IELTSInView /> : <IELTSBeforeInView />}</div>
  );
};

const PTEMedia: FC = () => {
  const { ref, inView } = useInView({
    threshold: 0.6,
    triggerOnce: false,
    rootMargin: '-30% 0px -30% 0px',
  });

  return <div ref={ref}>{inView ? <PTEInView /> : <PTEBeforeInView />}</div>;
};

const UCATMedia: FC = () => {
  const { ref, inView } = useInView({
    threshold: 0.6,
    triggerOnce: false,
    rootMargin: '-30% 0px -30% 0px',
  });

  return <div ref={ref}>{inView ? <UCATInView /> : <UCATBeforeInView />}</div>;
};

const RevealSection: FC<{ section: Section; reverse?: boolean }> = ({
  section,
  reverse = false,
}) => {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: false,
    rootMargin: '-10% 0px -10% 0px',
  });
  const containerRef = useRef<HTMLElement>(null!);
  const { translateY } = useParallaxTransform(containerRef);

  return (
    <section ref={containerRef} className="relative py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div
          ref={ref}
          className={`flex flex-col lg:flex-row items-center gap-12 ${
            reverse ? 'lg:flex-row-reverse' : ''
          }`}
        >
          {/* Text Content */}
          <div className="flex-1 max-w-md">
            <motion.h3
              className="text-4xl md:text-5xl font-bold mb-6 text-gray-900"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 10 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              {section.title}
            </motion.h3>

            <motion.p
              className="text-gray-600 mb-8 text-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 5 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {section.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 5 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link
                href={
                  section.title === 'IELTS'
                    ? '/ielts-academic'
                    : section.title === 'PTE'
                    ? '/pte-academic'
                    : '/exams/ucat'
                }
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-gray-900 text-white hover:bg-gray-800"
              >
                {section.title === 'IELTS' ? 'Explore IELTS Academic' : section.title === 'PTE' ? 'Explore PTE Academic' : 'View UCAT course'}
              </Link>
            </motion.div>
          </div>

          {/* Media Showcase */}
          <div className="flex-[1.5] w-full">
            <motion.div style={{ y: translateY as MotionValue<number> }}>
              {section.title === 'IELTS' && <IELTSMedia />}
              {section.title === 'PTE' && <PTEMedia />}
              {section.title === 'UCAT' && <UCATMedia />}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Section separator */}
      <div className="max-w-4xl mx-auto px-6 pt-12">
        <hr className="border-gray-200" />
      </div>
    </section>
  );
};

// Individual Exam Section Components
const IELTSSection: FC = () => {
  const section: Section = {
    title: 'IELTS',
    description:
      'Master the International English Language Testing System with our comprehensive preparation platform. Practice all four skills with expert feedback and achieve your target band score of 7.0 or higher.',
    accent: '#3b82f6',
    mainImage:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
  };

  return <RevealSection section={section} reverse={false} />;
};

const PTESection: FC = () => {
  const section: Section = {
    title: 'PTE',
    description:
      'Excel in the Pearson Test of English with our AI-powered preparation tools. Practice with real exam simulations and get instant automated scoring feedback to achieve your target score.',
    accent: '#10b981',
    mainImage:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
  };

  return <RevealSection section={section} reverse={true} />;
};

const UCATSection: FC = () => {
  const section: Section = {
    title: 'UCAT',
    description:
      'Prepare for the University Clinical Aptitude Test with our comprehensive question bank. Master all five sections with detailed explanations and performance analytics to secure your medical school admission.',
    accent: '#f59e0b',
    mainImage:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
  };

  return <RevealSection section={section} reverse={false} />;
};

const ScrollRevealExams: FC = () => {
  return (
    <div className="bg-white" id="exams">
      <div className="max-w-5xl mx-auto py-12 px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Comprehensive Exam Preparation
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Master IELTS, PTE Academic, and UCAT with our proven preparation
            platform.
          </p>
        </motion.div>

        <div className="space-y-6">
          <IELTSSection />
          <PTESection />
          <UCATSection />
        </div>
      </div>
    </div>
  );
};

export default ScrollRevealExams;
