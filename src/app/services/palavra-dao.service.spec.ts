import { TestBed } from '@angular/core/testing';

import { PalavraDaoService } from './palavra-dao.service';

describe('PalavraDaoService', () => {
  let service: PalavraDaoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PalavraDaoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
