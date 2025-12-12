import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminLaboratoriesComponent } from './admin-laboratories.component';
import { LaboratoriesService, Laboratory } from '../../service/laboratories';

describe('AdminLaboratoriesComponent', () => {
  let component: AdminLaboratoriesComponent;
  let fixture: ComponentFixture<AdminLaboratoriesComponent>;
  let labsServiceSpy: jasmine.SpyObj<LaboratoriesService>;

  beforeEach(async () => {
    labsServiceSpy = jasmine.createSpyObj('LaboratoriesService', [
      'getAll',
      'update',
      'create',
      'delete',
    ]);

    await TestBed.configureTestingModule({
      imports: [AdminLaboratoriesComponent],
      providers: [{ provide: LaboratoriesService, useValue: labsServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLaboratoriesComponent);
    component = fixture.componentInstance;
  });

  it('debe crearse con valores iniciales correctos', () => {
    expect(component).toBeTruthy();
    expect(component.laboratories).toEqual([]);
    expect(component.loading).toBeFalse();
    expect(component.errorMsg).toBe('');
    expect(component.editLab).toBeNull();
    expect(component.saving).toBeFalse();
    expect(component.deletingId).toBeNull();
    expect(component.showToast).toBeFalse();
  });

  it('ngOnInit / loadLabs: carga con éxito y actualiza loading y laboratories', () => {
    const mockLabs: Laboratory[] = [
      { id: 1, name: 'L1', address: 'A1', specialty: 'S1', phone: '', email: '' },
      { id: 2, name: 'L2', address: 'A2', specialty: 'S2', phone: '', email: '' },
    ];
    labsServiceSpy.getAll.and.returnValue(of(mockLabs));

    component.ngOnInit();

    expect(labsServiceSpy.getAll).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
    expect(component.laboratories).toEqual(mockLabs);
    expect(component.errorMsg).toBe('');
  });

  it('loadLabs: maneja error y setea errorMsg y loading false', () => {
    labsServiceSpy.getAll.and.returnValue(throwError(() => new Error('fail')));

    component.loadLabs();

    expect(labsServiceSpy.getAll).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
    expect(component.errorMsg).toBe('Error al cargar laboratorios');
    expect(component.laboratories).toEqual([]);
  });

  it('filteredLabs: devuelve todos si searchTerm vacío y filtra por name/specialty/address', () => {
    const mockLabs: Laboratory[] = [
      { id: 1, name: 'Alpha Lab', address: 'Street 1', specialty: 'Cardio', phone: '', email: '' },
      { id: 2, name: 'Beta Lab', address: 'Other', specialty: 'Neuro', phone: '', email: '' },
      { id: 3, name: 'Gamma', address: 'Alpha street', specialty: 'Onco', phone: '', email: '' },
    ];
    component.laboratories = mockLabs;

    // vacío -> todos
    component.searchTerm.set('');
    expect(component.filteredLabs()).toEqual(mockLabs);

    // buscar por name
    component.searchTerm.set('beta');
    expect(component.filteredLabs()).toEqual([mockLabs[1]]);

    // buscar por specialty
    component.searchTerm.set('onco');
    expect(component.filteredLabs()).toEqual([mockLabs[2]]);

    // buscar por address
    component.searchTerm.set('alpha');
    // debe coincidir tanto name 'Alpha Lab' y address 'Alpha street' -> devolver 2 elementos
    const filtered = component.filteredLabs();
    expect(filtered.length).toBe(2);
    const ids = filtered.map((l) => l.id).sort();
    expect(ids).toEqual([1, 3]);
  });

  it('startEdit / cancelEdit / trackById', () => {
    const lab: Laboratory = {
      id: 42,
      name: 'X',
      address: 'A',
      specialty: 'S',
      phone: '',
      email: '',
    };
    component.startEdit(lab);
    expect(component.editLab).not.toBeNull();
    expect(component.editLab).not.toBe(lab); // copia
    expect(component.editLab!.id).toBe(42);

    component.cancelEdit();
    expect(component.editLab).toBeNull();

    expect(component.trackById(0, lab)).toBe(42);
  });

  it('saveEdit: actualización exitosa actualiza lista, resetea editLab y muestra toast (success)', fakeAsync(() => {
    const original: Laboratory = {
      id: 5,
      name: 'Old',
      address: 'A',
      specialty: 'S',
      phone: '',
      email: '',
    };
    component.laboratories = [original];
    component.editLab = { ...original, name: 'New' };

    const updated: Laboratory = { ...component.editLab! };
    labsServiceSpy.update.and.returnValue(of(updated));

    component.saveEdit();

    expect(component.saving).toBeFalse();
    expect(component.laboratories[0].name).toBe('New');
    expect(component.editLab).toBeNull();
    // toast visible y tipo success
    expect(component.showToast).toBeTrue();
    expect(component.toastType).toBe('success');

    // después de 3000ms el toast debe ocultarse
    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('saveEdit: error al actualizar deja saving en false y muestra toast error', fakeAsync(() => {
    const original: Laboratory = {
      id: 6,
      name: 'Old2',
      address: 'A',
      specialty: 'S',
      phone: '',
      email: '',
    };
    component.laboratories = [original];
    component.editLab = { ...original, name: 'New2' };

    labsServiceSpy.update.and.returnValue(throwError(() => new Error('upderr')));

    component.saveEdit();

    expect(component.saving).toBeFalse();
    expect(component.editLab).not.toBeNull(); // no resetea editLab
    expect(component.showToast).toBeTrue();
    expect(component.toastType).toBe('error');

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('createLab: no crea si el formulario es inválido', () => {
    // formulario inicial inválido
    labsServiceSpy.create.and.returnValue(of({} as any));
    component.createForm.reset();
    component.createForm.markAsTouched();
    component.createLab();
    expect(labsServiceSpy.create).not.toHaveBeenCalled();
  });

  it('createLab: crea laboratorios correctamente y muestra toast', fakeAsync(() => {
    const newLab: Laboratory = {
      id: 99,
      name: 'NewLab',
      address: 'Addr',
      specialty: 'Spec',
      phone: '12345678', // <- phone no vacío (requerido)
      email: 'a@b.com', // <- email válido (Validators.email)
    };
    labsServiceSpy.create.and.returnValue(of(newLab));

    component.createForm.setValue({
      name: newLab.name,
      address: newLab.address,
      specialty: newLab.specialty,
      phone: newLab.phone,
      email: newLab.email,
    });

    component.createLab();

    expect(labsServiceSpy.create).toHaveBeenCalled();
    expect(component.laboratories[0]).toEqual(newLab);
    expect(component.saving).toBeFalse();
    expect(component.showToast).toBeTrue();
    expect(component.toastType).toBe('success');

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('deleteLab: cancelar confirm no llama al servicio', () => {
    spyOn(globalThis, 'confirm').and.returnValue(false);
    labsServiceSpy.delete.and.returnValue(of(void 0));

    component.laboratories = [
      { id: 10, name: '', address: '', specialty: '', phone: '', email: '' },
    ];

    component.deleteLab(10);

    expect(labsServiceSpy.delete).not.toHaveBeenCalled();
    expect(component.deletingId).toBeNull();
  });

  it('deleteLab: confirm true elimina laboratorios y muestra toast', fakeAsync(() => {
    spyOn(globalThis, 'confirm').and.returnValue(true);
    labsServiceSpy.delete.and.returnValue(of(void 0));

    component.laboratories = [
      { id: 11, name: 'ToRemove', address: '', specialty: '', phone: '', email: '' },
      { id: 12, name: 'Keep', address: '', specialty: '', phone: '', email: '' },
    ];

    component.deleteLab(11);

    expect(component.deletingId).toBeNull();
    expect(labsServiceSpy.delete).toHaveBeenCalledWith(11);
    expect(component.laboratories.find((l) => l.id === 11)).toBeUndefined();
    expect(component.showToast).toBeTrue();
    expect(component.toastType).toBe('success');

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('saveEdit: no hace nada si editLab es null', () => {
    component.laboratories = [
      { id: 1, name: 'L', address: '', specialty: '', phone: '', email: '' },
    ];
    component.editLab = null;
    // asegurar que update no es llamado y saving no cambia
    (labsServiceSpy.update as jasmine.Spy).and.returnValue(of({} as any));
    component.saveEdit();
    expect(labsServiceSpy.update).not.toHaveBeenCalled();
    expect(component.saving).toBeFalse();
  });

  it('createLab: muestra error si create falla', fakeAsync(() => {
    const newLabVal = {
      name: 'FailLab',
      address: 'Addr',
      specialty: 'Spec',
      phone: '555',
      email: 'x@y.com',
    };
    labsServiceSpy.create.and.returnValue(throwError(() => new Error('create-fail')));

    component.createForm.setValue(newLabVal);
    component.createLab();

    // Debe haberse intentado crear y quedar en estado no saving + mostrar toast error
    expect(labsServiceSpy.create).toHaveBeenCalled();
    expect(component.saving).toBeFalse();
    expect(component.showToast).toBeTrue();
    expect(component.toastType).toBe('error');

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('deleteLab: muestra error si delete falla', fakeAsync(() => {
    spyOn(globalThis, 'confirm').and.returnValue(true);
    labsServiceSpy.delete.and.returnValue(throwError(() => new Error('del-err')));

    component.laboratories = [
      { id: 21, name: 'X', address: '', specialty: '', phone: '', email: '' },
    ];

    component.deleteLab(21);

    // En caso de error deletingId debe resetearse y mostrarse toast error
    expect(labsServiceSpy.delete).toHaveBeenCalledWith(21);
    expect(component.deletingId).toBeNull();
    expect(component.showToast).toBeTrue();
    expect(component.toastType).toBe('error');

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('showError: setea toastMsg y oculta después de timeout', fakeAsync(() => {
    component.showError('boom');
    expect(component.toastMsg).toBe('boom');
    expect(component.toastType).toBe('error');
    expect(component.showToast).toBeTrue();

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('saveEdit: when update returns a different id it keeps original items (covers the `: l` branch)', fakeAsync(() => {
    const original: Laboratory = {
      id: 5,
      name: 'Old',
      address: 'A',
      specialty: 'S',
      phone: '',
      email: '',
    };
    // la lista contiene el original con id 5
    component.laboratories = [original];
    // editamos el elemento con id 5
    component.editLab = { ...original, name: 'New' };

    // el servicio devuelve un "updated" con id distinto (p. ej. 999)
    const updated: Laboratory = { ...component.editLab!, id: 999, name: 'New' };
    labsServiceSpy.update.and.returnValue(of(updated));

    component.saveEdit();

    // El flujo exitoso continúa: saving queda en false y editLab se resetea
    expect(component.saving).toBeFalse();
    expect(component.editLab).toBeNull();

    // Como updated.id !== original.id, el map no reemplaza nada -> la lista permanece igual
    expect(component.laboratories.length).toBe(1);
    expect(component.laboratories[0]).toEqual(original);
    expect(component.laboratories[0]).not.toEqual(updated);

    // se muestra toast de success y luego se oculta
    expect(component.showToast).toBeTrue();
    expect(component.toastType).toBe('success');

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));
});
