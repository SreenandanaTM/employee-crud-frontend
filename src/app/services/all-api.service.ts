import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AllApiService {
  serverURL='http://localhost:3000';


  constructor(private http:HttpClient) { }


  // get all employees
  getAllEmpAPI(){
    return this.http.get(`${this.serverURL}/all-emp`)
  }

  // get all employees for exporting
  getAllEmployeesAPI(){
    return this.http.get(`${this.serverURL}/getAllEmp`)
  }

  // add employee
  addEmpAPI(body:any){
    return this.http.post(`${this.serverURL}/all-emp`,body)
  }

  // get a employee details
  getEmpDetailsAPI(id:any){
    return this.http.get(`${this.serverURL}/get-emp/${id}`)
  }

  // update employee
  updateEmpAPI(id:any,body:any){
    return this.http.put(`${this.serverURL}/update-emp/${id}`,body)
  }

  // delete employee
  removeEmpAPI(id:any){
    return this.http.delete(`${this.serverURL}/remove-emp/${id}`)
  }
  // search employee by name
  searchEmpAPI(text:string){
    return this.http.get(`${this.serverURL}/all-emp?search=${text}`)
  }

  // pagination api
  paginationAPI(page:number,limit:number){
    return this.http.get(`${this.serverURL}/pagination?page=${page}&limit=${limit}`)
  }

  // import excel file api
  importExcelAPI(data:any){
    return this.http.post(`${this.serverURL}/import-excel`,data)
  }
}
