import axios from "axios";
import { sendSuccess, ErrorResponses } from "../../lib/response-helper.js";

class Youtube {
  constructor() {
    this.API_URL = "https://thesocialcat.com/api/youtube-download";
    this.HEADERS = {
      "accept": "*/*",
      "accept-language": "id-ID",
      "content-type": "application/json",
      "Referer": "https://thesocialcat.com/tools/youtube-video-downloader",
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
  
  async download(url, format) {
    try {
      const config = {
        url: this.API_URL,
        headers: this.HEADERS,
        method: "POST",
        data: {
          format,
          url
        }
      };

      const { data } = await axios.request(config);
      return this.wrapResponse(data);
    } catch (e) {
      throw new Error(`Error downloading YouTube content: ${e}`);
    }
  }
}

/** @type {import("../../types/plugin").ApiPluginHandler} */
const handler = {
  name: "YouTube Downloader",
  description: "Download YouTube media with resolution up to 1080p and support audio",
  version: "1.0.0",
  method: "GET",
  category: ["downloader"],
  alias: ["youtube", "yt"],
  tags: ["social-media", "video", "downloader"],
  parameters: {
    query: [
      {
        name: "url",
        type: "string",
        required: true,
        description: "Your YouTube URL",
        example: "https://youtu.be/zawDTvoXT8k?si=FgZnxXzMXJI8jfkB"
      },
      {
        name: "format",
        type: "string",
        required: true,
        description: "Format to download",
        example: "720p",
        enum: ["144p", "240p", "360p", "480p", "720p", "1080p", "audio"],
        default: "720p"
      }
    ],
    body: [],
    headers: []
  },
  responses: {
    200: {
      status: 200,
      description: "Successfully retrieved YouTube video data",
      example: {
        status: 200,
        author: "Ditzzy",
        note: "Thank you for using this API!",
        results: {}
      }
    },
    400: {
      status: 400,
      description: "Invalid YouTube URL provided",
      example: {
        status: 400,
        message: "Invalid URL - must be a valid YouTube URL"
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
      description: "Server error or YouTube API unavailable",
      example: {
        status: 500,
        message: "An error occurred, please try again later."
      }
    }
  },
  exec: async (req, res) => {
    const { url } = req.query
    const { format } = req.query
    
    if (!url) return ErrorResponses.missingParameter(res, "url");
    
    if (!format) return ErrorResponses.missingParameter(res, "format");
    
    const regex = /^(https?:\/\/)?((www\.|m\.)?youtube(-nocookie)?\.com|youtu\.be)(\/(embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/)?)([\w-]{11})(\S+)?$/;
    
    if (!regex.test(url)) return ErrorResponses.invalidUrl(res, "Invalid URL - must be a valid YouTube URL");
    
    const yt = new Youtube();    
    try {
      const download = await yt.download(url, format);
      
      return sendSuccess(res, download.results);
    } catch (e) {
      console.error("Error:", e);
      return ErrorResponses.serverError(res);
    }
  }
}

export default handler;