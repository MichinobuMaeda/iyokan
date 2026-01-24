import { describe, it, expect } from "vitest";
import * as E from "fp-ts/Either";
import {
  validateRequiredString,
  validateOptionalEmail,
  validateRequiredEmail,
  validatePassword,
  validateOid,
} from "./validators";

describe("validators", () => {
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
        const result = validateOid("myorg");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("myorg");
        }
      });

      it("should return right for valid oid with numbers", () => {
        const result = validateOid("org123");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("org123");
        }
      });

      it("should return right for valid oid with only numbers", () => {
        const result = validateOid("123456");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("123456");
        }
      });

      it("should return right for valid oid with mixed lowercase and numbers", () => {
        const result = validateOid("abc123def456");
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
          expect(result.right).toBe("abc123def456");
        }
      });
    });

    describe("invalid inputs - empty", () => {
      it("should return left with errorOidRequired for empty string", () => {
        const result = validateOid("");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOidRequired");
        }
      });

      it("should return left with errorOidRequired for whitespace only", () => {
        const result = validateOid("   ");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOidRequired");
        }
      });
    });

    describe("invalid inputs - format", () => {
      it("should return left with errorOidInvalidFormat for uppercase letters", () => {
        const result = validateOid("MyOrg");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOidInvalidFormat");
        }
      });

      it("should return left with errorOidInvalidFormat for hyphens", () => {
        const result = validateOid("my-org");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOidInvalidFormat");
        }
      });

      it("should return left with errorOidInvalidFormat for underscores", () => {
        const result = validateOid("my_org");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOidInvalidFormat");
        }
      });

      it("should return left with errorOidInvalidFormat for spaces", () => {
        const result = validateOid("my org");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOidInvalidFormat");
        }
      });

      it("should return left with errorOidInvalidFormat for special characters", () => {
        const result = validateOid("my@org");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOidInvalidFormat");
        }
      });

      it("should return left with errorOidInvalidFormat for dots", () => {
        const result = validateOid("my.org");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOidInvalidFormat");
        }
      });
    });

    describe("invalid inputs - reserved", () => {
      it("should return left with errorOrgIdReserved for 'id'", () => {
        const result = validateOid("id");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOrgIdReserved");
        }
      });

      it("should return left with errorOrgIdReserved for 'oid'", () => {
        const result = validateOid("oid");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOrgIdReserved");
        }
      });

      it("should return left with errorOrgIdReserved for 'admin'", () => {
        const result = validateOid("admin");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOrgIdReserved");
        }
      });

      it("should return left with errorOrgIdReserved for 'admins'", () => {
        const result = validateOid("admins");
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left).toBe("errorOrgIdReserved");
        }
      });
    });
  });
});
