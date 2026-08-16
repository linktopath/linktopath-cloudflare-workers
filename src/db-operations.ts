import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { shortcutsTable } from "./db/schema";
import { CreateShortcut, QuerySourceURLResponse, Shortcut } from "./schema";
import { and, eq, sql } from "drizzle-orm";
import { InternalServerError, NotFoundError } from "./errors";

const db = env.DB;
const dbClient = drizzle(db);

export const dbOperations = {
  createShortcut: async ({
    source_url,
    slug,
    expiry_date,
  }: CreateShortcut): Promise<Shortcut> => {
    const response = await dbClient
      .insert(shortcutsTable)
      .values({ source_url, slug, expiry_date })
      .returning()
      .catch((reason) => {
        throw new InternalServerError(reason);
      });

    if (response.length > 1) {
      throw new InternalServerError("Created more than one shortcut");
    } else if (response.length < 1) {
      throw new InternalServerError("Silently failed to create shortcut");
    }

    return response[0];
  },
  queryShortcut: async (slug: string): Promise<QuerySourceURLResponse> => {
    const response = await dbClient
      .select({ source_url: shortcutsTable.source_url })
      .from(shortcutsTable)
      .where(
        and(
          eq(shortcutsTable.slug, slug),
          sql`current_timestamp < ${shortcutsTable.expiry_date}`,
        ),
      )
      .catch((reason) => {
        throw new InternalServerError(reason);
      });

    if (response.length > 1) {
      throw new InternalServerError("Found more than one shortcut");
    } else if (response.length < 1) {
      throw new NotFoundError("Shortcut not found");
    }

    return response[0];
  },
};
