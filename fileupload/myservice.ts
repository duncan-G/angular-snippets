import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { fileUploadUrl } from '../../endpoints';

@Injectable()
export class MyService
{
    constructor(private http: HttpClient)
    {
    }
    
    submitFile(fileObject)
    {
      return this.http.post(fileUploadUrl, fileObject)
    }
}
