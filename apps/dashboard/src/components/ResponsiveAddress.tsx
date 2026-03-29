import {
  createElement,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { abbreviateAddress as eveAbbreviateAddress } from '@evefrontier/dapp-kit/utils';

const DEFAULT_MAX_ABBREVIATION = 64;
const MIN_PRECISION = 4;
const COPY_FEEDBACK_DURATION_MS = 1600;
const copyIconUrl = new URL('../assets/copy.svg', import.meta.url).href;
const tickIconUrl = new URL('../assets/tick.svg', import.meta.url).href;

export interface ResponsiveAddressProps {
  address?: string | null;
  maxAbbreviation?: number;
  as?: 'span' | 'div' | 'p';
  children?: ReactNode;
  className?: string;
  textClassName?: string;
  copyLabel?: string;
  copyable?: boolean;
}

export function isSuiAddress(address: string | null | undefined): address is string {
  return typeof address === 'string' && /^0x[a-f0-9]{64}$/i.test(address);
}

/**
 * Translate a target display width into the dapp-kit precision value.
 * The utility keeps `precision` characters on each side plus `...` in the middle.
 */
function toPrecision(totalVisibleChars: number): number {
  return Math.max(MIN_PRECISION, Math.floor(Math.max(0, totalVisibleChars - 3) / 2));
}

/**
 * Build the ordered set of candidate renderings we will try against the measured width.
 * We always prefer the largest display that fits, starting with the full address.
 */
function buildCandidateSequence(address: string, maxAbbreviation: number): string[] {
  const candidates = [eveAbbreviateAddress(address, 5, true)];
  const maxPrecision = toPrecision(Math.min(maxAbbreviation, address.length));

  for (let precision = maxPrecision; precision >= MIN_PRECISION; precision -= 1) {
    const abbreviated = eveAbbreviateAddress(address, precision, false);
    if (abbreviated && !candidates.includes(abbreviated)) {
      candidates.push(abbreviated);
    }
  }
  return candidates;
}

function joinClasses(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(' ');
}

export function ResponsiveAddress({
  address,
  maxAbbreviation = DEFAULT_MAX_ABBREVIATION,
  as: Component = 'span',
  children,
  className,
  textClassName,
  copyLabel = 'Sui address',
  copyable = true,
}: ResponsiveAddressProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const prefixRef = useRef<HTMLSpanElement | null>(null);
  const controlRef = useRef<HTMLButtonElement | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const observedWidthRef = useRef<number | null>(null);
  const [displayAddress, setDisplayAddress] = useState(address ?? '');
  const [copied, setCopied] = useState(false);
  const measurementId = useId();
  const normalizedAddress = typeof address === 'string' ? address.trim() : '';
  const copyAvailable = copyable && isSuiAddress(normalizedAddress);

  useLayoutEffect(() => {
    if (
      !(containerRef.current instanceof HTMLElement) ||
      !(measureRef.current instanceof HTMLSpanElement) ||
      typeof ResizeObserver === 'undefined'
    ) {
      return;
    }

    const containerEl = containerRef.current;
    const measureEl = measureRef.current;

    /**
     * Recompute the visible address for the current container width.
     * This preserves the largest candidate that still fits alongside any prefix/copy controls.
     */
    const syncDisplayAddress = () => {
      if (!isSuiAddress(normalizedAddress)) {
        setDisplayAddress('Unavailable');
        return;
      }

      const observedWidth = observedWidthRef.current;
      const containerWidth = Math.max(
        0,
        Math.floor(
          observedWidth ?? (containerEl.getBoundingClientRect().width || containerEl.clientWidth),
        ),
      );
      if (containerWidth <= 0) {
        setDisplayAddress(normalizedAddress);
        return;
      }

      const prefixWidth = prefixRef.current?.offsetWidth ?? 0;
      const controlWidth = controlRef.current?.offsetWidth ?? 0;
      const usableWidth = Math.max(0, containerWidth - prefixWidth - controlWidth);
      const candidates = buildCandidateSequence(normalizedAddress, maxAbbreviation);
      let nextDisplay = candidates[candidates.length - 1] ?? normalizedAddress;

      for (const candidate of candidates) {
        measureEl.textContent = candidate;
        if (measureEl.offsetWidth <= usableWidth) {
          nextDisplay = candidate;
          break;
        }
      }

      setDisplayAddress(nextDisplay);
    };

    /**
     * Batch resize reactions into the next animation frame so measurement happens
     * after layout settles instead of during a resize burst.
     */
    const scheduleSyncDisplayAddress = (nextObservedWidth?: number) => {
      if (typeof nextObservedWidth === 'number' && Number.isFinite(nextObservedWidth)) {
        observedWidthRef.current = nextObservedWidth;
      }

      if (animationFrameRef.current != null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = window.requestAnimationFrame(() => {
        animationFrameRef.current = null;
        syncDisplayAddress();
      });
    };

    const observer = new ResizeObserver((entries) => {
      scheduleSyncDisplayAddress(entries[0]?.contentRect.width);
    });
    const handleWindowResize = () => {
      scheduleSyncDisplayAddress();
    };

    observer.observe(containerEl);
    window.addEventListener('resize', handleWindowResize);
    scheduleSyncDisplayAddress();

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      observer.disconnect();
      if (animationFrameRef.current != null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [copyAvailable, maxAbbreviation, normalizedAddress]);

  useLayoutEffect(() => {
    return () => {
      if (feedbackTimerRef.current != null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
      if (animationFrameRef.current != null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  /**
   * Copy the full address and briefly switch the control into its success state.
   */
  async function handleCopy(): Promise<void> {
    if (!copyAvailable || !navigator.clipboard?.writeText) {
      return;
    }

    await navigator.clipboard.writeText(normalizedAddress);
    setCopied(true);

    if (feedbackTimerRef.current != null) {
      window.clearTimeout(feedbackTimerRef.current);
    }

    feedbackTimerRef.current = window.setTimeout(() => {
      setCopied(false);
      feedbackTimerRef.current = null;
    }, COPY_FEEDBACK_DURATION_MS);
  }

  const componentProps = {
    ref: containerRef,
    className: joinClasses('relative flex min-w-0 items-center gap-2 font-mono', className),
    'data-testid': 'responsive-address',
  } satisfies HTMLAttributes<HTMLElement> & {
    ref: typeof containerRef;
    'data-testid': string;
  };

  return createElement(
    Component,
    componentProps,
    <>
      {children ? <span ref={prefixRef}>{children}</span> : null}
      <span
        className={joinClasses(
          'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap',
          textClassName,
        )}
        title={isSuiAddress(normalizedAddress) ? normalizedAddress : undefined}
      >
        {isSuiAddress(normalizedAddress) ? displayAddress : 'Unavailable'}
      </span>
      {copyAvailable ? (
        <span className="relative flex shrink-0 items-center">
          <button
            ref={controlRef}
            type="button"
            className={joinClasses(
              'flex size-7 items-center justify-center border-2 border-sentinel-ink transition-all duration-200 ease-out',
              copied
                ? 'bg-sentinel-ink text-sentinel-paper shadow-[2px_2px_0_0_#ff5f1f]'
                : 'bg-white text-sentinel-ink',
            )}
            aria-label={`Copy ${copyLabel}`}
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              void handleCopy();
            }}
          >
            <img
              src={copied ? tickIconUrl : copyIconUrl}
              alt=""
              aria-hidden="true"
              className={copied ? 'h-3.5 w-3.5' : 'size-3'}
            />
          </button>
          <span
            role="status"
            aria-live="polite"
            className={joinClasses(
              'pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap border-2 border-sentinel-ink bg-sentinel-ink px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-sentinel-paper transition-all duration-200 ease-out',
              copied ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
            )}
          >
            {copied ? 'Copied to clipboard' : ''}
          </span>
        </span>
      ) : null}
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 whitespace-nowrap opacity-0 font-mono"
        data-testid={measurementId}
      />
    </>,
  );
}
