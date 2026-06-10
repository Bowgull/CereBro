import fs from "fs";
import path from "path";

export interface CereBroSkill {
  id: string;
  name: string;
  sourcePath: string;
  content: string;
}

const SKILL_DIRS = [
  path.resolve(process.cwd(), "skills"),
  path.resolve(process.cwd(), "..", "CereBro_Claude_Code_Repo_Starter_Pack", "skills"),
];

function normalizeSkillId(filename: string): string {
  return filename.replace(/\.skill\.md$/i, "");
}

export function listSkillFiles(): CereBroSkill[] {
  const seen = new Set<string>();
  const skills: CereBroSkill[] = [];

  for (const dir of SKILL_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".skill.md")) continue;
      const id = normalizeSkillId(entry.name);
      if (seen.has(id)) continue;
      const sourcePath = path.join(dir, entry.name);
      const content = fs.readFileSync(sourcePath, "utf8");
      const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
      skills.push({
        id,
        name: heading || id,
        sourcePath,
        content,
      });
      seen.add(id);
    }
  }

  return skills.sort((a, b) => a.id.localeCompare(b.id));
}

export function getSkillById(id: string): CereBroSkill | undefined {
  return listSkillFiles().find((skill) => skill.id === id);
}
