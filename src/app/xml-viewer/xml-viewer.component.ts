import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-xml-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './xml-viewer.component.html',
  styleUrl: './xml-viewer.component.css'
})
export class XmlViewerComponent implements OnInit {
  xmlContent: string | null = null;
  formattedXml: SafeHtml | null = null;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        this.xmlContent = content;
        this.formatXml(content);
      };
      reader.readAsText(file);
    }
  }

  formatXml(xml: string) {
    try {
      // Parse XML string
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, 'text/xml');

      // Convert XML to formatted HTML with syntax highlighting
      let formatted = '';
      const serialize = (node: Node, level: number) => {
        const indent = '  '.repeat(level);

        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          formatted += `${indent}<span style="color: #800000">&lt;${element.tagName}</span>`;

          // Add attributes
          Array.from(element.attributes).forEach(attr => {
            formatted += ` <span style="color: #ff0000">${attr.name}</span>=` +
                        `<span style="color: #0000ff">"${attr.value}"</span>`;
          });

          formatted += '<span style="color: #800000">&gt;</span>\n';

          // Process child nodes
          Array.from(node.childNodes).forEach(child => serialize(child, level + 1));

          formatted += `${indent}<span style="color: #800000">&lt;/${element.tagName}&gt;</span>\n`;
        } else if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim();
          if (text) {
            formatted += `${indent}<span style="color: #000000">${text}</span>\n`;
          }
        }
      };

      serialize(xmlDoc.documentElement, 0);
      this.formattedXml = this.sanitizer.bypassSecurityTrustHtml(formatted);
    } catch (error) {
      console.error('Error formatting XML:', error);
      this.formattedXml = null;
    }
  }
}
