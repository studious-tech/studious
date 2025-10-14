const config = {
  appName: 'Studious - AI-Powered Learning & Exam Preparation Platform',
  appDescription:
    'Comprehensive AI-powered online learning platform for PTE, IELTS, UCT, medical entrance tests, and more. Practice with realistic simulations, get instant feedback, and achieve your academic goals.',
  domainName:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://studious.vercel.app',
};

export default config;
