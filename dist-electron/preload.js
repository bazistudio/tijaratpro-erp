"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// electron/preload.ts
var preload_exports = {};
module.exports = __toCommonJS(preload_exports);
var import_electron = require("electron");
var ALLOWED_CHANNELS = ["app:notification", "app:updateAvailable"];
function isAllowedChannel(channel) {
  return ALLOWED_CHANNELS.includes(channel);
}
var electronAPI = {
  getAppInfo: () => import_electron.ipcRenderer.invoke("app:getInfo"),
  quit: () => import_electron.ipcRenderer.invoke("app:quit"),
  openExternal: (url) => import_electron.ipcRenderer.invoke("app:openExternal", url),
  on: (channel, listener) => {
    if (!isAllowedChannel(channel)) {
      console.warn(`[preload] Blocked subscription to unknown channel: ${channel}`);
      return;
    }
    import_electron.ipcRenderer.on(channel, listener);
  },
  off: (channel, listener) => {
    if (!isAllowedChannel(channel)) return;
    import_electron.ipcRenderer.off(channel, listener);
  },
  db: {
    mutate: (entityType, operation, payload) => import_electron.ipcRenderer.invoke("db:mutate", entityType, operation, payload),
    query: (entityType, id) => import_electron.ipcRenderer.invoke("db:query", entityType, id),
    queryAll: (entityType) => import_electron.ipcRenderer.invoke("db:queryAll", entityType)
  }
};
import_electron.contextBridge.exposeInMainWorld("electron", electronAPI);
//# sourceMappingURL=preload.js.map