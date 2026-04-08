export interface Record {
  id?: string;
  plate: string;
  vehicle: string;
  parking: {
    id: string;
    name?: string;
    price?: number;
  };
  user?: string;
  entryTime?: Date;
  exitTime?: Date;
  status?: string;
  totalMinutes?: number;
  totalAmount?: number;
}