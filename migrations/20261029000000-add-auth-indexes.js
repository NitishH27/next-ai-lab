module.exports = {
  async up(db) {
    await db.collection('accounts').createIndex(
      { providerId: 1, accountId: 1 },
      { unique: true, name: 'accounts_provider_account_unique' },
    );
    await db.collection('verification').createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0, name: 'verification_expiresAt_ttl' },
    );
  },

  async down(db) {
    try { await db.collection('accounts').dropIndex('accounts_provider_account_unique'); } catch {}
    try { await db.collection('verification').dropIndex('verification_expiresAt_ttl'); } catch {}
  },
};
