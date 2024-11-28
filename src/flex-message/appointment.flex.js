exports.appointmentFlex = (queue, fortuneTellerName, date, time) => {
    return {
      "type": "bubble",
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "Mafia Tarot !",
            "weight": "bold",
            "style": "normal",
            "align": "start",
            "size": "23px",
            "color": "#8340c7"
          },
          {
            "type": "text",
            "text": "123 , cat village, love neko road",
            "offsetTop": "3px",
            "color": "#636363",
            "weight": "regular",
            "style": "normal",
            "size": "14px"
          },
          {
            "type": "separator",
            "margin": "15px"
          },
          {
            "type": "text",
            "text": `Your queue is ${queue}`,
            "offsetTop": "10px",
            "weight": "bold",
            "color": "#636363"
          },
          {
            "type": "text",
            "text": `Fortune teller: ${fortuneTellerName}`,
            "offsetTop": "15px",
            "weight": "bold",
            "color": "#636363"
          },
          {
            "type": "text",
            "text": `Date: ${date}`,
            "offsetTop": "18px",
            "color": "#636363",
            "weight": "bold"
          },
          {
            "type": "text",
            "text": `Time: ${time}`,
            "offsetTop": "20px",
            "color": "#636363",
            "weight": "bold"
          },
          {
            "type": "separator",
            "margin": "35px"
          }
        ],
        "height": "220px"
      },
      "footer": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "Mafia loves u all ✨",
            "color": "#636363",
            "size": "14px",
            "align": "start"
          }
        ],
        "offsetBottom": "10px"
      }
    };
  };