const fs = require('fs')

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");

const jwtConfig = JSON.parse(fs.readFileSync('./jwt.json'));
const jwtSecret = jwtConfig.key;

const {getToken} = require("./getUserToken");
const {getInfo} = require("./getUserToken");
const {createJWT} = require("./createJWT");

const app = express();
const port = process.env.port || 4000;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
}));
// cors 권한 추가 설정: 실제 앱 등록시 외부 제약 방지
 
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

    // JWT 페이로드에서 u_id를 추출합니다.
    // 페이로드의 구조에 따라 경로가 달라질 수 있습니다.
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
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;

  connection.query("SELECT COUNT(*) as total FROM hufs.drink", (error, countResults) => {
    if (error) {
      console.error("Error counting drinks: ", error);
      res.status(500).send({ message: "Error counting drinks" });
      return;
    }

    const total = countResults[0].total;

    const query = `
      SELECT * FROM hufs.drink LIMIT ?, ?
    `;

    connection.query(query, [offset, pageSize], (error, results, fields) => {
      if (error) {
        console.error("Error retrieving drinks: ", error);
        res.status(500).send({ message: "Error retrieving drinks" });
        return;
      }
      res.send({ data: results, total: total });
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
  try{
      const { code } = req.body; //인가코드
      const access_token = await getToken(code); //액세스토큰 발급 함수 호출
      console.log('Access Token:', access_token);

      const userArray = await getInfo(access_token); //사용자 정보 요청 함수 호출
      console.log('User Info:', userArray);

      const userJWT = await createJWT(userArray); //jwt 생성 함수 호출
      console.log('JWT:', userJWT);

      return res.status(200).json(userJWT) //jwt 리턴(=>KakaoWebView.js sendCodeToServer res값)
  } catch(e) {
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
    if(!err){
      console.log('User ID search complete');
      res.status(201).send({ result });
    } else{
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

  connection.query(sql, [userId, userName], (err, result)=>{
    if(!err){
      console.log('successfully insert user info');
      res.status(201).send({ result });
    } else{
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


//서버 구동
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = {
  connection,
  app
}