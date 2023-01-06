import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TableService } from 'src/app/services/table.service';

@Component({
  selector: 'app-table-cell',
  templateUrl: './table-cell.component.html',
  styleUrls: ['./table-cell.component.scss'],
  standalone: true,
})
export class TableCellComponent implements OnInit, OnDestroy, OnChanges {
  @Input('isMatch') isMatch: boolean = false;
  @Input('animSkipRows') skipRows: string = '';
  @Input('rowIndex') rowIndex: number = 0;
  @Input('totalRows') totalRows: number = 0;
  isSelected: boolean = false;

  destroy$ = new Subject<void>();

  @ViewChild('cell', { static: true }) cell!: ElementRef<HTMLElement>;

  constructor(
    private tableService: TableService,
    private renderer: Renderer2
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isMatch'].firstChange) {
      this.renderer.setAttribute(
        this.cell.nativeElement,
        'style',
        `
        --lift: 0;
        `
      );
    }
  }

  ngOnInit(): void {
    this.tableService.selectedCells.subscribe((value) => {
      this.isSelected = value.includes(this);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public liftDown() {
    this.renderer.setAttribute(
      this.cell.nativeElement,
      'style',
      `
      --lift: ${50 * (this.totalRows - this.rowIndex - 1)}px;
      `
    );
  }

  public liftUp(stepsUp: number) {
    this.renderer.setAttribute(
      this.cell.nativeElement,
      'style',
      `
      --lift: ${50 * stepsUp}px;
      `
    );
  }

  public resetState() {
    this.renderer.setAttribute(
      this.cell.nativeElement,
      'style',
      `
      --lift: 0;
      `
    );
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
    return this.isMatch && this.isSelected;
  }
}
