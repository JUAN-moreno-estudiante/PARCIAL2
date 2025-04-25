const express = require('express');
const cors = require('cors');
const pool = require('./db.js');

const app = express();
app.use(cors());
app.use(express.json());


// Rutas de restaurante

app.get('/restaurantes', async (req, res) => {
    const result = await pool.query('SELECT * FROM restaurante');
    res.json(result.rows);
});

app.post('/restaurantes', async (req, res) => {
    const { nombre, ciudad, direccion, fecha_apertura } = req.body;
    await pool.query('INSERT INTO restaurante(nombre, ciudad, direccion, fecha_apertura) VALUES ($1, $2, $3, $4)', [nombre, ciudad, direccion, fecha_apertura]);
    res.send('Restaurante creado');
});

app.put('/restaurantes/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, ciudad, direccion, fecha_apertura } = req.body;
    await pool.query('UPDATE restaurante SET nombre=$1, ciudad=$2, direccion=$3, fecha_apertura=$4 WHERE id_rest=$5', [nombre, ciudad, direccion, fecha_apertura, id]);
    res.send('Restaurante actualizado');
});

app.delete('/restaurantes/:id', async (req, res) => {
    await pool.query('DELETE FROM restaurante WHERE id_rest=$1', [req.params.id]);
    res.send('Restaurante eliminado');
});


// Rutas de empleados

app.get('/empleados', async (req, res) => {
    const result = await pool.query('SELECT * FROM empleado');
    res.json(result.rows);
});

app.post('/empleados', async (req, res) => {
    const { nombre, rol, id_rest } = req.body;
    await pool.query('INSERT INTO empleado(nombre, rol, id_rest) VALUES ($1, $2, $3)', [nombre, rol, id_rest]);
    res.send('Empleado creado');
});

app.put('/empleados/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, rol, id_rest } = req.body;
    await pool.query('UPDATE empleado SET nombre=$1, rol=$2, id_rest=$3 WHERE id_empleado=$4', [nombre, rol, id_rest, id]);
    res.send('Empleado actualizado');
});

app.delete('/empleados/:id', async (req, res) => {
    await pool.query('DELETE FROM empleado WHERE id_empleado=$1', [req.params.id]);
    res.send('Empleado eliminado');
});


// Rutas de productos

app.get('/productos', async (req, res) => {
    const result = await pool.query('SELECT * FROM producto');
    res.json(result.rows);
});

app.post('/productos', async (req, res) => {
    const { nombre, precio } = req.body;
    await pool.query('INSERT INTO producto(nombre, precio) VALUES ($1, $2)', [nombre, precio]);
    res.send('Producto creado');
});

app.put('/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, precio } = req.body;
    await pool.query('UPDATE producto SET nombre=$1, precio=$2 WHERE id_prod=$3', [nombre, precio, id]);
    res.send('Producto actualizado');
});

app.delete('/productos/:id', async (req, res) => {
    await pool.query('DELETE FROM producto WHERE id_prod=$1', [req.params.id]);
    res.send('Producto eliminado');
});


// Rutas de pedidos

app.get('/pedidos', async (req, res) => {
    const result = await pool.query('SELECT * FROM pedido');
    res.json(result.rows);
});

app.post('/pedidos', async (req, res) => {
    const { fecha, id_rest, total } = req.body;
    await pool.query('INSERT INTO pedido(fecha, id_rest, total) VALUES ($1, $2, $3)', [fecha, id_rest, total]);
    res.send('Pedido creado');
});

app.put('/pedidos/:id', async (req, res) => {
    const { id } = req.params;
    const { fecha, id_rest, total } = req.body;
    await pool.query('UPDATE pedido SET fecha=$1, id_rest=$2, total=$3 WHERE id_pedido=$4', [fecha, id_rest, total, id]);
    res.send('Pedido actualizado');
});

app.delete('/pedidos/:id', async (req, res) => {
    await pool.query('DELETE FROM pedido WHERE id_pedido=$1', [req.params.id]);
    res.send('Pedido eliminado');
});


// Rutas de detalles de pedido

app.get('/detalles', async (req, res) => {
    const result = await pool.query('SELECT * FROM detalle_pedido');
    res.json(result.rows);
});

app.post('/detalles', async (req, res) => {
    const { id_pedido, id_prod, cantidad, subtotal } = req.body;
    await pool.query('INSERT INTO detalle_pedido(id_pedido, id_prod, cantidad, subtotal) VALUES ($1, $2, $3, $4)', [id_pedido, id_prod, cantidad, subtotal]);
    res.send('Detalle agregado');
});

app.put('/detalles/:id', async (req, res) => {
    const { id } = req.params;
    const { id_pedido, id_prod, cantidad, subtotal } = req.body;
    await pool.query('UPDATE detalle_pedido SET id_pedido=$1, id_prod=$2, cantidad=$3, subtotal=$4 WHERE id_detalle=$5', [id_pedido, id_prod, cantidad, subtotal, id]);
    res.send('Detalle actualizado');
});

app.delete('/detalles/:id', async (req, res) => {
    await pool.query('DELETE FROM detalle_pedido WHERE id_detalle=$1', [req.params.id]);
    res.send('Detalle eliminado');
});


// Verificación de conexión

app.get('/', async (req, res) => {
    try {
        await pool.query('SELECT NOW()');
        res.send('✅ Conexión exitosa');
    } catch (error) {
        res.status(500).send('❌ Fallo en la conexión');
    }
});

//APIS CONSULTAS ADICIONALES
app.get('/pedidos/:id/productos', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT p.id_prod, pr.nombre, p.cantidad, p.subtotal
            FROM detalle_pedido p
            INNER JOIN producto pr ON p.id_prod = pr.id_prod
            WHERE p.id_pedido = $1
        `, [id]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener productos del pedido');
    }
});
app.get('/productos/mas-vendidos/:cantidad', async (req, res) => {
    const { cantidad } = req.params;
    const result = await pool.query(`
        SELECT p.id_prod, p.nombre, SUM(dp.cantidad) AS total_vendido
        FROM detalle_pedido dp
        JOIN producto p ON dp.id_prod = p.id_prod
        GROUP BY p.id_prod, p.nombre
        HAVING SUM(dp.cantidad) > $1
        ORDER BY total_vendido DESC
    `, [cantidad]);
    res.json(result.rows);
});
app.get('/ventas/restaurantes', async (req, res) => {
    const result = await pool.query(`
        SELECT r.id_rest, r.nombre, COALESCE(SUM(p.total), 0) AS total_ventas
        FROM restaurante r
        LEFT JOIN pedido p ON r.id_rest = p.id_rest
        GROUP BY r.id_rest, r.nombre
        ORDER BY total_ventas DESC
    `);
    res.json(result.rows);
});
app.get('/pedidos/fecha/:fecha', async (req, res) => {
    const { fecha } = req.params;
    const result = await pool.query(`
        SELECT * FROM pedido
        WHERE DATE(fecha) = $1
    `, [fecha]);
    res.json(result.rows);
});
app.get('/empleados/rol/:id_rest/:rol', async (req, res) => {
    const { id_rest, rol } = req.params;
    const result = await pool.query(`
        SELECT id_empleado, nombre, rol
        FROM empleado
        WHERE id_rest = $1 AND rol = $2
    `, [id_rest, rol]);
    res.json(result.rows);
});



// Inicializar servidor

app.listen(5000, () => {
    console.log('Servidor corriendo en http://localhost:5000');
});