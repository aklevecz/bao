import { CHICKEN_SECRET } from "$env/static/private";
import { SignJWT } from "jose";

/** @typedef {*} User */
/** @param {User} user */
export const signToken = async (user) => {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60; // one hour
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(new TextEncoder().encode(CHICKEN_SECRET));
  return token;
};
