const fs = require('fs')

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");

const jwtConfig = JSON.parse(fs.readFileSync('./jwt.json'));
const jwtSecret = jwtConfig.key;

const { getToken } = require("./getUserToken");
const { getInfo } = require("./getUserToken");
const { createJWT } = require("./createJWT");

const app = express();
const port = process.env.port || 4000;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// cors 권한 추가 설정: 실제 앱 등록시 외부 제약 방지
app.use(cors({
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
}));

const data = fs.readFileSync('./db.json');
const conf = JSON.parse(data);
const jwt = require('jsonwebtoken');

const connection = mysql.createConnection({
  host: conf.host,
  // RDS 엔드포인트
  user: conf.user,
  //RDS 마스터 사용자 이름
  password: conf.password,
  // RDS 비밀번호
  port: conf.port,
  // RDS 포트
  database: conf.database,
  // 데이터베이스 이름
  waitForConnections: true,
  connectionLimit: 300,
  queueLimit: 0,
});

// JWT 검증 미들웨어
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).send({ message: "Token is missing or not a Bearer token." });
  }

  const token = authHeader.substring(7);
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Invalid token." });
    }

    if (!decoded || !decoded.userId || !Array.isArray(decoded.userId) || decoded.userId.length === 0) {
      return res.status(401).send({ message: "Invalid token structure." });
    }

    const u_id = decoded.userId[0].u_id;
    req.u_id = u_id; // req 객체에 u_id를 추가합니다.

    next(); // 다음 미들웨어로 이동
  });
}

//db 연결
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database: ", err);
    return;
  }
  console.log("Connected to the database!");
});

//데이터 조회

// 1.메인
app.get('/', (req, res) => {
  res.send('홈')
});



// 2. 음료 목록
app.get("/drink", (req, res) => {
  connection.query("SELECT * FROM hufs.drink", (error, results, fields) => {
    if (error) {
      console.error("Error retrieving users: ", error);
      res.status(500).send({ message: "Error retrieving users" });
      return;
    }

    console.log("success");
    res.send(results);
  });
});

//d_id로 음료 데이터 조회
app.get("/drink/:d_id", (req, res) => {
  const drinkId = req.params.d_id;

  connection.query("SELECT * FROM hufs.drink WHERE d_id = ?", [drinkId], (error, results, fields) => {
    if (error) {
      console.error("Error retrieving drink: ", error);
      res.status(500).send({ message: "Error retrieving drink" });
      return;
    }

    if (results.length > 0) {
      console.log("Drink found:", results[0]);
      res.send(results[0]);
    } else {
      res.status(404).send({ message: "Drink not found" });
    }
  });
});

