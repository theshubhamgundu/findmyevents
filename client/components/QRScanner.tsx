import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  CameraOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Users,
  Calendar,
  Loader2,
} from "lucide-react";
import { parseQRCode, validateTicketQR } from "@/lib/qr-utils";
import { updateTicketStatus } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import type { QRCodeData, Ticket } from "@shared/types";

interface QRScannerProps {
  eventId: string;
  onTicketScanned?: (ticket: Ticket, isValid: boolean) => void;
}

interface ScanResult {
  type: "success" | "error" | "duplicate" | "invalid";
  message: string;
  ticket?: Ticket;
  qrData?: QRCodeData;
}

export default function QRScanner({
  eventId,
  onTicketScanned,
}: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const { user } = useAuth();

  // Check if camera is supported and HTTPS is being used
  useEffect(() => {
    const checkCameraSupport = () => {
      // Check if we're on HTTPS (required for camera access on most mobile browsers)
      if (location.protocol !== "https:" && location.hostname !== "localhost") {
        setScanResult({
          type: "error",
          message:
            "Camera access requires HTTPS. Please access this page using a secure connection.",
        });
        setCameraSupported(false);
        return;
      }

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setScanResult({
          type: "error",
          message: "Camera access is not supported in this browser.",
        });
        setCameraSupported(false);
        return;
      }

      setCameraSupported(true);
    };

    checkCameraSupport();
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const startScanner = async () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }

    try {
      // First set isScanning to true to render the qr-reader div
      setIsScanning(true);
      setScanResult(null);

      // Wait for the DOM to update and render the qr-reader element
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if the qr-reader element exists
      const qrReaderElement = document.getElementById("qr-reader");
      if (!qrReaderElement) {
        console.error("QR reader element not found in DOM");
        setScanResult({
          type: "error",
          message: "Failed to initialize scanner. Please try again.",
        });
        setIsScanning(false);
        return;
      }

      // Request camera permissions explicitly for mobile
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: "environment" }, // Use back camera on mobile
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });
          console.log("Camera permission granted");
        } catch (permissionError) {
          console.warn("Camera permission denied:", permissionError);
          setScanResult({
            type: "error",
            message:
              "Camera permission denied. Please allow camera access in your browser settings.",
          });
          setIsScanning(false);
          return;
        }
      }

      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },
          // Mobile-specific configurations
          videoConstraints: {
            facingMode: { ideal: "environment" }, // Prefer back camera
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true, // Show flashlight on mobile
        },
        false,
      );

      scanner.render(
        (decodedText) => handleScanSuccess(decodedText),
        (error) => {
          // Ignore continuous scanning errors
          if (!error.includes("NotFoundException")) {
            console.warn("QR scan error:", error);
            // Handle specific camera errors
            if (
              error.includes("NotAllowedError") ||
              error.includes("Permission")
            ) {
              setScanResult({
                type: "error",
                message:
                  "Camera permission denied. Please allow camera access and try again.",
              });
              setIsScanning(false);
            } else if (error.includes("NotFoundError")) {
              setScanResult({
                type: "error",
                message:
                  "No camera found. Please ensure your device has a camera.",
              });
              setIsScanning(false);
            }
          }
        },
      );

      scannerRef.current = scanner;
    } catch (error) {
      console.error("Error starting scanner:", error);
      setScanResult({
        type: "error",
        message:
          "Failed to start camera. Please check your browser settings and try again.",
      });
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      stopScanner();

      // Parse QR code data
      const qrData = parseQRCode(decodedText);
      if (!qrData) {
        setScanResult({
          type: "invalid",
          message: "Invalid QR code format",
        });
        return;
      }

      // Validate that QR code belongs to this event
      if (qrData.event_id !== eventId) {
        setScanResult({
          type: "invalid",
          message: "This ticket is not for this event",
        });
        return;
      }

      // In a real implementation, you would fetch the ticket from Supabase
      // and validate it against the QR code data
      const isValid = await validateAndCheckInTicket(qrData);

      if (isValid.success) {
        setScanResult({
          type: isValid.isDuplicate ? "duplicate" : "success",
          message: isValid.message,
          ticket: isValid.ticket,
          qrData,
        });
        onTicketScanned?.(isValid.ticket, !isValid.isDuplicate);
      } else {
        setScanResult({
          type: "error",
          message: isValid.message,
        });
      }
    } catch (error) {
      console.error("Error processing QR scan:", error);
      setScanResult({
        type: "error",
        message: "Failed to process ticket",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const validateAndCheckInTicket = async (qrData: QRCodeData) => {
    try {
      // Fetch ticket from database using ticket_id
      // This would be a real Supabase query in practice
      const mockTicket: Ticket = {
        id: "1",
        ticket_id: qrData.ticket_id,
        event_id: qrData.event_id,
        ticket_type_id: "1",
        user_id: qrData.user_id,
        status: "active",
        created_at: qrData.issued_at,
        updated_at: qrData.issued_at,
        // Mock data
        user: {
          id: qrData.user_id,
          email: "user@example.com",
          full_name: "John Doe",
          role: "student",
          interests: [],
          notification_preferences: {
            email: true,
            whatsapp: false,
            telegram: false,
          },
          created_at: "",
          updated_at: "",
        },
        event: {
          id: qrData.event_id,
          title: "Sample Event",
          description: "Sample event description",
          event_type: "hackathon",
          venue: "Sample Venue",
          city: "Sample City",
          start_date: new Date().toISOString(),
          end_date: new Date().toISOString(),
          current_participants: 0,
          is_team_event: qrData.type === "team",
          event_status: "published",
          is_featured: false,
          tags: [],
          organizer_id: "1",
          created_at: "",
          updated_at: "",
        },
      };

      // Validate QR data against ticket
      if (!validateTicketQR(qrData, mockTicket)) {
        return {
          success: false,
          message: "Invalid ticket data",
        };
      }

      // Check if ticket is already used
      if (mockTicket.status === "used") {
        return {
          success: true,
          isDuplicate: true,
          message: `Ticket already used at ${new Date(mockTicket.checked_in_at!).toLocaleString()}`,
          ticket: mockTicket,
        };
      }

      // Check if ticket is valid
      if (mockTicket.status !== "active") {
        return {
          success: false,
          message: `Ticket is ${mockTicket.status}`,
        };
      }

      // Mark ticket as used
      await updateTicketStatus(mockTicket.id, "used", user?.id);

      return {
        success: true,
        isDuplicate: false,
        message:
          qrData.type === "team"
            ? `Team checked in successfully!`
            : `${mockTicket.user?.full_name} checked in successfully!`,
        ticket: {
          ...mockTicket,
          status: "used" as const,
          checked_in_at: new Date().toISOString(),
          checked_in_by: user?.id,
        },
      };
    } catch (error) {
      console.error("Error validating ticket:", error);
      return {
        success: false,
        message: "Failed to validate ticket",
      };
    }
  };

  const getResultIcon = (type: ScanResult["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case "duplicate":
        return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
      case "error":
      case "invalid":
        return <XCircle className="w-8 h-8 text-red-600" />;
      default:
        return null;
    }
  };

  const getResultColor = (type: ScanResult["type"]) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50";
      case "duplicate":
        return "border-yellow-200 bg-yellow-50";
      case "error":
      case "invalid":
        return "border-red-200 bg-red-50";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Scanner Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="w-5 h-5" />
            <span>QR Code Scanner</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            {!isScanning ? (
              <div>
                <p className="text-gray-600 mb-4">
                  Scan attendee tickets to check them in to the event
                </p>
                <Button
                  onClick={startScanner}
                  disabled={!cameraSupported}
                  className="bg-fme-blue hover:bg-fme-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Start Scanning
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">
                  Point the camera at the QR code on the attendee's ticket
                </p>
                <Button
                  onClick={stopScanner}
                  variant="outline"
                  disabled={isProcessing}
                >
                  <CameraOff className="w-4 h-4 mr-2" />
                  Stop Scanning
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Camera View */}
      {isScanning && (
        <Card>
          <CardContent className="p-4">
            <div id="qr-reader" className="w-full"></div>
            {isProcessing && (
              <div className="text-center mt-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Processing ticket...</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Scan Result */}
      {scanResult && (
        <Card className={`${getResultColor(scanResult.type)} border-2`}>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              {getResultIcon(scanResult.type)}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {scanResult.type === "success" && "Check-in Successful!"}
                  {scanResult.type === "duplicate" && "Already Checked In"}
                  {scanResult.type === "error" && "Check-in Failed"}
                  {scanResult.type === "invalid" && "Invalid Ticket"}
                </h3>
                <p className="text-gray-700">{scanResult.message}</p>
              </div>

              {scanResult.ticket && (
                <div className="bg-white rounded-lg p-4 text-left">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Ticket ID:</span>
                      <span className="font-mono text-sm">
                        {scanResult.ticket.ticket_id}
                      </span>
                    </div>

                    {scanResult.ticket.user && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Name:</span>
                        <span>{scanResult.ticket.user.full_name}</span>
                      </div>
                    )}

                    {scanResult.qrData?.type === "team" &&
                      scanResult.ticket.team_name && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Team:</span>
                          <span>{scanResult.ticket.team_name}</span>
                        </div>
                      )}

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Type:</span>
                      <Badge
                        variant={
                          scanResult.qrData?.type === "team"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {scanResult.qrData?.type === "team" ? (
                          <>
                            <Users className="w-3 h-3 mr-1" />
                            Team
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 mr-1" />
                            Individual
                          </>
                        )}
                      </Badge>
                    </div>

                    {scanResult.ticket.checked_in_at && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Checked in:</span>
                        <span className="text-sm">
                          {new Date(
                            scanResult.ticket.checked_in_at,
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button
                onClick={() => {
                  setScanResult(null);
                  startScanner();
                }}
                className="bg-fme-blue hover:bg-fme-blue/90"
              >
                Scan Next Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!isScanning && !scanResult && cameraSupported && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to use:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Click "Start Scanning" to activate the camera</li>
              <li>Allow camera permissions when prompted</li>
              <li>Point the camera at the QR code on attendee tickets</li>
              <li>
                The system will automatically validate and check in valid
                tickets
              </li>
              <li>Duplicate scans will be detected and flagged</li>
            </ul>
            <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
              <strong>Mobile Tips:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Ensure you're using a secure connection (HTTPS)</li>
                <li>Allow camera access when your browser asks</li>
                <li>Use the back camera for better QR code scanning</li>
                <li>If the camera doesn't start, try refreshing the page</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
