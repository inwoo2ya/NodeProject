let router = require("express").Router();
const multer = require("multer");
var path = require("path");
const MongoClient = require("mongodb").MongoClient;
let db;
MongoClient.connect(process.env.DB_URL, (err, client) => {
  if (err) {
    console.log(err);
  } else {
    db = client.db("nodeapp"); //연결할 db이름 저장
  }
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/file/profile/");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().valueOf() + path.extname(file.originalname));
    //확장자
  },
  fileFilter: (req, file, callback) => {
    let ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
      return callback(new Error("PNG, JPG만 업로드"));
    }
    callback(null, true);
  },
  limits: {
    fileSize: 1024 * 1024,
  },
});
let upload = multer({
  storage: storage,
});

router.use(loginCheck);
function loginCheck(req, res, next) {
  if (req.user) {
    next();
  } else {
    return res.redirect("/login");
  }
}
router.get("/mypage", (req, res) => {
  res.render("myPage.ejs", { user: req.user, profileImage: req });
});
router.get("/write", (req, res) => {
  res.render("write.ejs", { user: req.user });
});
router.get("/list", (req, res) => {
  //DB에 저장된 data1라는 collection안의 모든 데이터를 꺼내주세요
  db.collection("data1")
    .find()
    .toArray((err, result) => {
      console.log(result);
      res.render("list.ejs", {
        datas: result,

        user: req.user,
      });
    });
});

router.get("/list/:fileName", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "/public/file/post/" + req.params.fileName)
  );
});
router.post("/upload", upload.single("profile"), (req, res) => {
  res.redirect("/mypage");
});

router.get("/image/:imageName", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "/public/file/profile/" + req.params.imageName)
  );
});

module.exports = router;
