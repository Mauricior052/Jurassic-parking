import { computed, Injectable, signal } from '@angular/core';
import { themeAlpine } from 'ag-grid-community';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDarkMode = signal<boolean>(true);

  gridTheme = computed(() => {
    return themeAlpine.withParams({
      backgroundColor: 'var(--color-parking-surface)',
      headerBackgroundColor: 'var(--color-parking-accent)',
      borderColor: 'var(--color-parking-border)',
      foregroundColor: 'var(--color-parking-text)',
      headerTextColor: 'var(--color-parking-text)',
      rowHoverColor: 'var(--color-parking-accent)',
    });
  })

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      this.setDarkTheme(false);
    } else {
      this.setDarkTheme(true);
    }
  }

  toggleTheme() {
    if (!document.startViewTransition) {
      this.setDarkTheme(!this.isDarkMode());
      return;
    }

    document.startViewTransition(() => {
      this.setDarkTheme(!this.isDarkMode());
    });
  }

  private setDarkTheme(isDark: boolean) {
    this.isDarkMode.set(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }
}
