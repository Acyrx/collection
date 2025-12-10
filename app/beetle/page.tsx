"use client";
import React, { useState, useEffect } from "react";
import { SearchHero } from "@/components/beetle/SearchHero";
import { CourseCard } from "@/components/beetle/CourseCard";
import { CourseViewer } from "@/components/beetle/CourseViewer";
import { Course, Difficulty } from "@/types/course";
import {
  searchOrGenerateCourse,
  getAllCourses,
  getCourseById,
} from "@/utils/services/courseRespitory";
import { BookOpen, GraduationCap } from "lucide-react";

export default function App() {
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [isNewCourse, setIsNewCourse] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const [recentCourses, setRecentCourses] = useState<Course[]>([]);

  const handleSearch = async (query: string, difficulty: Difficulty) => {
    setIsSearching(true);
    setStatusMessage("Checking course library...");
    setCurrentCourse(null);

    try {
      const result = await searchOrGenerateCourse(query, difficulty, (msg) => {
        setStatusMessage(msg);
      });

      setCurrentCourse(result.course);
      setIsNewCourse(result.isNew);

      // Update the "Recent" list
      setRecentCourses(await getAllCourses());
    } catch (error) {
      alert("Failed to generate course. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewCourse = (course: Course) => {
    setCurrentCourse(course);
    setIsNewCourse(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Load recent courses and handle /beetle?course=id deep link
  useEffect(() => {
    (async () => {
      try {
        const all = await getAllCourses();
        setRecentCourses(all);

        const params = new URLSearchParams(window.location.search);
        const courseId = params.get("course");
        if (courseId) {
          const found =
            all.find((c) => c.id === courseId) ||
            (await getCourseById(courseId));
          if (found) {
            setCurrentCourse(found);
            setIsNewCourse(false);
          }
        }
      } catch (err) {
        console.error("Failed to load courses", err);
      }
    })();
  }, []);

  // If a course is selected, show the viewer
  if (currentCourse) {
    return (
      <div className="min-h-screen bg-slate-50">
        <CourseViewer
          course={currentCourse}
          onBack={() => setCurrentCourse(null)}
          isNewGeneration={isNewCourse}
        />
      </div>
    );
  }

  // Otherwise, show the Search Home
  return (
    <div className="min-h-screen bg-slate-50">
      <SearchHero
        onSearch={handleSearch}
        isSearching={isSearching}
        statusMessage={statusMessage}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-indigo-500" />
            Recently Created
          </h2>
          <span className="text-sm text-slate-500">
            {recentCourses.length} courses available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={handleViewCourse}
            />
          ))}
          {recentCourses.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
              <p className="text-slate-500">
                No courses yet. Search above to generate your first one!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
