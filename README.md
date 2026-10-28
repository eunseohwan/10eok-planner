# 10억 플래너 – 내 월급으로 10억까지 몇 년?

연봉, 고정지출, 적금·투자, 청년 상품(청년미래적금·청년도약계좌·청년내일저축계좌)을 넣으면
목표 금액까지 걸리는 기간을 계산해주는 웹이에요.

## 실행 방법

1. Node.js LTS 설치: https://nodejs.org
2. 이 폴더에서 터미널 열기
3. 패키지 설치 (처음 한 번)
   ```
   npm install
   ```
4. 개발 서버 실행
   ```
   npm run dev
   ```
5. 브라우저에서 http://localhost:5173 열기

## 폴더 구조

```
src/
  main.jsx            앱 시작점
  App.jsx             전체 입력값(state)을 들고 있는 곳
  styles.css          색, 레이아웃
  components/         화면 조각
    Header.jsx
    ProfileSection.jsx      ① 내 정보
    ExpenseSection.jsx      ② 고정지출
    SavingSection.jsx       ③ 저축·투자
    YouthProductSection.jsx ④ 청년 상품
    CashFlowSection.jsx     한 달 돈 흐름
    ResultBar.jsx           하단 결과 바
    MoneyInput.jsx          만 원 단위 금액 입력칸
    BankSheet.jsx           은행 선택 바텀시트
    ResultPage.jsx          결과 화면
    AssetChart.jsx          연도별 자산 그래프
  data/
    youthProducts.js  청년 상품 조건 (정책 바뀌면 여기만 수정)
    banks.js          청년미래적금 은행별 우대 조건
    taxRates.js       4대보험 요율, 소득세 기준
  lib/
    format.js         금액 표시 ("1억 2,000만 원")
    salary.js         실수령액 계산
    simulate.js       목표 도달 기간 계산
```

## 진행 상황

- [x] 프로젝트 세팅, 입력 화면 뼈대
- [x] 실수령액 계산 (4대보험·소득세)
- [x] 10억 도달 기간 계산 (적금·투자·청년 상품)
- [x] 은행 선택 화면 (청년미래적금 우대금리)
- [x] 결과 화면 (그래프·연도별 표·자산 구성)
- [ ] 배포
