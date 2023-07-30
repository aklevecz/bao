import db from "$lib/db";
import { signToken } from "$lib/user-utils";
import { cookieKeys } from "$lib/constants";
import { error, json } from "@sveltejs/kit";
/**
 *
 * @param {*} base64
 * @returns
 */
function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const arrayBuffer = new ArrayBuffer(len);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < len; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }

  return arrayBuffer;
}

/**
 *
 * @param {*} param0
 * @returns
 */
export async function POST({ request, cookies }) {
  const data = await request.json();
  const arrayBuffer = base64ToArrayBuffer(data.imageBase64);
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const chickenHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join(""); // convert bytes to hex string
  console.log("loging in", chickenHex);
  const user = await db.findUserByHex(chickenHex);
  if (user) {
    const token = await signToken(user);
    cookies.set(cookieKeys.chickenAuth, token, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
    });
    return json({ token, user });
  }
  throw error(404, "USER_NOT_FOUND");
}
