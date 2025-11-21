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

  type FixtureActiveVote = Omit<ActiveVote, '_id' | 'timestamp'> & { timestamp?: string };

  const createMockVote = (vote: FixtureActiveVote): ActiveVote => ({
    voter: vote.voter,
    weight: vote.weight,
    percent: vote.percent,
    rshares_weight: vote.rshares_weight,
    weightWAIV: vote.weightWAIV,
    _id: new MockObjectId(
      vote.timestamp ? new Date(vote.timestamp) : new Date('2024-01-01'),
    ),
  });

  type FixtureField = Omit<Field, '_id' | 'active_votes'> & {
    timestamp?: string
    active_votes: FixtureActiveVote[]
  };

  const createMockField = (field: FixtureField): Field => {
    const { timestamp, active_votes, ...rest } = field;

    return {
      ...rest,
      _id: new MockObjectId(
        timestamp ? new Date(timestamp) : new Date('2024-01-01'),
      ),
      active_votes: active_votes.map(createMockVote),
    };
  };

  const affiliateFixture = {
    app: 'waivio/1.0.0',
    community: '',
    object_type: 'affiliate',
    default_name: 'instacart (Impact)',
    is_posting_open: true,
    is_extending_open: true,
    creator: 'wiv01',
    author: 'xcv47',
    author_permlink: 'ouh-instacart-impact',
    weight: 0,
    parent: '',
    children: [],
    map: {
      type: '',
      coordinates: [],
    },
    latest_posts: [],
    last_posts_count: 0,
    activeCampaigns: [],
    activeCampaignsCount: 0,
    departments: [],
    promotedOnSites: [],
    authority: {
      administrative: ['wiv01', 'waivio.affiliate'],
      ownership: ['wiv01', 'waivio.affiliate'],
    },
    preview_gallery: [],
    fields: [
      {
        name: FIELDS_NAMES.AFFILIATE_BUTTON,
        body: 'https://waivio.nyc3.digitaloceanspaces.com/2610f03bee21da34c2318556c0ad3844db985e734ef036a32ff0332703671f96',
        weight: 920.3014,
        locale: 'en-US',
        creator: 'wiv01',
        author: 'waivio.updates02',
        permlink: 'wiv01-gpp44otpbfa',
        active_votes: [
          {
            voter: 'wiv01',
            weight: 0.3014,
            percent: 44,
            rshares_weight: 137,
            weightWAIV: 0.1166,
          },
          {
            voter: 'waivio.affiliate',
            weight: 920,
            percent: 10000,
            rshares_weight: 604,
            weightWAIV: 618.5,
          },
        ],
        weightWAIV: 618.6166,
      },
      {
        name: FIELDS_NAMES.AFFILIATE_PRODUCT_ID_TYPES,
        body: 'instacart',
        weight: 920.3058,
        locale: 'en-US',
        creator: 'wiv01',
        author: 'waivio.updates03',
        permlink: 'wiv01-8zd6qw7ki6',
        active_votes: [
          {
            voter: 'wiv01',
            weight: 0.3058,
            percent: 44,
            rshares_weight: 137,
            weightWAIV: 0.1166,
          },
          {
            voter: 'waivio.affiliate',
            weight: 920,
            percent: 10000,
            rshares_weight: 604,
            weightWAIV: 618.5,
          },
        ],
        weightWAIV: 618.6166,
      },
      {
        name: FIELDS_NAMES.AFFILIATE_PRODUCT_ID_TYPES,
        body: 'instacart.com',
        weight: 920.3058,
        locale: 'en-US',
        creator: 'wiv01',
        author: 'waivio.updates04',
        permlink: 'wiv01-real0hhrrpn',
        active_votes: [
          {
            voter: 'wiv01',
            weight: 0.3058,
            percent: 44,
            rshares_weight: 137,
            weightWAIV: 0.1166,
          },
          {
            voter: 'waivio.affiliate',
            weight: 920,
            percent: 10000,
            rshares_weight: 604,
            weightWAIV: 618.5,
          },
        ],
        weightWAIV: 618.6166,
      },
      {
        name: FIELDS_NAMES.AFFILIATE_GEO_AREA,
        body: 'GLOBAL',
        weight: 920.3102,
        locale: 'en-US',
        creator: 'wiv01',
        author: 'waivio.updates05',
        permlink: 'wiv01-g7n772kco87',
        active_votes: [
          {
            voter: 'wiv01',
            weight: 0.3102,
            percent: 44,
            rshares_weight: 137,
            weightWAIV: 0.1166,
          },
          {
            voter: 'waivio.affiliate',
            weight: 920,
            percent: 10000,
            rshares_weight: 604,
            weightWAIV: 618.5,
          },
        ],
        weightWAIV: 618.6166,
      },
      {
        name: FIELDS_NAMES.AFFILIATE_URL_TEMPLATE,
        body: 'https://www.instacart-impact.com/products/$productId?aff_id=$affiliateCode',
        weight: -4.96815,
        locale: 'en-US',
        creator: 'wiv01',
        author: 'waivio.updates06',
        permlink: 'wiv01-8ssytzrhhlf',
        active_votes: [
          {
            voter: 'waivio',
            weight: -1.25045,
            percent: -89,
            rshares_weight: 275,
            weightWAIV: -3.738,
          },
          {
            voter: 'wiv01',
            weight: -3.7177,
            percent: -1,
            rshares_weight: 0,
            weightWAIV: -3.7178,
          },
        ],
        weightWAIV: -7.4558,
      },
      {
        name: FIELDS_NAMES.AFFILIATE_URL_TEMPLATE,
        body: 'https://instacart.impact.com/redirect.aspx?&mid=$affiliateCode&u=$productId',
        weight: -1.6357,
        locale: 'en-US',
        creator: 'waivio',
        author: 'waivio.updates05',
        permlink: 'waivio-5flgf3adkt2',
        active_votes: [
          {
            voter: 'waivio',
            weight: -0.6357,
            percent: -1,
            rshares_weight: 0,
          },
        ],
        weightWAIV: 1.00055,
      },
      {
        name: FIELDS_NAMES.AFFILIATE_URL_TEMPLATE,
        body: 'https://instacart.impact.com/redirect.aspx?&mid=$affiliateCode&u=https%3A%2F%2Fwww.instacart.com%2Fproducts%2F$productId',
        weight: 59821.5,
        locale: 'en-US',
        creator: 'waivio',
        author: 'waivio.updates08',
        permlink: 'waivio-7ahozxqyhpu',
        active_votes: [
          {
            voter: 'waivio',
            weight: 1137.5,
            percent: 2500,
            rshares_weight: 9090,
            weightWAIV: 2943.5,
          },
          {
            voter: 'wiv01',
            weight: 57764,
            percent: 10000,
            rshares_weight: 41174,
            weightWAIV: 46504,
          },
          {
            voter: 'waivio.affiliate',
            weight: 920,
            percent: 10000,
            rshares_weight: 604,
            weightWAIV: 618.5,
          },
        ],
        weightWAIV: 50066,
      },
      {
        name: FIELDS_NAMES.AUTHORITY,
        body: 'ownership',
        weight: 183.0439,
        locale: 'en-US',
        creator: 'wiv01',
        author: 'wiv01',
        permlink: 'wiv01-ng6tcavanja',
        active_votes: [
          {
            voter: 'wiv01',
            weight: 183.0439,
            percent: 338,
            rshares_weight: 1343,
            weightWAIV: 170.1154,
          },
        ],
        weightWAIV: 170.1154,
      },
      {
        name: FIELDS_NAMES.AUTHORITY,
        body: 'administrative',
        weight: 26285.5,
        locale: 'en-US',
        creator: 'wiv01',
        author: 'w7ngc',
        permlink: 'wiv01-oaegcukdwxa',
        active_votes: [
          {
            voter: 'wiv01',
            weight: 26285.5,
            percent: 10000,
            rshares_weight: 41161,
            weightWAIV: 14250,
          },
        ],
        weightWAIV: 14250,
      },
      {
        name: FIELDS_NAMES.AFFILIATE_CODE,
        body: '["www.waivio.com","test2222"]',
        weight: 182.945,
        locale: 'en-US',
        creator: 'wiv01',
        author: 'waivio.updates03',
        permlink: 'wiv01-el62gdeim8t',
        timestamp: '2024-01-01T00:00:00Z',
        active_votes: [
          {
            voter: 'wiv01',
            weight: 182.945,
            percent: 50,
            rshares_weight: 156,
            weightWAIV: 182.79,
            timestamp: '2024-01-01T00:00:00Z',
          },
        ],
        weightWAIV: 182.79,
      },
      {
        name: FIELDS_NAMES.AUTHORITY,
        body: 'ownership',
        weight: 1,
        locale: 'en-US',
        creator: 'waivio.affiliate',
        author: 'waivio.updates04',
        permlink: 'waivioaffiliate-845npx1gd6s',
        active_votes: [
          {
            voter: 'waivio.affiliate',
            weight: 1,
            percent: 10000,
            rshares_weight: 0,
            weightWAIV: 1.5,
          },
        ],
        weightWAIV: 1.5,
      },
      {
        name: FIELDS_NAMES.AUTHORITY,
        body: 'administrative',
        weight: 309.5,
        locale: 'en-US',
        creator: 'waivio.affiliate',
        author: 'waivio.updates05',
        permlink: 'waivioaffiliate-k5b85bj8xo',
        active_votes: [
          {
            voter: 'waivio.affiliate',
            weight: 309.5,
            percent: 10000,
            rshares_weight: 617,
            weightWAIV: 1.5,
          },
        ],
        weightWAIV: 1.5,
      },
      {
        name: FIELDS_NAMES.AFFILIATE_CODE,
        body: '["www.waivio.com","test111111"]',
        weight: 617.5,
        locale: 'en-US',
        creator: 'waivio.affiliate',
        author: 'waivio.updates09',
        permlink: 'waivioaffiliate-dc3vzcikf0o',
        timestamp: '2024-01-02T00:00:00Z',
        active_votes: [
          {
            voter: 'waivio.affiliate',
            weight: 617.5,
            percent: 10000,
            rshares_weight: 617,
            weightWAIV: 309.5,
            timestamp: '2024-01-02T00:00:00Z',
          },
        ],
        weightWAIV: 309.5,
      },
    ] as FixtureField[],
  };

  const affiliateWobject = {
    ...affiliateFixture,
    map: affiliateFixture.map as unknown as Wobject['map'],
    fields: affiliateFixture.fields.map(createMockField),
  } as unknown as Wobject;

  const affiliateApp: App = {
    owner: 'waivio',
    admins: [
      'grampo',
      'pacificgifts',
      'daviedining',
      'citygifts',
      'vandining',
      'daine-cherry',
      'versentry',
      'sebclem',
      'antoniokevin',
      'ahmed365',
      'thapelo05',
      'dataoperator',
    ],
    authority: ['waivio', 'waivio.affiliate', ]
  };

  describe('processWobjects', () => {
    it('should return empty array for non-array input', async () => {
      const result = await processor.processWobjects({
        wobjects: null as unknown as Wobject[],
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
      }) as Wobject[];

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('author_permlink', 'test-permlink');
    });

    it('should include affiliate fields for affiliate object', async () => {
      vi.clearAllMocks();
      mockFindParentsByPermlink.mockResolvedValue([]);
      mockGetWaivioAdminsAndOwner.mockResolvedValue([]);
      mockGetBlacklist.mockResolvedValue([]);
      mockGetObjectsByGroupId.mockResolvedValue([]);

      const requestedFields = [
        FIELDS_NAMES.AFFILIATE_BUTTON,
        FIELDS_NAMES.AFFILIATE_PRODUCT_ID_TYPES,
        FIELDS_NAMES.AFFILIATE_GEO_AREA,
        FIELDS_NAMES.AFFILIATE_URL_TEMPLATE,
        FIELDS_NAMES.AFFILIATE_CODE,
        FIELDS_NAMES.AUTHORITY,
      ];

      const result = await processor.processWobjects({
        wobjects: [affiliateWobject],
        fields: requestedFields,
        app: affiliateApp,
        locale: 'en-US',
        reqUserName: 'wiv01',
      }) as Wobject[];


      expect(result).toHaveLength(1);
      const affiliate = result[0] as Wobject & Record<string, unknown>;

      const affiliateButton = affiliate[FIELDS_NAMES.AFFILIATE_BUTTON] as string;
      expect(affiliateButton).toBe(
        'https://waivio.nyc3.digitaloceanspaces.com/2610f03bee21da34c2318556c0ad3844db985e734ef036a32ff0332703671f96',
      );

      const productIdTypes = affiliate[FIELDS_NAMES.AFFILIATE_PRODUCT_ID_TYPES] as string[];
      expect(productIdTypes).toHaveLength(2);
      expect(productIdTypes).toEqual(expect.arrayContaining(['instacart', 'instacart.com']));
      const geoAreas = affiliate[FIELDS_NAMES.AFFILIATE_GEO_AREA] as string[];
      expect(geoAreas).toEqual(['GLOBAL']);

      const urlTemplate = affiliate[FIELDS_NAMES.AFFILIATE_URL_TEMPLATE] as string;
      expect(urlTemplate).toBe(
        'https://instacart.impact.com/redirect.aspx?&mid=$affiliateCode&u=https%3A%2F%2Fwww.instacart.com%2Fproducts%2F$productId',
      );
      const affiliateCode = affiliate[FIELDS_NAMES.AFFILIATE_CODE] as string;
      expect(affiliateCode).toBe('["www.waivio.com","test111111"]');

      const authorityField = affiliate[FIELDS_NAMES.AUTHORITY] as Field | undefined;
      expect(authorityField).toBeDefined();
      expect(authorityField?.body).toBe('administrative');
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

    it('should filter out sale fields before startDate', () => {
      const mockId = new MockObjectId();
      const now = Date.now();
      const fields: Partial<Field>[] = [{
        name: FIELDS_NAMES.SALE,
        body: 'test sale',
        locale: 'en-US',
        _id: mockId,
        weight: 1,
        creator: 'creator',
        author: 'author',
        permlink: 'permlink',
        active_votes: [],
        startDate: now + 1000, // 1 second in future
        endDate: now + 2000
      }];

      const result = processor['getFilteredFields'](
        fields as Field[],
        'en-US',
        [],
        []
      );

      expect(result).toHaveLength(0);
    });

    it('should filter out promotion fields after endDate', () => {
      const mockId = new MockObjectId();
      const now = Date.now();
      const fields: Partial<Field>[] = [{
        name: FIELDS_NAMES.PROMOTION,
        body: 'test promotion',
        locale: 'en-US',
        _id: mockId,
        weight: 1,
        creator: 'creator',
        author: 'author',
        permlink: 'permlink',
        active_votes: [],
        startDate: now - 2000,
        endDate: now - 1000 // 1 second in past
      }];

      const result = processor['getFilteredFields'](
        fields as Field[],
        'en-US',
        [],
        []
      );

      expect(result).toHaveLength(0);
    });

    it('should include sale fields within date range', () => {
      const mockId = new MockObjectId();
      const now = Date.now();
      const fields: Partial<Field>[] = [{
        name: FIELDS_NAMES.SALE,
        body: 'test sale',
        locale: 'en-US',
        _id: mockId,
        weight: 1,
        creator: 'creator',
        author: 'author',
        permlink: 'permlink',
        active_votes: [],
        startDate: now - 1000, // 1 second in past
        endDate: now + 1000 // 1 second in future
      }];

      const result = processor['getFilteredFields'](
        fields as Field[],
        'en-US',
        [], // Add SALE to filter
        []
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe(FIELDS_NAMES.SALE);
    });

    it('should include sale fields without range', () => {
      const mockId = new MockObjectId();
      const fields: Partial<Field>[] = [{
        name: FIELDS_NAMES.SALE,
        body: 'test sale',
        locale: 'en-US',
        _id: mockId,
        weight: 1,
        creator: 'creator',
        author: 'author',
        permlink: 'permlink',
        active_votes: [],
      }];

      const result = processor['getFilteredFields'](
          fields as Field[],
          'en-US',
          [], // Add SALE to filter
          []
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe(FIELDS_NAMES.SALE);
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
