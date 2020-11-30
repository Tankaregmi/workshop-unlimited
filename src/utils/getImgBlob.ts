const useBase64Instead = true;


export default function (src: string, sizes: number[] = [Infinity], mimeType: string = 'image/png') {
	const cnv = document.createElement('canvas');
	const ctx = cnv.getContext('2d');
	const img = document.createElement('img');
  const data: any[] = [];
  
  if (ctx === null) {
    throw new TypeError(`ctx is null`);
  }

	return new Promise<any[]>((resolve, reject) => {

		img.crossOrigin = 'anonymous';
		img.onload = async () => {
			const width = img.naturalWidth;
			const height = img.naturalHeight;

			for (const size of sizes) {
				if (width > size || height > size) {
					if (width > height) {
						cnv.width = size;
						cnv.height = size * (height / width);
					}
					else {
						cnv.height = size;
						cnv.width = size * (width / height);
					}
				}
				else {
					cnv.width = width;
					cnv.height = height;
				}

				ctx.drawImage(img, 0, 0, cnv.width, cnv.height);

				if (useBase64Instead) {
					const b64 = cnv.toDataURL();

					data.push({
						width: img.naturalWidth,
						height: img.naturalHeight,
						url: b64
					});
	
					if (data.length === sizes.length) {
						resolve(data);
					}
				}
				else {
					cnv.toBlob(blob => {

						data.push({
							width: cnv.width,
							height: cnv.height,
							url: URL.createObjectURL(blob)
						});

						if (data.length === sizes.length) {
							resolve(data);
						}
					}, mimeType);
				}
			}
		};

		img.onerror = reject;
		img.src = src;
	});
}