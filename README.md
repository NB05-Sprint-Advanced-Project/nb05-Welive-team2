# 🧑‍💻 node.js 백엔드 팀 고급 프로젝트 - team2

---

## 👥 팀원 구성

| 이름       | 역할        | GitHub                                  | 개인 개발 블로그                               |
| ---------- | ----------- | --------------------------------------- | ---------------------------------------------- |
| **김경연** | 백엔드 개발 | 🔗 [GitHub](이 소괄호 안에 url 작성)    | 🔗 [노션](이 소괄호 안에 url 작성)             |
| **김주호** | 백엔드 개발 | 🔗 [GitHub](https://github.com)         | 🔗 [노션](https://www.notion.com)              |
| **손훈석** | 백엔드 개발 | 🔗 [GitHub](https://github.com/HS-hand) | 🔗 [velog](https://velog.io/@thsgnstjr7/posts) |
| **정인성** | 백엔드 개발 | 🔗 [GitHub]()                           | 🔗 [노션]()                                    |

---

## 📘 프로젝트 소개

**프로그래밍 교육 사이트의 백엔드 시스템 구축**

- **프로젝트 기간:** 2026.01.05 ~
- **주요 목표:**
- ([팀 협업 문서 링크]())

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

---

### 🟩 김주호

---

### 🟧 손훈석

---

### 🟥 정인성

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
