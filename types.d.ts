import { App } from "@slack/bolt";
import { Translator, TargetLanguageCode, Formality } from "deepl-node";
import { Low } from "lowdb/node";

export type CommandsConfig = {
  app: App;
  translator: Translator;
  db: Low<Db>;
};

export type Db = {
  userSettings: Record<
    string,
    {
      targetLanguage: TargetLanguageCode;
      formality: Formality;
    }
  >;
};
