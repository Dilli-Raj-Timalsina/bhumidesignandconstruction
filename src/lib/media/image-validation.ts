export const maximumImageUploadBytes = 8 * 1024 * 1024;

export const imageExtensions = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

function matchesBytes(
  bytes: Uint8Array,
  signature: readonly number[],
  offset = 0,
): boolean {
  return signature.every((value, index) => bytes[offset + index] === value);
}

function containsAscii(bytes: Uint8Array, value: string, offset = 0): boolean {
  const signature = Array.from(value, (character) => character.charCodeAt(0));
  for (let index = offset; index <= bytes.length - signature.length; index++) {
    if (matchesBytes(bytes, signature, index)) return true;
  }
  return false;
}

export async function imageFileError(file: Blob): Promise<string | null> {
  if (!imageExtensions.has(file.type)) {
    return "Only JPEG, PNG, WebP, and AVIF images are supported.";
  }
  if (file.size === 0 || file.size > maximumImageUploadBytes) {
    return "Image files must be between 1 byte and 8 MB.";
  }

  try {
    const bytes = new Uint8Array(await file.slice(0, 64).arrayBuffer());
    const matches =
      (file.type === "image/jpeg" && matchesBytes(bytes, [0xff, 0xd8, 0xff])) ||
      (file.type === "image/png" &&
        matchesBytes(
          bytes,
          [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
        )) ||
      (file.type === "image/webp" &&
        matchesBytes(bytes, [0x52, 0x49, 0x46, 0x46]) &&
        matchesBytes(bytes, [0x57, 0x45, 0x42, 0x50], 8)) ||
      (file.type === "image/avif" &&
        matchesBytes(bytes, [0x66, 0x74, 0x79, 0x70], 4) &&
        (containsAscii(bytes, "avif", 8) || containsAscii(bytes, "avis", 8)));
    return matches
      ? null
      : "The file contents do not match the selected image type.";
  } catch {
    return "The image could not be read. Please choose it again.";
  }
}
