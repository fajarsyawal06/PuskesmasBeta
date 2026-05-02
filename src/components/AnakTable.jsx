import { barisReadonly, barisRumus, barisSatuKolom } from '../config/tableConfig';

export default function AnakTable({ bulan, tableData, handleChangeAnak }) {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse border border-black text-sm">
                <thead>
                    <tr>
                    <th className="border border-black p-2 w-12 text-center bg-gray-50" rowSpan={3}>NO</th>
                    <th className="border border-black p-2 text-center bg-gray-50 uppercase" rowSpan={3}>INDIKATOR</th>
                    <th className="border border-black p-1 text-center uppercase bg-gray-50" colSpan={3}>{bulan.toUpperCase()}</th>
                </tr>
                <tr>
                    <th className="border border-black p-1 text-center bg-gray-50" colSpan={2}>JUMLAH</th>
                    <th className="border border-black p-1 text-center bg-gray-50" rowSpan={2}>TOTAL</th>
                </tr>
                <tr>
                    <th className="border border-black p-1 text-center font-bold bg-blue-100 w-16">L</th>
                    <th className="border border-black p-1 text-center font-bold bg-pink-100 w-16">P</th>
                </tr>
            </thead>
            <tbody>
                {tableData.map((row, index) => {
                    let rowBg = row.customColor;
                    let labelStyle = '';
                    let showInput = true;

                    // Aturan Utama (Timpa warna jika itu Header/Subheader/Kosong)
                    if (row.isBlank) {
                        showInput = false;
                        rowBg = 'bg-white';
                    } else if (row.isHeader) {
                        showInput = false;
                        rowBg = 'bg-gray-400';
                        labelStyle = 'font-bold text-[15px] text-gray-800';
                    } else if (row.isSubheader) {
                        rowBg = 'bg-gray-300';
                        labelStyle = 'font-bold text-gray-800';
                    }

                    const isRumus = barisRumus.includes(row.label.trim());

                    if (barisReadonly.includes(row.label.trim()) || isRumus) {
                        showInput = false;
                    }

                    if (isRumus) {
                        rowBg = 'bg-gray-200';
                    }

                    return (
                        <tr key={index} className="hover:bg-gray-100/50">
                            <td className={`border border-black px-2 py-1.5 text-center font-bold ${rowBg}`}>
                                {row.no}
                            </td>
                            <td className={`border border-black px-3 py-1.5 ${rowBg} ${labelStyle}`}>
                                {row.label}
                            </td>
                            {(() => {
                                const isSatuKolom = barisSatuKolom.includes(row.label?.trim());

                                if (isSatuKolom) {
                                    return (
                                        <td className={`border border-black p-0 relative ${rowBg}`} colSpan={3}>
                                            {showInput ? (
                                                <input
                                                    type="number"
                                                    value={row.valueL ?? ""}
                                                    onChange={(e) => handleChangeAnak(index, 'L', e.target.value)}
                                                    className="w-full h-full min-h-[34px] px-1 outline-none text-center focus:bg-blue-100 transition-colors bg-transparent"
                                                />
                                            ) : (
                                                <div className="w-full h-full min-h-[34px] bg-transparent flex items-center justify-center font-bold text-gray-700">
                                                    {isRumus ? row.valueL : ""}
                                                </div>
                                            )}
                                        </td>
                                    );
                                }

                                return (
                                    <>
                                        <td className={`border border-black p-0 relative ${rowBg}`}>
                                            {showInput ? (
                                                <input
                                                    type="number"
                                                    value={row.valueL ?? ""}
                                                    onChange={(e) => handleChangeAnak(index, 'L', e.target.value)}
                                                    className="w-full h-full min-h-[34px] px-1 outline-none text-center focus:bg-blue-100 transition-colors bg-transparent"
                                                />
                                            ) : (
                                                <div className="w-full h-full min-h-[34px] bg-transparent flex items-center justify-center font-bold text-gray-700">
                                                    {isRumus ? row.valueL : ""}
                                                </div>
                                            )}
                                        </td>
                                        <td className={`border border-black p-0 relative ${rowBg}`}>
                                            {showInput ? (
                                                <input
                                                    type="number"
                                                    value={row.valueP ?? ""}
                                                    onChange={(e) => handleChangeAnak(index, 'P', e.target.value)}
                                                    className="w-full h-full min-h-[34px] px-1 outline-none text-center focus:bg-pink-100 transition-colors bg-transparent"
                                                />
                                            ) : (
                                                <div className="w-full h-full min-h-[34px] bg-transparent flex items-center justify-center font-bold text-gray-700">
                                                    {isRumus ? row.valueP : ""}
                                                </div>
                                            )}
                                        </td>
                                        <td className="border border-black p-0 relative bg-gray-100">
                                            <div className="w-full h-full min-h-[34px] bg-transparent flex items-center justify-center font-bold text-gray-700">
                                                {(() => {
                                                    if (isRumus) return row.valueTotal ?? "";
                                                    const lEmpty = row.valueL === "" || row.valueL == null;
                                                    const pEmpty = row.valueP === "" || row.valueP == null;
                                                    if (lEmpty && pEmpty) return "";
                                                    return (Number(row.valueL) || 0) + (Number(row.valueP) || 0);
                                                })()}
                                            </div>
                                        </td>
                                    </>
                                );
                            })()}
                        </tr>
                    );
                })}
            </tbody>
        </table>
        </div>
    );
}
