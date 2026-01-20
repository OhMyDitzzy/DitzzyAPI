import { sendSuccess, ErrorResponses } from "../../lib/response-helper.js";
import { Komiku } from "./komiku.js"

/** @type {import("../../types/plugin.ts").ApiPluginHandler}*/
const handler = {
  name: "Komiku:  Get the latest manhua",
  method: "GET",
  version: "1.0.0",
  category: ["komiku"],
  alias: ["getLatestManhua"],
  tags: ["comic"],
  responses: {
    200: {
      status: 200,
      description: "Successfully retrieved data",
      example: {
        status: 200,
        author: "Ditzzy",
        note: "Thank you for using this API!",
        results: {}
      }
    },
    500: {
      status: 500,
      description: "Server error or unavailable",
      example: {
        status: 500,
        message: "An error occurred, please try again later."
      }
    }
  },
  exec: async (_req, res) => {
    const komik = new Komiku();
    try {      
      const latest = await komik.getLatestPopularManhua();

      sendSuccess(res, latest.results)
    } catch (e) {
      ErrorResponses.serverError(res, "An error occurred, try again later.");
    }
  }
}

export default handler;
