import { DatePipe } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { RecordService } from '../../services/record-service';
import { ParkingService } from '../../services/parking-service';
import { ParkingSlotPickerComponent } from '../../components/parking-slot-picker/parking-slot-picker';
import { UserService } from '../../services/user-service';
import { VehicleService } from '../../services/vehicle.service';
import { VehicleModel } from '../../models/vehicle';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [FormsModule, ParkingSlotPickerComponent, NgIcon],
  templateUrl: './reservation.html',
  providers: [DatePipe]
})
export class Reservation implements OnInit {
  private recordService  = inject(RecordService);
  private parkingService = inject(ParkingService);
  private userService    = inject(UserService);
  private vehicleService = inject(VehicleService);
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);

  public user       = signal<any>(null);
  public parking       = signal<any>(null);
  public slots         = signal<any[]>([]);
  public selectedSlot  = signal<any>(null);
  public estimatedHours = signal<number>(1);
  public loading       = signal<boolean>(false);
  public occupiedSlots = signal<Set<string>>(new Set());

  public vehicles        = this.vehicleService.vehicles;
  public selectedVehicle = signal<VehicleModel | null>(null);
  public selectedPayment = signal<string>('credit');

  readonly typeIcon: { [key: string]: string } = {
    Auto: 'lucideCar',
    Moto: 'lucideBike',
    Camioneta: 'lucideTruck'
  };
  public showVehicleMenu = signal(false);

  ngOnInit() {
    const parkingId = this.route.snapshot.paramMap.get('parking');
    if (parkingId) this.loadParking(parkingId);
    this.loadVehicles();
    this.loadUser();
  }

  loadUser() {
    this.userService.getUserById(this.userService.usuario!.id!).subscribe({
      next: (user: any) => {
        this.user.set(user.user);
      }
    })
  }

  loadParking(id: string) {
    this.parkingService.getById(id).subscribe((res: any) => {
      this.parking.set(res);
      this.slots.set(res.slots);
    });
  }

  loadVehicles() {
    this.vehicleService.getByUser().subscribe({
      next: (res: any) => this.vehicleService.vehicles.set(res),
      error: () => {}
    });
  }

  get estimatedCost(): number {
    return (this.parking()?.price ?? 0) * this.estimatedHours();
  }

  get availableSlots(): number {
    return this.slots().filter(s => !s.occupied).length;
  }

  onSlotSelected(slot: any) {
    console.log('Slot seleccionado:', slot);
    this.selectedSlot.set(slot);
  }

  selectVehicle(v: VehicleModel) {
    this.selectedVehicle.set(
      this.selectedVehicle()?.id === v.id ? null : v
    );
  }

  changeHours(delta: number) {
    this.estimatedHours.update(h => Math.max(1, h + delta));
  }

  reserve() {
    const slot    = this.selectedSlot();
    const vehicle = this.selectedVehicle();
    const parkingId = this.parking()?.id;
    const user    = this.userService.usuario;

    if (!vehicle) { toast.warning('Selecciona un vehículo'); return; }
    if (!slot)    { toast.warning('Selecciona un cajón'); return; }
    if (!this.isCardComplete) { toast.warning('Completa los datos de tu tarjeta'); return; }

    this.loading.set(true);

    const payload = {
      plate:    vehicle.plate,
      vehicle:  vehicle.description,
      slotCode: slot,
      parking:  { id: parkingId },
      user:     user?.id,
    };

    this.recordService.entry(payload).subscribe({
      next: () => {
        toast.success(`Reserva confirmada — Cajón ${slot.code}`);
        this.router.navigate(['/reservations']);
        this.loading.set(false);
      },
      error: () => {
        toast.error('Error al confirmar la reserva');
        this.loading.set(false);
      }
    });
  }

  public showCardModal = signal(false);
  public cardNumber = signal('');
  public cardExpiry = signal('');
  public cardCvv = signal('');

  openCardModal() {
    const savedCard = this.user()?.number;
    if (savedCard) {
      toast.info('Utilizando la tarjeta vinculada a tu perfil');
      return;
    }
    this.showCardModal.set(true);
  }

  closeCardModal() {
    this.showCardModal.set(false);
  }

  confirmCard() {
    if (this.cardNumber().replace(/\s/g, '').length < 16) { toast.warning('Número de tarjeta inválido'); return; }
    if (!this.cardExpiry().match(/^\d{2}\/\d{2}$/)) { toast.warning('Fecha de vencimiento inválida'); return; }
    if (this.cardCvv().length < 3) { toast.warning('CVV inválido'); return; }
    this.showCardModal.set(false);
    toast.success('Tarjeta registrada');
  }

  formatCardNumber(value: string) {
    const clean = value.replace(/\D/g, '').slice(0, 16);
    const parts = clean.match(/.{1,4}/g) ?? [];
    this.cardNumber.set(parts.join(' '));
  }

  formatExpiry(value: string) {
    const clean = value.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) {
      this.cardExpiry.set(clean.slice(0, 2) + '/' + clean.slice(2));
    } else {
      this.cardExpiry.set(clean);
    }
  }

  get cardSummary(): string {
    const savedCard = this.user()?.number;
    if (savedCard) {
      const cleanSaved = savedCard.replace(/\s/g, '');
      return '**** **** **** ' + cleanSaved.slice(-4);
    }

    const n = this.cardNumber();
    return n ? '**** **** **** ' + n.replace(/\s/g, '').slice(-4) : '—';
  }

  get isCardComplete(): boolean {
    const savedCard = this.user()?.numero || this.user()?.number;
    if (savedCard && savedCard.replace(/\s/g, '').length >= 4) {
      return true;
    }
    return this.cardNumber().replace(/\s/g, '').length === 16 &&
           !!this.cardExpiry().match(/^\d{2}\/\d{2}$/) &&
           this.cardCvv().length >= 3;
  }
  
  formatCvv(value: string) {
    this.cardCvv.set(value.replace(/\D/g, '').slice(0, 4));
  }
}