import { readOrCreate } from "../utils.mjs";

const formalityMap = {
  default: "Automatic",
  prefer_more: "Formal",
  prefer_less: "Informal",
};

/** @type {Record<string, { name: string, type?: "writing_style" | "tone" }>} */
export const rephraseStyleToneMap = {
  default: { name: "Default" },
  prefer_simple: { name: "Simple", type: "writing_style" },
  prefer_business: { name: "Business", type: "writing_style" },
  prefer_academic: { name: "Academic", type: "writing_style" },
  prefer_casual: { name: "Casual", type: "writing_style" },
  prefer_enthusiastic: { name: "Enthusiastic", type: "tone" },
  prefer_friendly: { name: "Friendly", type: "tone" },
  prefer_confident: { name: "Confident", type: "tone" },
  prefer_diplomatic: { name: "Diplomatic", type: "tone" },
};

/** @param {import("../types").CommandsConfig} config */
export const settingsCommand = ({ app, db, deeplClient }) => {
  const settingsResponse = async ({ respond, userId }) => {
    const userSettings = await readOrCreate(db, userId);

    const targetLanguages = await deeplClient.getTargetLanguages();

    /** @type {import("@slack/bolt").PlainTextOption | undefined} */
    let initialTargetOption = undefined;

    if (userSettings.targetLanguage) {
      const targetLanguage = targetLanguages.find(
        (language) => language.code === userSettings.targetLanguage
      );

      if (targetLanguage) {
        initialTargetOption = {
          text: {
            type: "plain_text",
            text: targetLanguage.name,
          },
          value: targetLanguage.code,
        };
      }
    }

    /** @type {import("@slack/bolt").PlainTextOption | undefined} */
    let initialFormalityOption = undefined;

    let initialStyleToneOption = undefined;

    if (userSettings.formality) {
      initialFormalityOption = {
        text: {
          type: "plain_text",
          text: formalityMap[userSettings.formality],
        },
        value: userSettings.formality,
      };
    }

    if (userSettings.rephraseStyleTone) {
      initialStyleToneOption = {
        text: { type: "plain_text", text: rephraseStyleToneMap[userSettings.rephraseStyleTone].name },
        value: userSettings.rephraseStyleTone,
      };
    }

    await respond({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Hey <@${userId}>, here are your configured settings for DeepL`,
          },
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Select your target language:*",
          },
          accessory: {
            type: "static_select",
            action_id: "settings_select_target_language",
            placeholder: {
              type: "plain_text",
              text: "Choose a language",
            },
            initial_option: initialTargetOption,
            options: targetLanguages.map((language) => ({
              text: {
                type: "plain_text",
                text: language.name,
              },
              value: language.code,
            })),
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Select formality level:*",
          },
          accessory: {
            type: "static_select",
            action_id: "settings_select_formality",
            placeholder: {
              type: "plain_text",
              text: "Choose formality",
            },
            initial_option: initialFormalityOption,
            options: [
              {
                text: {
                  type: "plain_text",
                  text: "Automatic",
                },
                value: "default",
              },
              {
                text: {
                  type: "plain_text",
                  text: "Formal",
                },
                value: "prefer_more",
              },
              {
                text: {
                  type: "plain_text",
                  text: "Informal",
                },
                value: "prefer_less",
              },
            ],
          },
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Select style or tone for rephrasing:*",
          },
          accessory: {
            type: "static_select",
            action_id: "settings_select_rephrase_style_tone", 
            placeholder: {
              type: "plain_text",
              text: "Choose style or tone",
            },
            initial_option: initialStyleToneOption,
            options: Object.keys(rephraseStyleToneMap).map((key) => ({
              text: { type: "plain_text", text: rephraseStyleToneMap[key].name },
              value: key
            })),
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
              text: {
                type: "plain_text",
                text: "Dismiss",
              },
              action_id: "dismiss_action",
            },
          ],
        },
      ],
    });
  };

  app.command("/settings", async ({ ack, body, respond }) => {
    await ack();

    await settingsResponse({ respond, userId: body.user_id });
  });

  app.action("settings", async ({ ack, body, respond }) => {
    await ack();
    await settingsResponse({ respond, userId: body.user.id });
  });

  app.action(
    "settings_select_target_language",
    async ({ ack, body, action }) => {
      await ack();
      const userSettings = await readOrCreate(db, body.user.id);
      userSettings.targetLanguage = action.selected_option.value;
      await db.write();
    }
  );

  app.action("settings_select_formality", async ({ ack, body, action }) => {
    await ack();
    await db.update(({ userSettings }) => {
      userSettings[body.user.id].formality = action.selected_option.value;
    });
    await db.write();
  });

  app.action("settings_select_rephrase_style_tone", async ({ ack, body, action }) => {
    await ack();
    await db.update(({ userSettings }) => {
      userSettings[body.user.id].rephraseStyleTone = action.selected_option.value;
    });
    await db.write();
  });
};
