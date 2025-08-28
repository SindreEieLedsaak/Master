import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true });
Object.defineProperty(Element.prototype, 'scrollIntoView', { value: vi.fn(), writable: true }); 