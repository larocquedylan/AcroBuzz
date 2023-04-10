"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const myDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'your_username',
    password: process.env.DATABASE_PASSWORD,
    database: 'acrobuzz2',
    entities: [Post_1.Post, User_1.User],
    synchronize: true,
    logging: true,
    migrations: ['src/migrations/**/*.ts'],
    cli: {
        migrationsDir: 'src/migrations',
    },
});
exports.default = myDataSource;
//# sourceMappingURL=type-orm.config.js.map