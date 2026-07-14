export interface Pilgrim {
  name: string;
  age: number;
  gender: string;
  idType: string;
  idNumber: string;
}

export type BookingType = 'darshan' | 'seva' | 'accommodation' | 'prasadam';

export interface Booking {
  id: string;
  type: BookingType;
  bookingDate: string; // date of booking creation
  visitDate: string; // date of visit/event
  status: 'CONFIRMED' | 'CANCELLED';
  transactionId: string;
  amountPaid: number;
  pilgrims: Pilgrim[];
  details: {
    // Darshan specific
    slot?: string; // e.g. "10:00 AM - 11:00 AM"
    entryType?: 'Special Entry' | 'General Entry' | 'Senior Citizen';
    
    // Seva specific
    sevaName?: string; // e.g. "Suprabhata Seva", "Kalyanotsavam"
    deity?: string;
    
    // Accommodation specific
    guesthouseName?: string;
    roomType?: string;
    durationDays?: number;
    checkInTime?: string;
    
    // Prasadam specific
    items?: Array<{ name: string; quantity: number; price: number }>;
  };
}

export interface Donation {
  id: string;
  donorName: string;
  email: string;
  phone: string;
  panNumber?: string;
  amount: number;
  scheme: string; // e.g., "Annadanam Trust", "Pranadanam Trust", "E-Hundi"
  transactionId: string;
  date: string;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface PanchangamData {
  date: string;
  tithi: string;
  nakshatram: string;
  rahukalam: string;
  yamagandam: string;
  gulikakalam: string;
  sunrise: string;
  sunset: string;
  auspiciousTime: string;
  festivals: string[];
}
