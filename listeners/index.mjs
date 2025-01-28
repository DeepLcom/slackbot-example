/** @param {import("../types").CommandsConfig} config */
export const listener = async ({ app, translator }) => {
  app.message("message", async ({ body, respond }) => {
    console.log({ body });
  });
};
