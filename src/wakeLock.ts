type Type = 'screen';

declare var navigator: Navigator & {
	wakeLock: {
		request(type: Type): Promise<unknown>;
	}
}

export default function wakeLock (type: Type): Promise<void> {

	return new Promise((resolve, reject) => {

		if (!('wakeLock' in navigator)) {

			reject(new Error('WakeLock API not supported.'));

		} else if (document.visibilityState === 'visible') {

			navigator.wakeLock.request(type)
				.then(() => resolve())
				.catch(reject);

		} else {

			const handler = () => {
				if (document.visibilityState === 'visible') {
					navigator.wakeLock.request(type)
						.then(() => resolve())
						.catch(reject);
				}
				removeHandler();
			};

			const removeHandler = () => {
				document.removeEventListener('visibilitychange', handler);
				document.removeEventListener('touchstart', handler);
				document.removeEventListener('mousedown', handler);
			}

			document.addEventListener('visibilitychange', handler);
			document.addEventListener('touchstart', handler);
			document.addEventListener('mousedown', handler);

		}
	});

}
