import axios from "axios";
import { fileTypeFromBuffer } from "file-type";
import { readFileSync } from "fs";
import CryptoJS from "crypto-js";

const ModelMap = {
  nano_banana: 2,
  seed_dream: 5,
  flux: 8,
  qwen_image: 9
};

const IMAGE_TO_ANIME_PRESETS = {
  manga: {
    size: "2K",
    aspect_ratio: "match_input_image",
    output_format: "jpg",
    sequential_image_generation: "disabled",
    max_images: 1,
    prompt: "Convert the provided image into a KOREAN-STYLE MANGA illustration. Apply strong stylization with clear and noticeable differences from the original image."
  },

  anime: {
    size: "2K",
    aspect_ratio: "match_input_image",
    output_format: "jpg",
    sequential_image_generation: "disabled",
    max_images: 1,
    prompt: "Convert the provided image into an ANIME-STYLE illustration. Apply strong stylization with clear and noticeable differences from the original image."
  },

  ghibli: {
    size: "2K",
    aspect_ratio: "match_input_image",
    output_format: "jpg",
    sequential_image_generation: "disabled",
    max_images: 1,
    prompt: "Convert the provided image into a STUDIO GHIBLI-STYLE illustration. Apply strong stylization with clear and noticeable differences from the original image."
  },

  cyberpunk: {
    size: "2K",
    aspect_ratio: "match_input_image",
    output_format: "jpg",
    sequential_image_generation: "disabled",
    max_images: 1,
    prompt: "Convert the provided image into a CYBERPUNK-STYLE illustration with neon colors, futuristic elements, and dark atmosphere."
  },

  watercolor: {
    size: "2K",
    aspect_ratio: "match_input_image",
    output_format: "png",
    sequential_image_generation: "disabled",
    max_images: 1,
    prompt: "Convert the provided image into a WATERCOLOR painting style with soft brush strokes and pastel colors."
  },

  pixelart: {
    size: "2K",
    aspect_ratio: "match_input_image",
    output_format: "png",
    sequential_image_generation: "disabled",
    max_images: 1,
    prompt: "Convert the provided image into PIXEL ART style with 8-bit retro gaming aesthetic."
  },

  sketch: {
    size: "2K",
    aspect_ratio: "match_input_image",
    output_format: "jpg",
    sequential_image_generation: "disabled",
    max_images: 1,
    prompt: "Convert the provided image into a detailed PENCIL SKETCH with realistic shading and artistic strokes."
  },

  oilpainting: {
    size: "2K",
    aspect_ratio: "match_input_image",
    output_format: "jpg",
    sequential_image_generation: "disabled",
    max_images: 1,
    prompt: "Convert the provided image into an OIL PAINTING style with thick brush strokes and rich colors."
  }
};

const IMAGE_TO_ANIME_ENCRYPTED_PAYLOADS = {
  manga: "L7p91uXhVyp5OOJthAyqjSqhlbM+RPZ8+h2Uq9tz6Y+4Agarugz8f4JjxjEycxEzuj/7+6Q0YY9jUvrfmqkucENhHAkMq1EOilzosQlw2msQpW2yRqV3C/WqvP/jrmSu3aUVAyeFhSbK3ARzowBzQYPVHtxwBbTWwlSR4tehnodUasnmftnY77c8gIFtL2ArNdzmPLx5H8O9un2U8WE4s0+xiFV3y4sbetHMN7rHh7DRIpuIQD4rKISR/vE+HeaHpRavXfsilr5P7Y6bsIo+RRFIPgX2ofbYYiATziqsjDeie4IlcOAVf1Pudqz8uk6YKM78CGxjF9iPLYQnkW+c6j96PNsg1Yk4Xz8/ZcdmHF4GGZe8ILYH/D0yyM1dsCkK1zY8ciL+6pAk4dHIZ/4k9A==",
  ghibli: "L7p91uXhVyp5OOJthAyqjSqhlbM+RPZ8+h2Uq9tz6Y+4Agarugz8f4JjxjEycxEzuj/7+6Q0YY9jUvrfmqkucENhHAkMq1EOilzosQlw2msQpW2yRqV3C/WqvP/jrmSu3aUVAyeFhSbK3ARzowBzQYPVHtxwBbTWwlSR4tehnodUasnmftnY77c8gIFtL2ArNdzmPLx5H8O9un2U8WE4syzL5EYHGJWC1rlQM9xhNe1PViOsBSxmwHVwOdqtxZtcAJmGuzTgG7JVU7Hr9ZRwajhYK5yxQwSdJGwwR4jjS1yF9s9wKUQqgI+fYxaw7FZziLS+9JG5pTEjch4D0fpl+LO7vIynHN4cyu4DDeAUwNeYfbGMn2QQs+5OgMdViCAM1GkJk2jhlQm10rESTjDryw==",
  anime: "L7p91uXhVyp5OOJthAyqjSqhlbM+RPZ8+h2Uq9tz6Y+4Agarugz8f4JjxjEycxEzuj/7+6Q0YY9jUvrfmqkucENhHAkMq1EOilzosQlw2msQpW2yRqV3C/WqvP/jrmSu3aUVAyeFhSbK3ARzowBzQYPVHtxwBbTWwlSR4tehnodUasnmftnY77c8gIFtL2ArNdzmPLx5H8O9un2U8WE4s7O2FxvQPCjt2uGmHPMOx1DsNSnLvzCKPVdz8Ob1cPHePmmquQZlsb/p+8gGv+cizSiOL4ts6GD2RxWN+K5MmpA/F3rQXanFUm4EL0g7qZCQbChRRQyaAyZuxtIdTKsmsMzkVKM5Sx96eV7bEjUAJ52j6NcP96INv2DhnWTP7gB6tltFQe8B8SPS2LuLRuPghA=="
};

