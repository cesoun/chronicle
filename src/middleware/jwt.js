const passport = require('passport');
const jsonwebtoken = require('jsonwebtoken');

const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

let opts = {};

opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET || 'secret';
opts.issuer = process.env.JWT_ISSUER || 'accounts.chronicle.dev';

// Audience requires a domain check
// opts.audience = process.env.JWT_AUDIENCE || 'localhost:3000';

passport.use(
	new JWTStrategy(opts, (jwt_payload, done) => {
		console.log('TODO: JWTStrategy Middleware');
		console.log(jwt_payload);

		let err = new Error('Unimplemented Middleware');

		if (!jwt_payload) {
			return done(err, null);
		}

		return done(null, { username: 'username', password: 'password' });
	})
);

module.exports = {
	generateToken: (user) => {
		const payload = {
			iss: opts.issuer,
			sub: user.username,
		};

		return jsonwebtoken.sign(payload, opts.secretOrKey, {
			expiresIn: '10h',
		});
	},
};
