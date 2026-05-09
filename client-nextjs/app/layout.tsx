import './globals.css'
import { Inter } from 'next/font/google'
import Navabr from '../components/Navbar'
import Link from 'next/link'
import Footer from '../components/Footer'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../contexts/AuthContext'
import { SocketProvider } from '../contexts/SocketContext'
import { NotificationProvider } from '../contexts/NotificationContext'
import { QueryProvider } from '../components/providers/QueryProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PropRent - Find Your Perfect Rental Home',
  description: 'Discover thousands of rental properties from trusted agents. Apply online, sign leases digitally, and manage your rental experience seamlessly.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <SocketProvider>
              <NotificationProvider>
                <Navabr />
                {children}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 4000,
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </NotificationProvider>
            </SocketProvider>
          </AuthProvider>
        </QueryProvider>
        <Footer />
      </body>
    </html>
  )
}
