import { render, screen, fireEvent } from "@testing-library/react";
import Register from "../pages/Register";
import Swal from "sweetalert2";

// Mock de SweetAlert2
jest.mock("sweetalert2");

test("muestra alerta si el correo no tiene '@'", () => {
  render(<Register />);

  fireEvent.change(screen.getByPlaceholderText("Tu nombre"), {
    target: { value: "Juan", name: "nombre" },
  });

  fireEvent.change(screen.getByPlaceholderText("Tu apellido"), {
    target: { value: "Pérez", name: "apellido" },
  });

  fireEvent.change(screen.getByPlaceholderText("Teléfono"), {
    target: { value: "123456789", name: "telefono" },
  });

  fireEvent.change(screen.getByPlaceholderText("Correo electrónico"), {
    target: { value: "correo.com", name: "email" },
  });

  fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
    target: { value: "123456", name: "password" },
  });

  fireEvent.change(screen.getByPlaceholderText("Confirmar contraseña"), {
    target: { value: "123456", name: "confirmPassword" },
  });

  fireEvent.click(screen.getByRole("button", { name: /registrarme/i }));

  expect(Swal.fire).toHaveBeenCalledWith({
    icon: "warning",
    title: "Correo inválido",
    text: "Incluye un signo '@' en la dirección de correo electrónico.",
  });
});
