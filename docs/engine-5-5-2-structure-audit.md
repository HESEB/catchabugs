# Engine 5.5.2 현재 파일 구조 점검

## 기준 문서

- `docs/development-rules.md`

## 점검 기준

1. 같은 기능을 여러 파일이 동시에 처리하지 않는가?
2. 과거 패치가 현재 담당 파일을 덮어쓰지 않는가?
3. 버튼/뒤로/닫기는 단일 라우터가 처리하는가?
4. 중복 이벤트 루프가 남아 있는가?
5. 향후 기능 추가 시 담당 파일이 명확한가?

---

## 현재 로드 구조 요약

`index.html` 기준 현재 로드되는 주요 파일:

- `main-radar.js`
- `region-remaster.js`
- `badge-title.js`
- `dex-reward.js`
- `time-weather.js`
- `economy.js`
- `profile-system.js`
- `npc-lab.js`
- `legendary-event.js`
- `legendary-dex-fix.js`
- `return-discovery.js`
- `return-stones.js`
- `menu-remaster.js`
- `economy-menu.js`
- `bug-hole-system.js`
- `bug-hole-markers.js`
- `active-items.js`
- `active-items-bridge.js`
- `backpack-system.js`
- `modal-nav-guard.js`
- `ui-cleanup.js`
- `save-reset-guard.js`
- `dex-category-guard.js`
- `radar-ui-compact.js`
- `engine-5-2-2-stable.js`
- `random-npc.js`
- `engine-5-3-6-compass-mode.js`
- `engine-5-3-8-dev-mode-fix.js`
- `engine-5-3-9-debug-toggle.js`
- `engine-5-4-0-stability.js`

`engine-5-4-0-stability.js`가 동적으로 로드하는 현재 핵심 파일:

- `engine-5-5-0-menu-navigation.js`

---

## 기준 충족 항목

### 1. 뒤로 / 닫기 / 메뉴 라우팅

현재 기준 충족.

- 담당 파일: `engine-5-5-0-menu-navigation.js`
- `modal-nav-guard.js`는 Engine 5.5.1에서 presentation-only로 축소됨.
- `engine-5-2-2-stable.js`는 legacy shim으로 퇴역 처리되어 더 이상 뒤로/닫기 capture를 하지 않음.

판정: **양호**

---

### 2. BUG HOLE

현재 기준 대체로 충족.

- 기능 본체: `bug-hole-system.js`
- 마커: `bug-hole-markers.js`
- 뒤로 라우팅: `engine-5-5-0-menu-navigation.js`
- 과거 `engine-5-2-2-stable.js`의 BUG HOLE 버튼 override는 퇴역 처리됨.

판정: **양호**

주의:
- `return-discovery.js`, `return-stones.js`, `bug-hole-system.js`가 모두 귀환/거점 관련 상태를 다룬다.
- 현재는 기능이 분리되어 있으나, 향후 귀환 시스템이 커지면 통합 검토 필요.

---

### 3. 퀘스트 / 미션 / 업적 / 칭호

현재 기준 부분 충족.

- 퀘스트 메인: `menu-remaster.js`
- 미션: `main-radar.js`의 `openQuest()` / 관련 quest renderer
- 업적: `main-radar.js` 또는 achievement 관련 renderer
- 칭호: `badge-title.js`
- 뒤로 라우팅: `engine-5-5-0-menu-navigation.js`

판정: **부분 양호**

주의:
- 퀘스트 메인과 하위 화면이 서로 다른 파일에서 열림.
- 현재는 `engine-5-5-0-menu-navigation.js`가 하위 뒤로 흐름을 흡수하고 있으나, 장기적으로는 `quest-system.js`로 통합하는 편이 좋음.

권장 후속:
- Engine 5.6에서 `quest-system.js` 신규 통합 검토.

---

### 4. 설정 / 개발자모드 / 저장

현재 기준 부분 충족.

- 설정 메인: `menu-remaster.js`
- 개발자모드 기본: `menu-remaster.js`
- 개발자모드 NPC 테스트: `engine-5-3-8-dev-mode-fix.js`
- 개발자모드 디버그: `engine-5-3-9-debug-toggle.js`
- 저장/초기화: `save-reset-guard.js` 및 기존 save UI
- 뒤로 라우팅: `engine-5-5-0-menu-navigation.js`

판정: **부분 양호**

주의:
- 개발자모드가 3개 파일로 나뉘어 있음.
- 현재는 역할이 분리되어 있으나, 계속 확장하면 다시 중복 위험이 있음.

