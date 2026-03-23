import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

declare var google: any;

@Component({
  selector: 'app-map',
  template: `<div #map class="w-full h-full"></div>`,
})
export class MapComponent implements AfterViewInit {

  @ViewChild('map') mapElement!: ElementRef;

  map!: any;

  async ngAfterViewInit() {
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const { PlacesService } = await google.maps.importLibrary("places");

    let center = { lat: 20.70592, lng: -102.34513 };

    // if (navigator.geolocation) {
    //   navigator.geolocation.getCurrentPosition(
    //     (position) => {
    //       center = {
    //         lat: position.coords.latitude,
    //         lng: position.coords.longitude,
    //       };

    //       this.initMap(Map, AdvancedMarkerElement, PlacesService, center);
    //     },
    //     () => {
    //       this.initMap(Map, AdvancedMarkerElement, PlacesService, center);
    //     },
    //     {
    //       enableHighAccuracy: true
    //     }
    //   );
    // } else {
      this.initMap(Map, AdvancedMarkerElement, PlacesService, center);
    // }
  }

  initMap(Map: any, AdvancedMarkerElement: any, PlacesService: any, center: { lat: number; lng: number }) {
    this.map = new Map(this.mapElement.nativeElement, {
      center,
      zoom: 15,
      mapId: "DEMO_MAP_ID"
    });

    new AdvancedMarkerElement({
      position: center,
      map: this.map,
      title: 'Tu ubicación',
    });

    // const service = new PlacesService(this.map);

    // service.nearbySearch(
    //   {
    //     location: center,
    //     radius: 1000,
    //     keyword: "parking",
    //   },
    //   (results: any, status: any) => {
    //     if (status === "OK") {
    //       results.forEach((place: any) => {
    //         new AdvancedMarkerElement({
    //           position: place.geometry.location,
    //           map: this.map,
    //           title: place.name,
    //         });
    //       });
    //     }
    //   }
    // )
  }
}