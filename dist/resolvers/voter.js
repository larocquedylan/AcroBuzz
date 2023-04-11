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
    async vote(postId, voteType, { req, prisma }) {
        if (!req.session.userId) {
            throw new Error('Not authenticated');
        }
        const userId = req.session.userId;
        const userVotes = await prisma.votes.findMany({
            where: {
                postId,
                userId,
            },
        });
        const sameTypeVotes = userVotes.filter((vote) => vote.voteType === voteType);
        if (sameTypeVotes.length >= 2) {
            throw new Error(`Cannot ${voteType} more than twice`);
        }
        const newVote = await prisma.votes.create({
            data: {
                voteType,
                postId,
                userId,
            },
            include: {
                post: true,
                user: true,
            },
        });
        return newVote;
    }
};
__decorate([
    (0, type_graphql_1.Mutation)(() => vote_1.VoteType),
    __param(0, (0, type_graphql_1.Arg)('postId', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('voteType', () => String)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], VoteResolver.prototype, "vote", null);
VoteResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], VoteResolver);
exports.VoteResolver = VoteResolver;
//# sourceMappingURL=voter.js.map