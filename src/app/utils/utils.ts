export function timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // in seconds
  
    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];
  
    for (const interval of intervals) {
      const count = Math.floor(diff / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
      }
    }
  
    return "just now";
}

export function scrollToBottom(ref: React.RefObject<HTMLElement | null>) {
  const element = ref.current
  if (element) {
    element.scrollTop = element.scrollHeight
  } else {
    console.log("ref " + ref + " not found")
  }
}