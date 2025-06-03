import { TRPCError, type TRPCRouterRecord } from '@trpc/server'

import { publicProcedure } from '@/server/trpc'

export const greetingRouter = {
  hello: publicProcedure.query(() => {
    // throw new TRPCError({
    //   code: 'INTERNAL_SERVER_ERROR',
    //   message: 'An unexpected error occurred, please try again later.',
    //   // optional: pass the original error to retain stack trace
    //   cause: new Error('test'),
    // });
    return 'Hello World!'
  })
} satisfies TRPCRouterRecord