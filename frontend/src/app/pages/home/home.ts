import { Component, inject, signal, effect, computed } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { toast } from 'ngx-sonner';

import { RecordService } from '../../services/record-service';
import { ParkingService } from '../../services/parking-service';
import { ParkingLayoutService } from '../../services/parking-layout-service';
import { ParkingLayout } from '../../models/parking-layout';
import { ParkingMapComponent } from '../../components/parking-map/parking-map';
import { formatCurrency } from '../../utils/formatter';

@Component({
  selector: 'app-home',
  imports: [NgIcon, ParkingMapComponent],
  templateUrl: './home.html',
})
export class Home {
  private recordService = inject(RecordService);
  protected parkingService = inject(ParkingService);
  protected layoutService = inject(ParkingLayoutService);

  public rowData = signal<any[]>([]);

  protected occupied = computed(() => this.rowData().length);
  protected parking = computed(() => this.parkingService.selectedParking());
  protected capacity = computed(() => this.parking()?.totalSpaces ?? 0);
  protected available = computed(() => this.capacity() - this.occupied());

  protected todayEarnings = computed(() => {
    return this.rowData().reduce((acc, record) => {
      if (!record.entryTime) return acc;
      const diff = Date.now() - new Date(record.entryTime).getTime();
      const minutes = Math.ceil(diff / 60000);
      if (minutes <= 5) return acc;
      const price = this.parking()?.price ?? 0;
      return acc + Math.ceil(minutes / 60) * price;
    }, 0);
  });

  protected slots = computed(() => {
    const total = this.capacity();
    const occupiedPlates = new Set(this.rowData().map(r => r.slotCode).filter(Boolean));
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const perRow = 9;
    return Array.from({ length: total }, (_, i) => {
      const letter = letters[Math.floor(i / perRow)];
      const num = (i % perRow) + 1;
      const code = `${letter}${num}`;
      return { code, occupied: occupiedPlates.has(code) };
    });
  });

  protected formatCurrency = formatCurrency;

  constructor() {
    effect(() => {
      const id = this.parkingService.selectedParkingId();
      if (id) {
        this.loadActive(id);
      }
    });
  }

  loadActive(parkingId: string) {
    this.recordService.getActive(parkingId).subscribe((res: any) => {
      this.rowData.set(res);
    });
  }

  protected currentLayout = computed(() => {
    const p = this.parking();
    if (!p) return null;

    if (p.slots?.length) {
      return {
        parkingId: p.id!,
        viewBox: p.viewBox ?? '0 0 600 400',
        slots: p.slots
      };
    }

    return this.layoutService.generateDefaultLayout(p.id!, p.totalSpaces);
  });

  protected occupiedSet = computed(() =>
    new Set(this.rowData().map(r => r.slotCode).filter(Boolean))
  );

  onLayoutChange(layout: ParkingLayout) {
    this.layoutService.saveLayout(layout).subscribe({
      next: () => {
        toast.success('Layout guardado');
        this.parkingService.loadParkings();
      },
      error: () => toast.error('Error al guardar el mapa')
    });
  }
}
