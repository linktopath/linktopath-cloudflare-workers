import { Hono } from "hono";
import { validator } from "hono/validator";
import {
  createShortcutSchema,
  QuerySourceURLResponse,
  Shortcut,
} from "./schema";
import { dbOperations } from "./db-operations";
import { ConflictError, InternalServerError, NotFoundError } from "./errors";

const app = new Hono();

app.get("/:slug", async (c) => {
  const slug = c.req.param("slug");

  try {
    const response = await dbOperations.queryShortcut(slug);
    return c.json(response as QuerySourceURLResponse, 200);
  } catch (error: unknown) {
    console.error(
      "GET /:slug failed:",
      error instanceof Error ? error.message : error,
      {
        cause: error,
      },
    );
    if (error instanceof NotFoundError) {
      return c.text("Not Found", 404);
    } else if (error instanceof InternalServerError) {
      return c.text("Internal Server Error", 500);
    } else {
      return c.text("Internal Server Error", 500);
    }
  }
});

app.put(
  "/shortcut",
  validator("json", (value, c) => {
    const parsed = createShortcutSchema.safeParse(value);
    if (!parsed.success) {
      return c.text("Unprocessable Entity", 422);
    }

    return parsed.data;
  }),
  async (c) => {
    const validatedBody = c.req.valid("json")!;

    try {
      const response = await dbOperations.createShortcut(validatedBody);
      return c.json(response as Shortcut, 201);
    } catch (error: unknown) {
      console.error(
        "PUT /shortcut failed:",
        error instanceof Error ? error.message : error,
        { cause: error },
      );
      if (error instanceof ConflictError) {
        return c.text("Conflict", 409);
      } else if (error instanceof InternalServerError) {
        return c.text("Internal Server Error", 500);
      } else {
        return c.text("Internal Server Error", 500);
      }
    }
  },
);

export default app;
