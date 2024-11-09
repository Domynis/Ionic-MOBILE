import Router from 'koa-router';

export const pingRouter = new Router();

pingRouter.get('/', async (ctx) => {
    ctx.response.body = 'pong';
    ctx.response.status = 200;
});