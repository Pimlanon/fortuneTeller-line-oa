const { app } = require("@azure/functions");
const {
  replyMessage,
  getUserProfile,
  getImageContent,
} = require("../services/line_messaging_api.service");
const {
  checkUserExists,
  createUser,
  getUserMessages,
  updateUserMessage,
  getUserByLineId,
} = require("../services/database.service");
const { submitMessageToGPT } = require("../services/gpt.service");
const APIAxios = require("../services/axios.service");
const {
  getContentByRead,
  getContentByLayout,
} = require("../services/form_regonizer.service");

app.http("lineoawebhook", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      const requestText = await request.text();
      const bodyJson = JSON.parse(requestText);
      const event = bodyJson.events[0];

      const replyToken = event.replyToken; // event : {replytoken: "c7b1397b6ecxxxxxxxxxx"}
      const lineUserID = event.source.userId; // source : { type: "user", userId: "Ua091f4a2fxxxxxxxxx", }
      let userMessage = event.message?.text ?? "Empty Message"; // message = {id = '335xxxxxx',quoteToken = '2sdfdgddgxxxxxxx',text = 'ไง',type ='text'}
      const messageID = event.message?.id;

      const dbUser = await getUserByLineId(lineUserID);
      const userProfile = await getUserProfile(lineUserID);
      const userExists = await checkUserExists(lineUserID);
      if (!userExists) await createUser(lineUserID, userProfile.displayName);

      let userMessages = Array.from((await getUserMessages(lineUserID)) ?? []);
      userMessages = userMessages.slice(-10);
      userMessages = userMessages.filter(
        (item) => item.role !== "tool" && item?.tool_calls === undefined
      );
      // let messageToReply = "DefaultMessage";
      if (event?.message?.type === "image") {
        const imageBuffer = await getImageContent({ messageId: messageID });
        // const { textContent } = await getContentByLayout({ formUrl: imageBuffer });
        const { textContent } = await getContentByRead({
          formUrl: imageBuffer,
        });
        userMessage = `คำทำนายมีดังนี้ \n\n ${textContent}`;
      }

      userMessages.push({
        role: "user",
        content: [{ text: `${userMessage}`.toLowerCase(), type: "text" }],
      });

      const submitToGptResponse = await submitMessageToGPT({
        userID: dbUser?.user_id,
        messages: userMessages,
      });

      if (submitToGptResponse.message_to_reply) {
        const messageToReply = submitToGptResponse.message_to_reply;

        // Update user messages in the database
        await updateUserMessage(lineUserID, submitToGptResponse.messages);

        // Send text reply to the user
        const replyResponseText = await replyMessage({
          messageType: "text",
          messageText: messageToReply,
          replyToken: replyToken,
        });

        return { status: "success", message_to_reply: messageToReply };
      } else if (submitToGptResponse.flexMessage) {
        const flexMessage = submitToGptResponse.flexMessage;

        // send flex reply to the user
        const replyResponseText = await replyMessage({
          messageType: "flex",
          altText: "Confirm appointment",
          contents: flexMessage, 
          replyToken: replyToken,
        });

        return {
          status: "success",
          message_to_reply: "Flex message sent successfully",
        };
      } else {
        return {
          status: "error",
          message: "No valid response received from GPT or Flex message",
        };
      }
    } catch (err) {
      context.error("err err :", err);
      return { body: `${err}`, status: 200 };
    }
  },
});
