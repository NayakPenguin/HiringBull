/**
 * Pick specified keys from an object
 * @param object - Source object
 * @param keys - Keys to pick
 * @returns New object with only specified keys
 */
export const pick = <T extends Record<string, unknown>, K extends keyof T>(
  object: T | null | undefined,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  if (object && typeof object === 'object') {
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        result[key] = object[key];
      }
    }
  }
  return result;
};