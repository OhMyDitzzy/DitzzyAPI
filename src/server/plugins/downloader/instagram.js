import axios from "axios";
import { sendSuccess, ErrorResponses } from "../../lib/response-helper.js";

class Instagram {
  constructor() {
    this.API_URL = "https://thesocialcat.com/api/instagram-download";
    this.HEADERS = {
      "accept": "*/*",
      "accept-language": "id-ID",
      "content-type": "application/json",
      "Referer": "https://thesocialcat.com/tools/instagram-video-downloader",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    this.CREATED_BY = "Ditzzy";
    this.NOTE = "Thank you for using this scrape, I hope you appreciate me for making this scrape by not deleting wm";
  }

  wrapResponse(data) {
    return {
      created_by: this.CREATED_BY,
      note: this.NOTE,
      results: data
    };
  }

  async download(url) {
    try {
      const config = {
        url: this.API_URL,
        headers: this.HEADERS,
        method: "POST",
        data: {
          url
        }
      };

      const { data } = await axios.request(config);
      return this.wrapResponse(data);
    } catch (e) {
      throw new Error("Error: " + e.message);
    }
  }
}

/** @type {import("../../types/plugin").ApiPluginHandler} */
const handler = {
  name: "Instagram Downloader",
  description: "Download Instagram Media, Support Photo too",
  version: "1.0.0",
  method: "GET",
  category: ["downloader"],
  alias: ["instagram", "ig"],
  tags: ["social-media", "video", "downloader"],
  parameters: {
    query: [
      {
        name: "url",
        type: "string",
        required: true,
        description: "Your Instagram URL",
        example: "https://www.instagram.com/reel/DS1kGwOkU3T/?igsh=MWVyOW50ODhnOXFpYw=="
      }
    ],
    body: [],
    headers: []
  },
  responses: {
    200: {
      status: 200,
      description: "Successfully retrieved Instagram data",
      example: {
        status: 200,
        author: "Ditzzy",
        note: "Thank you for using this API!",
        results: {}
      }
    },
    400: {
      status: 400,
      description: "Invalid Instagram URL provided",
      example: {
        status: 400,
        message: "Invalid URL - must be a valid Instagram URL"
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
      description: "Server error or Instagram API unavailable",
      example: {
        status: 500,
        message: "An error occurred, please try again later."
      }
    }
  },
  exec: async (req, res) => {
    const { url } = req.query
    
    if (!url) return ErrorResponses.missingParameter(res, "url");
    
    const regex = /(?:(?:http|https):\/\/)?(?:www.)?(?:instagram.com|instagr.am)\/([A-Za-z0-9-_]+)/im;
    
    if (!regex.test(url)) return ErrorResponses.invalidUrl(res, "Invalid URL - must be a valid Instagram URL");
    
    const ig = new Instagram();    
    try {
      const download = await ig.download(url);
      
      return sendSuccess(res, download.results);
    } catch (e) {
      console.error("Instagram download error:", e);
      return ErrorResponses.serverError(res);
    }
  }
}

export default handler;