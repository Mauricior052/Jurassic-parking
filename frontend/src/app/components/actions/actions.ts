import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-actions',
  imports: [CommonModule, NgIcon],
  templateUrl: './actions.html',
})
export class Actions {
  params: any;
  actions: any[] = [];

  defaultActions = [
    {
      icon: 'lucidePencil',
      tooltip: 'Editar',
      color: 'amber',
      action: (data: any) => this.params?.onEdit?.(data)
    },
    {
      icon: 'lucideTrash2',
      tooltip: 'Eliminar',
      color: 'rose',
      action: (data: any) => this.params?.onDelete?.(data)
    }
  ];

  agInit(params: any): void {
    this.params = params;
    this.actions = params.actions || params.colDef?.cellRendererParams?.actions || this.defaultActions;
  }

  handleClick(action: any) {
    if (action?.action) {
      action.action(this.params.data);
    }
  }
}
