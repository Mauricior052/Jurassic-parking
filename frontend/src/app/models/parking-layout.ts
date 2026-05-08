export interface SlotLayout {
  code: string;
  x: number;
  y: number;
  width?: number;   // default 50
  height?: number;  // default 30
  angle?: number;
}

export interface ParkingLayout {
  parkingId: string;
  viewBox: string;
  slots: SlotLayout[];
}