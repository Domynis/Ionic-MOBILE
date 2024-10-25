const Koa = require('koa');
const app = new Koa();
const server = require('http').createServer(app.callback());
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
const Router = require('koa-router');
const cors = require('koa-cors');
const bodyparser = require('koa-bodyparser');

app.use(bodyparser());
app.use(cors());
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} ${ctx.response.status} - ${ms}ms`);
});

app.use(async (ctx, next) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  await next();
});

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.response.body = { message: err.message || 'Unexpected error' };
    ctx.response.status = 500;
  }
});

class IceCream {
  constructor({ id, name, description}) {
    this.id = id;
    this.name = name;
    this.description = description
  }
}

const icecreams = [
  { id: "1", name: "Chocolate", description: "Our chocolate ice cream is rich, creamy, and deeply chocolaty." },
  { id: "2", name: "Vanilla", description: "Our vanilla ice cream is rich, creamy, and deeply vanillary." },
  { id: "3", name: "Strawberry", description: "Our strawberry ice cream is rich, creamy, and deeply strawberry." }
];

let lastId = icecreams[icecreams.length - 1].id;

const broadcast = data =>
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });

const router = new Router();

router.get('/icecreams', ctx => {
  ctx.response.body = icecreams;
  ctx.response.status = 200;
});

router.get('/icecreams/:id', async (ctx) => {
  const itemId = ctx.request.params.id;
  const item = icecreams.find(item => itemId === item.id);
  if (item) {
    ctx.response.body = item;
    ctx.response.status = 200; // ok
  } else {
    ctx.response.body = { message: `item with id ${itemId} not found` };
    ctx.response.status = 404; // NOT FOUND (if you know the resource was deleted, then return 410 GONE)
  }
});

const createItem = async (ctx) => {
  const item = ctx.request.body;
  if (!item.name) { // validation
    ctx.response.body = { message: 'Text is missing' };
    ctx.response.status = 400; //  BAD REQUEST
    return;
  }
  item.id = `${parseInt(lastId) + 1}`;
  lastId = item.id;
  item.description = item.description || "description " + item.id;
  icecreams.push(item);
  ctx.response.body = item;
  ctx.response.status = 201; // CREATED
  broadcast({ event: 'created', payload: { item } });
};

router.post('/icecreams', async (ctx) => {
  await createItem(ctx);
});

router.put('/icecreams/:id', async (ctx) => {
  const id = ctx.params.id;
  const item = ctx.request.body;
  const itemId = item.id;
  if (itemId && id !== item.id) {
    ctx.response.body = { message: `Param id and body id should be the same` };
    ctx.response.status = 400; // BAD REQUEST
    return;
  }
  if (!itemId) {
    await createItem(ctx);
    return;
  }
  const index = icecreams.findIndex(item => item.id === id);
  if (index === -1) {
    ctx.response.body = { message: `item with id ${id} not found` };
    ctx.response.status = 400; // BAD REQUEST
    return;
  }
  icecreams[index] = item;
  ctx.response.body = item;
  ctx.response.status = 200; // OK
  broadcast({ event: 'updated', payload: { item } });
});

router.del('/icecreams/:id', ctx => {
  const id = ctx.params.id;
  const index = icecreams.findIndex(item => id === item.id);
  if (index !== -1) {
    const item = icecreams[index];
    icecreams.splice(index, 1);
    broadcast({ event: 'deleted', payload: { item } });
  }
  ctx.response.status = 204; // no content
});

setInterval(() => {
  lastId = `${parseInt(lastId) + 1}`;
  const item = new IceCream({ id: lastId, name: `icecream ${lastId}`, description: `description ${lastId}` });
  icecreams.push(item);
  console.log(`New icecream: ${item.name}`);
  broadcast({ event: 'created', payload: { item } });
}, 5000);

app.use(router.routes());
app.use(router.allowedMethods());

server.listen(3000);
