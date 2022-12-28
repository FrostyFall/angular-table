import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TableService } from 'src/app/services/table.service';

@Component({
  selector: 'app-table-cell',
  templateUrl: './table-cell.component.html',
  styleUrls: ['./table-cell.component.scss'],
  standalone: true,
})
export class TableCellComponent implements OnInit, OnDestroy {
  @Input('isMatch') isMatch: boolean = false;
  isSelected: boolean = false;

  destroy$ = new Subject<void>();

  constructor(private tableService: TableService) {}

  ngOnInit(): void {
    this.tableService.selectedCells.subscribe((value) => {
      this.isSelected = value.includes(this);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('click')
  onSelect(): void {
    const prevState = this.isSelected;
    const currentCells: any[] = this.tableService.selectedCells.getValue();

    if (!prevState) {
      if (currentCells.length > 2) {
        currentCells.shift();
      }

      currentCells.push(this);
    } else {
      const thisIndex = currentCells.findIndex((value) => value == this);
      currentCells.splice(thisIndex, 1);
    }

    this.tableService.selectedCells.next(currentCells);
    this.isSelected = !prevState;
  }

  public isCollision(): boolean {
    if (this.isMatch && this.isSelected) {
      return true;
    }
    return false;
  }
}
