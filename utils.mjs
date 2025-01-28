/** @returns {Promise<import("./types").Db["userSettings"][string]>} */
export const readOrCreate = async (db, userId) => {
  if (!db.data.userSettings[userId]) {
    db.data.userSettings[userId] = {
      formality: "default",
    };
    await db.write();
  }
  return db.data.userSettings[userId];
};

export const updateFormality = async (db, userId, formality) => {
  await db.update(({ userSettings }) => {
    userSettings[userId].formality = formality;
  });
};
