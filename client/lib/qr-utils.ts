import QRCode from 'qrcode';
import type { QRCodeData } from '@shared/types';

export const generateQRCode = async (data: QRCodeData): Promise<string> => {
  try {
    const qrData = JSON.stringify(data);
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 256,
      margin: 2,
      color: {
        dark: '#007BFF', // FindMyEvent blue
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

export const generateTicketQR = async (ticket: any): Promise<string> => {
  const qrData: QRCodeData = {
    ticket_id: ticket.ticket_id,
    event_id: ticket.event_id,
    user_id: ticket.user_id,
    type: ticket.team_name ? 'team' : 'individual',
    issued_at: ticket.created_at,
  };
  
  return generateQRCode(qrData);
};

export const parseQRCode = (qrData: string): QRCodeData | null => {
  try {
    return JSON.parse(qrData);
  } catch (error) {
    console.error('Error parsing QR code:', error);
    return null;
  }
};

export const validateTicketQR = (qrData: QRCodeData, ticket: any): boolean => {
  return (
    qrData.ticket_id === ticket.ticket_id &&
    qrData.event_id === ticket.event_id &&
    qrData.user_id === ticket.user_id
  );
};

export const downloadQRCode = (qrCodeDataURL: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = qrCodeDataURL;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
