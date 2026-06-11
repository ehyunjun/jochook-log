"use strict";

const STORAGE_KEY = "jochookLogState";
const MAX_QUARTERS = 10;

const FORMATIONS = {
  "4-4-2": [
    { id: "gk", label: "GK", x: 50, y: 92 },
    { id: "lb", label: "LB", x: 15, y: 73 },
    { id: "lcb", label: "LCB", x: 37, y: 76 },
    { id: "rcb", label: "RCB", x: 63, y: 76 },
    { id: "rb", label: "RB", x: 85, y: 73 },
    { id: "lm", label: "LM", x: 15, y: 49 },
    { id: "lcm", label: "LCM", x: 37, y: 53 },
    { id: "rcm", label: "RCM", x: 63, y: 53 },
    { id: "rm", label: "RM", x: 85, y: 49 },
    { id: "ls", label: "LS", x: 39, y: 24 },
    { id: "rs", label: "RS", x: 61, y: 24 },
  ],
  "4-3-3": [
    { id: "gk", label: "GK", x: 50, y: 92 },
    { id: "lb", label: "LB", x: 15, y: 73 },
    { id: "lcb", label: "LCB", x: 37, y: 76 },
    { id: "rcb", label: "RCB", x: 63, y: 76 },
    { id: "rb", label: "RB", x: 85, y: 73 },
    { id: "lcm", label: "LCM", x: 30, y: 52 },
    { id: "cm", label: "CM", x: 50, y: 57 },
    { id: "rcm", label: "RCM", x: 70, y: 52 },
    { id: "lw", label: "LW", x: 20, y: 25 },
    { id: "st", label: "ST", x: 50, y: 19 },
    { id: "rw", label: "RW", x: 80, y: 25 },
  ],
  "4-2-3-1": [
    { id: "gk", label: "GK", x: 50, y: 92 },
    { id: "lb", label: "LB", x: 15, y: 73 },
    { id: "lcb", label: "LCB", x: 37, y: 76 },
    { id: "rcb", label: "RCB", x: 63, y: 76 },
    { id: "rb", label: "RB", x: 85, y: 73 },
    { id: "ldm", label: "LDM", x: 36, y: 59 },
    { id: "rdm", label: "RDM", x: 64, y: 59 },
    { id: "lw", label: "LW", x: 20, y: 40 },
    { id: "cam", label: "CAM", x: 50, y: 38 },
    { id: "rw", label: "RW", x: 80, y: 40 },
    { id: "st", label: "ST", x: 50, y: 19 },
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
  membersGrid: $("#membersGrid"),
  memberDetail: $("#memberDetail"),
  prepDateInput: $("#prepDateInput"),
  prepOpponentInput: $("#prepOpponentInput"),
  prepTitleInput: $("#prepTitleInput"),
  matchPrepCard: $(".match-prep-card"),
  matchPrepBody: $("#matchPrepBody"),
  togglePrepButton: $("#togglePrepButton"),
  formationParticipantList: $("#formationParticipantList"),
  quarterCountSelect: $("#quarterCountSelect"),
  formationSelect: $("#formationSelect"),
  quarterTabs: $("#quarterTabs"),
  formationNotice: $("#formationNotice"),
  formationCaptureArea: $("#formationCaptureArea"),
  formationBoardHeader: $("#formationBoardHeader"),
  squadBoard: $("#squadBoard"),
  playerPoolPanel: $("#playerPoolPanel"),
  copyImageButton: $("#copyImageButton"),
  slotMemoModal: $("#slotMemoModal"),
  memoModalTitle: $("#memoModalTitle"),
  slotMemoInput: $("#slotMemoInput"),
  closeMemoButton: $("#closeMemoButton"),
  saveMemoButton: $("#saveMemoButton"),
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
let selectedPoolPlayerId = null;
let activeMemoSlotId = null;
let recordDraft = {
  participants: new Set(),
  goals: [],
  assists: [],
  hydratedFromFormation: false,
};

function defaultState() {
  return {
    team: { name: "", code: "" },
    members: [],
    formation: {
      quarters: 2,
      shape: "4-3-3",
      activeQuarter: 1,
      matchInfo: {
        date: "",
        opponent: "",
        title: "",
        participantIds: [],
        guests: [],
        isPrepCollapsed: false,
      },
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
  const hadMatchInfo = Boolean(saved.formation?.matchInfo);
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
  next.formation.matchInfo = {
    ...base.formation.matchInfo,
    ...(next.formation.matchInfo || {}),
  };
  next.formation.matchInfo.isPrepCollapsed = Boolean(next.formation.matchInfo.isPrepCollapsed);
  next.formation.matchInfo.participantIds = Array.isArray(next.formation.matchInfo.participantIds)
    ? next.formation.matchInfo.participantIds.filter((id) => next.members.some((member) => member.id === id))
    : [];
  next.formation.matchInfo.guests = Array.isArray(next.formation.matchInfo.guests) ? next.formation.matchInfo.guests : [];
  if (!hadMatchInfo) {
    next.formation.matchInfo.participantIds = next.members.map((member) => member.id);
  }
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

function sortByName(players) {
  return [...players].sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));
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
  return getPlayerName(memberId);
}

function getMemberById(memberId) {
  return state.members.find((item) => item.id === memberId);
}

function getMatchInfo() {
  if (!state.formation.matchInfo) {
    state.formation.matchInfo = defaultState().formation.matchInfo;
  }
  return state.formation.matchInfo;
}

function getGuestById(playerId) {
  return getMatchInfo().guests.find((guest) => guest.id === playerId);
}

function getPlayerById(playerId, match = null) {
  const member = getMemberById(playerId);
  if (member) return { ...member, isGuest: false };
  const guest = getGuestById(playerId);
  if (guest) return { ...guest, number: guest.number || "", position: "용병", isGuest: true };
  const savedGuest = match?.guests?.find((item) => item.id === playerId);
  if (savedGuest) return { ...savedGuest, number: savedGuest.number || "", position: "용병", isGuest: true };
  return null;
}

function getPlayerName(playerId, match = null) {
  return getPlayerById(playerId, match)?.name || "삭제된 선수";
}

function getFormationPlayers() {
  const matchInfo = getMatchInfo();
  const selectedMembers = state.members.filter((member) => matchInfo.participantIds.includes(member.id));
  const guests = matchInfo.guests.map((guest) => ({
    ...guest,
    number: guest.number || "",
    position: "용병",
    isGuest: true,
  }));
  return sortByName([...selectedMembers, ...guests]);
}

function getRecordPlayers() {
  return sortByName([
    ...state.members.map((member) => ({ ...member, isGuest: false })),
    ...getMatchInfo().guests.map((guest) => ({
      ...guest,
      number: guest.number || "",
      position: "용병",
      isGuest: true,
    })),
  ]);
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
  syncRecordDraftWithPlayers();
  renderTeam();
  renderMatchPrep();
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
    dom.membersGrid.innerHTML = sortByName(state.members)
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

function renderMatchPrep() {
  const matchInfo = getMatchInfo();
  dom.prepDateInput.value = matchInfo.date || "";
  dom.prepOpponentInput.value = matchInfo.opponent || "";
  dom.prepTitleInput.value = matchInfo.title || "";
  dom.matchPrepCard.classList.toggle("collapsed", matchInfo.isPrepCollapsed);
  dom.togglePrepButton.textContent = matchInfo.isPrepCollapsed ? "펼치기 ▼" : "접기 ▲";
  dom.togglePrepButton.setAttribute("aria-expanded", String(!matchInfo.isPrepCollapsed));

  dom.formationParticipantList.innerHTML = state.members.length
    ? sortByName(state.members)
        .map(
          (member) => `
            <label class="prep-check">
              <input type="checkbox" value="${member.id}" data-prep-participant ${matchInfo.participantIds.includes(member.id) ? "checked" : ""} />
              ${escapeHtml(member.name)}
            </label>
          `,
        )
        .join("")
    : `<p class="empty-text">나의 팀 화면에서 팀원을 먼저 추가해 주세요.</p>`;
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

  renderBoardHeader();
  renderSquadBoard();
  renderPlayerPool();
}

function renderBoardHeader() {
  const teamName = state.team.name || "나의 팀";
  dom.formationBoardHeader.textContent = `${teamName} · ${state.formation.activeQuarter}쿼터 · ${state.formation.shape} 포메이션`;
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
        const player = getPlayerById(savedSlot.playerId);
        const playerName = player ? player.name : "-";
        const emptyClass = player ? "" : " empty";
        const noteTitle = savedSlot.note ? `메모: ${savedSlot.note}` : "메모";
        const noteClass = savedSlot.note ? " has-note" : "";
        const draggable = player ? `draggable="true" data-slot-player-id="${player.id}"` : "";
        return `
          <div class="position-slot" data-slot-id="${slot.id}" ${draggable} tabindex="0" style="--x:${slot.x}%; --y:${slot.y}%;">
            <div class="slot-label">${slot.label}</div>
            <div class="slot-player${emptyClass}">
              <strong>${escapeHtml(playerName)}</strong>
              ${savedSlot.note ? `<span class="slot-note">${escapeHtml(savedSlot.note)}</span>` : ""}
            </div>
            <button class="slot-note-button${noteClass}" type="button" data-slot-note-open="${slot.id}" title="${escapeHtml(noteTitle)}" aria-label="${slot.label} 메모">+</button>
          </div>
        `;
      })
      .join("");
}

function renderPlayerPool() {
  const placedIds = new Set(
    Object.values(state.formation.squads[state.formation.activeQuarter]?.slots || {})
      .map((slot) => slot.playerId)
      .filter(Boolean),
  );
  const players = getFormationPlayers();
  const unplacedPlayers = players.filter((player) => !placedIds.has(player.id));
  const selectedPlayer = unplacedPlayers.find((player) => player.id === selectedPoolPlayerId);
  if (!selectedPlayer) {
    selectedPoolPlayerId = null;
  }
  const selectedHint = selectedPlayer
    ? `<p class="selected-player-hint"><strong>선택된 선수: ${escapeHtml(selectedPlayer.name)}</strong><span>배치할 포지션을 눌러주세요.</span></p>`
    : "";
  const playerListMarkup = unplacedPlayers.length
    ? unplacedPlayers
        .map((player) => {
          const selectedClass = player.id === selectedPoolPlayerId ? " selected" : "";
          const guestActions = player.isGuest
            ? `
              <div class="guest-actions">
                <button class="secondary-button" type="button" data-edit-guest="${player.id}">수정</button>
                <button class="delete-guest-button" type="button" data-delete-guest="${player.id}">삭제</button>
              </div>
            `
            : "";
          return `
            <article class="player-pool-card${player.isGuest ? " guest-card" : ""}${selectedClass}" draggable="true" data-drag-player-id="${player.id}" tabindex="0">
              <div class="player-pool-name">
                <span>${escapeHtml(player.name)}</span>
              </div>
              <div class="player-pool-meta">${player.isGuest ? "용병" : `#${escapeHtml(player.number || "-")} · ${escapeHtml(player.position || "포지션 미정")}`}</div>
              ${guestActions}
            </article>
          `;
        })
        .join("")
    : `<p class="empty-text">${players.length ? "모든 후보선수가 배치되었습니다." : "경기 준비에서 출전 선수를 선택해 주세요."}</p>`;

  dom.playerPoolPanel.innerHTML = `
    <div class="player-pool-header">
      <h3>후보선수</h3>
    </div>
    ${selectedHint}
    <div class="player-pool-list">
      ${playerListMarkup}
    </div>
    <button class="secondary-button add-guest-panel-button" type="button" data-add-guest>용병 추가</button>
  `;
}

function renderRecords() {
  hydrateRecordDraftFromFormation();
  if (!dom.matchDateInput.value) {
    dom.matchDateInput.value = getMatchInfo().date || new Date().toISOString().slice(0, 10);
  }
  if (!dom.matchTitleInput.value && getMatchInfo().title) {
    dom.matchTitleInput.value = getMatchInfo().title;
  }
  if (!dom.matchMemoInput.value && getMatchInfo().opponent) {
    dom.matchMemoInput.value = getMatchInfo().opponent;
  }

  const recordPlayers = getRecordPlayers();
  dom.appearanceList.innerHTML = recordPlayers.length
    ? recordPlayers
        .map(
          (player) => `
            <label class="check-item">
              <input type="checkbox" value="${player.id}" ${recordDraft.participants.has(player.id) ? "checked" : ""} />
              ${escapeHtml(player.name)}
            </label>
          `,
        )
        .join("")
    : `<p class="empty-text">팀원을 먼저 등록해 주세요.</p>`;

  const selectOptions = `<option value="">선수 선택</option>${recordPlayers
    .map((player) => `<option value="${player.id}">${escapeHtml(player.name)}</option>`)
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
      const participants = (match.participants || []).map((playerId) => getPlayerName(playerId, match)).join(", ") || "-";
      const goals = formatEventSummary(match.goals || [], "골", match);
      const assists = formatEventSummary(match.assists || [], "도움", match);
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

function formatEventSummary(events, unit, match = null) {
  if (!events.length) return "-";
  const counts = countByPlayer(events);
  return Object.entries(counts)
    .map(([playerId, count]) => `${getPlayerName(playerId, match)} ${count}${unit}`)
    .join(", ");
}

function hydrateRecordDraftFromFormation() {
  if (recordDraft.hydratedFromFormation || recordDraft.participants.size) return;
  const playerIds = getFormationPlayers().map((player) => player.id);
  if (!playerIds.length) return;
  recordDraft.participants = new Set(playerIds);
  recordDraft.hydratedFromFormation = true;
}

function syncRecordDraftWithPlayers() {
  const playerIds = new Set(getRecordPlayers().map((player) => player.id));
  recordDraft.participants = new Set([...recordDraft.participants].filter((id) => playerIds.has(id)));
  recordDraft.goals = recordDraft.goals.filter((event) => playerIds.has(event.playerId));
  recordDraft.assists = recordDraft.assists.filter((event) => playerIds.has(event.playerId));
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
  const matchInfo = getMatchInfo();
  matchInfo.participantIds = matchInfo.participantIds.filter((id) => id !== memberId);
  Object.values(state.formation.squads).forEach((quarterData) => {
    Object.values(quarterData.slots || {}).forEach((slot) => {
      if (slot.playerId === memberId) slot.playerId = "";
    });
  });
  if (selectedMemberId === memberId) selectedMemberId = null;
  saveState();
  renderAll();
}

function addGuest() {
  const matchInfo = getMatchInfo();
  const nextNumber = matchInfo.guests.length + 1;
  const guest = {
    id: uid("guest"),
    name: `용병${nextNumber}`,
    number: "",
    position: "용병",
    isGuest: true,
  };
  matchInfo.guests.push(guest);
  recordDraft.participants.add(guest.id);
  recordDraft.hydratedFromFormation = true;
  saveState();
  renderAll();
  setFormationNotice(`용병${nextNumber} 선수를 추가했습니다.`);
}

function editGuest(guestId) {
  const guest = getGuestById(guestId);
  if (!guest) return;
  const nextName = prompt("용병 이름을 입력해 주세요.", guest.name);
  if (nextName === null) return;
  const trimmedName = nextName.trim();
  if (!trimmedName) return;
  guest.name = trimmedName;
  saveState();
  renderAll();
  setFormationNotice(`${trimmedName} 이름으로 변경했습니다.`);
}

function deleteGuest(guestId) {
  const guest = getGuestById(guestId);
  if (!guest) return;
  const matchInfo = getMatchInfo();
  matchInfo.guests = matchInfo.guests.filter((item) => item.id !== guestId);
  removePlayerFromAllSlots(guestId);
  recordDraft.participants.delete(guestId);
  recordDraft.goals = recordDraft.goals.filter((event) => event.playerId !== guestId);
  recordDraft.assists = recordDraft.assists.filter((event) => event.playerId !== guestId);
  saveState();
  renderAll();
  setFormationNotice(`${guest.name} 선수를 삭제했습니다.`);
}

function cleanFormationSlotsForAvailablePlayers() {
  const availableIds = new Set(getFormationPlayers().map((player) => player.id));
  Object.values(state.formation.squads).forEach((quarterData) => {
    Object.values(quarterData.slots || {}).forEach((slot) => {
      if (slot.playerId && !availableIds.has(slot.playerId)) {
        slot.playerId = "";
      }
    });
  });
}

function removePlayerFromAllSlots(playerId) {
  Object.values(state.formation.squads).forEach((quarterData) => {
    Object.values(quarterData.slots || {}).forEach((slot) => {
      if (slot.playerId === playerId) {
        slot.playerId = "";
      }
    });
  });
}

function updateSquadSlot(slotId, patch) {
  const quarter = state.formation.activeQuarter;
  const quarterData = state.formation.squads[quarter] || { slots: {} };
  quarterData.slots[slotId] = { ...(quarterData.slots[slotId] || {}), ...patch };
  state.formation.squads[quarter] = quarterData;
  saveState();
}

function clearSlotPlayer(slotId) {
  const quarterData = state.formation.squads[state.formation.activeQuarter] || { slots: {} };
  const playerId = quarterData.slots[slotId]?.playerId;
  if (!playerId) return;
  updateSquadSlot(slotId, { playerId: "" });
  renderFormation();
  setFormationNotice(`${getPlayerName(playerId)} 선수를 출전 선수 목록으로 되돌렸습니다.`);
}

function movePlayerBetweenSlots(sourceSlotId, targetSlotId) {
  const quarterData = state.formation.squads[state.formation.activeQuarter] || { slots: {} };
  const sourceSlot = quarterData.slots[sourceSlotId] || {};
  const targetSlot = quarterData.slots[targetSlotId] || {};
  const sourcePlayerId = sourceSlot.playerId;
  const targetPlayerId = targetSlot.playerId || "";
  if (!sourcePlayerId || sourceSlotId === targetSlotId) return;
  quarterData.slots[targetSlotId] = { ...targetSlot, playerId: sourcePlayerId };
  quarterData.slots[sourceSlotId] = { ...sourceSlot, playerId: targetPlayerId };
  state.formation.squads[state.formation.activeQuarter] = quarterData;
  saveState();
  renderFormation();
  setFormationNotice(targetPlayerId ? "선수 위치를 교체했습니다." : `${getPlayerName(sourcePlayerId)} 선수를 이동했습니다.`);
}

function placePlayerInSlot(slotId, playerId) {
  if (!getFormationPlayers().some((player) => player.id === playerId)) return;
  const duplicates = getDuplicateSlotLabels(playerId, slotId);
  updateSquadSlot(slotId, { playerId });
  renderFormation();

  if (duplicates.length) {
    setFormationNotice(`${getPlayerName(playerId)} 선수는 이미 ${duplicates.join(", ")}에도 배치되어 있습니다.`, true);
  } else {
    setFormationNotice(`${getPlayerName(playerId)} 선수를 배치했습니다.`);
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

function setDragPayload(event, payload) {
  const serialized = JSON.stringify(payload);
  event.dataTransfer.setData("application/json", serialized);
  event.dataTransfer.setData("text/plain", payload.playerId || "");
  if (payload.type === "board-player") {
    event.dataTransfer.setData("application/x-jochook-board-player", payload.fromSlotId);
  }
}

function getDragPayload(event) {
  try {
    const rawPayload = event.dataTransfer.getData("application/json");
    return rawPayload ? JSON.parse(rawPayload) : null;
  } catch {
    return null;
  }
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
    guests: getMatchInfo().guests.filter((guest) => {
      const inParticipants = recordDraft.participants.has(guest.id);
      const inGoals = recordDraft.goals.some((eventItem) => eventItem.playerId === guest.id);
      const inAssists = recordDraft.assists.some((eventItem) => eventItem.playerId === guest.id);
      return inParticipants || inGoals || inAssists;
    }),
    createdAt: new Date().toISOString(),
  });

  recordDraft = { participants: new Set(), goals: [], assists: [], hydratedFromFormation: false };
  dom.recordForm.reset();
  dom.matchDateInput.value = new Date().toISOString().slice(0, 10);
  saveState();
  renderAll();
}

function openMemoModal(slotId) {
  activeMemoSlotId = slotId;
  const slot = FORMATIONS[state.formation.shape].find((item) => item.id === slotId);
  const quarterData = state.formation.squads[state.formation.activeQuarter] || { slots: {} };
  const savedSlot = quarterData.slots[slotId] || {};
  dom.memoModalTitle.textContent = `${state.formation.activeQuarter}쿼터 ${slot?.label || ""} 메모`;
  dom.slotMemoInput.value = savedSlot.note || "";
  dom.slotMemoModal.classList.remove("hidden");
  dom.slotMemoModal.setAttribute("aria-hidden", "false");
  dom.slotMemoInput.focus();
}

function closeMemoModal() {
  activeMemoSlotId = null;
  dom.slotMemoModal.classList.add("hidden");
  dom.slotMemoModal.setAttribute("aria-hidden", "true");
}

function saveMemo() {
  if (!activeMemoSlotId) return;
  updateSquadSlot(activeMemoSlotId, { note: dom.slotMemoInput.value.trim() });
  closeMemoModal();
  renderFormation();
  setFormationNotice("메모가 저장되었습니다.");
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

  dom.prepDateInput.addEventListener("input", () => {
    getMatchInfo().date = dom.prepDateInput.value;
    saveState();
  });

  dom.prepOpponentInput.addEventListener("input", () => {
    getMatchInfo().opponent = dom.prepOpponentInput.value.trim();
    saveState();
  });

  dom.prepTitleInput.addEventListener("input", () => {
    getMatchInfo().title = dom.prepTitleInput.value.trim();
    saveState();
  });

  dom.togglePrepButton.addEventListener("click", () => {
    const matchInfo = getMatchInfo();
    matchInfo.isPrepCollapsed = !matchInfo.isPrepCollapsed;
    saveState();
    renderMatchPrep();
  });

  dom.formationParticipantList.addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-prep-participant]");
    if (!checkbox) return;
    const matchInfo = getMatchInfo();
    if (checkbox.checked) {
      matchInfo.participantIds = [...new Set([...matchInfo.participantIds, checkbox.value])];
    } else {
      matchInfo.participantIds = matchInfo.participantIds.filter((id) => id !== checkbox.value);
    }
    cleanFormationSlotsForAvailablePlayers();
    recordDraft.participants = new Set(getFormationPlayers().map((player) => player.id));
    recordDraft.hydratedFromFormation = true;
    saveState();
    renderAll();
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

  dom.squadBoard.addEventListener("dragover", (event) => {
    const slot = event.target.closest("[data-slot-id]");
    if (!slot) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = Array.from(event.dataTransfer.types).includes("application/x-jochook-board-player") ? "move" : "copy";
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
    const payload = getDragPayload(event);
    clearDragOverSlots();
    if (payload?.type === "board-player") {
      movePlayerBetweenSlots(payload.fromSlotId, slot.dataset.slotId);
      return;
    }
    if (payload?.type === "pool-player") {
      placePlayerInSlot(slot.dataset.slotId, payload.playerId);
    }
  });

  dom.squadBoard.addEventListener("dragstart", (event) => {
    const slot = event.target.closest("[data-slot-id]");
    if (!slot?.dataset.slotPlayerId) return;
    setDragPayload(event, {
      type: "board-player",
      playerId: slot.dataset.slotPlayerId,
      fromSlotId: slot.dataset.slotId,
    });
    event.dataTransfer.effectAllowed = "move";
    slot.classList.add("dragging");
  });

  dom.squadBoard.addEventListener("dragend", (event) => {
    const slot = event.target.closest("[data-slot-id]");
    if (slot) slot.classList.remove("dragging");
    clearDragOverSlots();
    dom.playerPoolPanel.classList.remove("drop-over");
  });

  dom.playerPoolPanel.addEventListener("dragstart", (event) => {
    const card = event.target.closest("[data-drag-player-id]");
    if (!card) return;
    setDragPayload(event, {
      type: "pool-player",
      playerId: card.dataset.dragPlayerId,
    });
    event.dataTransfer.effectAllowed = "copy";
    card.classList.add("dragging");
  });

  dom.playerPoolPanel.addEventListener("dragend", (event) => {
    const card = event.target.closest("[data-drag-player-id]");
    if (card) card.classList.remove("dragging");
    clearDragOverSlots();
  });

  dom.playerPoolPanel.addEventListener("dragover", (event) => {
    if (!Array.from(event.dataTransfer.types).includes("application/x-jochook-board-player")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    dom.playerPoolPanel.classList.add("drop-over");
  });

  dom.playerPoolPanel.addEventListener("dragleave", (event) => {
    if (dom.playerPoolPanel.contains(event.relatedTarget)) return;
    dom.playerPoolPanel.classList.remove("drop-over");
  });

  dom.playerPoolPanel.addEventListener("drop", (event) => {
    const payload = getDragPayload(event);
    if (payload?.type !== "board-player") return;
    event.preventDefault();
    dom.playerPoolPanel.classList.remove("drop-over");
    clearSlotPlayer(payload.fromSlotId);
  });

  dom.playerPoolPanel.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-guest]");
    if (addButton) {
      addGuest();
      return;
    }

    const editButton = event.target.closest("[data-edit-guest]");
    if (editButton) {
      editGuest(editButton.dataset.editGuest);
      return;
    }

    const deleteButton = event.target.closest("[data-delete-guest]");
    if (deleteButton) {
      deleteGuest(deleteButton.dataset.deleteGuest);
      return;
    }

    const card = event.target.closest("[data-drag-player-id]");
    if (!card) return;
    selectedPoolPlayerId = selectedPoolPlayerId === card.dataset.dragPlayerId ? null : card.dataset.dragPlayerId;
    renderFormation();
  });

  dom.squadBoard.addEventListener("click", (event) => {
    const button = event.target.closest("[data-slot-note-open]");
    if (button) {
      openMemoModal(button.dataset.slotNoteOpen);
      return;
    }

    const slot = event.target.closest("[data-slot-id]");
    if (!slot || !selectedPoolPlayerId) return;
    const playerId = selectedPoolPlayerId;
    selectedPoolPlayerId = null;
    placePlayerInSlot(slot.dataset.slotId, playerId);
  });

  dom.copyImageButton.addEventListener("click", copyFormationImage);

  dom.closeMemoButton.addEventListener("click", closeMemoModal);
  dom.saveMemoButton.addEventListener("click", saveMemo);
  dom.slotMemoModal.addEventListener("click", (event) => {
    if (event.target === dom.slotMemoModal) closeMemoModal();
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

bindEvents();
renderAll();
