import LoginForm from '@/components/auth/LoginForm'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left panel with image / quote (hidden on mobile) */}
      <div className="relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r border-border overflow-hidden">
        <div className="absolute inset-0 bg-muted" />
        <div className="absolute inset-0">
          <Image
            src="/img/cover-l.jpg"
            alt="Cover image"
            fill
            sizes="(max-width: 1024px) 0px, 50vw"
            className="object-cover object-center select-none pointer-events-none"
            priority
          />
        </div>
      </div>

      {/* Auth form */}
      <div className="flex items-center justify-center py-6 lg:py-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}