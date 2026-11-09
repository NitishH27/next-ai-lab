module.exports = {
  async up(db) {
    await db.collection('profiles').createIndex(
      { userId: 1 },
      { unique: true, name: 'profiles_userId_unique' },
    );
  },

  async down(db) {
    try { await db.collection('profiles').dropIndex('profiles_userId_unique'); } catch {}
  },
};
