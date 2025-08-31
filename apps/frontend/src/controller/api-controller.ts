import { domainUseCases, type UseCaseName } from "app-domain";

export async function api(
  useCaseName: UseCaseName,
  payload?: Record<string, unknown>
) {
  try {
    let response = await fetch(`http://localhost:3000/${useCaseName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload ? JSON.stringify(payload) : null,
    });

    return await response.json();
  } catch (e) {
    console.log(e);
    return new Error();
  }
}
