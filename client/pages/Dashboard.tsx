import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  QrCode,
  Bell,
  Ticket as TicketIcon,
  TrendingUp,
  Users,
  Plus,
  MapPin,
  Clock,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Building,
  Search,
  Filter,
  Star,
  Target,
  Flame,
  Navigation2,
  Bookmark,
  Loader2,
  Heart,
  Share,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getUserTickets,
  getOrganizerByUserId,
  getOrganizerEvents,
  getUserNotifications,
  markNotificationAsRead,
  updateEventAnalytics,
  getEvents,
} from "@/lib/supabase";
import { generateTicketQR, downloadQRCode } from "@/lib/qr-utils";
import { formatCurrency } from "@/lib/payment-utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Ticket, Event, Notification, Organizer } from "@shared/types";

export default function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);
  const [nearbyEvents, setNearbyEvents] = useState<Event[]>([]);
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingQR, setGeneratingQR] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("home");
  const { user, profile, isConfigured } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Redirect admin users to admin dashboard
    if (profile?.role === "admin") {
      navigate("/admin/dashboard");
      return;
    }

    // Redirect organizer users to organizer dashboard
    if (profile?.role === "organizer") {
      navigate("/organizer/dashboard");
      return;
    }

    loadDashboardData();
  }, [user, profile, navigate]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load user tickets
      const userTickets = await getUserTickets(user.id);
      setTickets(userTickets);

      // Load all events for categorization
      const allEvents = await getEvents();

      // For students, categorize events
      if (profile?.role === "student") {
        // Recommended events based on user interests
        const recommended = allEvents
          .filter((event) => {
            if (!profile?.interests || profile.interests.length === 0)
              return true;
            return profile.interests.some(
              (interest) =>
                event.event_type === interest ||
                event.tags?.some((tag) =>
                  profile.interests.includes(tag.toLowerCase()),
                ),
            );
          })
          .slice(0, 6);

        // Trending events (mock - in real app would be based on registrations)
        const trending = allEvents
          .sort(
            (a, b) =>
              (b.current_participants || 0) - (a.current_participants || 0),
          )
          .slice(0, 6);

        // Nearby events (mock - in real app would use user location)
        const nearby = allEvents
          .filter((event) =>
            profile?.city
              ? event.city.toLowerCase().includes(profile.city.toLowerCase())
              : false,
          )
          .slice(0, 6);

        // Mock saved events
        const saved = allEvents.slice(0, 3);

        setRecommendedEvents(recommended);
        setTrendingEvents(trending);
        setNearbyEvents(nearby);
        setSavedEvents(saved);
      }

      // Load organizer data if user is organizer
      if (profile?.role === "organizer") {
        const organizerData = await getOrganizerByUserId(user.id);
        setOrganizer(organizerData);

        if (organizerData) {
          const organizerEvents = await getOrganizerEvents(organizerData.id);
          setEvents(organizerEvents);
        }
      }

      // Load notifications
      const userNotifications = await getUserNotifications(user.id);
      setNotifications(userNotifications);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async (ticket: Ticket) => {
    try {
      setGeneratingQR(ticket.id);
      const qrCode = await generateTicketQR(ticket);
      downloadQRCode(qrCode, `ticket-${ticket.ticket_id}.png`);
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setGeneratingQR(null);
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleSaveEvent = (eventId: string) => {
    // Mock save functionality
    console.log("Saving event:", eventId);
  };

  const handleShareEvent = (event: Event) => {
    // Mock share functionality
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.origin + `/events/${event.id}`,
      });
    } else {
      // Fallback to copy link
      navigator.clipboard.writeText(
        window.location.origin + `/events/${event.id}`,
      );
    }
  };

  const getUpcomingEvents = () => {
    return tickets
      .filter((ticket) => {
        if (!ticket.event) return false;
        const eventDate = new Date(ticket.event.start_date);
        return eventDate > new Date() && ticket.status === "active";
      })
      .slice(0, 5);
  };

  const getUnreadNotifications = () => {
    return notifications.filter((n) => !n.is_read);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-fme-orange mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Login Required</h2>
              <p className="text-gray-600 mb-4">
                Please log in to access your dashboard.
              </p>
              <Button
                onClick={() => navigate("/login")}
                className="bg-fme-blue hover:bg-fme-blue/90"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const upcomingEvents = getUpcomingEvents();
  const unreadNotifications = getUnreadNotifications();

  // Student Dashboard Layout
  if (profile?.role === "student") {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header with Search */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Hi, {profile?.full_name?.split(" ")[0]}! 👋
                  </h1>
                  <p className="text-gray-600">
                    Discover amazing tech events near you
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setActiveView("notifications")}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    {unreadNotifications.length > 0 && (
                      <Badge
                        variant="destructive"
                        className="ml-1 px-1 min-w-[1.2rem] h-5"
                      >
                        {unreadNotifications.length}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-2xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search events, colleges, organizers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-12 py-3"
                />
                <Button
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => navigate(`/events?q=${searchQuery}`)}
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Calendar className="w-8 h-8 text-fme-blue mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">
                        {upcomingEvents.length}
                      </p>
                      <p className="text-sm text-gray-600">Upcoming</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TicketIcon className="w-8 h-8 text-fme-orange mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">
                        {tickets.length}
                      </p>
                      <p className="text-sm text-gray-600">My Tickets</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Bookmark className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">
                        {savedEvents.length}
                      </p>
                      <p className="text-sm text-gray-600">Saved</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Bell className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">
                        {unreadNotifications.length}
                      </p>
                      <p className="text-sm text-gray-600">Alerts</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeView} onValueChange={setActiveView}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="home">
                      <Calendar className="w-4 h-4 mr-2" />
                      Home
                    </TabsTrigger>
                    <TabsTrigger value="explore">
                      <Search className="w-4 h-4 mr-2" />
                      Explore
                    </TabsTrigger>
                    <TabsTrigger value="tickets">
                      <TicketIcon className="w-4 h-4 mr-2" />
                      My Events
                    </TabsTrigger>
                    <TabsTrigger value="profile">
                      <Users className="w-4 h-4 mr-2" />
                      Profile
                    </TabsTrigger>
                  </TabsList>

                  {/* Home Feed */}
                  <TabsContent value="home" className="space-y-8">
                    {/* Recommended Events */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold flex items-center">
                          <Target className="w-5 h-5 mr-2 text-fme-blue" />
                          Recommended for You
                        </h2>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveView("explore")}
                        >
                          View All
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recommendedEvents.map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            onSave={handleSaveEvent}
                            onShare={handleShareEvent}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Trending Events */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold flex items-center">
                          <Flame className="w-5 h-5 mr-2 text-fme-orange" />
                          Trending Events
                        </h2>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveView("explore")}
                        >
                          View All
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trendingEvents.map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            onSave={handleSaveEvent}
                            onShare={handleShareEvent}
                            showTrending
                          />
                        ))}
                      </div>
                    </div>

                    {/* Nearby Events */}
                    {nearbyEvents.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-semibold flex items-center">
                            <Navigation2 className="w-5 h-5 mr-2 text-green-500" />
                            Nearby Events
                          </h2>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveView("explore")}
                          >
                            View All
                          </Button>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {nearbyEvents.map((event) => (
                            <EventCard
                              key={event.id}
                              event={event}
                              onSave={handleSaveEvent}
                              onShare={handleShareEvent}
                              showDistance
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Explore */}
                  <TabsContent value="explore">
                    <div className="text-center py-12">
                      <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Explore All Events
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Discover events by category, location, or search
                      </p>
                      <Button
                        onClick={() => navigate("/events")}
                        className="bg-fme-blue hover:bg-fme-blue/90"
                      >
                        Browse All Events
                      </Button>
                    </div>
                  </TabsContent>

                  {/* My Events/Tickets */}
                  <TabsContent value="tickets" className="space-y-6">
                    {upcomingEvents.length === 0 ? (
                      <div className="text-center py-12">
                        <TicketIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          No Events Yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Register for events to see your tickets here
                        </p>
                        <Button
                          onClick={() => navigate("/events")}
                          className="bg-fme-blue hover:bg-fme-blue/90"
                        >
                          Find Events
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold">
                          My Registered Events
                        </h2>
                        {upcomingEvents.map((ticket) => (
                          <Card key={ticket.id}>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="w-12 h-12 bg-fme-blue/10 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-fme-blue" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">
                                      {ticket.event?.title}
                                    </h4>
                                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                                      <span className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {new Date(
                                          ticket.event?.start_date!,
                                        ).toLocaleDateString()}
                                      </span>
                                      <span className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {ticket.event?.venue}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleGenerateQR(ticket)}
                                  disabled={generatingQR === ticket.id}
                                  className="bg-fme-blue hover:bg-fme-blue/90"
                                >
                                  <QrCode className="w-4 h-4 mr-2" />
                                  {generatingQR === ticket.id
                                    ? "Generating..."
                                    : "Get QR"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Profile */}
                  <TabsContent value="profile">
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Profile Settings
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Manage your preferences and account settings
                      </p>
                      <Button
                        onClick={() => navigate("/profile")}
                        className="bg-fme-blue hover:bg-fme-blue/90"
                      >
                        Edit Profile
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Organizer Dashboard (existing implementation)
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Organizer Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your events and track registrations
            </p>
          </div>

          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Complete organizer dashboard functionality
            </h3>
            <p className="text-gray-600 mb-6">
              Advanced organizer features will be implemented based on the
              organizer flow specifications.
            </p>
            <Button
              onClick={() => navigate("/create-event")}
              className="bg-fme-orange hover:bg-fme-orange/90"
            >
              Create Event
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Event Card Component
function EventCard({
  event,
  onSave,
  onShare,
  showTrending = false,
  showDistance = false,
}: {
  event: Event;
  onSave: (id: string) => void;
  onShare: (event: Event) => void;
  showTrending?: boolean;
  showDistance?: boolean;
}) {
  const navigate = useNavigate();
  const eventDate = new Date(event.start_date);
  const cheapestTicket =
    event.ticket_types?.reduce((min, ticket) =>
      ticket.price < min.price ? ticket : min,
    ) || event.ticket_types?.[0];

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <Badge variant="outline" className="text-xs">
            {event.event_type.toUpperCase()}
          </Badge>
          <div className="flex items-center space-x-1">
            {showTrending && <Fire className="w-4 h-4 text-fme-orange" />}
            {showDistance && <Navigation className="w-4 h-4 text-green-500" />}
            <button onClick={() => onSave(event.id)}>
              <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
            </button>
            <button onClick={() => onShare(event)}>
              <Share className="w-4 h-4 text-gray-400 hover:text-fme-blue" />
            </button>
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-1 mb-3 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-2" />
            {eventDate.toLocaleDateString()}
          </div>
          <div className="flex items-center">
            <MapPin className="w-3 h-3 mr-2" />
            <span className="truncate">{event.city}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-3 h-3 mr-2" />
            {event.current_participants} registered
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-fme-orange">
            {cheapestTicket?.price === 0 ? "Free" : `₹${cheapestTicket?.price}`}
          </div>
          <Button
            size="sm"
            className="bg-fme-blue hover:bg-fme-blue/90 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => navigate(`/events/${event.id}`)}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
