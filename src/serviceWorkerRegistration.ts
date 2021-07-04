export default function serviceWorkerRegistration (path: string): Promise<ServiceWorkerRegistration> {

	return new Promise((resolve, reject) => {

		if ('serviceWorker' in navigator) {

			window.addEventListener('load', () => {
				navigator.serviceWorker.register(path).then(resolve, reject);
			});

		} else {

			reject(new Error(`navigator.serviceWorker Not supported in this device`));

		}

	});

}
