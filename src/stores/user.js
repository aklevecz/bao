import api, { endpoints } from "$lib/api";
import { get, writable } from "svelte/store";
import { chat } from "./chat";
import { authStates, baoMessages, responseTokens } from "../lib/constants";

/**
 *
 * @param {string} imageBase64
 */
const loginFetcher = async (imageBase64) => {
  const res = await fetch(endpoints.auth.login, { method: "POST", body: JSON.stringify({ imageBase64 }) }).then((r) =>
    r.json()
  );
  const { token, user } = res;
  return { token, user };
};

function createUser() {
  /** @typedef {number} ChickenToken */
  /** @typedef {*} User */
  /** @typedef {{authed:boolean, authState:number, user:User, loading: boolean, chicken_tokens:number, watchTV:boolean}} UserState*/
  /** @type {import("svelte/store").Writable<UserState>} */
  const userState = writable({
    authed: false,
    authState: authStates.preAuth,
    user: {},
    loading: true,
    chicken_tokens: 0,
    watchTV: false,
  });
  const { subscribe, set, update } = userState;

  return {
    subscribe,
    /** @param {{userData:User, chats:any[]}} params*/
    remember: ({ userData, chats }) => {
      if (userData.chicken_name) {
        update((u) => ({ ...u, user: userData, authed: true, authState: authStates.chickenized, loading: false }));
      } else {
        update((u) => ({ ...u, loading: false }));
      }
    },
    /**
     *
     * @param {string} imageBase64
     * @returns
     */
    login: async (imageBase64) => {
      const { user: userInfo } = await loginFetcher(imageBase64);
      console.log(userInfo);
      if (userInfo) {
        update((user) => {
          return {
            ...user,
            authed: true,
            user: userInfo,
            authState: authStates.chickenized,
            chicken_tokens: userInfo.chicken_tokens,
          };
        });
        const haschicken_tokens = userInfo.chicken_tokens > 0;
        chat.injectChat({
          content: `welcome ${userInfo.chicken_name}! ${
            !haschicken_tokens ? "hey ummm can you help me grab that chicken floating around? i'm hungry af!" : ""
          }`,
          author: "bao",
        });
      } else {
        chat.injectChat({
          content: baoMessages.whoDrewDis,
          author: "bao",
        });
      }
    },
    logout: () =>
      update((user) => {
        user.authed = false;
        return user;
      }),
    force: () => {
      update((user) => {
        user.authed = true;
        return user;
      });
    },
    /** @param {number} amount */
    incrementChickenTokens: (amount) => {
      api.incrementChickenTokens(amount);

      update((user) => {
        user.chicken_tokens += amount;
        return user;
      });
    },
    updateChickenTokens: async () => {
      const chicken_tokens = await api.fetchChickenTokens();
      update((user) => {
        user.chicken_tokens = chicken_tokens;
        return user;
      });
    },
    listener: () => {
      return chat.subscribe(async (chats) => {
        if (chats.length >= 2) {
          const lastChat = chats[chats.length - 1].content;
          if (
            lastChat.includes(responseTokens.auth.chickenMasterpiece)
            // && get(user).authState === authStates.preAuth
          ) {
            const username = chats[chats.length - 2].content;
            update((u) => ({ ...u, authState: authStates.drawingChicken }));
            const { image, user: userInfo } = await api.fetchImage(username);
            update((u) => ({ ...u, user: userInfo, authState: authStates.chickenized, authed: true }));
            user.updateChickenTokens();
            chat.update((chats) => {
              return [...chats, { image, author: "bao", content: baoMessages.downloadToSignIn, id: Symbol("id") }];
            });
          }

          // if bao wants the user to upload their chicken
          if (lastChat.includes(responseTokens.auth.uploadChicken)) {
            update((u) => ({ ...u, authState: authStates.uploadingChicken }));
          }

          if (lastChat.includes(responseTokens.auth.signOut)) {
            await fetch(endpoints.auth.logout);
            window.location.reload();
          }

          // this should dispatch some sort of action to turn the tv on
          if (lastChat.includes(responseTokens.views.tv)) {
            update((u) => ({ ...u, watchTV: true }));
          }
        }
      });
    },
  };
}

export const user = createUser();
