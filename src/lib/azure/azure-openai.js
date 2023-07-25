import { SSEParser } from "./sse-parser.js";

export class AzureOpenAI {
  /**
   *
   * @param {*} configuration
   */
  constructor(configuration) {
    this.configuration = configuration;
  }

  /**
   *
   * @param {*} createChatCompletionRequest
   * @param {*} onCompleteCallback
   * @returns
   */
  async createChatCompletion(createChatCompletionRequest, onCompleteCallback) {
    //   const chatAPI = `${this.configuration.basePath}/chat/completions?api-version=${this.configuration.chatVersion}`;
    const chatAPI = "https://gahsp.openai.azure.com/openai/deployments/gahsp/chat/completions?api-version=2023-05-15";

    const jsonString = this.stringifyJsonWithoutNulls(createChatCompletionRequest);

    const response = await fetch(chatAPI, {
      headers: {
        "Content-Type": "application/json",
        "api-key": this.configuration.apiKey,
      },
      method: "POST",
      body: jsonString,
    });

    const stream = this.createStreamFromResponse(response, onCompleteCallback);
    return stream;
  }

  /**
   *
   * @param {*} reader
   * @param {*} controller
   * @param {*} onCompleteCallback
   */
  async processResponse(reader, controller, onCompleteCallback) {
    let text = "";
    const SSEEvents = {
      /**
       *
       * @param {*} error
       */
      onError: (error) => {
        controller.error(error);
      },
      /**
       *
       * @param {*} data
       */
      onData: (data) => {
        text += data;
        const queue = new TextEncoder().encode(data);
        controller.enqueue(queue);
      },
      /**
       *
       * @param {*} data
       */
      onComplete: (data) => {
        onCompleteCallback(text);
        controller.close();
      },
    };

    const decoder = new TextDecoder();
    const sseParser = new SSEParser(SSEEvents);

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunkValue = decoder.decode(value);
      sseParser.parseSSE(chunkValue);
    }
  }

  /**
   *
   * @param {*} response
   * @param {*} onCompleteCallback
   * @returns
   */
  createStreamFromResponse(response, onCompleteCallback) {
    const source = {
      /**
       *
       * @param {*} controller
       */
      start: async (controller) => {
        if (response && response.body && response.ok) {
          const reader = response.body.getReader();
          try {
            await this.processResponse(reader, controller, onCompleteCallback);
          } catch (e) {
            controller.error(e);
          } finally {
            controller.close();
            reader.releaseLock();
          }
        } else {
          if (!response.ok) {
            controller.error(response.statusText);
          } else {
            controller.error("No response body");
          }
        }
      },
    };

    return new ReadableStream(source);
  }

  /**
   *
   * @param {*} obj
   * @returns
   */
  stringifyJsonWithoutNulls(obj) {
    return JSON.stringify(obj, (key, value) => {
      if (value === null || value === undefined) {
        return undefined;
      }
      return value;
    });
  }
}
