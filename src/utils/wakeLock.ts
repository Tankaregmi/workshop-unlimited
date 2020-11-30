// Handler for the wakeLock API
// https://developer.mozilla.org/en-US/docs/Web/API/WakeLock

export default (output: boolean = false) => {
  try {
    if (!('wakeLock' in navigator)) {
      if (output) {
        console.log(`[wakeLock] Not supported.`);
      }
      return;
    }
    let midFly = false;
    let fails = 0;
    const fly = async () => {
      if (midFly) {
        return;
      }
      midFly = true;
      try {
        // @ts-ignore TypeScript doesn't know wakeLock.
        await navigator.wakeLock.request('screen');
        window.removeEventListener('focus', fly);
        if (output) {
          console.log(`[wakeLock] Locked!`);
        }
      }
      catch (error) {
        fails++;
        if (output) {
          console.log(`[wakeLock] ${ error.name }: ${ error.message }`);
        }
        if (fails === 3) {
          window.removeEventListener('focus', fly);
          if (output) {
            console.log(`[wakeLock] Exceeded attempts limit, ceasing.`);
          }
        }
      }
      finally {
        midFly = false;
      }
    }
    window.addEventListener('focus', fly);
    fly();
  }
  catch (error) {
    
  }
};
