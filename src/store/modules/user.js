import UserFactory from '@/api/user';

let userFactory = new UserFactory();

const getInitialState = () => ({
  user: {
    login: null,
    id: 0,
    avatar_url: 'https://github.com/identicons/oidsjr.png',
    html_url: null,
    followers_url: null,
    following_url: null,
    repos_url: null,
    type: 'User',
    name: null,
    location: null,
    email: null,
    hireable: false,
    bio: null,
    public_repos: 0,
    followers: 0,
    following: 0,
  },
  following: [],
  followers: [],
  blockeds: [],
});

// initial state
const initialState = getInitialState();

// getters
const getters = {
  accessToken() {
    return userFactory.token;
  },
  isLogged() {
    return !!initialState.user && !!initialState.user.login;
  },
  userInfo() {
    return initialState.user;
  },
  followers() {
    return initialState.followers;
  },
  following() {
    return initialState.following;
  },
  blockeds() {
    return initialState.blockeds;
  },
};

// actions
const actions = {
  getUser({ dispatch }, token) {
    dispatch('getUserInfo', token);
    dispatch('getUserFollowers');
    dispatch('getUserFollowing');
    dispatch('getUserBlockeds');
  },
  async getUserInfo({ commit, dispatch }, token) {
    userFactory = new UserFactory(token);
    try {
      dispatch('global/setIsLoading', true, { root: true });

      const user = await userFactory.getUser();
      commit('setUserInfo', user);
    } catch (error) {
      console.error(error);
    } finally {
      dispatch('global/setIsLoading', false, { root: true });
    }
  },
  async getUserFollowers({ commit }) {
    try {
      const followers = await userFactory.getUserFollowers();
      commit('setUserFollowers', followers);
    } catch (error) {
      console.error(error);
    }
  },
  async getUserFollowing({ commit }) {
    try {
      const following = await userFactory.getUserFollowing();
      commit('setUserFollowing', following);
    } catch (error) {
      console.error(error);
    }
  },
  async followUser({ commit }, user) {
    if (!user || !user.login) return;
    try {
      await userFactory.followUser(user.login);
      commit('addUserFollowing', user);
    } catch (error) {
      console.error(error);
    }
  },
  async unfollowUser({ commit }, user) {
    if (!user || !user.login) return;
    try {
      await userFactory.unfollowUser(user.login);
      commit('removeUserFollowing', user);
    } catch (error) {
      console.error(error);
    }
  },
  async getUserBlockeds({ commit }) {
    try {
      const blockeds = await userFactory.getUserBlocks();
      commit('setUserBlockeds', blockeds);
    } catch (error) {
      console.error(error);
    }
  },
  async blockUser({ commit }, user) {
    if (!user || !user.login) return;
    try {
      await userFactory.blockUser(user.login);
      commit('addUserBlocked', user);
      commit('removeUserFollowing', user);
    } catch (error) {
      console.error(error);
    }
  },
  async unblockUser({ commit }, user) {
    if (!user || !user.login) return;
    try {
      await userFactory.unblockUser(user.login);
      commit('removeUserBlocked', user);
    } catch (error) {
      console.error(error);
    }
  },
  clearToken({ commit }) {
    userFactory.clearToken();
    commit('clearToken');
  },
};

// mutations
const mutations = {
  setUserInfo(state, user) {
    state.user = user;
  },
  setUserFollowers(state, followers) {
    state.followers = followers;
  },
  setUserFollowing(state, following) {
    state.following = following;
  },
  addUserFollowing(state, userToFollow) {
    state.following.push(userToFollow);
  },
  removeUserFollowing(state, userToUnfollow) {
    const followedIndex = state.following.indexOf((user) => user.login === userToUnfollow.login);
    if (!followedIndex) return;

    state.following.splice(followedIndex, 1);
  },
  setUserBlockeds(state, blockeds) {
    state.blockeds = blockeds;
  },
  addUserBlocked(state, userToBlock) {
    state.blockeds.push(userToBlock);
  },
  removeUserBlocked(state, userBlocked) {
    const blockedIndex = state.blockeds.indexOf((user) => user.login === userBlocked.login);
    if (!blockedIndex) return;

    state.blockeds.splice(blockedIndex, 1);
  },
  clearToken(state) {
    Object.assign(state, getInitialState());
  },
};

export default {
  namespaced: true,
  state: initialState,
  getters,
  actions,
  mutations,
};
