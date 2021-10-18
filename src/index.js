import { once } from 'events';

import { Router } from 'itty-router';
import qr from 'qr-image';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';

async function QRgen(text, format) {
  switch (format) {
  case 'png': {
    const QRpng = qr.imageSync(text, { type: 'png' });
    return new Response(QRpng, {
      status: 200, headers: { 'Content-Type': 'image/png' }
    });
  }
  case 'svg': {
    const QRsvg = qr.imageSync(text, { type: 'svg' });
    return new Response(QRsvg, {
      status: 200, headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
  default:
    return new Response('Invalid format', {
      status: 400, headers: { 'Content-Type': 'text/plain' }
    });
  }
}

async function QRread(requestBuffer) {
  const png = new PNG({ filterType: 4 });
  try {
    const pngParsed = png.parse(requestBuffer);
    return once(pngParsed, 'parsed')
      .then(() => {
        // png parsed trying to read qr code data
        const code = jsQR(pngParsed.data, pngParsed.width, pngParsed.height);
        if (code) {
          // qr code successfully read
          return new Response(JSON.stringify({ 'text': code.data }), {
            status: 200, headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({ 'Error': 'Can not read qr code' }), {
          status: 200, headers: { 'Content-Type': 'application/json' }
        });
      }).catch(error => {
        console.error(error);
        return new Response(JSON.stringify({ 'Error': 'can not read png' }), {
          status: 200, headers: { 'Content-Type': 'application/json' }
        });
      });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ 'Error': 'can not read png' }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }
}

const router = Router();

router.get('/', () => new Response('Please provide text for the QR code', {
  status: 400, headers: { 'Content-Type': 'text/plain' }
}));

router.get('/:text/:format?', ({ params }) => {
  if (params.format) {
    return QRgen(params.text, params.format);
  }
  // return svg by default
  return QRgen(params.text, 'svg');
});

router.post('/', async request => {
  const contentType = request.headers.get('content-type');
  if (contentType.includes('application/json')) {
    try {
      const requestJson = await request.json();
      if (Object.prototype.hasOwnProperty.call(requestJson, 'text')) {
        if (Object.prototype.hasOwnProperty.call(requestJson, 'format')) {
          return QRgen(requestJson.text, requestJson.format);
        }
        // return svg by default
        return QRgen(requestJson.text, 'svg');
      }
      return new Response(JSON.stringify({ 'Error':'Please provide text for the QR code' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ 'Error':'JSON error' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  return new Response(JSON.stringify({ 'Error':'Only JSON request accepted' }), {
    status: 400, headers: { 'Content-Type': 'application/json' }
  });
});

router.put('/*', async request => {
  return request.arrayBuffer()
    .then(buff => {
      if (buff.byteLength > 0) {
        return QRread(buff);
      }
      return new Response(JSON.stringify({ 'Error': 'empty/no file' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    });
});

// 404 for everything else
router.all('*', (request) => {
  if (request.method !== 'GET' || request.method !== 'POST' || request.method !== 'PUT') {
    return new Response('Only GET and POST method allowed for generating and PUT method for reading', {
      status: 405, headers: { Allow: 'GET, POST, PUT' }
    });
  }
  return new Response('Not Found.', { status: 404 });
});

// error handler
const errorHandler = error => {
  console.error(error.status);
  console.error(error.message);
  return new Response('Error', { status: 500 });
};

// attach the router "handle" to the event handler
addEventListener('fetch', event =>
  event.respondWith(
    router
      .handle(event.request)
      .catch(errorHandler)
  )
);
