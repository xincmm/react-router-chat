import type { TRPCRouterRecord } from '@trpc/server'

import { publicProcedure } from '@/server/trpc'

export const greetingRouter = {
  hello: publicProcedure.query(() => {
    return 'Hello World!'
  })
} satisfies TRPCRouterRecord