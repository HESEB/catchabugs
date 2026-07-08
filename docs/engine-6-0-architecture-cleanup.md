# Engine 6.0 Architecture Cleanup

## 목적
누적 패치 파일이 동시에 실행되며 발생하던 메뉴 오염, 뒤로가기 충돌, 레이더/나침반 중복, 개발자모드 중복 패널 문제를 줄이기 위해 index.html의 직접 로드 구조를 정리한다.

## 원칙

- 삭제하지 않고 우선 index.html 연결만 끊는다.
- 기능 담당 파일은 하나로 제한한다.
- 과거 engine-5-2, engine-5-3, engine-5-4 계열 패치 파일은 직접 로드하지 않는다.
- 통합 부트스트랩이 필요한 통합 시스템만 동적으로 로드한다.

## index.html에서 직접 로드 제거한 파일

- `src/radar-ui-compact.js`
- `src/engine-5-2-2-stable.js`
- `src/engine-5-3-6-compass-mode.js`
- `src/engine-5-3-8-dev-mode-fix.js`
- `src/engine-5-3-9-debug-toggle.js`

## 유지한 통합 로더

- `src/engine-5-4-0-stability.js`

현재 파일명은 5.4.0이지만 실제 역할은 통합 부트스트랩이다. 내부에서 아래 3개 통합 시스템을 로드한다.

- `src/engine-5-5-0-menu-navigation.js`
- `src/dev-mode-system.js`
- `src/radar-compass-system.js`

## 현재 역할 분리

### 메뉴 / 뒤로 / 닫기
- 담당: `src/engine-5-5-0-menu-navigation.js`
- 보조 UI: `src/modal-nav-guard.js`

### BUG HOLE
- 담당: `src/bug-hole-system.js`
- 마커: `src/bug-hole-markers.js`

### 개발자모드
- 담당: `src/dev-mode-system.js`

### 레이더 / 나침반
- 담당: `src/radar-compass-system.js`

### 초기화
- 담당: `src/save-reset-guard.js`

## 주의

과거 패치 파일은 아직 저장소에 남아 있으나 index.html에서 직접 실행하지 않는다. 안정 확인 후 삭제 또는 archive 폴더 이동을 검토한다.

## 테스트 항목

1. 첫 진입 후 설정 버튼이 설정만 여는지
2. BUG HOLE 버튼이 BUG HOLE만 여는지
3. 연구노트/퀘스트/설정 소메뉴에서 뒤로가 상위 메뉴로 가는지
4. BUG HOLE 설치/해체 진행 화면에서 뒤로가 BUG HOLE 메인으로 가는지
5. 개발자모드 NPC/디버그 패널이 한 번만 보이는지
6. 레이더 SENSOR ON/OFF가 동작하는지
7. 초기화 후 저장 데이터가 남지 않는지
