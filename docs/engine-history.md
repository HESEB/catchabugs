# CATCHA BUGS Engine History

> 목적: 엔진 1부터 현재 Engine 8.0까지의 흐름을 한 문서에 정리하여, 이후 업데이트가 과거 파일 기준으로 원상복구되는 문제를 막는다.

## 현재 기준

- 현재 기준 엔진: **Engine 8.0 Runtime Cleanup**
- 기준 커밋: `7471c811d1c5e6d9b95ac304133c2998958d0ed8`
- 현재 런타임 기준 파일: `/engine-manifest.json`
- 현재 로드 기준: `index.html`의 script 목록

앞으로 작업자는 반드시 다음 순서로 확인한다.

1. `engine-manifest.json`
2. `index.html`
3. 수정 대상 파일
4. 관련 문서

과거 `engine-*`, `*-fix`, `*-guard`, `*-cleanup` 파일을 임의로 다시 로드하지 않는다.

---

## Engine 1.0 - 초기 탐험/채집 엔진

### 핵심 목적
- 2D 필드에서 캐릭터가 이동한다.
- 곤충이 주변에 생성된다.
- 곤충을 발견하고 채집한다.
- 도감에 기록한다.

### 중심 파일
- `src/main-radar.js`
- `src/data/bugs.js`
- `src/insect-ai.js`
- `src/quest.js`
- `src/achievement.js`
- `src/save-system.js`

### 특징
- 게임의 실제 핵심은 `main-radar.js`에 있다.
- 플레이어, 맵, 곤충, 레이더, 채집, 도감, 저장이 한 파일 중심으로 연결되어 있다.
- 이 파일이 사실상 Core Game Engine이다.

### 유지 원칙
`main-radar.js`는 아직도 핵심 파일이다. 맵/레이더/채집을 보정 파일로 덮어쓰지 않는다.

---

## Engine 2.0 - 저장/퀘스트/업적 확장

### 핵심 목적
- 채집 결과 저장
- 퀘스트 진행
- 업적 보상
- 자동저장

### 중심 파일
- `src/save-system.js`
- `src/quest.js`
- `src/achievement.js`
- `src/main-radar.js`

### 특징
- 채집 성공 시 `recordQuestCatch`, `recordAchievementCatch` 호출
- 저장 데이터는 `catchabugs.core.v2`에 저장
- 도감 기록도 이 저장 구조에 포함

### 문제점
- 저장 데이터가 여러 추가 파일에서 개별적으로 확장되면서 초기화/복구 범위가 불명확해졌다.

### 유지 원칙
저장 구조 변경 시 `save-system.js`와 `save-reset-guard.js`를 함께 확인한다.

---

## Engine 3.0 - 메뉴/모달 확장

### 핵심 목적
- 도감, 퀘스트, 업적, 저장, 일기, BUG HOLE 접근
- 모바일 하단 메뉴 구조 확장

### 중심 파일
- `src/main-radar.js`
- `src/menu-remaster.js`
- `src/bug-hole-system.js`
- `src/backpack-system.js`

### 특징
- 초기에는 `main-radar.js` 안의 hidden button 방식이 중심이었다.
- 이후 `menu-remaster.js`가 하단 메뉴 렌더링을 담당했다.
- 배낭 메뉴가 추가되어 하단 메뉴는 5개가 되었다.

### 문제점
- `modal-nav-guard.js`, `ui-cleanup.js`, `menu-remaster.js`, `bug-hole-system.js`가 모두 모달/버튼/뒤로를 만지면서 충돌했다.

### 현재 결정
- 하단 메뉴 5개 유지.
- `menu-remaster.js`가 메뉴 주 담당.
- `modal-nav-guard.js`, `ui-cleanup.js`는 현재 로드하지 않는다.

---

## Engine 4.0 - BUG HOLE / 귀환 / 설치물 확장

### 핵심 목적
- BUG HOLE 메뉴
- 귀환지 발견
- 귀환석
- 설치/해체/진행 시스템

