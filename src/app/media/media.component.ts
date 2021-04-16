import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Form, FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { DataService } from '@app/_services';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss']
})
export class MediaComponent implements OnInit {
  @Input() video:FormControl;
  @Input() audio:FormControl;
  @Input() image:FormControl;
  @Input() fieldName:any;
  @ViewChild('videoPlayer') videoplayer: ElementRef;
  @ViewChild('audioPlayer') audioplayer: ElementRef;
  @Input() file:any;

  urlCreator = window.URL || window.webkitURL;

  constructor(private dataService: DataService, private sanitizer : DomSanitizer) { }

  ngOnInit(): void {
    setTimeout(()=>{
      if(this.video)
        this.clicked(this.video.value);
      else if(this.image)
        this.clicked(this.image.value);
      else if(this.audio)
        this.clicked(this.audio.value);
    }, 1000);
  }

  clicked(param){
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
