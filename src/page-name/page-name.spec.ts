import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageName } from './page-name';

describe('PageName', () => {
  let component: PageName;
  let fixture: ComponentFixture<PageName>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageName]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageName);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
