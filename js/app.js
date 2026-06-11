"use strict";

const STORAGE_KEY = "jochookLogState";
const MAX_QUARTERS = 10;
const SUPABASE_URL = "https://hpobxpmhisfpfcurqvkv.supabase.co";
// anon/public key만 입력하세요. service_role 키는 브라우저 코드에 넣지 않습니다.
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwb2J4cG1oaXNmcGZjdXJxdmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzg0NDcsImV4cCI6MjA5Njc1NDQ0N30.xgXc3FeWit2JsQC5dAdjNY-oOQ91Yq4qaGq0GT8H5Zg";
const supabaseClient =
  window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes("입력")
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const FORMATIONS = {
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
  "4-1-4-1": [
    { id: "gk", label: "GK", x: 50, y: 92 },
    { id: "lb", label: "LB", x: 15, y: 73 },
    { id: "lcb", label: "LCB", x: 37, y: 76 },
    { id: "rcb", label: "RCB", x: 63, y: 76 },
    { id: "rb", label: "RB", x: 85, y: 73 },
    { id: "cdm", label: "CDM", x: 50, y: 61 },
    { id: "lm", label: "LM", x: 16, y: 44 },
    { id: "lcm", label: "LCM", x: 39, y: 48 },
    { id: "rcm", label: "RCM", x: 61, y: 48 },
    { id: "rm", label: "RM", x: 84, y: 44 },
    { id: "st", label: "ST", x: 50, y: 20 },
  ],
  "4-3-1-2": [
    { id: "gk", label: "GK", x: 50, y: 92 },
    { id: "lb", label: "LB", x: 15, y: 73 },
    { id: "lcb", label: "LCB", x: 37, y: 76 },
    { id: "rcb", label: "RCB", x: 63, y: 76 },
    { id: "rb", label: "RB", x: 85, y: 73 },
    { id: "lcm", label: "LCM", x: 34, y: 54 },
    { id: "cm", label: "CM", x: 50, y: 58 },
    { id: "rcm", label: "RCM", x: 66, y: 54 },
    { id: "cam", label: "CAM", x: 50, y: 36 },
    { id: "ls", label: "LS", x: 40, y: 20 },
    { id: "rs", label: "RS", x: 60, y: 20 },
  ],
  "4-2-2-2": [
    { id: "gk", label: "GK", x: 50, y: 92 },
    { id: "lb", label: "LB", x: 15, y: 73 },
    { id: "lcb", label: "LCB", x: 37, y: 76 },
    { id: "rcb", label: "RCB", x: 63, y: 76 },
    { id: "rb", label: "RB", x: 85, y: 73 },
    { id: "ldm", label: "LDM", x: 39, y: 58 },
    { id: "rdm", label: "RDM", x: 61, y: 58 },
    { id: "lam", label: "LAM", x: 35, y: 38 },
    { id: "ram", label: "RAM", x: 65, y: 38 },
    { id: "ls", label: "LS", x: 40, y: 20 },
    { id: "rs", label: "RS", x: 60, y: 20 },
  ],
  "4-1-2-3": [
    { id: "gk", label: "GK", x: 50, y: 92 },
    { id: "lb", label: "LB", x: 15, y: 73 },
    { id: "lcb", label: "LCB", x: 37, y: 76 },
    { id: "rcb", label: "RCB", x: 63, y: 76 },
    { id: "rb", label: "RB", x: 85, y: 73 },
    { id: "cdm", label: "CDM", x: 50, y: 61 },
    { id: "lcm", label: "LCM", x: 40, y: 46 },
    { id: "rcm", label: "RCM", x: 60, y: 46 },
    { id: "lw", label: "LW", x: 22, y: 25 },
    { id: "st", label: "ST", x: 50, y: 19 },
    { id: "rw", label: "RW", x: 78, y: 25 },
  ],
  "3-4-3": [
    { id: "gk", label: "GK", x: 50, y: 92 },
    { id: "lcb", label: "LCB", x: 30, y: 75 },
    { id: "cb", label: "CB", x: 50, y: 78 },
    { id: "rcb", label: "RCB", x: 70, y: 75 },
    { id: "lm", label: "LM", x: 16, y: 52 },
    { id: "lcm", label: "LCM", x: 39, y: 55 },
    { id: "rcm", label: "RCM", x: 61, y: 55 },
    { id: "rm", label: "RM", x: 84, y: 52 },
    { id: "lw", label: "LW", x: 22, y: 24 },
    { id: "st", label: "ST", x: 50, y: 19 },
    { id: "rw", label: "RW", x: 78, y: 24 },
  ],
  "3-5-2": [
    { id: "gk", label: "GK", x: 50, y: 92 },
    { id: "lcb", label: "LCB", x: 30, y: 75 },
    { id: "cb", label: "CB", x: 50, y: 78 },
    { id: "rcb", label: "RCB", x: 70, y: 75 },
    { id: "lm", label: "LM", x: 15, y: 53 },
    { id: "lcm", label: "LCM", x: 36, y: 56 },
    { id: "cm", label: "CM", x: 50, y: 50 },
    { id: "rcm", label: "RCM", x: 64, y: 56 },
    { id: "rm", label: "RM", x: 85, y: 53 },
    { id: "ls", label: "LS", x: 40, y: 22 },
    { id: "rs", label: "RS", x: 60, y: 22 },
  ],
  "3-4-2-1": [
    { id: "gk", label: "GK", x: 50, y: 92 },
    { id: "lcb", label: "LCB", x: 30, y: 75 },
    { id: "cb", label: "CB", x: 50, y: 78 },
    { id: "rcb", label: "RCB", x: 70, y: 75 },
    { id: "lm", label: "LM", x: 16, y: 54 },
    { id: "lcm", label: "LCM", x: 40, y: 57 },
    { id: "rcm", label: "RCM", x: 60, y: 57 },
    { id: "rm", label: "RM", x: 84, y: 54 },
    { id: "lam", label: "LAM", x: 39, y: 35 },
    { id: "ram", label: "RAM", x: 61, y: 35 },
    { id: "st", label: "ST", x: 50, y: 18 },
  ],
  "5-3-2": [
    { id: "gk", label: "GK", x: 50, y: 92 },
    { id: "lwb", label: "LWB", x: 12, y: 70 },
    { id: "lcb", label: "LCB", x: 32, y: 76 },
    { id: "cb", label: "CB", x: 50, y: 79 },
    { id: "rcb", label: "RCB", x: 68, y: 76 },
    { id: "rwb", label: "RWB", x: 88, y: 70 },
    { id: "lcm", label: "LCM", x: 36, y: 53 },
    { id: "cm", label: "CM", x: 50, y: 48 },
    { id: "rcm", label: "RCM", x: 64, y: 53 },
    { id: "ls", label: "LS", x: 40, y: 22 },
    { id: "rs", label: "RS", x: 60, y: 22 },
  ],
  "5-4-1": [
    { id: "gk", label: "GK", x: 50, y: 92 },
    { id: "lwb", label: "LWB", x: 12, y: 70 },
    { id: "lcb", label: "LCB", x: 32, y: 76 },
    { id: "cb", label: "CB", x: 50, y: 79 },
    { id: "rcb", label: "RCB", x: 68, y: 76 },
    { id: "rwb", label: "RWB", x: 88, y: 70 },
    { id: "lm", label: "LM", x: 18, y: 49 },
    { id: "lcm", label: "LCM", x: 40, y: 53 },
    { id: "rcm", label: "RCM", x: 60, y: 53 },
    { id: "rm", label: "RM", x: 82, y: 49 },
    { id: "st", label: "ST", x: 50, y: 20 },
  ],
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const dom = {
  tabButtons: $$(".tab-button"),
  tabPanels: $$(".tab-panel"),
  createTeamForm: $("#createTeamForm"),
  teamNameInput: $("#teamNameInput"),
  createdTeamInfo: $("#createdTeamInfo"),
  teamNameDisplay: $("#teamNameDisplay"),
  makeShareUrlButton: $("#makeShareUrlButton"),
  copyShareUrlButton: $("#copyShareUrlButton"),
  shareUrlBox: $("#shareUrlBox"),
  shareUrlOutput: $("#shareUrlOutput"),
  teamShareInfo: $("#teamShareInfo"),
  saveCloudButton: $("#saveCloudButton"),
  loadCloudButton: $("#loadCloudButton"),
  cloudCodeInput: $("#cloudCodeInput"),
  cloudSyncInfo: $("#cloudSyncInfo"),
  memberForm: $("#memberForm"),
  memberNameInput: $("#memberNameInput"),
  memberNumberInput: $("#memberNumberInput"),
  membersGrid: $("#membersGrid"),
  memberDetail: $("#memberDetail"),
  prepDateInput: $("#prepDateInput"),
  prepOpponentInput: $("#prepOpponentInput"),
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
  saveFormationMatchButton: $("#saveFormationMatchButton"),
  resetFormationButton: $("#resetFormationButton"),
  slotMemoModal: $("#slotMemoModal"),
  memoModalTitle: $("#memoModalTitle"),
  slotMemoInput: $("#slotMemoInput"),
  closeMemoButton: $("#closeMemoButton"),
  saveMemoButton: $("#saveMemoButton"),
  recordForm: $("#recordForm"),
  recordSelectedMatchInfo: $("#recordSelectedMatchInfo"),
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
let selectedRecordMatchId = null;
let activeMemoSlotId = null;
let recordDraft = {
  participants: new Set(),
  goals: [],
  assists: [],
  hydratedFromFormation: false,
};

function defaultState() {
  return {
    team: { name: "" },
    members: [],
    formation: {
      quarters: 2,
      shape: "4-2-3-1",
      activeQuarter: 1,
      matchInfo: {
        date: "",
        opponent: "",
        participantIds: [],
        guests: [],
        isPrepCollapsed: false,
        savedMatchId: "",
      },
      squads: {},
    },
    matches: [],
    sync: {
      shareCode: "",
    },
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
    team: { name: saved.team?.name || "" },
    formation: { ...base.formation, ...(saved.formation || {}) },
    sync: { ...base.sync, ...(saved.sync || {}) },
  };

  next.members = Array.isArray(saved.members) ? saved.members : [];
  next.matches = Array.isArray(saved.matches) ? saved.matches : [];
  next.formation.quarters = clamp(Number(next.formation.quarters) || 2, 1, MAX_QUARTERS);
  next.formation.shape = FORMATIONS[next.formation.shape] ? next.formation.shape : "4-2-3-1";
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

function encodeShareData(data) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

function decodeShareData(encoded) {
  return JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(encoded)))));
}

