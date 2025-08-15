'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet'
import { Menu, LogOut, User as UserIcon, LayoutDashboard, PenSquare, FileText } from 'lucide-react'

// Using shadcn + lucide Menu icon instead of custom spans

export default function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  // Scroll shrink effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close sheet on route change
  useEffect(() => { setOpen(false) }, [pathname])

  const navLinks = [
    { href: '/blog', label: 'Blog', icon: FileText },
    session && { href: '/dashboard', label: 'Dashboard', auth: true, icon: LayoutDashboard },
  ].filter(Boolean) as { href: string; label: string; auth?: boolean; icon: React.ComponentType<{ className?: string }> }[]

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b transition-all',
        scrolled ? 'shadow-sm' : 'bg-white/80'
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: Brand + Desktop Nav */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="group relative flex items-center font-semibold text-lg tracking-tight transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-indigo-500 group-hover:via-purple-500 group-hover:to-pink-500 transition-all duration-300">
                {siteConfig.name}
              </span>
              <span className="ml-2 hidden rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground/70 md:inline group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-300">
                Beta
              </span>
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300 group-hover:w-full group-hover:h-0.5" />
            </Link>
            <nav className="hidden md:flex items-center gap-1">
      {navLinks.map(l => {
                const active = pathname === l.href
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 group cursor-pointer',
                      active
                        ? 'bg-muted text-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0'
                    )}
                  >
        <span className="flex items-center gap-2 transition-all duration-200 group-hover:scale-105">
          <l.icon className="size-4 transition-transform duration-200 group-hover:rotate-3" /> 
          {l.label}
        </span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* (Search bar removed) */}

          {/* Right: Auth / User */}
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden cursor-pointer" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {siteConfig.name}
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-4 flex flex-col gap-1">
                  {navLinks.map(l => {
                    const active = pathname === l.href
                    return (
                      <SheetClose asChild key={l.href}>
                        <Link
                          href={l.href}
                          className={cn('rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
                            active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground')}
                        >
                          <span className="flex items-center gap-2"><l.icon className="size-4" /> {l.label}</span>
                        </Link>
                      </SheetClose>
                    )
                  })}
                </nav>
                {status === 'loading' && <div className="mt-4 h-9 w-full animate-pulse rounded-md bg-muted" />}
                {!session && status !== 'loading' && (
                  <div className="mt-6 flex gap-2">
                    <SheetClose asChild>
                      <Link className="flex-1 cursor-pointer" href="/auth/login">
                        <Button variant="outline" className="w-full cursor-pointer" size="sm">Sign In</Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link className="flex-1 cursor-pointer" href="/auth/register">
                        <Button className="w-full cursor-pointer" size="sm">Sign Up</Button>
                      </Link>
                    </SheetClose>
                  </div>
                )}
                {session && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-3 rounded-md border p-3">
                      <div className="relative h-9 w-9 rounded-full overflow-hidden bg-gray-100 ring-2 ring-gray-200 shrink-0">
                        {session.user.avatar ? (
                          <img
                            src={session.user.avatar}
                            alt={session.user.name || 'User'}
                            className="h-full w-full object-cover object-center"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                            <span className="text-white text-sm font-medium">
                              {(session.user.name || 'U').split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{session.user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <SheetClose asChild>
                        <Link href="/dashboard" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent cursor-pointer">
                          <LayoutDashboard className="size-4" /> Dashboard
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/dashboard/profile" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent cursor-pointer">
                          <UserIcon className="size-4" /> Profile
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/dashboard/posts/new" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent cursor-pointer">
                          <PenSquare className="size-4" /> New Post
                        </Link>
                      </SheetClose>
                      <Button variant="destructive" size="sm" className="mt-2 justify-start gap-2 cursor-pointer" onClick={() => signOut()}>
                        <LogOut className="size-4" /> Sign Out
                      </Button>
                    </div>
                  </div>
                )}
                <SheetFooter />
              </SheetContent>
            </Sheet>
            {status === 'loading' ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 rounded-full pl-1 pr-3 hover:ring-2 hover:ring-primary/20 transition-all duration-200" size="sm">
                    <div className="relative h-6 w-6 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200 transition-all duration-200 hover:ring-2 hover:ring-primary/30 hover:scale-110">
                      {session.user.avatar ? (
                        <img
                          src={session.user.avatar}
                          alt={session.user.name || 'User'}
                          className="h-full w-full object-cover object-center transition-transform duration-200 hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 transition-all duration-200 hover:from-blue-400 hover:to-purple-500">
                          <span className="text-white text-[10px] font-medium">
                            {(session.user.name || 'U').substring(0,2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="hidden max-w-[90px] truncate sm:inline text-xs font-medium transition-colors duration-200">{session.user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col">
                    <span className="text-xs font-normal text-muted-foreground">Signed in as</span>
                    <span className="truncate font-medium text-foreground">{session.user.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex w-full items-center gap-2 transition-all duration-200 hover:scale-105 group">
                      <LayoutDashboard className="size-4 transition-transform duration-200 group-hover:rotate-3" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="flex w-full items-center gap-2 transition-all duration-200 hover:scale-105 group">
                      <UserIcon className="size-4 transition-transform duration-200 group-hover:rotate-3" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/posts/new" className="flex w-full items-center gap-2 transition-all duration-200 hover:scale-105 group">
                      <PenSquare className="size-4 transition-transform duration-200 group-hover:rotate-3" /> New Post
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700 transition-all duration-200 hover:scale-105 group" onClick={() => signOut()}>
                    <LogOut className="size-4 transition-transform duration-200 group-hover:rotate-3" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link href="/auth/login" className="cursor-pointer"><Button variant="outline" size="sm" className="cursor-pointer">Sign In</Button></Link>
                <Link href="/auth/register" className="cursor-pointer"><Button size="sm" className="cursor-pointer">Sign Up</Button></Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile nav handled by Sheet */}
    </header>
  )
}