import { describe, it, expect, vi } from 'vitest';
import ObjectProcessor from '../index';
import { Wobject, Field, App, ActiveVote } from '../interfaces';
import { VOTE_STATUSES, ADMIN_ROLES, FIELDS_NAMES, OBJECT_TYPES } from '../constatns/general';

// Mock ObjectId
class MockObjectId {
  private timestamp: number;

  constructor(date?: Date) {
    this.timestamp = date ? date.getTime() : Date.now();
  }

  getTimestamp() {
    return this.timestamp;
  }
}

describe('ObjectProcessor', () => {
  const mockFindParentsByPermlink = vi.fn();
  const mockGetWaivioAdminsAndOwner = vi.fn();
  const mockGetBlacklist = vi.fn();
  const mockGetObjectsByGroupId = vi.fn();

  const processor = new ObjectProcessor({
    findParentsByPermlink: mockFindParentsByPermlink,
    getWaivioAdminsAndOwner: mockGetWaivioAdminsAndOwner,
    getBlacklist: mockGetBlacklist,
    getObjectsByGroupId: mockGetObjectsByGroupId,
    masterAccount: 'master'
  });

  const mockApp: Partial<App> = {
    owner: 'owner',
    admins: ['admin1', 'admin2']
  };

  const mockWobject: Partial<Wobject> = {
    author_permlink: 'test-permlink',
    object_type: 'product',
    fields: [],
    authority: {
      ownership: ['owner1'],
      administrative: ['admin1']
    },
    default_name: 'Test Object',
    is_posting_open: true,
    is_extending_open: true,
    creator: 'creator',
    author: 'author',
    community: '',
    app: ''
  };

  describe('processWobjects', () => {
    it('should return empty array for non-array input', async () => {
      const result = await processor.processWobjects({
        wobjects: null as any,
        fields: [],
        app: mockApp as App,
        locale: 'en-US'
      });
      expect(result).toEqual([]);
    });

    it('should process wobjects with basic fields', async () => {
      mockGetWaivioAdminsAndOwner.mockResolvedValue(['waivio-admin']);
      mockGetBlacklist.mockResolvedValue([]);

      const result = await processor.processWobjects({
        wobjects: [mockWobject as Wobject],
        fields: [],
        app: mockApp as App,
        locale: 'en-US'
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('author_permlink', 'test-permlink');
    });
  });

  describe('getExposedFields', () => {
    it('should count exposed fields correctly', () => {
      const mockId = new MockObjectId();
      const fields: Partial<Field>[] = [
        {
          name: 'description',
          body: 'test',
          locale: 'en-US',
          _id: mockId,
          weight: 1,
          creator: 'creator',
          author: 'author',
          permlink: 'permlink',
          active_votes: []
        },
        {
          name: 'description',
          body: 'test2',
          locale: 'en-US',
          _id: mockId,
          weight: 1,
          creator: 'creator',
          author: 'author',
          permlink: 'permlink',
          active_votes: []
        },
        {
          name: 'title',
          body: 'test title',
          locale: 'en-US',
          _id: mockId,
          weight: 1,
          creator: 'creator',
          author: 'author',
          permlink: 'permlink',
          active_votes: []
        }
      ];

      const result = processor.getExposedFields('product', fields as Field[]);
      expect(result).toContainEqual(expect.objectContaining({
        name: 'description',
        value: 2
      }));
    });
  });

  describe('calculateApprovePercent', () => {
    it('should return 100 for approved admin vote', () => {
      const mockId = new MockObjectId();
      const field: Partial<Field> = {
        name: 'test',
        body: 'test',
        locale: 'en-US',
        _id: mockId,
        weight: 1,
        creator: 'creator',
        author: 'author',
        permlink: 'permlink',
        active_votes: [],
        adminVote: {
          status: VOTE_STATUSES.APPROVED,
          role: ADMIN_ROLES.ADMIN,
          name: 'admin',
          timestamp: Date.now()
        }
      };

      const result = processor['calculateApprovePercent'](field as Field);
      expect(result).toBe(100);
    });

    it('should return 0 for rejected admin vote', () => {
      const mockId = new MockObjectId();
      const field: Partial<Field> = {
        name: 'test',
        body: 'test',
        locale: 'en-US',
        _id: mockId,
        weight: 1,
        creator: 'creator',
        author: 'author',
        permlink: 'permlink',
        active_votes: [],
        adminVote: {
          status: VOTE_STATUSES.REJECTED,
          role: ADMIN_ROLES.ADMIN,
          name: 'admin',
          timestamp: Date.now()
        }
      };

      const result = processor['calculateApprovePercent'](field as Field);
      expect(result).toBe(0);
    });
  });

  describe('addDataToFields', () => {
    it('should add admin vote data to fields', () => {
      const mockId = new MockObjectId(new Date('2024-01-01'));
      const vote: Partial<ActiveVote> = {
        voter: 'admin1',
        percent: 100,
        weight: 1,
        _id: mockId,
        admin: true,
        timestamp: mockId.getTimestamp()
      };

      const fields: Partial<Field>[] = [{
        name: 'test',
        body: 'test',
        locale: 'en-US',
        _id: mockId,
        weight: 1,
        creator: 'creator',
        author: 'author',
        permlink: 'permlink',
        active_votes: [vote as ActiveVote],
        weightWAIV: 0,
        createdAt: mockId.getTimestamp()
      }];

      const result = processor['addDataToFields']({
        fields: fields as Field[],
        filter: [],
        admins: ['admin1'],
        ownership: [],
        administrative: [],
        owner: 'owner',
        isOwnershipObj: false,
        blacklist: []
      });

      expect(result[0]).toHaveProperty('adminVote');
      expect(result[0].adminVote?.status).toBe(VOTE_STATUSES.APPROVED);
      expect(result[0].adminVote?.role).toBe(ADMIN_ROLES.ADMIN);
    });

    it('should calculate approve percent correctly', () => {
      const mockId = new MockObjectId(new Date('2024-01-01'));
      const votes: Partial<ActiveVote>[] = [
        {
          voter: 'user1',
          percent: 100,
          weight: 2,
          _id: mockId,
          timestamp: mockId.getTimestamp()
        },
        {
          voter: 'user2',
          percent: -100,
          weight: 1,
          _id: mockId,
          timestamp: mockId.getTimestamp()
        }
      ];

      const fields: Partial<Field>[] = [{
        name: 'test',
        body: 'test',
        locale: 'en-US',
        _id: mockId,
        weight: 1,
        creator: 'creator',
        author: 'author',
        permlink: 'permlink',
        active_votes: votes as ActiveVote[],
        weightWAIV: 0,
        createdAt: mockId.getTimestamp()
      }];

      const result = processor['addDataToFields']({
        fields: fields as Field[],
        filter: [],
        admins: [],
        ownership: [],
        administrative: [],
        owner: 'owner',
        isOwnershipObj: false,
        blacklist: []
      });

      expect(result[0].approvePercent).toBe(66.667);
    });

    it('should filter out blacklisted votes and recalculate weight', () => {
      const mockId = new MockObjectId(new Date('2024-01-01'));
      const votes: Partial<ActiveVote>[] = [
        {
          voter: 'user1',
          percent: 100,
          weight: 2,
          weightWAIV: 1,
          _id: mockId,
          timestamp: mockId.getTimestamp()
        },
        {
          voter: 'blacklisted_user',
          percent: 100,
          weight: 3,
          weightWAIV: 2,
          _id: mockId,
          timestamp: mockId.getTimestamp()
        }
      ];

      const fields: Partial<Field>[] = [{
        name: 'test',
        body: 'test',
        locale: 'en-US',
        _id: mockId,
        weight: 5,
        creator: 'creator',
        author: 'author',
        permlink: 'permlink',
        active_votes: votes as ActiveVote[],
        weightWAIV: 3,
        createdAt: mockId.getTimestamp()
      }];

      const result = processor['addDataToFields']({
        fields: fields as Field[],
        filter: [],
        admins: [],
        ownership: [],
        administrative: [],
        owner: 'owner',
        isOwnershipObj: false,
        blacklist: ['blacklisted_user']
      });

      expect(result[0].active_votes).toHaveLength(1);
      expect(result[0].active_votes[0].voter).toBe('user1');
      expect(result[0].weight).toBe(3); // 2 (weight) + 1 (weightWAIV)
    });
  });

  describe('getLinkToPageLoad', () => {
    it('should return correct link for different object types', () => {
      const testCases = [
        {
          input: { ...mockWobject, object_type: OBJECT_TYPES.PAGE } as Wobject,
          expected: '/object/test-permlink/page'
        },
        {
          input: { ...mockWobject, object_type: OBJECT_TYPES.LIST } as Wobject,
          expected: '/object/test-permlink/list'
        },
        {
          input: { ...mockWobject, object_type: OBJECT_TYPES.BUSINESS } as Wobject,
          expected: '/object/test-permlink'
        }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = processor.getLinkToPageLoad(input);
        expect(result).toBe(expected);
      });
    });

    it('should handle mobile flag', () => {
      const result = processor.getLinkToPageLoad(mockWobject as Wobject, true);
      expect(result).toBe('/object/test-permlink/about');
    });
  });

  describe('arrayFieldFilter', () => {
    it('should filter array fields correctly', () => {
      const mockId = new MockObjectId();
      const idFields: Partial<Field>[] = [
        {
          name: FIELDS_NAMES.TAG_CATEGORY,
          body: 'category1',
          locale: 'en-US',
          weight: 1,
          _id: mockId,
          creator: 'creator',
          author: 'author',
          permlink: 'permlink',
          active_votes: []
        }
      ];

      const allFields = {
        [FIELDS_NAMES.TAG_CATEGORY]: idFields
      };

      const result = processor['arrayFieldFilter']({
        idFields: idFields as Field[],
        allFields: allFields as Record<string, Field[]>,
        filter: [],
        id: FIELDS_NAMES.TAG_CATEGORY
      });

      expect(result).toHaveProperty('result');
      expect(Array.isArray(result.result)).toBe(true);
    });

    it('should handle rejected fields', () => {
      const mockId = new MockObjectId();
      const idFields: Partial<Field>[] = [
        {
          name: FIELDS_NAMES.TAG_CATEGORY,
          body: 'category1',
          locale: 'en-US',
          weight: 1,
          _id: mockId,
          creator: 'creator',
          author: 'author',
          permlink: 'permlink',
          active_votes: [],
          adminVote: {
            status: VOTE_STATUSES.REJECTED,
            role: ADMIN_ROLES.ADMIN,
            name: 'admin',
            timestamp: Date.now()
          }
        }
      ];

      const allFields = {
        [FIELDS_NAMES.TAG_CATEGORY]: idFields
      };

      const result = processor['arrayFieldFilter']({
        idFields: idFields as Field[],
        allFields: allFields as Record<string, Field[]>,
        filter: [],
        id: FIELDS_NAMES.TAG_CATEGORY
      });

      expect(result.result).toHaveLength(0);
    });
  });

  describe('getTopTags', () => {
    it('should return empty array when no tags exist', () => {
      const result = processor.getTopTags(mockWobject as Wobject);
      expect(result).toEqual([]);
    });

    it('should return top tags ordered by weight', () => {
      const wobject = {
        ...mockWobject,
        tagCategory: [
          {
            items: [
              { body: 'tag1', weight: 10 },
              { body: 'tag2', weight: 5 },
              { body: 'tag3', weight: 15 }
            ]
          }
        ]
      };

      const result = processor.getTopTags(wobject as Wobject, 2);
      expect(result).toEqual(['tag3', 'tag1']);
    });
  });
});
