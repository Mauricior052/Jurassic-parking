export interface SlotLayout {
  code: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  angle?: number;
}

export interface ParkingLayout {
  parkingId: string;
  viewBox: string;
  slots: SlotLayout[];
}