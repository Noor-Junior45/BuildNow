import { describe, it, expect } from 'vitest';
import { getPaginationPages } from './paginationHelper';

describe('paginationHelper', () => {
  describe('getPaginationPages', () => {
    it('returns sequential numbers when totalPages is 7 or fewer', () => {
      expect(getPaginationPages(1, 1)).toEqual([1]);
      expect(getPaginationPages(1, 4)).toEqual([1, 2, 3, 4]);
      expect(getPaginationPages(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('renders start page window with tail ellipsis when currentPage <= 4', () => {
      expect(getPaginationPages(1, 10)).toEqual([1, 2, 3, 4, 5, '...', 10]);
      expect(getPaginationPages(3, 10)).toEqual([1, 2, 3, 4, 5, '...', 10]);
      expect(getPaginationPages(4, 10)).toEqual([1, 2, 3, 4, 5, '...', 10]);
    });

    it('renders end page window with head ellipsis when currentPage >= totalPages - 3', () => {
      expect(getPaginationPages(7, 10)).toEqual([1, '...', 6, 7, 8, 9, 10]);
      expect(getPaginationPages(8, 10)).toEqual([1, '...', 6, 7, 8, 9, 10]);
      expect(getPaginationPages(10, 10)).toEqual([1, '...', 6, 7, 8, 9, 10]);
    });

    it('renders double ellipsis around current page when in the middle', () => {
      expect(getPaginationPages(5, 10)).toEqual([1, '...', 4, 5, 6, '...', 10]);
      expect(getPaginationPages(6, 12)).toEqual([1, '...', 5, 6, 7, '...', 12]);
    });
  });
});
