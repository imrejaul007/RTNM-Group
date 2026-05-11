/**
 * Store QR Example (Rez Now / Linktree) - Profile, links, and analytics
 *
 * This example demonstrates how businesses can use
 * Linktree-style profiles for their brand.
 */

import { QRSDK } from '../src';

// Initialize SDK
const sdk = new QRSDK({
  apiKey: process.env.REZ_API_KEY,
  environment: 'production',
});

/**
 * Scenario 1: User scans store QR and views profile
 */
async function storeProfileFlow() {
  const slug = 'acme-business';

  try {
    // Step 1: Get store profile
    console.log('Loading store profile...');
    const profile = await sdk.store.getProfile(slug);
    console.log(`\n=== ${profile.name} ===`);
    console.log(`Description: ${profile.description || 'No description'}`);
    console.log(`Verified: ${profile.verified ? 'Yes' : 'No'}`);
    console.log(`Location: ${profile.location?.city}, ${profile.location?.country}`);

    // Step 2: Display links
    console.log('\n--- Available Links ---');
    profile.links.forEach((link) => {
      const icon = link.icon || '🔗';
      console.log(`${icon} ${link.title} (${link.type})`);
    });

    // Step 3: Get AI recommendations for similar stores
    const recs = await sdk.ai.getStoreRecommendations(undefined, {
      lat: profile.location?.coordinates?.latitude || 0,
      lng: profile.location?.coordinates?.longitude || 0,
    });
    console.log('\nSimilar stores you might like:');
    recs.slice(0, 3).forEach((rec) => {
      console.log(`  - ${rec.title}`);
    });

    // Step 4: Track the scan event
    await sdk.store.trackEvent(profile.id, {
      eventType: 'scan',
      source: 'qr',
      timestamp: new Date().toISOString(),
      metadata: { device: 'mobile' },
    });
    console.log('\nScan tracked');

    // Step 5: Get store analytics (for merchant view)
    const analytics = await sdk.store.getAnalytics(profile.id, {
      period: 'month',
    });
    console.log('\n--- Store Analytics (Last Month) ---');
    console.log(`Total scans: ${analytics.totalScans}`);
    console.log(`Unique scans: ${analytics.uniqueScans}`);
    console.log(`Conversion rate: ${(analytics.conversionRate * 100).toFixed(1)}%`);
    console.log(`Revenue: $${analytics.revenue.toFixed(2)}`);

    // Step 6: Favorite the store
    await sdk.store.favoriteStore(profile.id);
    console.log('\nStore favorited!');

    // Step 7: Share the store
    const shareResult = await sdk.store.shareStore(profile.id, 'whatsapp');
    console.log(`Share link: ${shareResult.shareUrl}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Scenario 2: Generate QR codes for a store
 */
async function qrGenerationFlow() {
  const storeId = 'store-123';

  console.log('Generating QR codes for store...');

  // Generate different types of QR codes
  const qrTypes: Array<{ type: 'menu' | 'order' | 'payment' | 'feedback' | 'loyalty'; desc: string }> = [
    { type: 'menu', desc: 'Digital Menu' },
    { type: 'order', desc: 'Order Online' },
    { type: 'payment', desc: 'Pay with REZ' },
    { type: 'feedback', desc: 'Leave Feedback' },
    { type: 'loyalty', desc: 'Join Loyalty Program' },
  ];

  const generatedQRCodes = [];
  for (const { type, desc } of qrTypes) {
    const qr = await sdk.store.generateQR(storeId, type, {
      size: 300,
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF',
    });
    console.log(`Generated ${desc} QR: ${qr.id}`);
    generatedQRCodes.push(qr);
  }

  // Get all generated QR codes
  console.log('\nFetching all generated QRs...');
  const allQRCodes = await sdk.store.getQRCodes(storeId);
  console.log(`Total QR codes: ${allQRCodes.length}`);

  // Get QR analytics
  console.log('\nFetching QR analytics...');
  for (const qr of generatedQRCodes) {
    const qrAnalytics = await sdk.store.getQRAnalytics(storeId, qr.id);
    console.log(`QR ${qr.id}: ${qrAnalytics.totalScans} scans`);
  }
}

/**
 * Scenario 3: Business owner views their store analytics
 */
async function merchantAnalyticsFlow() {
  const storeId = 'store-123';

  console.log('Fetching store analytics...');

  // Get overall analytics
  const analytics = await sdk.store.getAnalytics(storeId, {
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    period: 'month',
  });

  console.log('\n=== Store Performance Report ===');
  console.log(`\nScans:`);
  console.log(`  Total: ${analytics.totalScans}`);
  console.log(`  Unique: ${analytics.uniqueScans}`);
  console.log(`  Average daily: ${(analytics.totalScans / 30).toFixed(1)}`);

  console.log(`\nClicks:`);
  console.log(`  Total: ${analytics.totalClicks}`);
  console.log(`  Unique: ${analytics.uniqueClicks}`);

  console.log(`\nConversions:`);
  console.log(`  Purchases: ${analytics.totalPurchases}`);
  console.log(`  Revenue: $${analytics.revenue.toFixed(2)}`);
  console.log(`  Conversion Rate: ${(analytics.conversionRate * 100).toFixed(2)}%`);

  console.log(`\nTop Links:`);
  analytics.topLinks.forEach((link, i) => {
    console.log(`  ${i + 1}. ${link.title}: ${link.clicks} clicks`);
  });

  console.log(`\nDaily Scan Trend:`);
  analytics.scansByDay.slice(-7).forEach((day) => {
    console.log(`  ${day.date}: ${day.count} scans`);
  });

  // Get link-specific analytics
  console.log('\n=== Link Analytics ===');
  for (const link of analytics.topLinks.slice(0, 3)) {
    const linkAnalytics = await sdk.store.getLinkAnalytics(storeId, link.linkId);
    console.log(`\n${link.title}:`);
    console.log(`  Clicks: ${linkAnalytics.clicks}`);
    console.log(`  Top cities: ${linkAnalytics.locations.slice(0, 3).map((l) => l.city).join(', ')}`);
    console.log(`  Devices: ${linkAnalytics.devices.map((d) => `${d.type}: ${d.count}`).join(', ')}`);
  }
}

/**
 * Scenario 4: Search and discover stores
 */
async function searchAndDiscoveryFlow() {
  console.log('=== Store Discovery ===\n');

  // Search stores
  console.log('Searching for "coffee shop"...');
  const searchResults = await sdk.store.search('coffee', { limit: 5 });
  console.log(`Found ${searchResults.length} results:`);
  searchResults.forEach((store) => {
    console.log(`  - ${store.name} (${store.location?.city || 'Unknown location'})`);
  });

  // Get nearby stores
  console.log('\nFinding nearby stores (San Francisco)...');
  const nearby = await sdk.store.getNearby(37.7749, -122.4194, 5000); // 5km radius
  console.log(`Found ${nearby.length} nearby stores:`);
  nearby.slice(0, 5).forEach((store) => {
    console.log(`  - ${store.name} (${store.links.length} links)`);
  });

  // Get active campaigns
  console.log('\nLooking for active promotions...');
  const campaigns = await sdk.campaign.getActiveCampaigns({ location: 'San Francisco', limit: 5 });
  console.log(`Found ${campaigns.length} active campaigns:`);
  campaigns.forEach((campaign) => {
    console.log(`  - ${campaign.name} by ${campaign.brandName}`);
    console.log(`    ${campaign.rewards.length} rewards available`);
  });
}

/**
 * Scenario 5: User submits review
 */
async function userReviewFlow() {
  const storeId = 'store-123';

  console.log('Getting store reviews...');
  const reviews = await sdk.store.getReviews(storeId, { page: 1, limit: 5 });
  console.log(`Average rating: ${reviews.averageRating.toFixed(1)}/5`);
  console.log(`Total reviews: ${reviews.total}`);

  console.log('\nRecent reviews:');
  reviews.items.forEach((review) => {
    console.log(`\n[${review.rating}/5] ${review.userName}`);
    console.log(`  ${review.comment || '(No comment)'}`);
    console.log(`  Helpful: ${review.helpful}`);
  });

  // Submit own review
  console.log('\nSubmitting your review...');
  const newReview = await sdk.store.submitReview(storeId, {
    rating: 5,
    comment: 'Absolutely love this place! The service is exceptional and the products are high quality.',
  });
  console.log(`Review submitted successfully: ${newReview.reviewId}`);
}

// Run all examples
async function runExamples() {
  console.log('=== Store QR (Rez Now) Examples ===\n');

  console.log('--- Scenario 1: Store Profile Flow ---');
  await storeProfileFlow();

  console.log('\n--- Scenario 2: QR Code Generation ---');
  await qrGenerationFlow();

  console.log('\n--- Scenario 3: Merchant Analytics ---');
  await merchantAnalyticsFlow();

  console.log('\n--- Scenario 4: Search and Discovery ---');
  await searchAndDiscoveryFlow();

  console.log('\n--- Scenario 5: User Reviews ---');
  await userReviewFlow();

  console.log('\n=== All examples completed ===');
}

// Export for use in other examples
export { storeProfileFlow, qrGenerationFlow, merchantAnalyticsFlow, searchAndDiscoveryFlow, userReviewFlow };
