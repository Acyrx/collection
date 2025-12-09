"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Beaker,
  Calculator,
  BookOpen,
  Scroll,
  Palette,
  Sparkles,
} from "lucide-react";

const subjects = [
  {
    value: "all",
    label: "All",
    icon: Sparkles,
    color: "from-violet-500 to-purple-600",
    bgEmoji: "✨",
  },
  {
    value: "science",
    label: "Science",
    icon: Beaker,
    color: "from-cyan-500 to-blue-600",
    bgEmoji: "🧪",
  },
  {
    value: "math",
    label: "Math",
    icon: Calculator,
    color: "from-emerald-500 to-teal-600",
    bgEmoji: "📐",
  },
  {
    value: "language",
    label: "Language",
    icon: BookOpen,
    color: "from-indigo-500 to-purple-600",
    bgEmoji: "📚",
  },
  {
    value: "history",
    label: "History",
    icon: Scroll,
    color: "from-amber-500 to-orange-600",
    bgEmoji: "📜",
  },
  {
    value: "arts",
    label: "Arts",
    icon: Palette,
    color: "from-pink-500 to-rose-600",
    bgEmoji: "🎨",
  },
];

interface SubjectFilterProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function SubjectFilter({
  activeFilter,
  onFilterChange,
}: SubjectFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {subjects.map((subject) => {
        const Icon = subject.icon;
        const isActive =
          activeFilter.toLowerCase() === subject.value.toLowerCase();

        return (
          <motion.button
            key={subject.value}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onFilterChange(subject.value)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 overflow-hidden",
              isActive
                ? `bg-gradient-to-r ${subject.color} text-white shadow-lg`
                : "bg-secondary/50 text-secondary-foreground hover:bg-secondary border border-border hover:border-primary/30"
            )}
          >
            {/* Background emoji when active */}
            {isActive && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.15 }}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-2xl"
              >
                {subject.bgEmoji}
              </motion.span>
            )}

            <Icon
              className={cn(
                "w-4 h-4 relative z-10",
                isActive ? "text-white" : "text-muted-foreground"
              )}
            />
            <span className="relative z-10">{subject.label}</span>

            {/* Active indicator dot */}
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
