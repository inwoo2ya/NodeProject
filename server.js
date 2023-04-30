const timeTable = () => {
  const todate = new Date();
  const today = `${todate.getFullYear()}-${
    "0" + (todate.getMonth() + 1)
  }-${todate.getDate()}`;
  return today;
};
require("dotenv").config();
setTimeout(timeTable, 1000);
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");

const hashedPassword = async password => {
  return bcrypt.hashSync(password, 10);
};
const bodyParser = require("body-parser");
// body-parser는 요청 데이터(body) 해석을 쉽게 도와줌
app.use(bodyParser.urlencoded({ extended: true }));
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const MongoClient = require("mongodb").MongoClient;
app.set("view engine", "ejs");
let db;
MongoClient.connect(process.env.DB_URL, (err, client) => {
  if (err) {
    console.log(err);
  } else {
    db = client.db("nodeapp"); //연결할 db이름 저장

    // db.collection('data1').insertOne({Name:'inwoo',age:24},(err,res)=>{
    //     console.log('저장완료');
    // });
    app.listen(process.env.PORT, () => {
      console.log("listening on 8080");
    }); // 서버띄울 포트번호, 띄운 후 실행할 코드
  }
});

// 위에는 서버를 띄우기 위한 기본 셋팅

app.get("/home", (req, res) => {
  res.send("집이 최고야!");
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});

//list 로 get요청으로 접속하면
// 실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML을 보여줌

app.get("/edit/:id", (req, res) => {
  db.collection("data1").findOne(
    { _id: parseInt(req.params.id) },
    (err, result) => {
      res.render("edit.ejs", { datas: result });
    }
  );
});

app.put("/edit", (req, res) => {
  db.collection("data1").updateOne(
    //어떤게시물을 수정할 건지
    { _id: parseInt(req.body.id) },
    // 수정 값
    {
      $set: {
        title: req.body.title,
        date: timeTable(),
        content: req.body.content,
        file: req.body.file,
      },
    },
    //콜백함수
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log("수정완료");
        res.redirect("/list");
      }
    }
  );
});

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const { ObjectID } = require("bson");

app.use(
  session({
    secret: "비밀코드",
    resave: true,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/login", (req, res) => {
  res.render("login.ejs");
});
app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/fail" }),
  (req, res) => {
    res.redirect("/");
  }
);

passport.use(
  // 인증 라이브러리
  new LocalStrategy(
    {
      usernameField: "id",
      passwordField: "pw",
      session: true,
      passReqToCallback: false,
    },
    (id, pw, done) => {
      //console.log(입력한아이디, 입력한비번);
      db.collection("user").findOne({ id: id }, (err, res) => {
        if (err) return done(err);
        //done(서버에러)
        if (!res) return done(null, false, { message: "존재하지않는 아이디 " });
        //done(서버에러, 성공시사용자DB데이터, 에러메세지)
        if (pw == res.pw) {
          return done(null, res);
          //done(서버에러,성공시 사용자 DB데이터)
        } else {
          return done(null, false, { message: "비번틀렸어요" });
        }
      });
    }
  )
);

//세션 만들기
passport.serializeUser((user, done) => {
  //유저 id 데이터를 바탕으로 세션데이터를 만들어주고 그 세션데이터의 아이디를 쿠키로 만들어 사용자 브라우저에 전송 (로그인 성공시 발동)
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // 로그인된 유저가 마이페이지 접속했을 때 실행되는 함수(myPage 접속시 발동)
  // 로그인한 유저의 세션아이디를 바탕으로 개인정보를 DB에서 찾는 역할
  db.collection("user").findOne({ id }, (err, res) => {
    done(null, res);
  });
});

app.get("/fail", (req, res) => {
  res.send("404 ERROR");
});

function loginCheck(req, res, next) {
  if (req.user) {
    next();
  } else {
    return res.redirect("/login");
  }
}
app.get("/mypage", loginCheck, (req, res) => {
  res.render("myPage.ejs", { user: req.user });
});
app.get("/write", loginCheck, (req, res) => {
  res.render("write.ejs", { user: req.user });
});

app.get("/list", loginCheck, (req, res) => {
  //DB에 저장된 data1라는 collection안의 모든 데이터를 꺼내주세요
  db.collection("data1")
    .find()
    .toArray((err, result) => {
      console.log(result);
      res.render("list.ejs", { datas: result, user: req.user });
    });
});

app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

app.post("/signup", (req, res) => {
  if (req.body.user_pw != req.body.confirm_pw) {
    res.send("<script> alert('비밀번호가 틀렸어요');</script>");
  } else {
    // db.collection("user").findOne({
    //   id: req.body.user_id,
    // }),
    //   (err, result) => {
    // if (result) {
    //   return res
    //     .status(400)
    //     .json({ msg: "이미 같은 아이디가 존재합니다." });
    // }
    db.collection("user").findOne({ id: req.body.user_id }, (res, err) => {
      if (!res) {
        db.collection("user").insertOne(
          {
            _id: ObjectID,
            id: req.body.user_id,
            pw: req.body.user_pw,
            // pw: hashedPassword(req.body.user_pw),
          },
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              res.redirect("/login");
            }
          }
        );
      }
    });
  }
});
app.post("/add", (req, res) => {
  res.render("write.ejs");
  db.collection("counter").findOne({ name: "게시물 갯수" }, (err, res) => {
    console.log(res.totalPost);
    let totalPostNum = res.totalPost;
    let createPost = {
      _id: totalPostNum + 1,
      title: req.body.title,
      date: timeTable(),
      content: req.body.content,
      file: req.body.file,
      writerId: req.user._id,
    };
    db.collection("data1").insertOne(createPost, (err, result) => {
      if (err) {
        console.error(err);
      } else {
        console.log("저장 완료");
        //counter 라는 컬렉션에 있는 totalPost 라는 항목도 1증가 시켜야함
        db.collection("counter").updateOne(
          { name: "게시물 갯수" },
          { $inc: { totalPost: 1 } }, // $inc:{ field명: 증가 값 } => 값 증가 , $set:{field명: 세팅 값} => 값 세팅
          (err, res) => {
            if (err) {
              return console.log(err);
            }
          }
        );
      }
    });
  });
});
app.delete("/delete", (req, res) => {
  console.log(req.body);
  req.body._id = parseInt(req.body._id);
  let deleteData = { _id: req.body._id, writerId: req.user._id };
  db.collection("data1").deleteOne(deleteData, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log("삭제완료");
      res.status(200).send({ message: "성공" });
    }
  });
});
app.get("/search", (req, res) => {
  let searchCondition = [
    {
      $search: {
        index: "titleSearch",
        text: {
          query: req.query.value,
          path: ["title", "content"],
        },
      },
    },
    { $sort: { _id: 1 } }, //정렬 1: 내림차순, -1: 오름차순
    // { $limit: 10} // 10개만 가져와라
    // { $project: { title: 1, _id: 0, score: { $meta: "searchScore" } } }, 검색결과 필터 주기
  ];
  db.collection("data1")
    .aggregate(searchCondition) // 검색 조건을 달 수 있는 find data 파이프라인 구축
    .toArray((err, result) => {
      console.log(result);
      res.render("search.ejs", { datas: result, result: req.query.value });
    });
});
