import z from "zod";

const createShortcutSchema = z.object({
  source_url: z.url(),
  slug: z.string(),
  expiry_date: z.iso.datetime({ local: true }),
});

type CreateShortcut = z.infer<typeof createShortcutSchema>;

const shortcutSchema = z.object({
  id: z.uuid({ version: "v4" }),
  source_url: z.url(),
  slug: z.string(),
  expiry_date: z.iso.datetime({ local: true }),
});

type Shortcut = z.infer<typeof shortcutSchema>;

const querySourceURLResponseSchema = z.object({
  source_url: z.url(),
});

type QuerySourceURLResponse = z.infer<typeof querySourceURLResponseSchema>;

export {
  createShortcutSchema,
  shortcutSchema,
  querySourceURLResponseSchema,
  type CreateShortcut,
  type Shortcut,
  type QuerySourceURLResponse,
};
