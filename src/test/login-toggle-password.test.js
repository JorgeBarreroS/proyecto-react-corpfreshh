import { render, screen, fireEvent } from "@testing-library/react";
import Login from "../pages/Login";
import { AuthProvider } from "../services/AuthContext";
import { BrowserRouter } from "react-router-dom";

// Mock de Google Login
jest.mock("@react-oauth/google", () => ({
  GoogleOAuthProvider: ({ children }) => <div>{children}</div>,
  GoogleLogin: () => <div>Google Login</div>,
}));

test("muestra y oculta la contraseña al marcar checkbox", () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );

  const inputPassword = screen.getByLabelText(/contraseña/i);
  const checkbox = screen.getByRole("checkbox");

  expect(inputPassword.type).toBe("password");

  fireEvent.click(checkbox);
  expect(inputPassword.type).toBe("text");

  fireEvent.click(checkbox);
  expect(inputPassword.type).toBe("password");
});
