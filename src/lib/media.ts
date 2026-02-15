import mammoth from "mammoth";
import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import * as E from "fp-ts/Either";

const mimeTypeList: Record<string, string> = {
  html: "text/html",
  htm: "text/html",
  text: "text/plain",
  txt: "text/plain",
  css: "text/css",
  csv: "text/csv",
  js: "text/javascript",
  mjs: "text/javascript",
  json: "application/json",
  xhtml: "application/xhtml+xml",
  pdf: "application/pdf",
  epub: "application/epub+zip",
  zip: "application/zip",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  bmp: "image/bmp",
  svg: "image/svg+xml",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  mpeg: "video/mpeg",
  odp: "application/vnd.oasis.opendocument.presentation",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odt: "application/vnd.oasis.opendocument.text",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()! : "";
};

/**
 * Convert filename to mime type
 */
export const getMimeTypeFromExtension = (
  extension: string,
  defaultMimeType: string = "application/octet-stream"
): string =>
  extension in mimeTypeList ? mimeTypeList[extension] : defaultMimeType;

/**
 * Reduce image size by scaling and recompressing
 */
export const reduceImageSize = async (
  document: Document,
  source: Blob,
  mimeType: string,
  maxSize: number,
  quality: number = 1.0
): Promise<E.Either<string, Blob>> => {
  if (source.size <= maxSize) {
    return E.right(source);
  }
  try {
    const img = new Image();
    img.src = URL.createObjectURL(source);
    console.log("img.src", img.src);
    await img.decode();
    const canvas = document.createElement("canvas");

    const rate = maxSize / source.size;
    const width = Math.ceil(img.width * rate);
    const height = Math.floor(img.height * rate);

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, width, height);
    const blob = await new Promise<Blob>((resolve) =>
      ctx.canvas.toBlob((b) => resolve(b!), mimeType, quality)
    );

    console.log({
      mimeType,
      rate,
      from: source.size,
      to: blob.size,
      width,
      height,
    });

    return E.right(blob);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error reducing image size:", errorMessage);
    return E.left(errorMessage);
  }
};

/**
 * Recursively get all text nodes from a Cheerio node.
 */
function getAllTextNodes(
  dom: cheerio.CheerioAPI,
  node: cheerio.Cheerio<AnyNode>
): string[] {
  let texts: string[] = [];
  node.contents().each((_: number, child: AnyNode) => {
    if (child.type === "text") {
      const text = dom(child).text();
      if (text) {
        texts.push(text);
      }
    } else {
      if (dom(child).contents().length) {
        texts = texts.concat(getAllTextNodes(dom, dom(child)));
      }
    }
  });
  return texts;
}

/**
 * Convert DOCX file to table structure
 */
export const docxToTable = async (
  file: File
): Promise<E.Either<string, string[][][]>> => {
  try {
    const data: string[][][] = [];
    const buffer = await file.arrayBuffer();
    const { value } = await mammoth.convertToHtml({ arrayBuffer: buffer });
    const dom = cheerio.load(value);

    dom("tr").each((_: number, tr: AnyNode) => {
      const cols: string[][] = [];
      data.push(cols);
      dom("td", tr).each((_: number, td: AnyNode) => {
        const texts = getAllTextNodes(dom, dom(td));
        // Filter out empty strings and strings that are just whitespace
        cols.push(texts.filter((t) => t.trim() !== ""));
      });
    });

    return E.right(data);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(`docxToTable: ${errorMessage}`);
    return E.left(errorMessage);
  }
};
