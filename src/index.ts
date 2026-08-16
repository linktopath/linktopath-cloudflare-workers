import { Hono } from "hono";
import { validator } from "hono/validator";
import {
  createShortcutSchema,
  QuerySourceURLResponse,
  Shortcut,
} from "./schema";
import { dbOperations } from "./db-operations";
import { InternalServerError, NotFoundError } from "./errors";

const app = new Hono();

app.get("/:slug", async (c) => {
  const slug = c.req.param("slug");

  try {
    const response = await dbOperations.queryShortcut(slug);
    return c.json(response as QuerySourceURLResponse);
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof NotFoundError) {
      return c.status(404);
    } else if (error instanceof InternalServerError) {
      return c.status(500);
    } else {
      console.error("An unhandled error has occurred: ", error);
      return c.status(500);
    }
  }
});

app.put(
  "/shortcut",
  validator("json", (value, c) => {
    const parsed = createShortcutSchema.safeParse(value);
    if (!parsed.success) {
      return c.status(422);
    }

    return parsed.data;
  }),
  async (c) => {
    const validatedBody = c.req.valid("json")!;

    try {
      const response = await dbOperations.createShortcut(validatedBody);
      return c.json(response as Shortcut);
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof InternalServerError) {
        return c.status(500);
      } else {
        console.error("An unhandled error has occurred: ", error);
        return c.status(500);
      }
    }
  },
);

export default app;
