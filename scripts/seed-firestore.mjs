import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function seedFirestore() {
  console.log('--- Starting Cloud Firestore Seeding ---');
  console.log('Firebase Project:', firebaseConfig.projectId);

  const dbPath = path.join(process.cwd(), 'data', 'db.json');
  if (!fs.existsSync(dbPath)) {
    console.error('db.json not found!');
    process.exit(1);
  }

  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // 1. Seed Hotels
  console.log(`Seeding ${dbData.hotels?.length || 0} hotels...`);
  for (const hotel of dbData.hotels || []) {
    await setDoc(doc(db, 'hotels', hotel.hotelId), hotel, { merge: true });
    console.log(`  ✓ Hotel: ${hotel.name} (${hotel.hotelId})`);
  }

  // 2. Seed Rooms
  console.log(`Seeding ${dbData.rooms?.length || 0} rooms...`);
  for (const room of dbData.rooms || []) {
    await setDoc(doc(db, 'rooms', room.roomId), room, { merge: true });
    console.log(`  ✓ Room: ${room.roomType} (${room.roomId})`);
  }

  // 3. Seed Users
  console.log(`Seeding ${dbData.users?.length || 0} default users...`);
  for (const user of dbData.users || []) {
    await setDoc(doc(db, 'users', user.uid), user, { merge: true });
    console.log(`  ✓ User: ${user.fullName} (${user.role})`);
  }

  // Verify counts
  const hotelSnap = await getDocs(collection(db, 'hotels'));
  const roomSnap = await getDocs(collection(db, 'rooms'));
  const userSnap = await getDocs(collection(db, 'users'));

  console.log('\n--- Firestore Seeding Verification ---');
  console.log(`Total Hotels in Firestore: ${hotelSnap.size}`);
  console.log(`Total Rooms in Firestore: ${roomSnap.size}`);
  console.log(`Total Users in Firestore: ${userSnap.size}`);
  console.log('Seeding completed successfully!');
  process.exit(0);
}

seedFirestore().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