### 중심 파일
- `src/bug-hole-system.js`
- `src/bug-hole-markers.js`
- `src/return-discovery.js`
- `src/return-stones.js`
- `src/active-items.js`
- `src/active-items-bridge.js`

### 특징
- BUG HOLE은 별도 시스템으로 확장되었다.
- 설치물 효과가 곤충 생성/보너스와 연결되었다.

### 문제점
- 한때 BUG HOLE이 전역 클릭을 과도하게 가로채면서 설정/뒤로/메뉴 흐름을 오염시켰다.

### 현재 결정
- `bug-hole-system.js`는 BUG HOLE 내부만 담당한다.
- 전역 메뉴/뒤로/닫기 이벤트를 소유하면 안 된다.

---

## Engine 5.0 - 안정화 패치 누적기

### 핵심 목적
- 메뉴/모달/나침반/디버그/개발자모드 보정
- 과거 오류를 빠르게 막기 위한 patch layer 추가

### 대표 파일
- `src/engine-5-2-2-stable.js`
- `src/engine-5-3-6-compass-mode.js`
- `src/engine-5-3-8-dev-mode-fix.js`
- `src/engine-5-3-9-debug-toggle.js`
- `src/engine-5-4-0-stability.js`
- `src/engine-5-5-0-menu-navigation.js`
- `src/dev-mode-system.js`
- `src/radar-compass-system.js`

### 주요 커밋 / 문맥
- Engine 5.6 계열에서 개발자모드, 레이더/나침반, 메뉴 네비게이션을 분리하려 했다.
- `engine-5-4-0-stability.js`는 bootstrap처럼 다른 시스템을 다시 로드했다.

### 문제점
- patch 파일이 여러 개 쌓이면서 같은 기능을 여러 파일이 고쳤다.
- 나중에는 어떤 파일이 최종 소유자인지 불분명해졌다.

### 현재 결정
- `engine-5-4-0-stability.js`는 더 이상 로드하지 않는다.
- `radar-compass-system.js`는 직접 로드한다.
- `engine-5-*` 계열은 archive 후보로 본다.

---

## Engine 6.0 - 런타임 정리 시도

### 핵심 목적
- 오래된 patch direct load 제거
- 하단 메뉴 초기 깜빡임 제거
- 메뉴 역할 정리
- BUG HOLE 캡처 오염 제거

### 주요 커밋
- `28899421e157f6527e9f6bd9ea734dfe27ae68be`  
  `index.html`에서 오래된 patch direct load 제거
- `4e6b9c74fee7f723d5765523f7243288e264cc65`  
  Engine 6.0 architecture cleanup 문서 추가
- `5f36164fc821f612ee39207ca75570243dada594`  
  legacy 6 bottom menu flash 방지
- `f05414c306adb661f6f79fc5718e6f3fb3cca5a5`  
  `menu-remaster.js`를 render-only에 가깝게 정리

### 특징
- 중복 patch를 줄이려는 방향은 맞았다.
- 다만 `engine-5-4-0-stability.js`를 bootstrap으로 남긴 상태라, 여전히 과거 로더가 살아 있었다.

### 현재 결정
- Engine 6.0의 의도는 유지한다.
- 그러나 bootstrap 방식은 폐기한다.

---

## Engine 6.1 - GPS 도입

### 핵심 목적
- 모바일 GPS ON/OFF
- 설정 메뉴에서 GPS 제어
- 위치 권한 요청
- GPS 상태 HUD

### 주요 커밋
- `392e212eb2847e20378c5bdceb38ebbdee2f5500`  
  `src/gps-system.js` 추가
- `5fd665e12fe397e445834f1d20f2a266a6577424`  
  설정 메뉴에 GPS 토글 추가
- `af3ceb8990904ba3b99be24eb96072d77913de28`  
  `index.html`에 GPS 시스템 로드
- `fbad2e4e9f31486169ba305bc3e8e71c9bed3617`  
  GPS 이동감/HUD 개선

