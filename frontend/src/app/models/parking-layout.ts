export interface SlotLayout {
  code: string;
  x: number;
  y: number;
  width?: number;   // default 50
  height?: number;  // default 30
  angle?: number;   // rotación en grados
}

export interface ParkingLayout {
  parkingId: string;
  viewBox: string;         // ej: "0 0 600 400"
  slots: SlotLayout[];
}