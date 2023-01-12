import {
  ChangeDetectorRef,
  Component,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableService } from 'src/app/services/table.service';
import { TableEntry } from 'src/app/interfaces/tableEntry.interface';
import { TruncateStringPipe } from 'src/app/pipes/truncate-string.pipe';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { delay, distinctUntilChanged, tap } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableCellComponent } from '../table-cell/table-cell.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import timer from 'src/app/utils/timer';

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
  animationReset: boolean = false;

  breakpoint$ = this.breakpointObserver
    .observe([Breakpoints.XSmall])
    .pipe(distinctUntilChanged());
  searchForm = this.fb.group({
    searchField: ['', Validators.required],
  });

  @ViewChildren('idCell') idCells!: QueryList<TableCellComponent>;
  @ViewChildren('firstNameCell') fNameCells!: QueryList<TableCellComponent>;
  @ViewChildren('lastNameCell') lNameCells!: QueryList<TableCellComponent>;
  @ViewChildren('ageCell') ageCells!: QueryList<TableCellComponent>;

  constructor(
    private tableService: TableService,
    private breakpointObserver: BreakpointObserver,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initSubcriptions();
  }

  async firstAnimation(
    list: QueryList<TableCellComponent>,
    msTime: number = 1000
  ) {
    const listLength = list.length;
    const iterTime = msTime / listLength;

    for (let i = 0; i < listLength; i++) {
      list.get(i)?.setAnimTime(300);
    }

    for (let i = 0; i < listLength; i++) {
      for (let j = 0; j < listLength; j++) {
        // TODO: Change order of conditions to change animation direction
        if (j === i) {
          list.get(j)?.liftDown();
        } else if (j < i) {
          list.get(j)?.liftUp(listLength - i + 1 - 2);
        } else if (j > i) {
          list.get(j)?.liftUp(-1 * (i + 1));
        }
        // await timer(iterTime / listLength);
        // await timer(iterTime);
      }
      // await timer(msTime / listLength);
      await timer(250);
    }
  }

  async secondAnimation(
    list: QueryList<TableCellComponent>,
    msTime: number = 1000
  ) {
    const listLength = list.length;
    const iterTime = msTime / listLength / 2;

    for (let i = 0; i < listLength; i++) {
      list.get(i)?.resetRotateAround();
      list.get(i)?.setAnimTime(iterTime);
    }

    for (let i = 0; i < listLength; i++) {
      list.get(i)?.rotateAround();

      await timer(50);
    }

    await timer(iterTime * 2);

    for (let i = listLength - 1; i >= 0; i--) {
      list.get(i)?.resetRotateAround();

      await timer(50);
    }
  }

  async onMouseenter(lists: {
    left: QueryList<TableCellComponent> | undefined;
    right: QueryList<TableCellComponent> | undefined;
  }) {
    console.log('TRIG MOUSEOVER');

    if (lists.left === undefined && lists.right === undefined) {
      return;
    }

    if (lists.left) {
      this.firstAnimation(lists.left, 2000);
    }

    if (lists.right) {
      this.secondAnimation(lists.right, 2000);
    }
  }

  onMouseleave(lists: {
    left: QueryList<TableCellComponent> | undefined;
    right: QueryList<TableCellComponent> | undefined;
  }) {
    console.log('TRIG MOUSEOUT');

    // this.animationReset = true;
    // lists.forEach((list: QueryList<TableCellComponent>) => {
    //   list.forEach((cell: TableCellComponent) => cell.resetState());
    // });
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
