import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MapsService {
  private isLoaded = false;
  private map!: google.maps.Map;
  private marker!: google.maps.marker.AdvancedMarkerElement;
  private geocoder!: google.maps.Geocoder;

  async initGoogleMaps(): Promise<void> {
    if (this.isLoaded) return;

    return new Promise((resolve, reject) => {
      if (document.getElementById('google-maps-script')) {
        this.isLoaded = true;
        return resolve();
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places,marker&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }

  async initMap(
    elementId: string,
    coords: { lat: number; lng: number } = { lat: 20.563, lng: -102.986 },
    onLocationSelect: (lat: number, lng: number, address: string) => void
  ): Promise<void> {
    const mapElement = document.getElementById(elementId);
    if (!mapElement) return;

    const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

    this.geocoder = new google.maps.Geocoder();

    this.map = new Map(mapElement, {
      center: coords,
      zoom: 15,
      disableDefaultUI: true,
      zoomControl: true
    });

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
