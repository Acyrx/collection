export const subjects = [
    "maths",
    "language",
    "science",
    "history",
    "coding",
    "economics",
  ];
  
  export const subjectsColors = {
    science: "#E5D0FF",
    maths: "#FFDA6E",
    language: "#BDE7FF",
    coding: "#FFC8E4",
    history: "#FFECC8",
    economics: "#C8FFDF",
  };
  
  export const voices = {
    male: { casual: "2BJW5coyhAzSr8STdHbE", formal: "c6SfcYrb2t09NHXiT80T" },
    female: { casual: "ZIlrSGI4jZqobxRKprJz", formal: "sarah" },
  };
  
  export const recentSessions = [
    {
      id: "1",
      subject: "science",
      name: "Neura the Brainy Explorer",
      topic: "Neural Network of the Brain",
      duration: 45,
      color: "#E5D0FF",
    },
    {
      id: "2",
      subject: "maths",
      name: "Countsy the Number Wizard",
      topic: "Derivatives & Integrals",
      duration: 30,
      color: "#FFDA6E",
    },
    {
      id: "3",
      subject: "language",
      name: "Verba the Vocabulary Builder",
      topic: "English Literature",
      duration: 30,
      color: "#BDE7FF",
    },
    {
      id: "4",
      subject: "coding",
      name: "Codey the Logic Hacker",
      topic: "Intro to If-Else Statements",
      duration: 45,
      color: "#FFC8E4",
    },
    {
      id: "5",
      subject: "history",
      name: "Memo, the Memory Keeper",
      topic: "World Wars: Causes & Consequences",
      duration: 15,
      color: "#FFECC8",
    },
    {
      id: "6",
      subject: "economics",
      name: "The Market Maestro",
      topic: "The Basics of Supply & Demand",
      duration: 10,
      color: "#C8FFDF",
    },
  ];
  

  // src/lib/constants.ts
export const SUBJECT_COLORS = {
  math: {
    bg: 'bg-blue-500',
    text: 'text-blue-500',
    border: 'border-blue-500',
    icon: '/icons/math.svg',
    gradient: 'from-blue-500 to-blue-600'
  },
  science: {
    bg: 'bg-green-500',
    text: 'text-green-500',
    border: 'border-green-500',
    icon: '/icons/science.svg',
    gradient: 'from-green-500 to-green-600'
  },
  history: {
    bg: 'bg-amber-500',
    text: 'text-amber-500',
    border: 'border-amber-500',
    icon: '/icons/history.svg',
    gradient: 'from-amber-500 to-amber-600'
  },
  english: {
    bg: 'bg-purple-500',
    text: 'text-purple-500',
    border: 'border-purple-500',
    icon: '/icons/english.svg',
    gradient: 'from-purple-500 to-purple-600'
  },
  coding: {
    bg: 'bg-indigo-500',
    text: 'text-indigo-500',
    border: 'border-indigo-500',
    icon: '/icons/coding.svg',
    gradient: 'from-indigo-500 to-indigo-600'
  },
  art: {
    bg: 'bg-pink-500',
    text: 'text-pink-500',
    border: 'border-pink-500',
    icon: '/icons/art.svg',
    gradient: 'from-pink-500 to-pink-600'
  },
  music: {
    bg: 'bg-red-500',
    text: 'text-red-500',
    border: 'border-red-500',
    icon: '/icons/music.svg',
    gradient: 'from-red-500 to-red-600'
  },
  default: {
    bg: 'bg-gray-500',
    text: 'text-gray-500',
    border: 'border-gray-500',
    icon: '/icons/default.svg',
    gradient: 'from-gray-500 to-gray-600'
  }
} as const;

export type Subject = keyof typeof SUBJECT_COLORS;

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'title-desc', label: 'Title (Z-A)' },
  { value: 'subject', label: 'By Subject' }
] as const;