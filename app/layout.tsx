import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Humor Flavor Tool',
  description: 'Build and test humor flavor prompt chains',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: '!bg-white dark:!bg-stone-900 !text-stone-900 dark:!text-stone-100 !border !border-stone-200 dark:!border-stone-700 !shadow-lg !rounded-xl !text-sm',
              duration: 3500,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
