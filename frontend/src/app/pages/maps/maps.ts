import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MapsService } from '../../services/maps-service';

@Component({
  selector: 'app-map',
  template: `<div #map class="w-full h-full"></div>`,
})
export class MapsComponent implements AfterViewInit {

  @ViewChild('map') mapElement!: ElementRef;
  private mapsService = inject(MapsService);

  map!: google.maps.Map;

  async ngAfterViewInit() {
    try {
      await this.mapsService.initGoogleMaps();

      const { Map } = await google.maps.importLibrary('maps') as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;

      const center = { lat: 20.70592, lng: -102.34513 };
      
      this.map = new Map(this.mapElement.nativeElement, {
        center,
        zoom: 15,
        mapId: 'DEMO_MAP_ID'
      });

      new AdvancedMarkerElement({
        position: center,
        map: this.map,
        title: 'Jurassic Parking HQ',
      });
      
    } catch (error) {
      console.error("Error cargando el mapa:", error);
    }
  }


    // const service = new google.maps.places.PlacesService(this.map);

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
  // }
}
