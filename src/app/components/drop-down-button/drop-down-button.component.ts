import { Component, Input, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-drop-down-button',
  imports: [CommonModule],
  templateUrl: './drop-down-button.component.html',
  styles: ``,
})
export class DropDownButtonComponent {
  @Input() buttonLabel: string = '';
  @Input() options: { label: string; action: () => void }[] = [];

  isOpen = false;

  constructor(private eRef: ElementRef) {}

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectOption(option: { label: string; action: () => void }) {
    option.action();
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
