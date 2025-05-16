-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 16-05-2025 a las 14:36:14
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `corpfreshh`
--
CREATE DATABASE IF NOT EXISTS `corpfreshh` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `corpfreshh`;

DELIMITER $$
--
-- Procedimientos
--
DROP PROCEDURE IF EXISTS `ACTUALIZAR_USUARIO`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `ACTUALIZAR_USUARIO` (IN `x_id_usuario` INT(11), IN `x_nombre_usuario` VARCHAR(100), IN `x_apellido_usuario` VARCHAR(100), IN `x_telefono_usuario` INT(11), IN `x_correo_usuario` VARCHAR(100), IN `x_direccion1_usuario` VARCHAR(100), IN `x_direccion2_usuario` VARCHAR(100), IN `x_ciudad_usuario` VARCHAR(100), IN `x_pais_usuario` VARCHAR(100), IN `x_contraseña` VARBINARY(228))   BEGIN
    UPDATE usuario
    SET 
    	nombre_usuario = x_nombre_usuario, 
        apellido_usuario = x_apellido_usuario,
        telefono_usuario = x_telefono_usuario,
        correo_usuario = x_correo_usuario,
        direccion1_usuario = x_direccion1_usuario,
        direccion2_usuario = x_direccion2_usuario,
        ciudad_usuario = ciudad_usuario,
        pais_usuario = x_pais_usuario,
        contraseña = x_contraseña
    WHERE id_usuario = x_id_usuario;
END$$

DROP PROCEDURE IF EXISTS `BUSCAR_USUARIO`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `BUSCAR_USUARIO` (IN `x_id_usuario` INT(11))   BEGIN
	SELECT id_usuario, nombre_usuario, apellido_usuario,
          telefono_usuario, correo_usuario, direccion1_usuario,
          direccion2_usuario, ciudad_usuario, pais_usuario
    FROM usuario
    WHERE id_usuario = x_id_usuario;
END$$

DROP PROCEDURE IF EXISTS `CREAR_USUARIO`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `CREAR_USUARIO` (IN `x_id_usuario` INT(11), IN `x_nombre_usuario` VARCHAR(100), IN `x_apellido_usuario` VARCHAR(100), IN `x_telefono_usuario` INT(11), IN `x_correo_usuario` VARCHAR(100), IN `x_direccion1_usuario` VARCHAR(100), IN `x_direccion2_usuario` VARCHAR(100), IN `x_ciudad_usuario` VARCHAR(100), IN `x_pais_usuario` VARCHAR(100))   BEGIN
	INSERT INTO  usuario(id_usuario, nombre_usuario, apellido_usuario,
                 telefono_usuario, correo_usuario, direccion1_usuario,
                 direccion2_usuario, ciudad_usuario, pais_usuario)
                 
    VALUES (x_id_usuario, x_nombre_usuario, x_apellido_usuario,
                 x_telefono_usuario, x_correo_usuario, x_direccion1_usuario,
                 x_direccion2_usuario, x_ciudad_usuario, x_pais_usuario);
    END$$

DROP PROCEDURE IF EXISTS `ELIMINAR_USUARIO`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `ELIMINAR_USUARIO` (IN `x_id_usuario` INT(11))   BEGIN
    
    DELETE FROM usuario
    WHERE id_usuario = x_id_usuario;
END$$

DROP PROCEDURE IF EXISTS `ENCRIPTAR_CONTRASENA`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `ENCRIPTAR_CONTRASENA` (IN `x_id_usuario` INT(11), IN `x_contraseña` VARCHAR(255))   BEGIN 
UPDATE usuario 
 SET contraseña = AES_ENCRYPT(contraseña, 'almuerzo')
 WHERE id_usuario = x_id_usuario;
END$$

DROP PROCEDURE IF EXISTS `ObtenerUsuariosDesencriptados`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerUsuariosDesencriptados` ()   BEGIN
    SELECT
        t_id_usuario,
        correo,
        AES_DECRYPT(contraseña, 'almuerzo') AS contraseña_desencriptada
    FROM
        t_usuario;
END$$

DROP PROCEDURE IF EXISTS `ObtenerUsuariosDesencriptados2323`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerUsuariosDesencriptados2323` ()   BEGIN
    SELECT
        id_usuario,
        correo_usuario,
        AES_DECRYPT(contraseña, 'almuerzo') AS contraseña_desencriptada
    FROM
        usuario;
END$$

