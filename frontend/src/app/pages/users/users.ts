import { ChangeDetectorRef, Component, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi } from 'ag-grid-community';
import { NgIcon } from '@ng-icons/core';
import { toast } from 'ngx-sonner';

import { User } from '../../models/user';
import { UserService } from '../../services/user-service';
import { ThemeService } from '../../services/theme-service';
import { Actions } from '../../components/actions/actions';
import { IconComponent } from '../../components/icon/icon-component';

@Component({
  selector: 'app-users',
  imports: [FormsModule, AgGridAngular, NgIcon],
  templateUrl: './users.html',
})
export class Users {
  private cdr = inject(ChangeDetectorRef);
  private userService = inject(UserService);
  protected themeService = inject(ThemeService);

  rowData = signal<User[]>([]);
  users$ = this.userService.getUsers();

  gridApi!: GridApi;

  form: User = this.getEmptyUser();
  editing = false;
  isModalOpen = false;
  loading = false;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe((res: any) => {
      this.rowData.set(res.users);
    });
  }

  columnDefs: ColDef[] = [
    { field: 'name', headerName: 'Nombre', flex: 2, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 3, minWidth: 200 },
    { field: 'google', headerName: 'Cuenta', width: 110, cellRenderer: (params: any) => {
        return params.value
          ? `<div class="text-blue-500 text-sm font-semibold h-full flex items-center">Google</div>`
          : `<div class="text-gray-400 text-sm h-full flex items-center">Email</div>`;
      }
    },
    // { field: 'role', headerName: 'Rol', width: 110, cellRenderer: (params: any) => {
    //     const role = params.value.toLowerCase();
    //     const styles = role === 'admin' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600';
    //     const label = role === 'admin' ? 'Admin' : 'Cliente';
    //     return `
    //       <div class="flex items-center justify-left w-full h-full">
    //         <span class="px-2 py-1 text-xs font-semibold rounded-full ${styles}">
    //           ${label}
    //         </span>
    //       </div>
    //     `;
    //   }
    //  },
    { headerName: 'Rol', field: 'role', width: 80, cellRenderer: IconComponent, 
      cellRendererParams: (params: any) => {
        const role = params.value;
        if (role === 'admin') return { icon: 'lucideShield', color: '#fb7185' };
        if (role === 'client') return { icon: 'lucideUser', color: '#38bdf8' };
        return { icon: 'lucideCircle', color: '#9ca3af' };
      }
    },
    { headerName: 'Acciones', width: 120, cellRenderer: Actions,
      cellRendererParams: {
        onEdit: (data: User) => this.edit(data),
        onDelete: (data: User) => this.delete(data)
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
    const value = event.target.value;
    this.gridApi.setGridOption('quickFilterText', value);
  }

  openModal() {
    this.editing = false;
    this.form = this.getEmptyUser();
    this.isModalOpen = true;
  }

  edit(user: User) {
    this.editing = true;
    this.form = { ...user };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.form = this.getEmptyUser();
      this.editing = false;
    }, 100);
  }

  save() {
    if (this.loading) return;
    
    if (!this.form.name || !this.form.email) {
      toast.error('Completa nombre y correo');
      return;
    }
    if (!this.editing && !this.form.password) {
      toast.error('La contraseña es obligatoria');
      return;
    }

    this.loading = true;

    if (this.editing) {
      if (!this.form.id) return;
      const { password, ...userToUpdate } = this.form;
      this.userService.updateUser(userToUpdate).subscribe({
        next: () => {
          this.loading = false;
          toast.success('Usuario actualizado correctamente');
          this.loadUsers();
          this.closeModal();
        },
        error: (err) => {
          this.loading = false;
          const msg = err?.error?.msg || err?.error?.errors?.email?.msg || 'Error al actualizar usuario';
          toast.error(msg);
          console.log(err)
        }
      });

    } else {
      this.userService.createUser(this.form).subscribe({
        next: () => {
          this.loading = false;
          toast.success('Usuario creado correctamente');
          this.loadUsers();
          this.closeModal();
        },
        error: (err) => {
          this.loading = false;
          const msg = err?.error?.msg || err?.error?.errors?.email?.msg || 'Error al crear usuario';
          toast.error(msg);
          console.log(err)
        }
      });
    }
  }

  delete(user: User) {
    if (!user.id) {
      toast.error('Usuario inválido');
      return;
    }

    toast(`¿Eliminar a ${user.name}?`, {
      action: {
        label: 'Eliminar',
        onClick: () => {
          this.userService.deleteUser(user.id!).subscribe({
            next: () => {
              toast.success('Usuario eliminado');
              this.loadUsers();
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

  getEmptyUser(): User {
    return {
      name: '',
      email: '',
      password: '',
      google: false,
      role: 'client',
      id: ''
    };
  }
}