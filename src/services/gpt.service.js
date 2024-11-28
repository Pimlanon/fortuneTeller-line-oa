const { COMPLETION_TEMPLATE } = require("../config/ai_tool");
const OpenAI = require("openai");
const {
  showFortuneTellerSchedule,
  drawTodayCard,
  updateTodayCardStatus,
  createAppointment,
  checkQueue,
  cancelAppointment,
} = require("./database.service");
const { appointmentFlex } = require("../flex-message/appointment.flex");

const submitMessageToGPT = async ({ userID, messages }) => {
  const payload_template = { ...COMPLETION_TEMPLATE };
  payload_template.messages = payload_template.messages.concat(messages);

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const gptResponseMessage = await openai.chat.completions.create(
      payload_template
    );
    const assistantMessage = gptResponseMessage.choices[0].message;
    payload_template.messages.push(assistantMessage);

    let messageToReplyCallback = "";
    if (gptResponseMessage?.choices?.[0]?.finish_reason === "tool_calls") {
      for (const toolCall of gptResponseMessage.choices[0].message.tool_calls) {
        let toolArg = JSON.parse(toolCall.function.arguments);
        toolArg = Object.keys(toolArg).length === 0 ? null : toolArg; //{ selectedCard: 'The Chariot' }

        console.log("toolArg", toolArg);
        const toolName = toolCall.function.name; //   name = 'provide_tarot_choices'
        console.log("toolName", toolName);
        const toolCallID = toolCall.id;

        let flexMessage = null;
        let toolResponseText = "ฟีเจอร์นี้ยังไม่ได้พัฒนา";
        if (toolName === "provide_tarot_choices") {
          toolResponseText = await drawTodayCard(userID);
        } else if (toolName === "confirm_tarot_choice") {
          toolResponseText = await updateTodayCardStatus(
            userID,
            toolArg.selectedCard
          );
        } else if (toolName === "show_avaliable_slot") {
          toolResponseText = await showFortuneTellerSchedule();
        } else if (toolName === "manage_appointment") {
          const appointmentData = await createAppointment(
            toolArg.fortune_teller,
            userID,
            toolArg.selected_date,
            toolArg.time_slot
          );
          if (
            appointmentData &&
            typeof appointmentData === "object" &&
            appointmentData.appointmentId
          ) {
            const { appointmentId, fortuneName, date, time } = appointmentData;
            flexMessage = appointmentFlex(
              appointmentId,
              fortuneName,
              date,
              time
            );
          } else {
            // handle invalid / error cases
            flexMessage = null;
            toolResponseText =
              typeof appointmentData === "string"
                ? appointmentData
                : "Failed to create an appointment. Please try again.";
          }
        } else if (toolName === "check_queue") {
          toolResponseText = await checkQueue(userID);
        } else if (toolName === "cancel_booking") {
          toolResponseText = await cancelAppointment(toolArg.queue_id, userID);
        } else if (toolName === "read_tarot_or_omikuji") {
          toolResponseText = `interpret the user input or provide translations`;
        }

        if (flexMessage) {
          return { flexMessage };
        } else {
          payload_template.messages.push({
            role: "tool",
            content: [{ type: "text", text: toolResponseText }],
            tool_call_id: toolCallID,
          });
          messageToReplyCallback = toolResponseText;
        }
      }

      const responseAfterToolCall = await openai.chat.completions.create(
        payload_template
      );
      payload_template.messages.push(responseAfterToolCall.choices[0].message);
      messageToReplyCallback = responseAfterToolCall.choices[0].message.content;
    } else {
      messageToReplyCallback = gptResponseMessage.choices[0].message.content;
    }

    payload_template.messages.splice(0, 1); // remove previous message
    return {
      status: "success",
      message_to_reply: messageToReplyCallback,
      messages: payload_template.messages,
    };
  } catch (error) {
    console.error("Error details:", error);
    return {
      status: "error",
      message: "Failed to get a response from GPT.",
      details: error.message,
    };
  }
};

module.exports = { submitMessageToGPT };
