export const siteConfig = {
  name: "Hoshilog",
  description: "A modern blog platform built with Next.js, TypeScript, and MongoDB",
  url: process.env.NEXTAUTH_URL || "http://localhost:3000",
  ogImage: "/og-image.jpg",
  links: {
    twitter: "https://twitter.com/hoshilog",
    github: "https://github.com/hoshilog/hoshilog",
  },
  authors: {
    default: "Hoshilog Team",
    email: "hello@hoshilog.com"
  },
  features: {
    comments: true,
    newsletter: false,
    search: true,
    analytics: false
  }
}