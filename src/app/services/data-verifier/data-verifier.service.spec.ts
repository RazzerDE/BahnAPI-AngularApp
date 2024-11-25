import { TestBed } from '@angular/core/testing';

import { DataVerifierService } from './data-verifier.service';

describe('DataVerifierService', () => {
  let service: DataVerifierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataVerifierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
