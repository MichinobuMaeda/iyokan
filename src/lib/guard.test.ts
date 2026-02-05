import { describe, it, expect, vi, beforeEach } from "vitest";

import { OID_SYSADMIN } from "../../functions/src/common";
import type { UserState } from "../types/UserState";

// Mock store
const mockStore = {
  get: vi.fn(),
};

// Mock react-router
const mockNavigate = vi.fn();
const mockLocation = { pathname: "/" };
const mockRedirect = vi.fn((path: string) => ({ type: "redirect", path }));

vi.mock("react", () => ({
  useEffect: vi.fn((cb) => cb()),
}));

vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  redirect: mockRedirect,
}));

vi.mock("jotai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jotai")>();
  return {
    ...actual,
    getDefaultStore: vi.fn(() => mockStore),
    useAtom: vi.fn(() => [mockStore.get(), vi.fn()]),
  };
});

describe("guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  describe("guard function", () => {
    it("should allow root path without restriction", async () => {
      const { guard } = await import("./guard");

      const result = guard("/", null);

      expect(result).toBeUndefined();
    });

    it("should allow empty path without restriction", async () => {
      const { guard } = await import("./guard");

      const result = guard("", undefined);

      expect(result).toBeUndefined();
    });

    describe("/me paths", () => {
      it("should redirect to root when not authenticated", async () => {
        const { guard } = await import("./guard");

        const result = guard("/me", null);

        expect(result).toBe("/");
      });

      it("should allow /me when authenticated", async () => {
        const { guard } = await import("./guard");

        const dataState: UserState = {
          oid: "org1",
          uid: "user1",
          sys: false,
          manager: false,
          admin: false,
        };

        const result = guard("/me", dataState);

        expect(result).toBeUndefined();
      });

      it("should allow /me/change-email when authenticated", async () => {
        const { guard } = await import("./guard");

        const dataState: UserState = {
          oid: "org1",
          uid: "user1",
          sys: false,
          manager: false,
          admin: false,
        };

        const result = guard("/me/change-email", dataState);

        expect(result).toBeUndefined();
      });
    });

    describe("/login and /reset-password paths", () => {
      it("should redirect to org when already authenticated on /login", async () => {
        const { guard } = await import("./guard");

        const dataState: UserState = {
          oid: "org1",
          uid: "user1",
          sys: false,
          manager: false,
          admin: false,
        };

        const result = guard("/login", dataState);

        expect(result).toBe("/o/org1");
      });

      it("should redirect to org when already authenticated on /reset-password", async () => {
        const { guard } = await import("./guard");

        const dataState: UserState = {
          oid: "org1",
          uid: "user1",
          sys: false,
          manager: false,
          admin: false,
        };

        const result = guard("/reset-password", dataState);

        expect(result).toBe("/o/org1");
      });

      it("should allow /login when not authenticated", async () => {
        const { guard } = await import("./guard");

        const result = guard("/login", null);

        expect(result).toBeUndefined();
      });

      it("should allow /reset-password when not authenticated", async () => {
        const { guard } = await import("./guard");

        const result = guard("/reset-password", null);

        expect(result).toBeUndefined();
      });
    });

    describe("/conf paths", () => {
      it("should redirect to root when not sysadmin", async () => {
        const { guard } = await import("./guard");

        const dataState: UserState = {
          oid: "org1",
          uid: "user1",
          sys: false,
          manager: true,
          admin: true,
        };

        const result = guard("/conf", dataState);

        expect(result).toBe("/");
      });

      it("should redirect to root when not manager", async () => {
        const { guard } = await import("./guard");

        const dataState: UserState = {
          oid: OID_SYSADMIN,
          uid: "user1",
          sys: true,
          manager: false,
          admin: true,
        };

        const result = guard("/conf", dataState);

        expect(result).toBe("/");
      });

      it("should redirect to root when not admin", async () => {
        const { guard } = await import("./guard");

        const dataState: UserState = {
          oid: OID_SYSADMIN,
          uid: "user1",
          sys: true,
          manager: true,
          admin: false,
        };

        const result = guard("/conf", dataState);

        expect(result).toBe("/");
      });

      it("should allow /conf for sysadmin manager admin", async () => {
        const { guard } = await import("./guard");

        const dataState: UserState = {
          oid: OID_SYSADMIN,
          uid: "user1",
          sys: true,
          manager: true,
          admin: true,
        };

        const result = guard("/conf", dataState);

        expect(result).toBeUndefined();
      });

      it("should allow /conf/edit for sysadmin manager admin", async () => {
        const { guard } = await import("./guard");

        const dataState: UserState = {
          oid: OID_SYSADMIN,
          uid: "user1",
          sys: true,
          manager: true,
          admin: true,
        };

        const result = guard("/conf/edit", dataState);

        expect(result).toBeUndefined();
      });
    });

    describe("/o paths", () => {
      it("should redirect to root when not authenticated", async () => {
        const { guard } = await import("./guard");

        const result = guard("/o/org1", null);

        expect(result).toBe("/");
      });

      it("should allow /o/:oid for authenticated user", async () => {
        const { guard } = await import("./guard");

        const dataState: UserState = {
          oid: "org1",
          uid: "user1",
          sys: false,
          manager: false,
          admin: false,
        };

        const result = guard("/o/org1", dataState);

        expect(result).toBeUndefined();
      });

      describe("/o/new", () => {
        it("should redirect to user org when not sysadmin", async () => {
          const { guard } = await import("./guard");

          const dataState: UserState = {
            oid: "org1",
            uid: "user1",
            sys: false,
            manager: false,
            admin: false,
          };

          const result = guard("/o/new", dataState);

          expect(result).toBe("/o/org1");
        });

        it("should allow /o/new for sysadmin", async () => {
          const { guard } = await import("./guard");

          const dataState: UserState = {
            oid: OID_SYSADMIN,
            uid: "user1",
            sys: true,
            manager: false,
            admin: false,
          };

          const result = guard("/o/new", dataState);

          expect(result).toBeUndefined();
        });
      });

      describe("accessing other org", () => {
        it("should redirect to user org when accessing different org as non-sysadmin", async () => {
          const { guard } = await import("./guard");

          const dataState: UserState = {
            oid: "org1",
            uid: "user1",
            sys: false,
            manager: false,
            admin: false,
          };

          const result = guard("/o/org2", dataState);

          expect(result).toBe("/o/org1");
        });

        it("should allow accessing different org as sysadmin", async () => {
          const { guard } = await import("./guard");

          const dataState: UserState = {
            oid: OID_SYSADMIN,
            uid: "user1",
            sys: true,
            manager: false,
            admin: false,
          };

          const result = guard("/o/org2", dataState);

          expect(result).toBeUndefined();
        });
      });

      describe("/o/:oid/edit", () => {
        it("should redirect when not sys/manager/admin", async () => {
          const { guard } = await import("./guard");

          const dataState: UserState = {
            oid: "org1",
            uid: "user1",
            sys: false,
            manager: false,
            admin: false,
          };

          const result = guard("/o/org1/edit", dataState);

          expect(result).toBe("/o/org1");
        });

        it("should allow for manager", async () => {
          const { guard } = await import("./guard");

          const dataState: UserState = {
            oid: "org1",
            uid: "user1",
            sys: false,
            manager: true,
            admin: false,
          };

          const result = guard("/o/org1/edit", dataState);

          expect(result).toBeUndefined();
        });

        it("should allow for admin", async () => {
          const { guard } = await import("./guard");

          const dataState: UserState = {
            oid: "org1",
            uid: "user1",
            sys: false,
            manager: false,
            admin: true,
          };

          const result = guard("/o/org1/edit", dataState);

          expect(result).toBeUndefined();
        });

        it("should allow for sysadmin", async () => {
          const { guard } = await import("./guard");

          const dataState: UserState = {
            oid: "org1",
            uid: "user1",
            sys: true,
            manager: false,
            admin: false,
          };

          const result = guard("/o/org1/edit", dataState);

          expect(result).toBeUndefined();
        });
      });

      describe("/o/:oid/users", () => {
        it("should allow /o/:oid/users for all authenticated users", async () => {
          const { guard } = await import("./guard");

          const dataState: UserState = {
            oid: "org1",
            uid: "user1",
            sys: false,
            manager: false,
            admin: false,
          };

          const result = guard("/o/org1/users", dataState);

          expect(result).toBeUndefined();
        });

        describe("/o/:oid/users/new", () => {
          it("should redirect when not sys/manager", async () => {
            const { guard } = await import("./guard");

            const dataState: UserState = {
              oid: "org1",
              uid: "user1",
              sys: false,
              manager: false,
              admin: false,
            };

            const result = guard("/o/org1/users/new", dataState);

            expect(result).toBe("/o/org1/users");
          });

          it("should allow for manager", async () => {
            const { guard } = await import("./guard");

            const dataState: UserState = {
              oid: "org1",
              uid: "user1",
              sys: false,
              manager: true,
              admin: false,
            };

            const result = guard("/o/org1/users/new", dataState);

            expect(result).toBeUndefined();
          });

          it("should allow for sysadmin", async () => {
            const { guard } = await import("./guard");

            const dataState: UserState = {
              oid: "org1",
              uid: "user1",
              sys: true,
              manager: false,
              admin: false,
            };

            const result = guard("/o/org1/users/new", dataState);

            expect(result).toBeUndefined();
          });
        });

        describe("/o/:oid/users/:uid/edit", () => {
          it("should redirect when not sys/manager", async () => {
            const { guard } = await import("./guard");

            const dataState: UserState = {
              oid: "org1",
              uid: "user1",
              sys: false,
              manager: false,
              admin: false,
            };

            const result = guard("/o/org1/users/user2/edit", dataState);

            expect(result).toBe("/o/org1/users/user2");
          });

          it("should allow for manager", async () => {
            const { guard } = await import("./guard");

            const dataState: UserState = {
              oid: "org1",
              uid: "user1",
              sys: false,
              manager: true,
              admin: false,
            };

            const result = guard("/o/org1/users/user2/edit", dataState);

            expect(result).toBeUndefined();
          });

          it("should allow for sysadmin", async () => {
            const { guard } = await import("./guard");

            const dataState: UserState = {
              oid: "org1",
              uid: "user1",
              sys: true,
              manager: false,
              admin: false,
            };

            const result = guard("/o/org1/users/user2/edit", dataState);

            expect(result).toBeUndefined();
          });
        });
      });

      describe("/o/:oid/groups", () => {
        it("should allow /o/:oid/groups for all authenticated users", async () => {
          const { guard } = await import("./guard");

          const dataState: UserState = {
            oid: "org1",
            uid: "user1",
            sys: false,
            manager: false,
            admin: false,
          };

          const result = guard("/o/org1/groups", dataState);

          expect(result).toBeUndefined();
        });

        describe("/o/:oid/groups/new", () => {
          it("should redirect to org for all users", async () => {
            const { guard } = await import("./guard");

            const dataState: UserState = {
              oid: "org1",
              uid: "user1",
              sys: false,
              manager: false,
              admin: false,
            };

            const result = guard("/o/org1/groups/new", dataState);

            expect(result).toBe("/o/org1");
          });

          it("should redirect even for manager", async () => {
            const { guard } = await import("./guard");

            const dataState: UserState = {
              oid: "org1",
              uid: "user1",
              sys: false,
              manager: true,
              admin: false,
            };

            const result = guard("/o/org1/groups/new", dataState);

            expect(result).toBe("/o/org1");
          });

          it("should redirect even for sysadmin", async () => {
            const { guard } = await import("./guard");

            const dataState: UserState = {
              oid: "org1",
              uid: "user1",
              sys: true,
              manager: false,
              admin: false,
            };

            const result = guard("/o/org1/groups/new", dataState);

            expect(result).toBe("/o/org1");
          });
        });

        describe("/o/:oid/groups/:gid/edit", () => {
          it("should redirect when not sys/manager", async () => {
            const { guard } = await import("./guard");

            const dataState: UserState = {
              oid: "org1",
              uid: "user1",
              sys: false,
              manager: false,
              admin: false,
            };

            const result = guard("/o/org1/groups/group1/edit", dataState);

            expect(result).toBe("/o/org1/groups/group1");
          });

          it("should allow for manager", async () => {
            const { guard } = await import("./guard");

            const dataState: UserState = {
              oid: "org1",
              uid: "user1",
              sys: false,
              manager: true,
              admin: false,
            };

            const result = guard("/o/org1/groups/group1/edit", dataState);

            expect(result).toBeUndefined();
          });

          it("should allow for sysadmin", async () => {
            const { guard } = await import("./guard");

            const dataState: UserState = {
              oid: "org1",
              uid: "user1",
              sys: true,
              manager: false,
              admin: false,
            };

            const result = guard("/o/org1/groups/group1/edit", dataState);

            expect(result).toBeUndefined();
          });
        });
      });
    });

    describe("unknown paths", () => {
      it("should redirect to root when not authenticated", async () => {
        const { guard } = await import("./guard");

        const result = guard("/unknown", null);

        expect(result).toBe("/");
      });

      it("should redirect to user org when authenticated", async () => {
        const { guard } = await import("./guard");

        const dataState: UserState = {
          oid: "org1",
          uid: "user1",
          sys: false,
          manager: false,
          admin: false,
        };

        const result = guard("/unknown", dataState);

        expect(result).toBe("/o/org1");
      });
    });

    describe("trailing slashes", () => {
      it("should handle paths with trailing slashes", async () => {
        const { guard } = await import("./guard");

        const dataState: UserState = {
          oid: "org1",
          uid: "user1",
          sys: false,
          manager: false,
          admin: false,
        };

        const result = guard("/o/org1/", dataState);

        expect(result).toBeUndefined();
      });
    });
  });

  describe("guardRoute middleware", () => {
    it("should return redirect when guard fails", async () => {
      const { guardRoute } = await import("./guard");

      mockStore.get.mockReturnValue(null);

      const request = new Request("http://localhost/me");
      const result = guardRoute({ request, params: {}, context: {} });

      expect(mockRedirect).toHaveBeenCalledWith("/");
      expect(result).toEqual({ type: "redirect", path: "/" });
    });

    it("should return undefined when guard passes", async () => {
      const { guardRoute } = await import("./guard");

      const dataState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: false,
      };

      mockStore.get.mockReturnValue(dataState);

      const request = new Request("http://localhost/o/org1");
      const result = guardRoute({ request, params: {}, context: {} });

      expect(result).toBeUndefined();
    });
  });

  describe("useGuard hook", () => {
    it("should navigate when guard fails", async () => {
      const { useGuard } = await import("./guard");

      mockStore.get.mockReturnValue(null);
      mockLocation.pathname = "/me";

      useGuard();

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("should not navigate when guard passes", async () => {
      const { useGuard } = await import("./guard");

      const dataState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: false,
      };

      mockStore.get.mockReturnValue(dataState);
      mockLocation.pathname = "/o/org1";

      useGuard();

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
