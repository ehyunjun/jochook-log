"use strict";

const STORAGE_KEY = "jochookLogState";
const MAX_QUARTERS = 10;

const FORMATIONS = {
  "4-4-2": [
    { id: "gk", label: "GK", x: 50, y: 91 },
    { id: "lb", label: "LB", x: 18, y: 72 },
    { id: "lcb", label: "LCB", x: 39, y: 75 },
    { id: "rcb", label: "RCB", x: 61, y: 75 },
    { id: "rb", label: "RB", x: 82, y: 72 },
    { id: "lm", label: "LM", x: 17, y: 49 },
    { id: "lcm", label: "LCM", x: 39, y: 52 },
    { id: "rcm", label: "RCM", x: 61, y: 52 },
    { id: "rm", label: "RM", x: 83, y: 49 },
    { id: "ls", label: "LS", x: 42, y: 25 },
    { id: "rs", label: "RS", x: 58, y: 25 },
  ],
  "4-3-3": [
    { id: "gk", label: "GK", x: 50, y: 91 },
    { id: "lb", label: "LB", x: 18, y: 72 },
    { id: "lcb", label: "LCB", x: 39, y: 75 },
    { id: "rcb", label: "RCB", x: 61, y: 75 },
    { id: "rb", label: "RB", x: 82, y: 72 },
    { id: "lcm", label: "LCM", x: 32, y: 50 },
    { id: "cm", label: "CM", x: 50, y: 54 },
    { id: "rcm", label: "RCM", x: 68, y: 50 },
    { id: "lw", label: "LW", x: 22, y: 25 },
    { id: "st", label: "ST", x: 50, y: 20 },
    { id: "rw", label: "RW", x: 78, y: 25 },
  ],
  "4-2-3-1": [
    { id: "gk", label: "GK", x: 50, y: 91 },
    { id: "lb", label: "LB", x: 18, y: 72 },
    { id: "lcb", label: "LCB", x: 39, y: 75 },
    { id: "rcb", label: "RCB", x: 61, y: 75 },
    { id: "rb", label: "RB", x: 82, y: 72 },
    { id: "ldm", label: "LDM", x: 39, y: 58 },
    { id: "rdm", label: "RDM", x: 61, y: 58 },
    { id: "lw", label: "LW", x: 23, y: 39 },
    { id: "cam", label: "CAM", x: 50, y: 38 },
    { id: "rw", label: "RW", x: 77, y: 39 },
    { id: "st", label: "ST", x: 50, y: 20 },
  ],
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const dom = {
  tabButtons: $$(".tab-button"),
  tabPanels: $$(".tab-panel"),
  createTeamForm: $("#createTeamForm"),
  joinTeamForm: $("#joinTeamForm"),
  teamNameInput: $("#teamNameInput"),
  teamCodeInput: $("#teamCodeInput"),
  createdTeamInfo: $("#createdTeamInfo"),
  joinTeamInfo: $("#joinTeamInfo"),
  teamNameDisplay: $("#teamNameDisplay"),
  teamCodeDisplay: $("#teamCodeDisplay"),
  memberForm: $("#memberForm"),
  memberNameInput: $("#memberNameInput"),
  memberNumberInput: $("#memberNumberInput"),
  memberPositionInput: $("#memberPositionInput"),
  addMercenaryButton: $("#addMercenaryButton"),
  membersGrid: $("#membersGrid"),
  memberDetail: $("#memberDetail"),
  quarterCountSelect: $("#quarterCountSelect"),
  formationSelect: $("#formationSelect"),
  quarterTabs: $("#quarterTabs"),
  formationNotice: $("#formationNotice"),
  formationCaptureArea: $("#formationCaptureArea"),
  squadBoard: $("#squadBoard"),
  playerPoolPanel: $("#playerPoolPanel"),
  copyImageButton: $("#copyImageButton"),
  sharePreview: $("#sharePreview"),
  copyShareButton: $("#copyShareButton"),
  copyStatus: $("#copyStatus"),
  recordForm: $("#recordForm"),
  matchTitleInput: $("#matchTitleInput"),
  matchDateInput: $("#matchDateInput"),
  matchMemoInput: $("#matchMemoInput"),
  appearanceList: $("#appearanceList"),
  goalSelect: $("#goalSelect"),
  assistSelect: $("#assistSelect"),
  addGoalButton: $("#addGoalButton"),
  addAssistButton: $("#addAssistButton"),
  goalDraftList: $("#goalDraftList"),
  assistDraftList: $("#assistDraftList"),
  matchList: $("#matchList"),
};

let state = loadState();
let selectedMemberId = null;
let recordDraft = {
  participants: new Set(),
  goals: [],
  assists: [],
};

function defaultState() {
  return {
    team: { name: "", code: "" },
    members: [],
    formation: {
      quarters: 2,
      shape: "4-3-3",
      activeQuarter: 1,
      squads: {},
    },
    matches: [],
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return normalizeState(saved || defaultState());
  } catch {
    return defaultState();
  }
}

function normalizeState(saved) {
  const base = defaultState();
  const next = {
    ...base,
    ...saved,
    team: { ...base.team, ...(saved.team || {}) },
    formation: { ...base.formation, ...(saved.formation || {}) },
  };

  next.members = Array.isArray(saved.members) ? saved.members : [];
  next.matches = Array.isArray(saved.matches) ? saved.matches : [];
  next.formation.quarters = clamp(Number(next.formation.quarters) || 2, 1, MAX_QUARTERS);
  next.formation.shape = FORMATIONS[next.formation.shape] ? next.formation.shape : "4-3-3";
  next.formation.activeQuarter = clamp(Number(next.formation.activeQuarter) || 1, 1, next.formation.quarters);
  next.formation.squads = next.formation.squads || {};
  ensureQuarterData(next);
  return next;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function makeTeamCode() {
  return String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
}

function ensureQuarterData(targetState = state) {
  if (!targetState.formation.squads) targetState.formation.squads = {};
  for (let quarter = 1; quarter <= targetState.formation.quarters; quarter += 1) {
    if (!targetState.formation.squads[quarter]) {
      targetState.formation.squads[quarter] = { slots: {} };
    }
  }
}

function getMemberName(memberId) {
  const member = state.members.find((item) => item.id === memberId);
  return member ? member.name : "삭제된 선수";
}

function getMemberById(memberId) {
  return state.members.find((item) => item.id === memberId);
}

function countByPlayer(events) {
  return events.reduce((acc, event) => {
    acc[event.playerId] = (acc[event.playerId] || 0) + 1;
    return acc;
  }, {});
}

function getMemberStats(memberId) {
  return state.matches.reduce(
    (stats, match) => {
      if ((match.participants || []).includes(memberId)) stats.appearances += 1;
      stats.goals += (match.goals || []).filter((event) => event.playerId === memberId).length;
      stats.assists += (match.assists || []).filter((event) => event.playerId === memberId).length;
      return stats;
    },
    { appearances: 0, goals: 0, assists: 0 },
  );
}

function renderAll() {
  ensureQuarterData();
  syncRecordDraftWithMembers();
  renderTeam();
  renderFormation();
  renderRecords();
}

function setActiveTab(tabId) {
  dom.tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabId);
  });
  dom.tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === tabId);
  });
}

