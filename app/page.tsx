"use client";

import { useEffect, useMemo, useState } from "react";

type Project = {
  projectNumber: string;
  fundingScheme: string;
  titleEnglish: string;
  titleChinese: string;
  principalInvestigatorEnglish: string;
  principalInvestigatorChinese: string;
  department: string;
  institution: string;
  coInvestigators: string;
  panel: string;
  subjectArea: string;
  exerciseYear: string;
  fundApproved: string;
  fundApprovedNumber: number | null;
  projectStatus: string;
  completionDate: string;
  abstract: string;
  outcome: string;
  laymanSummary: string;
  sourceUrl: string;
};

type SortMode = "number" | "fund-desc" | "fund-asc" | "title";

const ALL = "全部";

function uniqueValues(projects: Project[], key: keyof Project) {
  return Array.from(
    new Set(projects.map((project) => String(project[key] || "").trim())),
  )
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

function formatMoney(value: number | null) {
  if (!value) return "未列明";
  return `HK$${value.toLocaleString("en-US")}`;
}

function normalize(value: string) {
  return value.toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

function getSearchText(project: Project) {
  return normalize(
    [
      project.projectNumber,
      project.titleEnglish,
      project.titleChinese,
      project.principalInvestigatorEnglish,
      project.principalInvestigatorChinese,
      project.department,
      project.institution,
      project.coInvestigators,
      project.subjectArea,
      project.abstract,
    ].join(" "),
  );
}

async function loadProjects() {
  const sources = [
    "/projects.json",
    "https://mamingsuper.github.io/cerg-2026-hss-projects/projects.json",
    "https://raw.githubusercontent.com/mamingsuper/cerg-2026-hss-projects/main/docs/projects.json",
  ];

  let lastError: unknown;
  for (const source of sources) {
    try {
      const response = await fetch(source, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return (await response.json()) as Project[];
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState(ALL);
  const [subject, setSubject] = useState(ALL);
  const [institution, setInstitution] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [sortMode, setSortMode] = useState<SortMode>("number");
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [showAbstract, setShowAbstract] = useState(false);

  useEffect(() => {
    loadProjects()
      .then((data: Project[]) => {
        setProjects(data);
        setSelectedNumber(data[0]?.projectNumber ?? null);
      });
  }, []);

  const panels = useMemo(() => uniqueValues(projects, "panel"), [projects]);
  const subjects = useMemo(() => uniqueValues(projects, "subjectArea"), [projects]);
  const institutions = useMemo(
    () => uniqueValues(projects, "institution"),
    [projects],
  );
  const statuses = useMemo(
    () => uniqueValues(projects, "projectStatus"),
    [projects],
  );

  const filtered = useMemo(() => {
    const terms = normalize(query)
      .split(" ")
      .filter(Boolean);
    const rows = projects.filter((project) => {
      if (panel !== ALL && project.panel !== panel) return false;
      if (subject !== ALL && project.subjectArea !== subject) return false;
      if (institution !== ALL && project.institution !== institution) return false;
      if (status !== ALL && project.projectStatus !== status) return false;
      if (!terms.length) return true;
      const haystack = getSearchText(project);
      return terms.every((term) => haystack.includes(term));
    });

    return rows.sort((a, b) => {
      if (sortMode === "fund-desc") {
        return (b.fundApprovedNumber ?? 0) - (a.fundApprovedNumber ?? 0);
      }
      if (sortMode === "fund-asc") {
        return (a.fundApprovedNumber ?? 0) - (b.fundApprovedNumber ?? 0);
      }
      if (sortMode === "title") {
        return a.titleEnglish.localeCompare(b.titleEnglish);
      }
      return a.projectNumber.localeCompare(b.projectNumber);
    });
  }, [projects, query, panel, subject, institution, status, sortMode]);

  const selected = useMemo(() => {
    return (
      filtered.find((project) => project.projectNumber === selectedNumber) ??
      filtered[0] ??
      null
    );
  }, [filtered, selectedNumber]);

  const totalFunding = useMemo(() => {
    return filtered.reduce((sum, project) => sum + (project.fundApprovedNumber ?? 0), 0);
  }, [filtered]);

  const panelCounts = useMemo(() => {
    return panels.map((name) => ({
      name,
      count: projects.filter((project) => project.panel === name).length,
    }));
  }, [projects, panels]);

  function resetFilters() {
    setQuery("");
    setPanel(ALL);
    setSubject(ALL);
    setInstitution(ALL);
    setStatus(ALL);
    setSortMode("number");
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">RGC CERG / GRF 2026-27</p>
          <h1>General Research Fund Project Finder</h1>
          <p className="hero-copy">
            1493 个 2026/27 年度新获批项目，按官网 Panel、Subject Area、院校、PI、关键词和资助金额快速检索。
          </p>
          <a className="download-link" href="/cerg_2026_all_subjects_projects.xlsx">
            Download Excel dataset
          </a>
        </div>
        <div className="hero-stats" aria-label="dataset summary">
          <div>
            <strong>{projects.length || "..."}</strong>
            <span>projects</span>
          </div>
          <div>
            <strong>{subjects.length || "..."}</strong>
            <span>subject areas</span>
          </div>
          <div>
            <strong>{formatMoney(totalFunding || null)}</strong>
            <span>shown funding</span>
          </div>
        </div>
      </section>

      <section className="controls" aria-label="project filters">
        <label className="search-box">
          <span>Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="题名、PI、院校、关键词、项目编号"
          />
        </label>
        <label>
          <span>Panel</span>
          <select value={panel} onChange={(event) => setPanel(event.target.value)}>
            <option>{ALL}</option>
            {panels.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Subject</span>
          <select value={subject} onChange={(event) => setSubject(event.target.value)}>
            <option>{ALL}</option>
            {subjects.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Institution</span>
          <select
            value={institution}
            onChange={(event) => setInstitution(event.target.value)}
          >
            <option>{ALL}</option>
            {institutions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>{ALL}</option>
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Sort</span>
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
          >
            <option value="number">Project number</option>
            <option value="fund-desc">Funding high to low</option>
            <option value="fund-asc">Funding low to high</option>
            <option value="title">Title A-Z</option>
          </select>
        </label>
        <button className="reset-button" type="button" onClick={resetFilters}>
          Reset
        </button>
      </section>

      <section className="workspace">
        <aside className="subject-rail" aria-label="official panel counts">
          <p className="rail-title">Official panels</p>
          {panelCounts.map((item) => (
            <button
              key={item.name}
              className={panel === item.name ? "rail-item active" : "rail-item"}
              onClick={() => setPanel(panel === item.name ? ALL : item.name)}
              type="button"
            >
              <span>{item.name}</span>
              <strong>{item.count}</strong>
            </button>
          ))}
        </aside>

        <section className="results" aria-label="project results">
          <div className="results-header">
            <div>
              <p>{filtered.length} results</p>
              <h2>{panel === ALL ? "All 2026 projects" : panel}</h2>
            </div>
            <span>{formatMoney(totalFunding || null)}</span>
          </div>

          <div className="project-list">
            {filtered.map((project) => (
              <button
                key={project.projectNumber}
                className={
                  selected?.projectNumber === project.projectNumber
                    ? "project-row selected"
                    : "project-row"
                }
                onClick={() => {
                  setSelectedNumber(project.projectNumber);
                  setShowAbstract(false);
                }}
                type="button"
              >
                <span className="project-number">{project.projectNumber}</span>
                <span className="project-main">
                  <strong>{project.titleEnglish || project.titleChinese}</strong>
                  <small>
                    {project.principalInvestigatorEnglish} · {project.institution}
                  </small>
                </span>
                <span className="project-meta">
                  <em>{project.subjectArea}</em>
                  <b>{formatMoney(project.fundApprovedNumber)}</b>
                </span>
              </button>
            ))}
            {!filtered.length && (
              <div className="empty-state">
                <h3>No matching projects</h3>
                <p>换一个关键词，或重置筛选条件。</p>
              </div>
            )}
          </div>
        </section>

        <aside className="detail-pane" aria-label="selected project details">
          {selected ? (
            <>
              <div className="detail-topline">
                <span>{selected.projectNumber}</span>
                <span>{selected.projectStatus}</span>
              </div>
              <h2>{selected.titleEnglish || selected.titleChinese}</h2>
              {selected.titleChinese && selected.titleChinese !== selected.titleEnglish && (
                <p className="chinese-title">{selected.titleChinese}</p>
              )}

              <dl className="detail-grid">
                <div>
                  <dt>PI</dt>
                  <dd>{selected.principalInvestigatorEnglish || "未列明"}</dd>
                </div>
                <div>
                  <dt>Institution</dt>
                  <dd>{selected.institution || "未列明"}</dd>
                </div>
                <div>
                  <dt>Department</dt>
                  <dd>{selected.department || "未列明"}</dd>
                </div>
                <div>
                  <dt>Panel</dt>
                  <dd>{selected.panel || "未列明"}</dd>
                </div>
                <div>
                  <dt>Subject</dt>
                  <dd>{selected.subjectArea || "未列明"}</dd>
                </div>
                <div>
                  <dt>Funding</dt>
                  <dd>{formatMoney(selected.fundApprovedNumber)}</dd>
                </div>
                <div>
                  <dt>Exercise year</dt>
                  <dd>{selected.exerciseYear || "2026 / 27"}</dd>
                </div>
              </dl>

              {selected.coInvestigators && (
                <section className="text-block">
                  <h3>Co-investigators</h3>
                  <p>{selected.coInvestigators}</p>
                </section>
              )}

              <section className="text-block">
                <button
                  className="abstract-toggle"
                  type="button"
                  onClick={() => setShowAbstract((value) => !value)}
                >
                  {showAbstract ? "Hide abstract" : "Show abstract"}
                </button>
                {showAbstract && (
                  <p className="abstract-text">
                    {selected.abstract || "No abstract available."}
                  </p>
                )}
              </section>

              <a className="source-link" href={selected.sourceUrl} target="_blank">
                Open RGC detail page
              </a>
            </>
          ) : (
            <div className="empty-state">
              <h3>Select a project</h3>
              <p>项目详情会显示在这里。</p>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
