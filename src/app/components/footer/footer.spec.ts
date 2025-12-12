import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Footer } from './footer';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the footer element', () => {
    const footerEl: HTMLElement | null = fixture.nativeElement.querySelector('footer');
    expect(footerEl).toBeTruthy();
    expect(footerEl?.className).toContain('footer');
  });

  it('should display the logo image with correct alt and src', () => {
    const imgDebug = fixture.debugElement.query(By.css('img.footer-logo'));
    expect(imgDebug).toBeTruthy();

    const img: HTMLImageElement = imgDebug.nativeElement;
    expect(img.getAttribute('alt')).toBe('LabSync Logo');
    expect(img.getAttribute('src')).toBe('assets/logoblanco.png');
  });

  it('should show copyright text', () => {
    const spanDebug = fixture.debugElement.query(By.css('span.fw-bold.text-white'));
    expect(spanDebug).toBeTruthy();

    const text = (spanDebug.nativeElement as HTMLElement).textContent?.trim();
    expect(text).toBe('© 2025 LabSync — Gestión de Laboratorios');
  });

  it('should have responsive layout classes', () => {
    const container = fixture.debugElement.query(By.css('.container'));
    const row = fixture.debugElement.query(By.css('.row.align-items-center'));
    const colLogo = fixture.debugElement.query(By.css('.col-12.col-md-4'));
    const colText = fixture.debugElement.query(By.css('.col-12.col-md-8'));

    expect(container).toBeTruthy();
    expect(row).toBeTruthy();
    expect(colLogo).toBeTruthy();
    expect(colText).toBeTruthy();
  });
});
