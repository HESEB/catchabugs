# CATCHA BUGS Engine 9.0 Unified Core

## 목적

Engine 9.0은 새 기능을 덧붙이는 버전이 아니다.  
Engine 1.0부터 Engine 8.0까지 만든 기능과 시행착오를 모두 반영해, 앞으로의 기준이 되는 통합 엔진 구조다.

핵심 목표는 다음과 같다.

```text
기능은 보존한다.
중복 로드는 금지한다.
과거 patch 파일을 되살리지 않는다.
각 기능은 하나의 owner가 담당한다.
```

---

## Engine 1.0부터 8.0까지 포함 범위

### Engine 1.0 초기 탐험/채집

포함 기능:
- 2D 맵
- 플레이어 이동
- 곤충 생성
- 레이더
- 곤충 발견
- 채집 미니게임
- 기본 도감

Engine 9.0 owner:
- `src/main-radar.js`
- `src/data/bugs.js`
- `src/insect-ai.js`

결정:
- `main-radar.js`는 현재도 Core Game Owner다.
- 맵/곤충/채집은 보정 파일로 덮지 않는다.

---

### Engine 2.0 저장/퀘스트/업적

포함 기능:
- 저장
- 자동 저장
- 백업/복구
- 퀘스트
- 업적
- 채집 기록

Engine 9.0 owner:
- `src/save-system.js`
- `src/save-reset-guard.js`
- `src/quest.js`
- `src/achievement.js`

결정:
- 저장 구조 변경 시 reset 범위까지 함께 본다.
- GPS, NPC, BUG HOLE, 배낭 데이터가 누락되지 않게 한다.

---

### Engine 3.0 메뉴/모달

포함 기능:
- 하단 메뉴
- 연구노트
- 퀘스트
- 배낭
- BUG HOLE
- 설정
- 기본 모달

Engine 9.0 owner:
- `src/menu-remaster.js`
- `src/main-radar.js`
- `src/backpack-system.js`
- `src/bug-hole-system.js`

결정:
- 하단 메뉴는 5개 유지한다.
- `modal-nav-guard.js`, `ui-cleanup.js`는 로드하지 않는다.
- 뒤로/닫기/메뉴를 여러 파일이 동시에 소유하지 않는다.

---

### Engine 4.0 BUG HOLE/귀환

포함 기능:
- BUG HOLE
- 귀환지 발견
- 귀환석
- BUG HOLE 마커
- 설치물/활성 아이템 효과

Engine 9.0 owner:
- `src/bug-hole-system.js`
- `src/bug-hole-markers.js`
- `src/return-discovery.js`
- `src/return-stones.js`
- `src/active-items.js`
- `src/active-items-bridge.js`

결정:
- BUG HOLE은 BUG HOLE 내부만 담당한다.
- 전역 메뉴/닫기/뒤로 이벤트를 가로채지 않는다.

---

### Engine 5.0 안정화 패치 누적기

포함 기능:
- 메뉴 안정화 시도
- 개발자모드
- 나침반/레이더 보정
- bootstrap 기반 추가 로드

문제:
- `engine-5-*` 파일들이 서로 기능을 다시 덮었다.
- `engine-5-4-0-stability.js`가 다른 파일을 다시 로드하면서 patch pile을 되살렸다.

Engine 9.0 결정:
- `engine-5-4-0-stability.js`는 비활성 유지.
- 필요한 기능은 active owner에 직접 통합한다.
- `src/radar-compass-system.js`만 현재 active owner로 유지한다.

---

### Engine 6.0 런타임 정리 시도

포함 기능:
- 오래된 patch direct load 제거
- 하단 메뉴 깜빡임 완화
- menu-remaster 역할 정리

문제:
- bootstrap 파일이 남아 있어 과거 로더가 다시 살아날 수 있었다.

Engine 9.0 결정:
- Runtime Cleanup 의도는 유지한다.
- bootstrap 방식은 쓰지 않는다.
- `index.html`의 script 목록이 현재 실행 기준이다.

---

### Engine 6.1 GPS 도입

포함 기능:
- GPS ON/OFF
- 설정 메뉴 GPS 토글
- 위치 권한
- GPS HUD
- 모바일 탐험모드

Engine 9.0 owner:
- `src/gps-system.js`

결정:
- GPS는 북쪽 고정 좌표계 기준으로만 이동한다.
- GPS 이동 계산에 나침반 heading을 직접 반영하지 않는다.
- GPS는 메뉴/맵 렌더링/도감을 소유하지 않는다.

---

### Engine 6.2 탐험모드/도감 보강

