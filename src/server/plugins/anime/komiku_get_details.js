import { sendSuccess, ErrorResponses } from "../../lib/response-helper.js";
import { Komiku } from "./komiku.js"

/** @type {import("../../types/plugin.ts").ApiPluginHandler}*/
const handler = {
  name: "Komiku: Get detail of comic",
  method: "GET",
  version: "1.0.0",
  category: ["komiku"],
  alias: ["getDetail"],
  tags: ["comic"],
  disabled: true,
  disabledReason: "Komiku server is temporarily unavailable, Maybe this feature will not be removed until the server is back.",
  parameters: {
    query: [
      {
        name: "slug",
        type: "string",
        required: true,
        description: "Slug comic",
        example: "solo-leveling-id"
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
    400: {
      status: 400,
      description: "Invalid Slug provided",
      example: {
        status: 400,
        message: "Invalid slug - must be a valid of Comic slug"
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
    const { slug } = req.query;    
    if (!slug) return ErrorResponses.missingParameter(res, "slug");
    
    const regex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    
    if (!regex.test(slug)) return ErrorResponses.invalidUrl(res, "Invalid slug - must be a valid of Comic slug");
    
    const komik = new Komiku();
    try {      
      const detail = await komik.getDetail(slug);
      
      if (detail.results === null) return ErrorResponses.notFound(res);
      
      sendSuccess(res, detail.results)
    } catch (e) {
      ErrorResponses.serverError(res, "An error occurred, try again later.");
    }
  }
}

export default handler;
