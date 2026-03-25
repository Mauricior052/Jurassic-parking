export interface Parking {
  id?: string;
  name: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  price: number;
  totalSpaces: number;
  security?: boolean;
  schedule: {
    opening: string;
    closing: string;
  };
  owner: string;
  rating?: number;
}