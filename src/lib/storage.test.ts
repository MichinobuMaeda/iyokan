import { describe, it, expect, vi, beforeEach } from "vitest";
// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import * as E from "fp-ts/Either";

// Mock Firebase Storage
const mockRef = vi.fn();
const mockUploadBytes = vi.fn();
const mockGetDownloadURL = vi.fn();

vi.mock("firebase/storage", () => ({
  ref: mockRef,
  uploadBytes: mockUploadBytes,
  getDownloadURL: mockGetDownloadURL,
}));

// Mock media functions
const mockGetFileExtension = vi.fn();
const mockGetMimeTypeFromExtension = vi.fn();
const mockReduceImageSize = vi.fn();

vi.mock("./media.js", () => ({
  getFileExtension: mockGetFileExtension,
  getMimeTypeFromExtension: mockGetMimeTypeFromExtension,
  reduceImageSize: mockReduceImageSize,
}));

// Mock firebase
vi.mock("./firebase", () => ({
  storage: {},
}));

describe("storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("getSavedImageUrl", () => {
    it("should return download URL for saved image", async () => {
      const { getSavedImageUrl } = await import("./storage");

      const mockStorageRef = { path: "public/posts/12345/1.jpg" };
      const expectedUrl = "https://storage.example.com/image.jpg";

      mockRef.mockReturnValue(mockStorageRef);
      mockGetDownloadURL.mockResolvedValue(expectedUrl);

      const result = await getSavedImageUrl({
        id: "12345",
        name: "1.jpg",
      });

      expect(mockRef).toHaveBeenCalledWith({}, "public/posts//12345/1.jpg");
      expect(mockGetDownloadURL).toHaveBeenCalledWith(mockStorageRef);
      expect(result).toBe(expectedUrl);
    });

    it("should construct correct path with post ID and filename", async () => {
      const { getSavedImageUrl } = await import("./storage");

      const mockStorageRef = { path: "public/posts/20260215123456789/1.png" };
      mockRef.mockReturnValue(mockStorageRef);
      mockGetDownloadURL.mockResolvedValue("https://example.com/image.png");

      await getSavedImageUrl({
        id: "20260215123456789",
        name: "1.png",
      });

      expect(mockRef).toHaveBeenCalledWith(
        {},
        "public/posts//20260215123456789/1.png"
      );
    });
  });

  describe("savePostedImage", () => {
    it("should save image successfully", async () => {
      const { savePostedImage } = await import("./storage");

      const mockFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });
      const mockDocument = {} as Document;
      const mockBlob = new Blob(["reduced"], { type: "image/jpeg" });
      const mockStorageRef = { path: "public/posts/12345/1.jpg" };

      mockGetFileExtension.mockReturnValue("jpg");
      mockGetMimeTypeFromExtension.mockReturnValue("image/jpeg");
      mockReduceImageSize.mockResolvedValue(E.right(mockBlob));
      mockRef.mockReturnValue(mockStorageRef);
      mockUploadBytes.mockResolvedValue({});

      const result = await savePostedImage("12345", mockFile, mockDocument);

      expect(mockGetFileExtension).toHaveBeenCalledWith("test.jpg");
      expect(mockGetMimeTypeFromExtension).toHaveBeenCalledWith("jpg");
      expect(mockReduceImageSize).toHaveBeenCalledWith(
        mockDocument,
        mockFile,
        "image/jpeg",
        1000000,
        0.8
      );
      expect(mockRef).toHaveBeenCalledWith({}, "public/posts//12345/1.jpg");
      expect(mockUploadBytes).toHaveBeenCalledWith(mockStorageRef, mockBlob, {
        contentType: "image/jpeg",
      });
      expect(E.isRight(result)).toBe(true);
    });

    it("should return Left when image reduction fails", async () => {
      const { savePostedImage } = await import("./storage");

      const mockFile = new File(["content"], "test.png", {
        type: "image/png",
      });
      const mockDocument = {} as Document;
      const errorMessage = "Image too large";

      mockGetFileExtension.mockReturnValue("png");
      mockGetMimeTypeFromExtension.mockReturnValue("image/png");
      mockReduceImageSize.mockResolvedValue(E.left(errorMessage));

      const result = await savePostedImage("12345", mockFile, mockDocument);

      expect(mockReduceImageSize).toHaveBeenCalledWith(
        mockDocument,
        mockFile,
        "image/png",
        1000000,
        0.8
      );
      expect(mockRef).not.toHaveBeenCalled();
      expect(mockUploadBytes).not.toHaveBeenCalled();
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe(errorMessage);
      }
    });

    it("should return Left when upload fails", async () => {
      const { savePostedImage } = await import("./storage");

      const mockFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });
      const mockDocument = {} as Document;
      const mockBlob = new Blob(["reduced"], { type: "image/jpeg" });
      const mockStorageRef = { path: "public/posts/12345/1.jpg" };
      const uploadError = new Error("Upload failed");

      mockGetFileExtension.mockReturnValue("jpg");
      mockGetMimeTypeFromExtension.mockReturnValue("image/jpeg");
      mockReduceImageSize.mockResolvedValue(E.right(mockBlob));
      mockRef.mockReturnValue(mockStorageRef);
      mockUploadBytes.mockRejectedValue(uploadError);

      const result = await savePostedImage("12345", mockFile, mockDocument);

      expect(mockUploadBytes).toHaveBeenCalled();
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toContain("saveImage:");
      }
    });

    it("should use correct file extension and metadata", async () => {
      const { savePostedImage } = await import("./storage");

      const mockFile = new File(["content"], "image.webp", {
        type: "image/webp",
      });
      const mockDocument = {} as Document;
      const mockBlob = new Blob(["reduced"], { type: "image/webp" });
      const mockStorageRef = { path: "public/posts/99999/1.webp" };

      mockGetFileExtension.mockReturnValue("webp");
      mockGetMimeTypeFromExtension.mockReturnValue("image/webp");
      mockReduceImageSize.mockResolvedValue(E.right(mockBlob));
      mockRef.mockReturnValue(mockStorageRef);
      mockUploadBytes.mockResolvedValue({});

      await savePostedImage("99999", mockFile, mockDocument);

      expect(mockRef).toHaveBeenCalledWith({}, "public/posts//99999/1.webp");
      expect(mockUploadBytes).toHaveBeenCalledWith(mockStorageRef, mockBlob, {
        contentType: "image/webp",
      });
    });

    it("should log file information when saving", async () => {
      const { savePostedImage } = await import("./storage");

      const mockFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });
      const mockDocument = {} as Document;
      const mockBlob = new Blob(["reduced"], { type: "image/jpeg" });
      const consoleSpy = vi.spyOn(console, "log");

      mockGetFileExtension.mockReturnValue("jpg");
      mockGetMimeTypeFromExtension.mockReturnValue("image/jpeg");
      mockReduceImageSize.mockResolvedValue(E.right(mockBlob));
      mockRef.mockReturnValue({});
      mockUploadBytes.mockResolvedValue({});

      await savePostedImage("12345", mockFile, mockDocument);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("savePostedImage:")
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("test.jpg")
      );
    });
  });

  describe("useImageUrl", () => {
    it("should return undefined when no id or files provided", async () => {
      const { useImageUrl } = await import("./storage");
      const { result } = renderHook(() => useImageUrl(undefined, undefined));

      expect(result.current).toBeUndefined();
    });

    it("should return undefined when id is provided but files is empty", async () => {
      const { useImageUrl } = await import("./storage");
      const { result } = renderHook(() => useImageUrl("12345", []));

      expect(result.current).toBeUndefined();
    });

    it("should return undefined when id is provided but files is null", async () => {
      const { useImageUrl } = await import("./storage");
      const { result } = renderHook(() => useImageUrl("12345", null));

      expect(result.current).toBeUndefined();
    });

    it("should fetch and return image URLs for valid id and files", async () => {
      const { useImageUrl } = await import("./storage");

      const mockUrls = [
        "https://storage.example.com/1.jpg",
        "https://storage.example.com/2.jpg",
      ];

      // Setup fresh mocks
      mockRef.mockReturnValue({ path: "some/path" });
      mockGetDownloadURL.mockImplementation(() =>
        Promise.resolve(mockUrls[mockGetDownloadURL.mock.calls.length - 1])
      );

      const { result } = renderHook(() =>
        useImageUrl("12345", ["1.jpg", "2.jpg"])
      );

      await waitFor(
        () => {
          expect(result.current).toBeDefined();
          expect(result.current?.length).toBe(2);
        },
        { timeout: 1000 }
      );
    });

    it("should handle errors when fetching image URLs", async () => {
      const { useImageUrl } = await import("./storage");

      const consoleErrorSpy = vi.spyOn(console, "error");
      mockRef.mockReturnValue({ path: "some/path" });
      mockGetDownloadURL.mockRejectedValue(new Error("Failed to fetch URL"));

      const { result } = renderHook(() => useImageUrl("12345", ["1.jpg"]));

      await waitFor(
        () => {
          expect(consoleErrorSpy).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );

      expect(result.current).toBeUndefined();
    });
  });
});