export class AIEnhancer {
  constructor() {
    this.CREATED_BY = "Ditzzy";
    this.NOTE = "Thank you for using this scrape, I hope you appreciate me for making this scrape by not deleting wm";

    this.AES_KEY = "ai-enhancer-web__aes-key";
    this.AES_IV = "aienhancer-aesiv";

    this.HEADERS = {
      "accept": "*/*",
      "content-type": "application/json",
      "Referer": "https://aienhancer.ai",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    this.POLLING_INTERVAL = 2000;
    this.MAX_POLLING_ATTEMPTS = 120;
  }

  encrypt(data) {
    const plaintext = typeof data === "string" ? data : JSON.stringify(data);

    return CryptoJS.AES.encrypt(
      plaintext,
      CryptoJS.enc.Utf8.parse(this.AES_KEY),
      {
        iv: CryptoJS.enc.Utf8.parse(this.AES_IV),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    ).toString();
  }

  decrypt(encryptedData) {
    const decrypted = CryptoJS.AES.decrypt(
      encryptedData,
      CryptoJS.enc.Utf8.parse(this.AES_KEY),
      {
        iv: CryptoJS.enc.Utf8.parse(this.AES_IV),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  decryptToJSON(encryptedData) {
    const decrypted = this.decrypt(encryptedData);
    return JSON.parse(decrypted);
  }

  wrapResponse(data) {
    return {
      created_by: this.CREATED_BY,
      note: this.NOTE,
      results: data
    };
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async processImage(image) {
    let img;
    let type;

    if (typeof image === "string") {
      img = readFileSync(image);
      type = await fileTypeFromBuffer(img);
    } else if (Buffer.isBuffer(image)) {
      img = image;
      type = await fileTypeFromBuffer(image);
    } else {
      throw new Error("Invalid image input: must be file path (string) or Buffer");
    }

    if (!type) {
      throw new Error("Could not detect file type");
    }

    const allowedImageTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/bmp'
    ];

    if (!allowedImageTypes.includes(type.mime)) {
      throw new Error(
        `Unsupported format: ${type.mime}. Allowed: jpeg, jpg, png, webp, gif, bmp`
      );
    }

    const imgbase64 = img.toString("base64");
    return {
      base64: `data:${type.mime};base64,${imgbase64}`,
      mime: type.mime
    };
  }

  async createTask(apiUrl, model, image, config) {
    const { base64 } = await this.processImage(image);

    const settings = typeof config === "string"
      ? config
      : this.encrypt(config);

    const requestConfig = {
      url: apiUrl,
      method: "POST",
      headers: this.HEADERS,
      data: {
        model,
        image: base64,
        settings
      }
    };

    const { data } = await axios.request(requestConfig);

    if (data.code !== 100000 || !data.data.id) {
      throw new Error(`Task creation failed: ${data.message}`);
    }

    return data.data.id;
  }

  async checkTaskStatus(resultUrl, taskId) {
    const config = {
      url: resultUrl,
      method: "POST",
      headers: this.HEADERS,
      data: { task_id: taskId }
    };

    const { data } = await axios.request(config);
    return data;
  }

  async pollTaskResult(resultUrl, taskId) {
    let attempts = 0;

    while (attempts < this.MAX_POLLING_ATTEMPTS) {
      const response = await this.checkTaskStatus(resultUrl, taskId);

      if (response.code !== 100000) {
        throw new Error(`Status check failed: ${response.message}`);
      }

      const { status, error, output, input, completed_at } = response.data;

      if ((status === "succeeded" || status === "success") && output && input) {
        return {
          id: taskId,
          output,
          input,
          error,
          status,
          created_at: response.data.created_at,
          started_at: response.data.started_at,
          completed_at: completed_at
        };
      }

      if (status === "failed" || status === "fail" || error) {
        throw new Error(`Task failed: ${error || "Unknown error"}`);
      }

      console.log(`[${taskId} | ${status}] Polling attempt ${attempts + 1}/${this.MAX_POLLING_ATTEMPTS}`);

      await this.sleep(this.POLLING_INTERVAL);
      attempts++;
    }

    throw new Error(`Task timeout after ${this.MAX_POLLING_ATTEMPTS} attempts`);
  }

  async imageToAnime(image, preset = "anime") {
    try {
      const apiUrl = "https://aienhancer.ai/api/v1/r/image-enhance/create";
      const resultUrl = "https://aienhancer.ai/api/v1/r/image-enhance/result";
      const model = 5;

      let config;

      if (typeof preset === "string") {
        if (IMAGE_TO_ANIME_PRESETS[preset]) {
          config = IMAGE_TO_ANIME_PRESETS[preset];
        }
        else if (IMAGE_TO_ANIME_ENCRYPTED_PAYLOADS[preset]) {
          config = IMAGE_TO_ANIME_ENCRYPTED_PAYLOADS[preset];
        }
        else {
          config = preset;
        }
      } else {
        config = preset;
      }

      const taskId = await this.createTask(apiUrl, model, image, config);
      console.log(`✓ Task created: ${taskId}`);

      const result = await this.pollTaskResult(resultUrl, taskId);
      return this.wrapResponse(result);
    } catch (error) {
      throw new Error(`Image to anime conversion failed: ${error}`);
    }
  }

  async ImageAIEditor(image, model, preset) {
    try {
      const apiUrl = "https://aienhancer.ai/api/v1/k/image-enhance/create";
      const resultUrl = "https://aienhancer.ai/api/v1/k/image-enhance/result";

      const modelId = ModelMap[model];
      const taskId = await this.createTask(apiUrl, modelId, image, preset);
      const result = await this.pollTaskResult(resultUrl, taskId);

      return this.wrapResponse(result);
    } catch (e) {
      throw new Error("Image editor failed: " + e);
    }
  }

  async AIImageRestoration(image, model, config) {
    try {
      const apiUrl = "https://aienhancer.ai/api/v1/r/image-enhance/create";
      const resultUrl = "https://aienhancer.ai/api/v1/r/image-enhance/result";

      const taskId = await this.createTask(apiUrl, model, image, config);
      const result = await this.pollTaskResult(resultUrl, taskId);

      return this.wrapResponse(result);
    } catch (e) {
      throw new Error(`An error occurred while upscaling the image: ${e}`);
    }
  }

  async RemoveBackground(image, config = {}) {
    try {
      const apiUrl = "https://aienhancer.ai/api/v1/r/image-enhance/create";
      const resultUrl = "https://aienhancer.ai/api/v1/r/image-enhance/result";
      const model = 4;

      const payloadConfig = config ? config : {
        threshold: 0,
        reverse: false,
        background_type: "rgba",
        format: "png",
      };

      const taskId = await this.createTask(apiUrl, model, image, payloadConfig);
      const result = await this.pollTaskResult(resultUrl, taskId);

      return this.wrapResponse(result);
    } catch (e) {
      throw new Error(`Remove background error: ${e}`);
    }
  }

  decryptPayload(encryptedPayload) {
    return this.decryptToJSON(encryptedPayload);
  }

  encryptConfig(config) {
    return this.encrypt(config);
  }
}