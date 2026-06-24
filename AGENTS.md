# Frontend Agent Instructions

이 문서는 `frontend/` 아래 작업에 적용되는 지침이다. 상위 `AGENTS.md`를 먼저 따르고, 프론트엔드 구현에서는 아래 규칙을 추가로 적용한다.

## Styling Direction

- Tailwind CSS는 사용하지 않는다.
- 공통 컴포넌트는 가능한 한 headless하게 만든다. 즉 상태, 접근성, 이벤트, 슬롯 계약을 책임지고 구체적인 시각 표현은 강하게 소유하지 않는다.
- 전역 CSS는 디자인 토큰과 제한된 유틸리티 클래스의 얇은 레이어로 사용한다.
- 유틸리티 클래스는 반복되는 레이아웃, 간격, 텍스트, 패널, 버튼 같은 공통 표현만 제공한다.
- Tailwind 전체를 수동으로 재구현하듯 세밀한 숫자별 클래스를 늘리지 않는다.
- 페이지 또는 도메인에만 의미가 있는 스타일은 해당 Vue SFC의 `scoped` 스타일에 둔다.
- 컴포넌트 고유의 복잡한 시각 표현은 전역 유틸리티보다 SFC `scoped` 스타일을 우선한다.

## CSS Layering

- 전역 스타일은 `src/shared/styles/` 아래에 둔다.
- 전역 스타일 진입점은 `src/shared/styles/index.css`로 유지하고 `src/main.js`에서 한 번만 import한다.
- 디자인 값은 CSS custom properties로 정의하고, 유틸리티 클래스는 이 토큰을 참조한다.
- 전역 유틸리티 클래스는 `u-` prefix를 사용한다.
- 앱 전역 컴포넌트성 클래스는 기존 관례가 있으면 유지할 수 있지만, 새로 추가할 때는 범용성이 분명한 경우에만 추가한다.

## Headless Component Rules

- Headless 컴포넌트는 `src/shared/components/headless/` 아래에 둔다.
- Headless 컴포넌트는 기본적으로 스타일을 갖지 않는다.
- 필요한 경우 `as`, `role`, `aria-*`, slot props를 통해 의미와 상태를 조합 가능하게 제공한다.
- 기존 public component API를 깨지 않기 위해, 이미 쓰이는 컴포넌트는 headless 컴포넌트를 감싼 얇은 wrapper로 유지할 수 있다.
- wrapper는 기본 스타일 조합과 기본 문구를 제공하되, 핵심 동작과 접근성 계약은 headless 컴포넌트에 위임한다.

## Practical Guidance

- 먼저 중복된 CSS 값을 토큰 또는 제한된 유틸리티로 이동할 수 있는지 본다.
- 그 다음 반복되는 구조를 headless 컴포넌트로 추출한다.
- 변경 범위는 작게 유지하고, 기존 페이지의 DOM 의미와 접근성 속성을 보존한다.
- 새 스타일을 만들 때는 기존 색상, 간격, radius, typography 흐름을 우선 따른다.