권장 후속:
- Engine 5.6에서 `dev-mode-system.js`로 통합 검토.

---

### 5. 레이더 / 나침반

현재 기준 부분 충족.

- 레이더 UI: `radar-ui-compact.js`
- 모바일 센서 나침반: `engine-5-3-6-compass-mode.js`
- 기존 `engine-5-2-2-stable.js`의 임시 나침반은 퇴역 처리됨.

판정: **부분 양호**

주의:
- `radar-ui-compact.js`와 `engine-5-3-6-compass-mode.js`가 모두 `#radarCompassToggle`을 다룬다.
- 현재는 PC 수동 / 모바일 센서 역할로 나뉘어 있으나, 같은 버튼을 건드리는 구조는 재발 위험이 있음.

권장 후속:
- Engine 5.6에서 `radar-compass-system.js`로 통합 검토.

---

### 6. 배낭 / 아이템

현재 기준 대체로 충족.

- 배낭 UI: `backpack-system.js`
- 활성 아이템: `active-items.js`
- 연결 브릿지: `active-items-bridge.js`
- 뒤로 라우팅: `engine-5-5-0-menu-navigation.js`

판정: **양호**

주의:
- active item이 늘어나면 bridge 파일의 역할이 커질 수 있음.

---

### 7. NPC

현재 기준 부분 충족.

- NPC 기본/랜덤: `random-npc.js`
- NPC 연구소 또는 실험: `npc-lab.js`
- 개발자모드 NPC 테스트: `engine-5-3-8-dev-mode-fix.js`

판정: **부분 양호**

주의:
- NPC 생성/테스트/대화/보상이 분리되어 있으므로 확장 시 충돌 가능성 있음.

권장 후속:
- Engine 5.6 이후 `npc-system.js` 통합 검토.

---

## 현재 기준 위반 또는 위험 요소

### 위험 1. `engine-5-4-0-stability.js` 이름과 역할 불일치

현재 이 파일은 5.5.0 통합 네비게이션 로더 역할을 한다.
파일명은 5.4.0이지만 실제로는 5.5.0 부트스트랩이다.

위험도: 중간

권장:
- 추후 `engine-bootstrap.js`로 이름 변경 또는 신규 생성 후 index 로드 교체.

---

### 위험 2. 과거 패치 파일이 저장소에 남아 있음

현재 직접 로드되지는 않지만 다음 파일들이 저장소에 남아 있다.

- `engine-5-4-1-menu-state.js`
- `engine-5-4-2-bughole-back-fix.js`
- `engine-5-4-3-menu-state-fix.js`
- `engine-5-4-9-settings-back-fix.js`
- 기타 5.3.x 보정 파일 일부

위험도: 중간

권장:
- 바로 삭제보다는 `docs/archived-patches.md`에 퇴역 목록 기록 후, 안정 확인 뒤 삭제.

---

### 위험 3. 개발자모드 파일 분산

개발자모드는 현재 3개 파일에서 관리된다.

- 기본 UI: `menu-remaster.js`
- NPC 테스트: `engine-5-3-8-dev-mode-fix.js`
- 디버그 패널: `engine-5-3-9-debug-toggle.js`

위험도: 중간

권장:
- 기능 추가 전 `dev-mode-system.js` 통합 여부 판단.

---

### 위험 4. 레이더 나침반 버튼 공동 사용

`radar-ui-compact.js`와 `engine-5-3-6-compass-mode.js`가 모두 `#radarCompassToggle`을 다룬다.

위험도: 중간

권장:
- 나침반 문제가 재발하면 `radar-compass-system.js`로 통합.

---

## 현재 결론

Engine 5.5.1 이후 핵심 문제였던 뒤로/닫기/메뉴 라우팅 중복은 상당히 정리되었다.

현재 상태는 다음과 같다.

- 메뉴 라우팅: 기준 충족
- BUG HOLE: 기준 충족
- 배낭: 기준 충족
- 퀘스트: 부분 충족, 향후 통합 권장
- 설정/개발자모드: 부분 충족, 향후 통합 권장
- 레이더/나침반: 부분 충족, 향후 통합 권장
- NPC: 부분 충족, 향후 통합 권장

## 다음 권장 작업

1. 실제 사용자 테스트로 5.5.1 안정 확인
2. 문제 없으면 `engine-bootstrap.js` 생성 검토
3. 과거 5.4.x 패치 파일 archive 처리
4. 이후 신규 기능은 `development-rules.md` 기준으로 담당 파일을 먼저 정한 뒤 진행
