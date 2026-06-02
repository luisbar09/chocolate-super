const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();
const PORT = 8080;

// Middleware para parsear datos
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir archivos estáticos del sitio
app.use(express.static(__dirname));

// Ruta para procesar el contacto
app.post('/contact', async (req, res) => {
    const { nombre, email, telefono, mensaje } = req.body;

    console.log(`Recibido mensaje de: ${nombre} (${email})`);

    if (!nombre || !email || !mensaje) {
        return res.status(400).json({ status: 'error', message: 'Por favor, completa los campos requeridos (Nombre, Email y Mensaje).' });
    }

    // Configuración de Nodemailer con Gmail
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ventas.chocolatesuper@gmail.com',
            pass: 'kteccbptofmlugbn' // Contraseña de aplicación de 16 letras
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    let mailOptions = {
        from: '"Web Chocolate Super" <ventas.chocolatesuper@gmail.com>',
        to: 'ventas.chocolatesuper@gmail.com',
        replyTo: email,
        subject: `Nuevo mensaje de: ${nombre}`,
        html: `
            <div style="font-family: 'Outfit', sans-serif, Arial; max-width: 600px; padding: 25px; border: 2px solid #d4af37; border-radius: 20px; background-color: #fdfbf7; color: #1a0f08;">
                <h2 style="color: #2b160b; text-align: center; font-size: 24px;">🍫 Nuevo Mensaje de Contacto</h2>
                <hr style="border: 0; border-top: 2px solid #d4af37; margin: 20px 0;">
                
                <p style="font-size: 16px;"><strong>Nombre:</strong> ${nombre}</p>
                <p style="font-size: 16px;"><strong>Email:</strong> ${email}</p>
                <p style="font-size: 16px;"><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
                
                <div style="background: #ffffff; padding: 20px; border-radius: 12px; margin-top: 20px; border: 1px solid #eee;">
                    <p style="margin-top: 0; font-weight: bold; color: #d4af37;">Mensaje:</p>
                    <p style="line-height: 1.6; color: #5c3d2e;">${mensaje}</p>
                </div>
                
                <p style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
                    Este es un mensaje automático enviado desde el sitio web de Chocolate Super.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('¡Correo enviado con éxito!');
        res.json({ status: 'success', message: '¡Mensaje enviado con éxito! Nos contactaremos pronto.' });
    } catch (error) {
        console.error('Error al enviar email:', error);
        res.status(500).json({ status: 'error', message: 'Hubo un problema al enviar el correo. Por favor intenta de nuevo.' });
    }
});

// Ruta de respaldo para SPA (opcional, para redirigir todo al index)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log('====================================');
    console.log('🍫 CHOCOLATE SUPER - SERVIDOR ACTIVO');
    console.log(`🚀 Corriendo en: http://localhost:${PORT}`);
    console.log('====================================');
});
