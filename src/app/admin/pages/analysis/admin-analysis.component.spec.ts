import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminAnalysisComponent } from './admin-analysis.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AnalysisService } from '../../service/analysis';
import { UsersService } from '../../service/users';
import { LaboratoriesService } from '../../service/laboratories';
import { of, throwError } from 'rxjs';

describe('AdminAnalysisComponent', () => {
  let component: AdminAnalysisComponent;
  let fixture: ComponentFixture<AdminAnalysisComponent>;
  let analysisService: jasmine.SpyObj<AnalysisService>;
  let usersService: jasmine.SpyObj<UsersService>;
  let laboratoriesService: jasmine.SpyObj<LaboratoriesService>;

  const mockAnalysis = [
    {
      id: 1,
      laboratoryId: 1,
      userId: 1,
      status: 'COMPLETADO',
      createdAt: '2025-12-18T10:00:00',
    },
    {
      id: 2,
      laboratoryId: 2,
      userId: 2,
      status: 'PENDIENTE',
      createdAt: '2025-12-18T11:00:00',
    },
  ];

  const mockUsers = [
    {
      id: 1,
      name: 'Juan',
      firstLastname: 'Pérez',
      secondLastname: 'González',
      email: 'juan@test.com',
      username: 'jperez',
      rut: '12345678-9',
      role: 'USER',
    },
    {
      id: 2,
      name: 'María',
      firstLastname: 'López',
      secondLastname: 'García',
      email: 'maria@test.com',
      username: 'mlopez',
      rut: '98765432-1',
      role: 'USER',
    },
  ];

  const mockLaboratories = [
    {
      id: 1,
      name: 'Lab Central',
      address: 'Calle 123',
      specialty: 'Hematología',
      phone: '123456789',
      email: 'lab1@test.com',
    },
    {
      id: 2,
      name: 'Lab Norte',
      address: 'Av. Principal',
      specialty: 'Microbiología',
      phone: '987654321',
      email: 'lab2@test.com',
    },
  ];

  const mockResults = [
    {
      id: 1,
      parameterName: 'Hemoglobina',
      value: '14.5',
      unit: 'g/dL',
      referenceRange: '12.0-16.0',
      observations: 'Normal',
    },
  ];

  beforeEach(async () => {
    const analysisServiceSpy = jasmine.createSpyObj('AnalysisService', [
      'getAll',
      'create',
      'update',
      'delete',
      'getResultsByAnalysisId',
    ]);
    const usersServiceSpy = jasmine.createSpyObj('UsersService', ['getAll']);
    const laboratoriesServiceSpy = jasmine.createSpyObj('LaboratoriesService', ['getAll']);

    await TestBed.configureTestingModule({
      imports: [AdminAnalysisComponent, ReactiveFormsModule, FormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AnalysisService, useValue: analysisServiceSpy },
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: LaboratoriesService, useValue: laboratoriesServiceSpy },
      ],
    }).compileComponents();

    analysisService = TestBed.inject(AnalysisService) as jasmine.SpyObj<AnalysisService>;
    usersService = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;
    laboratoriesService = TestBed.inject(
      LaboratoriesService
    ) as jasmine.SpyObj<LaboratoriesService>;

    analysisService.getAll.and.returnValue(of([]));
    usersService.getAll.and.returnValue(of([]));
    laboratoriesService.getAll.and.returnValue(of([]));

    fixture = TestBed.createComponent(AdminAnalysisComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty analysis list', () => {
    expect(component.analysisList).toEqual([]);
  });

  it('should have a valid create form', () => {
    expect(component.createForm).toBeDefined();
    expect(component.createForm.get('laboratoryId')).toBeDefined();
    expect(component.createForm.get('userId')).toBeDefined();
    expect(component.createForm.get('status')).toBeDefined();
  });

  it('should load analysis, users and laboratories on init', () => {
    analysisService.getAll.and.returnValue(of(mockAnalysis));
    usersService.getAll.and.returnValue(of(mockUsers));
    laboratoriesService.getAll.and.returnValue(of(mockLaboratories));

    fixture.detectChanges();

    expect(analysisService.getAll).toHaveBeenCalled();
    expect(usersService.getAll).toHaveBeenCalled();
    expect(laboratoriesService.getAll).toHaveBeenCalled();
    expect(component.analysisList).toEqual(mockAnalysis);
    expect(component.users).toEqual(mockUsers);
    expect(component.laboratories).toEqual(mockLaboratories);
  });

  it('should handle error when loading analysis', () => {
    analysisService.getAll.and.returnValue(throwError(() => new Error('Error')));
    spyOn(component, 'showError');

    component.loadAnalysis();

    expect(component.errorMsg).toBe('Error al cargar análisis');
    expect(component.loading).toBe(false);
  });

  it('should handle error when loading users', () => {
    usersService.getAll.and.returnValue(throwError(() => new Error('Error')));
    spyOn(component, 'showError');

    component.loadUsers();

    expect(component.showError).toHaveBeenCalledWith('Error al cargar usuarios');
  });

  it('should handle error when loading laboratories', () => {
    laboratoriesService.getAll.and.returnValue(throwError(() => new Error('Error')));
    spyOn(component, 'showError');

    component.loadLaboratories();

    expect(component.showError).toHaveBeenCalledWith('Error al cargar laboratorios');
  });

  it('should filter analysis by search term - empty term', () => {
    component.analysisList = mockAnalysis;
    component.searchTerm.set('');

    const filtered = component.filteredAnalysis();

    expect(filtered.length).toBe(2);
  });

  it('should filter analysis by status', () => {
    component.analysisList = mockAnalysis;
    component.searchTerm.set('COMPLETADO');

    const filtered = component.filteredAnalysis();

    expect(filtered.length).toBe(1);
    expect(filtered[0].status).toBe('COMPLETADO');
  });

  it('should filter analysis by user name', () => {
    component.analysisList = mockAnalysis;
    component.users = mockUsers;
    component.searchTerm.set('Juan');

    const filtered = component.filteredAnalysis();

    expect(filtered.length).toBe(1);
  });

  it('should filter analysis by laboratory name', () => {
    component.analysisList = mockAnalysis;
    component.laboratories = mockLaboratories;
    component.searchTerm.set('Central');

    const filtered = component.filteredAnalysis();

    expect(filtered.length).toBe(1);
  });

  it('should filter analysis by id', () => {
    component.analysisList = mockAnalysis;
    component.searchTerm.set('1');

    const filtered = component.filteredAnalysis();

    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe(1);
  });

  it('should show success toast message', () => {
    jasmine.clock().install();
    component.showSuccess('Test success');

    expect(component.toastMsg).toBe('Test success');
    expect(component.showToast).toBe(true);
    expect(component.toastType).toBe('success');

    jasmine.clock().tick(3001);
    expect(component.showToast).toBe(false);
    jasmine.clock().uninstall();
  });

  it('should show error toast message', () => {
    jasmine.clock().install();
    component.showError('Test error');

    expect(component.toastMsg).toBe('Test error');
    expect(component.showToast).toBe(true);
    expect(component.toastType).toBe('error');

    jasmine.clock().tick(3001);
    expect(component.showToast).toBe(false);
    jasmine.clock().uninstall();
  });

  it('should start editing an analysis', () => {
    const analysis = mockAnalysis[0];
    component.startEdit(analysis);

    expect(component.editAnalysis).toEqual(analysis);
  });

  it('should cancel editing', () => {
    component.editAnalysis = mockAnalysis[0];
    component.cancelEdit();

    expect(component.editAnalysis).toBeNull();
  });

  it('should save edit successfully', () => {
    const updatedAnalysis = { ...mockAnalysis[0], status: 'COMPLETADO' };
    component.analysisList = [...mockAnalysis];
    component.editAnalysis = updatedAnalysis;
    analysisService.update.and.returnValue(of(updatedAnalysis));
    spyOn(component, 'showSuccess');

    component.saveEdit();

    expect(analysisService.update).toHaveBeenCalledWith(updatedAnalysis.id, updatedAnalysis);
    expect(component.editAnalysis).toBeNull();
    expect(component.saving).toBe(false);
    expect(component.showSuccess).toHaveBeenCalledWith('Análisis actualizado');
  });

  it('should handle error when saving edit', () => {
    component.editAnalysis = mockAnalysis[0];
    analysisService.update.and.returnValue(throwError(() => new Error('Error')));
    spyOn(component, 'showError');

    component.saveEdit();

    expect(component.saving).toBe(false);
    expect(component.showError).toHaveBeenCalledWith('Error al actualizar análisis');
  });

  it('should not save edit if editAnalysis is null', () => {
    component.editAnalysis = null;
    component.saveEdit();

    expect(analysisService.update).not.toHaveBeenCalled();
  });

  it('should create analysis successfully', () => {
    const newAnalysis = mockAnalysis[0];
    component.createForm.setValue({
      laboratoryId: 1,
      userId: 1,
      status: 'PENDIENTE',
    });
    analysisService.create.and.returnValue(of(newAnalysis));
    spyOn(component, 'showSuccess');

    component.createAnalysis();

    expect(analysisService.create).toHaveBeenCalled();
    expect(component.analysisList).toContain(newAnalysis);
    expect(component.saving).toBe(false);
    expect(component.showSuccess).toHaveBeenCalledWith('Análisis creado');
  });

  it('should handle error when creating analysis', () => {
    component.createForm.setValue({
      laboratoryId: 1,
      userId: 1,
      status: 'PENDIENTE',
    });
    analysisService.create.and.returnValue(throwError(() => new Error('Error')));
    spyOn(component, 'showError');

    component.createAnalysis();

    expect(component.saving).toBe(false);
    expect(component.showError).toHaveBeenCalledWith('Error al crear análisis');
  });

  it('should not create analysis if form is invalid', () => {
    component.createForm.reset();
    component.createAnalysis();

    expect(analysisService.create).not.toHaveBeenCalled();
  });

  it('should delete analysis successfully', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.analysisList = [...mockAnalysis];
    analysisService.delete.and.returnValue(of(null as any));
    spyOn(component, 'showSuccess');

    component.deleteAnalysis(1);

    expect(analysisService.delete).toHaveBeenCalledWith(1);
    expect(component.analysisList.length).toBe(1);
    expect(component.deletingId).toBeNull();
    expect(component.showSuccess).toHaveBeenCalledWith('Análisis eliminado');
  });

  it('should close results when deleting analysis being viewed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.analysisList = [...mockAnalysis];
    component.selectedAnalysisId = 1;
    analysisService.delete.and.returnValue(of(null as any));
    spyOn(component, 'closeResults');

    component.deleteAnalysis(1);

    expect(component.closeResults).toHaveBeenCalled();
  });

  it('should handle error when deleting analysis', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    analysisService.delete.and.returnValue(throwError(() => new Error('Error')));
    spyOn(component, 'showError');

    component.deleteAnalysis(1);

    expect(component.deletingId).toBeNull();
    expect(component.showError).toHaveBeenCalledWith('Error al eliminar análisis');
  });

  it('should not delete analysis if user cancels confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteAnalysis(1);

    expect(analysisService.delete).not.toHaveBeenCalled();
  });

  it('should view results when analysis has results', () => {
    const analysisWithResults = { ...mockAnalysis[0], results: mockResults };

    component.viewResults(analysisWithResults);

    expect(component.selectedAnalysisId).toBe(analysisWithResults.id);
    expect(component.selectedResults).toEqual(mockResults);
    expect(component.loadingResults).toBe(false);
  });

  it('should fetch results from service when analysis has no results', () => {
    const analysisWithoutResults = { ...mockAnalysis[0], results: [] };
    analysisService.getResultsByAnalysisId.and.returnValue(of(mockResults));

    component.viewResults(analysisWithoutResults);

    expect(component.selectedAnalysisId).toBe(analysisWithoutResults.id);
    expect(analysisService.getResultsByAnalysisId).toHaveBeenCalledWith(analysisWithoutResults.id);
  });

  it('should handle error when fetching results', () => {
    const analysis = mockAnalysis[0];
    analysisService.getResultsByAnalysisId.and.returnValue(throwError(() => new Error('Error')));
    spyOn(component, 'showError');
    spyOn(component, 'closeResults');

    component.viewResults(analysis);

    expect(component.showError).toHaveBeenCalledWith('Error al cargar resultados');
    expect(component.closeResults).toHaveBeenCalled();
  });

  it('should close results', () => {
    component.selectedAnalysisId = 1;
    component.selectedResults = mockResults;

    component.closeResults();

    expect(component.selectedAnalysisId).toBeNull();
    expect(component.selectedResults).toEqual([]);
  });

  it('should get user name when user exists', () => {
    component.users = mockUsers;

    const name = component.getUserName(1);

    expect(name).toBe('Juan Pérez');
  });

  it('should return default string when user does not exist', () => {
    component.users = mockUsers;

    const name = component.getUserName(999);

    expect(name).toBe('Usuario #999');
  });

  it('should get laboratory name when laboratory exists', () => {
    component.laboratories = mockLaboratories;

    const name = component.getLaboratoryName(1);

    expect(name).toBe('Lab Central');
  });

  it('should return default string when laboratory does not exist', () => {
    component.laboratories = mockLaboratories;

    const name = component.getLaboratoryName(999);

    expect(name).toBe('Laboratorio #999');
  });

  it('should track by id', () => {
    const analysis = mockAnalysis[0];

    const id = component.trackById(0, analysis);

    expect(id).toBe(analysis.id);
  });
});
