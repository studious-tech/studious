# Stripe Integration Setup Guide

This guide walks you through setting up Stripe for the subscription system.

## 1. Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account or sign in
3. Complete account verification

## 2. Get API Keys

1. In Stripe Dashboard, go to **Developers** → **API keys**
2. Copy the **Publishable key** and **Secret key** (use test keys for development)
3. Add them to your `.env` file:

```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 3. Create Products and Prices

### PTE Academic Plans

1. Go to **Products** → **Add Product**
2. Create the following products:

#### PTE Basic Plan
- **Name**: PTE Academic Basic
- **Description**: Essential PTE preparation tools
- **Pricing**:
  - Monthly: $19.99 USD (Recurring)
  - Yearly: $167.93 USD (Recurring, annually)

#### PTE Premium Plan
- **Name**: PTE Academic Premium
- **Description**: Complete PTE preparation with AI feedback
- **Pricing**:
  - Monthly: $39.99 USD (Recurring)
  - Yearly: $287.93 USD (Recurring, annually)

### IELTS Academic Plans

Repeat the same process for IELTS:

#### IELTS Basic Plan
- **Name**: IELTS Academic Basic
- **Description**: Essential IELTS preparation tools
- **Pricing**: Same as PTE

#### IELTS Premium Plan
- **Name**: IELTS Academic Premium
- **Description**: Complete IELTS preparation with AI feedback
- **Pricing**: Same as PTE

## 4. Get Price IDs

After creating products, copy the Price IDs from each price and add them to `.env`:

```bash
# PTE Academic Plans
STRIPE_PTE_BASIC_MONTHLY_PRICE_ID=price_1A2B3C...
STRIPE_PTE_BASIC_YEARLY_PRICE_ID=price_1D2E3F...
STRIPE_PTE_PREMIUM_MONTHLY_PRICE_ID=price_1G2H3I...
STRIPE_PTE_PREMIUM_YEARLY_PRICE_ID=price_1J2K3L...

# IELTS Academic Plans
STRIPE_IELTS_BASIC_MONTHLY_PRICE_ID=price_1M2N3O...
STRIPE_IELTS_BASIC_YEARLY_PRICE_ID=price_1P2Q3R...
STRIPE_IELTS_PREMIUM_MONTHLY_PRICE_ID=price_1S2T3U...
STRIPE_IELTS_PREMIUM_YEARLY_PRICE_ID=price_1V2W3X...
```

## 5. Set Up Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
4. **Listen to**: Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Copy the **Signing secret** and add to `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 6. Configure Customer Portal

1. Go to **Settings** → **Billing** → **Customer portal**
2. Enable the customer portal
3. Configure the settings:
   - **Business information**: Add your company details
   - **Features**: Enable all features you want customers to access
   - **Terms of service**: Add your terms URL

## 7. Test the Integration

### Development Testing

1. Use Stripe test cards:
   - **Success**: `4242 4242 4242 4242`
   - **Declined**: `4000 0000 0000 0002`
   - **Requires authentication**: `4000 0025 0000 3155`

2. Test the flow:
   ```bash
   # Start your development server
   npm run dev

   # Navigate to subscription page
   http://localhost:3000/pte-academic/dashboard/subscription

   # Try subscribing to a plan
   ```

### Webhook Testing (Local Development)

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Other platforms: https://stripe.com/docs/stripe-cli
   ```

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. This will give you a webhook secret for local testing:
   ```bash
   # Use this for local development
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## 8. Database Migration

Run the subscription schema update:

```bash
# Apply the database migration
psql -h your-host -d your-database -U your-user -f subscription-schema-update.sql
```

## 9. Production Checklist

Before going live:

- [ ] Switch to live Stripe API keys
- [ ] Update webhook endpoint to production URL
- [ ] Test with real payment methods (small amounts)
- [ ] Configure production environment variables
- [ ] Set up monitoring for webhook failures
- [ ] Test subscription flows end-to-end

## 10. Features Included

### Subscription Management
- ✅ Create subscriptions with Stripe Checkout
- ✅ Trial periods (7 days Basic, 14 days Premium)
- ✅ Monthly and yearly billing
- ✅ Automatic subscription renewal
- ✅ Cancellation with access until period end
- ✅ Customer portal for self-service

### Payment Processing
- ✅ Secure card payments via Stripe
- ✅ Payment method updates
- ✅ Failed payment handling
- ✅ Invoice generation
- ✅ Payment history tracking

### Webhook Handling
- ✅ Real-time subscription status updates
- ✅ Payment success/failure notifications
- ✅ Automatic subscription cancellation
- ✅ Usage reset on new billing periods

### Usage Tracking
- ✅ Practice question limits
- ✅ Mock test limits
- ✅ Real-time usage monitoring
- ✅ Limit enforcement

## 11. Error Handling

The system handles common scenarios:

- **Invalid payment methods**: User sees error, can retry
- **Webhook failures**: Stripe automatically retries
- **Duplicate subscriptions**: Old subscription is canceled
- **API failures**: Graceful error messages

## 12. Security Features

- ✅ Webhook signature verification
- ✅ User authentication required
- ✅ Subscription isolation by exam
- ✅ No sensitive data in client-side code
- ✅ Secure token handling

## 13. Monitoring and Analytics

Consider setting up:

- Stripe Dashboard monitoring
- Webhook delivery monitoring
- Revenue analytics
- Churn rate tracking
- Failed payment alerts

## 14. Support for Different Regions

The current setup supports:
- USD currency (can be extended)
- Credit/debit cards
- International payments via Stripe

To add more currencies or payment methods, update the Stripe configuration and add corresponding price IDs.

## 15. Testing Scenarios

Test these scenarios thoroughly:

1. **New subscription creation**
2. **Trial to paid conversion**
3. **Subscription cancellation**
4. **Payment method updates**
5. **Failed payment recovery**
6. **Webhook failure recovery**
7. **Multiple subscriptions per user (different exams)**
8. **Usage limit enforcement**
9. **Customer portal access**
10. **Refund processing**

## Troubleshooting

### Common Issues

1. **"No such price" error**: Check price IDs in environment variables
2. **Webhook signature errors**: Verify webhook secret
3. **Subscription not created**: Check webhook endpoint is accessible
4. **Payment failures**: Test with different card numbers
5. **Portal access denied**: Ensure customer exists in Stripe

### Logs to Check

- Next.js server logs
- Stripe webhook delivery logs
- Supabase database logs
- Browser network tab for API errors

### Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)
- [Stripe Community](https://support.stripe.com/)