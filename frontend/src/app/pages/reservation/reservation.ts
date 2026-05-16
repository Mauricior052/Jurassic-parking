import { DatePipe } from '@angular/common';
import { Component, inject, signal, ViewChild, ElementRef, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { toast } from 'ngx-sonner';

import { Record } from '../../models/record';
import { RecordService } from '../../services/record-service';
import { ThemeService } from '../../services/theme-service';
import { ParkingService } from '../../services/parking-service';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [FormsModule, NgIcon],
  templateUrl: './reservation.html',
  providers: [DatePipe]
})
export class Reservation {
  private recordService = inject(RecordService);
  private parkingService = inject(ParkingService);
  protected themeService = inject(ThemeService);

  @ViewChild('plateInput') plateInput!: ElementRef<HTMLInputElement>;
  
  // Inicializamos el signal con los valores por defecto para el formulario extendido
  public record = signal<Partial<Record>>({
    plate: '',
    slot: ''
  });

  // Métodos informativos simulados o que puedes conectar a un servicio de estadísticas
  public spacesAvailable = signal<number>(42);
  public currentOccupation = signal<string>('78%');
  public peakHour = signal<string>('14:30');

  constructor() {
    // Monitorea si cambia el estacionamiento seleccionado para resetear o adaptar flujos si es necesario
    effect(() => {
      const id = this.parkingService.selectedParkingId();
      this.clearForm();
    });
  }

  generateTicket() {
    const currentRecord = this.record();
    const parkingId = this.parkingService.selectedParkingId();
    
    // Validaciones de campos obligatorios
    if (!currentRecord.plate?.trim()) { 
      toast.warning('Ingresa una placa válida'); 
      return; 
    }
    if (!currentRecord.slot?.trim()) { 
      toast.warning('Asigna un lugar / cajón'); 
      return; 
    }

    // Construcción del payload extendido para el backend
    const payload = {
      ...currentRecord,
      plate: currentRecord.plate?.trim(),
      vehicle: currentRecord.vehicle || 'Sin descripción',
      parking: { id: parkingId }
    };

    this.recordService.entry(payload).subscribe({
      next: (res: any) => {
        toast.success(`Vehículo ${currentRecord.plate} registrado con éxito`);
        
        // Si tu backend genera un PDF o ticket, aquí podrías manejar su impresión/apertura:
        // if (res.ticketUrl) window.open(res.ticketUrl, '_blank');
        
        this.clearForm();
        setTimeout(() => this.plateInput.nativeElement.focus());
      },
      error: (err) => {
        toast.error('Error al registrar la entrada del vehículo');
        console.error(err);
      }
    });
  }

  clearForm() {
    this.record.set({
      plate: '',
      slot: ''
    });
  }
}