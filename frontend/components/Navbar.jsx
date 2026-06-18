import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getUserData, logout } from '../services/auth';
import { BarChart3, Hash, LogOut, User, Menu, X } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const user = getUserData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/hashtags', label: 'Hashtags', icon: Hash },
  ];

  const isActive = (path) => router.pathname === path;

  return (
    <nav className="bg-[#010101] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">
              <span className="text-[#FE2C55]">TK</span>
              <span className="text-[#25F4EE]">Analytics</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-[#FE2C55] text-white'
                    : 'text-gray-300 hover:bg-[#161616] hover:text-white'
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            ))}

            {user ? (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-700">
                <div className="text-right">
                  <p className="text-sm font-medium">{user.display_name || user.username}</p>
                  <p className="text-xs text-gray-400">@{user.username}</p>
                </div>
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#FE2C55] flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <button
                  onClick={logout}
                  className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-[#161616] transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-[#FE2C55] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#e0244e] transition-colors"
              >
                Entrar com TikTok
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#161616] border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.href)
                    ? 'bg-[#FE2C55] text-white'
                    : 'text-gray-300 hover:bg-[#010101] hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            ))}
            {user && (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-[#010101] hover:text-white"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}