export default function () {
  /**
   *
   * @param {string} key
   * @returns {string | null}
   */
  function get(key) {
    return localStorage.getItem(key);
  }

  /**
   *
   * @param {string} key
   * @param {*} value
   */
  function set(key, value) {
    let val = value;
    if (typeof value !== "string") {
      val = JSON.stringify(value);
    }
    localStorage.setItem(key, val);
  }

  return {
    get,
    set,
    /**
     *
     * @param {string} chickenName
     * @param {string} userId
     * @param {*} chats
     */
    saveChat: (chickenName, userId, chats) => {
      set(`${chickenName}:${userId}:chats`, chats);
    },
  };
}
