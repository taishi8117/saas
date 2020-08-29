import { action, decorate, IObservableArray, observable, runInAction } from 'mobx';
import { updateTeamApiMethod } from '../api/team-leader';

import { Store } from './index';
import { User } from './user';

class Team {
  public store: Store;

  public _id: string;
  public teamLeaderId: string;

  public name: string;
  public slug: string;
  public avatarUrl: string;
  public memberIds: IObservableArray<string> = observable([]);
  public members: Map<string, User> = new Map();

  constructor(params) {
    this._id = params._id;
    this.teamLeaderId = params.teamLeaderId;
    this.slug = params.slug;
    this.name = params.name;
    this.avatarUrl = params.avatarUrl;
    this.memberIds.replace(params.memberIds || []);

    this.store = params.store;

    if (params.initialMembers) {
      this.setInitialMembers(params.initialMembers);
    }
  }

  public setInitialMembers(users) {
    this.members.clear();

    for (const user of users) {
      if (this.store.currentUser && this.store.currentUser._id === user._id) {
        this.members.set(user._id, this.store.currentUser);
      } else {
        this.members.set(user._id, new User(user));
      }
    }
  }

  public async updateTeam({ name, avatarUrl }: { name: string; avatarUrl: string }) {
    try {
      const { slug } = await updateTeamApiMethod({
        teamId: this._id,
        name,
        avatarUrl,
      });

      runInAction(() => {
        this.name = name;
        this.avatarUrl = avatarUrl;
        this.slug = slug;
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // public async removeMember(userId: string) {
  //   try {
  //   await removeMemberApiMethod({ teamId: this._id, userId });

  //   runInAction(() => {
  //     this.members.delete(userId);
  //     this.memberIds.remove(userId);
  //   });
  // } catch (error) {
  //   console.error(error);
  //   throw error;
  // }
}

decorate(Team, {
  name: observable,
  slug: observable,
  avatarUrl: observable,
  memberIds: observable,
  members: observable,

  setInitialMembers: action,
  updateTeam: action,
});

export { Team };
