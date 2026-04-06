import { Subscription } from "../models/subscription.js";

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  // In production, verify the webhook signature with Stripe
  // const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

  const event = req.body;

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const stripeSubscription = event.data.object;
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: stripeSubscription.id },
          {
            status: stripeSubscription.status === "active" ? "active" : "past_due",
            currentPeriodStart: new Date(
              stripeSubscription.current_period_start * 1000
            ),
            currentPeriodEnd: new Date(
              stripeSubscription.current_period_end * 1000
            ),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          }
        );
        break;
      }

      case "customer.subscription.deleted": {
        const stripeSubscription = event.data.object;
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: stripeSubscription.id },
          { status: "canceled" }
        );
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await Subscription.findOneAndUpdate(
          { stripeCustomerId: invoice.customer },
          { status: "past_due" }
        );
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(400).json({ error: "Webhook processing failed" });
  }
};
