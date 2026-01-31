// eslint-disable-next-line @typescript-eslint/no-var-requires
const { EventSource } = require('eventsource');

// API 엔드포인트 설정
const BASE = 'http://localhost:4000';
const SUPERADMIN_CREATE = `${BASE}/api/v2/users/super-admins`;
const ADMIN_CREATE = `${BASE}/api/v2/users/admins`;
const LOGIN = `${BASE}/api/v2/auth/login`;
const SSE = `${BASE}/api/v2/notifications/sse`;

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
    username: `admin111${i}`,
    email: `admin111${i}@welive.test`,
    contact: `0103030${String(i).padStart(4, '0')}`,
    name: `admin111${i}`,
    password: `admin111${i}!!`,
    adminOf: {
      name: `아파트 ${i}`,
      address: `서울특별시 테스트구 테스트로 ${i}`,
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

// 로그인 및 SSE 연결
function extractCookie(setCookie, name) {
  return setCookie
    .split(',')
    .map((v) => v.trim())
    .find((v) => v.startsWith(`${name}=`))
    ?.split(';')[0];
}

async function loginGetAccessToken(i) {
  const res = await fetch(LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: `superadmin${i}`,
      password: `superadmin${i}!`,
    }),
  });

  const setCookie = res.headers.get('set-cookie');
  const accessTokenPair = extractCookie(setCookie, 'access_token');
  return accessTokenPair; // "access_token=xxx"
}

function connectSSE(i, accessTokenPair) {
  const es = new EventSource(SSE, {
    fetch: (input, init) =>
      fetch(input, {
        ...init,
        headers: {
          ...(init.headers || {}),
          Cookie: accessTokenPair, // ← 여기서 쿠키 직접 전송
        },
      }),
  });

  es.onopen = () => console.log(`[OPEN] superadmin${i}`);
  es.onmessage = (e) => console.log(`[MSG] superadmin${i}:`, e.data);
  es.onerror = (e) => console.error(`[ERR] superadmin${i}`, e);
  return es;
}

//  ======== 알림 테스트 시나리오 ========
//  슈퍼 관리자 1000명 생성 -> 슈퍼 관리자 1000명 로그인 및 SSE 연결 -> 관리자 100명 생성
(async () => {
  // 1. 슈퍼 관리자 1000명 생성
  console.log('슈퍼 관리자 1000명 생성 시작');
  for (let i = 1; i <= 1000; i++) {
    await createSuperAdmin(i);
  }
  console.log('슈퍼 관리자 1000명 생성 완료');

  // 2. 슈퍼 관리자 1000명 로그인 및 SSE 연결
  console.log('슈퍼 관리자 1000명 로그인 및 SSE 연결 시작');
  for (let i = 1; i <= 1000; i++) {
    const token = await loginGetAccessToken(i);
    connectSSE(i, token);
  }
  console.log('슈퍼 관리자 1000명 로그인 및 SSE 연결 완료');

  // 3. 관리자 100명 생성
  console.log('관리자 100명 생성 시작');
  for (let i = 102; i <= 202; i++) {
    await createAdmin(i);
  }
  console.log('관리자 100명 생성 완료');
})();

// @@@@@@@@@@@ 성능 테스트 기록 @@@@@@@@@@@
// ================ N^2 ==============
// - 알림1개 , 100명 = 4ms
// - 알림1개 , 1000명 = 10ms
/*

 const sendLiveNotifications = async (dtos: StateResponseDto[]) => {
    // SSE에 접속한 모든 클라이언트 정보 가져옴
    const clients = ClientManager.get();

    const superAdmins = clients.get(Role.SUPER_ADMIN);
    const admins = clients.get(Role.ADMIN);
    const residents = clients.get(Role.USER);

    // 각 클라이언트에게 알맞는 알림 전송 ( O (N^2) 문제 필요 )
    dtos.map((dto) => {
      const payload = [
        {
          id: `${dto.payloadId}-${dto.receiverType}`,
          createdAt: '2026-01-28T01:49:17.566Z',
          content: `[SSE 실시간 알림 전송됨] ${dto.content}`,
          isChecked: false,
        },
      ];

      // const payload ={
      //   type: "alarm",
      //   data: [
      //     {
      //       id: "string",
      //       createdAt: "2026-01-28T01:49:17.566Z",
      //       content: "string",
      //       isChecked: true
      //     }
      //   ]
      // }

      if (dto.receiverType === Role.SUPER_ADMIN) {
        superAdmins?.forEach((connection, user) => {
          console.log('SSE 알림 전송 대상 : ', user);
          connection.write(`event: ${WorkType.ALARM}\ndata: ${JSON.stringify(payload)}\n\n`);
        });
      } else if (dto.receiverType === Role.ADMIN) {
        admins?.forEach((connection, user) => {
          connection.write(`event: ${WorkType.ALARM}\ndata: ${dto.content}\n\n`);
        });
      } else if (dto.receiverType === Role.USER) {
        residents?.forEach((connection, user) => {
          connection.write(`event: ${WorkType.ALARM}\ndata: ${dto.content}\n\n`);
        });
      }
    });
*/
// - 알림 100개, 1000명
// [sendLiveNotifications 실행 시간]: 40ms
// [알림 스캐쥴러 실행 시간] : 720 ms
// [sendLiveNotifications 실행 시간]: 90ms
// [알림 스캐쥴러 실행 시간] : 1508 ms
// [sendLiveNotifications 실행 시간]: 181ms
// [알림 스캐쥴러 실행 시간] : 2953 ms
// [sendLiveNotifications 실행 시간]: 281ms
// [알림 스캐쥴러 실행 시간] : 4295 ms
// [sendLiveNotifications 실행 시간]: 323ms
// [알림 스캐쥴러 실행 시간] : 5056 ms
// [sendLiveNotifications 실행 시간]: 0ms
// [알림 스캐쥴러 실행 시간] : 4 ms
// [sendLiveNotifications 실행 시간]: 0ms
// [알림 스캐쥴러 실행 시간] : 3 ms

