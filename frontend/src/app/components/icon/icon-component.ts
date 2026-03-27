import { Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-icon-component',
  imports: [NgIcon],
  templateUrl: './icon-component.html',
})
export class IconComponent {
  params: any;
  icon: string = '';
  color: string = '';
  text: string = '';
  size: string = '';

  agInit(params: any): void {
    this.params = params;

    this.icon = params.icon || 'lucideHelpCircle';
    this.color = params.color || '#64748b';
    this.text = params.text || '';
    this.size = params.size || '24';
  }
}
