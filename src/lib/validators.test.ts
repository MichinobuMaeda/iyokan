import { describe, it, expect } from "vitest";
import * as E from "fp-ts/Either";
import {
  isEmptyOrWhitespace,
  validateRequiredString,
  validateOptionalEmail,
  validateRequiredEmail,
  validateOptionalUrl,
  validateRequiredUrl,
  validatePassword,
  validateOid,
  validateSomePostText,
  validateSomePostProvider,
  timesTextToPresetTimes,
  validateTimesText,
} from "./validators";
import type { PostData } from "../types/Post";

describe("validators", () => {
  describe("isEmptyOrWhitespace", () => {
    describe("returns true", () => {
      it("should return true for undefined", () => {
        expect(isEmptyOrWhitespace(undefined)).toBe(true);
      });

      it("should return true for empty string", () => {
        expect(isEmptyOrWhitespace("")).toBe(true);
      });

      it("should return true for whitespace only", () => {
        expect(isEmptyOrWhitespace("   ")).toBe(true);
      });

      it("should return true for tabs and newlines", () => {
        expect(isEmptyOrWhitespace("\t\n")).toBe(true);
      });
    });

    describe("returns false", () => {
      it("should return false for non-empty string", () => {
        expect(isEmptyOrWhitespace("test")).toBe(false);
      });

      it("should return false for string with content and whitespace", () => {
        expect(isEmptyOrWhitespace("  hello  ")).toBe(false);
      });
    });
  });

  describe("validateRequiredString", () => {
    describe("valid inputs", () => {
      it("should return right for non-empty string", () => {
        const result = validateRequiredString("test");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("test");
        }
      });

      it("should return right for string with content", () => {
        const result = validateRequiredString("hello world");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("hello world");
        }
      });
    });

    describe("invalid inputs", () => {
      it("should return left with required for undefined", () => {
        const result = validateRequiredString(undefined);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("required");
        }
      });

      it("should return left with required for empty string", () => {
        const result = validateRequiredString("");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("required");
        }
      });

      it("should return left with required for whitespace only", () => {
        const result = validateRequiredString("   ");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("required");
        }
      });

      it("should return left with required for tabs and newlines", () => {
        const result = validateRequiredString("\t\n");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("required");
        }
      });
    });
  });

  describe("validateOptionalEmail", () => {
    describe("valid inputs", () => {
      it("should return right for valid email", () => {
        const result = validateOptionalEmail("test@example.com");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("test@example.com");
        }
      });

      it("should return right for empty string (optional)", () => {
        const result = validateOptionalEmail("");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("");
        }
      });

      it("should return right for whitespace only (optional)", () => {
        const result = validateOptionalEmail("   ");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("   ");
        }
      });

      it("should return right for undefined (optional)", () => {
        const result = validateOptionalEmail(undefined);
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe(undefined);
        }
      });
    });

    describe("invalid inputs - format", () => {
      it("should return left with errorInvalidEmail for invalid format", () => {
        const result = validateOptionalEmail("invalid-email");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorInvalidEmail");
        }
      });

      it("should return left with errorInvalidEmail for missing @", () => {
        const result = validateOptionalEmail("test.example.com");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorInvalidEmail");
        }
      });

      it("should return left with errorInvalidEmail for missing domain", () => {
        const result = validateOptionalEmail("test@");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorInvalidEmail");
        }
      });
    });
  });
  describe("validateRequiredEmail", () => {
    describe("valid inputs", () => {
      it("should return right for valid email", () => {
        const result = validateRequiredEmail("test@example.com");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("test@example.com");
        }
      });
    });

    describe("invalid inputs - empty", () => {
      it("should return left with errorEmailRequired for undefined", () => {
        const result = validateRequiredEmail(undefined);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorEmailRequired");
        }
      });

      it("should return left with errorEmailRequired for empty string", () => {
        const result = validateRequiredEmail("");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorEmailRequired");
        }
      });

      it("should return left with errorEmailRequired for whitespace only", () => {
        const result = validateRequiredEmail("   ");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorEmailRequired");
        }
      });
    });

    describe("invalid inputs - format", () => {
      it("should return left with errorInvalidEmail for invalid format", () => {
        const result = validateRequiredEmail("invalid-email");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorInvalidEmail");
        }
      });

      it("should return left with errorInvalidEmail for missing @", () => {
        const result = validateRequiredEmail("test.example.com");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorInvalidEmail");
        }
      });

      it("should return left with errorInvalidEmail for missing domain", () => {
        const result = validateRequiredEmail("test@");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorInvalidEmail");
        }
      });
    });
  });

  describe("validateOptionalUrl", () => {
    describe("valid inputs", () => {
      it("should return right for valid http URL", () => {
        const result = validateOptionalUrl("http://example.com");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("http://example.com");
        }
      });

      it("should return right for valid https URL", () => {
        const result = validateOptionalUrl("https://example.com");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("https://example.com");
        }
      });

      it("should return right for URL without protocol", () => {
        const result = validateOptionalUrl("example.com");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("example.com");
        }
      });

      it("should return right for URL with subdomain", () => {
        const result = validateOptionalUrl("https://www.example.com");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("https://www.example.com");
        }
      });

      it("should return right for URL with port", () => {
        const result = validateOptionalUrl("http://example.com:8080");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("http://example.com:8080");
        }
      });

      it("should return right for URL with path", () => {
        const result = validateOptionalUrl("https://example.com/path/to/page");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("https://example.com/path/to/page");
        }
      });

      it("should return right for empty string (optional)", () => {
        const result = validateOptionalUrl("");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("");
        }
      });

      it("should return right for whitespace only (optional)", () => {
        const result = validateOptionalUrl("   ");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("   ");
        }
      });

      it("should return right for undefined (optional)", () => {
        const result = validateOptionalUrl(undefined);
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe(undefined);
        }
      });
    });

    describe("invalid inputs - format", () => {
      it("should return left with errorInvalidUrl for invalid format", () => {
        const result = validateOptionalUrl("not-a-url");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorInvalidUrl");
        }
      });

      it("should return left with errorInvalidUrl for missing domain", () => {
        const result = validateOptionalUrl("http://");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorInvalidUrl");
        }
      });

      it("should return left with errorInvalidUrl for spaces", () => {
        const result = validateOptionalUrl("http://exam ple.com");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorInvalidUrl");
        }
      });
    });
  });

  describe("validateRequiredUrl", () => {
    describe("valid inputs", () => {
      it("should return right for valid http URL", () => {
        const result = validateRequiredUrl("http://example.com");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("http://example.com");
        }
      });

      it("should return right for valid https URL", () => {
        const result = validateRequiredUrl("https://example.com");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("https://example.com");
        }
      });

      it("should return right for URL with path", () => {
        const result = validateRequiredUrl("https://example.com/api/v1");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("https://example.com/api/v1");
        }
      });
    });

    describe("invalid inputs - empty", () => {
      it("should return left with errorUrlRequired for empty string", () => {
        const result = validateRequiredUrl("");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorUrlRequired");
        }
      });

      it("should return left with errorUrlRequired for whitespace only", () => {
        const result = validateRequiredUrl("   ");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorUrlRequired");
        }
      });

      it("should return left with errorUrlRequired for undefined", () => {
        const result = validateRequiredUrl(undefined);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorUrlRequired");
        }
      });
    });

    describe("invalid inputs - format", () => {
      it("should return left with errorInvalidUrl for invalid format", () => {
        const result = validateRequiredUrl("not-a-url");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorInvalidUrl");
        }
      });

      it("should return left with errorInvalidUrl for missing domain", () => {
        const result = validateRequiredUrl("http://");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorInvalidUrl");
        }
      });
    });
  });

  describe("validatePassword", () => {
    describe("valid inputs", () => {
      it("should return right for valid password", () => {
        const result = validatePassword("Abc123!@#xyz");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("Abc123!@#xyz");
        }
      });

      it("should accept various symbols", () => {
        const symbols = [
          "!",
          "@",
          "#",
          "$",
          "%",
          "^",
          "&",
          "*",
          "(",
          ")",
          "-",
          "_",
          "=",
          "+",
        ];
        symbols.forEach((symbol) => {
          const result = validatePassword(`Abc123${symbol}xyz`);
          expect(E.isRight(result)).toBe(true);
        });
      });
    });

    describe("invalid inputs - empty", () => {
      it("should return left with errorPasswordRequired for empty password", () => {
        const result = validatePassword("");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorPasswordRequired");
        }
      });
    });

    describe("invalid inputs - length", () => {
      it("should return left with errorPasswordMin10 for short password", () => {
        const result = validatePassword("Abc123!@");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorPasswordMin10");
        }
      });
    });

    describe("invalid inputs - missing characters", () => {
      it("should return left with errorPasswordUppercase for missing uppercase", () => {
        const result = validatePassword("abc123!@#xyz");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorPasswordUppercase");
        }
      });

      it("should return left with errorPasswordLowercase for missing lowercase", () => {
        const result = validatePassword("ABC123!@#XYZ");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorPasswordLowercase");
        }
      });

      it("should return left with errorPasswordNumber for missing number", () => {
        const result = validatePassword("Abcdef!@#xyz");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorPasswordNumber");
        }
      });

      it("should return left with errorPasswordSymbol for missing symbol", () => {
        const result = validatePassword("Abc123456xyz");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorPasswordSymbol");
        }
      });
    });
  });

  describe("validateOid", () => {
    describe("valid inputs", () => {
      it("should return right for valid oid with lowercase letters", () => {
        const result = validateOid("myorg", []);
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("myorg");
        }
      });

      it("should return right for valid oid with numbers", () => {
        const result = validateOid("org123", []);
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("org123");
        }
      });

      it("should return right for valid oid with only numbers", () => {
        const result = validateOid("123456", []);
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("123456");
        }
      });

      it("should return right for valid oid with mixed lowercase and numbers", () => {
        const result = validateOid("abc123def456", []);
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("abc123def456");
        }
      });
    });

    describe("invalid inputs - empty", () => {
      it("should return left with required for empty string", () => {
        const result = validateOid("", []);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("required");
        }
      });

      it("should return left with required for whitespace only", () => {
        const result = validateOid("   ", []);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("required");
        }
      });
    });

    describe("invalid inputs - format", () => {
      it("should return left with errorOidInvalidFormat for uppercase letters", () => {
        const result = validateOid("MyOrg", []);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOidInvalidFormat");
        }
      });

      it("should return left with errorOidInvalidFormat for hyphens", () => {
        const result = validateOid("my-org", []);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOidInvalidFormat");
        }
      });

      it("should return left with errorOidInvalidFormat for underscores", () => {
        const result = validateOid("my_org", []);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOidInvalidFormat");
        }
      });

      it("should return left with errorOidInvalidFormat for spaces", () => {
        const result = validateOid("my org", []);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOidInvalidFormat");
        }
      });

      it("should return left with errorOidInvalidFormat for special characters", () => {
        const result = validateOid("my@org", []);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOidInvalidFormat");
        }
      });

      it("should return left with errorOidInvalidFormat for dots", () => {
        const result = validateOid("my.org", []);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOidInvalidFormat");
        }
      });
    });

    describe("invalid inputs - reserved", () => {
      it("should return left with errorOidReserved for 'id'", () => {
        const result = validateOid("id", []);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOidReserved");
        }
      });

      it("should return left with errorOidReserved for 'oid'", () => {
        const result = validateOid("oid", []);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOidReserved");
        }
      });

      it("should return left with errorOidReserved for 'admin'", () => {
        const result = validateOid("admin", []);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOidReserved");
        }
      });

      it("should return left with errorOidReserved for 'admins'", () => {
        const result = validateOid("admins", []);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOidReserved");
        }
      });
    });

    describe("invalid inputs - registered", () => {
      it("should return left with errorOidUsed for existing org id", () => {
        const existingOrgs = [
          { id: "existingorg" },
          { id: "anotherorg" },
        ] as never[];
        const result = validateOid("existingorg", existingOrgs);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOidUsed");
        }
      });
    });
  });

  describe("validateSomePostText", () => {
    const baseData: PostData = {
      schedule: new Date(),
      title: "",
      message: "",
      link: "",
      files: [],
      providers: [],
      status: "scheduled",
      template: null,
      generator: null,
      createdBy: null,
      updatedBy: null,
    };

    describe("valid inputs", () => {
      it("should return right when title has content", () => {
        const result = validateSomePostText({ ...baseData, title: "Title" });
        expect(E.isRight(result)).toBe(true);
      });

      it("should return right when message has content", () => {
        const result = validateSomePostText({
          ...baseData,
          message: "Message content",
        });
        expect(E.isRight(result)).toBe(true);
      });

      it("should return right when link has content", () => {
        const result = validateSomePostText({
          ...baseData,
          link: "https://example.com",
        });
        expect(E.isRight(result)).toBe(true);
      });

      it("should return right when all fields have content", () => {
        const result = validateSomePostText({
          ...baseData,
          title: "Title",
          message: "Message",
          link: "https://example.com",
        });
        expect(E.isRight(result)).toBe(true);
      });

      it("should return right when title and message have content", () => {
        const result = validateSomePostText({
          ...baseData,
          title: "Title",
          message: "Message",
        });
        expect(E.isRight(result)).toBe(true);
      });

      it("should return right when title is whitespace but message has content", () => {
        const result = validateSomePostText({
          ...baseData,
          title: "   ",
          message: "Message",
        });
        expect(E.isRight(result)).toBe(true);
      });

      it("should return right when title has whitespace-surrounded content", () => {
        const result = validateSomePostText({
          ...baseData,
          title: "  Title  ",
        });
        expect(E.isRight(result)).toBe(true);
      });
    });

    describe("invalid inputs", () => {
      it("should return left with errorEmptyText when all fields are empty strings", () => {
        const result = validateSomePostText(baseData);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorEmptyText");
        }
      });

      it("should return left with errorEmptyText when all fields are undefined", () => {
        const result = validateSomePostText({
          ...baseData,
          title: undefined as unknown as string,
          message: undefined as unknown as string,
          link: undefined as unknown as string,
        });
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorEmptyText");
        }
      });

      it("should return left with errorEmptyText when all fields are whitespace", () => {
        const result = validateSomePostText({
          ...baseData,
          title: "   ",
          message: "\t\n",
          link: "  ",
        });
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorEmptyText");
        }
      });

      it("should return left with errorEmptyText when fields are mixed empty and undefined", () => {
        const result = validateSomePostText({
          ...baseData,
          title: "",
          message: undefined as unknown as string,
          link: "   ",
        });
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorEmptyText");
        }
      });
    });
  });

  describe("validateSomePostProvider", () => {
    const baseData: PostData = {
      schedule: new Date(),
      title: "Test",
      message: "Message",
      link: "https://example.com",
      files: [],
      providers: [],
      status: "scheduled",
      template: null,
      generator: null,
      createdBy: null,
      updatedBy: null,
    };

    describe("valid inputs", () => {
      it("should return right when one provider is selected", () => {
        const result = validateSomePostProvider({
          ...baseData,
          providers: ["twitter"],
        });
        expect(E.isRight(result)).toBe(true);
      });

      it("should return right when multiple providers are selected", () => {
        const result = validateSomePostProvider({
          ...baseData,
          providers: ["twitter", "facebook", "bluesky"],
        });
        expect(E.isRight(result)).toBe(true);
      });
    });

    describe("invalid inputs", () => {
      it("should return left with errorAtLeastOneProvider when providers is empty array", () => {
        const result = validateSomePostProvider({
          ...baseData,
          providers: [],
        });
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorAtLeastOneProvider");
        }
      });

      it("should return left with errorAtLeastOneProvider when providers is undefined", () => {
        const result = validateSomePostProvider({
          ...baseData,
          providers: undefined as unknown as string[],
        });
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorAtLeastOneProvider");
        }
      });

      it("should return left with errorAtLeastOneProvider when providers is null", () => {
        const result = validateSomePostProvider({
          ...baseData,
          providers: null as unknown as string[],
        });
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorAtLeastOneProvider");
        }
      });
    });
  });

  describe("timesTextToPresetTimes", () => {
    it("should return empty array for empty string", () => {
      const result = timesTextToPresetTimes("");
      expect(result).toEqual([]);
    });

    it("should parse single time", () => {
      const result = timesTextToPresetTimes("09:00");
      expect(result).toEqual(["09:00"]);
    });

    it("should parse multiple times", () => {
      const result = timesTextToPresetTimes("09:00\n14:30\n18:45");
      expect(result).toEqual(["09:00", "14:30", "18:45"]);
    });

    it("should pad single digit hours", () => {
      const result = timesTextToPresetTimes("9:00");
      expect(result).toEqual(["09:00"]);
    });

    it("should pad multiple single digit hours", () => {
      const result = timesTextToPresetTimes("9:00\n8:15\n7:30");
      expect(result).toEqual(["07:30", "08:15", "09:00"]);
    });

    it("should sort times", () => {
      const result = timesTextToPresetTimes("14:30\n09:00\n18:45");
      expect(result).toEqual(["09:00", "14:30", "18:45"]);
    });

    it("should filter empty lines", () => {
      const result = timesTextToPresetTimes("09:00\n\n14:30\n\n\n18:45");
      expect(result).toEqual(["09:00", "14:30", "18:45"]);
    });

    it("should remove non-time characters", () => {
      const result = timesTextToPresetTimes("09:00 morning\n14:30 afternoon");
      expect(result).toEqual(["09:00", "14:30"]);
    });

    it("should handle whitespace-only lines", () => {
      const result = timesTextToPresetTimes("09:00\n   \n14:30");
      expect(result).toEqual(["09:00", "14:30"]);
    });

    it("should handle times with various formats and normalize them", () => {
      const result = timesTextToPresetTimes("9:00\n09:30\n8:15");
      expect(result).toEqual(["08:15", "09:00", "09:30"]);
    });
  });

  describe("validateTimesText", () => {
    describe("valid inputs", () => {
      it("should return right for empty string", () => {
        const result = validateTimesText("");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe(undefined);
        }
      });

      it("should return right for valid single time", () => {
        const result = validateTimesText("09:00");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe(undefined);
        }
      });

      it("should return right for valid multiple times", () => {
        const text = "09:00\n14:30\n18:45";
        const result = validateTimesText(text);
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe(undefined);
        }
      });

      it("should return right for times with single digit hours that get padded", () => {
        const text = "9:00\n8:15";
        const result = validateTimesText(text);
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe(undefined);
        }
      });

      it("should return right for valid times with empty lines", () => {
        const text = "09:00\n\n14:30";
        const result = validateTimesText(text);
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe(undefined);
        }
      });

      it("should return right for all valid hour ranges", () => {
        const text = "00:00\n12:00\n23:59";
        const result = validateTimesText(text);
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe(undefined);
        }
      });
    });

    describe("invalid inputs", () => {
      it("should return left for invalid hour (24:00)", () => {
        const result = validateTimesText("24:00");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorInvalidTimeFormat");
        }
      });

      it("should return left for invalid minutes (09:60)", () => {
        const result = validateTimesText("09:60");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorInvalidTimeFormat");
        }
      });

      it("should return left for invalid format (9:0)", () => {
        const result = validateTimesText("9:0");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorInvalidTimeFormat");
        }
      });

      it("should return left for invalid format (no colon)", () => {
        const result = validateTimesText("0900");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorInvalidTimeFormat");
        }
      });

      it("should return left for text without time", () => {
        const result = validateTimesText("not a time");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorInvalidTimeFormat");
        }
      });

      it("should return left when one of multiple times is invalid", () => {
        const result = validateTimesText("09:00\n25:00\n14:30");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorInvalidTimeFormat");
        }
      });

      it("should return right for valid time with extra characters stripped", () => {
        const result = validateTimesText("09:00am");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe(undefined);
        }
      });
    });
  });
});
