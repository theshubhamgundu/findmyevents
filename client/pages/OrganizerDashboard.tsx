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
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getOrganizerByUserId, getOrganizerEvents } from "@/lib/supabase";
import { isDemoUser, getDemoEvents } from "@/lib/demo-data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Event, Organizer } from "@shared/types";

export default function OrganizerDashboard() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const { user, profile, isConfigured } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Check if user is demo organizer
    const isDemoOrganizer = isDemoUser(user.id);

    if (!isConfigured && !isDemoOrganizer) {
      setLoading(false);
      return;
    }

    loadOrganizerData();
  }, [user, isConfigured]);

  const loadOrganizerData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load organizer profile
      const organizerData = await getOrganizerByUserId(user.id);
      setOrganizer(organizerData);

      // Load organizer events
      let organizerEvents: Event[] = [];
      if (organizerData) {
        organizerEvents = await getOrganizerEvents(organizerData.id);
      } else if (isDemoUser(user.id)) {
        // Use demo events for demo users
        organizerEvents = getDemoEvents();
      }

      setEvents(organizerEvents);
    } catch (error) {
      console.error('Error loading organizer data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from actual events data
  const organizerStats = {
    totalEvents: events.length,
    activeEvents: events.filter(e => e.event_status === 'published').length,
    totalRegistrations: events.reduce((sum, e) => sum + (e.current_participants || 0), 0),
    pendingApprovals: events.filter(e => e.event_status === 'pending').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
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
              {events.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Events Created Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start by creating your first event to connect with students
                  </p>
                  <Button
                    onClick={() => navigate("/create-event")}
                    className="bg-fme-orange hover:bg-fme-orange/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {event.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(event.start_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {event.current_participants}/{event.max_participants || 'Unlimited'}{" "}
                              registered
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              event.event_status === "published"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {event.event_status}
                          </Badge>
                          <Badge variant="outline">
                            {event.event_type}
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
              )}
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
