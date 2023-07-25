import db from "$lib/db.js";
import { error, json } from "@sveltejs/kit";

/**
 *
 * @param {*} param0
 * @returns
 */
export async function POST({ request, locals }) {
  const data = await request.json();
  await db.updateChickenTokens(data.chicken, locals.user);

  return json({ success: true });
}

/**
 *
 * @param {*} param0
 * @returns
 */
export async function GET({ locals }) {
  const response = await db.findUserByHex(locals.user.sk);
  if (response) {
    return json(response.chicken_tokens);
  }
  throw error(404, "nope");
}