function renderTeam() {
  dom.teamNameDisplay.textContent = state.team.name || "팀 없음";
  dom.teamCodeDisplay.textContent = state.team.code || "-";

  if (!state.members.length) {
    dom.membersGrid.innerHTML = `<p class="empty-text">아직 등록된 팀원이 없습니다.</p>`;
  } else {
    dom.membersGrid.innerHTML = state.members
      .map((member) => {
        const stats = getMemberStats(member.id);
        const selectedClass = selectedMemberId === member.id ? " active" : "";
        const badge = member.isMercenary ? `<span class="badge">일일 용병</span>` : `<span class="badge">${member.position || "포지션 미정"}</span>`;
        return `
          <article class="member-card${selectedClass}" data-member-id="${member.id}">
            <div class="member-card-header">
              <div>
                <div class="member-name">${escapeHtml(member.name)}</div>
                <p class="helper-text">등번호 ${escapeHtml(member.number || "-")} · ${escapeHtml(member.position || "포지션 미정")}</p>
              </div>
              ${badge}
            </div>
            <div class="stat-row">
              ${statPill(stats.appearances, "출전")}
              ${statPill(stats.goals, "득점")}
              ${statPill(stats.assists, "도움")}
            </div>
            <button class="delete-member" type="button" data-delete-member="${member.id}">삭제</button>
          </article>
        `;
      })
      .join("");
  }

  renderMemberDetail();
}

