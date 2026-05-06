import { rm, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const nextDir = path.join(process.cwd(), ".next");
const trashDir = path.join(
  process.cwd(),
  `.next-delete-${process.pid}-${Date.now()}`
);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function removeWithRetries(target) {
  let lastError;

  for (let attempt = 1; attempt <= 8; attempt += 1) {
    try {
      await rm(target, {
        force: true,
        maxRetries: 5,
        recursive: true,
        retryDelay: 200,
      });
      return;
    } catch (error) {
      lastError = error;
      await wait(attempt * 250);
    }
  }

  throw lastError;
}

if (!existsSync(nextDir)) {
  process.exit(0);
}

let target = nextDir;

try {
  await rename(nextDir, trashDir);
  target = trashDir;
} catch (error) {
  if (error?.code === "ENOENT") {
    process.exit(0);
  }
}

try {
  await removeWithRetries(target);
} catch (error) {
  console.error(
    "Could not clean .next. Stop any running dev server and try again."
  );
  console.error(error?.message ?? error);
  process.exit(1);
}
