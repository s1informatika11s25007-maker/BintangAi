import React from 'react';
import HandoverContractCard from '../../components/handover/HandoverContractCard';

export default function HandoverPage({
  handoverContracts = [],
  onSignContract,
  currentUserRole,
  currentUser,
  staff,
  obligations,
  residents
}) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-lg font-black text-slate-900">Two-Sided Handover Contract Agent</h2>
        <p className="text-xs text-slate-500 font-medium">
          Dua sisi tanda tangan digital antar perawat shift untuk memastikan zero care debt transfer.
        </p>
      </div>

      <div className="space-y-4">
        {handoverContracts.map((contract) => (
          <HandoverContractCard
            key={contract.id}
            contract={contract}
            onSignContract={onSignContract}
            currentUserRole={currentUserRole}
            currentUser={currentUser}
            staff={staff}
            obligations={obligations}
            residents={residents}
          />
        ))}
      </div>
    </div>
  );
}
