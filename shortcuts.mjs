import { noSettingsBlocks } from "./commands/index.mjs";
import { readOrCreate } from "./utils.mjs";

/** @param {import("./types").CommandsConfig} config */
export const shortcuts = ({ app, db, deeplClient }) => {
  app.shortcut(
    "shortcut_translate_message",
    async ({ ack, body, respond, shortcut, client }) => {
      await ack();

      const userSettings = await readOrCreate(db, body.user.id);

      if (!userSettings.targetLanguage) {
        return respond({
          blocks: noSettingsBlocks,
        });
      }

      const translation = (
        await deeplClient.translateText(
          body.message.text,
          null,
          userSettings.targetLanguage,
          {
            formality: userSettings.formality,
          }
        )
      ).text;

      const userData = await client.users.profile.get({
        user: body.message.user,
      });

      if (
        body.message.thread_ts &&
        body.message.thread_ts !== body.message.ts
      ) {
        return await client.chat.postEphemeral({
          channel: body.channel.id,
          text: translation,
          thread_ts: body.message_ts,
          user: body.user.id,
          username: userData.profile?.real_name,
          icon_url: userData.profile?.image_192,
        });
      }

      await client.chat.postEphemeral({
        channel: body.channel.id,
        text: translation,
        user: body.user.id,
        username: userData.profile?.real_name,
        icon_url: userData.profile?.image_192,
      });
    }
  );
};
