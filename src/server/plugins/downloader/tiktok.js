import axios from "axios";
import { sendSuccess, ErrorResponses } from "../../lib/response-helper.js";

/** @type {import("../../types/plugin").ApiPluginHandler} */
const handler = {
  name: "TikTok Downloader",
  description: "Download videos or slide photos from TikTok URLs. Supports both standard and HD quality downloads.",
  version: "1.0.0",
  method: "GET",
  category: ["downloader"],
  alias: ["tiktok", "tt"],
  tags: ["social-media", "video", "downloader"],

  parameters: {
    query: [
      {
        name: "url",
        type: "string",
        required: true,
        description: "TikTok video URL to download",
        example: "https://www.tiktok.com/@username/video/1234567890",
        pattern: "^https?:\\/\\/(www\\.|vm\\.)?tiktok\\.com\\/.+$"
      }
    ],
    body: [],
    headers: []
  },

  responses: {
    200: {
      status: 200,
      description: "Successfully retrieved TikTok video data",
      example: {
        status: 200,
        author: "Ditzzy",
        note: "Thank you for using this API!",
        results: {
          id: "1234567890",
          title: "Video Title",
          author: {
            nickname: "Username",
            unique_id: "username"
          },
          play: "https://video-url.com/video.mp4",
          wmplay: "https://video-url.com/video-watermark.mp4",
          hdplay: "https://video-url.com/video-hd.mp4",
          music: "https://music-url.com/audio.mp3",
          duration: 15,
          create_time: 1234567890
        }
      }
    },
    400: {
      status: 400,
      description: "Invalid TikTok URL provided",
      example: {
        status: 400,
        message: "Invalid URL - must be a valid TikTok URL"
      }
    },
    404: {
      status: 404,
      description: "Missing required parameter",
      example: {
        status: 404,
        message: "Missing required parameter: url"
      }
    },
    500: {
      status: 500,
      description: "Server error or TikTok API unavailable",
      example: {
        status: 500,
        message: "An error occurred, please try again later."
      }
    }
  },

  exec: async (req, res) => {
    const { url } = req.query;
    
    if (!url) {
      return ErrorResponses.missingParameter(res, "url");
    }

    if (!url.match(/tiktok/gi)) {
      return ErrorResponses.invalidUrl(res, "Invalid URL - must be a valid TikTok URL");
    }

    try {
      const videoData = await fetchTikTokVideo(url);
      return sendSuccess(res, videoData);
    } catch (error) {
      console.error("TikTok download error:", error);
      return ErrorResponses.serverError(res);
    }
  }
};

export default handler;

async function fetchTikTokVideo(url) {
  const encodedParams = new URLSearchParams();
  encodedParams.set("url", url);
  encodedParams.set("hd", "1");

  const response = await axios({
    method: "POST",
    url: "https://tikwm.com/api/",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Cookie": "current_language=en",
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
    },
    data: encodedParams
  });

  if (!response.data || !response.data.data) {
    throw new Error("Invalid response from TikTok API");
  }

  return response.data.data;
}