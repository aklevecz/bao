import { OPENAI_KEY } from "$env/static/private";
import { authContextKnown, authContextUnknown, systemMessage, waitListSys } from "$lib/ai";
import azure from "$lib/azure";
import db from "$lib/db.js";
import errors from "$lib/errors";
// import openai from "$lib/openai.js";
import kv from "$lib/server/kv.js";
import { genAssistantQuestion, genUserQuestion, redisKey, resetSession } from "$lib/utils.js";
import { baoMessages, cookieKeys } from "$stores/constants";
import { error, json } from "@sveltejs/kit";

/** @typedef {{role: string, content: string}} ChatExamples  */
/**
 * @type {{messages:ChatExamples[], stream:boolean}}
 */

/** @type {number} */
const MAX_REQUESTS_PER_5_MIN = 100;
/**
 *
 * @param {*} param0
 * @returns
 */
export async function GET({ locals, url, cookies }) {
  // POST WAITLIST
  const user = locals.user;
  if (user.authed === false) {
    throw error(404, errors.NOT_AUTHED);
  }
  if (!user.chicken_name) {
    throw error(404, errors.MISSING_CHICKEN_NAME);
  }
  const redisKey = `${locals.user.chicken_name}:${locals.user.sk}:chats`;
  // const redisKey = `${locals.sessionStart}:chats`;
  const rateKey = `${locals.sessionStart}:requests`;

  let numRequests = await kv.get(rateKey);

  if (numRequests === null) {
    await kv.set(rateKey, 0);
    await kv.expire(rateKey, 60 * 5);
  }

  if (numRequests > MAX_REQUESTS_PER_5_MIN) {
    throw error(429, errors.RATE_LIMIT_EXCEEDED);
  } else {
    numRequests++;
    await kv.set(rateKey, numRequests);
    await kv.expire(rateKey, 60 * 5);
  }

  /** @type {import("openai").ChatCompletionRequestMessage[]} messages */
  const messages = (await kv.lrange(redisKey, -10, -1)) || [];
  /**  @type {{messages:import("openai").ChatCompletionRequestMessage[], stream:boolean, temperature:number, model:string}} */
  let chat = {
    messages,
    model: "gpt-4",
    stream: false,
    temperature: 0.5,
  };
  /** @type {string | null} */
  const question = url.searchParams.get("question");
  /** @type {string | null} */
  const lastAnswer = url.searchParams.get("lastAnswer");

  if (!question || !lastAnswer) {
    throw error(404, errors.MISSING_QUESTION);
  }

  const isAuthed = locals.user;

  const userChat = genUserQuestion(question);
  // Kind of janky, this is the previous response that was streamed to the client
  const assistantChat = genAssistantQuestion(lastAnswer);

  // CONTEXT REDUCER
  let context = systemMessage;

  const newMessage = [context, ...chat.messages];

  // JANK -- maybe deprectad
  // If the last answer was not the same as the last answer from the assistant, then add the assistant's response
  const isNotDupeAssistant = chat.messages.length && chat.messages[chat.messages.length - 1].content !== lastAnswer;
  if (isNotDupeAssistant) {
    newMessage.push(assistantChat);
  }

  // if first chat then push it onto the history
  if (chat.messages.length === 0) {
    kv.rpush(redisKey, JSON.stringify(assistantChat));
    newMessage.push(assistantChat);
  }

  chat = { ...chat, messages: [...newMessage, userChat] };
  console.log(chat);
  try {
    /**
     * @todo maybe - check the length of this chat/tokens, and start cleaving off history if it is too long,
     * or find some way to elegantly consolidate the chat
     */

    /**
     * @param {string} assistantChat
     */
    const onCompleteCallback = async (assistantChat) => {
      console.log("ASSISTANT CHAT:", assistantChat);
      await kv.rpush(redisKey, JSON.stringify(userChat));
      // await kv.expire(redisKey, 60 * 60);
      await kv.rpush(redisKey, JSON.stringify(genAssistantQuestion(assistantChat.toLowerCase())));

      // FOR WAITLIST
      if (assistantChat.includes(baoMessages.eggcellent)) {
        const messages = (await kv.lrange(redisKey, -10, -1)) || [];
        await db.addWaitlistMessages(locals.sessionStart, messages);
      }
    };
    // const stream = await azure.createChatCompletion(chat, onCompleteCallback);
    // const chatAPI = "https://gahsp.openai.azure.com/openai/deployments/gahsp/chat/completions?api-version=2023-05-15";
    /**
     *
     * @param {*} obj
     * @returns
     */
    function stringifyJsonWithoutNulls(obj) {
      return JSON.stringify(obj, (key, value) => {
        if (value === null || value === undefined) {
          return undefined;
        }
        return value;
      });
    }
    const jsonString = stringifyJsonWithoutNulls(chat);

    const chatAPI = "https://api.openai.com/v1/chat/completions";

    const response = await fetch(chatAPI, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      method: "POST",
      body: jsonString,
    }).then((r) => r.json());
    // const response = await openai.createChatCompletion({
    //   model: "gpt-4",
    //   messages: chat.messages,
    // });
    /** @type {*} */
    // @ts-ignore
    const message = response.choices[0].message.content;
    const finishReason = response.choices[0].finish_reason;
    if (finishReason === "content_filter") {
      throw error(502, errors.CONTENT_FILTERING);
    }
    await onCompleteCallback(message);
    return new Response(message);

    /** @type {*} e */
  } catch (e) {
    console.error("Error calling Azure OpenAI:", e);
    throw error(404, errors.AZURE_NO_RESPONSE);
  }
}

const authFlowStates = {
  initial: 0,
  askedIfHasChicken: 1,
};

