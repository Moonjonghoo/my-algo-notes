const fs = require("fs");
const path = require("path");

const [, , site, slug, newStatus] = process.argv;

if (!site || !slug || !newStatus) {
  console.error(
    "❗ 사용법: node scripts/update-status.js [사이트] [슬러그] [새상태]"
  );
  console.error(
    "예시: node scripts/update-status.js leetcode 139-word-break done"
  );
  process.exit(1);
}

const key = `${site}/${slug}`;
const metadataPath = "metadata.json";
const problemsPath = "problems.md";
const readmePath = path.join("algorithms", site, slug, "[README].md");

// 1. metadata.json 업데이트
if (!fs.existsSync(metadataPath)) {
  console.error("❌ metadata.json이 존재하지 않습니다.");
  process.exit(1);
}

const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));

if (!metadata[key]) {
  console.error(`❌ '${key}' 문제 항목이 metadata.json에 없습니다.`);
  process.exit(1);
}

metadata[key].status = newStatus;
fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
console.log(`✅ metadata.json 상태 변경: ${key} → ${newStatus}`);

// 2. [README].md 상태 줄 수정
if (fs.existsSync(readmePath)) {
  const lines = fs.readFileSync(readmePath, "utf-8").split("\n");
  const updated = lines.map((line) =>
    line.startsWith("> Status:") ? `> Status: **${newStatus}**` : line
  );
  fs.writeFileSync(readmePath, updated.join("\n"));
  console.log("✅ [README].md 상태 변경 완료");
} else {
  console.warn("⚠️ [README].md 파일이 없습니다. 스킵합니다.");
}

// 3. problems.md 갱신
if (fs.existsSync(problemsPath)) {
  const lines = fs.readFileSync(problemsPath, "utf-8").split("\n");
  const updatedLines = lines.map((line) =>
    line.startsWith(`| ${site} | ${slug} |`)
      ? line.replace(
          /\| (easy|medium|hard) \| (todo|in-progress|done) \|/,
          (_, diff) => `| ${diff} | ${newStatus} |`
        )
      : line
  );
  fs.writeFileSync(problemsPath, updatedLines.join("\n"));
  console.log("✅ problems.md 상태 반영 완료");
}
