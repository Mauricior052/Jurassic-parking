import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecordService } from '../../services/record-service';
import { ActivatedRoute } from '@angular/router';

export interface Record {
  id: string;
  plate: string;
  vehicle: string;
  parking: {
    id: string;
    name: string;
    address: string;
  };
  user: {
    id: string;
    name: string;
  };
  slotCode: string;
  entryTime: Date;
  exitTime: Date;
  totalMinutes: number;
  totalAmount: number;
}

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket.html',
})
export class TicketComponent implements OnInit {
  private recordService = inject(RecordService);
  private route = inject(ActivatedRoute);
  record = signal<Record | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.recordService.getById(id!).subscribe({
      next: (record: any) => {
        this.record.set(record);
      },
      error: (err) => {
        console.error('Error fetching ticket:', err);
      }
    });
  }
}