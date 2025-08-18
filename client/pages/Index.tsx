import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Shield, 
  QrCode, 
  Bell,
  Smartphone,
  Zap,
  TrendingUp,
  Star,
  ArrowRight,
  Search,
  Filter,
  Ticket
} from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-fme-blue/10 via-white to-fme-orange/10 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-fme-blue/10 rounded-full text-fme-blue text-sm font-medium mb-6">
                <Star className="w-4 h-4 mr-2" />
                #1 Student Event Platform in India
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Discover Your Next
                <span className="block">
                  <span className="text-fme-blue">Tech</span>{' '}
                  <span className="text-fme-orange">Event</span>
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Join thousands of students exploring hackathons, workshops, seminars, and tech fests. 
                From registration to QR-based check-ins, we've got you covered.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-fme-blue hover:bg-fme-blue/90 text-white px-8 py-6 text-lg">
                  <Search className="w-5 h-5 mr-2" />
                  Explore Events
                </Button>
                <Button variant="outline" className="border-fme-orange text-fme-orange hover:bg-fme-orange hover:text-white px-8 py-6 text-lg">
                  <Calendar className="w-5 h-5 mr-2" />
                  Create Event
                </Button>
              </div>
              
              <div className="flex items-center gap-8 mt-8 text-sm text-gray-500">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  50K+ Students
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  1000+ Events
                </div>
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  100% Verified
                </div>
              </div>
            </div>
            
            <div className="relative lg:block">
              <div className="relative">
                {/* Main Event Card */}
                <Card className="relative z-10 transform rotate-3 hover:rotate-0 transition-transform duration-300 shadow-xl">
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
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      HackFest 2024
                    </h3>
                    
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      IIT Delhi
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-fme-orange text-sm font-medium">
                        <Ticket className="w-4 h-4 mr-1" />
                        ₹500
                      </div>
                      <div className="flex items-center text-green-600 text-sm">
                        <Users className="w-4 h-4 mr-1" />
                        250 Registered
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Background Cards */}
                <Card className="absolute top-4 left-4 w-full transform -rotate-6 shadow-lg opacity-60">
                  <CardContent className="p-6 bg-fme-orange/10">
                    <div className="h-32"></div>
                  </CardContent>
                </Card>
                
                <Card className="absolute top-8 left-8 w-full transform rotate-12 shadow-lg opacity-40">
                  <CardContent className="p-6 bg-fme-blue/10">
                    <div className="h-32"></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need for
              <span className="block">
                <span className="text-fme-blue">Student</span>{' '}
                <span className="text-fme-orange">Events</span>
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From discovery to check-in, we provide a complete ecosystem for student events
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="group hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-fme-blue/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6 text-fme-blue" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Discovery</h3>
                <p className="text-gray-600">
                  Personalized event recommendations based on your interests, location, and college year.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-fme-orange/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <QrCode className="w-6 h-6 text-fme-orange" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">QR Tickets</h3>
                <p className="text-gray-600">
                  Instant ticket generation with unique QR codes for seamless event check-ins.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-fme-blue/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-fme-blue" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Verified Organizers</h3>
                <p className="text-gray-600">
                  Only verified colleges, clubs, and startups can host events for maximum trust.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="group hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-fme-orange/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-fme-orange" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Zero Commission</h3>
                <p className="text-gray-600">
                  Direct UPI payments to organizers with no platform fees or hidden charges.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="group hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-fme-blue/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Bell className="w-6 h-6 text-fme-blue" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Notifications</h3>
                <p className="text-gray-600">
                  Get reminders via WhatsApp, Telegram, and email for all your registered events.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="group hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-fme-orange/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-fme-orange" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Analytics Dashboard</h3>
                <p className="text-gray-600">
                  Real-time insights for organizers on registrations, attendance, and engagement.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-fme-blue to-fme-blue/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Ready to Join the
            <span className="block text-fme-orange">
              Student Event Revolution?
            </span>
          </h2>
          
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Whether you're a student looking for events or an organizer planning one, 
            FindMyEvent has everything you need.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-fme-blue hover:bg-gray-100 px-8 py-6 text-lg">
              <Smartphone className="w-5 h-5 mr-2" />
              Download App
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-fme-blue px-8 py-6 text-lg">
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-8 text-blue-100 text-sm">
            <div>✨ Free for Students</div>
            <div>🔒 100% Secure</div>
            <div>⚡ Instant Setup</div>
          </div>
        </div>
      </section>
    </div>
  );
}
