import { render, screen } from "@testing-library/react";
import Login from "../pages/Login";
import { AuthProvider } from "../services/AuthContext";
import { BrowserRouter } from "react-router-dom";

// Mock de Google Login
jest.mock("@react-oauth/google", () => ({
  GoogleOAuthProvider: ({ children }) => <div>{children}</div>,
  GoogleLogin: () => <div>Google Login</div>,
}));

test("renderiza los campos de email y contraseña", () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );

  const emailInput = screen.getByLabelText(/correo electrónico/i);
  const passwordInput = screen.getByLabelText(/contraseña/i);

  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
});
