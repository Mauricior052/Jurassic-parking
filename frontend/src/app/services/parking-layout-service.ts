import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { ParkingLayout, SlotLayout } from '../models/parking-layout';

const SW = 56, SH = 32, GAP_X = 12, GAP_Y = 20, COLS = 9, MARGIN = 20;

@Injectable({ providedIn: 'root' })
export class ParkingLayoutService {
  private http = inject(HttpClient);

  getLayout(parkingId: string, totalSpaces: number): Observable<ParkingLayout> {
    return this.http.get<ParkingLayout>(`/api/parkings/${parkingId}/layout`).pipe(
      catchError(() => of(this.generateDefaultLayout(parkingId, totalSpaces)))
    );
  }

  saveLayout(layout: ParkingLayout): Observable<ParkingLayout> {
    return this.http.put<ParkingLayout>(
      `/api/parkings/${layout.parkingId}/layout`,
      layout
    );
  }

  generateDefaultLayout(parkingId: string, totalSpaces: number): ParkingLayout {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const slots: SlotLayout[] = Array.from({ length: totalSpaces }, (_, i) => {
      const row = Math.floor(i / COLS);
      const col = i % COLS;
      return {
        code: `${letters[row]}${col + 1}`,
        x: MARGIN + col * (SW + GAP_X),
        y: MARGIN + row * (SH + GAP_Y),
        angle: 0,
      };
    });

    const rows = Math.ceil(totalSpaces / COLS);
    const width = MARGIN * 2 + COLS * (SW + GAP_X) - GAP_X;
    const height = MARGIN * 2 + rows * (SH + GAP_Y) - GAP_Y;

    return {
      parkingId,
      viewBox: `0 0 ${width} ${height}`,
      slots,
    };
  }
}