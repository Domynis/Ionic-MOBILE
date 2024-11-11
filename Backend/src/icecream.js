import Router from 'koa-router';
import dataStore from 'nedb-promise';
import { broadcast } from './wss.js';
import { fileURLToPath } from 'url';
import { koaBody } from 'koa-body';
import fs from 'fs';
import path from 'path';

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
        if (!icecream.name) {
            throw new Error('Missing name');
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const myKoaBody = koaBody({
    multipart: true,
    formidable: {
        uploadDir: path.join(__dirname, 'uploads'),
        keepExtensions: true,
        onFileBegin: (name, file) => {
            if (file && file.originalFilename) {
                // Define a valid path where you want to store the uploaded file
                const uploadDir = path.join(__dirname, 'uploads');
                if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir); // Ensure directory exists

                file.filepath = path.join(uploadDir, file.originalFilename); // Set a path for the file
            } else {
                throw new Error("File path or filename is undefined");
            }
        }
    }
});

iceCreamRouter.post('/upload-photo/:id', myKoaBody, async (ctx) => {
    try {
        // console.log('Uploading photo for ice cream:', ctx.params.id);
        console.log('Uploaded files:', ctx.request.files);
        const file = ctx.request.files?.file;
        const iceCreamId = ctx.params.id;
        console.log('Uploaded file:', file);
        if (!file) {
            ctx.throw(400, 'No file uploaded');
        }

        const photoUrl = `http://localhost:3000/api/icecreams/images/${path.basename(file.filepath)}`;
        console.log('Uploaded file:', photoUrl);

        // Update the ice cream entity with the new photoUrl
        const iceCream = await iceCreamStore.findOne({ _id: iceCreamId });
        if (!iceCream) {
            ctx.throw(404, 'Ice cream not found');
        }

        iceCream.photoUrlBE = photoUrl;
        await iceCreamStore.update({ _id: iceCreamId }, iceCream);

        // Respond with the URL of the uploaded photo
        ctx.body = { photoUrl };
        ctx.status = 200;

        // Optionally, broadcast the updated ice cream data
        const userId = ctx.state.user._id;
        broadcast(userId, { event: 'updated', payload: iceCream });

    } catch (error) {
        ctx.status = 500;
        ctx.body = { message: 'Error uploading photo', error: error.message };
    }
});

iceCreamRouter.get('/images/:imageName', async (ctx) => {
    const { imageName } = ctx.params;  // Get the image name from the URL params
    const imagePath = path.join(__dirname, 'uploads', imageName);  // Path to the image in your uploads folder

    try {
        // Check if the file exists
        if (fs.existsSync(imagePath)) {
            // Set the appropriate headers for image serving
            ctx.type = path.extname(imageName);  // Set the file type (jpg, png, etc.)
            ctx.body = fs.createReadStream(imagePath);  // Stream the file to the response
        } else {
            // If the file is not found, send a 404 error
            ctx.status = 404;
            ctx.body = 'Image not found';
        }
    } catch (err) {
        // If there’s an error while reading the file
        ctx.status = 500;
        ctx.body = 'Server Error';
    }
});

iceCreamRouter.get('/', async (ctx) => {
    const userId = ctx.state.user._id;
    ctx.response.body = await iceCreamStore.find({ userId });
    ctx.response.status = 200;
});

// add an endpoint for a paginated list of icecreams (use query parameters for pagination)
iceCreamRouter.get('/list', async (ctx) => {
    console.log("userId ", ctx.state.user._id);
    const userId = ctx.state.user._id;
    const { page, pageSize } = ctx.request.query;
    const icecreams = await iceCreamStore.find({ userId });
    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const items = icecreams.slice(start, Math.min(end, icecreams.length))
    // console.log("getItemsPaged start end ", start, end);
    // console.log("getItemsPaged ", items);
    ctx.response.body = {
        items,
        hasNextPage: end < icecreams.length,
    }
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