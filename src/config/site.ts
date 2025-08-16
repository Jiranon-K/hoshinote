const getBaseUrl = () => {
  const url = process.env.NEXTAUTH_URL || "http://localhost:3000";
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

export const siteConfig = {
  name: "Hoshi-Note",
  description: "A modern note-taking and blog platform built with Next.js, TypeScript, and MongoDB",
  url: getBaseUrl(),
  ogImage: "/og-image.jpg",
  links: {
    twitter: "https://twitter.com/hoshinote",
    github: "https://github.com/hoshinote/hoshi-note",
  },
  authors: {
    default: "Hoshi-Note Team",
    email: "hello@hoshi-note.com"
  },
  features: {
    comments: true,
    newsletter: false,
    search: true,
    analytics: false
  }
}