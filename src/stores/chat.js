import { endpoints } from "$lib/api";
import errors from "$lib/errors";
import { delay } from "$lib/utils";
import { get, writable } from "svelte/store";
import { baoMessages, commands, initialChat } from "./constants";
import { game } from "./game";
import { user } from "./user";
import locals from "$lib/locals";

// could pass in complete response or return the chunk?
/**
 *  @param {string} question
 *  @param {string} lastAnswer
 */
const fetcher = async (question, lastAnswer) => {
  const response = await fetch(`${endpoints.chat}?question=${question}&lastAnswer=${lastAnswer}`);
  if (response.status !== 200) {
    const { error, message } = await response.json();
    // @todo refactor
    if (error === errors.NOT_AUTHED.error) {
      await fetch(endpoints.auth.logout);
      window.location.reload();
    }
    if (errors[error]) {
      throw new Error(errors[error].message);
    }
  }
  const reader = response.body?.getReader();
  return reader;
};

/**
 *
 * @param {string} question
 * @param {string} lastAnswer
 * @param {number} authState
 */
const authFetcher = async (question, lastAnswer, authState) => {
  const response = await fetch(endpoints.chat, {
    method: "POST",
    body: JSON.stringify({ question, lastAnswer, authState }),
  });
  if (response.status !== 200) {
    throw Error("error during auth chat");
  }
  const reader = response.body?.getReader();
  return reader;
};

export const isThinking = writable(false);
export const isResponding = writable(false);
export const isLoaded = writable(false);

function createChat() {
  /** @typedef {('bao' | 'user')} Author*/
  /** @typedef {{id:symbol, content:string, author:Author|string, image?:string}} Message - Message for the chat */

  /** @type {import("svelte/store").Writable<Message[]>} */
  const chats = writable([]);
  const { subscribe, set, update } = chats;

  return {
    update,
    subscribe,
    /**
     * @param {*} chats
     */
    init: (chats) => {
      const userState = get(user);
      const gameState = get(game);
      const hasCaughtChicken = gameState.caughtChicken || userState.chicken_tokens > 0;
      /**
       * @type {*}
       */
      let chat = [];
      if (chats.length) {
        chat = chats;

        // @todo REFRACTOR
      } else {
        chat = userState.authed
          ? [
              {
                content: `hey ${userState.user.chicken_name}! ${
                  hasCaughtChicken === false ? baoMessages.chickenHelp : ""
                }`,
                author: "bao",
                id: Symbol("id"),
                auth: true,
              },
            ]
          : [initialChat];
      }
      set([...chat]);
    },
    /**
     *
     * @param {{content:string, author:'bao' | 'user'}} param0
     */
    injectChat: ({ content, author }) => {
      update((chats) => [...chats, { content, author, id: Symbol("id") }]);
    },
    /**
     * submits a chat question
     * @param {string} question */
    submit: async (question) => {
      if (question[0] === "!") {
        if (question.includes(commands.brainwash)) {
          await chat.reset();
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
        return;
      }
      const lastMessage = get(chats).slice(-1)[0];
      const lastAnswer = lastMessage?.content;
      await update((chats) => [...chats, { content: question, author: "user", id: Symbol("id") }]);

      isThinking.set(true);
      isResponding.set(true);

      const userState = get(user);
      // This whole abstraction is awkward

      // change afetcher depending on whether it is auth or just chat
      /**
       * @type {ReadableStreamDefaultReader<Uint8Array> | undefined}
       */
      let reader;
      let retries = 0;
      const MAX_RETRIES = 2;
      const RETRY_DELAY_MS = 200;
      let success = false;
      /** @type {string} */
      let error = "";
      do {
        await delay(retries * RETRY_DELAY_MS);
        try {
          // for auth stuff after waitlist
          if (userState.authed) {
            // IF AUTHED
            reader = await fetcher(question, lastAnswer);
          } else {
            // IF NOT AUTHED - THIS IS AUTH FLOW
            reader = await authFetcher(question, lastAnswer, userState.authState);
          }
          // waitlist
          // reader = await fetcher(question, lastAnswer);
          retries = MAX_RETRIES;
          success = true;
        } catch (e) {
          console.log("SUBMIT CATCH", e);
          // @ts-ignore
          error = e.message;
          retries++;
        }
      } while (retries < MAX_RETRIES);
      {
      }
      // IF FAILS
      if (!success) {
        update((chats) => {
          return [
            ...chats,
            {
              content: error || baoMessages.ow,
              author: "bao",
              id: Symbol("id"),
            },
          ];
        });
      }
      const decoder = new TextDecoder();
      isThinking.set(false);
      const chatIndex = get(chats).length;

      // if there was a response
      if (reader) {
        while (true) {
          const { value, done: doneReading } = await reader.read();
          if (doneReading) {
            const userState = get(user);
            if (userState.authed) {
              locals().saveChat(userState.user.chicken_name, userState.user.sk, get(chats));
            }
            break;
          }
          let chunkValue = decoder.decode(value).toLowerCase();

          update((chats) => {
            if (chats[chatIndex]) {
              chats[chatIndex].content += chunkValue;
            } else {
              chats[chatIndex] = { content: chunkValue, author: "bao", id: Symbol("id") };
            }
            return chats;
          });
        }
      } else {
        // deprecate
        // if it kept failing
        // update((chats) => {
        //   return [
        //     ...chats,
        //     {
        //       content: baoMessages.ow,
        //       author: "bao",
        //       id: Symbol("id"),
        //     },
        //   ];
        // });
      }
      // could check what to do for auth here too...
      isResponding.set(false);
    },
    reset: async () => {
      return await fetch(endpoints.chat, { method: "DELETE" });
    },
  };
}

export const chat = createChat();
