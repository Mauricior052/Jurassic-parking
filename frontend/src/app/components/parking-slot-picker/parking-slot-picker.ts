import { Component, inject, OnInit, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParkingLayoutService } from '../../services/parking-layout-service';

@Component({
  selector: 'app-parking-slot-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parking-slot-picker.html',
})
export class ParkingSlotPickerComponent implements OnInit {
  parkingId = input.required<string>();
  slotSelected = output<string>();

  slots = signal<any[]>([]);
  viewBox = signal<string>('');
  loading = signal<boolean>(false);
  error = signal<string>('');
  selected = signal<string | null>(null);

  readonly SW = 36;
  readonly SH = 20;

  private parkingService = inject(ParkingLayoutService);

  ngOnInit(): void {
    this.loadParkingData();
  }

  loadParkingData(): void {
    const id = this.parkingId();
    if (!id) {
      this.error.set('Parking inválido');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.parkingService.getSlots(id).subscribe({
      next: (response: any) => {
        this.slots.set(response.slots ?? []);
        this.viewBox.set(response.viewBox ?? '');
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando slots:', err);
        this.error.set('No se pudo cargar el mapa');
        this.loading.set(false);
      }
    });
  }

  getTransform(slot: any): string {
    return `translate(${slot.x}, ${slot.y}) rotate(${slot.angle ?? 0})`;
  }

  slotState(slot: any, selectedCode: string | null): 'occupied' | 'selected' | 'free' {
    if (slot.isOccupied) return 'occupied';
    if (selectedCode === slot.code) return 'selected';
    return 'free';
  }

  onSlotClick(slot: any): void {
    if (slot.isOccupied) return;
    this.selected.set(slot.code);
  }

  confirm(): void {
    const currentSelected = this.selected();
    if (!currentSelected) return;
    this.slotSelected.emit(currentSelected);
  }
}