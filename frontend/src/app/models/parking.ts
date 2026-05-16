export interface SlotLayout {
  code: string;
  x: number;
  y: number;
  angle?: number;
}

export interface Parking {
  id?: string;
  name: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  price: number;
  totalSpaces: number;
  security?: boolean;
  schedule: {
    opening: string;
    closing: string;
    days?: string[];
    // days?: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  };
  owner: string;
  rating?: number;
  active?: boolean;
  viewBox?: string;
  slots?: SlotLayout[];
}
