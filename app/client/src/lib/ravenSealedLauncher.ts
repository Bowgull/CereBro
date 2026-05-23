export const ravenSealedLauncherPhrase = "execute order 66";
export const ravenSealedLauncherUrl = "http://127.0.0.1:5174/?handoff=aang";

export function isExactRavenSealedLauncherPhrase(text: string) {
  return text.trim().toLowerCase() === ravenSealedLauncherPhrase;
}
