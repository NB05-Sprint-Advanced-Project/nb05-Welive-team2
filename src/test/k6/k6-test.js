import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    // { duration: '10s', target: 100 },
    // { duration: '10s', target: 300 },
    // { duration: '10s', target: 500 },
    // { duration: '10s', target: 800 },
    { duration: '10s', target: 2000 },
    // { duration: '30s', target: 300 },
    // { duration: '30s', target: 300 },
    // { duration: '30s', target: 300 },
  ],
  thresholds: {
    http_req_duration: ['p(99)<100'],
  },
};
// let vuCounter = 0;

// export default () => {
//   const res = http.get('http://localhost:4000/api/v2/apartments');
//   check(res, { 'status was 200': (r) => r.status === 200 });
//   sleep(1);
// };

/**
 * 가입한 입주자들 get 성능 테스트
 */
export default () => {
  // vuCounter += 1;
  // console.log(`VU ${__VU} 요청 카운트: ${vuCounter}`);
  const res = http.get('http://localhost:4000/api/v2/users/residents', {
    headers: {
      Cookie:
        'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0ZDE0MWViYy00YjUzLTQxNmEtOWY5MC1lOTA5YzBhMjgwNmYiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjkyMjI4OTMsImV4cCI6MTc2OTI0NDQ5M30.ni4lsiVlGXKV4F2_YONbwwulJkqYg36yADGgNvRhLKs;',
    },
  });
  check(res, { 'status was 200': (r) => r.status === 200 });
  sleep(1);
};
