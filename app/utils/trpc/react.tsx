import SuperJSON from 'superjson'
import { useState } from 'react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink, loggerLink, TRPCClientError, type TRPCLink } from '@trpc/client'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import { observable } from '@trpc/server/observable';

import type { AppRouter } from '@/server/main'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000
      }
    }
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return window.location.origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

const errorHandlingLink: TRPCLink<AppRouter> = () => {
  return ({ next, op }) => {
    console.log('tRPC 操作开始:', op.path);
    return observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next(value: any) {
          console.log('tRPC 操作成功:', op.path);
          observer.next(value);
        },
        error(err: any) {
          console.log('tRPC 操作出错:', op.path, err);
          if (err instanceof TRPCClientError) {
            const trpcError = err as TRPCClientError<AppRouter>;
            console.error(`tRPC 操作 '${op.path}' 发生错误:`, trpcError.message);
            console.error('错误代码:', trpcError.data?.code);

            switch (trpcError.data?.code) {
              case 'UNAUTHORIZED':
                console.warn('检测到未认证错误，可能需要重定向到登录页面。');
                // 示例：window.location.href = '/login';
                break;
              case 'FORBIDDEN':
                console.warn('检测到权限不足错误，用户无权访问此资源。');
                break;
              case 'BAD_REQUEST':
                console.warn('检测到无效请求错误，请检查输入。');
                break;
              case 'NOT_FOUND':
                console.warn('请求的资源未找到。');
                break;
              case 'INTERNAL_SERVER_ERROR':
                console.error('服务器内部错误，请联系管理员。');
                break;
              default:
                console.error('未知 tRPC 错误类型。');
            }
          } else {
            console.error(`tRPC 操作 '${op.path}' 发生非 TRPCError 错误:`, err);
          }

          observer.error(err);
        },
        complete() {
          console.log('tRPC 操作完成:', op.path);
          observer.complete();
        },
      });

      return unsubscribe;
    });
  };
};

const links = [
  loggerLink({
    enabled: (op) =>
      process.env.NODE_ENV === 'development' ||
      (op.direction === 'down' && op.result instanceof Error)
  }),
  errorHandlingLink,
  httpBatchLink({
    transformer: SuperJSON,
    url: getBaseUrl() + '/api/trpc',
    headers() {
      const headers = new Headers()
      headers.set('x-trpc-source', 'react')
      return headers
    }
  })
]

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  )
}

export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>