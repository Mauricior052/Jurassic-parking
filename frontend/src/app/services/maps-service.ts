import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MapsService {
  private loadPromise: Promise<void> | null = null;
  private map!: google.maps.Map;
  private marker!: google.maps.marker.AdvancedMarkerElement;
  private geocoder!: google.maps.Geocoder;

  async initGoogleMaps(): Promise<void> {
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise((resolve, reject) => {
      if (typeof window.google?.maps?.importLibrary === 'function') return resolve();

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places,marker&v=weekly&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        const waitForImportLibrary = (retries = 10) => {
          if (typeof window.google?.maps?.importLibrary === 'function') {
            resolve();
          } else if (retries > 0) {
            setTimeout(() => waitForImportLibrary(retries - 1), 100);
          } else {
            reject(new Error('importLibrary no disponible'));
          }
        };
        waitForImportLibrary();
      };

      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  async initMap(
    elementId: string,
    coords: { lat: number; lng: number },
    onLocationSelect: (lat: number, lng: number, address: string) => void
  ): Promise<void> {
    const mapElement = document.getElementById(elementId);
    if (!mapElement) return;

    const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

    this.geocoder = new google.maps.Geocoder();

    this.map = new Map(mapElement, {
      center: coords,
      zoom: 16,
      mapId: 'DEMO_MAP_ID',
      disableDefaultUI: true,
      zoomControl: true
    });

    google.maps.event.trigger(this.map, 'resize');
    this.map.setCenter(coords);

    this.marker = new AdvancedMarkerElement({
      map: this.map,
      position: coords,
      gmpDraggable: true,
      title: 'Arrastra para seleccionar'
    });

    const updateLocation = (position: google.maps.LatLngLiteral) => {
      this.map.panTo(position);
      this.reverseGeocode(position.lat, position.lng, onLocationSelect);
    };

    this.marker.addListener('dragend', (event: any) => {
      const pos = { 
        lat: event.latLng.lat(), 
        lng: event.latLng.lng() 
      };
      updateLocation(pos);
    });

    this.map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        this.marker.position = pos;
        updateLocation(pos);
      }
    });
  }

  private reverseGeocode(
    lat: number,
    lng: number,
    callback: (lat: number, lng: number, address: string) => void
  ): void {
    this.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      const address = status === 'OK' && results?.[0]
        ? results[0].formatted_address
        : 'Dirección no encontrada';
      callback(lat, lng, address);
    });
  }
}
