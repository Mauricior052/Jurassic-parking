// parking-slot-picker.component.ts
import { Component, input, output, computed, signal } from '@angular/core';
import { Parking } from '../../models/parking';
import { SlotLayout } from '../../models/parking';

const SW = 56, SH = 32;

@Component({
  selector: 'app-parking-slot-picker',
  templateUrl: './parking-slot-picker.html'
})
export class ParkingSlotPickerComponent {
  parking   = input.required<Parking>();
  occupied  = input<Set<string>>(new Set());
  slotPick  = output<SlotLayout>();

  selected  = signal<string | null>(null);

  readonly SW = SW;
  readonly SH = SH;

  slots = computed(() => this.parking().slots ?? []);

  viewBox = computed(() => this.parking().viewBox ?? '0 0 600 400');

  getTransform(slot: SlotLayout): string {
    const cx = slot.x + SW / 2;
    const cy = slot.y + SH / 2;
    return slot.angle
      ? `translate(${cx},${cy}) rotate(${slot.angle})`
      : `translate(${cx},${cy})`;
  }

  slotState(code: string): 'occupied' | 'selected' | 'free' {
    if (this.occupied().has(code)) return 'occupied';
    if (this.selected() === code)  return 'selected';
    return 'free';
  }

  onSlotClick(slot: SlotLayout) {
    if (this.occupied().has(slot.code)) return; // no hace nada si está ocupado
    this.selected.set(slot.code);
  }

  confirm() {
    const code = this.selected();
    if (!code) return;
    const slot = this.slots().find(s => s.code === code);
    if (slot) this.slotPick.emit(slot);
  }

  trackByCode(_: number, s: SlotLayout) { return s.code; }
}