// =================== 주호님 로직 (N) ===================
/*
 const clients = ClientManager.get();

    const superAdmins = clients.get(Role.SUPER_ADMIN);
    const admins = clients.get(Role.ADMIN);
    const residents = clients.get(Role.USER);

    // 각 클라이언트에게 알맞는 알림 전송 ( O (N^2) 문제 필요 )
    // state 테이블에 100개가 있는데, 슈퍼 유저 100명에게 알림을 전송해야된다면?
    // 100 * 100 = 10,000번의 루프가 돌아감




    const superAdminPayloads: LiveNotificationPayload[] = [];
    const adminPayloads: LiveNotificationPayload[] = [];
    const userPayloads: LiveNotificationPayload[] = [];

    const startTime = Date.now();
    dtos.map((dto) => {
      const payload =
      {
        id: `${dto.payloadId}-${dto.receiverType}`,
        createdAt: '2026-01-28T01:49:17.566Z',
        content: `[SSE 실시간 알림 전송됨] ${dto.content}`,
        isChecked: false,
      }

      if (dto.receiverType === Role.SUPER_ADMIN) {
        superAdminPayloads.push(payload);
      } else if (dto.receiverType === Role.ADMIN) {
        adminPayloads.push(payload);
      } else if (dto.receiverType === Role.USER) {
        userPayloads.push(payload);
      }
    });

    if (superAdminPayloads.length !== 0) {
      superAdmins?.forEach((connection, user) => {
        connection.write(`event: ${WorkType.ALARM}\ndata: ${JSON.stringify(superAdminPayloads)}\n\n`);
      });
    }

    if (adminPayloads.length === 0 && userPayloads.length === 0) {
      admins?.forEach((connection, user) => {
        connection.write(`event: ${WorkType.ALARM}\ndata: ${JSON.stringify(adminPayloads)}\n\n`);
      });
    }

    if (userPayloads.length === 0) {
      residents?.forEach((connection, user) => {
        connection.write(`event: ${WorkType.ALARM}\ndata: ${JSON.stringify(userPayloads)}\n\n`);
      });
    }
    const endTime = Date.now();
*/

// sendLiveNotifications 실행 시간: 13ms
// [알림 스캐쥴러 실행 시간] : 720 ms
// sendLiveNotifications 실행 시간: 16ms
// [알림 스캐쥴러 실행 시간] : 1508 ms
// sendLiveNotifications 실행 시간: 34ms
// [알림 스캐쥴러 실행 시간] : 3126 ms
// sendLiveNotifications 실행 시간: 46ms
// [알림 스캐쥴러 실행 시간] : 5090 ms

// ====================== 인성님 로직 (N) ======================
/*
const connectionsByRole: Record<Role, Map<string, any> | undefined> = {
      [Role.SUPER_ADMIN]: clients.get(Role.SUPER_ADMIN),
      [Role.ADMIN]: clients.get(Role.ADMIN),
      [Role.USER]: clients.get(Role.USER),
    };

    const groupedDtos: Record<Role, StateResponseDto[]> = {
      [Role.SUPER_ADMIN]: [],
      [Role.ADMIN]: [],
      [Role.USER]: [],
    };

    dtos.forEach((dto) => {
      groupedDtos[dto.receiverType]?.push(dto);
    });

    (Object.keys(groupedDtos) as Role[]).forEach((role) => {
      const roleDtos = groupedDtos[role];
      if (roleDtos.length === 0) return;

      const connections = connectionsByRole[role];
      if (!connections || connections.size === 0) return;

      const payload = roleDtos.map((dto) => ({
        id: ${dto.payloadId}-${dto.receiverType},
        createdAt: "2026-01-28T01:49:17.566Z",
        content: [SSE 실시간 알림 전송됨] ${dto.content},
        isChecked: false,
      }));

      connections.forEach((connection, userKey) => {
        connection.write(
          event: ${WorkType.ALARM}\n +
          data: ${JSON.stringify(payload)}\n\n,
        );
      });
    });

*/
// sendLiveNotifications 실행 시간: 21ms
// [알림 스캐쥴러 실행 시간] : 545 ms
// sendLiveNotifications 실행 시간: 19ms
// [알림 스캐쥴러 실행 시간] : 1270 ms
// sendLiveNotifications 실행 시간: 26ms
// [알림 스캐쥴러 실행 시간] : 3073 ms
// sendLiveNotifications 실행 시간: 74ms
// [알림 스캐쥴러 실행 시간] : 6903 ms
