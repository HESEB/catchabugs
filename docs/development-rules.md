# CATCHA BUGS 개발 원칙 v1.0

## Rule 0. 같은 기능은 프로젝트 전체에서 단 하나의 파일만 책임진다

예시:

- 뒤로가기 / 닫기 / 모달 라우팅: `engine-5-5-0-menu-navigation.js`
- 모달 상단 버튼 UI 생성: `modal-nav-guard.js`
- BUG HOLE 기능 본체: `bug-hole-system.js`
- BUG HOLE 마커: `bug-hole-markers.js`
- 레이더 UI: `radar-ui-compact.js`
- 모바일 나침반 센서 전환: `engine-5-3-6-compass-mode.js`
- 개발자모드 기본 UI: `menu-remaster.js`
- 개발자모드 NPC 테스트: `engine-5-3-8-dev-mode-fix.js`
- 개발자모드 디버그 패널: `engine-5-3-9-debug-toggle.js`

같은 기능을 여러 파일에서 동시에 수정하지 않는다.

---

## 1. 새 기능 추가 전 담당 파일을 먼저 정한다

새 기능을 만들기 전 반드시 아래 질문을 먼저 한다.

> 이 기능은 어느 파일이 담당하는가?

담당 파일이 이미 있으면 새 패치 파일을 만들지 말고 기존 담당 파일을 수정한다.

---

## 2. 같은 기능을 건드리는 과거 패치는 끈다

새 버전이 기존 역할을 대체하면 과거 패치는 유지하지 않는다.

예시:

- `engine-5-5-0-menu-navigation.js`가 뒤로/닫기 담당
- 따라서 `engine-5-2-2-stable.js`, `engine-5-4-x` 계열의 뒤로/닫기 로직은 꺼야 한다.

---

## 3. 여러 문제를 고칠 때도 역할별로 분리한다

예시:

- 메뉴 문제는 메뉴 담당 파일
- 레이더 문제는 레이더 담당 파일
- NPC 문제는 NPC 담당 파일
- 저장 문제는 저장 담당 파일

한 파일에서 여러 기능을 임시로 덮어쓰는 방식은 금지한다.

---

## 4. 버튼 / 뒤로 / 닫기는 공통 라우터만 처리한다

`뒤로`, `닫기`, `게임으로`, `상위 메뉴` 이동은 `engine-5-5-0-menu-navigation.js`가 전담한다.

다른 파일은 다음을 하지 않는다.

- `[data-modal-back]` 직접 처리
- `[data-modal-close]` 직접 처리
- `[data-menu-back]` 강제 캡처
- `[data-menu-close]` 강제 캡처
- 같은 버튼에 `onclick`과 `addEventListener`를 중복 등록

---

## 5. 기존 기능 수정 전 담당 파일 확인

수정 전 반드시 담당 파일을 찾는다.

예시:

- BUG HOLE 이동 문제: `bug-hole-system.js`
- BUG HOLE 마커 문제: `bug-hole-markers.js`
- BUG HOLE 뒤로 문제: `engine-5-5-0-menu-navigation.js`

---

## 6. 공통 UI는 중복 생성하지 않는다

공통 UI 생성 시 항상 기존 요소를 확인한다.

필수 패턴:

```js
if (document.querySelector('#targetId')) return;
```

대상:

- 모달 상단 바
- HUD
- 레이더 버튼
- 나침반 패널
- 개발자모드 패널
- 디버그 패널
- NPC 테스트 패널

---

## 7. 업데이트마다 건강검진을 한다

업데이트 후 다음을 점검한다.

- 중복 `addEventListener`
- 중복 `onclick`
- 중복 `requestAnimationFrame`
- 중복 `setInterval`
- 중복 `setTimeout` 루프
- 중복 CSS 주입
- 중복 HUD/모달/버튼 생성
- 같은 localStorage/sessionStorage key 중복 사용

---

## 8. 패치는 누적하지 말고 교체한다

새 버전이 기존 기능을 대체하면 기존 파일은 다음 중 하나로 처리한다.

1. 삭제
2. index 로드 제거
3. legacy shim으로 퇴역 처리

`5.5 + 5.6`이 동시에 같은 기능을 처리하면 안 된다.

---

## 개발 진행 순서

1. 담당 파일 확인
2. 기존 중복 패치 확인
3. 중복 기능 제거 또는 퇴역
4. 기능 구현
5. 건강검진
6. 커밋
7. 사용자 테스트 항목 제시
