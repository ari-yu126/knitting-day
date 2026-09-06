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
    ],
    servers: [
      {
        url: "http://localhost:4000",
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
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
