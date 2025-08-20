import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  Calendar,
  MapPin,
  Shield,
  Scan,
  UserCheck,
  Camera,
} from "lucide-react";
import QRScanner from "@/components/QRScanner";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useVolunteerAuth } from "@/hooks/use-volunteer-auth";

interface ScanResult {
  success: boolean;
  message: string;
  attendee?: any;
  passType?: string;
}

export default function VolunteerDashboard() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { volunteerSession, logoutVolunteer } = useVolunteerAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [eventStats, setEventStats] = useState({
    totalRegistrations: 0,
    checkedIn: 0,
    pending: 0,
  });

  useEffect(() => {
    // Load event statistics if volunteer session exists
    if (volunteerSession && isSupabaseConfigured) {
      loadEventStats(volunteerSession.event_id);
    }
  }, [volunteerSession]);

  const loadEventStats = async (eventId: string) => {
    try {
      const { data: registrations, error } = await supabase
        .from("registrations")
        .select("*")
        .eq("event_id", eventId);

      if (error) throw error;

      const totalRegistrations = registrations?.length || 0;
      const checkedIn = registrations?.filter(r => r.checked_in_at).length || 0;
      const pending = totalRegistrations - checkedIn;

      setEventStats({
        totalRegistrations,
        checkedIn,
        pending,
      });
    } catch (error) {
      console.error("Error loading event stats:", error);
    }
  };

  const handleQRCodeScan = async (qrData: string) => {
    try {
      if (!isSupabaseConfigured) {
        const mockResult: ScanResult = {
          success: true,
          message: "Demo mode: Ticket validated successfully",
          attendee: {
            full_name: "John Doe",
            email: "john@example.com",
            college: "Demo University",
          },
          passType: "Standard Pass",
        };
        setScanResults(prev => [mockResult, ...prev.slice(0, 4)]);
        return;
      }

      // Extract ticket ID from QR data
      let ticketId = qrData;
      if (qrData.includes("tid=")) {
        ticketId = qrData.split("tid=")[1];
      }

      // Verify ticket
      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .select(`
          *,
          registrations (
            *,
            profiles (full_name, email),
            pass_types (name, price)
          )
        `)
        .eq("id", ticketId)
        .eq("event_id", volunteerSession?.event_id)
        .single();

      if (ticketError || !ticket) {
        const errorResult: ScanResult = {
          success: false,
          message: "Invalid ticket or ticket not found",
        };
        setScanResults(prev => [errorResult, ...prev.slice(0, 4)]);
        return;
      }

      // Check if already scanned
      if (ticket.scanned_at) {
        const duplicateResult: ScanResult = {
          success: false,
          message: `Ticket already scanned at ${new Date(ticket.scanned_at).toLocaleString()}`,
          attendee: ticket.registrations.profiles,
          passType: ticket.registrations.pass_types?.name,
        };
        setScanResults(prev => [duplicateResult, ...prev.slice(0, 4)]);
        return;
      }

      // Mark ticket as scanned
      const { error: updateError } = await supabase
        .from("tickets")
        .update({
          scanned_at: new Date().toISOString(),
          scanned_by: volunteerSession?.id,
        })
        .eq("id", ticketId);

      if (updateError) throw updateError;

      // Update registration check-in status
      const { error: regUpdateError } = await supabase
        .from("registrations")
        .update({
          checked_in_at: new Date().toISOString(),
          checked_in_by: volunteerSession?.id,
        })
        .eq("id", ticket.registration_id);

      if (regUpdateError) throw regUpdateError;

      const successResult: ScanResult = {
        success: true,
        message: "Ticket validated successfully! ✅",
        attendee: ticket.registrations.profiles,
        passType: ticket.registrations.pass_types?.name,
      };
      
      setScanResults(prev => [successResult, ...prev.slice(0, 4)]);
      
      // Reload stats
      loadEventStats(volunteerSession!.event_id);
      
    } catch (error) {
      console.error("Scan error:", error);
      const errorResult: ScanResult = {
        success: false,
        message: "Error processing ticket. Please try again.",
      };
      setScanResults(prev => [errorResult, ...prev.slice(0, 4)]);
    }
  };

  const handleLogout = () => {
    logoutVolunteer();
  };

  if (!volunteerSession) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-green-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Volunteer Dashboard
                  </h1>
                  <p className="text-sm text-gray-600">
                    {volunteerSession.username}
                  </p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-fme-blue" />
              {volunteerSession.event?.title || "Event"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {volunteerSession.event?.venue && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {volunteerSession.event.venue}
                </div>
              )}
              {volunteerSession.event?.event_date && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(volunteerSession.event.event_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Registered</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {eventStats.totalRegistrations}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Checked In</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {eventStats.checkedIn}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {eventStats.pending}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scanner Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Scanner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="w-5 h-5 mr-2" />
                QR Code Scanner
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showScanner ? (
                <div className="text-center py-8">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Scan attendee tickets to check them in
                  </p>
                  <Button
                    onClick={() => setShowScanner(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Scan className="w-4 h-4 mr-2" />
                    Start Scanner
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <QRScanner
                    onScan={handleQRCodeScan}
                    className="w-full"
                  />
                  <Button
                    onClick={() => setShowScanner(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Stop Scanner
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Scans */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="w-5 h-5 mr-2" />
                Recent Scans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scanResults.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No scans yet. Start scanning tickets to see results here.
                  </p>
                ) : (
                  scanResults.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 rounded-lg border"
                    >
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          result.success ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {result.message}
                        </p>
                        {result.attendee && (
                          <div className="mt-1 text-xs text-gray-600">
                            <p className="font-medium">{result.attendee.full_name}</p>
                            <p>{result.attendee.email}</p>
                            {result.passType && (
                              <Badge variant="secondary" className="mt-1">
                                {result.passType}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <QrCode className="w-6 h-6 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">
                  How to use the scanner:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>1. Click "Start Scanner" to activate camera</li>
                  <li>2. Point camera at attendee's QR ticket</li>
                  <li>3. Wait for automatic detection and validation</li>
                  <li>4. Green checkmark = valid entry, Red X = invalid/duplicate</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
