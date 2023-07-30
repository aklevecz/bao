export const baoMessages = {
  waitlist: "hey this is bao 🐶 do you want to join the waitlist?",
  login: "hey this is bao 🐶 who am i speaking to? please respond with only your name",
  downloadToSignIn: "download your chicken drawing so we can remember each other forever!",
  noSpacesPlease: "no spaces please! just what you would like to be called with one word",
  ow: "ow my head hurts, somethere is wrong with my brain-- give me a moment (if this keeps happening you can type !brainwash to clear my brain caches)",
  whoDrewDis: "sorry, i have never seen this chicken in my life-- who drew this???",
  winnerWinnerChickenDinner: "winner winner chicken dinner",
  eggcellent: "eggcellent",
  chickenHelp: "can you help me catch that chicken?",
};

export const responseTokens = {
  auth: {
    chickenMasterpiece: "time to draw a chicken",
    uploadChicken: "show me the chicken",
    signOut: "signing you out right now!",
  },
  views: { tv: "time to tune in to the bao show" },
};

/** @typedef {('bao' | 'user')} Author*/
/** @typedef {{id:symbol, content:string, author:Author, auth?: boolean}} Message - Message for the chat */
export const initialChat = {
  content: baoMessages.login,
  author: "bao",
  id: Symbol("id"),
  auth: true,
};

/** @typedef {{preAuth:number, drawingChicken:number, uploadingChicken:number, chickenized:number, failed:number}} AuthStates */
/** @type {AuthStates} */
export const authStates = {
  preAuth: 0,
  drawingChicken: 1,
  uploadingChicken: 2,
  chickenized: 3,
  failed: 4,
};

export const cookieKeys = {
  chickenAuth: "chicken-auth",
  sessionStart: "session-start",
  authFlowState: "auth-flow-state",
  prospectiveUsername: "prospective-username",
  known: "known",
};

export const commands = {
  brainwash: "brainwash",
};
