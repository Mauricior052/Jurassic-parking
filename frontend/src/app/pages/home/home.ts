import { Component, inject, signal, effect, computed } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { RecordService } from '../../services/record-service';
import { ParkingService } from '../../services/parking-service';
import { formatCurrency } from '../../utils/formatter';

@Component({
  selector: 'app-home',
  imports: [NgIcon],
  templateUrl: './home.html',
})
export class Home {
  private recordService = inject(RecordService);
  protected parkingService = inject(ParkingService);

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
      if (id) this.loadActive(id);
    });
  }

  loadActive(parkingId: string) {
    this.recordService.getActive(parkingId).subscribe((res: any) => {
      this.rowData.set(res);
    });
  }
}
