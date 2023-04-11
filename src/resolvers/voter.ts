import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';
import { VoteType } from '../types/vote';
import { myContext } from '../types';

@Resolver()
export class VoteResolver {
  @Mutation(() => VoteType)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('voteType', () => String) voteType: string,
    @Ctx() { req, prisma }: myContext
  ): Promise<VoteType | null> {
    // Ensure user is logged in
    if (!req.session.userId) {
      throw new Error('Not authenticated');
    }

    const userId = req.session.userId;

    // Fetch existing votes by the user for the post
    const userVotes = await prisma.votes.findMany({
      where: {
        postId,
        userId,
      },
    });

    // Check if the user has already voted twice for the same type
    const sameTypeVotes = userVotes.filter(
      (vote) => vote.voteType === voteType
    );
    if (sameTypeVotes.length >= 2) {
      throw new Error(`Cannot ${voteType} more than twice`);
    }

    // Create a new vote
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
}
