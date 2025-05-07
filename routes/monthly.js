const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

console.log('✅ monthly.js 라우터 로드됨');

router.get('/:yearMonth', async (req, res) => {
    const sessionUser = req.session.user;
    if (!sessionUser) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }
  
    try {
      const { yearMonth } = req.params;
      const start = new Date(`${yearMonth}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
  
      const filter = sessionUser.isAdmin
        ? {
            $or: [
              { 'deposits.date': { $gte: start.toISOString(), $lt: end.toISOString() } },
              { 'withdraws.date': { $gte: start.toISOString(), $lt: end.toISOString() } }
            ]
          }
        : {
            user: sessionUser.id,
            $or: [
              { 'deposits.date': { $gte: start.toISOString(), $lt: end.toISOString() } },
              { 'withdraws.date': { $gte: start.toISOString(), $lt: end.toISOString() } }
            ]
          };
  
      const customers = await Customer.find(filter);
      const dailySummary = {};
  
      for (const c of customers) {
        for (const d of c.deposits || []) {
          const date = d.date;
          if (date && date.startsWith(yearMonth)) {
            if (!dailySummary[date]) {
              dailySummary[date] = { income: 0, expense: 0, details: [] };
            }
            dailySummary[date].income += d.amount;
            dailySummary[date].details.push({ name: c.name, type: '입금', amount: d.amount });
          }
        }
  
        for (const w of c.withdraws || []) {
          const date = w.date;
          if (date && date.startsWith(yearMonth)) {
            if (!dailySummary[date]) {
              dailySummary[date] = { income: 0, expense: 0, details: [] };
            }
            dailySummary[date].expense += w.amount;
            dailySummary[date].details.push({ name: c.name, type: '출금', amount: w.amount });
          }
        }
      }
  
      res.json(dailySummary);
    } catch (err) {
      console.error('❌ 월별 데이터 처리 오류:', err);
      res.status(500).json({ message: '서버 오류' });
    }
  });
  

module.exports = router;
