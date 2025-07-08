import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const MODEL_NAME = "gemini-2.5-flash";
const API_KEY = "AIzaSyBpS__O2cU_T5vtuQq_qE4UQ9v8qPtpMkM"; // Store in env var in production

// Helper function to convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper function to get MIME type
const getMimeType = (file) => {
  return file.type || 'application/octet-stream';
};

// Function to handle text extraction from documents
const extractTextFromDocument = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      
      // For now, we'll treat all documents as text
      // In production, you might want to use libraries like:
      // - mammoth.js for .docx files
      // - pdf-parse for .pdf files
      if (file.type === 'text/plain') {
        resolve(content);
      } else {
        // For other document types, we'll send the base64 content
        // and let Gemini handle it
        resolve(content);
      }
    };
    reader.onerror = reject;
    
    if (file.type === 'text/plain') {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  });
};

async function runChat(prompt, files = []) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  try {
    if (!files || files.length === 0) {
      const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [],
      });

      const result = await chat.sendMessage(prompt);
      const response = result.response;
      return response.text();
    }

    // Handle files with multimodal content
    const parts = [{ text: prompt }];

    for (const file of files) {
      try {
        if (file.type.startsWith('image/')) {
          // Handle image files
          const base64Data = await fileToBase64(file);
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: getMimeType(file)
            }
          });
        } else if (file.type === 'application/pdf' || 
                   file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                   file.type === 'application/msword' ||
                   file.type === 'text/plain') {
          // Handle document files
          const base64Data = await fileToBase64(file);
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: getMimeType(file)
            }
          });
        } else {
          // For other file types, try to extract text
          const textContent = await extractTextFromDocument(file);
          parts.push({ text: `\n\nFile: ${file.name}\nContent: ${textContent}` });
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        parts.push({ text: `\n\nError processing file: ${file.name}` });
      }
    }

    // Send multimodal content
    const result = await model.generateContent(parts);
    const response = result.response;
    return response.text();

  } catch (error) {
    console.error('Error in runChat:', error);
    throw error;
  }
}

export default runChat;