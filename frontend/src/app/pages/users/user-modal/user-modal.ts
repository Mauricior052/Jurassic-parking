import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';

interface UserForm {
  nombre: string;
  email: string;
  id?: string;
}

@Component({
  selector: 'app-user-modal',
  imports: [FormsModule, NgIcon],
  templateUrl: './user-modal.html',
})
export class UserModal {
  isModalOpen = false;
  editing = false;

  form: UserForm = {
    nombre: '',
    email: ''
  };

  constructor() {}

  openModal() {
    this.editing = false;
    this.form = { nombre: '', email: '' };
    this.isModalOpen = true;
  }

  editUser(userData: UserForm) {
    this.editing = true;
    this.form = { ...userData };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    setTimeout(() => {
      this.form = { nombre: '', email: '' };
      this.editing = false;
    }, 200);
  }

  save() {
    
  }
}
