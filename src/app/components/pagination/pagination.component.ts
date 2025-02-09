import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TextButtonComponent } from '../text-button/text-button.component';

@Component({
  selector: 'app-pagination',
  imports: [TextButtonComponent],
  templateUrl: './pagination.component.html',
  styles: [],
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() itemsPerPage: number = 20;
  @Input() totalItems: number = 0;

  @Output() pageChange = new EventEmitter<number>();

  goToNextPage(): void {
    if (!this.isNextDisabled()) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  goToPreviousPage(): void {
    if (!this.isPreviousDisabled()) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  isNextDisabled(): boolean {
    return this.currentPage * this.itemsPerPage >= this.totalItems;
  }

  isPreviousDisabled(): boolean {
    return this.currentPage <= 1;
  }
}
