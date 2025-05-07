const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

console.log('✅ customers.js 라우터 로드됨');

router.use((req, res, next) => {
  console.log('📩 customers 라우터 요청:', req.method, req.url);
  next();
});

// ✅ 고객 등록 또는 수정
router.post('/', async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ message: '로그인이 필요합니다.' });

  const { name, joinDate, progress, account, deposits, withdraws } = req.body;
  if (!name || !joinDate) {
    return res.status(400).json({ message: '이름과 가입일은 필수입니다.' });
  }

  try {
    const existing = await Customer.findOne({ name, user: userId });

    if (existing) {
      existing.joinDate = joinDate;
      existing.progress = progress;
      existing.account = account;
      existing.deposits = deposits;
      existing.withdraws = withdraws;
      await existing.save();
      return res.status(200).json({ message: '고객 정보가 업데이트되었습니다.' });
    }

    const newCustomer = new Customer({
      name,
      joinDate,
      progress,
      account,
      deposits,
      withdraws,
      user: userId
    });
    await newCustomer.save();
    res.status(201).json({ message: '신규 고객이 등록되었습니다.' });
  } catch (err) {
    console.error('❌ 고객 저장 실패:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// ✅ 로그인한 사용자 기준으로 고객 목록 조회
router.get('/', async (req, res) => {
  const sessionUser = req.session.user;
  if (!sessionUser) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  try {
    const filter = sessionUser.isAdmin
      ? {} // 관리자면 전체 조회
      : { user: sessionUser.id }; // 일반 유저는 본인 것만 조회

    const customers = await Customer.find(filter).sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    console.error('❌ 고객 목록 불러오기 실패:', err);
    res.status(500).json({ message: '고객 목록 조회 실패' });
  }
});

// ✅ 고객 삭제
router.delete('/:name', async (req, res) => {
  const userId = req.session.user?.id;
  const isAdmin = req.session.user?.isAdmin;

  if (!userId) return res.status(401).json({ message: '로그인이 필요합니다.' });

  try {
    const filter = isAdmin ? { name: req.params.name } : { name: req.params.name, user: userId };
    const deleted = await Customer.findOneAndDelete(filter);

    if (!deleted) return res.status(404).json({ message: '해당 고객을 찾을 수 없습니다.' });

    res.json({ message: '고객 삭제 완료' });
  } catch (err) {
    console.error('❌ 고객 삭제 실패:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;
