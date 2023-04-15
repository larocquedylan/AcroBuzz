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
exports.VoteResolver = void 0;
const type_graphql_1 = require("type-graphql");
const vote_1 = require("../types/vote");
let VoteResolver = class VoteResolver {
    async vote(postId, voteValue, { req, prisma }) {
        if (!req.session.userId) {
            throw new Error('Not authenticated');
        }
        if (voteValue !== 1 && voteValue !== -1) {
            throw new Error('Invalid vote value, must be 1 or -1');
        }
        const userId = req.session.userId;
        const userVotes = await prisma.votes.findMany({
            where: {
                postId,
                userId,
            },
        });
        const voteSum = userVotes.reduce((sum, vote) => sum + vote.voteValue, 0);
        if (voteSum + voteValue > 2 || voteSum + voteValue < -2) {
            throw new Error('The sum of your votes cannot be outside of +/- 2');
        }
        const newVote = await prisma.votes.create({
            data: {
                voteValue,
                postId,
                userId,
            },
            include: {
                post: true,
                user: true,
            },
        });
        await prisma.post.update({
            where: { id: postId },
            data: {
                totalPoints: {
                    increment: voteValue,
                },
            },
        });
        return newVote;
    }
};
__decorate([
    (0, type_graphql_1.Mutation)(() => vote_1.VoteType),
    __param(0, (0, type_graphql_1.Arg)('postId', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('voteValue', () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], VoteResolver.prototype, "vote", null);
VoteResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], VoteResolver);
exports.VoteResolver = VoteResolver;
//# sourceMappingURL=voter.js.map