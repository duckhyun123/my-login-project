const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 회원가입
router.post('/signup', async (req, res) => {
  const { username, password, name } = req.body;

  try {
    // 중복 사용자 확인
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: '이미 존재하는 아이디입니다.' });
    }

    // 새 사용자 생성
    const newUser = new User({ username, password, name });
    await newUser.save();

    res.status(201).json({ message: '회원가입 성공' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    }

    // 세션에 사용자 정보 저장
    req.session.user = {
      id: user._id,
      name: user.name,
      isAdmin: user.isAdmin,
    };

    res.status(200).json({ message: '로그인 성공', user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 로그아웃
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.status(200).json({ message: '로그아웃 완료' });
  });
});

// auth.js

router.get('/me', (req, res) => {
    if (req.session.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ message: '로그인이 필요합니다.' });
    }
  });
  

module.exports = router;
