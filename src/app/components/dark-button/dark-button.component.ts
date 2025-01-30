import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dark-button',
  imports: [RouterModule],
  templateUrl: './dark-button.component.html',
  styles: ``,
})
export class DarkButtonComponent {
  @Input() value: string = '';
  @Input() link?: string = '';
}
