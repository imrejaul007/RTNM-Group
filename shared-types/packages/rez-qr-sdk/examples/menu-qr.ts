/**
 * Menu QR Example - Restaurant menu, ordering, and split bill
 *
 * This example demonstrates the complete flow for a diner
 * using a QR code to access a restaurant's digital menu.
 */

import { QRSDK } from '../src';

// Initialize SDK
const sdk = new QRSDK({
  apiKey: process.env.REZ_API_KEY,
  environment: 'production',
});

/**
 * Scenario 1: Guest scans menu QR and orders food
 */
async function menuOrderingFlow() {
  const storeId = 'restaurant-123';

  try {
    // Step 1: Get full menu
    console.log('Loading menu...');
    const menu = await sdk.menu.getMenu(storeId);
    console.log(`Welcome to ${menu.storeName}!`);
    console.log(`Categories: ${menu.categories.map((c) => c.name).join(', ')}`);

    // Step 2: Filter for dietary preferences
    const dietaryFilters = {
      vegetarian: true,
      glutenFree: true,
    };
    const filteredItems = sdk.menu.filterByDietary(menu.items, dietaryFilters);
    console.log(`Found ${filteredItems.length} vegetarian, gluten-free items`);

    // Step 3: Get AI recommendations
    const recommendations = await sdk.ai.getMenuRecommendations(storeId, undefined, ['vegetarian']);
    console.log('AI Recommendations:');
    recommendations.forEach((rec) => {
      console.log(`  - ${rec.title}: ${rec.description}`);
      console.log(`    Price: ${rec.currency} ${rec.price}`);
      console.log(`    Why: ${rec.reasons.join(', ')}`);
    });

    // Step 4: Search for specific item
    console.log('\nSearching for "pasta"...');
    const searchResults = await sdk.menu.searchItems(storeId, 'pasta');
    console.log(`Found ${searchResults.length} pasta dishes`);

    // Step 5: Add items to cart
    console.log('\nAdding items to cart...');
    const cart1 = await sdk.menu.addToCart(storeId, 'pasta-1', 1);
    console.log(`Added pasta to cart. Cart ID: ${cart1.cartId}, Items: ${cart1.itemCount}`);

    const cart2 = await sdk.menu.addToCart(storeId, 'salad-1', 2, [
      { id: 'dressing', options: ['balsamic'] },
    ]);
    console.log(`Added salads. Cart ID: ${cart2.cartId}, Items: ${cart2.itemCount}`);

    // Step 6: Apply promo code
    console.log('\nApplying promo code...');
    const promoResult = await sdk.menu.applyPromoCode(cart1.cartId, 'FIRST20');
    console.log(`Discount: ${promoResult.discount}, New Total: ${promoResult.newTotal}`);

    // Step 7: Place order
    console.log('\nPlacing order...');
    const order = await sdk.menu.placeOrder(storeId, cart1.cartId, {
      tableNumber: '12',
      notes: 'Window seat preferred',
      priority: { level: 'normal' },
    });
    console.log(`Order placed! ID: ${order.orderId}, Status: ${order.status}`);
    console.log(`Estimated ready: ${order.estimatedReadyTime}`);

    // Step 8: Get order status
    console.log('\nChecking order status...');
    const orderDetails = await sdk.menu.getOrder(order.orderId);
    console.log(`Current status: ${orderDetails.status}`);
    console.log(`Items: ${orderDetails.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}`);

    // Step 9: Call waiter if needed
    console.log('\nCalling waiter...');
    await sdk.menu.callWaiter(storeId, { level: 'normal', note: 'Need napkins' });
    console.log('Waiter notified');

    // Step 10: Get bill and split
    console.log('\nRequesting bill...');
    const bill = await sdk.menu.requestBill(storeId, order.orderId);
    console.log(`Bill total: $${bill.total}`);

    // Step 11: Split bill equally
    console.log('\nSplitting bill for 3 people...');
    const splits = [
      { type: 'equal' },
      { type: 'equal' },
      { type: 'equal' },
    ];
    const splitResult = await sdk.menu.splitBill(order.orderId, splits);
    console.log(`Split into ${splitResult.splits.length} portions`);
    console.log(`Each person pays: $${(splitResult.totalAmount / 3).toFixed(2)}`);

    // Step 12: Checkout
    console.log('\nProcessing payment...');
    const receipt = await sdk.menu.checkout(order.orderId, {
      method: 'wallet',
      amount: bill.total,
    });
    console.log(`Payment successful! Receipt: ${receipt.id}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Scenario 2: Making a reservation
 */
async function reservationFlow() {
  const storeId = 'restaurant-123';

  console.log('Checking reservation availability...');
  const slots = await sdk.menu.getReservationSlots(storeId, '2024-01-20', 4);
  const eveningSlots = slots.filter((s) => s.time >= '18:00' && s.available);
  console.log('Available evening slots:', eveningSlots);

  if (eveningSlots.length > 0) {
    console.log('\nMaking reservation...');
    const reservation = await sdk.menu.makeReservation(storeId, {
      date: '2024-01-20',
      time: '19:00',
      partySize: 4,
      name: 'John Doe',
      phone: '+1234567890',
      notes: 'Birthday celebration, need cake at the end',
    });
    console.log(`Reservation confirmed!`);
    console.log(`Confirmation Code: ${reservation.confirmationCode}`);

    // Cancel reservation if needed
    // await sdk.menu.cancelReservation(reservation.reservationId);
    // console.log('Reservation cancelled');
  }
}

/**
 * Scenario 3: Split bill by items
 */
async function splitBillByItemsFlow() {
  const orderId = 'order-123';

  // Get split options
  console.log('Getting split options...');
  const options = await sdk.menu.getSplitOptions(orderId);
  console.log(`Total: $${options.equal.toFixed(2)} per person if equal split`);

  // Split by items
  console.log('\nSplitting by items...');
  const splits = [
    { type: 'item', userId: 'user-1', itemIds: ['item-1', 'item-2'] },
    { type: 'item', userId: 'user-2', itemIds: ['item-3', 'item-4'] },
  ];
  const splitResult = await sdk.menu.splitBill(orderId, splits);
  console.log('Split result:');
  splitResult.splits.forEach((s) => {
    console.log(`  User ${s.userId}: $${s.amount.toFixed(2)}`);
  });

  // Custom split
  console.log('\nCustom split...');
  const customSplits = [
    { type: 'custom', userId: 'user-1', amount: 45.50 },
    { type: 'custom', userId: 'user-2', amount: 32.00 },
  ];
  const customResult = await sdk.menu.splitBill(orderId, customSplits);
  console.log('Custom split result:', customResult);
}

/**
 * Scenario 4: Dietary-conscious ordering with AI
 */
async function dietaryOrderingFlow() {
  const storeId = 'restaurant-123';

  console.log('Getting full menu...');
  const menu = await sdk.menu.getMenu(storeId);

  // Check order compliance
  console.log('\nChecking dietary compliance...');
  const compliance = await sdk.ai.analyzeOrderCompliance(
    [
      { itemId: 'pasta-1', name: 'Creamy Pasta' },
      { itemId: 'salad-1', name: 'Garden Salad' },
      { itemId: 'soup-1', name: 'Wheat Soup' },
    ],
    ['vegetarian', 'gluten_free']
  );

  if (!compliance.compliant) {
    console.log('Dietary warnings:');
    compliance.issues.forEach((issue) => {
      console.log(`  [${issue.severity.toUpperCase()}] ${issue.itemName}: ${issue.issue}`);
    });
  }

  console.log('\nSafe items:');
  compliance.safeItems.forEach((item) => {
    console.log(`  - ${item.itemName}`);
  });

  // Get dietary recommendations
  console.log('\nGetting dietary recommendations...');
  const dietaryRecs = await sdk.ai.getDietaryRecommendations(['vegetarian', 'gluten_free']);
  console.log('Recommended ingredients:', dietaryRecs);
}

/**
 * Scenario 5: Restaurant reviews and ratings
 */
async function reviewsFlow() {
  const storeId = 'restaurant-123';

  console.log('Getting reviews...');
  const reviews = await sdk.store.getReviews(storeId, { page: 1, limit: 10 });
  console.log(`Average rating: ${reviews.averageRating}/5`);
  console.log(`Total reviews: ${reviews.total}`);
  console.log('\nRecent reviews:');
  reviews.items.forEach((review) => {
    console.log(`  [${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}] ${review.comment || '(No comment)'}`);
    console.log(`  - ${review.userName}, ${review.createdAt}`);
  });

  // Submit own review
  console.log('\nSubmitting review...');
  const submitted = await sdk.store.submitReview(storeId, {
    rating: 4,
    comment: 'Great food and ambiance! Will come again.',
  });
  console.log(`Review submitted: ${submitted.reviewId}`);
}

// Run all examples
async function runExamples() {
  console.log('=== Menu QR Examples ===\n');

  console.log('--- Scenario 1: Menu Ordering Flow ---');
  await menuOrderingFlow();

  console.log('\n--- Scenario 2: Reservation Flow ---');
  await reservationFlow();

  console.log('\n--- Scenario 3: Split Bill by Items ---');
  await splitBillByItemsFlow();

  console.log('\n--- Scenario 4: Dietary-Conscious Ordering ---');
  await dietaryOrderingFlow();

  console.log('\n--- Scenario 5: Reviews ---');
  await reviewsFlow();

  console.log('\n=== All examples completed ===');
}

// Export for use in other examples
export { menuOrderingFlow, reservationFlow, splitBillByItemsFlow, dietaryOrderingFlow, reviewsFlow };
