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
              className="group relative flex items-center font-semibold text-lg tracking-tight"
            >
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {siteConfig.name}
              </span>
              <span className="ml-2 hidden rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground/70 md:inline">
                Beta
              </span>
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-indigo-500 to-pink-500 transition-all group-hover:w-full" />
            </Link>
            <nav className="hidden md:flex items-center gap-1">
      {navLinks.map(l => {
                const active = pathname === l.href
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
        <span className="flex items-center gap-2"><l.icon className="size-4" /> {l.label}</span>
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
                <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
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
                          className={cn('rounded-md px-3 py-2 text-sm font-medium transition-colors',
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
                      <Link className="flex-1" href="/auth/login">
                        <Button variant="outline" className="w-full" size="sm">Sign In</Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link className="flex-1" href="/auth/register">
                        <Button className="w-full" size="sm">Sign Up</Button>
                      </Link>
                    </SheetClose>
                  </div>
                )}
                {session && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-3 rounded-md border p-3">
                      <Avatar className="size-9">
                        {session.user.avatar && <AvatarImage src={session.user.avatar} alt={session.user.name || 'User'} />}
                        <AvatarFallback>{(session.user.name || 'U').split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{session.user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <SheetClose asChild>
                        <Link href="/dashboard" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
                          <LayoutDashboard className="size-4" /> Dashboard
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/dashboard/profile" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
                          <UserIcon className="size-4" /> Profile
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/dashboard/posts/new" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
                          <PenSquare className="size-4" /> New Post
                        </Link>
                      </SheetClose>
                      <Button variant="destructive" size="sm" className="mt-2 justify-start gap-2" onClick={() => signOut()}>
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
                  <Button variant="outline" className="flex items-center gap-2 rounded-full pl-1 pr-3" size="sm">
                    <Avatar className="size-6">
                      {session.user.avatar && <AvatarImage src={session.user.avatar} alt={session.user.name || 'User'} />}
                      <AvatarFallback className="text-[10px]">{(session.user.name || 'U').substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-[90px] truncate sm:inline text-xs font-medium">{session.user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col">
                    <span className="text-xs font-normal text-muted-foreground">Signed in as</span>
                    <span className="truncate font-medium text-foreground">{session.user.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex w-full items-center gap-2">
                      <LayoutDashboard className="size-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="flex w-full items-center gap-2">
                      <UserIcon className="size-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/posts/new" className="flex w-full items-center gap-2">
                      <PenSquare className="size-4" /> New Post
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => signOut()}>
                    <LogOut className="size-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link href="/auth/login"><Button variant="outline" size="sm">Sign In</Button></Link>
                <Link href="/auth/register"><Button size="sm">Sign Up</Button></Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile nav handled by Sheet */}
    </header>
  )
}