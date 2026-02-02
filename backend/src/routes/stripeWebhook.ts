import { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe, isStripeEnabled } from '../lib/stripe';
import { prisma } from '../lib/prisma';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Stripe webhook handler. Must be mounted with express.raw({ type: 'application/json' })
 * so req.body is the raw Buffer (required for signature verification).
 */
export async function stripeWebhookHandler(req: Request, res: Response): Promise<void> {
  if (!isStripeEnabled() || !webhookSecret) {
    res.status(503).send('Stripe webhook not configured (STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET missing)');
    return;
  }

  const signature = req.headers['stripe-signature'];
  if (!signature || typeof signature !== 'string') {
    res.status(400).send('Missing Stripe-Signature header');
    return;
  }

  let event: Stripe.Event;
  try {
    const rawBody = req.body as Buffer;
    if (!rawBody || !Buffer.isBuffer(rawBody)) {
      res.status(400).send('Webhook body must be raw (use express.raw() for this route)');
      return;
    }
    event = stripe!.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Stripe webhook signature verification failed:', message);
    res.status(400).send(`Webhook Error: ${message}`);
    return;
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { id: true, status: true },
          });
          if (order && (order.status === 'pending' || order.status === 'processing')) {
            await prisma.order.update({
              where: { id: orderId },
              data: { status: 'processing' },
            });
            console.log(`Order ${orderId} updated to processing after payment_intent.succeeded`);
          }
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
          console.log(`Payment failed for order ${orderId}: ${paymentIntent.last_payment_error?.message ?? 'unknown'}`);
          // Optionally: keep order as pending or mark as payment_failed if you add that status
        }
        break;
      }
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Stripe webhook handler error:', error);
    res.status(500).send('Webhook handler error');
    return;
  }

  res.status(200).json({ received: true });
}
