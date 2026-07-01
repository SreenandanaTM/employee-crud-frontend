import { Component, inject, signal } from '@angular/core';
import { CreateFormGroupArgs, KENDO_GRID, KENDO_GRID_EXCEL_EXPORT, KENDO_GRID_PDF_EXPORT } from '@progress/kendo-angular-grid';
import { AllApiService } from '../../services/all-api.service';
import { SVGIcon, fileExcelIcon, filePdfIcon } from "@progress/kendo-svg-icons";
import { ExcelExportData } from '@progress/kendo-angular-excel-export';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-grid',
  standalone: true,
  imports: [KENDO_GRID, KENDO_GRID_EXCEL_EXPORT, KENDO_GRID_PDF_EXPORT],
  templateUrl: './edit-grid.component.html',
  styleUrl: './edit-grid.component.css'
})
export class EditGridComponent {
  allEmployees = signal<any[]>([]);

  public fileExcelIcon: SVGIcon = fileExcelIcon;
  public filePdfIcon: SVGIcon = filePdfIcon;



  api = inject(AllApiService)

  fb=inject(FormBuilder)

  public createFormGroup=(args: CreateFormGroupArgs): FormGroup =>{
    const item = args.isNew ? {} : args.dataItem;

    return this.fb.group({
      id: [item.id, [Validators.required, Validators.pattern('[0-9]*')]],
      name: [item.name, [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      email: [item.email, [Validators.required, Validators.email]],
      phone: [item.phone, [Validators.required, Validators.pattern('[0-9]*')]],
      department: [item.department, [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      designation: [item.designation, [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      salary: [item.salary, [Validators.required, Validators.pattern('[0-9]*')]],
      location: [item.location, [Validators.required, Validators.pattern('[a-zA-Z]*')]],
      status:item.status
    });
  }
    ngOnInit(){
      this.getAllEmp()
    }


    // get all employees
    getAllEmp() {
      this.api.getAllEmployeesAPI().subscribe({
        next: (res: any) => {
          console.log(res);
          this.allEmployees.set(res);
        },
        error: (err) => {
          console.log(err);

        }
      })
    }

    // color code for the status
    statusColor(status: string): string {
      let color;

      if (status == 'Pending') {
        color = "yellow";
      } else if (status == 'Completed') {
        color = "green";
      } else if (status == 'Due') {
        color = "orange";
      } else {
        color = "red";
      }

      return color;
    }

  public allData = (): ExcelExportData => {
    return {
      data: this.allEmployees()
    }
  }
}
