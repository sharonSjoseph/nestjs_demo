import { Test, TestingModule } from '@nestjs/testing';
import { CmsGroupResolver } from './cms-group.resolver';
import { CmsGroupService } from './cms-group.service';

describe('CmsGroupResolver', () => {
  let resolver: CmsGroupResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CmsGroupResolver, CmsGroupService],
    }).compile();

    resolver = module.get<CmsGroupResolver>(CmsGroupResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
