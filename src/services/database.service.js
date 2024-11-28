const sqlite3 = require("sqlite3");
const { pushMessageToGroup, pushMessageToAllUsers } = require("./line_messaging_api.service");

// TODAY CARD
async function drawTodayCard(userID) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./fortune.db");

    try {
      const userCheckQuery = `
                SELECT * FROM tb_users
                WHERE user_id = ?
                AND (today_card_status IS NULL OR today_card_status = '');
            `;

      db.get(userCheckQuery, [userID], (err, user) => {
        if (err) {
          db.close();
          reject(err);
          return;
        }

        // If user exists and hasn't played
        if (user) {
          const randomCardQuery = `
                        SELECT name FROM tb_tarot_cards
                        ORDER BY RANDOM()
                        LIMIT 3;
                    `;

          db.all(randomCardQuery, [], (err, cards) => {
            if (err) {
              db.close();
              reject(err);
              return;
            }

            const cardNames = cards.map((card) => card.name).join(", ");
            resolve(`picks one form these cards: ${cardNames}`);
            db.close();
          });
        } else {
          resolve("You have already drawn your cards today!");
          db.close();
        }
      });
    } catch (err) {
      db.close();
      reject(err);
    }
  });
}

async function updateTodayCardStatus(userID, cardName) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./fortune.db");

    try {
      const updateQuery = `
          UPDATE tb_users
          SET today_card_status = 'Y',
              today_card_desc = ?
          WHERE user_id = ?;
        `;

      db.run(updateQuery, [cardName, userID], function (err) {
        if (err) {
          db.close();
          reject(err);
          return;
        }

        if (this.changes > 0) {
          resolve(
            `Today's card (${cardName}) has been saved for user ${userID}. And tell the user of today's card meaning`
          );
        } else {
          resolve("No changes were made. User not found or already updated.");
        }

        db.close();
      });
    } catch (err) {
      db.close();
      reject(err);
    }
  });
}

async function clearTodayCardStatusForAllUsers() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./fortune.db");

    try {
      const clearQuery = `
        UPDATE tb_users
        SET today_card_status = NULL,
            today_card_desc = NULL;
      `;

      db.run(clearQuery,async function (err) {
        if (err) {
          db.close();
          reject(err);
          return;
        }

        if (this.changes > 0) {
          const message =
            "Meow~ The 'today card' status has been reset for all users! Purr-haps it’s time for a fresh start?";
          try {
            await pushMessageToAllUsers(message);
            resolve("The 'today card' status was reset, and a broadcast message was sent to all users.");
          } catch (error) {
            reject(`Failed to send broadcast message: ${error.message}`);
          }
        } else {
          resolve("No changes were made. It seems all users were already cleared.");
        }

        db.close();
      });
    } catch (err) {
      db.close();
      reject(err);
    }
  });
}

// ------------------------------------------------
// APPOINTMENT

async function showFortuneTellerSchedule() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./fortune.db");

    const query = `
        SELECT 
          w.day_of_week,
          w.start_date,
          w.end_date,
          w.start_time,
          w.end_time,
          w.fortune_teller_id,
          f.name AS fortune_teller_name,
          f.specialty
        FROM tb_work_days w
        JOIN tb_fortune_tellers f ON w.fortune_teller_id = f.fortune_teller_id
        WHERE DATE(w.start_date) > DATE('now') 
        ORDER BY w.start_date ASC;
      `;

    db.all(query, [], (err, rows) => {
      db.close();

      if (err) {
        reject(err);
        return;
      }

      if (rows.length === 0) {
        resolve("No future schedules found.");
        return;
      }

      const scheduleList = rows
        .map((row) => {
          return `
          Fortune Teller: ${row.fortune_teller_name}
          Specialty: ${row.specialty}
          Day of Week: ${row.day_of_week}
          Schedule: ${row.start_date}
          Time: ${row.start_time} - ${row.end_time}
          `;
        })
        .join("\n\n");

      resolve(`Future Fortune Teller Schedules:\n\n${scheduleList}`);
    });
  });
}

async function createAppointment(fortuneName, userID, date, time) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./fortune.db");

    try {
      // find fortune teller's id
      const fortuneTellerQuery = `
          SELECT fortune_teller_id 
          FROM tb_fortune_tellers 
          WHERE name = ?;
        `;
      db.get(fortuneTellerQuery, [fortuneName.toLowerCase()], (err, fortuneTeller) => {
        if (err) {
          db.close();
          reject(err);
          return;
        }

        if (!fortuneTeller) {
          db.close();
          resolve("Fortune teller not found");
          return;
        }

        const fortuneTellerId = fortuneTeller.fortune_teller_id;

        const insertQuery = `
            INSERT INTO tb_appointments (user_id, fortune_teller_id, appointment_date, appointment_time, status)
            VALUES (?, ?, ?, ?, 'confirm');
          `;

        db.run(
          insertQuery,
          [userID, fortuneTellerId, date, time],
          async function (err) {
            db.close();
            if (err) {
              reject(err);
              return;
            }

            const appointmentId = this?.lastID;

            if (this.changes > 0) {
              try {
                // push message to group
                await pushMessageToGroup({
                  messageText: `Received new appointment #${appointmentId} for Khun ${fortuneName.toUpperCase()}. 
                  date: ${date} 
                  time: ${time} 
                  userId: ${userID}`,
                });

                // resolve(
                //   `Appointment created for user ${userID} with fortune teller ${fortuneName}. Your queue id is ${appointmentId}.`
                // );
                resolve({appointmentId, fortuneName, date, time,})
              } catch (err) {
                reject(`Error sending notification: ${err.message}`);
              }
            } else {
              resolve("No changes were made. Appointment not found.");
            }
          }
        );
        // }
        // );
      });
    } catch (err) {
      db.close();
      reject(err);
    }
  });
}

