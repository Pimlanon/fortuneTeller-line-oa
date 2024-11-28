const { app } = require('@azure/functions');
const OpenAI = require("openai");
const sqlite3 = require("sqlite3");
const { COMPLETION_TEMPLATE } = require("../config/ai_tool");

app.http('submitMessage', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const bodyJson = JSON.parse(await request.text());
        COMPLETION_TEMPLATE.messages = COMPLETION_TEMPLATE.messages.concat(bodyJson.messages);
        return {
            status: 200,
            body: JSON.stringify({ status: "success", message_to_reply: "สวัสดีค่ะ", messages: COMPLETION_TEMPLATE.messages }),
            headers: { "content-type": "application/json" },
        };
    }
});
