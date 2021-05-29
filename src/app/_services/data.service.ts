import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { environment } from '@environments/environment';
import { FileList } from '@app/_models/index';
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

    getData(key){
        return this.http.get<any>(`${environment.apiUrl}/obj/${key}`);
    }

    search(text){
        text = text.replace(/\s+/g, '+');
        return this.http.get<any>(`${environment.apiUrl}/search?search_query=${text}`);
    }

    getList(type, category, name){
        return this.http.get<any>(`${environment.apiUrl}/list?type=${type}&category=${category}&name=${name}`);
    }

    getFile(type, key){
        type = "file";
        console.log(`${environment.apiUrl}/${type}/${key}`)
        return this.http.get(`${environment.apiUrl}/${type}/${key}`, {responseType: 'arraybuffer'})
            .pipe(map((response) => this.sanitizer.bypassSecurityTrustResourceUrl(this.downloadFile(response))));
    }

    addData(category, key, data){
        let fileNumber = this.getFileNumber(category);

        return new Promise((resolve, reject)=>{
            this.http.post<any>(`${environment.apiUrl}/category/${key}`, JSON.stringify(data), { headers: new HttpHeaders({
                'Content-Type':  'application/json; charset=utf-8'
              })}).subscribe((response) => {
                    // add files
                    if(response.error)
                        reject({message:"Can not add data"});
                    if(fileNumber==0)
                        resolve(response.objKey);
                    else{
                        for(var row of category){
                            if(this.fileList.isFile(row.type)){
                                let formData:FormData = new FormData();
                                formData.append('file', data[row.name], data[row.name].name);
                                this.http.post<any>(`${environment.apiUrl}/file/${response.data[row.name]}`, formData).subscribe((data) => {
                                        fileNumber--;
                                        if(fileNumber==0)
                                            resolve(response.objKey);
                                    })
                            }
                        }
                    }
              });
        })
    }

    updateData(category, key, data, dataKey){
        let fileNumber = this.getFileNumber(category);

        return new Promise((resolve, reject)=>{
            this.http.put<any>(`${environment.apiUrl}/data/${dataKey}`, JSON.stringify(data), { headers: new HttpHeaders({
                'Content-Type':  'application/json; charset=utf-8'
              })}).subscribe((response) => {
                    // update files
                    console.log(response);
                    if(response.error)
                        reject({message:"Can not edit data"});
                    if(fileNumber==0)
                        resolve({message: "Data edited"});
                    else{
                        for(var row of category){
                            if(this.fileList.isFile(row.type)){
                                if(data[row.name] != ""){
                                    let formData:FormData = new FormData();
                                    formData.append('file', data[row.name], data[row.name].name);
                                    this.http.post<any>(`${environment.apiUrl}/file/${response.data[row.name]}`, formData).subscribe((data) => {
                                            fileNumber--;
                                            if(fileNumber==0)
                                                resolve({message: "Data edited"});
                                        })
                                }
                                else{
                                    fileNumber--;
                                        if(fileNumber==0)
                                            resolve({message: "Data edited"});
                                }
                            }
                        }
                    }
              });
        })
    }

    deleteData(dataKey){
        return this.http.delete(`${environment.apiUrl}/obj/${dataKey}`);
    }

    private downloadFile(data: any) {
        const blob = new Blob([data], { type: '*/*' });
        const url= window.URL.createObjectURL(blob);
        return url;
    }

    private getFileNumber(category){
        if(!category)
            return 0;
        return category.filter(el => this.fileList.isFile(el.type)).length;
    }
}