import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ParkingLayout, SlotLayout } from '../models/parking-layout';
import { environment } from '../../environments/environment';

const SW = 56, SH = 32, GAP_X = 12, GAP_Y = 20, COLS = 9, MARGIN = 20;
const base_url = environment.base_url;

@Injectable({ providedIn: 'root' })

export class ParkingLayoutService {
  private http = inject(HttpClient);

  get headers() {
    return {
      headers: new HttpHeaders({
        'token': localStorage.getItem('token') || ''
      })
    };
  }

  saveLayout(layout: ParkingLayout): Observable<ParkingLayout> {
    console.log(layout)
    return this.http.patch<ParkingLayout>(
      `${base_url}/parking/${layout.parkingId}/layout`,
      { viewBox: layout.viewBox, slots: layout.slots },
      this.headers
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