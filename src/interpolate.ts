/**
 * Replace `{{name}}` placeholders in a template with values from `vars`.
 * Unknown placeholders are left untouched so missing data is visible, not silent.
 *
 *   interpolate("{{n}} clicks", { n: 3 }) // "3 clicks"
 */
export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{{${key}}}`,
  );
}
