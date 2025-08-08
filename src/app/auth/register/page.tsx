import RegisterForm from '@/components/auth/RegisterForm'
import Image from 'next/image'

export default function RegisterPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r border-border overflow-hidden">
        <div className="absolute inset-0 bg-muted" />
        <div className="absolute inset-0">
          <Image
            src="/img/cover-r.jpg"
            alt="Cover graphic"
            fill
            sizes="(max-width: 1024px) 0px, 50vw"
            className="object-cover object-center select-none pointer-events-none"
            priority
          />
        </div>
      </div>
      <div className="flex items-center justify-center py-6 lg:py-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}