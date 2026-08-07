/** Returns ARIA error metadata shared by Record Change form controls. */
export function getFieldAccessibilityProps(fieldId: string, error?: string) {
  if (error === undefined) {
    return {}
  }

  return {
    "aria-describedby": `${fieldId}-error`,
    "aria-invalid": true,
  } as const
}
