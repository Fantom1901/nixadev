import { AuthProvider } from "@refinedev/core";

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    // Вход мы обрабатываем прямо на странице /login,
    // но если Refine вызывает сам — отдаем успех
    return { success: true, redirectTo: "/admin" };
  },
  logout: async () => {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    return { success: true, redirectTo: "/login" };
  },
  check: async () => {
    // Клиентская проверка куки (или запрос к /me на бэк)
    const hasToken = document.cookie.includes("auth_token");
    if (hasToken) {
      return { authenticated: true };
    }
    return { authenticated: false, redirectTo: "/login" };
  },
  onError: async (error) => {
    if (error.status === 401 || error.status === 403) {
      return { logout: true, redirectTo: "/login" };
    }
    return { error };
  },
};