// errors.js
/**
 * @type {{[key:string]:{message:string, error:string}}}
 */
export default {
  MISSING_QUESTION: {
    error: "MISSING_QUESTION",
    message: "The question is missing",
  },
  AZURE_NO_RESPONSE: {
    error: "AZURE_NO_RESPONSE",
    message: "oooch, my brain is not working-- try again, or perhaps a little later when my dad fixes it",
  },
  NOT_AUTHED: {
    error: "NOT_AUTHED",
    message: "you need so sign in again",
  },
  MISSING_CHICKEN_NAME: {
    error: "MISSING_CHICKEN_NAME",
    message: "your chicken name is missing",
  },
  RATE_LIMIT_EXCEEDED: {
    error: "RATE_LIMIT_EXCEEDED",
    message: "too much talking. I'm sleepy. come back in like 5mins.",
  },
  CONTENT_FILTERING: {
    error: "CONTENT_FILTERING",
    message: "i had some dirty thoughts, it might be your fault or mine. I have no idea because I'm just a dog.",
  },
};
