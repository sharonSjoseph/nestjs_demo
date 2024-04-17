import { Test, TestingModule } from '@nestjs/testing';
import { CmsResolver } from './cms.resolver';
import { CmsService } from './cms.service';

describe('CmsResolver', () => {
  let resolver: CmsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CmsResolver, CmsService],
    }).compile();

    resolver = module.get<CmsResolver>(CmsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
