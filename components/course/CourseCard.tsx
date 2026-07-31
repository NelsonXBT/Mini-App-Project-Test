import Image from "next/image";
import Link from "next/link";

type Course = {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  lessons: number;
  enrolled: boolean;
  progress: number;
  level: string;
};

type CourseCardProps = {
  course: Course;
};

export default function CourseCard({
  course,
}: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="block"
    >
      <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition-all duration-300 hover:border-cyan-500 hover:bg-zinc-800">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="relative h-24 w-36 flex-shrink-0 overflow-hidden rounded-xl">
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col">
            <h2 className="line-clamp-1 text-lg font-bold text-white">
              {course.title}
            </h2>

            <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
              {course.description}
            </p>

            <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
              <span>{course.lessons} Lessons</span>

              <span>{course.level}</span>
            </div>

            {course.enrolled && (
              <>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                    style={{
                      width: `${course.progress}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex justify-end">
                  <span className="text-xs font-semibold text-cyan-400">
                    {course.progress}% Complete
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}