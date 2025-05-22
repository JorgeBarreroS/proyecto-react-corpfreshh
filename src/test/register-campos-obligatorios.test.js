import { render, screen, fireEvent } from "@testing-library/react";
import Register from "../pages/Register";
import Swal from "sweetalert2";

// Mock de SweetAlert2
jest.mock("sweetalert2");

test("muestra alerta si hay campos obligatorios vacíos", () => {
  render(<Register />);

  const boton = screen.getByRole("button", { name: /registrarme/i });
  fireEvent.click(boton);

  expect(Swal.fire).toHaveBeenCalledWith({
    icon: "error",
    title: "Error",
    text: "Por favor, completa los campos obligatorios",
  });
});
