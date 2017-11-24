import { TestBed, inject } from '@angular/core/testing';

import { KellyCriterionService } from './kelly-criterion.service';

describe('KellyCriterionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KellyCriterionService]
    });
  });

  it('should be created', inject([KellyCriterionService], (service: KellyCriterionService) => {
    expect(service).toBeTruthy();
  }));
});
