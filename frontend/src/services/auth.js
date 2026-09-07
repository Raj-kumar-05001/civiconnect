import api from "./api";

export async function register({ name, email, password }) {
  const { data } = await api.post("/auth/register", { name, email, password });
  return data.user;
}

export async function login({ email, password }) {
  const { data } = await api.post("/auth/login", { email, password });
  return data; // { session: { access_token, ... }, user }
}

export async function me() {
  const { data } = await api.get("/auth/me");
  return data.user;
}
