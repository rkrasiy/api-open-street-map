"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const spdy_1 = __importDefault(require("spdy"));
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const merge_images_1 = __importDefault(require("merge-images"));
const canvas_1 = require("canvas");
const uuidMain = '322ac5bc-1008-11e9-ab14-d663bd873d93';
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8876;
const HTTPSRedirect = (req, res, next) => {
    if (req.hostname === 'localhost') {
        next();
        return;
    }
    if (typeof req.headers['x-forwarded-proto'] === 'undefined') {
        next();
        return;
    }
    if (req.headers['x-forwarded-proto'].toLowerCase() === 'http') {
        res.redirect(`https://${req.hostname}${req.url}`);
        return;
    }
    next();
};
app.disable('x-powered-by');
app.enable('trust proxy');
app.use((0, helmet_1.default)());
app.use(express_1.default.static(path_1.default.resolve(path_1.default.dirname(''), '..', 'public')));
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.options('*', (0, cors_1.default)());
app.use(HTTPSRedirect);
app.get('/', function (req, res) {
    if (req.query.coordinates) {
        const queryCooordinates = req.query.coordinates;
        let coordinates = queryCooordinates.split(",", 3);
        const lat = Number(coordinates[0]);
        const lon = Number(coordinates[1]);
        let zoom = 16;
        if (coordinates[2]) {
            let param = Number(coordinates[2]);
            zoom = param >= 0 && param <= 19 ? param : 16;
        }
        console.log(zoom);
        const fileName = (0, uuid_1.v5)(queryCooordinates + zoom, uuidMain) + ".png";
        const filePath = path_1.default.resolve(path_1.default.dirname(''), 'cache', fileName);
        if (fs_1.default.existsSync(filePath)) {
            if (res.statusCode == 200) {
                console.log(filePath);
                res.sendFile(filePath);
            }
        }
        else {
            let x = lon2tile(lon, zoom);
            let y = lat2tile(lat, zoom);
            let tiles = [];
            const tilesUrl = [];
            let pos = [0, 256, 512];
            if (zoom == 0) {
                tiles = [0, 0];
            }
            else if (zoom == 1) {
                tiles = [0, 1];
            }
            else {
                tiles = [-1, 0, 1];
            }
            tiles.forEach((imageName, indexImg) => {
                tiles.forEach((folderName, indexFolder) => {
                    tilesUrl.push({
                        src: `https://cdn.digitalvalue.es/${zoom}/${x + folderName}/${y + imageName}.png`,
                        x: pos[indexFolder],
                        y: pos[indexImg]
                    });
                });
            });
            (0, merge_images_1.default)(tilesUrl, {
                Canvas: canvas_1.Canvas,
                Image: canvas_1.Image,
                width: 776,
                height: 776
            }).then(b64 => {
                const base64Data = b64.replace(/^data:image\/png;base64,/, "");
                fs_1.default.writeFile(filePath, base64Data, 'base64', err => {
                    if (err)
                        console.error(err);
                    else {
                        if (res.statusCode == 200) {
                            res.sendFile(filePath);
                        }
                    }
                });
            });
        }
    }
    else {
        res.send('Faltan parametros:   ej. ?lat=50&lon=-0.5&z=10');
    }
});
const options = process.env.NODE_ENV === 'development'
    ? {
        key: fs_1.default.readFileSync(path_1.default.resolve(path_1.default.dirname(''), 'certs/dev/key.pem')),
        cert: fs_1.default.readFileSync(path_1.default.resolve(path_1.default.dirname(''), 'certs/dev/cert.pem')),
    }
    : {
        key: fs_1.default.readFileSync('/home/apps/certs/star.digitalvalue.es.key'),
        cert: fs_1.default.readFileSync('/home/apps/certs/star.digitalvalue.es.crt'),
    };
spdy_1.default.createServer(options, app).listen(PORT, () => {
    console.info('Server listening on port ' + PORT);
});
exports.default = app;
function lon2tile(lon, zoom) {
    return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
}
function lat2tile(lat, zoom) {
    return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
}
//# sourceMappingURL=app.js.map