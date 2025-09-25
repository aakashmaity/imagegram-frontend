'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Plus, 
  Search, 
  Heart, 
  User, 
  Camera,
  Menu,
  X,
  LogOut,
  LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils';
import { useAuth, useNotifications } from '../../hooks';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user, signout } = useAuth();

  const { unreadCount } = useNotifications({ pageSize: 0, pollMs: 15000 });

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/upload', icon: Plus, label: 'Upload' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/activity', icon: Heart, label: 'Activity', badge: unreadCount },
    { href: user?._id ? `/users/${user._id}` : '/profile', icon: User, label: 'Profile' },
  ];

  const onSignout = () => {
    signout();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">ImageGram</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
                        isActive 
                          ? "bg-accent text-accent-foreground" 
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      <div className="relative">
                        <Icon className="w-5 h-5" />
                        {item.badge > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user?.username || 'User'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSignout}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/signin">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                          isActive 
                            ? "bg-accent text-accent-foreground" 
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                  <div className="px-4 py-3 border-t border-border">
                    <div className="text-sm text-muted-foreground mb-2">
                      Welcome, {user?.username || 'User'}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onSignout}
                      className="flex items-center space-x-2 w-full justify-start"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-2 px-4">
                  <Link href="/signin" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2 w-full justify-start">
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
