export class SSEParser {
  /**
   *
   * @param {*} ssEvents
   */
  constructor(ssEvents) {
    this.onError = ssEvents.onError;
    this.onComplete = ssEvents.onComplete;
    this.onData = ssEvents.onData;
  }

  /**
   *
   * @param {*} input
   */
  parseSSE(input) {
    let accumulatedData = input;
    let pos = 0;
    let data = "";
    while (pos < accumulatedData.length) {
      const lineEnd = accumulatedData.indexOf("\n", pos);
      if (lineEnd === -1) {
        break;
      }

      const line = accumulatedData.slice(pos, lineEnd).trim();
      pos = lineEnd + 1;

      if (line.startsWith("data:")) {
        const eventData = line.slice(5).trim();

        if (eventData === "[DONE]") {
          this.onComplete();
          break;
        } else {
          data += eventData;
        }
      } else if (line === "") {
        if (data) {
          this.processEvent(data);
          data = "";
        }
      }
    }
  }
  /**
   *
   * @param {*} data
   * @returns
   */
  processEvent(data) {
    try {
      const json = JSON.parse(data);
      const text = json.choices[0].delta?.content || "";
      this.onData(text);
      return text;
    } catch (e) {
      this.onError(e);
      return "";
    }
  }
}
