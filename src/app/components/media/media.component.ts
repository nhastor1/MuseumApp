import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
  @Input() pdf:FormControl;
  @Input() form:FormGroup;
  @Input() name:FormControl;
  file:any;

  //urlCreator = window.URL || window.webkitURL;

  constructor(private dataService: DataService, private sanitizer : DomSanitizer) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.video && this.video.value != ""){
      this.getFile(this.video.value);
      this.video.setValue("");
    }
    else if(this.image && this.image.value != ""){
      this.getFile(this.image.value);
      this.image.setValue("");
    }
    else if(this.audio && this.audio.value != ""){
      this.getFile(this.audio.value);
      this.audio.setValue("");
    }
    else if(this.pdf && this.pdf.value != ""){
      this.getFile(this.pdf.value);
      this.pdf.setValue("");
    }
  }

  ngOnInit(): void {
  }

  getFile(param){
    console.log(param);
    if(this.video)
      this.dataService.getFile('video', param).subscribe((data) => this.file = data);
    else if(this.image)
      this.dataService.getFile('image', param).subscribe((data) => this.file = data);
    else if(this.audio)
      this.dataService.getFile('audio', param).subscribe((data) => this.file = data);
    else if(this.pdf)
      this.dataService.getFile('pdf', param).subscribe((data) => this.file = data);
  }

}
