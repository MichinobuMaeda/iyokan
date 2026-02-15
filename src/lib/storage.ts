import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as E from "fp-ts/Either";

import { storage } from "./firebase";
import {
  getFileExtension,
  getMimeTypeFromExtension,
  reduceImageSize,
} from "./media.js";

const imageBasePath = "public/posts/";
const imageMaxSize = 1000 * 1000;
const imageQuality = 0.8;

/**
 * Retrieves the download URL for a saved image from Firebase Storage.
 *
 * @param params - Object containing image identifiers
 * @param params.id - The post ID (timestamp-based identifier)
 * @param params.name - The image filename (e.g., "1.jpg")
 * @returns Promise that resolves to the download URL of the image
 */
export const getSavedImageUrl = async ({
  id,
  name,
}: {
  id: string;
  name: string;
}): Promise<string> =>
  getDownloadURL(ref(storage, `${imageBasePath}/${id}/${name}`));

/**
 * Saves a posted image to Firebase Storage after resizing and compression.
 *
 * The image is processed to reduce file size (max 1MB) and compressed to 80% quality
 * before uploading. The file is saved with a sequential number and its original extension
 * (e.g., "1.jpg").
 *
 * @param id - The post ID (timestamp-based identifier) used as the storage directory
 * @param file - The image file to upload
 * @param document - The Document object used for image processing (canvas operations)
 * @returns Promise that resolves to Either containing an error message (Left) or void (Right)
 */
export const savePostedImage = async (
  id: string,
  file: File,
  document: Document
): Promise<E.Either<string, void>> => {
  console.log(`savePostedImage: ${file.name} ${file.size}`);

  const ext = getFileExtension(file.name);
  const mimeType = getMimeTypeFromExtension(ext);
  const blog = await reduceImageSize(
    document,
    file,
    mimeType,
    imageMaxSize,
    imageQuality
  );
  if (E.isLeft(blog)) {
    return E.left(blog.left);
  }

  try {
    const metadata = { contentType: mimeType };
    const imageRef = ref(storage, `${imageBasePath}/${id}/1.${ext}`);
    await uploadBytes(imageRef, blog.right, metadata);
    return E.right(undefined);
  } catch (e) {
    console.error(`saveImage: ${e}`);
    return E.left(`saveImage: ${e}`);
  }
};
