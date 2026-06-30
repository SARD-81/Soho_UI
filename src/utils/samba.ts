export const parseDelimitedList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => Boolean(item))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/[,،]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [] as string[];
};

export const uniqueSortedList = (items: string[]) =>
  Array.from(new Set(items))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

const GROUP_PREFIX = '@';

export const normalizeShareAccessMember = (value: string) => value.trim();

export const normalizeShareGroupName = (groupName: string) =>
  groupName.trim().replace(/^@+/, '');

export const toShareGroupMember = (groupName: string) => {
  const normalized = normalizeShareGroupName(groupName);
  return normalized ? `${GROUP_PREFIX}${normalized}` : '';
};

export const isShareGroupMember = (member: string) =>
  normalizeShareAccessMember(member).startsWith(GROUP_PREFIX);

export const getShareUserMembers = (members: string[]) =>
  members
    .map(normalizeShareAccessMember)
    .filter((member) => member && !isShareGroupMember(member));

export const getShareGroupMembers = (members: string[]) =>
  members
    .map(normalizeShareAccessMember)
    .filter(isShareGroupMember)
    .map(normalizeShareGroupName)
    .filter(Boolean);

export const mergeShareAccessMembers = ({
  users,
  groups,
}: {
  users: string[];
  groups: string[];
}) =>
  uniqueSortedList([
    ...users.map(normalizeShareAccessMember).filter(Boolean),
    ...groups.map(toShareGroupMember).filter(Boolean),
  ]);