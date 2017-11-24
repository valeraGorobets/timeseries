import { TestBed, inject } from '@angular/core/testing';

import { InvestmentManagerService } from './investment-manager.service';

describe('InvestmentManagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InvestmentManagerService]
    });
  });

  it('should be created', inject([InvestmentManagerService], (service: InvestmentManagerService) => {
    expect(service).toBeTruthy();
  }));
});
