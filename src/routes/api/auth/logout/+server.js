import { redisKey, resetSession } from "$lib/utils.js";
import { json } from "@sveltejs/kit";
import kv from "$lib/server/kv.js";

/**
 *
 * @param {*} param0
 * @returns
 */
export async function GET({ cookies, locals }) {
  await kv.del(redisKey(locals));
  await kv.del(`${locals.sessionStart}:chats`);
  await resetSession(cookies);
  return json({
    success: true,
  });
}
