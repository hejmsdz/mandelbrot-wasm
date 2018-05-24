const imports = {};

console.log('Fetching module...');

fetch('./mandelbrot.wasm')
	.then(resp => {
		if (resp.ok) {
			console.log('Download complete');
			return resp.arrayBuffer();
		} else {
			console.error('Fetch failed', resp);
		}
	})
	.catch(error => {
		console.error(error);
	})
	.then(code => {
		console.log('Instantiating module...');
		return WebAssembly.instantiate(code, imports);
	})
	.then(({instance}) => {
		console.log('Instance ready');

		const mem = instance.exports.memory;
		const mandelbrot = instance.exports.mandelbrot;

		instance.exports.generatePalette(0x3b4371, 0xf3904f);

		const canvas = document.getElementById('mandelbrot');
		const width = canvas.width;
		const height = canvas.height;
		const numPages = Math.ceil((width * height * 4) / (64 * 1024));
		mem.grow(numPages);

		const imgDataArray = new Uint8ClampedArray(mem.buffer, 300, width * height * 4);

		const ctx = canvas.getContext('2d');

		let cx = -0.5;
		let cy = 0;
		let scale = 150;

		const onScroll = (e) => {
		    scale *= ((e.deltaY||e.detail) < 0) ? 1.1 : 0.9;
		    if (scale <= 0) scale = 1;
		    draw();
		};

		canvas.addEventListener('DOMMouseScroll', onScroll);
		canvas.addEventListener('mousewheel', onScroll);

		function eventToXY(e) {
		    return {
			x: e.offsetX || e.layerX || e.clientX - canvas.offsetLeft,
			y: e.offsetY || e.layerY || e.clientY - canvas.offsetTop
		    };
		}

		let mouseDownX, mouseDownY;
		canvas.addEventListener('mousedown', (e) => {
		    if (e.which == 1) {
			let coords = eventToXY(e);
			mouseDownX = coords.x;
			mouseDownY = coords.y;
		    }
		});

		canvas.addEventListener('mousemove', (e) => {
		    let coords = eventToXY(e);
		    if (e.buttons & 1) {
			cx -= (coords.x - mouseDownX) / scale;
			cy -= (coords.y - mouseDownY) / scale;

			mouseDownX = coords.x;
			mouseDownY = coords.y;
			draw();
		    }
		});


		const gentime = document.getElementById('gentime');
		const coords = document.getElementById('coords');

		function draw() {
		    let t0 = performance.now();
		    mandelbrot(width, height, cx, cy, scale, 300);
		    let t1 = performance.now();
		    ctx.putImageData(new ImageData(imgDataArray, width, height), 0, 0);

		    gentime.innerHTML = Math.round(t1-t0);
		    coords.innerHTML = JSON.stringify({cx, cy, scale});
		}

		draw();
	});
