# Folane 웹사이트

Folane은 PDF에 밑줄과 메모를 남기고, 번역과 AI 질문을 활용할 수 있는 무료 PDF 리더입니다.

- [Folane 소개 및 다운로드](https://peanutjes.github.io/folane-website/)
- [공개 앱 릴리스](https://github.com/peanutJES/folane-releases/releases)

이 저장소는 GitHub Pages에서 호스팅하는 정적 사이트입니다. 글꼴은 `assets/fonts/OFL.txt`에 명시된 라이선스를 따릅니다.

## 첫 네 구역(Gravity 명세 재현)

- `gravity.js`: 화면 전체에 고정된 Three.js 장면. 구체 96개(휴대폰 54개)가 스크롤에 따라 떠 있음 → 바닥으로 떨어짐 → 하트로 모임 → 렌즈 속으로 날아감. 색은 코발트 → 볼트 라임 → 로즈 핑크로 바뀌어요. 물리·재질·조명 상수는 명세 그대로예요. three.js 0.160.0은 importmap으로 unpkg에서 불러와요.
- `motion.js`: 명세의 로더(장면이 준비될 때까지 92%에서 기다림), 머리말·히어로 등장, 45% 보이면 흐림이 걷히는 등장, 휠 스크롤 lerp 0.09, 머리말 슬라이더 단추로 여는 팔레트 서랍(Studio Controls).
- `gravity.css`: 명세의 Tailwind 값을 픽셀로 풀어 쓴 겉모습. 글꼴은 Google Fonts(Raleway·JetBrains Mono·Space Grotesk·Inter), 한글은 Pretendard로 이어져요.
- 명세와 다르게 둔 곳: 한국어 문구, 네 구역 아래에 이어지는 기존 소개(맥북·번역·AI·기능·체험·받기·질문), 그 구역을 볼 때 머리말 색과 유리 막대, 맥북 장면·안쪽 스크롤 칸·서랍에서는 원래 스크롤, 다 날아간 뒤 장면 쉬기, 움직임 줄이기에서는 로더 없이 한 장면만.
