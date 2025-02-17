export const addToCart = async (productData) => {
    try {
      const response = await fetch('http://localhost/corpfresh-php/carrito/carrito.php', {
        method: 'POST',
        credentials: 'include', // Añadir credenciales
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accion: 'agregar',
          id_producto: productData.id_producto,
          nombre: productData.nombre,
          precio: productData.precio,
          imagen: productData.imagen,
          cantidad: productData.cantidad,
        }),
      });
      
      const data = await response.json();
      console.log('Respuesta del servicio addToCart:', data);
      return data;
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      return { error: 'Hubo un problema al agregar el producto al carrito.' };
    }
  };



export const updateCart = async (idProducto, nuevaCantidad) => {
    const response = await fetch('http://localhost/corpfresh-php/carrito/actualizar.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_producto: idProducto, cantidad: nuevaCantidad }),
    });
    return response.json();
};

export const deleteFromCart = async (idProducto) => {
    const response = await fetch('http://localhost/corpfresh-php/carrito/eliminar.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_producto: idProducto }),
    });
    return response.json();
};
