import * as express from 'express';

import User from '../models/User';
import { signRequestForUpload } from '../aws-s3';
import Team from '../models/Team';
import Invitation from '../models/Invitation';
import Discussion from '../models/Discussion';

const router = express.Router();

router.use((req, res, next) => {
  console.log('team member API', req.path);
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
});

router.post('/aws/get-signed-request-for-upload-to-s3', async (req, res, next) => {
  try {
    const { fileName, fileType, prefix, bucket } = req.body;

    const returnData = await signRequestForUpload({
      fileName,
      fileType,
      prefix,
      bucket,
    });

    res.json(returnData);
  } catch (err) {
    next(err);
  }
});

router.post('/user/update-profile', async (req, res, next) => {
  console.log('Express route: /user/update-profile');
  try {
    const { name, avatarUrl } = req.body;

    const updatedUser = await User.updateProfile({
      userId: req.user.id,
      name,
      avatarUrl,
    });

    res.json({ updatedUser });
  } catch (err) {
    next(err);
  }
});

router.post('/user/toggle-theme', async (req, res, next) => {
  try {
    const { darkTheme } = req.body;
    console.log('toggle to isDarkTheme: ', darkTheme);
    await User.toggleTheme({ userId: req.user.id, darkTheme });

    res.json({ done: 1 });
  } catch (err) {
    next(err);
  }
});

async function loadTeamData(team, userId, body) {
  const initialMembers = await User.getMembersForTeam({
    userId,
    teamId: team._id,
  });

  let initialInvitations = [];
  if (userId === team.teamLeaderId) {
    initialInvitations = await Invitation.getTeamInvitations({
      userId,
      teamId: team._id,
    });
  }

  const initialDiscussions = await loadDiscussionsData(team, userId, body);

  const data: any = { initialMembers, initialInvitations, initialDiscussions };

  return data;
}

async function loadDiscussionsData(team, userId, body) {
  const { discussionSlug } = body;

  if (!discussionSlug) {
    return [];
  }

  const { discussions } = await Discussion.getList({
    userId,
    teamId: team._id,
  });

  for (const discussion of discussions) {
    if (discussion.slug === discussionSlug) {
      Object.assign(discussion, {
        initialPosts: await Post.getList({
          userId,
          discussionId: discussion._id,
        }),
      });

      break;
    }
  }

  return discussions;
}

router.post('/get-initial-data', async (req, res, next) => {
  try {
    const teams = await Team.getAllTeamsForUser(req.user.id);

    let selectedTeamSlug = req.body.teamSlug;
    if (!selectedTeamSlug && teams && teams.length > 0) {
      selectedTeamSlug = teams[0].slug;
    }

    for (const team of teams) {
      if (team.slug === selectedTeamSlug) {
        Object.assign(team, await loadTeamData(team, req.user.id, req.body));
        break;
      }
    }

    res.json({ teams });
  } catch (err) {
    next(err);
  }
});

router.get('/teams', async (req, res, next) => {
  try {
    const teams = await Team.getAllTeamsForUser(req.user.id);

    res.json({ teams });
  } catch (err) {
    next(err);
  }
});

router.get('/teams/get-members', async (req, res, next) => {
  try {
    const users = await User.getMembersForTeam({ userId: req.user.id, teamId: req.query.teamId });

    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.get('/discussions/list', async (req, res, next) => {
  try {
    const { teamId } = req.query;

    const { discussions } = await Discussion.getList({
      userId: req.user.id,
      teamId,
    });

    res.json({ discussions });
  } catch (err) {
    next(err);
  }
});

router.post('/discussions/add', async (req, res, next) => {
  try {
    const { name, teamId, memberIds = [] } = req.body;

    const discussion = await Discussion.add({
      userId: req.user.id,
      name,
      teamId,
      memberIds,
    });

    res.json({ discussion });
  } catch (err) {
    next(err);
  }
});

router.post('/discussions/edit', async (req, res, next) => {
  try {
    const { name, id, memberIds = [] } = req.body;

    const updatedDiscussion = await Discussion.edit({
      userId: req.user.id,
      name,
      id,
      memberIds,
    });

    res.json({ done: 1 });
  } catch (err) {
    next(err);
  }
});

router.post('/discussions/delete', async (req, res, next) => {
  try {
    const { id } = req.body;

    const { teamId } = await Discussion.delete({ userId: req.user.id, id });

    res.json({ done: 1 });
  } catch (err) {
    next(err);
  }
});

export default router;
