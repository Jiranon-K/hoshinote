'use client'

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  views: number;
  likes: number;
  tags: string[];
}

export default function Home() {
  const { data: session, status } = useSession();
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        const response = await fetch('/api/posts?limit=6&status=published');
        const data = await response.json();
        setFeaturedPosts(data.posts || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <div className="relative h-[40vh] overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/banner/kafka-x-silver-wolf-honkai-star-rail-moewalls-com.mp4" type="video/mp4" />
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
                <p className="text-xl md:text-2xl text-white/90 drop-shadow-lg font-light tracking-wide">
                  Where Stories Shine Like Stars
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6">
              Featured Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              Discover the most captivating tales from our community
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-3xl h-80"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredPosts.map((post, index) => (
                <Link key={post._id} href={`/blog/${post.slug}`}>
                  <article className="group cursor-pointer transform transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
                    <div className="relative overflow-hidden rounded-3xl h-80 md:h-96 shadow-xl">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 h-full flex items-center justify-center">
                          <span className="text-white text-8xl opacity-30">✦</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
                      
                      <div className="absolute top-6 right-6 flex items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm font-medium border border-white/20">
                          {post.views} views
                        </div>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        <div className="flex items-center gap-3 mb-4">
                          {post.author.avatar ? (
                            <Image
                              src={post.author.avatar}
                              alt={post.author.name}
                              width={40}
                              height={40}
                              className="rounded-full border-2 border-white/50"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50">
                              <span className="text-white text-sm font-bold">
                                {post.author.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <span className="text-white/90 text-sm font-medium">{post.author.name}</span>
                        </div>
                        
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-3 group-hover:text-purple-200 transition-colors duration-300 leading-tight">
                          {post.title}
                        </h3>
                        
                        <p className="text-white/80 text-base md:text-lg leading-relaxed mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-16">
            <div className="flex gap-6 items-center justify-center flex-col sm:flex-row">
              {status === 'loading' ? (
                <button className="border-2 border-red-500 bg-white text-red-500 px-10 py-4 text-lg rounded-2xl shadow-lg" disabled>
                  Loading...
                </button>
              ) : session ? (
                <Link href="/dashboard/posts/new">
                  <button className="group border-2 border-red-500 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 px-10 py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-semibold">
                    ✨ Start Writing
                  </button>
                </Link>
              ) : (
                <Link href="/auth/register">
                  <button className="group border-2 border-red-500 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 px-10 py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-semibold">
                    ✨ Get Started
                  </button>
                </Link>
              )}
              
              <Link href="/blog">
                <button className="group border-2 border-red-300 text-red-600 hover:border-red-500 hover:bg-red-50 px-10 py-4 text-lg rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white font-semibold">
                  📚 Explore All Stories
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
