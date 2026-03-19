import { Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-actions',
  imports: [NgIcon],
  templateUrl: './actions.html',
})
export class Actions {
  params: any;

  agInit(params: any): void {
    this.params = params;
  }

  onEdit() {
    if (this.params?.onEdit) {
      this.params.onEdit(this.params.data);
    }
  }

  onDelete() {
    if (this.params?.onDelete) {
      this.params.onDelete(this.params.data);
    }
  }
}
