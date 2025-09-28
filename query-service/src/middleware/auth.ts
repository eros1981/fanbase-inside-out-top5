import { createHmac, timingSafeEqual } from 'crypto';
import { FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '../utils/logger';

/**
 * Verifies HMAC signature for request authentication
 * @param request - Fastify request object
 * @param reply - Fastify reply object
 */
export async function verifyHMAC(request: FastifyRequest, reply: FastifyReply) {
  // Skip HMAC verification for health check endpoint
  if (request.url === '/health') {
    return;
  }

  const signature = request.headers['x-signature'] as string;
  const hmacSecret = process.env.HMAC_SECRET_SHARED;

  if (!signature) {
    logger.warn('Missing X-Signature header');
    return reply.status(401).send({ error: 'Missing signature' });
  }

  if (!hmacSecret) {
    logger.error('HMAC_SECRET_SHARED not configured', { hmacSecret });
    return reply.status(500).send({ error: 'Server configuration error' });
  }

  try {
    // Get request body
    const body = JSON.stringify(request.body);
    
    // Create expected signature
    const expectedSignature = createHmac('sha256', hmacSecret)
      .update(body)
      .digest('hex');

    // Compare signatures using timing-safe comparison
    const isValid = timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );

    if (!isValid) {
      logger.warn('Invalid HMAC signature', { 
        provided: signature.substring(0, 8) + '...',
        expected: expectedSignature.substring(0, 8) + '...'
      });
      return reply.status(401).send({ error: 'Invalid signature' });
    }

    logger.debug('HMAC signature verified successfully');
  } catch (error) {
    logger.error('Error verifying HMAC signature:', error);
    return reply.status(500).send({ error: 'Signature verification failed' });
  }
}
