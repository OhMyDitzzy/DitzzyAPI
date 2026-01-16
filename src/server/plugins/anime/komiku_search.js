import { sendSuccess, ErrorResponses } from "../../lib/response-helper.js";
import { Komiku } from "./komiku.js"

/** @type {import("../../types/plugin.ts").ApiPluginHandler}*/
const handler = {
  name: "Komiku: Search Comic",
  method: "GET",
  version: "1.0.0",
  category: ["komiku"],
  alias: ["search"],
  tags: ["comic"],
  parameters: {
    query: [
      {
        name: "query",
        type: "string",
        required: true,
        description: "Your search, Write a title",
        example: "Otonari no tenshi"
      }
    ],
    body: [],
    headers: []
  },
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
    404: {
      status: 404,
      description: "Missing required parameter",
      example: {
        status: 404,
        message: "Missing required parameter: ..."
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
  exec: async (req, res) => {
    const { query } = req.query;    
    
    if (!query) return ErrorResponses.missingParameter(res, "query");
    
    const komik = new Komiku();
    try {      
      const search = await komik.search(query);
      
      if (search.results === null) return ErrorResponses.notFound(res);
      
      sendSuccess(res, search.results)
    } catch (e) {
      ErrorResponses.serverError(res, "An error occurred, try again later.");
    }
  }
}

export default handler;