function statPill(value, label) {
  return `<div class="stat-pill"><strong>${value}</strong><span>${label}</span></div>`;
}

function renderMemberDetail() {
  const member = state.members.find((item) => item.id === selectedMemberId);
  if (!member) {
    selectedMemberId = null;
    dom.memberDetail.innerHTML = `
      <h3>팀원 상세 기록</h3>
      <p class="empty-text">팀원 카드를 선택하면 상세 기록이 표시됩니다.</p>
    `;
    return;
  }

  const stats = getMemberStats(member.id);
  const recentMatches = state.matches
    .filter((match) => {
      const played = (match.participants || []).includes(member.id);
      const scored = (match.goals || []).some((event) => event.playerId === member.id);
      const assisted = (match.assists || []).some((event) => event.playerId === member.id);
      return played || scored || assisted;
    })
    .slice()
    .reverse()
    .slice(0, 5);

  dom.memberDetail.innerHTML = `
    <h3>${escapeHtml(member.name)} 상세 기록</h3>
    <p class="helper-text">등번호 ${escapeHtml(member.number || "-")} · ${escapeHtml(member.position || "포지션 미정")}</p>
    <div class="stat-row">
      ${statPill(stats.appearances, "총 출전")}
      ${statPill(stats.goals, "총 득점")}
      ${statPill(stats.assists, "총 도움")}
    </div>
    <h3>최근 경기 기록</h3>
    ${
      recentMatches.length
        ? `<ul class="recent-list">${recentMatches.map((match) => renderRecentMatch(member.id, match)).join("")}</ul>`
        : `<p class="empty-text">아직 기록된 경기가 없습니다.</p>`
    }
  `;
}

function renderRecentMatch(memberId, match) {
  const goals = (match.goals || []).filter((event) => event.playerId === memberId).length;
  const assists = (match.assists || []).filter((event) => event.playerId === memberId).length;
  const appearance = (match.participants || []).includes(memberId) ? "출전" : "미출전";
  return `
    <li>
      <strong>${escapeHtml(match.title)}</strong>
      <p class="helper-text">${escapeHtml(match.date || "-")} · ${appearance} · ${goals}득점 · ${assists}도움</p>
    </li>
  `;
}

function renderFormation() {
  dom.quarterCountSelect.value = String(state.formation.quarters);
  dom.formationSelect.value = state.formation.shape;

  const quarterButtons = Array.from({ length: state.formation.quarters }, (_, index) => {
    const quarter = index + 1;
    const active = quarter === state.formation.activeQuarter ? "active" : "";
    return `<button class="${active}" type="button" data-quarter="${quarter}">${quarter}쿼터</button>`;
  }).join("");
  const addButtonDisabled = state.formation.quarters >= MAX_QUARTERS ? "disabled" : "";
  dom.quarterTabs.innerHTML = `${quarterButtons}<button class="add-quarter-button" type="button" data-add-quarter ${addButtonDisabled} aria-label="쿼터 추가">+</button>`;

  renderSquadBoard();
  renderPlayerPool();
  renderSharePreview();
}

