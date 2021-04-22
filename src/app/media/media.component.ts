import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
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
      this.video.setValue("");
    }
    else if(this.image && this.image.value != ""){
      console.log("Image");
      this.getFile(this.image.value);
      this.image.setValue("");
    }
    else if(this.audio && this.audio.value != ""){
      console.log("Audio");
      this.getFile(this.audio.value);
      this.audio.setValue("");
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

  // onChangeFile(file: FileList){
  //   console.log("UCITAVA SE 1");
  //   var reader = new FileReader();
  //   reader.onload = (event:any) => {
  //     this.file = event.target.result;
  //     console.log("UCITALO SE");
  //   }
  //   reader.readAsDataURL(file.item(0));
  //   console.log("UCITAVA SE");
  // }

}
