import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useWishlist } from '@/lib/wishlist-provider';
import { useTheme } from '@/lib/theme-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import SearchBar from '@/components/search-bar';
import { Sun, Moon, Heart, ChevronDown, LogOut } from 'lucide-react';

export default function Header() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { wishlist } = useWishlist();
  const { theme, setTheme } = useTheme();
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearch = (query: string) => {
    navigate(`/?query=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-sm">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Link href="/">
            <div className="flex items-center space-x-1 cursor-pointer">
              <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 8L14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 15L11 12L14 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11 12V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xl font-semibold tracking-tight">Brand<span className="text-primary">Kiln</span></span>
            </div>
          </Link>
        </div>
        
        {/* Mobile search toggle */}
        <button 
          className="md:hidden text-gray-600 dark:text-gray-300"
          onClick={toggleMobileSearch}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Desktop search */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <SearchBar onSearch={handleSearch} />
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Wishlist */}
          <Link href="/wishlist">
            <a className="relative p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <Heart className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-primary rounded-full">
                  {wishlist.length}
                </span>
              )}
            </a>
          </Link>
          
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-gray-300" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </Button>
          
          {/* Auth buttons or User profile */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1 text-sm font-medium">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{user.firstName || user.username}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>My Wishlist</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex space-x-2">
              <Link href="/auth">
                <Button variant="link" className="text-sm text-primary">
                  Login
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="text-sm">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
      
      {/* Mobile search (initially hidden) */}
      {showMobileSearch && (
        <div className="md:hidden px-4 py-2 border-t dark:border-gray-700">
          <SearchBar onSearch={handleSearch} />
        </div>
      )}
    </header>
  );
}