function renderSquadBoard() {
  const slots = FORMATIONS[state.formation.shape];
  const quarterData = state.formation.squads[state.formation.activeQuarter] || { slots: {} };
  const fieldLines = `
    <span class="pitch-line center-line"></span>
    <span class="pitch-line center-circle"></span>
    <span class="pitch-line penalty-box top"></span>
    <span class="pitch-line penalty-box bottom"></span>
    <span class="pitch-line goal-box top"></span>
    <span class="pitch-line goal-box bottom"></span>
  `;

  dom.squadBoard.innerHTML =
    fieldLines +
    slots
      .map((slot) => {
        const savedSlot = quarterData.slots[slot.id] || {};
        const player = getMemberById(savedSlot.playerId);
        const playerName = player ? player.name : "선수 드롭";
        const playerMeta = player ? `#${player.number || "-"} · ${player.position || "포지션 미정"}` : "드래그해서 배치";
        const emptyClass = player ? "" : " empty";
        return `
          <div class="position-slot" data-slot-id="${slot.id}" style="--x:${slot.x}%; --y:${slot.y}%;">
            <div class="slot-label">${slot.label}</div>
            <div class="slot-player${emptyClass}">
              <strong>${escapeHtml(playerName)}</strong>
              <span>${escapeHtml(playerMeta)}</span>
            </div>
            <input data-slot-note="${slot.id}" type="text" value="${escapeHtml(savedSlot.note || "")}" placeholder="메모" aria-label="${slot.label} 메모" />
            <select class="slot-select" data-slot-player="${slot.id}" aria-label="${slot.label} 선수 선택">
              <option value="">보조 선택</option>
              ${state.members.map((member) => `<option value="${member.id}" ${savedSlot.playerId === member.id ? "selected" : ""}>${escapeHtml(member.name)}</option>`).join("")}
            </select>
          </div>
        `;
      })
      .join("");
}

function renderPlayerPool() {
  if (!state.members.length) {
    dom.playerPoolPanel.innerHTML = `
      <h3>선수 목록</h3>
      <p class="empty-text">나의 팀 화면에서 팀원을 먼저 추가해 주세요.</p>
    `;
    return;
  }

  const placedIds = new Set(
    Object.values(state.formation.squads[state.formation.activeQuarter]?.slots || {})
      .map((slot) => slot.playerId)
      .filter(Boolean),
  );

  dom.playerPoolPanel.innerHTML = `
    <h3>선수 목록</h3>
    <div class="player-pool-list">
      ${state.members
        .map((member) => {
          const placedClass = placedIds.has(member.id) ? " placed" : "";
          const badge = member.isMercenary ? `<span class="badge">용병</span>` : "";
          return `
            <article class="player-pool-card${placedClass}" draggable="true" data-drag-member-id="${member.id}">
              <div class="player-pool-name">
                <span>${escapeHtml(member.name)}</span>
                ${badge}
              </div>
              <div class="player-pool-meta">#${escapeHtml(member.number || "-")} · ${escapeHtml(member.position || "포지션 미정")}</div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderSharePreview() {
  const text = getShareText();
  dom.sharePreview.textContent = text;
}

function getShareText() {
  const quarter = state.formation.activeQuarter;
  const quarterData = state.formation.squads[quarter] || { slots: {} };
  const header = `[조축로그] ${state.team.name || "나의 팀"} ${quarter}쿼터 스쿼드`;
  const lines = FORMATIONS[state.formation.shape].map((slot) => {
    const savedSlot = quarterData.slots[slot.id] || {};
    const playerName = savedSlot.playerId ? getMemberName(savedSlot.playerId) : "미배치";
    const note = savedSlot.note ? savedSlot.note : "-";
    return `${slot.label} - ${playerName} / 메모: ${note}`;
  });

  return `${header}\n포메이션: ${state.formation.shape}\n\n${lines.join("\n")}`;
}

function renderRecords() {
  if (!dom.matchDateInput.value) {
    dom.matchDateInput.value = new Date().toISOString().slice(0, 10);
  }

  dom.appearanceList.innerHTML = state.members.length
    ? state.members
        .map(
          (member) => `
            <label class="check-item">
              <input type="checkbox" value="${member.id}" ${recordDraft.participants.has(member.id) ? "checked" : ""} />
              ${escapeHtml(member.name)}
            </label>
          `,
        )
        .join("")
    : `<p class="empty-text">팀원을 먼저 등록해 주세요.</p>`;

  const selectOptions = `<option value="">선수 선택</option>${state.members
    .map((member) => `<option value="${member.id}">${escapeHtml(member.name)}</option>`)
    .join("")}`;
  dom.goalSelect.innerHTML = selectOptions;
  dom.assistSelect.innerHTML = selectOptions;

  renderDraftLists();
  renderMatchList();
}

function renderDraftLists() {
  dom.goalDraftList.innerHTML = recordDraft.goals.length
    ? recordDraft.goals.map((event) => `<li>${escapeHtml(getMemberName(event.playerId))} 득점</li>`).join("")
    : `<li class="empty-text">추가된 득점 기록이 없습니다.</li>`;

  dom.assistDraftList.innerHTML = recordDraft.assists.length
    ? recordDraft.assists.map((event) => `<li>${escapeHtml(getMemberName(event.playerId))} 어시스트</li>`).join("")
    : `<li class="empty-text">추가된 어시스트 기록이 없습니다.</li>`;
}

