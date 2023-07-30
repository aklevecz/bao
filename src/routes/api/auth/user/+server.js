import { CHICKEN_SECRET } from "$env/static/private";
import { cookieKeys } from "$lib/constants";
import { error, json } from "@sveltejs/kit";
import { jwtVerify } from "jose";

/**
 *
 * @param {*} param0
 * @returns
 */
export async function GET({ cookies }) {
  const chickenToken = cookies.get(cookieKeys.chickenAuth) || null;
  if (chickenToken) {
    const { payload } = await jwtVerify(chickenToken, new TextEncoder().encode(CHICKEN_SECRET));
    return json({ user: payload });
  } else {
    throw error(404, "NO_USER");
  }
}
