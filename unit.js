const SECTION_LABEL = { lesson: "Leçon", bilan: "Bilan linguistique", delf: "DELF A1" };
const STATUS_LABEL = {
  not_started: "не почато",
  in_progress: "у процесі",
  completed: "завершено",
};

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function loadUnit() {
  const student = requireStudent();
  if (!student) return;
  renderHeader(student, { showBack: true });

  const unitId = Number(getParam("id"));
  if (Number.isNaN(unitId)) {
    document.getElementById("unit-hero").innerHTML = `<p style="color:var(--red)">Юніт не знайдено.</p>`;
    return;
  }

  const [{ data: unit, error: uErr }, { data: sections, error: sErr }, { data: progress, error: pErr }] =
    await Promise.all([
      sb.from("units").select("*").eq("id", unitId).single(),
      sb.from("sections").select("*").eq("unit_id", unitId).order("id"),
      sb.from("progress").select("*").eq("student_id", student.id).eq("unit_id", unitId),
    ]);

  if (uErr || sErr || pErr || !unit) {
    console.error(uErr || sErr || pErr);
    document.getElementById("unit-hero").innerHTML = `<p style="color:var(--red)">Не вдалося завантажити юніт.</p>`;
    return;
  }

  document.getElementById("unit-hero").innerHTML = `
    <span class="unit-badge" style="background:${unit.color}">Unité ${unit.id}</span>
    <h1>${unit.title}</h1>
    <div class="unit-pages">стор. ${unit.page_start}${unit.page_end ? "–" + unit.page_end : ""}</div>
  `;

  const progressMap = {};
  progress.forEach((p) => (progressMap[p.section_type] = p));

  const listEl = document.getElementById("section-list");
  listEl.innerHTML = sections
    .map((s) => {
      const p = progressMap[s.section_type] || { status: "not_started", score: "", max_score: "" };
      return `
        <div class="section-card" data-section="${s.section_type}">
          <div class="section-info">
            <div class="section-kind">${s.section_type === "lesson" ? "Основний матеріал" : "Практика"} · стор. ${s.page_start}</div>
            <h3>${SECTION_LABEL[s.section_type] || s.title}</h3>
          </div>
          <div class="section-controls">
            <select class="status-select" data-field="status">
              <option value="not_started" ${p.status === "not_started" ? "selected" : ""}>не почато</option>
              <option value="in_progress" ${p.status === "in_progress" ? "selected" : ""}>у процесі</option>
              <option value="completed" ${p.status === "completed" ? "selected" : ""}>завершено</option>
            </select>
            <input class="score-input" data-field="score" type="number" min="0" max="20" placeholder="бал /20"
              value="${p.score ?? ""}" />
            <button class="save-btn" type="button">Зберегти</button>
            <span class="save-flash">✓ збережено</span>
          </div>
        </div>
      `;
    })
    .join("");

  listEl.querySelectorAll(".section-card").forEach((card) => {
    const sectionType = card.dataset.section;
    const btn = card.querySelector(".save-btn");
    const flash = card.querySelector(".save-flash");
    btn.addEventListener("click", async () => {
      const status = card.querySelector('[data-field="status"]').value;
      const scoreRaw = card.querySelector('[data-field="score"]').value;
      const score = scoreRaw === "" ? null : Number(scoreRaw);

      btn.disabled = true;
      const { error } = await sb.from("progress").upsert(
        {
          student_id: student.id,
          unit_id: unitId,
          section_type: sectionType,
          status,
          score,
          max_score: score === null ? null : 20,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "student_id,unit_id,section_type" }
      );
      btn.disabled = false;

      if (error) {
        console.error(error);
        flash.textContent = "помилка збереження";
        flash.style.color = "var(--red)";
      } else {
        flash.textContent = "✓ збережено";
        flash.style.color = "var(--green)";
      }
      flash.classList.add("show");
      setTimeout(() => flash.classList.remove("show"), 1800);
    });
  });

  // If arrived via a subrow link (?section=bilan), scroll it into view
  const focusSection = getParam("section");
  if (focusSection) {
    const target = listEl.querySelector(`[data-section="${focusSection}"]`);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

loadUnit();
