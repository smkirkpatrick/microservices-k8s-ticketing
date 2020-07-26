import express from 'express';

const router = express.Router();

router.get('/api/users/signin', (req, res) => {
  console.log('Sign in there!!');
  res.send('Sign in there!');
});

export { router as signinRouter };
