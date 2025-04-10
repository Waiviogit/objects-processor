import { describe, it, expect, vi } from 'vitest';
import ObjectProcessor from '../index';
import { App, Wobject, Authority } from '../interfaces';
import * as _ from 'lodash';

describe('getObjectAdminsOwnershipAndAdministrative', () => {
  // Mock dependencies
  const mockFindParentsByPermlink = vi.fn();
  const mockGetWaivioAdminsAndOwner = vi.fn();
  const mockGetBlacklist = vi.fn();
  const mockGetObjectsByGroupId = vi.fn();
  const mockGetAssignedAdmins = vi.fn();

  // Create processor instance
  const processor = new ObjectProcessor({
    findParentsByPermlink: mockFindParentsByPermlink,
    getWaivioAdminsAndOwner: mockGetWaivioAdminsAndOwner,
    getBlacklist: mockGetBlacklist,
    getObjectsByGroupId: mockGetObjectsByGroupId,
    masterAccount: 'master'
  });

  // Mock the getAssignedAdmins method
  processor['getAssignedAdmins'] = mockGetAssignedAdmins;

  // Helper function to create test data
  const createTestData = (overrides: Partial<{
    app: Partial<App>;
    obj: Partial<Wobject>;
  }> = {}) => {
    const defaultApp: Partial<App> = {
      authority: ['auth1', 'auth2', 'auth3'],
      trustedAll: ['trusted1', 'trusted2']
    };

    const defaultObj: Partial<Wobject> = {
      authority: {
        ownership: ['owner1', 'owner2', 'auth1'],
        administrative: ['admin1', 'admin2', 'auth2']
      } as Authority
    };

    return {
      app: { ...defaultApp, ...overrides.app } as App,
      obj: { ...defaultObj, ...overrides.obj } as Wobject,
      admins: ['admin1', 'admin2'],
      owner: 'owner1',
      blacklist: ['blacklisted1'],
      objectControl: false,
      extraAuthority: ''
    };
  };

  it('should correctly calculate ownership and administrative arrays', () => {
    // Setup
    const { app, obj, admins, owner, blacklist, objectControl, extraAuthority } = createTestData();
    mockGetAssignedAdmins.mockReturnValue(['assigned1', 'assigned2']);

    // Execute
    const result = processor['getObjectAdminsOwnershipAndAdministrative']({
      app,
      obj,
      admins,
      owner,
      blacklist,
      objectControl,
      extraAuthority
    });

    // Verify
    expect(result.ownership).toEqual(['auth1']);
    expect(result.administrative).toEqual(['auth2']);
    expect(result.objectAdmins).toEqual(['admin1', 'admin2', 'assigned1', 'assigned2']);
  });

  it('should handle empty arrays correctly', () => {
    // Setup
    const { app, obj, admins, owner, blacklist, objectControl, extraAuthority } = createTestData({
      app: { authority: [], trustedAll: [] },
      obj: { authority: { ownership: [], administrative: [] } as Authority }
    });
    mockGetAssignedAdmins.mockReturnValue([]);

    // Execute
    const result = processor['getObjectAdminsOwnershipAndAdministrative']({
      app,
      obj,
      admins,
      owner,
      blacklist,
      objectControl,
      extraAuthority
    });

    // Verify
    expect(result.ownership).toEqual([]);
    expect(result.administrative).toEqual([]);
    expect(result.objectAdmins).toEqual(['admin1', 'admin2']);
  });

  it('should handle objectControl and extraAuthority correctly', () => {
    // Setup
    const { app, obj, admins, owner, blacklist } = createTestData();
    const objectControl = true;
    const extraAuthority = 'extra1';
    mockGetAssignedAdmins.mockReturnValue(['assigned1']);

    // Execute
    const result = processor['getObjectAdminsOwnershipAndAdministrative']({
      app,
      obj,
      admins,
      owner,
      blacklist,
      objectControl,
      extraAuthority
    });

    // Verify
    expect(result.ownership).toContain('extra1');
    expect(result.ownership).toContain('admin1');
    expect(result.ownership).toContain('admin2');
    expect(result.ownership).toContain('assigned1');
  });

  it('should not add extraAuthority when objectControl is false', () => {
    // Setup
    const { app, obj, admins, owner, blacklist } = createTestData();
    const objectControl = false;
    const extraAuthority = 'extra1';
    mockGetAssignedAdmins.mockReturnValue(['assigned1']);

    // Execute
    const result = processor['getObjectAdminsOwnershipAndAdministrative']({
      app,
      obj,
      admins,
      owner,
      blacklist,
      objectControl,
      extraAuthority
    });

    // Verify
    expect(result.ownership).not.toContain('extra1');
  });

  it('should not add extraAuthority when administrative and ownership are empty and extraAuthority is not in them', () => {
    // Setup
    const { app, obj, admins, owner, blacklist } = createTestData({
      obj: { authority: { ownership: [], administrative: [] } as Authority }
    });
    const objectControl = true;
    const extraAuthority = 'extra1';
    mockGetAssignedAdmins.mockReturnValue(['assigned1']);

    // Execute
    const result = processor['getObjectAdminsOwnershipAndAdministrative']({
      app,
      obj,
      admins,
      owner,
      blacklist,
      objectControl,
      extraAuthority
    });

    // Verify
    expect(result.ownership).not.toContain('extra1');
  });

  it('should add extraAuthority when it is in administrative', () => {
    // Setup
    const { app, obj, admins, owner, blacklist } = createTestData({
      obj: { authority: { ownership: [], administrative: ['extra1'] } as Authority }
    });
    const objectControl = true;
    const extraAuthority = 'extra1';
    mockGetAssignedAdmins.mockReturnValue(['assigned1']);

    // Execute
    const result = processor['getObjectAdminsOwnershipAndAdministrative']({
      app,
      obj,
      admins,
      owner,
      blacklist,
      objectControl,
      extraAuthority
    });

    // Verify
    expect(result.ownership).toContain('extra1');
  });

  it('should add extraAuthority when it is in ownership', () => {
    // Setup
    const { app, obj, admins, owner, blacklist } = createTestData({
      obj: { authority: { ownership: ['extra1'], administrative: [] } as Authority }
    });
    const objectControl = true;
    const extraAuthority = 'extra1';
    mockGetAssignedAdmins.mockReturnValue(['assigned1']);

    // Execute
    const result = processor['getObjectAdminsOwnershipAndAdministrative']({
      app,
      obj,
      admins,
      owner,
      blacklist,
      objectControl,
      extraAuthority
    });

    // Verify
    expect(result.ownership).toContain('extra1');
  });

  it('should handle missing authority properties gracefully', () => {
    // Setup
    const { app, obj, admins, owner, blacklist, objectControl, extraAuthority } = createTestData({
      obj: { authority: {} as Authority }
    });
    mockGetAssignedAdmins.mockReturnValue([]);

    // Execute
    const result = processor['getObjectAdminsOwnershipAndAdministrative']({
      app,
      obj,
      admins,
      owner,
      blacklist,
      objectControl,
      extraAuthority
    });

    // Verify
    expect(result.ownership).toEqual([]);
    expect(result.administrative).toEqual([]);
    expect(result.objectAdmins).toEqual(['admin1', 'admin2']);
  });
}); 