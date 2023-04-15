import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';
import { VoteType } from '../types/vote';
import { myContext } from '../types';

@Resolver()
export class VoteResolver {
  @Mutation(() => VoteType)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('voteValue', () => Int) voteValue: number,
    @Ctx() { req, prisma }: myContext
  ): Promise<VoteType | null> {
    // Ensure user is logged in
    if (!req.session.userId) {
      throw new Error('Not authenticated');
    }

    if (voteValue !== 1 && voteValue !== -1) {
      throw new Error('Invalid vote value, must be 1 or -1');
    }

    const userId = req.session.userId;

    // Fetch existing votes by the user for the post
    const userVotes = await prisma.votes.findMany({
      where: {
        postId,
        userId,
      },
    });

    // Calculate the sum of the user's votes on the post
    const voteSum = userVotes.reduce((sum, vote) => sum + vote.voteValue, 0);

    // Check if the new vote would exceed the limit of +/- 2
    if (voteSum + voteValue > 2 || voteSum + voteValue < -2) {
      throw new Error('The sum of your votes cannot be outside of +/- 2');
    }

    // Create a new vote
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

    // Update the post's total points
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
}