### 문제점
- GPS 좌표를 나침반 방향으로 돌리기 시작하면서 방향 오류가 생겼다.
- `setPlayer`가 로그/저장을 자주 호출해 버벅임이 늘었다.

### 현재 결정
- GPS 이동은 북쪽 고정 좌표계만 사용한다.
- 나침반 각도로 GPS 이동 방향을 돌리지 않는다.

---

## Engine 6.2 - 탐험모드 통합 / 도감 보강

### 핵심 목적
- GPS + 나침반을 탐험모드로 묶기
- 도감 등급 불빛 표시
- 전설 도감 수동 기록 버튼 제거 보강

### 주요 커밋
- `ee09331f0e5d61f6e6846134711bd0b364b6ccb7`  
  GPS 이동 벡터에 compass heading 반영
- `1590f40e04b5a2dafce7d8ba5efb8b45c6118868`  
  나침반 버튼을 탐험모드 ON/OFF로 변경
- `2de1b8f093ee0de3d3beb8f6fcb74122d82344d5`  
  `dex-grade-ledger.js` 추가
- `0c535c5916a07ebc41ffccab55e03d2a0e932d69`  
  `dex-grade-ledger.js` 로드

### 문제점
- GPS와 나침반을 너무 강하게 묶었다.
- 나침반 흔들림이 맵/이동감에 영향을 줬다.
- 도감도 별도 보정 파일로 추가되어 다시 patch pile 구조가 생겼다.

### 현재 결정
- `dex-grade-ledger.js`는 로드하지 않는다.
- 도감 등급 불빛은 나중에 단일 도감 owner에 통합한다.
- 나침반은 방향 참고용으로 분리한다.

---

## Engine 7.0 - 그래픽/이동감 보강

### 핵심 목적
- GPS 순간이동 완화
- 맵/곤충/채집 화면 그래픽 보강
- 포켓몬 GO 느낌의 연출 개선

### 주요 커밋
- `853427fd9d75037a4d7e2649b3cfe3f7dea41e0f`  
  GPS 추적 이동 완화
- `a3b39bd769f58abd986d1b7b0e7cf38a2f83bea6`  
  `visual-polish-7.js` 추가
- `5e993ba9e6a21a2d34c3fc178d1d65e86e7e1faf`  
  visual polish 로드

### 문제점
- 그래픽 보강 파일이 `#map`, `#enc`, `.bug`, `.player` 스타일을 넓게 덮었다.
- main-radar 렌더링과 보정 스타일이 서로 영향을 줬다.
- 기능은 좋아 보였지만 버벅임과 예측 불가한 표시가 늘었다.

### 현재 결정
- `visual-polish-7.js`는 로드하지 않는다.
- 그래픽 개선은 CSS 또는 단일 visual owner로 다시 통합한다.

---

## Engine 7.1 - GPS / 지도 안정화 시도

### 핵심 목적
- GPS 이동 방향 안정화
- 나침반과 맵 회전 분리
- 지역 변경 흔들림 완화

### 주요 커밋
- `756d33b4ee9cf6bdd110aceb3b241edbee5aaf3d`  
  GPS 북쪽 고정 이동
- `6e989494ef46f9e8a80b9d611e7c40246d0b1ec0`  
  compass와 map rotation 분리
- `8b9697596b00ef27e33d54bf3bb0ba56e227ce30`  
  `stable-map-region.js` 추가
- `8347e7a83babd3a6dc87f679799c752b2a4c0a84`  
  stable map region 로드

### 문제점
- 안정화 의도였지만 `stable-map-region.js`가 다시 `#map`을 강제로 덮었다.
- main-radar의 region/currentRegion과 stable-map-region의 region이 동시에 존재했다.
- 결국 지역/맵 담당이 또 중복되었다.

### 현재 결정
- `stable-map-region.js`는 로드하지 않는다.
- 지역 구조는 장기적으로 `main-radar.js` 또는 `map-engine.js`에 직접 통합한다.

---

## Engine 8.0 - Runtime Cleanup 기준 버전

