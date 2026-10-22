/** Minutes from a duration such as "8 min". */
export const minutesOf = (duration?: string) => Number(duration?.match(/\d+/)?.[0] ?? 0);
