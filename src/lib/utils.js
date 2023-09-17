import { cookieKeys, responseTokens } from "$lib/constants";

/**
 * @param {string} question
 * @returns {import("openai").ChatCompletionRequestMessage}
 */
export const genUserQuestion = (question) =>
  /** @type {import("openai").ChatCompletionRequestMessage} */
  ({ role: "user", content: question });
/**
 * @param {string} question
 * @returns {import("openai").ChatCompletionRequestMessage}
 */ export const genAssistantQuestion = (question) =>
  /** @type {import("openai").ChatCompletionRequestMessage} */
  ({ role: "assistant", content: question });

/**
 *
 * @param {string} content
 * @returns
 */
export const genSystemMessage = (content) =>
  /** @type {import("openai").ChatCompletionRequestMessage} */
  ({ role: "system", content });

/** @param {HTMLDivElement} container */
export const autoScroll = (container) => {
  container.scrollTo({ top: container.scrollHeight + 100, behavior: "smooth" });
};

/**
 * Check if a child element is completely inside a parent element.
 *
 * @param {HTMLElement} parentElement - The parent element.
 * @param {HTMLElement} childElement - The child element.
 * @returns {boolean} - Returns true if the child element is inside the parent element, otherwise false.
 */
export function isElementInside(parentElement, childElement) {
  const parentRect = parentElement.getBoundingClientRect();
  const childRect = childElement.getBoundingClientRect();
  console.log(parentRect);
  console.log(childRect);
  return (
    childRect.top >= parentRect.top &&
    childRect.left >= parentRect.left &&
    childRect.right <= parentRect.right &&
    childRect.bottom <= parentRect.bottom
  );
}

/**
 *
 * @param {*} buffer
 * @returns
 */
export async function sha256(buffer) {
  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

/**
 *
 * @param {*} obj
 * @param {string} value
 * @returns
 */
export function findValue(obj, value) {
  for (let key in obj) {
    if (obj[key] === value) {
      return true;
    }

    if (typeof obj[key] === "object") {
      if (findValue(obj[key], value)) {
        return true;
      }
    }
  }

  return false;
}

/**
 *
 * @param {*} obj
 * @param {*} resultArr
 * @returns
 */
export function collectNestedValues(obj, resultArr = []) {
  for (let key in obj) {
    if (typeof obj[key] === "object") {
      collectNestedValues(obj[key], resultArr);
    } else {
      resultArr.push(obj[key]);
    }
  }
  return resultArr;
}

const responseTokensArray = collectNestedValues(responseTokens);
/**
 *
 * @param {*} msg
 */
export function removeTokensFromMessage(msg) {
  for (const token of responseTokensArray) {
    msg = msg.replace(token, "");
  }
  return msg;
}

// just saving for reference
/** @param {*} e*/
async function readerFileToHex(e) {
  const dataUrl = e.target.result;
  const imgData = dataUrl.split(",")[1];
  // testing hash stuff
  const binaryStr = atob(imgData);
  const len = binaryStr.length;
  const buffer = new ArrayBuffer(len);
  const view = new Uint8Array(buffer);

  for (let i = 0; i < len; i++) {
    view[i] = binaryStr.charCodeAt(i);
  }

  const hex = await sha256(buffer);
  // testing hash stuff end
}

/**
 *
 * @param {*} locals
 * @returns
 */
export const redisKey = (locals) => `${locals.user.chicken_name}:${locals.user.sk}:chats`;

export const delay = (t = 100) => new Promise((resolve) => setTimeout(resolve, t));

/**
 *
 * @param {*} cookies
 */
export const resetSession = async (cookies) => {
  await cookies.delete(cookieKeys.chickenAuth, { path: "/" });
  await cookies.delete(cookieKeys.sessionStart, { path: "/" });
  await cookies.delete(cookieKeys.authFlowState, { path: "/" });
  await cookies.delete(cookieKeys.prospectiveUsername, { path: "/" });
  await cookies.delete(cookieKeys.known, { path: "/" });
};

/**
 *
 * @param {string} base64String
 * @returns
 */
export function urlB64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
