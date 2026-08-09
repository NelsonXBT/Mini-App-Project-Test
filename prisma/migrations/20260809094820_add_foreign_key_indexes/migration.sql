-- CreateIndex
CREATE INDEX "CourseFile_courseId_idx" ON "public"."CourseFile"("courseId");

-- CreateIndex
CREATE INDEX "Enrollment_courseId_idx" ON "public"."Enrollment"("courseId");

-- CreateIndex
CREATE INDEX "Lesson_moduleId_idx" ON "public"."Lesson"("moduleId");

-- CreateIndex
CREATE INDEX "LessonProgress_lessonId_idx" ON "public"."LessonProgress"("lessonId");

-- CreateIndex
CREATE INDEX "Module_courseId_idx" ON "public"."Module"("courseId");

-- CreateIndex
CREATE INDEX "Resource_lessonId_idx" ON "public"."Resource"("lessonId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId");
