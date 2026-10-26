module.exports = {
  async up(db, client) {
    // Users
    await db.collection('users').createIndex({ email: 1 }, { unique: true, name: 'users_email_unique' });

    // Sessions
    await db.collection('sessions').createIndex({ token: 1 }, { unique: true, name: 'sessions_token_unique' });
    await db.collection('sessions').createIndex({ userId: 1 }, { name: 'sessions_userId' });
    await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'sessions_expiresAt_ttl' });

    // Applications
    await db.collection('applications').createIndex({ userId: 1, appliedAt: -1, _id: -1 }, { name: 'applications_user_applied_desc' });
    await db.collection('applications').createIndex({ userId: 1, status: 1 }, { name: 'applications_user_status' });

    // Better Auth collections if they exist with different naming; ensure common indexes
    try {
      await db.collection('verification').createIndex({ identifier: 1 }, { name: 'verification_identifier' });
    } catch (e) {
      // ignore
    }
    try {
      await db.collection('accounts').createIndex({ userId: 1 }, { name: 'accounts_userId' });
    } catch (e) {
      // ignore
    }
  },

  async down(db, client) {
    try { await db.collection('users').dropIndex('users_email_unique'); } catch (e) {}
    try { await db.collection('sessions').dropIndex('sessions_token_unique'); } catch (e) {}
    try { await db.collection('sessions').dropIndex('sessions_userId'); } catch (e) {}
    try { await db.collection('sessions').dropIndex('sessions_expiresAt_ttl'); } catch (e) {}
    try { await db.collection('applications').dropIndex('applications_user_applied_desc'); } catch (e) {}
    try { await db.collection('applications').dropIndex('applications_user_status'); } catch (e) {}
    try { await db.collection('verification').dropIndex('verification_identifier'); } catch (e) {}
    try { await db.collection('accounts').dropIndex('accounts_userId'); } catch (e) {}
  }
};
