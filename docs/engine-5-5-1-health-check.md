# Engine 5.5.1 코드 건강검진 결과

## 목적
누적 패치로 인해 발생하던 메뉴 중복, 뒤로가기 충돌, 개발자모드 미실행, 모달 버튼 중복 문제를 점검하고 중복 실행 구조를 제거한다.

## 확인된 주요 중복 원인

### 1. modal-nav-guard.js
기존에는 다음 기능을 모두 담당했다.

- 모달 상단 뒤로/닫기 버튼 생성
- 뒤로/닫기 실제 동작 처리
- data-target 클릭 우회
- data-panel 클릭 우회
- MutationObserver로 모달 변경 감시

Engine 5.5.0 통합 메뉴 네비게이션과 기능이 겹쳤기 때문에 충돌이 발생했다.

### 조치
Engine 5.5.1에서 modal-nav-guard.js를 UI 바 생성 전용으로 축소했다.
실제 뒤로/닫기 처리는 engine-5-5-0-menu-navigation.js가 전담한다.

---

### 2. engine-5-2-2-stable.js
기존에는 다음 기능을 계속 실행했다.

- requestAnimationFrame 기반 매 프레임 tick
- BUG HOLE 버튼 onclick 덮어쓰기
- data-menu-back / data-menu-close capture 단계 강제 닫기
- 레이더 클릭 나침반 처리
- BUG HOLE 마커 갱신

현재 구조에서는 대부분 다른 파일과 중복된다.

### 조치
Engine 5.5.1에서 legacy shim으로 퇴역 처리했다.
이제 이벤트, requestAnimationFrame, back capture, BUG HOLE override를 등록하지 않는다.

---

## 현재 역할 분리

### 메뉴 / 뒤로 / 닫기
- modal-nav-guard.js: 상단 버튼 UI 생성 전용
- engine-5-5-0-menu-navigation.js: 실제 뒤로/닫기 라우팅 전담

### BUG HOLE
- bug-hole-system.js: BUG HOLE 기능 본체
- bug-hole-markers.js: BUG HOLE 마커
- engine-5-5-0-menu-navigation.js: 뒤로 라우팅만 담당

### 퀘스트
- menu-remaster.js: 퀘스트 메인 진입
- main-radar.js / quest.js / achievement.js / badge-title.js: 기존 하위 화면
- engine-5-5-0-menu-navigation.js: 하위 화면 뒤로 라우팅 및 퀘스트 메인 재렌더링

### 설정
- menu-remaster.js: 설정/개발자모드 UI
- save-reset-guard.js / save-system.js: 저장 관련 기능
- engine-5-5-0-menu-navigation.js: 저장/개발자모드 뒤로 라우팅

### 레이더 / 나침반
- radar-ui-compact.js: 레이더 UI 및 PC 수동 나침반
- engine-5-3-6-compass-mode.js: 모바일 센서 나침반 전환

### 개발자모드
- menu-remaster.js: 기본 개발자모드
- engine-5-3-8-dev-mode-fix.js: NPC 테스트 버튼 삽입
- engine-5-3-9-debug-toggle.js: 디버그 패널 토글

## 남은 주의점

1. 레이더/나침반은 아직 2개 파일이 같은 버튼을 다룬다.
   - 현재는 PC/모바일 역할이 분리되어 있어 유지한다.
   - 버튼 표시 이상이 재발하면 engine-5-6에서 통합 권장.

2. 개발자모드는 기본 UI, NPC 테스트, 디버그가 3개 파일로 구성되어 있다.
   - 현 시점에서는 분리 유지.
   - 개발자모드 미실행이 재발하면 engine-5-6에서 dev-mode 통합 권장.

3. 과거 5.4.x 파일들은 저장소에 남아 있으나 현재 자동 로드되지 않는다.
   - 필요 시 추후 archive 또는 delete 가능.

## Engine 5.5.1 조치 커밋

- modal-nav-guard.js를 presentation-only로 축소
- engine-5-5-0-menu-navigation.js API 노출
- engine-5-2-2-stable.js legacy shim 퇴역
- 코드 건강검진 보고서 추가
