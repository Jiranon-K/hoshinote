'use client'

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function Home() {
  const { data: session, status } = useSession()
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to {siteConfig.name}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {siteConfig.description}. Share your thoughts, 
          connect with readers, and build your community.
        </p>
        
        <div className="flex gap-4 items-center justify-center flex-col sm:flex-row">
          <Link href="/blog">
            <Button size="lg" className="w-full sm:w-auto">
              Explore Blog Posts
            </Button>
          </Link>
          {status === 'loading' ? (
            <Button variant="outline" size="lg" className="w-full sm:w-auto" disabled>
              Loading...
            </Button>
          ) : session ? (
            <Link href="/dashboard/posts/new">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Write New Post
              </Button>
            </Link>
          ) : (
            <Link href="/auth/register">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Start Writing
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto">
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Writing</h3>
          <p className="text-gray-600">
            Intuitive rich text editor makes creating beautiful blog posts effortless.
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Community</h3>
          <p className="text-gray-600">
            Connect with readers through comments and build meaningful discussions.
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
          <p className="text-gray-600">
            Track your posts performance and understand your audience better.
          </p>
        </div>
      </div>
    </div>
  );
}
