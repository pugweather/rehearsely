export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // in seconds

  if (diff < 60) {
    return "just now";
  }

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diff / interval.seconds);
    if (count >= 1) {
      return `edited ${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
    }
  }

  return "just now"; // fallback, but shouldn't be hit
}

export function scrollToBottom(ref: React.RefObject<HTMLElement | null>) {
  const element = ref.current
  if (element) {
    element.scrollTop = element.scrollHeight
  } else {
    console.log("ref " + ref + " not found")
  }
}

// utils/fuzzyMatch.ts

import Fuse from 'fuse.js'

export function isLineCloseEnough(expected: string | null, spoken: string | null, threshold = 0.5): boolean {

  if (!expected || !spoken) {
    return false
  }

  const fuse = new Fuse([expected], {
    includeScore: true,
    threshold,
  })

  const result = fuse.search(spoken)

  console.log("fuzzy search:")
  console.log("exp: " + expected)
  console.log("spoken: " + spoken)

  console.log(JSON.stringify(result))

  // Check that there's at least one match and that it has a valid score
  if (result.length > 0 && result[0].score !== undefined) {
    return result[0].score < threshold
  }

  return false
}