import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-users',
  imports: [FormsModule, NgIcon],
  templateUrl: './users.html',
})
export class Users {
  users: User[] = [];
  form: User = {
    nombre: '', email: '',
    password: '',
    google: false,
    role: '',
    id: ''
  };
  editing = false;

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
