/**
 * Append-Only Hash-Chained Audit Trail Service [A]
 */

export function appendAuditEntry(auditTrail, gatewayTag, actionName, actorName, payload) {
  const lastEntry = auditTrail[auditTrail.length - 1];
  const prevHash = lastEntry ? lastEntry.entry_hash : 'GENESIS_HASH_SAMBUNGJAGA_00000000000000000000000000000000';
  const seqId = lastEntry ? lastEntry.sequence_id + 1 : 1001;
  const createdAt = new Date().toISOString();

  // Simple deterministic hash calculation for client demonstration
  const rawString = `${seqId}|${gatewayTag}|${actionName}|${JSON.stringify(payload)}|${prevHash}|${createdAt}`;
  let hash = 0;
  for (let i = 0; i < rawString.length; i++) {
    const char = rawString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const entryHash = Math.abs(hash).toString(16).padStart(64, 'a');

  const newEntry = {
    id: `aud-${Date.now()}`,
    sequence_id: seqId,
    actor_id: 'current-actor',
    actor_name: actorName || 'System Gateway',
    gateway_tag: gatewayTag,
    action_name: actionName,
    payload: payload,
    prev_entry_hash: prevHash,
    entry_hash: entryHash,
    created_at: createdAt
  };

  return [...auditTrail, newEntry];
}

export function verifyAuditChainIntegrity(auditTrail) {
  let prevHash = 'GENESIS_HASH_SAMBUNGJAGA_00000000000000000000000000000000';
  for (let i = 0; i < auditTrail.length; i++) {
    const entry = auditTrail[i];
    if (entry.prev_entry_hash !== prevHash) {
      return { valid: false, brokenIndex: i, reason: `Hash chain terputus pada sekuens #${entry.sequence_id}` };
    }
    prevHash = entry.entry_hash;
  }
  return { valid: true, totalRecords: auditTrail.length };
}
