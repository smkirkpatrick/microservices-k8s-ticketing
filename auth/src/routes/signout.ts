import express from 'express';

const router = express.Router();

router.get('/api/users/signout', (req, res) => {
  console.log('See ya!!');
  res.send('See ya!');
});

export { router as signoutRouter };
