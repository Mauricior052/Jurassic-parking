import { DatePipe } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RecordService } from '../../services/record-service';
import { NgIcon } from '@ng-icons/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent } from 'ag-grid-community';

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [FormsModule, NgIcon, AgGridAngular],
  templateUrl: './records.html',
  providers: [DatePipe]
})
export class Records implements OnInit {
  private recordService = inject(RecordService);
  private datePipe = inject(DatePipe);

  public rowData = signal<any[]>([]);
  public record: any = {
    plate: '',
    vehicle: ''
  };;
  private gridApi: any;
  private parkingId = '69c17b82e4f3717ef313b881';

  public columnDefs: ColDef[] = [
    { headerName: 'Placa', field: 'plate', flex: 1 },
    { headerName: 'Vehículo', field: 'vehicle', flex: 2 },
    { headerName: 'Entrada', field: 'entryTime', flex: 1, valueFormatter: (params) => this.datePipe.transform(params.value, 'shortTime') || ''},
    { headerName: 'Tiempo', flex: 1, valueGetter: (params) => this.getDuration(params.data.entryTime) },
    { headerName: 'Acción', width: 130,
      sortable: false,
      filter: false,
      cellRenderer: () => {
        return `
          <button class="bg-rose-500 hover:bg-rose-600 text-white px-4 py-1 rounded-xl text-xs font-bold transition-all active:scale-90 shadow-sm cursor-pointer">
            Salida
          </button>
        `;
      },
      onCellClicked: (params) => this.exitById(params.data._id)
    }
  ];

  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  ngOnInit() {
    this.loadActive();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onSearch(event: any) {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi?.setGridOption('quickFilterText', value);
  }

  loadActive() {
    this.recordService.getActive(this.parkingId).subscribe((res: any) => {
      this.rowData.set(res);
      console.log(res);
    });
  }

  registerEntry() {
    if (!this.record.plate) return;
    this.recordService.entry({ 
      plate: this.record.plate, 
      vehicle: this.record.vehicle, 
      parking: this.parkingId 
    }).subscribe(() => {
      this.record.plate = '';
      this.record.vehicle = '';
      this.loadActive();
    });
  }

  registerExit() {
    const record = this.rowData().find(r => r.plate.toUpperCase() === this.record.plate.toUpperCase());
    if (!record) return;
    this.exitById(record._id);
  }

  exitById(id: string) {
    this.recordService.exit(id).subscribe((res: any) => {
      alert(`Total a pagar: $${res.totalAmount}`);
      this.loadActive();
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
}