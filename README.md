# qr-re-gen-workers

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/DavidEredics/qr-re-gen-workers)
[![Deploy to Cloudflare Workers](https://github.com/DavidEredics/qr-re-gen-workers/actions/workflows/deploy.yml/badge.svg)](https://github.com/DavidEredics/qr-re-gen-workers/actions/workflows/deploy.yml)
![GitHub package.json version](https://img.shields.io/github/package-json/v/DavidEredics/qr-re-gen-workers?style=for-the-badge)
[![GitHub](https://img.shields.io/github/license/DavidEredics/qr-re-gen-workers?style=for-the-badge)](LICENSE)

QR code generator and reader API with Cloudflare Workers

This Cloudflare worker can generate QR codes in png and svg format from the text given in A GET or POST request and can read QR codes from a png in a PUT request.

## Available routes
| path | method | request Content-Type | response Content-Type | request example | response example |
|---|:---:|:---:|:---:|:---:|:---:|
| [**/:text**](#get-request) | [GET](#get-request) | text/plain | image/svg+xml | /example | ![svg example](https://github.com/DavidEredics/qr-re-gen-workers/blob/main/assets/example-qr.svg?raw=true) |
| [**/:text/:format**](#image-format) | [GET](#get-request) | text/plain | image/svg+xml, image/png | /example/svg | ![svg example](https://github.com/DavidEredics/qr-re-gen-workers/blob/main/assets/example-qr.svg?raw=true) |
| [**/**](#post-request) | [POST](#post-request) | application/json | image/svg+xml, image/png | {"text":"example","format":"svg"} | ![svg example](https://github.com/DavidEredics/qr-re-gen-workers/blob/main/assets/example-qr.svg?raw=true) |
| [**/**](#reading-qr-code) | [PUT](#reading-qr-code) | image/png | application/json | ![png example](https://github.com/DavidEredics/qr-re-gen-workers/blob/main/assets/example-qr.png?raw=true) | {"text":"example"} |

## Generating QR code

### GET request
The text that the QR code will generated from must be as the first parameter after the hostname.

**Example**: the following request will generate a QR code that upon reading will show the text **example**: [HOSTNAME]/example.

By default the QR code will be in svg format.

#### image format
To change the format of the image the desired format must be given as a parameter after the text of the QR code. The format can be png or svg.

**Example**: [HOSTNAME]/example/png

### POST request
The Post request must be in json format and contain the text property.

**Example**: `curl 127.0.0.1:8787 -X POST -H "Content-Type: application/json" -d '{"text":"example"}'`

By default the QR code will be in svg format.

#### image format
To change the format of the image the desired format must be given as the _format_ property. The format can be png or svg.

**Example**: `curl 127.0.0.1:8787 -X POST -H "Content-Type: application/json" -d '{"text":"example","format":"png"}'`

## Reading QR code
A PUT request must be made with the image file, currently only png format supported.

**Example**: `curl --upload-file ..\qr.png 127.0.0.1:8787`

The response will be in json format, in case of a successful reading a _text_ property will be returned.

## Development
To run it locally you can either use [Wrangler](https://github.com/cloudflare/wrangler) or [Miniflare](https://github.com/cloudflare/miniflare)

* [**Miniflare**](https://github.com/cloudflare/miniflare): Miniflare saved as a devDependency; after `npm install` the `npm run dev` command will build with webpack then start a server on localhost and automatically rebuild when a file changes
* [**Wrangler**](https://github.com/cloudflare/wrangler): after installing it according to it's [docs](https://developers.cloudflare.com/workers/cli-wrangler/install-update) run `wrangler dev`

## Dependencies
* [itty-router](https://www.npmjs.com/package/itty-router)
* [jsQR](https://www.npmjs.com/package/jsqr)
* [pngjs](https://www.npmjs.com/package/pngjs)
* [qr-image](https://www.npmjs.com/package/qr-image)

## License
[MIT](LICENSE)
