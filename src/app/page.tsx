'use client'

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="h-screen overflow-hidden">
      <div className="relative h-full overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/banner/totoro-watching-starry-night-sky-moewalls-com.mp4" type="video/mp4" />
        </video>
        
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black/20 to-pink-900/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto text-center">
              <div className="backdrop-blur-md bg-black/20 rounded-3xl p-12 border border-white/10 shadow-2xl">
                <h1 className="text-5xl md:text-7xl font-black mb-6">
                  <span className="bg-gradient-to-r from-red-400 via-red-200 to-pink-200 bg-clip-text text-transparent drop-shadow-2xl tracking-tight">
                    Hoshi-Note
                  </span>
                  <span className="text-red-300 text-4xl md:text-6xl animate-pulse ml-4 drop-shadow-2xl">✦</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/90 drop-shadow-lg font-light tracking-wide mb-8">
                  Where Stories Shine Like Stars
                </p>
                
                <div className="flex gap-4 items-center justify-center flex-col sm:flex-row">
                  {status === 'loading' ? (
                    <div className="animate-pulse">
                      <div className="h-12 w-32 bg-white/20 rounded-2xl"></div>
                    </div>
                  ) : session ? (
                    <Link href="/dashboard/posts/new">
                      <button className="group backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 hover:border-white/50 px-8 py-3 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium">
                        ✨ Start Writing
                      </button>
                    </Link>
                  ) : (
                    <Link href="/auth/register">
                      <button className="group backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 hover:border-white/50 px-8 py-3 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium">
                        ✨ Get Started
                      </button>
                    </Link>
                  )}
                  
                  <Link href="/blog">
                    <button className="group backdrop-blur-sm bg-white/5 hover:bg-white/10 text-white/90 hover:text-white border-2 border-white/20 hover:border-white/40 px-8 py-3 text-lg rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 font-medium">
                      📚 Explore Stories
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