async function checkQueue(userID) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./fortune.db");

    try {
      // find appointment
      const currentDate = new Date().toISOString(); // current date in ISO format
      const appointmentQuery = `
            SELECT 
                a.appointment_id, 
                a.appointment_date, 
                a.status, 
                ft.name AS fortune_teller_name
            FROM 
                tb_appointments AS a
            JOIN 
                tb_fortune_tellers AS ft
            ON 
                a.fortune_teller_id = ft.fortune_teller_id
            WHERE 
                a.user_id = ? 
                AND a.appointment_date >= ?
                AND a.status != 'cancel';
          `;

      db.all(appointmentQuery, [userID, currentDate], (err, appointments) => {
        db.close();

        if (err) {
          reject(err);
          return;
        }

        if (appointments.length === 0) {
          resolve("You don't have any upcoming appointments.");
          return;
        }

        const result = appointments
          .map((appointment) => {
            return `Queue ID: ${appointment.appointment_id}, Fortune Teller: ${appointment.fortune_teller_name}, Appointment Date: ${appointment.appointment_date}, Status: ${appointment.status}`;
          })
          .join("\n");

        resolve(
          `Please remember your Queue Id. Your upcoming appointments:\n${result}`
        );
      });
      // });
    } catch (err) {
      db.close();
      reject(err);
    }
  });
}

async function cancelAppointment(queueId, userID) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./fortune.db");

    try {
      // check appointment
      const checkQuery = `
          SELECT appointment_id, status FROM tb_appointments
          WHERE appointment_id = ? AND user_id = ?;
        `;

      db.get(checkQuery, [queueId, userID], (err, appointment) => {
        if (err) {
          db.close();
          reject(err);
          return;
        }

        // if no appointment
        if (!appointment) {
          db.close();
          resolve("Appointment not found.");
          return;
        }

        // if have apoointment , status = cancel
        const updateQuery = `
            UPDATE tb_appointments
            SET status = 'cancel'
            WHERE appointment_id = ?;
          `;

        db.run(updateQuery, [queueId], function (err) {
          db.close();
          if (err) {
            reject(err);
            return;
          }

          if (this.changes > 0) {
            resolve(`Appointment with Queue ID ${queueId} has been canceled.`);
          } else {
            resolve(`No changes were made to the appointment.`);
          }
        });
      });
    } catch (err) {
      db.close();
      reject(err);
    }
  });
}

// ------------------------------------------------

async function getUserByLineId(lineId) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./fortune.db");
    db.get("SELECT * FROM tb_users WHERE lineid = ?", [lineId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

async function checkUserExists(lineId) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./fortune.db");

    const query = `
              SELECT COUNT(*) AS count FROM tb_users
              WHERE lineid = ?;
          `;

    db.get(query, [lineId], (err, row) => {
      db.close();
      if (err) {
        reject(err);
        return;
      }
      resolve(row.count > 0); // คืนค่า true ถ้าผู้ใช้มีอยู่แล้ว
    });
  });
}

// ฟังก์ชั่นสำหรับสร้างผู้ใช้ใหม่
async function createUser(lineId, username) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./fortune.db");

    const query = `
            INSERT INTO tb_users (lineid, username, messages)
            VALUES (?, ?, ?);
        `;

    db.run(query, [lineId, username, JSON.stringify([])], function (err) {
      db.close();
      if (err) {
        reject(err);
        return;
      }
      resolve({ success: true, message: "User created successfully." });
    });
  });
}

// ฟังก์ชั่นสำหรับดึงข้อมูลข้อความของผู้ใช้
async function getUserMessages(lineId) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./fortune.db");

    const query = `
            SELECT messages FROM tb_users
            WHERE lineid = ?;
        `;

    db.get(query, [lineId], (err, row) => {
      db.close();
      if (err) {
        reject(err);
        return;
      }
      if (row) {
        resolve(JSON.parse(row.messages));
      } else {
        resolve({ success: false, message: "User not found." });
      }
    });
  });
}

// ฟังก์ชั่นสำหรับอัปเดตข้อความของผู้ใช้
async function updateUserMessage(lineId, newMessage) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = new sqlite3.Database("./fortune.db");

      const query = `
                UPDATE tb_users
                SET messages = ?
                WHERE lineid = ?;
            `;

      db.run(query, [JSON.stringify(newMessage), lineId], function (err) {
        db.close();
        if (err) {
          reject(err);
          return;
        }
        resolve({
          success: true,
          message: "User messages updated successfully.",
        });
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  drawTodayCard,
  updateTodayCardStatus,
  clearTodayCardStatusForAllUsers,
  showFortuneTellerSchedule,
  createAppointment,
  checkQueue,
  createUser,
  cancelAppointment,
  getUserMessages,
  updateUserMessage,
  checkUserExists,
  getUserByLineId,
};
