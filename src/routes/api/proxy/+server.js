import { error } from "@sveltejs/kit";

/**
 *
 * @param {*} param0
 * @returns
 */
export async function GET({ url, cookies }) {
  /**
   * @type {string | null}
   */
  let proxyThis = url.searchParams.get("proxythis");
  if (proxyThis) {
    return fetch(proxyThis);
  } else {
    throw error(404, "BAD_PROXY");
  }
}
