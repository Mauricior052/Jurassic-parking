import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef } from 'ag-grid-community';

import { User } from '../../models/user';
import { UserService } from '../../services/user-service';
import { Actions } from '../../components/actions/actions';

@Component({
  selector: 'app-users',
  imports: [FormsModule, AsyncPipe, NgIcon, AgGridAngular],
  templateUrl: './users.html',
})
export class Users {
  private userService = inject(UserService);
  rowData: any[] = [];

  ngOnInit() {
    this.userService.getUsers().subscribe((res: any) => {
      this.rowData = res.users;
    });
  }

  users$ = this.userService.getUsers();
  columnDefs: ColDef[] = [
    { field: 'nombre', headerName: 'Nombre', flex: 2, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 3, minWidth: 200 },
    { field: 'google', headerName: 'Google', cellRenderer: (p: boolean) => p ? 'Sí' : 'No', width: 100 },
    { field: 'rol', headerName: 'Rol', cellClass: 'capitalize', width: 100 },
    {
      headerName: 'Acciones',
      cellRenderer: Actions,
      cellRendererParams: {
        onEdit: (data: any) => this.edit(data),
        onDelete: (data: any) => this.delete(data)
      },
      sortable: false,
      filter: false,
      width: 120
    }
  ];
  defaultColDef: ColDef = {
    sortable: true,
    filter: true
  };

  form: User = {
    nombre: '',
    email: '',
    password: '',
    google: false,
    rol: '',
    id: ''
  };
  editing = false;
  loading = false;
  constructor() {
    this.userService.getUsers().subscribe(resp => {
  });
  }

  save() {
    console.log('save');
  }

  edit(data: User) {
    console.log(data);
  }

  delete(data: User) {
    console.log(data);
  }


  gridApi: any;
  onGridReady(params: any) {
    this.gridApi = params.api;
  }
  onSearch(event: any) {
    const value = event.target.value;
    this.gridApi.setGridOption('quickFilterText', value);
  }

}
