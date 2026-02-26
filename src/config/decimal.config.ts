import Decimal from 'decimal.js';

Decimal.set({
    // precision: 40,
    precision: 28,
    rounding: Decimal.ROUND_HALF_UP,
});