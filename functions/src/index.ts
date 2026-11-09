import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

/**
 * Generates an unguessable, human-friendly 6-character booking code.
 * Example format: "FT-8492" or "CR-1029"
 */
function createUniqueCode(sport: string = 'FT'): string {
  const prefix = sport.toUpperCase().slice(0, 2);
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomDigits}`;
}

/**
 * Cloud Function triggered when an administrator approves a booking.
 * Generates the official unique booking code and updates slot status atomically.
 */
export const onBookingStatusChanged = functions.firestore
  .document('bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const bookingId = context.params.bookingId;

    // Transition from pending to confirmed
    if (beforeData.status === 'pending' && afterData.status === 'confirmed') {
      const bookingCode = afterData.bookingCode || createUniqueCode(afterData.sport || 'FT');
      
      const batch = db.batch();
      
      // Update booking with the official generated code
      batch.update(change.after.ref, {
        bookingCode,
        confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update associated slot document
      if (afterData.slotId) {
        const slotRef = db.collection('slots').doc(afterData.slotId);
        batch.set(
          slotRef,
          {
            status: 'confirmed',
            bookingId,
            bookingCode,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }

      await batch.commit();
      functions.logger.info(`Booking ${bookingId} approved with code ${bookingCode}`);
    }

    // Transition from pending to rejected
    if (beforeData.status === 'pending' && afterData.status === 'rejected') {
      if (afterData.slotId) {
        const slotRef = db.collection('slots').doc(afterData.slotId);
        // Release slot lock so slot becomes available again
        await slotRef.delete();
        functions.logger.info(`Booking ${bookingId} rejected. Slot ${afterData.slotId} released.`);
      }
    }
  });

/**
 * Scheduled function to expire pending bookings older than expiration threshold
 * (Proposed: 30 minutes, awaiting confirmation from business owner).
 */
export const expireStalePendingBookings = functions.pubsub
  .schedule('every 10 minutes')
  .onRun(async () => {
    const expirationMinutes = 30; // Pending timeout in minutes
    const expirationThreshold = new Date(Date.now() - expirationMinutes * 60 * 1000);

    const staleSnapshot = await db
      .collection('bookings')
      .where('status', '==', 'pending')
      .where('createdAt', '<=', expirationThreshold)
      .get();

    if (staleSnapshot.empty) {
      return null;
    }

    const batch = db.batch();
    staleSnapshot.forEach((doc) => {
      const data = doc.data();
      batch.update(doc.ref, {
        status: 'expired',
        expiredAt: admin.firestore.FieldValue.serverTimestamp(),
        expirationReason: 'Pending confirmation window timed out',
      });

      if (data.slotId) {
        const slotRef = db.collection('slots').doc(data.slotId);
        batch.delete(slotRef);
      }
    });

    await batch.commit();
    functions.logger.info(`Expired ${staleSnapshot.size} stale pending bookings.`);
    return null;
  });
