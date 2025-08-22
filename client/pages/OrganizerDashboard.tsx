import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Calendar,
  Users,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  BarChart3,
  Settings,
  Bell,
  Download,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function OrganizerDashboard() {
  const [loading, setLoading] = useState(true);
  const { user, profile, isConfigured } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Check if user is demo organizer
    const isDemoOrganizer = user.id === "00000000-0000-4000-8000-000000000002";

    if (!isConfigured && !isDemoOrganizer) {
      setLoading(false);
      return;
    }

    // Simulate loading organizer data
    setTimeout(() => setLoading(false), 1000);
  }, [user, isConfigured]);

  // Mock organizer data
  const organizerStats = {
    totalEvents: 12,
    activeEvents: 3,
    totalRegistrations: 1247,
    pendingApprovals: 2,
  };

  const mockEvents = [
    {
      id: "1",
      title: "AI/ML Workshop 2024",
      date: "2024-02-20",
      registrations: 145,
      status: "published",
      maxParticipants: 200,
    },
    {
      id: "2",
      title: "React Advanced Bootcamp",
      date: "2024-02-25",
      registrations: 89,
      status: "pending",
      maxParticipants: 150,
    },
    {
      id: "3",
      title: "Startup Pitch Competition",
      date: "2024-03-01",
      registrations: 67,
      status: "published",
      maxParticipants: 100,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fme-blue mx-auto mb-4"></div>
            <p>Loading organizer dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Organizer Dashboard
                </h1>
                <p className="text-gray-600">
                  Welcome back, {profile?.full_name}! Manage your events and
                  track performance.
                </p>
              </div>
              <Button
                onClick={() => navigate("/create-event")}
                className="bg-fme-orange hover:bg-fme-orange/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Events
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {organizerStats.totalEvents}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-fme-blue" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Events
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {organizerStats.activeEvents}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Registrations
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {organizerStats.totalRegistrations}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-fme-orange" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Pending Approvals
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {organizerStats.pendingApprovals}
                    </p>
                  </div>
                  <Bell className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Events</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {event.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {event.registrations}/{event.maxParticipants}{" "}
                            registered
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            event.status === "published"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {event.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/manage-event/${event.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Manage
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4"
                    onClick={() => navigate("/create-event")}
                  >
                    <div className="text-left">
                      <div className="flex items-center mb-1">
                        <Plus className="w-4 h-4 mr-2" />
                        <span className="font-medium">Create New Event</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Start organizing your next event
                      </p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4"
                    onClick={() => navigate("/become-organizer")}
                  >
                    <div className="text-left">
                      <div className="flex items-center mb-1">
                        <Settings className="w-4 h-4 mr-2" />
                        <span className="font-medium">Organizer Settings</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Update your organizer profile
                      </p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4"
                  >
                    <div className="text-left">
                      <div className="flex items-center mb-1">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        <span className="font-medium">View Analytics</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Track event performance
                      </p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
