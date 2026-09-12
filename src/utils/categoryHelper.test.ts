import { describe, it, expect } from 'vitest';
import { isElectricalProduct, isConstructionProduct, getProductCategory } from './categoryHelper';

describe('categoryHelper', () => {
  describe('isConstructionProduct', () => {
    it('returns false for null, undefined, or empty item', () => {
      expect(isConstructionProduct(null)).toBe(false);
      expect(isConstructionProduct(undefined)).toBe(false);
      expect(isConstructionProduct({})).toBe(false);
    });

    it('identifies construction items by ID prefix', () => {
      expect(isConstructionProduct({ id: 'c1' })).toBe(true);
      expect(isConstructionProduct({ id: 'c-cement-ultra' })).toBe(true);
      expect(isConstructionProduct({ id: 'c-steel-tata' })).toBe(true);
    });

    it('does not confuse cctv IDs with construction prefix', () => {
      expect(isConstructionProduct({ id: 'cctv-cam-01', name: 'Security Camera' })).toBe(false);
    });

    it('identifies construction by category', () => {
      expect(isConstructionProduct({ category: 'construction' })).toBe(true);
      expect(isConstructionProduct({ category: 'cement' })).toBe(true);
      expect(isConstructionProduct({ category: 'steel' })).toBe(true);
      expect(isConstructionProduct({ category: 'plumbing' })).toBe(true);
      expect(isConstructionProduct({ category: 'paints' })).toBe(true);
      expect(isConstructionProduct({ category: 'hardware' })).toBe(true);
    });

    it('identifies construction by brand', () => {
      expect(isConstructionProduct({ brand: 'UltraTech' })).toBe(true);
      expect(isConstructionProduct({ brand: 'Asian Paints' })).toBe(true);
      expect(isConstructionProduct({ brand: 'Astral' })).toBe(true);
      expect(isConstructionProduct({ brand: 'Fevicol' })).toBe(true);
      expect(isConstructionProduct({ brand: 'Jaquar' })).toBe(true);
    });

    it('identifies construction by subcategory', () => {
      expect(isConstructionProduct({ subcategory: 'tmt & steel' })).toBe(true);
      expect(isConstructionProduct({ subCategory: 'tiling & adhesives' })).toBe(true);
      expect(isConstructionProduct({ sub_category: 'plywood & boards' })).toBe(true);
    });

    it('identifies construction by specific item names', () => {
      expect(isConstructionProduct({ name: 'UltraTech Weather Plus Cement 50kg' })).toBe(true);
      expect(isConstructionProduct({ name: 'Tata Tiscon 550D TMT Rebar 12mm' })).toBe(true);
      expect(isConstructionProduct({ name: 'Dr. Fixit Waterproofing Compound' })).toBe(true);
      expect(isConstructionProduct({ name: 'Supreme CPVC Pro Pipe 1 inch' })).toBe(true);
    });

    it('rejects purely electrical products even if generic fields exist', () => {
      expect(isConstructionProduct({ category: 'electrical', name: 'Havells Wire' })).toBe(false);
      expect(isConstructionProduct({ category: 'lighting', name: 'LED Bulb' })).toBe(false);
      expect(isConstructionProduct({ brand: 'Polycab', name: 'Copper Wire' })).toBe(false);
    });
  });

  describe('isElectricalProduct', () => {
    it('returns false for null, undefined, or empty item', () => {
      expect(isElectricalProduct(null)).toBe(false);
      expect(isElectricalProduct(undefined)).toBe(false);
      expect(isElectricalProduct({})).toBe(false);
    });

    it('identifies electrical items by ID prefix', () => {
      expect(isElectricalProduct({ id: 'p1' })).toBe(true);
      expect(isElectricalProduct({ id: 'p-fan-atomberg' })).toBe(true);
      expect(isElectricalProduct({ id: 'elec-wire-01' })).toBe(true);
    });

    it('identifies electrical items by category', () => {
      expect(isElectricalProduct({ category: 'electrical' })).toBe(true);
      expect(isElectricalProduct({ category: 'electronics' })).toBe(true);
      expect(isElectricalProduct({ category: 'lighting' })).toBe(true);
      expect(isElectricalProduct({ category: 'wiring' })).toBe(true);
    });

    it('identifies electrical items by brand', () => {
      expect(isElectricalProduct({ brand: 'Polycab' })).toBe(true);
      expect(isElectricalProduct({ brand: 'Havells' })).toBe(true);
      expect(isElectricalProduct({ brand: 'Schneider' })).toBe(true);
      expect(isElectricalProduct({ brand: 'Philips' })).toBe(true);
      expect(isElectricalProduct({ brand: 'Atomberg' })).toBe(true);
    });

    it('identifies electrical items by subcategory', () => {
      expect(isElectricalProduct({ subcategory: 'wiring & cables' })).toBe(true);
      expect(isElectricalProduct({ subCategory: 'switches & sockets' })).toBe(true);
      expect(isElectricalProduct({ sub_category: 'fans' })).toBe(true);
    });

    it('identifies electrical items by product name keywords', () => {
      expect(isElectricalProduct({ name: 'Polycab 1.5 sq mm FR Wire' })).toBe(true);
      expect(isElectricalProduct({ name: 'Anchor Roma 6A Switch' })).toBe(true);
      expect(isElectricalProduct({ name: 'Philips 9W LED Bulb' })).toBe(true);
      expect(isElectricalProduct({ name: 'L&T Single Pole 16A MCB' })).toBe(true);
      expect(isElectricalProduct({ name: 'Dalda PVC Conduit Pipe' })).toBe(true);
    });

    it('rejects construction products even if names contain electrical-like substrings', () => {
      // E.g. Bosch drill (power tool = construction) vs electrical
      expect(isElectricalProduct({ brand: 'UltraTech', name: 'Cement 50kg' })).toBe(false);
      expect(isElectricalProduct({ category: 'construction', id: 'c-1' })).toBe(false);
    });
  });

  describe('getProductCategory & Edge Cases', () => {
    it('returns construction for construction items and electrical for electrical items', () => {
      expect(getProductCategory({ brand: 'UltraTech', name: 'Cement' })).toBe('construction');
      expect(getProductCategory({ brand: 'Havells', name: 'Wire 2.5mm' })).toBe('electrical');
    });

    it('handles null, undefined, empty object without throwing', () => {
      expect(getProductCategory(null)).toBe('electrical');
      expect(getProductCategory(undefined)).toBe('electrical');
      expect(getProductCategory({})).toBe('electrical');
    });

    it('handles items with unexpected types for fields (numbers, booleans, arrays)', () => {
      expect(getProductCategory({ id: 12345, name: 999, category: null })).toBe('electrical');
      expect(getProductCategory({ category: true, brand: false })).toBe('electrical');
      expect(getProductCategory({ id: 'c-1', specs: [1, 2, 3] })).toBe('construction');
    });

    it('handles mixed casing gracefully', () => {
      expect(getProductCategory({ brand: 'ULTRATECH', category: 'CEMENT' })).toBe('construction');
      expect(getProductCategory({ brand: 'hAvElLs', name: 'wIrE' })).toBe('electrical');
      expect(getProductCategory({ category: 'LIGHTING', name: 'pAnEl LiGhT' })).toBe('electrical');
    });

    it('handles leading and trailing whitespaces in fields', () => {
      expect(getProductCategory({ brand: '   Asian Paints   ', name: ' Primer ' })).toBe('construction');
      expect(getProductCategory({ name: '   Polycab Wire   ' })).toBe('electrical');
    });

    it('accurately isolates Dalda electrical conduit pipes from CPVC plumbing pipes', () => {
      const electricalPipe = { name: 'Dalda 25mm PVC Conduit Pipe 10ft', brand: 'Dalda' };
      const plumbingPipe = { name: 'Astral CPVC Pro Water Pipe 1 inch', brand: 'Astral' };

      expect(getProductCategory(electricalPipe)).toBe('electrical');
      expect(getProductCategory(plumbingPipe)).toBe('construction');
    });
  });
});
