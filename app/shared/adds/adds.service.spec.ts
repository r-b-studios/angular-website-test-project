import { TestBed } from '@angular/core/testing';

import { AddsService } from './adds.service';

describe('AddsService', () => {
  let service: AddsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
