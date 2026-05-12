/**
 * Marketing site navigation map.
 * Each entry corresponds to a scene/section on the home page.
 * Used by the floating side-nav dots and (later) by scroll-spy logic.
 */
export type NavItem = {
  /** Section ID — matches the section's DOM id. */
  id: string;
  /** Short label shown on hover next to the dot. */
  label: string;
};

export const NAV: readonly NavItem[] = [
  { id: 'hero',         label: 'Open' },
  { id: 'problem',      label: 'The Gap' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'capitals',     label: '4 Capitals' },
  { id: 'formula',      label: 'Formula' },
  { id: 'input',        label: 'Inputs' },
  { id: 'engines',      label: 'Engines' },
  { id: 'dashboard',    label: 'Dashboard' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'closing',      label: 'Vision' },
] as const;
