import { NODE_ENV } from "$env/static/private";
import kv from "$lib/server/kv";
import { redisKey } from "$lib/utils.js";
// Disable SSR when running the dev server
export const ssr = NODE_ENV === "production";
/**
 *
 * @param {*} param0
 * @returns
 */
export const load = async ({ request, locals, cookies }) => {
  /**
   * @type {any[]}
   */
  let chats = [];
  try {
    console.log(redisKey(locals));
    chats = locals.user.authed ? await kv.lrange(redisKey(locals), 0, -1) : await kv.lrange(`${locals.sessionStart}:chats`, 0, -1);
    console.log(chats);
  } catch (e) {
    console.log("KV ERROR IN LAYOUT");
  }
  return {
    user: locals.user,
    chats: chats.map((m) => ({ author: m.role.replace("assistant", "bao"), content: m.content })),
  };
};
