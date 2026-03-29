import { proxyToBackend } from '../_proxy.js';

export default {
  fetch(request) {
    return proxyToBackend(request, '/auth/login');
  }
};
