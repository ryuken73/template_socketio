#timeMon ( 시스템 시간 동기화 및 모니터링 )

##0. 용도
 - 시스템 관리자로서 서버의 시간동기화가 어떤 이유에서 틀어져 문제가 생기는 경우를 많이 겪음.
   예) 영상 인코딩 시간불일치, 예약메세지(메일) 전송 delay, Cluster error, Active Directory login 불가 등등
 - ntp를 통해 동기화설정을 했으나, 리부팅, time source 불량, time service down 등으로 계속 문제발생 
 - 시간 동기화에 대한 중앙 모니터링의 필요성이 있으나, 마땅한 tool이 없음
 - 간단히 본 source를 node가 설치된 곳에 install하여, client들(Windows, AIX, Linux등)의 시간을 모니터링함

##1. 사용법
- git clone https://github.com/ryuken73/timeMon.git
- cd template_express_socket.io
- npm start 
