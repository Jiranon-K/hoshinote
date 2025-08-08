import { siteConfig } from '@/config/site'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}