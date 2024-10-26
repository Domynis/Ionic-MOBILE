import Router from 'koa-router';
import jwt from 'jsonwebtoken';
import dataStore from "nedb-promise";
import { jwtConfig } from './utils.js';

export class UserStore {
    constructor({ filename, autoload }) {
        this.store = new dataStore({ filename, autoload });
    }

    async findOne(props) {
        return this.store.findOne(props);
    }

    async insert(user) {
        return this.store.insert(user);
    }
}

const userStore = new UserStore({ filename: "./db/users.json", autoload: true });

const createToken = (user) => {
    return jwt.sign({ username: user.username, _id: user._id }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
};

export const authRouter = new Router();

authRouter.post('/signup', async (ctx) => {
    try {
        const user = ctx.request.body;
        await userStore.insert(user);
        ctx.response.body = { token: createToken(user) };
        ctx.response.status = 201; // CREATED
    } catch (error) {
        ctx.response.body = { message: error.message };
        ctx.response.status = 400; // BAD REQUEST
    }
});

authRouter.post('/login', async (ctx) => {
    const credentials = ctx.request.body;
    const user = await userStore.findOne({ username: credentials.username });
    if (user && user.password === credentials.password) {
        ctx.response.body = { token: createToken(user) };
        ctx.response.status = 200; // OK
    } else {
        ctx.response.body = { message: 'Invalid username or password' };
        ctx.response.status = 401; // UNAUTHORIZED
    }
});