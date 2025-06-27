
const{
    GoogleGenerativeAI,
    HarmCatagory,
    HarmBlockThreshold,
} = require("@google/generative-ai");

const MODEL_NAME = "gemini-2.5-flash";
const API_KEY = "AIzaSyBpS__O2cU_T5vtuQq_qE4UQ9v8qPtpMkM";

async function runChat(prompt){
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME});

    const generatingConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
    };

    const safetySettings = [
        {
            catagory: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCatagory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCatagory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCatagory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
        ],
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    console.log(response.text());
}

export default runChat;