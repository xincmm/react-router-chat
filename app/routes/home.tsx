import type { Route } from "./+types/home";
// import { Welcome } from "../welcome/welcome";
import { caller } from "@/utils/trpc/server";
import { useTRPC } from "@/utils/trpc/react";
import { useQuery } from "@tanstack/react-query";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader(LoaderArgs: Route.LoaderArgs) {
  const { context } = LoaderArgs;
  const api = await caller(LoaderArgs);

  try {
    const hello = await api.greeting.hello();
    console.log('Loader 调用成功:', hello);
  } catch (error) {
    console.error('Loader 错误捕获:', error);
  }
  
  return { message: context.VALUE_FROM_EXPRESS };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const trpc = useTRPC();
  const { refetch, data, error, isLoading } = useQuery({
    ...trpc.greeting.hello.queryOptions(),
    enabled: false,
  });

  const handleClientTRPCCall = async () => {
    console.log('触发客户端 tRPC 调用...');
    try {
      const result = await refetch();
      console.log('客户端调用成功:', result.data);
    } catch (error) {
      console.log('客户端调用失败:', error);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <div className="flex gap-4">
            <button 
              onClick={handleClientTRPCCall}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? '请求中...' : '测试客户端 tRPC 调用'}
            </button>
          </div>
          <div className="text-sm text-gray-600 min-h-[50px]">
            {error && <p className="text-red-500">错误: {error.message}</p>}
            {data && <p className="text-green-500">数据: {data}</p>}
          </div>
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            Welcome to <span className="sr-only">React Router</span>
          </h1>
        </header>
        {/* <Welcome message={loaderData.message} /> */}
      </div>
    </div>
  );
}
