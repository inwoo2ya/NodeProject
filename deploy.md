초기 설정

1. app.yaml 파일 생성

- server.js랑 동일한 위치에 app.yaml 생성하여
  runtime:node.js
  env: flex
  ...
  https://github.com/googleapis/nodejs-datastore-session 참고

2. 서버포트 8080 설정(구글 클라우드에서 기본적으로 사용하는 포트 귀찮게 따로 설정 필요하지 말자)

3. DB에서 Network Access를 모든아이피(0.0.0.0) 허용으로 변경

4. 구글클라우드나 어떤클라우드든 새프로젝트 만들기 눌러서 app engine 설정하여 애플리케이션 만듭시다.

5. Region은 서울(asia-northeast3)로 설정 만약,서울 위치가 없다면 서울과 가까운 위치(일본)

- 최대한 가까워야 응답시간이 줄어듬

본격적인 배포

1. vscode 에디터로 오픈한 뒤 터미널(cmd)에 명령어 작성

- gcloud init

1-2-1. 구글로그인
(만약 되어있다면 1-3-1 부터)
1-3-1. 새롭게 초기 설정을 할 건지 안할 건지 물어봄 이미 설정 되어있다면 1번누르는게 나음

1-3-2. 설정된 구글로그인, 새로운 구글로그인 중에서 고르라고함 1번 누르면 됨 (기존 로그인)

2. 프로젝트 선택 여기서 원하는 프로젝트 숫자 입력

3. 터미널에 다시 gcloud app deploy 입력

4. source: 파일 위치 맞는 지 확인 target project 맞는 지 확인

5. 5~10분 기다리면 배포 완료
