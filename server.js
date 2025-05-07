// server.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 2. 세션 설정
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60,
  },
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

// 3. 라우터 연결
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');
const adminRoutes = require('./routes/admin');
const customerRoutes = require('./routes/customers');
const monthlyRoutes = require('./routes/monthly');
const performanceRoutes = require('./routes/performance');
const commentRouter = require('./routes/comment');

app.use('/auth', authRoutes);
app.use('/post', postRoutes); // ✅ '/api/post'가 아닌 '/post'
app.use('/admin', adminRoutes);
app.use('/api/monthly', monthlyRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/comment', commentRouter);

// 5. DB 연결
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB 연결 완료'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// 6. 서버 실행
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
