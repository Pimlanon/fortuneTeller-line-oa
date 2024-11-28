CREATE TABLE tb_users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    lineid TEXT NOT NULL,
    username TEXT NOT NULL,
    messages JSON,
    today_card_status TEXT,
    today_card_desc TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tb_fortune_tellers (
    fortune_teller_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tb_work_days (
    work_day_id INTEGER PRIMARY KEY AUTOINCREMENT,
    fortune_teller_id INTEGER,
    day_of_week VARCHAR(20),
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fortune_teller_id) REFERENCES tb_fortune_tellers(fortune_teller_id)
);

CREATE TABLE tb_appointments (
    appointment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    fortune_teller_id INTEGER,
    appointment_date DATETIME NOT NULL,
    appointment_time TEXT NOT NULL,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tb_users(user_id),
    FOREIGN KEY (fortune_teller_id) REFERENCES tb_fortune_tellers(fortune_teller_id)
);

CREATE TABLE tb_tarot_cards (
    tarot_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)

