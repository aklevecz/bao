import { writable } from "svelte/store";

function createGame() {
  /** @typedef {{stage: number, caughtChicken: boolean}} GameState*/
  /** @type {import("svelte/store").Writable<GameState>} */
  const game = writable({ stage: 0, caughtChicken: false });
  const { subscribe, set, update } = game;

  return {
    subscribe,
    catchChicken: async () => {
      update((c) => ({ ...c, caughtChicken: true }));
    },
  };
}

export const game = createGame();
