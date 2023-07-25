import { OPENAI_KEY } from "$env/static/private";
import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  organization: "org-PuTuRPgofxtCNq9G4QnJjokl",
  apiKey: OPENAI_KEY,
});

const openai = new OpenAIApi(configuration);

export default openai;
