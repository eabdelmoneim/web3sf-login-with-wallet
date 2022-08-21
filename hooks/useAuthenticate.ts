import { useSDK } from "@thirdweb-dev/react";
import { deepStrictEqual } from "assert";

export default function useAuthenticate() {
  const domain = "thirdweb.com";
  const sdk = useSDK();

  async function login() {
    var d = new Date();
    d.setMinutes(d.getMinutes() + 30);

    var options = { expirationTime: d };
    const payload = await sdk?.auth.login(domain, options);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload }),
    });
  }

  async function authenticate() {
    const res = await fetch("/api/authenticate", {
      method: "POST",
    });
    return res;
  }

  async function logout() {
    await fetch("/api/logout", {
      method: "POST",
    });
  }

  return {
    login,
    authenticate,
    logout,
  };
}
