import type { StyleValue } from 'vue';
import type { ScrollMode } from './notice-bar.props';

export type NoticeBarScrollMode = ScrollMode | 'none';

export function resolveNoticeBarStyle(options: {
  noBackground: boolean;
  background: string;
  color: string;
  customStyle: StyleValue;
}): StyleValue {
  if (options.noBackground) {
    return [
      {
        padding: '0',
        borderRadius: '0',
      },
      options.customStyle,
    ];
  }

  return [
    {
      background: options.background,
      color: options.color,
    },
    options.customStyle,
  ];
}

export function resolveNoticeBarScrollMode(scrollable: boolean | ScrollMode): NoticeBarScrollMode {
  if (scrollable === false) return 'none';
  if (scrollable === true || scrollable === 'horizontal') return 'horizontal';
  if (scrollable === 'vertical') return 'vertical';
  return 'none';
}

export function resolveNoticeBarDisplayMessages(options: {
  scrollMode: NoticeBarScrollMode;
  messages: string[];
  text: string;
}): string[] {
  if (options.scrollMode !== 'vertical') return [];
  return options.messages.length > 0 ? options.messages : [options.text];
}

export function resolveNoticeBarVerticalList(messages: string[]): string[] {
  if (messages.length === 0) return [];
  return [...messages, messages[0]];
}

export function resolveNoticeBarVerticalStyle(options: {
  verticalListLength: number;
  currentIndex: number;
  enableTransition: boolean;
}): Record<string, string> {
  const offset = options.verticalListLength
    ? (options.currentIndex * 100) / options.verticalListLength
    : 0;

  return {
    transform: `translateY(-${offset}%)`,
    transition: options.enableTransition ? 'transform 0.3s ease-in-out' : 'none',
  };
}

export function resolveNoticeBarInterval(speed: number): number {
  return Math.max(0.5, speed) * 1000;
}

export function resolveNoticeBarClickPayload(options: {
  scrollMode: NoticeBarScrollMode;
  displayMessages: string[];
  currentIndex: number;
  text: string;
  event?: unknown;
}) {
  const vertical = options.scrollMode === 'vertical';
  return {
    text: vertical ? options.displayMessages[options.currentIndex] || '' : options.text,
    index: vertical ? options.currentIndex : 0,
    event: options.event,
  };
}
