import type { Session } from "electron";

export function installNativeBrowserPermissionPolicy(browserSession: Session) {
  browserSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });

  browserSession.on("will-download", (event, item) => {
    event.preventDefault();
    item.cancel();
  });
}
