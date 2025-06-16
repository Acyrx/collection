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
import { redirect, useRouter } from "next/navigation"
import { Loader2, Plus } from "lucide-react"
import { useState } from "react"

const formSchema = z.object({
  title: z.string().min(1, { message: 'Companion name is required' }),
  subject: z.string().min(1, { message: 'Subject is required' }),
  topic: z.string().min(1, { message: 'Topic is required' }),
  voice: z.string().min(1, { message: 'Voice is required' }),
  style: z.string().min(1, { message: 'Style is required' }),
  duration: z.coerce.number().min(1, { message: 'Duration must be at least 1 minute' }).max(120, { message: 'Maximum duration is 120 minutes' }),
  audience: z.string().min(1, { message: 'Audience is required' }), // Added audience field
})

const CompanionForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSpecific, setIsSpecific] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      subject: '',
      topic: '',
      voice: '',
      style: '',
      duration: 15,
      audience: '', // Added default value for audience
    },
  })
  const router = useRouter()

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      const companion = await createCompanion(values)
      if (companion) {
        onSuccess?.()
        if (isSpecific) {
          router.push(`/subject/${companion.id}`)
          redirect(`/subject/${companion.id}`)
        } else {
          router.push(`/companions/${companion.id}`)
          redirect(`/companions/${companion.id}`)
        }
      } else {
        throw new Error('Failed to create companion')
      }
    } catch (error) {
      console.error('Error creating companion:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Companion</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Customize your AI learning assistant with the perfect settings
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Main Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 space-y-6">
              {/* Title Field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-2">
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Companion Name
                        <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Calculus Tutor"
                          {...field}
                          className="rounded-lg h-11 px-4 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                        Give your companion a descriptive name
                      </FormDescription>
                      <FormMessage className="text-xs text-red-500" />
                    </div>
                  </FormItem>
                )}
              />

              {/* Grid Section */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Subject Field */}
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Subject
                          <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-lg h-11 px-4 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                            {subjects.map((subject) => (
                              <SelectItem
                                value={subject}
                                key={subject}
                                className="rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs text-red-500" />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Duration Field */}
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                           Duration
                          <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="120"
                            placeholder="15"
                            {...field}
                            className="rounded-lg h-11 px-4 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Voice Field */}
                <FormField
                  control={form.control}
                  name="voice"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Voice Style
                          <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-lg h-11 px-4 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                              <SelectValue placeholder="Select a voice" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                            <SelectItem value="male" className="rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span>Male Voice</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="female" className="rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-pink-500" />
                                <span>Female Voice</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs text-red-500" />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Audience Field */}
                <FormField
                  control={form.control}
                  name="audience"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Audience
                          <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-lg h-11 px-4 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                              <SelectValue placeholder="Select an audience" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                            <SelectItem value="child" className="rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <span>Child</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="adult" className="rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span>Adult</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs text-red-500" />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Style Field */}
                <FormField
                  control={form.control}
                  name="style"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Teaching Style
                          <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-lg h-11 px-4 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                              <SelectValue placeholder="Select a style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                            <SelectItem value="formal" className="rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-purple-500" />
                                <span>Formal</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="casual" className="rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span>Casual</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs text-red-500" />
                      </div>
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
                    <div className="space-y-2">
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                        <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Derivatives and Integrals, Quantum Physics Basics, French Conversation Practice"
                          {...field}
                          className="rounded-lg min-h-[120px] bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                        What specific topics should the companion focus on?
                      </FormDescription>
                      <FormMessage className="text-xs text-red-500" />
                    </div>
                  </FormItem>
                )}
              />
              
              {/* Specific Checkbox */}
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="specific-checkbox"
                  checked={isSpecific}
                  onChange={(e) => setIsSpecific(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="specific-checkbox" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Specific AI Companion
                </label>
              </div>
            </div>
           
            {/* Submit Button */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="pt-2"
            >
              <Button
                type="submit"
                className="w-full rounded-lg h-12 text-base font-medium shadow-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Companion...
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