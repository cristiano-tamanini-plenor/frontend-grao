import { lazy } from "react";
import type React from "react";

/**
 * Utility function for lazy loading components with better type inference
 */
export function lazyImport<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): T {
  return lazy(factory) as unknown as T;
}

