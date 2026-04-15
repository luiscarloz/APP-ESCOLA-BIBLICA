/**
 * Migra usuarios do Clerk Development para Production.
 *
 * O que faz:
 * 1. Lista todos usuarios do Dev
 * 2. Cria os mesmos usuarios no Prod (sem senha)
 * 3. Atualiza o clerk_id na tabela students do Supabase
 *
 * Usuarios migrados precisarao usar "Esqueci minha senha" no primeiro acesso.
 *
 * Como rodar:
 *   npx tsx scripts/migrate-clerk-users.ts
 */

import { createClient } from "@supabase/supabase-js";

// ========== CONFIG (usar variáveis de ambiente) ==========
// Defina antes de rodar:
//   export CLERK_DEV_SECRET_KEY=sk_test_...
//   export CLERK_PROD_SECRET_KEY=sk_live_...
//   export SUPABASE_URL=https://...
//   export SUPABASE_SERVICE_KEY=eyJ...
const DEV_SECRET_KEY = process.env.CLERK_DEV_SECRET_KEY!;
const PROD_SECRET_KEY = process.env.CLERK_PROD_SECRET_KEY!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY!;

if (!DEV_SECRET_KEY || !PROD_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Defina as variáveis de ambiente: CLERK_DEV_SECRET_KEY, CLERK_PROD_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY");
  process.exit(1);
}
// =============================

interface ClerkUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email_addresses: { email_address: string; id: string }[];
  phone_numbers: { phone_number: string; id: string }[];
  primary_email_address_id: string | null;
  primary_phone_number_id: string | null;
  external_accounts: { provider: string; email_address?: string }[];
  public_metadata: Record<string, unknown>;
}

async function listAllDevUsers(): Promise<ClerkUser[]> {
  const users: ClerkUser[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const res = await fetch(
      `https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${DEV_SECRET_KEY}` } }
    );
    if (!res.ok) {
      throw new Error(`Erro ao listar usuarios dev: ${res.status} ${await res.text()}`);
    }
    const batch = (await res.json()) as ClerkUser[];
    users.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
  }

  return users;
}

async function createProdUser(devUser: ClerkUser): Promise<string | null> {
  const primaryEmail =
    devUser.email_addresses.find((e) => e.id === devUser.primary_email_address_id)
      ?.email_address ?? devUser.email_addresses[0]?.email_address;

  if (!primaryEmail) {
    console.warn(`  ⚠ Usuario ${devUser.id} sem email — pulando`);
    return null;
  }

  const body: Record<string, unknown> = {
    email_address: [primaryEmail],
    skip_password_requirement: true,
    skip_password_checks: true,
  };

  if (devUser.first_name) body.first_name = devUser.first_name;
  if (devUser.last_name) body.last_name = devUser.last_name;
  if (Object.keys(devUser.public_metadata).length > 0) {
    body.public_metadata = devUser.public_metadata;
  }

  const phone = devUser.phone_numbers.find(
    (p) => p.id === devUser.primary_phone_number_id
  )?.phone_number;
  if (phone) body.phone_number = [phone];

  const res = await fetch("https://api.clerk.com/v1/users", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PROD_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    // Se ja existir, busca o usuario existente
    if (res.status === 422 && errText.includes("already exists")) {
      const findRes = await fetch(
        `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(primaryEmail)}`,
        { headers: { Authorization: `Bearer ${PROD_SECRET_KEY}` } }
      );
      if (findRes.ok) {
        const found = (await findRes.json()) as ClerkUser[];
        if (found.length > 0) {
          console.log(`  ↻ Ja existia em prod: ${primaryEmail}`);
          return found[0].id;
        }
      }
    }
    console.error(`  ✗ Erro ao criar ${primaryEmail}: ${res.status} ${errText}`);
    return null;
  }

  const created = (await res.json()) as ClerkUser;
  console.log(`  ✓ Criado: ${primaryEmail}`);
  return created.id;
}

async function main() {
  console.log("→ Listando usuarios do Clerk Dev...");
  const devUsers = await listAllDevUsers();
  console.log(`  ${devUsers.length} usuarios encontrados.\n`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let created = 0;
  let skipped = 0;
  let updated = 0;
  let errors = 0;

  for (const devUser of devUsers) {
    const newProdId = await createProdUser(devUser);
    if (!newProdId) {
      errors++;
      continue;
    }
    created++;

    // Atualiza o clerk_id no Supabase
    const { error, count } = await supabase
      .from("students")
      .update({ clerk_id: newProdId }, { count: "exact" })
      .eq("clerk_id", devUser.id);

    if (error) {
      console.error(`    ✗ Erro Supabase: ${error.message}`);
      errors++;
    } else if (count && count > 0) {
      console.log(`    ↺ Supabase: ${count} student(s) atualizado(s)`);
      updated++;
    } else {
      skipped++;
    }
  }

  console.log("\n=== RESUMO ===");
  console.log(`Usuarios criados/encontrados em prod: ${created}`);
  console.log(`Students atualizados no Supabase: ${updated}`);
  console.log(`Sem registro no Supabase: ${skipped}`);
  console.log(`Erros: ${errors}`);
  console.log("\nFeito! Avise os alunos para usarem 'Esqueci minha senha' no primeiro acesso.");
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
