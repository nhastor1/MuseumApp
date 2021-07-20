import { Component, EventEmitter, Input, NgZone, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-input-maps',
  templateUrl: './input-maps.component.html',
  styleUrls: ['./input-maps.component.scss']
})
export class InputMapsComponent implements OnInit {

  @Output() changeCoordinates = new EventEmitter<any>();
  @Input() cords:any;

  title = 'My first AGM project';
  lat = 43.8563;
  lng = 18.4131;

  map;
  mapClickListener;

  constructor(private zone: NgZone) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.cords.value != null && this.cords.value != ""){
      let temp = this.cords.value.split(",");
      this.lat = parseFloat(temp[0]);
      this.lng = parseFloat(temp[1]);
    }
  }

  public mapReadyHandler(map: google.maps.Map): void {
    this.map = map;
    this.mapClickListener = this.map.addListener('click', (e: google.maps.MouseEvent) => {
      this.zone.run(() => {
        // Here we can get correct event
        this.lat = e.latLng.lat();
        this.lng = e.latLng.lng();
        this.changeCoordinates.emit(e.latLng);
      });
    });
  }
  
  public ngOnDestroy(): void {
    if (this.mapClickListener) {
      this.mapClickListener.remove();
    }
  }

}
