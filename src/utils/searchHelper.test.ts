import { describe, it, expect } from 'vitest';
import {
  isProductMatch,
  calculateRelevanceScore,
  detectQueryCategory,
  searchAllProducts
} from './searchHelper';
import { Product } from '../types';

const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Polycab 1.5 sq mm Green Wire 90m',
    brand: 'Polycab',
    category: 'electrical',
    subCategory: 'Wiring & Cables',
    price: 1850,
    originalPrice: 2200,
    discountPercentage: 16,
    unit: 'roll',
    rating: 4.8,
    reviewsCount: 120,
    deliveryMinutes: 10,
    image: 'https://example.com/polycab.jpg',
    inStock: true,
    stockCount: 50,
    isEmergency: false,
    specs: {},
    tags: ['wire', 'fr', 'copper', 'green'],
    description: 'Flame retardant copper electrical wire for home electrical wiring'
  },
  {
    id: 'p2',
    name: 'Havells Fabio 6A 1-Way Modular Switch White',
    brand: 'Havells',
    category: 'electrical',
    subCategory: 'Switches & Sockets',
    price: 45,
    originalPrice: 60,
    discountPercentage: 25,
    unit: 'piece',
    rating: 4.6,
    reviewsCount: 85,
    deliveryMinutes: 10,
    image: 'https://example.com/switch.jpg',
    inStock: true,
    stockCount: 100,
    isEmergency: false,
    specs: {},
    tags: ['switch', 'modular', 'white', 'fabio'],
    description: 'Durable 6A modular switch suitable for domestic electrical installations'
  },
  {
    id: 'c1',
    name: 'UltraTech Weather Plus Cement 50kg',
    brand: 'UltraTech',
    category: 'construction',
    subCategory: 'Cement & Concrete',
    price: 420,
    originalPrice: 450,
    discountPercentage: 7,
    unit: 'bag',
    rating: 4.9,
    reviewsCount: 310,
    deliveryMinutes: 30,
    image: 'https://example.com/cement.jpg',
    inStock: true,
    stockCount: 200,
    isEmergency: false,
    specs: {},
    tags: ['cement', 'concrete', 'weather plus', 'ppc'],
    description: 'High performance water repellent Portland Pozzolana Cement'
  },
  {
    id: 'c2',
    name: 'Asian Paints Apex Ultima Exterior Emulsion White 20L',
    brand: 'Asian Paints',
    category: 'construction',
    subCategory: 'Paints & Putty',
    price: 6800,
    originalPrice: 7500,
    discountPercentage: 9,
    unit: 'bucket',
    rating: 4.7,
    reviewsCount: 95,
    deliveryMinutes: 25,
    image: 'https://example.com/paint.jpg',
    inStock: true,
    stockCount: 30,
    isEmergency: false,
    specs: {},
    tags: ['paint', 'exterior', 'emulsion', 'white', 'apex'],
    description: 'Advanced weather protection exterior wall emulsion paint'
  }
];

describe('searchHelper', () => {
  describe('isProductMatch', () => {
    it('returns true when query is empty or only whitespace', () => {
      expect(isProductMatch(mockProducts[0], '')).toBe(true);
      expect(isProductMatch(mockProducts[0], '   ')).toBe(true);
    });

    it('matches by product name (case-insensitive)', () => {
      expect(isProductMatch(mockProducts[0], 'polycab wire')).toBe(true);
      expect(isProductMatch(mockProducts[0], 'POLYCAB')).toBe(true);
    });

    it('matches multi-token queries across different properties', () => {
      // "Havells modular switch" -> brand: Havells, subcategory/description: modular, name: switch
      expect(isProductMatch(mockProducts[1], 'Havells modular switch')).toBe(true);
      // "UltraTech 50kg bag" -> brand: UltraTech, name: 50kg
      expect(isProductMatch(mockProducts[2], 'UltraTech 50kg')).toBe(true);
    });

    it('matches on tags and description', () => {
      expect(isProductMatch(mockProducts[0], 'flame retardant')).toBe(true);
      expect(isProductMatch(mockProducts[2], 'water repellent')).toBe(true);
    });

    it('returns false if any single token does not match', () => {
      expect(isProductMatch(mockProducts[0], 'polycab cement')).toBe(false);
      expect(isProductMatch(mockProducts[1], 'havells solar')).toBe(false);
    });
  });

  describe('calculateRelevanceScore', () => {
    it('returns 1 for empty or whitespace query', () => {
      expect(calculateRelevanceScore(mockProducts[0], '')).toBe(1);
      expect(calculateRelevanceScore(mockProducts[0], '  ')).toBe(1);
    });

    it('awards high score for exact name match', () => {
      const exactScore = calculateRelevanceScore(
        mockProducts[0],
        'polycab 1.5 sq mm green wire 90m'
      );
      const partialScore = calculateRelevanceScore(mockProducts[0], 'wire');
      expect(exactScore).toBeGreaterThan(partialScore);
    });

    it('awards extra score when brand matches', () => {
      const brandScore = calculateRelevanceScore(mockProducts[0], 'polycab');
      expect(brandScore).toBeGreaterThan(50);
    });

    it('awards subcategory and tag bonuses', () => {
      const tagScore = calculateRelevanceScore(mockProducts[0], 'copper');
      expect(tagScore).toBeGreaterThan(0);
    });
  });

  describe('detectQueryCategory', () => {
    it('falls back to current category if query is empty', () => {
      expect(detectQueryCategory('', [], 'construction')).toBe('construction');
      expect(detectQueryCategory('', [], 'electrical')).toBe('electrical');
      expect(detectQueryCategory('')).toBe('electrical');
    });

    it('detects electrical category based on keywords', () => {
      expect(detectQueryCategory('havells wire 1.5mm')).toBe('electrical');
      expect(detectQueryCategory('led bulb 9w')).toBe('electrical');
      expect(detectQueryCategory('modular switch socket')).toBe('electrical');
      expect(detectQueryCategory('ceiling fan')).toBe('electrical');
    });

    it('detects construction category based on keywords', () => {
      expect(detectQueryCategory('ultratech cement')).toBe('construction');
      expect(detectQueryCategory('asian paints exterior')).toBe('construction');
      expect(detectQueryCategory('tmt steel rebar')).toBe('construction');
      expect(detectQueryCategory('dr fixit waterproofing')).toBe('construction');
    });

    it('uses product catalog matches to classify query', () => {
      expect(detectQueryCategory('fabio', mockProducts)).toBe('electrical');
      expect(detectQueryCategory('weather plus', mockProducts)).toBe('construction');
    });
  });

  describe('searchAllProducts', () => {
    it('returns empty results when query is empty', () => {
      const res = searchAllProducts('', mockProducts);
      expect(res.results).toEqual([]);
      expect(res.electricalCount).toBe(0);
      expect(res.constructionCount).toBe(0);
    });

    it('correctly filters and counts matches by category', () => {
      const res = searchAllProducts('white', mockProducts);
      // Havells Fabio (White switch) & Asian Paints (White emulsion)
      expect(res.results.length).toBe(2);
      expect(res.electricalCount).toBe(1);
      expect(res.constructionCount).toBe(1);
    });

    it('ranks results by highest relevance score first', () => {
      const res = searchAllProducts('polycab', mockProducts);
      expect(res.results.length).toBe(1);
      expect(res.results[0].id).toBe('p1');
    });

    it('respects the limit argument', () => {
      const res = searchAllProducts('white', mockProducts, 1);
      expect(res.results.length).toBe(1);
    });
  });
});
