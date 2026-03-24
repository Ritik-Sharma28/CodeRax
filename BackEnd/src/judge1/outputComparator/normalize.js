/**
 * Normalize output for comparison:
 * - Trim leading/trailing whitespace
 * - Remove trailing whitespace from each line
 * - Remove trailing empty lines
 * - Normalize line endings to \n
 */
export const normalizeOutput = (output) => {
  if (!output) return "";
  return output
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
};