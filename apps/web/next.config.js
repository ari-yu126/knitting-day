const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker 런타임 이미지를 가볍게 만들기 위해 standalone 출력 사용
  // (node_modules 전체를 복사할 필요 없이 .next/standalone만 있으면 실행 가능)
  output: "standalone",
  // 모노레포 구조라서 트레이싱 기준 루트를 저장소 루트로 명시 (안 하면 워크스페이스 밖 파일을
  // 잘못 추론해서 standalone 출력 경로가 꼬일 수 있음)
  outputFileTracingRoot: path.join(__dirname, "../.."),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
    ],
  },
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
};

module.exports = nextConfig;
