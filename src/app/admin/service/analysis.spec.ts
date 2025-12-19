import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AnalysisService } from './analysis';
import { Analysis, Result } from '../../model/Analysis';

describe('AnalysisService', () => {
  let service: AnalysisService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnalysisService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AnalysisService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all analysis', () => {
    const mockAnalysis: Analysis[] = [
      {
        id: 1,
        patientId: 101,
        laboratoryId: 1,
        userId: 1,
        status: 'COMPLETADO',
      },
    ];

    service.getAll().subscribe((data) => {
      expect(data.length).toBe(1);
      expect(data).toEqual(mockAnalysis);
    });

    const req = httpMock.expectOne('http://localhost:8083/analysis');
    expect(req.request.method).toBe('GET');
    req.flush(mockAnalysis);
  });

  it('should get analysis by id', () => {
    const mockAnalysis: Analysis = {
      id: 1,
      patientId: 101,
      laboratoryId: 1,
      userId: 1,
      status: 'COMPLETADO',
    };

    service.getById(1).subscribe((data) => {
      expect(data).toEqual(mockAnalysis);
    });

    const req = httpMock.expectOne('http://localhost:8083/analysis/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockAnalysis);
  });

  it('should create analysis', () => {
    const newAnalysis = {
      patientId: 101,
      laboratoryId: 1,
      userId: 1,
      status: 'PENDIENTE',
    };

    const createdAnalysis: Analysis = {
      id: 1,
      ...newAnalysis,
    };

    service.create(newAnalysis).subscribe((data) => {
      expect(data).toEqual(createdAnalysis);
    });

    const req = httpMock.expectOne('http://localhost:8083/analysis');
    expect(req.request.method).toBe('POST');
    req.flush(createdAnalysis);
  });

  it('should update analysis', () => {
    const updatedAnalysis: Analysis = {
      id: 1,
      patientId: 101,
      laboratoryId: 1,
      userId: 1,
      status: 'COMPLETADO',
    };

    service.update(1, updatedAnalysis).subscribe((data) => {
      expect(data).toEqual(updatedAnalysis);
    });

    const req = httpMock.expectOne('http://localhost:8083/analysis/1');
    expect(req.request.method).toBe('PUT');
    req.flush(updatedAnalysis);
  });

  it('should delete analysis', () => {
    service.delete(1).subscribe((data) => {
      expect(data).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:8083/analysis/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should get results by analysis id', () => {
    const mockResults: Result[] = [
      {
        id: 1,
        parameterName: 'Hemoglobina',
        value: '14.5',
        unit: 'g/dL',
        referenceRange: '12.0-16.0',
      },
    ];

    service.getResultsByAnalysisId(1).subscribe((data) => {
      expect(data.length).toBe(1);
      expect(data).toEqual(mockResults);
    });

    const req = httpMock.expectOne('http://localhost:8083/results/analysis/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockResults);
  });

  it('should get analysis by patient id', () => {
    const mockAnalysis: Analysis[] = [
      {
        id: 1,
        patientId: 101,
        laboratoryId: 1,
        userId: 1,
        status: 'COMPLETADO',
      },
    ];

    service.getByPatientId(101).subscribe((data) => {
      expect(data.length).toBe(1);
      expect(data).toEqual(mockAnalysis);
    });

    const req = httpMock.expectOne('http://localhost:8083/analysis/patient/101');
    expect(req.request.method).toBe('GET');
    req.flush(mockAnalysis);
  });

  it('should get analysis by laboratory id', () => {
    const mockAnalysis: Analysis[] = [
      {
        id: 1,
        patientId: 101,
        laboratoryId: 1,
        userId: 1,
        status: 'COMPLETADO',
      },
    ];

    service.getByLaboratoryId(1).subscribe((data) => {
      expect(data.length).toBe(1);
      expect(data).toEqual(mockAnalysis);
    });

    const req = httpMock.expectOne('http://localhost:8083/analysis/laboratory/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockAnalysis);
  });

  it('should get analysis by status', () => {
    const mockAnalysis: Analysis[] = [
      {
        id: 1,
        patientId: 101,
        laboratoryId: 1,
        userId: 1,
        status: 'COMPLETADO',
      },
    ];

    service.getByStatus('COMPLETADO').subscribe((data) => {
      expect(data.length).toBe(1);
      expect(data).toEqual(mockAnalysis);
    });

    const req = httpMock.expectOne('http://localhost:8083/analysis/status/COMPLETADO');
    expect(req.request.method).toBe('GET');
    req.flush(mockAnalysis);
  });

  it('should get analysis by patient id and status', () => {
    const mockAnalysis: Analysis[] = [
      {
        id: 1,
        patientId: 101,
        laboratoryId: 1,
        userId: 1,
        status: 'COMPLETADO',
      },
    ];

    service.getByPatientIdAndStatus(101, 'COMPLETADO').subscribe((data) => {
      expect(data.length).toBe(1);
      expect(data).toEqual(mockAnalysis);
    });

    const req = httpMock.expectOne('http://localhost:8083/analysis/patient/101/status/COMPLETADO');
    expect(req.request.method).toBe('GET');
    req.flush(mockAnalysis);
  });

  it('should get all results', () => {
    const mockResults: Result[] = [
      {
        id: 1,
        parameterName: 'Hemoglobina',
        value: '14.5',
        unit: 'g/dL',
        referenceRange: '12.0-16.0',
      },
      {
        id: 2,
        parameterName: 'Glucosa',
        value: '95',
        unit: 'mg/dL',
        referenceRange: '70-100',
      },
    ];

    service.getAllResults().subscribe((data) => {
      expect(data.length).toBe(2);
      expect(data).toEqual(mockResults);
    });

    const req = httpMock.expectOne('http://localhost:8083/results');
    expect(req.request.method).toBe('GET');
    req.flush(mockResults);
  });

  it('should get result by id', () => {
    const mockResult: Result = {
      id: 1,
      parameterName: 'Hemoglobina',
      value: '14.5',
      unit: 'g/dL',
      referenceRange: '12.0-16.0',
      observations: 'Normal',
    };

    service.getResultById(1).subscribe((data) => {
      expect(data).toEqual(mockResult);
    });

    const req = httpMock.expectOne('http://localhost:8083/results/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockResult);
  });
});
