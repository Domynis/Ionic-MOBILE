import http from 'http';
import Koa from 'koa';
import WebSocket from 'ws';
import Router from 'koa-router';
import bodyParser from "koa-bodyparser";
import jwt from 'koa-jwt';
import cors from '@koa/cors';
import { jwtConfig, timingLogger, exceptionHandler } from './utils.js';
import { initWss } from './wss.js';
import { iceCreamRouter } from './icecream.js';
import { authRouter } from './auth.js';
import { pingRouter } from './ping.js';

const app = new Koa();
const server = http.createServer(app.callback());
const wss = new WebSocket.Server({ server });
initWss(wss);

app.use(cors());
app.use(bodyParser());
app.use(timingLogger);
app.use(exceptionHandler);

const prefix = "/api";

const publicApiRouter = new Router({ prefix });
publicApiRouter
    .use('/auth', authRouter.routes())
    .use('/ping', pingRouter.routes());
app
    .use(publicApiRouter.routes())
    .use(publicApiRouter.allowedMethods());

app.use(jwt(jwtConfig));

const protectedApiRouter = new Router({ prefix });
protectedApiRouter
    .use('/icecreams', iceCreamRouter.routes());
app
    .use(protectedApiRouter.routes())
    .use(protectedApiRouter.allowedMethods())


server.listen(3000);
console.log("Server listening on port 3000");



