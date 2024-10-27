export const jwtConfig = { secret: "secretissimo", expiresIn: 60*60*60 };

export const exceptionHandler = async (ctx, next) => {
    try {
        return await next();
    } catch (error) {
        console.log(error);
        ctx.body = { message: error.message };
        ctx.status = error.status || 500;
    }
};

export const timingLogger = async (ctx, next) => {
    const start = new Date();
    await next();
    console.log(`${ctx.method} ${ctx.url} ${ctx.response.status} - ${Date.now() - start}ms`);
}