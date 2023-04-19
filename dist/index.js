"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const client_1 = require("@prisma/client");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
require("dotenv-safe/config");
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const consts_1 = require("./consts");
const hello_1 = require("./resolvers/hello");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const voter_1 = require("./resolvers/voter");
const express_session_1 = __importDefault(require("express-session"));
dotenv.config();
const main = async () => {
    const prisma = new client_1.PrismaClient();
    console.log('Connected to the PostgreSQL database');
    const app = (0, express_1.default)();
    app.get('/', (_, res) => {
        res.send('hello');
    });
    const apolloServer = new server_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [hello_1.HelloResolver, post_1.PostResolver, user_1.UserResolver, voter_1.VoteResolver],
            validate: false,
        }),
    });
    await apolloServer.start();
    app.use((0, cors_1.default)({
        origin: ['http://localhost:3000'],
        credentials: true,
    }), body_parser_1.default.json(), (0, express_session_1.default)({
        name: consts_1.COOKIE_NAME,
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
        context: async ({ req, res }) => {
            const session = req.session;
            return {
                prisma,
                req: req,
                res,
            };
        },
    }));
    app.listen(parseInt(process.env.PORT), () => {
        console.log('Server started on localhost:4000');
    });
};
main().catch((err) => {
    console.error(err);
});
//# sourceMappingURL=index.js.map