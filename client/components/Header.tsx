import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Calendar, Search, User, Bell } from 'lucide-react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-fme-blue to-fme-orange rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold">
                <span className="text-fme-blue">FindMy</span>
                <span className="text-fme-orange">Event</span>
              </span>
              <span className="text-xs text-gray-500 hidden sm:block">Discover. Promote. Connect.</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/events" className="text-gray-700 hover:text-fme-blue font-medium transition-colors">
              Explore Events
            </Link>
            <Link to="/dashboard" className="text-gray-700 hover:text-fme-blue font-medium transition-colors">
              Dashboard
            </Link>
            <Link to="/create-event" className="text-gray-700 hover:text-fme-blue font-medium transition-colors">
              Create Event
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-fme-blue">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-fme-blue">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-700 hover:text-fme-blue">
              <User className="w-4 h-4 mr-2" />
              Login
            </Button>
            <Button className="bg-fme-blue hover:bg-fme-blue/90 text-white">
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link
                to="/events"
                className="text-gray-700 hover:text-fme-blue font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Explore Events
              </Link>
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-fme-blue font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/create-event"
                className="text-gray-700 hover:text-fme-blue font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Create Event
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Button variant="outline" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button className="w-full bg-fme-blue hover:bg-fme-blue/90 text-white">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
