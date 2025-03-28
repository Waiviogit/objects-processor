import { describe, it, expect } from 'vitest';
import { ObjectProcessor } from './index';

describe('ObjectProcessor', () => {
  it('should create an instance', () => {
    const processor = new ObjectProcessor();
    expect(processor).toBeInstanceOf(ObjectProcessor);
  });
}); 