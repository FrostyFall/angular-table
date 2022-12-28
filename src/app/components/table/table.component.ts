import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableService } from 'src/app/services/table.service';
import { TableEntry } from 'src/app/interfaces/tableEntry.interface';
import { TruncateStringPipe } from 'src/app/pipes/truncate-string.pipe';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { delay, distinctUntilChanged, tap } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableCellComponent } from '../table-cell/table-cell.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-table',
  standalone: true,
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  imports: [
    CommonModule,
    TruncateStringPipe,
    ReactiveFormsModule,
    TableCellComponent,
    MatProgressSpinnerModule,
  ],
})
export class TableComponent implements OnInit {
  data: TableEntry[] = [];
  stringMaxLength: number = 0;
  searchString: string = '';
  isDataLoading: boolean = false;

  breakpoint$ = this.breakpointObserver
    .observe([Breakpoints.XSmall])
    .pipe(distinctUntilChanged());
  searchForm = this.fb.group({
    searchField: ['', Validators.required],
  });

  constructor(
    private tableService: TableService,
    private breakpointObserver: BreakpointObserver,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initSubcriptions();
  }

  public isMatch(fieldValue: string | number): boolean {
    if (this.searchString === '') {
      return false;
    }

    if (typeof fieldValue === 'string') {
      return fieldValue.toLowerCase().includes(this.searchString);
    }

    return fieldValue.toString().toLowerCase().includes(this.searchString);
  }

  private initSubcriptions(): void {
    this.tableService.data$
      .pipe(
        tap(() => {
          this.isDataLoading = true;
        })
        // delay(3000)
      )
      .subscribe({
        next: (data) => {
          this.data = [...data];
          this.isDataLoading = false;
        },
      });
    this.breakpoint$.subscribe((data) => {
      if (data.matches) {
        this.stringMaxLength = 6;
      } else {
        this.stringMaxLength = 16;
      }
    });
    this.searchForm.valueChanges.subscribe((value) => {
      this.filterTableData(value.searchField);
    });
  }

  private filterTableData(inputVal: string | null | undefined): void {
    if (typeof inputVal !== 'string' || inputVal.length === 0) {
      this.searchString = '';
      return;
    }

    this.searchString = inputVal.toLowerCase();
  }
}
