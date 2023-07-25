export const endpoints = {
  db: {
    savedQuestions: "/api/db/saved-questions",
    users: "/api/db/users",
    chickenTokens: "/api/db/chicken-tokens",
  },
  auth: {
    image: "/api/openai/image",
    login: "/api/auth/login",
    logout: "/api/auth/logout",
  },
  chat: "/api/openai/chat",
};

// SavedQuestions
/**
 * @param {{question: string, answer: string}} params
 */
export const saveQuestion = ({ question, answer }) => {
  fetch(endpoints.db.savedQuestions, { method: "POST", body: JSON.stringify({ question, answer }) });
};

/** @param {string} name */
export const fetchImage = async (name) => {
  const res = await fetch(endpoints.auth.image + `?name=${name}`).then((res) => res.json());
  const { image, user } = res;
  return { image, user };
};

/**
 * @returns {Promise<number>}
 */
export const fetchChickenTokens = () => fetch(endpoints.db.chickenTokens).then((r) => r.json());

/** @param {number} chicken */
export const incrementChickenTokens = async (chicken) => {
  const res = await fetch(endpoints.db.chickenTokens, { method: "POST", body: JSON.stringify({ chicken }) });
};

export default { saveQuestion, fetchImage, incrementChickenTokens, fetchChickenTokens };
