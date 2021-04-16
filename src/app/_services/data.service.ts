import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { environment } from '@environments/environment';
import { FileList } from '@app/_models/index';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class DataService{

    urlCreator = window.URL || window.webkitURL;

    constructor(private http: HttpClient, private sanitizer: DomSanitizer) { 
        this.fileList = new FileList();
    }

    fileList;

    getCategories(){
        return this.http.get<any>(`${environment.apiUrl}/category`);
    }

    getCategory(key){
        return this.http.get<any>(`${environment.apiUrl}/category/${key}`);
    }

    getCodes(key){
        return this.http.get<any>(`${environment.apiUrl}/keys/${key}`);
    }

    getData(category, key){
        let fileNumber = this.getFileNumber(category);
        return this.http.get<any>(`${environment.apiUrl}/obj/${key}`);
            // .pipe((results) => {
            //     return results;
            // });

        // return new Promise((resolve)=>{
        //     this.http.get<any>(`${environment.apiUrl}/obj/${key}`).subscribe((response) => {
        //             // get files
        //             console.log(response);
        //             if(fileNumber==0)
        //                 resolve(response);
        //             else{
        //                 for(let row of category){
        //                     if(this.fileList.isFile(row.type)){
        //                         (function(name, http){
        //                             console.log(`${environment.apiUrl}/file/${response[name]}`)
        //                             http.get<any>(`${environment.apiUrl}/file/${response[name]}`)
        //                                 //.map(response => response.json())
        //                                 .subscribe((response) => {
        //                                     fileNumber--;
        //                                     response.data.blob().then(blobResponse => {
        //                                         response[name] = this.urlCreator.createObjectURL(blobResponse);
        //                                         if(fileNumber==0){
        //                                             console.log(response);
        //                                             resolve(response);
        //                                         }
        //                                     });
        //                                 })
        //                         })(row.name, this.http);
        //                     }
        //                 }
        //             }
        //       });
        // })
    }

    getFile(type, key){
        type = "file";
        console.log(`${environment.apiUrl}/${type}/${key}`)
        return this.http.get(`${environment.apiUrl}/${type}/${key}`, {responseType: 'arraybuffer'})
            .pipe(map((response) => this.sanitizer.bypassSecurityTrustResourceUrl(this.downloadFile(response))));
    }

    addData(category, key, data){
        let fileNumber = this.getFileNumber(category);

        return new Promise((resolve)=>{
            this.http.post<any>(`${environment.apiUrl}/category/${key}`, JSON.stringify(data), { headers: new HttpHeaders({
                'Content-Type':  'application/json; charset=utf-8'
              })}).subscribe((response) => {
                    // add files
                    if(fileNumber==0)
                        resolve({message: "Data added"});
                    else{
                        for(var row of category){
                            if(this.fileList.isFile(row.type)){
                                let formData:FormData = new FormData();
                                formData.append('file', data[row.name], data[row.name].name);
                                this.http.post<any>(`${environment.apiUrl}/file/${response.data[row.name]}`, formData).subscribe((data) => {
                                        fileNumber--;
                                        if(fileNumber==0)
                                            // return of({message});
                                            resolve({message: "Data added"});
                                    })
                            }
                        }
                    }
              });
        })
    }

    private downloadFile(data: any) {
        const blob = new Blob([data], { type: '' });
        const url= window.URL.createObjectURL(blob);
        return url;
    }

    private getFileNumber(category){
        if(!category)
            return 0;
        return category.filter(el => this.fileList.isFile(el.type)).length;
    }
}