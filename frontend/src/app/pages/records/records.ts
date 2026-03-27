import { DatePipe } from '@angular/common';
import { Component, inject, signal, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent } from 'ag-grid-community';
import { toast } from 'ngx-sonner';

import { Record } from '../../models/record';
import { RecordService } from '../../services/record-service';
import { ThemeService } from '../../services/theme-service';
import { Actions } from '../../components/actions/actions';

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
  protected themeService = inject(ThemeService);

  @ViewChild('plateInput') plateInput!: ElementRef<HTMLInputElement>;
  
  public rowData = signal<any[]>([]);
  public record = signal<Record>({
    plate: '',
    vehicle: '',
    parking: '69c17b82e4f3717ef313b881'
  });
  private gridApi: any;

  public columnDefs: ColDef[] = [
    { headerName: 'Placa', field: 'plate', flex: 1 },
    { headerName: 'Vehículo', field: 'vehicle', flex: 2 },
    { headerName: 'Entrada', field: 'entryTime', flex: 1, valueFormatter: (params) => this.datePipe.transform(params.value, 'shortTime') || ''},
    { headerName: 'Tiempo', flex: 1, valueGetter: (params) => this.getDuration(params.data.entryTime) },
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
    this.recordService.getActive(this.record().parking).subscribe((res: any) => {
      this.rowData.set(res);
    });
  }

  registerEntry() {
    const current = this.record();
    if (!current.plate) {
      toast.warning('Ingresa una placa');
      return;
    }
    if (!current.vehicle) {
      toast.warning('Ingresa una descripción para el vehículo');
      return;
    }
    this.recordService.entry(current).subscribe({
    next: () => {
      toast.success('Vehículo registrado');
      this.record.update(prev => ({
        ...prev,
        plate: '',
        vehicle: ''
      }));
      this.loadActive();

      setTimeout(() => {
        this.plateInput.nativeElement.focus();
      });
    },
    error: () => {
      toast.error('Error al registrar entrada');
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
}