import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';

import { User } from '../../models/user';
import { UserService } from '../../services/user-service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-users',
  imports: [FormsModule, AsyncPipe, NgIcon],
  templateUrl: './users.html',
})
export class Users {
  private userService = inject(UserService);

  users$ = this.userService.getUsers();
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
    console.log(resp.users);
  });
  }
  // loadUsers() {
  //   this.loading = true;
  //   this.userService.getUsers().subscribe({
  //     next: (resp) => {
  //       this.users = resp.users;
  //       this.loading = false;
  //     },
  //     error: () => {
  //       this.loading = false;
  //     }
  //   });
  // }

  save() {
    console.log('save');
  }

  edit() {
    console.log('edit');
  }

  delete() {
    console.log('delete');
  }

}