--
-- Funciones
--
DROP FUNCTION IF EXISTS `NOMBRE_COMPLETO_POR_ID`$$
CREATE DEFINER=`root`@`localhost` FUNCTION `NOMBRE_COMPLETO_POR_ID` (`x_id_usuario` INT) RETURNS VARCHAR(100) CHARSET utf8mb4 COLLATE utf8mb4_general_ci DETERMINISTIC BEGIN
    DECLARE X_Nombre VARCHAR(45);
    DECLARE X_Apellido VARCHAR(45);

    SELECT nombre_usuario, apellido_usuario
    INTO x_Nombre, x_Apellido
    FROM usuario
    WHERE id_usuario = x_id_usuario;

    RETURN CONCAT(x_Nombre, ' ', x_Apellido);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito`
--

DROP TABLE IF EXISTS `carrito`;
CREATE TABLE `carrito` (
  `id_carrito` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `imagen` varchar(255) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `usuario` varchar(255) NOT NULL,
  `color` varchar(50) DEFAULT NULL,
  `talla` varchar(50) DEFAULT NULL,
  `fecha_agregado` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELACIONES PARA LA TABLA `carrito`:
--

--
-- Volcado de datos para la tabla `carrito`
--

INSERT INTO `carrito` (`id_carrito`, `id_producto`, `nombre`, `precio`, `imagen`, `cantidad`, `usuario`, `color`, `talla`, `fecha_agregado`) VALUES
(29, 2, 'Nike SB Dunk Low Verdy Visty', 1730200.00, 'imagenes/zapatosPP.png', 1, 'jorgebarrero44@gmail.com', NULL, NULL, '2025-05-15 18:27:24'),
(30, 1, 'Camisa polo verde', 139124.00, 'imagenes/42631_10.webp', 2, 'jorgebarrero44@gmail.com', NULL, NULL, '2025-05-15 18:27:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

DROP TABLE IF EXISTS `categoria`;
CREATE TABLE `categoria` (
  `id_categoria` int(11) NOT NULL,
  `nombre_categoria` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELACIONES PARA LA TABLA `categoria`:
--

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id_categoria`, `nombre_categoria`) VALUES
(1, 'Camisas'),
(2, 'Pantalones'),
(3, 'Zapatos'),
(4, 'Conjuntos');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `codigos_reset`
--

