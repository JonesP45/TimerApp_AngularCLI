import { TestBed } from '@angular/core/testing';

import { StockageLocalService } from './stockage-local.service';

describe('StockageLocalService', () => {
  let service: StockageLocalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockageLocalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
