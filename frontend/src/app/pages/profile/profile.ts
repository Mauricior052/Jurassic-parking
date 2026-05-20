import { Component, inject, signal, OnInit, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { VehicleService } from '../../services/vehicle.service';
import { UserService } from '../../services/user-service';
import { VehicleModel } from '../../models/vehicle';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-profile',
  imports: [ FormsModule, NgIcon ],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  private vehicleService = inject(VehicleService);
  private userService = inject(UserService);

  public user = this.userService.usuario;
  public vehicles = this.vehicleService.vehicles;

  public showForm = signal(false);
  public loading = signal(false);
  public editingVehicle = signal<VehicleModel | null>(null);

  public form = signal<VehicleModel>({ plate: '', description: '', type: 'Auto' });

  readonly types = ['Auto', 'Moto', 'Camioneta'];
  readonly typeIcon: { [key: string]: string } = {
    Auto: 'lucideCar',
    Moto: 'lucideBike',
    Camioneta: 'lucideTruck'
  };

  cardForm = signal<any>({
    number: '',
    titular: '',
    expiry: '',
    cvv: ''
  });

  savingCard = signal<boolean>(false);

  hasCard = computed(() => {
    const card = this.cardForm();
    return card.number.length === 19; 
  });

  ngOnInit() {
    this.loadVehicles();
    this.userService.getUserById(this.user!.id!).subscribe({
      next: (user: any) => {
        console.log(user.user)
        this.userService.setUsuario(user.user);
        this.cardForm.set({
          number: user.user.number || '',
          titular: user.user.titular || '',
          expiry: user.user.expiry || '',
          cvv: '***'
        });
      },
      error: () => toast.error('Error al cargar datos del usuario')
    });
  }

  loadVehicles() {
    this.vehicleService.getByUser().subscribe({
      next: (res: any) => this.vehicleService.vehicles.set(res),
      error: () => toast.error('Error al cargar vehículos')
    });
  }

  openForm(vehicle?: VehicleModel) {
    if (vehicle) {
      this.editingVehicle.set(vehicle);
      this.form.set({ ...vehicle });
    } else {
      this.editingVehicle.set(null);
      this.form.set({ plate: '', description: '', type: 'Auto' });
    }
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingVehicle.set(null);
    this.form.set({ plate: '', description: '', type: 'Auto' });
  }

  updateForm(field: keyof VehicleModel, value: string) {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  save() {
    const v = this.form();
    if (!v.plate.trim()) { toast.warning('Ingresa la placa'); return; }
    if (!v.description.trim()) { toast.warning('Ingresa una descripción'); return; }

    this.loading.set(true);
    const editing = this.editingVehicle();

    const request$ = editing
      ? this.vehicleService.updateVehicle({ ...v, id: editing.id })
      : this.vehicleService.createVehicle(v);

    request$.subscribe({
      next: () => {
        toast.success(editing ? 'Vehículo actualizado' : 'Vehículo registrado');
        this.loadVehicles();
        this.closeForm();
        this.loading.set(false);
      },
      error: () => {
        toast.error('Error al guardar vehículo');
        this.loading.set(false);
      }
    });
  }

  delete(id: string) {
    toast('¿Eliminar este vehículo?', {
      action: {
        label: 'Eliminar',
        onClick: () => {
          this.vehicleService.deleteVehicle(id).subscribe({
            next: () => {
              toast.success('Vehículo eliminado');
              this.loadVehicles();
            },
            error: () => toast.error('Error al eliminar')
          });
        }
      }
    });
  }

  formatCard(field: keyof any, value: string) {
    let formattedValue = value;

    switch (field) {
      case 'number':
        formattedValue = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19);
        break;

      case 'expiry':
        formattedValue = value.replace(/\D/g, '');
        if (formattedValue.length > 2) {
          formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2, 4);
        }
        break;

      case 'cvv':
        formattedValue = value.replace(/\D/g, '').substring(0, 4);
        break;

      case 'titular':
        formattedValue = value.toUpperCase();
        break;
    }
    this.cardForm.update(form => ({
      ...form,
      [field]: formattedValue
    }));
  }

  saveCard() {
    const form = this.cardForm();
    if (!form.number || !form.titular || !form.expiry || !form.cvv) {
      toast.warning('Por favor completa todos los campos de la tarjeta');
      return;
    }
    this.savingCard.set(true);
    console.log(form)
    this.userService.updateCard(form).subscribe({
      next: () => {
        this.savingCard.set(false);
        toast.success('Tarjeta actualizada exitosamente');
      },
      error: () => {
        this.savingCard.set(false);
        toast.error('Error al actualizar la tarjeta');
      }
    });
  }
}