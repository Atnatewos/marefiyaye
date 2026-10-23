/**
 * @file apps/web/lib/reviews.js
 *
 * Client-side review API helpers.
 */

import { apiClient } from './apiClient';

/**
 * Submits a review for a COMPLETED booking.
 */
export async function submitReview({ bookingId, rating, comment }) {
  const { review } = await apiClient.post('/api/reviews', {
    bookingId,
    rating,
    comment: comment || undefined,
  });
  return review;
}

/**
 * Fetches reviews for a property.
 */
export async function fetchPropertyReviews(propertyId) {
  const { reviews } = await apiClient.get(`/api/reviews/property/${propertyId}`);
  return reviews;
}