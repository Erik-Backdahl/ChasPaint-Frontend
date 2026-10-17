import { BASE } from "./CanvasService";

interface LoginInfo {
  email: string,
  password: string
}

interface RegisterInfo{
  email: string,
  username: string,
  password: string,

}
async function request(path: string, method: string, body?: LoginInfo | RegisterInfo): Promise<Response> {
  try {
    return await fetch(`${BASE}${path}`, {
      method: method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: body != null ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error("Couldn't reach server");
  }
}



export async function login(email: string, password: string): Promise<void> {
  const res = await request("/login?useCookies=true", "POST", { email, password });

  if (!res.ok)
    throw new Error("Wrong email or password");
}

export async function register(email: string, username: string, password: string): Promise<void> {
  const res = await request("/account/register", "POST", { email, username, password });

  if (!res.ok)
    throw new Error("Unable to create account");
}

export async function getCurrentUser(): Promise<{ email: string } | null> {
  const res = await request("/manage/info", "GET");

  if (res.ok)
    return res.json()
  else
    return null;

}

export async function logout(): Promise<void> {
  await request("/account/logout", "POST");
}