const { hostname } = window.location;
export default (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname));
