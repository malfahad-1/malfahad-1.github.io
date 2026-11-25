/* ================= CHATBOT WIDGET ================= */
.acb-launcher {
  position: fixed;
  right: 92px;
  bottom: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--blue);
  color: #fff;
  display: grid;
  place-items: center;
  box-shadow: 0 4px 16px rgba(15, 37, 68, 0.28);
  cursor: pointer;
  z-index: 998;
  transition: transform 0.2s, background 0.2s;
}
.acb-launcher:hover {
  transform: scale(1.08);
  background: var(--blue-dark);
}

.acb-panel {
  position: fixed;
  right: 24px;
  bottom: 92px;
  width: min(360px, calc(100vw - 32px));
  max-height: 500px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: 0 14px 36px rgba(8, 24, 47, 0.22);
  display: none;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
}
.acb-panel.open {
  display: flex;
}

.acb-head {
  background: var(--navy);
  color: #fff;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.acb-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--gold);
  color: var(--navy-deep);
  font-weight: 800;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.acb-head-txt {
  flex: 1;
  min-width: 0;
}
.acb-title {
  font-weight: 700;
  font-size: 0.95rem;
}
.acb-sub {
  font-size: 0.75rem;
  color: #cbd5e0;
}
.acb-close {
  background: none;
  border: none;
  color: #cbd5e0;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px;
}
.acb-close:hover {
  color: #fff;
}

.acb-log {
  padding: 14px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  background: var(--soft);
}
.acb-msg {
  max-width: 85%;
  padding: 10px 13px;
  border-radius: 10px;
  font-size: 0.88rem;
  line-height: 1.5;
  word-wrap: break-word;
}
.acb-bot {
  background: #fff;
  border: 1px solid var(--line);
  color: var(--ink);
  align-self: flex-start;
}
.acb-user {
  background: var(--blue);
  color: #fff;
  align-self: flex-end;
}
.acb-offline a {
  color: var(--wa);
  text-decoration: underline;
}

.acb-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}
.acb-chip {
  background: #fff;
  border: 1px solid var(--line);
  color: var(--ink);
  border-radius: 999px;
  padding: 6px 11px;
  font-size: 0.78rem;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.acb-chip:hover {
  border-color: var(--blue);
  color: var(--blue);
}

.acb-form {
  display: flex;
  border-top: 1px solid var(--line);
  background: #fff;
}
.acb-input {
  flex: 1;
  border: none;
  padding: 12px 14px;
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
}
.acb-send {
  background: var(--blue);
  color: #fff;
  border: none;
  padding: 0 16px;
  cursor: pointer;
  display: grid;
  place-items: center;
}
.acb-send:hover {
  background: var(--blue-dark);
}

.acb-panel.acb-rtl {
  direction: rtl;
}
.acb-panel.acb-rtl .acb-bot {
  align-self: flex-start;
}
.acb-panel.acb-rtl .acb-user {
  align-self: flex-end;
}
