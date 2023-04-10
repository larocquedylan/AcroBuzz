"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.myDataSource = void 0;
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
exports.myDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    database: 'acrobuzz2',
    url: process.env.DATABASE_URL,
    host: 'localhost',
    port: 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    synchronize: true,
    logging: true,
    entities: [Post_1.Post, User_1.User],
    migrations: {
        path: path_1.default.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
});
//# sourceMappingURL=data-source.js.map