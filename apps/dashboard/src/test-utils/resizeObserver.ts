import { vi } from 'vitest';

export class ResizeObserverMock {
  static instances: ResizeObserverMock[] = [];

  private readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    ResizeObserverMock.instances.push(this);
  }

  observe() {}

  unobserve() {}

  disconnect() {}

  emit(width: number) {
    this.callback(
      [
        {
          contentRect: {
            width,
            height: 0,
            x: 0,
            y: 0,
            top: 0,
            right: width,
            bottom: 0,
            left: 0,
            toJSON: () => ({}),
          },
        } as ResizeObserverEntry,
      ],
      this,
    );
  }
}

export function installResizeObserverMock() {
  ResizeObserverMock.instances = [];
  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    if (this instanceof HTMLButtonElement) {
      return 28;
    }

    return String(this.textContent ?? '').length * 8;
  });
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    return String(this.textContent ?? '').length * 8;
  });
}

export function emitResize(width: number) {
  const instance = ResizeObserverMock.instances.at(-1);
  if (!instance) {
    throw new Error('ResizeObserver instance not created');
  }

  instance.emit(width);
}

export function emitResizeForAll(width: number) {
  for (const instance of ResizeObserverMock.instances) {
    instance.emit(width);
  }
}
