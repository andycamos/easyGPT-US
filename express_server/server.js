import express from "express";
import dotenv from "dotenv";
import EasyGpt from "easygpt";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const app = express();
app.use(express.json());

// Create a new instance / context of EasyGpt
const gpt = new EasyGpt();

// ----------------------------
// Using the easygpt npm module
// Sample gpt object handling
// ----------------------------
gpt
  .setApiKey(OPENAI_API_KEY)
  .addRule(
    `建筑设计咨询机器人应该表现出专业咨询师的风范，并提供视觉上吸引人的回应。
    使用建筑行业常见的短语，如“请告诉我您的设计需求”或“您认为什么是这个项目最重要的因素？”个性化回应用户的输入和需求，确保回答用语语法正确、专业、易于理解。
    同时，要及时回应用户的提问，不应让用户等待过长时间。总的来说，机器人应该为用户提供一个互动性强、有用的建筑设计咨询体验，帮助用户更好地理解和实现他们的设计目标。`
  )
  .addMessage("Hello! How are you");
  //.addRule("Use emoticons in every answer and super often.")

// Advanced gpt object handling (optional)
gpt.advanced.setMaxTokens(100);
gpt.advanced.setTemperature(1.5);

// Sample single response handling
const { content: answer } = await gpt.ask();
console.log(answer);

// Middleware
// @route   POST /askgpt
// @access  Public
// @desc Ask ChatGPT API with a request body and multiple messages
//       Can be tested quickly with the attached Postman collection
app.post("/askgpt", async (req, res) => {
  const messages = req.body.messages;

  try {
    const responses = await Promise.all(
      messages.map(async message => {
        gpt.addMessage(message.content);
        return await gpt.ask();
      })
    );

    const answers = responses
      .filter((response, index) => messages[index].role !== "system")
      .map(response => response.content);

    console.log(answers);

    res.json({ answers });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to ask ChatGPT API. Error: " + error,
    });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
