# 🧑‍💻 node.js 백엔드 팀 고급 프로젝트 - team2

## QuickStart

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 필요한 환경 변수를 설정합니다

```bash
cp .env.example .env
```

### 3. 데이터베이스 설정

Prisma 마이그레이션을 실행합니다

```bash
npx prisma migrate dev
```

### 4. Redis 실행

로컬에 설치된 Redis를 실행

```bash
redis-server
```

### 5. 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:4000`에서 실행됩니다.

---

## 👥 팀원 구성

| 이름       | 역할        | GitHub                                        | 개인 개발 블로그                                                                   |
| ---------- | ----------- | --------------------------------------------- | ---------------------------------------------------------------------------------- |
| **김경연** | 백엔드 개발 | 🔗 [GitHub](https://github.com/gyeongyeonkmy) | 🔗 [노션](https://www.notion.so/2709a1c6d3f280acb068cb5ba3f0f8b6?source=copy_link) |
| **김주호** | 백엔드 개발 | 🔗 [GitHub](https://github.com)               | 🔗 [노션](https://www.notion.com)                                                  |
| **손훈석** | 백엔드 개발 | 🔗 [GitHub](https://github.com/HS-hand)       | 🔗 [velog](https://velog.io/@thsgnstjr7/posts)                                     |
| **정인성** | 백엔드 개발 | 🔗 [GitHub](https://github.com/jung-insung)   | 🔗 [velog](https://insungcoding.tistory.com/)                                      |

---

## 📘 프로젝트 소개

소개: 주민들과 아파트 관리 단체를 위한 상호 관리 플랫폼

🏢 아파트 관리의 모든 것을 하나의 플랫폼으로!
입주민부터 슈퍼 어드민까지, 아파트 운영에 필요한 모든 기능을 손쉽게 관리해보세요.
위리브는 입주민∙관리자∙슈퍼 어드민의 역할에 따라 맞춤형 기능을 제공하는 스마트 아파트 운영 시스템입니다.
입주민 명부 관리, 민원 처리, 주민 투표, 공지사항 등록은 물론, 실시간 알림과 자동 승인 시스템까지 지원하여 복잡했던 아파트 관리 업무를 간편하고 효율적으로 바꿔드립니다. 지금 바로 스마트한 아파트 관리를 시작하세요! 🗳️📬

**프로그래밍 교육 사이트의 백엔드 시스템 구축**

- **프로젝트 기간:** 2026.01.05 ~ 2026.02.09
- **팀 협업 문서:** [TEAM2_welive_project](https://www.notion.so/2db9a1c6d3f2802085c9c755a8a699fb?source=copy_link)

---

## 🧰 기술 스택

| 구분                | 사용 기술                      |
| ------------------- | ------------------------------ |
| **Backend**         | Express.js, PrismaORM          |
| **Database**        | PostgreSQL                     |
| **공통 Tool**       | Git & GitHub, Discord, Notion  |
| **일정 관리**       | GitHub Issues, Notion 타임라인 |
| **GIT BRANCH 전략** | GIT FLOW                       |

---

## 🔧 팀원별 구현 기능 (자신이 개발한 기능 설명과 사진, gif 파일 첨부)

### 🟦 김경연

### 민원

**민원 등록**

- 주민은 제목, 내용, 글의 공개 여부를 입력하여 등록합니다.
- 신규 민원이 등록될 경우 관리자에게 알림이 전송됩니다.

**민원 조회**

- 관리자, 입주민 모두 민원 조회가 가능하며 비공개글의 경우 글을 작성한 입주민과 관리자만 상세 정보 확인이 가능합니다.
- 관리자는 동, 호수, 공개 여부, 처리 상태 별로 민원 목록을 조회할 수 있습니다.
- 관리자는 민원의 상태를 처리 전, 처리 중, 처리 완료로 변경할 수 있으며 민원 상태가 변경될 경우 작성 입주민에게 실시간 알림이 전송됩니다.
- 제목과 작성자로 민원을 검색할 수 있습니다.

**민원 수정**

- 민원을 작성한 입주민은 민원 수정이 가능합니다.
- 민원이 이미 처리 중이거나 처리 완료된 경우 수정이 불가능합니다.

**민원 삭제**

- 민원을 작성한 입주민만 민원 삭제가 가능합니다.
- 관리자는 모든 민원을 삭제할 수 있습니다.
- 민원이 이미 처리 중이거나 처리 완료된 경우 삭제가 불가능합니다.

### 댓글

**댓글 등록**

- 민원 또는 공지사항에 댓글을 등록할 수 있습니다.

**댓글 조회**

- 작성된 댓글을 조회 할 수 있습니다.

**댓글 수정**

- 입주민은 본인이 작성한 댓글만 수정할 수 있습니다.

**댓글 삭제**

- 입주민은 본인이 작성한 댓글을 삭제할 수 있습니다.
- 관리자는 모든 댓글을 삭제할 수 있습니다.

### 참고 자료

#### 민원

<img width="2932" height="1758" alt="Image" src="https://github.com/user-attachments/assets/ce53f030-575c-4661-b516-d5c7fbb88c0f" />

<img width="2932" height="1758" alt="Image" src="https://github.com/user-attachments/assets/7b6875ce-4dcf-42f3-8da8-b86bf0d53f10" />

#### 댓글

<img width="2932" height="1758" alt="Image" src="https://github.com/user-attachments/assets/48b3d4bc-eab1-4f2b-8bd4-11c733b40202" />

<img width="2932" height="1758" alt="Image" src="https://github.com/user-attachments/assets/9f31bd00-4b86-48b8-b782-5c6358e2fc50" />

---

### 🟩 김주호

---

### 🟧 손훈석

### 주민 투표

**투표 등록**

- 관리자로 로그인할 시 주민 투표를 생성할 수 있습니다.
- 투표 등록 시 투표권자 범위(아파트 입주민 전체, 특정 동 주민 등)를 설정할 수 있습니다.
- 또한, 투표 시작 시간과 종료 시간을 설정할 수 있습니다.
- 아파트 일정에 자동으로 추가됩니다.

**투표 목록 조회**

- 관리자와 입주민은 제목, 작성자, 투표권자, 작성 일시, 투표 시작일, 투표 종료일, 투표 상태를 조회합니다.
- 입주민은 자신이 투표권자로 설정된 투표들만 참여 가능합니다.
- 투표권자와 투표 상태로 필터링이 가능하며, 검색이 가능합니다.

**투표 상세 조회**

- 제목, 투표권자, 투표 내용, 투표 선택 목록을 확인할 수 있습니다.
- 진행 중인 투표의 경우 투표를 실시할 수 있습니다.
- 투표 마감 시 관리자와 입주민 모두 투표 결과 조회가 가능하며, 마감된 투표는 자동으로 공지사항에 등록됩니다.

**투표 수정**

- 관리자는 투표 수정이 가능합니다.
- 관리자는 투표 상태를 변경할 수 있습니다.
- 투표가 이미 시작된 이후에는 수정이 불가능합니다.

**투표 삭제**

- 관리자는 투표 삭제가 가능합니다.
- 투표가 이미 시작된 이후에는 삭제가 불가능합니다.

**투표 상태 관리**

- 투표 시작 시간과 종료 시간을 기준으로 투표의 상태를 변경합니다.
  - 투표 전(`PENDING`), 투표 중(`IN_PROGRESS`), 마감(`CLOSED`)
- 상태 변경은 스케줄링을 통해 서버에서 자동으로 처리되어야 합니다.

### 공지사항

**공지 등록**

- 관리자의 경우 제목, 구분(일반, 중요) 등을 입력하여 공지사항 등록이 가능합니다.
- 공지사항에 등록되었을 경우 입주민에게 실시간 알림이 전송됩니다.
- 일정(시작일, 종료일) 등록 여부 선택이 가능하며 일정 등록 시 아파트 일정에 자동으로 추가됩니다.

**공지 목록 조회**

- 분류, 제목, 작성자, 등록 일시, 조회수, 댓글 수를 조회할 수 있습니다.
  - 분류는 정기검진, 긴급사항, 커뮤니티, 주민투표, 민원, 기타 총 6개가 있습니다.
- 분류로 필터링이 가능하며, 검색이 가능합니다.
- 관리자와 입주민 모두 공지사항 조회가 가능합니다.

**공지 상세 조회**

- 분류, 제목, 등록 일시, 조회수, 댓글수, 내용을 확인할 수 있으며, 댓글 목록을 확인할 수 있습니다.

**공지 수정**

- 관리자는 공지 수정이 가능합니다.

**공지 삭제**

- 관리자는 공지 삭제가 가능합니다.

### 참고자료

#### 공지사항

<img width="2848" height="1530" alt="image" src="https://github.com/user-attachments/assets/490454a2-d317-4a4a-81ba-4c1a79d60559" />

#### 투표

<img width="2849" height="1538" alt="image" src="https://github.com/user-attachments/assets/f7364f83-c793-4e43-be2f-ff01eab53178" />

#### 일정

<img width="2840" height="1532" alt="image" src="https://github.com/user-attachments/assets/4151cb72-ae85-4a2f-a7ee-76a3579d5b29" />

---

### 🟥 정인성

### 입주민 계정 관리 기능

- **회원가입**
  - 개인 정보: 아이디, 비밀번호, 연락처, 이름, 이메일
  - 거주 정보: 입주 아파트명, 동, 호수
  - 회원가입 시 즉시 계정이 활성화되지 않으며, 관리자 승인 `PENDING` 상태로 등록

- **관리자 승인 프로세스**
  - 아파트 관리자가 회원가입 요청을 승인하면 회원가입이 완료
  - 승인 결과는 다음 상태로 관리:
    - `PENDING` : 승인 대기 중 (로그인 불가능)
    - `APPROVED` : 승인 완료 (로그인 가능)
    - `REJECTED` : 승인 거절 (로그인 불가능)

- **입주민 계정 목록 조회**
  - 가입 상태(PENDING, APPROVED, REJECTED) 필터링
  - 아파트 동, 호수 필터링
  - 이름, 이메일 기준 검색
  - 페이지네이션 지원

- **주민 계정 가입 상태 변경 (단건)**
  - 승인 대기(PENDING) 상태의 계정을 승인 또는 거절로 변경

- **주민 계정 가입 상태 일괄 변경 (다건)**
  - 여러 개의 승인 대기(PENDING) 계정을 승인 또는 거절로 일괄 변경

- **거절된 주민 계정 일괄 삭제**
  - 가입 상태가 REJECTED인 주민 계정을 일괄 삭제

- **프로필 이미지 수정**
  - 입주민 계정의 프로필 이미지 수정
  - 프로필 이미지는 AWS S3에 저장 및 관리

- **비밀번호 변경**
  - 현재 비밀번호 확인 후 새 비밀번호로 변경
  - 비밀번호는 단방향 해싱 처리 후 데이터베이스에 저장

### 입주민 관리 기능 (가입 여부와 관계없이 입주민 통합 관리 (가입한 입주민 + 미가입한 입주민))

- **입주민 등록**
  - 개인 정보: 연락처, 이름, 이메일
  - 거주 정보: 동, 호수
  - Welive 미가입 입주민 등록 기능

- **입주민 목록 조회**
  - 아파트 동, 호수, Welive 가입 여부, 세대주/세대원 필터링
  - 이름, 이메일, 연락처 기준 검색
  - 페이지네이션 지원

- **입주민 상세 조회**
  - 입주민 ID 기준 상세 정보 제공
- **입주민 정보 수정**
  - 입주민 ID 기준 이메일, 연락처, 이름, 동, 호수, 세대주/세대원 수정 가능

- **입주민 정보 삭제**
  - 입주민 ID 기준 삭제

- **입주민 파일 업로드**
  - 새로운 입주민 정보가 들어있는 CSV 파일을 업로드
  - S3에 CSV 파일을 저장
  - S3에 저장된 CSV 파일을 읽어 DB에 입주민 정보를 일괄 등록

- **입주민 업로드 템플릿 다운로드**
  - 입주민 템플릿 CSV 파일을 다운로드

- **입주민 목록 파일 다운로드**
  - 등록된 입주민 목록을 CSV 파일로 다운로드

### 📸 주요 화면 미리보기

#### 입주민 회원가입

<p align="center">
  <img src="./docs/images/resident-signup.png" width="60%" />
</p>

#### 입주민 계정 관리

<p align="center">
  <img src="./docs/images/resident-account.png" width="60%" />
</p>

#### 입주민 관리

<p align="center">
  <img src="./docs/images/resident.png" width="60%" />
</p>

#### 내 프로필

<p align="center">
  <img src="./docs/images/profile.png" width="60%" />
</p>

---

## 📁 파일 구조

```
src
├── clients.ts
├── config.ts
├── domain
│   ├── apartment
│   │   ├── apartment-mapper.ts
│   │   ├── controller
│   │   │   ├── apartment-controller.ts
│   │   │   ├── apartment-handler.ts
│   │   │   └── apartment-router.ts
│   │   ├── dto
│   │   │   ├── apartment-request.ts
│   │   │   └── view
│   │   │       ├── apartment-view.ts
│   │   │       └── apartments-view.ts
│   │   ├── entity
│   │   │   └── apartment-entity.ts
│   │   ├── interface
│   │   │   ├── i-apartment-command.ts
│   │   │   └── i-apartment-query.ts
│   │   ├── repo
│   │   │   ├── apartment-command.ts
│   │   │   └── apartment-query.ts
│   │   └── service
│   │       └── apartment-query.ts
│   ├── auth
│   │   ├── auth-service.ts
│   │   ├── controller
│   │   │   ├── auth-controller.ts
│   │   │   ├── auth-handler.ts
│   │   │   ├── auth-router.ts
│   │   │   └── view
│   │   │       └── log-in.ts
│   │   └── dto
│   │       └── auth-request.ts
│   ├── comment
│   │   ├── comment-entity.ts
│   │   ├── controller
│   │   │   ├── comment-controller.ts
│   │   │   ├── comment-handler.ts
│   │   │   └── comment-router.ts
│   │   ├── dto
│   │   │   ├── comment-request.ts
│   │   │   ├── comment-respose.ts
│   │   │   └── comment-view.ts
│   │   ├── interface
│   │   │   ├── i-comment-command-repo.ts
│   │   │   └── i-comment-query-repo.ts
│   │   ├── repo
│   │   │   ├── comment-command.ts
│   │   │   └── comment-query.ts
│   │   └── service
│   │       ├── comment-command.ts
│   │       └── comment-query.ts
│   ├── complaint
│   │   ├── complaint-entity.ts
│   │   ├── complaint-scheduler.ts
│   │   ├── controller
│   │   │   ├── complaint-controller.ts
│   │   │   ├── complaint-handler.ts
│   │   │   └── complaint-router.ts
│   │   ├── dto
│   │   │   ├── complaint-request.ts
│   │   │   ├── complaint-response.ts
│   │   │   └── complaint-veiw.ts
│   │   ├── interface
│   │   │   ├── i-complaint-command-repo.ts
│   │   │   └── i-complaint-query-repo.ts
│   │   ├── repo
│   │   │   ├── complaint-command.ts
│   │   │   └── complaint-query.ts
│   │   └── service
│   │       ├── complaint-batch.ts
│   │       ├── complaint-command.ts
│   │       └── complaint-query.ts
│   ├── notice
│   │   ├── controller
│   │   │   ├── notice-controller.ts
│   │   │   ├── notice-handler.ts
│   │   │   └── notice-router.ts
│   │   ├── dto
│   │   │   ├── event-request.ts
│   │   │   ├── event-view.ts
│   │   │   ├── notice-request.ts
│   │   │   └── notice-view.ts
│   │   ├── entity
│   │   │   ├── event.ts
│   │   │   └── notice.ts
│   │   ├── interface
│   │   │   ├── i-event-query-repo.ts
│   │   │   ├── i-notice-command-repo.ts
│   │   │   └── i-notice-query-repo.ts
│   │   ├── notice-scheduler.ts
│   │   ├── repo
│   │   │   ├── notice-command.ts
│   │   │   └── notice-query.ts
│   │   └── service
│   │       ├── notice-batch.ts
│   │       ├── notice-command.ts
│   │       └── notice-query.ts
│   ├── notification
│   │   ├── controller
│   │   │   ├── notification-controller.ts
│   │   │   ├── notification-handler.ts
│   │   │   └── notification-router.ts
│   │   ├── dto
│   │   │   ├── notification-request.ts
│   │   │   └── view
│   │   │       └── notification-view.ts
│   │   ├── entity
│   │   │   └── notification.ts
│   │   ├── interface
│   │   │   ├── i-notification-command.ts
│   │   │   └── i-notification-query.ts
│   │   ├── notification-mapper.ts
│   │   ├── notification-scheduler.ts
│   │   ├── repo
│   │   │   ├── notification-command.ts
│   │   │   └── notification-query.ts
│   │   └── service
│   │       ├── notification-command.ts
│   │       └── notification-query.ts
│   ├── poll
│   │   ├── controller
│   │   │   ├── poll-controller.ts
│   │   │   ├── poll-handler.ts
│   │   │   └── poll-router.ts
│   │   ├── dto
│   │   │   ├── poll-request.ts
│   │   │   └── poll-view.ts
│   │   ├── entity
│   │   │   ├── option.ts
│   │   │   └── poll.ts
│   │   ├── interface
│   │   │   ├── i-poll-command-repo.ts
│   │   │   └── i-poll-query-repo.ts
│   │   ├── repo
│   │   │   ├── poll-command.ts
│   │   │   └── poll-query.ts
│   │   └── service
│   │       ├── poll-command.ts
│   │       └── poll-query.ts
│   ├── state
│   │   ├── dto
│   │   │   ├── state-request.ts
│   │   │   └── state-response.ts
│   │   ├── entity
│   │   │   └── state.ts
│   │   ├── interface
│   │   │   └── i-state-command-repo.ts
│   │   ├── repo
│   │   │   └── state-command.ts
│   │   └── service
│   │       └── state-command.ts
│   ├── user
│   │   ├── controller
│   │   │   ├── resident-user-controller.ts
│   │   │   ├── resident-user-handler.ts
│   │   │   ├── resident-user-router.ts
│   │   │   ├── user-controller.ts
│   │   │   ├── user-handler.ts
│   │   │   └── user-router.ts
│   │   ├── dto
│   │   │   ├── admin-response.ts
│   │   │   ├── common-schema.ts
│   │   │   ├── import-resident-row-dto.ts
│   │   │   ├── resident-user-response.ts
│   │   │   ├── user-request.ts
│   │   │   └── view
│   │   │       ├── administrator.ts
│   │   │       ├── resident.ts
│   │   │       └── user-view.ts
│   │   ├── entity
│   │   │   ├── admin-account.ts
│   │   │   ├── base-user.ts
│   │   │   ├── not-joined-resident.ts
│   │   │   ├── resident-account.ts
│   │   │   └── vo
│   │   │       ├── resident-address.ts
│   │   │       └── user-apartment-link.ts
│   │   ├── interface
│   │   │   ├── i-user-command-repo.ts
│   │   │   └── i-user-query-repo.ts
│   │   ├── repo
│   │   │   ├── user-command.ts
│   │   │   └── user-query.ts
│   │   ├── service
│   │   │   ├── user-command.ts
│   │   │   └── user-query.ts
│   │   └── user-mapper.ts
│   └── user-vote-option
│       ├── i-user-vote-option-command-repo.ts
│       ├── user-vote-option-command-repo.ts
│       └── user-vote-option-entity.ts
├── index.ts
├── injector.ts
├── managers
│   ├── bcrypt-hash-manager.ts
│   ├── redis-locker.ts
│   └── unit-of-work.ts
├── middlewares
│   ├── auth-middleware.ts
│   ├── global-error-middleware.ts
│   ├── multer-middleware.ts
│   └── not-found-middleware.ts
├── redis.ts
├── servers
│   └── http-server.ts
├── shared
│   ├── base-command-repo.ts
│   ├── exception
│   │   ├── business-exception
│   │   │   ├── business-exception.ts
│   │   │   └── exception-info.ts
│   │   └── technical-exception
│   │       ├── exception-info.ts
│   │       └── technical-exception.ts
│   ├── interface
│   │   ├── i-bcrypt-hash-manager.ts
│   │   ├── i-controllers.ts
│   │   ├── i-file-manager.ts
│   │   ├── i-middlewares.ts
│   │   ├── i-page-view.ts
│   │   ├── i-redis-locker.ts
│   │   ├── i-redis.ts
│   │   ├── i-token-manager.ts
│   │   └── i-unit-of-work.ts
│   ├── types
│   │   └── express.d.ts
│   └── utils
│       ├── async-context-storage-util.ts
│       ├── controller-util.ts
│       ├── file-manager.ts
│       ├── file-storage.ts
│       ├── redis-keys.ts
│       ├── scheduler-util.ts
│       └── token-manager.ts
├── swagger-documentation.json
├── swagger.ts
└── test
    ├── e2e
    │   ├── comment.test.ts
    │   ├── complaint.test.ts
    │   ├── notice.test.ts
    │   ├── poll.test.ts
    │   └── user.test.ts
    ├── k6
    │   └── k6-test.js
    ├── mock
    │   ├── create-user.js
    │   └── user-connect-sse.js
    └── unit
        ├── comment-service.test.ts
        ├── complaint-service.test.ts
        └── user-command-service.test.ts
```
