"use client";

export type Lesson = {
  id: string;
  videoId: string;
};

type Listener = () => void;

let currentLesson: Lesson | null = null;
let countdown: number | null = null;

const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function setCurrentLesson(
  lesson: Lesson
) {
  currentLesson = lesson;
  notify();
}

export function getCurrentLesson() {
  return currentLesson;
}

export function setCountdown(
  value: number | null
) {
  countdown = value;
  notify();
}

export function getCountdown() {
  return countdown;
}

export function subscribe(
  listener: Listener
) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}