function renderMatchList() {
  if (!state.matches.length) {
    dom.matchList.innerHTML = `<p class="empty-text">아직 저장된 경기 기록이 없습니다.</p>`;
    return;
  }

  dom.matchList.innerHTML = state.matches
    .slice()
    .reverse()
    .map((match) => {
      const participants = (match.participants || []).map(getMemberName).join(", ") || "-";
      const goals = formatEventSummary(match.goals || [], "골");
      const assists = formatEventSummary(match.assists || [], "도움");
      return `
        <article class="match-card">
          <h4>${escapeHtml(match.title)}</h4>
          <p class="match-meta">${escapeHtml(match.date || "-")} · ${escapeHtml(match.memo || "메모 없음")}</p>
          <p><strong>출전 선수</strong> ${escapeHtml(participants)}</p>
          <p><strong>득점 기록</strong> ${escapeHtml(goals)}</p>
          <p><strong>어시스트 기록</strong> ${escapeHtml(assists)}</p>
        </article>
      `;
    })
    .join("");
}

function formatEventSummary(events, unit) {
  if (!events.length) return "-";
  const counts = countByPlayer(events);
  return Object.entries(counts)
    .map(([playerId, count]) => `${getMemberName(playerId)} ${count}${unit}`)
    .join(", ");
}

function syncRecordDraftWithMembers() {
  const memberIds = new Set(state.members.map((member) => member.id));
  recordDraft.participants = new Set([...recordDraft.participants].filter((id) => memberIds.has(id)));
  recordDraft.goals = recordDraft.goals.filter((event) => memberIds.has(event.playerId));
  recordDraft.assists = recordDraft.assists.filter((event) => memberIds.has(event.playerId));
}

function addMember({ name, number, position, isMercenary = false }) {
  state.members.push({
    id: uid("member"),
    name,
    number,
    position,
    isMercenary,
    createdAt: new Date().toISOString(),
  });
  saveState();
  renderAll();
}

function deleteMember(memberId) {
  state.members = state.members.filter((member) => member.id !== memberId);
  Object.values(state.formation.squads).forEach((quarterData) => {
    Object.values(quarterData.slots || {}).forEach((slot) => {
      if (slot.playerId === memberId) slot.playerId = "";
    });
  });
  if (selectedMemberId === memberId) selectedMemberId = null;
  saveState();
  renderAll();
}

function addMercenary() {
  const nextNumber = state.members.filter((member) => member.isMercenary).length + 1;
  addMember({
    name: `용병${nextNumber}`,
    number: "-",
    position: "용병",
    isMercenary: true,
  });
}

function updateSquadSlot(slotId, patch) {
  const quarter = state.formation.activeQuarter;
  const quarterData = state.formation.squads[quarter] || { slots: {} };
  quarterData.slots[slotId] = { ...(quarterData.slots[slotId] || {}), ...patch };
  state.formation.squads[quarter] = quarterData;
  saveState();
  renderSharePreview();
}

function placePlayerInSlot(slotId, memberId) {
  if (!getMemberById(memberId)) return;
  const duplicates = getDuplicateSlotLabels(memberId, slotId);
  updateSquadSlot(slotId, { playerId: memberId });
  renderFormation();

  if (duplicates.length) {
    setFormationNotice(`${getMemberName(memberId)} 선수는 이미 ${duplicates.join(", ")}에도 배치되어 있습니다.`, true);
  } else {
    setFormationNotice(`${getMemberName(memberId)} 선수를 배치했습니다.`);
  }
}

function getDuplicateSlotLabels(memberId, nextSlotId) {
  const quarterData = state.formation.squads[state.formation.activeQuarter] || { slots: {} };
  return FORMATIONS[state.formation.shape]
    .filter((slot) => slot.id !== nextSlotId && quarterData.slots[slot.id]?.playerId === memberId)
    .map((slot) => slot.label);
}

function clearDragOverSlots() {
  $$(".position-slot.drag-over").forEach((slot) => slot.classList.remove("drag-over"));
}

