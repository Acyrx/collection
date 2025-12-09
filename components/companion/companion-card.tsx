"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Bookmark,
  Play,
  Trash2,
  MoreVertical,
  Beaker,
  Calculator,
  BookOpen,
  Palette,
  Scroll,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {
  toggleBookmark,
  addToSessionHistory,
} from "@/lib/actions/companion.actions";
import { toast } from "sonner";

interface CompanionCardProps {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  color: string;
  bookmarked: boolean;
  onDelete?: () => void;
}

const subjectConfig: Record<
  string,
  {
    bg: string;
    text: string;
    accent: string;
    icon: typeof Beaker;
    bgEmoji: string;
  }
> = {
  science: {
    bg: "from-cyan-500 to-blue-600",
    text: "text-cyan-600 dark:text-cyan-400",
    accent: "bg-cyan-500",
    icon: Beaker,
    bgEmoji: "🧪",
  },
  math: {
    bg: "from-emerald-500 to-teal-600",
    text: "text-emerald-600 dark:text-emerald-400",
    accent: "bg-emerald-500",
    icon: Calculator,
    bgEmoji: "📐",
  },
  language: {
    bg: "from-indigo-500 to-purple-600",
    text: "text-indigo-600 dark:text-indigo-400",
    accent: "bg-indigo-500",
    icon: BookOpen,
    bgEmoji: "📚",
  },
  history: {
    bg: "from-amber-500 to-orange-600",
    text: "text-amber-600 dark:text-amber-400",
    accent: "bg-amber-500",
    icon: Scroll,
    bgEmoji: "📜",
  },
  arts: {
    bg: "from-pink-500 to-rose-600",
    text: "text-pink-600 dark:text-pink-400",
    accent: "bg-pink-500",
    icon: Palette,
    bgEmoji: "🎨",
  },
};

const getSubjectConfig = (subject: string) => {
  return subjectConfig[subject.toLowerCase()] || subjectConfig.science;
};

const CompanionCard = ({
  id,
  name,
  topic,
  subject,
  duration,
  color,
  bookmarked,
  onDelete,
}: CompanionCardProps) => {
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  const [isHovered, setIsHovered] = useState(false);
  const [isPending, startTransition] = useTransition();
  const config = getSubjectConfig(subject);
  const SubjectIcon = config.icon;

  const handleBookmark = () => {
    startTransition(async () => {
      try {
        await toggleBookmark(id, isBookmarked);
        setIsBookmarked(!isBookmarked);
      } catch (error) {
        toast.error("Failed to update bookmark");
      }
    });
  };

  const handleLaunch = () => {
    startTransition(async () => {
      try {
        await addToSessionHistory(id);
      } catch (error) {
        console.error("Failed to add to session history");
      }
    });
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
    >
      <div className={cn("relative h-32 bg-gradient-to-br", config.bg)}>
        {/* Subject emoji background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={
              isHovered ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }
            }
            transition={{ type: "spring", stiffness: 200 }}
            className="absolute top-2 right-8 text-4xl opacity-20"
          >
            {config.bgEmoji}
          </motion.div>
          <motion.div
            animate={
              isHovered ? { scale: 1.1, rotate: -5 } : { scale: 1, rotate: 0 }
            }
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="absolute bottom-6 left-2 text-2xl opacity-15"
          >
            {config.bgEmoji}
          </motion.div>
          <motion.div
            animate={isHovered ? { y: -5, x: 5 } : { y: 0, x: 0 }}
            className="absolute top-1/2 right-1/4 text-xl opacity-10"
          >
            {config.bgEmoji}
          </motion.div>
        </div>

        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-15">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <pattern
              id={`pattern-${id}`}
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="10" cy="10" r="1" fill="white" />
            </pattern>
            <rect
              x="0"
              y="0"
              width="100"
              height="100"
              fill={`url(#pattern-${id})`}
            />
          </svg>
        </div>

        {/* Floating Icon with subject-specific icon */}
        <motion.div
          animate={isHovered ? { y: -5, rotate: 5 } : { y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-16 h-16 rounded-2xl bg-card border-4 border-card shadow-lg flex items-center justify-center overflow-hidden"
        >
          <div
            className={cn(
              "absolute inset-0 opacity-15 bg-gradient-to-br",
              config.bg
            )}
          />
          <SubjectIcon className={cn("w-7 h-7 relative z-10", config.text)} />
        </motion.div>

        {/* Actions */}
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleBookmark}
            disabled={isPending}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <Bookmark
              className={cn(
                "w-4 h-4 transition-all",
                isBookmarked ? "fill-white text-white" : "text-white"
              )}
            />
          </motion.button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-white" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Subject Badge */}
        <Badge className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white border-0 hover:bg-white/30 capitalize">
          {subject}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-5 pt-12">
        <h3 className="font-semibold text-lg text-card-foreground text-center mb-2 line-clamp-1">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground text-center line-clamp-2 mb-4 min-h-[2.5rem]">
          {topic}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{duration} min</span>
          </div>
        </div>

        <Link
          href={`/companion/${id}`}
          onClick={handleLaunch}
          className="block"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 bg-gradient-to-r transition-all duration-300 shadow-lg",
              config.bg,
              "hover:shadow-xl hover:shadow-primary/20"
            )}
          >
            <Play className="w-4 h-4" />
            Launch Session
          </motion.button>
        </Link>
      </div>

      {/* Hover Glow Effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        className={cn(
          "absolute inset-0 rounded-2xl pointer-events-none",
          "bg-gradient-to-t from-primary/5 via-transparent to-transparent"
        )}
      />
    </motion.article>
  );
};

export default CompanionCard;
