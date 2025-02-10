import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  imports: [FormsModule],
  templateUrl: './search-input.component.html',
  styles: ``,
})
export class SearchInputComponent {
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();

  private storageSearchKey = 'searchValue';

  ngOnInit(): void {
    const storedValue = localStorage.getItem(this.storageSearchKey);
    if (storedValue) {
      this.value = storedValue;
      this.valueChange.emit(this.value);
    }
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    localStorage.setItem(this.storageSearchKey, this.value);
    this.valueChange.emit(this.value);
  }

  clearSearch(): void {
    this.value = '';
    localStorage.removeItem(this.storageSearchKey);
    this.valueChange.emit(this.value);
  }
}
