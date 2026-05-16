import { AfterViewInit, Component, ElementRef, effect, inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { MapsService } from '../../services/maps-service';
import { ParkingService } from '../../services/parking-service';
import { Parking } from '../../models/parking';

@Component({
  selector: 'app-map',
  template: `<div #map class="w-full h-full"></div>`,
  styleUrls: ['./maps.css'],
  encapsulation: ViewEncapsulation.None
})
export class MapsComponent implements AfterViewInit {

  @ViewChild('map') mapElement!: ElementRef;
  private mapsService = inject(MapsService);
  private parkingService = inject(ParkingService);

  private markers: google.maps.marker.AdvancedMarkerElement[] = [];
  map!: google.maps.Map;
  private mapReady = false;

  constructor() {
    effect(() => {
      const parkings = this.parkingService.parkings();
      if (this.mapReady && parkings.length > 0) {
        this.renderMarkers(parkings);
      }
    });
  }

  async ngAfterViewInit() {
    try {
      await this.mapsService.initGoogleMaps();

      const { Map } = await google.maps.importLibrary('maps') as google.maps.MapsLibrary;

      const center = { lat: 20.70592, lng: -102.34513 };

      this.map = new Map(this.mapElement.nativeElement, {
        center,
        zoom: 15,
        mapId: 'DEMO_MAP_ID'
      });

      this.mapReady = true;

      const parkings = this.parkingService.parkings();
      if (parkings.length > 0) {
        this.renderMarkers(parkings);
      }

    } catch (error) {
      console.error("Error cargando el mapa:", error);
    }
  }

  private async renderMarkers(parkings: Parking[]) {
    const { AdvancedMarkerElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;

    this.markers.forEach(m => m.map = null);
    this.markers = [];

    parkings.forEach(parking => {
      const [lng, lat] = parking.location.coordinates;

      const pin = document.createElement('div');
      pin.style.cssText = `
        position: relative;
        cursor: pointer;
      `;
      pin.innerHTML = `
        <div class="marker-pin">
          <span>🅿️</span>
        </div>

        <div class="marker-tooltip">
          <div style="font-weight: 700; font-size: 13px; color: #111827; margin-bottom: 6px;">
            ${parking.name}
          </div>
          <div style="font-size: 11px; color: #6B7280; margin-bottom: 8px;">
            ${parking.address}
          </div>
          
          <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 10px;">
            <span class="badge badge-price">💲 $${parking.price}/hr</span>
            <span class="badge badge-spaces">🚗 ${parking.totalSpaces} cupos</span>
            <span class="badge badge-schedule">🕐 ${parking.schedule.opening} - ${parking.schedule.closing}</span>
          </div>

          <div style="display: flex; gap: 8px;">
            <a class="action-btn" target="_blank" href="/reservation?parking=${parking.id}">
              Reservar
            </a>
            <a class="action-btn btn-secondary" target="_blank" href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}">
              Cómo llegar
            </a>
          </div>
          
          <div class="tooltip-arrow"></div>
        </div>
      `;

      const tooltip = pin.querySelector('.marker-tooltip') as HTMLElement;

      pin.style.pointerEvents = 'auto';

      pin.addEventListener('click', (e) => e.stopPropagation());

      pin.addEventListener('mouseenter', () => {
        tooltip.style.display = 'block';
        marker.zIndex = 1000;
      });

      pin.addEventListener('mouseleave', (e) => {
        setTimeout(() => {
          if (!pin.matches(':hover')) {
            tooltip.style.display = 'none';
            marker.zIndex = null;
          }
        }, 200);
      });

      const marker = new AdvancedMarkerElement({
        position: { lat, lng },
        map: this.map,
        title: parking.name,
        content: pin,
      });

      this.markers.push(marker);
    });
  }
}
