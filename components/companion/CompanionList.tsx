"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Clock, Cloud, Eye, MessageSquare, Play, Search, Plus, X, Trash2 } from "lucide-react"
import { deleteCompanion } from "@/lib/actions/companion.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import Image from "next/image"
import CompanionForm from "./CompanionForm"
import Link from "next/link"
import User from "../user"
import { signout } from '@/app/login/actions';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner';

interface Companion {
  id: string
  title: string
  subject: string
  description: string
  color: string
  voice: string
  duration: string
  style: string
  created_at: string
}

interface User {
  email?: string;
  name?: string;
  imageUrl?: string;
  app_metadata?: { provider?: string };
};

interface CompanionsListProps {
  title: string
  companions?: Companion[]
  classNames?: string
  user: User;
}

const CompanionsList = ({ title, companions, classNames, user }: CompanionsListProps) => {
  const [notifications] = useState(5)
  const [activeTab, setActiveTab] = useState("home")
  const [searchQuery, setSearchQuery] = useState("")
  const [showCompanionForm, setShowCompanionForm] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [companionToDelete, setCompanionToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter();

  const filteredCompanions = companions?.filter(
    (companion) =>
      companion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      companion.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleNewCompanionClick = () => {
    setShowCompanionForm(true)
  }

  const handleCloseForm = () => {
    setShowCompanionForm(false)
  }

  const handleLogout = async () => {
    await signout();
    router.push('/login');
  };

  const handleDeleteClick = (id: string) => {
    setCompanionToDelete(id);
    setDeleteDialogOpen(true);
  }

  const handleDeleteConfirm = async () => {
    if (!companionToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCompanion(companionToDelete);
      toast.success("Companion deleted successfully");
      setDeleteDialogOpen(false);
      setCompanionToDelete(null);
    } catch (error) {
      toast.error("Failed to delete companion");
      console.error("Error deleting companion:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-b from-gray-50 to-white transition-all duration-300 ease-in-out px-4 md:px-6"
      )}
    >
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex flex-1 items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Collection</h1>

          {/* Search Bar - Center Positioned */}
          <div className="hidden md:flex mx-6 flex-1 max-w-2xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search companions..."
                className="w-full rounded-2xl bg-background pl-9 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* User Controls */}
          <div className="flex gap-2">
            <User user={user} />
            <button
              onClick={handleLogout}
              className="text-red-700 hover:underline px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search companions..."
            className="w-full rounded-2xl bg-background pl-9 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <Tabs defaultValue="home" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="home" className="space-y-8 mt-0">
                {/* Hero Section */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 text-white shadow-lg"
                >
                  <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-4">
                      <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl backdrop-blur-md">
                        Alpha-Testing
                      </Badge>
                      <h2 className="text-3xl font-bold tracking-tight">
                        Welcome to Collection
                      </h2>
                      <p className="max-w-[600px] text-white/90">
                        Discover and interact with your AI companions in one seamless experience.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button className="rounded-2xl bg-white text-indigo-700 hover:bg-white/90 shadow-md">
                          Rate Us And Give Review
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-2xl bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white"
                        >
                          <Link href={"/"}>
                            Review
                          </Link>
                        </Button>
                      </div>
                    </div>
                    <div className="hidden lg:block">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                        className="relative h-40 w-40"
                      >
                        <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md" />
                        <div className="absolute inset-4 rounded-full bg-white/20" />
                        <div className="absolute inset-8 rounded-full bg-white/30" />
                        <div className="absolute inset-12 rounded-full bg-white/40" />
                        <div className="absolute inset-16 rounded-full bg-white/50" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                  <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl"></div>
                </motion.section>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <h2 className="text-2xl font-semibold tracking-tight">Your Companions</h2>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="rounded-2xl gap-2 flex-1 sm:flex-none"
                      onClick={handleNewCompanionClick}
                    >
                      <Plus className="h-4 w-4" />
                      New Companion
                    </Button>
                  </div>
                </div>

                {/* Companions Grid */}
                <section className="space-y-4">
                  {filteredCompanions?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="bg-gradient-to-r from-primary to-violet-600 p-4 rounded-2xl mb-4 inline-block">
                        <Search className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900">No companions found</h3>
                      <p className="text-muted-foreground max-w-md mt-2">
                        Try adjusting your search or create a new companion to get started.
                      </p>
                      <Button className="mt-4 rounded-2xl" onClick={handleNewCompanionClick}>
                        Create Companion
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {filteredCompanions?.map((companion) => (
                        <motion.div
                          key={companion.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 2 * 0.05 }}
                          whileHover={{ scale: 1.02, y: -5 }}
                          whileTap={{ scale: 0.98 }}
                          layout
                        >
                          <Card className="overflow-hidden rounded-3xl flex flex-col h-full border border-gray-200 hover:border-primary/30 transition-colors shadow-sm hover:shadow-md">
                            <CardHeader className="p-0 relative">
                              <div
                                className={`aspect-video overflow-hidden bg-green-300 ${companion.color} relative flex items-center justify-center`}
                              >
                                <Link href={`/companions/${companion.id}`}>
                                  <Image
                                    src={`/icons/${companion.subject}.svg`}
                                    alt={companion.subject}
                                    width={120}
                                    height={120}
                                    className="drop-shadow-md opacity-90"
                                  />
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                                    <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl backdrop-blur-md">
                                      {companion.subject}
                                    </Badge>
                                    <h3 className="mt-2 text-lg font-medium line-clamp-1">
                                      {companion.title}
                                    </h3>
                                  </div>
                                </Link>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 flex-1">
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {companion.description}
                              </p>
                              <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                                      {companion.voice.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{companion.voice}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  {companion.duration} mins
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="flex items-center justify-between border-t p-4">
                              <Badge variant="outline" className="rounded-xl">
                                {companion.style}
                              </Badge>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Eye className="h-4 w-4" />
                                  {format(new Date(companion.created_at), 'MMM d, yyyy')}
                                </div>
                                {/* <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                                  onClick={() => handleDeleteClick(companion.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button> */}
                              </div>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </section>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </main>

      {/* Companion Form Side Panel */}
      <AnimatePresence>
        {showCompanionForm && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleCloseForm}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />

            {/* Side Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', ease: [0.25, 0.1, 0.25, 1], duration: 0.3 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-xl"
            >
              <div className="flex h-full flex-col">
                {/* Panel Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
                  <h3 className="text-xl font-semibold">Create New Companion</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseForm}
                    className="rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <CompanionForm onSuccess={handleCloseForm} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this companion and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default CompanionsList