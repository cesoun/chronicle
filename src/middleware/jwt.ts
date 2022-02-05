import { JwtPayload } from 'jsonwebtoken';
import passport from 'passport';
import jsonwebtoken from 'jsonwebtoken';
import {
	VerifiedCallback,
	Strategy,
	ExtractJwt,
	StrategyOptions,
} from 'passport-jwt';
import { repo } from '../repository/sql';
import { IUser } from '../models/user';

let opts: StrategyOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.JWT_SECRET || 'secret',
	issuer: process.env.JWT_ISSUER || 'accounts.chronicle.dev',
	// audience: process.env.JWT_AUDIENCE || 'localhost:3000'
};

passport.use(
	new Strategy(opts, (jwt_payload: JwtPayload, done: VerifiedCallback) => {
		let user: IUser = {
			username: jwt_payload.sub,
		};

		repo.getUserByUsername(user)
			.then((uqr) => {
				if (uqr.error) {
					return done(uqr, false);
				}

				return done(null, uqr.user);
			})
			.catch((ex) => {
				console.error(ex, 'jwt_payload');
				return done(null, false);
			});
	})
);

export function generateToken(username: string): string {
	const payload = {
		iss: opts.issuer,
		sub: username,
	};

	return jsonwebtoken.sign(payload, opts.secretOrKey!, { expiresIn: '10h' });
}
