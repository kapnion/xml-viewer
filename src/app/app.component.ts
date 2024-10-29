import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { XmlViewerComponent } from "./xml-viewer/xml-viewer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, XmlViewerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'xml-viewer';
}
