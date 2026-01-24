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

export default () => {
  const res = http.get('http://localhost:4000/api/v2/apartments');
  check(res, { 'status was 200': (r) => r.status === 200 });
  sleep(1);
};

// /**
//  * 가입한 입주자들 get 성능 테스트
//  */
// export default () => {
//   const res = http.get('http://localhost:4000/api/v2/users/residents', {
//     headers: {
//       Cookie:
//         'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMGM4ZDIwZC02ZjkzLTQ4ODgtYjk0NS1lZmE3OGQxOWMyMmYiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjkxNjEyMzEsImV4cCI6MTc2OTE2MjEzMX0.pcd1DYNssEXF1FEu7ln0dYfrcRredqrHQyyFkPllmtA;',
//     },
//   });
//   check(res, { 'status was 200': (r) => r.status === 200 });
//   sleep(1);
// };
