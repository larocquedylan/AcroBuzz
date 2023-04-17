"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResolver = exports.PaginatedPosts = exports.PaginationInput = void 0;
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const isAuth_1 = require("../middleware/isAuth");
const post_1 = require("../types/post");
const class_validator_1 = require("class-validator");
let PaginationInput = class PaginationInput {
};
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], PaginationInput.prototype, "cursor", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true, defaultValue: 10 }),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], PaginationInput.prototype, "limit", void 0);
PaginationInput = __decorate([
    (0, type_graphql_1.InputType)()
], PaginationInput);
exports.PaginationInput = PaginationInput;
let PaginatedPosts = class PaginatedPosts {
};
__decorate([
    (0, type_graphql_1.Field)(() => [post_1.PostType]),
    __metadata("design:type", Array)
], PaginatedPosts.prototype, "posts", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], PaginatedPosts.prototype, "nextCursor", void 0);
PaginatedPosts = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedPosts);
exports.PaginatedPosts = PaginatedPosts;
let PostResolver = class PostResolver {
    textSnippet(root) {
        return root.text.slice(0, 100);
    }
    async posts({ cursor, limit }, { prisma }) {
        const take = Math.min(50, limit || 10);
        const skip = 0;
        const cursorOptions = cursor
            ? {
                createdAt: {
                    lt: new Date(parseInt(cursor)),
                },
            }
            : undefined;
        const posts = await prisma.post.findMany({
            where: cursorOptions,
            orderBy: {
                createdAt: 'desc',
            },
            include: { author: true },
            take: take + 1,
            skip,
        });
        const hasNextPage = posts.length > take;
        const edges = hasNextPage ? posts.slice(0, -1) : posts;
        return {
            posts: edges,
            nextCursor: hasNextPage
                ? String(posts[posts.length - 1].createdAt.getTime())
                : null,
        };
    }
    async post(id, { prisma }) {
        return await prisma.post.findUnique({
            where: { id },
            include: { author: true },
        });
    }
    async createPost(title, text, { prisma, req }) {
        const authorId = req.session.userId;
        return await prisma.post.create({
            data: { title, authorId, text },
            include: { author: true },
        });
    }
    async updatePost(id, title, { prisma }) {
        return await prisma.post.update({ where: { id }, data: { title } });
    }
    async deletePost(id, { req, prisma }) {
        const post = await prisma.post.findUnique({ where: { id } });
        if (!post) {
            console.log('no matching Id');
            return false;
        }
        if (post.authorId !== req.session.userId) {
            console.log('you can do that!');
            throw new Error('Not Authorized');
        }
        await prisma.votes.deleteMany({ where: { postId: id } });
        try {
            await prisma.post.delete({ where: { id } });
            console.log('delete successful');
            return true;
        }
        catch (error) {
            console.error('delete failed:', error);
            return false;
        }
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "textSnippet", null);
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedPosts),
    __param(0, (0, type_graphql_1.Arg)('input', () => PaginationInput)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PaginationInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    (0, type_graphql_1.Query)(() => post_1.PostType, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "post", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => post_1.PostType),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('title', () => String)),
    __param(1, (0, type_graphql_1.Arg)('text', () => String)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => post_1.PostType, { nullable: true }),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('title', () => String, { nullable: true })),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
PostResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => post_1.PostType)
], PostResolver);
exports.PostResolver = PostResolver;
//# sourceMappingURL=post.js.map