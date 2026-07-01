import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { AllApiService } from '../../services/all-api.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KENDO_TEXTBOX } from '@progress/kendo-angular-inputs';
import { GridComponent, GridDataResult, KENDO_GRID, KENDO_GRID_EXCEL_EXPORT, KENDO_GRID_PDF_EXPORT } from '@progress/kendo-angular-grid';
import { ExcelExportData } from '@progress/kendo-angular-excel-export';
import { debounceTime, Subject } from 'rxjs';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import *as XLSX from 'xlsx';
import { EditGridComponent } from '../edit-grid/edit-grid.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, KENDO_TEXTBOX, KENDO_GRID, ButtonsModule,KENDO_GRID_EXCEL_EXPORT,KENDO_GRID_PDF_EXPORT,EditGridComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  @ViewChild('grid')
  grid!:GridComponent
  allEmployees = signal<any[]>([]);
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
    this.getAllEmp();
    this.searchEmp();
    this.loadEmployees();
  }

  getAllEmp() {
    this.api.getAllEmployeesAPI().subscribe({
      next: (res: any) => {
        // console.log(res);
        this.allEmployees.set(res);
      },
      error: (err) => {
        console.log(err);

      }
    })
  }



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
    // console.log("inside loademployees");
    const page = this.skip / this.pageSize + 1;
    // console.log(page, this.pageSize);
    this.api.paginationAPI(page, this.pageSize).subscribe((res: any) => {
      // console.log(res);
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


  // excel export
  public allData=():ExcelExportData=>{
    return{
      data:this.allEmployees()
    }
  }

  // pdf export
 exportPDF(){
  const currentSkip=this.skip
  const currentPageSize=this.pageSize
  const currentData=this.gridData()
  console.log(currentData);
  this.skip=0
  this.pageSize=this.allEmployees().length
  
  this.gridData.set({
    data:this.allEmployees(),
    total:this.allEmployees().length
  })
  console.log(this.gridData().data);
  console.log(this.gridData().data.length);
  
  setTimeout(()=>{
    this.grid.saveAsPDF()
    this.skip=currentSkip
    this.pageSize=currentPageSize
    this.gridData.set(currentData)
  },0)
 }



//  color coding for status cell


statusColor(status: string): string {
    let color;

    if (status == 'Pending') {
      color = "yellow"; 
    } else if (status == 'Completed') {
      color = "green";
    } else if(status == 'Due') {
      color = "orange"; 
    }else{
      color = "red"; 
    }

    return color;
  }
}


