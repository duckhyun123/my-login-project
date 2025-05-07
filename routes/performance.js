const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

console.log('✅ performance.js 라우터 로드됨');

// GET /api/performance/2025-05
router.get('/:yearMonth', async (req, res) => {
  const user = req.session.user;
  if (!user) return res.status(401).json({ message: '로그인이 필요합니다.' });

  const { yearMonth } = req.params;
  const start = new Date(`${yearMonth}-01`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  try {
    const filter = user.isAdmin ? {} : { user: user.id };
    const customers = await Customer.find(filter);

    const summary = {
      day1: 0,
      day2: 0,
      day3: 0,
      totalNet: 0
    };

    const customerResults = [];

    for (const customer of customers) {
      const joinMonth = customer.joinDate?.slice(0, 7);
      if (joinMonth !== yearMonth) continue;

      const totalDeposit = (customer.deposits || [])
        .filter(d => d.date && d.date.startsWith(yearMonth))
        .reduce((sum, d) => sum + (d.amount || 0), 0);

      const totalWithdraw = (customer.withdraws || [])
        .filter(w => w.date && w.date.startsWith(yearMonth))
        .reduce((sum, w) => sum + (w.amount || 0), 0);

      const net = totalDeposit - totalWithdraw;
      summary.totalNet += net;

      // 진행상황 통계
      switch (customer.progress) {
        case '1일차': summary.day1++; break;
        case '2일차': summary.day2++; break;
        case '3일차': summary.day3++; break;
      }

      customerResults.push({
        name: customer.name,
        totalDeposit,
        totalWithdraw,
        netProfit: net,
        progress: customer.progress || null  
      });
    }

    res.json({ summary, customers: customerResults });
  } catch (err) {
    console.error('❌ 실적 라우터 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;
