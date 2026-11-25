// Skleja wszystkie pliki supabase/*.sql w jeden (w poprawnej kolejności) do supabase/_wszystko.sql.
// Użycie: node tools/buildAllSql.js
const fs = require("fs");
const path = require("path");

const order = [
  "schema", "cloud_saves", "anticheat_ranking", "chat", "avatars",
  "bug_reports", "forum", "admin", "dm", "dm_reports",
];
const dir = path.join(__dirname, "..", "supabase");
let out =
  "-- ============================================================\n" +
  "-- Idler: WSZYSTKIE skrypty SQL w jednym pliku (do nowego projektu Supabase).\n" +
  "-- Wygenerowane przez: node tools/buildAllSql.js (nie edytuj ręcznie).\n" +
  "-- Wklej całość w SQL Editor i kliknij Run. Można uruchomić ponownie.\n" +
  "-- Kolejność: " + order.join(", ") + ".\n" +
  "-- ============================================================\n\n";

for (const name of order) {
  const text = fs.readFileSync(path.join(dir, name + ".sql"), "utf8").replace(/\r\n/g, "\n");
  out += "\n-- >>>>>>>>>> " + name + ".sql <<<<<<<<<<\n\n" + text + "\n";
}

fs.writeFileSync(path.join(dir, "_wszystko.sql"), out);
console.log("Zapisano supabase/_wszystko.sql (" + out.length + " znaków).");
