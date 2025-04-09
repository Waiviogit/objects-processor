import { describe, it, expect } from 'vitest';
import { makeAffiliateLinks } from '../makeAffiliateLinks';
import { AffiliateCodes, Field } from '../interfaces';

describe('makeAffiliateLinks', () => {
  const mockField: Field = {
    _id: { getTimestamp: () => Date.now() },
    name: 'productId',
    body: JSON.stringify({ productId: '123', productIdType: 'amazon' }),
    weight: 1,
    locale: 'en',
    creator: 'test',
    author: 'test',
    permlink: 'test',
    active_votes: []
  };

  const mockAffiliateCode: AffiliateCodes = {
    affiliateUrlTemplate: 'https://amazon.com/$productId?tag=$affiliateCode',
    affiliateCode: ['amazon', 'test123'],
    affiliateButton: 'button.png',
    affiliateProductIdTypes: ['amazon'],
    affiliateGeoArea: ['US']
  };

  it('should return empty array when no productIds and affiliateCodes provided', () => {
    const result = makeAffiliateLinks({
      countryCode: 'US',
      productIds: [],
      affiliateCodes: []
    });
    expect(result).toEqual([]);
  });

  it('should create affiliate link for exact match', () => {
    const result = makeAffiliateLinks({
      countryCode: 'US',
      productIds: [mockField],
      affiliateCodes: [mockAffiliateCode]
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      link: 'https://amazon.com/123?tag=test123',
      image: 'button.png',
      affiliateCode: 'test123',
      type: 'amazon'
    });
  });

  it('should handle multiple product IDs with same affiliate type', () => {
    const mockField2: Field = {
      ...mockField,
      body: JSON.stringify({ productId: '456', productIdType: 'amazon' })
    };

    const result = makeAffiliateLinks({
      countryCode: 'US',
      productIds: [mockField, mockField2],
      affiliateCodes: [mockAffiliateCode]
    });

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('amazon');
  });

  it('should handle weighted affiliate codes', () => {
    const weightedAffiliateCode: AffiliateCodes = {
      ...mockAffiliateCode,
      affiliateCode: ['amazon', 'test123::60', 'test456::40']
    };

    const result = makeAffiliateLinks({
      countryCode: 'US',
      productIds: [mockField],
      affiliateCodes: [weightedAffiliateCode]
    });

    expect(result).toHaveLength(1);
    expect(['test123', 'test456']).toContain(result[0].affiliateCode);
  });

  it('should handle geo-specific affiliate codes', () => {
    const globalAffiliateCode: AffiliateCodes = {
      ...mockAffiliateCode,
      affiliateGeoArea: ['GLOBAL']
    };

    const result = makeAffiliateLinks({
      countryCode: 'FR', // Non-US country
      productIds: [mockField],
      affiliateCodes: [globalAffiliateCode]
    });

    expect(result).toHaveLength(1);
    expect(result[0].link).toContain('test123');
  });

  it('should handle null product ID types', () => {
    const nullField: Field = {
      ...mockField,
      body: JSON.stringify({ productId: '123', productIdType: 'null' })
    };

    const result = makeAffiliateLinks({
      countryCode: 'US',
      productIds: [nullField],
      affiliateCodes: [mockAffiliateCode]
    });

    expect(result).toHaveLength(0);
  });

  it('should handle multiple affiliate codes with different product types', () => {
    const ebayAffiliateCode: AffiliateCodes = {
      affiliateUrlTemplate: 'https://ebay.com/$productId?aff=$affiliateCode',
      affiliateCode: ['ebay', 'ebay123'],
      affiliateButton: 'ebay-button.png',
      affiliateProductIdTypes: ['ebay'],
      affiliateGeoArea: ['US']
    };

    const ebayField: Field = {
      ...mockField,
      body: JSON.stringify({ productId: '789', productIdType: 'ebay' })
    };

    const result = makeAffiliateLinks({
      countryCode: 'US',
      productIds: [mockField, ebayField],
      affiliateCodes: [mockAffiliateCode, ebayAffiliateCode]
    });

    expect(result).toHaveLength(2);
    expect(result.map(r => r.type)).toEqual(expect.arrayContaining(['amazon', 'ebay']));
  });
}); 