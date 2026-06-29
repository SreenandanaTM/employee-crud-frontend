import { Component, inject, signal, OnInit } from '@angular/core';
import { AllApiService } from '../../services/all-api.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KENDO_TEXTBOX } from '@progress/kendo-angular-inputs';
import { GridDataResult, KENDO_GRID } from '@progress/kendo-angular-grid';
import { debounceTime, Subject } from 'rxjs';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import *as XLSX from 'xlsx';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, KENDO_TEXTBOX, KENDO_GRID, ButtonsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  // allEmployees = signal<any[]>([]);
  empId: any = null;
  searchText = new Subject<string>()
  gridData = signal<GridDataResult>({
    data: [],
    total: 0
  })
  pageSize = 10;
  skip = 0;

  excelData:any[]=[];


  fb = inject(FormBuilder)
  api = inject(AllApiService)
  employeeForm: FormGroup

// Defining form validation 
  constructor() {
    this.employeeForm = this.fb.group({
      id: ['', [Validators.required, Validators.pattern('[0-9]*')]],
      name: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('[0-9]*')]],
      department: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      designation: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      salary: ['', [Validators.required, Validators.pattern('[0-9]*')]],
      location: ['', [Validators.required, Validators.pattern('[a-zA-Z]*')]],
    });
  }


  ngOnInit() {
    // this.getAllEmp();
    this.searchEmp();
    this.loadEmployees();
  }

  // getAllEmp() {
  //   this.api.getAllEmpAPI().subscribe({
  //     next: (res: any) => {
  //       this.allEmployees.set(res);
  //     },
  //     error: (err) => {
  //       console.log(err);

  //     }
  //   })
  // }



// Add Employee
  addEmp() {
    console.log("form valid", this.employeeForm.valid);
    console.log("form value", this.employeeForm.value);
    if (this.employeeForm.valid) {
      this.api.addEmpAPI(this.employeeForm.value).subscribe({
        next: (res: any) => {
          this.gridData.set(res)
          console.log(this.employeeForm.value);
          this.loadEmployees()
          alert("Employee added Successfully")
          this.employeeForm.reset()
        },
        error: (err: any) => {
          console.log("err", err);
        }
      })
    } else {
      console.log("form invalid");
    }

  }
// Get a particular employee details for form  
  getEmpDetails(id: any) {
    this.empId = id
    this.api.getEmpDetailsAPI(id).subscribe((res: any) => {
      console.log(res);

      this.employeeForm.setValue({
        id: res.id,
        name: res.name,
        email: res.email,
        phone: res.phone,
        department: res.department,
        designation: res.designation,
        salary: res.salary,
        location: res.location
      })
    })
  }


  saveEmpDetails() {
    if (this.empId) {
      this.updateEmp()
    } else {
      this.addEmp()
    }
  }

  // update employee
  updateEmp() {
    this.api.updateEmpAPI(this.empId, this.employeeForm.value).subscribe({
      next: (res: any) => {
        console.log(res);
        alert("Employee updated successfully")
        this.loadEmployees()
        this.empId = null;
        this.employeeForm.reset()
        // this.getAllEmp();

      },
      error: (err: any) => {
        console.log(err);

      }
    })

  }

  // search employee
  searchEmp() {
    this.searchText.pipe(debounceTime(500)).subscribe(value => {
      if (value == '') {
        this.loadEmployees()
      } else {
        this.api.searchEmpAPI(value).subscribe((res: any) => {
          this.gridData.set(res)
          console.log(this.gridData());
        })
      }
    })
  }

  search(event: any) {
    this.searchText.next(event.target.value)
    this.skip = 0;
    console.log(event.target.value);

  }

  // Delete employee
  removeEmp(id: any) {
    this.api.removeEmpAPI(id).subscribe({
      next: (res: any) => {
        console.log(res);
        alert(res)
        this.loadEmployees()
        // this.getAllEmp();

      },
      error: (err: any) => {
        console.log(err);

      }
    })
  }


  // load employees after pagination
  loadEmployees() {
    console.log("inside loademployees");
    const page = this.skip / this.pageSize + 1;
    console.log(page, this.pageSize);
    this.api.paginationAPI(page, this.pageSize).subscribe((res: any) => {
      console.log(res);
      this.gridData.set({
        data: res.data,
        total: res.total
      });
    });
  }


  pageChange(event: any) {
    this.skip = event.skip;
    this.loadEmployees()
  }

  onFileSelected(event:any){
    const file=event.target.files[0];
    if(file){
     const reader=new FileReader();
     reader.onload=(e:any)=>{
      const workbook=XLSX.read(e.target.result,{type:'array'});
      const sheetName=workbook.SheetNames[0];
      const worksheet=workbook.Sheets[sheetName];
      this.excelData=XLSX.utils.sheet_to_json(worksheet);
      console.log(this.excelData);   
      this.api.importExcelAPI(this.excelData).subscribe({
        next:(res:any)=>{
          this.loadEmployees()
          event.target.value=''
        },error:(err)=>{
          console.log(err);
          
        }
      })
     }
     reader.readAsArrayBuffer(file)
    }
  
  }

}


