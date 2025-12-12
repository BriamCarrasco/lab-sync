import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminHomeComponent } from './admin-home.component';
import { UsersService } from '../../service/users';
import { LaboratoriesService } from '../../service/laboratories';
import { ActivatedRoute } from '@angular/router'; // <-- nuevo import

describe('AdminHomeComponent', () => {
  let component: AdminHomeComponent;
  let fixture: ComponentFixture<AdminHomeComponent>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let laboratoriesServiceSpy: jasmine.SpyObj<LaboratoriesService>;

  beforeEach(async () => {
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['getAll']);
    laboratoriesServiceSpy = jasmine.createSpyObj('LaboratoriesService', ['getAll']);

    await TestBed.configureTestingModule({
      imports: [AdminHomeComponent],
      providers: [
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: LaboratoriesService, useValue: laboratoriesServiceSpy },
        { provide: ActivatedRoute, useValue: {} }, // <-- mock vacío suficiente
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminHomeComponent);
    component = fixture.componentInstance;
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar totales correctamente en ngOnInit', () => {
    const mockUsers = [{ id: 1 }, { id: 2 }];
    const mockLabs = [{ id: 1 }];

    usersServiceSpy.getAll.and.returnValue(of(mockUsers as any));
    laboratoriesServiceSpy.getAll.and.returnValue(of(mockLabs as any));

    expect(component.loading).toBeFalse();
    expect(component.totalUsers).toBe(0);
    expect(component.totalLaboratories).toBe(0);

    component.ngOnInit();

    expect(component.loading).toBeFalse();
    expect(component.totalUsers).toBe(2);
    expect(component.totalLaboratories).toBe(1);
    expect(usersServiceSpy.getAll).toHaveBeenCalled();
    expect(laboratoriesServiceSpy.getAll).toHaveBeenCalled();
  });

  it('debe poner loading en true mientras carga usuarios y luego en false', () => {
    const mockUsers = [{ id: 1 }];

    usersServiceSpy.getAll.and.returnValue(of(mockUsers as any));
    laboratoriesServiceSpy.getAll.and.returnValue(of([] as any));

    expect(component.loading).toBeFalse();

    component.ngOnInit();

    expect(component.loading).toBeFalse();
  });

  it('debe poner loading en false cuando hay error al cargar usuarios', () => {
    usersServiceSpy.getAll.and.returnValue(throwError(() => new Error('fail')));
    laboratoriesServiceSpy.getAll.and.returnValue(of([] as any));

    component.ngOnInit();

    expect(component.loading).toBeFalse();
    expect(component.totalUsers).toBe(0);
  });
});
