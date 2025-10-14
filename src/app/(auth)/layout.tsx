import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AuthLayoutProps {
  children: React.ReactNode
}

const layout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="">
      {/* Header with back button */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm  ">
        <div className="container flex items-center justify-start px-4 py-3">
          <Button variant="secondary" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Main content with top padding to account for fixed header */}
      <div className="">{children}</div>
    </div>
  )
}

export default layout
