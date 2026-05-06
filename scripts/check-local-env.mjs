import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const envFiles = [
  ".env",
  ".env.development",
  ".env.local",
  ".env.development.local",
];

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};

  return Object.fromEntries(
    readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        const key = line.slice(0, index).trim();
        const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
        return [key, value];
      })
  );
}

const fileEnv = envFiles.reduce(
  (env, fileName) => ({
    ...env,
    ...parseEnvFile(path.join(process.cwd(), fileName)),
  }),
  {}
);

const env = { ...fileEnv, ...process.env };
const publishableKey = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const secretKey = env.CLERK_SECRET_KEY ?? "";

if (publishableKey.startsWith("pk_live_") || secretKey.startsWith("sk_live_")) {
  console.error(
    [
      "Local development is using Clerk production keys.",
      "",
      "Clerk production keys for this app are restricted to escola.iirbrasil.com.br,",
      "so localhost sign-in will fail. Replace them locally with Clerk development keys:",
      "",
      "  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...",
      "  CLERK_SECRET_KEY=sk_test_...",
      "",
      "Keep production keys only in the production environment.",
    ].join("\n")
  );
  process.exit(1);
}
