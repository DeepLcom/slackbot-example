import { App } from "@slack/bolt";
import { DeepLClient, TargetLanguageCode, Formality } from "deepl-node";
import { Low } from "lowdb/node";

export type CommandsConfig = {
  app: App;
  deeplClient: DeepLClient;
  db: Low<Db>;
};

export type Db = {
  userSettings: Record<
    string,
    {
      targetLanguage: TargetLanguageCode;
      formality: Formality;
      rephraseStyleTone: string;
    }
  >;
};