DROP TABLE IF EXISTS `codigos_reset`;
CREATE TABLE `codigos_reset` (
  `id` int(11) NOT NULL,
  `correo_usuario` varchar(255) NOT NULL,
  `codigo` varchar(10) NOT NULL,
  `creado_en` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELACIONES PARA LA TABLA `codigos_reset`:
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentarios`
--

DROP TABLE IF EXISTS `comentarios`;
CREATE TABLE `comentarios` (
  `id_comentario` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `comentario` text NOT NULL,
  `puntuacion` int(11) DEFAULT NULL CHECK (`puntuacion` between 1 and 5),
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELACIONES PARA LA TABLA `comentarios`:
--   `id_producto`
--       `producto` -> `id_producto`
--   `id_usuario`
--       `usuario` -> `id_usuario`
--

--
-- Volcado de datos para la tabla `comentarios`
--

INSERT INTO `comentarios` (`id_comentario`, `id_usuario`, `id_producto`, `comentario`, `puntuacion`, `fecha`) VALUES
(7, 1, 3, 'ddd ssss', 5, '2025-03-11 01:18:01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contactos`
--

DROP TABLE IF EXISTS `contactos`;
CREATE TABLE `contactos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mensaje` text NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum('Pendiente','Respondido') NOT NULL DEFAULT 'Pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELACIONES PARA LA TABLA `contactos`:
--

--
-- Volcado de datos para la tabla `contactos`
--

INSERT INTO `contactos` (`id`, `nombre`, `email`, `mensaje`, `fecha_creacion`, `estado`) VALUES
(1, 'ss', 'jorgebarrero44@gmail.com', 'ssss', '2025-05-11 20:09:58', 'Pendiente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturas`
--

DROP TABLE IF EXISTS `facturas`;
CREATE TABLE `facturas` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `correo_usuario` varchar(100) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_factura` datetime NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `envio` decimal(10,2) NOT NULL,
  `impuestos` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `metodo_pago` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELACIONES PARA LA TABLA `facturas`:
--   `pedido_id`
--       `pedidos` -> `id`
--

--
-- Volcado de datos para la tabla `facturas`
--

INSERT INTO `facturas` (`id`, `pedido_id`, `correo_usuario`, `id_usuario`, `fecha_factura`, `subtotal`, `envio`, `impuestos`, `total`, `metodo_pago`) VALUES
(3, 11, 'jorgebarrero44@gmail.com', 0, '2025-04-21 20:16:59', 1730200.00, 0.00, 138416.00, 1868616.00, 'casa'),
(4, 12, 'jorgebarrero44@gmail.com', 0, '2025-04-21 21:14:36', 139124.00, 0.00, 11129.92, 150253.92, 'casa'),
(5, 14, 'jorgebarrero44@gmail.com', 0, '2025-04-21 22:05:32', 139124.00, 0.00, 11129.92, 150253.92, 'casa'),
(6, 15, 'jorgebarrero44@gmail.com', 0, '2025-04-21 23:21:58', 1730200.00, 0.00, 138416.00, 1868616.00, 'nequi'),
(9, 19, 'jorgebarrero44@gmail.com', 0, '2025-04-29 21:05:22', 1730200.00, 0.00, 138416.00, 1868616.00, 'casa'),
(11, 21, 'jorgebarrero44@gmail.com', 0, '2025-05-11 13:41:00', 139124.00, 0.00, 11130.00, 150254.00, 'casa'),
(12, 22, 'jorgebarrero44@gmail.com', 0, '2025-05-14 20:53:00', 112690.00, 0.00, 9015.00, 121705.00, 'casa'),
(13, 23, 'jorgebarrero44@gmail.com', 0, '2025-05-14 22:21:24', 450762.00, 0.00, 36061.00, 486823.00, 'casa');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ofertas_especiales`
--

DROP TABLE IF EXISTS `ofertas_especiales`;
CREATE TABLE `ofertas_especiales` (
  `id_oferta` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `porcentaje_descuento` int(11) NOT NULL DEFAULT 0,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `texto_boton` varchar(100) DEFAULT 'Comprar Ahora',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_producto` int(11) DEFAULT NULL,
  `id_categoria` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELACIONES PARA LA TABLA `ofertas_especiales`:
--   `id_categoria`
--       `producto` -> `id_categoria`
--   `id_producto`
--       `producto` -> `id_producto`
--

--
-- Volcado de datos para la tabla `ofertas_especiales`
--

INSERT INTO `ofertas_especiales` (`id_oferta`, `titulo`, `descripcion`, `porcentaje_descuento`, `fecha_inicio`, `fecha_fin`, `activo`, `texto_boton`, `created_at`, `updated_at`, `id_producto`, `id_categoria`) VALUES
(33, 'sss', 'sss555', 19, '2025-05-16 12:24:00', '2025-05-16 15:24:00', 1, 'Comprar Ahora', '2025-05-16 12:24:25', '2025-05-16 12:26:34', 1, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `correo_usuario` varchar(255) DEFAULT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_pedido` datetime NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `metodo_pago` varchar(50) NOT NULL,
  `direccion_entrega` text NOT NULL,
  `telefono_contacto` varchar(20) NOT NULL,
  `costo_envio` decimal(10,2) NOT NULL,
  `impuestos` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','procesando','enviado','completado','cancelado') DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELACIONES PARA LA TABLA `pedidos`:
--

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `correo_usuario`, `id_usuario`, `fecha_pedido`, `total`, `metodo_pago`, `direccion_entrega`, `telefono_contacto`, `costo_envio`, `impuestos`, `estado`) VALUES
(11, 'jorgebarrero44@gmail.com', 0, '2025-04-21 20:16:59', 1868616.00, 'casa', 'ssss', '333333', 0.00, 138416.00, ''),
(12, 'jorgebarrero44@gmail.com', 0, '2025-04-21 21:14:36', 150253.92, 'casa', 'ssss', 'ssss', 0.00, 11129.92, 'pendiente'),
(14, 'jorgebarrero44@gmail.com', 0, '2025-04-21 22:05:32', 150253.92, 'casa', 'ssss', '3343434', 0.00, 11129.92, 'pendiente'),
(15, 'jorgebarrero44@gmail.com', 0, '2025-04-21 23:21:58', 1868616.00, 'nequi', '1111', '22321312323131', 0.00, 138416.00, 'completado'),
(19, 'jorgebarrero44@gmail.com', 0, '2025-04-29 21:05:22', 1868616.00, 'casa', 'rfd', 'ddd', 0.00, 138416.00, 'pendiente'),
(21, 'jorgebarrero44@gmail.com', 0, '2025-05-11 13:41:00', 150254.00, 'casa', 'sssswew', 'wwewe', 0.00, 11130.00, 'pendiente'),
(22, 'jorgebarrero44@gmail.com', 0, '2025-05-14 20:53:00', 121705.00, 'casa', 'dd', 'dddd', 0.00, 9015.00, 'completado'),
(23, 'jorgebarrero44@gmail.com', 0, '2025-05-14 22:21:24', 486823.00, 'casa', 'www', 'www', 0.00, 36061.00, 'pendiente');

--
-- Disparadores `pedidos`
--
DROP TRIGGER IF EXISTS `before_delete_pedido`;
DELIMITER $$
CREATE TRIGGER `before_delete_pedido` BEFORE DELETE ON `pedidos` FOR EACH ROW BEGIN
    -- Eliminar registros en pedidos_detalle relacionados con este pedido
    DELETE FROM pedidos_detalle WHERE pedido_id = OLD.id;
    
    -- Eliminar facturas relacionadas con este pedido
    DELETE FROM facturas WHERE pedido_id = OLD.id;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trigger_devolver_stock`;
DELIMITER $$
CREATE TRIGGER `trigger_devolver_stock` AFTER UPDATE ON `pedidos` FOR EACH ROW BEGIN
    -- Si el estado cambia a 'cancelado', restaurar el stock
    IF NEW.estado = 'cancelado' AND OLD.estado != 'cancelado' THEN
        UPDATE corpfreshh.producto p
        INNER JOIN corpfreshh.pedidos_detalle pd ON p.id_producto = pd.producto_id
        SET p.stock = p.stock + pd.cantidad
        WHERE pd.pedido_id = NEW.id;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos_detalle`
--

DROP TABLE IF EXISTS `pedidos_detalle`;
CREATE TABLE `pedidos_detalle` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `nombre_producto` varchar(100) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `color` varchar(50) DEFAULT NULL,
  `talla` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELACIONES PARA LA TABLA `pedidos_detalle`:
--   `pedido_id`
--       `pedidos` -> `id`
--

--
-- Volcado de datos para la tabla `pedidos_detalle`
--

INSERT INTO `pedidos_detalle` (`id`, `pedido_id`, `producto_id`, `nombre_producto`, `precio_unitario`, `cantidad`, `subtotal`, `color`, `talla`) VALUES
(10, 11, 2, 'Nike SB Dunk Low Verdy Visty', 1730200.00, 1, 1730200.00, NULL, NULL),
(11, 12, 1, 'Camisa polo verde', 139124.00, 1, 139124.00, NULL, NULL),
(12, 14, 1, 'Camisa polo verde', 139124.00, 1, 139124.00, NULL, NULL),
(13, 15, 2, 'Nike SB Dunk Low Verdy Visty', 1730200.00, 1, 1730200.00, NULL, NULL),
(18, 19, 2, 'Nike SB Dunk Low Verdy Visty', 1730200.00, 1, 1730200.00, NULL, NULL),
(20, 21, 1, 'Camisa polo verde', 139124.00, 1, 139124.00, NULL, NULL),
(21, 22, 1, 'Camisa polo verde', 112690.44, 1, 112690.44, NULL, NULL),
(22, 23, 1, 'Camisa polo verde', 112690.44, 4, 450761.76, NULL, NULL);

--
-- Disparadores `pedidos_detalle`
--
DROP TRIGGER IF EXISTS `trigger_actualizar_stock`;
DELIMITER $$
CREATE TRIGGER `trigger_actualizar_stock` AFTER INSERT ON `pedidos_detalle` FOR EACH ROW BEGIN
    -- Reducir el stock del producto
    UPDATE corpfreshh.producto 
    SET stock = stock - NEW.cantidad
    WHERE id_producto = NEW.producto_id;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trigger_verificar_stock`;
DELIMITER $$
CREATE TRIGGER `trigger_verificar_stock` BEFORE INSERT ON `pedidos_detalle` FOR EACH ROW BEGIN
    DECLARE stock_disponible INT;
    
    -- Obtener el stock disponible
    SELECT stock INTO stock_disponible 
    FROM corpfreshh.producto
    WHERE id_producto = NEW.producto_id;
    
    -- Verificar si hay suficiente stock
    IF stock_disponible < NEW.cantidad THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Stock insuficiente para el producto';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

DROP TABLE IF EXISTS `producto`;
CREATE TABLE `producto` (
  `id_producto` int(11) NOT NULL,
  `nombre_producto` varchar(255) DEFAULT NULL,
  `descripcion_producto` text DEFAULT NULL,
  `color_producto` varchar(50) DEFAULT NULL,
  `precio_producto` decimal(10,2) DEFAULT NULL,
  `imagen_producto` varchar(255) DEFAULT NULL,
  `nombre_marca` varchar(100) DEFAULT NULL,
  `talla` varchar(10) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `id_categoria` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELACIONES PARA LA TABLA `producto`:
--   `id_categoria`
--       `categoria` -> `id_categoria`
--

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id_producto`, `nombre_producto`, `descripcion_producto`, `color_producto`, `precio_producto`, `imagen_producto`, `nombre_marca`, `talla`, `stock`, `id_categoria`) VALUES
(1, 'Camisa polo verde', 'Algodón', 'Rojo', 139124.00, 'imagenes/42631_10.webp', 'polo', 'M', 4, 1),
(2, 'Nike SB Dunk Low Verdy Visty', 'Cuero', 'Negro', 1730200.00, 'imagenes/zapatosPP.png', 'Nike', '42', 1, 3),
(3, 'Conjunto Nba Baloncesto Jordan 23 Blanco (S)', 'conjunto blanco', 'blanco', 70000.00, 'imagenes/conjuntojordan.webp', 'Jordan', 'S', 0, 4),
(4, 'Camisa polo club blanca', 'Algodón', 'Blanco', 116278.00, 'imagenes/40963_10.webp', 'Polo', 'S', 0, 1),
(5, 'Pantalón chino verde oscuro Polo', 'Mezclilla', 'verde oscuro ', 371773.00, 'imagenes/pantalon chivo verde.webp', 'Polo', '32', 0, 2),
(6, 'Jordan 4 Retro White Thunder', 'Tela', 'Verde', 1228693.00, 'imagenes/zapatosP.png', 'Nike', '40', 0, 3),
(7, 'Camisa polo verde de mujer', 'camiseta verde para mujer', 'verde', 45000.00, 'imagenes/39923_10.webp', 'Polo', 'M', 0, 1),
(8, 'LV Camisa De Manga Larga Nuevo Estilo Impreso Slim Fit Camisa ', 'Lana', 'negro', 182754.00, 'imagenes/camisalv.webp', 'LV', 'M', 0, 1),
(9, 'Jordan 4 Retro Military Blue (2024) (GS)', 'Zapatos jordan 4 retro', 'Blanco con azul', 568375.00, 'imagenes/zapatosPPP.png', 'Nike', '41', 0, 3),
(10, 'Conjunto Hombre Chicago 23', 'conjunto Negro', 'negro', 89900.00, 'imagenes/conjunto-chicago.webp', 'Forever 21', 'M', 0, 4),
(11, 'Adidas Pantalón Essentials Stanford AEROREADY Piernas Cónicas Lo', 'Algodón', 'negro', 125970.00, 'imagenes/pantalones-adidas.webp', 'Adidas', 'Único', 0, 2),
(12, 'Adidas Camiseta Essentials 3 Rayas Tejido Jersey Lifestyle', 'Camisa rosa Adidas', 'Rosa', 119950.00, 'imagenes/Adidas-rosa.webp', 'Adidas', 'M', 0, 1),
(13, 'Zapatillas Adidas | Running Switch Move | Hombre', 'zapatillas Adidas ', 'Negro', 319900.00, 'imagenes/zapatillas-adidas.webp', 'Adidas', '41', 0, 3),
(14, 'Sneakers LV Stellar Beige ', 'Sneakers LV Stellar Beige 43', 'beige', 490000.00, 'imagenes/zapatillas-lv.webp', 'Levi\'s', '43', 0, 3),
(15, 'Nike Sportswear CJ4456-010', 'tela', 'Negro', 20000.00, 'imagenes/camisa-nike.webp', 'Nike', 'L', 0, 1),
(16, 'Sneakers LV Stellar Negro Azul ', '....', 'Negro', 490000.00, 'imagenes/zapatillas-lvv.webp', 'LV', '40', 0, 3),
(17, 'Pantalones Nike Life Doble Panel Peso Pesado Negros 32 DQ5179-01', 'Pantalones Nike Life Doble Panel Peso Pesado Negros 32 DQ5179-01', 'Negro', 307201.00, 'imagenes/pantalon-nikes.webp', 'Nike', '32', 0, 2),
(18, 'Camiseta Essentials 3 Rayas Tejido Jersey', 'Todos merecen un poco de comodidad casual en sus vidas, y con esta camiseta esencial de adidas lo lograrás con facilidad. Luce las emblemáticas 3 Rayas en ambas mangas y tu amor por adidas está a la vista de todos ya sea que te reúnas con amigos o salgas a dar un paseo por la ciudad. El estilo sencillo y a la vez elegante de esta camiseta la hace fácil de combinar con cualquier prenda en tu guardarropas.', 'blanco', 119950.00, 'imagenes/Camiseta_Essentialsadidas.webp', 'Adidas', 'L', 0, 1),
(19, 'M SMALL LOGO T', 'M Small Logo T es un nuevo producto para Hombre de adidas. Te invitamos a ver las imágenes para apreciar más detalles desde diferentes ángulos. Si ya conoces M Small Logo T S puedes dejar una reseña abajo; siempre nos encanta conocer tu opinión.', 'Azul', 69965.00, 'imagenes/M_adidas.webp', 'Zara', 'S', 0, 1),
(20, 'Boston Celtics Association Edition 2022/23', 'Con un fondo blanco, el jersey Association Edition es una prenda en común que comparte cada equipo de la NBA. El jersey de los Boston Celtics está inspirado en lo que usan los profesionales en la cancha, desde los colores y los gráficos del equipo hasta la malla ligera absorbente de sudor. Te ayuda a mantener la transpirabilidad y la frescura dentro y fuera de la cancha mientras apoyas a tu jugador favorito y al deporte que amas', 'blanco', 579950.00, 'imagenes/camisa-boston.webp', 'Nike', 'M', 0, 1),
(21, 'Nike Air More Uptempo Low', 'Con un estilo de básquetbol de alto nivel y gráficos inspirados en el grafiti, los Air More Uptempo seguro llamarán la atención dentro y fuera de la cancha. Esta versión low combina la amortiguación Air con un cuello acolchado para que te sientas tan bien como te ves.', 'Negro con blanco', 984950.00, 'imagenes/nike-air.webp', 'Nike', '40', 0, 3),
(22, 'Nike Air Max Solo', 'Estos tenis son para los súperfans de Air Max, y su silueta invernal significa que puedes usarlos durante todo el año. Creamos un look totalmente nuevo al combinar elementos de modelos Air Max anteriores. El talón está inspirado en los AM90. ¿Y las unidades Max Air texturizadas? Están inspiradas en los AM180 y ofrecen la cantidad justa de amortiguación. Adelante, dale Max a tu look.', 'Negro/Azul marino medianoche/Obsidiana/Negro', 664950.00, 'imagenes/nike-air-max-solo.webp', 'Nike', '40', 0, 3),
(23, 'nuevo_back_m Atlético Nacional Visitante 2024/25 Stadium (Picap)', 'Tomamos el kit icónico de Atlético Nacional y lo actualizamos para el 2024/25.', 'Blanco/Verde Afortunado', 209970.00, 'imagenes/nacional.png', 'Nike', 'L', 0, 1),
(24, 'Los Angeles Lakers Icon Edition 2022/23', '.....', 'Amarillo', 579950.00, 'imagenes/losangeles.webp', 'Nike', 'XL', 0, 1),
(25, 'Polo Premium Regular Fit para Hombre 38667', 'Camiseta tipo polo elaborada con tejido interlock que brinda estabilidad y durabilidad, sus fibras de algodón cuentan con un acabado liquido que otorga un lustre especial y es extra suave al tacto. Presenta nuestro icónico logo de ardilla bordada a la altura del pecho. Silueta regular fit. Úsala con jeans, bermuda o pantalón de algodón.', 'beige', 59900.00, 'imagenes/polo-premium.webp', 'Arturo calle', 'M', 0, 1),
(26, 'Camiseta Estampada para Hombre 13366', 'Camiseta cuello redondo silueta regular fit, con estampado localizado en frente. Combina esta prenda con jeans o pantalón casual para un look moderno.', 'Azul', 34900.00, 'imagenes/camisaestampada.webp', 'Arturo calle', 'S', 0, 1),
(27, 'Nike Form', 'Diseñados para correr, entrenar y hacer yoga, los versátiles pants Form pueden ayudarte a profundizar en el gimnasio y a enfrentarte a los desafíos que se avecinan. ', 'Negro', 324950.00, 'imagenes/nike-form.webp', 'Nike', 'M', 0, 2),
(28, 'Camiseta Estampado Harry Potter para Hombre 05107', 'La magia ha tocado las puertas de Freedom, haz parte del mundo de Hogwarts con esta camiseta con fit regular estampada y hechiza a todos con tus mejores looks.', 'Azul', 64900.00, 'imagenes/camisa-arturo.webp', 'Arturo calle', 'L', 0, 1),
(29, 'Nike Sportswear Tech Fleece', 'Estos cómodos joggers recuperan el característico ajuste slim que conoces para un look personalizado.', 'Oliva neutro/Oliva medio/Negro', 419965.00, 'imagenes/nike-sportswear.webp', 'Nike', 'M', 0, 2),
(30, 'Camiseta Estampada Regular Fit para Hombre 36784', 'Camiseta cuello redondo en silueta recta con estampado localizado en delantero. Su color vibrante te llenará de vida en tu día a día, fácil de combinar con jeans claros y oscuros.', 'Rojo', 57900.00, 'imagenes/camisa-regular.webp', 'Arturo calle', 'M', 0, 1),
(34, 'ssh', 'suhdh', 'urbrt', 2222.00, 'https://m.media-amazon.com/images/I/71wQhBkg9AL._AC_SL1500_.jpg', 'dfs', '123123', 1, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

DROP TABLE IF EXISTS `rol`;
CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL,
  `nombre_rol` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELACIONES PARA LA TABLA `rol`:
--

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`id_rol`, `nombre_rol`) VALUES
(1, 'Administrador'),
(2, 'Cliente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `nombre_usuario` varchar(100) DEFAULT NULL,
  `apellido_usuario` varchar(100) DEFAULT NULL,
  `telefono_usuario` varchar(15) DEFAULT NULL,
  `correo_usuario` varchar(100) DEFAULT NULL,
  `direccion1_usuario` varchar(255) DEFAULT NULL,
  `direccion2_usuario` varchar(255) DEFAULT NULL,
  `ciudad_usuario` varchar(100) DEFAULT NULL,
  `pais_usuario` varchar(100) DEFAULT NULL,
  `contraseña` varchar(256) DEFAULT NULL,
  `id_rol` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELACIONES PARA LA TABLA `usuario`:
--   `id_rol`
--       `rol` -> `id_rol`
--

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nombre_usuario`, `apellido_usuario`, `telefono_usuario`, `correo_usuario`, `direccion1_usuario`, `direccion2_usuario`, `ciudad_usuario`, `pais_usuario`, `contraseña`, `id_rol`) VALUES
(1, 'juan', 'lopez', '31234546', 'olamiperro@gmail.com', 'calle 9', 'calle 8', 'Bogotá', 'colombia', '?v0??rJ??Zݫ?pZ', 1),
(2, 'María', 'Sánchez', '234567890', 'maria@example.com', 'Avenida 456', 'Casa 2', 'Medellín', 'Colombia', '??G4tJ a??RVM?', 2),
(3, 'Carlos', 'Gómez', '564738291', 'carlos@example.com', 'Carrera 789', 'Piso 3', 'Cali', 'Colombia', 'ilǁ]?-Ν????O', 2),
(4, 'Laura', 'Martínez', '102938475', 'laura@example.com', 'Calle 789', 'Apartamento 5', 'Cartagena', 'Colombia', '???{????I|???3?L', 2),
(5, 'Ana', 'Rodríguez', '293847561', 'ana@example.com', 'Avenida 101', 'Local 2', 'Barranquilla', 'Colombia', '??r?ې??I?q?4?J?', 2),
(6, 'Pedro', 'Jiménez', '847562930', 'pedro@example.com', 'Calle 202', 'Apto 8B', 'Pereira', 'Colombia', 'Wx???\0??w????!?', 2),
(7, 'Carolina', 'Gutiérrez', '473829105', 'carolina@example.com', 'Calle 567', 'Casa 3', 'Cúcuta', 'Colombia', '???Mx?yj	Y??YQ?', 2),
(8, 'Andrés', 'Díaz', '918273645', 'andres@example.com', 'Carrera 345', 'Apartamento 7', 'Manizales', 'Colombia', 'wr??jG? v??', 2),
(9, 'Claudia', 'Herrera', '827364910', 'claudia@example.com', 'Avenida 678', 'Oficina 4', 'Pereira', 'Colombia', 'c?B??ݨ???p???w', 2),
(10, 'Sofíar', 'fffff', '564738920', 'sofia@example.com', 'Calle 303', 'Casa 6', 'Bogotá', 'Colombia', '5?p??\\???!???}$', 2),
(11, 'David', 'Lozano', '738291046', 'david@example.com', 'Avenida 909', 'Piso 5', 'Medellín', 'Colombia', '?,???q??\"]???\ZC?', 2),
(12, 'Lucía', 'Hernández', '849302170', 'lucia@example.com', 'Carrera 404', 'Oficina 3', 'Cali', 'Colombia', 'Y?????T??U??jj', 2),
(13, 'Felipe', 'Vargas', '938470562', 'felipe@example.com', 'Calle 212', 'Local 4', 'Barranquilla', 'Colombia', '?3g?k=f?#', 2),
(14, 'Natalia', 'Suárez', '473820647', 'natalia@example.com', 'Calle 788', 'Apartamento 8', 'Cartagena', 'Colombia', 'o$????D????M?', 2),
(15, 'Ricardo', 'Mendoza', '982374560', 'ricardo@example.com', 'Avenida 565', 'Casa 7', 'Pereira', 'Colombia', '??`????3??!??|C', 2),
(16, 'Beatriz', 'Morales', '483920175', 'beatriz@example.com', 'Carrera 303', 'Local 1', 'Manizales', 'Colombia', '??R??N_\'?GĚ]?', 2),
(17, 'Luis', 'Castro', '293847650', 'luis@example.com', 'Calle 123', 'Casa 5', 'Cúcuta', 'Colombia', '?w?a?i?x??3i?', 2),
(18, 'Sara', 'Torres', '564738291', 'sara@example.com', 'Avenida 300', 'Piso 6', 'Bogotá', 'Colombia', 'q????	?벽???[?', 2),
(19, 'Antonio', 'García', '948273650', 'antonio@example.com', 'Calle 456', 'Apto 7', 'Medellín', 'Colombia', '?v0??rJ??Zݫ?pZ', 2),
(20, 'Paola', 'Reyes', '192837465', 'paola@example.com', 'Carrera 123', 'Local 8', 'Cali', 'Colombia', '??	?@?VП??g5', 2),
(21, 'Jorge', 'Salazar', '564738293', 'jorge@example.com', 'Avenida 789', 'Casa 4', 'Barranquilla', 'Colombia', ',{j,jc?Ӯ\ZR???', 2),
(22, 'Elena', 'Díaz', '837465920', 'elena@example.com', 'Calle 112', 'Apartamento 6', 'Cartagena', 'Colombia', '?E<?Dz?|?2Z????', 2),
(23, 'Oscar', 'Ramos', '284736591', 'oscar@example.com', 'Calle 900', 'Oficina 2', 'Pereira', 'Colombia', ',{j,jc?Ӯ\ZR???', 2),
(24, 'Isabel', 'Soto', '384920174', 'isabel@example.com', 'Avenida 555', 'Piso 8', 'Manizales', 'Colombia', '?s9|??Q?\"n?', 2),
(25, 'Julián', 'Montoya', '738291024', 'julian@example.com', 'Carrera 777', 'Casa 3', 'Cúcuta', 'Colombia', '?p\0Bm?{??FHry?', 2),
(26, 'Valeria', 'García', '847562394', 'valeria@example.com', 'Calle 303', 'Local 5', 'Bogotá', 'Colombia', 'Р??????QZ????', 2),
(27, 'Gabriel', 'Arias', '293847561', 'gabriel@example.com', 'Avenida 212', 'Casa 8', 'Medellín', 'Colombia', 'S??(?UH[?s??', 2),
(28, 'Verónica', 'Cárdenas', '847562930', 'veronica@example.com', 'Calle 101', 'Apartamento 9', 'Cali', 'Colombia', '9Mv? ?z???\'i$??', 2),
(29, 'Martín', 'Ocampo', '564738291', 'martin@example.com', 'Avenida 787', 'Piso 4', 'Barranquilla', 'Colombia', 'sE?\\???B???a??', 2),
(30, 'Camila', 'Cardenas', '738291056', 'camila@example.com', 'Calle 909', 'Casa 2', 'Cartagena', 'Colombia', '?3g?k=f?#', 2),
(31, 'carlos', 'jimenez', '3159786425', 'holabuendia@gmail.com', 'calle 5', 'calle 6', 'bogota', 'colombia', '???????a???>??', 2),
(32, 'juanito', 'elmascapito', '3159786425', 'perroiguanita@gmail.com', 'calle 6', 'calle 7', 'bogota', 'colombia', 'y???ѩ??1z???(??', 2),
(50, 'jorge', 'barrero', '5224522', 'jorgebarrero44@gmail.com', '', '', '', '', 'UjVKa2Z3Z3ZoWS9uZ05NQ3lvZkpEUT0900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000', 1),
(52, 'Sofíarrtr', 'fffff', '3432', 'sofia555@example.com', 'Calle 303', 'Casa 6', 'Bogotá', 'Colombia', 'UzFJMnY5Y2RXbk5HcC9xMU11a3k2dz0900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000', 2),
(53, 'melor', 'shhd', '5224522', 'mejor5646546@gmail.com', '', '', '', '', 'UzFJMnY5Y2RXbk5HcC9xMU11a3k2dz0900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000', 2),
(54, 'Yenny', 'Barrero', NULL, 'yennyvanessa1416@gmail.com', NULL, NULL, NULL, NULL, NULL, 2);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD PRIMARY KEY (`id_carrito`),
  ADD KEY `id_usuario` (`usuario`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `codigos_reset`
--
ALTER TABLE `codigos_reset`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `comentarios`
--
ALTER TABLE `comentarios`
  ADD PRIMARY KEY (`id_comentario`),
  ADD KEY `usuarioss` (`id_usuario`),
  ADD KEY `producto` (`id_producto`);

--
-- Indices de la tabla `contactos`
--
ALTER TABLE `contactos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `ofertas_especiales`
--
ALTER TABLE `ofertas_especiales`
  ADD PRIMARY KEY (`id_oferta`),
  ADD KEY `productooferta` (`id_producto`),
  ADD KEY `categoriaoferta` (`id_categoria`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `pedidos_detalle`
--
ALTER TABLE `pedidos_detalle`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `categoria` (`id_categoria`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id_rol`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD KEY `rol` (`id_rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carrito`
--
ALTER TABLE `carrito`
  MODIFY `id_carrito` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `codigos_reset`
--
ALTER TABLE `codigos_reset`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `comentarios`
--
ALTER TABLE `comentarios`
  MODIFY `id_comentario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `contactos`
--
ALTER TABLE `contactos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `facturas`
--
ALTER TABLE `facturas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `ofertas_especiales`
--
ALTER TABLE `ofertas_especiales`
  MODIFY `id_oferta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `pedidos_detalle`
--
ALTER TABLE `pedidos_detalle`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `comentarios`
--
ALTER TABLE `comentarios`
  ADD CONSTRAINT `producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `usuarioss` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`);

--
-- Filtros para la tabla `ofertas_especiales`
--
ALTER TABLE `ofertas_especiales`
  ADD CONSTRAINT `categoriaoferta` FOREIGN KEY (`id_categoria`) REFERENCES `producto` (`id_categoria`),
  ADD CONSTRAINT `productooferta` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`);

--
-- Filtros para la tabla `pedidos_detalle`
--
ALTER TABLE `pedidos_detalle`
  ADD CONSTRAINT `pedidos_detalle_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`);

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
