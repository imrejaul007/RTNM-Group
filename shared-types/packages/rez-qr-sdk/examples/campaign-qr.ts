/**
 * Campaign QR Example (Ads) - Campaigns, rewards, and attribution
 *
 * This example demonstrates how users can interact with
 * advertising campaigns via QR codes.
 */

import { QRSDK } from '../src';

// Initialize SDK
const sdk = new QRSDK({
  apiKey: process.env.REZ_API_KEY,
  environment: 'production',
});

/**
 * Scenario 1: User scans ad campaign QR and claims reward
 */
async function campaignEngagementFlow() {
  const campaignSlug = 'summer-sale-2024';

  try {
    // Step 1: Get campaign details
    console.log('Loading campaign...');
    const campaign = await sdk.campaign.getCampaign(campaignSlug);
    console.log(`\n=== ${campaign.name} ===`);
    console.log(`Brand: ${campaign.brandName}`);
    console.log(`Description: ${campaign.description}`);
    console.log(`Status: ${campaign.status}`);
    console.log(`Ends: ${campaign.endDate || 'Ongoing'}`);

    // Step 2: Display available rewards
    console.log('\n--- Available Rewards ---');
    campaign.rewards.forEach((reward) => {
      console.log(`\n[${reward.type.toUpperCase()}] ${reward.title}`);
      console.log(`  ${reward.description}`);
      if (reward.value) {
        console.log(`  Value: ${reward.currency || '$'}${reward.value}`);
      }
      console.log(`  Claimed: ${reward.claimedCount}/${reward.claimLimit || 'unlimited'}`);
    });

    // Step 3: Get AI recommendations
    const recs = await sdk.ai.getRecommendations({
      source: 'campaign_qr',
      campaignId: campaign.id,
    });
    console.log('\n--- AI Recommendations ---');
    recs.forEach((rec) => {
      console.log(`  - ${rec.title}: ${rec.description}`);
    });

    // Step 4: Chat with AI about the campaign
    console.log('\nChatting with AI...');
    const aiResponse = await sdk.ai.sendMessage(
      "What products are included in this campaign?",
      { source: 'campaign_qr', campaignId: campaign.id }
    );
    console.log(`AI: ${aiResponse.message}`);

    // Step 5: Claim a reward
    console.log('\nClaiming reward...');
    const reward = await sdk.campaign.claimReward(campaign.id, 'discount');
    console.log(`Reward claimed!`);
    console.log(`  Type: ${reward.type}`);
    console.log(`  Title: ${reward.title}`);
    if (reward.code) {
      console.log(`  Code: ${reward.code}`);
    }
    console.log(`  Status: ${reward.status}`);
    if (reward.expiresAt) {
      console.log(`  Expires: ${reward.expiresAt}`);
    }

    // Step 6: Track conversion
    await sdk.campaign.trackConversion(campaign.id, {
      type: 'scan',
      metadata: { rewardClaimed: reward.id },
    });
    console.log('\nConversion tracked');

    // Step 7: View claimed rewards
    console.log('\nFetching all claimed rewards...');
    const claimedRewards = await sdk.campaign.getClaimedRewards();
    console.log(`You have ${claimedRewards.length} claimed rewards`);
    claimedRewards.slice(0, 3).forEach((r) => {
      console.log(`  - ${r.title} (${r.status})`);
    });

    // Step 8: Get campaign analytics
    const analytics = await sdk.campaign.getAnalytics(campaign.id);
    console.log('\n--- Campaign Performance ---');
    console.log(`Total scans: ${analytics.totalScans}`);
    console.log(`Conversion rate: ${(analytics.conversionRate * 100).toFixed(2)}%`);
    console.log(`Rewards claimed: ${analytics.rewardsClaimed}`);
    console.log(`Revenue: $${analytics.revenue.toFixed(2)}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Scenario 2: Book consultation
 */
async function consultationFlow() {
  const campaignId = 'campaign-123';

  console.log('Looking for consultation options...');
  const campaign = await sdk.campaign.getCampaignById(campaignId);

  const consultationReward = campaign.rewards.find((r) => r.type === 'consultation');
  if (!consultationReward) {
    console.log('No consultation available in this campaign');
    return;
  }

  console.log(`\n=== Book ${consultationReward.title} ===`);
  console.log(`Description: ${consultationReward.description}`);

  console.log('\nBooking consultation...');
  const booking = await sdk.campaign.bookConsultation({
    campaignId,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    preferredDate: '2024-01-25',
    preferredTime: '14:00',
    notes: 'Interested in the premium package',
    source: 'qr',
  });

  console.log(`\nConsultation booked!`);
  console.log(`  ID: ${booking.id}`);
  console.log(`  Status: ${booking.status}`);
  console.log(`  Confirmation: ${booking.confirmationCode}`);
  console.log(`  Scheduled: ${booking.scheduledDate} at ${booking.scheduledTime}`);
  console.log(`  Consultant: ${booking.consultantName}`);

  // Track the booking
  await sdk.campaign.trackConversion(campaignId, {
    type: 'signup',
    value: 1,
    metadata: { bookingId: booking.id },
  });
  console.log('\nConsultation booking tracked');

  // Cancel if needed
  // console.log('\nCancelling consultation...');
  // await sdk.campaign.cancelConsultation(booking.id);
  // console.log('Consultation cancelled');
}

/**
 * Scenario 3: Request product sample
 */
async function sampleRequestFlow() {
  const campaignId = 'campaign-123';

  console.log('Checking available samples...');
  const campaign = await sdk.campaign.getCampaignById(campaignId);

  const sampleRewards = campaign.rewards.filter((r) => r.type === 'sample');
  if (sampleRewards.length === 0) {
    console.log('No samples available');
    return;
  }

  console.log(`Found ${sampleRewards.length} samples:`);
  sampleRewards.forEach((sample) => {
    console.log(`  - ${sample.title}`);
    console.log(`    ${sample.description}`);
    console.log(`    Claimed: ${sample.claimedCount}/${sample.claimLimit || 'unlimited'}`);
  });

  // Request a sample
  console.log('\nRequesting sample...');
  const sampleRequest = await sdk.campaign.requestSample(campaignId, sampleRewards[0].id, {
    name: 'John Doe',
    line1: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94102',
    country: 'USA',
  });

  console.log(`\nSample requested!`);
  console.log(`  ID: ${sampleRequest.id}`);
  console.log(`  Status: ${sampleRequest.status}`);
  console.log(`  Sample: ${sampleRequest.sampleName}`);

  // Track the sample request
  await sdk.campaign.trackConversion(campaignId, {
    type: 'signup',
    metadata: { sampleRequestId: sampleRequest.id },
  });

  // Check sample status
  console.log('\nChecking sample status...');
  const status = await sdk.campaign.getSampleStatus(sampleRequest.id);
  console.log(`Current status: ${status.status}`);
  if (status.trackingNumber) {
    console.log(`Tracking: ${status.trackingNumber}`);
  }
  if (status.estimatedDelivery) {
    console.log(`Est. delivery: ${status.estimatedDelivery}`);
  }
}

/**
 * Scenario 4: Complete campaign actions
 */
async function campaignActionsFlow() {
  const campaignId = 'campaign-123';

  console.log('Fetching campaign actions...');
  const campaign = await sdk.campaign.getCampaignById(campaignId);

  console.log('\n--- Campaign Actions ---');
  campaign.actions.forEach((action) => {
    console.log(`\n[${action.type.toUpperCase()}] ${action.title}`);
    console.log(`  ${action.description}`);
    if (action.requiredCount) {
      console.log(`  Complete ${action.requiredCount} times for reward`);
    }
  });

  // Complete an action
  const visitAction = campaign.actions.find((a) => a.type === 'visit');
  if (visitAction) {
    console.log(`\nCompleting "${visitAction.title}" action...`);
    const result = await sdk.campaign.completeAction(campaignId, visitAction.id);
    console.log(`Action completed: ${result.completed}`);
    if (result.reward) {
      console.log(`Reward earned: ${result.reward.title}`);
    }

    // Track the action
    await sdk.campaign.trackConversion(campaignId, {
      type: 'visit',
      metadata: { actionId: visitAction.id },
    });
  }
}

/**
 * Scenario 5: Leaderboard and sharing
 */
async function leaderboardFlow() {
  const campaignId = 'campaign-123';

  console.log('Fetching leaderboard...');
  const leaderboard = await sdk.campaign.getLeaderboard(campaignId, 10);

  console.log('\n=== Campaign Leaderboard ===');
  leaderboard.forEach((entry) => {
    const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : '';
    console.log(`${medal} #${entry.rank}. ${entry.userName}`);
    console.log(`   Score: ${entry.score} | Actions: ${entry.actionsCompleted}`);
  });

  // Share the campaign
  console.log('\nSharing campaign...');
  const shareResult = await sdk.campaign.shareCampaign(campaignId, 'whatsapp');
  console.log(`Share link: ${shareResult.shareUrl}`);
}

