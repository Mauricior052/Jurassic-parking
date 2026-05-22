import { DatePipe, NgStyle } from '@angular/common';
import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RecordService } from '../../services/record-service';
import { Record } from '../../models/record';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [ NgStyle, NgIcon ],
  templateUrl: './reservations.html',
  providers: [DatePipe]
})
export class Reservations implements OnInit, OnDestroy {
  private recordService = inject(RecordService);
  private datePipe = inject(DatePipe);

  public records = signal<Record[]>([]);
  public loading = signal<boolean>(true);
  private intervalId: any;

  public active = computed(() =>
    this.records().filter(r => r.status === 'ACTIVE')
  );

  public history = computed(() =>
    this.records().filter(r => r.status !== 'ACTIVE')
      .sort((a, b) => new Date(b.entryTime!).getTime() - new Date(a.entryTime!).getTime())
  );

  ngOnInit() {
    this.load();
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  load() {
    this.recordService.getByUser().subscribe({
      next: (res: any) => {
        console.log(res)
        this.records.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.log(err)
        this.loading.set(false)
      }
    });
  }

  formatDate(date: string | Date): string {
    return this.datePipe.transform(date, 'dd MMM yyyy, HH:mm') ?? '—';
  }

  getDuration(entryTime: string | Date, exitTime?: string | Date): string {
    if (!entryTime) return '—';
    const end = exitTime ? new Date(exitTime).getTime() : Date.now();
    const diff = end - new Date(entryTime).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  statusLabel(status?: string): string {
    const map: { [key: string]: string } = {
      active: 'Activa',
      finished: 'Finalizada',
      cancelled: 'Cancelada'
    };
    return map[status ?? ''] ?? status ?? '—';
  }

  statusStyle(status?: string): { [key: string]: string } {
    const map: { [key: string]: { [key: string]: string } } = {
      active:    { color: 'var(--color-parking-available)' },
      finished:  { color: 'var(--color-parking-muted)' },
      cancelled: { color: 'var(--color-parking-occupied)' }
    };
    return map[status ?? ''] ?? {};
  }
}