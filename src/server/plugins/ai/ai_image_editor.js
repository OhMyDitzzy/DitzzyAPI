import { sendSuccess, ErrorResponses } from "../../lib/response-helper.js";
import { AIEnhancer } from "./ai_image_utils.js";
import multer from "multer";
import axios from "axios";
import path from "path"; 

const ModelMap = {
  nano_banana: 2,
  seed_dream: 5,
  flux: 8,
  qwen_image: 9
};

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

/** @type {import("../../types/plugin.ts").ApiPluginHandler}*/
const handler = {
  name: "AI Image Editor",
  description: "Edit your images using AI",
  method: "POST",
  version: "1.0.0",
  category: ["ai"],
  alias: ["aiImageEditor"],
  tags: ["ai", "image"],
  parameters: {
    body: [
      {
        name: "image",
        type: "file",
        required: true,
        description: "Image file to edit (or URL)",
        fileConstraints: {
          maxSize: 5 * 1024 * 1024, // 5MB
          acceptedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
          acceptedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"]
        },
        acceptUrl: true
      },
      {
        name: "model",
        type: "string",
        required: true,
        description: "Select an AI model to edit your image.",
        example: "nano_banana",
        enum: ["nano_banana", "seed_dream", "flux", "qwen_image"],
        default: "nano_banana"
      },
      {
        name: "prompt",
        type: "string",
        required: true,
        description: "Tell AI how your image will look edited",
        example: "Put Cristiano Ronaldo next to that person"
      },
      {
        name: "output_size",
        type: "string",
        required: true,
        description: "Output size",
        example: "2K",
        enum: ["2K", "4K", "8K"],
        default: "2K"
      },
      {
        name: "disable_safety_checker",
        type: "boolean",
        required: false,
        description: "If you want to disable safety checker for indecent images, set to true (default false)",
        example: false,
        default: false
      }
    ]
  },
  responses: {
    200: {
      status: 200,
      description: "Successfully retrieved data",
      example: {
        status: 200,
        author: "Ditzzy",
        note: "Thank you for using this API!",
        results: {
          image_url: "https://example.com/edited-image.jpg",
          filename: "edited-image.jpg",
          size: "2K"
        }
      }
    },    
    404: {
      status: 404,
      description: "Missing required parameter",
      example: {
        status: 404,
        message: "Missing required parameter"
      }
    },
    400: {
      status: 400,
      description: "Invalid file or URL",
      example: {
        success: false,
        message: "Invalid image file or URL"
      }
    },
    413: {
      status: 413,
      description: "File too large",
      example: {
        success: false,
        message: "File size exceeds 5MB limit"
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
    upload.single('image')(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
              success: false,
              message: "File size exceeds 5MB limit"
            });
          }
        }
        return res.status(400).json({
          success: false,
          message: err.message || "File upload error"
        });
      }
      
      try {
        const { prompt, output_size, disable_safety_checker, model } = req.body;       
        
        if (!prompt) {
          return ErrorResponses.missingParameter(res, "prompt");
        }
        if (!output_size) {
          return ErrorResponses.missingParameter(res, "output_size");
        }
        if (!model) {
          return ErrorResponses.missingParameter(res, "model");
        }
        
        if (!ModelMap[model]) {
          return res.status(400).json({
            success: false,
            message: `Invalid model. Must be one of: ${Object.keys(ModelMap).join(', ')}`
          });
        }
        
        const ai = new AIEnhancer();
        let imageBuffer;
        let filename;

        if (req.file) {
          imageBuffer = req.file.buffer;
          filename = req.file.originalname;
        } 
        else if (req.body.image && typeof req.body.image === 'string') {
          const imageUrl = req.body.image;
          
          try {
            new URL(imageUrl);
          } catch {
            return ErrorResponses.invalidUrl(res, "Invalid image URL");
          }

          const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            maxContentLength: 5 * 1024 * 1024,
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; AIImageEditor/1.0)'
            }
          });

          imageBuffer = Buffer.from(response.data);
          filename = path.basename(new URL(imageUrl).pathname) || 'image';
        } else {
          return ErrorResponses.missingParameter(res, "image (file or URL)");
        }
        
        const edit = await ai.ImageAIEditor(imageBuffer, model, {
          size: output_size,
          aspect_ratio: "match_input_image",
          go_fast: true,
          prompt: prompt,
          output_quality: 100,
          disable_safety_checker: disable_safety_checker === 'true' || disable_safety_checker === true,
        });
  
        return sendSuccess(res, edit.results);
      } catch (e) {
        console.error("Exception caught:", e);
        return ErrorResponses.serverError(res, "An error occurred, try again later.");
      }
    });
  }
}

export default handler;