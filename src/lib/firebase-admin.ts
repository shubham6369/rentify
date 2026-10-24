import * as admin from 'firebase-admin';

export const isFirebaseAdminConfigured = (): boolean => {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
};

export function getAdminApp(): admin.app.App | null {
  if (!isFirebaseAdminConfigured()) {
    return null;
  }

  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  try {
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

    const adminSdk = (admin as any).default || admin;
    const certFn = adminSdk.credential?.cert || admin.credential?.cert;
    if (!certFn) {
      throw new Error('Firebase Admin credential.cert not available');
    }

    return adminSdk.initializeApp({
      credential: certFn({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    return null;
  }
}

export function getAdminFirestore(): admin.firestore.Firestore | null {
  const app = getAdminApp();
  if (!app) return null;
  const adminSdk = (admin as any).default || admin;
  return adminSdk.firestore(app);
}

export function getAdminAuth(): admin.auth.Auth | null {
  const app = getAdminApp();
  if (!app) return null;
  const adminSdk = (admin as any).default || admin;
  return adminSdk.auth(app);
}
