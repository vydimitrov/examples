import fs from "fs/promises";
import { Bootstrapper } from "@crystallize/import-utilities";

async function backupTenant() {
  const bootstrapper = new Bootstrapper();

  /**
   * Access tokens for the account used
   * https://crystallize.com/learn/developer-guides/access-tokens
   */
  const ACCESS_TOKEN_ID = process.env.CRYSTALLIZE_ACCESS_TOKEN_ID;
  const ACCESS_TOKEN_SECRET = process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET;

  bootstrapper.setAccessToken(ACCESS_TOKEN_ID, ACCESS_TOKEN_SECRET);

  bootstrapper.setTenantIdentifier("<tenant-identifier>");

  const spec = await bootstrapper.createSpec();

  await fs.writeFile(
    `${__dirname}/backup-${bootstrapper.tenantIdentifier}-${Date.now()}.json`,
    JSON.stringify(spec, null, 1),
    "utf-8"
  );

  process.exit(0);
}

backupTenant();
