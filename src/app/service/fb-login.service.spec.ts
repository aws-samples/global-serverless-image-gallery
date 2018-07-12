import { TestBed, inject } from '@angular/core/testing';

import { FbLoginService } from './fb-login.service';

describe('FbLoginService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FbLoginService]
    });
  });

  it('should be created', inject([FbLoginService], (service: FbLoginService) => {
    expect(service).toBeTruthy();
  }));
});
