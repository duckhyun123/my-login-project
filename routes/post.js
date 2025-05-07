// routes/post.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// 게시글 전체 조회
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('❌ 게시글 조회 실패:', err);
    res.status(500).json({ message: '게시글 조회 실패' });
  }
});

// 게시글 작성
router.post('/', async (req, res) => {
  const user = req.session.user;
  if (!user) return res.status(401).json({ message: '로그인이 필요합니다.' });

  try {
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      authorId: user.id, // ✅ 수정된 부분
      authorName: user.name,
    });
    await post.save();
    res.status(201).json({ message: '게시글 등록 완료' });
  } catch (err) {
    console.error('❌ 게시글 등록 실패:', err);
    res.status(500).json({ message: '게시글 등록 실패' });
  }
});

// 게시글 상세 조회
router.get('/:id', async (req, res) => {
  console.log('📥 게시글 ID 요청됨:', req.params.id);

  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      console.warn('📛 게시글을 찾을 수 없습니다:', req.params.id);
      return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
    }

    console.log('✅ 게시글 데이터:', post);
    res.json({
      _id: post._id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      authorId: post.authorId, // ✅ 수정된 부분
      authorName: post.authorName
    });
  } catch (err) {
    console.error('❌ 게시글 상세 조회 실패:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 게시글 삭제
router.delete('/:id', async (req, res) => {
  const user = req.session.user;
  if (!user) return res.status(401).json({ message: '로그인이 필요합니다.' });

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });

    if (post.authorId.toString() !== user.id && !user.isAdmin) { // ✅ 수정된 부분
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: '삭제 완료' });
  } catch (err) {
    console.error('❌ 게시글 삭제 실패:', err);
    res.status(500).json({ message: '삭제 실패' });
  }
});

module.exports = router;
