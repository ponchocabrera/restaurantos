export const metadata = {
  title: 'RestaurantOS',
  description: 'An AI-powered restaurant menu builder',
};

import Link from 'next/link';
import './globals.css'; // If you're using Tailwind or any global CSS

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {/* Site-wide header / nav */}
        <header className="border-b bg-white p-4 mb-6">
          <nav className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="font-bold text-xl">
              <Link href="/">RestaurantOS</Link>
            </div>
            <div className="space-x-4">
              <Link href="/my-restaurant" className="hover:underline">
                My Restaurant
              </Link>
              <Link href="/menu-creator" className="hover:underline">
                Menu Creator
              </Link>
            </div>
          </nav>
        </header>

        {/* Main content of each page */}
        <main className="max-w-6xl mx-auto px-4">
          {children}
        </main>
      </body>
    </html>
  );
}
