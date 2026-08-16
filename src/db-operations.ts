import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { shortcutsTable } from "./db/schema";
import { CreateShortcut, QuerySourceURLResponse, Shortcut } from "./schema";
import { and, eq, sql } from "drizzle-orm";
import { ConflictError, InternalServerError, NotFoundError } from "./errors";

const db = env.DB;
const dbClient = drizzle(db);

const isUniqueViolation = (err: Error): boolean =>
  err.message.includes("UNIQUE constraint") ||
  (err.cause instanceof Error && isUniqueViolation(err.cause));

export const dbOperations = {
  createShortcut: async ({
    source_url,
    slug,
    expiry_date,
  }: CreateShortcut): Promise<Shortcut> => {
    // Store dates in SQLite format, which doesn't use T as a date-time separator
    expiry_date = expiry_date.replace("T", " ");

    const response = await dbClient
      .insert(shortcutsTable)
      .values({ source_url, slug, expiry_date })
      .returning()
      .catch((reason: unknown) => {
        const cause = reason instanceof Error ? reason : new Error(String(reason));
        throw isUniqueViolation(cause)
          ? new ConflictError(cause.message, { cause })
          : new InternalServerError(cause.message, { cause });
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
          sql`datetime('now') < datetime(${shortcutsTable.expiry_date})`,
        ),
      )
      .catch((reason: unknown) => {
        throw new InternalServerError(
          reason instanceof Error ? reason.message : String(reason),
          { cause: reason },
        );
      });

    if (response.length > 1) {
      throw new InternalServerError("Found more than one shortcut");
    } else if (response.length < 1) {
      throw new NotFoundError("Shortcut not found");
    }

    return response[0];
  },
};
