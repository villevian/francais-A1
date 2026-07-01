const WEIGHT = { not_started: 0, in_progress: 0.5, completed: 1 };
const SECTION_LABEL = { lesson: null, bilan: "Bilan linguistique", delf: "DELF A1" };

function medallionSVG(fraction, color, size = 30) {
  const stroke = size >= 40 ? 4 : size >= 28 ? 3 : 2.5;
  const r = size / 2 - stroke / 2 - 1;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - fraction);
  const isDone = fraction >= 1;
  return `
    <div class="medallion" style="width:${size}px;height:${size}px">
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        <circle class="ring-bg" cx="${size / 2}" cy="${size / 2}" r="${r}" style="stroke-width:${stroke}px" />
        <circle class="ring-fill" cx="${size / 2}" cy="${size / 2}" r="${r}" style="stroke-width:${stroke}px"
          stroke="${isDone ? "var(--green)" : color}"
          stroke-dasharray="${c}" stroke-dashoffset="${isDone ? 0 : offset}" />
      </svg>
      ${isDone ? `<div class="ring-check" style="color:var(--green)">✓</div>` : ""}
    </div>
  `;
}

async function loadSommaire() {
  const student = requireStudent();
  if (!student) return;
  renderHeader(student, { showBack: false });

  const [{ data: units, error: uErr }, { data: sections, error: sErr }, { data: progress, error: pErr }] =
    await Promise.all([
      sb.from("units").select("*").order("id"),
      sb.from("sections").select("*").order("unit_id"),
      sb.from("progress").select("*").eq("student_id", student.id),
    ]);

  if (uErr || sErr || pErr) {
    console.error(uErr || sErr || pErr);
    document.getElementById("toc-grid").innerHTML =
      `<p style="color:var(--red)">Не вдалося завантажити дані. Онови сторінку.</p>`;
    return;
  }

  const sectionsByUnit = {};
  sections.forEach((s) => {
    sectionsByUnit[s.unit_id] = sectionsByUnit[s.unit_id] || {};
    sectionsByUnit[s.unit_id][s.section_type] = s;
  });

  const progressMap = {};
  progress.forEach((p) => {
    progressMap[`${p.unit_id}:${p.section_type}`] = p;
  });

  function fractionFor(unitId, sectionType) {
    const p = progressMap[`${unitId}:${sectionType}`];
    return p ? WEIGHT[p.status] ?? 0 : 0;
  }

  function unitFraction(unitId) {
    const secs = sectionsByUnit[unitId] || {};
    const types = Object.keys(secs);
    if (!types.length) return 0;
    const sum = types.reduce((acc, t) => acc + fractionFor(unitId, t), 0);
    return sum / types.length;
  }

  // Overall progress across every trackable section
  let totalSections = 0;
  let totalFraction = 0;
  units.forEach((u) => {
    const secs = sectionsByUnit[u.id] || {};
    Object.keys(secs).forEach((t) => {
      totalSections += 1;
      totalFraction += fractionFor(u.id, t);
    });
  });
  const overallFraction = totalSections ? totalFraction / totalSections : 0;

  document.getElementById("hero-progress").innerHTML = `
    ${medallionSVG(overallFraction, "var(--teal)", 44)}
    <div class="ring-label">
      <b>${Math.round(overallFraction * 100)}%</b>
      пройдено курсу
    </div>
  `;
  function unitRow(u) {
    const secs = sectionsByUnit[u.id] || {};
    const frac = unitFraction(u.id);
    const subrows = ["bilan", "delf"]
      .filter((t) => secs[t])
      .map((t) => {
        const sf = fractionFor(u.id, t);
        return `
          <a class="subrow" href="unit.html?id=${u.id}&section=${t}">
            <span>${SECTION_LABEL[t]}</span>
            <span class="unit-leader"></span>
            ${medallionSVG(sf, "var(--red)", 20)}
          </a>
        `;
      })
      .join("");

    return `
      <a class="unit-row" href="unit.html?id=${u.id}">
        <span class="unit-badge" style="background:${u.color}">Unité ${u.id}</span>
        <span class="unit-title">${u.title}</span>
        <span class="unit-leader"></span>
        ${medallionSVG(frac, u.color, 30)}
      </a>
      ${subrows}
      <div class="toc-divider"></div>
    `;
  }

  const left = units.filter((u) => u.id <= 5).map(unitRow).join("");
  const right =
    units.filter((u) => u.id >= 6).map(unitRow).join("") +
    `
      <div class="toc-static">
        <span>TRANSCRIPTIONS</span>
        <span class="unit-leader"></span>
        <span style="font-family:var(--font-mono)">127</span>
      </div>
      <div class="toc-static">
        <span>CORRIGÉS</span>
        <span class="unit-leader"></span>
        <span style="font-family:var(--font-mono)">133</span>
      </div>
    `;

  document.getElementById("toc-col-left").innerHTML = left;
  document.getElementById("toc-col-right").innerHTML = right;
}

loadSommaire();
