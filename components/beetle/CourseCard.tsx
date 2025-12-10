import React from "react";
import { Clock, Users, ChevronRight, BarChart } from "lucide-react";
import { Course } from "@/types/course";
import { DIFFICULTY_COLORS } from "@/constants";

interface CourseCardProps {
  course: Course;
  onClick: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  return (
    <div
      onClick={() => onClick(course)}
      className="group relative bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            DIFFICULTY_COLORS[course.difficulty]
          }`}
        >
          {course.difficulty}
        </span>
        <span className="text-slate-400 text-xs">
          {new Date(course.generatedAt).toLocaleDateString()}
        </span>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
        {course.title}
      </h3>

      <p className="text-slate-600 text-sm line-clamp-2 mb-6 flex-grow">
        {course.description}
      </p>

      <div className="flex items-center justify-between text-slate-500 text-sm pt-4 border-t border-slate-100">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1.5" />
            {course.totalDurationHours}h
          </div>
          <div className="flex items-center">
            <BarChart className="w-4 h-4 mr-1.5" />
            {course.modules.length} modules
          </div>
        </div>
        <div className="bg-indigo-50 p-1.5 rounded-full text-indigo-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
