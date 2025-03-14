import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { serveStatic } from '@hono/node-server/serve-static'
import {showRoutes} from "hono/dev"
import { createQueue, setupBullMQProcessor } from './queue';



import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { HonoAdapter } from '@bull-board/hono';
import { env } from './env';


const run = async () => {
  const reviewScrapeQueue = createQueue('ReviewScrapeQueue');
  await setupBullMQProcessor(reviewScrapeQueue.name);

  const app = new Hono()
  app.get('/', (c) => c.text('Hello Node.js!'))
  

  const serverAdapter = new HonoAdapter(serveStatic);

  createBullBoard({
    queues: [new BullMQAdapter(reviewScrapeQueue)],
    serverAdapter,
  });


  const basePath = '/ui'
  serverAdapter.setBasePath(basePath);
  app.route(basePath, serverAdapter.registerPlugin());


  showRoutes(app);

  serve({ fetch: app.fetch, port: env.PORT });


}


run().catch((e) => {
  console.error(e);
  process.exit(1);
});



