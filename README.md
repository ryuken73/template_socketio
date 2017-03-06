#timeMon 
> timeMon을 사용해서 Windows, Python(linux), AIX(binary) client의 시간 모니터링이 가능합니다.

##0. 용도
 - 시스템 관리자로서 서버 시간동기화가 어떤 이유에서 틀어져 문제가 생기는 경우를 많이 겪음.
 - 예를 들면, 영상인코딩 시간불일치, 예약메세지(메일) 전송 delay, Cluster error, Active Directory login 불가 등등
 - ntp를 통해 동기화설정을 했으나, 리부팅, time source 불량, service down 등으로 계속 문제발생 
 - 시간 동기화에 대한 중앙 모니터링 필요성은 있으나, 마땅한 tool이 없
 - 간단히 본 source를 node가 설치된 곳에 install하여, client들(Windows, AIX, Linux등)의 시간을 모니터링함

##1. 사용법
- git clone https://github.com/ryuken73/timeMon.git
- cd template_express_socket.io
- npm start 

##2. 실행예
### Windows Client ( Windows 7, 2012 이상 )
 - Chrome, IE등 Websocket이 지원되는 브라우져로 아래 URL 접속
```
http://timeMon server주소:3001/그룹이름
```
### Windows Client ( Windows 7, Windows Server 2012 미만 )
- timeMon.exe를 통해 설치 ( Electron binary )
- timeMon.exe 실행 
- timeMon server 주소 수정 / 그룹명 수정 / alias name 수정

### Linux Client ( Python Preinstalled )
- socket_client.cfg 수정 
  server 주소
  그룹명
  alias name
- python socket_client.py

### AIX (Unix) Client ( cx-freeze binary 사용. AIX 5.3, 6.1 Test )

