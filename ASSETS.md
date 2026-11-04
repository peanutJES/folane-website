# 영상·이미지·글꼴 기록

- `assets/icon.png`: Folane 앱 아이콘.
- `assets/mac/f001.webp`–`f084.webp`: 클로드가 제작한 무채색 Blender 맥북 모델을 바탕으로 Codex가 재질·조명·법선·키보드·트랙패드·전면 홈을 수정해 다시 렌더했습니다. Claude Opus의 읽기 전용 검토를 반영했고, 원래 카메라 구도와 84프레임의 여는 동작은 유지했습니다.
- `assets/mac/open.webp`, `screen.webp`, `poster.jpg`: 같은 렌더와 macOS Folane 1.21.17 실제 창을 사용한 이미지.
- `assets/video/*.mp4`: Windows Folane 1.21.16을 격리된 시연 환경에서 실제 조작한 녹화. 소개 영상은 32.13초이며 한국어 설명 자막 `hero.vtt`를 포함합니다.
- 기능 영상: 위키백과 찾기, AI 설명, 하이라이트·밑줄·취소선, 메모, 펜과 직선, 새 노트.
- AI 답변은 녹화용 시험 서버가 반환한 예시입니다. 실제 클라우드 AI 성능·응답의 증거가 아닙니다. 영상 근처와 확대 창, 스크린샷 설명에 이 사실을 유지했습니다.
- `assets/shots/`, `assets/screens/`: Folane macOS·Windows·Android 실제 화면. 기기별 화면·지원 기능에는 차이가 있습니다.

원본 녹화와 이전 시안은 배포 폴더에 포함하지 않았습니다. 현재 맥북 렌더 소스와 재생성 방법은 `tools/`에 포함했습니다. [Droppy](https://getdroppy.app/)와 [Apple MacBook Pro](https://www.apple.com/kr/macbook-pro/liquid-retina-xdr-display/)는 조작 방식과 기기 표현을 참고했습니다. 두 사이트의 이미지·영상·로고는 사용하지 않았습니다.

## 글꼴

- `assets/fonts/`: [Pretendard Variable 1.3.9 공식 소스](https://github.com/orioncactus/pretendard/tree/v1.3.9/packages/pretendard/dist/web/variable). 한글을 포함한 원본 WOFF2 분할 파일 92개와 상대경로로 정리한 스타일시트를 포함했습니다.
- SIL Open Font License 1.1 적용. 저작권 고지와 라이선스 원문은 `assets/fonts/OFL.txt`에 보존했습니다. 웹사이트 자체의 재배포 조건과 별개입니다.
# 번역 배치 비교 · 2026-11-04

HTML 문서 두 장과 SVG 도형으로 만든 설명용 그래픽입니다. 영문·한국어·일본어·독일어 문구는 이 웹사이트의 예시용 문장으로, Folane의 실제 번역 결과나 외부 문서 인용이 아닙니다. 페이지에 설명용 예시 표시가 있습니다. AI 소개는 기존 `assets/shots/reading.jpg`·`ask.jpg`와 `assets/video/ai.mp4`를 재사용하며 실제 앱 조작 화면, 예시 AI 답변이라는 기존 범위를 유지합니다. 맥북 84프레임·소스·서체는 변경하지 않았습니다.


- `assets/shots/demo-page.png`: Folane 앱에 포함된 검수용 sample.pdf 첫 쪽의 미리보기. 웹 체험의 쪽 레일에서 사용.

- `assets/mac/glass-fold.svg`: Folane 웹 첫 화면용 유리 곡면 조명. 로컬 SVG로 그린 장식이며 맥북 렌더 프레임과 별개입니다.

## 외부 라이브러리

- three.js 0.160.0 (MIT): `field.js`가 `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js`에서 필요할 때만 불러와요. 저장소에는 넣지 않았어요.
- `field.js` 안의 F 리본 자리 좌표는 Folane 아이콘(`assets/icon.png`)의 밝은 리본 부분을 마스크로 떼어 고르게 뽑은 값이에요.
