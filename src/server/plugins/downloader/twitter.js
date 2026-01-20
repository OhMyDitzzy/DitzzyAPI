import axios from "axios";
import { sendSuccess, ErrorResponses } from "../../lib/response-helper.js";
import * as cheerio from 'cheerio';
import FormData from 'form-data';

export class Twitter {
  constructor() {
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

  async download(link) {
    try {
      const formData = new FormData();
      formData.append('page', link);
      formData.append('ftype', 'all');
      formData.append('ajax', '1');

      const response = await axios.post('https://twmate.com/id2/', formData, {
        headers: {
          ...formData.getHeaders(),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const html = response.data;
      const $ = cheerio.load(html);

      const result = {
        media: []
      };

      const videoTable = $('.files-table tbody tr');
      
      if (videoTable.length > 0) {
        const titleElement = $('.info-container h4');
        if (titleElement.length) {
          const fullTitle = titleElement.text().trim();
          const separatorIndex = fullTitle.indexOf(' - ');
          
          if (separatorIndex !== -1) {
            result.username = fullTitle.substring(0, separatorIndex).trim();
            result.caption = fullTitle.substring(separatorIndex + 3).trim();
          } else {
            result.caption = fullTitle;
          }
        }

        const thumbnailElement = $('.thumb-container img');
        if (thumbnailElement.length) {
          result.thumbnail = thumbnailElement.attr('src');
        }

        const likesElement = $('.info-container p span:contains("Suka")');
        if (likesElement.length) {
          result.likes = likesElement.text().replace('Suka : ', '').trim();
        }

        videoTable.each((_, element) => {
          const quality = $(element).find('td:nth-child(1)').text().trim();
          const type = $(element).find('td:nth-child(2)').text().trim();
          const url = $(element).find('td:nth-child(3) a').attr('href');

          if (url) {
            result.media.push({
              type,
              quality,
              url
            });
          }
        });
      } else {
        $('.card.icard').each((_, card) => {
          $(card).find('.card-body a.btn-dl').each((_, link) => {
            const downloadUrl = $(link).attr('href');
            const qualityText = $(link).text().trim();
            const quality = qualityText.replace('Unduh ', '').replace(/\s+/g, '');

            if (downloadUrl) {
              result.media.push({
                type: 'image',
                quality,
                url: downloadUrl
              });
            }
          });
        });
      }

      return this.wrapResponse(result);

    } catch (error) {
      throw new Error(`Failed to download: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/** @type {import("../../types/plugin").ApiPluginHandler} */
const handler = {
  name: "Twitter Downloader",
  description: "Download Twitter Media, Support Photo too",
  version: "1.0.0",
  method: "GET",
  category: ["downloader"],
  alias: ["twitter", "tw"],
  tags: ["social-media", "video", "downloader"],
  parameters: {
    query: [
      {
        name: "url",
        type: "string",
        required: true,
        description: "Your Twitter URL",
        example: "https://x.com/ClashofClans/status/2013235147978494164?s=20"
      }
    ],
    body: [],
    headers: []
  },
  responses: {
    200: {
      status: 200,
      description: "Successfully retrieved Twitter data",
      example: {
        status: 200,
        author: "Ditzzy",
        note: "Thank you for using this API!",
        results: {}
      }
    },
    400: {
      status: 400,
      description: "Invalid Twitter URL provided",
      example: {
        status: 400,
        message: "Invalid URL - must be a valid Twitter URL"
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
      description: "Server error or Twitter API unavailable",
      example: {
        status: 500,
        message: "An error occurred, please try again later."
      }
    }
  },
  exec: async (req, res) => {
    const { url } = req.query
    
    if (!url) return ErrorResponses.missingParameter(res, "url");
    
    const regex = /^https?:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/[a-zA-Z0-9_]+\/status\/(\d+)(?:\?.*)?$/;
    
    if (!regex.test(url)) return ErrorResponses.invalidUrl(res, "Invalid URL - must be a valid Twitter URL");
    
    const tw = new Twitter();    
    try {
      const download = await tw.download(url);
      
      if (download.results.media.length === 0) return ErrorResponses.notFound(res, "Twitter link is invalid, private or Server returned null data");
      
      return sendSuccess(res, download.results);
    } catch (e) {
      console.error("Twitter download error:", e);
      return ErrorResponses.notFound(res, "Twitter link is invalid or Server returned null data");
    }
  }
}

export default handler;