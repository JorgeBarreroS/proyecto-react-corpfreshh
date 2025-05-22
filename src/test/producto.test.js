import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ProductsPage from "../pages/Productos";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../services/AuthContext"; // Importa tu AuthProvider

// Mock useNavigate
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock fetch
global.fetch = jest.fn();

const mockCategories = [
  { id_categoria: 1, nombre_categoria: "Frutas" },
  { id_categoria: 2, nombre_categoria: "Verduras" },
];

const mockProductsData = {
  success: true,
  data: {
    products: [
      {
        id_producto: 101,
        nombre_producto: "Manzana",
        precio_producto: 3000,
        descuento: 10,
        precio_con_descuento: 2700,
        imagen_producto: "manzana.jpg",
      },
    ],
    pagination: {
      total_pages: 2,
    },
  },
};

// Helper para renderizar con providers
const renderWithProviders = (ui) => {
  return render(
    <AuthProvider>
      <BrowserRouter>{ui}</BrowserRouter>
    </AuthProvider>
  );
};

describe("ProductsPage", () => {
  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
  });

  test("renderiza y carga categorías y productos correctamente", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProductsData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      });

    renderWithProviders(<ProductsPage />);

    expect(screen.getByText(/cargando productos/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Manzana")).toBeInTheDocument();
      expect(screen.getByText("Frutas")).toBeInTheDocument();
      expect(screen.getByText("Verduras")).toBeInTheDocument();
    });
  });

  test("muestra mensaje de error si falla fetch productos", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories,
    });

    renderWithProviders(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText(/error http: 500/i)).toBeInTheDocument();
    });
  });

  test("navega a detalles al pulsar botón", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProductsData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      });

    renderWithProviders(<ProductsPage />);

    await waitFor(() => screen.getByText("Manzana"));

    const detailsBtn = screen.getByRole("button", { name: /ver detalles/i });
    fireEvent.click(detailsBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/producto/101");
  });
});
