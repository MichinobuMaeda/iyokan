import { describe, it, expect, vi, beforeEach } from "vitest";
import * as E from "fp-ts/Either";

// Mock mammoth
const mockConvertToHtml = vi.fn();
vi.mock("mammoth", () => ({
  default: {
    convertToHtml: mockConvertToHtml,
  },
}));

// Mock cheerio
const mockLoad = vi.fn();
vi.mock("cheerio", () => ({
  load: mockLoad,
}));

/* eslint-disable @typescript-eslint/no-explicit-any */

describe("media", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getFileExtension", () => {
    it("should extract extension from filename", async () => {
      const { getFileExtension } = await import("./media");
      expect(getFileExtension("document.pdf")).toBe("pdf");
      expect(getFileExtension("image.jpg")).toBe("jpg");
      expect(getFileExtension("archive.tar.gz")).toBe("gz");
    });

    it("should handle filename without extension", async () => {
      const { getFileExtension } = await import("./media");
      expect(getFileExtension("README")).toBe("");
    });

    it("should handle filename with multiple dots", async () => {
      const { getFileExtension } = await import("./media");
      expect(getFileExtension("my.file.name.txt")).toBe("txt");
    });

    it("should handle empty filename", async () => {
      const { getFileExtension } = await import("./media");
      expect(getFileExtension("")).toBe("");
    });
  });

  describe("getMimeTypeFromExtension", () => {
    it("should return correct mime type for html", async () => {
      const { getMimeTypeFromExtension } = await import("./media");
      expect(getMimeTypeFromExtension("html")).toBe("text/html");
      expect(getMimeTypeFromExtension("htm")).toBe("text/html");
    });

    it("should return correct mime type for text files", async () => {
      const { getMimeTypeFromExtension } = await import("./media");
      expect(getMimeTypeFromExtension("txt")).toBe("text/plain");
      expect(getMimeTypeFromExtension("text")).toBe("text/plain");
    });

    it("should return correct mime type for images", async () => {
      const { getMimeTypeFromExtension } = await import("./media");
      expect(getMimeTypeFromExtension("jpg")).toBe("image/jpeg");
      expect(getMimeTypeFromExtension("jpeg")).toBe("image/jpeg");
      expect(getMimeTypeFromExtension("png")).toBe("image/png");
      expect(getMimeTypeFromExtension("gif")).toBe("image/gif");
    });

    it("should return correct mime type for office documents", async () => {
      const { getMimeTypeFromExtension } = await import("./media");
      expect(getMimeTypeFromExtension("docx")).toBe(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      expect(getMimeTypeFromExtension("xlsx")).toBe(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      expect(getMimeTypeFromExtension("pptx")).toBe(
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      );
    });

    it("should return default mime type for unknown extension", async () => {
      const { getMimeTypeFromExtension } = await import("./media");
      expect(getMimeTypeFromExtension("unknown")).toBe(
        "application/octet-stream"
      );
    });

    it("should return custom default mime type", async () => {
      const { getMimeTypeFromExtension } = await import("./media");
      expect(getMimeTypeFromExtension("unknown", "text/custom")).toBe(
        "text/custom"
      );
    });
  });

  describe("reduceImageSize", () => {
    it("should return source blob if already under max size", async () => {
      const { reduceImageSize } = await import("./media");

      const mockBlob = new Blob(["test"], { type: "image/jpeg" });
      Object.defineProperty(mockBlob, "size", { value: 1000 });

      const mockDocument = {} as Document;
      const result = await reduceImageSize(
        mockDocument,
        mockBlob,
        "image/jpeg",
        2000
      );

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(mockBlob);
      }
    });

    it("should reduce image size when over max size", async () => {
      const { reduceImageSize } = await import("./media");

      // Mock Image
      const mockImage = {
        src: "",
        width: 1000,
        height: 800,
        decode: vi.fn().mockResolvedValue(undefined),
      };
      global.Image = vi.fn(() => mockImage) as any;
      global.URL = {
        createObjectURL: vi.fn(() => "blob:mock-url"),
      } as any;

      // Mock Canvas
      const mockBlob = new Blob(["compressed"], { type: "image/jpeg" });
      Object.defineProperty(mockBlob, "size", { value: 800 });

      const mockToBlob = vi.fn((callback) => callback(mockBlob));
      const mockContext = {
        canvas: { toBlob: mockToBlob },
        drawImage: vi.fn(),
      };
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockContext),
      };
      const mockDocument = {
        createElement: vi.fn(() => mockCanvas),
      } as unknown as Document;

      const sourceBlob = new Blob(["large image"], { type: "image/jpeg" });
      Object.defineProperty(sourceBlob, "size", { value: 2000 });

      const result = await reduceImageSize(
        mockDocument,
        sourceBlob,
        "image/jpeg",
        1000,
        0.9
      );

      expect(E.isRight(result)).toBe(true);
      expect(mockImage.decode).toHaveBeenCalled();
      expect(mockDocument.createElement).toHaveBeenCalledWith("canvas");
      expect(mockContext.drawImage).toHaveBeenCalled();
      expect(mockToBlob).toHaveBeenCalled();
    });

    it("should return error on failure", async () => {
      const { reduceImageSize } = await import("./media");

      // Mock Image that fails to decode
      const mockImage = {
        src: "",
        decode: vi.fn().mockRejectedValue(new Error("Decode failed")),
      };
      global.Image = vi.fn(() => mockImage) as any;
      global.URL = {
        createObjectURL: vi.fn(() => "blob:mock-url"),
      } as any;

      const mockDocument = {} as Document;
      const sourceBlob = new Blob(["image"], { type: "image/jpeg" });
      Object.defineProperty(sourceBlob, "size", { value: 2000 });

      // Suppress console.error during test
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await reduceImageSize(
        mockDocument,
        sourceBlob,
        "image/jpeg",
        1000
      );

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("Decode failed");
      }
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("should handle non-Error exceptions", async () => {
      const { reduceImageSize } = await import("./media");

      // Mock Image that throws a non-Error value
      const mockImage = {
        src: "",
        decode: vi.fn().mockRejectedValue("String error"),
      };
      global.Image = vi.fn(() => mockImage) as any;
      global.URL = {
        createObjectURL: vi.fn(() => "blob:mock-url"),
      } as any;

      const mockDocument = {} as Document;
      const sourceBlob = new Blob(["image"], { type: "image/jpeg" });
      Object.defineProperty(sourceBlob, "size", { value: 2000 });

      // Suppress console.error during test
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await reduceImageSize(
        mockDocument,
        sourceBlob,
        "image/jpeg",
        1000
      );

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("String error");
      }
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("docxToTable", () => {
    it("should convert DOCX file to table structure", async () => {
      const { docxToTable } = await import("./media");

      // Mock file
      const mockFile = {
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
      } as unknown as File;

      // Mock mammoth response
      mockConvertToHtml.mockResolvedValue({
        value: "<table><tr><td>Cell 1</td><td>Cell 2</td></tr></table>",
      });

      // Mock cheerio
      const mockCells: any[] = [];
      const mockRows: any[] = [];
      let cellIndex = 0;

      const mockDom = vi.fn((selector: string) => {
        if (selector === "tr") {
          return {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
            each: (callback: Function) => {
              mockRows.forEach((row, index) => callback(index, row));
            },
          };
        }
        if (selector === "td") {
          return {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
            each: (callback: Function) => {
              mockCells.forEach((cell, index) => callback(index, cell));
            },
          };
        }
        // For text extraction
        const currentCell = cellIndex++;
        return {
          text: () => (currentCell === 0 ? "Cell 1" : "Cell 2"),
          contents: () => ({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
            each: (callback: Function) => {
              const textNode = {
                type: "text",
              };
              callback(0, textNode);
            },
            length: 1,
          }),
        };
      });

      mockLoad.mockReturnValue(mockDom);

      // Setup mock data
      mockRows.push({ type: "element" });
      mockCells.push({ type: "element" }, { type: "element" });

      const result = await docxToTable(mockFile);

      expect(E.isRight(result)).toBe(true);
      expect(mockFile.arrayBuffer).toHaveBeenCalled();
      expect(mockConvertToHtml).toHaveBeenCalled();
      expect(mockLoad).toHaveBeenCalled();
    });

    it("should handle nested elements in cells", async () => {
      const { docxToTable } = await import("./media");

      const mockFile = {
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
      } as unknown as File;

      mockConvertToHtml.mockResolvedValue({
        value: "<table><tr><td><p>Nested text</p></td></tr></table>",
      });

      const mockRows: any[] = [{ type: "element" }];
      const mockCells: any[] = [{ type: "element" }];
      let callDepth = 0;

      const mockDom = vi.fn((selector: string) => {
        if (selector === "tr") {
          return {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
            each: (callback: Function) => {
              mockRows.forEach((row, index) => callback(index, row));
            },
          };
        }
        if (selector === "td") {
          return {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
            each: (callback: Function) => {
              mockCells.forEach((cell, index) => callback(index, cell));
            },
          };
        }
        // For nested elements - first level returns element, deeper levels return text
        const depth = callDepth++;
        return {
          text: () => "Nested text",
          contents: () => ({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
            each: (callback: Function) => {
              if (depth === 0) {
                // Return a nested element on first call
                const nestedElement = { type: "element" };
                callback(0, nestedElement);
              } else {
                // Return text node on deeper calls
                const textNode = { type: "text" };
                callback(0, textNode);
              }
            },
            length: 1,
          }),
        };
      });

      mockLoad.mockReturnValue(mockDom);

      const result = await docxToTable(mockFile);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right[0][0]).toEqual(["Nested text"]);
      }
    });

    it("should filter out empty text nodes", async () => {
      const { docxToTable } = await import("./media");

      const mockFile = {
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
      } as unknown as File;

      mockConvertToHtml.mockResolvedValue({
        value: "<table><tr><td>Valid</td></tr></table>",
      });

      const mockRows: any[] = [{ type: "element" }];
      const mockCells: any[] = [{ type: "element" }];

      const mockDom = vi.fn((selector: string) => {
        if (selector === "tr") {
          return {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
            each: (callback: Function) => {
              mockRows.forEach((row, index) => callback(index, row));
            },
          };
        }
        if (selector === "td") {
          return {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
            each: (callback: Function) => {
              mockCells.forEach((cell, index) => callback(index, cell));
            },
          };
        }
        return {
          text: () => "Valid",
          contents: () => ({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
            each: (callback: Function) => {
              const textNode = { type: "text" };
              callback(0, textNode);
            },
            length: 1,
          }),
        };
      });

      mockLoad.mockReturnValue(mockDom);

      const result = await docxToTable(mockFile);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right[0][0]).toEqual(["Valid"]);
      }
    });

    it("should return error on mammoth failure", async () => {
      const { docxToTable } = await import("./media");

      const mockFile = {
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
      } as unknown as File;

      mockConvertToHtml.mockRejectedValue(new Error("Invalid DOCX file"));

      // Suppress console.error during test
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await docxToTable(mockFile);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("Invalid DOCX file");
      }
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("should return error on file read failure", async () => {
      const { docxToTable } = await import("./media");

      const mockFile = {
        arrayBuffer: vi.fn().mockRejectedValue(new Error("File read failed")),
      } as unknown as File;

      // Suppress console.error during test
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await docxToTable(mockFile);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("File read failed");
      }
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("should handle non-Error exceptions in docxToTable", async () => {
      const { docxToTable } = await import("./media");

      const mockFile = {
        arrayBuffer: vi.fn().mockRejectedValue("String error in file read"),
      } as unknown as File;

      // Suppress console.error during test
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await docxToTable(mockFile);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("String error in file read");
      }
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
