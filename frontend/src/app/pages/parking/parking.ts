import { ChangeDetectorRef, Component, HostListener, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi } from 'ag-grid-community';
import { NgIcon } from '@ng-icons/core';
import { toast } from 'ngx-sonner';

import { Parking } from '../../models/parking';
import { ParkingService } from '../../services/parking-service';
import { ThemeService } from '../../services/theme-service';
import { Actions } from '../../components/actions/actions';
import { IconComponent } from '../../components/icon/icon-component';

@Component({
  selector: 'app-parking',
  standalone: true,
  imports: [FormsModule, AgGridAngular, NgIcon],
  templateUrl: './parking.html',
})
export class ParkingComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private parkingService = inject(ParkingService);
  protected themeService = inject(ThemeService);

  rowData = signal<Parking[]>([]);
  gridApi!: GridApi;

  form: Parking = this.getEmptyParking();
  editing = false;
  isModalOpen = false;
  loading = false;

  ngOnInit() {
    this.loadParkings();
  }

  loadParkings() {
    this.parkingService.getAll().subscribe({
      next: (res: any) => {
        this.rowData.set(res.parkings || res); 
      },
      error: () => toast.error('Error al cargar los estacionamientos')
    });
  }

  columnDefs: ColDef[] = [
    { field: 'name', headerName: 'Nombre', flex: 2, minWidth: 150 },
    { field: 'address', headerName: 'Dirección', flex: 2, minWidth: 200 },
    { field: 'price', headerName: 'Precio', width: 110, valueFormatter: (p) => `$${p.value}` },
    { field: 'totalSpaces', headerName: 'Cupos', width: 100 },
    { field: 'security', headerName: 'Seguridad', width: 110, cellRenderer: IconComponent,
      cellRendererParams: (params: any) => ({
        icon: params.value ? 'lucideShieldCheck' : 'lucideShieldX',
        color: params.value ? 'green' : 'red'
      })
    },
    { headerName: 'Acciones', width: 120, cellRenderer: Actions,
      cellRendererParams: {
        onEdit: (data: Parking) => this.edit(data),
        onDelete: (data: Parking) => this.delete(data)
      },
      sortable: false, filter: false, resizable: false,
    }
  ];

  defaultColDef: ColDef = {
    sortable: true,
    filter: true
  };

  @HostListener('document:keydown.escape')
  closeOnEscape() {
    this.closeModal();
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
  }

  onSearch(event: any) {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi.setGridOption('quickFilterText', value);
  }

  openModal() {
    this.editing = false;
    this.form = this.getEmptyParking();
    this.isModalOpen = true;
  }

  edit(parking: Parking) {
    this.editing = true;
    this.form = JSON.parse(JSON.stringify(parking));
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.form = this.getEmptyParking();
      this.editing = false;
    }, 100);
  }

  save() {
    if (this.loading) return;

    if (!this.form.name || !this.form.address || this.form.price <= 0) {
      toast.error('Completa los campos obligatorios');
      return;
    }

    this.loading = true;

    if (this.editing) {
      if (!this.form.id) return;
      this.parkingService.updateParking(this.form).subscribe({
        next: () => {
          this.loading = false;
          toast.success('Estacionamiento actualizado correctamente');
          this.loadParkings();
          this.closeModal();
        },
        error: (err) => {
          this.loading = false;
          toast.error(err?.error?.msg || 'Error al actualizar estacionamiento');
        }
      });
    } else {
      this.parkingService.createParking(this.form).subscribe({
        next: () => {
          this.loading = false;
          toast.success('Estacionamiento creado correctamente');
          this.loadParkings();
          this.closeModal();
        },
        error: (err) => {
          this.loading = false;
          toast.error(err?.error?.msg || 'Error al crear estacionamiento');
        }
      });
    }
  }

  delete(parking: Parking) {
    if (!parking.id) return;

    toast(`¿Eliminar parqueo "${parking.name}"?`, {
      action: {
        label: 'Eliminar',
        onClick: () => {
          this.parkingService.deleteParking(parking.id!).subscribe({
            next: () => {
              toast.success('Estacionamiento eliminado');
              this.loadParkings();
            },
            error: (err) => toast.error('Error al eliminar')
          });
        }
      }
    });
  }

  getEmptyParking(): Parking {
    return {
      name: '',
      address: '',
      location: {
        type: 'Point',
        coordinates: [0, 0]
      },
      price: 0,
      totalSpaces: 0,
      security: false,
      schedule: {
        opening: '08:00',
        closing: '20:00'
      },
      owner: ''
    };
  }
}
