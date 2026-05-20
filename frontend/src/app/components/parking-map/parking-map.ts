import { Component, input, output, computed, signal, ElementRef, viewChild, OnInit, inject, effect } from '@angular/core';
import { ParkingLayout, SlotLayout } from '../../models/parking-layout';
import { ParkingLayoutService } from '../../services/parking-layout-service';

const SW = 40, SH = 28, SNAP = 8;

function snap(v: number): number {
  return Math.round(v / SNAP) * SNAP;
}

@Component({
  selector: 'app-parking-map',
  templateUrl: './parking-map.html',
  styleUrl: './parking-map.css'
})
export class ParkingMapComponent {
  parkingId = input.required<string>();
  
  layoutChange = output<ParkingLayout>();

  private parkingService = inject(ParkingLayoutService);

  svgRef = viewChild.required<ElementRef<SVGSVGElement>>('svgEl');

  viewBox = signal<string>('0 0 800 600');
  slots = signal<SlotLayout[]>([]);
  selectedIdx = signal<number | null>(null);
  statusMsg = signal('Cargando layout...');

  private dragging = false;
  private dragOff = { x: 0, y: 0 };

  readonly SW = SW;
  readonly SH = SH;

  constructor() {
    effect(() => {
      const id = this.parkingId();
      if (!id) return;
      this.loadLayout(id);
    });
  }

  private loadLayout(id: string): void {
    console.log(this.parkingId());
    this.parkingService.getSlots(this.parkingId()).subscribe({
      next: (res: any) => {
        const fetchedSlots: any[] = Array.isArray(res) ? res : (res?.slots || []);
        const spacesCount = fetchedSlots.length;
        let layoutInfo: ParkingLayout;

        if (spacesCount === 0) {
          // Si no hay cajones, inicializamos vacío
          layoutInfo = { parkingId: this.parkingId(), viewBox: '0 0 800 600', slots: [] };
        } else {
          // Revisamos si los slots que llegaron ya tienen coordenadas
          const hasLayout = fetchedSlots.some(s => s.x !== undefined && s.y !== undefined);

          if (hasLayout) {
            layoutInfo = {
              parkingId: this.parkingId(),
              viewBox: res.viewBox || '0 0 800 600',
              slots: fetchedSlots
            };
          } else {
            console.log(`Generando layout por defecto para ${spacesCount} slots...`);
            // Generamos las posiciones por defecto basándonos en el length del arreglo
            const defaultLayout = this.parkingService.generateDefaultLayout(this.parkingId(), spacesCount);
            
            layoutInfo = {
              parkingId: this.parkingId(),
              viewBox: defaultLayout.viewBox,
              // Combinamos la data original (code, isOccupied) con las coordenadas calculadas (x, y)
              slots: fetchedSlots.map((slot, i) => ({
                ...slot,
                x: defaultLayout.slots[i].x,
                y: defaultLayout.slots[i].y,
                angle: defaultLayout.slots[i].angle,
                isOccupied: slot.isOccupied ?? false
              }))
            };
          }
        }

        this.applyLayout(layoutInfo);
      },
      error: (err) => {
        console.error('Error al cargar slots del estacionamiento:', err);
        this.applyLayout({ parkingId: this.parkingId(), viewBox: '0 0 800 600', slots: [] });
        this.statusMsg.set('Error al cargar los datos.');
      }
    });
  }

  private applyLayout(layout: ParkingLayout) {
    if (layout.viewBox) {
      this.viewBox.set(layout.viewBox);
    }
    
    const mappedSlots = layout.slots.map(slot => ({
      ...slot,
      angle: slot.angle ?? 0,
      isOccupied: slot.isOccupied ?? false
    }));
    
    this.slots.set(mappedSlots);
    this.statusMsg.set('Haz clic en un slot para seleccionarlo.');
  }

  selectedSlot = computed(() => {
    const idx = this.selectedIdx();
    return idx !== null ? this.slots()[idx] : null;
  });

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
      
      const slot = this.slots()[idx];
      const estado = slot.isOccupied ? '(Ocupado)' : '(Libre)';
      this.statusMsg.set(`Seleccionado: ${slot.code} ${estado} — arrastra para mover`);
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
    this.layoutChange.emit({ 
      parkingId: this.parkingId(), 
      slots: this.slots(),
      viewBox: this.viewBox()
    });
    this.statusMsg.set('Cambios preparados para guardar...');
  }

  getTransform(slot: SlotLayout): string {
    const cx = slot.x + SW / 2, cy = slot.y + SH / 2;
    return slot.angle ? `translate(${cx},${cy}) rotate(${slot.angle})` : `translate(${cx},${cy})`;
  }

  trackByCode(_: number, s: SlotLayout) { return s.code; }
}