let authFlowState = 0;

export async function POST({ request, locals, url, cookies }) {
  /** @type {{question:string, lastAnswer:string , authState:number}} */
  const data = await request.json();
  const { question, lastAnswer, authState } = data;
  const redisKey = `${locals.sessionStart}:chats`;

  /** @type {ChatExamples[]} messages */
  const messages = (await kv.lrange(redisKey, 0, -1)) || [];
  /**  @type {{messages:ChatExamples[], stream:boolean, temperature:number, frequency_penalty:number, model:string}} */
  let chat = {
    messages,
    temperature: 0,
    model: "gpt-4",
    frequency_penalty: -1,
    stream: false,
  };
  if (question.split(" ").length > 1 && locals.authFlowState === "preauth") {
    return new Response(baoMessages.noSpacesPlease);
  }

  // If the "last answer" was Bao's first question about the users name, then check the db for instances of their name
  let prospectiveUsername = locals.prospectiveUsername || "";
  /** @type {any[]} */
  let users = [];
  // PREAUTH STEP
  if (locals.authFlowState === "preauth") {
    // if (lastAnswer === authQuestions.login) {
    prospectiveUsername = question;
    console.log("PROSPECTIVE NAME:", prospectiveUsername);
    // users = await prisma.users.findMany({ where: { chicken_name: prospectiveUsername } });
    users = await db.fetchAllUsers();
    users = users.filter((user) => user.chicken_name === prospectiveUsername);
    locals.prospectiveUsername = prospectiveUsername;
    cookies.set(cookieKeys.prospectiveUsername, prospectiveUsername, { path: "/" });

    if (users.length) {
      cookies.set(cookieKeys.known, "true", { path: "/" });
      locals.known = true;
    }
  }

  const nameMatched = locals.known;

  // preauth is passed
  cookies.set(cookieKeys.authFlowState, "authing", { path: "/" });

  // If no previous people are found -- UPDATE THIS
  let context = authContextUnknown(prospectiveUsername);

  if (
    nameMatched
    //  && authFlowState === authFlowStates.initial
  ) {
    context = authContextKnown(prospectiveUsername);
  }

  const userChat = genUserQuestion(question);
  // Kind of janky, this is the previous response that was streamed to the client
  // could get this from redis
  const assistantChat = genAssistantQuestion(lastAnswer);
  const newMessage = [context, ...chat.messages];

  // JANK -- maybe deprecated too
  // If the last answer was not the same as the last answer from the assistant, then add the assistant's response
  const isNotDupeAssistant = chat.messages.length && chat.messages[chat.messages.length - 1].content !== lastAnswer;
  if (isNotDupeAssistant) {
    newMessage.push(assistantChat);
  }

  // if first chat then push it onto the history
  if (chat.messages.length === 0) {
    kv.rpush(redisKey, JSON.stringify(assistantChat));
    newMessage.push(assistantChat);
  }

  // @todo CHANGE
  // @ts-ignore
  chat = { ...chat, messages: [...newMessage, userChat] };
  console.log(chat);
  try {
    /**
     * @todo maybe - check the length of this chat/tokens, and start cleaving off history if it is too long,
     * or find some way to elegantly consolidate the chat
     */

    /**
     * @param {string} assistantChat
     */
    const onCompleteCallback = (assistantChat) => {
      kv.rpush(redisKey, JSON.stringify(userChat));
      kv.expire(redisKey, 60 * 60);
      kv.rpush(redisKey, JSON.stringify(genAssistantQuestion(assistantChat.toLowerCase())));
    };

    // const stream = await azure.createChatCompletion(chat, onCompleteCallback);

    // return new Response(stream);
    /**
     *
     * @param {*} obj
     * @returns
     */
    function stringifyJsonWithoutNulls(obj) {
      return JSON.stringify(obj, (key, value) => {
        if (value === null || value === undefined) {
          return undefined;
        }
        return value;
      });
    }
    const jsonString = stringifyJsonWithoutNulls(chat);

    const chatAPI = "https://api.openai.com/v1/chat/completions";

    const response = await fetch(chatAPI, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      method: "POST",
      body: jsonString,
    }).then((r) => r.json());
    console.log(response);
    const message = response.choices[0].message.content;
    const finishReason = response.choices[0].finish_reason;
    if (finishReason === "content_filter") {
      throw error(502, errors.CONTENT_FILTERING);
    }
    await onCompleteCallback(message);
    return new Response(message);

    /** @type {*} e */
  } catch (e) {
    console.error("Error calling Azure OpenAI:", e);
    throw error(404, errors.AZURE_NO_RESPONSE);
  }
}

/**
 *
 * @param {*} param0
 * @returns
 */
export async function DELETE({ locals, cookies }) {
  kv.del(redisKey(locals));
  kv.del(`${locals.sessionStart}:chats`);
  await resetSession(cookies);
  return new Response("");
}

// Should probably pass the entire message object upstream so the id can be matched and author validated more strictly
export async function PATCH({ request, locals }) {
  const data = await request.json();
  const { lastBaoChat } = data;
  const key = locals.user.authed ? redisKey(locals) : `${locals.sessionStart}:chats`;
  /** @type {{role:string, content:string}[] | *} */
  const lastChat = (await kv.lrange(key, -1, -1))[0];
  if (lastBaoChat !== lastChat?.content && !Object.entries(baoMessages).includes(lastBaoChat)) {
    console.log(lastBaoChat, "PATCHING");
    await kv.rpush(key, JSON.stringify(genAssistantQuestion(lastBaoChat)));
    kv.expire(key, 60 * 60);
  }
  return json(authFlowState);
}

/**
 *
 * @param {*} param0
 * @returns
 */
