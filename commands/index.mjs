import { readOrCreate } from "../utils.mjs";
import { settingsCommand } from "./settings.mjs";

/** @type {import("@slack/bolt").RespondArguments["blocks"]} */
export const noSettingsBlocks = [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "Configure your settings first by using the /settings command.",
    },
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Settings",
        },
        action_id: "settings",
      },
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Dismiss",
        },
        action_id: "dismiss_action",
      },
    ],
  },
];

/** @param {import("../types").CommandsConfig} config */
export const commands = ({ app, translator, db }) => {
  app.command("/translate", async ({ command, ack, respond, body }) => {
    await ack();

    const userSettings = await readOrCreate(db, body.user_id);

    if (!userSettings.targetLanguage) {
      return respond({
        blocks: noSettingsBlocks,
      });
    }

    const result = await translator.translateText(
      command.text,
      null,
      userSettings.targetLanguage,
      { formality: userSettings.formality }
    );
    await respond({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: result.text,
          },
        },
        {
          type: "divider",
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "Send" },
              action_id: "translate_send",
              value: JSON.stringify({ result }), // Pass metadata as value
            },
            {
              type: "button",
              text: { type: "plain_text", text: "Edit" },
              action_id: "translate_edit",
              value: JSON.stringify({ result }), // Pass metadata as value
            },
            {
              type: "button",
              text: { type: "plain_text", text: "Cancel" },
              action_id: "dismiss_action",
            },
          ],
        },
      ],
    });
  });

  app.action("translate_edit", async ({ action, ack, body, client }) => {
    await ack();
    const metadata = JSON.parse(action.value); // Parse metadata from value

    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "translate_edit_modal",
        title: {
          type: "plain_text",
          text: "Edit Translation",
        },
        blocks: [
          {
            type: "input",
            block_id: "translation_input",
            element: {
              type: "plain_text_input",
              action_id: "translation",
              initial_value: metadata.result.text,
            },
            label: {
              type: "plain_text",
              text: "Edit the translated text",
            },
          },
        ],
        submit: {
          type: "plain_text",
          text: "Send",
        },
        close: {
          type: "plain_text",
          text: "Cancel",
        },
        private_metadata: JSON.stringify({
          channel: body.channel,
        }),
      },
    });
  });

  app.view(
    "translate_edit_modal",
    async ({ ack, body, view, client, respond }) => {
      await ack();

      const user = body.user.id;
      const newText = view.state.values.translation_input.translation.value;

      const userData = await client.users.info({ user });

      const metadata = JSON.parse(view.private_metadata);

      await client.chat.postMessage({
        channel: metadata.channel.id,
        text: newText ?? "",
        username: userData.user?.real_name,
        icon_url: userData.user?.profile?.image_192,
      });

      await respond({
        text: "",
        delete_original: true,
      });
    }
  );

  app.action("translate_send", async (opts) => {
    const { action, ack, body, client, say } = opts;
    await ack();
    const metadata = JSON.parse(action.value); // Parse metadata from value

    const userData = await client.users.profile.get({
      user: body.user.id,
    });

    await say({
      text: metadata.result.text,
      username: userData.profile?.real_name,
      icon_url: userData.profile?.image_192,
    });
  });

  app.action("dismiss_action", async ({ ack, respond }) => {
    await ack();
    await respond({
      text: "",
      delete_original: true,
    });
  });

  settingsCommand({ app, translator, db });
};