포함 기능:
- GPS + 나침반 탐험모드 통합 시도
- 도감 등급 불빛
- 전설 도감 개선

문제:
- GPS와 나침반이 너무 강하게 결합되었다.
- 도감 기능이 여러 보정 파일로 분산되었다.

Engine 9.0 결정:
- 나침반은 방향 참고용이다.
- GPS 이동과 나침반은 분리한다.
- 도감 등급 불빛은 계속 필요한 기능이지만, `dex-grade-ledger.js`를 직접 로드하지 않고 나중에 하나의 dex owner로 병합한다.

---

### Engine 7.0 그래픽/GPS 이동감 보강

포함 기능:
- GPS 순간이동 완화
- 부드러운 추적 이동
- 맵/곤충/채집화면 그래픽 polish

문제:
- `visual-polish-7.js`가 넓은 범위의 DOM/style을 덮었다.
- 맵/채집/곤충 연출이 core와 충돌할 수 있었다.

Engine 9.0 결정:
- 그래픽 아이디어는 보존한다.
- 단, `visual-polish-7.js`는 직접 로드하지 않는다.
- 필요 시 `css/style.css` 또는 단일 `visual-system.js`로 이관한다.

---

### Engine 7.1 GPS/지도 안정화 시도

포함 기능:
- GPS 북쪽 고정 이동
- 나침반과 맵 회전 분리
- 지역 타일맵 시도

문제:
- `stable-map-region.js`가 다시 `#map`과 지역을 덮었다.
- main-radar의 지역 판정과 별도 지역 레이어가 동시에 존재했다.

Engine 9.0 결정:
- `stable-map-region.js`는 직접 로드하지 않는다.
- 타일형 지역 구조는 필요하지만, 나중에 `main-radar.js` 또는 `map-engine.js`에 통합한다.

---

### Engine 8.0 Runtime Cleanup

포함 기능:
- 중복 실행 파일 로드 제거
- runtime cleanup 문서화
- engine manifest 도입

Engine 9.0에서 계승하는 것:
- 비활성 파일 직접 로드 금지
- current main 기준 작업
- one feature one owner
- index 전체 원상복구 금지

---

## Engine 9.0 Unified Core 구조

### 현재 active runtime

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
src/engine-9-runtime.js
```

### Engine 9.0 runtime manifest

파일:

```text
src/engine-9-runtime.js
```

역할:
- 현재 active file 목록 제공
- reserved file 목록 제공
- owner map 제공
- `window.CATCHABUGS_ENGINE` 제공

주의:
- gameplay를 덮어쓰지 않는다.
- DOM을 대규모 수정하지 않는다.
- 다른 파일을 자동 로드하지 않는다.

---

## 비활성 유지 파일

다음 파일은 삭제하지 않았지만 직접 로드하지 않는다.

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

이 파일들은 폐기라기보다 **migration candidate**다.  
필요한 기능은 owner 파일에 병합한다.

---

## 앞으로 기능 복구/개선 순서

### 1순위 안정성
- 게임 시작
- 이동
- 레이더
- 채집
- 저장
- 하단 메뉴
- BUG HOLE
- GPS ON/OFF

### 2순위 손실 기능 재통합
- 도감 등급 불빛
- 전설 도감 개선
- 그래픽 polish
- 지역 타일맵

### 3순위 구조 개선
- `main-radar.js`에서 map/capture/dex를 분리할지 검토
- 단일 `dex-system.js` 또는 `map-engine.js` 도입 검토

---

## Engine 9.0 개발 금지 사항

```text
old engine bootstrap 재로드 금지
*-fix.js 임시 추가 금지
*-guard.js 임시 추가 금지
*-cleanup.js 광역 보정 금지
index.html 오래된 버전으로 전체 덮어쓰기 금지
비활성 파일 직접 script 추가 금지
```

---

## Engine 9.0 업데이트 절차

모든 업데이트는 다음 순서로 한다.

```text
1. engine-manifest.json 확인
2. index.html 최신 상태 확인
3. 수정 대상 owner 파일 확인
4. 해당 파일만 수정
5. 필요 시 manifest 갱신
6. docs에 변경 이유 기록
```

---

## 결론

Engine 9.0은 CATCHA BUGS의 새 기준 버전이다.  
Engine 1~8의 기능을 버리는 것이 아니라, 중복 로드 없이 owner 구조로 다시 수용한다.  
앞으로는 기능 복구도 과거 파일을 다시 켜는 방식이 아니라, Engine 9.0 owner에 병합하는 방식으로 진행한다.
