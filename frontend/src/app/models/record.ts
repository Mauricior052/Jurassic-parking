export interface Record {
  id?: string;
  plate: string;
  vehicle: string;
  parking: string;
  user?: string;
  entryTime?: Date;
  exitTime?: Date;
  status?: string;
  totalMinutes?: number;
  totalAmount?: number;
}