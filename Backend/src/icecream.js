import Router from 'koa-router';
import dataStore from 'nedb-promise';
import { broadcast } from './wss.js';

export class IceCreamStore {
    constructor({ filename, autoload }) {
        this.store = new dataStore({ filename, autoload });
    }

    async find(props) {
        return this.store.find(props);
    }

    async findOne(props) {
        return this.store.findOne(props);
    }

    async insert(icecream) {
        if (!icecream.name || !icecream.description) {
            throw new Error('Missing name or description');
        }
        return this.store.insert(icecream);
    }

    async update(props, icecream) {
        return this.store.update(props, icecream);
    }

    async remove(props) {
        return this.store.remove(props);
    }
}

const iceCreamStore = new IceCreamStore({ filename: './db/icecreams.json', autoload: true });

export const iceCreamRouter = new Router();

iceCreamRouter.get('/', async (ctx) => {
    const userId = ctx.state.user._id;
    ctx.response.body = await iceCreamStore.find({ userId });
    ctx.response.status = 200;
});

iceCreamRouter.get('/:id', async (ctx) => {
    const userId = ctx.state.user._id;
    const iceCream = await iceCreamStore.findOne({ _id: ctx.params.id });

    if (iceCream) {
        if (iceCream.userId !== userId) {
            ctx.response.status = 403;
        } else {
            ctx.response.body = iceCream;
            ctx.response.status = 200;
        }
    } else {
        ctx.response.status = 404;
    }
});

const createIceCream = async (ctx, iceCream, response) => {
    try {
        console.log("createIceCream ", iceCream);
        const userId = ctx.state.user._id;
        iceCream.userId = userId;
        response.body = await iceCreamStore.insert(iceCream);
        response.status = 201;
        broadcast(userId, { event: 'created', payload: iceCream });
    } catch (error) {
        response.body = { message: error.message };
        response.status = 400;
    }
};

iceCreamRouter.post('/', async (ctx) => {
    await createIceCream(ctx, ctx.request.body, ctx.response);
});

iceCreamRouter.put('/:id', async (ctx) => {
    const iceCream = ctx.request.body;
    const id = ctx.params.id;
    const iceCreamId = iceCream._id;
    const response = ctx.response;

    if (iceCreamId && id !== iceCreamId) {
        response.body = { message: 'Param id and body id should be the same' };
        response.status = 400;
        return;
    }

    if (!iceCreamId) {
        await createIceCream(ctx, iceCream, response);
        return;
    } else {
        const userId = ctx.state.user._id;
        iceCream.userId = userId;
        const updatedCount = await iceCreamStore.update({ _id: id }, iceCream);
        if (updatedCount === 1) {
            console.log("updated iceCream", iceCream);
            broadcast(userId, { event: 'updated', payload: iceCream });
            response.status = 200;
            response.body = iceCream;
        } else {
            response.body = { message: `No iceCream with id ${id} found` };
            response.status = 405;
        }
    }
});

iceCreamRouter.del('/:id', async (ctx) => {
    const userId = ctx.state.user._id;
    const id = ctx.params.id;
    const iceCream = await iceCreamStore.findOne({ _id: id });

    if (iceCream && id === iceCream._id) {
        if (iceCream.userId !== userId) {
            ctx.response.status = 403;
        } else {
            await iceCreamStore.remove({ _id: id });
            broadcast(userId, { event: 'deleted', payload: iceCream });
            ctx.response.status = 204;
        }
    } else {
        ctx.response.status = 404;
    }
});