import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResetPassword from "../pages/ResetPassword";
import Swal from "sweetalert2";

// Mock de SweetAlert2
jest.mock("sweetalert2");

// Mock de fetch global
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
  Swal.fire.mockClear();
});

test("muestra alerta si las contraseñas no coinciden en etapa 3", async () => {
  // 1. Primera llamada: enviar código
  fetch.mockResolvedValueOnce({
    text: () => Promise.resolve(JSON.stringify({ success: true, message: "Código enviado" })),
  });

  // 2. Segunda llamada: verificar código
  fetch.mockResolvedValueOnce({
    text: () => Promise.resolve(JSON.stringify({ success: true })),
  });

  render(<ResetPassword />);

  // Etapa 1: ingresar email y avanzar
  fireEvent.change(screen.getByPlaceholderText("Ingresa tu correo"), {
    target: { value: "test@email.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: /enviar código/i }));

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(screen.getByPlaceholderText("Ingresa el código")).toBeInTheDocument();
  });

  // Etapa 2: ingresar código y avanzar
  fireEvent.change(screen.getByPlaceholderText("Ingresa el código"), {
    target: { value: "123456" },
  });
  fireEvent.click(screen.getByRole("button", { name: /verificar código/i }));

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(screen.getByPlaceholderText("Nueva contraseña")).toBeInTheDocument();
  });

  // Etapa 3: ingresar contraseñas distintas
  fireEvent.change(screen.getByPlaceholderText("Nueva contraseña"), {
    target: { value: "abc123" },
  });
  fireEvent.change(screen.getByPlaceholderText("Confirmar contraseña"), {
    target: { value: "xyz456" },
  });

  fireEvent.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

  expect(Swal.fire).toHaveBeenCalledWith("Error", "Las contraseñas no coinciden", "error");
});
