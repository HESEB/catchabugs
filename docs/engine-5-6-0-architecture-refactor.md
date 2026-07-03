# Engine 5.6.0 Architecture Refactor

## 목적
부분충족 상태였던 개발자모드, 레이더/나침반, NPC, 퀘스트/설정 구조를 담당 파일 기준으로 정리한다.

## 적용 원칙

- 같은 기능은 단일 담당 파일에서 처리한다.
- 과거 패치는 shim 처리하거나 로드 중복을 방지한다.
- 버튼/뒤로/닫기는 통합 메뉴 라우터가 담당한다.
- 기능 추가보다 구조 안정화를 우선한다.

---

## 1. Dev Mode 통합

### 신규 담당 파일

- `src/dev-mode-system.js`

### 담당 역할

- 개발자모드 확장 패널
- NPC 테스트 버튼
- 디버그 패널 ON/OFF
- 디버그 로그
- 개발자모드 상태 확인 API

### 기존 파일

- `engine-5-3-8-dev-mode-fix.js`
- `engine-5-3-9-debug-toggle.js`

두 파일은 아직 index에 직접 로드되어 있으나, 새 통합 파일이 같은 패널 ID를 사용하므로 UI 중복은 방지된다.
직접 shim 교체는 안전 검사에 막혀 추후 안정 확인 후 재시도한다.

---

## 2. Radar / Compass 통합

### 신규 담당 파일

- `src/radar-compass-system.js`

### 담당 역할

- 레이더 압축 UI
- 레이더 나침반 버튼
- PC 수동 나침반
- 모바일 센서 나침반
- 시간/날씨/방향 정보 표시

### 퇴역 처리

- `radar-ui-compact.js` → shim 처리
- `engine-5-3-6-compass-mode.js` → shim 처리

---

## 3. Menu / Quest / Settings 라우팅

### 담당 파일

- `src/engine-5-5-0-menu-navigation.js`

### 담당 역할

- 뒤로 / 닫기
- 퀘스트 하위 → 퀘스트 메인
- 설정 하위 → 설정 메인
- BUG HOLE 하위 → BUG HOLE 메인
- 배낭 → 게임 닫기

### 상태

Engine 5.5.0에서 이미 통합 완료.

---

## 4. Bootstrap

### 현재 담당 파일

- `src/engine-5-4-0-stability.js`

### 현재 역할

- 안정화 CSS
- 클릭 가능 요소 보정
- 통합 모듈 로드
  - `engine-5-5-0-menu-navigation.js`
  - `dev-mode-system.js`
  - `radar-compass-system.js`

### 후속 권장

파일명이 역할과 맞지 않으므로 추후 `engine-bootstrap.js`로 교체 권장.

---

## 5. NPC

### 현재 상태

- 기본 NPC: `random-npc.js`
- NPC 연구/실험: `npc-lab.js`
- 개발자모드 NPC 테스트: `dev-mode-system.js`

### 진행 상태

`npc-system.js` facade 생성은 안전 검사에 막혀 이번 단계에서는 보류.
다만 개발자모드 NPC 테스트는 `dev-mode-system.js`에서 `CATCHABUGS_RANDOM_NPC` API를 호출하는 구조로 통합했다.

### 후속 권장

Engine 5.6.1에서 더 작은 범위로 NPC facade 재시도.

---

## 6. 현재 남은 위험

1. `engine-5-3-8-dev-mode-fix.js`, `engine-5-3-9-debug-toggle.js`가 아직 index에 직접 로드된다.
2. 다만 동일 ID 중복 방지 구조로 인해 UI 중복 가능성은 낮다.
3. `engine-5-4-0-stability.js`의 이름이 역할과 맞지 않는다.
4. NPC facade는 아직 완전 통합되지 않았다.

---

## 테스트 항목

1. 설정 → 개발자모드 열림 여부
2. 개발자모드 안 NPC 테스트 버튼이 한 번만 보이는지
3. 개발자모드 안 디버그 버튼이 한 번만 보이는지
4. 레이더 나침반 버튼이 하나만 보이는지
5. 모바일에서 센서 나침반 작동 여부
6. PC에서 수동 나침반 작동 여부
7. 퀘스트/설정/BUG HOLE 뒤로가기 유지 여부

## 적용 커밋 요약

- `dev-mode-system.js` 생성
- `radar-compass-system.js` 생성
- `engine-5-4-0-stability.js`에서 통합 모듈 로드
- `radar-ui-compact.js` shim 처리
- `engine-5-3-6-compass-mode.js` shim 처리
