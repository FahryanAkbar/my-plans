import '@testing-library/jest-dom/vitest';
import React from 'react';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';
import type { AnchorHTMLAttributes, ImgHTMLAttributes } from 'react';

afterEach(() => {
  cleanup();
});

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
    React.createElement('img', { alt, ...props })
  ),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    React.createElement('a', { href, ...props }, children)
  ),
}));

vi.mock('@edgestore/react', () => ({
  EdgeStoreProvider: (
    { children }: { children: React.ReactNode }
  ) => React.createElement(React.Fragment, null, children),
  createEdgeStoreProvider: () => ({
    EdgeStoreProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    useEdgeStore: () => ({ edgestore: {} }),
  }),
  useEdgeStore: () => ({ edgestore: {} }),
}))

vi.mock("@blocknote/core/style.css", () => ({}))
vi.mock('@blocknote/mantine/style.css', () => ({}))

beforeAll(() => {
  const style = document.createElement('style')
  style.innerHTML = `
    *, *::before, *::after {
      animation-duration: 0s !important;
      transition-duration: 0s !important;
      animation-delay: 0s !important;
    }
  `
  document.head.appendChild(style)

  if(!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = vi.fn()
  }

  if(!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = vi.fn()
  }

  if(!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = vi.fn(() => false)
  }

  if (typeof window !== "undefined") {
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
  }

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  if (!window.ResizeObserver) {
    class ResizeObserverMock {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    }
    window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
  }

  if (!window.IntersectionObserver) {
    class IntersectionObserverMock {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
      takeRecords = vi.fn(() => [])
      root = null
      rootMargin = ""
      thresholds = []
    }
    window.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver
  }
})
