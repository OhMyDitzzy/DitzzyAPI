import { sendSuccess, ErrorResponses } from "../../lib/response-helper.js";
import { Komiku } from "./komiku.js"

/** @type {import("../../types/plugin.ts").ApiPluginHandler}*/
const handler = {
  name: "Komiku: Read chapter",
  method: "GET",
  version: "1.0.0",
  category: ["komiku"],
  alias: ["readChapter"],
  tags: ["comic"],
  parameters: {
    query: [
      {
        name: "slug",
        type: "string",
        required: true,
        description: "Chapter slug of comic",
        example: "otonari-no-tenshi-sama-ni-itsunomanika-dame-ningen-ni-sareteita-ken-chapter-00"
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
    
    const regex = /^[a-z0-9]+(?:-[a-z0-9]+)*-chapter-\d+(?:-\d+)?$/;
    
    if (!regex.test(slug)) return ErrorResponses.invalidUrl(res, "Invalid slug chapter - must be a valid slug chapter of Comic");
    
    const komik = new Komiku();
    try {      
      const detail = await komik.readChapter(slug);
      
      if (detail.results === null) return ErrorResponses.notFound(res);
      
      sendSuccess(res, detail.results)
    } catch (e) {
      ErrorResponses.serverError(res, "An error occurred, try again later.");
    }
  }
}

export default handler;