/**
 * Scenario 6: Subscribe to campaign updates
 */
async function subscriptionFlow() {
  const campaignId = 'campaign-123';

  console.log('Subscribing to campaign updates...');
  await sdk.campaign.subscribe(campaignId, 'push');
  console.log('Subscribed to push notifications');

  // Check all claimed rewards
  console.log('\nFetching all claimed rewards across campaigns...');
  const rewards = await sdk.campaign.getClaimedRewards();
  console.log(`Total claimed rewards: ${rewards.length}`);

  // Check for expiring rewards
  const expiringRewards = rewards.filter((r) => {
    if (!r.expiresAt) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(r.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  });

  if (expiringRewards.length > 0) {
    console.log('\n⚠️ Rewards expiring soon:');
    expiringRewards.forEach((r) => {
      console.log(`  - ${r.title} (expires: ${r.expiresAt})`);
    });
  }
}

// Run all examples
async function runExamples() {
  console.log('=== Campaign QR (Ads) Examples ===\n');

  console.log('--- Scenario 1: Campaign Engagement Flow ---');
  await campaignEngagementFlow();

  console.log('\n--- Scenario 2: Consultation Booking ---');
  await consultationFlow();

  console.log('\n--- Scenario 3: Sample Request ---');
  await sampleRequestFlow();

  console.log('\n--- Scenario 4: Campaign Actions ---');
  await campaignActionsFlow();

  console.log('\n--- Scenario 5: Leaderboard ---');
  await leaderboardFlow();

  console.log('\n--- Scenario 6: Subscription ---');
  await subscriptionFlow();

  console.log('\n=== All examples completed ===');
}

// Export for use in other examples
export { campaignEngagementFlow, consultationFlow, sampleRequestFlow, campaignActionsFlow, leaderboardFlow, subscriptionFlow };
