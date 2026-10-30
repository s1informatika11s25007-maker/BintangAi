import React, { useState, useEffect } from 'react';
import { filterFamilyPortalData } from '../../services/auth/consentDisclosureService';

export default function FamilyPortalPage({ residents = [], obligations = [], epistemicFacts = [] }) {
  const [filteredData, setFilteredData] = useState(null);
  const targetResident = residents[0] || { full_name: 'Ibu Hj. Aminah (78 th)' };

  useEffect(() => {
    async function loadData() {
      const res = await filterFamilyPortalData(targetResident, obligations);
      setFilteredData(res);
    }
    loadData();
  }, [obligations?.length]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-purple-900 text-white p-6 rounded-2xl shadow-xl space-y-2">
        <h2 className="text-lg font-black">Portal Keluarga (Family Portal)</h2>
        <p className="text-xs text-purple-200">
          Filter Consent: Filtered Summary &bull; Menampilkan rangkuman perawatan aman UU PDP tanpa membocorkan istilah medis mentah.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base">{targetResident.full_name}</h3>
        <p className="text-xs text-slate-600">{filteredData?.residentStatusSummary}</p>

        <div className="pt-2 border-t space-y-2">
          <h4 className="font-bold text-xs text-slate-800">Aktivitas Perawatan Terverifikasi Hari Ini:</h4>
          {filteredData?.filteredObligations?.map((ob) => (
            <div key={ob.id} className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl text-xs">
              <p className="font-bold text-purple-900">{ob.title}</p>
              <p className="text-slate-600 text-[11px] mt-0.5">{ob.friendlyDescription}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
