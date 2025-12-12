import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Landing } from './landing';

describe('Landing', () => {
  let component: Landing;
  let fixture: ComponentFixture<Landing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Landing],
    }).compileComponents();

    fixture = TestBed.createComponent(Landing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the landing template', () => {
    const landingEl: HTMLElement = fixture.nativeElement;
    // Verifica que el elemento principal exista
    expect(landingEl).toBeTruthy();
    // Puedes agregar más asserts si el template tiene contenido específico
  });
});
