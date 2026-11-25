import { env } from "@/config/env";
import { registerAuth } from "@/features/auth/setup";
import { installMockApi } from "@/mocks";

/**
 * Wires the API client once, when this module is first imported (by AppProviders),
 * so the very first query already carries the token and tenant headers.
 */
if (env.NEXT_PUBLIC_ENABLE_MOCK_API) {
  installMockApi();
}
registerAuth();
