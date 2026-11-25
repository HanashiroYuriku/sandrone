import { env } from "@/config/env";
import { authMockHandlers } from "@/features/auth/mock-handlers";
import { apiClient } from "@/lib/api-client";
import { createMockFetch, type MockHandler } from "@/mocks/mock-fetch";

/** Every feature's mock endpoints. Add a feature's handlers here to mock it. */
const handlers: MockHandler[] = [...authMockHandlers];

/** Routes the API client to the in-browser mock backend. */
export function installMockApi(): void {
  apiClient.configure({
    fetch: createMockFetch({ baseUrl: env.NEXT_PUBLIC_API_BASE_URL, handlers }),
  });
}
