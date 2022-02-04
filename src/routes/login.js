const express = require('express');
const router = express.Router();

// Middleware
const passport = require('passport');
const { generateToken } = require('../middleware/jwt');

/* POST /login */
router.post('/', async (req, res, next) => {
	const user = {
		username: 'username',
		password: 'password',
	};

	const token = generateToken(user);
	res.status(200).json({ token });
});

/* PUT /login */
router.put(
	'/',
	passport.authenticate('jwt', { session: false }),
	async (req, res, next) => {
		res.sendStatus(501);
	}
);

module.exports = router;
