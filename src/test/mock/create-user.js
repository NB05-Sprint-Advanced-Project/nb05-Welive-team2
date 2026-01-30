const { randomUUID, randomInt } = require('crypto');

// API 엔드포인트 설정
const BASE = 'http://localhost:4000';
const SUPERADMIN_CREATE = `${BASE}/api/v2/users/super-admins`;
const ADMIN_CREATE = `${BASE}/api/v2/users/admins`;
const LOGIN = `${BASE}/api/v2/auth/login`;
const SSE = `${BASE}/api/v2/notifications/sse`;

const randomNumber = randomUUID();
const randomContact = () => {
  const suffix = String(randomInt(0, 100000000)).padStart(8, '0');
  return `010${suffix}`;
};

// 관리자 계정 생성
async function createSuperAdmin(i) {
  const dto = {
    username: `superadmin${i}`,
    email: `superadmin${i}@gmail.com`,
    contact: `0101111${String(i).padStart(4, '0')}`,
    name: `superadmin${i}`,
    password: `superadmin${i}!`,
  };

  const res = await fetch(SUPERADMIN_CREATE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`i=${i} failed: ${res.status} ${body}`);
  }
}

async function createAdmin(i) {
  const dto = {
    username: `admin${i}-${randomNumber}`,
    email: `admin${i}-${randomNumber}@welive.test`,
    contact: randomContact(),
    name: `admin${i}-${randomNumber}`,
    password: `admin${i}-${randomNumber}!!`,
    adminOf: {
      name: `아파트 ${i}`,
      address: `서울특별시 테스트구 테스트로 ${randomNumber}-${i}`,
      description: '아파트 설명',
      officeNumber: `302-${String(i).padStart(2, '0')}`,
      buildingNumberFrom: 1,
      buildingNumberTo: 30,
      floorCountPerBuilding: 3,
      unitCountPerFloor: 30,
    },
  };

  const res = await fetch(ADMIN_CREATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`admin${i} failed: ${res.status} ${body}`);
  }
}

(async () => {
  // 3. 관리자 100명 생성
  console.log('관리자 100명 생성 시작');
  for (let i = 0; i <= 100; i++) {
    await createAdmin(i);
    conos;
  }
  console.log('관리자 100명 생성 완료');
})();
