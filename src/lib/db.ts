import fs from 'fs';
import path from 'path';
import { Hotel, Room, Booking, Review, UserProfile, StayCategory, ApprovalStatus } from '@/types';
import { getAdminFirestore } from './firebase-admin';
import { calculateDistanceKm } from './geo';

export interface PlatformSettings {
  platformFeePercentage: number;
  minAdvanceDepositPercentage: number;
  announcementBanner: {
    enabled: boolean;
    message: string;
    type: 'offer' | 'info' | 'alert';
  };
  maintenanceMode: boolean;
  supportedCities: string[];
}

interface DatabaseSchema {
  hotels: Hotel[];
  rooms: Room[];
  bookings: Booking[];
  reviews: Review[];
  users: UserProfile[];
  otps: { phone: string; otp: string; expiresAt: number }[];
  settings?: PlatformSettings;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  platformFeePercentage: 5,
  minAdvanceDepositPercentage: 25,
  announcementBanner: {
    enabled: true,
    message: 'Welcome to Rentify! Verified students get up to ₹2,000 off on semester bookings.',
    type: 'offer'
  },
  maintenanceMode: false,
  supportedCities: ['Bangalore', 'Mumbai', 'Delhi', 'Jaunpur', 'Varanasi', 'Kota', 'Pune', 'Hyderabad', 'Jaipur', 'Dehradun']
};

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

const INITIAL_HOTELS: Hotel[] = [];

const INITIAL_ROOMS: Room[] = [];

const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'admin_default_1',
    fullName: 'System Administrator',
    email: 'admin@findyourstay.com',
    phone: '+919999900001',
    phoneVerified: true,
    emailVerified: true,
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

class DatabaseService {
  private data: DatabaseSchema;
  private lastFirestoreSync = 0;
  private isSyncing = false;

  constructor() {
    this.data = this.loadDatabase();
    // Eagerly trigger Firestore synchronization in the background
    this.syncFromFirestore(true).catch((err) => {
      console.warn('Initial Firestore sync scheduled:', err);
    });
  }

  private loadDatabase(): DatabaseSchema {
    try {
      // First try /tmp in serverless if exists
      if (process.platform !== 'win32' && fs.existsSync('/tmp/db.json')) {
        const raw = fs.readFileSync('/tmp/db.json', 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.hotels)) return parsed;
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.hotels)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Initializing fresh persistent database...');
    }

