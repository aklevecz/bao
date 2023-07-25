import { AzureOpenAI } from "./azure-openai";
import { GAHSP_KEY as apiKey } from "$env/static/private";

import { endpoint } from "$lib/ai";
const config = {
  basePath: "https://gahsp.openai.azure.com",
  apiKey,
  endpoint,
};

const azure = new AzureOpenAI(config);

export default azure;
