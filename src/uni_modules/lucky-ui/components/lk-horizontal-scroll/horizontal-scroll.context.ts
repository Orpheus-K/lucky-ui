import type { InjectionKey } from 'vue';

export interface HorizontalScrollRect {
  left: number;
  width: number;
}

export type MeasureHorizontalScrollItem = () => Promise<HorizontalScrollRect | null>;

export const horizontalScrollContextKey: InjectionKey<{
  register: (measure: MeasureHorizontalScrollItem) => () => void;
  refresh: () => Promise<void>;
}> = Symbol('lk-horizontal-scroll');
