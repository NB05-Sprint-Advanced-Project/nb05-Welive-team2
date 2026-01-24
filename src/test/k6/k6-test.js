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

export default () => {
  const res = http.get('http://localhost:4000/api/v2/residents', {
    headers: {
      Cookie:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0ZDE0MWViYy00YjUzLTQxNmEtOWY5MC1lOTA5YzBhMjgwNmYiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjkyMzc0ODYsImV4cCI6MTc2OTI1OTA4Nn0.QGoV6EEkf6PT-Uxt9cWnSO5aLI6LJgwkF6WOYc48b-A;',
    },
  });
  check(res, { 'status was 200': (r) => r.status === 200 });
  sleep(1);
};


// export default () => {

//   const res = http.get(
//     'http://localhost:4000/api/v2/users/residents',
//     {
//       headers: {
//         Cookie: 'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmZDg5OTMzNC1hNTQ4LTQ3MTAtODFhZi1hZjc3ZDE5OGNhODYiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjkxNTg1MjAsImV4cCI6MTc2OTE1OTQyMH0.pMTEaAOSKlsElDp7UySyxqsJ43bKYGJj7Nvs7pfEB6U;',
//       },
//     }
//   );
//   check(res, { 'status was 200': (r) => r.status === 200 });
//   sleep(1);
// };
