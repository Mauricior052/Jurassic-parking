import { Component, input, output, computed, signal, ElementRef, viewChild } from '@angular/core';
import { ParkingLayout, SlotLayout } from '../../models/parking-layout';

const SW = 56, SH = 32, SNAP = 8;

function snap(v: number): number {
  return Math.round(v / SNAP) * SNAP;
}

@Component({
  selector: 'app-parking-map',
  templateUrl: './parking-map.html',
  styleUrl: './parking-map.css'
})
export class ParkingMapComponent{
  layout = input<ParkingLayout>({
    parkingId: '',
    viewBox: '0 0 600 400',
    slots: []
  });
  layoutChange = output<ParkingLayout>();

  svgRef = viewChild.required<ElementRef<SVGSVGElement>>('svgEl');

  slots = signal<SlotLayout[]>([]);
  selectedIdx = signal<number | null>(null);
  statusMsg = signal('Haz clic en un slot para seleccionarlo.');

  private dragging = false;
  private dragOff = { x: 0, y: 0 };

  readonly SW = SW;
  readonly SH = SH;

  ngOnInit() {
    const initialLayout = this.layout();
    if (initialLayout) {
      const orderedSlots = initialLayout.slots.map((slot, index) => {
        const pos = this.calculateGridPosition(index);
        return { ...slot, x: pos.x, y: pos.y };
      });
      this.slots.set(orderedSlots);
    }
  }

  selectedSlot = computed(() => {
    const idx = this.selectedIdx();
    return idx !== null ? this.slots()[idx] : null;
  });

  // Convierte coordenadas del pointer a coordenadas SVG
  private toSvgPoint(e: PointerEvent): { x: number; y: number } {
    const svg = this.svgRef().nativeElement;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: svgP.x, y: svgP.y };
  }

  private getSlotAt(svgX: number, svgY: number): number {
    const list = this.slots();
    for (let i = list.length - 1; i >= 0; i--) {
      const s = list[i];
      const cx = s.x + SW / 2, cy = s.y + SH / 2;
      const dx = svgX - cx, dy = svgY - cy;
      const ang = -((s.angle ?? 0) * Math.PI) / 180;
      const rx = dx * Math.cos(ang) - dy * Math.sin(ang);
      const ry = dx * Math.sin(ang) + dy * Math.cos(ang);
      if (Math.abs(rx) <= SW / 2 + 3 && Math.abs(ry) <= SH / 2 + 3) return i;
    }
    return -1;
  }

  onPointerDown(e: PointerEvent) {
    const svgP = this.toSvgPoint(e);
    const idx = this.getSlotAt(svgP.x, svgP.y);

    if (idx >= 0) {
      this.selectedIdx.set(idx);
      this.dragging = true;
      this.dragOff = { x: svgP.x - this.slots()[idx].x, y: svgP.y - this.slots()[idx].y };
      (e.target as SVGElement).setPointerCapture(e.pointerId);
      this.statusMsg.set(`Seleccionado: ${this.slots()[idx].code} — arrastra para mover`);
    } else {
      this.selectedIdx.set(null);
      this.statusMsg.set('Haz clic en un slot para seleccionarlo.');
    }
  }

  onPointerMove(e: PointerEvent) {
    if (!this.dragging) return;
    const idx = this.selectedIdx();
    if (idx === null) return;

    const svgP = this.toSvgPoint(e);
    this.slots.update(list => {
      const next = [...list];
      next[idx] = {
        ...next[idx],
        x: snap(svgP.x - this.dragOff.x),
        y: snap(svgP.y - this.dragOff.y),
      };
      return next;
    });
    const s = this.slots()[idx];
    this.statusMsg.set(`${s.code} → (${s.x}, ${s.y})`);
  }

  onPointerUp() {
    this.dragging = false;
  }

  addSlot() {
    const currentSlots = this.slots();
    const nextIndex = currentSlots.length;
    const { x, y } = this.calculateGridPosition(nextIndex);

    const taken = new Set(this.slots().map(s => s.code));
    let code = '';
    for (const l of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      for (let n = 1; n <= 30; n++) {
        const c = `${l}${n}`;
        if (!taken.has(c)) { code = c; break; }
      }
      if (code) break;
    }
    this.slots.update(list => [...list, { code, x, y, angle: 0 }]);
    this.selectedIdx.set(this.slots().length - 1);
    this.statusMsg.set(`Slot ${code} agregado. Arrástralo a su posición.`);
  }

  deleteSelected() {
    const idx = this.selectedIdx();
    if (idx === null) return;
    this.slots.update(list => list.filter((_, i) => i !== idx));
    this.selectedIdx.set(null);
    this.statusMsg.set('Slot eliminado.');
  }

  rotateSelected(deg: number) {
    const idx = this.selectedIdx();
    if (idx === null) return;
    this.slots.update(list => {
      const next = [...list];
      next[idx] = { ...next[idx], angle: ((next[idx].angle ?? 0) + deg + 360) % 360 };
      return next;
    });
  }

  setAngle(angle: number) {
    const idx = this.selectedIdx();
    if (idx === null) return;
    this.slots.update(list => {
      const next = [...list];
      next[idx] = { ...next[idx], angle };
      return next;
    });
  }

  save() {
    this.layoutChange.emit({ ...this.layout(), slots: this.slots() });
    this.statusMsg.set('Layout guardado.');
  }

  getTransform(slot: SlotLayout): string {
    const cx = slot.x + SW / 2, cy = slot.y + SH / 2;
    return slot.angle ? `translate(${cx},${cy}) rotate(${slot.angle})` : `translate(${cx},${cy})`;
  }

  trackByCode(_: number, s: SlotLayout) { return s.code; }

  COLS = 5; 
  GAP = 10;
  private calculateGridPosition(index: number): { x: number, y: number } {
    const col = index % this.COLS;
    const row = Math.floor(index / this.COLS);
    
    // Multiplicamos el índice por el tamaño del slot + el espacio (GAP)
    // Usamos snap para asegurar que se alineen a tu sistema de coordenadas
    return {
      x: snap(col * (this.SW + this.GAP) + this.GAP),
      y: snap(row * (this.SH + this.GAP) + this.GAP)
    };
  }
}