### 핵심 목적
- 보정 파일 누적 중단
- 중복 실행 파일 제거
- 현재 기준 manifest 생성
- 앞으로 과거 파일 기준 원상복구 방지

### 주요 커밋
- `7471c811d1c5e6d9b95ac304133c2998958d0ed8`  
  `index.html` 중복 런타임 로드 제거
- `652fa34044a3fe77940d15bedbd5549a1c5770ca`  
  runtime cleanup report 문서 추가
- `a39cdde46788b2260634fbb810af0baf4b5b30a8`  
  `engine-manifest.json` 생성

### 현재 로드 파일

```text
src/main-radar.js
src/badge-title.js
src/time-weather.js
src/economy.js
src/profile-system.js
src/npc-lab.js
src/legendary-event.js
src/return-discovery.js
src/return-stones.js
src/menu-remaster.js
src/economy-menu.js
src/bug-hole-system.js
src/bug-hole-markers.js
src/active-items.js
src/active-items-bridge.js
src/backpack-system.js
src/save-reset-guard.js
src/random-npc.js
src/npc-api-bridge.js
src/gps-system.js
src/radar-compass-system.js
```

### 현재 비활성 파일

```text
src/region-remaster.js
src/visual-polish-7.js
src/stable-map-region.js
src/dex-reward.js
src/legendary-dex-fix.js
src/dex-category-guard.js
src/dex-grade-ledger.js
src/modal-nav-guard.js
src/ui-cleanup.js
src/engine-5-4-0-stability.js
```

---

## 앞으로의 작업 원칙

### 1. manifest 먼저 확인
모든 작업은 `engine-manifest.json`을 먼저 읽고 시작한다.

### 2. index 전체 덮어쓰기 금지
`index.html`은 반드시 최신 파일을 fetch한 뒤 필요한 script 한 줄만 수정한다.

### 3. disabledRuntimeFiles 재로드 금지
비활성 파일은 기능이 좋아 보여도 다시 script로 추가하지 않는다. 필요한 기능은 active owner에 병합한다.

### 4. 한 기능 한 담당 파일
예시:

```text
GPS 이동: gps-system.js
나침반 표시: radar-compass-system.js
맵/곤충/채집: main-radar.js
하단 메뉴: menu-remaster.js
BUG HOLE: bug-hole-system.js
배낭: backpack-system.js
NPC fallback: npc-api-bridge.js
```

### 5. 보정 파일 이름 금지
새 파일명에 다음 단어를 남발하지 않는다.

```text
fix
guard
cleanup
stable
patch
remaster-v2
engine-5-x
```

정말 필요하면 manifest에 owner로 등록하고 기존 owner와 충돌하지 않게 한다.

---

## 다음 권장 작업

### 1단계: 안정성 확인
- 게임 시작
- 하단 메뉴 5개
- 설정
- BUG HOLE
- 배낭
- 연구노트/퀘스트
- GPS 탐험모드 ON/OFF
- 채집

### 2단계: 손실 기능 선별 복구
현재 cleanup으로 빠진 기능 중 정말 필요한 것을 선별한다.

후보:
- 도감 등급 불빛
- 전설 도감 개선
- 그래픽 polish
- 지역 타일맵

### 3단계: 기능별 owner에 병합
예:

```text
도감 등급 불빛 -> main-radar.js의 openDex 또는 신규 dex-system.js 단일 owner
전설 도감 -> legendary-event.js 또는 dex-system.js
그래픽 polish -> css/style.css 또는 visual-system.js 단일 owner
지역 타일맵 -> main-radar.js 또는 map-engine.js
```

### 4단계: old files archive
기능 검증 후 비활성 파일을 `archive/`로 이동하거나 삭제 검토한다.

---

## 결론

CATCHA BUGS는 지금부터 Engine 8.0을 새 기준으로 한다.  
이전 버전의 기능은 폐기된 것이 아니라, **검증 후 단일 owner로 병합할 후보**다.  
앞으로는 과거 파일을 다시 로드해서 고친 기능이 원상복구되는 방식을 금지한다.
