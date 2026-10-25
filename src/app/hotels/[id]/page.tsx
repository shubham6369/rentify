'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Hotel, Room, Review } from '@/types';
import { CategoryBadge } from '@/components/CategoryBadge';
import { useAuth } from '@/context/AuthContext';
import {
  MapPin,
  Star,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Utensils,
  Wifi,
  BookOpen,
  Users,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Info,
  GraduationCap
} from 'lucide-react';

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const hotelId = params?.id as string;

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Review submission state
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadHotel() {
      try {
        const res = await fetch(`/api/hotels/${hotelId}`);
        const data = await res.json();
        if (data.success && data.hotel) {
          setHotel(data.hotel);
          if (data.hotel.rooms && data.hotel.rooms.length > 0) {
            setSelectedRoom(data.hotel.rooms[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load hotel detail:', err);
      } finally {
        setLoading(false);
      }
    }
    if (hotelId) loadHotel();
  }, [hotelId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId: hotel?.hotelId,
          userId: user?.uid || 'guest_anon',
          userName: user?.fullName || 'Verified Guest',
          rating: ratingInput,
          comment: commentInput,
          stayCategory: hotel?.category
        })
      });
      const data = await res.json();
      if (data.success) {
        setReviewMsg('Thank you! Your verified review has been posted.');
        setCommentInput('');
        // Refresh hotel data
        const rRes = await fetch(`/api/hotels/${hotelId}`);
        const rData = await rRes.json();
        if (rData.success) setHotel(rData.hotel);
      }
    } catch (err: any) {
      setReviewMsg(err?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading property details...
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Property Not Found</h2>
        <p className="text-slate-500 text-sm">The accommodation listing could not be located.</p>
        <Link
          href="/hotels"
          className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
        >
          Return to Accommodations
        </Link>
      </div>
    );
  }

  const isStudent = hotel.category === 'student';
  const isFamily = hotel.category === 'family';

  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const images = hotel.images && hotel.images.length > 0 ? hotel.images : [hotel.coverImage];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-slate-900">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/hotels?category=${hotel.category}`} className="hover:text-slate-900 capitalize">
          {hotel.category} Stay
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 truncate max-w-[200px] sm:max-w-xs">{hotel.name}</span>
      </div>

      {/* Title & Badges Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <CategoryBadge category={hotel.category} />
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800">
              {hotel.propertyType}
            </span>
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{hotel.rating.toFixed(1)}</span>
              <span className="text-slate-500 font-normal">({hotel.reviewCount} reviews)</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            {hotel.name}
          </h1>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-2">
            <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{hotel.address}, {hotel.city}, {hotel.state} - {hotel.postalCode}</span>
          </div>
        </div>

        {/* Quick price card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 self-start md:self-auto">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              {isStudent ? 'Monthly Academic Rent' : 'Starting Price'}
            </span>
            <span className="text-2xl font-bold text-slate-900">
              {isStudent
                ? formatINR(hotel.monthlyRent || hotel.startingPrice)
                : formatINR(hotel.startingPrice)}
            </span>
            <span className="text-xs text-slate-500 font-medium"> {isStudent ? '/ month' : '/ night'}</span>
          </div>
          <Link
            href={`/book?hotelId=${hotel.hotelId}&category=${hotel.category}`}
            className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Reserve Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="space-y-3">
        <div className="relative aspect-16/9 md:aspect-21/9 w-full rounded-3xl overflow-hidden bg-slate-900 shadow-md">
          <img
            src={images[activeImageIndex] || hotel.coverImage}
            alt={hotel.name}
            className="w-full h-full object-cover transition-all duration-300"
          />
        </div>

        {images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                  activeImageIndex === idx
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 scale-105'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Layout Grid: Details on Left, Booking Box on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 columns: Overview, Rooms, Amenities, Rules, Reviews */}
        <div className="lg:col-span-8 space-y-8">
          {/* About Accommodation */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">About This Accommodation</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{hotel.description}</p>

            {/* Category-Specific Highlight Banner */}
            {isStudent && (
              <div className="p-4 bg-indigo-50/70 border border-indigo-200/60 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>Student & Scholar Specific Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-indigo-800">
                  <p>• <strong>Security Deposit:</strong> {formatINR(hotel.securityDeposit || 12000)} (Refundable at move-out)</p>
                  <p>• <strong>Meal Plan:</strong> 4 hygienic home-cooked meals included daily</p>
                  <p>• <strong>Biometric Curfew:</strong> 10:30 PM (Parents notified on app)</p>
                  <p>• <strong>Study Pods:</strong> 300 Mbps ergonomic library on site</p>
                </div>
              </div>
            )}

            {isFamily && (
              <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>Family & Child Friendly Amenities</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-amber-800">
                  <p>• <strong>Advance Required:</strong> 30% to reserve, balance due at check-in</p>
                  <p>• <strong>Child Cots / Cribs:</strong> Available upon request</p>
                  <p>• <strong>Modular Kitchen:</strong> Microwave, refrigerator, RO water</p>
                  <p>• <strong>Private Lawn:</strong> Secure fenced play area for kids</p>
                </div>
              </div>
            )}
          </div>

          {/* Rooms & Options */}
          {hotel.rooms && hotel.rooms.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Available Rooms & Units</h2>
              <div className="space-y-3">
                {hotel.rooms.map((room) => {
                  const isSelected = selectedRoom?.roomId === room.roomId;
                  return (
                    <div
                      key={room.roomId}
                      onClick={() => setSelectedRoom(room)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{room.roomType}</h4>
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                            {room.bedType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{room.description}</p>
                        <p className="text-[11px] text-slate-600 font-medium">
                          Capacity: Max {room.capacity.maxGuests} Guests ({room.capacity.adults} Adults, {room.capacity.children} Children)
                        </p>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <span className="text-base font-extrabold text-slate-900">
                          {isStudent
                            ? formatINR(room.monthlyPrice || room.basePrice)
                            : formatINR(room.basePrice)}
                        </span>
                        <span className="text-xs text-slate-500 block">
                          {isStudent ? '/ month' : '/ night'}
                        </span>
                        <span className="inline-block mt-1 text-[11px] font-bold text-indigo-600">
                          {isSelected ? '✓ Selected' : 'Select Unit'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Amenities Grid */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Property Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {hotel.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rules and Policies */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">House Rules & Cancellation Policy</h2>
            <div className="space-y-2">
              {hotel.rules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="font-bold text-indigo-600">•</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Cancellation Policy: </span>
                <span>{hotel.cancellationDescription}</span>
              </div>
            </div>
          </div>

          {/* Reviews & Ratings Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Verified Guest Reviews</h2>
                <p className="text-xs text-slate-500">
                  Rated {hotel.rating.toFixed(1)} out of 5 from {hotel.reviewCount} customer reviews.
                </p>
              </div>
            </div>

            {/* Add Review Form */}
            <form onSubmit={handleReviewSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Write a Review
              </h4>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-600 font-medium">Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingInput(star)}
                      className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= ratingInput ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-800">{ratingInput} / 5 Stars</span>
              </div>

              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Share your experience regarding food, cleanliness, study atmosphere, or child safety..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none h-20"
                required
              />

              {reviewMsg && (
                <p className="text-xs font-semibold text-emerald-600">{reviewMsg}</p>
              )}

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                {reviewSubmitting ? 'Submitting...' : 'Post Verified Review'}
              </button>
            </form>

            {/* Existing Reviews List */}
            <div className="space-y-3">
              {hotel.reviews && hotel.reviews.length > 0 ? (
                hotel.reviews.map((rev) => (
                  <div key={rev.reviewId} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{rev.userName}</span>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No reviews posted yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right 4 columns: Sticky Booking & Advance Breakdown Widget */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {isStudent ? 'Monthly Rate' : 'Nightly Rate'}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-black text-slate-900">
                  {isStudent
                    ? formatINR(hotel.monthlyRent || hotel.startingPrice)
                    : formatINR(hotel.startingPrice)}
                </span>
                <span className="text-xs text-slate-500">
                  {isStudent ? '/ month' : '/ night'}
                </span>
              </div>
            </div>

            {/* Advance payment highlight */}
            <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
                <span>Advance Required:</span>
                <span>
                  {isStudent && hotel.securityDeposit
                    ? formatINR(hotel.securityDeposit)
                    : `${hotel.advancePaymentValue}${hotel.advancePaymentType === 'percentage' ? '%' : ' INR'}`}
                </span>
              </div>
              <p className="text-[11px] text-indigo-800">
                {isStudent
                  ? 'Covers refundable security deposit to lock your bed.'
                  : 'Pay the advance now; balance payable upon physical arrival.'}
              </p>
            </div>

            {/* Selected Room Details */}
            {selectedRoom && (
              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Selected Unit:</span>
                  <span className="font-semibold text-slate-800">{selectedRoom.roomType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Inventory:</span>
                  <span className="font-semibold text-emerald-600">{selectedRoom.totalInventory} Available</span>
                </div>
              </div>
            )}

            {/* Direct Proceed to Dedicated Flow */}
            <Link
              href={`/book?hotelId=${hotel.hotelId}&category=${hotel.category}&roomId=${selectedRoom?.roomId || ''}`}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              <span>Continue to {isStudent ? 'Student' : isFamily ? 'Family' : 'Trip'} Booking</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Razorpay Verified • Free Cancellation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
