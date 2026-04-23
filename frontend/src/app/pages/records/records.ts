import { DatePipe } from '@angular/common';
import { Component, inject, signal, ViewChild, ElementRef, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent } from 'ag-grid-community';
import { toast } from 'ngx-sonner';

import { Record } from '../../models/record';
import { RecordService } from '../../services/record-service';
import { ThemeService } from '../../services/theme-service';
import { Actions } from '../../components/actions/actions';
import { formatCurrency } from '../../utils/formatter';
import { ParkingService } from '../../services/parking-service';

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [FormsModule, NgIcon, AgGridAngular],
  templateUrl: './records.html',
  providers: [DatePipe]
})
export class Records {
  private recordService = inject(RecordService);
  private parkingService = inject(ParkingService);
  private datePipe = inject(DatePipe);
  protected themeService = inject(ThemeService);

  @ViewChild('plateInput') plateInput!: ElementRef<HTMLInputElement>;
  
  public rowData = signal<any[]>([]);
  public record = signal<Partial<Record>>({
    plate: '',
    vehicle: ''
  });
  private gridApi: any;
  private intervalId: any;

  constructor() {
    effect(() => {
      const id = this.parkingService.selectedParkingId();
      this.loadActive(id);
    });

    this.intervalId = setInterval(() => {
      if (this.gridApi) {
        this.gridApi.refreshCells({ force: true });
      }
    }, 10000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  public columnDefs: ColDef[] = [
    { headerName: 'Placa', field: 'plate', flex: 2 },
    { headerName: 'Vehículo', field: 'vehicle', flex: 3 },
    { headerName: 'Entrada', field: 'entryTime', width: 120, valueFormatter: (params) => this.datePipe.transform(params.value, 'shortTime') || ''},
    { headerName: 'Tiempo', width: 110, valueGetter: (params) => this.getDuration(params.data.entryTime) },
    { headerName: 'A pagar', width: 100, valueGetter: (p) => this.getAmount(p.data) },
    { headerName: 'Acciones', width: 130, cellRenderer: Actions,
      cellRendererParams: () => ({
        actions: [
          { icon: 'lucideLogOut', tooltip: 'Registrar salida', color: 'emerald', action: (data: any) => this.exitById(data) },
          { icon: 'lucideX', tooltip: 'Cancelar', color: 'rose', action: (data: any) => this.cancelById(data) }
        ]
      }),
      sortable: false, filter: false, resizable: false,
    }
  ];

  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onSearch(event: any) {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi?.setGridOption('quickFilterText', value);
  }

  loadActive(parkingId: string = this.parkingService.selectedParkingId()) {
    this.recordService.getActive(parkingId).subscribe((res: any) => {
      this.rowData.set(res);
    });
  }

  registerEntry() {
    const { plate, vehicle } = this.record();
    const parkingId = this.parkingService.selectedParkingId();
    
    if (!plate) { toast.warning('Ingresa una placa'); return; }
    if (!vehicle) { toast.warning('Ingresa una descripción'); return; }

    this.recordService.entry({ plate, vehicle, parking: { id: parkingId } }).subscribe({
      next: () => {
        toast.success('Vehículo registrado');
        this.record.set({ plate: '', vehicle: '' });
        this.loadActive();
        setTimeout(() => this.plateInput.nativeElement.focus());
      },
      error: (err) => {
        toast.error('Error al registrar entrada');
        console.log(err)
      }
    });
  }

  exitById(record: Record) {
    if (!record.id) return;
    this.recordService.exit(record.id).subscribe({
      next: (res: any) => {
        toast.success(`Salida registrada - Total: $${res.totalAmount}`);
        this.loadActive();
      },
      error: () => {
        toast.error('Error al registrar salida');
      }
    });
  }

  cancelById(record: Record) {
    const id = record.id;
    if (!id) return;
    toast(`Cancelar registro de ${record.plate}?`, {
      action: {
        label: 'Cancelar',
        onClick: () => {
          this.recordService.cancel(id).subscribe({
            next: () => {
              toast.success('Registro cancelado');
              this.loadActive();
            },
            error: (err) => {
              const msg = err?.error?.msg || err?.error?.errors?.email?.msg || 'Error al eliminar usuario';
              toast.error(msg);
            }
          });
        }
      }
    });
  }


  getDuration(entryTime: string) {
    if (!entryTime) return '0h 0m';
    const diff = Date.now() - new Date(entryTime).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  getAmount(record: Record) {
    if (!record.entryTime) return formatCurrency(0, 0);
    const diff = Date.now() - new Date(record.entryTime).getTime();
    const minutes = Math.ceil(diff / 60000);
    if (minutes <= 5) return formatCurrency(0, 0);
    const amount = Math.ceil(minutes / 60) * record.parking.price!;
    return formatCurrency(amount, 0);
  }
}
