import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XmlViewerComponent } from './xml-viewer.component';

describe('XmlViewerComponent', () => {
  let component: XmlViewerComponent;
  let fixture: ComponentFixture<XmlViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XmlViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XmlViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
