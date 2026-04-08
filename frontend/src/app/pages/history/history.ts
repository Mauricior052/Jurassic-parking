import { DatePipe } from '@angular/common';
import { Component, inject, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent } from 'ag-grid-community';
import { toast } from 'ngx-sonner';

import { Record } from '../../models/record';
import { RecordService } from '../../services/record-service';
import { ParkingService } from '../../services/parking-service';
import { ThemeService } from '../../services/theme-service';
import { formatCurrency } from '../../utils/formatter';
import { IconComponent } from '../../components/icon/icon-component';

@Component({
  selector: 'app-history',
  imports: [FormsModule, NgIcon, AgGridAngular],
  templateUrl: './history.html',
  providers: [DatePipe]
})
export class History implements OnInit {
  private recordService = inject(RecordService);
  private parkingService = inject(ParkingService);
  protected themeService = inject(ThemeService);
  private datePipe = inject(DatePipe);

  @ViewChild('plateInput') plateInput!: ElementRef<HTMLInputElement>;
  
  public rowData = signal<any[]>([]);
  public parkings = signal<any[]>([]);

  public record = signal<Record>({
    plate: '',
    vehicle: '',
    parking: {
      id: '69c17b82e4f3717ef313b881'
    }
  });
  private gridApi: any;

  public columnDefs: ColDef[] = [
    { headerName: 'Fecha', field: 'entryTime', width: 110, valueFormatter: (params) => this.datePipe.transform(params.value, 'dd/MM/yy') || '' },
    { headerName: 'Placa', field: 'plate', flex: 2 },
    { headerName: 'Vehículo', field: 'vehicle', flex: 3 },
    { headerName: 'Entrada', field: 'entryTime', width: 110, valueFormatter: (params) => this.datePipe.transform(params.value, 'shortTime') || ''},
    { headerName: 'Salida', field: 'exitTime', width: 110, valueFormatter: (p) => p.value ? (this.datePipe.transform(p.value, 'shortTime') ?? '-') : '-'},
    { headerName: 'Tiempo', field: 'totalMinutes', width: 110, valueFormatter: (p) => p.value ? this.formatMinutes(p.value) : this.getDuration(p.data) },
    { headerName: 'Estado', field: 'status', width: 118, cellRenderer: IconComponent, 
      cellRendererParams: (params: any) => {
        const status = params.value;
        if (status === 'FINISHED') return { icon: 'lucideCheckCircle2', color: '#3b82f6', text: 'Finalizado', size: '17' };
        if (status === 'CANCELLED') return { icon: 'lucideXCircle', color: '#ef4444', text: 'Cancelado', size: '17' };
        return { icon: 'lucideCirclePlay', color: '#16a34a', text: 'En curso', size: '17' };
      }
    },
    { headerName: 'Precio', field: 'totalAmount', width: 100, valueFormatter: (p) => p.value ? formatCurrency(p.value, 0) : '-' },
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
    this.recordService.getAll(this.record().parking.id).subscribe((res: any) => {
      this.rowData.set(res);
    });
  }

  loadParkings() {
    this.parkingService.getAll().subscribe((res: any) => {
      this.parkings.set(res);
    });
  }

  formatMinutes(totalMinutes: number): string {
    if (!totalMinutes || totalMinutes < 0) return '0h 0m';
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.floor(totalMinutes % 60);
    return `${hours}h ${mins}m`;
  }

  getDuration(record: Record) {
    if (!record.entryTime) return '-';
    if (record.status === 'CANCELLED') return '-';
    const diff = Date.now() - new Date(record.entryTime).getTime();
    const minutes = Math.floor(diff / 60000);
    return this.formatMinutes(minutes);
  }

  onParkingChange(newParkingId: string) {
    this.record.update(prev => ({ ...prev, parking: { ...prev.parking, id: newParkingId } }));
    this.loadRecords();
  }
}
