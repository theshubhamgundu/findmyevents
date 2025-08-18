import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Filter, Calendar, MapPin, Users, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getEvents } from '@/lib/supabase';

export default function Events() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-fme-blue to-fme-blue/80 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Discover Amazing Events
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Explore hackathons, workshops, seminars, and tech fests happening near you
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      className="w-full pl-10 pr-4 py-3 rounded-lg border text-gray-900"
                    />
                  </div>
                  <Button className="bg-fme-orange hover:bg-fme-orange/90 px-6">
                    <Filter className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Event Card 1 */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-fme-blue/10 px-3 py-1 rounded-full text-fme-blue text-xs font-medium">
                      HACKATHON
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">15</div>
                      <div className="text-sm text-gray-500">FEB</div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">HackFest 2024</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      IIT Delhi
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      15-16 Feb 2024
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Users className="w-4 h-4 mr-2" />
                      250 registered
                    </div>
                  </div>
                  
                  <Button className="w-full bg-fme-blue hover:bg-fme-blue/90">
                    Register Now • ₹500
                  </Button>
                </CardContent>
              </Card>

              {/* Event Card 2 */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-fme-orange/10 px-3 py-1 rounded-full text-fme-orange text-xs font-medium">
                      WORKSHOP
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">20</div>
                      <div className="text-sm text-gray-500">FEB</div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">AI/ML Workshop</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      NIT Trichy
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      20 Feb 2024
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Users className="w-4 h-4 mr-2" />
                      150 registered
                    </div>
                  </div>
                  
                  <Button className="w-full bg-fme-orange hover:bg-fme-orange/90">
                    Register Now • Free
                  </Button>
                </CardContent>
              </Card>

              {/* Event Card 3 */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-green-100 px-3 py-1 rounded-full text-green-600 text-xs font-medium">
                      SEMINAR
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">25</div>
                      <div className="text-sm text-gray-500">FEB</div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Tech Career Summit</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      BITS Pilani
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      25 Feb 2024
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Users className="w-4 h-4 mr-2" />
                      300 registered
                    </div>
                  </div>
                  
                  <Button className="w-full bg-fme-blue hover:bg-fme-blue/90">
                    Register Now • ₹200
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Placeholder Message */}
            <div className="text-center mt-12 py-12 bg-white rounded-lg">
              <Star className="w-12 h-12 text-fme-blue mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                More content coming soon!
              </h3>
              <p className="text-gray-600">
                Continue prompting to help me build out this Events page with more features and functionality.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
