import { Component, inject, signal, OnInit } from '@angular/core';
import { AllApiService } from '../../services/all-api.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  allEmployees = signal<any[]>([]);
  empId:any=null;


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