    const initial: DatabaseSchema = {
      hotels: INITIAL_HOTELS,
      rooms: INITIAL_ROOMS,
      bookings: [],
      reviews: [],
      users: INITIAL_USERS,
      otps: [],
      settings: DEFAULT_SETTINGS
    };
    this.saveDatabase(initial);
    return initial;
  }

  private saveDatabase(dataToSave?: DatabaseSchema) {
    const data = dataToSave || this.data;
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      // In serverless / read-only filesystem environments (Vercel Lambda), write to /tmp
      try {
        if (process.platform !== 'win32') {
          fs.writeFileSync('/tmp/db.json', JSON.stringify(data, null, 2), 'utf-8');
        }
      } catch (_) {}
    }
  }

  public async syncFromFirestore(force = false): Promise<void> {
    const firestore = getAdminFirestore();
    if (!firestore) return;

    const now = Date.now();
    // Cache for 2 seconds unless forced
    if (!force && now - this.lastFirestoreSync < 2000) {
      return;
    }
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const [hSnap, rSnap, bSnap, revSnap, uSnap, sSnap] = await Promise.all([
        firestore.collection('hotels').get(),
        firestore.collection('rooms').get(),
        firestore.collection('bookings').get(),
        firestore.collection('reviews').get(),
        firestore.collection('users').get(),
        firestore.collection('settings').doc('platform_settings').get()
      ]);

      // Read hotels from Firestore
      const firestoreHotels: Hotel[] = [];
      hSnap.forEach((doc) => {
        firestoreHotels.push(doc.data() as Hotel);
      });
      this.data.hotels = firestoreHotels;

      // Read rooms from Firestore
      const firestoreRooms: Room[] = [];
      rSnap.forEach((doc) => {
        firestoreRooms.push(doc.data() as Room);
      });
      this.data.rooms = firestoreRooms;

      // Read bookings from Firestore
      const firestoreBookings: Booking[] = [];
      bSnap.forEach((doc) => {
        firestoreBookings.push(doc.data() as Booking);
      });
      this.data.bookings = firestoreBookings;

      // Read reviews from Firestore
      const firestoreReviews: Review[] = [];
      revSnap.forEach((doc) => {
        firestoreReviews.push(doc.data() as Review);
      });
      this.data.reviews = firestoreReviews;

      // Read users from Firestore
      const firestoreUsers: UserProfile[] = [];
      uSnap.forEach((doc) => {
        firestoreUsers.push(doc.data() as UserProfile);
      });
      this.data.users = firestoreUsers;

      if (sSnap.exists) {
        this.data.settings = sSnap.data() as PlatformSettings;
      } else {
        await firestore.collection('settings').doc('platform_settings').set(DEFAULT_SETTINGS, { merge: true }).catch(() => {});
        if (!this.data.settings) {
          this.data.settings = DEFAULT_SETTINGS;
        }
      }

      this.lastFirestoreSync = Date.now();
      this.saveDatabase();
    } catch (err) {
      console.warn('Firestore live sync note:', err);
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncFirestoreDoc(collectionName: string, docId: string, data: any) {
    try {
      const firestore = getAdminFirestore();
      if (!firestore) return;
      await firestore.collection(collectionName).doc(docId).set(data, { merge: true });
    } catch (err) {
      console.warn(`Firestore sync error for ${collectionName}/${docId}:`, err);
    }
  }

  private async deleteFirestoreDoc(collectionName: string, docId: string) {
    try {
      const firestore = getAdminFirestore();
      if (!firestore) return;
      await firestore.collection(collectionName).doc(docId).delete();
    } catch (err) {
      console.warn(`Firestore delete error for ${collectionName}/${docId}:`, err);
    }
  }

  // HOTELS
  async getHotels(filter?: {
    category?: string;
    city?: string;
    propertyType?: string;
    status?: string;
    ownerId?: string;
    approvalStatus?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    includeAll?: boolean;
    lat?: number;
    lng?: number;
  }): Promise<Hotel[]> {
    await this.syncFromFirestore();
    let result = [...this.data.hotels];
    if (filter?.category && filter.category !== 'all') {
      if (filter.category === 'hourly') {
        result = result.filter((h) => h.category === 'hourly' || h.category === 'trip');
      } else if (filter.category === 'regular') {
        result = result.filter((h) => h.category === 'regular' || h.category === 'trip');
      } else {
        result = result.filter((h) => h.category === filter.category);
      }
    }
    if (filter?.city) {
      result = result.filter((h) => h.city.toLowerCase().includes(filter.city!.toLowerCase()));
    }
    if (filter?.propertyType && filter.propertyType !== 'all') {
      result = result.filter((h) => h.propertyType === filter.propertyType);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q) ||
          h.city.toLowerCase().includes(q) ||
          h.amenities.some((a) => a.toLowerCase().includes(q))
      );
    }
    if (filter?.minPrice !== undefined) {
      result = result.filter((h) => (h.monthlyRent || h.startingPrice) >= filter.minPrice!);
    }
    if (filter?.maxPrice !== undefined) {
      result = result.filter((h) => (h.monthlyRent || h.startingPrice) <= filter.maxPrice!);
    }
    if (filter?.status && filter.status !== 'all') {
      result = result.filter((h) => h.status === filter.status);
    }
    if (filter?.ownerId) {
      result = result.filter((h) => h.ownerId === filter.ownerId);
    }
    if (filter?.approvalStatus) {
      result = result.filter((h) => h.approvalStatus === filter.approvalStatus);
    }

    // Distance calculation and sorting if user coordinates provided
    if (filter?.lat !== undefined && filter?.lng !== undefined) {
      const uLat = filter.lat;
      const uLng = filter.lng;
      result = (result as (Hotel & { distanceKm?: number })[]).map((h) => {
        if (h.latitude && h.longitude) {
          const d = calculateDistanceKm(uLat, uLng, h.latitude, h.longitude);
          return { ...h, distanceKm: d };
        }
        return { ...h, distanceKm: 9999 };
      });
      result.sort((a, b) => ((a as any).distanceKm ?? 9999) - ((b as any).distanceKm ?? 9999));
    }

    return result;
  }

  async getHotelById(id: string): Promise<Hotel | null> {
    await this.syncFromFirestore();
    const hotel = this.data.hotels.find((h) => h.hotelId === id || h.slug === id);
    if (!hotel) return null;
    const rooms = this.data.rooms.filter((r) => r.hotelId === hotel.hotelId);
    return { ...hotel, rooms };
  }

  async createHotel(hotel: Omit<Hotel, 'hotelId' | 'slug' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount'>): Promise<Hotel> {
    const hotelId = 'hotel_' + Date.now();
    const slug = hotel.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
    const newHotel: Hotel = {
      ...hotel,
      hotelId,
      slug,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.hotels.push(newHotel);
    this.saveDatabase();
    this.lastFirestoreSync = Date.now();
    await this.syncFirestoreDoc('hotels', hotelId, newHotel);
    return newHotel;
  }

  async updateHotel(id: string, updates: Partial<Hotel>): Promise<Hotel | null> {
    await this.syncFromFirestore();
    const index = this.data.hotels.findIndex((h) => h.hotelId === id);
    if (index === -1) return null;
    this.data.hotels[index] = {
      ...this.data.hotels[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveDatabase();
    this.lastFirestoreSync = Date.now();
    await this.syncFirestoreDoc('hotels', id, this.data.hotels[index]);
    return this.data.hotels[index];
  }

  async deleteHotel(id: string): Promise<boolean> {
    const initialLen = this.data.hotels.length;
    this.data.hotels = this.data.hotels.filter((h) => h.hotelId !== id);
    if (this.data.hotels.length !== initialLen) {
      this.saveDatabase();
      this.lastFirestoreSync = Date.now();
      await this.deleteFirestoreDoc('hotels', id);
      return true;
    }
    return false;
  }

  // ROOMS
  async getRooms(hotelId: string): Promise<Room[]> {
    await this.syncFromFirestore();
    return this.data.rooms.filter((r) => r.hotelId === hotelId);
  }

  async getRoomsByHotel(hotelId: string): Promise<Room[]> {
    return this.getRooms(hotelId);
  }

  async getRoomById(roomId: string): Promise<Room | null> {
    await this.syncFromFirestore();
    return this.data.rooms.find((r) => r.roomId === roomId) || null;
  }

  async createRoom(room: Omit<Room, 'roomId'>): Promise<Room> {
    const roomId = 'room_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newRoom: Room = {
      ...room,
      roomId
    };
    this.data.rooms.push(newRoom);
    this.saveDatabase();
    this.lastFirestoreSync = Date.now();
    await this.syncFirestoreDoc('rooms', roomId, newRoom);
    return newRoom;
  }

  async updateRoom(roomId: string, updates: Partial<Room>): Promise<Room | null> {
    await this.syncFromFirestore();
    const index = this.data.rooms.findIndex((r) => r.roomId === roomId);
    if (index === -1) return null;
    this.data.rooms[index] = {
      ...this.data.rooms[index],
      ...updates
    };
    this.saveDatabase();
    this.lastFirestoreSync = Date.now();
    await this.syncFirestoreDoc('rooms', roomId, this.data.rooms[index]);
    return this.data.rooms[index];
  }

  async deleteRoom(roomId: string): Promise<boolean> {
    const initLen = this.data.rooms.length;
    this.data.rooms = this.data.rooms.filter((r) => r.roomId !== roomId);
    if (this.data.rooms.length !== initLen) {
      this.saveDatabase();
      this.lastFirestoreSync = Date.now();
      await this.deleteFirestoreDoc('rooms', roomId);
      return true;
    }
    return false;
  }

  // BOOKINGS
  async getBookings(filter?: { userId?: string; hotelId?: string; status?: string; paymentStatus?: string; category?: string; search?: string }): Promise<Booking[]> {
    await this.syncFromFirestore();
    let result = [...this.data.bookings];
    if (filter?.userId) {
      result = result.filter((b) => b.userId === filter.userId);
    }
    if (filter?.hotelId) {
      result = result.filter((b) => b.hotelId === filter.hotelId);
    }
    if (filter?.status && filter.status !== 'all') {
      result = result.filter((b) => b.bookingStatus === filter.status);
    }
    if (filter?.paymentStatus && filter.paymentStatus !== 'all') {
      result = result.filter((b) => b.paymentStatus === filter.paymentStatus);
    }
    if (filter?.category && filter.category !== 'all') {
      result = result.filter((b) => b.stayCategory === filter.category);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (b) =>
          b.bookingReference.toLowerCase().includes(q) ||
          b.hotelName.toLowerCase().includes(q) ||
          b.guestDetails.fullName.toLowerCase().includes(q) ||
          b.guestDetails.phone.includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getBookingById(id: string): Promise<Booking | null> {
    await this.syncFromFirestore();
    return this.data.bookings.find((b) => b.bookingId === id || b.bookingReference === id) || null;
  }

  async createBooking(bookingData: Omit<Booking, 'bookingId' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    const bookingId = 'bk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newBooking: Booking = {
      ...bookingData,
      bookingId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.bookings.push(newBooking);
    this.saveDatabase();
    this.lastFirestoreSync = Date.now();
    await this.syncFirestoreDoc('bookings', bookingId, newBooking);
    return newBooking;
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
    const index = this.data.bookings.findIndex((b) => b.bookingId === id);
    if (index === -1) return null;
    this.data.bookings[index] = {
      ...this.data.bookings[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveDatabase();
    this.lastFirestoreSync = Date.now();
    await this.syncFirestoreDoc('bookings', id, this.data.bookings[index]);
    return this.data.bookings[index];
  }

  async deleteBooking(id: string): Promise<boolean> {
    const index = this.data.bookings.findIndex((b) => b.bookingId === id || b.bookingReference === id);
    if (index === -1) return false;
    const booking = this.data.bookings[index];
    this.data.bookings.splice(index, 1);
    this.saveDatabase();
    this.lastFirestoreSync = Date.now();
    await this.deleteFirestoreDoc('bookings', booking.bookingId);
    return true;
  }

  // REVIEWS
  async getReviews(hotelId?: string): Promise<Review[]> {
    await this.syncFromFirestore();
    if (hotelId) return this.data.reviews.filter((r) => r.hotelId === hotelId);
    return this.data.reviews;
  }

  async createReview(review: Omit<Review, 'reviewId' | 'createdAt'>): Promise<Review> {
    const reviewId = 'rev_' + Date.now();
    const newReview: Review = {
      ...review,
      reviewId,
      createdAt: new Date().toISOString()
    };
    this.data.reviews.push(newReview);

    // Update hotel average rating
    const hotelReviews = this.data.reviews.filter((r) => r.hotelId === review.hotelId);
    const avg = hotelReviews.reduce((sum, r) => sum + r.rating, 0) / hotelReviews.length;
    await this.updateHotel(review.hotelId, {
      rating: Number(avg.toFixed(1)),
      reviewCount: hotelReviews.length
    });

    this.saveDatabase();
    this.lastFirestoreSync = Date.now();
    await this.syncFirestoreDoc('reviews', reviewId, newReview);
    return newReview;
  }

  async deleteReview(reviewId: string): Promise<boolean> {
    const index = this.data.reviews.findIndex((r) => r.reviewId === reviewId);
    if (index === -1) return false;
    const review = this.data.reviews[index];
    const hotelId = review.hotelId;
    this.data.reviews.splice(index, 1);

    // Update hotel average rating & review count
    const hotelReviews = this.data.reviews.filter((r) => r.hotelId === hotelId);
    if (hotelReviews.length > 0) {
      const avg = hotelReviews.reduce((sum, r) => sum + r.rating, 0) / hotelReviews.length;
      await this.updateHotel(hotelId, {
        rating: Number(avg.toFixed(1)),
        reviewCount: hotelReviews.length
      });
    } else {
      await this.updateHotel(hotelId, {
        rating: 0,
        reviewCount: 0
      });
    }

    this.saveDatabase();
    this.lastFirestoreSync = Date.now();
    await this.deleteFirestoreDoc('reviews', reviewId);
    return true;
  }

  // USERS
  async getUserByEmail(email: string): Promise<UserProfile | null> {
    await this.syncFromFirestore();
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async getUserByPhone(phone: string): Promise<UserProfile | null> {
    await this.syncFromFirestore();
    const clean = phone.replace(/[^0-9]/g, '');
    return this.data.users.find((u) => u.phone?.replace(/[^0-9]/g, '') === clean) || null;
  }

  async getUserById(uid: string): Promise<UserProfile | null> {
    await this.syncFromFirestore();
    return this.data.users.find((u) => u.uid === uid) || null;
  }

  async getAllUsers(): Promise<UserProfile[]> {
    await this.syncFromFirestore();
    return [...this.data.users];
  }

  async saveUser(user: UserProfile): Promise<UserProfile> {
    const index = this.data.users.findIndex((u) => u.uid === user.uid);
    let saved: UserProfile;
    if (index >= 0) {
      saved = { ...this.data.users[index], ...user, updatedAt: new Date().toISOString() };
      this.data.users[index] = saved;
    } else {
      saved = user;
      this.data.users.push(saved);
    }
    this.saveDatabase();
    this.lastFirestoreSync = Date.now();
    await this.syncFirestoreDoc('users', user.uid, saved);
    return saved;
  }

  async updateUser(uid: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const index = this.data.users.findIndex((u) => u.uid === uid);
    if (index === -1) return null;
    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveDatabase();
    this.lastFirestoreSync = Date.now();
    await this.syncFirestoreDoc('users', uid, this.data.users[index]);
    return this.data.users[index];
  }

  async deleteUser(uid: string): Promise<boolean> {
    const index = this.data.users.findIndex((u) => u.uid === uid);
    if (index === -1) return false;
    this.data.users.splice(index, 1);
    this.saveDatabase();
    this.lastFirestoreSync = Date.now();
    await this.deleteFirestoreDoc('users', uid);
    return true;
  }

  // PLATFORM SETTINGS
  async getSettings(): Promise<PlatformSettings> {
    await this.syncFromFirestore();
    if (!this.data.settings) {
      this.data.settings = { ...DEFAULT_SETTINGS };
      this.saveDatabase();
    }
    return this.data.settings;
  }

  async updateSettings(updates: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const current = await this.getSettings();
    this.data.settings = {
      ...current,
      ...updates,
      announcementBanner: {
        ...current.announcementBanner,
        ...(updates.announcementBanner || {})
      }
    };
    this.saveDatabase();
    this.lastFirestoreSync = Date.now();
    await this.syncFirestoreDoc('settings', 'platform_settings', this.data.settings);
    return this.data.settings;
  }

  // OTP MANAGEMENT
  saveOtp(phone: string, otp: string, ttlMinutes = 10) {
    const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
    this.data.otps = this.data.otps.filter((o) => o.phone !== phone);
    this.data.otps.push({ phone, otp, expiresAt });
    this.saveDatabase();
  }

  verifyOtp(phone: string, otp: string): boolean {
    const record = this.data.otps.find((o) => o.phone === phone);
    if (!record) return false;
    if (Date.now() > record.expiresAt) return false;
    if (record.otp === otp) {
      this.data.otps = this.data.otps.filter((o) => o.phone !== phone);
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // METRICS
  async getMetrics() {
    await this.syncFromFirestore();
    const confirmed = this.data.bookings.filter((b) => b.bookingStatus === 'confirmed');
    const grossBookingValue = confirmed.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
    const advancePaymentsReceived = confirmed.reduce((acc, b) => acc + (b.paidAmount || 0), 0);
    const outstandingBalances = confirmed.reduce((acc, b) => acc + (b.remainingBalance || 0), 0);
    const totalBookings = this.data.bookings.length;
    const totalHotels = this.data.hotels.length;
    const studentStays = this.data.hotels.filter((h) => h.category === 'student').length;
    const familyStays = this.data.hotels.filter((h) => h.category === 'family').length;
    const tripStays = this.data.hotels.filter((h) => h.category === 'trip').length;

    return {
      grossBookingValue,
      advancePaymentsReceived,
      outstandingBalances,
      totalBookings,
      totalHotels,
      studentStays,
      familyStays,
      tripStays
    };
  }
}

// Singleton database instance
export const db = new DatabaseService();
