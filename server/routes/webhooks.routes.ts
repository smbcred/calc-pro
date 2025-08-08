import express from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

/**
 * @swagger
 * /webhooks/stripe:
 *   post:
 *     summary: Handle Stripe payment webhooks
 *     tags: [Webhooks]
 *     description: |
 *       Endpoint for Stripe to send payment events.
 *       
 *       **Important**: This endpoint requires the raw request body.
 *       Do not use JSON middleware before this route.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [
 *                   'payment_intent.succeeded',
 *                   'payment_intent.failed',
 *                   'checkout.session.completed'
 *                 ]
 *               data:
 *                 type: object
 *     parameters:
 *       - in: header
 *         name: stripe-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: Stripe webhook signature for verification
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid signature or data
 *       500:
 *         description: Processing error
 */
router.post('/stripe', asyncHandler(async (req, res) => {
  // Stripe webhook processing logic would go here
  res.json({ received: true });
}));

/**
 * @swagger
 * /webhooks/make:
 *   post:
 *     summary: Trigger document generation workflow
 *     tags: [Webhooks]
 *     description: Webhook endpoint for Make.com to trigger after intake completion
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - companyId
 *             properties:
 *               customerId:
 *                 type: string
 *               companyId:
 *                 type: string
 *               trigger:
 *                 type: string
 *                 enum: ['intake_complete', 'manual_regenerate']
 *     responses:
 *       200:
 *         description: Workflow triggered
 *       401:
 *         description: Invalid webhook authentication
 */
router.post('/make', asyncHandler(async (req, res) => {
  // Make.com webhook processing logic would go here
  res.json({ triggered: true });
}));

export default router;