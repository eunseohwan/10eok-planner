import { YOUTH_TOMORROW } from '../data/youthProducts.js';

/**
 * 한 달 돈 흐름: 실수령액 − 고정지출 − 저축·투자 = 남는 돈
 * 입력 화면 표시와 목표 계산이 같은 숫자를 쓰도록 한 곳에서 계산해요.
 */
export function calcCashFlow(inputs, net) {
  const expenseTotal = inputs.expenses.reduce((s, e) => s + (e.amount ?? 0), 0);

  const { future, leap, tomorrow } = inputs.youth;
  const savingTotal =
    (inputs.saving.monthly ?? 0) +
    (inputs.invest.monthly ?? 0) +
    (future.enabled ? future.monthly ?? 0 : 0) +
    (leap.enabled ? leap.monthly ?? 0 : 0) +
    (tomorrow.enabled ? YOUTH_TOMORROW.selfMonthly : 0);

  const left = net - expenseTotal - savingTotal;

  return {
    expenseTotal,
    savingTotal,
    left,
    // 목표 계산에 더할 남는 돈: 스위치가 켜져 있고 플러스일 때만
    leftoverSaved: inputs.saveLeftover && left > 0 ? left : 0,
  };
}
