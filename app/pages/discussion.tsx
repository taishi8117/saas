import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import Head from 'next/head';
import Router from 'next/router';
import * as React from 'react';

import { observer } from 'mobx-react';

import Loading from '../components/common/Loading';
import Layout from '../components/layout';
import notify from '../lib/notify';
import { Store } from '../lib/store';
import { Discussion } from '../lib/store/discussion';
import withAuth from '../lib/withAuth';

type Props = {
  store: Store;
  teamSlug: string;
  discussionSlug: string;
  isServer: boolean;
  isMobile: boolean;
};

class DiscussionPageComp extends React.Component<Props> {
  public state = {
    disabled: false,
    showMarkdownClicked: false,
  };

  public render() {
    const { store, discussionSlug, isMobile } = this.props;
    const { currentTeam } = store;

    if (!currentTeam || currentTeam.slug !== this.props.teamSlug) {
      return (
        <Layout {...this.props}>
          <div style={{ padding: isMobile ? '0px' : '0px 30px' }}>No Team is found.</div>
        </Layout>
      );
    }

    const discussion = this.getDiscussion(discussionSlug);

    if (!discussion) {
      if (currentTeam.isLoadingDiscussions) {
        return (
          <Layout {...this.props}>
            <div style={{ padding: isMobile ? '0px' : '0px 30px' }}>
              <Loading text="loading Discussions ..." />
            </div>
          </Layout>
        );
      } else {
        return (
          <Layout {...this.props}>
            <Head>
              <title>No discussion is found.</title>
            </Head>
            <div style={{ padding: isMobile ? '0px' : '0px 30px' }}>
              <p>No discussion is found.</p>
            </div>
          </Layout>
        );
      }
    }

    const title = discussion ? `${discussion.name} · Discussion` : 'Discussions';

    return (
      <Layout {...this.props}>
        <Head>
          <title>{title}</title>
          <meta
            name="description"
            content={
              discussion
                ? `Discussion ${discussion.name} by Team ${currentTeam.name}`
                : 'Discussions'
            }
          />
        </Head>
        <div style={{ padding: isMobile ? '0px' : '0px 30px' }}>
          <h4>
            <span style={{ fontWeight: 300 }}>Discussion : </span>
            {(discussion && discussion.name) || 'No Discussion is found.'}
          </h4>{' '}
          Visible to :{' '}
          {discussion
            ? discussion.members.map((m) => (
                <Tooltip
                  title={m.displayName}
                  placement="right"
                  disableFocusListener
                  disableTouchListener
                  key={m._id}
                >
                  <Avatar
                    role="presentation"
                    src={m.avatarUrl}
                    alt={m.avatarUrl}
                    key={m._id}
                    style={{
                      margin: '0px 5px',
                      display: 'inline-flex',
                      width: '30px',
                      height: '30px',
                      verticalAlign: 'middle',
                    }}
                  />
                </Tooltip>
              ))
            : null}
          <p />
          <p>List of Posts</p>
          <p />
          <br />
        </div>
      </Layout>
    );
  }

  public getDiscussion(slug: string): Discussion {
    const { store, teamSlug } = this.props;
    const { currentTeam } = store;

    if (!currentTeam) {
      return;
    }

    if (!slug && currentTeam.discussions.length > 0) {
      Router.replace(
        `/discussion?teamSlug=${teamSlug}&discussionSlug=${currentTeam.orderedDiscussions[0].slug}`,
        `/team/${teamSlug}/discussions/${currentTeam.orderedDiscussions[0].slug}`,
      );
      return;
    }

    if (slug && store.currentTeam) {
      return store.currentTeam.getDiscussionBySlug(slug);
    }

    return null;
  }
}

export default withAuth(observer(DiscussionPageComp));
