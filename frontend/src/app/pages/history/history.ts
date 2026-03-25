import { DatePipe } from '@angular/common';
import { Component, inject, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RecordService } from '../../services/record-service';
import { NgIcon } from '@ng-icons/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent } from 'ag-grid-community';
import { Record } from '../../models/record';
import { toast } from 'ngx-sonner';
import { ParkingService } from '../../services/parking-service';
import { formatCurrency } from '../../utils/formatter';

@Component({
  selector: 'app-history',
  imports: [FormsModule, NgIcon, AgGridAngular],
  templateUrl: './history.html',
  providers: [DatePipe]
})
export class History implements OnInit {
  private recordService = inject(RecordService);
  private parkingService = inject(ParkingService);
  private datePipe = inject(DatePipe);

  @ViewChild('plateInput') plateInput!: ElementRef<HTMLInputElement>;
  
  public rowData = signal<any[]>([]);
  public parkings = signal<any[]>([]);

  public record = signal<Record>({
    plate: '',
    vehicle: '',
    parking: '69c17b82e4f3717ef313b881'
  });
  private gridApi: any;

  public columnDefs: ColDef[] = [
    { headerName: 'Placa', field: 'plate', flex: 1 },
    { headerName: 'Vehículo', field: 'vehicle', flex: 1 },
    { headerName: 'Entrada', field: 'entryTime', flex: 1, valueFormatter: (params) => this.datePipe.transform(params.value, 'shortTime') || ''},
    { headerName: 'Salida', field: 'exitTime', flex: 1, valueFormatter: (params) => this.datePipe.transform(params.value, 'shortTime') || ''},
    { headerName: 'Tiempo', flex: 1, valueGetter: (params) => this.getDuration(params.data.entryTime) },
    { headerName: 'Estado', field: 'status', flex: 1 },
    { headerName: 'Precio', field: 'totalAmount', flex: .7, valueFormatter: (p) => formatCurrency(p.value) },
    // { headerName: 'Acciones', width: 130,
    //   sortable: false,
    //   filter: false,
    //   resizable: false,
    //   cellRenderer: Actions,
    //   cellRendererParams: () => ({
    //     actions: [
    //       { icon: 'lucideLogOut', tooltip: 'Registrar salida', color: 'emerald', action: (data: any) => this.exitById(data) },
    //       { icon: 'lucideX', tooltip: 'Cancelar', color: 'rose', action: (data: any) => this.cancelById(data) }
    //     ]
    //   }),
    // }
  ];

  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  ngOnInit() {
    this.loadParkings();
    this.loadRecords();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onSearch(event: any) {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi?.setGridOption('quickFilterText', value);
  }

  loadRecords() {
    this.recordService.getAll(this.record().parking).subscribe((res: any) => {
      this.rowData.set(res);
    });
  }

  loadParkings() {
    this.parkingService.getAll().subscribe((res: any) => {
      this.parkings.set(res);
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
              this.loadRecords();
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

  onParkingChange(newParkingId: string) {
    this.record.update(prev => ({ ...prev, parking: newParkingId }));
    this.loadRecords();
  }
}
