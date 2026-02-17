import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import "./i18n/i18n";
import { listenAppState } from "./lib/app";
import { initAuth } from "./lib/auth";
import { subscribeConf } from "./lib/firestore";
import { route } from "./router";

listenAppState();
initAuth();
subscribeConf();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={createHashRouter(route)} />
  </StrictMode>
);
