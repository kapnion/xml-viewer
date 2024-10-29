import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-xml-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './xml-viewer.component.html',
  styleUrls: ['./xml-viewer.component.css']
})
export class XmlViewerComponent implements OnInit, AfterViewInit {
  xmlContent: string | null = null;
  formattedXml: SafeHtml | null = null;
  searchQuery: string = '';

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {}

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

  onSearch(event: any) {
    this.searchQuery = event.target.value;
    if (this.xmlContent) {
      this.formatXml(this.xmlContent);
    }
  }

  formatXml(xml: string) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, 'text/xml');

      const container = this.renderer.createElement('div');
      this.serialize(xmlDoc.documentElement, 0, container);

      const formattedXmlElement = this.el.nativeElement.querySelector('.formatted-xml');
      if (formattedXmlElement) {
        formattedXmlElement.innerHTML = '';
        this.renderer.appendChild(formattedXmlElement, container);
      } else {
        console.error('Error: .formatted-xml element not found');
      }
    } catch (error) {
      console.error('Error formatting XML:', error);
      this.formattedXml = null;
    }
  }

  serialize(node: Node, level: number, parent: HTMLElement) {
    const indent = '  '.repeat(level);

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const hasChildren = element.childNodes.length > 0;
      const collapsibleClass = hasChildren ? 'collapsible' : '';

      const nodeElement = this.renderer.createElement('div');
      this.renderer.addClass(nodeElement, 'xml-node');
      if (collapsibleClass) {
        this.renderer.addClass(nodeElement, collapsibleClass);
        this.renderer.addClass(nodeElement, 'expanded'); // Expand by default
      }
      this.renderer.setStyle(nodeElement, 'color', '#800000');
      this.renderer.setProperty(nodeElement, 'innerHTML', `&lt;${this.highlightText(element.tagName)}`);

      Array.from(element.attributes).forEach(attr => {
        const attrElement = this.renderer.createElement('span');
        this.renderer.setStyle(attrElement, 'color', '#ff0000');
        this.renderer.setProperty(attrElement, 'innerHTML', ` ${this.highlightText(attr.name)}=`);
        this.renderer.appendChild(nodeElement, attrElement);

        const valueElement = this.renderer.createElement('span');
        this.renderer.setStyle(valueElement, 'color', '#0000ff');
        this.renderer.setProperty(valueElement, 'innerHTML', `"${this.highlightText(attr.value)}"`);
        this.renderer.appendChild(nodeElement, valueElement);
      });

      const endElement = this.renderer.createElement('span');
      this.renderer.setStyle(endElement, 'color', '#800000');
      this.renderer.setProperty(endElement, 'innerHTML', '&gt;');
      this.renderer.appendChild(nodeElement, endElement);

      this.renderer.appendChild(parent, nodeElement);

      let childrenContainer: HTMLElement | null = null;

      if (hasChildren) {
        childrenContainer = this.renderer.createElement('div');
        this.renderer.addClass(childrenContainer, 'xml-children');
        this.renderer.addClass(childrenContainer, 'expanded'); // Expand by default
        Array.from(node.childNodes).forEach(child => this.serialize(child, level + 1, childrenContainer as HTMLElement));
        this.renderer.appendChild(parent, childrenContainer);
      }

      const closingElement = this.renderer.createElement('div');
      this.renderer.addClass(closingElement, 'xml-node');
      this.renderer.setStyle(closingElement, 'color', '#800000');
      this.renderer.setProperty(closingElement, 'innerHTML', `&lt;/${this.highlightText(element.tagName)}&gt;`);
      this.renderer.appendChild(parent, closingElement);

      if (collapsibleClass) {
        this.renderer.listen(nodeElement, 'click', () => {
          nodeElement.classList.toggle('expanded');
          if (childrenContainer) {
            childrenContainer.classList.toggle('expanded');
          }
        });
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        const textElement = this.renderer.createElement('div');
        this.renderer.setStyle(textElement, 'color', '#000000');
        this.renderer.setProperty(textElement, 'innerHTML', this.highlightText(text));
        this.renderer.appendChild(parent, textElement);
      }
    }
  }

  highlightText(text: string): string {
    if (!this.searchQuery) {
      return text;
    }
    const regex = new RegExp(`(${this.searchQuery})`, 'gi');
    return text.replace(regex, '<span style="background-color: yellow;">$1</span>');
  }
}
