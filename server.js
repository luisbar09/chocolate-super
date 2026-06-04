const express = require('express');
const path = require('path');
const https = require('https');
const app = express();
const PORT = 8080;

// Middleware para parsear datos
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir archivos estáticos del sitio
app.use(express.static(__dirname));

// Función para enviar correos usando la API HTTP de Resend
function sendEmailViaResend(data) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(data);
        const options = {
            hostname: 'api.resend.com',
            path: '/emails',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer re_M2qmbNqV_JfmrR7W4PSzvSrPJch7BiStt',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        resolve(body);
                    }
                } else {
                    reject(new Error(`Resend API error (${res.statusCode}): ${body}`));
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        // Configurar tiempo límite de 10 segundos
        req.setTimeout(10000, () => {
            req.destroy(new Error('Resend connection timeout'));
        });

        req.write(payload);
        req.end();
    });
}

// Ruta para procesar el contacto
app.post('/contact', async (req, res) => {
    const { nombre, email, telefono, mensaje } = req.body;

    console.log(`Recibido mensaje de: ${nombre} (${email})`);

    if (!nombre || !email || !mensaje) {
        return res.status(400).json({ status: 'error', message: 'Por favor, completa los campos requeridos (Nombre, Email y Mensaje).' });
    }

    // Configuración para la API de Resend.
    // Importante: Al no tener un dominio verificado aún en Resend,
    // es necesario enviar "from" desde 'onboarding@resend.dev'.
    const emailData = {
        from: 'Chocolate Super Web <onboarding@resend.dev>',
        to: 'ventas.chocolatesuper@gmail.com',
        reply_to: email,
        subject: `🍫 Nuevo mensaje de: ${nombre}`,
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
        await sendEmailViaResend(emailData);
        console.log('¡Correo enviado con éxito a través de Resend!');
        res.json({ status: 'success', message: '¡Mensaje enviado con éxito! Nos contactaremos pronto.' });
    } catch (error) {
        console.error('Error al enviar email con Resend:', error.message);
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
