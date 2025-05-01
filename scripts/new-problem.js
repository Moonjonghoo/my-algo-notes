const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { execSync } = require("child_process");

// CLI 입력 받기 함수
const ask = (q) =>
  new Promise((res) =>
    readline
      .createInterface({ input: process.stdin, output: process.stdout })
      .question(q, (a) => res(a.trim()))
  );

(async () => {
  const [, , site, slug] = process.argv;

  if (!site || !slug) {
    console.error(
      "❗ 사용법: node scripts/new-problem.js [사이트] [문제슬러그]"
    );
    process.exit(1);
  }

  const baseDir = path.join("algorithms", site, slug);
  const readmePath = path.join(baseDir, "[README].md");
  const metadataPath = "metadata.json";
  const problemsPath = "problems.md";
  const branchName = `${site}/${slug}`;

  if (fs.existsSync(baseDir)) {
    console.log("⚠️ 이미 존재하는 문제예요:", baseDir);
    process.exit(0);
  }

  // 사용자 입력 받기
  const difficulty = await ask("난이도 (easy / medium / hard): ");
  const categories = await ask("카테고리 (쉼표로 구분): ");
  const status = await ask("상태 (todo / in-progress / done): ");

  fs.mkdirSync(baseDir, { recursive: true });

  const problemComment = `// 🔢 Problem: ${site} - ${slug.replace(/-/g, " ")}
// 📚 Category: ${categories}
// 🔗 Link: https://${site}.com/problems/${slug}/
// 🧠 Keywords: (적어주세요)
// 🗂️ Note Ref: [${site}] ${slug}.md
`;

  const readmeTemplate = `# ${slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())}
> Source: **${site}**  
> Status: **${status}**

## 🧠 아이디어 요약
- 

## ✍️ 주요 포인트
- 
`;

  fs.writeFileSync(path.join(baseDir, "solution.ts"), problemComment);
  fs.writeFileSync(readmePath, readmeTemplate);
  console.log("✅ 문제 폴더 생성 완료:", baseDir);

  // metadata.json 업데이트
  const metadata = fs.existsSync(metadataPath)
    ? JSON.parse(fs.readFileSync(metadataPath, "utf-8"))
    : {};
  const key = `${site}/${slug}`;
  metadata[key] = {
    site,
    slug,
    difficulty,
    category: categories.split(",").map((c) => c.trim()),
    status,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log("🧠 metadata.json 업데이트 완료");

  // problems.md 업데이트
  const linkPath = readmePath.replace(/\\/g, "/");
  let problemsContent = fs.existsSync(problemsPath)
    ? fs.readFileSync(problemsPath, "utf-8")
    : `# 문제 목록\n\n| 사이트 | 문제 | 난이도 | 상태 | 링크 |\n|--------|------|--------|--------|------|\n`;

  const newRow = `| ${site} | ${slug} | ${difficulty} | ${status} | [보기](${linkPath}) |\n`;

  if (!problemsContent.includes(`| ${site} | ${slug} |`)) {
    problemsContent += newRow;
    fs.writeFileSync(problemsPath, problemsContent);
    console.log("📄 problems.md 갱신 완료");
  } else {
    console.log("📌 이미 problems.md에 등록된 문제입니다.");
  }

  // 브랜치 자동 생성
  try {
    execSync(`git checkout -b ${branchName}`, { stdio: "inherit" });
    console.log(`🌿 브랜치 생성 완료: ${branchName}`);
  } catch (e) {
    console.error("❌ 브랜치 생성 실패:", e.message);
  }

  process.exit(0);
})();
