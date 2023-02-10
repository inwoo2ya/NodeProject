const timeTable = () =>{
    const todate = new Date();
    const today = `${todate.getFullYear()}-${('0'+todate.getMonth()+1).slice(-2)}-${todate.getDate()}`
    return today
    
}
setTimeout(timeTable, 1000);
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
// body-parser는 요청 데이터(body) 해석을 쉽게 도와줌
app.use(bodyParser.urlencoded({extended: true}));
const MongoClient = require('mongodb').MongoClient;
app.set('view engine','ejs');
let db;
MongoClient.connect('mongodb+srv://admin:n37w0rk@project0.ebrquly.mongodb.net/?retryWrites=true&w=majority',(err,client)=>{
    if(err) {
        console.log(err)
    }else{
        db = client.db('nodeapp'); //연결할 db이름 저장
        
        
        // db.collection('data1').insertOne({Name:'inwoo',age:24},(err,res)=>{
        //     console.log('저장완료');
        // });
        app.listen(8080,()=>{
            console.log('listening on 8080')
    });// 서버띄울 포트번호, 띄운 후 실행할 코드
    }
});


// 위에는 서버를 띄우기 위한 기본 셋팅

app.get('/home',(req,res)=>{
    res.send('집이 최고야!')
});

app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/index.html')
});

app.get('/write',(req,res)=>{
    res.sendFile(__dirname + '/write.html')
});

app.post('/add',(req,res)=>{
        res.send('전송 완료')
        db.collection('counter').findOne({name:'게시물 갯수'},(err,res)=>{
            console.log(res.totalPost)
            let totalPostNum = res.totalPost;
            db.collection('data1').insertOne({_id:totalPostNum + 1,name:req.body.name, date:timeTable(), content:req.body.content},(err,result)=>{
                if(err){
                    console.error(err);
                }else{
                    
                    console.log('저장 완료');
                    //counter 라는 컬렉션에 있는 totalPost 라는 항복도 1증가 시켜야함
                    db.collection('counter').updateOne({name:'게시물 갯수'},{ $inc :{totalPost:1}},(err,res)=>{
                        if(err){
                            return console.log(err);
                        }
                    });
                }
            });

        });
        
        
});
//list 로 get요청으로 접속하면
// 실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML을 보여줌
app.get('/list',(req,res)=>{
    //DB에 저장된 data1라는 collection안의 모든 데이터를 꺼내주세요
    db.collection('data1').find().toArray((err,result)=>{
        console.log(result);
        res.render('list.ejs',{ datas: result});
})
    });
    
