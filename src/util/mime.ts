/**
 * Mime Types.
 */

const DEFAULT_MIME_TYPE = 'text/plain';

const mimeMatrix: Array<[string, Array<string>]> = [
  ['text/html', ['.html']],
  ['text/css', ['.css' ]],
  ['application/javascript', ['.js', '.mjs']],
  ['application/json', ['.json']]
];

/**
 * Maps Mime Types to file extensions.
 */
const mimeTypeMap = new Map<string, string>(
  mimeMatrix.flatMap((row) => {
    const mimeType = row[0];
    const fileExts = row[1];
    return fileExts.map((fileExt) => [fileExt, mimeType]) as Array<[string, string]>;
  })
);

/**
 * Get the implied mime type for the given file extension.
 *
 * @param fileExtension The file extension to check.
 */
export function getMimeType(fileExtension: string): string {
  const mime = mimeTypeMap.get(fileExtension);

  if (mime === undefined) {
    return DEFAULT_MIME_TYPE;
  }
  return mime;
}
