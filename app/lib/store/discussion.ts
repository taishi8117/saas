import { action, computed, decorate, IObservableArray, observable, runInAction } from 'mobx';

import { editDiscussionApiMethod } from '../api/team-member';
import { Store } from './index';
import { Team } from './team';

class Discussion {
  public _id: string;
  public createdUserId: string;
  public store: Store;
  public team: Team;

  public name: string;
  public slug: string;
  public memberIds: IObservableArray<string> = observable([]);

  constructor(params) {
    this._id = params._id;
    this.createdUserId = params.createdUserId;
    this.store = params.store;
    this.team = params.team;

    this.name = params.name;
    this.slug = params.slug;
    this.memberIds.replace(params.memberIds || []);
  }

  public async editDiscussion(data) {
    try {
      await editDiscussionApiMethod({
        id: this._id,
        ...data,
      });

      runInAction(() => {
        this.changeLocalCache(data);
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public changeLocalCache(data) {
    this.name = data.name;
    this.memberIds.replace(data.memberIds || []);
  }

  get members() {
    return this.memberIds.map((id) => this.team.members.get(id)).filter((u) => !!u);
  }
}

decorate(Discussion, {
  name: observable,
  slug: observable,
  memberIds: observable,

  editDiscussion: action,
  changeLocalCache: action,

  members: computed,
});

export { Discussion };
