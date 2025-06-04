export function isLoggedIn() {
  return localStorage.getItem("loggedIn") === "true";
}

export const logout = () => {
  localStorage.removeItem("loggedIn");
  window.location.href = "/login";
};