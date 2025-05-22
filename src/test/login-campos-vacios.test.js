import { render, screen, fireEvent } from "@testing-library/react";
import Login from "../pages/Login";
import Swal from "sweetalert2";
import { AuthProvider } from "../services/AuthContext";
import { BrowserRouter } from "react-router-dom";

// Mock de SweetAlert
jest.mock("sweetalert2");

// Mock de Google Login
jest.mock("@react-oauth/google", () => ({
  GoogleOAuthProvider: ({ children }) => <div>{children}</div>,
  GoogleLogin: () => <div>Google Login</div>,
}));

test("muestra alerta si los campos están vacíos al enviar", async () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );

  const boton = screen.getByRole("button", { name: /iniciar sesión/i });
  fireEvent.click(boton);

  expect(Swal.fire).toHaveBeenCalledWith({
    icon: "error",
    title: "Campos vacíos",
    text: "Por favor, ingresa tus credenciales.",
    confirmButtonColor: "#3085d6",
  });
});
