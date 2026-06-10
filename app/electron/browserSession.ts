export const nativeBrowserDefaultSessionPartition = "cerebro-native-browser-normal";

export function nativeBrowserSessionWebPreferences() {
  return {
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
    partition: nativeBrowserDefaultSessionPartition,
  };
}