function buildTeamShareData() {
  return {
    type: "jochooklog-team",
    teamName: state.team.name || "",
    members: sortByName(state.members).map((member) => ({
      name: member.name,
      number: member.number || "",
    })),
  };
}

function clearTeamShareUrl() {
  if (!dom.shareUrlBox) return;
  dom.shareUrlBox.hidden = true;
  if (dom.shareUrlOutput) dom.shareUrlOutput.value = "";
}

function makeTeamShareUrl() {
  const encoded = encodeURIComponent(encodeShareData(buildTeamShareData()));
  const baseUrl = `${location.origin}${location.pathname}`;
  return `${baseUrl}#team=${encoded}`;
}

function showTeamShareUrl() {
  if (!dom.shareUrlBox || !dom.shareUrlOutput || !dom.teamShareInfo) return;
  if (!state.team.name && !state.members.length) {
    dom.teamShareInfo.textContent = "공유할 팀원 정보가 없습니다.";
    return;
  }

  dom.shareUrlOutput.value = makeTeamShareUrl();
  dom.shareUrlBox.hidden = false;
  dom.teamShareInfo.textContent = "공유 URL이 생성되었습니다.";
}

async function copyTeamShareUrl() {
  if (!dom.shareUrlOutput || !dom.teamShareInfo) return;
  if (!dom.shareUrlOutput.value) {
    showTeamShareUrl();
  }

  try {
    await navigator.clipboard.writeText(dom.shareUrlOutput.value);
    dom.teamShareInfo.textContent = "공유 URL을 복사했습니다.";
  } catch {
    dom.shareUrlOutput.select();
    document.execCommand("copy");
    dom.teamShareInfo.textContent = "공유 URL을 복사했습니다.";
  }
}

