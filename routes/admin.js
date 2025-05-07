const express = require('express');
const router = express.Router();

// 테스트용 라우트
router.get('/test', (req, res) => {
  res.send('admin 라우터 정상 작동!');
});

module.exports = router;
