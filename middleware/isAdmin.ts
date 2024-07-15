export default defineNuxtRouteMiddleware(async (to, from) => {
  const { data, status } = useAuth();
  if (status.value === "unauthenticated") {
    return navigateTo("/auth/signIn");
  }
  if (data.value?.user.role !== "admin") {
    return navigateTo("/");
  }
});
