import { Injectable } from '@angular/core';

declare let toastr : any;

@Injectable()
export class ToastrService{
    constoptions = { positionClass:'toast-custom' };

    success(message: string, title?: string){
        toastr.success(message, title, this.constoptions);
    }
    info(message: string, title?: string){
        toastr.info(message, title, this.constoptions);
    }
    warning(message: string, title?: string){
        toastr.warning(message, title, this.constoptions);
    }
    error(message: string, title?: string){
        toastr.error(message, title, this.constoptions);
    } 
}