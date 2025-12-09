"use client";

import { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, Moon, Sun, BookOpen, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import CompanionForm from "./companion-form";
import CompanionCard from "./companion-card";
import SubjectFilter from "./subject-filter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteCompanion } from "@/lib/actions/companion.actions";
import { toast } from "sonner";
import type { Companion, User } from "@/types/companion";
import Link from "next/link";

interface CompanionsListProps {
  title: string;
  companions?: Companion[];
  recentSessions?: Companion[];
  classNames?: string;
  user: User | null;
}

const CompanionsList = ({
  title,
  companions: initialCompanions,
  recentSessions,
  classNames,
  user,
}: CompanionsListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompanionForm, setShowCompanionForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companionToDelete, setCompanionToDelete] = useState<string | null>(
    null
  );
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [mounted, setMounted] = useState(false);
  const [companions, setCompanions] = useState(initialCompanions || []);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  useEffect(() => {
    setCompanions(initialCompanions || []);
  }, [initialCompanions]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
  };

  const filteredCompanions = companions?.filter((companion) => {
    const matchesSearch =
      companion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      companion.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      companion.topic?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "all" ||
      companion.subject.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // If user has typed something and there are matching results, we could track this
    // But typically we track when they actually click/view a companion
  };

  const handleDeleteClick = (id: string) => {
    setCompanionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!companionToDelete) return;

    startTransition(async () => {
      try {
        await deleteCompanion(companionToDelete);
        setCompanions((prev) => prev.filter((c) => c.id !== companionToDelete));
        toast.success("Companion deleted successfully");
      } catch (error) {
        toast.error("Failed to delete companion");
      } finally {
        setDeleteDialogOpen(false);
        setCompanionToDelete(null);
      }
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "min-h-screen bg-background transition-colors duration-500",
        classNames
      )}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
              >
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{title}</h1>
                <p className="text-xs text-muted-foreground">
                  {filteredCompanions?.length || 0} companions
                </p>
              </div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="search"
                  placeholder="Search companions..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 bg-secondary/50 border-border hover:border-primary/50 focus:border-primary transition-all duration-300"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="rounded-xl"
                >
                  <AnimatePresence mode="wait">
                    {isDarkMode ? (
                      <motion.div
                        key="sun"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sun className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="moon"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Moon className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setShowCompanionForm(true)}
                  className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Companion</span>
                </Button>
              </motion.div>

              {/* User Avatar */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative"
                    >
                      <Avatar className="w-10 h-10 ring-2 ring-border hover:ring-primary transition-all duration-300">
                        <AvatarImage
                          src={
                            user.avatar_url ||
                            user.imageUrl ||
                            "/placeholder.svg"
                          }
                        />
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          {user.full_name?.charAt(0) ||
                            user.email?.charAt(0) ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search companions..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 bg-secondary/50"
              />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <SubjectFilter
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </motion.div>

        {/* Recent Sessions Section */}
        {recentSessions && recentSessions.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-10"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Recently Viewed
            </h2>
            <div className="flex">
              {recentSessions.slice(0, 4).map((companion) => (
                <motion.div
                  key={companion.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow"
                >
                  <Link href={`/companion/${companion.id}`} className="block">
                    <div className="text-center flex justify-center items-center gap-2">
                      <h3 className="font-semibold text-sm capitalize">
                        {companion.subject}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Duration: {formatTime(companion.duration || 0)}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Companions Grid */}
        <AnimatePresence mode="wait">
          {filteredCompanions && filteredCompanions.length > 0 ? (
            <motion.div
              key="companions-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredCompanions.map((companion) => (
                <motion.div key={companion.id} variants={itemVariants} layout>
                  <CompanionCard
                    id={companion.id}
                    name={companion.title}
                    topic={companion.topic}
                    subject={companion.subject}
                    duration={companion.duration}
                    color={companion.color || ""}
                    bookmarked={companion.bookmarked || false}
                    onDelete={() => handleDeleteClick(companion.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6"
              >
                <BookOpen className="w-12 h-12 text-muted-foreground" />
              </motion.div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No companions found
              </h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                {searchQuery
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first AI learning companion to get started"}
              </p>
              <Button
                onClick={() => setShowCompanionForm(true)}
                className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Companion
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Companion Form Side Panel */}
      <AnimatePresence>
        {showCompanionForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCompanionForm(false)}
              className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-card shadow-2xl border-l border-border"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div>
                    <h3 className="text-xl font-semibold text-card-foreground">
                      Create Companion
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Design your AI learning assistant
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCompanionForm(false)}
                    className="rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <CompanionForm
                    onSuccess={() => setShowCompanionForm(false)}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-card-foreground">
              Delete Companion?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete this
              companion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CompanionsList;
