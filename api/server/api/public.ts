import * as express from 'express';

import User from '../models/User';

const router = express.Router();

router.get('/get-user', (req, res) => {
  console.log('/get-user >', req.user);
  res.json({ user: req.user || null });
});

router.post('/get-user-by-slug', async (req, res, next) => {
  console.log('Express route: /get-user-slug');

  try {
    const { slug } = req.body;

    const user = await User.getUserBySlug({ slug });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.get('/invitations/accept-and-get-team-by-token', async (req: any, res, next) => {
  try {
    const team = await Invitation.getTeamByToken({
      token: req.query.token,
    });

    if (req.user) {
      await Invitation.addUserToTeam({ token: req.query.token, user: req.user });
    }

    res.json({ team });
  } catch (err) {
    next(err);
  }
});

router.post('/invitations/remove-invitation-if-member-added', async (req: any, res, next) => {
  try {
    const team = await Invitation.removeIfMemberAdded({
      token: req.body.token,
      userId: req.user.id,
    });

    res.json({ team });
  } catch (err) {
    next(err);
  }
});

export default router;
