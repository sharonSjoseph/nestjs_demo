import { Test, TestingModule } from '@nestjs/testing';
import { CmsGroupService } from './cms-group.service';

describe('CmsGroupService', () => {
  let service: CmsGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CmsGroupService],
    }).compile();

    service = module.get<CmsGroupService>(CmsGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
