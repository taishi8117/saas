import * as mobx from 'mobx';
import { decorate, observable } from 'mobx';
import { useStaticRendering } from 'mobx-react';

import { User } from './user';

// https://github.com/mobxjs/mobx-react#server-side-rendering-with-usestaticrendering
useStaticRendering(typeof window === 'undefined');
// https://mobx.js.org/refguide/api.html#enforceactions
mobx.configure({ enforceActions: 'observed' });

class Store {
  public isServer: boolean;

  public currentUser?: User = null;
  public currentUrl = '';

  constructor({ initialState = {}, isServer }: { initialState?: any; isServer: boolean }) {
    this.isServer = !!isServer;

    this.setCurrentUser(initialState.user);

    this.currentUrl = initialState.currentUrl || '';
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
