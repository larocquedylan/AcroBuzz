"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mikro-orm/core");
const consts_1 = require("./consts");
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const type_graphql_1 = require("type-graphql");
const hello_1 = require("./resolvers/hello");
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const express4_1 = require("@apollo/server/express4");
const post_1 = require("./resolvers/post");
require("reflect-metadata");
const user_1 = require("./resolvers/user");
const connect_redis_1 = __importDefault(require("connect-redis"));
const express_session_1 = __importDefault(require("express-session"));
const redis_1 = require("redis");
const main = async () => {
    const orm = await core_1.MikroORM.init(mikro_orm_config_1.default);
    console.log('Connected to the PostgreSQL database');
    await orm.getMigrator().up();
    await core_1.RequestContext.createAsync(orm.em, async () => {
        const app = (0, express_1.default)();
        let redisClient = (0, redis_1.createClient)();
        redisClient.connect().catch(console.error);
        let redisStore = new connect_redis_1.default({
            client: redisClient,
            prefix: 'myapp:',
            disableTouch: true,
        });
        app.get('/', (_, res) => {
            res.send('hello');
        });
        const apolloServer = new server_1.ApolloServer({
            schema: await (0, type_graphql_1.buildSchema)({
                resolvers: [hello_1.HelloResolver, post_1.PostResolver, user_1.UserResolver],
                validate: false,
            }),
        });
        await apolloServer.start();
        app.use((0, cors_1.default)({
            origin: ['http://localhost:3000'],
            credentials: true,
        }), body_parser_1.default.json(), (0, express_session_1.default)({
            store: redisStore,
            name: 'theglove',
            resave: false,
            saveUninitialized: false,
            secret: 'garypayton',
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 5,
                httpOnly: true,
                sameSite: 'lax',
                secure: consts_1.__prod__,
            },
        }), (0, express4_1.expressMiddleware)(apolloServer, {
            context: async ({ req, res }) => ({
                em: orm.em,
                req,
                res,
            }),
        }));
        app.listen(8080, () => {
            console.log('Server started on localhost:8080');
        });
    });
};
main().catch((err) => {
    console.error(err);
});
//# sourceMappingURL=index.js.map