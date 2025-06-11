"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { subjects } from "@/constants"
import { Textarea } from "@/components/ui/textarea"
import { createCompanion } from "@/lib/actions/companion.actions"
import { redirect } from "next/navigation"
import { Loader2, Plus } from "lucide-react"
import { useState } from "react"

const formSchema = z.object({
  title: z.string().min(1, { message: 'Companion name is required' }),
  subject: z.string().min(1, { message: 'Subject is required' }),
  topic: z.string().min(1, { message: 'Topic is required' }),
  voice: z.string().min(1, { message: 'Voice is required' }),
  style: z.string().min(1, { message: 'Style is required' }),
  duration: z.coerce.number().min(1, { message: 'Duration must be at least 1 minute' }).max(120, { message: 'Maximum duration is 120 minutes' }),
})

const CompanionForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      subject: '',
      topic: '',
      voice: '',
      style: '',
      duration: 15,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      const companion = await createCompanion(values)
      if (companion) {
        redirect(`/companions/${companion.id}`)
      } else {
        throw new Error('Failed to create companion')
      }
    } catch (error) {
      console.error('Error creating companion:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create New Companion</h1>
          <p className="text-muted-foreground">
            Customize your AI learning assistant with the perfect settings
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Title Field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Companion Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Calculus Tutor"
                        {...field}
                        className="rounded-xl h-12 px-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Give your companion a descriptive name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subject Field */}
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl h-12 px-4">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {subjects.map((subject) => (
                          <SelectItem
                            value={subject}
                            key={subject}
                            className="capitalize rounded-lg"
                          >
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      What subject will this companion teach?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duration Field */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="120"
                        placeholder="15"
                        {...field}
                        className="rounded-xl h-12 px-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Estimated length of each session
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Topic Field */}
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Focus Area</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Derivatives and Integrals, Quantum Physics Basics, French Conversation Practice"
                      {...field}
                      className="rounded-xl min-h-[120px]"
                    />
                  </FormControl>
                  <FormDescription>
                    What specific topics should the companion focus on?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Voice Field */}
              <FormField
                control={form.control}
                name="voice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Voice Style</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl h-12 px-4">
                          <SelectValue placeholder="Select a voice" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="male" className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            Male Voice
                          </div>
                        </SelectItem>
                        <SelectItem value="female" className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-pink-500" />
                            Female Voice
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How should your companion sound?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Style Field */}
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teaching Style</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl h-12 px-4">
                          <SelectValue placeholder="Select a style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="formal" className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500" />
                            Formal
                          </div>
                        </SelectItem>
                        <SelectItem value="casual" className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            Casual
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How formal should the companion be?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="pt-4"
            >
              <Button
                type="submit"
                className="w-full rounded-xl h-12 text-lg font-medium shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-5 w-5" />
                    Create Companion
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
      </motion.div>
    </div>
  )
}

export default CompanionForm