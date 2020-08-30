import express from 'express';
import next from 'next';

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_DEV = NODE_ENV !== 'production';

const app = next({ dev: IS_DEV });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.get('/_next/*', (req, res) => {
    handle(req, res);
  });

  server.use(express.json());

  server.get('/team/:teamSlug/team-settings', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/team-settings', { teamSlug });
  });

  server.get('/team/:teamSlug/discussions/:discussionSlug', (req, res) => {
    const { teamSlug, discussionSlug } = req.params;
    app.render(req, res, '/discussion', { teamSlug, discussionSlug });
  });

  server.get('/team/:teamSlug/discussions', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/discussion', { teamSlug });
  });

  server.all('*', (req, res) => {
    handle(req, res);
  });

  server.listen(process.env.PORT_APP, () => {
    console.log(`> Ready on ${process.env.URL_APP}`);
  });
});
