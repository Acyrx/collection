"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Clock, Cloud, Eye, MessageSquare, Play } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Sample data for tutorials
const tutorials = [
  {
    id: 1,
    title: "Mastering Digital Illustration",
    description: "Learn advanced techniques for creating stunning digital art",
    duration: "1h 45m",
    style: "Advanced",
    voice: "Sarah Chen",
    subject: "Illustration",
    createdAt: "24K",
    color: "from-indigo-500 via-purple-500 to-pink-500"
  },
  {
    id: 2,
    title: "UI/UX Design Fundamentals",
    description: "Essential principles for creating intuitive user interfaces",
    duration: "2h 20m",
    style: "Intermediate",
    voice: "Michael Rodriguez",
    subject: "Design",
    createdAt: "56K",
    color: "from-blue-500 via-cyan-500 to-teal-500"
  },
  {
    id: 3,
    title: "Video Editing Masterclass",
    description: "Professional techniques for cinematic video editing",
    duration: "3h 10m",
    style: "Advanced",
    voice: "James Wilson",
    subject: "Video",
    createdAt: "32K",
    color: "from-red-500 via-orange-500 to-amber-500"
  },
  {
    id: 4,
    title: "Typography Essentials",
    description: "Create beautiful and effective typography for any project",
    duration: "1h 30m",
    style: "Beginner",
    voice: "Emma Thompson",
    subject: "Typography",
    createdAt: "18K",
    color: "from-green-500 via-emerald-500 to-teal-500"
  },
  {
    id: 5,
    title: "Color Theory for Designers",
    description: "Understanding color relationships and psychology",
    duration: "2h 05m",
    style: "Intermediate",
    voice: "David Kim",
    subject: "Design",
    createdAt: "41K",
    color: "from-purple-500 via-violet-500 to-fuchsia-500"
  },
]

const Page = () => {
  const [notifications] = useState(5)
  const [activeTab, setActiveTab] = useState("home")
  const [sidebarOpen] = useState(true)

  return (
    <div className={cn("min-h-screen transition-all duration-300 ease-in-out", sidebarOpen ? "md:pl-64" : "md:pl-0")}>
      <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur"> 
        <div className="flex flex-1 items-center justify-between">
          <h1 className="text-xl font-semibold">Designali Creative</h1>
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-2xl">
                    <Cloud className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cloud Storage</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-2xl">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Messages</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-2xl relative">
                    <Bell className="h-5 w-5" />
                    {notifications > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {notifications}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Avatar className="h-9 w-9 border-2 border-primary">
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

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
                  className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 text-white"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-4">
                      <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">Premium</Badge>
                      <h2 className="text-3xl font-bold">Welcome to DesignAli Creative Suite</h2>
                      <p className="max-w-[600px] text-white/80">
                        All your companion at once place
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button className="rounded-2xl bg-white text-indigo-700 hover:bg-white/90">
                          Explore Plans
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
                </motion.section>

                {/* Recent Companions */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold">Recent Companions</h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tutorials.slice(0, 3).map((tutorial) => (
                      <motion.div 
                        key={tutorial.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: tutorial.id * 0.1 }}
                        whileHover={{ scale: 1.02, y: -5 }} 
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card className="overflow-hidden rounded-3xl flex flex-col">
                          <div className={`aspect-video overflow-hidden bg-gradient-to-br ${tutorial.color} relative`}>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Button size="icon" variant="secondary" className="h-14 w-14 rounded-full">
                                <Play className="h-6 w-6" />
                              </Button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                              <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">
                                {tutorial.subject}
                              </Badge>
                              <h3 className="mt-2 text-lg font-medium">{tutorial.title}</h3>
                            </div>
                          </div>
                          <CardContent className="p-4 flex-1">
                            <p className="text-sm text-muted-foreground">{tutorial.description}</p>
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback>{tutorial.voice.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{tutorial.voice}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {tutorial.duration}
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex items-center justify-between border-t p-4">
                            <Badge variant="outline" className="rounded-xl">
                              {tutorial.style}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Eye className="h-4 w-4" />
                              {tutorial.createdAt} createdAt
                            </div>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* Popular Courses */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Popular Courses</h2>
                    <Button variant="ghost" className="rounded-2xl">
                      View All
                    </Button>
                  </div>
                  <div className="rounded-3xl border overflow-hidden">
                    <div className="divide-y">
                      {tutorials.slice(3, 5).map((tutorial) => (
                        <motion.div
                          key={tutorial.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: tutorial.id * 0.1 }}
                          whileHover={{ scale: 1.01 }}
                          className="p-4 flex flex-col md:flex-row gap-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-shrink-0">
                            <div className={`relative h-20 w-20 overflow-hidden rounded-2xl bg-gradient-to-br ${tutorial.color}`}>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Play className="h-8 w-8 text-white" />
                              </div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{tutorial.title}</h3>
                            <p className="text-sm text-muted-foreground">{tutorial.description}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                              <Badge variant="outline" className="rounded-xl">
                                {tutorial.style}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {tutorial.duration}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Eye className="h-3 w-3" />
                                {tutorial.createdAt} createdAt
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Button variant="ghost" size="sm" className="rounded-xl">
                              Watch Now
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </section>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </main>
    </div>
  )
}

export default Page