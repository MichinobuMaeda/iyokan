import { describe, it, expect } from "vitest";
import { DocumentSnapshot } from "firebase/firestore";
import { providerFromDoc } from "./Provider";

describe("Provider types", () => {
  describe("providerFromDoc", () => {
    it("should return null for non-existent document", () => {
      const mockDoc = {
        exists: () => false,
        id: "test-id",
        data: () => undefined,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toBeNull();
    });

    it("should return null for empty provider type", () => {
      const mockData = {
        name: "Test Provider",
        valid: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "provider-123",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toBeNull();
    });

    it("should create Bluesky provider from valid document", () => {
      const mockData = {
        type: "bluesky",
        name: "Bluesky Provider",
        params: [
          { key: "service", value: "https://bsky.social" },
          { key: "identifier", value: "user.bsky.social" },
          { key: "password", value: "app-password" },
        ],
        valid: true,
        createdAt: { toDate: () => new Date("2024-01-01") },
        updatedAt: { toDate: () => new Date("2024-01-02") },
      };

      const mockDoc = {
        exists: () => true,
        id: "bluesky-123",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toEqual({
        id: "bluesky-123",
        type: "bluesky",
        name: "Bluesky Provider",
        params: [
          { key: "service", value: "https://bsky.social" },
          { key: "identifier", value: "user.bsky.social" },
          { key: "password", value: "app-password" },
        ],
        valid: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      });
    });

    it("should create Bluesky provider with default values for empty params", () => {
      const mockData = {
        type: "bluesky",
        valid: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "bluesky-456",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toEqual({
        id: "bluesky-456",
        type: "bluesky",
        name: "",
        params: [
          { key: "service", value: "" },
          { key: "identifier", value: "" },
          { key: "password", value: "" },
        ],
        valid: true,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should create Twitter provider from valid document", () => {
      const mockData = {
        type: "twitter",
        name: "Twitter Provider",
        params: [
          { key: "redirect_uri", value: "https://example.com/callback" },
          { key: "client_id", value: "client123" },
          { key: "client_secret", value: "secret123" },
          { key: "code_verifier", value: "verifier123" },
          { key: "code", value: "auth-code" },
          { key: "access_token", value: "token123" },
          { key: "refresh_token", value: "refresh123" },
          { key: "expires_in", value: 3600 },
        ],
        valid: true,
        createdAt: { toDate: () => new Date("2024-01-01") },
        updatedAt: { toDate: () => new Date("2024-01-02") },
      };

      const mockDoc = {
        exists: () => true,
        id: "twitter-123",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toEqual({
        id: "twitter-123",
        type: "twitter",
        name: "Twitter Provider",
        params: [
          { key: "redirect_uri", value: "https://example.com/callback" },
          { key: "client_id", value: "client123" },
          { key: "client_secret", value: "secret123" },
          { key: "code_verifier", value: "verifier123" },
          { key: "code", value: "auth-code" },
          { key: "access_token", value: "token123" },
          { key: "refresh_token", value: "refresh123" },
          { key: "expires_in", value: 3600 },
        ],
        valid: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      });
    });

    it("should create Twitter provider with default values for empty params", () => {
      const mockData = {
        type: "twitter",
        valid: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "twitter-789",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toEqual({
        id: "twitter-789",
        type: "twitter",
        name: "",
        params: [
          { key: "redirect_uri", value: "" },
          { key: "client_id", value: "" },
          { key: "client_secret", value: "" },
          { key: "code_verifier", value: "" },
          { key: "code", value: "" },
          { key: "access_token", value: "" },
          { key: "refresh_token", value: "" },
          { key: "expires_in", value: 0 },
        ],
        valid: true,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should create Mastodon provider with default values for missing fields", () => {
      const mockDoc = {
        exists: () => true,
        id: "mastodon-456",
        data: () => ({ type: "mastodon" }),
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toEqual({
        id: "mastodon-456",
        type: "mastodon",
        name: "",
        params: [
          { key: "token", value: "" },
          { key: "url", value: "" },
        ],
        valid: false,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should create WordPress provider from valid document", () => {
      const mockData = {
        type: "wordpress",
        name: "WordPress Provider",
        params: [
          { key: "service", value: "https://example.wordpress.com" },
          { key: "identifier", value: "username" },
          { key: "password", value: "app-password" },
          { key: "category", value: "tech" },
        ],
        valid: true,
        createdAt: { toDate: () => new Date("2024-01-01") },
        updatedAt: { toDate: () => new Date("2024-01-02") },
      };

      const mockDoc = {
        exists: () => true,
        id: "wordpress-123",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toEqual({
        id: "wordpress-123",
        type: "wordpress",
        name: "WordPress Provider",
        params: [
          { key: "service", value: "https://example.wordpress.com" },
          { key: "identifier", value: "username" },
          { key: "password", value: "app-password" },
          { key: "category", value: "tech" },
        ],
        valid: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      });
    });

    it("should create WordPress provider with default values for empty params", () => {
      const mockData = {
        type: "wordpress",
        valid: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "wordpress-456",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toEqual({
        id: "wordpress-456",
        type: "wordpress",
        name: "",
        params: [
          { key: "service", value: "" },
          { key: "identifier", value: "" },
          { key: "password", value: "" },
          { key: "category", value: "" },
        ],
        valid: true,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should create Misskey provider from valid document", () => {
      const mockData = {
        type: "misskey",
        name: "Misskey Provider",
        params: [
          { key: "token", value: "misskey-token-123" },
          { key: "url", value: "https://misskey.io" },
        ],
        valid: true,
        createdAt: { toDate: () => new Date("2024-01-01") },
        updatedAt: { toDate: () => new Date("2024-01-02") },
      };

      const mockDoc = {
        exists: () => true,
        id: "misskey-123",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toEqual({
        id: "misskey-123",
        type: "misskey",
        name: "Misskey Provider",
        params: [
          { key: "token", value: "misskey-token-123" },
          { key: "url", value: "https://misskey.io" },
        ],
        valid: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      });
    });

    it("should create Misskey provider with default values for empty params", () => {
      const mockData = {
        type: "misskey",
        valid: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "misskey-456",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toEqual({
        id: "misskey-456",
        type: "misskey",
        name: "",
        params: [
          { key: "token", value: "" },
          { key: "url", value: "" },
        ],
        valid: true,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should create Threads provider from valid document", () => {
      const mockData = {
        type: "threads",
        name: "Threads Provider",
        params: [
          { key: "redirect_uri", value: "https://example.com/callback" },
          { key: "client_id", value: "threads-client-123" },
          { key: "client_secret", value: "threads-secret-123" },
          { key: "code", value: "threads-code" },
          { key: "access_token", value: "threads-token" },
          { key: "user_id", value: "threads-user" },
          { key: "expires_in", value: 7200 },
        ],
        valid: true,
        createdAt: { toDate: () => new Date("2024-01-01") },
        updatedAt: { toDate: () => new Date("2024-01-02") },
      };

      const mockDoc = {
        exists: () => true,
        id: "threads-123",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toEqual({
        id: "threads-123",
        type: "threads",
        name: "Threads Provider",
        params: [
          { key: "redirect_uri", value: "https://example.com/callback" },
          { key: "client_id", value: "threads-client-123" },
          { key: "client_secret", value: "threads-secret-123" },
          { key: "code", value: "threads-code" },
          { key: "access_token", value: "threads-token" },
          { key: "user_id", value: "threads-user" },
          { key: "expires_in", value: 7200 },
        ],
        valid: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      });
    });

    it("should create Threads provider with default values for empty params", () => {
      const mockData = {
        type: "threads",
        valid: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "threads-789",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toEqual({
        id: "threads-789",
        type: "threads",
        name: "",
        params: [
          { key: "redirect_uri", value: "" },
          { key: "client_id", value: "" },
          { key: "client_secret", value: "" },
          { key: "code", value: "" },
          { key: "access_token", value: "" },
          { key: "user_id", value: "" },
          { key: "expires_in", value: 0 },
        ],
        valid: true,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should create Instagram provider from valid document", () => {
      const mockData = {
        type: "instagram",
        name: "Instagram Provider",
        params: [
          { key: "client_id", value: "instagram-client-123" },
          { key: "access_token", value: "instagram-token-123" },
          { key: "expires_in", value: 5184000 },
        ],
        valid: true,
        createdAt: { toDate: () => new Date("2024-01-01") },
        updatedAt: { toDate: () => new Date("2024-01-02") },
      };

      const mockDoc = {
        exists: () => true,
        id: "instagram-123",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toEqual({
        id: "instagram-123",
        type: "instagram",
        name: "Instagram Provider",
        params: [
          { key: "client_id", value: "instagram-client-123" },
          { key: "access_token", value: "instagram-token-123" },
          { key: "expires_in", value: 5184000 },
        ],
        valid: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      });
    });

    it("should create Instagram provider with default values for empty params", () => {
      const mockData = {
        type: "instagram",
        valid: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "instagram-789",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toEqual({
        id: "instagram-789",
        type: "instagram",
        name: "",
        params: [
          { key: "client_id", value: "" },
          { key: "access_token", value: "" },
          { key: "expires_in", value: 0 },
        ],
        valid: true,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should create Tumblr provider from valid document", () => {
      const mockData = {
        type: "tumblr",
        name: "Tumblr Provider",
        params: [
          { key: "redirect_uri", value: "https://example.com/callback" },
          { key: "client_id", value: "tumblr-client-123" },
          { key: "client_secret", value: "tumblr-secret-123" },
          { key: "code", value: "tumblr-code" },
          { key: "access_token", value: "tumblr-token" },
          { key: "refresh_token", value: "tumblr-refresh" },
          { key: "expires_in", value: 3600 },
        ],
        valid: true,
        createdAt: { toDate: () => new Date("2024-01-01") },
        updatedAt: { toDate: () => new Date("2024-01-02") },
      };

      const mockDoc = {
        exists: () => true,
        id: "tumblr-123",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toEqual({
        id: "tumblr-123",
        type: "tumblr",
        name: "Tumblr Provider",
        params: [
          { key: "redirect_uri", value: "https://example.com/callback" },
          { key: "client_id", value: "tumblr-client-123" },
          { key: "client_secret", value: "tumblr-secret-123" },
          { key: "code", value: "tumblr-code" },
          { key: "access_token", value: "tumblr-token" },
          { key: "refresh_token", value: "tumblr-refresh" },
          { key: "expires_in", value: 3600 },
        ],
        valid: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      });
    });

    it("should create Tumblr provider with default values for empty params", () => {
      const mockData = {
        type: "tumblr",
        valid: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "tumblr-789",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toEqual({
        id: "tumblr-789",
        type: "tumblr",
        name: "",
        params: [
          { key: "redirect_uri", value: "" },
          { key: "client_id", value: "" },
          { key: "client_secret", value: "" },
          { key: "code", value: "" },
          { key: "access_token", value: "" },
          { key: "refresh_token", value: "" },
          { key: "expires_in", value: 0 },
        ],
        valid: true,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should create Twitter provider with default values for optional OAuth fields", () => {
      const mockData = {
        type: "twitter",
        name: "Twitter Provider",
        params: [
          { key: "redirect_uri", value: "https://example.com/callback" },
          { key: "client_id", value: "client123" },
          { key: "client_secret", value: "secret123" },
          { key: "code_verifier", value: "verifier123" },
        ],
        valid: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "twitter-456",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toEqual({
        id: "twitter-456",
        type: "twitter",
        name: "Twitter Provider",
        params: [
          { key: "redirect_uri", value: "https://example.com/callback" },
          { key: "client_id", value: "client123" },
          { key: "client_secret", value: "secret123" },
          { key: "code_verifier", value: "verifier123" },
          { key: "code", value: "" },
          { key: "access_token", value: "" },
          { key: "refresh_token", value: "" },
          { key: "expires_in", value: 0 },
        ],
        valid: true,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should create Threads provider with default values for optional OAuth fields", () => {
      const mockData = {
        type: "threads",
        name: "Threads Provider",
        params: [
          { key: "redirect_uri", value: "https://example.com/callback" },
          { key: "client_id", value: "threads-client-123" },
          { key: "client_secret", value: "threads-secret-123" },
        ],
        valid: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "threads-456",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toEqual({
        id: "threads-456",
        type: "threads",
        name: "Threads Provider",
        params: [
          { key: "redirect_uri", value: "https://example.com/callback" },
          { key: "client_id", value: "threads-client-123" },
          { key: "client_secret", value: "threads-secret-123" },
          { key: "code", value: "" },
          { key: "access_token", value: "" },
          { key: "user_id", value: "" },
          { key: "expires_in", value: 0 },
        ],
        valid: true,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should create Instagram provider with default values for optional OAuth fields", () => {
      const mockData = {
        type: "instagram",
        name: "Instagram Provider",
        params: [
          { key: "client_id", value: "instagram-client-123" },
          { key: "access_token", value: "instagram-token-123" },
        ],
        valid: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "instagram-456",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toEqual({
        id: "instagram-456",
        type: "instagram",
        name: "Instagram Provider",
        params: [
          { key: "client_id", value: "instagram-client-123" },
          { key: "access_token", value: "instagram-token-123" },
          { key: "expires_in", value: 0 },
        ],
        valid: true,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should create Tumblr provider with default values for optional OAuth fields", () => {
      const mockData = {
        type: "tumblr",
        name: "Tumblr Provider",
        params: [
          { key: "redirect_uri", value: "https://example.com/callback" },
          { key: "client_id", value: "tumblr-client-123" },
          { key: "client_secret", value: "tumblr-secret-123" },
        ],
        valid: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "tumblr-456",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toEqual({
        id: "tumblr-456",
        type: "tumblr",
        name: "Tumblr Provider",
        params: [
          { key: "redirect_uri", value: "https://example.com/callback" },
          { key: "client_id", value: "tumblr-client-123" },
          { key: "client_secret", value: "tumblr-secret-123" },
          { key: "code", value: "" },
          { key: "access_token", value: "" },
          { key: "refresh_token", value: "" },
          { key: "expires_in", value: 0 },
        ],
        valid: true,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should convert existing number params to number type", () => {
      const mockData = {
        type: "twitter",
        name: "Twitter Provider",
        params: [
          { key: "redirect_uri", value: "https://example.com" },
          { key: "client_id", value: "client123" },
          { key: "client_secret", value: "secret123" },
          { key: "code_verifier", value: "verifier123" },
          { key: "code", value: "code123" },
          { key: "access_token", value: "token123" },
          { key: "refresh_token", value: "refresh123" },
          { key: "expires_in", value: "3600" }, // String that should be converted to number
        ],
        valid: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "twitter-convert",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toEqual({
        id: "twitter-convert",
        type: "twitter",
        name: "Twitter Provider",
        params: [
          { key: "redirect_uri", value: "https://example.com" },
          { key: "client_id", value: "client123" },
          { key: "client_secret", value: "secret123" },
          { key: "code_verifier", value: "verifier123" },
          { key: "code", value: "code123" },
          { key: "access_token", value: "token123" },
          { key: "refresh_token", value: "refresh123" },
          { key: "expires_in", value: 3600 }, // Converted to number
        ],
        valid: true,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should convert existing string params to string type", () => {
      const mockData = {
        type: "mastodon",
        name: "Mastodon Provider",
        params: [
          { key: "token", value: 12345 }, // Number that should be converted to string
          { key: "url", value: "https://mastodon.social" },
        ],
        valid: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "mastodon-convert",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toEqual({
        id: "mastodon-convert",
        type: "mastodon",
        name: "Mastodon Provider",
        params: [
          { key: "token", value: "12345" }, // Converted to string
          { key: "url", value: "https://mastodon.social" },
        ],
        valid: true,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should handle null and undefined values in existing params", () => {
      const mockData = {
        type: "twitter",
        name: "Twitter Provider",
        params: [
          { key: "redirect_uri", value: null }, // null value
          { key: "client_id", value: undefined }, // undefined value
          { key: "client_secret", value: "" }, // empty string
          { key: "code_verifier", value: "verifier123" },
          { key: "code", value: "code123" },
          { key: "access_token", value: "token123" },
          { key: "refresh_token", value: "refresh123" },
          { key: "expires_in", value: null }, // null number should become 0
        ],
        valid: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "twitter-null-values",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = providerFromDoc(mockDoc);
      expect(result).toEqual({
        id: "twitter-null-values",
        type: "twitter",
        name: "Twitter Provider",
        params: [
          { key: "redirect_uri", value: "" }, // null converted to empty string
          { key: "client_id", value: "" }, // undefined converted to empty string
          { key: "client_secret", value: "" }, // empty string preserved
          { key: "code_verifier", value: "verifier123" },
          { key: "code", value: "code123" },
          { key: "access_token", value: "token123" },
          { key: "refresh_token", value: "refresh123" },
          { key: "expires_in", value: 0 }, // null converted to 0
        ],
        valid: true,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });
  });
});
