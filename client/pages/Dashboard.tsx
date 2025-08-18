import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, QrCode, Bell, Star, Ticket, TrendingUp, Users, Plus } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, Student! 👋
            </h1>
            <p className="text-gray-600">
              Manage your events, tickets, and stay updated with the latest tech events.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                  </div>
                  <Calendar className="w-8 h-8 text-fme-blue" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">My Tickets</p>
                    <p className="text-2xl font-bold text-gray-900">5</p>
                  </div>
                  <Ticket className="w-8 h-8 text-fme-orange" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Events Attended</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                  <Star className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Notifications</p>
                    <p className="text-2xl font-bold text-gray-900">2</p>
                  </div>
                  <Bell className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Upcoming Events</span>
                    <Button variant="outline" size="sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Event Item */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-fme-blue/10 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-fme-blue" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">HackFest 2024</h4>
                          <p className="text-sm text-gray-600">Feb 15, 2024 • IIT Delhi</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-fme-blue hover:bg-fme-blue/90">
                        <QrCode className="w-4 h-4 mr-2" />
                        View Ticket
                      </Button>
                    </div>

                    {/* Event Item */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-fme-orange/10 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-fme-orange" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">AI/ML Workshop</h4>
                          <p className="text-sm text-gray-600">Feb 20, 2024 • NIT Trichy</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-fme-orange hover:bg-fme-orange/90">
                        <QrCode className="w-4 h-4 mr-2" />
                        View Ticket
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* My Tickets */}
              <Card>
                <CardHeader>
                  <CardTitle>My Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Ticket Card */}
                    <div className="border rounded-lg p-4 bg-gradient-to-br from-fme-blue/10 to-fme-blue/5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-fme-blue text-white px-2 py-1 rounded text-xs font-medium">
                          HACKATHON
                        </div>
                        <QrCode className="w-8 h-8 text-fme-blue" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">HackFest 2024</h4>
                      <p className="text-sm text-gray-600 mb-3">Ticket ID: HF2024-001</p>
                      <Button variant="outline" size="sm" className="w-full">
                        Show QR Code
                      </Button>
                    </div>

                    {/* Ticket Card */}
                    <div className="border rounded-lg p-4 bg-gradient-to-br from-fme-orange/10 to-fme-orange/5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-fme-orange text-white px-2 py-1 rounded text-xs font-medium">
                          WORKSHOP
                        </div>
                        <QrCode className="w-8 h-8 text-fme-orange" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">AI/ML Workshop</h4>
                      <p className="text-sm text-gray-600 mb-3">Ticket ID: AI2024-042</p>
                      <Button variant="outline" size="sm" className="w-full">
                        Show QR Code
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-fme-blue hover:bg-fme-blue/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Explore Events
                  </Button>
                  <Button variant="outline" className="w-full">
                    <QrCode className="w-4 h-4 mr-2" />
                    My Tickets
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Registered for HackFest 2024</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">Received ticket for AI Workshop</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-600">Updated profile preferences</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Placeholder */}
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-fme-blue mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">More features coming!</h4>
                  <p className="text-sm text-gray-600">
                    Continue prompting to build out this dashboard with more functionality.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
