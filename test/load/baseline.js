import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // ramp up to 20 users over 30s
    { duration: '1m', target: 20 },  // stay at 20 users for 1 minute
    { duration: '30s', target: 0 },  // ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must be below 500ms
  },
};

export default function () {
  const loginUrl = 'http://localhost:3001/auth/login';
  const payload = JSON.stringify({
    email: 'admin@alpha.dev',
    password: 'admin123',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(loginUrl, payload, params);
  
  check(res, {
    'is status 200': (r) => r.status === 200,
    'has access token': (r) => r.json().token !== undefined,
  });

  sleep(1);
}
