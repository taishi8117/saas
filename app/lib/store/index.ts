import * as mobx from 'mobx';
import { decorate, observable } from 'mobx';
import { useStaticRendering } from 'mobx-react';

import { getTeamListApiMethod, getTeamMembersApiMethod } from '../api/team-member';
import { addTeamApiMethod, getTeamInvitationsApiMethod } from '../api/team-leader';
import { User } from './user';
import { Team } from './team';

// https://github.com/mobxjs/mobx-react#server-side-rendering-with-usestaticrendering
useStaticRendering(typeof window === 'undefined');
// https://mobx.js.org/refguide/api.html#enforceactions
mobx.configure({ enforceActions: 'observed' });

class Store {
  public isServer: boolean;

  public currentUser?: User = null;
  public currentUrl = '';

  public currentTeam?: Team;

  constructor({ initialState = {}, isServer }: { initialState?: any; isServer: boolean }) {
    this.isServer = !!isServer;

    this.setCurrentUser(initialState.user);

    this.currentUrl = initialState.currentUrl || '';

    if (initialState.teamSlug || (initialState.user && initialState.user.defaultTeamSlug)) {
      this.setCurrentTeam(
        initialState.teamSlug || initialState.user.defaultTeamSlug,
        initialState.teams,
      );
    }
  }

  public changeCurrentUrl(url: string) {
    this.currentUrl = url;
  }

  public async setCurrentUser(user) {
    if (user) {
      this.currentUser = new User({ store: this, ...user });
    } else {
      this.currentUser = null;
    }
  }

  public async addTeam({ name, avatarUrl }: { name: string; avatarUrl: string }): Promise<Team> {
    const data = await addTeamApiMethod({ name, avatarUrl });
    const team = new Team({ store: this, ...data });

    return team;
  }

  public async setCurrentTeam(slug: string, initialTeams: any[]) {
    if (this.currentTeam) {
      if (this.currentTeam.slug === slug) {
        return;
      }
    }

    let found = false;

    const teams = initialTeams || (await getTeamListApiMethod()).teams;

    for (const team of teams) {
      if (team.slug === slug) {
        found = true;
        this.currentTeam = new Team({ ...team, store: this });

        const users =
          team.initialMembers || (await getTeamMembersApiMethod(this.currentTeam._id)).users;

        const invitations =
          team.initialInvitations ||
          (await getTeamInvitationsApiMethod(this.currentTeam._id)).invitations;
        this.currentTeam.setInitialMembersAndInvitations(users, invitations);

        break;
      }
    }

    if (!found) {
      this.currentTeam = null;
    }
  }
}

decorate(Store, {
  currentUser: observable,
  currentUrl: observable,

  changeCurrentUrl: mobx.action,
});

let store: Store = null;

function initializeStore(initialState = {}) {
  const isServer = typeof window === 'undefined';

  const _store =
    store !== null && store !== undefined ? store : new Store({ initialState, isServer });

  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') {
    console.log('initializeStore _store (server):', _store);
    return _store;
  }

  // Create the store once in the client
  if (!store) {
    store = _store;
  }

  console.log('initializeStore _store (client):', _store);
  return _store;
}

function getStore() {
  return store;
}

export { Store, initializeStore, getStore };
