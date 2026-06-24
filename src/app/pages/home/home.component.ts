import { Component, inject, signal, OnInit } from '@angular/core';
import { AllApiService } from '../../services/all-api.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KENDO_TEXTBOX } from '@progress/kendo-angular-inputs';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule,KENDO_TEXTBOX],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  allEmployees = signal<any[]>([]);
  empId:any=null;
  searchText=new Subject<string>()


  fb = inject(FormBuilder)
  api = inject(AllApiService)
  employeeForm: FormGroup

  constructor() {
    this.employeeForm = this.fb.group({
      id:['',[Validators.required,Validators.pattern('[0-9]*')]],
      name:['',[Validators.required,Validators.pattern('[a-zA-Z]*')]],
      email:['',[Validators.required,Validators.email]],
      phone:['',[Validators.required,Validators.pattern('[0-9]*')]],
      department:['',[Validators.required,Validators.pattern('[a-zA-Z]*')]],
      designation:['',[Validators.required,Validators.pattern('[a-zA-Z]*')]],
      salary:['',[Validators.required,Validators.pattern('[0-9]*')]],
      location:['',[Validators.required,Validators.pattern('[a-zA-Z]*')]],

    });
  }


  ngOnInit() {
    this.getAllEmp();
    this.searchEmp()
  }

  getAllEmp() {
    this.api.getAllEmpAPI().subscribe({
      next: (res: any) => {
        this.allEmployees.set(res);
      },
      error: (err) => {
        console.log(err);

      }
    })
  }

  

  addEmp() {


    console.log("added");
    console.log("form valid", this.employeeForm.valid);
    console.log("form value", this.employeeForm.value);

    if(this.employeeForm.valid){
    console.log("before api");
    this.api.addEmpAPI(this.employeeForm.value).subscribe({
      next: (res: any) => {
        console.log(this.employeeForm.value);
        this.getAllEmp()        
        alert("Employee added ")
        this.employeeForm.reset()
      },
      error: (err: any) => {
        console.log("err", err);

      }
    })
    }else{
        console.log("form invalid");

      }

  }

  getEmpDetails(id:any){
    this.empId=id
    this.api.getEmpDetailsAPI(id).subscribe((res:any)=>{
      console.log(res);
      
      this.employeeForm.setValue({
        id:res.id,
        name:res.name,
        email:res.email,
        phone:res.phone,
        department:res.department,
        designation:res.designation,
        salary:res.salary,
        location:res.location
      })
    })
  }

  saveEmpDetails(){
    if(this.empId){
      this.updateEmp()
    }else{
      this.addEmp()
    }
  }

  updateEmp(){
    this.api.updateEmpAPI(this.empId,this.employeeForm.value).subscribe({
      next:(res:any)=>{
        console.log(res);
        alert("Employee updated successfully")
        this.empId=null;
        this.employeeForm.reset()
        this.getAllEmp();
        
      },
      error:(err:any)=>{
        console.log(err);
        
      }
    })

  }

  searchEmp(){
    this.searchText.pipe(debounceTime(500)).subscribe(value=>{
    this.api.searchEmpAPI(value).subscribe((res:any)=>{
      this.allEmployees.set(res)
    })
    })
  }

  search(event:any){
    this.searchText.next(event.target.value)
    console.log(event.target.value);
    
  }

  removeEmp(id:any){
    this.api.removeEmpAPI(id).subscribe({
      next:(res:any)=>{
        console.log(res);
        alert(res)
        this.getAllEmp();
        
      },
      error:(err:any)=>{
        console.log(err);
        
      }
    })
  }

}


