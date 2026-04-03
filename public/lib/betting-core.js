/**
 * BettingCore — Shared betting math library
 * Used by PaddockIQ (horse racing) and RallyIQ (tennis)
 *
 * Covers: Kelly criterion, edge detection, bankroll summary,
 *         CLV tracking, drawdown, streak analysis
 */
var BettingCore = (function () {

  // ── Odds Conversion ──────────────────────────────────────────

  /** Morning-line string "4-1" → decimal odds 5.0 */
  function mlToDecimal(ml) {
    if (typeof ml === 'number') return ml;
    var p = String(ml || '4-1').split('-');
    return p[1] > 0 ? (parseFloat(p[0]) / parseFloat(p[1])) + 1 : 5.0;
  }

  /** Decimal odds → implied probability (1 / odds) */
  function decimalToImplied(decimalOdds) {
    return decimalOdds > 0 ? 1 / decimalOdds : 0;
  }

  /** Implied probability → decimal odds */
  function impliedToDecimal(prob) {
    return prob > 0 ? 1 / prob : 100;
  }

  /** American odds → decimal odds */
  function americanToDecimal(american) {
    if (american >= 100) return (american / 100) + 1;
    if (american <= -100) return (100 / Math.abs(american)) + 1;
    return 2.0;
  }

  /** Decimal odds → American odds */
  function decimalToAmerican(decimal) {
    if (decimal >= 2.0) return Math.round((decimal - 1) * 100);
    return Math.round(-100 / (decimal - 1));
  }

  // ── Kelly Criterion ──────────────────────────────────────────

  /**
   * Full Kelly fraction: f* = (bp - q) / b
   * @param {number} prob    - win probability (0-1)
   * @param {number} decimalOdds - decimal odds (e.g. 5.0 for 4-1)
   * @returns {number} Kelly fraction (0-1), 0 if no edge
   */
  function fullKelly(prob, decimalOdds) {
    if (decimalOdds <= 1 || prob <= 0 || prob >= 1) return 0;
    var b = decimalOdds - 1;
    var q = 1 - prob;
    return Math.max(0, (prob * b - q) / b);
  }

  /**
   * Fractional Kelly — safer for real-world use
   * @param {number} prob
   * @param {number} decimalOdds
   * @param {number} [fraction=0.25] - Kelly fraction (0.25 = quarter Kelly)
   */
  function fractionalKelly(prob, decimalOdds, fraction) {
    if (fraction == null) fraction = 0.25;
    return fullKelly(prob, decimalOdds) * fraction;
  }

  /**
   * Parallel Kelly — scale down when betting multiple events simultaneously
   * @param {Array<{prob:number, decimalOdds:number}>} bets
   * @param {number} [fraction=0.25]
   * @returns {number[]} stake fractions per bet
   */
  function parallelKelly(bets, fraction) {
    if (fraction == null) fraction = 0.25;
    var total = bets.reduce(function (s, b) {
      return s + fractionalKelly(b.prob, b.decimalOdds, fraction);
    }, 0);
    var scale = total > 0.2 ? 0.2 / total : 1;
    return bets.map(function (b) {
      return fractionalKelly(b.prob, b.decimalOdds, fraction) * scale;
    });
  }

  /**
   * Recommended stake in $ with safety cap
   * @param {number} bankroll
   * @param {number} prob       - win probability (0-1)
   * @param {number} decimalOdds
   * @param {Object} [options]
   * @param {number} [options.kellyFraction=0.25]
   * @param {number} [options.maxBetPct=0.20]   - max % of bankroll per bet
   * @param {number} [options.minBet=2]          - minimum bet size
   * @param {string} [options.signal]            - 'BET','LEAN','PASS'
   */
  function recommendedStake(bankroll, prob, decimalOdds, options) {
    var o = options || {};
    var kellyFrac = o.kellyFraction != null ? o.kellyFraction : 0.25;
    var maxBetPct = o.maxBetPct != null ? o.maxBetPct : 0.20;
    var minBet    = o.minBet != null ? o.minBet : 2;
    var signal    = o.signal || 'BET';

    if (signal === 'PASS') return 0;

    var kellyStake = bankroll * fractionalKelly(prob, decimalOdds, kellyFrac);
    var maxStake = bankroll * maxBetPct;
    var signalMult = signal === 'LEAN' ? 0.5 : 1.0;

    var raw = Math.min(kellyStake, maxStake) * signalMult;
    if (raw < minBet) return 0;
    return Math.max(minBet, Math.round(raw));
  }

  // ── Edge Detection ───────────────────────────────────────────

  /**
   * Compute edge between model probability and market odds
   * @param {number} modelProb       - model win probability (0-1)
   * @param {number} marketDecimalOdds - market decimal odds
   * @param {Object} [thresholds]
   * @param {number} [thresholds.bet=0.02]  - minimum edge for BET signal
   * @param {number} [thresholds.lean=0.01] - minimum edge for LEAN signal
   * @param {number} [thresholds.minConf=0.51] - minimum model confidence
   * @returns {{modelProb, impliedProb, edge, signal, kellyFraction}}
   */
  function computeEdge(modelProb, marketDecimalOdds, thresholds) {
    var t = thresholds || {};
    var minBet  = t.bet != null ? t.bet : 0.02;
    var minLean = t.lean != null ? t.lean : 0.01;
    var minConf = t.minConf != null ? t.minConf : 0.51;

    var impliedProb = decimalToImplied(marketDecimalOdds);
    var edge = modelProb - impliedProb;
    var signal = 'PASS';
    if (modelProb >= minConf) {
      if (edge >= minBet) signal = 'BET';
      else if (edge >= minLean) signal = 'LEAN';
    }
    return {
      modelProb: modelProb,
      impliedProb: impliedProb,
      edge: edge,
      signal: signal,
      kellyFraction: fullKelly(modelProb, marketDecimalOdds)
    };
  }

  /**
   * Expected value of a bet
   */
  function expectedValue(stake, modelProb, decimalOdds) {
    var toWin = stake * (decimalOdds - 1);
    return (modelProb * toWin) - ((1 - modelProb) * stake);
  }

  // ── CLV (Closing Line Value) ─────────────────────────────────

  /**
   * Closing Line Value — did you beat the closing line?
   * Positive CLV = you got a better price than the market settled at
   * @param {number} openingOdds  - decimal odds when bet was placed
   * @param {number} closingOdds  - decimal odds at post time / closing
   * @returns {number} CLV as probability difference (positive = good)
   */
  function computeCLV(openingOdds, closingOdds) {
    if (!openingOdds || !closingOdds || openingOdds <= 0 || closingOdds <= 0) return 0;
    var openProb  = decimalToImplied(openingOdds);
    var closeProb = decimalToImplied(closingOdds);
    return closeProb - openProb; // positive = line moved against the horse = you had better price
  }

  // ── Bankroll Summary ─────────────────────────────────────────

  /**
   * Compute comprehensive bankroll summary from bet history.
   * Sport-agnostic — works with any bet that has {pnl, result, status, edge?, odds?, closingOdds?}
   *
   * @param {number} currentBalance - current bankroll
   * @param {number} startingBankroll - starting bankroll
   * @param {Array} bets - array of bet records
   * @param {number} bets[].pnl - profit/loss for this bet (payout - amount)
   * @param {string|null} bets[].result - 'WIN','LOSS','PUSH', or null if unsettled
   * @param {string} bets[].status - 'OPEN','SETTLED'
   * @param {number} [bets[].edge] - edge at time of bet (0-1)
   * @param {number} [bets[].odds] - decimal odds at time of bet
   * @param {number} [bets[].closingOdds] - closing/final decimal odds
   * @param {number} [bets[].amount] - bet amount
   * @returns {Object} summary
   */
  function computeBankrollSummary(currentBalance, startingBankroll, bets) {
    var settled = bets.filter(function (b) { return b.status === 'SETTLED'; });
    var open    = bets.filter(function (b) { return b.status === 'OPEN'; });

    var wins   = settled.filter(function (b) { return b.result === 'WIN'; }).length;
    var losses = settled.filter(function (b) { return b.result === 'LOSS'; }).length;
    var pushes = settled.filter(function (b) { return b.result === 'PUSH'; }).length;

    var totalPnl = currentBalance - startingBankroll;
    var roi = startingBankroll > 0 ? (totalPnl / startingBankroll) * 100 : 0;
    var winRate = settled.length > 0 ? (wins / settled.length) * 100 : 0;

    // Average edge
    var edgeBets = settled.filter(function (b) { return b.edge != null; });
    var avgEdge = edgeBets.length > 0
      ? edgeBets.reduce(function (s, b) { return s + b.edge; }, 0) / edgeBets.length * 100
      : 0;

    // Average odds
    var oddsBets = settled.filter(function (b) { return b.odds != null && b.odds > 0; });
    var avgOdds = oddsBets.length > 0
      ? oddsBets.reduce(function (s, b) { return s + b.odds; }, 0) / oddsBets.length
      : 0;

    // Max drawdown — walk through settled bets chronologically
    var peak = startingBankroll;
    var maxDrawdown = 0;
    var maxDrawdownPct = 0;
    var runningBalance = startingBankroll;
    for (var i = 0; i < settled.length; i++) {
      runningBalance += (settled[i].pnl || 0);
      if (runningBalance > peak) peak = runningBalance;
      var dd = peak - runningBalance;
      var ddPct = peak > 0 ? (dd / peak) * 100 : 0;
      if (dd > maxDrawdown) {
        maxDrawdown = dd;
        maxDrawdownPct = ddPct;
      }
    }

    // Current streak
    var currentStreak = 0;
    var streakType = 'none';
    for (var j = settled.length - 1; j >= 0; j--) {
      var r = settled[j].result;
      if (currentStreak === 0) {
        if (r === 'WIN')  { streakType = 'W'; currentStreak = 1; }
        else if (r === 'LOSS') { streakType = 'L'; currentStreak = 1; }
        else break;
      } else if (r === 'WIN' && streakType === 'W') currentStreak++;
      else if (r === 'LOSS' && streakType === 'L') currentStreak++;
      else break;
    }

    // CLV average
    var clvBets = settled.filter(function (b) { return b.closingOdds != null && b.odds != null; });
    var clvAvg = 0;
    if (clvBets.length > 0) {
      clvAvg = clvBets.reduce(function (s, b) {
        return s + computeCLV(b.odds, b.closingOdds);
      }, 0) / clvBets.length * 100;
    }

    // Total wagered
    var totalWagered = settled.reduce(function (s, b) { return s + (b.amount || 0); }, 0);

    return {
      current: currentBalance,
      starting: startingBankroll,
      totalPnl: totalPnl,
      roi: roi,
      winRate: winRate,
      wins: wins,
      losses: losses,
      pushes: pushes,
      totalBets: bets.length,
      openBets: open.length,
      settledBets: settled.length,
      totalWagered: totalWagered,
      avgEdge: avgEdge,
      avgOdds: avgOdds,
      maxDrawdown: maxDrawdown,
      maxDrawdownPct: maxDrawdownPct,
      currentStreak: currentStreak,
      streakType: streakType,
      clvAvg: clvAvg
    };
  }

  /**
   * Compute drawdown from day-level history (for multi-day charts)
   * @param {Array} dayHistory - [{bankroll, net, wagered, ...}]
   * @param {number} startingBankroll
   * @returns {{maxDrawdown, maxDrawdownPct, peak}}
   */
  function computeDayDrawdown(dayHistory, startingBankroll) {
    var peak = startingBankroll;
    var maxDrawdown = 0;
    var maxDrawdownPct = 0;
    for (var i = 0; i < dayHistory.length; i++) {
      var bal = dayHistory[i].bankroll || 0;
      if (bal > peak) peak = bal;
      var dd = peak - bal;
      var ddPct = peak > 0 ? (dd / peak) * 100 : 0;
      if (dd > maxDrawdown) {
        maxDrawdown = dd;
        maxDrawdownPct = ddPct;
      }
    }
    return { maxDrawdown: maxDrawdown, maxDrawdownPct: maxDrawdownPct, peak: peak };
  }

  // ── Public API ───────────────────────────────────────────────

  return {
    // Odds conversion
    mlToDecimal: mlToDecimal,
    decimalToImplied: decimalToImplied,
    impliedToDecimal: impliedToDecimal,
    americanToDecimal: americanToDecimal,
    decimalToAmerican: decimalToAmerican,

    // Kelly criterion
    fullKelly: fullKelly,
    fractionalKelly: fractionalKelly,
    parallelKelly: parallelKelly,
    recommendedStake: recommendedStake,

    // Edge detection
    computeEdge: computeEdge,
    expectedValue: expectedValue,

    // CLV
    computeCLV: computeCLV,

    // Bankroll analytics
    computeBankrollSummary: computeBankrollSummary,
    computeDayDrawdown: computeDayDrawdown
  };

})();

// Export for Node.js / ES module environments (RallyIQ)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BettingCore;
}
