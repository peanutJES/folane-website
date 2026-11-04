# Folane 웹사이트

Folane은 PDF에 밑줄과 메모를 남기고, 번역과 AI 질문을 활용할 수 있는 무료 PDF 리더입니다.

- [Folane 소개 및 다운로드](https://peanutjes.github.io/folane-website/)
- [공개 앱 릴리스](https://github.com/peanutJES/folane-releases/releases)

이 저장소는 GitHub Pages에서 호스팅하는 정적 사이트입니다. 글꼴은 `assets/fonts/OFL.txt`에 명시된 라이선스를 따릅니다.

## 움직임 파일

- `motion.css`, `motion.js`: 첫 방문 로더(세션마다 한 번), 히어로 글 등장, 휠 스크롤을 부드럽게 따라가는 장치. 맥북 히어로 안과 안쪽 스크롤 칸, 대화창, 터치 기기, 움직임 줄이기 설정에서는 원래 스크롤을 써요.
- `field.js`: AI 구역 다음에 오는 네 막짜리 장(`#field`). 형광펜 색 구체가 떠다니다가 내려앉고, F 리본 모양으로 모였다가 화면 너머로 날아가요. three.js 0.160.0은 이 장이 가까워질 때 jsDelivr에서 불러와요. 못 불러오면 배경과 글만 보여요. 움직임 줄이기에서는 F 모양 한 장면만 그려요.
