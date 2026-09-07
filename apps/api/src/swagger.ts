import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Knitting Day API",
      version: "1.0.0",
      description: "Knitting Day API 문서",
    },
    tags: [
      {
        name: "Posts",
        description: "게시글 관련 API",
      },
      {
        name: "Auth",
        description: "로그인/회원가입 관련 API",
      },
      {
        name: "Comments",
        description: "댓글 관련 API",
      },
      {
        name: "Users",
        description: "사용자(마이페이지) 관련 API",
      },
      {
        name: "System",
        description: "서버/DB 상태 확인용 API",
      },
    ],
    servers: [
      {
        // 배포 서버에서는 SWAGGER_SERVER_URL 환경변수로 실제 공인 주소를 넣어주면
        // Swagger UI의 "Try it out"이 그 주소로 요청을 보냄 (안 넣으면 로컬 기본값)
        url: process.env.SWAGGER_SERVER_URL || "http://localhost:4000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // 로컬 개발(tsx)에서는 .ts 소스를 읽고, Docker 배포(node dist/server.js)에서는
  // dist/routes의 컴파일된 .js를 읽음 — 실행 이미지엔 .ts 원본을 안 넣기 때문에
  // 이 경로가 없으면 Swagger 문서가 텅 비어버림 (컴파일해도 JSDoc 주석은 그대로 남아있음)
  apis: [
    "./src/routes/*.ts",
    "./dist/routes/*.js",
    "./src/server.ts",
    "./dist/server.js",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
