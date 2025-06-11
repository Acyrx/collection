"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Clock, Cloud, Eye, MessageSquare, Play, Search, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

interface CompanionsListProps {
    title: string;
    companions?: Companion[];
    classNames?: string;
}

const CompanionsList = ({ title, companions, classNames }: CompanionsListProps) => {
    const [notifications] = useState(5)
    const [activeTab, setActiveTab] = useState("home")
    const [sidebarOpen] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    const filteredCompanions = companions?.filter(companion => 
        companion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        companion.subject.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className={cn("min-h-screen bg-gradient-to-b from-gray-50 to-white transition-all duration-300 ease-in-out", sidebarOpen ? "md:pl-64" : "md:pl-0")}>
            {/* Header */}
            <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <div className="flex flex-1 items-center justify-between">
                    <h1 className="text-xl font-semibold tracking-tight">Designali Creative</h1>
                    
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
                    <div className="flex items-center gap-2">
                        <TooltipProvider delayDuration={100}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                                        <Cloud className="h-5 w-5" />
                                        <span className="sr-only">Cloud Storage</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Cloud Storage</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                                        <MessageSquare className="h-5 w-5" />
                                        <span className="sr-only">Messages</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Messages</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full relative text-muted-foreground hover:text-foreground">
                                        <Bell className="h-5 w-5" />
                                        {notifications > 0 && (
                                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                                {notifications}
                                            </span>
                                        )}
                                        <span className="sr-only">Notifications</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Notifications</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 font-medium text-white">JD</AvatarFallback>
                        </Avatar>
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
                                            <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl backdrop-blur-md">Premium</Badge>
                                            <h2 className="text-3xl font-bold tracking-tight">Welcome to DesignAli Creative Suite</h2>
                                            <p className="max-w-[600px] text-white/90">
                                                Discover and interact with your AI companions in one seamless experience.
                                            </p>
                                            <div className="flex flex-wrap gap-3">
                                                <Button className="rounded-2xl bg-white text-indigo-700 hover:bg-white/90 shadow-md">
                                                    Explore Plans
                                                </Button>
                                                <Button variant="outline" className="rounded-2xl bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white">
                                                    Learn More
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
                                        <Link href="/companions/new">
                                        <Button variant="outline" className="rounded-2xl gap-2 flex-1 sm:flex-none">
                                            <Plus className="h-4 w-4" />
                                            New Companion
                                        </Button>
                                        </Link>
                                        <Button variant="outline" className="rounded-2xl flex-1 sm:flex-none">
                                            Filter
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
                                            <Button className="mt-4 rounded-2xl">Create Companion</Button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                            {filteredCompanions?.map((companion) => (
                                                <motion.div
                                                    key={companion.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3, delay: companion.id * 0.05 }}
                                                    whileHover={{ scale: 1.02, y: -5 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    layout
                                                >
                                                    <Card className="overflow-hidden rounded-3xl flex flex-col h-full border border-gray-200 hover:border-primary/30 transition-colors shadow-sm hover:shadow-md">
                                                        <CardHeader className="p-0 relative">
                                                            <div className={`aspect-video overflow-hidden bg-gradient-to-br ${companion.color} relative flex items-center justify-center`}>
                                                                <Image
                                                                    src={`/icons/${companion.subject}.svg`}
                                                                    alt={companion.subject}
                                                                    width={120}
                                                                    height={120}
                                                                    className="drop-shadow-md opacity-90"
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition-opacity">
                                                                    <Button size="icon" variant="secondary" className="h-14 w-14 rounded-full shadow-lg">
                                                                        <Play className="h-6 w-6" />
                                                                    </Button>
                                                                </div>
                                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                                                                    <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl backdrop-blur-md">
                                                                        {companion.subject}
                                                                    </Badge>
                                                                    <h3 className="mt-2 text-lg font-medium line-clamp-1">{companion.title}</h3>
                                                                </div>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="p-4 flex-1">
                                                            <p className="text-sm text-muted-foreground line-clamp-2">{companion.description}</p>
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
                                                                    {companion.duration}
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                        <CardFooter className="flex items-center justify-between border-t p-4">
                                                            <Badge variant="outline" className="rounded-xl">
                                                                {companion.style}
                                                            </Badge>
                                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                                <Eye className="h-4 w-4" />
                                                                {companion.views}
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
        </div>
    )
}

export default CompanionsList