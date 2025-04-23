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
    const { id_rest, nombre, ciudad, direccion, fecha_apertura } = req.body;
    await pool.query('INSERT INTO restaurante VALUES ($1, $2, $3, $4, $5)', [id_rest, nombre, ciudad, direccion, fecha_apertura]);
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
    const { id_empleado, nombre, rol, id_rest } = req.body;
    await pool.query('INSERT INTO empleado VALUES ($1, $2, $3, $4)', [id_empleado, nombre, rol, id_rest]);
    res.send('Empleado creado');
});

// Rutas de productos
app.get('/productos', async (req, res) => {
    const result = await pool.query('SELECT * FROM producto');
    res.json(result.rows);
});

app.post('/productos', async (req, res) => {
    const { id_prod, nombre, precio } = req.body;
    await pool.query('INSERT INTO producto VALUES ($1, $2, $3)', [id_prod, nombre, precio]);
    res.send('Producto creado');
});

// Rutas de pedidos
app.get('/pedidos', async (req, res) => {
    const result = await pool.query('SELECT * FROM pedido');
    res.json(result.rows);
});

app.post('/pedidos', async (req, res) => {
    const { id_pedido, fecha, id_rest, total } = req.body;
    await pool.query('INSERT INTO pedido VALUES ($1, $2, $3, $4)', [id_pedido, fecha, id_rest, total]);
    res.send('Pedido creado');
});

// Rutas de detalles de pedido
app.get('/detalles', async (req, res) => {
    const result = await pool.query('SELECT * FROM detalle_pedido');
    res.json(result.rows);
});

app.post('/detalles', async (req, res) => {
    const { id_detalle, id_pedido, id_prod, cantidad, subtotal } = req.body;
    await pool.query('INSERT INTO detalle_pedido VALUES ($1, $2, $3, $4, $5)', [id_detalle, id_pedido, id_prod, cantidad, subtotal]);
    res.send('Detalle agregado');
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

app.listen(5000, () => {
    console.log('Servidor corriendo en http://localhost:5000');
});

  