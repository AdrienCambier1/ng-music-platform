import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-text-button',
  imports: [RouterModule],
  templateUrl: './text-button.component.html',
  styles: ``,
})
export class TextButtonComponent {
  @Input() value: string = '';
  @Input() link: string = '';
}
