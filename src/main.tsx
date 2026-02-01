import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import "./lib/i18n";
import { listenAppState } from "./lib/app";
import { listenAuthState } from "./lib/auth";
import { subscribeConf } from "./lib/firestore";
import { route } from "./lib/router";

listenAppState();
listenAuthState();
subscribeConf();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={createHashRouter(route)} />
  </StrictMode>
);
