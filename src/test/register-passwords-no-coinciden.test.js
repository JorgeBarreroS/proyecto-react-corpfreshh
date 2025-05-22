import { render, screen, fireEvent } from "@testing-library/react";
import Register from "../pages/Register";
import Swal from "sweetalert2";

// Mock de SweetAlert2
jest.mock("sweetalert2");

test("muestra alerta si las contraseñas no coinciden", () => {
  render(<Register />);

  fireEvent.change(screen.getByPlaceholderText("Tu nombre"), {
    target: { value: "Ana", name: "nombre" },
  });

  fireEvent.change(screen.getByPlaceholderText("Tu apellido"), {
    target: { value: "López", name: "apellido" },
  });

  fireEvent.change(screen.getByPlaceholderText("Teléfono"), {
    target: { value: "55555555", name: "telefono" },
  });

  fireEvent.change(screen.getByPlaceholderText("Correo electrónico"), {
    target: { value: "ana@email.com", name: "email" },
  });

  fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
    target: { value: "clave123", name: "password" },
  });

  fireEvent.change(screen.getByPlaceholderText("Confirmar contraseña"), {
    target: { value: "clave321", name: "confirmPassword" },
  });

  fireEvent.click(screen.getByRole("button", { name: /registrarme/i }));

  expect(Swal.fire).toHaveBeenCalledWith({
    icon: "error",
    title: "Error",
    text: "Las contraseñas no coinciden",
  });
});
