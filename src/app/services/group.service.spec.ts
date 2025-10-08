import { GroupService } from './group.service';

describe('GroupService', () => {
  let service: GroupService;
  const base = 'http://localhost:3000/api/groups';

  beforeEach(() => {
    service = new GroupService();

    (globalThis as any).fetch = jasmine.createSpy('fetch').and.returnValue(
      Promise.resolve({
        json: () => Promise.resolve([{ name: 'Test Group' }])
      })
    );
  });

  it('should fetch all groups', async () => {
    const result = await service.list();

    expect(fetch).toHaveBeenCalledWith(base);
    expect(result[0].name).toBe('Test Group');
  });

  it('should create a new group', async () => {
    // ✅ Update the mock to simulate creating a group
    (fetch as jasmine.Spy).and.returnValue(
      Promise.resolve({
        json: () => Promise.resolve({ name: 'New Group' })
      })
    );

    const result = await service.create('New Group', 'admin');
    expect(fetch).toHaveBeenCalled();
    expect(result.name).toBe('New Group');
  });
});
