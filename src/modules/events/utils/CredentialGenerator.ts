export const generateCredentialId = (eventId: string, personId: string): string => {
  // In a real app, this would be a signed JWT or a hash from the server.
  // For now, we simulate a secure token structure.
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TCKT-${eventId.substring(0, 4).toUpperCase()}-${timestamp}-${random}`;
};

export const generateQRCodeData = (credentialId: string): string => {
  return JSON.stringify({
    t: 'event_ticket',
    id: credentialId,
    v: 1,
  });
};

export const getTicketColorStrength = (role: string): string => {
  switch (role) {
    case 'VOLUNTEER':
      return 'bg-blue-600';
    case 'STAFF':
      return 'bg-purple-600';
    case 'SPEAKER':
      return 'bg-amber-500';
    default:
      return 'bg-black'; // Standard attendee
  }
};
