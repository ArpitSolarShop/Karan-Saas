import { cn } from '@/lib/utils';

describe('Frontend Utils', () => {
  describe('cn() - class name merger', () => {
    it('should merge class names', () => {
      const result = cn('foo', 'bar');
      expect(result).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', false && 'hidden', 'visible');
      expect(result).toBe('base visible');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });
  });
});
