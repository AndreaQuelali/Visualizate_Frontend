import { describe, it, expect } from 'vitest';
import {
  ADMIN_ONLY,
  ANY_MEMBER,
  EDITORS,
  hasRole,
  type WorkspaceRole,
} from './permissions';

const ROLES: WorkspaceRole[] = ['ADMIN', 'DESIGNER', 'ORGANIZER'];

describe('hasRole (permission matrix)', () => {
  it.each([
    ['ADMIN_ONLY', ADMIN_ONLY, [true, false, false]],
    ['EDITORS', EDITORS, [true, true, false]],
    ['ANY_MEMBER', ANY_MEMBER, [true, true, true]],
  ] as const)('%s por rol', (_name, group, expected) => {
    expect(ROLES.map((r) => hasRole(r, group))).toEqual(expected);
  });

  it('acepta un rol suelto', () => {
    expect(hasRole('DESIGNER', 'DESIGNER')).toBe(true);
    expect(hasRole('ORGANIZER', 'DESIGNER')).toBe(false);
  });

  it('niega el acceso cuando no hay rol', () => {
    expect(hasRole(null, ANY_MEMBER)).toBe(false);
    expect(hasRole(undefined, ANY_MEMBER)).toBe(false);
  });
});
