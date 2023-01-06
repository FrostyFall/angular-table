import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { TableEntry } from '../interfaces/tableEntry.interface';
import data from '../entities/data';

@Injectable({
  providedIn: 'root',
})
export class TableService {
  private dataSource$ = new BehaviorSubject<TableEntry[]>(data);
  data$ = this.dataSource$.asObservable();

  public selectedCells = new BehaviorSubject<any>([]);
}
