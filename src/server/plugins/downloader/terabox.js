import axios from "axios";
import FormData from "form-data";
import * as cheerio from "cheerio";
import { sendSuccess, ErrorResponses } from "../../lib/response-helper.js";

class TeraBox {
  constructor() {
    this.BASE_URL = "https://terabxdownloader.org";
    this.AJAX_PATH = "/wp-admin/admin-ajax.php";
    this.HEADERS = {
      "accept": "*/*",
      "accept-language": "id-ID",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Referer": "https://terabxdownloader.org/",
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

  transformFolder(rawFolder) {
    return {
      name: rawFolder["📂 Name"],
      type: rawFolder["📋 Type"],
      size: rawFolder["📏 Size"]
    };
  }

  transformFile(rawFile) {
    return {
      name: rawFile["📂 Name"],
      type: rawFile["📋 Type"],
      fullPath: rawFile["📍 Full Path"],
      size: rawFile["📏 Size"],
      downloadLink: rawFile["🔽 Direct Download Link"]
    };
  }

  transformSummary(rawSummary) {
    return {
      totalFolders: rawSummary["📁 Total Folders"],
      totalFiles: rawSummary["📄 Total Files"],
      totalItems: rawSummary["🔢 Total Items"]
    };
  }

  extractData(rawResponse) {
    const rawData = rawResponse.data;

    return {
      folders: (rawData["📁 Folders"] || []).map(folder => this.transformFolder(folder)),
      files: (rawData["📄 Files"] || []).map(file => this.transformFile(file)),
      summary: rawData["📊 Summary"] 
        ? this.transformSummary(rawData["📊 Summary"])
        : { totalFolders: 0, totalFiles: 0, totalItems: 0 },
      shortlink: rawData["🔗 ShortLink"] || ""
    };
  }

  async getNonce() {
    const { data } = await axios.get(this.BASE_URL);

    const $ = cheerio.load(data);
    const nncSc = $('#jquery-core-js-extra').html();
    
    if (!nncSc) {
      throw new Error("Nonce script not found, Unable to continue.");
    }

    const match = nncSc.match(/"nonce"\s*:\s*"([^"]+)"/i);

    if (!match) {
      throw new Error('Nonce script found but Nonce value could not be found');
    }

    return match[1];
  }

  async download(url) {
    try {
      const nonce = await this.getNonce();

      const form = new FormData();
      form.append('action', 'terabox_fetch');
      form.append('url', url);
      form.append('nonce', nonce);

      const config = {
        url: this.BASE_URL + this.AJAX_PATH,
        method: "POST",
        headers: this.HEADERS,
        data: form
      };

      const { data } = await axios.request(config);
      const extractedData = this.extractData(data);

      return this.wrapResponse(extractedData);
    } catch (e) {
      throw new Error(`Error downloading from TeraBox: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}

/** @type {import("../../types/plugin").ApiPluginHandler} */
const handler = {
  name: "Terabox Downloader",
  description: "Download terabox files or folders",
  version: "1.0.0",
  method: "GET",
  category: ["downloader"],
  alias: ["terabox"],
  tags: ["downloader"],
  parameters: {
    query: [
      {
        name: "url",
        type: "string",
        required: true,
        description: "Your Terabox URL",
        example: "https://1024terabox.com/s/1hTspAuZCdy5vDAPiUOn3ig"
      }
    ],
    body: [],
    headers: []
  },
  responses: {
    200: {
      status: 200,
      description: "Successfully retrieved Terabox data",
      example: {
        status: 200,
        author: "Ditzzy",
        note: "Thank you for using this API!",
        results: {}
      }
    },
    400: {
      status: 400,
      description: "Invalid Terabox URL provided",
      example: {
        status: 400,
        message: "Invalid URL - must be a valid Terabox URL"
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
      description: "Server error or Terabox API unavailable",
      example: {
        status: 500,
        message: "An error occurred, please try again later."
      }
    }
  },
  exec: async (req, res) => {
    const { url } = req.query
    
    if (!url) return ErrorResponses.missingParameter(res, "url");
    
    const regex = /^(https?:\/\/)?(www\.)?(terabox\.com|teraboxapp\.com|1024tera\.com|1024terabox\.com|terabox\.app|nephobox\.com)\/(s\/|sharing\/embed\?surl=)[\w-]+/i
    
    if (!regex.test(url)) return ErrorResponses.invalidUrl(res, "Invalid URL - must be a valid Terabox URL");
    
    const terabox = new TeraBox();    
    try {
      const download = await terabox.download(url);
      
      return sendSuccess(res, download.results);
    } catch (e) {
      console.error("Terabox download error:", e);
      return ErrorResponses.serverError(res);
    }
  }
}

export default handler;