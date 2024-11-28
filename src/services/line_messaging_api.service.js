const LINE_REPLY_URL = "https://api.line.me/v2/bot/message/reply";
const APIAxios = require("./axios.service");


const getImageContent = async ({ messageId = "", returnType = "base64" }) => {
    try {
        // LINE Messaging API endpoint สำหรับดึงรูปภาพ
        const url = `https://api-data.line.me/v2/bot/message/${messageId}/content`;

        // ดึงรูปภาพจาก LINE API
        const response = await APIAxios({
            method: "get",
            url: url,
            responseType: "arraybuffer", // สำคัญ: ต้องระบุ responseType เป็น arraybuffer
            headers: { Authorization: `Bearer ${process.env.CHANNEL_SECRET_TOKEN}` },
        });
        if (returnType === "base64") {
            // แปลงข้อมูลเป็น base64
            const base64Image = Buffer.from(response.data, "binary").toString("base64");

            // เพิ่ม data URI scheme สำหรับ base64
            const contentType = response.headers["content-type"];
            const base64WithPrefix = `data:${contentType};base64,${base64Image}`;

            return base64WithPrefix;
        }
        return Buffer.from(response.data, "binary");
    } catch (error) {
        console.error("Error getting image from LINE:", error);
        throw new Error(`Failed to get image content: ${error.message}`);
    }
};

const getUserProfile = async (lineID) => {
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env?.CHANNEL_SECRET_TOKEN}`,
    };
    const response = await APIAxios.get(`https://api.line.me/v2/bot/profile/${lineID}`, { headers });
    return {
        displayName: response.data?.displayName,
        userId: response.data?.userId,
        language: response.data?.language,
        pictureUrl: response.data?.pictureUrl,
        statusMessage: response.data?.statusMessage,
    };
};

const replyMessage = async ({ messageType = "flex", messageText = "", contents = {}, replyToken = "", altText = "" }) => {
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env?.CHANNEL_SECRET_TOKEN}`,
    };
    const data = {
        replyToken: replyToken,
        messages: [
            messageType === "flex"
                ? {
                      type: messageType,
                      altText,
                      contents,
                  }
                : { type: messageType, text: messageText },
        ],
    };

    try {
        const response = await APIAxios.post(LINE_REPLY_URL, data, { headers: headers });
        return { status: "ok", message: "Message sented" };
    } catch (error) {
        return { status: "fail", message: String(error) };
    }
};

// line_messaging_api.service.js  //C8ba16491d78468430f616cf82614aed0
const pushMessageToGroup = async ({ to = "C38ff6371ad9e24273288cfd7db6f7b26", messageText = "" }) => {
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env?.CHANNEL_SECRET_TOKEN}`,
    };

    try {
        await APIAxios.post(
            "https://api.line.me/v2/bot/message/push",
            {
                to: to,
                messages: [
                    {
                        type: "text",
                        text: messageText,
                    },
                ],
            },
            { headers },
        );
        return { status: "success" };
    } catch (error) {
        console.error("Error pushing message:", error);
        throw error;
    }
};

const pushMessageToAllUsers = async (messageText) => {
    const lineBroadcastEndpoint = 'https://api.line.me/v2/bot/message/broadcast';
    const accessToken = process.env?.CHANNEL_SECRET_TOKEN; 
  
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
  
    const body = {
      messages: [
        {
          type: 'text',
          text: messageText,
        },
      ],
    };
  
    try {
      const response = await APIAxios.post(lineBroadcastEndpoint, body, { headers });
      return response.data;
    } catch (err) {
      throw new Error(`Failed to send broadcast message: ${err.message}`);
    }

}
module.exports = { replyMessage, getUserProfile, getImageContent, pushMessageToGroup, pushMessageToAllUsers };