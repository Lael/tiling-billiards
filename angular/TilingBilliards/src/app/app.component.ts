import { Component } from '@angular/core';
import { TilingBilliardsComponent } from '../tile-billiards/tiling-billiards-component'

@Component({
  selector: 'app-root',
  imports: [TilingBilliardsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'TilingBilliards';
}