// 커스텀 음료 추가
app.post("/customDrink", verifyJWT, (req, res) => {
  const source = req.u_id;

  const sugar = req.body.sugar;
  const s_cotent = sugar / 50;
  let grade = null;

  if (s_cotent < 0.25 && s_cotent >= 0) {
    grade = "A";
  } else if (s_cotent < 0.5 && s_cotent >= 25) {
    grade = "B";
  } else if (s_cotent < 0.75 && s_cotent >= 50) {
    grade = "C";
  } else if (s_cotent < 1 && s_cotent >= 75) {
    grade = "D";
  } else {
    grade = "F";
  }

  // 새로운 음료 정보 삽입
  const query = `
    INSERT INTO drink (d_name, manuf, size, kcal, sugar, protein, natrium, fat, caffeine, s_cotent, grade, source) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(query,
    [
      req.body.d_name,
      req.body.manuf,
      req.body.size,
      req.body.kcal,
      req.body.sugar,
      req.body.protein,
      req.body.natrium,
      req.body.fat,
      req.body.caffeine,
      s_cotent,
      grade,
      source
    ],
    (error, results) => {
      if (error) {
        console.error("Error inserting custom drink: ", error);
        res.status(500).send({ message: "Error inserting custom drink" });
        return;
      }
      res.status(201).send({ message: "Custom drink added successfully." });
    }
  );
});

// 커스텀 음료 삭제
app.delete("/customDrink/:d_id", verifyJWT, (req, res) => {
  const drinkId = req.params.d_id;
  const userId = req.u_id; // JWT 토큰 유효성 검사에서 추출한 u_id

  // 음료의 source 정보 조회
  connection.query("SELECT source FROM drink WHERE d_id = ?", [drinkId], (error, results) => {
    if (error) {
      console.error("Error retrieving drink source: ", error);
      res.status(500).send({ message: "Error retrieving drink source" });
      return;
    }

    if (results.length === 0) {
      res.status(404).send({ message: "Drink not found" });
      return;
    }

    const source = results[0].source;

    // source가 null이면 삭제 거부
    if (source === null) {
      res.status(403).send({ message: "Cannot delete a drink with null source" });
      return;
    }

    // source가 현재 사용자의 u_id와 일치하지 않으면 삭제 거부
    if (source !== userId) {
      res.status(403).send({ message: "You can only delete your own custom drinks" });
      return;
    }

    // 음료 삭제
    connection.query("DELETE FROM drink WHERE d_id = ?", [drinkId], (error, results) => {
      if (error) {
        console.error("Error deleting custom drink: ", error);
        res.status(500).send({ message: "Error deleting custom drink" });
        return;
      }
      res.status(200).send({ message: "Custom drink deleted successfully." });
    });
  });
});




// 3. 유저 정보
app.get("/user", verifyJWT, (req, res) => {
  connection.query("SELECT * FROM hufs.user", (error, results, fields) => {
    if (error) {
      console.error("Error retrieving users: ", error);
      res.status(500).send({ message: "Error retrieving users" });
      return;
    }
    console.log("success");
    res.send(results);
  });
});

// 유저 정보 업데이트
app.put("/user", verifyJWT, (req, res) => {
  const { height, weight, age, sex, activity_level, u_sugar_gram } = req.body;
  const u_id = req.u_id; // verifyJWT 미들웨어에서 추가된 u_id 사용

  const query = `
    UPDATE hufs.user
    SET height = ?, weight = ?, age = ?, sex = ?, activity_level = ?, u_sugar_gram = ?
    WHERE u_id = ?
  `;

  connection.query(query, [height, weight, age, sex, activity_level, u_sugar_gram, u_id],
    (error, results) => {
      if (error) {
        return res.status(500).send({ message: "Error updating user data" });
      }
      res.status(200).send({ message: "User data updated successfully." });
    });
});



//kakao 로그인

// 인가코드 => jwt 생성
app.post("/auth", async (req, res, next) => {
  console.log('Code sent from client to server:', req.body);
  try {
    const { code } = req.body; //인가코드
    const access_token = await getToken(code); //액세스토큰 발급 함수 호출
    console.log('Access Token:', access_token);

    const userArray = await getInfo(access_token); //사용자 정보 요청 함수 호출
    console.log('User Info:', userArray);

    const userJWT = await createJWT(userArray); //jwt 생성 함수 호출
    console.log('JWT:', userJWT);

    return res.status(200).json(userJWT) //jwt 리턴(=>KakaoWebView.js sendCodeToServer res값)
  } catch (e) {
    console.error(e);

    const errorData = {
      message: "Internal server error",
    };
    return res.status(500).json(errorData);
  }
});

// 유저 등록 유무 확인
app.get("/auth/info", (req, res) => {
  const userId = req.query.user_id;
  const sql = `SELECT u_id FROM hufs.user WHERE u_id=${userId}`
  connection.query(sql, (err, result) => {
    if (!err) {
      console.log('User ID search complete');
      res.status(201).send({ result });
    } else {
      console.log('err');
      res.send(err);
    }
  })
})

// 신규 유저 등록
app.post("/auth/info", (req, res) => {
  const userId = req.body.user_id;
  const userName = req.body.user_name;
  const sql = `
    INSERT INTO hufs.user (u_id, u_name) 
    VALUES (?, ?)
  `;

  connection.query(sql, [userId, userName], (err, result) => {
    if (!err) {
      console.log('successfully insert user info');
      res.status(201).send({ result });
    } else {
      console.log('err');
      res.status(500).send({ message: "Error inserting user info" });
    }
  })
})




// 4. 즐겨찾기 추가
app.post("/favorite", verifyJWT, (req, res) => {
  const drink = req.body.drink;
  const user = req.u_id; // JWT에서 추출한 u_id 사용

  const query = `
    INSERT INTO hufs.favorite (user, drink) 
    VALUES (?, ?)
  `;

  connection.query(query, [user, drink],
    (error, results, fields) => {
      if (error) {
        console.error("Error inserting favorite data: ", error);
        res.status(500).send({ message: "Error inserting favorite data" });
        return;
      }
      console.log("Favorite data inserted successfully.");
      res.status(201).send({ message: "Favorite data inserted successfully." });
    });
});

//즐겨찾기 불러오기
app.get("/favorite", verifyJWT, (req, res) => {
  const u_id = req.u_id; // verifyJWT 미들웨어에서 추가된 u_id 사용

  const query = `
    SELECT drink FROM favorite WHERE user = ?
  `;

  connection.query(query, [u_id],
    (error, results, fields) => {
      if (error) {
        console.error("Error retrieving favorite data: ", error);
        res.status(500).send({ message: "Error retrieving favorite data" });
        return;
      }
      //console.log("Favorite data retrieved successfully.");
      res.status(200).send(results);
    });
});

//즐겨찾기 제거
app.delete("/favorite", verifyJWT, (req, res) => {
  const drink = req.body.drink;
  const user = req.u_id; // JWT에서 추출한 u_id 사용

  const query = `
    DELETE FROM hufs.favorite 
    WHERE user = ? AND drink = ?
  `;

  connection.query(query, [user, drink],
    (error, results, fields) => {
      if (error) {
        console.error("Error deleting favorite data: ", error);
        res.status(500).send({ message: "Error deleting favorite data" });
        return;
      }
      if (results.affectedRows === 0) {
        res.status(404).send({ message: "Favorite data not found." });
        return;
      }
      console.log("Favorite data deleted successfully.");
      res.status(200).send({ message: "Favorite data deleted successfully." });
    });
});




// 5. 음료 섭취 추가
app.post("/intake", verifyJWT, (req, res) => {
  const user = req.u_id; // JWT에서 추출한 u_id 사용
  const { date, drink, time } = req.body;

  const query = `
    INSERT INTO intake (user, date, drink, time) 
    VALUES (?, ?, ?, ?)
  `;

  connection.query(query, [user, date, drink, time],
    (error, results) => {
      if (error) {
        console.error("Error inserting intake data: ", error);
        res.status(500).send({ message: "Error inserting intake data" });
        return;
      }
      console.log("Intake data inserted successfully.");
      res.status(201).send({ message: "Intake data inserted successfully." });
    });
});

// 음료 섭취 조회
app.get("/intake", verifyJWT, (req, res) => {
  const user = req.u_id; // JWT에서 추출한 u_id 사용

  const query = `
    SELECT * FROM intake WHERE user = ?
  `;

  connection.query(query, [user],
    (error, results) => {
      if (error) {
        console.error("Error retrieving intake data: ", error);
        res.status(500).send({ message: "Error retrieving intake data" });
        return;
      }
      res.status(200).send(results);
    });
});

//일일 섭취 기록 조회
app.get("/intake/today", verifyJWT, (req, res) => {
  const u_id = req.u_id; // JWT 미들웨어에서 추출된 사용자 ID

  const today = new Date().toISOString().slice(0, 10);

  const query = `
    SELECT i.*, d.* FROM intake i
    JOIN drink d ON i.drink = d.d_id
    WHERE i.user = ? AND DATE(i.date) = ?
  `;

  connection.query(query, [u_id, today],
    (error, results) => {
      if (error) {
        console.error("Error retrieving today's intake data: ", error);
        res.status(500).send({ message: "Error retrieving today's intake data" });
        return;
      }
      res.status(200).send(results);
    });
});

//주간 섭취 기록 조회
app.get("/intake/weekSugar", verifyJWT, (req, res) => {
  const u_id = req.u_id; // JWT 미들웨어에서 추출된 사용자 ID

  // 데이터베이스 쿼리
  const query = `
    SELECT
      days.day,
      COALESCE(SUM(d.sugar), 0) as total_sugar
    FROM (
      SELECT 'Sun' as day
      UNION ALL SELECT 'Mon'
      UNION ALL SELECT 'Tue'
      UNION ALL SELECT 'Wed'
      UNION ALL SELECT 'Thu'
      UNION ALL SELECT 'Fri'
      UNION ALL SELECT 'Sat'
    ) days
    LEFT JOIN intake i ON DATE_FORMAT(i.date, '%a') = days.day AND i.user = ? AND i.date >= DATE_SUB(CURRENT_DATE, INTERVAL 1 WEEK)
    LEFT JOIN drink d ON i.drink = d.d_id
    GROUP BY days.day
    ORDER BY FIELD(days.day, 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat');
  `;

  connection.query(query, [u_id],
    (error, results) => {
      if (error) {
        console.error("Error retrieving week's sugar intake data: ", error);
        res.status(500).send({ message: "Error retrieving week's sugar intake data" });
        return;
      }
      res.status(200).send(results);
    });
});

// 음료 섭취 데이터 삭제
app.delete("/intake", verifyJWT, (req, res) => {
  const { date, drink, time } = req.body;
  const userId = req.u_id;

  const query = `
    DELETE FROM intake 
    WHERE user = ? AND date = ? AND drink = ? AND time = ?
  `;

  connection.query(query, [userId, date, drink, time],
    (error, results) => {
      if (error) {
        console.error("Error deleting intake data: ", error);
        res.status(500).send({ message: "Error deleting intake data" });
        return;
      }
      if (results.affectedRows === 0) {
        res.status(404).send({ message: "Intake data not found or already deleted." });
        return;
      }
      console.log("Intake data deleted successfully.");
      res.status(200).send({ message: "Intake data deleted successfully." });
    });
});




//서버 구동
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = {
  connection,
  app
}