import { Injectable } from '@angular/core';

declare let toastr : any;

@Injectable()
export class ToastrService{
    succes(message: string, title?: string){
        toastr.succes(message, title);
    }
    info(message: string, title?: string){
        toastr.info(message, title);
    }
    warning(message: string, title?: string){
        toastr.warning(message, title);
    }
    error(message: string, title?: string){
        toastr.error(message, title);
    } 
}