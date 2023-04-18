import express from 'express';
import cors from 'cors';
import http2 from 'spdy';
import path from 'path';
import helmet from 'helmet';

import { v5 as uuidv5  } from 'uuid';
import fs from 'fs';

import mergeImages from 'merge-images';
import { Canvas, Image } from 'canvas';

const uuidMain = '322ac5bc-1008-11e9-ab14-d663bd873d93';
const app = express();
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
app.use(helmet());
app.use(express.static(path.resolve(path.dirname(''), '..', 'public')));
app.use(
	cors({
		origin: true,
		credentials: true,
	})
);
app.options('*', cors());
app.use(HTTPSRedirect);


app.get('/', function(req, res) {
	if (req.query.coordinates) {
		const queryCooordinates = req.query.coordinates as string;
		let coordinates = queryCooordinates.split(",", 3);
		
		const lat = Number(coordinates[0]);
		const lon = Number(coordinates[1]);
		let zoom = 16;

		if(coordinates[2]){
            let param = Number(coordinates[2])
			zoom = param >= 0 && param <= 19 ? param : 16
		}
        console.log(zoom)
		const fileName = uuidv5(queryCooordinates + zoom, uuidMain) + ".png";
		const filePath = path.resolve(path.dirname(''), 'cache', fileName);
		
		if (fs.existsSync(filePath)){
			if(res.statusCode == 200){
                console.log(filePath)
				res.sendFile(filePath);
			}
		}else{
			let x = lon2tile(lon, zoom);
			let y = lat2tile(lat, zoom);
	
			let tiles = [];
			const tilesUrl = []
			let pos = [0,256,512]
			
			if(zoom == 0) {
				tiles = [0,0];
			}else if(zoom == 1) {
				tiles = [0,1]
			}else {
				tiles = [-1,0,1]
			}
			
			tiles.forEach( (imageName, indexImg) => {
				tiles.forEach( (folderName, indexFolder) => {	
					tilesUrl.push({
						src: `https://cdn.digitalvalue.es/${zoom}/${x + folderName}/${y + imageName}.png`,
						x: pos[indexFolder],
						y: pos[indexImg]
					})
				})
			})
			
			mergeImages( tilesUrl, {
				Canvas: Canvas,
				Image: Image,
				width: 776,
				height: 776
			}).then(b64 => {
				const base64Data = b64.replace(/^data:image\/png;base64,/, "");
				fs.writeFile(filePath, base64Data, 'base64', err => {
					if(err) console.error(err)
					else {
						if(res.statusCode == 200){
							res.sendFile(filePath);
						}
					}
				});
				
			});
		}		

	} else {
		res.send('Faltan parametros:   ej. ?lat=50&lon=-0.5&z=10');
	}
});

const options =
	process.env.NODE_ENV === 'development'
		? {
				key: fs.readFileSync(
					path.resolve(path.dirname(''), 'certs/dev/key.pem')
				),
				cert: fs.readFileSync(
					path.resolve(path.dirname(''), 'certs/dev/cert.pem')
				),
		  }
		: {
				key: fs.readFileSync(
					'/home/apps/certs/star.digitalvalue.es.key'
				),
				cert: fs.readFileSync(
					'/home/apps/certs/star.digitalvalue.es.crt'
				),
		  };

http2.createServer(options, app).listen(PORT, () => {
	console.info('Server listening on port ' + PORT);
});

export default app;

function lon2tile(lon, zoom) { 
	return (
		Math.floor( ( lon + 180 ) / 360 * Math.pow( 2, zoom) )
	); 
}

function lat2tile(lat, zoom)  { 
	return (
		Math.floor( ( 1 - Math.log( Math.tan( lat * Math.PI / 180 ) + 1 / Math.cos( lat * Math.PI / 180 ) ) / Math.PI ) / 2 * Math.pow( 2, zoom ) )
	);
}