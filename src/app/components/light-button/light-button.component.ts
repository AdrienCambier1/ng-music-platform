import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-light-button',
  imports: [RouterModule],
  templateUrl: './light-button.component.html',
  styles: ``,
})
export class LightButtonComponent {
  @Input() value: string = '';
  @Input() link?: string = '';
}
