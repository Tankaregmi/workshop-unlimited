// This is one of my babies.



// Types

export interface ImageData {
	width: number;
	height: number;
	url: string;
}



// Functions

function getCanvasForImage (src: string, maxSize: number = Infinity): Promise<HTMLCanvasElement> {
	return new Promise((resolve, reject) => {

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		const img = document.createElement('img');

		img.onload = () => {

			const [width, height] = normalize(img.naturalWidth, img.naturalHeight, maxSize);

			canvas.width = width;
			canvas.height = height;

			ctx.drawImage(
				img,
				0, 0, img.naturalWidth, img.naturalHeight,
				0, 0, canvas.width, canvas.height
			);

			resolve(canvas);

		};

		img.onerror = reject;
		img.crossOrigin = 'anonymous';
		img.src = src;

	});
}


function normalize (x: number, y: number, cap: number): [number, number] {

  if (x > y && x > cap) {
    y = y / x * cap;
    x = cap;
  } else if (y > cap) {
    x = x / y * cap;
    y = cap;
  }

	return [x, y];

}



// Methods

async function base64 (...args: Parameters<typeof getCanvasForImage>): Promise<ImageData> {
	const canvas = await getCanvasForImage(...args);
	return {
		url: canvas.toDataURL(),
		width: canvas.width,
		height: canvas.height
	};
}


function blob (...args: Parameters<typeof getCanvasForImage>): Promise<ImageData> {
	return new Promise(async (resolve, reject) => {

		getCanvasForImage(...args).then(canvas => {

			canvas.toBlob(blob => {
				resolve({
					url: URL.createObjectURL(blob),
					width: canvas.width,
					height: canvas.height,
				});
			});

		}).catch(reject);

	});
}



// Exports

const GetImageData = {
	base64,
	blob,
};

export default GetImageData;
