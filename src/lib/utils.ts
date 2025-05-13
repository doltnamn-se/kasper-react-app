
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to safely disable text decoration
export function disableTextDecoration(element: HTMLElement | null) {
  if (!element) return;
  element.style.textDecoration = 'none';
}
