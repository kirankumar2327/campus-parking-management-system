import { createRoot, html } from "./lib.js";
import { App } from "./App.js";

const root = createRoot(document.getElementById("app"));
root.render(html`<${App} />`);