function setFormationNotice(message, isWarning = false) {
  dom.formationNotice.textContent = message;
  dom.formationNotice.classList.toggle("warning", isWarning);
}

function saveMatch(event) {
  event.preventDefault();

  const title = dom.matchTitleInput.value.trim();
  const date = dom.matchDateInput.value;
  if (!title || !date) {
    alert("경기명과 경기 날짜를 입력해 주세요.");
    return;
  }

  state.matches.push({
    id: uid("match"),
    title,
    date,
    memo: dom.matchMemoInput.value.trim(),
    participants: [...recordDraft.participants],
    goals: recordDraft.goals,
    assists: recordDraft.assists,
    createdAt: new Date().toISOString(),
  });

  recordDraft = { participants: new Set(), goals: [], assists: [] };
  dom.recordForm.reset();
  dom.matchDateInput.value = new Date().toISOString().slice(0, 10);
  saveState();
  renderAll();
}

async function copyFormationImage() {
  if (!window.html2canvas) {
    setFormationNotice("이미지 복사 라이브러리를 불러오지 못했습니다.", true);
    return;
  }

  try {
    setFormationNotice("포메이션 이미지를 만드는 중입니다.");
    const canvas = await window.html2canvas(dom.formationCaptureArea, {
      backgroundColor: "#f4f8f3",
      scale: 2,
      useCORS: true,
    });
    const blob = await canvasToBlob(canvas);

    if (navigator.clipboard?.write && "ClipboardItem" in window) {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setFormationNotice("포메이션 이미지가 클립보드에 복사되었습니다.");
      return;
    }

    downloadBlob(blob);
    setFormationNotice("브라우저에서 이미지 복사를 지원하지 않아 파일로 저장합니다.", true);
  } catch {
    try {
      const canvas = await window.html2canvas(dom.formationCaptureArea, {
        backgroundColor: "#f4f8f3",
        scale: 2,
        useCORS: true,
      });
      const blob = await canvasToBlob(canvas);
      downloadBlob(blob);
      setFormationNotice("브라우저에서 이미지 복사를 지원하지 않아 파일로 저장합니다.", true);
    } catch {
      setFormationNotice("이미지 복사에 실패했습니다. 다시 시도해 주세요.", true);
    }
  }
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Canvas blob creation failed"));
      }
    }, "image/png");
  });
}

