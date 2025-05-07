const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// 댓글 등록
router.post('/', async (req, res) => {
  const user = req.session.user;
  if (!user) return res.status(401).json({ message: '로그인이 필요합니다.' });

  const { postId, content } = req.body;
  if (!postId || !content) {
    return res.status(400).json({ message: 'postId와 content가 필요합니다.' });
  }

  try {
    const comment = new Comment({
      postId,
      content,
      authorId: user.id,
      authorName: user.name,
    });
    await comment.save();
    res.status(201).json({ message: '댓글 등록 완료' });
  } catch (err) {
    console.error('❌ 댓글 등록 실패:', err);
    res.status(500).json({ message: '댓글 등록 실패' });
  }
});

// 댓글 목록 조회
router.get('/', async (req, res) => {
  const { postId } = req.query;
  if (!postId) return res.status(400).json({ message: 'postId가 필요합니다.' });

  try {
    const comments = await Comment.find({ postId }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    console.error('❌ 댓글 조회 실패:', err);
    res.status(500).json({ message: '댓글 조회 실패' });
  }
});

// 댓글 수정 (작성자만 가능)
router.put('/:id', async (req, res) => {
  const user = req.session.user;
  if (!user) return res.status(401).json({ message: '로그인이 필요합니다.' });

  const { content } = req.body;
  if (!content) return res.status(400).json({ message: '수정할 내용이 없습니다.' });

  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: '댓글이 존재하지 않습니다.' });

    if (comment.authorId !== user.id) {
      return res.status(403).json({ message: '수정 권한이 없습니다.' });
    }

    comment.content = content;
    await comment.save();
    res.json({ message: '댓글 수정 완료' });
  } catch (err) {
    console.error('❌ 댓글 수정 실패:', err);
    res.status(500).json({ message: '댓글 수정 실패' });
  }
});

// 댓글 삭제 (작성자 또는 관리자만 가능)
router.delete('/:id', async (req, res) => {
  const user = req.session.user;
  if (!user) return res.status(401).json({ message: '로그인이 필요합니다.' });

  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: '댓글이 존재하지 않습니다.' });

    if (comment.authorId !== user.id && !user.isAdmin) {
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: '댓글 삭제 완료' });
  } catch (err) {
    console.error('❌ 댓글 삭제 실패:', err);
    res.status(500).json({ message: '댓글 삭제 실패' });
  }
});

module.exports = router;
