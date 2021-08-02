export const safeParseInt = (value: string): number | null => {
  const parsedInt = parseInt(value, 10);

  if (isNaN(parsedInt)) {
    return null;
  }

  return parsedInt;
};
