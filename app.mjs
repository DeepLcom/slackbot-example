import dotenv from "dotenv";
dotenv.config();

import Slack from "@slack/bolt";
import { commands } from "./commands/index.mjs";
import * as deepl from "deepl-node";
import invariant from "tiny-invariant";
import { JSONFilePreset } from "lowdb/node";
import { shortcuts } from "./shortcuts.mjs";

invariant(process.env.DEEPL_API_KEY, "DEEPL_API_KEY is not set");

const deeplClient = new deepl.DeepLClient(process.env.DEEPL_API_KEY);

const { App } = Slack;

// Read or create db.json
/** @type {import("./types").Db} */
const defaultData = { userSettings: {} };
const db = await JSONFilePreset("db.json", defaultData);

await db.read();

// Initializes your app in socket mode with your app token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, // add this
  appToken: process.env.SLACK_APP_TOKEN, // add this
});

commands({ app, deeplClient, db });
shortcuts({ app, db, deeplClient });

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.info("⚡️ Bolt app is running!");
})();
