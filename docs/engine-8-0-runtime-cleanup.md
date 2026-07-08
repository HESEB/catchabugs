# Engine 8.0 Runtime Cleanup

## 목적
최근 GPS, 나침반, 맵, 도감, UI 보정 파일이 다시 누적되면서 같은 DOM과 상태를 여러 파일이 동시에 수정하는 문제가 재발했다. 특히 `#map`, `#modalBody`, `#radar`, `#toast`, `#openDex` 계열을 여러 보정 파일이 동시에 건드려 버벅임, 튐, 지역 변경 반복, 메뉴/도감 오류 가능성이 커졌다.

## 적용 원칙

- 새 기능 추가보다 실행 파일 수를 줄인다.
- 삭제하지 않고 우선 `index.html` script 연결만 끊는다.
- 같은 기능은 하나의 담당 파일만 실행한다.
- 안정화 확인 후 삭제 또는 archive 이동을 검토한다.

## 유지한 핵심 실행 파일

### Core
- `src/main-radar.js`

### 메뉴 / 경제 / 배낭 / BUG HOLE
- `src/menu-remaster.js`
- `src/economy-menu.js`
- `src/bug-hole-system.js`
- `src/bug-hole-markers.js`
- `src/backpack-system.js`

### 시스템
- `src/time-weather.js`
- `src/economy.js`
- `src/profile-system.js`
- `src/save-reset-guard.js`
- `src/active-items.js`
- `src/active-items-bridge.js`

### NPC / 연구소 / 전설 / 귀환
- `src/npc-lab.js`
- `src/random-npc.js`
- `src/npc-api-bridge.js`
- `src/legendary-event.js`
- `src/return-discovery.js`
- `src/return-stones.js`

### GPS / 나침반
- `src/gps-system.js`
- `src/radar-compass-system.js`

### 칭호
- `src/badge-title.js`

## index.html에서 로드 제거한 파일

### 맵/지역/시각 보정 중복
- `src/region-remaster.js`
- `src/visual-polish-7.js`
- `src/stable-map-region.js`

### 도감 보정 중복
- `src/dex-reward.js`
- `src/legendary-dex-fix.js`
- `src/dex-category-guard.js`
- `src/dex-grade-ledger.js`

### 모달/UI 보정 중복
- `src/modal-nav-guard.js`
- `src/ui-cleanup.js`

### 과거 통합 부트스트랩
- `src/engine-5-4-0-stability.js`

## 주의

이번 작업은 파일 삭제가 아니다. 로드만 끊어 실행 충돌을 줄이는 것이 목적이다.

## 다음 확인 항목

1. 첫 진입 후 게임 시작 정상 여부
2. 하단 메뉴 5개 동작 여부
3. 설정 / BUG HOLE / 배낭 / 연구노트 / 퀘스트 열림 여부
4. 탐험모드 ON/OFF 여부
5. GPS 이동 시 방향과 지역 변경 빈도
6. 도감 기본 표시 여부
7. 채집 화면 기본 동작 여부

## 후속 권장 작업

- 도감 등급 불빛, 전설 도감, 그래픽 개선은 보정 파일이 아니라 `main-radar.js` 또는 전용 단일 도감 파일로 재통합한다.
- 맵/지역/GPS는 장기적으로 `map-engine.js`로 통합한다.
- `engine-*`, `*-fix`, `*-guard`, `*-cleanup` 류 파일은 archive 대상으로 분류한다.
