import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Form, FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { DataService } from '@app/_services';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss']
})
export class MediaComponent implements OnInit, OnChanges {
  @Input() video:FormControl;
  @Input() image:FormControl;
  @Input() audio:FormControl;
  file:any;

  urlCreator = window.URL || window.webkitURL;

  constructor(private dataService: DataService, private sanitizer : DomSanitizer) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.video && this.video.value != ""){
      console.log("Video");
      this.getFile(this.video.value);
    }
    else if(this.image && this.image.value != ""){
      console.log("Image");
      this.getFile(this.image.value);
    }
    else if(this.audio && this.audio.value != ""){
      console.log("Audio");
      this.getFile(this.audio.value);
    }
  }

  ngOnInit(): void {
  }

  getFile(param){
    console.log("SVASTA NESTA");
    console.log(param);
    if(this.video)
      this.dataService.getFile('video', param).subscribe((data) => this.file = data);
    else if(this.image)
      this.dataService.getFile('image', param).subscribe((data) => this.file = data);
    else if(this.audio)
      this.dataService.getFile('audio', param).subscribe((data) => this.file = data);
  }

  // getSource(param){
  //   console.log("SVASTA NESTA");
  //   console.log(param);
  //   if(this.video)
  //     this.dataService.getFile('video', param).subscribe((data) => this.file = this.sanitizer.bypassSecurityTrustStyle(`url(${data})`));
  //   else if(this.image)
  //     this.dataService.getFile('image', param).subscribe((data) => this.file = this.sanitizer.bypassSecurityTrustStyle(`url(${data})`));
  //   else if(this.audio)
  //     this.dataService.getFile('audio', param).subscribe((data) => this.file = this.sanitizer.bypassSecurityTrustStyle(`url(${data})`));
  // }

  // onSelectedFile(ev) {
  //   let file = ev.target.files[0];
  //   var URL = window.URL;
  //   this.file = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
  // }

  // setContent(data){
  //   console.log(data);
  //   console.log(typeof data)
  //   let blob = new Blob([data.data], {type: 'video/mp4'});
  //   var URL = window.URL;
  //   this.file = URL.createObjectURL(blob);
  //   //this.file = window.URL.createObjectURL(blob);
  //   console.log(this.file)
  //   // data.data.blob().then(blobResponse => {
  //   //     this.file = this.urlCreator.createObjectURL(blobResponse);
  //   //     console.log(this.file)
  //   // });
  // }

}
