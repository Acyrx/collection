"use client";
import React, { useState } from "react";
import { Search, Sparkles, Book, Layers, Zap } from "lucide-react";
import { Button } from "./Button";
import { Difficulty } from "@/types/course";

interface SearchHeroProps {
  onSearch: (query: string, difficulty: Difficulty) => void;
  isSearching: boolean;
  statusMessage: string;
}

export const SearchHero: React.FC<SearchHeroProps> = ({
  onSearch,
  isSearching,
  statusMessage,
}) => {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Beginner");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, difficulty);
    }
  };

  return (
    <div className="relative overflow-hidden bg-white pb-16 sm:pb-24">
      {/* Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-50 to-white -z-10" />
      <div className="absolute top-0 right-0 p-12 opacity-10">
        <svg
          width="200"
          height="200"
          viewBox="0 0 100 100"
          className="text-indigo-600 fill-current"
        >
          <circle cx="50" cy="50" r="40" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 text-center">
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Curriculum Engine
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          Learn anything. <br className="hidden sm:block" />
          <span className="text-indigo-600">
            We'll build the course for you.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10">
          Search for a topic. If a course exists, we show it. If not, our AI
          creates a complete, personalized curriculum in seconds.
        </p>

        {/* Search Box */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
            <div className="relative flex flex-col sm:flex-row bg-white rounded-xl shadow-xl p-2 sm:p-3 border border-slate-100">
              <div className="flex-grow flex items-center px-3 mb-2 sm:mb-0">
                <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Quantum Physics, React 18, Pottery..."
                  className="w-full text-lg text-slate-900 placeholder-slate-400 border-none outline-none focus:ring-0 bg-transparent"
                  disabled={isSearching}
                />
              </div>

              <div className="flex items-center space-x-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-3">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="text-sm font-medium text-slate-600 bg-slate-50 border-none rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 cursor-pointer outline-none hover:bg-slate-100 transition-colors"
                  disabled={isSearching}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <Button
                  type="submit"
                  size="lg"
                  isLoading={isSearching}
                  className="w-full sm:w-auto min-w-[120px]"
                >
                  Generate
                </Button>
              </div>
            </div>
          </form>

          {/* Searching / Generating Status */}
          {isSearching && (
            <div className="mt-6 flex flex-col items-center justify-center space-y-3 animate-pulse">
              <div className="flex items-center space-x-2 text-indigo-600 font-medium">
                <Zap className="w-5 h-5" />
                <span>{statusMessage}</span>
              </div>
              <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full w-1/2 animate-[shimmer_1.5s_infinite]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Feature Pills */}
        <div className="mt-12 flex justify-center flex-wrap gap-4 text-sm font-medium text-slate-500">
          <div className="flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">
            <Layers className="w-4 h-4 mr-2 text-indigo-500" />
            Structured Modules
          </div>
          <div className="flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">
            <Book className="w-4 h-4 mr-2 text-pink-500" />
            Adaptive Difficulty
          </div>
          <div className="flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">
            <Sparkles className="w-4 h-4 mr-2 text-amber-500" />
            Instant Generation
          </div>
        </div>
      </div>
    </div>
  );
};
