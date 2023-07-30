import { CHICKEN_SECRET } from "$env/static/private";
import { resetSession } from "$lib/utils";
import { cookieKeys } from "$lib/constants";
import { jwtVerify } from "jose";

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const chickenToken = event.cookies.get(cookieKeys.chickenAuth) || null;

  // maybe separate these out if they are authed
  let sessionStart = event.cookies.get(cookieKeys.sessionStart) || null;
  /** @type {('preauth' | 'authed' | any)} */
  let authFlowState = event.cookies.get(cookieKeys.authFlowState) || "preauth";
  let prospectiveUsername = event.cookies.get(cookieKeys.prospectiveUsername) || "";
  let known = event.cookies.get(cookieKeys.known) || false;

  let user = {
    authed: false,
  };

  // if auth token exists
  if (chickenToken) {
    try {
      const { payload } = await jwtVerify(chickenToken, new TextEncoder().encode(CHICKEN_SECRET));
      user = { ...payload, authed: true };
    } catch (e) {
      console.log(e);
      // event.cookies.delete(cookieKeys.chickenAuth);
      // await event.fetch(endpoints.auth.logout);
      await resetSession(event.cookies);
    }
  }

  // auth flow state stuff
  if (user.authed === false && !authFlowState) {
    event.cookies.set(cookieKeys.authFlowState, authFlowState, { path: "/" });
  }

  // session start stuff
  if (!sessionStart) {
    sessionStart = Date.now().toString();
    event.cookies.set(cookieKeys.sessionStart, sessionStart, { path: "/" });
    event.cookies.set(cookieKeys.authFlowState, "preauth", { path: "/" });
  }

  // define locals
  event.locals.user = user;
  event.locals.sessionStart = sessionStart;
  event.locals.authFlowState = authFlowState;
  event.locals.prospectiveUsername = prospectiveUsername;
  event.locals.known = Boolean(known);

  const response = await resolve(event);
  return response;
}
