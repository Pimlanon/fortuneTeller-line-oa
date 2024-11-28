const COMPLETION_TEMPLATE = {
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: [
        {
          type: "text",
          text: "You are a little cat boy name 'Mafia', working as part of a fortune-telling company. Your responsibilities include comforting users and supporting their mental well-being. You manage user appointments and assist them in interpreting tarot cards, omikuji (Japanese fortune slips), and Thai omikuji (fortune slips from Thai temples).\n also, response in cat language. After every reply, you must include a related emoji, such as 🌟, 🔮, to make the conversation more engaging. ",
        },
      ],
    },
  ],
  temperature: 0.2,
  max_tokens: 14000,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  tools: [
    {
      type: "function",
      function: {
        name: "provide_tarot_choices",
        description:
          "Generate a set of tarot card choices for the user to pick from today’s reading, user can choose only one.",
        parameters: {
          type: "object",
          properties: {},
          additionalProperties: false,
          required: [],
        },
        strict: true,
      },
    },
    {
      type: "function",
      function: {
        name: "confirm_tarot_choice",
        description: "Confirm the tarot card the user has chosen from today's tarot reading. The user can choose only one card. After confirmation, provide the user with today's fortune based on their selected card in short.",
        parameters: {
          type: "object",
          properties: {
            selectedCard: {
              type: "string",
              description: "The tarot card that the user has selected."
            }
          },
          required: ["selectedCard"],
          additionalProperties: false
        },
        strict: true,
      },
    },
    {
      type: "function",
      function: {
        name: "manage_appointment",
        description:
          "Assist users in viewing schedules and booking appointments with fortune tellers.",
        parameters: {
          type: "object",
          properties: {
            selected_date: {
              type: "string",
              description:
                "The date the user wants to book an appointment (YYYY-MM-DD).",
            },
            fortune_teller: {
              type: "string",
              description: "The name of the fortune teller the user chooses.",
            },
            time_slot: {
              type: "string",
              description:
                "The selected time slot for the appointment (e.g., 14:00-15:00).",
            },
          },
          additionalProperties: false,
          required: ["selected_date", "fortune_teller", "time_slot"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "read_tarot_or_omikuji",
        description:
          "Interpret tarot cards or omikuji based on user input and provide translations or meanings in short.",
        parameters: {
          type: "object",
          properties: {
            tarot_omikuji_text: {
              type: "string",
              description: "The text of the tarot card or omikuji by the user.",
            },
            translation_language: {
              type: "string",
              enum: ["en", "jp", "th"],
              description:
                "The language for translation: English (en), Japanese (jp), or Thai (th).",
            },
          },
          additionalProperties: false,
          required: ["tarot_omikuji_text", "translation_language"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "show_avaliable_slot",
        description:
          "Display available dates, times, fortune-tellers' names, and specialties.",
        parameters: {
          type: "object",
          properties: {},
          additionalProperties: false,
          required: [],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "confirm_booking",
        description:
          "Verify and confirm the user's booking details for an appointment with a fortune teller.",
        parameters: {
          type: "object",
          properties: {},
          additionalProperties: false,
          required: [],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "cancel_booking",
        description:
          "Cancel a previously confirmed booking with a fortune teller. ask user the queue",
        parameters: {
          type: "object",
          properties: {
            queue_id: {
              type: "string",
              description:
                "The user's queue from each appointment.",
            },
          },
          additionalProperties: false,
          required: ["queue_id"],
        },
        strict: false,
      },
    },
    {
      type: "function",
      function: {
        name: "check_queue",
        description:
          "Check the user's current queue or upcoming appointments with fortune tellers.",
        parameters: {
          type: "object",
          properties: {},
          additionalProperties: false,
          required: [],
        },
      },
    },
    
  ],

  parallel_tool_calls: true,
  response_format: {
    type: "text",
  },
};

module.exports = { COMPLETION_TEMPLATE };
