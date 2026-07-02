import { app, session, shell } from "electron";
import { logger } from "./logger";

// --------------------------------------------------------------------------
// Content Security Policy
// --------------------------------------------------------------------------
const isDev = !app.isPackaged;
const CSP = isDev
  ? [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' http://localhost:* https://localhost:* ws://localhost:* wss://localhost:* https:",
      "media-src 'self'",
      "object-src 'none'",
      "frame-src 'self'",
    ].join("; ")
  : [
      "default-src 'self'",
      "script-src 'self'", // Removed unsafe-inline and unsafe-eval
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https:", // Removed localhost
      "media-src 'self'",
      "object-src 'none'",
      "frame-src 'none'", // No iframes in prod
    ].join("; ");

// --------------------------------------------------------------------------
// Permission request handler
// Deny every permission that the admin panel doesn't need
// --------------------------------------------------------------------------
const ALLOWED_PERMISSIONS = new Set([
  "clipboard-read",
  "clipboard-write",
  "notifications",
]);

// --------------------------------------------------------------------------
// Main export: call this before creating any BrowserWindow
// --------------------------------------------------------------------------
export function setupSecurity(): void {
  // 1. Refuse navigation away from our own origin
  app.on("web-contents-created", (_event, contents) => {
    contents.on("will-navigate", (event, navigationUrl) => {
      const allowed =
        navigationUrl.startsWith("http://localhost:3000") ||
        navigationUrl.startsWith("file://");

      if (!allowed) {
        logger.warn(`[security] Blocked navigation to: ${navigationUrl}`);
        event.preventDefault();
        // Open in system browser instead
        shell.openExternal(navigationUrl);
      }
    });

    // 2. Block new windows / popups from the renderer
    contents.setWindowOpenHandler(({ url }) => {
      logger.warn(`[security] Blocked window.open for: ${url}`);
      shell.openExternal(url);
      return { action: "deny" };
    });
  });

  // 3. Attach CSP & permission handler to the default session
  app.whenReady().then(() => {
    const ses = session.defaultSession;

    // Inject CSP header for every response
    ses.webRequest.onHeadersReceived((details, callback) => {
      if (isDev) {
        callback({ responseHeaders: details.responseHeaders });
        return;
      }
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [CSP],
        },
      });
    });

    // Permission handler: deny anything not in the allowlist
    ses.setPermissionRequestHandler((_webContents, permission, callback) => {
      const granted = ALLOWED_PERMISSIONS.has(permission);
      if (!granted) {
        logger.warn(`[security] Permission denied: ${permission}`);
      }
      callback(granted);
    });

    // Permission check handler (for persistent permissions)
    ses.setPermissionCheckHandler((_webContents, permission) => {
      return ALLOWED_PERMISSIONS.has(permission);
    });
  });
}
