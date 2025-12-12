import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminUsersComponent } from './admin-users.component';
import { UsersService, User } from '../../service/users';

describe('AdminUsersComponent', () => {
  let component: AdminUsersComponent;
  let fixture: ComponentFixture<AdminUsersComponent>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;

  beforeEach(async () => {
    usersServiceSpy = jasmine.createSpyObj('UsersService', [
      'getAll',
      'update',
      'create',
      'delete',
    ]);

    await TestBed.configureTestingModule({
      imports: [AdminUsersComponent],
      providers: [{ provide: UsersService, useValue: usersServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUsersComponent);
    component = fixture.componentInstance;
  });

  it('crea el componente con valores iniciales', () => {
    expect(component).toBeTruthy();
    expect(component.users).toEqual([]);
    expect(component.loading).toBeFalse();
    expect(component.errorMsg).toBe('');
    expect(component.editUser).toBeNull();
    expect(component.saving).toBeFalse();
    expect(component.deletingId).toBeNull();
    expect(component.showToast).toBeFalse();
  });

  it('ngOnInit / loadUsers carga usuarios correctamente', () => {
    const mockUsers: User[] = [
      {
        id: 1,
        username: 'u1',
        name: 'A',
        firstLastname: '',
        secondLastname: '',
        email: '',
        rut: '',
        role: '',
      },
      {
        id: 2,
        username: 'u2',
        name: 'B',
        firstLastname: '',
        secondLastname: '',
        email: '',
        rut: '',
        role: '',
      },
    ];
    usersServiceSpy.getAll.and.returnValue(of(mockUsers));

    component.ngOnInit();

    expect(usersServiceSpy.getAll).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
    expect(component.users).toEqual(mockUsers);
    expect(component.errorMsg).toBe('');
  });

  it('loadUsers maneja error, setea errorMsg y muestra toast de error', fakeAsync(() => {
    usersServiceSpy.getAll.and.returnValue(throwError(() => new Error('fail')));

    component.loadUsers();

    expect(usersServiceSpy.getAll).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
    expect(component.errorMsg).toBe('Error al cargar usuarios');

    // showError llama a setTimeout para ocultar el toast
    expect(component.showToast).toBeTrue();
    expect(component.toastType).toBe('error');
    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('filteredUsers devuelve todos y filtra por name/username/email/role', () => {
    const mockUsers: User[] = [
      {
        id: 1,
        username: 'alpha',
        name: 'Alpha',
        firstLastname: '',
        secondLastname: '',
        email: 'a@x.com',
        rut: '',
        role: 'admin',
      },
      {
        id: 2,
        username: 'beta',
        name: 'Beta',
        firstLastname: '',
        secondLastname: '',
        email: 'b@y.com',
        rut: '',
        role: 'user',
      },
      {
        id: 3,
        username: 'gamma',
        name: 'Gamma',
        firstLastname: '',
        secondLastname: '',
        email: 'g@z.com',
        rut: '',
        role: 'support',
      },
    ];
    component.users = mockUsers;

    component.searchTerm.set('');
    expect(component.filteredUsers()).toEqual(mockUsers);

    component.searchTerm.set('beta');
    expect(component.filteredUsers()).toEqual([mockUsers[1]]);

    component.searchTerm.set('alpha');
    expect(component.filteredUsers()).toEqual([mockUsers[0]]);

    component.searchTerm.set('g@z.com');
    expect(component.filteredUsers()).toEqual([mockUsers[2]]);

    component.searchTerm.set('support');
    expect(component.filteredUsers()).toEqual([mockUsers[2]]);
  });

  it('startEdit / cancelEdit / trackById funcionan correctamente', () => {
    const u: User = {
      id: 42,
      username: 'u',
      name: 'N',
      firstLastname: '',
      secondLastname: '',
      email: '',
      rut: '',
      role: '',
    };
    component.startEdit(u);
    expect(component.editUser).not.toBeNull();
    const edit = component.editUser;
    if (!edit) {
      fail('editUser debe existir');
      return;
    }
    expect(edit).not.toBe(u); // copia
    expect(edit.id).toBe(42);

    component.cancelEdit();
    expect(component.editUser).toBeNull();

    expect(component.trackById(0, u)).toBe(42);
  });

  it('saveEdit actualiza usuario correctamente y muestra toast success', fakeAsync(() => {
    const original: User = {
      id: 5,
      username: 'old',
      name: 'Old',
      firstLastname: '',
      secondLastname: '',
      email: '',
      rut: '',
      role: '',
    };
    component.users = [original];
    component.editUser = { ...original, name: 'New' };

    const edit = component.editUser;
    if (!edit) {
      fail('editUser debe existir');
      return;
    }

    const updated: User = { ...edit };
    usersServiceSpy.update.and.returnValue(of(updated));

    component.saveEdit();

    expect(component.saving).toBeFalse();
    expect(component.users[0].name).toBe('New');
    expect(component.editUser).toBeNull();
    expect(component.showToast).toBeTrue();
    expect(component.toastType).toBe('success');

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('saveEdit muestra toast error en caso de fallo y no resetea editUser', fakeAsync(() => {
    const original: User = {
      id: 6,
      username: 'o2',
      name: 'Old2',
      firstLastname: '',
      secondLastname: '',
      email: '',
      rut: '',
      role: '',
    };
    component.users = [original];
    component.editUser = { ...original, name: 'New2' };

    usersServiceSpy.update.and.returnValue(throwError(() => new Error('upd-err')));

    component.saveEdit();

    expect(component.saving).toBeFalse();
    expect(component.editUser).not.toBeNull();
    expect(component.showToast).toBeTrue();
    expect(component.toastType).toBe('error');

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('saveEdit no hace nada si editUser es null', () => {
    component.users = [
      {
        id: 1,
        username: 'x',
        name: '',
        firstLastname: '',
        secondLastname: '',
        email: '',
        rut: '',
        role: '',
      },
    ];
    component.editUser = null;
    (usersServiceSpy.update as jasmine.Spy).and.returnValue(of({} as any));
    component.saveEdit();
    expect(usersServiceSpy.update).not.toHaveBeenCalled();
    expect(component.saving).toBeFalse();
  });

  it('createUser no llama al servicio si formulario inválido', () => {
    usersServiceSpy.create.and.returnValue(of({} as any));
    component.createForm.reset();
    component.createForm.markAsTouched();
    component.createUser();
    expect(usersServiceSpy.create).not.toHaveBeenCalled();
  });

  it('createUser crea usuario correctamente y muestra toast success', fakeAsync(() => {
    const newUser: User = {
      id: 99,
      username: 'newu',
      name: 'New User',
      firstLastname: 'F',
      secondLastname: 'S',
      email: 'n@u.com',
      rut: '12345678-9',
      role: 'admin',
    };
    usersServiceSpy.create.and.returnValue(of(newUser));

    component.createForm.setValue({
      name: newUser.name,
      firstLastname: newUser.firstLastname,
      secondLastname: newUser.secondLastname,
      email: newUser.email,
      username: newUser.username,
      password: '12345',
      rut: newUser.rut,
      role: newUser.role,
    });

    component.createUser();

    expect(usersServiceSpy.create).toHaveBeenCalled();
    expect(component.users[0]).toEqual(newUser);
    expect(component.saving).toBeFalse();
    expect(component.showToast).toBeTrue();
    expect(component.toastType).toBe('success');

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('createUser muestra error si create falla', fakeAsync(() => {
    usersServiceSpy.create.and.returnValue(throwError(() => new Error('create-err')));

    component.createForm.setValue({
      name: 'X',
      firstLastname: 'F',
      secondLastname: 'S',
      email: 'e@e.com',
      username: 'u',
      password: '12345',
      rut: '12345678-9',
      role: '',
    });

    component.createUser();

    expect(usersServiceSpy.create).toHaveBeenCalled();
    expect(component.saving).toBeFalse();
    expect(component.showToast).toBeTrue();
    expect(component.toastType).toBe('error');

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('deleteUser cancelar confirm no llama al servicio', () => {
    spyOn(globalThis, 'confirm').and.returnValue(false);
    usersServiceSpy.delete.and.returnValue(of(void 0));

    component.users = [
      {
        id: 10,
        username: 'a',
        name: '',
        firstLastname: '',
        secondLastname: '',
        email: '',
        rut: '',
        role: '',
      },
    ];

    component.deleteUser(10);

    expect(usersServiceSpy.delete).not.toHaveBeenCalled();
    expect(component.deletingId).toBeNull();
  });

  it('deleteUser confirm true elimina y muestra toast success', fakeAsync(() => {
    spyOn(globalThis, 'confirm').and.returnValue(true);
    usersServiceSpy.delete.and.returnValue(of(void 0));

    component.users = [
      {
        id: 11,
        username: 'toremove',
        name: '',
        firstLastname: '',
        secondLastname: '',
        email: '',
        rut: '',
        role: '',
      },
      {
        id: 12,
        username: 'keep',
        name: '',
        firstLastname: '',
        secondLastname: '',
        email: '',
        rut: '',
        role: '',
      },
    ];

    component.deleteUser(11);

    expect(component.deletingId).toBeNull();
    expect(usersServiceSpy.delete).toHaveBeenCalledWith(11);
    expect(component.users.find((u) => u.id === 11)).toBeUndefined();
    expect(component.showToast).toBeTrue();
    expect(component.toastType).toBe('success');

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('deleteUser muestra error si delete falla', fakeAsync(() => {
    spyOn(globalThis, 'confirm').and.returnValue(true);
    usersServiceSpy.delete.and.returnValue(throwError(() => new Error('del-err')));

    component.users = [
      {
        id: 21,
        username: 'x',
        name: '',
        firstLastname: '',
        secondLastname: '',
        email: '',
        rut: '',
        role: '',
      },
    ];

    component.deleteUser(21);

    expect(usersServiceSpy.delete).toHaveBeenCalledWith(21);
    expect(component.deletingId).toBeNull();
    expect(component.errorMsg).toBe('Error al eliminar usuario');
    expect(component.showToast).toBeTrue();
    expect(component.toastType).toBe('error');

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('showSuccess y showError setean toast y se ocultan tras timeout', fakeAsync(() => {
    component.showSuccess('ok');
    expect(component.toastMsg).toBe('ok');
    expect(component.toastType).toBe('success');
    expect(component.showToast).toBeTrue();
    tick(3000);
    expect(component.showToast).toBeFalse();

    component.showError('err');
    expect(component.toastMsg).toBe('err');
    expect(component.toastType).toBe('error');
    expect(component.showToast).toBeTrue();
    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('saveEdit: si update devuelve id distinto mantiene elementos originales (cubre rama `: u`)', fakeAsync(() => {
    const original: User = {
      id: 5,
      username: 'old',
      name: 'Old',
      firstLastname: '',
      secondLastname: '',
      email: '',
      rut: '',
      role: '',
    };
    component.users = [original];
    component.editUser = { ...original, name: 'New' };

    const edit = component.editUser;
    if (!edit) {
      fail('editUser debe existir');
      return;
    }

    const updated: User = { ...edit, id: 999, name: 'New' };
    usersServiceSpy.update.and.returnValue(of(updated));

    component.saveEdit();

    expect(component.saving).toBeFalse();
    expect(component.editUser).toBeNull();

    // El map no reemplaza nada porque updated.id !== original.id
    expect(component.users.length).toBe(1);
    expect(component.users[0]).toEqual(original);
    expect(component.users[0]).not.toEqual(updated);

    expect(component.showToast).toBeTrue();
    expect(component.toastType).toBe('success');
    tick(3000);
    expect(component.showToast).toBeFalse();
  }));
});
