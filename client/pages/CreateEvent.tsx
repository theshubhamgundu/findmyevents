import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Calendar, Users, Shield, Plus } from 'lucide-react';

export default function CreateEvent() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Create Your Event
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Host hackathons, workshops, seminars, and tech fests with ease. 
              Reach thousands of students across India.
            </p>
          </div>

          {/* Placeholder Card */}
          <Card className="mb-8">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-fme-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-fme-blue" />
              </div>
              <CardTitle className="text-2xl">Event Creation Form</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Star className="w-12 h-12 text-fme-orange mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Coming Soon!
              </h3>
              <p className="text-gray-600 mb-6">
                Continue prompting to help me build the complete event creation form with:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-fme-blue" />
                  <span className="text-gray-700">Event details & scheduling</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-fme-orange" />
                  <span className="text-gray-700">Ticket management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Payment integration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-700">Organizer verification</span>
                </div>
              </div>

              <Button className="mt-8 bg-fme-blue hover:bg-fme-blue/90">
                Get Started
              </Button>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="w-10 h-10 text-fme-blue mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Easy Setup</h3>
                <p className="text-gray-600 text-sm">
                  Create events in minutes with our intuitive form
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-10 h-10 text-fme-orange mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Wide Reach</h3>
                <p className="text-gray-600 text-sm">
                  Connect with 50K+ students across India
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="w-10 h-10 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Zero Fees</h3>
                <p className="text-gray-600 text-sm">
                  Direct UPI payments with no platform commission
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
