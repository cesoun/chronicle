import { JwtPayload } from 'jsonwebtoken';
import passport from 'passport';
import jsonwebtoken from 'jsonwebtoken'

import { VerifiedCallback, Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { IUser } from '../models/user';

let opts: StrategyOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.JWT_SECRET || 'secret',
	issuer: process.env.JWT_ISSUER || 'accounts.chronicle.dev',
	// audience: process.env.JWT_AUDIENCE || 'localhost:3000'
};

passport.use(
	new Strategy(opts, (jwt_payload: JwtPayload, done: VerifiedCallback) => {
		console.log('TODO: JWTStrategy Middleware');
		console.log(jwt_payload);

		let err = new Error('Unimplemented Middleware');

		if (!jwt_payload) {
			return done(err, null);
		}

		return done(null, { username: 'username', password: 'password' });
	})
);

export function generateToken(user: IUser): string {
	const payload = {
		iss: opts.issuer,
		sub: user.username
	}

	return jsonwebtoken.sign(payload, opts.secretOrKey!, {expiresIn: '10h'})
}