function makeShareCode() {
  return `JCL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function hasCurrentLocalData() {
  const hasSquadData = Object.values(state.formation?.squads || {}).some((squad) =>
    Object.values(squad?.slots || {}).some((slot) => slot?.playerId || slot?.note),
  );
  const matchInfo = state.formation?.matchInfo || {};
  return Boolean(
    state.team.name ||
    state.members.length ||
    state.matches.length ||
    hasSquadData ||
    matchInfo.date ||
    matchInfo.opponent ||
    matchInfo.participantIds?.length ||
    matchInfo.guests?.length,
  );
}

function resetRuntimeState() {
  selectedMemberId = null;
  selectedPoolPlayerId = null;
  selectedRecordMatchId = null;
  activeMemoSlotId = null;
  recordDraft = { participants: new Set(), goals: [], assists: [], hydratedFromFormation: false };
}

async function saveStateToSupabase() {
  if (!supabaseClient) {
    alert("팀 정보 저장 연결 정보가 없습니다. 설정 키를 확인해 주세요.");
    return;
  }

  if (!state.team.name) {
    alert("팀을 먼저 생성해 주세요.");
    return;
  }

  if (!state.sync) state.sync = {};
  if (!state.sync.shareCode) {
    state.sync.shareCode = makeShareCode();
  }

  const now = new Date().toISOString();
  const appState = JSON.parse(JSON.stringify(state));
  const { error } = await supabaseClient
    .from("teams")
    .upsert(
      {
        name: state.team.name,
        share_code: state.sync.shareCode,
        app_state: appState,
        updated_at: now,
      },
      { onConflict: "share_code" },
    );

  if (error) {
    console.error(error);
    alert("팀 정보 저장에 실패했습니다.");
    return;
  }

  saveState();
  renderAll();
  if (dom.cloudCodeInput) dom.cloudCodeInput.value = state.sync.shareCode;
  if (dom.cloudSyncInfo) {
    dom.cloudSyncInfo.textContent = `팀 정보가 저장되었습니다. 공유 코드: ${state.sync.shareCode}`;
  }
  alert(`팀 정보가 저장되었습니다. 공유 코드: ${state.sync.shareCode}`);
}

async function loadStateFromSupabase(shareCode) {
  if (!supabaseClient) {
    alert("팀 정보 저장 연결 정보가 없습니다. 설정 키를 확인해 주세요.");
    return;
  }

  const code = String(shareCode || "").trim().toUpperCase();
  if (!code) {
    alert("공유 코드를 입력해 주세요.");
    return;
  }

  const { data, error } = await supabaseClient
    .from("teams")
    .select("app_state, share_code")
    .eq("share_code", code)
    .single();

  if (error || !data?.app_state) {
    console.error(error);
    alert("해당 공유 코드의 팀 정보를 찾을 수 없습니다.");
    return;
  }

  if (hasCurrentLocalData() && !confirm("현재 저장된 팀 정보를 불러온 팀 정보로 바꿀까요?")) {
    return;
  }

  state = normalizeState(data.app_state);
  if (!state.sync) state.sync = {};
  state.sync.shareCode = data.share_code;
  resetRuntimeState();
  saveState();
  renderAll();
  setActiveTab("team");

  if (dom.cloudCodeInput) dom.cloudCodeInput.value = data.share_code;
  if (dom.cloudSyncInfo) {
    dom.cloudSyncInfo.textContent = `팀 정보를 불러왔습니다. 공유 코드: ${data.share_code}`;
  }
  alert("팀 정보를 불러왔습니다.");
}

function loadTeamFromShareHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  const encoded = params.get("team");
  if (!encoded) return false;

  let data;
  try {
    data = decodeShareData(encoded);
  } catch {
    return false;
  }

  if (data?.type !== "jochooklog-team" || !Array.isArray(data.members)) return false;
  const hasCurrentTeam = Boolean(state.team.name || state.members.length);
  if (hasCurrentTeam && !confirm("현재 저장된 팀 정보가 있습니다. 공유 URL의 팀 정보로 덮어쓸까요?")) {
    return false;
  }

  state.team = { name: String(data.teamName || "").trim() };
  state.members = data.members
    .map((member) => ({
      id: uid("member"),
      name: String(member.name || "").trim(),
      number: String(member.number || "").trim(),
      position: "",
      createdAt: new Date().toISOString(),
    }))
    .filter((member) => member.name);

  getMatchInfo().participantIds = state.members.map((member) => member.id);
  cleanFormationSlotsForAvailablePlayers();
  selectedMemberId = null;
  selectedPoolPlayerId = null;
  saveState();
  return true;
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
  if (dom.cloudSyncInfo) {
    dom.cloudSyncInfo.textContent = state.sync?.shareCode
      ? `현재 공유 코드: ${state.sync.shareCode}`
      : "저장하면 공유 코드가 생성됩니다.";
  }
  if (dom.cloudCodeInput && state.sync?.shareCode && !dom.cloudCodeInput.value) {
    dom.cloudCodeInput.value = state.sync.shareCode;
  }

  if (!state.members.length) {
    dom.membersGrid.innerHTML = `<p class="empty-text">아직 등록된 팀원이 없습니다.</p>`;
  } else {
    dom.membersGrid.innerHTML = sortByName(state.members)
      .map((member) => {
        const stats = getMemberStats(member.id);
        const selectedClass = selectedMemberId === member.id ? " active" : "";
        const badge = member.isMercenary ? `<span class="badge">일일 용병</span>` : "";
        return `
          <article class="member-card${selectedClass}" data-member-id="${member.id}">
            <div class="member-card-header">
              <div>
                <div class="member-name">${escapeHtml(member.name)}</div>
                ${renderPlayerMeta(member)}
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

function playerMetaText(player) {
  const parts = [];
  if (player.number) parts.push(`#${player.number}`);
  return parts.join(" · ");
}

function renderPlayerMeta(player, prefix = "") {
  const meta = playerMetaText(player);
  return meta ? `<p class="helper-text">${prefix}${escapeHtml(meta)}</p>` : "";
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
    ${renderPlayerMeta(member)}
    <div class="stat-row">
      ${statPill(stats.appearances, "총 출전")}
      ${statPill(stats.goals, "총 득점")}
      ${statPill(stats.assists, "총 도움")}
    </div>
    <h3>최근 경기 기록</h3>
    ${recentMatches.length
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
  const playerListMarkup = unplacedPlayers.length
    ? unplacedPlayers
      .map((player) => {
        const selectedClass = player.id === selectedPoolPlayerId ? " selected" : "";
        const meta = player.isGuest ? "용병" : playerMetaText(player);
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
              ${meta ? `<div class="player-pool-meta">${escapeHtml(meta)}</div>` : ""}
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
    <div class="player-pool-list">
      ${playerListMarkup}
    </div>
    <button class="secondary-button add-guest-panel-button" type="button" data-add-guest>용병 추가</button>
  `;
}

function renderRecords() {
  renderMatchList();
  renderRecordEditor();
}

function getSelectedRecordMatch() {
  return state.matches.find((match) => match.id === selectedRecordMatchId) || null;
}

function getMatchOpponent(match) {
  return match?.opponent || match?.memo || "";
}

function formatMatchTitle(date, opponent) {
  return `${date || "날짜 없음"} 상대팀: ${opponent || "-"}`;
}

function getMatchDisplayTitle(match) {
  return match?.title || formatMatchTitle(match?.date, getMatchOpponent(match));
}

function getMatchPlayerOptions(match) {
  return (match?.participants || []).map((playerId) => ({
    id: playerId,
    name: getPlayerName(playerId, match),
  }));
}

function renderRecordEditor() {
  const match = getSelectedRecordMatch();
  if (!match) {
    selectedRecordMatchId = null;
    recordDraft = { participants: new Set(), goals: [], assists: [], hydratedFromFormation: false };
    dom.recordSelectedMatchInfo.innerHTML = `<p class="empty-text">기록을 입력할 경기를 선택해 주세요.</p>`;
    dom.appearanceList.innerHTML = "";
    dom.goalSelect.innerHTML = `<option value="">경기를 먼저 선택</option>`;
    dom.assistSelect.innerHTML = `<option value="">경기를 먼저 선택</option>`;
    dom.goalSelect.disabled = true;
    dom.assistSelect.disabled = true;
    dom.addGoalButton.disabled = true;
    dom.addAssistButton.disabled = true;
    dom.recordForm.querySelector(".primary-save").disabled = true;
    renderDraftLists(null);
    return;
  }

  const opponent = getMatchOpponent(match);
  dom.recordSelectedMatchInfo.innerHTML = `
    <h3>${escapeHtml(getMatchDisplayTitle(match))}</h3>
    <p class="helper-text">${escapeHtml(match.date || "-")}${opponent ? ` · 상대팀: ${escapeHtml(opponent)}` : ""}</p>
  `;

  const players = getMatchPlayerOptions(match);
  dom.appearanceList.innerHTML = players.length
    ? players.map((player) => `<span class="participant-chip">${escapeHtml(player.name)}</span>`).join("")
    : `<p class="empty-text">저장된 출전 선수가 없습니다.</p>`;

  const selectOptions = `<option value="">선수 선택</option>${players
    .map((player) => `<option value="${player.id}">${escapeHtml(player.name)}</option>`)
    .join("")}`;
  dom.goalSelect.innerHTML = selectOptions;
  dom.assistSelect.innerHTML = selectOptions;
  dom.goalSelect.disabled = !players.length;
  dom.assistSelect.disabled = !players.length;
  dom.addGoalButton.disabled = !players.length;
  dom.addAssistButton.disabled = !players.length;
  dom.recordForm.querySelector(".primary-save").disabled = false;
  renderDraftLists(match);
}

function renderDraftLists(match = getSelectedRecordMatch()) {
  dom.goalDraftList.innerHTML = recordDraft.goals.length
    ? recordDraft.goals.map((event) => `<li>${escapeHtml(getPlayerName(event.playerId, match))} 득점</li>`).join("")
    : `<li class="empty-text">추가된 득점 기록이 없습니다.</li>`;

  dom.assistDraftList.innerHTML = recordDraft.assists.length
    ? recordDraft.assists.map((event) => `<li>${escapeHtml(getPlayerName(event.playerId, match))} 어시스트</li>`).join("")
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
      const active = match.id === selectedRecordMatchId ? " active" : "";
      const title = getMatchDisplayTitle(match);
      const participantCount = (match.participants || []).length;
      const goalCount = (match.goals || []).length;
      const assistCount = (match.assists || []).length;
      return `
        <article class="match-card${active}" data-match-id="${match.id}" tabindex="0">
          <div class="match-card-header">
            <div>
              <h4>${escapeHtml(title)}</h4>
              <p class="match-meta">출전 선수 ${participantCount}명</p>
            </div>
            <button class="delete-match-button" type="button" data-delete-match="${match.id}">삭제</button>
          </div>
          <p>득점 ${goalCount}개 · 어시스트 ${assistCount}개</p>
          <button class="secondary-button select-match-button" type="button" data-select-match="${match.id}">기록 입력</button>
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

function loadMatchForRecord(matchId) {
  const match = state.matches.find((item) => item.id === matchId);
  if (!match) return;
  selectedRecordMatchId = matchId;
  recordDraft = {
    participants: new Set(match.participants || []),
    goals: [...(match.goals || [])],
    assists: [...(match.assists || [])],
    hydratedFromFormation: false,
  };
  renderRecords();
}

function syncRecordDraftWithPlayers() {
  const match = getSelectedRecordMatch();
  if (!match) return;
  const playerIds = new Set(match.participants || []);
  recordDraft.participants = new Set([...(recordDraft.participants || [])].filter((id) => playerIds.has(id)));
  recordDraft.goals = recordDraft.goals.filter((event) => playerIds.has(event.playerId));
  recordDraft.assists = recordDraft.assists.filter((event) => playerIds.has(event.playerId));
}

function addMember({ name, number, isMercenary = false }) {
  state.members.push({
    id: uid("member"),
    name,
    number,
    position: "",
    isMercenary,
    createdAt: new Date().toISOString(),
  });
  saveState();
  clearTeamShareUrl();
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
  clearTeamShareUrl();
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

function resetCurrentQuarterFormation() {
  if (!confirm("현재 쿼터의 포메이션과 메모를 초기화할까요?")) return;
  const quarter = state.formation.activeQuarter;
  state.formation.squads[quarter] = { slots: {} };
  selectedPoolPlayerId = null;
  saveState();
  renderFormation();
  setFormationNotice(`${quarter}쿼터 포메이션을 초기화했습니다.`);
}

function saveFormationMatch() {
  const matchInfo = getMatchInfo();
  const date = matchInfo.date;
  const opponent = (matchInfo.opponent || "").trim();
  if (!date || !opponent) {
    alert("경기 날짜와 상대팀을 입력해 주세요.");
    return;
  }

  const participants = getFormationPlayers().map((player) => player.id);
  const participantIds = new Set(participants);
  const guests = matchInfo.guests.map((guest) => ({
    id: guest.id,
    name: guest.name,
    number: guest.number || "",
    position: "용병",
    isGuest: true,
  }));
  const title = formatMatchTitle(date, opponent);
  const now = new Date().toISOString();
  const savedMatch = state.matches.find((match) => match.id === matchInfo.savedMatchId);
  const shouldUpdateSavedMatch = savedMatch && savedMatch.date === date && getMatchOpponent(savedMatch) === opponent;

  if (shouldUpdateSavedMatch) {
    savedMatch.title = title;
    savedMatch.date = date;
    savedMatch.opponent = opponent;
    savedMatch.memo = opponent;
    savedMatch.participants = participants;
    savedMatch.guests = guests;
    savedMatch.goals = (savedMatch.goals || []).filter((event) => participantIds.has(event.playerId));
    savedMatch.assists = (savedMatch.assists || []).filter((event) => participantIds.has(event.playerId));
    savedMatch.updatedAt = now;
    if (selectedRecordMatchId === savedMatch.id) {
      loadMatchForRecord(savedMatch.id);
    }
    saveState();
    renderAll();
    setFormationNotice("경기 기록이 업데이트되었습니다.");
    return;
  }

  const match = {
    id: uid("match"),
    title,
    date,
    opponent,
    memo: opponent,
    participants,
    goals: [],
    assists: [],
    guests,
    createdAt: now,
    updatedAt: now,
  };
  state.matches.push(match);
  matchInfo.savedMatchId = match.id;
  saveState();
  renderAll();
  setFormationNotice("경기 기록에 저장되었습니다.");
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
  const match = getSelectedRecordMatch();
  if (!match) {
    alert("기록을 입력할 경기를 선택해 주세요.");
    return;
  }

  match.participants = [...recordDraft.participants];
  match.goals = [...recordDraft.goals];
  match.assists = [...recordDraft.assists];
  match.updatedAt = new Date().toISOString();
  saveState();
  renderAll();
}

function deleteMatch(matchId) {
  const match = state.matches.find((item) => item.id === matchId);
  if (!match) return;

  if (!confirm("이 경기 기록을 삭제할까요?")) return;

  state.matches = state.matches.filter((item) => item.id !== matchId);
  if (selectedRecordMatchId === matchId) {
    selectedRecordMatchId = null;
    recordDraft = { participants: new Set(), goals: [], assists: [], hydratedFromFormation: false };
  }
  if (getMatchInfo().savedMatchId === matchId) {
    getMatchInfo().savedMatchId = "";
  }
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
    setFormationNotice("이미지 공유에 실패했습니다. 다시 시도해 주세요.", true);
    return;
  }

  const captureOptions = {
    backgroundColor: "#f4f8f3",
    scale: window.matchMedia("(max-width: 640px)").matches ? 1.5 : 2,
    useCORS: true,
  };

  try {
    setFormationNotice("포메이션 이미지를 만드는 중입니다.");
    const canvas = await window.html2canvas(dom.formationCaptureArea, captureOptions);
    const blob = await canvasToBlob(canvas);
    const fileName = getFormationImageFileName();
    const file = typeof File === "function" ? new File([blob], fileName, { type: "image/png" }) : null;
    const canShareFile = Boolean(
      file &&
      navigator.share &&
      navigator.canShare?.({ files: [file] }),
    );
    const prefersShare = window.matchMedia("(max-width: 900px), (hover: none), (pointer: coarse)").matches;
    let shareAttempted = false;

    if (canShareFile && prefersShare) {
      shareAttempted = true;
      if (await shareFormationFile(file)) {
        return;
      }
    }

    if (navigator.clipboard?.write && "ClipboardItem" in window) {
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setFormationNotice("포메이션 이미지가 클립보드에 복사되었습니다.");
        return;
      } catch (error) {
        console.error(error);
      }
    }

    if (canShareFile && !shareAttempted && await shareFormationFile(file)) {
      return;
    }

    downloadBlob(blob);
    setFormationNotice("공유를 지원하지 않는 브라우저라 이미지 파일로 저장합니다.", true);
  } catch (error) {
    console.error(error);
    setFormationNotice("이미지 공유에 실패했습니다. 다시 시도해 주세요.", true);
  }
}

async function shareFormationFile(file) {
  try {
    await navigator.share({
      files: [file],
      title: "조축로그 포메이션",
      text: "조축로그 포메이션 이미지",
    });
    setFormationNotice("포메이션 이미지를 공유했습니다.");
    return true;
  } catch (error) {
    if (error?.name === "AbortError") {
      setFormationNotice("이미지 공유를 취소했습니다.", true);
      return true;
    }
    console.error(error);
    return false;
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
  link.download = getFormationImageFileName();
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getFormationImageFileName() {
  return `jochook-log-${state.formation.activeQuarter}q.png`;
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

    state.team = { name };
    clearTeamShareUrl();
    saveState();
    dom.createdTeamInfo.textContent = `${state.team.name} 팀을 만들었습니다.`;
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
    });
    dom.memberForm.reset();
  });

  if (dom.makeShareUrlButton) {
    dom.makeShareUrlButton.addEventListener("click", showTeamShareUrl);
  }
  if (dom.copyShareUrlButton) {
    dom.copyShareUrlButton.addEventListener("click", copyTeamShareUrl);
  }
  if (dom.saveCloudButton) {
    dom.saveCloudButton.addEventListener("click", saveStateToSupabase);
  }
  if (dom.loadCloudButton) {
    dom.loadCloudButton.addEventListener("click", () => {
      loadStateFromSupabase(dom.cloudCodeInput?.value || "");
    });
  }

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
    const matchInfo = getMatchInfo();
    matchInfo.date = dom.prepDateInput.value;
    matchInfo.savedMatchId = "";
    saveState();
  });

  dom.prepOpponentInput.addEventListener("input", () => {
    const matchInfo = getMatchInfo();
    matchInfo.opponent = dom.prepOpponentInput.value.trim();
    matchInfo.savedMatchId = "";
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

  function handleSquadBoardTap(event) {
    const button = event.target.closest("[data-slot-note-open]");
    if (button) {
      event.preventDefault();
      openMemoModal(button.dataset.slotNoteOpen);
      return;
    }

    const slot = event.target.closest("[data-slot-id]");
    if (!slot || !selectedPoolPlayerId) return;

    event.preventDefault();

    const playerId = selectedPoolPlayerId;
    selectedPoolPlayerId = null;
    placePlayerInSlot(slot.dataset.slotId, playerId);
  }

  const isTouchDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  dom.squadBoard.addEventListener(isTouchDevice ? "pointerup" : "click", handleSquadBoardTap);

  dom.copyImageButton.addEventListener("click", copyFormationImage);
  dom.saveFormationMatchButton.addEventListener("click", saveFormationMatch);
  dom.resetFormationButton.addEventListener("click", resetCurrentQuarterFormation);

  dom.closeMemoButton.addEventListener("click", closeMemoModal);
  dom.saveMemoButton.addEventListener("click", saveMemo);
  dom.slotMemoModal.addEventListener("click", (event) => {
    if (event.target === dom.slotMemoModal) closeMemoModal();
  });

  dom.addGoalButton.addEventListener("click", () => {
    if (!getSelectedRecordMatch() || !dom.goalSelect.value) return;
    recordDraft.goals.push({ playerId: dom.goalSelect.value });
    dom.goalSelect.value = "";
    renderDraftLists();
  });

  dom.addAssistButton.addEventListener("click", () => {
    if (!getSelectedRecordMatch() || !dom.assistSelect.value) return;
    recordDraft.assists.push({ playerId: dom.assistSelect.value });
    dom.assistSelect.value = "";
    renderDraftLists();
  });

  dom.matchList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-delete-match]");
    if (deleteButton) {
      event.stopPropagation();
      deleteMatch(deleteButton.dataset.deleteMatch);
      return;
    }

    const selectButton = event.target.closest("[data-select-match]");
    const card = event.target.closest("[data-match-id]");
    const matchId = selectButton?.dataset.selectMatch || card?.dataset.matchId;
    if (!matchId) return;
    loadMatchForRecord(matchId);
  });

  dom.recordForm.addEventListener("submit", saveMatch);
}

bindEvents();
const sharedTeamLoaded = loadTeamFromShareHash();
renderAll();
if (sharedTeamLoaded) {
  setActiveTab("team");
  if (dom.cloudSyncInfo) {
    dom.cloudSyncInfo.textContent = "공유된 팀원 정보를 불러왔습니다.";
  }
}
