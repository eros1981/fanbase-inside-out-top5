import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { queryTop5Data } from '../services/query-service';
import { logger } from '../utils/logger';

// Request body interface
interface Top5Request {
  month: string;
  category: string;
}

// Register the top5 route
export async function top5Handler(fastify: FastifyInstance) {
  fastify.post('/top5', async (request: FastifyRequest<{ Body: Top5Request }>, reply: FastifyReply) => {
    try {
      const { month, category } = request.body;

      // Validate required fields
      if (!month || !category) {
        return reply.status(400).send({
          error: 'Missing required fields: month and category are required'
        });
      }

      // Validate month format (YYYY-MM)
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return reply.status(400).send({
          error: 'Invalid month format. Expected YYYY-MM (e.g., 2025-08)'
        });
      }

      // Validate category
      const validCategories = ['monetizer', 'content_machine', 'eyeball_emperor', 'host_with_the_most', 'product_whisperer', 'all'];
      if (!validCategories.includes(category)) {
        return reply.status(400).send({
          error: `Invalid category. Valid options: ${validCategories.join(', ')}`
        });
      }

      logger.info('Processing top5 request', { month, category });

      // Query the data
      const results = await queryTop5Data(month, category);

      // Format response
      const response = {
        period: month,
        results: results,
        notes: ['Ties share the same rank; next rank is offset accordingly.']
      };

      logger.info('Successfully processed top5 request', { 
        month, 
        category, 
        resultCount: Object.keys(results).length 
      });

      return reply.send(response);

    } catch (error) {
      logger.error('Error processing top5 request:', error);
      return reply.status(500).send({
        error: 'Internal server error while processing request'
      });
    }
  });
}