function downloadBlob(blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `jochook-log-${state.formation.activeQuarter}q.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function bindEvents() {
  dom.tabButtons.forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab));
  });

  dom.createTeamForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = dom.teamNameInput.value.trim();
    if (!name) {
      dom.createdTeamInfo.textContent = "팀 이름을 입력해 주세요.";
      return;
    }

    state.team = { name, code: makeTeamCode() };
    saveState();
    dom.createdTeamInfo.textContent = `팀 이름: ${state.team.name} / 팀 코드: ${state.team.code}`;
    renderAll();
    setActiveTab("team");
  });

  dom.joinTeamForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const code = dom.teamCodeInput.value.trim();
    if (!code) {
      dom.joinTeamInfo.textContent = "팀 코드를 입력해 주세요.";
      return;
    }

    state.team = {
      name: state.team.name || "참가한 팀",
      code,
    };
    saveState();
    dom.joinTeamInfo.textContent = `팀 코드 ${code}로 참가 처리되었습니다.`;
    renderAll();
    setActiveTab("team");
  });

  dom.memberForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = dom.memberNameInput.value.trim();
    if (!name) return;

    addMember({
      name,
      number: dom.memberNumberInput.value.trim(),
      position: dom.memberPositionInput.value.trim(),
    });
    dom.memberForm.reset();
  });

  dom.addMercenaryButton.addEventListener("click", addMercenary);

  dom.membersGrid.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-delete-member]");
    if (deleteButton) {
      event.stopPropagation();
      deleteMember(deleteButton.dataset.deleteMember);
      return;
    }

    const card = event.target.closest("[data-member-id]");
    if (!card) return;
    selectedMemberId = card.dataset.memberId;
    renderTeam();
  });

  dom.quarterCountSelect.addEventListener("change", () => {
    state.formation.quarters = clamp(Number(dom.quarterCountSelect.value), 1, MAX_QUARTERS);
    state.formation.activeQuarter = clamp(state.formation.activeQuarter, 1, state.formation.quarters);
    ensureQuarterData();
    saveState();
    renderFormation();
  });

  dom.formationSelect.addEventListener("change", () => {
    state.formation.shape = dom.formationSelect.value;
    saveState();
    renderFormation();
  });

  dom.quarterTabs.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-quarter]");
    if (addButton) {
      if (state.formation.quarters >= MAX_QUARTERS) return;
      state.formation.quarters += 1;
      state.formation.activeQuarter = state.formation.quarters;
      ensureQuarterData();
      saveState();
      renderFormation();
      setFormationNotice(`${state.formation.activeQuarter}쿼터가 추가되었습니다.`);
      return;
    }

    const button = event.target.closest("[data-quarter]");
    if (!button) return;
    state.formation.activeQuarter = Number(button.dataset.quarter);
    saveState();
    renderFormation();
  });

  dom.squadBoard.addEventListener("change", (event) => {
    const select = event.target.closest("[data-slot-player]");
    if (!select) return;
    if (select.value) {
      placePlayerInSlot(select.dataset.slotPlayer, select.value);
      return;
    }
    updateSquadSlot(select.dataset.slotPlayer, { playerId: "" });
    renderFormation();
    setFormationNotice("슬롯 배치를 비웠습니다.");
  });

  dom.squadBoard.addEventListener("dragover", (event) => {
    const slot = event.target.closest("[data-slot-id]");
    if (!slot) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    slot.classList.add("drag-over");
  });

  dom.squadBoard.addEventListener("dragleave", (event) => {
    const slot = event.target.closest("[data-slot-id]");
    if (!slot || slot.contains(event.relatedTarget)) return;
    slot.classList.remove("drag-over");
  });

  dom.squadBoard.addEventListener("drop", (event) => {
    const slot = event.target.closest("[data-slot-id]");
    if (!slot) return;
    event.preventDefault();
    const memberId = event.dataTransfer.getData("text/plain");
    clearDragOverSlots();
    placePlayerInSlot(slot.dataset.slotId, memberId);
  });

  dom.playerPoolPanel.addEventListener("dragstart", (event) => {
    const card = event.target.closest("[data-drag-member-id]");
    if (!card) return;
    event.dataTransfer.setData("text/plain", card.dataset.dragMemberId);
    event.dataTransfer.effectAllowed = "copy";
    card.classList.add("dragging");
  });

  dom.playerPoolPanel.addEventListener("dragend", (event) => {
    const card = event.target.closest("[data-drag-member-id]");
    if (card) card.classList.remove("dragging");
    clearDragOverSlots();
  });

  dom.squadBoard.addEventListener("input", (event) => {
    const input = event.target.closest("[data-slot-note]");
    if (!input) return;
    updateSquadSlot(input.dataset.slotNote, { note: input.value });
  });

  dom.copyImageButton.addEventListener("click", copyFormationImage);

  dom.copyShareButton.addEventListener("click", async () => {
    const text = getShareText();
    try {
      await navigator.clipboard.writeText(text);
      dom.copyStatus.textContent = "공유용 텍스트가 복사되었습니다.";
    } catch {
      fallbackCopy(text);
      dom.copyStatus.textContent = "공유용 텍스트가 복사되었습니다.";
    }
  });

  dom.appearanceList.addEventListener("change", (event) => {
    const checkbox = event.target.closest('input[type="checkbox"]');
    if (!checkbox) return;
    if (checkbox.checked) {
      recordDraft.participants.add(checkbox.value);
    } else {
      recordDraft.participants.delete(checkbox.value);
    }
  });

  dom.addGoalButton.addEventListener("click", () => {
    if (!dom.goalSelect.value) return;
    recordDraft.goals.push({ playerId: dom.goalSelect.value });
    dom.goalSelect.value = "";
    renderDraftLists();
  });

  dom.addAssistButton.addEventListener("click", () => {
    if (!dom.assistSelect.value) return;
    recordDraft.assists.push({ playerId: dom.assistSelect.value });
    dom.assistSelect.value = "";
    renderDraftLists();
  });

  dom.recordForm.addEventListener("submit", saveMatch);
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

bindEvents();
renderAll();
